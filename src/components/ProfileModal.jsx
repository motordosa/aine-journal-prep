import { useState } from 'react';

export default function ProfileModal({ onSave }) {
  const [name, setName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');

  const handleNext = () => {
    if (!name.trim()) { setError('이름을 입력해 주세요!'); return; }
    setError('');
    setStep(2);
  };

  const handleSave = () => {
    if (!apiKey.trim()) { setError('API 키를 입력해 주세요!'); return; }
    onSave(name.trim(), apiKey.trim());
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-gradient-to-br from-orange-400 via-pink-400 to-purple-500">
      <div className="bg-white rounded-3xl shadow-2xl p-8 mx-4 w-full max-w-sm text-center animate-[fadeIn_0.5s_ease-in]">
        {step === 1 ? (
          <>
            <div className="text-6xl mb-4 animate-[float_3s_ease-in-out_infinite]">🗞️</div>
            <h1 className="text-2xl font-black text-gray-800 mb-1">안녕하세요!</h1>
            <p className="text-gray-500 text-sm mb-6">기자단 글쓰기 연습에 오신 걸 환영해요 🎉</p>
            <label className="block text-left text-sm font-bold text-gray-600 mb-2">
              내 이름이 뭐예요? 👤
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleNext()}
              placeholder="예: 김아이네"
              className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-base focus:outline-none focus:border-orange-400 transition-colors mb-2"
              autoFocus
            />
            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
            <button
              onClick={handleNext}
              className="w-full bg-gradient-to-r from-orange-400 to-pink-400 text-white font-black py-4 rounded-2xl text-lg mt-2 hover:from-orange-500 hover:to-pink-500 transition-all shadow-lg"
            >
              다음으로 →
            </button>
          </>
        ) : (
          <>
            <div className="text-5xl mb-4">🔑</div>
            <h2 className="text-xl font-black text-gray-800 mb-1">API 키 입력</h2>
            <p className="text-gray-500 text-sm mb-2">선생님께 Anthropic API 키를 받으세요</p>
            <a
              href="https://console.anthropic.com"
              target="_blank"
              rel="noreferrer"
              className="text-blue-400 text-xs underline mb-4 inline-block"
            >
              console.anthropic.com에서 발급받기 →
            </a>
            <input
              type="password"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSave()}
              placeholder="sk-ant-..."
              className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-orange-400 transition-colors mb-2"
              autoFocus
            />
            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
            <button
              onClick={handleSave}
              className="w-full bg-gradient-to-r from-orange-400 to-pink-400 text-white font-black py-4 rounded-2xl text-lg mt-2 hover:from-orange-500 hover:to-pink-500 transition-all shadow-lg"
            >
              🚀 시작하기!
            </button>
            <button onClick={() => setStep(1)} className="text-gray-400 text-sm mt-3 underline">← 뒤로</button>
          </>
        )}
      </div>
    </div>
  );
}
