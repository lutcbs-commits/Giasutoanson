export interface MiniGame {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

export interface Slide {
  id: number;
  title: string;
  content: string;
  keyFormula?: string;
  example?: {
    problem: string;
    steps: string[];
    result: string;
  };
  miniGame?: MiniGame;
}

// ── Math exercise types ─────────────────────────────────────────────────────

export interface Exercise {
  id: number;
  question: string;
  correctSteps: string[];
  correctAnswer: string;
  correctUnit: string;
  difficulty: 'easy' | 'medium' | 'hard';
  hint?: string;
}

export interface GradeFeedback {
  stepFeedback: Array<{
    step: string;
    isCorrect: boolean;
    comment: string;
  }>;
  answerCorrect: boolean;
  answerFeedback: string;
  overallFeedback: string;
  score: number;
  modelSolution: {
    steps: string[];
    answer: string;
    unit: string;
    explanation: string;
  };
  diagram?: string | null;
}

// ── Multi-subject metadata ──────────────────────────────────────────────────

export type Subject = 'toan' | 'tieng-anh-ielts' | 'hoa-hoc' | 'dia-ly' | 'ngu-van';
export type Grade = '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12';
export type IELTSSkill = 'reading' | 'writing' | 'listening' | 'speaking';

// ── IELTS exercise types ────────────────────────────────────────────────────

export interface IELTSReadingQuestion {
  id: number;
  /** 'multiple-choice' | 'true-false-ng' | 'sentence-completion' */
  type: 'multiple-choice' | 'true-false-ng' | 'sentence-completion';
  question?: string;
  statement?: string;
  options?: string[];
  blankBefore?: string;
  blankAfter?: string;
  correctAnswer: string;
  explanation: string;
}

export interface IELTSReadingExercise {
  id: number;
  type: 'ielts-reading';
  title: string;
  passageTitle: string;
  passage: string;
  questions: IELTSReadingQuestion[];
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedBand: number;
  hint?: string;
}

export interface IELTSWritingExercise {
  id: number;
  type: 'ielts-writing';
  taskType: 'task1' | 'task2';
  title: string;
  prompt: string;
  imageDescription?: string;
  wordLimit: number;
  modelAnswer: string;
  bandDescriptors?: {
    taskAchievement: string;
    coherenceCohesion: string;
    lexicalResource: string;
    grammaticalRange: string;
  };
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedBand: number;
}

export interface IELTSListeningQuestion {
  id: number;
  type: 'multiple-choice' | 'note-completion' | 'sentence-completion';
  questionText: string;
  options?: string[];
  blankLabel?: string;
  correctAnswer: string;
  explanation: string;
}

export interface IELTSListeningExercise {
  id: number;
  type: 'ielts-listening';
  title: string;
  youtubeId: string;
  startSeconds?: number;
  endSeconds?: number;
  description: string;
  transcript?: string;
  questions: IELTSListeningQuestion[];
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedBand: number;
}

export interface IELTSSpeakingExercise {
  id: number;
  type: 'ielts-speaking';
  part: 1 | 2 | 3;
  title: string;
  topic: string;
  cueCard?: string;
  followUpQuestions: string[];
  tips: string[];
  modelAnswer: string;
  keyVocabulary: Array<{ word: string; meaning: string; example: string }>;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedBand: number;
}

export type IELTSExercise =
  | IELTSReadingExercise
  | IELTSWritingExercise
  | IELTSListeningExercise
  | IELTSSpeakingExercise;

export interface IELTSGradeFeedback {
  taskAchievement: { score: number; feedback: string };
  coherenceCohesion: { score: number; feedback: string };
  lexicalResource: { score: number; feedback: string };
  grammaticalRange: { score: number; feedback: string };
  overallBand: number;
  overallFeedback: string;
  improvedParagraph?: string;
}

// ── Lesson data (unified) ───────────────────────────────────────────────────

export interface LessonData {
  id: string;
  fileName: string;
  title: string;
  topics: string[];
  processedAt: string;
  subject?: Subject;
  grade?: Grade;
  slides: Slide[];
  exercises: Exercise[];
  ieltsExercises?: IELTSExercise[];
  ieltsMeta?: {
    skill: IELTSSkill;
    week: number;
    month: number;
    targetBand: number;
    prerequisiteBand?: number;
  };
}
