'use client';
import { useState } from 'react';

export interface SubjectGradeChoice {
  subject: 'toan' | 'tieng-anh-ielts' | 'hoa-hoc' | 'dia-ly' | 'ngu-van';
  grade: string;
}

const SUBJECTS = [
  {
    id: 'toan' as const,
    emoji: '🧮',
    label: 'Toán học',
    description: 'Ôn luyện Toán lớp 5 — chuẩn bị thi vào lớp 6',
    grades: [{ value: '5', label: 'Lớp 5', note: 'Thi vào lớp 6 THCS' }],
    color: 'from-grass-500 to-grass-600',
    bg: 'bg-grass-50 border-grass-300',
    selectedBg: 'bg-grass-500',
    textSelected: 'text-white',
  },
  {
    id: 'tieng-anh-ielts' as const,
    emoji: '🌏',
    label: 'Tiếng Anh IELTS',
    description: 'Luyện thi IELTS — lộ trình từ band 4.5 lên 5.5-6.0',
    grades: [{ value: '8', label: 'Lớp 8', note: 'Band 4.5 → 5.5-6.0 sau 3 tháng' }],
    color: 'from-sky-500 to-sky-600',
    bg: 'bg-sky-50 border-sky-300',
    selectedBg: 'bg-sky-500',
    textSelected: 'text-white',
  },
  {
    id: 'hoa-hoc' as const,
    emoji: '⚗️',
    label: 'Hoá học',
    description: 'Thử sức chuyên Hoá lớp 10 — lộ trình 2 tuần 14 ngày',
    grades: [{ value: '10', label: 'Lớp 10', note: 'Chuyên Hoá — từ nguyên tử đến hữu cơ' }],
    color: 'from-orange-500 to-red-500',
    bg: 'bg-orange-50 border-orange-300',
    selectedBg: 'bg-orange-500',
    textSelected: 'text-white',
  },
  {
    id: 'dia-ly' as const,
    emoji: '🌍',
    label: 'Địa lý',
    description: 'Thử sức chuyên Địa lớp 10 — lộ trình 2 tuần 14 ngày',
    grades: [{ value: '10', label: 'Lớp 10', note: 'Chuyên Địa — từ bản đồ đến kinh tế VN' }],
    color: 'from-emerald-500 to-teal-600',
    bg: 'bg-emerald-50 border-emerald-300',
    selectedBg: 'bg-emerald-500',
    textSelected: 'text-white',
  },
  {
    id: 'ngu-van' as const,
    emoji: '📝',
    label: 'Ngữ văn',
    description: 'Ôn thi vào lớp 10 môn Ngữ văn — mục tiêu 9 điểm Hà Nội',
    grades: [{ value: '9', label: 'Lớp 9', note: 'Ôn thi vào lớp 10 — 9 điểm trong 2 tháng' }],
    color: 'from-pink-500 to-rose-600',
    bg: 'bg-pink-50 border-pink-300',
    selectedBg: 'bg-pink-500',
    textSelected: 'text-white',
  },
];

interface Props {
  onSelect: (choice: SubjectGradeChoice) => void;
}

export default function SubjectGradeSelector({ onSelect }: Props) {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);

  const subjectObj = SUBJECTS.find(s => s.id === selectedSubject);

  function handleConfirm() {
    if (!selectedSubject || !selectedGrade) return;
    onSelect({ subject: selectedSubject as SubjectGradeChoice['subject'], grade: selectedGrade });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-grass-600 via-sky-600 to-violet-700 p-4">
      <div className="w-full max-w-lg animate-scale-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-3 animate-float inline-block">📚</div>
          <h1 className="text-3xl font-black text-white mb-2" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
            Em muốn học gì?
          </h1>
          <p className="text-white/80 font-medium">Chọn môn học và lớp để bắt đầu</p>
        </div>

        {/* Subject cards */}
        <div className="flex flex-col gap-3 mb-6">
          {SUBJECTS.map(s => (
            <button
              key={s.id}
              onClick={() => { setSelectedSubject(s.id); setSelectedGrade(null); }}
              className={`w-full rounded-3xl p-5 border-2 text-left transition-all hover:shadow-lg hover:-translate-y-0.5 ${
                selectedSubject === s.id
                  ? 'bg-white border-white shadow-xl scale-[1.02]'
                  : 'bg-white/20 border-white/30 hover:bg-white/30'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center text-2xl shrink-0 shadow-md`}>
                  {s.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-black text-lg ${selectedSubject === s.id ? 'text-gray-900' : 'text-white'}`}
                     style={{ fontFamily: "'Baloo 2', sans-serif" }}>
                    {s.label}
                  </p>
                  <p className={`text-sm font-medium ${selectedSubject === s.id ? 'text-gray-500' : 'text-white/70'}`}>
                    {s.description}
                  </p>
                </div>
                {selectedSubject === s.id && (
                  <div className="shrink-0 w-6 h-6 rounded-full bg-grass-500 flex items-center justify-center text-white text-xs font-black">
                    ✓
                  </div>
                )}
              </div>

              {/* Grade selector — shown when subject is selected */}
              {selectedSubject === s.id && (
                <div className="mt-4 flex flex-wrap gap-2" onClick={e => e.stopPropagation()}>
                  {s.grades.map(g => (
                    <button
                      key={g.value}
                      onClick={() => setSelectedGrade(g.value)}
                      className={`flex-1 rounded-2xl px-4 py-3 border-2 transition-all text-left ${
                        selectedGrade === g.value
                          ? `bg-gradient-to-br ${s.color} border-transparent text-white shadow-md`
                          : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <p className="font-black text-base">{g.label}</p>
                      <p className={`text-xs font-medium mt-0.5 ${selectedGrade === g.value ? 'text-white/80' : 'text-gray-400'}`}>
                        {g.note}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Confirm button */}
        <button
          onClick={handleConfirm}
          disabled={!selectedSubject || !selectedGrade}
          className="w-full flex items-center justify-center gap-2 bg-white text-gray-900 font-black text-lg py-4 rounded-3xl shadow-xl hover:shadow-2xl transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          {selectedSubject && selectedGrade
            ? `🚀 Bắt đầu học ${subjectObj?.label} ${subjectObj?.grades.find(g => g.value === selectedGrade)?.label}`
            : '👆 Chọn môn và lớp để tiếp tục'}
        </button>
      </div>
    </div>
  );
}
