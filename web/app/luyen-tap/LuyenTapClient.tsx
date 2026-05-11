'use client';
import { useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import QuizCard from '@/components/QuizCard';
import {
  generateQuestion,
  SAMPLE_QUESTIONS,
  TOPIC_LABELS,
  type Grade,
  type Topic,
  type QuizQuestion,
} from '@/lib/quizGenerator';
import clsx from 'clsx';

const GRADES: Grade[] = [1, 2, 3, 4, 5];
const TOPICS_LIST: { key: Topic; label: string; emoji: string }[] = [
  { key: 'addition', label: 'Phép Cộng', emoji: '➕' },
  { key: 'subtraction', label: 'Phép Trừ', emoji: '➖' },
  { key: 'multiplication', label: 'Phép Nhân', emoji: '✖️' },
  { key: 'division', label: 'Phép Chia', emoji: '➗' },
  { key: 'fraction', label: 'Phân Số', emoji: '½' },
  { key: 'geometry', label: 'Hình Học', emoji: '📐' },
  { key: 'word-problem', label: 'Lời Văn', emoji: '📖' },
];

const TOPIC_URL_MAP: Record<string, Topic> = {
  cong: 'addition',
  tru: 'subtraction',
  nhan: 'multiplication',
  chia: 'division',
  'phan-so': 'fraction',
  'hinh-hoc': 'geometry',
  'loi-van': 'word-problem',
};

interface Score {
  correct: number;
  total: number;
  streak: number;
  bestStreak: number;
}

export default function LuyenTapClient() {
  const searchParams = useSearchParams();
  const topicParam = searchParams.get('chu-de');
  const initialTopic = topicParam ? TOPIC_URL_MAP[topicParam] : undefined;

  const [grade, setGrade] = useState<Grade>(3);
  const [topic, setTopic] = useState<Topic | undefined>(initialTopic);
  const [question, setQuestion] = useState<QuizQuestion>(() => SAMPLE_QUESTIONS[0]);
  const [score, setScore] = useState<Score>({ correct: 0, total: 0, streak: 0, bestStreak: 0 });
  const [started, setStarted] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [sampleIdx] = useState(() => Math.floor(Math.random() * SAMPLE_QUESTIONS.length));

  const newQuestion = useCallback(() => {
    setQuestion(generateQuestion(grade, topic));
  }, [grade, topic]);

  function handleStart() {
    newQuestion();
    setStarted(true);
    setScore({ correct: 0, total: 0, streak: 0, bestStreak: 0 });
  }

  function handleCorrect() {
    setScore(s => {
      const newStreak = s.streak + 1;
      const newBest = Math.max(s.bestStreak, newStreak);
      if (newStreak > 0 && newStreak % 3 === 0) setShowCelebration(true);
      return { correct: s.correct + 1, total: s.total + 1, streak: newStreak, bestStreak: newBest };
    });
  }

  function handleWrong() {
    setScore(s => ({ ...s, total: s.total + 1, streak: 0 }));
  }

  function handleNext() {
    setShowCelebration(false);
    newQuestion();
  }

  const accuracy = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-black text-grass-800 mb-2" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
          🎯 Luyện Tập
        </h1>
        <p className="text-grass-500 font-medium">Chọn lớp và chủ đề để bắt đầu!</p>
      </div>

      {/* Settings */}
      <div className="card mb-6 animate-fade-up">
        <h2 className="font-black text-grass-700 mb-3 text-sm uppercase tracking-wide">Chọn Lớp</h2>
        <div className="flex gap-2 flex-wrap mb-5">
          {GRADES.map(g => (
            <button
              key={g}
              onClick={() => { setGrade(g); setStarted(false); }}
              className={clsx(
                'w-12 h-12 rounded-2xl font-black text-lg border-2 transition-all',
                grade === g
                  ? 'bg-grass-500 text-white border-grass-500 shadow-md scale-110'
                  : 'bg-white text-grass-600 border-grass-200 hover:border-grass-400'
              )}
            >
              {g}
            </button>
          ))}
        </div>

        <h2 className="font-black text-grass-700 mb-3 text-sm uppercase tracking-wide">Chủ Đề</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            onClick={() => { setTopic(undefined); setStarted(false); }}
            className={clsx(
              'py-2 px-3 rounded-xl font-bold text-sm border-2 transition-all',
              !topic ? 'bg-grass-500 text-white border-grass-500 shadow-md' : 'bg-white text-grass-600 border-grass-200 hover:border-grass-400'
            )}
          >
            🎲 Ngẫu nhiên
          </button>
          {TOPICS_LIST.map(t => (
            <button
              key={t.key}
              onClick={() => { setTopic(t.key); setStarted(false); }}
              className={clsx(
                'py-2 px-3 rounded-xl font-bold text-sm border-2 transition-all',
                topic === t.key ? 'bg-grass-500 text-white border-grass-500 shadow-md' : 'bg-white text-grass-600 border-grass-200 hover:border-grass-400'
              )}
            >
              {t.emoji} {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Score bar */}
      {started && (
        <div className="card mb-6 animate-fade-up">
          <div className="grid grid-cols-4 gap-3 text-center">
            <div>
              <div className="text-2xl font-black text-grass-700">{score.correct}</div>
              <div className="text-xs text-grass-400 font-bold">Đúng</div>
            </div>
            <div>
              <div className="text-2xl font-black text-rose-500">{score.total - score.correct}</div>
              <div className="text-xs text-grass-400 font-bold">Sai</div>
            </div>
            <div>
              <div className="text-2xl font-black text-sun-600">{accuracy}%</div>
              <div className="text-xs text-grass-400 font-bold">Chính xác</div>
            </div>
            <div>
              <div className="text-2xl font-black text-tangerine-600">
                {score.streak > 0 ? `🔥${score.streak}` : score.bestStreak > 0 ? `⭐${score.bestStreak}` : '0'}
              </div>
              <div className="text-xs text-grass-400 font-bold">{score.streak > 0 ? 'Liên tiếp' : 'Kỷ lục'}</div>
            </div>
          </div>
        </div>
      )}

      {/* Celebration */}
      {showCelebration && (
        <div className="card mb-6 bg-gradient-to-r from-sun-400 to-tangerine-500 text-white text-center py-6 animate-scale-in border-0 shadow-xl">
          <div className="text-5xl mb-2">🎉🌟🎊</div>
          <p className="text-2xl font-black">Tuyệt vời! Chuỗi {score.streak} câu đúng!</p>
          <p className="text-white/80 font-medium mt-1">Giỏi lắm, tiếp tục cố gắng nhé!</p>
        </div>
      )}

      {/* Question or Start */}
      {!started ? (
        <div className="card text-center py-10 animate-fade-up">
          <div className="text-7xl mb-4 animate-bounce-slow">🎯</div>
          <h2 className="text-2xl font-black text-grass-800 mb-2">Sẵn sàng chưa?</h2>
          <p className="text-grass-500 font-medium mb-6">
            Lớp {grade} • {topic ? TOPIC_LABELS[topic] : 'Chủ đề ngẫu nhiên'}
          </p>
          <button onClick={handleStart} className="btn-primary text-xl px-10 py-4">
            🚀 Bắt Đầu!
          </button>
          <div className="mt-8 pt-6 border-t border-grass-100">
            <p className="text-sm font-bold text-grass-400 mb-4">Bài mẫu — thử ngay:</p>
            <div className="text-left">
              <QuizCard question={SAMPLE_QUESTIONS[sampleIdx]} />
            </div>
          </div>
        </div>
      ) : (
        <QuizCard
          question={question}
          onCorrect={handleCorrect}
          onWrong={handleWrong}
          onNext={handleNext}
        />
      )}

      {/* Stats summary after 10 questions */}
      {started && score.total >= 10 && score.total % 5 === 0 && (
        <div className={clsx(
          'card mt-6 text-center animate-fade-up border-2',
          accuracy >= 80 ? 'border-grass-300 bg-grass-50' : accuracy >= 60 ? 'border-sun-300 bg-sun-50' : 'border-rose-300 bg-rose-50'
        )}>
          <div className="text-5xl mb-2">
            {accuracy >= 80 ? '🏆' : accuracy >= 60 ? '📈' : '💪'}
          </div>
          <p className="font-black text-grass-800 text-lg">
            {score.total} câu hoàn thành!
          </p>
          <p className="text-grass-600 font-medium">
            Điểm: {score.correct}/{score.total} ({accuracy}%)
          </p>
          <button onClick={handleStart} className="btn-primary mt-4">
            🔄 Làm tiếp
          </button>
        </div>
      )}
    </div>
  );
}
