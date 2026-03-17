import { useState, useEffect } from 'react';

function StarBurst({ x, y, emoji }) {
  return (
    <div
      className="particle text-2xl"
      style={{
        left: x,
        top: y,
        '--tx': `${(Math.random() - 0.5) * 200}px`,
        '--ty': `${-Math.random() * 150 - 50}px`,
      }}
    >
      {emoji}
    </div>
  );
}

const SECTION_STYLES = {
  intro: {
    wrapper: 'bg-purple-50 border-2 border-purple-200 rounded-2xl p-5',
    heading: 'font-black text-purple-700 text-lg mb-3',
  },
  body: {
    wrapper: 'bg-blue-50 border-2 border-blue-200 rounded-2xl p-5',
    heading: 'font-black text-blue-700 text-lg mb-3',
  },
  conclusion: {
    wrapper: 'bg-green-50 border-2 border-green-200 rounded-2xl p-5',
    heading: 'font-black text-green-700 text-lg mb-3',
  },
};

export default function FeedbackView({ feedback, mode, score, onDone, onNext, isExpired }) {
  const [stars, setStars] = useState([]);
  const [showScore, setShowScore] = useState(false);

  useEffect(() => {
    const s = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: `${25 + Math.random() * 50}%`,
      y: `${30 + Math.random() * 30}%`,
      emoji: ['⭐', '✨', '🌟', '💫'][Math.floor(Math.random() * 4)],
    }));
    setStars(s);
    setTimeout(() => setStars([]), 1000);
    setTimeout(() => setShowScore(true), 300);
  }, []);

  const ChecklistRow = ({ label, value }) => (
    <div className={`flex items-center gap-3 p-2 rounded-xl ${value ? 'bg-green-50' : 'bg-red-50'}`}>
      <span className="text-xl">{value ? '✅' : '❌'}</span>
      <span className={`font-bold text-sm ${value ? 'text-green-700' : 'text-red-700'}`}>{label}</span>
      <span className={`text-xs ml-auto ${value ? 'text-green-500' : 'text-red-400'}`}>
        {value ? '있어요!' : '없어요'}
      </span>
    </div>
  );

  const SIX_W_KEYS = ['누가', '언제', '어디서', '무엇을', '어떻게', '왜'];
  const rawChecklist = feedback.checklist || feedback.six_w_check;
  const checklist = (() => {
    if (!rawChecklist) return null;
    if (Array.isArray(rawChecklist)) {
      const obj = {};
      SIX_W_KEYS.forEach((k, i) => { obj[k] = rawChecklist[i] ?? false; });
      return obj;
    }
    const keys = Object.keys(rawChecklist);
    if (keys.length > 0 && !isNaN(keys[0])) {
      const obj = {};
      SIX_W_KEYS.forEach((k, i) => { obj[k] = rawChecklist[i] ?? false; });
      return obj;
    }
    return rawChecklist;
  })();

  const maxScore = mode === 'short' ? 20 : mode === 'editorial' ? 50 : 30;

  const editorialSections = [
    { key: 'intro_feedback', label: '📖 서론', style: SECTION_STYLES.intro },
    { key: 'body_feedback', label: '💭 본론', style: SECTION_STYLES.body },
    { key: 'conclusion_feedback', label: '🌟 결론', style: SECTION_STYLES.conclusion },
  ];

  return (
    <div className="slide-up space-y-4 pb-20">
      {stars.map(s => <StarBurst key={s.id} {...s} />)}

      {/* Score banner */}
      <div className="bg-gradient-to-r from-orange-400 to-pink-400 rounded-3xl p-6 text-center text-white shadow-xl">
        <div className="text-5xl mb-2">🎉</div>
        {showScore && (
          <div className="animate-[scaleUp_0.4s_ease-out]">
            <div className="text-5xl font-black">{score}점</div>
            <div className="text-orange-100 text-sm">/ {maxScore}점 만점</div>
          </div>
        )}
      </div>

      {/* Praise */}
      {(feedback.praise || feedback.overall_praise) && (
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-5">
          <h3 className="font-black text-yellow-700 text-lg mb-2">👏 잘했어요!</h3>
          <p className="text-gray-700 leading-relaxed">{feedback.praise || feedback.overall_praise}</p>
        </div>
      )}

      {/* 6W Checklist (short + editorial) */}
      {checklist && (
        <div className="bg-white border-2 border-gray-100 rounded-2xl p-5 shadow-sm">
          <h3 className="font-black text-gray-700 text-lg mb-3">📋 6하 원칙 체크</h3>
          <div className="space-y-2">
            {Object.entries(checklist).map(([key, val]) => (
              <ChecklistRow key={key} label={key} value={val} />
            ))}
          </div>
        </div>
      )}

      {/* Short: missing + example */}
      {mode === 'short' && feedback.missing && (
        <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-5">
          <h3 className="font-black text-orange-700 text-lg mb-2">💡 이걸 추가해 봐요!</h3>
          <p className="text-gray-700 leading-relaxed">{feedback.missing}</p>
        </div>
      )}

      {/* Long: structure analysis */}
      {mode === 'long' && feedback.structure_analysis && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-5">
          <h3 className="font-black text-blue-700 text-lg mb-3">🏗️ 단락 구조 분석</h3>
          {Object.entries(feedback.structure_analysis).map(([k, v]) => (
            <div key={k} className="mb-3 last:mb-0">
              <span className="font-bold text-blue-600 text-sm">{k}: </span>
              <span className="text-gray-700 text-sm">{v}</span>
            </div>
          ))}
          {feedback.connecting_words_feedback && (
            <div className="mt-3 pt-3 border-t border-blue-200">
              <span className="font-bold text-blue-600 text-sm">연결어 피드백: </span>
              <span className="text-gray-700 text-sm">{feedback.connecting_words_feedback}</span>
            </div>
          )}
        </div>
      )}

      {/* Editorial: section feedback */}
      {mode === 'editorial' && editorialSections.map(({ key, label, style }) =>
        feedback[key] ? (
          <div key={key} className={style.wrapper}>
            <h3 className={style.heading}>{label}</h3>
            {feedback[key].strength && (
              <p className="text-sm text-gray-700 mb-2">
                ✅ <span className="font-semibold">잘한 점:</span> {feedback[key].strength}
              </p>
            )}
            {feedback[key].improvement && (
              <p className="text-sm text-gray-700 mb-2">
                💡 <span className="font-semibold">개선할 점:</span> {feedback[key].improvement}
              </p>
            )}
            {feedback[key].logic_check && (
              <p className="text-sm text-gray-700">
                🔗 <span className="font-semibold">논리 흐름:</span> {feedback[key].logic_check}
              </p>
            )}
          </div>
        ) : null
      )}

      {/* Editorial: best sentence + reporter tip */}
      {mode === 'editorial' && feedback.best_sentence && (
        <div className="bg-pink-50 border-2 border-pink-200 rounded-2xl p-5">
          <h3 className="font-black text-pink-700 text-lg mb-2">⭐ 가장 잘 쓴 문장</h3>
          <blockquote className="text-gray-700 italic border-l-4 border-pink-300 pl-3">
            "{feedback.best_sentence}"
          </blockquote>
        </div>
      )}
      {mode === 'editorial' && feedback.reporter_tip && (
        <div className="bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-5">
          <h3 className="font-black text-indigo-700 text-lg mb-2">📰 기자 팁!</h3>
          <p className="text-gray-700">{feedback.reporter_tip}</p>
        </div>
      )}

      {/* Summary mode: key points check */}
      {mode === 'summary' && feedback.key_points_check && (
        <div className="bg-white border-2 border-gray-100 rounded-2xl p-5 shadow-sm">
          <h3 className="font-black text-gray-700 text-lg mb-3">🔍 핵심 내용 체크</h3>
          <div className="space-y-2">
            {feedback.key_points_check.map((item, i) => (
              <div key={i} className={`flex items-start gap-3 p-3 rounded-xl ${item.included ? 'bg-green-50' : 'bg-red-50'}`}>
                <span className="text-lg flex-shrink-0">{item.included ? '✅' : '❌'}</span>
                <div>
                  <p className={`font-bold text-sm ${item.included ? 'text-green-700' : 'text-red-700'}`}>{item.point}</p>
                  {item.note && <p className={`text-xs mt-0.5 ${item.included ? 'text-green-600' : 'text-red-500'}`}>{item.note}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary: spelling errors */}
      {mode === 'summary' && feedback.spelling_errors && feedback.spelling_errors.length > 0 && (
        <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-5">
          <h3 className="font-black text-orange-700 text-lg mb-3">✏️ 맞춤법 & 문법 수정</h3>
          <div className="space-y-1">
            {feedback.spelling_errors.map((err, i) => (
              <p key={i} className="text-sm text-gray-700 bg-white rounded-lg px-3 py-2">• {err}</p>
            ))}
          </div>
          {feedback.grammar_feedback && (
            <p className="text-sm text-orange-700 mt-3">{feedback.grammar_feedback}</p>
          )}
        </div>
      )}

      {/* Summary: completeness */}
      {mode === 'summary' && feedback.completeness_feedback && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-5">
          <h3 className="font-black text-blue-700 text-lg mb-2">📋 요약 완성도</h3>
          <p className="text-gray-700 text-sm">{feedback.completeness_feedback}</p>
        </div>
      )}

      {/* Summary: model summary */}
      {mode === 'summary' && feedback.model_summary && (
        <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-5">
          <h3 className="font-black text-purple-700 text-lg mb-2">✨ 모범 요약 예시</h3>
          <p className="text-gray-700 leading-relaxed bg-white rounded-xl p-4 border border-purple-100 text-sm">
            {feedback.model_summary}
          </p>
        </div>
      )}

      {/* Improved / rewritten example (short + long) */}
      {(feedback.improved_example || feedback.rewritten_example) && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-5">
          <h3 className="font-black text-blue-700 text-lg mb-2">✨ 이렇게 써보면 어떨까요?</h3>
          <p className="text-gray-700 leading-relaxed bg-white rounded-xl p-4 border border-blue-100">
            {feedback.improved_example || feedback.rewritten_example}
          </p>
        </div>
      )}

      {/* Improvement tip (long) */}
      {feedback.improvement_tip && (
        <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-5">
          <h3 className="font-black text-green-700 text-lg mb-2">💎 핵심 팁</h3>
          <p className="text-gray-700">{feedback.improvement_tip}</p>
        </div>
      )}

      {/* Encouragement */}
      {feedback.encouragement && (
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-200 rounded-2xl p-5 text-center">
          <p className="text-lg font-bold text-purple-700">{feedback.encouragement}</p>
        </div>
      )}

      {/* Action buttons */}
      <div className="space-y-3">
        {/* Next problem (summary only, if not expired) */}
        {mode === 'summary' && onNext && !isExpired && (
          <button
            onClick={onNext}
            className="w-full bg-gradient-to-r from-purple-400 to-violet-400 text-white font-black py-4 rounded-2xl text-lg shadow-xl hover:from-purple-500 hover:to-violet-500 transition-all"
          >
            ➡️ 다음 지문 풀기
          </button>
        )}
        <button
          onClick={onDone}
          className="w-full bg-gradient-to-r from-orange-400 to-pink-400 text-white font-black py-5 rounded-2xl text-xl shadow-xl hover:from-orange-500 hover:to-pink-500 transition-all"
        >
          🏠 연습 완료! 홈으로 가기
        </button>
      </div>
    </div>
  );
}
