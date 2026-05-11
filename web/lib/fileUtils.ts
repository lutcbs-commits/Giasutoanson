export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getFileIcon(fileType: string): string {
  const t = fileType.toUpperCase();
  if (t === 'PDF') return '📄';
  if (t.startsWith('DOC')) return '📝';
  if (t.startsWith('PPT')) return '📊';
  return '📎';
}

export function getFileColor(fileType: string): string {
  const t = fileType.toUpperCase();
  if (t === 'PDF') return 'bg-rose-100 text-rose-700 border-rose-200';
  if (t.startsWith('DOC')) return 'bg-sky-100 text-sky-700 border-sky-200';
  if (t.startsWith('PPT')) return 'bg-tangerine-100 text-tangerine-700 border-tangerine-200';
  return 'bg-grass-100 text-grass-700 border-grass-200';
}
