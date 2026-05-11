import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import type { GradeFeedback } from '@/lib/lessonTypes';

interface GradeRequest {
  question: string;
  correctSteps: string[];
  correctAnswer: string;
  correctUnit: string;
  studentSteps: string[];
  studentNumber: string;
  studentUnit: string;
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

    const groq = new Groq({ apiKey });
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: buildGradePrompt(body) }],
      temperature: 0.3,
    });
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
          steps: Array.isArray(raw.modelSolution?.steps) ? raw.modelSolution.steps : [],
          answer: raw.modelSolution?.answer ?? '',
          unit: raw.modelSolution?.unit ?? '',
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
