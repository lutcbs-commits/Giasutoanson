'use client';
import { useState } from 'react';
import type { MiniGame } from '@/lib/lessonTypes';

interface MiniGameBlockProps {
  game: MiniGame;
  onComplete: () => void;
}

export default function MiniGameBlock({ game, onComplete }: MiniGameBlockProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const answered = selected !== null;

  function handleSelect(option: string) {
    if (answered) return;
    setSelected(option);
  }

  function getButtonStyle(option: string) {
    if (!answered) {
      return 'border-2 border-grass-200 bg-white hover:border-grass-400 hover:bg-grass-50 text-gray-800 cursor-pointer';
    }
    if (option === game.answer) {
      return 'border-2 border-grass-500 bg-grass-500 text-white shadow-lg shadow-grass-200';
    }
    if (option === selected) {
      return 'border-2 border-red-500 bg-red-500 text-white shadow-lg shadow-red-200';
    }
    return 'border-2 border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed';
  }

  const isCorrect = selected === game.answer;

  return (
    <div className="w-full rounded-3xl border-2 border-violet-200 bg-gradient-to-br from-violet-50 to-violet-100 overflow-hidden animate-scale-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-500 to-violet-600 px-6 py-4 flex items-center gap-3">
        <span className="text-2xl animate-wiggle inline-block">🎮</span>
        <div>
          <p className="text-white/80 text-xs font-bold uppercase tracking-wider">Mini Game</p>
          <p className="text-white font-black text-sm">Kiểm tra nhanh!</p>
        </div>
      </div>

      <div className="p-6">
        {/* Question */}
        <p className="font-black text-violet-900 text-lg mb-5 leading-snug">{game.question}</p>

        {/* Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {game.options.map((option, i) => {
            const letters = ['A', 'B', 'C', 'D'];
            return (
              <button
                key={option}
                onClick={() => handleSelect(option)}
                className={`flex items-center gap-3 p-4 rounded-2xl font-bold text-sm text-left transition-all duration-200 ${getButtonStyle(option)}`}
              >
                <span className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
                  answered && option === game.answer
                    ? 'bg-white/30 text-white'
                    : answered && option === selected && option !== game.answer
                    ? 'bg-white/30 text-white'
                    : 'bg-violet-100 text-violet-700'
                }`}>
                  {letters[i]}
                </span>
                {option}
              </button>
            );
          })}
        </div>

        {/* Result & Explanation */}
        {answered && (
          <div className={`rounded-2xl p-4 mb-4 border-2 animate-fade-up ${
            isCorrect
              ? 'bg-grass-50 border-grass-300'
              : 'bg-red-50 border-red-300'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{isCorrect ? '🌟' : '💪'}</span>
              <span className={`font-black ${isCorrect ? 'text-grass-700' : 'text-red-700'}`}>
                {isCorrect ? 'Chính xác! Tuyệt vời!' : 'Chưa đúng, cùng xem lời giải nhé!'}
              </span>
            </div>
            <p className="text-gray-700 font-medium text-sm">{game.explanation}</p>
          </div>
        )}

        {/* Continue button */}
        {answered && (
          <button
            onClick={onComplete}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-br from-grass-500 to-grass-600 text-white font-black py-3 rounded-2xl hover:shadow-lg transition-all hover:-translate-y-0.5 active:scale-95 animate-fade-up"
          >
            Tiếp tục →
          </button>
        )}
      </div>
    </div>
  );
}
