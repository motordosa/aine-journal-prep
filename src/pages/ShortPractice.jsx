import { useState } from 'react';
import { callClaude, SHORT_SYSTEM_PROMPT, TOPIC_SYSTEM_PROMPT } from '../utils/claude';
import FeedbackView from '../components/FeedbackView';
import LoadingOverlay from '../components/LoadingOverlay';

const SIX_W = [
  { key: '누가', icon: '👤', color: 'bg-blue-100 text-blue-600' },
  { key: '언제', icon: '🕐', color: 'bg-green-100 text-green-600' },
  { key: '어디서', icon: '📍', color: 'bg-pink-100 text-pink-600' },
  { key: '무엇을', icon: '📦', color: 'bg-yellow-100 text-yellow-600' },
  { key: '어떻게', icon: '⚙️', color: 'bg-purple-100 text-purple-600' },
  { key: '왜', icon: '🤔', color: 'bg-orange-100 text-orange-600' },
];

function Guide({ onStart }) {
  return (
    <div className="slide-up pb-20">
      <div className="text-center mb-6">
        <div className="text-5xl mb-3">📝</div>
        <h1 className="text-2xl font-black text-gray-800">6하 원칙이란?</h1>
        <p className="text-gray-500 text-sm mt-1">기사를 잘 쓰려면 이 6가지가 필요해요!</p>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-6">
        {SIX_W.map(w => (
          <div key={w.key} className={`${w.color} rounded-2xl p-4 text-center card-hover`}>
            <div className="text-3xl mb-1">{w.icon}</div>
            <div className="font-black text-lg">{w.key}</div>
          </div>
        ))}
      </div>

      <div className="space-y-3 mb-6">
        <h3 className="font-black text-gray-700 text-lg">✅ 좋은 예</h3>
        <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4">
          <p className="text-gray-700 leading-relaxed text-sm">
            <span className="font-bold text-green-600">[누가]</span> 김민준이{' '}
            <span className="font-bold text-blue-600">[언제]</span> 오늘 아침{' '}
            <span className="font-bold text-pink-600">[어디서]</span> 운동장에서{' '}
            <span className="font-bold text-yellow-600">[무엇을]</span> 친구에게{' '}
            <span className="font-bold text-purple-600">[어떻게]</span> 용기 있게{' '}
            <span className="font-bold text-orange-600">[왜]</span> 도움이 필요해서 도움을 요청했다.
          </p>
        </div>
        <h3 className="font-black text-gray-700 text-lg">❌ 아쉬운 예</h3>
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4">
          <p className="text-gray-700 text-sm">누군가가 누군가에게 무언가를 했다.</p>
          <p className="text-red-500 text-xs mt-1">→ 누가, 언제, 어디서, 무엇을, 어떻게, 왜가 모두 빠져있어요!</p>
        </div>
      </div>

      <button
        onClick={onStart}
        id="short-start-btn"
        className="w-full bg-gradient-to-r from-blue-400 to-cyan-400 text-white font-black py-5 rounded-2xl text-xl shadow-xl hover:from-blue-500 hover:to-cyan-500 transition-all"
      >
        🚀 연습 시작하기!
      </button>
    </div>
  );
}

export default function ShortPractice({ profile, onDone }) {
  const [step, setStep] = useState('guide'); // guide | practice | feedback
  const [topic, setTopic] = useState('');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [error, setError] = useState('');

  const startPractice = async () => {
    setError('');
    setText('');
    setFeedback(null);
    setLoading(true);
    try {
      const res = await callClaude(
        TOPIC_SYSTEM_PROMPT,
        '단문 연습용 주제를 1개 만들어주세요 (6하 원칙 연습에 적합한 초등학생 일상 주제)'
      );
      setTopic(res.topic);
      setStep('practice');
    } catch (e) {
      setError('주제 생성 중 오류가 발생했어요: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const submit = async () => {
    if (text.trim().length < 20) { setError('최소 20자 이상 써주세요! 조금 더 풍성하게 써볼까요?'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await callClaude(SHORT_SYSTEM_PROMPT, `주제: ${topic}\n\n학생이 쓴 문장:\n${text}`);
      setFeedback(res);
      setScore(res.score);
      setStep('feedback');
    } catch (e) {
      setError('피드백을 가져오는 중 오류가 발생했어요: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  // Simple keyword check for 6W hints
  const checks = {
    누가: /[가-힣]+이|[가-힣]+가|[가-힣]+은|[가-힣]+는/.test(text),
    언제: /아침|점심|저녁|오늘|어제|지난주|월|화|수|목|금|토|일|시|분/.test(text),
    어디서: /에서|에|학교|집|운동장|교실|도서관|공원|병원/.test(text),
    무엇을: /을|를/.test(text),
    어떻게: /하게|스럽게|이렇게|천천히|빠르게|열심히|용기있게/.test(text),
    왜: /왜냐하면|때문에|하려고|위해서|이유|그래서/.test(text),
  };

  return (
    <div className="min-h-screen pt-16 pb-8 px-4 max-w-lg mx-auto">
      {loading && <LoadingOverlay />}

      <div className="pt-4 mb-6">
        <button
          onClick={() => onDone(undefined)}
          className="bg-white border-2 border-gray-100 p-3 rounded-full shadow-sm hover:shadow-md transition-all group"
          title="홈으로 가기"
        >
          <span className="text-xl group-hover:scale-110 transition-transform inline-block">🏠</span>
        </button>
      </div>

      {step === 'guide' && <Guide onStart={startPractice} />}

      {step === 'practice' && (
        <div className="slide-up pb-20">
          <div className="bg-gradient-to-r from-blue-400 to-cyan-400 rounded-3xl p-5 mb-5 text-white relative">
            <div className="text-sm font-bold opacity-80 mb-1">✏️ 오늘의 주제</div>
            <div className="text-lg font-black pr-16">{topic}</div>
            <button
              onClick={startPractice}
              disabled={loading}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-xl transition-all"
              title="새 문제"
            >
              🔄
            </button>
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="여기에 문장을 써보세요..."
                className="w-full h-36 border-2 border-gray-200 rounded-2xl p-4 text-base focus:outline-none focus:border-blue-400 resize-none transition-colors"
              />
              <div className="flex justify-between items-center text-xs mt-1">
                <span className={text.length < 20 ? 'text-red-400 font-bold' : 'text-green-500 font-bold'}>
                  {text.length < 20 ? `⚠️ ${20 - text.length}자 더 필요해요` : '✅ 충분해요!'}
                </span>
                <span className="text-gray-400">{text.length}자 / 최소 20자</span>
              </div>
            </div>

            {/* Live checklist */}
            <div className="flex flex-col gap-1 w-20">
              {SIX_W.map(w => (
                <div
                  key={w.key}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl text-xs font-bold transition-all ${
                    checks[w.key] ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  <span>{w.icon}</span>
                  <span>{w.key}</span>
                </div>
              ))}
            </div>
          </div>

          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

          <button
            onClick={submit}
            disabled={text.trim().length < 20}
            className="w-full bg-gradient-to-r from-blue-400 to-cyan-400 text-white font-black py-5 rounded-2xl text-xl shadow-xl mt-4 hover:from-blue-500 hover:to-cyan-500 disabled:opacity-50 transition-all"
          >
            📤 선생님께 보내기
          </button>
        </div>
      )}

      {step === 'feedback' && feedback && (
        <div className="slide-up pb-4">
          <FeedbackView
            feedback={feedback}
            mode="short"
            score={score}
            onDone={() => onDone(score, 'short', topic, text, feedback)}
          />
        </div>
      )}
    </div>
  );
}
