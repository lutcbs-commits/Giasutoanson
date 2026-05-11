import { NextRequest, NextResponse } from 'next/server';
import { processLesson, getLessonId } from '@/lib/pdfProcessor';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { fileName?: string };
    const { fileName } = body;

    if (!fileName || typeof fileName !== 'string') {
      return NextResponse.json(
        { error: 'Thiếu tham số fileName' },
        { status: 400 }
      );
    }

    if (!fileName.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json(
        { error: 'Chỉ hỗ trợ file PDF' },
        { status: 400 }
      );
    }

    if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
      return NextResponse.json(
        { error: 'Tên file không hợp lệ' },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY chưa được cấu hình. Vui lòng thêm vào file .env.local' },
        { status: 500 }
      );
    }

    const lesson = await processLesson(fileName);
    return NextResponse.json({
      success: true,
      lesson: {
        id: lesson.id,
        fileName: lesson.fileName,
        title: lesson.title,
        topics: lesson.topics,
        slideCount: lesson.slides.length,
        exerciseCount: lesson.exercises.length,
        processedAt: lesson.processedAt,
      },
    });
  } catch (error) {
    const message = (error as Error).message ?? 'Lỗi không xác định';
    return NextResponse.json(
      { error: `Xử lý thất bại: ${message}` },
      { status: 500 }
    );
  }
}
