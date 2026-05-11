'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import SlideCard from '@/components/SlideCard';
import MiniGameBlock from '@/components/MiniGameBlock';
import type { LessonData } from '@/lib/lessonTypes';
import { apiFetch } from '@/lib/apiFetch';

type SlideState = 'viewing' | 'mini-game' | 'complete';

export default function OnLyThuyetPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slideState, setSlideState] = useState<SlideState>('viewing');

  useEffect(() => {
    apiFetch(`/api/lessons/${id}`)
      .then(r => r.json())
      .then((data: LessonData & { error?: string }) => {
        if (data.error) { setError(data.error); }
        else { setLesson(data); }
        setLoading(false);
      })
      .catch(() => { setError('Không thể tải dữ liệu bài học'); setLoading(false); });
  }, [id]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (slideState !== 'viewing') return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goNext();
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') goPrev();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slideState, currentSlide, lesson]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center animate-fade-up">
          <div className="text-5xl animate-bounce mb-4">📖</div>
          <p className="font-black text-grass-700 text-xl" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
            Đang tải bài học...
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
          <h2 className="text-xl font-black text-grass-800 mb-3">Không thể tải bài học</h2>
          <p className="text-gray-600 font-medium mb-5">{error ?? 'Bài học chưa được xử lý.'}</p>
          <Link href="/" className="btn-primary inline-block">← Về trang chủ</Link>
        </div>
      </div>
    );
  }

  const slide = lesson.slides[currentSlide];
  const isLast = currentSlide === lesson.slides.length - 1;
  const progress = ((currentSlide + 1) / lesson.slides.length) * 100;

  function goNext() {
    if (!lesson) return;
    if (currentSlide < lesson.slides.length - 1) {
      setCurrentSlide(c => c + 1);
      setSlideState('viewing');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function goPrev() {
    if (currentSlide > 0) {
      setCurrentSlide(c => c - 1);
      setSlideState('viewing');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function handleNextClick() {
    if (slide.miniGame && slideState === 'viewing') {
      setSlideState('mini-game');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (isLast) {
      setSlideState('complete');
    } else {
      goNext();
    }
  }

  function handleMiniGameComplete() {
    if (isLast) {
      setSlideState('complete');
    } else {
      goNext();
    }
  }

  // Complete screen
  if (slideState === 'complete') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-8">
        <div className="max-w-md w-full text-center animate-scale-in">
          <div className="card border-2 border-grass-300 shadow-xl">
            <div className="text-7xl mb-4 animate-bounce">🎉</div>
            <h2 className="text-3xl font-black text-grass-800 mb-2" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
              Hoàn thành!
            </h2>
            <p className="text-grass-600 font-semibold mb-1">Bạn đã ôn xong lý thuyết</p>
            <p className="text-grass-800 font-black text-lg mb-6">"{lesson.title}"</p>
            <div className="flex flex-col gap-3">
              <Link
                href={`/bai-tap/${id}`}
                className="flex items-center justify-center gap-2 bg-gradient-to-br from-tangerine-500 to-tangerine-600 text-white font-black py-4 rounded-2xl hover:shadow-lg transition-all hover:-translate-y-0.5 active:scale-95 text-lg"
              >
                ✏️ Làm bài tập ngay!
              </Link>
              <Link
                href="/"
                className="flex items-center justify-center gap-2 bg-grass-100 text-grass-700 font-bold py-3 rounded-2xl hover:bg-grass-200 transition-all"
              >
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
      {/* Fixed header — sits below the site Navbar (top-16) */}
      <div className="sticky top-16 z-20 bg-white/95 backdrop-blur-sm border-b border-grass-100 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <Link
              href="/"
              className="shrink-0 text-gray-400 hover:text-grass-600 transition-colors text-sm font-bold flex items-center gap-1"
            >
              ✕ Thoát
            </Link>
            <div className="flex-1 min-w-0 text-center">
              <p className="font-black text-grass-800 text-sm truncate" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
                {lesson.title}
              </p>
              <p className="text-xs text-gray-400 font-medium">
                Slide {currentSlide + 1} / {lesson.slides.length}
              </p>
            </div>
            <div className="shrink-0 text-xs font-bold text-grass-600 bg-grass-100 px-3 py-1 rounded-full">
              📖 Lý thuyết
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-grass-400 to-grass-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        {slideState === 'viewing' && (
          <div className="animate-fade-up">
            <SlideCard
              slide={slide}
              slideNumber={currentSlide + 1}
              totalSlides={lesson.slides.length}
            />
          </div>
        )}

        {slideState === 'mini-game' && slide.miniGame && (
          <div className="animate-fade-up">
            <MiniGameBlock
              game={slide.miniGame}
              onComplete={handleMiniGameComplete}
            />
          </div>
        )}

        {/* Navigation */}
        {slideState === 'viewing' && (
          <div className="flex items-center justify-between mt-10 gap-3">
            <button
              onClick={goPrev}
              disabled={currentSlide === 0}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl border-2 border-grass-200 text-grass-700 font-bold text-sm hover:bg-grass-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ← Trước
            </button>

            {/* Slide dots */}
            <div className="flex gap-1.5 flex-wrap justify-center">
              {lesson.slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setCurrentSlide(i); setSlideState('viewing'); }}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    i === currentSlide
                      ? 'bg-grass-500 scale-125'
                      : i < currentSlide
                      ? 'bg-grass-300'
                      : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={handleNextClick}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-br from-grass-500 to-grass-600 text-white font-bold text-sm hover:shadow-lg transition-all hover:-translate-y-0.5 active:scale-95"
            >
              {slide.miniGame
                ? '🎮 Chơi mini-game'
                : isLast
                ? '🎉 Hoàn thành!'
                : 'Tiếp →'}
            </button>
          </div>
        )}

        {/* Keyboard hint */}
        {slideState === 'viewing' && (
          <p className="text-center text-xs text-gray-300 font-medium mt-6 hidden md:block">
            Dùng phím ← → để chuyển slide
          </p>
        )}
      </div>
    </div>
  );
}
