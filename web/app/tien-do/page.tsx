'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import StudentEntry from '@/components/StudentEntry';
import { apiFetch } from '@/lib/apiFetch';

interface Session {
  id: string;
  session_date: string;
  problems_attempted: number;
  problems_correct: number;
  lessons: { title: string } | null;
  lesson_id: string;
}

interface StudentData {
  student: { id: string; name: string; created_at: string };
  sessions: Session[];
  noDb?: boolean;
}

export default function TienDoPage() {
  const [studentName, setStudentName] = useState<string | null>(null);
  const [data, setData] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('studentName');
    if (saved) {
      setStudentName(saved);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchProgress = useCallback(async (name: string) => {
    setLoading(true);
    try {
      const res = await apiFetch(`/api/students?name=${encodeURIComponent(name)}`);
      const json = await res.json() as StudentData;
      setData(json);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (studentName) fetchProgress(studentName);
  }, [studentName, fetchProgress]);

  function handleEnter(name: string) {
    setStudentName(name);
  }

  function handleChangeName() {
    localStorage.removeItem('studentName');
    setStudentName(null);
    setData(null);
    setLoading(false);
  }

  if (!studentName && !loading) {
    return <StudentEntry onEnter={handleEnter} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center animate-fade-up">
          <div className="text-5xl animate-bounce mb-4">⭐</div>
          <p className="font-black text-grass-700 text-xl">Đang tải tiến độ...</p>
        </div>
      </div>
    );
  }

  const sessions = data?.sessions ?? [];
  const totalAttempted = sessions.reduce((s, d) => s + d.problems_attempted, 0);
  const totalCorrect = sessions.reduce((s, d) => s + d.problems_correct, 0);
  const pct = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;

  // Group by date for chart
  const byDate = sessions.reduce<Record<string, { attempted: number; correct: number }>>((acc, s) => {
    const d = s.session_date;
    if (!acc[d]) acc[d] = { attempted: 0, correct: 0 };
    acc[d].attempted += s.problems_attempted;
    acc[d].correct += s.problems_correct;
    return acc;
  }, {});

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('vi-VN', { weekday: 'short' }).replace('Th ', 'T');
    return { key, dayName, ...( byDate[key] ?? { attempted: 0, correct: 0 }) };
  });
  const maxDay = Math.max(...last7.map(d => d.attempted), 1);

  // Progress vs yesterday
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const todayData = byDate[today];
  const yesterdayData = byDate[yesterday];
  const improving = todayData && yesterdayData
    ? (todayData.correct / Math.max(todayData.attempted, 1)) > (yesterdayData.correct / Math.max(yesterdayData.attempted, 1))
    : null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-4xl font-black text-grass-800 mb-1" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
            ⭐ Tiến Độ Học Tập
          </h1>
          <div className="flex items-center gap-2">
            <p className="text-grass-600 font-bold">Xin chào, {studentName}!</p>
            <button
              onClick={handleChangeName}
              className="text-xs text-gray-400 hover:text-gray-600 underline font-medium"
            >
              (đổi tên)
            </button>
          </div>
        </div>
        {data?.noDb && (
          <div className="bg-sun-50 border border-sun-200 rounded-2xl px-4 py-2 text-xs text-sun-700 font-bold">
            ⚠️ Chưa kết nối Supabase — kết quả chưa được lưu
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Câu đã làm', value: totalAttempted, emoji: '📝', bg: 'bg-sky-50 border-sky-200', text: 'text-sky-700' },
          { label: 'Câu đúng', value: totalCorrect, emoji: '✅', bg: 'bg-grass-50 border-grass-200', text: 'text-grass-700' },
          { label: '% Đúng', value: `${pct}%`, emoji: '🎯', bg: 'bg-tangerine-50 border-tangerine-200', text: 'text-tangerine-700' },
          { label: 'Ngày học', value: Object.keys(byDate).length, emoji: '📅', bg: 'bg-violet-50 border-violet-200', text: 'text-violet-700' },
        ].map((s, i) => (
          <div key={s.label} className={`card border-2 ${s.bg} text-center animate-fade-up stagger-${i + 1}`}>
            <div className="text-3xl mb-1">{s.emoji}</div>
            <div className={`text-3xl font-black ${s.text}`}>{s.value}</div>
            <div className="text-xs font-bold text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Progress vs yesterday */}
      {improving !== null && (
        <div className={`card border-2 mb-6 animate-fade-up flex items-center gap-3 ${improving ? 'border-grass-200 bg-grass-50' : 'border-tangerine-200 bg-tangerine-50'}`}>
          <span className="text-3xl">{improving ? '📈' : '📉'}</span>
          <p className={`font-black text-base ${improving ? 'text-grass-700' : 'text-tangerine-700'}`}>
            {improving
              ? 'Hôm nay em tiến bộ hơn hôm qua! Tiếp tục phát huy nhé!'
              : 'Hôm qua em làm tốt hơn — hãy cố gắng hơn hôm nay!'}
          </p>
        </div>
      )}

      {/* 7-day chart */}
      <div className="card mb-6 animate-fade-up">
        <h3 className="text-lg font-black text-grass-800 mb-5">📅 7 Ngày Gần Nhất</h3>
        <div className="flex items-end gap-2 h-36">
          {last7.map(d => (
            <div key={d.key} className="flex-1 flex flex-col items-center gap-1">
              <div className="text-xs font-bold text-gray-400">
                {d.attempted > 0 ? d.attempted : ''}
              </div>
              <div
                className="w-full rounded-t-xl transition-all duration-700 relative group"
                style={{
                  height: `${(d.attempted / maxDay) * 100}%`,
                  minHeight: d.attempted > 0 ? '8px' : '2px',
                  background: d.attempted > 0
                    ? `linear-gradient(to top, #16a34a, #4ade80)`
                    : '#e5e7eb',
                }}
              >
                {d.attempted > 0 && (
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-grass-800 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    {d.correct}/{d.attempted} đúng
                  </div>
                )}
              </div>
              <div className="text-xs font-bold text-gray-500">{d.dayName}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Session history */}
      {sessions.length > 0 ? (
        <div className="card animate-fade-up">
          <h3 className="text-lg font-black text-grass-800 mb-4">📋 Lịch Sử Học</h3>
          <div className="flex flex-col gap-3">
            {sessions.slice(0, 20).map(s => {
              const sessionPct = s.problems_attempted > 0
                ? Math.round((s.problems_correct / s.problems_attempted) * 100)
                : 0;
              const dateStr = new Date(s.session_date).toLocaleDateString('vi-VN', {
                day: '2-digit', month: '2-digit', year: 'numeric',
              });
              return (
                <div key={s.id} className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-100">
                  <div className="min-w-0">
                    <p className="font-bold text-gray-800 text-sm truncate">
                      {s.lessons?.title ?? s.lesson_id}
                    </p>
                    <p className="text-xs text-gray-400 font-medium">{dateStr}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-bold text-gray-600">
                      {s.problems_correct}/{s.problems_attempted}
                    </span>
                    <span className={`text-xs font-black px-2 py-1 rounded-full ${
                      sessionPct >= 80 ? 'bg-grass-100 text-grass-700'
                      : sessionPct >= 50 ? 'bg-sun-100 text-sun-700'
                      : 'bg-red-100 text-red-600'
                    }`}>
                      {sessionPct}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="card border-2 border-dashed border-grass-300 bg-grass-50/50 text-center py-12 animate-fade-up">
          <div className="text-6xl mb-4">🌱</div>
          <h2 className="text-2xl font-black text-grass-700 mb-2">Chưa có bài nào!</h2>
          <p className="text-grass-500 font-medium mb-5">
            Làm bài tập để thấy tiến độ học tập của em ở đây.
          </p>
          <Link href="/" className="btn-primary inline-flex items-center gap-2">
            🎯 Bắt đầu học ngay
          </Link>
        </div>
      )}
    </div>
  );
}
