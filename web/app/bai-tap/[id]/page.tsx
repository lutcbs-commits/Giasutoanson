'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ExerciseBlock from '@/components/ExerciseBlock';
import IELTSExerciseBlock from '@/components/IELTSExerciseBlock';
import StudentEntry from '@/components/StudentEntry';
import type { LessonData, GradeFeedback, IELTSGradeFeedback } from '@/lib/lessonTypes';
import { apiFetch } from '@/lib/apiFetch';
import { useTabLock } from '@/lib/useTabLock';

export default function BaiTapPage() {
  const params = useParams();
  const id = params.id as string;

  const { isLocked } = useTabLock(id);
  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [studentName, setStudentName] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('studentName');
    if (saved) setStudentName(saved);
  }, []);

  useEffect(() => {
    apiFetch(`/api/lessons/${id}`)
      .then(r => r.json())
      .then((data: LessonData & { error?: string }) => {
        if (data.error) setError(data.error);
        else setLesson(data);
        setLoading(false);
      })
      .catch(() => { setError('Không thể tải dữ liệu bài học'); setLoading(false); });
  }, [id]);

  const saveSubmission = useCallback(async (
    exerciseId: number,
    exerciseQuestion: string,
    isCorrect: boolean,
    score: number,
    feedback: GradeFeedback | IELTSGradeFeedback,
  ) => {
    if (!studentName) return;
    try {
      await apiFetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName,
          lessonId: id,
          exerciseId,
          exerciseQuestion,
          answerSteps: [],
          answerNumber: '',
          answerUnit: '',
          isCorrect,
          score,
          feedback,
        }),
      });
    } catch {
      // silent — không block trải nghiệm
    }
  }, [studentName, id]);

  const isIELTS = lesson?.ieltsExercises && lesson.ieltsExercises.length > 0;
  const exercises = isIELTS ? (lesson?.ieltsExercises ?? []) : (lesson?.exercises ?? []);
  const total = exercises.length;

  function handleNextMath(correct: boolean, feedback: GradeFeedback | null) {
    if (!lesson) return;
    if (correct) setCorrectCount(c => c + 1);
    const ex = lesson.exercises[currentIndex];
    if (feedback && ex) {
      saveSubmission(ex.id, ex.question, correct, feedback.score, feedback);
    }
    if (currentIndex + 1 >= total) setDone(true);
    else { setCurrentIndex(i => i + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  }

  function handleNextIELTS(correct: boolean, feedback: IELTSGradeFeedback | null) {
    if (!lesson) return;
    if (correct) setCorrectCount(c => c + 1);
    const ex = lesson.ieltsExercises![currentIndex];
    if (feedback && ex) {
      saveSubmission(ex.id, ex.title ?? '', correct, feedback.overallBand, feedback);
    }
    if (currentIndex + 1 >= total) setDone(true);
    else { setCurrentIndex(i => i + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  }

  function handleRestart() {
    setCurrentIndex(0); setCorrectCount(0); setDone(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (!studentName) return <StudentEntry onEnter={name => setStudentName(name)} />;

  if (isLocked) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center animate-fade-up">
          <div className="card border-2 border-red-200 shadow-xl">
            <div className="text-6xl mb-4">🚫</div>
            <h2 className="text-xl font-black text-red-700 mb-3" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
              Bài tập đang mở ở tab khác!
            </h2>
            <p className="text-gray-600 font-medium mb-2">Em đang mở bài tập này ở một tab khác trên trình duyệt.</p>
            <p className="text-gray-500 text-sm font-medium mb-6">Vui lòng đóng tab kia rồi tải lại trang này để tiếp tục.</p>
            <button onClick={() => window.location.reload()}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-br from-tangerine-500 to-tangerine-600 text-white font-black py-3 rounded-2xl hover:shadow-lg transition-all hover:-translate-y-0.5">
              🔄 Tải lại trang
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center animate-fade-up">
          <div className="text-5xl animate-bounce mb-4">{isIELTS ? '🌏' : '✏️'}</div>
          <p className="font-black text-tangerine-700 text-xl" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
            Đang tải bài tập...
          </p>
        </div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="card text-center max-w-md animate-fade-up">
          <div className="text-5xl mb-4">😓</div>
          <h2 className="text-xl font-black text-grass-800 mb-3">Không thể tải bài tập</h2>
          <p className="text-gray-600 font-medium mb-5">{error ?? 'Bài học chưa được xử lý.'}</p>
          <Link href="/" className="btn-primary inline-block">← Về trang chủ</Link>
        </div>
      </div>
    );
  }

  const progress = done ? 100 : total > 0 ? (currentIndex / total) * 100 : 0;

  if (done) {
    const percentage = Math.round((correctCount / total) * 100);
    let emoji = '😢', message = 'Cần cố gắng thêm nhé!', colorClass = 'from-red-500 to-red-600';
    if (percentage >= 90) { emoji = '🏆'; message = 'Xuất sắc! Bạn thật tuyệt vời!'; colorClass = 'from-sun-400 to-sun-500'; }
    else if (percentage >= 70) { emoji = '🌟'; message = 'Giỏi lắm! Gần đạt điểm tối đa!'; colorClass = 'from-grass-500 to-grass-600'; }
    else if (percentage >= 50) { emoji = '💪'; message = 'Ổn đó! Hãy xem lại lý thuyết nhé!'; colorClass = 'from-sky-500 to-sky-600'; }

    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-8">
        <div className="max-w-sm w-full animate-scale-in">
          <div className="card border-2 border-gray-100 shadow-xl text-center">
            <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${colorClass} flex items-center justify-center mx-auto mb-5 shadow-lg`}>
              <div>
                <div className="text-3xl font-black text-white">{percentage}%</div>
                <div className="text-white/80 text-xs font-bold">{correctCount}/{total}</div>
              </div>
            </div>
            <div className="text-5xl mb-3">{emoji}</div>
            <h2 className="text-2xl font-black text-grass-900 mb-1" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
              {studentName}
            </h2>
            <p className="text-gray-600 font-semibold mb-1">{message}</p>
            <p className="text-grass-800 font-bold text-sm mb-6 line-clamp-2">"{lesson.title}"</p>

            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-grass-50 rounded-2xl p-3 border border-grass-200">
                <div className="text-2xl font-black text-grass-700">{correctCount}</div>
                <div className="text-xs text-grass-600 font-bold">Đúng</div>
              </div>
              <div className="bg-red-50 rounded-2xl p-3 border border-red-200">
                <div className="text-2xl font-black text-red-600">{total - correctCount}</div>
                <div className="text-xs text-red-500 font-bold">Sai</div>
              </div>
              <div className="bg-gray-50 rounded-2xl p-3 border border-gray-200">
                <div className="text-2xl font-black text-gray-700">{total}</div>
                <div className="text-xs text-gray-500 font-bold">Tổng</div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Link href="/tien-do"
                className="flex items-center justify-center gap-2 bg-gradient-to-br from-grass-500 to-grass-600 text-white font-black py-3 rounded-2xl hover:shadow-lg transition-all hover:-translate-y-0.5">
                ⭐ Xem tiến độ học tập
              </Link>
              <button onClick={handleRestart}
                className="flex items-center justify-center gap-2 bg-gradient-to-br from-tangerine-500 to-tangerine-600 text-white font-black py-3 rounded-2xl hover:shadow-lg transition-all hover:-translate-y-0.5">
                🔄 Làm lại bài tập
              </button>
              <Link href={`/on-ly-thuyet/${id}`}
                className="flex items-center justify-center gap-2 bg-violet-100 text-violet-700 font-bold py-3 rounded-2xl hover:bg-violet-200 transition-all">
                📖 Ôn lại lý thuyết
              </Link>
              <Link href="/" className="flex items-center justify-center gap-2 bg-gray-100 text-gray-600 font-bold py-3 rounded-2xl hover:bg-gray-200 transition-all">
                ← Về trang chủ
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="sticky top-16 z-20 bg-white/95 backdrop-blur-sm border-b border-tangerine-100 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <Link href="/" className="shrink-0 text-gray-400 hover:text-tangerine-600 transition-colors text-sm font-bold">✕ Thoát</Link>
            <div className="flex-1 min-w-0 text-center">
              <p className="font-black text-tangerine-800 text-sm truncate" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
                {lesson.title}
              </p>
              <p className="text-xs text-gray-400 font-medium">
                {isIELTS ? `${lesson.ieltsMeta?.skill?.toUpperCase() ?? 'IELTS'} ·` : ''} Câu {currentIndex + 1}/{total} · {studentName}
              </p>
            </div>
            <div className="shrink-0 text-xs font-bold text-tangerine-700 bg-tangerine-100 px-3 py-1 rounded-full">
              {isIELTS ? '🌏 IELTS' : '✏️ Bài tập'}
            </div>
          </div>
          <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-tangerine-400 to-tangerine-500 rounded-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex items-center justify-center gap-3 mt-2 text-xs font-bold">
            <span className="text-grass-600">✅ {correctCount} đúng</span>
            <span className="text-gray-300">•</span>
            <span className="text-red-500">❌ {currentIndex - correctCount} sai</span>
            <span className="text-gray-300">•</span>
            <span className="text-gray-400">📝 {total - currentIndex} còn lại</span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="animate-fade-up" key={currentIndex}>
          {isIELTS ? (
            <IELTSExerciseBlock
              exercise={lesson.ieltsExercises![currentIndex]}
              exerciseNumber={currentIndex + 1}
              totalExercises={total}
              onNext={handleNextIELTS}
            />
          ) : (
            <ExerciseBlock
              exercise={lesson.exercises[currentIndex]}
              exerciseNumber={currentIndex + 1}
              totalExercises={total}
              onNext={handleNextMath}
              subject={lesson.subject}
            />
          )}
        </div>
      </div>
    </div>
  );
}
