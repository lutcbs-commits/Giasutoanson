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

export interface LessonData {
  id: string;
  fileName: string;
  title: string;
  topics: string[];
  processedAt: string;
  slides: Slide[];
  exercises: Exercise[];
}
