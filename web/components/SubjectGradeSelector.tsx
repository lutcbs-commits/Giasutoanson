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
    description: 'Ôn thi vào lớp 6',
    grades: [{ value: '5', label: 'Lớp 5', note: 'Thi vào lớp 6 THCS' }],
    color: 'from-grass-500 to-grass-600',
    ring: 'ring-grass-400',
    bg: 'bg-grass-500',
    light: 'bg-grass-50',
  },
  {
    id: 'tieng-anh-ielts' as const,
    emoji: '🌏',
    label: 'Tiếng Anh',
    description: 'IELTS band 5.5–6.0',
    grades: [{ value: '8', label: 'Lớp 8', note: 'Band 4.5 → 5.5-6.0' }],
    color: 'from-sky-500 to-sky-600',
    ring: 'ring-sky-400',
    bg: 'bg-sky-500',
    light: 'bg-sky-50',
  },
  {
    id: 'hoa-hoc' as const,
    emoji: '⚗️',
    label: 'Hoá học',
    description: 'Chuyên Hoá lớp 10',
    grades: [{ value: '10', label: 'Lớp 10', note: 'Từ nguyên tử đến hữu cơ' }],
    color: 'from-orange-500 to-red-500',
    ring: 'ring-orange-400',
    bg: 'bg-orange-500',
    light: 'bg-orange-50',
  },
  {
    id: 'dia-ly' as const,
    emoji: '🌍',
    label: 'Địa lý',
    description: 'Chuyên Địa lớp 10',
    grades: [{ value: '10', label: 'Lớp 10', note: 'Từ bản đồ đến kinh tế VN' }],
    color: 'from-emerald-500 to-teal-600',
    ring: 'ring-emerald-400',
    bg: 'bg-emerald-500',
    light: 'bg-emerald-50',
  },
  {
    id: 'ngu-van' as const,
    emoji: '📝',
    label: 'Ngữ văn',
    description: 'Ôn thi vào lớp 10',
    grades: [{ value: '9', label: 'Lớp 9', note: '9 điểm trong 2 tháng' }],
    color: 'from-pink-500 to-rose-600',
    ring: 'ring-pink-400',
    bg: 'bg-pink-500',
    light: 'bg-pink-50',
  },
];

interface Props {
  onSelect: (choice: SubjectGradeChoice) => void;
}

export default function SubjectGradeSelector({ onSelect }: Props) {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);

  function handleSubjectClick(id: string) {
    if (selectedSubject === id) {
      setSelectedSubject(null);
      setSelectedGrade(null);
    } else {
      setSelectedSubject(id);
      setSelectedGrade(null);
    }
  }

  function handleConfirm(subjectId: string, grade: string) {
    onSelect({ subject: subjectId as SubjectGradeChoice['subject'], grade });
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gradient-to-br from-grass-600 via-sky-600 to-violet-700">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="w-full max-w-lg animate-scale-in">

          {/* Header */}
          <div className="text-center mb-6">
            <div className="text-5xl mb-2 animate-float inline-block">📚</div>
            <h1 className="text-2xl font-black text-white" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
              Em muốn học gì?
            </h1>
            <p className="text-white/70 text-sm font-medium mt-1">Chọn môn để bắt đầu ngay</p>
          </div>

          {/* Subject grid — 2 cols */}
          <div className="grid grid-cols-2 gap-3">
            {SUBJECTS.map(s => {
              const isSelected = selectedSubject === s.id;
              return (
                <div
                  key={s.id}
                  className={`rounded-3xl border-2 transition-all duration-200 overflow-hidden ${
                    isSelected
                      ? 'bg-white border-white shadow-2xl scale-[1.01]'
                      : 'bg-white/15 border-white/25 hover:bg-white/25 hover:border-white/40'
                  }`}
                >
                  {/* Card header — always visible */}
                  <button
                    onClick={() => handleSubjectClick(s.id)}
                    className="w-full p-4 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center text-xl shrink-0 shadow-md`}>
                        {s.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-black text-sm leading-tight ${isSelected ? 'text-gray-900' : 'text-white'}`}
                           style={{ fontFamily: "'Baloo 2', sans-serif" }}>
                          {s.label}
                        </p>
                        <p className={`text-xs font-medium mt-0.5 truncate ${isSelected ? 'text-gray-500' : 'text-white/65'}`}>
                          {s.description}
                        </p>
                      </div>
                      <div className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        isSelected
                          ? `${s.bg} border-transparent`
                          : 'border-white/40'
                      }`}>
                        {isSelected && <span className="text-white text-xs font-black">✓</span>}
                      </div>
                    </div>
                  </button>

                  {/* Expanded: grade + start button */}
                  {isSelected && (
                    <div className="px-4 pb-4 flex flex-col gap-2 animate-fade-up">
                      {/* Grade pills */}
                      <div className="flex flex-wrap gap-2">
                        {s.grades.map(g => (
                          <button
                            key={g.value}
                            onClick={() => setSelectedGrade(g.value)}
                            className={`flex-1 rounded-2xl px-3 py-2.5 border-2 text-left transition-all ${
                              selectedGrade === g.value
                                ? `bg-gradient-to-br ${s.color} border-transparent text-white shadow-md`
                                : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-300'
                            }`}
                          >
                            <p className="font-black text-sm">{g.label}</p>
                            <p className={`text-xs font-medium mt-0.5 ${selectedGrade === g.value ? 'text-white/80' : 'text-gray-400'}`}>
                              {g.note}
                            </p>
                          </button>
                        ))}
                      </div>

                      {/* Start button — appears when grade selected */}
                      <button
                        onClick={() => selectedGrade && handleConfirm(s.id, selectedGrade)}
                        disabled={!selectedGrade}
                        className={`w-full flex items-center justify-center gap-2 font-black text-sm py-3 rounded-2xl transition-all active:scale-95 ${
                          selectedGrade
                            ? `bg-gradient-to-br ${s.color} text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5`
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {selectedGrade
                          ? `🚀 Bắt đầu ${s.label}`
                          : '👆 Chọn lớp để tiếp tục'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
}
