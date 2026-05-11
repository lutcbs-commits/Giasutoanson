import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getMetadata, getFilesFromDisk, CONTENT_DIR } from '@/lib/serverFileUtils';
import { formatFileSize } from '@/lib/fileUtils';

export async function GET() {
  try {
    const metadata = getMetadata();
    const diskFiles = getFilesFromDisk();

    const metaMap = new Map(metadata.files.map(f => [f.fileName, f]));

    const files = diskFiles.map(fileName => {
      const meta = metaMap.get(fileName);
      let fileSize = meta?.fileSize ?? 0;
      if (fileSize === 0) {
        try {
          fileSize = fs.statSync(path.join(CONTENT_DIR, fileName)).size;
        } catch {}
      }
      return {
        fileName,
        sender: meta?.sender ?? 'MathExpress',
        sentAt: meta?.sentAt ?? '',
        downloadedAt: meta?.downloadedAt ?? '',
        fileType: fileName.split('.').pop()?.toUpperCase() ?? 'FILE',
        fileSize,
        fileSizeLabel: formatFileSize(fileSize),
      };
    });

    return NextResponse.json({ files, total: files.length });
  } catch (error) {
    return NextResponse.json({ files: [], total: 0, error: 'Không thể đọc thư mục content' }, { status: 200 });
  }
}
