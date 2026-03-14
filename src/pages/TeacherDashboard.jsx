import { useState, useEffect } from 'react';
import { getSessions } from '../utils/storage';
import { getLevel } from '../utils/storage';

const PASSWORD = 'teacher1234';

// Helper to clear all storage
async function clearAllStorage() {
  try {
    if (window.storage) {
      // Clear via window.storage if available
      const index = await window.storage.get('session_index');
      const timestamps = index ? JSON.parse(index) : [];
      for (const ts of timestamps) {
        await window.storage.set(`session:${ts}`, null);
      }
      await window.storage.set('profile', null);
      await window.storage.set('session_index', null);
      await window.storage.set('apiKey', null);
    }
  } catch {}
  // Always clear localStorage too
  localStorage.clear();
}

export default function TeacherDashboard({ profile, onBack, onReset }) {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState('');
  const [error, setError] = useState('');
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [copied, setCopied] = useState(false);

  // API Key section
  const [currentApiKey, setCurrentApiKey] = useState('');
  const [newApiKey, setNewApiKey] = useState('');
  const [apiKeySaved, setApiKeySaved] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  // Reset confirm
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    if (authed) {
      // Load current API key for display
      try {
        const k = localStorage.getItem('apiKey') || '';
        setCurrentApiKey(k);
      } catch {}
    }
  }, [authed]);

  const handleLogin = () => {
    if (pw === PASSWORD) {
      setAuthed(true);
      loadSessions();
    } else {
      setError('비밀번호가 틀렸어요!');
    }
  };

  const loadSessions = async () => {
    const s = await getSessions();
    setSessions(s);
  };

  const handleSaveApiKey = async () => {
    if (!newApiKey.trim()) return;
    try {
      if (window.storage) await window.storage.set('apiKey', newApiKey.trim());
      localStorage.setItem('apiKey', newApiKey.trim());
      setCurrentApiKey(newApiKey.trim());
      setNewApiKey('');
      setApiKeySaved(true);
      setTimeout(() => setApiKeySaved(false), 2000);
    } catch {
      alert('API 키 저장에 실패했어요');
    }
  };

  const handleReset = async () => {
    await clearAllStorage();
    setShowResetConfirm(false);
    if (onReset) onReset();
  };

  const formatDate = (ts) => {
    const d = new Date(ts);
    return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  };

  const modeLabel = { short: '단문', long: '장문', editorial: '사설' };
  const modeEmoji = { short: '📝', long: '📰', editorial: '🗞️' };

  const copyAll = async () => {
    const text = sessions.map(s =>
      `[${formatDate(s.createdAt)}] ${modeLabel[s.mode]} 연습 - ${s.score}점\n주제: ${s.topic || '-'}\n\n학생 글:\n${s.studentText || '-'}\n\nAI 피드백:\n${JSON.stringify(s.feedback, null, 2)}\n\n${'─'.repeat(40)}\n`
    ).join('\n');

    try {
      await navigator.clipboard.writeText(`학생: ${profile?.name}\n누적 점수: ${profile?.totalScore}\n\n${text}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert('클립보드 복사에 실패했어요');
    }
  };

  if (!authed) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-sm w-full text-center slide-up">
          <div className="text-5xl mb-4">👩🏫</div>
          <h2 className="text-2xl font-black text-gray-800 mb-2">선생님 전용 페이지</h2>
          <p className="text-gray-400 text-sm mb-6">비밀번호를 입력해 주세요</p>
          <input
            type="password"
            value={pw}
            onChange={e => setPw(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            placeholder="비밀번호"
            className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-center text-lg tracking-wider focus:outline-none focus:border-orange-400 mb-3"
            autoFocus
          />
          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
          <button
            onClick={handleLogin}
            className="w-full bg-gradient-to-r from-orange-400 to-pink-400 text-white font-black py-4 rounded-2xl text-lg shadow-lg"
          >
            🔓 확인
          </button>
          <button onClick={onBack} className="text-gray-400 text-sm mt-4 underline">← 돌아가기</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 pb-12 px-4 max-w-lg mx-auto">
      <div className="pt-4 mb-4 flex items-center justify-between">
        <button onClick={onBack} className="text-gray-400 hover:text-gray-600 text-sm">← 홈으로</button>
        <h1 className="font-black text-gray-700">👩🏫 선생님 대시보드</h1>
        <div></div>
      </div>

      {/* Student summary */}
      {profile && (
        <div className="bg-gradient-to-r from-orange-400 to-pink-400 rounded-3xl p-5 mb-4 text-white slide-up">
          <div className="flex items-center gap-4">
            <div className="text-4xl">{getLevel(profile.totalScore).emoji}</div>
            <div>
              <div className="font-black text-xl">{profile.name}</div>
              <div className="text-orange-100 text-sm">{getLevel(profile.totalScore).title}</div>
            </div>
            <div className="ml-auto text-right">
              <div className="text-2xl font-black">{profile.totalScore}점</div>
              <div className="text-orange-100 text-xs">{profile.completedSessions || 0}회 완료</div>
            </div>
          </div>
        </div>
      )}

      {/* ── API 키 설정 ── */}
      <div className="bg-white border-2 border-blue-100 rounded-2xl p-5 mb-4 shadow-sm">
        <h2 className="font-black text-blue-700 text-base mb-3">🔑 API 키 설정</h2>
        {currentApiKey && (
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-gray-500">현재 키:</span>
            <span className="text-xs font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded-lg flex-1 truncate">
              {showApiKey ? currentApiKey : currentApiKey.slice(0, 10) + '••••••••••••••••'}
            </span>
            <button
              onClick={() => setShowApiKey(v => !v)}
              className="text-xs text-blue-400 hover:text-blue-600 flex-shrink-0"
            >
              {showApiKey ? '숨기기' : '보기'}
            </button>
          </div>
        )}
        <div className="flex gap-2">
          <input
            type="password"
            value={newApiKey}
            onChange={e => setNewApiKey(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSaveApiKey()}
            placeholder="새 API 키 (sk-ant-...)"
            className="flex-1 border-2 border-gray-200 rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:border-blue-400"
          />
          <button
            onClick={handleSaveApiKey}
            disabled={!newApiKey.trim()}
            className={`px-4 py-2 rounded-xl font-black text-sm transition-all disabled:opacity-40 ${
              apiKeySaved
                ? 'bg-green-400 text-white'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {apiKeySaved ? '✅ 저장됨' : '저장'}
          </button>
        </div>
      </div>

      {/* ── 전체 기록 복사 ── */}
      <button
        onClick={copyAll}
        className={`w-full py-3 rounded-2xl font-black text-base mb-4 transition-all ${
          copied ? 'bg-green-400 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        {copied ? '✅ 복사 완료!' : '📋 전체 기록 복사'}
      </button>

      {/* ── 학습 기록 ── */}
      <h2 className="font-black text-gray-700 text-lg mb-3">📚 학습 기록 ({sessions.length}개)</h2>
      {sessions.length === 0 ? (
        <div className="text-center text-gray-400 py-10">
          <div className="text-4xl mb-3">📭</div>
          <p>아직 학습 기록이 없어요</p>
        </div>
      ) : (
        <div className="space-y-3 mb-6">
          {sessions.map((s, i) => (
            <button
              key={i}
              onClick={() => setSelectedSession(selectedSession === i ? null : i)}
              className="w-full bg-white rounded-2xl p-4 shadow-sm card-hover text-left border-2 border-transparent hover:border-orange-200"
            >
              <div className="flex items-center gap-3 mb-1">
                <span className="text-xl">{modeEmoji[s.mode]}</span>
                <span className="font-black text-gray-700">{modeLabel[s.mode]} 연습</span>
                <span className="ml-auto bg-orange-100 text-orange-600 font-black text-sm px-3 py-0.5 rounded-full">
                  {s.score}점
                </span>
              </div>
              <div className="text-gray-400 text-xs ml-8">{formatDate(s.createdAt)}</div>
              {s.topic && <div className="text-gray-500 text-sm ml-8 mt-1 truncate">주제: {s.topic}</div>}

              {selectedSession === i && (
                <div className="mt-4 border-t border-gray-100 pt-4 space-y-3 slide-up">
                  <div>
                    <h3 className="font-bold text-gray-600 text-sm mb-1">✏️ 학생이 쓴 글</h3>
                    <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-700 whitespace-pre-wrap text-left">
                      {s.studentText || '없음'}
                    </div>
                  </div>
                  {s.feedback && (
                    <div>
                      <h3 className="font-bold text-gray-600 text-sm mb-1">🤖 AI 피드백</h3>
                      <div className="bg-blue-50 rounded-xl p-3 text-xs text-gray-700 space-y-1 text-left">
                        {(s.feedback.praise || s.feedback.overall_praise) && (
                          <p><span className="font-bold">칭찬:</span> {s.feedback.praise || s.feedback.overall_praise}</p>
                        )}
                        {s.feedback.encouragement && (
                          <p><span className="font-bold">응원:</span> {s.feedback.encouragement}</p>
                        )}
                        {s.feedback.improvement_tip && (
                          <p><span className="font-bold">팁:</span> {s.feedback.improvement_tip}</p>
                        )}
                        {s.feedback.reporter_tip && (
                          <p><span className="font-bold">기자 팁:</span> {s.feedback.reporter_tip}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* ── 초기화 버튼 ── */}
      <div className="border-t-2 border-red-100 pt-5 mt-2">
        <h2 className="font-black text-red-500 text-base mb-2">⚠️ 데이터 초기화</h2>
        <p className="text-gray-400 text-xs mb-3">학생 이름, 누적 점수, 학습 기록이 모두 삭제됩니다. 되돌릴 수 없어요.</p>
        <button
          onClick={() => setShowResetConfirm(true)}
          className="w-full bg-red-50 text-red-500 border-2 border-red-200 font-black py-3 rounded-2xl hover:bg-red-100 transition-all"
        >
          🗑️ 전체 초기화
        </button>
      </div>

      {/* Reset confirm modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black bg-opacity-50 px-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl slide-up">
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-black text-gray-800 mb-2">정말 초기화할까요?</h2>
            <p className="text-gray-500 text-sm mb-6">
              <span className="font-bold text-red-500">{profile?.name}</span> 학생의 모든 기록이 삭제됩니다.<br />
              이 작업은 되돌릴 수 없어요.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 bg-gray-100 text-gray-600 font-black py-3 rounded-2xl hover:bg-gray-200"
              >
                취소
              </button>
              <button
                onClick={handleReset}
                className="flex-1 bg-red-500 text-white font-black py-3 rounded-2xl hover:bg-red-600"
              >
                초기화
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
