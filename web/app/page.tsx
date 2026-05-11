'use client';
import { useEffect, useState, useCallback } from 'react';
import LessonCard from '@/components/LessonCard';
import { apiFetch } from '@/lib/apiFetch';

interface LessonSummary {
  id: string;
  fileName: string;
  title: string;
  topics: string[];
  slideCount: number;
  exerciseCount: number;
  processed: boolean;
  processedAt: string | null;
}

export default function HomePage() {
  const [lessons, setLessons] = useState<LessonSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingAll, setProcessingAll] = useState(false);
  const [processLog, setProcessLog] = useState<string[]>([]);

  const fetchLessons = useCallback(async () => {
    try {
      const res = await apiFetch('/api/lessons');
      const data = await res.json() as { lessons: LessonSummary[] };
      setLessons(data.lessons ?? []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLessons(); }, [fetchLessons]);

  function handleLessonProcessed(id: string) {
    // Refresh that single lesson by refetching all
    fetchLessons();
  }

  async function handleProcessAll() {
    const pending = lessons.filter(l => !l.processed);
    if (pending.length === 0) return;

    setProcessingAll(true);
    setProcessLog([]);

    for (const lesson of pending) {
      setProcessLog(prev => [...prev, `⏳ Đang xử lý: ${lesson.fileName}...`]);
      try {
        const res = await apiFetch('/api/admin/process', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileName: lesson.fileName }),
        });
        const data = await res.json() as { success?: boolean; error?: string; lesson?: { title: string } };
        if (data.success) {
          setProcessLog(prev => [...prev.slice(0, -1), `✅ Xong: ${data.lesson?.title ?? lesson.fileName}`]);
        } else {
          setProcessLog(prev => [...prev.slice(0, -1), `❌ Lỗi: ${data.error ?? 'Unknown error'}`]);
        }
      } catch {
        setProcessLog(prev => [...prev.slice(0, -1), `❌ Lỗi kết nối khi xử lý: ${lesson.fileName}`]);
      }
    }

    setProcessingAll(false);
    fetchLessons();
  }

  const processed = lessons.filter(l => l.processed).length;
  const pending = lessons.length - processed;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Hero */}
      <section className="relative rounded-4xl overflow-hidden mb-10 bg-gradient-to-br from-grass-500 via-grass-600 to-grass-700 p-8 md:p-12 text-white shadow-2xl">
        <div className="relative z-10">
          <div className="text-5xl mb-4 animate-float inline-block">🧮</div>
          <h1 className="text-4xl md:text-5xl font-black mb-3 leading-tight" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
            Ôn luyện Toán lớp 5<br />
            <span className="text-sun-300">Chuẩn bị thi vào lớp 6 🎯</span>
          </h1>
          <p className="text-grass-100 text-base md:text-lg font-semibold mb-6 max-w-lg">
            {lessons.length} đề thi và tài liệu ôn luyện từ các trường THCS hàng đầu Hà Nội.
            Học từng bài, ôn lý thuyết và làm bài tập tương tác!
          </p>

          {/* Stats pills */}
          <div className="flex flex-wrap gap-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-2 flex items-center gap-2">
              <span className="text-lg">📚</span>
              <span className="font-black text-sm">{lessons.length} bài học</span>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-2 flex items-center gap-2">
              <span className="text-lg">✅</span>
              <span className="font-black text-sm">{processed} đã xử lý</span>
            </div>
            {pending > 0 && (
              <div className="bg-sun-400/40 backdrop-blur-sm rounded-2xl px-4 py-2 flex items-center gap-2">
                <span className="text-lg">⏳</span>
                <span className="font-black text-sm">{pending} chờ xử lý</span>
              </div>
            )}
          </div>
        </div>

        {/* Decorative */}
        <div className="absolute top-6 right-10 w-28 h-28 rounded-full bg-white/10 animate-float" style={{ animationDelay: '0.5s' }} />
        <div className="absolute bottom-6 right-36 w-16 h-16 rounded-full bg-white/10 animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute top-14 right-52 w-12 h-12 rounded-full bg-sun-400/30 animate-float" style={{ animationDelay: '1.5s' }} />
        <div className="absolute bottom-10 right-16 text-6xl opacity-15 select-none">📐</div>
        <div className="absolute top-10 right-28 text-5xl opacity-15 select-none">🔢</div>
      </section>

      {/* Process All Action */}
      {!loading && pending > 0 && (
        <section className="mb-8">
          <div className="bg-gradient-to-br from-violet-50 to-violet-100 border-2 border-violet-200 rounded-3xl p-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-black text-violet-900 text-lg" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
                  ⚡ Chưa có {pending} bài học nào được xử lý
                </h3>
                <p className="text-violet-600 text-sm font-medium mt-1">
                  Cần cài GEMINI_API_KEY trong .env.local và chạy xử lý để tạo nội dung học tập.
                </p>
              </div>
              <button
                onClick={handleProcessAll}
                disabled={processingAll}
                className="shrink-0 flex items-center gap-2 bg-gradient-to-br from-violet-500 to-violet-700 text-white font-black px-6 py-3 rounded-2xl hover:shadow-lg transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {processingAll ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Đang xử lý tất cả...
                  </>
                ) : (
                  <>⚡ Xử lý tất cả ({pending} bài)</>
                )}
              </button>
            </div>

            {/* Process log */}
            {processLog.length > 0 && (
              <div className="mt-4 bg-white/60 rounded-2xl p-4 max-h-40 overflow-y-auto">
                <p className="text-xs font-black text-violet-700 uppercase tracking-wider mb-2">Nhật ký xử lý:</p>
                {processLog.map((line, i) => (
                  <p key={i} className="text-sm font-medium text-gray-700 font-mono">{line}</p>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Section: Processed Lessons */}
      {!loading && processed > 0 && (
        <section className="mb-10">
          <h2 className="text-2xl font-black text-grass-800 mb-5" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
            📖 Sẵn sàng học ({processed} bài)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {lessons
              .filter(l => l.processed)
              .map((lesson, i) => (
                <div
                  key={lesson.id}
                  className="animate-fade-up"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <LessonCard {...lesson} onProcessed={handleLessonProcessed} />
                </div>
              ))}
          </div>
        </section>
      )}

      {/* Section: Pending Lessons */}
      {!loading && pending > 0 && (
        <section className="mb-10">
          <h2 className="text-2xl font-black text-grass-800 mb-5" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
            ⏳ Chưa xử lý ({pending} bài)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {lessons
              .filter(l => !l.processed)
              .map((lesson, i) => (
                <div
                  key={lesson.id}
                  className="animate-fade-up"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <LessonCard {...lesson} onProcessed={handleLessonProcessed} />
                </div>
              ))}
          </div>
        </section>
      )}

      {/* Loading state */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-3xl border-2 border-gray-100 bg-white p-5 animate-pulse">
              <div className="h-1.5 bg-gray-100 rounded-full mb-4" />
              <div className="h-5 bg-gray-100 rounded-xl w-3/4 mb-2" />
              <div className="h-3 bg-gray-50 rounded-lg w-1/2 mb-4" />
              <div className="flex gap-2 mt-4">
                <div className="h-10 bg-grass-50 rounded-xl flex-1" />
                <div className="h-10 bg-tangerine-50 rounded-xl flex-1" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && lessons.length === 0 && (
        <div className="card border-2 border-dashed border-grass-300 bg-grass-50/50 text-center py-16 animate-fade-up">
          <div className="text-6xl mb-4">📂</div>
          <h3 className="text-2xl font-black text-grass-700 mb-3">Không tìm thấy file PDF nào</h3>
          <p className="text-grass-500 font-medium">
            Đặt các file PDF vào thư mục{' '}
            <code className="bg-grass-100 px-2 py-0.5 rounded-lg text-grass-700 font-mono text-sm">
              /content/
            </code>
          </p>
        </div>
      )}
    </div>
  );
}
