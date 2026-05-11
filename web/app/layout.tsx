import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'Toán Vui — Học Toán Tiểu Học',
  description: 'Website học Toán vui nhộn dành cho học sinh lớp 1–5',
  icons: { icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🧮</text></svg>' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>
        <Navbar />
        <main className="min-h-screen pb-16">
          {children}
        </main>
        <footer className="bg-white border-t border-grass-100 py-6 text-center">
          <p className="text-grass-600 font-semibold text-sm">
            🧮 Toán Vui — Học Toán Tiểu Học vui nhộn mỗi ngày!
          </p>
        </footer>
      </body>
    </html>
  );
}
