'use client';
import { useState } from 'react';

interface StudentEntryProps {
  onEnter: (name: string) => void;
}

export default function StudentEntry({ onEnter }: StudentEntryProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Hãy nhập tên của em nhé!');
      return;
    }
    if (trimmed.length < 2) {
      setError('Tên cần ít nhất 2 ký tự.');
      return;
    }
    localStorage.setItem('studentName', trimmed);
    onEnter(trimmed);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-grass-50 to-sun-50">
      <div className="max-w-sm w-full animate-scale-in">
        <div className="card border-2 border-grass-200 shadow-xl text-center">
          <div className="text-6xl mb-4 animate-float inline-block">🧮</div>
          <h1 className="text-3xl font-black text-grass-800 mb-2" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
            Chào mừng!
          </h1>
          <p className="text-grass-600 font-medium mb-6">
            Cho mình biết tên của em để lưu kết quả học tập nhé
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="text"
              value={name}
              onChange={e => { setName(e.target.value); setError(''); }}
              placeholder="Ví dụ: Son, Minh, An..."
              autoFocus
              className="rounded-2xl border-2 border-grass-200 px-5 py-4 text-grass-800 font-bold text-lg text-center focus:outline-none focus:border-grass-400 bg-white"
            />
            {error && (
              <p className="text-red-500 text-sm font-medium">{error}</p>
            )}
            <button
              type="submit"
              className="btn-primary text-lg py-4"
            >
              🚀 Bắt đầu học!
            </button>
          </form>

          <p className="text-xs text-gray-400 font-medium mt-4">
            Không cần mật khẩu — chỉ cần nhập đúng tên là xem lại kết quả cũ được
          </p>
        </div>
      </div>
    </div>
  );
}
