import { useSession } from '../context/SessionContext';

export default function TimerBar() {
  const { timeDisplay, percentLeft, isExpired, timeLeft } = useSession();

  const barColor = 'bg-blue-500';

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 ${barColor} transition-colors duration-1000`}>
      {/* Progress bar */}
      <div
        className="h-0.5 bg-white bg-opacity-40 transition-all duration-1000"
        style={{ width: `${percentLeft}%` }}
      />
      <div className="flex items-center justify-between px-4 py-2">
        <span className="text-white text-sm font-medium">
          📚 학습 진행 중
        </span>
        <div className="text-white font-black text-xl tracking-wider">
          {timeDisplay}
        </div>
        <span className="text-white text-xs opacity-70">
          오늘의 공부 시간
        </span>
      </div>
    </div>
  );
}
