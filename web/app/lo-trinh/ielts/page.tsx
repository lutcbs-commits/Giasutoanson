'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/apiFetch';

const ROADMAP = [
  {
    month: 1,
    title: 'Tháng 1: Nền tảng (Band 4.5 → 5.0)',
    color: 'from-sky-500 to-sky-600',
    bg: 'bg-sky-50 border-sky-200',
    weeks: [
      {
        week: 1,
        title: 'Tuần 1: Grammar & Reading cơ bản',
        focus: ['Grammar: tenses, articles, prepositions', 'Reading: Skimming & Scanning', 'Practice: T/F/NG questions'],
        lessonId: 'ielts-reading-w1-skimming-environment',
        skill: 'reading',
        skillEmoji: '📖',
        daily: '30 phút: 15 phút grammar, 15 phút reading',
      },
      {
        week: 2,
        title: 'Tuần 2: Vocabulary & T/F/NG nâng cao',
        focus: ['Topic vocabulary: Technology, Society', 'T/F/NG advanced traps', 'Reading: Technology passage'],
        lessonId: 'ielts-reading-w2-tfng-technology',
        skill: 'reading',
        skillEmoji: '📖',
        daily: '30 phút: 15 phút vocab, 15 phút reading practice',
      },
      {
        week: 3,
        title: 'Tuần 3: Reading kỹ năng tổng hợp',
        focus: ['MCQ strategies', 'Matching headings technique', 'Sentence completion'],
        lessonId: null,
        skill: 'reading',
        skillEmoji: '📖',
        daily: '45 phút: đọc 1 passage hoàn chỉnh, làm hết câu hỏi',
      },
      {
        week: 4,
        title: 'Tuần 4: Writing Task 1 (Graphs)',
        focus: ['Task 1 structure: Overview + Body', 'Trend vocabulary: rose, fell, peaked', 'Describe line graphs & bar charts'],
        lessonId: 'ielts-writing-w4-task1-graphs',
        skill: 'writing',
        skillEmoji: '✍️',
        daily: '45 phút: 15 phút lý thuyết, 30 phút viết + AI feedback',
      },
    ],
  },
  {
    month: 2,
    title: 'Tháng 2: Phát triển kỹ năng (Band 5.0 → 5.5)',
    color: 'from-violet-500 to-violet-600',
    bg: 'bg-violet-50 border-violet-200',
    weeks: [
      {
        week: 5,
        title: 'Tuần 5: Writing Task 2 (Opinion Essay)',
        focus: ['Essay structure: Intro → Body × 2 → Conclusion', 'Opinion essay: agree/disagree', 'Linking words: Furthermore, However, Therefore'],
        lessonId: 'ielts-writing-w5-task2-opinion',
        skill: 'writing',
        skillEmoji: '✍️',
        daily: '1 giờ: 20 phút lý thuyết + 40 phút viết essay + AI grade',
      },
      {
        week: 6,
        title: 'Tuần 6: Writing Task 2 nâng cao',
        focus: ['Discussion essay: Both views + opinion', 'Complex sentences & cohesive devices', 'Vocabulary: Education, Environment, Health'],
        lessonId: null,
        skill: 'writing',
        skillEmoji: '✍️',
        daily: '1 giờ: viết 1 Task 2 essay hoàn chỉnh + peer review',
      },
      {
        week: 7,
        title: 'Tuần 7: Listening Section 1 & 2',
        focus: ['Note completion strategies', 'Multiple choice in Listening', 'Section 1: Everyday conversations'],
        lessonId: 'ielts-listening-w7-youtube',
        skill: 'listening',
        skillEmoji: '🎧',
        daily: '30 phút: nghe + làm câu hỏi + review transcript',
      },
      {
        week: 8,
        title: 'Tuần 8: Speaking Part 1 & 2',
        focus: ['Extending Part 1 answers (2-3 sentences)', 'Cue card strategy: 1 min prep', 'Vocabulary: Places, Hobbies, Daily life'],
        lessonId: 'ielts-speaking-w8-part1-part2',
        skill: 'speaking',
        skillEmoji: '🗣️',
        daily: '45 phút: học tips + luyện 3-4 câu hỏi + AI feedback',
      },
    ],
  },
  {
    month: 3,
    title: 'Tháng 3: Luyện thi (Band 5.5 → 6.0)',
    color: 'from-grass-500 to-grass-600',
    bg: 'bg-grass-50 border-grass-200',
    weeks: [
      {
        week: 9,
        title: 'Tuần 9: Speaking Part 3 & Advanced',
        focus: ['Abstract questions: society, global issues', 'Giving opinions with reasons', 'Advanced connectors: In terms of, Regarding'],
        lessonId: null,
        skill: 'speaking',
        skillEmoji: '🗣️',
        daily: '45 phút: Part 3 discussion + AI grade + revise vocabulary',
      },
      {
        week: 10,
        title: 'Tuần 10: Full Reading Practice',
        focus: ['Complete 3-passage Reading test (60 min)', 'Time management: 20 min/passage', 'Review all question types'],
        lessonId: null,
        skill: 'reading',
        skillEmoji: '📖',
        daily: '1 giờ: mock reading test (timed) + review sai',
      },
      {
        week: 11,
        title: 'Tuần 11: Integrated Skills',
        focus: ['Writing Task 1 + Task 2 trong 60 phút', 'Listening Section 3 & 4 (academic)', 'Speaking fluency drills'],
        lessonId: null,
        skill: 'writing',
        skillEmoji: '✍️',
        daily: '1 giờ: timed writing practice hoặc listening section',
      },
      {
        week: 12,
        title: 'Tuần 12: Mock Test & Final Review',
        focus: ['Full mock test simulation', 'Error analysis: identify weakest areas', 'Final vocabulary & grammar review'],
        lessonId: null,
        skill: 'reading',
        skillEmoji: '📊',
        daily: '1 giờ: mock test + review + prepare exam strategies',
      },
    ],
  },
];

const SKILL_COLORS: Record<string, string> = {
  reading: 'bg-sky-100 text-sky-700 border-sky-200',
  writing: 'bg-violet-100 text-violet-700 border-violet-200',
  listening: 'bg-tangerine-100 text-tangerine-700 border-tangerine-200',
  speaking: 'bg-red-100 text-red-700 border-red-200',
};

const DAILY_GUIDE = [
  { time: '7:00-7:30', activity: '📖 Vocabulary review (10 từ mới/ngày)', tip: 'Dùng Anki hoặc ghi chú tay' },
  { time: '16:00-17:00', activity: '✍️ / 🎧 / 🗣️ Luyện kỹ năng theo tuần', tip: 'Theo đúng lịch tuần hiện tại' },
  { time: '20:00-20:30', activity: '📺 Nghe tiếng Anh tự nhiên', tip: 'BBC News, TED Talks, IELTS YouTube' },
];

interface Session { lesson_id: string; problems_attempted: number; problems_correct: number; session_date: string; }
interface LessonStat { count: number; totalCorrect: number; totalAttempted: number; lastDate: string; }

export default function IELTSRoadmapPage() {
  const [lessonStats, setLessonStats] = useState<Record<string, LessonStat>>({});

  useEffect(() => {
    const name = localStorage.getItem('studentName');
    if (!name) return;
    apiFetch(`/api/students?name=${encodeURIComponent(name)}`)
      .then(r => r.json())
      .then((data: { sessions?: Session[] }) => {
        const stats: Record<string, LessonStat> = {};
        for (const s of data.sessions ?? []) {
          if (!s.lesson_id) continue;
          const prev = stats[s.lesson_id] ?? { count: 0, totalCorrect: 0, totalAttempted: 0, lastDate: '' };
          stats[s.lesson_id] = {
            count: prev.count + 1,
            totalCorrect: prev.totalCorrect + s.problems_correct,
            totalAttempted: prev.totalAttempted + s.problems_attempted,
            lastDate: s.session_date > prev.lastDate ? s.session_date : prev.lastDate,
          };
        }
        setLessonStats(stats);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-4">
        <Link href="/" className="text-sm font-bold text-gray-400 hover:text-gray-600 flex items-center gap-1">
          ← Về trang chủ
        </Link>
      </div>

      {/* Hero */}
      <section className="relative rounded-4xl overflow-hidden mb-10 bg-gradient-to-br from-sky-500 via-violet-600 to-grass-600 p-8 md:p-12 text-white shadow-2xl">
        <div className="relative z-10">
          <div className="text-5xl mb-4 animate-float inline-block">🗺️</div>
          <h1 className="text-4xl md:text-5xl font-black mb-3 leading-tight" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
            Lộ trình IELTS 3 Tháng
          </h1>
          <p className="text-white/90 text-lg font-semibold mb-2">Band 4.5 → 5.5-6.0 | Lớp 8 | 30-60 phút/ngày</p>
          <p className="text-white/70 text-sm font-medium max-w-lg">
            Lộ trình được thiết kế bởi giáo viên IELTS Band 9.0. Tập trung vào 4 kỹ năng với bài luyện tập có AI chấm và feedback chi tiết.
          </p>
        </div>
        <div className="absolute top-6 right-10 w-24 h-24 rounded-full bg-white/10 animate-float" style={{ animationDelay: '0.5s' }} />
      </section>

      {/* Band journey */}
      <div className="card mb-8 animate-fade-up">
        <h2 className="text-lg font-black text-gray-800 mb-4">🎯 Hành trình Band Score</h2>
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { band: '4.5', label: 'Hiện tại', color: 'bg-red-100 text-red-700 border-red-300' },
            { band: '→', label: '', color: 'text-gray-400 border-transparent bg-transparent' },
            { band: '5.0', label: 'Tháng 1', color: 'bg-sky-100 text-sky-700 border-sky-300' },
            { band: '→', label: '', color: 'text-gray-400 border-transparent bg-transparent' },
            { band: '5.5', label: 'Tháng 2', color: 'bg-violet-100 text-violet-700 border-violet-300' },
            { band: '→', label: '', color: 'text-gray-400 border-transparent bg-transparent' },
            { band: '6.0', label: 'Tháng 3', color: 'bg-grass-100 text-grass-700 border-grass-300' },
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className={`text-lg font-black px-3 py-1.5 rounded-xl border-2 ${item.color}`}>{item.band}</div>
              {item.label && <p className="text-xs font-bold text-gray-400 mt-1">{item.label}</p>}
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 font-medium mt-4">
          💡 Mục tiêu thực tế: học đều đặn 30-60 phút/ngày, không bỏ bữa. Cải thiện 1.0-1.5 band trong 3 tháng là hoàn toàn khả thi.
        </p>
      </div>

      {/* Daily schedule */}
      <div className="card mb-8 border-2 border-sun-200 bg-sun-50 animate-fade-up">
        <h2 className="text-lg font-black text-sun-800 mb-4">⏰ Lịch học hàng ngày</h2>
        <div className="flex flex-col gap-3">
          {DAILY_GUIDE.map((item, i) => (
            <div key={i} className="flex items-start gap-3 bg-white rounded-2xl p-3 border border-sun-100">
              <div className="shrink-0 text-xs font-black text-sun-700 bg-sun-100 px-2 py-1 rounded-lg">{item.time}</div>
              <div>
                <p className="font-bold text-gray-800 text-sm">{item.activity}</p>
                <p className="text-xs text-gray-500 font-medium">💡 {item.tip}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly roadmap */}
      {ROADMAP.map(month => (
        <section key={month.month} className="mb-10 animate-fade-up">
          <div className={`rounded-3xl bg-gradient-to-r ${month.color} p-4 mb-5 text-white`}>
            <h2 className="text-xl font-black" style={{ fontFamily: "'Baloo 2', sans-serif" }}>{month.title}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {month.weeks.map(week => {
              const stat = week.lessonId ? lessonStats[week.lessonId] : null;
              const done = !!stat;
              const pct = stat && stat.totalAttempted > 0
                ? Math.round((stat.totalCorrect / stat.totalAttempted) * 100) : null;
              const lastDate = stat ? new Date(stat.lastDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }) : null;

              return (
                <div key={week.week} className={`rounded-3xl border-2 ${month.bg} p-5 shadow-sm relative overflow-hidden ${done ? 'ring-2 ring-grass-400 ring-offset-2' : ''}`}>
                  {/* Completed ribbon */}
                  {done && (
                    <div className="absolute top-3 right-3 bg-grass-500 text-white text-xs font-black px-2.5 py-1 rounded-xl shadow-sm">
                      ✅ Đã học
                    </div>
                  )}

                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-1">Tuần {week.week}</p>
                      <h3 className="font-black text-gray-800 text-sm leading-snug pr-14">{week.title}</h3>
                    </div>
                    <span className={`shrink-0 text-xs font-bold px-2 py-1 rounded-xl border ${SKILL_COLORS[week.skill] ?? ''}`}>
                      {week.skillEmoji} {week.skill.charAt(0).toUpperCase() + week.skill.slice(1)}
                    </span>
                  </div>

                  <ul className="flex flex-col gap-1 mb-3">
                    {week.focus.map((f, i) => (
                      <li key={i} className="text-xs text-gray-600 font-medium flex items-start gap-1.5">
                        <span className="shrink-0 text-gray-400 mt-0.5">•</span>{f}
                      </li>
                    ))}
                  </ul>

                  <div className="bg-white/70 rounded-xl px-3 py-2 mb-3 border border-white">
                    <p className="text-xs font-bold text-gray-600">⏱️ {week.daily}</p>
                  </div>

                  {/* Progress stats if done */}
                  {done && stat && (
                    <div className="flex items-center gap-2 mb-3 bg-grass-50 border border-grass-200 rounded-xl px-3 py-2">
                      <span className="text-xs font-black text-grass-700">{stat.count} lần học</span>
                      <span className="text-grass-300">·</span>
                      {pct !== null && <span className="text-xs font-bold text-grass-600">{pct}% đúng</span>}
                      {lastDate && <><span className="text-grass-300">·</span><span className="text-xs text-grass-600 font-medium">{lastDate}</span></>}
                    </div>
                  )}

                  {week.lessonId ? (
                    <Link href={`/bai-tap/${week.lessonId}`}
                      className={`block text-center text-sm font-black py-2.5 rounded-2xl transition-all hover:-translate-y-0.5 ${
                        done
                          ? 'bg-grass-100 text-grass-700 border-2 border-grass-300 hover:bg-grass-200'
                          : `bg-gradient-to-br ${month.color} text-white hover:shadow-md`
                      }`}>
                      {done ? '🔄 Học lại' : `🚀 Bắt đầu tuần ${week.week}`}
                    </Link>
                  ) : (
                    <div className="text-center text-xs font-bold text-gray-400 py-2.5 rounded-2xl bg-gray-100 border border-gray-200">
                      📅 Bài học sẽ được thêm
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ))}

      {/* Tips */}
      <div className="card border-2 border-violet-200 bg-violet-50 mb-8 animate-fade-up">
        <h2 className="text-lg font-black text-violet-800 mb-4">💡 Tips từ giáo viên</h2>
        <div className="flex flex-col gap-3">
          {[
            { emoji: '📝', tip: 'Học vocabulary theo chủ đề (topic-based), không học theo bảng chữ cái. IELTS hay dùng: Environment, Technology, Education, Health, Society.' },
            { emoji: '🎧', tip: 'Nghe tiếng Anh hàng ngày ngay cả khi không "học". BBC News, TED Talks, podcast ngắn — quen tai accent giúp Listening tăng nhanh.' },
            { emoji: '✍️', tip: 'Writing: đừng cố học thuộc lòng template. Examiners nhận ra template ngay — thay vào đó, học cấu trúc và tự viết với từ ngữ của mình.' },
            { emoji: '🗣️', tip: 'Speaking: nói to khi luyện một mình ở nhà. Nghe lại voice memo của mình — bạn sẽ nhận ra lỗi tốt hơn nhiều so với chỉ đọc.' },
            { emoji: '📚', tip: 'Dùng Cambridge IELTS 15-18 (sách luyện đề chính thức) cho mock tests ở tháng 3. Đây là tài liệu uy tín nhất, gần đề thật nhất.' },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 bg-white rounded-2xl p-3 border border-violet-100">
              <span className="text-2xl shrink-0">{item.emoji}</span>
              <p className="text-sm text-gray-700 font-medium">{item.tip}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <Link href="/"
          className="inline-flex items-center gap-2 bg-gradient-to-br from-sky-500 to-violet-600 text-white font-black py-4 px-8 rounded-3xl hover:shadow-xl transition-all hover:-translate-y-0.5 text-lg">
          🚀 Bắt đầu học ngay!
        </Link>
      </div>
    </div>
  );
}
