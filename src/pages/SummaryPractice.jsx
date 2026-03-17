import { useState, useEffect } from 'react';
import { callClaude, SUMMARY_PASSAGE_PROMPT, SUMMARY_SYSTEM_PROMPT } from '../utils/claude';
import FeedbackView from '../components/FeedbackView';
import LoadingOverlay from '../components/LoadingOverlay';
import { useSession } from '../context/SessionContext';

const CATEGORY_COLORS = {
  '신문기사': 'from-blue-400 to-cyan-400',
  '고전문학': 'from-amber-400 to-orange-400',
  '과학': 'from-green-400 to-teal-400',
  '사회·역사': 'from-red-400 to-rose-400',
  '환경': 'from-emerald-400 to-green-400',
};

const CATEGORY_EMOJIS = {
  '신문기사': '📰', '고전문학': '📚', '과학': '🔬', '사회·역사': '🏛️', '환경': '🌱',
};

export default function SummaryPractice({ profile, onDone }) {
  const { isExpired } = useSession();
  // Automatically reset on every mount (page access)
  const [step, setStep] = useState('loading'); // loading | practice | feedback
  const [passage, setPassage] = useState(null);
  const [summaryText, setSummaryText] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [error, setError] = useState('');

  // Auto-load a new passage on every mount
  useEffect(() => {
    loadPassage();
  }, []); // eslint-disable-line

  const loadPassage = async () => {
    setStep('loading');
    setSummaryText('');
    setFeedback(null);
    setError('');
    try {
      const pScore = profile.totalScore || 0;
      let diffHint = "초등학교 6학년 수준";
      if (pScore < 60) diffHint = "초등학교 3-4학년 수준의 짧고 쉬운 지문 (10-15줄)";
      else if (pScore < 180) diffHint = "초등학교 5-6학년 수준의 표준 지문 (20줄)";
      else diffHint = "중학교 1학년 수준의 전문적이고 긴 지문 (25-30줄)";

      const res = await callClaude(
        SUMMARY_PASSAGE_PROMPT,
        `${diffHint}을 하나 생성해주세요. 카테고리는 무작위로 선택하세요.`,
        2000
      );
      setPassage(res);
      setStep('practice');
    } catch (e) {
      setError('지문 생성 중 오류가 발생했어요: ' + e.message);
      setStep('practice');
    }
  };

  const submit = async () => {
    if (summaryText.trim().length < 100) {
      setError('요약문을 조금 더 자세히 써봐요! 본인의 생각을 충분히 담기 위해 최소 100자 이상이 필요해요.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const userMsg = `[지문 제목]: ${passage?.title || '제목 없음'}
[지문 카테고리]: ${passage?.category || ''}
[원문]:
${passage?.passage || ''}

[핵심 포인트]: ${JSON.stringify(passage?.key_points || [])}

[학생이 쓴 요약문]:
${summaryText}`;

      const res = await callClaude(SUMMARY_SYSTEM_PROMPT, userMsg, 2000);
      setFeedback(res);
      setScore(res.score);
      setStep('feedback');
    } catch (e) {
      setError('피드백을 가져오는 중 오류가 발생했어요: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const categoryColor = passage ? (CATEGORY_COLORS[passage.category] || 'from-purple-400 to-violet-400') : 'from-purple-400 to-violet-400';
  const categoryEmoji = passage ? (CATEGORY_EMOJIS[passage.category] || '✍️') : '✍️';

  return (
    <div className="min-h-screen pt-16 pb-8 px-4 max-w-lg mx-auto">
      {loading && <LoadingOverlay />}

      <div className="pt-4 mb-6 flex items-center gap-3">
        <button
          onClick={() => onDone(undefined)}
          className="bg-white border-2 border-gray-100 p-3 rounded-full shadow-sm hover:shadow-md transition-all group"
          title="홈으로 가기"
        >
          <span className="text-xl group-hover:scale-110 transition-transform inline-block">🏠</span>
        </button>
        <button
          onClick={loadPassage}
          className="ml-auto bg-purple-100 text-purple-600 px-4 py-2 rounded-xl text-sm font-black hover:bg-purple-200 transition-colors flex items-center gap-1"
          disabled={loading || step === 'loading'}
        >
          🔄 새 지문
        </button>
      </div>

      {/* Loading state */}
      {step === 'loading' && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="text-5xl mb-4 animate-bounce">📖</div>
          <p className="text-gray-500 font-bold">지문을 준비하고 있어요...</p>
        </div>
      )}

      {step === 'practice' && (
        <div className="slide-up pb-20">
          {/* Guide header */}
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">✍️</div>
            <h1 className="text-2xl font-black text-gray-800">문장 요약 연습</h1>
            <p className="text-gray-500 text-sm mt-1">지문을 읽고 핵심 내용을 요약해보세요</p>
          </div>

          {/* Tips */}
          <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-4 mb-5">
            <h3 className="font-black text-purple-700 mb-2">📌 요약 잘 하는 방법</h3>
            <div className="space-y-1 text-sm text-purple-600">
              <p>① 핵심 주제가 무엇인지 파악해요</p>
              <p>② 중요한 내용과 덜 중요한 내용을 구분해요</p>
              <p>③ 자신의 말로 간결하게 써요</p>
              <p>④ 맞춤법과 문법에 주의해요</p>
            </div>
          </div>

          {/* Passage */}
          {passage && (
            <div className={`bg-gradient-to-r ${categoryColor} rounded-3xl p-5 mb-5 text-white`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{categoryEmoji}</span>
                <span className="text-sm font-bold opacity-80">{passage.category}</span>
              </div>
              <div className="text-base font-black mb-3">{passage.title}</div>
              <div className="bg-white bg-opacity-20 rounded-2xl p-4">
                <p className="text-sm leading-relaxed whitespace-pre-line">{passage.passage}</p>
              </div>
            </div>
          )}

          {error && !passage && (
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 mb-4 text-center">
              <p className="text-red-500 text-sm">{error}</p>
              <button onClick={loadPassage} className="mt-2 text-red-600 font-bold text-sm underline">
                다시 시도
              </button>
            </div>
          )}

          {/* Summary input */}
          {passage && (
            <>
              <div className="mb-4">
                <label className="block font-black text-gray-700 text-base mb-2">
                  ✏️ 내가 쓰는 요약문
                </label>
                <textarea
                  value={summaryText}
                  onChange={e => setSummaryText(e.target.value)}
                  placeholder="위 지문의 핵심 내용을 요약해서 써보세요..."
                  className="w-full h-40 border-2 border-gray-200 rounded-2xl p-4 text-base focus:outline-none focus:border-purple-400 resize-none transition-colors"
                  disabled={isExpired}
                />
                <div className="flex justify-between items-center text-xs mt-1">
                  <span className={summaryText.length < 100 ? 'text-red-400 font-bold' : 'text-green-500 font-bold'}>
                    {summaryText.length < 100 ? `⚠️ ${100 - summaryText.length}자 더 필요해요` : '✅ 충분해요!'}
                  </span>
                  <span className="text-gray-400">{summaryText.length}자 / 최소 100자</span>
                </div>
              </div>

              {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

              <button
                onClick={submit}
                disabled={summaryText.trim().length < 100 || loading || isExpired}
                className="w-full bg-gradient-to-r from-purple-400 to-violet-400 text-white font-black py-5 rounded-2xl text-xl shadow-xl hover:from-purple-500 hover:to-violet-500 disabled:opacity-50 transition-all"
              >
                📤 선생님께 보내기
              </button>
            </>
          )}
        </div>
      )}

      {step === 'feedback' && feedback && (
        <div className="slide-up pb-4">
          <FeedbackView
            feedback={feedback}
            mode="summary"
            score={score}
            onDone={() => onDone(score, 'summary', passage?.title || '', summaryText, feedback)}
            onNext={loadPassage}
            isExpired={isExpired}
          />
        </div>
      )}
    </div>
  );
}
