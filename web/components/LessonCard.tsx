'use client';
import Link from 'next/link';
import { useState } from 'react';
import { apiFetch } from '@/lib/apiFetch';

interface LessonCardProps {
  id: string;
  fileName: string;
  title: string;
  topics: string[];
  slideCount: number;
  exerciseCount: number;
  processed: boolean;
  processedAt: string | null;
  onProcessed?: (id: string) => void;
}

export default function LessonCard({
  id,
  fileName,
  title,
  topics,
  slideCount,
  exerciseCount,
  processed,
  onProcessed,
}: LessonCardProps) {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleProcess() {
    setProcessing(true);
    setError(null);
    try {
      const res = await apiFetch('/api/admin/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName }),
      });
      const data = await res.json() as { success?: boolean; error?: string };
      if (!res.ok || !data.success) {
        setError(data.error ?? 'Xử lý thất bại');
      } else {
        onProcessed?.(id);
      }
    } catch {
      setError('Không thể kết nối server');
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className={`relative rounded-3xl border-2 bg-white shadow-sm overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5 ${
      processed ? 'border-grass-200' : 'border-gray-200'
    }`}>
      {/* Status stripe */}
      <div className={`h-1.5 w-full ${processed ? 'bg-gradient-to-r from-grass-400 to-grass-500' : 'bg-gradient-to-r from-gray-200 to-gray-300'}`} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-black text-grass-900 text-base leading-snug line-clamp-2 mb-1" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
              {title}
            </h3>
            <p className="text-xs text-gray-400 truncate font-mono">{fileName}</p>
          </div>
          <span className={`shrink-0 text-xs font-bold px-2 py-1 rounded-lg ${
            processed
              ? 'bg-grass-100 text-grass-700'
              : 'bg-gray-100 text-gray-500'
          }`}>
            {processed ? '✅ Sẵn sàng' : '⏳ Chưa xử lý'}
          </span>
        </div>

        {/* Topics */}
        {topics.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {topics.slice(0, 3).map(topic => (
              <span key={topic} className="text-xs bg-sky-50 text-sky-700 border border-sky-200 px-2 py-0.5 rounded-full font-semibold">
                {topic}
              </span>
            ))}
          </div>
        )}

        {/* Stats row */}
        {processed && (
          <div className="flex gap-3 mb-4">
            <div className="flex items-center gap-1.5 text-sm text-grass-700 font-bold">
              <span className="text-base">📖</span>
              <span>{slideCount} slides</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-tangerine-600 font-bold">
              <span className="text-base">✏️</span>
              <span>{exerciseCount} bài tập</span>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl p-2">
            ⚠️ {error}
          </div>
        )}

        {/* Action buttons */}
        {processed ? (
          <div className="flex gap-2">
            <Link
              href={`/on-ly-thuyet/${id}`}
              className="flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-br from-grass-500 to-grass-600 text-white font-bold text-sm py-2.5 rounded-xl hover:shadow-md transition-all hover:-translate-y-0.5 active:scale-95"
            >
              📖 Ôn lý thuyết
            </Link>
            <Link
              href={`/bai-tap/${id}`}
              className="flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-br from-tangerine-500 to-tangerine-600 text-white font-bold text-sm py-2.5 rounded-xl hover:shadow-md transition-all hover:-translate-y-0.5 active:scale-95"
            >
              ✏️ Làm bài tập
            </Link>
          </div>
        ) : (
          <button
            onClick={handleProcess}
            disabled={processing}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-br from-violet-500 to-violet-600 text-white font-bold text-sm py-2.5 rounded-xl hover:shadow-md transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            {processing ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Đang xử lý...
              </>
            ) : (
              <>⚡ Xử lý bài này</>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
