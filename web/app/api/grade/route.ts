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

function cut(s: string, max: number) {
  return s && s.length > max ? s.slice(0, max) + '…' : (s ?? '');
}

function buildEssayGradePrompt(req: GradeRequest): string {
  const subjectLabel: Record<string, string> = {
    'ngu-van': 'Ngữ văn 9',
    'hoa-hoc': 'Hoá học 10',
    'dia-ly': 'Địa lý 10',
  };
  const subj = subjectLabel[req.subject ?? ''] ?? 'môn học';
  const keyPoints = (req.correctSteps ?? []).slice(0, 4)
    .map((s, i) => `${i + 1}. ${cut(s, 80)}`).join('\n');
  const answer = cut(req.essayAnswer || '', 800);

  return `GV ${subj}. Chấm bài HS, trả JSON duy nhất.

ĐỀ: ${cut(req.question, 200)}
Ý CHÍNH CẦN CÓ:
${keyPoints}
BÀI HS: ${answer || '(trống)'}

Trả đúng cấu trúc JSON sau, không kèm text:
{"stepFeedback":[],"answerCorrect":true,"answerFeedback":"","overallFeedback":"nhận xét 2 câu","score":7,"modelSolution":{"steps":["đoạn văn mẫu 1","đoạn văn mẫu 2"],"answer":"","unit":"","explanation":"1 câu tóm tắt"},"diagram":null}

score: 0-10 (9-10=đủ ý+dẫn chứng+sâu; 7-8=khá; 5-6=thiếu phân tích; <5=yếu). answerCorrect=true nếu score>=5. modelSolution.steps: đoạn văn hoàn chỉnh.`;
}

function buildGradePrompt(req: GradeRequest): string {
  const studentSteps = (req.studentSteps ?? []).slice(0, 4)
    .map((s, i) => `B${i + 1}: ${cut(s, 80)}`).join('\n');

  return `GV toán lớp 5. Chấm bài, trả JSON duy nhất.

ĐỀ: ${cut(req.question, 200)}
ĐÁP ÁN: ${cut(req.correctAnswer ?? '', 30)} ${cut(req.correctUnit ?? '', 10)}
BÀI HS:
${studentSteps || '(trống)'}
KQ HS: ${cut(req.studentNumber ?? '', 20)} ${cut(req.studentUnit ?? '', 10)}

Trả đúng cấu trúc JSON sau, không kèm text:
{"stepFeedback":[{"step":"bước hs viết","isCorrect":true,"comment":"nhận xét"}],"answerCorrect":false,"answerFeedback":"nhận xét đáp án","overallFeedback":"1 câu động viên","score":7,"modelSolution":{"steps":["B1:...","B2:..."],"answer":"${cut(req.correctAnswer ?? '', 20)}","unit":"${cut(req.correctUnit ?? '', 10)}","explanation":"giải thích ngắn"},"diagram":null}

stepFeedback: 1 phần tử/bước hs viết (rỗng nếu không có). score: 0-10. diagram: null.`;
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
        max_tokens: 1024,
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
      feedback = {
        stepFeedback: Array.isArray(raw.stepFeedback) ? raw.stepFeedback : [],
        answerCorrect: Boolean(raw.answerCorrect),
        answerFeedback: raw.answerFeedback ?? '',
        overallFeedback: raw.overallFeedback ?? '',
        score: typeof raw.score === 'number' ? raw.score : 5,
        modelSolution: {
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
      return NextResponse.json({ error: 'AI trả về dữ liệu không hợp lệ' }, { status: 500 });
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
