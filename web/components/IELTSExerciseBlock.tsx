'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import type {
  IELTSExercise,
  IELTSReadingExercise,
  IELTSWritingExercise,
  IELTSListeningExercise,
  IELTSSpeakingExercise,
  IELTSGradeFeedback,
} from '@/lib/lessonTypes';
import { apiFetch } from '@/lib/apiFetch';

interface Props {
  exercise: IELTSExercise;
  exerciseNumber: number;
  totalExercises: number;
  onNext: (correct: boolean, feedback: IELTSGradeFeedback | null) => void;
}

const BAND_COLOR = (band: number) =>
  band >= 7 ? 'text-grass-700 bg-grass-50 border-grass-200' :
  band >= 5.5 ? 'text-sky-700 bg-sky-50 border-sky-200' :
  band >= 5 ? 'text-sun-700 bg-sun-50 border-sun-200' :
  'text-red-600 bg-red-50 border-red-200';

// ── Reading Block ────────────────────────────────────────────────────────────

function ReadingBlock({ ex, onNext, exerciseNumber, totalExercises }: {
  ex: IELTSReadingExercise;
  onNext: Props['onNext'];
  exerciseNumber: number;
  totalExercises: number;
}) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const TFN_OPTIONS = ['TRUE', 'FALSE', 'NOT GIVEN'];

  function setAnswer(id: number, val: string) {
    setAnswers(prev => ({ ...prev, [id]: val }));
  }

  function handleSubmit() { setSubmitted(true); }

  const score = submitted
    ? ex.questions.filter(q => (answers[q.id] ?? '').trim().toUpperCase() === q.correctAnswer.toUpperCase()).length
    : 0;
  const total = ex.questions.length;
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <span className="font-black text-sky-800 text-sm">Câu {exerciseNumber}/{totalExercises} — 📖 Reading</span>
        <span className="text-xs font-bold px-3 py-1 rounded-full bg-sky-100 text-sky-700 border border-sky-200">
          Est. Band {ex.estimatedBand}
        </span>
      </div>

      {/* Passage */}
      <div className="bg-gray-50 border-2 border-gray-100 rounded-3xl p-5 shadow-sm">
        <p className="font-black text-gray-800 text-base mb-3">{ex.passageTitle}</p>
        <div className="max-h-72 overflow-y-auto pr-1">
          {ex.passage.split('\n\n').map((para, i) => (
            <p key={i} className="text-gray-700 text-sm leading-relaxed mb-3">{para}</p>
          ))}
        </div>
        {ex.hint && !submitted && (
          <div className="mt-3 bg-sky-50 border border-sky-200 rounded-xl p-3 text-xs text-sky-700 font-medium">
            💡 {ex.hint}
          </div>
        )}
      </div>

      {/* Questions */}
      {!submitted ? (
        <div className="flex flex-col gap-4">
          {ex.questions.map((q, qi) => (
            <div key={q.id} className="bg-white border-2 border-gray-100 rounded-2xl p-4 shadow-sm">
              <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Câu {qi + 1}</p>

              {q.type === 'true-false-ng' && (
                <>
                  <p className="text-sm font-bold text-gray-700 mb-3 italic">"{q.statement}"</p>
                  <div className="flex flex-wrap gap-2">
                    {TFN_OPTIONS.map(opt => (
                      <button key={opt} onClick={() => setAnswer(q.id, opt)}
                        className={`px-4 py-2 rounded-xl font-bold text-sm border-2 transition-all ${
                          answers[q.id] === opt
                            ? opt === 'TRUE' ? 'bg-grass-500 text-white border-grass-500'
                              : opt === 'FALSE' ? 'bg-red-500 text-white border-red-500'
                              : 'bg-gray-600 text-white border-gray-600'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                        }`}>
                        {opt}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {q.type === 'multiple-choice' && (
                <>
                  <p className="text-sm font-bold text-gray-700 mb-3">{q.question}</p>
                  <div className="flex flex-col gap-2">
                    {(q.options ?? []).map(opt => {
                      const letter = opt.split('.')[0];
                      return (
                        <button key={opt} onClick={() => setAnswer(q.id, letter)}
                          className={`text-left px-4 py-2.5 rounded-xl border-2 font-medium text-sm transition-all ${
                            answers[q.id] === letter
                              ? 'bg-sky-500 text-white border-sky-500'
                              : 'bg-white text-gray-700 border-gray-200 hover:border-sky-300'
                          }`}>
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}

              {q.type === 'sentence-completion' && (
                <>
                  <p className="text-sm font-bold text-gray-700 mb-3">
                    {q.blankBefore} <span className="underline decoration-dotted text-sky-600">_______</span> {q.blankAfter}
                  </p>
                  <input
                    type="text"
                    value={answers[q.id] ?? ''}
                    onChange={e => setAnswer(q.id, e.target.value)}
                    placeholder="Type your answer..."
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-2.5 text-gray-800 font-medium text-sm focus:outline-none focus:border-sky-400"
                  />
                </>
              )}
            </div>
          ))}

          <button onClick={handleSubmit}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-br from-sky-500 to-sky-600 text-white font-black py-4 rounded-2xl hover:shadow-lg transition-all hover:-translate-y-0.5 active:scale-95">
            📤 Submit Answers
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4 animate-fade-up">
          {/* Score */}
          <div className={`flex items-center gap-4 rounded-3xl p-5 border-2 ${BAND_COLOR(score / total * 9)}`}>
            <div className="text-4xl font-black">{score}/{total}</div>
            <div>
              <p className="font-black text-lg">{pct}% correct</p>
              <p className="text-sm font-medium opacity-75">
                {pct >= 80 ? 'Excellent! Keep it up!' : pct >= 60 ? 'Good effort! Review the wrong answers.' : 'Keep practising — review the explanations below.'}
              </p>
            </div>
          </div>

          {/* Answer review */}
          {ex.questions.map((q, qi) => {
            const userAns = (answers[q.id] ?? '').trim().toUpperCase();
            const correct = userAns === q.correctAnswer.toUpperCase();
            return (
              <div key={q.id} className={`rounded-2xl p-4 border-2 ${correct ? 'bg-grass-50 border-grass-200' : 'bg-red-50 border-red-200'}`}>
                <div className="flex items-start gap-2 mb-2">
                  <span className={`shrink-0 w-6 h-6 rounded-full text-white text-xs font-black flex items-center justify-center mt-0.5 ${correct ? 'bg-grass-500' : 'bg-red-400'}`}>
                    {correct ? '✓' : '✗'}
                  </span>
                  <div className="flex-1">
                    <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-1">Q{qi + 1} {q.type.replace(/-/g, ' ').toUpperCase()}</p>
                    {q.statement && <p className="text-sm font-bold text-gray-700 italic mb-1">"{q.statement}"</p>}
                    {q.question && <p className="text-sm font-bold text-gray-700 mb-1">{q.question}</p>}
                    {(q.blankBefore || q.blankAfter) && (
                      <p className="text-sm text-gray-600 mb-1">{q.blankBefore} ___ {q.blankAfter}</p>
                    )}
                    <div className="flex items-center gap-3 text-sm font-bold">
                      <span className={correct ? 'text-grass-700' : 'text-red-600'}>
                        Your answer: {answers[q.id] || '(no answer)'}
                      </span>
                      {!correct && <span className="text-grass-700">✓ {q.correctAnswer}</span>}
                    </div>
                    <p className="text-xs text-gray-500 mt-1 font-medium">{q.explanation}</p>
                  </div>
                </div>
              </div>
            );
          })}

          <button onClick={() => onNext(pct >= 60, null)}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-br from-grass-500 to-grass-600 text-white font-black py-3 rounded-2xl hover:shadow-lg transition-all hover:-translate-y-0.5 active:scale-95">
            {exerciseNumber < totalExercises ? '🎯 Next Exercise →' : '🏆 Finish!'}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Writing Block ─────────────────────────────────────────────────────────────

function WritingBlock({ ex, onNext, exerciseNumber, totalExercises }: {
  ex: IELTSWritingExercise;
  onNext: Props['onNext'];
  exerciseNumber: number;
  totalExercises: number;
}) {
  const [response, setResponse] = useState('');
  const [grading, setGrading] = useState(false);
  const [feedback, setFeedback] = useState<IELTSGradeFeedback | null>(null);
  const [showModel, setShowModel] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wordCount = response.trim().split(/\s+/).filter(Boolean).length;
  const submitted = feedback !== null;

  async function handleGrade() {
    setError(null);
    setGrading(true);
    try {
      const res = await apiFetch('/api/grade-ielts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskType: ex.taskType === 'task1' ? 'writing-task1' : 'writing-task2',
          prompt: ex.prompt + (ex.imageDescription ? '\n\n' + ex.imageDescription : ''),
          studentResponse: response,
          wordCount,
        }),
      });
      const data = await res.json() as { success?: boolean; feedback?: IELTSGradeFeedback; error?: string };
      if (data.feedback) setFeedback(data.feedback);
      else setError(data.error ?? 'Could not grade. Please try again.');
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setGrading(false);
    }
  }

  const criteriaLabels: Record<string, string> = {
    taskAchievement: ex.taskType === 'task1' ? 'Task Achievement' : 'Task Response',
    coherenceCohesion: 'Coherence & Cohesion',
    lexicalResource: 'Lexical Resource',
    grammaticalRange: 'Grammar Range & Accuracy',
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <span className="font-black text-violet-800 text-sm">Câu {exerciseNumber}/{totalExercises} — ✍️ Writing {ex.taskType === 'task1' ? 'Task 1' : 'Task 2'}</span>
        <span className="text-xs font-bold px-3 py-1 rounded-full bg-violet-100 text-violet-700 border border-violet-200">
          Min {ex.wordLimit} words
        </span>
      </div>

      {/* Task prompt */}
      <div className="bg-white border-2 border-violet-100 rounded-3xl p-5 shadow-sm">
        <p className="text-xs font-black text-violet-600 uppercase tracking-wider mb-2">TASK PROMPT</p>
        <p className="text-gray-800 text-sm font-medium leading-relaxed whitespace-pre-line">{ex.prompt}</p>
        {ex.imageDescription && (
          <div className="mt-4 bg-violet-50 border border-violet-200 rounded-xl p-3">
            <p className="text-xs font-black text-violet-700 uppercase tracking-wider mb-2">DATA (use these in your response)</p>
            <pre className="text-xs text-gray-700 font-mono whitespace-pre-wrap overflow-x-auto">{ex.imageDescription}</pre>
          </div>
        )}
      </div>

      {/* Writing area */}
      {!submitted && (
        <div className="flex flex-col gap-3">
          <div className="relative">
            <textarea
              value={response}
              onChange={e => setResponse(e.target.value)}
              rows={12}
              placeholder={`Write your ${ex.taskType === 'task1' ? 'Task 1 report' : 'Task 2 essay'} here... (minimum ${ex.wordLimit} words)`}
              className="w-full rounded-2xl border-2 border-gray-200 px-4 py-3 text-gray-800 font-medium text-sm leading-relaxed focus:outline-none focus:border-violet-400 resize-y"
            />
            <div className={`absolute bottom-3 right-3 text-xs font-black px-2 py-1 rounded-lg ${
              wordCount >= ex.wordLimit ? 'bg-grass-100 text-grass-700' : 'bg-gray-100 text-gray-500'
            }`}>
              {wordCount} / {ex.wordLimit} words
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600 font-medium">{error}</div>
          )}

          <div className="flex gap-3">
            <button onClick={() => setShowModel(v => !v)}
              className="flex-1 flex items-center justify-center gap-2 bg-violet-50 border-2 border-violet-200 text-violet-700 font-bold py-3 rounded-2xl hover:bg-violet-100 transition-all text-sm">
              📖 {showModel ? 'Hide' : 'View'} Model Answer
            </button>
            <button onClick={handleGrade} disabled={grading || wordCount < 30}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-br from-violet-500 to-violet-600 text-white font-black py-3 rounded-2xl hover:shadow-lg transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-sm">
              {grading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Grading...
                </>
              ) : '🎯 Get AI Feedback'}
            </button>
          </div>

          {showModel && (
            <div className="bg-violet-50 border-2 border-violet-200 rounded-2xl p-4 animate-fade-up">
              <p className="text-xs font-black text-violet-700 uppercase tracking-wider mb-2">📖 Model Answer (Band {ex.estimatedBand})</p>
              <p className="text-sm text-gray-700 font-medium leading-relaxed whitespace-pre-wrap">{ex.modelAnswer}</p>
            </div>
          )}
        </div>
      )}

      {/* Feedback */}
      {submitted && feedback && (
        <div className="flex flex-col gap-4 animate-fade-up">
          {/* Overall band */}
          <div className={`flex items-center gap-4 rounded-3xl p-5 border-2 ${BAND_COLOR(feedback.overallBand)}`}>
            <div className="text-center shrink-0">
              <div className="text-3xl font-black">{feedback.overallBand.toFixed(1)}</div>
              <div className="text-xs font-bold opacity-70">Overall Band</div>
            </div>
            <p className="text-sm font-medium leading-relaxed">{feedback.overallFeedback}</p>
          </div>

          {/* Criteria breakdown */}
          <div className="bg-white border-2 border-gray-100 rounded-3xl p-5 shadow-sm">
            <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-4">IELTS Criteria Breakdown</p>
            <div className="flex flex-col gap-3">
              {(['taskAchievement', 'coherenceCohesion', 'lexicalResource', 'grammaticalRange'] as const).map(key => {
                const item = feedback[key];
                return (
                  <div key={key} className="rounded-2xl p-3 bg-gray-50 border border-gray-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-black text-gray-700">{criteriaLabels[key]}</span>
                      <span className={`text-sm font-black px-2 py-0.5 rounded-lg border ${BAND_COLOR(item.score)}`}>
                        Band {item.score.toFixed(1)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 font-medium leading-relaxed">{item.feedback}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Improved paragraph */}
          {feedback.improvedParagraph && (
            <div className="bg-sky-50 border-2 border-sky-200 rounded-3xl p-5">
              <p className="text-xs font-black text-sky-700 uppercase tracking-wider mb-2">💡 Improved Version</p>
              <p className="text-sm text-gray-700 font-medium leading-relaxed whitespace-pre-wrap">{feedback.improvedParagraph}</p>
            </div>
          )}

          {/* Model answer */}
          <div className="bg-violet-50 border-2 border-violet-200 rounded-3xl p-5">
            <p className="text-xs font-black text-violet-700 uppercase tracking-wider mb-2">📖 Model Answer (Band {ex.estimatedBand})</p>
            <p className="text-sm text-gray-700 font-medium leading-relaxed whitespace-pre-wrap">{ex.modelAnswer}</p>
          </div>

          <button onClick={() => onNext(feedback.overallBand >= 5.0, feedback)}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-br from-grass-500 to-grass-600 text-white font-black py-3 rounded-2xl hover:shadow-lg transition-all hover:-translate-y-0.5 active:scale-95">
            {exerciseNumber < totalExercises ? '🎯 Next Exercise →' : '🏆 Finish!'}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Listening Block ──────────────────────────────────────────────────────────

function ListeningBlock({ ex, onNext, exerciseNumber, totalExercises }: {
  ex: IELTSListeningExercise;
  onNext: Props['onNext'];
  exerciseNumber: number;
  totalExercises: number;
}) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [videoError, setVideoError] = useState(false);

  const ytParams = new URLSearchParams({ rel: '0', modestbranding: '1', ...(ex.startSeconds ? { start: String(ex.startSeconds) } : {}) });
  const ytSrc = `https://www.youtube-nocookie.com/embed/${ex.youtubeId}?${ytParams}`;
  const ytDirectUrl = `https://www.youtube.com/watch?v=${ex.youtubeId}${ex.startSeconds ? `&t=${ex.startSeconds}` : ''}`;

  function setAnswer(id: number, val: string) {
    setAnswers(prev => ({ ...prev, [id]: val }));
  }

  const score = submitted
    ? ex.questions.filter(q => (answers[q.id] ?? '').trim().toLowerCase() === q.correctAnswer.toLowerCase()).length
    : 0;
  const pct = ex.questions.length > 0 ? Math.round((score / ex.questions.length) * 100) : 0;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <span className="font-black text-tangerine-800 text-sm">Câu {exerciseNumber}/{totalExercises} — 🎧 Listening</span>
        <span className="text-xs font-bold px-3 py-1 rounded-full bg-tangerine-100 text-tangerine-700 border border-tangerine-200">
          Est. Band {ex.estimatedBand}
        </span>
      </div>

      <div className="bg-gray-800 rounded-3xl overflow-hidden shadow-lg">
        {videoError ? (
          <div className="aspect-video flex flex-col items-center justify-center gap-4 bg-gray-900 px-6 text-center">
            <div className="text-5xl">📹</div>
            <p className="text-white font-bold text-sm">Video không tải được trong trang này.</p>
            <a href={ytDirectUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-2.5 rounded-xl transition-colors text-sm">
              ▶ Mở trên YouTube
            </a>
          </div>
        ) : (
          <div className="aspect-video">
            <iframe
              src={ytSrc}
              title={ex.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
              onError={() => setVideoError(true)}
            />
          </div>
        )}
        <div className="flex items-center justify-end px-4 py-2">
          <a href={ytDirectUrl} target="_blank" rel="noopener noreferrer"
            className="text-xs text-gray-400 hover:text-white transition-colors font-medium">
            🔗 Xem trên YouTube
          </a>
        </div>
      </div>

      <div className="bg-tangerine-50 border-2 border-tangerine-200 rounded-2xl p-4">
        <p className="text-xs font-black text-tangerine-700 uppercase tracking-wider mb-1">What to listen for:</p>
        <p className="text-sm text-gray-700 font-medium">{ex.description}</p>
      </div>

      {/* Questions */}
      {!submitted ? (
        <div className="flex flex-col gap-4">
          {ex.questions.map((q, qi) => (
            <div key={q.id} className="bg-white border-2 border-gray-100 rounded-2xl p-4 shadow-sm">
              <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Q{qi + 1}</p>
              {q.type === 'multiple-choice' ? (
                <>
                  <p className="text-sm font-bold text-gray-700 mb-3">{q.questionText}</p>
                  <div className="flex flex-col gap-2">
                    {(q.options ?? []).map(opt => {
                      const letter = opt.split('.')[0];
                      return (
                        <button key={opt} onClick={() => setAnswer(q.id, letter)}
                          className={`text-left px-4 py-2.5 rounded-xl border-2 font-medium text-sm transition-all ${
                            answers[q.id] === letter ? 'bg-tangerine-500 text-white border-tangerine-500' : 'bg-white text-gray-700 border-gray-200 hover:border-tangerine-300'
                          }`}>
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm font-bold text-gray-700 mb-1">{q.questionText}</p>
                  {q.blankLabel && <p className="text-xs text-gray-500 font-bold mb-2 uppercase">{q.blankLabel}:</p>}
                  <input type="text" value={answers[q.id] ?? ''} onChange={e => setAnswer(q.id, e.target.value)}
                    placeholder="Your answer..."
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-2.5 text-gray-800 font-medium text-sm focus:outline-none focus:border-tangerine-400" />
                </>
              )}
            </div>
          ))}

          <button onClick={() => setSubmitted(true)}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-br from-tangerine-500 to-tangerine-600 text-white font-black py-4 rounded-2xl hover:shadow-lg transition-all hover:-translate-y-0.5">
            📤 Submit Answers
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4 animate-fade-up">
          <div className={`rounded-3xl p-5 border-2 flex items-center gap-4 ${BAND_COLOR(score / ex.questions.length * 9)}`}>
            <div className="text-4xl font-black">{score}/{ex.questions.length}</div>
            <p className="font-black text-lg">{pct}% correct</p>
          </div>

          {ex.questions.map((q, qi) => {
            const userAns = (answers[q.id] ?? '').trim().toLowerCase();
            const correct = userAns === q.correctAnswer.toLowerCase();
            return (
              <div key={q.id} className={`rounded-2xl p-4 border-2 ${correct ? 'bg-grass-50 border-grass-200' : 'bg-red-50 border-red-200'}`}>
                <div className="flex items-start gap-2">
                  <span className={`shrink-0 w-6 h-6 rounded-full text-white text-xs font-black flex items-center justify-center mt-0.5 ${correct ? 'bg-grass-500' : 'bg-red-400'}`}>
                    {correct ? '✓' : '✗'}
                  </span>
                  <div>
                    <p className="text-xs font-black text-gray-500 mb-1">Q{qi + 1} — {q.blankLabel ?? q.questionText}</p>
                    <div className="flex items-center gap-3 text-sm font-bold">
                      <span className={correct ? 'text-grass-700' : 'text-red-600'}>Your: {answers[q.id] || '(blank)'}</span>
                      {!correct && <span className="text-grass-700">✓ {q.correctAnswer}</span>}
                    </div>
                    <p className="text-xs text-gray-500 mt-1 font-medium">{q.explanation}</p>
                  </div>
                </div>
              </div>
            );
          })}

          {ex.transcript && (
            <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-4">
              <button onClick={() => setShowTranscript(v => !v)} className="text-xs font-black text-gray-600 hover:text-gray-800 flex items-center gap-1">
                📄 {showTranscript ? 'Hide' : 'Show'} Transcript
              </button>
              {showTranscript && (
                <pre className="mt-3 text-xs text-gray-600 font-medium whitespace-pre-wrap leading-relaxed">{ex.transcript}</pre>
              )}
            </div>
          )}

          <button onClick={() => onNext(pct >= 60, null)}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-br from-grass-500 to-grass-600 text-white font-black py-3 rounded-2xl hover:shadow-lg transition-all hover:-translate-y-0.5">
            {exerciseNumber < totalExercises ? '🎯 Next Exercise →' : '🏆 Finish!'}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Speaking Block ────────────────────────────────────────────────────────────

type RecordPhase = 'idle' | 'prep' | 'recording' | 'transcribing';
const FILLER_RE = /\b(um+|uh+|er+m?|hmm+|like|you know|kind of|sort of|basically|i mean|right)\b/gi;
const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

function SpeakingBlock({ ex, onNext, exerciseNumber, totalExercises }: {
  ex: IELTSSpeakingExercise;
  onNext: Props['onNext'];
  exerciseNumber: number;
  totalExercises: number;
}) {
  const [activeQ, setActiveQ] = useState(0);
  const [transcripts, setTranscripts] = useState<Record<number, string>>({});
  const [audioUrls, setAudioUrls] = useState<Record<number, string>>({});
  const [feedbacks, setFeedbacks] = useState<Record<number, IELTSGradeFeedback>>({});
  const [gradingIdx, setGradingIdx] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showModel, setShowModel] = useState(false);
  const [phase, setPhase] = useState<RecordPhase>('idle');
  const [prepLeft, setPrepLeft] = useState(0);
  const [recSeconds, setRecSeconds] = useState(0);
  const [bars, setBars] = useState<number[]>([0.15, 0.35, 0.25, 0.5, 0.2]);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const prepTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const activeQRef = useRef(activeQ);

  const prepTime = ex.part === 2 ? 60 : 0;
  const maxRecTime = ex.part === 2 ? 120 : 60;

  useEffect(() => { activeQRef.current = activeQ; }, [activeQ]);

  useEffect(() => {
    return () => {
      cleanupRecording();
      Object.values(audioUrls).forEach(u => { try { URL.revokeObjectURL(u); } catch {} });
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function cleanupRecording() {
    if (prepTimerRef.current) clearInterval(prepTimerRef.current);
    if (recTimerRef.current) clearInterval(recTimerRef.current);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    try { audioCtxRef.current?.close(); } catch {}
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
    streamRef.current?.getTracks().forEach(t => t.stop());
  }

  function switchQuestion(i: number) {
    if (phase === 'recording') { cleanupRecording(); }
    setPhase('idle'); setPrepLeft(0); setRecSeconds(0);
    setBars([0.15, 0.35, 0.25, 0.5, 0.2]);
    setError(null); setActiveQ(i);
  }

  function startFlow() {
    setError(null);
    if (prepTime > 0) {
      setPhase('prep');
      setPrepLeft(prepTime);
      prepTimerRef.current = setInterval(() => {
        setPrepLeft(prev => {
          if (prev <= 1) { clearInterval(prepTimerRef.current!); doStartRecording(); return 0; }
          return prev - 1;
        });
      }, 1000);
    } else {
      doStartRecording();
    }
  }

  function skipPrep() {
    if (prepTimerRef.current) clearInterval(prepTimerRef.current);
    doStartRecording();
  }

  async function doStartRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      setPhase('recording');
      setRecSeconds(0);

      // Web Audio waveform visualizer
      try {
        const audioCtx = new AudioContext();
        audioCtxRef.current = audioCtx;
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        audioCtx.createMediaStreamSource(stream).connect(analyser);
        const tick = () => {
          const data = new Uint8Array(analyser.frequencyBinCount);
          analyser.getByteFrequencyData(data);
          const bw = Math.floor(data.length / 5);
          setBars(Array.from({ length: 5 }, (_, i) => {
            const slice = Array.from(data.slice(i * bw, (i + 1) * bw));
            return Math.max(0.06, slice.reduce((a, b) => a + b, 0) / slice.length / 255);
          }));
          animFrameRef.current = requestAnimationFrame(tick);
        };
        tick();
      } catch { /* visualizer optional */ }

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : '';
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      recorderRef.current = recorder;
      recorder.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };

      recorder.onstop = async () => {
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        if (recTimerRef.current) clearInterval(recTimerRef.current);
        try { audioCtxRef.current?.close(); } catch {}
        stream.getTracks().forEach(t => t.stop());
        setRecSeconds(0); setBars([0.15, 0.35, 0.25, 0.5, 0.2]);

        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        if (blob.size < 500) { setPhase('idle'); setError('Ghi âm quá ngắn. Hãy thử lại.'); return; }

        const qIdx = activeQRef.current;
        const url = URL.createObjectURL(blob);
        setAudioUrls(prev => { try { if (prev[qIdx]) URL.revokeObjectURL(prev[qIdx]); } catch {} return { ...prev, [qIdx]: url }; });

        setPhase('transcribing');
        try {
          const form = new FormData();
          const ext = (recorder.mimeType || '').includes('ogg') ? 'ogg' : 'webm';
          form.append('audio', blob, `speech.${ext}`);
          const res = await apiFetch('/api/transcribe', { method: 'POST', body: form });
          const data = await res.json() as { text?: string; error?: string };
          if (data.text) setTranscripts(prev => ({ ...prev, [qIdx]: data.text! }));
          else setError(data.error ?? 'Không nhận dạng được. Hãy gõ tay.');
        } catch { setError('Lỗi kết nối khi gửi audio.'); }
        setPhase('idle');
      };

      recorder.start(250);
      let secs = 0;
      recTimerRef.current = setInterval(() => {
        secs++; setRecSeconds(secs);
        if (secs >= maxRecTime) recorder.stop();
      }, 1000);
    } catch {
      setPhase('idle');
      setError('Không truy cập được micro. Kiểm tra quyền trình duyệt.');
    }
  }

  const currentQ = ex.followUpQuestions[activeQ];
  const currentTranscript = transcripts[activeQ] ?? '';
  const currentAudioUrl = audioUrls[activeQ] ?? '';
  const wordCount = currentTranscript.trim().split(/\s+/).filter(Boolean).length;
  const fillerCount = (currentTranscript.match(FILLER_RE) ?? []).length;
  const currentFeedback = feedbacks[activeQ];
  const recPct = maxRecTime > 0 ? Math.min(100, (recSeconds / maxRecTime) * 100) : 0;
  const prepPct = prepTime > 0 ? ((prepTime - prepLeft) / prepTime) * 100 : 0;

  async function handleGrade() {
    setError(null); setGradingIdx(activeQ);
    try {
      const prompt = ex.cueCard
        ? `Speaking Part ${ex.part} — Cue Card:\n${ex.cueCard}\n\nQuestion: ${currentQ}`
        : `Speaking Part ${ex.part} — Topic: ${ex.topic}\nQuestion: ${currentQ}`;
      const res = await apiFetch('/api/grade-ielts', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskType: 'speaking', prompt, studentResponse: currentTranscript, partNumber: ex.part }),
      });
      const data = await res.json() as { feedback?: IELTSGradeFeedback; error?: string };
      if (data.feedback) setFeedbacks(prev => ({ ...prev, [activeQ]: data.feedback! }));
      else setError(data.error ?? 'Could not grade. Please try again.');
    } catch { setError('Connection error.'); }
    finally { setGradingIdx(null); }
  }

  const done = Object.keys(feedbacks).length >= Math.min(ex.followUpQuestions.length, 2);

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <span className="font-black text-red-700 text-sm">Câu {exerciseNumber}/{totalExercises} — 🗣️ Speaking Part {ex.part}</span>
        <span className="text-xs font-bold px-3 py-1 rounded-full bg-red-100 text-red-700 border border-red-200">
          Band {ex.estimatedBand}+
        </span>
      </div>

      {/* Cue card */}
      {ex.cueCard && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-5 shadow-sm">
          <p className="text-xs font-black text-amber-700 uppercase tracking-wider mb-2">📋 CUE CARD</p>
          <p className="text-gray-800 text-sm font-medium leading-relaxed whitespace-pre-line">{ex.cueCard}</p>
        </div>
      )}

      {/* Tips */}
      <div className="bg-sky-50 border-2 border-sky-200 rounded-2xl p-4">
        <p className="text-xs font-black text-sky-700 uppercase tracking-wider mb-2">💡 Tips</p>
        <ul className="flex flex-col gap-1">
          {ex.tips.map((tip, i) => (
            <li key={i} className="text-xs text-sky-800 font-medium flex items-start gap-1.5">
              <span className="shrink-0 text-sky-500">•</span>{tip}
            </li>
          ))}
        </ul>
      </div>

      {/* Question tabs */}
      {ex.followUpQuestions.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {ex.followUpQuestions.map((_, i) => (
            <button key={i} onClick={() => switchQuestion(i)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border-2 transition-all ${
                activeQ === i ? 'bg-red-500 text-white border-red-500' : 'bg-white text-gray-600 border-gray-200 hover:border-red-300'
              } ${feedbacks[i] ? 'ring-2 ring-grass-400 ring-offset-1' : ''}`}>
              Q{i + 1} {feedbacks[i] ? '✓' : ''}
            </button>
          ))}
        </div>
      )}

      {/* Current question */}
      <div className="bg-white border-2 border-red-100 rounded-3xl p-5 shadow-sm">
        <p className="text-xs font-black text-red-600 uppercase tracking-wider mb-2">QUESTION {activeQ + 1}</p>
        <p className="font-bold text-gray-800 text-base">{currentQ}</p>
      </div>

      {/* ── Voice Interface ── */}

      {/* PREP phase */}
      {phase === 'prep' && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black text-amber-700 uppercase tracking-wider">⏱ Thời gian chuẩn bị</span>
            <span className="text-3xl font-black text-amber-700 font-mono tabular-nums">{prepLeft}s</span>
          </div>
          <div className="h-2 bg-amber-200 rounded-full overflow-hidden mb-4">
            <div className="h-full bg-amber-500 rounded-full transition-all duration-1000 ease-linear" style={{ width: `${prepPct}%` }} />
          </div>
          <p className="text-xs text-amber-800 font-medium mb-4">
            Đọc kỹ câu hỏi, ghi chú ý tưởng chính. Ghi âm tự động bắt đầu sau {prepLeft}s.
          </p>
          <button onClick={skipPrep}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-3 rounded-2xl transition-all text-sm shadow-md">
            🎤 Bắt đầu ngay
          </button>
        </div>
      )}

      {/* RECORDING phase */}
      {phase === 'recording' && (
        <div className="bg-gray-900 rounded-3xl p-5 shadow-xl">
          {/* Waveform bars */}
          <div className="flex items-end justify-center gap-1.5 mb-4" style={{ height: '52px' }}>
            {bars.map((h, i) => (
              <div key={i} className="w-3 rounded-full bg-red-400 transition-all duration-75"
                style={{ height: `${Math.max(6, Math.round(h * 46))}px` }} />
            ))}
          </div>
          {/* Timer row */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-red-400 font-bold text-sm font-mono flex items-center gap-2 tabular-nums">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
              </span>
              {fmt(recSeconds)}
            </span>
            <span className="text-gray-400 text-xs font-mono tabular-nums">{fmt(maxRecTime - recSeconds)} còn lại</span>
          </div>
          {/* Progress bar */}
          <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden mb-4">
            <div className="h-full bg-red-500 rounded-full transition-all duration-1000 ease-linear" style={{ width: `${recPct}%` }} />
          </div>
          <button onClick={() => recorderRef.current?.stop()}
            className="w-full bg-white/10 hover:bg-white/20 text-white font-black py-3 rounded-2xl transition-all border border-white/20 text-sm">
            ⏹ Dừng ghi âm
          </button>
        </div>
      )}

      {/* TRANSCRIBING phase */}
      {phase === 'transcribing' && (
        <div className="flex items-center justify-center gap-3 bg-violet-50 border-2 border-violet-200 rounded-2xl px-5 py-4">
          <svg className="animate-spin h-5 w-5 text-violet-500 shrink-0" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm font-bold text-violet-700">Đang nhận dạng giọng nói...</span>
        </div>
      )}

      {/* IDLE — start button (no transcript yet) */}
      {phase === 'idle' && !currentTranscript && (
        <button onClick={startFlow}
          className="w-full flex items-center justify-center gap-3 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-black py-4 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
          <span className="text-2xl">🎤</span>
          <span>Bắt đầu luyện tập</span>
          {prepTime > 0 && (
            <span className="ml-auto text-xs bg-red-900/30 px-2.5 py-1 rounded-xl font-bold">{prepTime}s chuẩn bị</span>
          )}
        </button>
      )}

      {/* IDLE — transcript + audio player (after recording) */}
      {phase === 'idle' && currentTranscript && (
        <>
          {/* Audio playback */}
          {currentAudioUrl && (
            <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-3">
              <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-2">🎧 Nghe lại câu trả lời</p>
              <audio src={currentAudioUrl} controls className="w-full h-10" />
            </div>
          )}

          {/* Transcript */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-black text-gray-500 uppercase tracking-wider">📝 Transcript (có thể sửa)</p>
              <div className="flex items-center gap-2">
                {fillerCount > 0 && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                    ⚠️ {fillerCount} filler{fillerCount > 1 ? 's' : ''}
                  </span>
                )}
                <span className="text-xs font-bold text-gray-400 tabular-nums">{wordCount}w</span>
                <button onClick={() => {
                  try { if (currentAudioUrl) URL.revokeObjectURL(currentAudioUrl); } catch {}
                  setTranscripts(prev => ({ ...prev, [activeQ]: '' }));
                  setAudioUrls(prev => ({ ...prev, [activeQ]: '' }));
                }} className="text-xs text-gray-400 hover:text-red-500 font-bold transition-colors">✕</button>
              </div>
            </div>
            <textarea
              value={currentTranscript}
              onChange={e => setTranscripts(prev => ({ ...prev, [activeQ]: e.target.value }))}
              rows={4}
              className="w-full rounded-2xl border-2 border-grass-300 bg-grass-50/20 px-4 py-3 text-gray-800 font-medium text-sm leading-relaxed focus:outline-none focus:border-grass-500 resize-none"
            />
          </div>

          {/* Re-record + Grade */}
          <div className="flex gap-3">
            <button onClick={startFlow}
              className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-3 px-4 rounded-2xl transition-all text-sm">
              🔄 Ghi lại
            </button>
            <button onClick={handleGrade} disabled={gradingIdx !== null || wordCount < 10}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-br from-red-500 to-red-600 text-white font-black py-3 rounded-2xl hover:shadow-lg transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed text-sm">
              {gradingIdx === activeQ ? (
                <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>Grading...</>
              ) : '🎯 Chấm điểm'}
            </button>
          </div>
        </>
      )}

      {/* Fallback: type manually (always visible when idle) */}
      {phase === 'idle' && !currentTranscript && (
        <div className="flex flex-col gap-1">
          <p className="text-xs text-gray-400 font-medium text-center">— hoặc gõ câu trả lời —</p>
          <textarea
            value=""
            onChange={e => { if (e.target.value) setTranscripts(prev => ({ ...prev, [activeQ]: e.target.value })); }}
            rows={3}
            placeholder="Gõ câu trả lời tại đây nếu không dùng micro..."
            className="w-full rounded-2xl border-2 border-gray-200 px-4 py-3 text-gray-800 font-medium text-sm focus:outline-none focus:border-red-300 resize-none"
          />
        </div>
      )}

      {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600 font-medium">{error}</div>}

      <div className="flex gap-3">
        <button onClick={() => setShowModel(v => !v)}
          className="flex-1 bg-amber-50 border-2 border-amber-200 text-amber-700 font-bold py-3 rounded-2xl hover:bg-amber-100 transition-all text-sm">
          📖 {showModel ? 'Ẩn' : 'Xem'} Model Answer
        </button>
      </div>

      {showModel && (
        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 animate-fade-up">
          <p className="text-xs font-black text-amber-700 uppercase tracking-wider mb-2">📖 Model Answer</p>
          <p className="text-sm text-gray-700 font-medium leading-relaxed whitespace-pre-wrap">{ex.modelAnswer}</p>
        </div>
      )}

      {/* Current feedback */}
      {currentFeedback && (
        <div className="flex flex-col gap-3 animate-fade-up">
          <div className={`rounded-3xl p-4 border-2 flex items-center gap-3 ${BAND_COLOR(currentFeedback.overallBand)}`}>
            <div className="text-2xl font-black shrink-0">Band {currentFeedback.overallBand.toFixed(1)}</div>
            <p className="text-sm font-medium">{currentFeedback.overallFeedback}</p>
          </div>
          {(['taskAchievement', 'coherenceCohesion', 'lexicalResource', 'grammaticalRange'] as const).map(key => {
            const item = currentFeedback[key];
            const labels: Record<string, string> = {
              taskAchievement: 'Fluency & Coherence',
              coherenceCohesion: 'Organisation',
              lexicalResource: 'Lexical Resource',
              grammaticalRange: 'Grammar Range & Accuracy',
            };
            return (
              <div key={key} className="rounded-2xl p-3 bg-gray-50 border border-gray-100">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-black text-gray-700">{labels[key]}</span>
                  <span className={`text-xs font-black px-2 py-0.5 rounded-lg border ${BAND_COLOR(item.score)}`}>Band {item.score.toFixed(1)}</span>
                </div>
                <p className="text-xs text-gray-600 font-medium">{item.feedback}</p>
              </div>
            );
          })}
          {currentFeedback.improvedParagraph && (
            <div className="bg-sky-50 border border-sky-200 rounded-xl p-3">
              <p className="text-xs font-black text-sky-700 mb-1">💡 Improved Version</p>
              <p className="text-xs text-gray-700 font-medium whitespace-pre-wrap">{currentFeedback.improvedParagraph}</p>
            </div>
          )}
        </div>
      )}

      {/* Key vocabulary */}
      {ex.keyVocabulary.length > 0 && (
        <div className="bg-violet-50 border-2 border-violet-200 rounded-2xl p-4">
          <p className="text-xs font-black text-violet-700 uppercase tracking-wider mb-3">📚 Key Vocabulary</p>
          <div className="flex flex-col gap-2">
            {ex.keyVocabulary.map((v, i) => (
              <div key={i} className="bg-white rounded-xl p-2.5 border border-violet-100">
                <div className="flex items-start gap-2">
                  <span className="font-black text-violet-700 text-sm shrink-0">{v.word}</span>
                  <span className="text-gray-400 text-xs mt-0.5">—</span>
                  <div>
                    <p className="text-xs text-gray-600 font-medium">{v.meaning}</p>
                    <p className="text-xs text-gray-400 italic">"{v.example}"</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {done && (
        <button onClick={() => onNext(true, null)}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-br from-grass-500 to-grass-600 text-white font-black py-3 rounded-2xl hover:shadow-lg transition-all hover:-translate-y-0.5">
          {exerciseNumber < totalExercises ? '🎯 Next Exercise →' : '🏆 Finish!'}
        </button>
      )}
    </div>
  );
}

// ── Main router ──────────────────────────────────────────────────────────────

export default function IELTSExerciseBlock({ exercise, exerciseNumber, totalExercises, onNext }: Props) {
  if (exercise.type === 'ielts-reading') {
    return <ReadingBlock ex={exercise} onNext={onNext} exerciseNumber={exerciseNumber} totalExercises={totalExercises} />;
  }
  if (exercise.type === 'ielts-writing') {
    return <WritingBlock ex={exercise} onNext={onNext} exerciseNumber={exerciseNumber} totalExercises={totalExercises} />;
  }
  if (exercise.type === 'ielts-listening') {
    return <ListeningBlock ex={exercise} onNext={onNext} exerciseNumber={exerciseNumber} totalExercises={totalExercises} />;
  }
  if (exercise.type === 'ielts-speaking') {
    return <SpeakingBlock ex={exercise} onNext={onNext} exerciseNumber={exerciseNumber} totalExercises={totalExercises} />;
  }
  return null;
}
