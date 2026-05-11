import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// GET /api/students?name=Son → lấy hoặc tạo student, kèm progress
export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get('name')?.trim();
  if (!name) {
    return NextResponse.json({ error: 'Thiếu tên học sinh' }, { status: 400 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ student: { id: 'local', name }, sessions: [], noDb: true });
  }

  // Upsert student
  const { data: student, error: upsertErr } = await supabase
    .from('students')
    .upsert({ name }, { onConflict: 'name' })
    .select()
    .single();

  if (upsertErr || !student) {
    return NextResponse.json({ error: 'Lỗi tạo học sinh' }, { status: 500 });
  }

  // Lấy lịch sử phiên học (theo ngày)
  const { data: sessions } = await supabase
    .from('learning_sessions')
    .select('*, lessons(title)')
    .eq('student_id', student.id)
    .order('session_date', { ascending: false })
    .limit(30);

  return NextResponse.json({ student, sessions: sessions ?? [] });
}
