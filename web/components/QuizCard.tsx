'use client';
import { useState } from 'react';
import clsx from 'clsx';
import type { QuizQuestion } from '@/lib/quizGenerator';
import { TOPIC_LABELS, TOPIC_COLORS } from '@/lib/quizGenerator';

interface QuizCardProps {
  question: QuizQuestion;
  onCorrect?: () => void;
  onWrong?: () => void;
  onNext?: () => void;
}

export default function QuizCard({ question, onCorrect, onWrong, onNext }: QuizCardProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const answered = selected !== null;
  const isCorrect = answered && selected === question.correctIndex;

  function handleChoice(idx: number) {
    if (answered) return;
    setSelected(idx);
    if (idx === question.correctIndex) onCorrect?.();
    else onWrong?.();
  }

  function handleNext() {
    setSelected(null);
    onNext?.();
  }

  return (
    <div className="card animate-scale-in">
      <div className="flex items-center gap-2 mb-4">
        <span className={clsx('badge text-xs', TOPIC_COLORS[question.topic])}>
          {question.emoji} {TOPIC_LABELS[question.topic]}
        </span>
        <span className="badge text-xs bg-grass-50 text-grass-600 border-grass-200">
          Lớp {question.grade}
        </span>
      </div>

      <p className="text-xl font-black text-grass-900 mb-6 text-center py-4 bg-grass-50 rounded-2xl border border-grass-100">
        {question.question}
      </p>

      <div className="grid grid-cols-2 gap-3">
        {question.choices.map((choice, idx) => (
          <button
            key={idx}
            onClick={() => handleChoice(idx)}
            disabled={answered}
            className={clsx(
              'py-4 px-4 rounded-2xl font-bold text-lg border-2 transition-all duration-200',
              !answered
                ? 'border-grass-200 bg-white hover:border-grass-400 hover:bg-grass-50 hover:scale-105 active:scale-95'
                : idx === question.correctIndex
                ? 'border-grass-400 bg-grass-100 text-grass-800 scale-105'
                : idx === selected
                ? 'border-rose-400 bg-rose-100 text-rose-700'
                : 'border-gray-200 bg-gray-50 text-gray-400 opacity-60'
            )}
          >
            {idx === question.correctIndex && answered && '✅ '}
            {idx === selected && idx !== question.correctIndex && '❌ '}
            {choice}
          </button>
        ))}
      </div>

      {answered && (
        <div className={clsx(
          'mt-5 p-4 rounded-2xl border-2 animate-fade-up',
          isCorrect ? 'bg-grass-50 border-grass-300 text-grass-800' : 'bg-rose-50 border-rose-200 text-rose-800'
        )}>
          <p className="font-black text-lg mb-1">
            {isCorrect ? '🎉 Xuất sắc! Đúng rồi!' : '💪 Chưa đúng, cố lên!'}
          </p>
          <p className="text-sm font-medium">{question.explanation}</p>
        </div>
      )}

      {answered && onNext && (
        <button
          onClick={handleNext}
          className="btn-primary w-full mt-4"
        >
          Câu tiếp theo →
        </button>
      )}
    </div>
  );
}
