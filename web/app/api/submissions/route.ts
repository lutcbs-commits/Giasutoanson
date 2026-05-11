import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { GradeFeedback } from '@/lib/lessonTypes';

interface SubmitBody {
  studentName: string;
  lessonId: string;
  exerciseId: number;
  exerciseQuestion: string;
  answerSteps: string[];
  answerNumber: string;
  answerUnit: string;
  isCorrect: boolean;
  score: number;
  feedback: GradeFeedback;
}

export async function POST(req: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ success: true, noDb: true });
  }

  try {
    const body = await req.json() as SubmitBody;

    // Get or create student
    const { data: student, error: studentErr } = await supabase
      .from('students')
      .upsert({ name: body.studentName }, { onConflict: 'name' })
      .select()
      .single();

    if (studentErr || !student) {
      return NextResponse.json({ error: 'Lỗi lưu học sinh' }, { status: 500 });
    }

    // Save submission
    await supabase.from('submissions').insert({
      student_id: student.id,
      lesson_id: body.lessonId,
      exercise_id: body.exerciseId,
      exercise_question: body.exerciseQuestion,
      answer_steps: body.answerSteps,
      answer_number: body.answerNumber,
      answer_unit: body.answerUnit,
      is_correct: body.isCorrect,
      score: body.score,
      ai_feedback: body.feedback,
    });

    // Upsert session for today
    const today = new Date().toISOString().split('T')[0];
    const { data: existing } = await supabase
      .from('learning_sessions')
      .select()
      .eq('student_id', student.id)
      .eq('lesson_id', body.lessonId)
      .eq('session_date', today)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('learning_sessions')
        .update({
          problems_attempted: existing.problems_attempted + 1,
          problems_correct: existing.problems_correct + (body.isCorrect ? 1 : 0),
        })
        .eq('id', existing.id);
    } else {
      await supabase.from('learning_sessions').insert({
        student_id: student.id,
        lesson_id: body.lessonId,
        session_date: today,
        problems_attempted: 1,
        problems_correct: body.isCorrect ? 1 : 0,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
