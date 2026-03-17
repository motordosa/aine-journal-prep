import { useSession } from '../context/SessionContext';

export default function TimerBar() {
  const { timeDisplay, percentLeft, isExpired, timeLeft } = useSession();

  const isWarning = timeLeft <= 5 * 60 && timeLeft > 0; // last 5 mins
  const barColor = isExpired
    ? 'bg-gray-500'
    : isWarning
    ? 'bg-red-500'
    : 'bg-blue-500';

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 ${barColor} transition-colors duration-1000`}>
      {/* Progress bar */}
      <div
        className="h-0.5 bg-white bg-opacity-40 transition-all duration-1000"
        style={{ width: `${percentLeft}%` }}
      />
      <div className="flex items-center justify-between px-4 py-2">
        <span className="text-white text-sm font-medium">
          {isExpired ? '⏰ 시간 종료' : isWarning ? '⚠️ 곧 종료' : '📚 학습 중'}
        </span>
        <div className="text-white font-black text-xl tracking-wider">
          {isExpired ? '00:00' : timeDisplay}
        </div>
        <span className="text-white text-xs opacity-70">
          {isExpired ? '결과를 저장하세요' : '50분 세션'}
        </span>
      </div>
    </div>
  );
}
