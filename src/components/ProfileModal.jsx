import { useState } from 'react';

export default function ProfileModal({ onSave }) {
  const [step, setStep] = useState('name'); // 'name' only now
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (name.trim().length < 1) {
      setError('이름을 입력해주세요!');
      return;
    }
    onSave(name.trim());
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-gradient-to-br from-orange-200 via-pink-200 to-purple-200">
      <div className="bg-white rounded-3xl shadow-2xl p-8 mx-4 max-w-sm w-full text-center slide-up">
        {step === 'name' && (
          <>
            <div className="text-5xl mb-4">🗞️</div>
            <h2 className="text-2xl font-black text-gray-800 mb-1">안녕하세요!</h2>
            <p className="text-gray-500 text-sm mb-6">기자단 글쓰기 연습에 오신 걸 환영해요 🎉</p>

            <label className="block text-left text-sm font-bold text-gray-600 mb-2">
              내 이름이 뭐예요? 👤
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="예: 김아이네"
              className="w-full border-2 border-orange-200 rounded-2xl px-4 py-3 text-lg focus:outline-none focus:border-orange-400 mb-3 transition-colors"
              autoFocus
              maxLength={20}
            />
            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

            <button
              onClick={handleSubmit}
              disabled={name.trim().length === 0}
              className="w-full bg-gradient-to-r from-orange-400 to-pink-400 text-white font-black py-4 rounded-2xl text-lg shadow-lg hover:from-orange-500 hover:to-pink-500 disabled:opacity-50 transition-all"
            >
              다음으로 →
            </button>
          </>
        )}
      </div>
    </div>
  );
}
