import { useState } from 'react';
import { callClaude, LONG_SYSTEM_PROMPT, TOPIC_SYSTEM_PROMPT } from '../utils/claude';
import FeedbackView from '../components/FeedbackView';
import LoadingOverlay from '../components/LoadingOverlay';

function Guide({ onStart }) {
  return (
    <div className="slide-up pb-20">
      <div className="text-center mb-6">
        <div className="text-5xl mb-3">📰</div>
        <h1 className="text-2xl font-black text-gray-800">단락을 만들어 봐요!</h1>
        <p className="text-gray-500 text-sm mt-1">좋은 글은 세 부분으로 이루어져요</p>
      </div>

      <div className="space-y-2 mb-6">
        {[
          { emoji: '🎬', label: '도입', desc: '무슨 이야기인지 알려줘요', color: 'from-blue-400 to-blue-500' },
          { emoji: '📖', label: '전개', desc: '자세한 내용을 써요', color: 'from-green-400 to-green-500' },
          { emoji: '🎯', label: '마무리', desc: '정리하고 느낀 점을 써요', color: 'from-orange-400 to-orange-500' },
        ].map((s, i) => (
          <div key={s.label}>
            <div className={`bg-gradient-to-r ${s.color} rounded-2xl p-4 flex items-center gap-4 text-white`}>
              <div className="text-3xl">{s.emoji}</div>
              <div>
                <div className="font-black text-lg">{s.label}</div>
                <div className="text-sm opacity-80">{s.desc}</div>
              </div>
            </div>
            {i < 2 && <div className="text-center text-gray-300 text-xl my-1">↓</div>}
          </div>
        ))}
      </div>

      <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-4 mb-6">
        <h3 className="font-black text-purple-700 mb-3">🔗 연결어를 써보아요!</h3>
        <div className="flex flex-wrap gap-2">
          {['먼저', '그리고', '하지만', '그래서', '왜냐하면', '결국', '마지막으로', '예를 들어'].map(w => (
            <span key={w} className="bg-purple-100 text-purple-600 font-bold text-sm px-3 py-1 rounded-full">
              {w}
            </span>
          ))}
        </div>
      </div>

      <button
        onClick={onStart}
        id="long-start-btn"
        className="w-full bg-gradient-to-r from-green-400 to-teal-400 text-white font-black py-5 rounded-2xl text-xl shadow-xl"
      >
        🚀 연습 시작하기!
      </button>
    </div>
  );
}

export default function LongPractice({ profile, onDone }) {
  const [step, setStep] = useState('guide');
  const [topic, setTopic] = useState('');
  const [texts, setTexts] = useState({ intro: '', body: '', conclusion: '' });
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [error, setError] = useState('');

  const startPractice = async () => {
    setError('');
    setTexts({ intro: '', body: '', conclusion: '' });
    setFeedback(null);
    setLoading(true);
    try {
      const res = await callClaude(
        TOPIC_SYSTEM_PROMPT,
        '단락 글쓰기용 주제를 1개 만들어주세요 (3~5문장으로 쓸 수 있는 초등학생 일상 주제)'
      );
      setTopic(res.topic);
      setStep('practice');
    } catch (e) {
      setError('주제 생성 중 오류가 발생했어요: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const totalLen = Object.values(texts).join('').length;

  const submit = async () => {
    if (totalLen < 100) { setError('조금 더 자세히 써봐요! 최소 100자 이상이 필요해요.'); return; }
    setError('');
    setLoading(true);
    try {
      const fullText = `서론: ${texts.intro}\n본론: ${texts.body}\n결론: ${texts.conclusion}`;
      const res = await callClaude(LONG_SYSTEM_PROMPT, `주제: ${topic}\n\n학생이 쓴 글:\n${fullText}`);
      setFeedback(res);
      setScore(res.score);
      setStep('feedback');
    } catch (e) {
      setError('피드백을 가져오는 중 오류가 발생했어요: ' + e.message);
    } finally {
      setLoading(false);
    }
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
          <div className="bg-gradient-to-r from-green-400 to-teal-400 rounded-3xl p-5 mb-5 text-white relative">
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

          <div className="space-y-6 mb-6">
            {[
              { key: 'intro', label: '🎬 도입', placeholder: '어떤 이야기를 할지 소개해주세요...' },
              { key: 'body', label: '📖 전개', placeholder: '자세한 내용을 더해주세용...' },
              { key: 'conclusion', label: '🎯 마무리', placeholder: '생각을 정리해주세요...' },
            ].map(s => (
              <div key={s.key}>
                <label className="block text-sm font-black text-gray-700 mb-2 pl-1">{s.label}</label>
                <textarea
                  value={texts[s.key]}
                  onChange={e => setTexts(prev => ({ ...prev, [s.key]: e.target.value }))}
                  placeholder={s.placeholder}
                  className="w-full h-32 border-2 border-gray-200 rounded-2xl p-4 text-base focus:outline-none focus:border-green-400 resize-none transition-colors"
                />
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center text-xs mt-1 mb-4">
            <span className={totalLen < 100 ? 'text-red-400 font-bold' : 'text-green-500 font-bold'}>
              {totalLen < 100 ? `⚠️ ${100 - totalLen}자 더 필요해요` : '✅ 충분해요!'}
            </span>
            <span className="text-gray-400">{totalLen}자 / 최소 100자</span>
          </div>

          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

          <button
            onClick={submit}
            disabled={totalLen < 100}
            className="w-full bg-gradient-to-r from-green-400 to-teal-400 text-white font-black py-5 rounded-2xl text-xl shadow-xl hover:from-green-500 hover:to-teal-500 disabled:opacity-50"
          >
            📤 선생님께 보내기
          </button>
        </div>
      )}

      {step === 'feedback' && feedback && (
        <FeedbackView
          feedback={feedback}
          mode="long"
          score={score}
          onDone={() => onDone(score, 'long', topic, `서론: ${texts.intro}\n본론: ${texts.body}\n결론: ${texts.conclusion}`, feedback)}
        />
      )}
    </div>
  );
}
