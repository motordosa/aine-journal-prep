import { useState } from 'react';
import { getLevel } from '../utils/storage';

export default function CharacterDisplay({ totalScore, isLevelUp }) {
  const { title, emoji, color, level } = getLevel(totalScore);

  const stages = [
    { emoji: '🌱', label: '씨앗 기자', range: '0~19점', active: level >= 0 },
    { emoji: '🌿', label: '새싹 기자', range: '20~39점', active: level >= 1 },
    { emoji: '🌸', label: '꽃봉오리 기자', range: '40~59점', active: level >= 2 },
    { emoji: '⭐', label: '별빛 기자', range: '60~79점', active: level >= 3 },
    { emoji: '🏆', label: '슈퍼 기자', range: '80~100점', active: level >= 4 },
  ];

  return (
    <div className="text-center">
      {/* Main character */}
      <div className={`relative inline-block p-8 rounded-full bg-gradient-to-br ${color} shadow-xl mb-4 ${isLevelUp ? 'level-glow' : ''}`}>
        <span className="text-7xl animate-[float_3s_ease-in-out_infinite] inline-block">{emoji}</span>
        {isLevelUp && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl animate-[starBurst_0.8s_ease-out_forwards]">✨</span>
          </div>
        )}
      </div>
      
      <h2 className="text-2xl font-black text-gray-800 mb-1">{title}</h2>
      <div className="inline-block bg-orange-100 text-orange-600 font-bold px-4 py-1 rounded-full text-sm mb-4">
        누적 점수 {totalScore}점
      </div>

      {/* Progress stages */}
      <div className="flex justify-center gap-2 flex-wrap mt-2">
        {stages.map((s, i) => (
          <div
            key={i}
            className={`flex flex-col items-center p-2 rounded-xl transition-all ${
              s.active ? 'bg-orange-100 opacity-100 scale-110' : 'bg-gray-100 opacity-40'
            }`}
          >
            <span className="text-xl">{s.emoji}</span>
            <span className="text-xs font-bold text-gray-600 hidden sm:block">{s.label.split(' ')[0]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
