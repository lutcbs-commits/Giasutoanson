export type Grade = 1 | 2 | 3 | 4 | 5;
export type Topic = 'addition' | 'subtraction' | 'multiplication' | 'division' | 'fraction' | 'geometry' | 'word-problem';

export interface QuizQuestion {
  id: string;
  question: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
  topic: Topic;
  grade: Grade;
  emoji: string;
}

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffleChoices(correct: number, wrong: number[]): { choices: string[]; correctIndex: number } {
  const all = [correct, ...wrong].map(String);
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }
  return {
    choices: all,
    correctIndex: all.indexOf(String(correct)),
  };
}

export function generateQuestion(grade: Grade, topic?: Topic): QuizQuestion {
  const id = Math.random().toString(36).slice(2);

  if (!topic) {
    const topicsByGrade: Record<Grade, Topic[]> = {
      1: ['addition', 'subtraction'],
      2: ['addition', 'subtraction', 'multiplication'],
      3: ['multiplication', 'division', 'addition', 'subtraction'],
      4: ['multiplication', 'division', 'fraction', 'word-problem'],
      5: ['fraction', 'geometry', 'word-problem', 'division'],
    };
    const topics = topicsByGrade[grade];
    topic = topics[rand(0, topics.length - 1)];
  }

  switch (topic) {
    case 'addition': {
      const max = grade === 1 ? 10 : grade === 2 ? 100 : 1000;
      const a = rand(1, max);
      const b = rand(1, max);
      const correct = a + b;
      const wrong = [correct + rand(1, 5), correct - rand(1, 5), correct + rand(6, 12)].filter(x => x !== correct && x > 0);
      const { choices, correctIndex } = shuffleChoices(correct, wrong.slice(0, 3));
      return { id, question: `${a} + ${b} = ?`, choices, correctIndex, explanation: `${a} + ${b} = ${correct}`, topic, grade, emoji: '➕' };
    }
    case 'subtraction': {
      const max = grade === 1 ? 10 : grade === 2 ? 100 : 500;
      const a = rand(Math.floor(max / 2), max);
      const b = rand(1, a);
      const correct = a - b;
      const wrong = [correct + rand(1, 5), correct - rand(1, 4), correct + rand(6, 15)].filter(x => x !== correct && x >= 0);
      const { choices, correctIndex } = shuffleChoices(correct, wrong.slice(0, 3));
      return { id, question: `${a} − ${b} = ?`, choices, correctIndex, explanation: `${a} − ${b} = ${correct}`, topic, grade, emoji: '➖' };
    }
    case 'multiplication': {
      const maxA = grade <= 3 ? 9 : 12;
      const maxB = grade <= 3 ? 9 : 15;
      const a = rand(2, maxA);
      const b = rand(2, maxB);
      const correct = a * b;
      const wrong = [correct + a, correct - b, correct + b + 1].filter(x => x !== correct && x > 0);
      const { choices, correctIndex } = shuffleChoices(correct, wrong.slice(0, 3));
      return { id, question: `${a} × ${b} = ?`, choices, correctIndex, explanation: `${a} × ${b} = ${correct}`, topic, grade, emoji: '✖️' };
    }
    case 'division': {
      const b = rand(2, grade <= 3 ? 9 : 12);
      const correct = rand(2, grade <= 3 ? 9 : 15);
      const a = b * correct;
      const wrong = [correct + 1, correct - 1, correct + 2].filter(x => x !== correct && x > 0);
      const { choices, correctIndex } = shuffleChoices(correct, wrong.slice(0, 3));
      return { id, question: `${a} ÷ ${b} = ?`, choices, correctIndex, explanation: `${a} ÷ ${b} = ${correct}`, topic, grade, emoji: '➗' };
    }
    case 'fraction': {
      const denom = rand(2, 8);
      const num1 = rand(1, denom - 1);
      const num2 = rand(1, denom - num1);
      const correctNum = num1 + num2;
      const correct = correctNum === denom ? 1 : undefined;
      const correctStr = correctNum >= denom ? '1' : `${correctNum}/${denom}`;
      const wrong = [`${num1 + num2 + 1}/${denom}`, `${num1}/${denom}`, `${num2 + 1}/${denom}`].filter(x => x !== correctStr);
      const choices = [correctStr, ...wrong.slice(0, 3)];
      for (let i = choices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [choices[i], choices[j]] = [choices[j], choices[i]];
      }
      const correctIndex = choices.indexOf(correctStr);
      return {
        id,
        question: `${num1}/${denom} + ${num2}/${denom} = ?`,
        choices,
        correctIndex,
        explanation: `${num1}/${denom} + ${num2}/${denom} = ${correctNum}/${denom}${correctNum === denom ? ' = 1' : ''}`,
        topic,
        grade,
        emoji: '½',
      };
    }
    case 'geometry': {
      const questions = [
        {
          question: 'Hình vuông có bao nhiêu cạnh bằng nhau?',
          choices: ['2 cạnh', '3 cạnh', '4 cạnh', '6 cạnh'],
          correctIndex: 2,
          explanation: 'Hình vuông có 4 cạnh bằng nhau.',
        },
        {
          question: 'Hình tròn có bao nhiêu góc?',
          choices: ['4 góc', '0 góc', '2 góc', '1 góc'],
          correctIndex: 1,
          explanation: 'Hình tròn không có góc nào.',
        },
        {
          question: 'Chu vi hình vuông cạnh 5 cm là bao nhiêu?',
          choices: ['10 cm', '15 cm', '20 cm', '25 cm'],
          correctIndex: 2,
          explanation: 'Chu vi hình vuông = 4 × 5 = 20 cm.',
        },
        {
          question: 'Diện tích hình chữ nhật dài 6 cm, rộng 3 cm?',
          choices: ['9 cm²', '18 cm²', '12 cm²', '24 cm²'],
          correctIndex: 1,
          explanation: 'Diện tích = 6 × 3 = 18 cm².',
        },
      ];
      const q = questions[rand(0, questions.length - 1)];
      return { id, ...q, topic, grade, emoji: '📐' };
    }
    case 'word-problem': {
      const scenarios = [
        () => {
          const apples = rand(5, 20);
          const eaten = rand(1, apples - 1);
          const correct = apples - eaten;
          const wrong = [correct + 2, correct - 1, correct + 5].filter(x => x > 0 && x !== correct);
          const { choices, correctIndex } = shuffleChoices(correct, wrong.slice(0, 3));
          return {
            question: `Nam có ${apples} quả táo. Nam ăn ${eaten} quả. Hỏi còn lại bao nhiêu quả?`,
            choices,
            correctIndex,
            explanation: `${apples} − ${eaten} = ${correct} quả táo.`,
          };
        },
        () => {
          const students = rand(20, 40);
          const perRow = rand(4, 8);
          const rows = Math.floor(students / perRow);
          const correct = rows;
          const wrong = [rows + 1, rows - 1, rows + 2].filter(x => x > 0 && x !== correct);
          const { choices, correctIndex } = shuffleChoices(correct, wrong.slice(0, 3));
          return {
            question: `Có ${students} học sinh xếp thành hàng, mỗi hàng ${perRow} em. Hỏi xếp được bao nhiêu hàng đầy đủ?`,
            choices,
            correctIndex,
            explanation: `${students} ÷ ${perRow} = ${rows} hàng đầy đủ.`,
          };
        },
        () => {
          const price = rand(3, 15) * 1000;
          const qty = rand(2, 5);
          const correct = price * qty;
          const wrong = [correct + 5000, correct - 2000, correct + 10000].filter(x => x > 0 && x !== correct);
          const shuffled = shuffleChoices(correct, wrong);
          return {
            question: `Một quyển vở giá ${price.toLocaleString('vi-VN')} đồng. Mua ${qty} quyển hết bao nhiêu tiền?`,
            choices: shuffled.choices.map(c => `${parseInt(c).toLocaleString('vi-VN')} đồng`),
            correctIndex: shuffled.correctIndex,
            explanation: `${price.toLocaleString('vi-VN')} × ${qty} = ${correct.toLocaleString('vi-VN')} đồng.`,
          };
        },
      ];
      const scenario = scenarios[rand(0, scenarios.length - 1)]();
      return { id, ...scenario, topic, grade, emoji: '📖' };
    }
  }
}

export const SAMPLE_QUESTIONS: QuizQuestion[] = [
  {
    id: 's1', grade: 1, topic: 'addition', emoji: '➕',
    question: '3 + 5 = ?',
    choices: ['7', '8', '9', '6'],
    correctIndex: 1,
    explanation: '3 + 5 = 8. Đếm từ 3 lên thêm 5 bước: 4, 5, 6, 7, 8.',
  },
  {
    id: 's2', grade: 2, topic: 'subtraction', emoji: '➖',
    question: '15 − 7 = ?',
    choices: ['6', '9', '8', '7'],
    correctIndex: 2,
    explanation: '15 − 7 = 8.',
  },
  {
    id: 's3', grade: 3, topic: 'multiplication', emoji: '✖️',
    question: '6 × 7 = ?',
    choices: ['36', '42', '48', '40'],
    correctIndex: 1,
    explanation: '6 × 7 = 42. Bảng nhân 6: 6×7 = 42.',
  },
  {
    id: 's4', grade: 4, topic: 'division', emoji: '➗',
    question: '56 ÷ 8 = ?',
    choices: ['6', '8', '7', '9'],
    correctIndex: 2,
    explanation: '56 ÷ 8 = 7 vì 8 × 7 = 56.',
  },
  {
    id: 's5', grade: 5, topic: 'fraction', emoji: '½',
    question: '1/4 + 2/4 = ?',
    choices: ['2/4', '3/4', '1/2', '4/4'],
    correctIndex: 1,
    explanation: '1/4 + 2/4 = 3/4. Cùng mẫu số thì cộng tử số.',
  },
];

export const TOPIC_LABELS: Record<Topic, string> = {
  addition: 'Phép Cộng',
  subtraction: 'Phép Trừ',
  multiplication: 'Phép Nhân',
  division: 'Phép Chia',
  fraction: 'Phân Số',
  geometry: 'Hình Học',
  'word-problem': 'Bài Toán Có Lời Văn',
};

export const TOPIC_COLORS: Record<Topic, string> = {
  addition: 'bg-grass-100 text-grass-700 border-grass-300',
  subtraction: 'bg-rose-100 text-rose-700 border-rose-200',
  multiplication: 'bg-tangerine-100 text-tangerine-700 border-tangerine-200',
  division: 'bg-violet-100 text-violet-700 border-violet-200',
  fraction: 'bg-sky-100 text-sky-700 border-sky-200',
  geometry: 'bg-sun-100 text-sun-700 border-sun-200',
  'word-problem': 'bg-pink-100 text-pink-700 border-pink-200',
};
