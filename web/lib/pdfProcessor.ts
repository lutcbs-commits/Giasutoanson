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
  return `Bạn là giáo viên toán tiểu học Việt Nam giàu kinh nghiệm, chuyên dạy lớp 5 chuẩn bị thi vào lớp 6.

Dựa vào nội dung tài liệu toán sau đây, hãy tạo bài học tương tác cho học sinh lớp 5.

TÊN FILE: ${fileName}

NỘI DUNG TÀI LIỆU:
${pdfText.slice(0, 14000)}

Hãy tạo output JSON với cấu trúc CHÍNH XÁC như sau (không có text nào khác ngoài JSON):

{
  "title": "Tên bài học ngắn gọn, hấp dẫn",
  "topics": ["chủ đề 1", "chủ đề 2"],
  "slides": [
    {
      "id": 1,
      "title": "Tiêu đề slide",
      "content": "Nội dung giải thích rõ ràng cho học sinh lớp 5\\nCó thể dùng \\n để xuống dòng",
      "keyFormula": "Công thức quan trọng nếu có (để trống string nếu không có)",
      "example": {
        "problem": "Ví dụ cụ thể từ tài liệu",
        "steps": ["Bước 1: ...", "Bước 2: ...", "Bước 3: ..."],
        "result": "Kết quả cuối cùng kèm đơn vị"
      },
      "miniGame": {
        "question": "Câu hỏi kiểm tra nhanh (CHỈ thêm miniGame cho 3-4 slides)",
        "options": ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"],
        "answer": "Đáp án đúng (phải là một trong 4 options)",
        "explanation": "Giải thích tại sao đáp án đó đúng"
      }
    }
  ],
  "exercises": [
    {
      "id": 1,
      "question": "Câu hỏi bài toán có lời văn, đầy đủ dữ kiện, lấy sát từ tài liệu",
      "correctSteps": [
        "Bước 1: Tính ... = ... (phép tính cụ thể)",
        "Bước 2: Tính ... = ... (phép tính cụ thể)",
        "Bước 3: Vậy đáp án là ..."
      ],
      "correctAnswer": "5",
      "correctUnit": "kg",
      "difficulty": "easy",
      "hint": "Gợi ý: Hãy đọc kỹ đề và xác định dữ kiện đã cho"
    }
  ]
}

YÊU CẦU:
- Tạo 6-10 slides lý thuyết từ cơ bản đến nâng cao
- keyFormula: để trống string "" nếu không có công thức
- example: null nếu slide không có ví dụ cụ thể
- miniGame: CHỈ thêm cho 3-4 slides, để null cho các slide còn lại
- Tạo 8-12 bài tập TỰ LUẬN lấy từ tài liệu, đa dạng từ dễ đến khó
- correctSteps: 2-5 bước giải chi tiết, mỗi bước ghi rõ phép tính
- correctAnswer: CHỈ ghi con số (ví dụ "5", "12.5", "120")
- correctUnit: đơn vị đo (ví dụ "kg", "cm", "m²", "giờ", "đồng", "" nếu không có đơn vị)
- difficulty: "easy", "medium", hoặc "hard"
- hint: gợi ý ngắn 1 câu giúp học sinh biết hướng làm
- Viết tất cả bằng tiếng Việt, ngôn ngữ thân thiện với học sinh lớp 5
- Output CHỈ là JSON thuần túy, không có markdown, không có backtick`;
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
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: buildPrompt(pdfText, fileName) }],
      temperature: 0.7,
    });
  } catch (primaryErr) {
    const e = primaryErr as { status?: number };
    if (e.status !== 429) throw primaryErr;
    completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: buildPrompt(pdfText, fileName) }],
      temperature: 0.7,
    });
  }
  const rawText = completion.choices[0]?.message?.content ?? '';

  let parsed: { title: string; topics: string[]; slides: LessonData['slides']; exercises: LessonData['exercises'] };
  try {
    let jsonStr = rawText.trim();
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```[a-z]*\n?/, '').replace(/\n?```$/, '');
    }
    parsed = JSON.parse(jsonStr);
  } catch {
    throw new Error('Gemini API trả về JSON không hợp lệ');
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
