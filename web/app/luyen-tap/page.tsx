import { Suspense } from 'react';
import LuyenTapClient from './LuyenTapClient';

export default function LuyenTapPage() {
  return (
    <Suspense fallback={
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <div className="text-7xl mb-4 animate-bounce-slow">🎯</div>
        <p className="text-grass-500 font-bold text-lg">Đang tải...</p>
      </div>
    }>
      <LuyenTapClient />
    </Suspense>
  );
}
