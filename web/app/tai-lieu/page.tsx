'use client';
import { useEffect, useState, useMemo } from 'react';
import FileCard from '@/components/FileCard';

interface FileEntry {
  fileName: string;
  sender: string;
  sentAt: string;
  fileType: string;
  fileSize: number;
  fileSizeLabel: string;
}

type Filter = 'ALL' | 'PDF' | 'DOC' | 'DOCX' | 'PPT' | 'PPTX';

export default function TaiLieuPage() {
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/files')
      .then(r => r.json())
      .then(data => { setFiles(data.files ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const fileTypes = useMemo(() => {
    const types = new Set(files.map(f => f.fileType));
    return ['ALL', ...Array.from(types)];
  }, [files]);

  const filtered = useMemo(() => {
    return files.filter(f => {
      const matchType = filter === 'ALL' || f.fileType === filter;
      const matchSearch = f.fileName.toLowerCase().includes(search.toLowerCase()) ||
        f.sender.toLowerCase().includes(search.toLowerCase());
      return matchType && matchSearch;
    });
  }, [files, filter, search]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-black text-grass-800 mb-2" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
          📚 Tài Liệu
        </h1>
        <p className="text-grass-500 font-medium">
          Tất cả tài liệu từ nhóm MathExpress
        </p>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="🔍 Tìm kiếm theo tên file hoặc người gửi..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 rounded-2xl border-2 border-grass-200 px-5 py-3 text-grass-800 font-semibold focus:outline-none focus:border-grass-400 bg-white placeholder:text-grass-300"
        />
        <div className="flex gap-2 flex-wrap">
          {fileTypes.map(type => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-xl font-bold text-sm transition-all border-2 ${
                filter === type
                  ? 'bg-grass-500 text-white border-grass-500 shadow-md'
                  : 'bg-white text-grass-600 border-grass-200 hover:border-grass-400'
              }`}
            >
              {type === 'ALL' ? '📂 Tất cả' : type}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="flex gap-3">
                <div className="w-12 h-12 bg-grass-100 rounded-2xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-grass-100 rounded-lg w-3/4" />
                  <div className="h-3 bg-grass-50 rounded-lg w-1/2" />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <div className="h-9 bg-grass-50 rounded-xl flex-1" />
                <div className="h-9 bg-tangerine-50 rounded-xl flex-1" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card border-2 border-dashed border-grass-300 bg-grass-50/50 text-center py-16">
          <div className="text-7xl mb-4">
            {files.length === 0 ? '📂' : '🔍'}
          </div>
          <h2 className="text-2xl font-black text-grass-700 mb-3">
            {files.length === 0 ? 'Chưa có tài liệu nào' : 'Không tìm thấy kết quả'}
          </h2>
          {files.length === 0 ? (
            <div className="space-y-2 text-grass-500 font-medium">
              <p>Chạy script để tải tài liệu từ Zalo:</p>
              <code className="block bg-grass-100 rounded-xl px-4 py-2 font-mono text-sm text-grass-700 max-w-xs mx-auto">
                cd zalo-downloader && npm start
              </code>
            </div>
          ) : (
            <p className="text-grass-400">Thử tìm với từ khóa khác hoặc bỏ bộ lọc.</p>
          )}
        </div>
      ) : (
        <>
          <p className="text-grass-500 font-semibold mb-4 text-sm">
            Hiển thị {filtered.length} / {files.length} tài liệu
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((file, i) => (
              <div key={file.fileName} style={{ animationDelay: `${i * 0.05}s` }}>
                <FileCard {...file} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
