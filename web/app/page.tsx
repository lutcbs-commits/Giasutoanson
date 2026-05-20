'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import LessonCard from '@/components/LessonCard';
import SubjectGradeSelector, { type SubjectGradeChoice } from '@/components/SubjectGradeSelector';
import { apiFetch } from '@/lib/apiFetch';
import type { IELTSSkill } from '@/lib/lessonTypes';

interface LessonSummary {
  id: string;
  fileName: string;
  title: string;
  topics: string[];
  slideCount: number;
  exerciseCount: number;
  ieltsExerciseCount: number;
  processed: boolean;
  processedAt: string | null;
  subject: string;
  grade: string;
  ieltsMeta: { skill: IELTSSkill; week: number; month: number; targetBand: number } | null;
}

const IELTS_SKILLS: { skill: IELTSSkill; emoji: string; label: string; color: string }[] = [
  { skill: 'reading', emoji: '📖', label: 'Reading', color: 'from-sky-500 to-sky-600' },
  { skill: 'writing', emoji: '✍️', label: 'Writing', color: 'from-violet-500 to-violet-600' },
  { skill: 'listening', emoji: '🎧', label: 'Listening', color: 'from-tangerine-500 to-tangerine-600' },
  { skill: 'speaking', emoji: '🗣️', label: 'Speaking', color: 'from-red-500 to-red-600' },
];

const STORAGE_KEY = 'subjectGradeChoice';

export default function HomePage() {
  const [lessons, setLessons] = useState<LessonSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingAll, setProcessingAll] = useState(false);
  const [processLog, setProcessLog] = useState<string[]>([]);
  const [choice, setChoice] = useState<SubjectGradeChoice | null>(null);
  const [choiceLoaded, setChoiceLoaded] = useState(false);

  // Load saved choice from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { setChoice(JSON.parse(saved) as SubjectGradeChoice); } catch { /* ignore */ }
    }
    setChoiceLoaded(true);
  }, []);

  const fetchLessons = useCallback(async () => {
    try {
      const res = await apiFetch('/api/lessons');
      const data = await res.json() as { lessons: LessonSummary[] };
      setLessons(data.lessons ?? []);
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLessons(); }, [fetchLessons]);

  function handleSelect(c: SubjectGradeChoice) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(c));
    setChoice(c);
  }

  function handleChangeSubject() {
    localStorage.removeItem(STORAGE_KEY);
    setChoice(null);
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
        setProcessLog(prev => [...prev.slice(0, -1), `❌ Lỗi kết nối: ${lesson.fileName}`]);
      }
    }
    setProcessingAll(false);
    fetchLessons();
  }

  // Wait for localStorage to load before deciding whether to show selector
  if (!choiceLoaded) return null;

  // Show selector overlay if no choice saved
  if (!choice) return <SubjectGradeSelector onSelect={handleSelect} />;

  const filteredLessons = lessons.filter(l => l.subject === choice.subject && l.grade === choice.grade);
  const processedLessons = filteredLessons.filter(l => l.processed);
  const pendingLessons = filteredLessons.filter(l => !l.processed);
  const isIELTS = choice.subject === 'tieng-anh-ielts';

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Change subject button */}
      <div className="flex justify-end mb-4">
        <button onClick={handleChangeSubject}
          className="text-xs font-bold text-gray-400 hover:text-gray-600 flex items-center gap-1 bg-white border border-gray-200 rounded-xl px-3 py-1.5 hover:border-gray-300 transition-all">
          🔄 Đổi môn học
        </button>
      </div>

      {isIELTS ? (
        // ── IELTS HOME ─────────────────────────────────────────────────────
        <>
          {/* Hero */}
          <section className="relative rounded-4xl overflow-hidden mb-10 bg-gradient-to-br from-sky-500 via-sky-600 to-violet-700 p-8 md:p-12 text-white shadow-2xl">
            <div className="relative z-10">
              <div className="text-5xl mb-4 animate-float inline-block">🌏</div>
              <h1 className="text-4xl md:text-5xl font-black mb-3 leading-tight" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
                IELTS Lớp 8<br />
                <span className="text-sky-200">Band 4.5 → 5.5-6.0 🎯</span>
              </h1>
              <p className="text-sky-100 text-base md:text-lg font-semibold mb-6 max-w-lg">
                Lộ trình 3 tháng, học 30-60 phút/ngày. Luyện đủ 4 kỹ năng với AI chấm bài và feedback chuyên sâu.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/lo-trinh/ielts"
                  className="bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-2xl px-4 py-2 flex items-center gap-2 font-bold text-sm transition-all">
                  📅 Xem lộ trình 3 tháng
                </Link>
                <Link href="/tien-do"
                  className="bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-2xl px-4 py-2 flex items-center gap-2 font-bold text-sm transition-all">
                  ⭐ Tiến độ của tôi
                </Link>
              </div>
            </div>
            <div className="absolute top-6 right-10 w-28 h-28 rounded-full bg-white/10 animate-float" style={{ animationDelay: '0.5s' }} />
            <div className="absolute bottom-6 right-36 w-16 h-16 rounded-full bg-white/10 animate-float" style={{ animationDelay: '1s' }} />
            <div className="absolute bottom-10 right-16 text-6xl opacity-15 select-none">📝</div>
            <div className="absolute top-10 right-28 text-5xl opacity-15 select-none">🎧</div>
          </section>

          {/* Skills sections */}
          {IELTS_SKILLS.map(skillInfo => {
            const skillLessons = processedLessons.filter(l => l.ieltsMeta?.skill === skillInfo.skill);
            return (
              <section key={skillInfo.skill} className="mb-10">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-2xl font-black text-gray-800 flex items-center gap-2" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
                    <span className={`w-8 h-8 rounded-xl bg-gradient-to-br ${skillInfo.color} flex items-center justify-center text-lg`}>
                      {skillInfo.emoji}
                    </span>
                    {skillInfo.label}
                  </h2>
                  {skillLessons.length === 0 && (
                    <span className="text-xs text-gray-400 font-medium">Chưa có bài nào</span>
                  )}
                </div>

                {skillLessons.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {skillLessons.map((lesson, i) => (
                      <div key={lesson.id} className="animate-fade-up" style={{ animationDelay: `${i * 0.05}s` }}>
                        <IELTSLessonCard lesson={lesson} skillInfo={skillInfo} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-6 text-center">
                    <p className="text-gray-400 font-medium text-sm">
                      Bài {skillInfo.label} sẽ được thêm theo lộ trình hàng tuần
                    </p>
                  </div>
                )}
              </section>
            );
          })}
        </>
      ) : (
        // ── MATH HOME ──────────────────────────────────────────────────────
        <>
          {/* Hero */}
          <section className="relative rounded-4xl overflow-hidden mb-10 bg-gradient-to-br from-grass-500 via-grass-600 to-grass-700 p-8 md:p-12 text-white shadow-2xl">
            <div className="relative z-10">
              <div className="text-5xl mb-4 animate-float inline-block">🧮</div>
              <h1 className="text-4xl md:text-5xl font-black mb-3 leading-tight" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
                Ôn luyện Toán lớp 5<br />
                <span className="text-sun-300">Chuẩn bị thi vào lớp 6 🎯</span>
              </h1>
              <p className="text-grass-100 text-base md:text-lg font-semibold mb-6 max-w-lg">
                {filteredLessons.length} đề thi và tài liệu ôn luyện từ các trường THCS hàng đầu Hà Nội.
              </p>
              <div className="flex flex-wrap gap-3">
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-2 flex items-center gap-2">
                  <span className="text-lg">📚</span>
                  <span className="font-black text-sm">{filteredLessons.length} bài học</span>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-2 flex items-center gap-2">
                  <span className="text-lg">✅</span>
                  <span className="font-black text-sm">{processedLessons.length} đã xử lý</span>
                </div>
              </div>
            </div>
            <div className="absolute top-6 right-10 w-28 h-28 rounded-full bg-white/10 animate-float" style={{ animationDelay: '0.5s' }} />
            <div className="absolute bottom-10 right-16 text-6xl opacity-15 select-none">📐</div>
          </section>

          {/* Process All */}
          {!loading && pendingLessons.length > 0 && (
            <section className="mb-8">
              <div className="bg-gradient-to-br from-violet-50 to-violet-100 border-2 border-violet-200 rounded-3xl p-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-black text-violet-900 text-lg">⚡ {pendingLessons.length} bài chưa xử lý</h3>
                    <p className="text-violet-600 text-sm font-medium mt-1">Cần GROQ_API_KEY trong .env.local để xử lý.</p>
                  </div>
                  <button onClick={handleProcessAll} disabled={processingAll}
                    className="shrink-0 flex items-center gap-2 bg-gradient-to-br from-violet-500 to-violet-700 text-white font-black px-6 py-3 rounded-2xl hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed">
                    {processingAll ? (
                      <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>Đang xử lý...</>
                    ) : `⚡ Xử lý tất cả (${pendingLessons.length})`}
                  </button>
                </div>
                {processLog.length > 0 && (
                  <div className="mt-4 bg-white/60 rounded-2xl p-4 max-h-40 overflow-y-auto">
                    <p className="text-xs font-black text-violet-700 uppercase tracking-wider mb-2">Nhật ký:</p>
                    {processLog.map((line, i) => <p key={i} className="text-sm font-medium text-gray-700 font-mono">{line}</p>)}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Lessons grid */}
          {!loading && processedLessons.length > 0 && (
            <section className="mb-10">
              <h2 className="text-2xl font-black text-grass-800 mb-5">📖 Sẵn sàng học ({processedLessons.length})</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {processedLessons.map((lesson, i) => (
                  <div key={lesson.id} className="animate-fade-up" style={{ animationDelay: `${i * 0.05}s` }}>
                    <LessonCard {...lesson} onProcessed={fetchLessons} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {!loading && pendingLessons.length > 0 && (
            <section className="mb-10">
              <h2 className="text-2xl font-black text-grass-800 mb-5">⏳ Chưa xử lý ({pendingLessons.length})</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingLessons.map((lesson, i) => (
                  <div key={lesson.id} className="animate-fade-up" style={{ animationDelay: `${i * 0.05}s` }}>
                    <LessonCard {...lesson} onProcessed={fetchLessons} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {!loading && filteredLessons.length === 0 && (
            <div className="card border-2 border-dashed border-grass-300 bg-grass-50/50 text-center py-16 animate-fade-up">
              <div className="text-6xl mb-4">📂</div>
              <h3 className="text-2xl font-black text-grass-700 mb-3">Không tìm thấy bài học</h3>
              <p className="text-grass-500 font-medium">Đặt các file PDF vào thư mục <code className="bg-grass-100 px-2 py-0.5 rounded-lg text-grass-700 font-mono text-sm">/content/</code></p>
            </div>
          )}
        </>
      )}

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-3xl border-2 border-gray-100 bg-white p-5 animate-pulse">
              <div className="h-1.5 bg-gray-100 rounded-full mb-4" />
              <div className="h-5 bg-gray-100 rounded-xl w-3/4 mb-2" />
              <div className="h-3 bg-gray-50 rounded-lg w-1/2 mb-4" />
              <div className="flex gap-2 mt-4">
                <div className="h-10 bg-gray-50 rounded-xl flex-1" />
                <div className="h-10 bg-gray-50 rounded-xl flex-1" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── IELTS lesson card ────────────────────────────────────────────────────────

function IELTSLessonCard({ lesson, skillInfo }: {
  lesson: LessonSummary;
  skillInfo: { emoji: string; label: string; color: string };
}) {
  const week = lesson.ieltsMeta?.week;
  const band = lesson.ieltsMeta?.targetBand;

  return (
    <div className="relative rounded-3xl border-2 border-sky-200 bg-white shadow-sm overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5">
      <div className={`h-1.5 w-full bg-gradient-to-r ${skillInfo.color}`} />
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-black text-gray-900 text-base leading-snug line-clamp-2 mb-1" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
              {lesson.title}
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              {week && (
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-bold">Week {week}</span>
              )}
              {band && (
                <span className="text-xs bg-sky-50 text-sky-700 border border-sky-200 px-2 py-0.5 rounded-full font-bold">
                  Target: Band {band}
                </span>
              )}
            </div>
          </div>
          <span className="shrink-0 text-2xl">{skillInfo.emoji}</span>
        </div>

        {lesson.topics.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {lesson.topics.filter(t => !['IELTS', skillInfo.label].includes(t)).slice(0, 3).map(topic => (
              <span key={topic} className="text-xs bg-sky-50 text-sky-700 border border-sky-100 px-2 py-0.5 rounded-full font-semibold">
                {topic}
              </span>
            ))}
          </div>
        )}

        <div className="flex gap-3 mb-4">
          {lesson.slideCount > 0 && (
            <div className="flex items-center gap-1.5 text-sm text-gray-600 font-bold">
              <span>📖</span><span>{lesson.slideCount} slides</span>
            </div>
          )}
          {lesson.ieltsExerciseCount > 0 && (
            <div className="flex items-center gap-1.5 text-sm text-sky-600 font-bold">
              <span>✏️</span><span>{lesson.ieltsExerciseCount} bài</span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Link href={`/on-ly-thuyet/${lesson.id}`}
            className="flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 font-bold text-sm py-2.5 rounded-xl hover:shadow-md transition-all hover:-translate-y-0.5">
            📖 Lý thuyết
          </Link>
          <Link href={`/bai-tap/${lesson.id}`}
            className={`flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-br ${skillInfo.color} text-white font-bold text-sm py-2.5 rounded-xl hover:shadow-md transition-all hover:-translate-y-0.5`}>
            {skillInfo.emoji} Luyện tập
          </Link>
        </div>
      </div>
    </div>
  );
}
