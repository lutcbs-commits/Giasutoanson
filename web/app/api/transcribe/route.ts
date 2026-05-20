import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

export async function POST(req: NextRequest) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'API key not configured' }, { status: 500 });

  try {
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File | null;
    if (!audioFile || audioFile.size === 0) {
      return NextResponse.json({ error: 'No audio provided' }, { status: 400 });
    }

    const groq = new Groq({ apiKey });
    const transcription = await groq.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-large-v3',
      response_format: 'json',
      language: 'en',
    });

    return NextResponse.json({ text: transcription.text });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
