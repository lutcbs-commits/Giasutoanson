import path from 'path';
import fs from 'fs';

export const CONTENT_DIR = path.resolve(process.cwd(), '../content');

export interface FileMetadata {
  fileName: string;
  sender: string;
  sentAt: string;
  downloadedAt: string;
  filePath: string;
  fileType: string;
  fileSize: number;
}

export interface MetadataJson {
  files: FileMetadata[];
}

export function getMetadata(): MetadataJson {
  const metaPath = path.join(CONTENT_DIR, 'metadata.json');
  try {
    const raw = fs.readFileSync(metaPath, 'utf-8');
    return JSON.parse(raw) as MetadataJson;
  } catch {
    return { files: [] };
  }
}

export function getFilesFromDisk(): string[] {
  try {
    return fs
      .readdirSync(CONTENT_DIR)
      .filter(f => /\.(pdf|docx?|pptx?)$/i.test(f));
  } catch {
    return [];
  }
}
