import CharacterDisplay from '../components/CharacterDisplay';
import { getLevel, getStreakBadges } from '../utils/storage';
import { useSession } from '../context/SessionContext';

export default function HomePage({ profile, onNavigate, onOpenTeacher }) {
  const { title } = getLevel(profile.totalScore);
  const badges = getStreakBadges(profile);
  const { isExpired, timeDisplay, resetSession } = useSession();

  const modes = [
    {
      id: 'short',
      emoji: '📝',
      title: '단문 연습',
      subtitle: '6하 원칙으로 쓰기',
      desc: '20점 만점',
      color: 'from-blue-400 to-cyan-400',
      bg: 'bg-blue-50',
    },
    {
      id: 'long',
      emoji: '📰',
      title: '장문 연습',
      subtitle: '단락 구성하기',
      desc: '30점 만점',
      color: 'from-green-400 to-teal-400',
      bg: 'bg-green-50',
    },
    {
      id: 'editorial',
      emoji: '🗞️',
      title: '사설 작성',
      subtitle: '서론·본론·결론',
      desc: '50점 만점',
      color: 'from-orange-400 to-pink-400',
      bg: 'bg-orange-50',
    },
    {
      id: 'summary',
      emoji: '✍️',
      title: '문장 요약',
      subtitle: '핵심 내용 요약하기',
      desc: '30점 만점',
      color: 'from-purple-400 to-violet-400',
      bg: 'bg-purple-50',
    },
  ];

  return (
    <div className="min-h-screen pt-16 pb-8 px-4 max-w-lg mx-auto">
      {/* Header */}
      <div className="text-center pt-6 pb-4">
        <h1 className="text-2xl font-black text-gray-800">
          안녕, <span className="text-orange-500">{profile.name}</span> 기자! 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">오늘도 열심히 글을 써봐요!</p>
      </div>

      {/* Level-up banner */}
      {profile.isLevelUp && (
        <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl p-4 mb-4 text-white text-center font-black text-lg shadow-xl animate-bounce">
          🎉 레벨 업! 축하해요!
        </div>
      )}

      {/* Session expired warning */}
      {isExpired && (
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 mb-4 text-center">
          <div className="text-2xl mb-1">⏰</div>
          <p className="font-black text-red-600">50분 학습 시간이 종료되었습니다!</p>
          <p className="text-red-400 text-sm mb-4">결과를 선생님께 제출하세요.</p>
          <button
            onClick={resetSession}
            className="w-full bg-gradient-to-r from-red-400 to-rose-500 text-white font-black py-3 rounded-xl shadow-lg hover:from-red-500 hover:to-rose-600 transition-all"
          >
            📤 결과 제출하고 다시 시작하기
          </button>
        </div>
      )}

      {/* Character */}
      <div className="bg-white rounded-3xl shadow-lg p-6 mb-5 card-hover">
        <CharacterDisplay totalScore={profile.totalScore} />
        <div className="flex justify-center gap-6 mt-4 text-center">
          <div>
            <div className="text-2xl font-black text-orange-500">{profile.totalScore}</div>
            <div className="text-xs text-gray-400">누적 점수</div>
          </div>
          <div className="w-px bg-gray-100"></div>
          <div>
            <div className="text-2xl font-black text-blue-500">{profile.completedSessions || 0}</div>
            <div className="text-xs text-gray-400">완료 횟수</div>
          </div>
          <div className="w-px bg-gray-100"></div>
          <div>
            <div className="text-2xl font-black text-green-500">{(profile.sessionDates || []).length}</div>
            <div className="text-xs text-gray-400">학습 일수</div>
          </div>
        </div>
        {badges.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {badges.map((b, i) => (
              <span key={i} className={`${b.color} text-sm font-bold px-3 py-1 rounded-full`}>
                {b.label}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Mode Buttons */}
      <div className="space-y-3 mb-6">
        <h2 className="text-lg font-black text-gray-700 pl-1">오늘 어떤 연습 할까요?</h2>
        {modes.map(m => (
          <button
            key={m.id}
            onClick={() => !isExpired && onNavigate(m.id)}
            disabled={isExpired}
            className={`w-full flex items-center gap-4 bg-white rounded-2xl p-5 shadow-md card-hover border-2 border-transparent hover:border-orange-200 text-left transition-all ${isExpired ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${m.color} flex items-center justify-center text-2xl shadow-md flex-shrink-0`}>
              {m.emoji}
            </div>
            <div className="flex-1">
              <div className="font-black text-gray-800 text-lg">{m.title}</div>
              <div className="text-gray-500 text-sm">{m.subtitle}</div>
            </div>
            <div className="text-right">
              <span className={`${m.bg} text-gray-600 font-bold text-xs px-3 py-1 rounded-full`}>
                {m.desc}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Teacher button */}
      <div className="text-center">
        <button
          onClick={onOpenTeacher}
          className="text-gray-400 text-sm hover:text-gray-600 transition-colors"
          id="teacher-btn"
        >
          👩🏫 선생님 보기
        </button>
      </div>
    </div>
  );
}
