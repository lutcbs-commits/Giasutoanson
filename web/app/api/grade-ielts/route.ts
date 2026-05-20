import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import type { IELTSGradeFeedback } from '@/lib/lessonTypes';

interface IELTSGradeRequest {
  taskType: 'writing-task1' | 'writing-task2' | 'speaking';
  prompt: string;
  studentResponse: string;
  wordCount?: number;
  partNumber?: number;
}

function buildWritingPrompt(req: IELTSGradeRequest): string {
  const isTask1 = req.taskType === 'writing-task1';
  const criterionName = isTask1 ? 'Task Achievement' : 'Task Response';

  return `You are an expert IELTS examiner with Band 9.0 who has been teaching for 15+ years. Grade this student's IELTS Writing ${isTask1 ? 'Task 1' : 'Task 2'} response.

TASK PROMPT:
${req.prompt}

STUDENT RESPONSE (${req.wordCount ?? '?'} words):
${req.studentResponse}

Grade each criterion from 0 to 9 (use 0.5 increments — e.g. 4.5, 5.0, 5.5):

1. ${criterionName}: ${isTask1
  ? 'Does the student cover all key features? Is there a clear overview?'
  : 'Does the student fully address all parts of the task? Is the position clear and developed?'}
2. Coherence and Cohesion: Is information logically organised? Are paragraphs clear? Are linking words used accurately?
3. Lexical Resource: Is vocabulary varied and accurate? Any spelling errors or word-form mistakes?
4. Grammatical Range and Accuracy: Is there variety in sentence structures? How frequent and serious are the grammatical errors?

Return ONLY valid JSON, no other text:
{
  "taskAchievement": { "score": 5.0, "feedback": "2-3 specific sentences in Vietnamese about what they did well and what needs improvement" },
  "coherenceCohesion": { "score": 5.0, "feedback": "..." },
  "lexicalResource": { "score": 5.0, "feedback": "..." },
  "grammaticalRange": { "score": 5.0, "feedback": "..." },
  "overallBand": 5.0,
  "overallFeedback": "2-3 sentences in Vietnamese summarising the response and the 1-2 most important things to improve",
  "improvedParagraph": "Rewrite the WORST paragraph from the student's response to demonstrate band 6.0 quality — keep similar content but fix all errors and improve vocabulary/structure"
}`;
}

function buildSpeakingPrompt(req: IELTSGradeRequest): string {
  return `You are an expert IELTS examiner with Band 9.0. Grade this IELTS Speaking response (Part ${req.partNumber ?? 2}).

TOPIC / QUESTION:
${req.prompt}

STUDENT'S TYPED RESPONSE:
${req.studentResponse}

Note: The student typed their answer instead of speaking. Assess the CONTENT, VOCABULARY, and GRAMMAR from the text. For Fluency & Coherence, evaluate how well-organised and natural the ideas flow.

Grade each criterion from 0 to 9 (use 0.5 increments):
1. Fluency & Coherence: Are ideas logically connected? Does the response address all parts of the question?
2. Lexical Resource: Is vocabulary appropriate, varied? Any topic-specific words used correctly?
3. Grammatical Range & Accuracy: Variety and accuracy of grammatical structures.
4. (Pronunciation): Based on word choice and sentence structure, give an estimated score — assume average pronunciation for band level.

Return ONLY valid JSON:
{
  "taskAchievement": { "score": 5.0, "feedback": "In Vietnamese: 2-3 specific sentences on content quality" },
  "coherenceCohesion": { "score": 5.0, "feedback": "In Vietnamese: fluency and organisation feedback" },
  "lexicalResource": { "score": 5.0, "feedback": "In Vietnamese: vocabulary feedback with specific examples from their text" },
  "grammaticalRange": { "score": 5.0, "feedback": "In Vietnamese: grammar feedback, list 1-2 specific errors and corrections" },
  "overallBand": 5.0,
  "overallFeedback": "In Vietnamese: 2-3 sentences overall, encouraging tone for a student aiming for band 5.5",
  "improvedParagraph": "Rewrite their weakest part to show how a band 5.5-6.0 speaker would say it"
}`;
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GROQ_API_KEY chưa cấu hình' }, { status: 500 });
    }

    const body = await req.json() as IELTSGradeRequest;
    if (!body.studentResponse?.trim()) {
      return NextResponse.json({ error: 'Chưa có bài viết để chấm' }, { status: 400 });
    }

    const groq = new Groq({ apiKey });
    const prompt = body.taskType === 'speaking'
      ? buildSpeakingPrompt(body)
      : buildWritingPrompt(body);

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    });

    const rawText = completion.choices[0]?.message?.content ?? '';
    let jsonStr = rawText.trim();
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```[a-z]*\n?/, '').replace(/\n?```$/, '');
    }

    const raw = JSON.parse(jsonStr);
    const feedback: IELTSGradeFeedback = {
      taskAchievement: {
        score: typeof raw.taskAchievement?.score === 'number' ? raw.taskAchievement.score : 5,
        feedback: raw.taskAchievement?.feedback ?? '',
      },
      coherenceCohesion: {
        score: typeof raw.coherenceCohesion?.score === 'number' ? raw.coherenceCohesion.score : 5,
        feedback: raw.coherenceCohesion?.feedback ?? '',
      },
      lexicalResource: {
        score: typeof raw.lexicalResource?.score === 'number' ? raw.lexicalResource.score : 5,
        feedback: raw.lexicalResource?.feedback ?? '',
      },
      grammaticalRange: {
        score: typeof raw.grammaticalRange?.score === 'number' ? raw.grammaticalRange.score : 5,
        feedback: raw.grammaticalRange?.feedback ?? '',
      },
      overallBand: typeof raw.overallBand === 'number' ? raw.overallBand : 5,
      overallFeedback: raw.overallFeedback ?? '',
      improvedParagraph: raw.improvedParagraph ?? '',
    };

    return NextResponse.json({ success: true, feedback });
  } catch (error) {
    const err = error as Error;
    console.error('Grade IELTS API error:', err.message);
    return NextResponse.json({ error: `Lỗi chấm bài IELTS: ${err.message}` }, { status: 500 });
  }
}
