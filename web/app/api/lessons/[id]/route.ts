import { NextRequest, NextResponse } from 'next/server';
import { loadLesson, lessonExists } from '@/lib/pdfProcessor';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id || id.includes('..') || id.includes('/') || id.includes('\\')) {
    return NextResponse.json({ error: 'ID không hợp lệ' }, { status: 400 });
  }

  if (!lessonExists(id)) {
    return NextResponse.json(
      { error: 'Bài học chưa được xử lý. Vui lòng xử lý PDF trước.' },
      { status: 404 }
    );
  }

  const lesson = loadLesson(id);
  if (!lesson) {
    return NextResponse.json(
      { error: 'Không thể đọc dữ liệu bài học.' },
      { status: 500 }
    );
  }

  return NextResponse.json(lesson);
}
