'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

const NAV_ITEMS = [
  { href: '/', label: 'Trang Chủ', emoji: '🏠' },
  { href: '/tai-lieu', label: 'Tài Liệu', emoji: '📚' },
  { href: '/bai-hoc', label: 'Bài Học', emoji: '✏️' },
  { href: '/luyen-tap', label: 'Luyện Tập', emoji: '🎯' },
  { href: '/tien-do', label: 'Tiến Độ', emoji: '⭐' },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-grass-100 shadow-sm">
      <nav className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2 font-black text-xl text-grass-700 hover:text-grass-600 transition-colors">
          <span className="text-2xl animate-float inline-block">🧮</span>
          <span className="hidden sm:block" style={{ fontFamily: "'Baloo 2', sans-serif" }}>Toán Vui</span>
        </Link>

        <ul className="flex items-center gap-1">
          {NAV_ITEMS.map(item => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={clsx(
                  'flex items-center gap-1.5 px-3 py-2 rounded-2xl text-sm font-bold transition-all duration-200',
                  pathname === item.href
                    ? 'bg-grass-500 text-white shadow-md scale-105'
                    : 'text-grass-700 hover:bg-grass-50 hover:text-grass-800'
                )}
              >
                <span className="text-base">{item.emoji}</span>
                <span className="hidden md:block">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
