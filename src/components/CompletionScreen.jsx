export default function CompletionScreen({ score, totalScore, onHome }) {
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      <div className="bg-white rounded-3xl p-8 mx-4 text-center max-w-sm w-full shadow-2xl animate-[scaleUp_0.5s_ease-out]">
        <div className="text-6xl mb-4 animate-[float_3s_ease-in-out_infinite]">🌙</div>
        <h2 className="text-2xl font-black text-gray-800 mb-2">오늘의 연습 끝!</h2>
        <p className="text-gray-500 mb-6">내일 또 만나요 🌙</p>
        
        <div className="bg-gradient-to-r from-orange-100 to-pink-100 rounded-2xl p-4 mb-6">
          <div className="text-3xl font-black text-orange-500">+{score}점 획득!</div>
          <div className="text-sm text-gray-500 mt-1">누적 점수: {totalScore}점</div>
        </div>

        <div className="flex justify-center gap-2 text-2xl mb-6">
          {Array.from({ length: Math.min(Math.ceil(score / 5), 5) }).map((_, i) => (
            <span key={i} className="animate-[starBurst_0.6s_ease-out_forwards]" style={{ animationDelay: `${i * 0.1}s` }}>⭐</span>
          ))}
        </div>

        <button
          onClick={onHome}
          className="w-full bg-gradient-to-r from-orange-400 to-pink-400 text-white font-black py-4 rounded-2xl text-lg hover:from-orange-500 hover:to-pink-500 transition-all shadow-lg"
        >
          🏠 홈으로 돌아가기
        </button>
      </div>
    </div>
  );
}
