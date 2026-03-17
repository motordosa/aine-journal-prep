import 'dotenv/config';
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

// ── In-memory cost tracking ──────────────────────────────────────────────────
// Prices per million tokens for claude-sonnet-4-5
const PRICE_INPUT_PER_M = 3.0;   // $3 per 1M input tokens
const PRICE_OUTPUT_PER_M = 15.0; // $15 per 1M output tokens
const COST_LIMIT_USD = parseFloat(process.env.COST_LIMIT_USD || '50');

let totalInputTokens = 0;
let totalOutputTokens = 0;
let apiKey = process.env.ANTHROPIC_API_KEY || '';

function getEstimatedCost() {
  return (totalInputTokens / 1_000_000) * PRICE_INPUT_PER_M +
         (totalOutputTokens / 1_000_000) * PRICE_OUTPUT_PER_M;
}

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '2mb' }));

// Cost limit guard
app.use('/api/claude', (req, res, next) => {
  const cost = getEstimatedCost();
  if (cost >= COST_LIMIT_USD) {
    return res.status(403).json({
      error: `사용 비용 한도($${COST_LIMIT_USD})에 도달했습니다. 선생님께 문의하세요.`,
      cost: cost.toFixed(4),
      limit: COST_LIMIT_USD,
    });
  }
  next();
});

// ── /api/claude ───────────────────────────────────────────────────────────────
app.post('/api/claude', async (req, res) => {
  if (!apiKey || apiKey === 'sk-ant-your-key-here') {
    return res.status(503).json({ error: 'API 키가 설정되지 않았습니다. 선생님께 문의하세요.' });
  }

  const { systemPrompt, userMessage, model = 'claude-sonnet-4-5', maxTokens = 1500 } = req.body;
  if (!systemPrompt || !userMessage) {
    return res.status(400).json({ error: 'systemPrompt and userMessage are required.' });
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
        model,
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
      }),
    });

    const data = await anthropicRes.json();

    if (!anthropicRes.ok) {
      return res.status(anthropicRes.status).json({ error: data?.error?.message || 'Anthropic API error' });
    }

    // Track tokens
    if (data.usage) {
      totalInputTokens += data.usage.input_tokens || 0;
      totalOutputTokens += data.usage.output_tokens || 0;
    }

    // Parse JSON from Claude's text response
    const text = data.content?.[0]?.text || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.status(500).json({ error: 'AI 응답에서 JSON을 찾을 수 없어요.' });
    }

    res.json({ result: JSON.parse(jsonMatch[0]), cost: getEstimatedCost().toFixed(4) });
  } catch (err) {
    console.error('[/api/claude] error:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// ── /api/cost-status ─────────────────────────────────────────────────────────
app.get('/api/cost-status', (req, res) => {
  const cost = getEstimatedCost();
  res.json({
    estimatedCostUSD: parseFloat(cost.toFixed(4)),
    limitUSD: COST_LIMIT_USD,
    percentUsed: Math.min((cost / COST_LIMIT_USD) * 100, 100).toFixed(1),
    totalInputTokens,
    totalOutputTokens,
    isNearLimit: cost >= COST_LIMIT_USD * 0.9,
    isOverLimit: cost >= COST_LIMIT_USD,
  });
});

// ── /api/teacher/update-key ───────────────────────────────────────────────────
app.post('/api/teacher/update-key', (req, res) => {
  const { password, newKey } = req.body;
  const teacherPw = process.env.TEACHER_PASSWORD || 'teacher1234';

  if (password !== teacherPw) {
    return res.status(401).json({ error: '비밀번호가 올바르지 않습니다.' });
  }
  if (!newKey || !newKey.startsWith('sk-ant-')) {
    return res.status(400).json({ error: '올바른 Anthropic API 키 형식이 아닙니다 (sk-ant-...).' });
  }

  apiKey = newKey.trim();
  console.log('[Teacher] API key updated at', new Date().toISOString());
  res.json({ ok: true, message: 'API 키가 업데이트되었습니다.' });
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Aine Journal Server running on http://localhost:${PORT}`);
  console.log(`   Cost limit: $${COST_LIMIT_USD}`);
  console.log(`   API key set: ${apiKey ? 'YES (' + apiKey.slice(0, 10) + '...)' : 'NO ⚠️'}`);
});
