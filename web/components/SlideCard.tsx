'use client';
import { useState } from 'react';
import type { Slide } from '@/lib/lessonTypes';

interface SlideCardProps {
  slide: Slide;
  slideNumber: number;
  totalSlides: number;
}

export default function SlideCard({ slide, slideNumber, totalSlides }: SlideCardProps) {
  const [exampleOpen, setExampleOpen] = useState(false);

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Slide number badge */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-black text-grass-600 bg-grass-100 border border-grass-200 px-3 py-1 rounded-full uppercase tracking-wider">
          Slide {slideNumber} / {totalSlides}
        </span>
      </div>

      {/* Title */}
      <h2
        className="text-2xl md:text-3xl font-black text-grass-900 leading-tight"
        style={{ fontFamily: "'Baloo 2', sans-serif" }}
      >
        {slide.title}
      </h2>

      {/* Content */}
      <div className="text-base md:text-lg text-gray-700 font-medium leading-relaxed whitespace-pre-line">
        {slide.content}
      </div>

      {/* Key Formula */}
      {slide.keyFormula && slide.keyFormula.trim() && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-sky-50 to-sky-100 border-2 border-sky-300 p-5">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-sky-500 rounded-l-xl" />
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">📐</span>
            <span className="text-xs font-black text-sky-700 uppercase tracking-wider">Công thức quan trọng</span>
          </div>
          <p className="text-sky-900 font-black text-lg md:text-xl pl-1">{slide.keyFormula}</p>
        </div>
      )}

      {/* Example */}
      {slide.example && (
        <div className="rounded-2xl border-2 border-sun-200 bg-sun-50 overflow-hidden">
          <button
            onClick={() => setExampleOpen(v => !v)}
            className="w-full flex items-center justify-between px-5 py-3 text-left group"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">💡</span>
              <span className="font-black text-sun-800 text-sm uppercase tracking-wider">Ví dụ minh họa</span>
            </div>
            <span className={`text-sun-600 transition-transform duration-200 ${exampleOpen ? 'rotate-180' : ''}`}>▼</span>
          </button>

          {exampleOpen && (
            <div className="px-5 pb-5 border-t border-sun-200">
              <p className="text-sun-900 font-bold mt-3 mb-3">{slide.example.problem}</p>
              <div className="space-y-2">
                {slide.example.steps.map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-sun-400 text-white text-xs font-black flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-gray-700 font-medium text-sm">{step}</p>
                  </div>
                ))}
              </div>
              {slide.example.result && (
                <div className="mt-3 bg-sun-200 rounded-xl px-4 py-2">
                  <span className="font-black text-sun-900">✅ Kết quả: </span>
                  <span className="font-bold text-sun-800">{slide.example.result}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
