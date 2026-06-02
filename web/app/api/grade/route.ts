import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import type { GradeFeedback } from '@/lib/lessonTypes';

interface GradeRequest {
  question: string;
  correctSteps: string[];
  correctAnswer: string;
  correctUnit?: string;
  studentSteps?: string[];
  studentNumber?: string;
  studentUnit?: string;
  subject?: string;
  essayAnswer?: string;
}

function buildEssayGradePrompt(req: GradeRequest): string {
  const keyPoints = (req.correctSteps ?? []).join('\n');
  const subjectLabel: Record<string, string> = {
    'ngu-van': 'Ngữ văn lớp 9',
    'hoa-hoc': 'Hoá học lớp 10',
    'dia-ly': 'Địa lý lớp 10',
  };
  const teacher = subjectLabel[req.subject ?? ''] ?? 'giáo viên giàu kinh nghiệm';
  return `Bạn là giáo viên ${teacher} giàu kinh nghiệm.

ĐỀ BÀI:
${req.question}

CÁC Ý CHÍNH CẦN CÓ TRONG BÀI LÀM:
${keyPoints}

BÀI LÀM CỦA HỌC SINH:
${req.essayAnswer || '(Học sinh không viết gì)'}

Hãy chấm bài và trả về JSON với cấu trúc CHÍNH XÁC sau (không có text nào khác):

{
  "stepFeedback": [],
  "answerCorrect": true,
  "answerFeedback": "",
  "overallFeedback": "Nhận xét chung 2–3 câu: điểm mạnh, điểm cần cải thiện, lời động viên",
  "score": 7,
  "modelSolution": {
    "steps": [
      "Đoạn 1 lời giải mẫu (viết thành đoạn văn đầy đủ, không phải gạch đầu dòng)",
      "Đoạn 2 lời giải mẫu (tiếp theo, nếu cần)",
      "Đoạn 3 lời giải mẫu (kết luận)"
    ],
    "answer": "",
    "unit": "",
    "explanation": "1 câu tóm tắt điểm cốt lõi của bài"
  },
  "diagram": null
}

HƯỚNG DẪN CHẤM:
- score 9–10: Đủ ý chính, có dẫn chứng cụ thể, phân tích sâu, có cảm xúc, diễn đạt tốt
- score 7–8: Đủ ý chính, có dẫn chứng, phân tích khá
- score 5–6: Có ý nhưng thiếu dẫn chứng hoặc phân tích còn nông
- score 3–4: Thiếu nhiều ý, hoặc chỉ kể lại không phân tích
- score 0–2: Không viết hoặc lạc đề hoàn toàn
- answerCorrect: true nếu score >= 5
- modelSolution.steps: Viết lời giải mẫu dạng đoạn văn hoàn chỉnh (như bài văn thật), KHÔNG phải gạch đầu dòng. Mỗi phần tử là một đoạn văn.
- Dùng ngôn ngữ thân thiện, khuyến khích học sinh
- Output CHỈ là JSON thuần túy`;
}

function buildGradePrompt(req: GradeRequest): string {
  const steps = Array.isArray(req.studentSteps) ? req.studentSteps : [];
  const correctSteps = Array.isArray(req.correctSteps) ? req.correctSteps : [];
  const studentStepsText = steps
    .map((s, i) => `Bước ${i + 1}: ${s}`)
    .join('\n');
  const correctStepsText = correctSteps.length > 0
    ? correctSteps.map((s, i) => `Bước ${i + 1}: ${s}`).join('\n')
    : '(Hãy tự xây dựng lời giải mẫu phù hợp với đề bài)';

  return `Bạn là giáo viên toán lớp 5. Hãy chấm bài làm của học sinh và trả về JSON.

ĐỀ BÀI: ${req.question}

ĐÁP ÁN ĐÚNG:
${correctStepsText}
Kết quả: ${req.correctAnswer ?? '?'} ${req.correctUnit ?? ''}

BÀI LÀM CỦA HỌC SINH:
${studentStepsText || '(Học sinh không viết lời giải)'}
Kết quả học sinh ghi: ${req.studentNumber || '(trống)'} ${req.studentUnit || ''}

Hãy chấm bài và trả về JSON với cấu trúc CHÍNH XÁC sau (không có text nào khác):

{
  "stepFeedback": [
    {
      "step": "nội dung bước học sinh viết (hoặc '(không có)' nếu bỏ trống)",
      "isCorrect": true,
      "comment": "nhận xét ngắn về bước này"
    }
  ],
  "answerCorrect": false,
  "answerFeedback": "nhận xét về đáp án học sinh ghi",
  "overallFeedback": "nhận xét chung 1-2 câu, khuyến khích học sinh",
  "score": 7,
  "modelSolution": {
    "steps": ["Bước 1: ...", "Bước 2: ...", "Bước 3: ..."],
    "answer": "${req.correctAnswer}",
    "unit": "${req.correctUnit}",
    "explanation": "Giải thích ngắn tại sao làm như vậy"
  },
  "diagram": null
}

LƯU Ý:
- stepFeedback: có đúng số phần tử bằng số bước học sinh đã viết (nếu không viết bước nào thì mảng rỗng [])
- answerCorrect: so sánh kỹ số và đơn vị học sinh ghi với đáp án đúng
- score: 0-10, chấm dựa trên lời giải (không chỉ đáp án cuối)
- diagram: null (để null, không cần vẽ)
- Dùng ngôn ngữ thân thiện, khuyến khích học sinh lớp 5
- Output CHỈ là JSON thuần túy`;
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GROQ_API_KEY chưa cấu hình' }, { status: 500 });
    }

    const body = await req.json() as GradeRequest;
    if (!body.question) {
      return NextResponse.json({ error: 'Thiếu dữ liệu câu hỏi' }, { status: 400 });
    }

    const isEssay = body.subject !== 'toan';
    const prompt = isEssay ? buildEssayGradePrompt(body) : buildGradePrompt(body);

    const groq = new Groq({ apiKey });
    let completion;
    try {
      completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
      });
    } catch (primaryErr) {
      const e = primaryErr as { status?: number };
      if (e.status === 429) {
        throw new Error('Groq đang bận (rate limit). Hãy thử lại sau 60 giây.');
      }
      throw primaryErr;
    }
    const rawText = completion.choices[0]?.message?.content ?? '';

    let feedback: GradeFeedback;
    try {
      let jsonStr = rawText.trim();
      if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/^```[a-z]*\n?/, '').replace(/\n?```$/, '');
      }
      const raw = JSON.parse(jsonStr);
      // Normalize để tránh undefined khi Gemini trả về thiếu fields
      feedback = {
        stepFeedback: Array.isArray(raw.stepFeedback) ? raw.stepFeedback : [],
        answerCorrect: Boolean(raw.answerCorrect),
        answerFeedback: raw.answerFeedback ?? '',
        overallFeedback: raw.overallFeedback ?? '',
        score: typeof raw.score === 'number' ? raw.score : 5,
        modelSolution: {
          // Always use authoritative correctSteps — never rely on AI to reproduce them
          steps: Array.isArray(body.correctSteps) && body.correctSteps.length > 0
            ? body.correctSteps
            : Array.isArray(raw.modelSolution?.steps) ? raw.modelSolution.steps : [],
          answer: raw.modelSolution?.answer ?? body.correctAnswer ?? '',
          unit: raw.modelSolution?.unit ?? body.correctUnit ?? '',
          explanation: raw.modelSolution?.explanation ?? '',
        },
        diagram: raw.diagram ?? null,
      };
    } catch {
      return NextResponse.json({ error: 'Gemini trả về dữ liệu không hợp lệ' }, { status: 500 });
    }

    return NextResponse.json({ success: true, feedback });
  } catch (error) {
    const err = error as Error;
    console.error('Grade API error:', err.name, err.message, err.cause);
    return NextResponse.json(
      { error: `Lỗi chấm bài: ${err.message}`, cause: String(err.cause ?? '') },
      { status: 500 }
    );
  }
}
