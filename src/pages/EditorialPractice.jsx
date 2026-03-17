import { useState, useEffect } from 'react';
import { callClaude, EDITORIAL_SYSTEM_PROMPT, TOPIC_SYSTEM_PROMPT } from '../utils/claude';
import FeedbackView from '../components/FeedbackView';
import LoadingOverlay from '../components/LoadingOverlay';

const TABS = [
  { key: 'intro', label: '서론', emoji: '🎣', hint: '독자의 관심을 끌어요!\n• 오늘 다룰 주제를 알려주세요\n• 왜 이 주제가 중요한지 써요' },
  { key: 'body', label: '본론', emoji: '💭', hint: '내 생각과 이유를 써요!\n• 주장 + 이유 2~3가지\n• 예시나 증거도 함께 써요' },
  { key: 'conclusion', label: '결론', emoji: '🌟', hint: '마무리하고 바람을 담아요!\n• 내 주장을 다시 정리해요\n• 앞으로 바라는 점을 써요' },
];

function Guide({ onStart }) {
  return (
    <div className="slide-up pb-20">
      <div className="text-center mb-6">
        <div className="text-5xl mb-3">🗞️</div>
        <h1 className="text-2xl font-black text-gray-800">사설을 써봐요!</h1>
        <p className="text-gray-500 text-sm mt-1">내 생각을 논리적으로 표현해요</p>
      </div>

      <div className="space-y-2 mb-6">
        {[
          { emoji: '🎣', label: '서론', desc: '독자의 관심을 끌어요!', sub: '주제 소개 + 중요성 설명', color: 'from-blue-400 to-blue-500' },
          { emoji: '💭', label: '본론', desc: '내 생각과 이유를 써요!', sub: '근거 2~3가지 + 예시', color: 'from-green-400 to-green-500' },
          { emoji: '🌟', label: '결론', desc: '마무리하고 바람을 담아요!', sub: '정리 + 호소', color: 'from-orange-400 to-pink-400' },
        ].map((s, i) => (
          <div key={s.label}>
            <div className={`bg-gradient-to-r ${s.color} rounded-2xl p-4 text-white`}>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-3xl">{s.emoji}</span>
                <div>
                  <div className="font-black text-lg">{s.label}</div>
                  <div className="text-sm font-bold opacity-90">{s.desc}</div>
                </div>
              </div>
              <div className="text-xs opacity-70 ml-12">{s.sub}</div>
            </div>
            {i < 2 && <div className="text-center text-gray-300 my-1">↓</div>}
          </div>
        ))}
      </div>

      <div className="bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-4 mb-6">
        <h3 className="font-black text-indigo-700 mb-2">📌 글쓰기 순서</h3>
        <div className="flex items-center gap-2 text-sm text-indigo-600 font-bold flex-wrap">
          <span className="bg-indigo-100 px-3 py-1 rounded-full">1️⃣ 개요 짜기</span>
          <span>→</span>
          <span className="bg-indigo-100 px-3 py-1 rounded-full">2️⃣ 초고 쓰기</span>
          <span>→</span>
          <span className="bg-indigo-100 px-3 py-1 rounded-full">3️⃣ 퇴고하기</span>
        </div>
      </div>

      <button
        onClick={onStart}
        id="editorial-start-btn"
        className="w-full bg-gradient-to-r from-orange-400 to-pink-400 text-white font-black py-5 rounded-2xl text-xl shadow-xl"
      >
        🚀 사설 쓰기 시작!
      </button>
    </div>
  );
}

export default function EditorialPractice({ profile, onDone }) {
  const [step, setStep] = useState('guide');
  const [topic, setTopic] = useState('');
  const [texts, setTexts] = useState({ intro: '', body: '', conclusion: '' });
  const [activeTab, setActiveTab] = useState('intro');
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [error, setError] = useState('');

  const fetchNewTopic = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await callClaude(
        TOPIC_SYSTEM_PROMPT,
        '사설(논설문) 주제를 1개 만들어주세요 (초등학생이 찬반 의견을 쓸 수 있는 사회 주제)'
      );
      setTopic(res.topic || '우리 학교에서 스마트폰 사용을 허용해야 할까요?');
    } catch (e) {
      setError('주제 생성 중 오류가 발생했어요: ' + e.message);
      setTopic('우리 학교에서 스마트폰 사용을 허용해야 할까요?'); // Fallback topic on error
    } finally {
      setLoading(false);
    }
  };

  const totalLen = Object.values(texts).join('').length;

  // Load topic on guide start
  useEffect(() => {
    fetchNewTopic();
  }, []); // eslint-disable-line

  const submit = async () => {
    if (totalLen < 300) { setError('조금 더 자세히 써봐요! 본인의 생각을 충분히 담기 위해 최소 300자 이상이 필요해요.'); return; }
    setError('');
    setLoading(true);
    try {
      const userText = `주제: ${topic}\n\n서론:\n${texts.intro}\n\n본론:\n${texts.body}\n\n결론:\n${texts.conclusion}`;
      const res = await callClaude(EDITORIAL_SYSTEM_PROMPT, userText);
      setFeedback(res);
      setScore(res.score);
      setStep('feedback');
    } catch (e) {
      setError('피드백을 가져오는 중 오류가 발생했어요: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const studentText = `서론:\n${texts.intro}\n\n본론:\n${texts.body}\n\n결론:\n${texts.conclusion}`;

  return (
    <div className="min-h-screen pt-16 pb-8 px-4 max-w-lg mx-auto">
      {loading && <LoadingOverlay />}

      <div className="pt-4 mb-4">
        <button
          onClick={() => onDone(undefined)}
          className="text-gray-400 hover:text-gray-600 text-sm"
        >
          ← 홈으로
        </button>
      </div>

      {step === 'guide' && <Guide onStart={() => setStep('practice')} />}

      {step === 'practice' && (
        <div className="slide-up pb-20">
          <div className="bg-gradient-to-r from-orange-400 to-pink-400 rounded-3xl p-5 mb-5 text-white relative">
            <div className="text-sm font-bold opacity-80 mb-1">✏️ 오늘의 사설 주제</div>
            <div className="text-lg font-black pr-16">{topic}</div>
            <button
              onClick={fetchNewTopic}
              disabled={loading}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-xl transition-all"
              title="새 문제"
            >
              🔄
            </button>
          </div>

          {/* Tab navigation */}
          <div className="flex gap-2 mb-4">
            {TABS.map(t => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`flex-1 flex flex-col items-center py-3 rounded-2xl font-black text-sm transition-all ${
                  activeTab === t.key
                    ? 'bg-orange-400 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                <span className="text-lg">{t.emoji}</span>
                <span>{t.label}</span>
                <span className="text-xs mt-0.5 opacity-70">{texts[t.key].length}자</span>
              </button>
            ))}
          </div>

          {/* Active tab content */}
          {TABS.map(t => t.key === activeTab && (
            <div key={t.key} className="slide-up">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 mb-3 text-xs text-gray-500 whitespace-pre-line leading-relaxed">
                {t.hint}
              </div>
              <textarea
                value={texts[t.key]}
                onChange={e => setTexts(prev => ({ ...prev, [t.key]: e.target.value }))}
                placeholder={`${t.label}을 여기에 써보세요...`}
                className="w-full h-40 border-2 border-gray-200 rounded-2xl p-4 text-base focus:outline-none focus:border-orange-400 resize-none"
              />
              <div className="text-right text-xs text-gray-400 mt-1">{texts[t.key].length}자</div>
            </div>
          ))}

          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setShowPreview(true)}
              className="flex-1 bg-gray-100 text-gray-600 font-black py-4 rounded-2xl text-sm hover:bg-gray-200 transition-all"
            >
              👁️ 전체 미리보기
            </button>
            <button
              onClick={submit}
              disabled={totalLen < 300}
              className="flex-1 bg-gradient-to-r from-orange-400 to-pink-400 text-white font-black py-4 px-6 rounded-2xl text-sm shadow-xl disabled:opacity-50 transition-all"
            >
              📤 제출하기
            </button>
          </div>
          <div className="flex justify-between items-center text-xs mt-2 px-1">
            <span className={totalLen < 300 ? 'text-red-400 font-bold' : 'text-green-500 font-bold'}>
              {totalLen < 300 ? `⚠️ ${300 - totalLen}자 더 필요해요` : '✅ 충분해요!'}
            </span>
            <span className="text-gray-400">전체 {totalLen}자 / 최소 300자</span>
          </div>
          {error && <p className="text-red-500 text-sm mt-3 text-center font-bold px-2">{error}</p>}
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-[120] bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full max-h-[80vh] overflow-y-auto shadow-2xl">
            <h2 className="font-black text-gray-800 text-xl mb-1">📄 전체 미리보기</h2>
            <p className="text-orange-500 font-bold text-sm mb-4">{topic}</p>
            {TABS.map(t => (
              <div key={t.key} className="mb-4">
                <h3 className="font-black text-gray-600 text-sm mb-1">{t.emoji} {t.label}</h3>
                <p className="text-gray-700 text-sm leading-relaxed bg-gray-50 rounded-xl p-3 min-h-[40px]">
                  {texts[t.key] || <span className="text-gray-300">아직 작성하지 않았어요</span>}
                </p>
              </div>
            ))}
            <button
              onClick={() => setShowPreview(false)}
              className="w-full bg-orange-400 text-white font-black py-3 rounded-2xl"
            >
              닫기
            </button>
          </div>
        </div>
      )}

      {step === 'feedback' && feedback && (
        <FeedbackView
          feedback={feedback}
          mode="editorial"
          score={score}
          onDone={() => onDone(score, 'editorial', topic, studentText, feedback)}
        />
      )}
    </div>
  );
}
