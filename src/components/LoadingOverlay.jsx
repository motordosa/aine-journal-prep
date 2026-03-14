export default function LoadingOverlay() {
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-white bg-opacity-90">
      <div className="text-center">
        <div className="text-6xl mb-6 animate-[wiggle_0.5s_ease-in-out_infinite]">✏️</div>
        <p className="text-xl font-black text-gray-700 mb-4">선생님이 글을 읽고 있어요...</p>
        <div className="flex justify-center gap-2">
          <div className="w-3 h-3 rounded-full bg-orange-400 dot-bounce"></div>
          <div className="w-3 h-3 rounded-full bg-pink-400 dot-bounce"></div>
          <div className="w-3 h-3 rounded-full bg-purple-400 dot-bounce"></div>
        </div>
        <p className="text-gray-400 text-sm mt-4">잠깐만 기다려 주세요! 🌟</p>
      </div>
    </div>
  );
}
