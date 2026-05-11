import { NextResponse } from 'next/server';
import { listLessons, loadLesson } from '@/lib/pdfProcessor';

export async function GET() {
  try {
    const lessons = listLessons();
    const result = lessons.map(({ id, fileName, processed }) => {
      if (processed) {
        const data = loadLesson(id);
        return {
          id,
          fileName,
          processed: true,
          title: data?.title ?? fileName,
          topics: data?.topics ?? [],
          slideCount: data?.slides?.length ?? 0,
          exerciseCount: data?.exercises?.length ?? 0,
          processedAt: data?.processedAt ?? null,
        };
      }
      return {
        id,
        fileName,
        processed: false,
        title: fileName.replace(/\.pdf$/i, ''),
        topics: [],
        slideCount: 0,
        exerciseCount: 0,
        processedAt: null,
      };
    });

    return NextResponse.json({ lessons: result, total: result.length });
  } catch (error) {
    return NextResponse.json(
      { lessons: [], total: 0, error: `Lỗi khi đọc danh sách bài học: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}
