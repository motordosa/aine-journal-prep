import { useState, useEffect, useRef } from 'react';

export default function TimerBar() {
  const [isStudying, setIsStudying] = useState(true);
  const [seconds, setSeconds] = useState(40 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [showBreakPopup, setShowBreakPopup] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            if (isStudying) {
              setIsStudying(false);
              setSeconds(10 * 60);
              setShowBreakPopup(true);
              setTimeout(() => setShowBreakPopup(false), 5000);
            } else {
              setIsStudying(true);
              setSeconds(40 * 60);
            }
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, isStudying]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');

  const reset = () => {
    clearInterval(intervalRef.current);
    setIsRunning(false);
    setIsStudying(true);
    setSeconds(40 * 60);
    setShowBreakPopup(false);
  };

  return (
    <>
      <div className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-2 shadow-sm transition-colors duration-500 ${
        isStudying ? 'bg-blue-500' : 'bg-green-500'
      }`}>
        <div className="flex items-center gap-2">
          <span className="text-white text-sm font-medium">
            {isStudying ? '📚 학습 중' : '🌿 휴식 중'}
          </span>
        </div>
        <div className="text-white font-black text-xl tracking-wider">
          {mm}:{ss}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRunning(r => !r)}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white text-xs font-bold px-3 py-1 rounded-full transition-all"
          >
            {isRunning ? '⏸ 일시정지' : '▶ 시작'}
          </button>
          <button
            onClick={reset}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white text-xs font-bold px-3 py-1 rounded-full transition-all"
          >
            🔄
          </button>
        </div>
      </div>

      {/* Break popup */}
      {showBreakPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-3xl p-8 mx-4 text-center shadow-2xl animate-[scaleUp_0.4s_ease-out]">
            <div className="text-6xl mb-4">🌟</div>
            <h2 className="text-2xl font-black text-green-600 mb-2">잠깐, 쉬는 시간이에요!</h2>
            <p className="text-gray-600 text-lg mb-4">눈을 감고 스트레칭 해봐요 🌟</p>
            <p className="text-gray-400 text-sm">10분 휴식 후 다시 공부해요</p>
            <button
              onClick={() => setShowBreakPopup(false)}
              className="mt-4 bg-green-500 text-white px-6 py-2 rounded-full font-bold"
            >
              알겠어요! 😊
            </button>
          </div>
        </div>
      )}
    </>
  );
}
