'use client';
import { useState } from 'react';
import clsx from 'clsx';
import { getFileIcon, getFileColor, formatFileSize } from '@/lib/fileUtils';

interface FileCardProps {
  fileName: string;
  sender: string;
  sentAt: string;
  fileType: string;
  fileSize: number;
}

export default function FileCard({ fileName, sender, sentAt, fileType, fileSize }: FileCardProps) {
  const [showPreview, setShowPreview] = useState(false);
  const isPdf = fileType === 'PDF';
  const colorClass = getFileColor(fileType);
  const icon = getFileIcon(fileType);

  return (
    <div className="card hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 animate-fade-up">
      <div className="flex items-start gap-3">
        <div className={clsx('text-3xl w-12 h-12 rounded-2xl flex items-center justify-center border-2 flex-shrink-0', colorClass)}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-grass-800 truncate text-sm leading-snug">{fileName}</h3>
          <p className="text-xs text-grass-500 mt-0.5">Gửi bởi: {sender}</p>
          {sentAt && <p className="text-xs text-grass-400">{sentAt}</p>}
        </div>
        <span className={clsx('badge text-xs flex-shrink-0', colorClass)}>{fileType}</span>
      </div>

      {fileSize > 0 && (
        <p className="text-xs text-grass-400 mt-2">{formatFileSize(fileSize)}</p>
      )}

      <div className="flex gap-2 mt-4">
        {isPdf && (
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex-1 text-sm font-bold py-2 px-4 rounded-xl bg-grass-50 hover:bg-grass-100 text-grass-700 border border-grass-200 transition-colors"
          >
            {showPreview ? '🔼 Đóng' : '👁️ Xem'}
          </button>
        )}
        <a
          href={`/api/files/${encodeURIComponent(fileName)}`}
          download={fileName}
          className="flex-1 text-sm font-bold py-2 px-4 rounded-xl bg-tangerine-50 hover:bg-tangerine-100 text-tangerine-700 border border-tangerine-200 transition-colors text-center"
        >
          ⬇️ Tải về
        </a>
      </div>

      {showPreview && isPdf && (
        <div className="mt-4 rounded-2xl overflow-hidden border border-grass-100 bg-grass-50" style={{ height: 480 }}>
          <iframe
            src={`/api/files/${encodeURIComponent(fileName)}#toolbar=0`}
            className="w-full h-full"
            title={fileName}
          />
        </div>
      )}
    </div>
  );
}
