'use client';
import { useState } from 'react';
import type { Exercise, GradeFeedback } from '@/lib/lessonTypes';
import { apiFetch } from '@/lib/apiFetch';

interface ExerciseBlockProps {
  exercise: Exercise;
  exerciseNumber: number;
  totalExercises: number;
  onNext: (correct: boolean, feedback: GradeFeedback | null) => void;
}

const DIFFICULTY_LABELS = {
  easy: { label: 'Dễ', color: 'bg-grass-100 text-grass-700 border-grass-200' },
  medium: { label: 'Trung bình', color: 'bg-sun-100 text-sun-700 border-sun-200' },
  hard: { label: 'Khó', color: 'bg-red-100 text-red-700 border-red-200' },
};

export default function ExerciseBlock({
  exercise,
  exerciseNumber,
  totalExercises,
  onNext,
}: ExerciseBlockProps) {
  const [steps, setSteps] = useState<string[]>(['', '', '']);
  const [answerNumber, setAnswerNumber] = useState('');
  const [answerUnit, setAnswerUnit] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [grading, setGrading] = useState(false);
  const [feedback, setFeedback] = useState<GradeFeedback | null>(null);
  const [error, setError] = useState<string | null>(null);

  const diff = DIFFICULTY_LABELS[exercise.difficulty] ?? DIFFICULTY_LABELS.medium;
  const submitted = feedback !== null;

  function addStep() {
    setSteps(prev => [...prev, '']);
  }

  function removeStep(i: number) {
    setSteps(prev => prev.filter((_, idx) => idx !== i));
  }

  function updateStep(i: number, value: string) {
    setSteps(prev => prev.map((s, idx) => idx === i ? value : s));
  }

  async function handleSubmit() {
    setError(null);
    setGrading(true);
    try {
      const filledSteps = steps.filter(s => s.trim() !== '');
      const res = await apiFetch('/api/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: exercise.question,
          correctSteps: exercise.correctSteps,
          correctAnswer: exercise.correctAnswer,
          correctUnit: exercise.correctUnit,
          studentSteps: filledSteps,
          studentNumber: answerNumber.trim(),
          studentUnit: answerUnit.trim(),
        }),
      });
      const data = await res.json() as { success?: boolean; feedback?: GradeFeedback; error?: string };
      if (data.feedback) {
        setFeedback(data.feedback);
      } else {
        setError(data.error ?? 'Không thể chấm bài. Thử lại.');
      }
    } catch {
      setError('Lỗi kết nối. Vui lòng thử lại.');
    } finally {
      setGrading(false);
    }
  }

  const scoreColor = !feedback ? '' :
    feedback.score >= 8 ? 'from-grass-500 to-grass-600' :
    feedback.score >= 5 ? 'from-sun-400 to-sun-500' :
    'from-red-400 to-red-500';

  return (
    <div className="flex flex-col gap-5">
      {/* Question header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <span className="font-black text-grass-900 text-sm" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
          Câu {exerciseNumber} / {totalExercises}
        </span>
        <span className={`text-xs font-bold px-3 py-1 rounded-full border ${diff.color}`}>
          {diff.label}
        </span>
      </div>

      {/* Question */}
      <div className="bg-white rounded-3xl border-2 border-gray-100 p-5 shadow-sm">
        <p className="font-bold text-gray-800 text-base md:text-lg leading-relaxed whitespace-pre-line">
          {exercise.question}
        </p>

        {/* Hint toggle */}
        {exercise.hint && !submitted && (
          <div className="mt-4">
            <button
              onClick={() => setShowHint(v => !v)}
              className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
            >
              💡 {showHint ? 'Ẩn gợi ý' : 'Xem gợi ý'}
            </button>
            {showHint && (
              <div className="mt-2 bg-sky-50 border border-sky-200 rounded-xl p-3 text-sm text-sky-700 font-medium animate-fade-up">
                {exercise.hint}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input area */}
      {!submitted && (
        <div className="flex flex-col gap-4">
          {/* Steps */}
          <div>
            <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-3">
              ✏️ Lời giải của em (viết từng bước)
            </p>
            <div className="flex flex-col gap-2">
              {steps.map((step, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="shrink-0 w-7 h-7 rounded-full bg-tangerine-100 text-tangerine-700 text-xs font-black flex items-center justify-center">
                    {i + 1}
                  </span>
                  <input
                    type="text"
                    value={step}
                    onChange={e => updateStep(i, e.target.value)}
                    placeholder={`Bước ${i + 1}: ...`}
                    className="flex-1 rounded-xl border-2 border-gray-200 px-4 py-2.5 text-gray-800 font-medium text-sm focus:outline-none focus:border-tangerine-400 bg-white"
                  />
                  {steps.length > 1 && (
                    <button
                      onClick={() => removeStep(i)}
                      className="shrink-0 text-gray-300 hover:text-red-400 text-lg font-bold transition-colors"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={addStep}
              className="mt-2 text-xs font-bold text-tangerine-600 hover:text-tangerine-700 flex items-center gap-1"
            >
              + Thêm bước
            </button>
          </div>

          {/* Answer */}
          <div className="bg-sun-50 border-2 border-sun-200 rounded-2xl p-4">
            <p className="text-xs font-black text-sun-700 uppercase tracking-wider mb-3">
              📝 Kết quả (điền riêng số và đơn vị)
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-600">Kết quả:</span>
                <input
                  type="text"
                  value={answerNumber}
                  onChange={e => setAnswerNumber(e.target.value)}
                  placeholder="Số (vd: 5)"
                  className="w-28 rounded-xl border-2 border-sun-300 px-3 py-2 text-gray-800 font-black text-center focus:outline-none focus:border-sun-500 bg-white"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-600">Đơn vị:</span>
                <input
                  type="text"
                  value={answerUnit}
                  onChange={e => setAnswerUnit(e.target.value)}
                  placeholder="vd: kg"
                  className="w-24 rounded-xl border-2 border-sun-300 px-3 py-2 text-gray-800 font-bold text-center focus:outline-none focus:border-sun-500 bg-white"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600 font-medium">
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={grading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-br from-tangerine-500 to-tangerine-600 text-white font-black py-4 rounded-2xl hover:shadow-lg transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            {grading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Đang chấm bài...
              </>
            ) : (
              '📤 Nộp bài để chấm'
            )}
          </button>
        </div>
      )}

      {/* Feedback */}
      {submitted && feedback && (
        <div className="flex flex-col gap-4 animate-fade-up">
          {/* Score */}
          <div className="flex items-center gap-4 bg-white border-2 border-gray-100 rounded-3xl p-5 shadow-sm">
            <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${scoreColor} flex items-center justify-center shrink-0 shadow-md`}>
              <div className="text-center">
                <div className="text-2xl font-black text-white">{feedback.score}</div>
                <div className="text-white/70 text-xs font-bold">/10</div>
              </div>
            </div>
            <div>
              <p className="font-black text-gray-800 text-base">
                {feedback.answerCorrect ? '🌟 Đáp án đúng!' : '💡 Đáp án chưa đúng'}
              </p>
              <p className="text-gray-600 text-sm font-medium mt-1">{feedback.overallFeedback}</p>
            </div>
          </div>

          {/* Step feedback */}
          {feedback.stepFeedback.length > 0 && (
            <div className="bg-white border-2 border-gray-100 rounded-3xl p-5 shadow-sm">
              <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-3">
                Nhận xét từng bước
              </p>
              <div className="flex flex-col gap-3">
                {feedback.stepFeedback.map((sf, i) => (
                  <div key={i} className={`rounded-2xl p-3 border-2 ${sf.isCorrect ? 'bg-grass-50 border-grass-200' : 'bg-red-50 border-red-200'}`}>
                    <div className="flex items-start gap-2">
                      <span className={`shrink-0 w-6 h-6 rounded-full text-white text-xs font-black flex items-center justify-center mt-0.5 ${sf.isCorrect ? 'bg-grass-500' : 'bg-red-400'}`}>
                        {sf.isCorrect ? '✓' : '✗'}
                      </span>
                      <div>
                        <p className="text-sm font-bold text-gray-700">{sf.step}</p>
                        <p className={`text-xs font-medium mt-0.5 ${sf.isCorrect ? 'text-grass-600' : 'text-red-600'}`}>
                          {sf.comment}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Answer check */}
          <div className={`rounded-2xl p-4 border-2 ${feedback.answerCorrect ? 'bg-grass-50 border-grass-200' : 'bg-tangerine-50 border-tangerine-200'}`}>
            <p className="text-xs font-black uppercase tracking-wider mb-2 text-gray-500">Kiểm tra đáp án</p>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <span className="text-xs text-gray-500 font-bold">Em ghi: </span>
                <span className="font-black text-gray-800">
                  {answerNumber || '(trống)'} {answerUnit}
                </span>
              </div>
              <div>
                <span className="text-xs text-gray-500 font-bold">Đáp án đúng: </span>
                <span className="font-black text-grass-700">
                  {feedback.modelSolution.answer} {feedback.modelSolution.unit}
                </span>
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600 mt-2">{feedback.answerFeedback}</p>
          </div>

          {/* Model solution */}
          <div className="bg-violet-50 border-2 border-violet-200 rounded-3xl p-5">
            <p className="text-xs font-black text-violet-700 uppercase tracking-wider mb-3">
              📖 Lời giải mẫu
            </p>
            <div className="flex flex-col gap-2 mb-3">
              {feedback.modelSolution.steps.map((step, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-violet-500 text-white text-xs font-black flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-gray-700 font-medium text-sm">{step}</p>
                </div>
              ))}
            </div>
            <div className="bg-violet-100 rounded-xl p-3 border border-violet-200">
              <span className="text-sm font-black text-violet-800">
                Đáp số: {feedback.modelSolution.answer} {feedback.modelSolution.unit}
              </span>
            </div>
            {feedback.modelSolution.explanation && (
              <p className="text-xs text-violet-600 font-medium mt-2">{feedback.modelSolution.explanation}</p>
            )}
          </div>

          {/* Next button */}
          <button
            onClick={() => onNext(feedback.answerCorrect, feedback)}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-br from-grass-500 to-grass-600 text-white font-black py-3 rounded-2xl hover:shadow-lg transition-all hover:-translate-y-0.5 active:scale-95"
          >
            {exerciseNumber < totalExercises ? '🎯 Câu tiếp theo →' : '🏆 Hoàn thành bài tập!'}
          </button>
        </div>
      )}
    </div>
  );
}
