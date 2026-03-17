import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Load .env manually using Node's fs (works in Vite config scope)
function loadEnv(dir) {
  try {
    const content = readFileSync(resolve(dir, '.env'), 'utf8')
    const vars = {}
    for (const line of content.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const idx = trimmed.indexOf('=')
      if (idx < 0) continue
      const key = trimmed.slice(0, idx).trim()
      const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '')
      vars[key] = val
    }
    return vars
  } catch { return {} }
}

const _env = loadEnv(new URL('.', import.meta.url).pathname)

const PRICE_INPUT_PER_M = 3.0
const PRICE_OUTPUT_PER_M = 15.0
const COST_LIMIT_USD = parseFloat(_env.COST_LIMIT_USD || '50')
let totalInputTokens = 0
let totalOutputTokens = 0
let apiKey = _env.ANTHROPIC_API_KEY || ''

function getEstimatedCost() {
  return (totalInputTokens / 1_000_000) * PRICE_INPUT_PER_M +
         (totalOutputTokens / 1_000_000) * PRICE_OUTPUT_PER_M
}

async function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', chunk => { body += chunk })
    req.on('end', () => {
      try { resolve(JSON.parse(body || '{}')) } catch { resolve({}) }
    })
    req.on('error', reject)
  })
}

function sendJson(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(data))
}

/** Vite plugin: mounts /api/* handlers into the dev server */
function apiPlugin() {
  return {
    name: 'api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) return next()

        const url = req.url.split('?')[0]

        // GET /api/cost-status
        if (req.method === 'GET' && url === '/api/cost-status') {
          const cost = getEstimatedCost()
          return sendJson(res, 200, {
            estimatedCostUSD: parseFloat(cost.toFixed(4)),
            limitUSD: COST_LIMIT_USD,
            percentUsed: Math.min((cost / COST_LIMIT_USD) * 100, 100).toFixed(1),
            totalInputTokens,
            totalOutputTokens,
            isNearLimit: cost >= COST_LIMIT_USD * 0.9,
            isOverLimit: cost >= COST_LIMIT_USD,
          })
        }

        // POST /api/teacher/update-key
        if (req.method === 'POST' && url === '/api/teacher/update-key') {
          const { password, newKey } = await readBody(req)
          const teacherPw = _env.TEACHER_PASSWORD || 'teacher1234'
          if (password !== teacherPw) return sendJson(res, 401, { error: '비밀번호가 올바르지 않습니다.' })
          if (!newKey || !newKey.startsWith('sk-ant-')) return sendJson(res, 400, { error: '올바른 Anthropic API 키 형식이 아닙니다 (sk-ant-...).' })
          apiKey = newKey.trim()
          console.log('[API] Key updated at', new Date().toISOString())
          return sendJson(res, 200, { ok: true, message: 'API 키가 업데이트되었습니다.' })
        }

        // POST /api/claude
        if (req.method === 'POST' && url === '/api/claude') {
          // Cost guard
          const cost = getEstimatedCost()
          if (cost >= COST_LIMIT_USD) {
            return sendJson(res, 403, {
              error: `사용 비용 한도($${COST_LIMIT_USD})에 도달했습니다. 선생님께 문의하세요.`,
            })
          }

          if (!apiKey || apiKey === 'sk-ant-your-key-here') {
            return sendJson(res, 503, { error: 'API 키가 설정되지 않았습니다. 선생님께 문의하세요.' })
          }

          const { systemPrompt, userMessage, maxTokens = 1500 } = await readBody(req)
          if (!systemPrompt || !userMessage) {
            return sendJson(res, 400, { error: 'systemPrompt and userMessage are required.' })
          }

          try {
            const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
              },
              body: JSON.stringify({
                model: 'claude-sonnet-4-5',
                max_tokens: maxTokens,
                system: systemPrompt,
                messages: [{ role: 'user', content: userMessage }],
              }),
            })

            const data = await anthropicRes.json()

            if (!anthropicRes.ok) {
              return sendJson(res, anthropicRes.status, { error: data?.error?.message || 'Anthropic API error' })
            }

            if (data.usage) {
              totalInputTokens += data.usage.input_tokens || 0
              totalOutputTokens += data.usage.output_tokens || 0
            }

            const text = data.content?.[0]?.text || ''
            const jsonMatch = text.match(/\{[\s\S]*\}/)
            if (!jsonMatch) {
              return sendJson(res, 500, { error: 'AI 응답에서 JSON을 찾을 수 없어요.' })
            }

            return sendJson(res, 200, {
              result: JSON.parse(jsonMatch[0]),
              cost: getEstimatedCost().toFixed(4),
            })
          } catch (err) {
            console.error('[/api/claude] error:', err)
            return sendJson(res, 500, { error: err.message || 'Internal server error' })
          }
        }

        next()
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), apiPlugin()],
  base: '/aine-journal-prep/',
})
