import path from 'path';
import fs from 'fs';
import Groq from 'groq-sdk';
import type { LessonData } from './lessonTypes';

export const CONTENT_DIR = path.resolve(process.cwd(), '../content');
export const LESSONS_DIR = path.resolve(process.cwd(), '../content/lessons');
// Writable fallback for serverless environments (Vercel /var/task is read-only)
const TMP_LESSONS_DIR = '/tmp/lessons';

function slugify(fileName: string): string {
  return fileName
    .replace(/\.pdf$/i, '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export function getLessonId(fileName: string): string {
  return slugify(fileName);
}

export function getLessonPath(id: string): string {
  return path.join(LESSONS_DIR, `${id}.json`);
}

function findLessonFile(id: string): string | null {
  const bundled = path.join(LESSONS_DIR, `${id}.json`);
  if (fs.existsSync(bundled)) return bundled;
  const tmp = path.join(TMP_LESSONS_DIR, `${id}.json`);
  if (fs.existsSync(tmp)) return tmp;
  return null;
}

export function lessonExists(id: string): boolean {
  return findLessonFile(id) !== null;
}

export function loadLesson(id: string): LessonData | null {
  try {
    const filePath = findLessonFile(id);
    if (!filePath) return null;
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as LessonData;
  } catch {
    return null;
  }
}

export function listLessons(): Array<{ id: string; fileName: string; processed: boolean }> {
  const pdfFiles = fs.existsSync(CONTENT_DIR)
    ? fs.readdirSync(CONTENT_DIR).filter(f => /\.pdf$/i.test(f))
    : [];

  const pdfLessons = pdfFiles.map(fileName => ({
    id: getLessonId(fileName),
    fileName,
    processed: lessonExists(getLessonId(fileName)),
  }));

  const knownIds = new Set(pdfLessons.map(l => l.id));

  const collectJsonOnly = (dir: string): Array<{ id: string; fileName: string; processed: boolean }> => {
    if (!fs.existsSync(dir)) return [];
    return fs
      .readdirSync(dir)
      .filter(f => /\.json$/i.test(f))
      .map(f => f.replace(/\.json$/i, ''))
      .filter(id => !knownIds.has(id))
      .map(id => {
        knownIds.add(id);
        return { id, fileName: `${id}.json`, processed: true };
      });
  };

  const bundledJsonOnly = collectJsonOnly(LESSONS_DIR);
  const tmpJsonOnly = collectJsonOnly(TMP_LESSONS_DIR);

  return [...pdfLessons, ...bundledJsonOnly, ...tmpJsonOnly];
}

async function extractTextFromPdf(pdfPath: string): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfParse = require('pdf-parse');
  const buffer = fs.readFileSync(pdfPath);
  const data = await pdfParse(buffer);
  return data.text as string;
}

function buildPrompt(pdfText: string, fileName: string): string {
  const content = pdfText.slice(0, 3000);
  return `Bạn là GV toán lớp 5. Nhiệm vụ: tạo bài học JSON từ tài liệu dưới đây.
QUAN TRỌNG: Chỉ trả về JSON, bắt đầu bằng { và kết thúc bằng }. Không có text nào khác.

FILE: ${fileName}
NỘI DUNG TÀI LIỆU:
${content}

Tạo JSON với cấu trúc sau (4 slides, 5 bài tập, tiếng Việt):
{"title":"Tên bài","topics":["topic1","topic2"],"slides":[{"id":1,"title":"Tiêu đề","content":"Nội dung lý thuyết","keyFormula":"công thức hoặc rỗng","example":{"problem":"Ví dụ","steps":["B1","B2"],"result":"Đáp án"},"miniGame":null}],"exercises":[{"id":1,"question":"Đề bài","correctSteps":["B1","B2","B3"],"correctAnswer":"5","correctUnit":"kg","difficulty":"easy","hint":"Gợi ý"}]}

Lưu ý: miniGame chỉ thêm cho 2 slides (question/options[4]/answer/explanation). correctAnswer chỉ ghi số. difficulty: easy/medium/hard.`;
}

export async function processLesson(fileName: string): Promise<LessonData> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY chưa được cấu hình trong .env.local');
  }

  const pdfPath = path.join(CONTENT_DIR, fileName);
  if (!fs.existsSync(pdfPath)) {
    throw new Error(`File không tồn tại: ${fileName}`);
  }

  let pdfText: string;
  try {
    pdfText = await extractTextFromPdf(pdfPath);
  } catch (err) {
    throw new Error(`Không thể đọc PDF: ${(err as Error).message}`);
  }

  if (!pdfText || pdfText.trim().length < 50) {
    throw new Error('PDF không có nội dung text có thể đọc được');
  }

  const groq = new Groq({ apiKey });
  let completion;
  try {
    completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: buildPrompt(pdfText, fileName) }],
      temperature: 0.7,
      max_tokens: 4096,
    });
  } catch (primaryErr) {
    const e = primaryErr as { status?: number };
    if (e.status === 429) {
      const body = ((primaryErr as Error).message ?? '').match(/"message":"([^"]+)"/)?.[1] ?? '';
      const retry = body.match(/try again in ([^"]+)/)?.[1] ?? '';
      throw new Error(`Groq hết quota ngày (100k token/ngày). ${retry ? `Thử lại sau ${retry}.` : 'Thử lại ngày mai.'}`);
    }
    if (e.status === 413) {
      throw new Error('File PDF quá lớn để xử lý. Hãy thử file nhỏ hơn hoặc liên hệ admin.');
    }
    throw primaryErr;
  }
  const rawText = completion.choices[0]?.message?.content ?? '';

  let parsed: { title: string; topics: string[]; slides: LessonData['slides']; exercises: LessonData['exercises'] };
  try {
    // Extract JSON robustly: find first { and last }
    const start = rawText.indexOf('{');
    const end = rawText.lastIndexOf('}');
    if (start === -1 || end === -1) throw new Error('No JSON object found');
    const jsonStr = rawText.slice(start, end + 1);
    parsed = JSON.parse(jsonStr);
  } catch {
    throw new Error(`Groq API trả về JSON không hợp lệ. Raw: ${rawText.slice(0, 200)}`);
  }

  const id = getLessonId(fileName);
  const lessonData: LessonData = {
    id,
    fileName,
    title: parsed.title ?? fileName.replace(/\.pdf$/i, ''),
    topics: parsed.topics ?? [],
    processedAt: new Date().toISOString(),
    slides: parsed.slides ?? [],
    exercises: parsed.exercises ?? [],
  };

  // Try writing to content/lessons; fall back to /tmp/lessons when filesystem is read-only (serverless)
  try {
    fs.mkdirSync(LESSONS_DIR, { recursive: true });
    fs.writeFileSync(getLessonPath(id), JSON.stringify(lessonData, null, 2), 'utf-8');
  } catch (writeErr) {
    const e = writeErr as NodeJS.ErrnoException;
    if (e.code === 'EROFS' || e.code === 'EACCES') {
      fs.mkdirSync(TMP_LESSONS_DIR, { recursive: true });
      fs.writeFileSync(
        path.join(TMP_LESSONS_DIR, `${id}.json`),
        JSON.stringify(lessonData, null, 2),
        'utf-8'
      );
    } else {
      throw writeErr;
    }
  }

  return lessonData;
}
