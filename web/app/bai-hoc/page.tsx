import Link from 'next/link';

const LESSONS = [
  {
    id: 'cong',
    title: 'Phép Cộng',
    emoji: '➕',
    color: 'from-grass-400 to-grass-600',
    bgLight: 'bg-grass-50',
    border: 'border-grass-200',
    grades: [
      { grade: 1, desc: 'Cộng hai số trong phạm vi 10', examples: ['1+2=3', '4+5=9', '3+3=6'] },
      { grade: 2, desc: 'Cộng có nhớ trong phạm vi 100', examples: ['15+27=42', '38+46=84'] },
      { grade: 3, desc: 'Cộng nhiều số trong phạm vi 1000', examples: ['125+368=493', '457+339=796'] },
    ],
    tips: [
      'Đếm thêm từ số lớn hơn',
      'Đặt số lớn ở trên, số nhỏ ở dưới khi tính cột',
      'Nhớ cộng phần nhớ khi tổng hàng đơn vị ≥ 10',
    ],
  },
  {
    id: 'tru',
    title: 'Phép Trừ',
    emoji: '➖',
    color: 'from-rose-400 to-rose-600',
    bgLight: 'bg-rose-50',
    border: 'border-rose-200',
    grades: [
      { grade: 1, desc: 'Trừ hai số trong phạm vi 10', examples: ['8-3=5', '10-4=6', '9-2=7'] },
      { grade: 2, desc: 'Trừ có mượn trong phạm vi 100', examples: ['42-17=25', '73-38=35'] },
      { grade: 3, desc: 'Trừ số có nhiều chữ số', examples: ['500-248=252', '1000-673=327'] },
    ],
    tips: [
      'Kiểm tra lại bằng phép cộng: a-b=c thì c+b=a',
      'Khi trừ không đủ thì mượn từ hàng liền kề',
      'Phép trừ là phép cộng ngược lại',
    ],
  },
  {
    id: 'nhan',
    title: 'Phép Nhân',
    emoji: '✖️',
    color: 'from-tangerine-400 to-tangerine-600',
    bgLight: 'bg-tangerine-50',
    border: 'border-tangerine-200',
    grades: [
      { grade: 2, desc: 'Bảng nhân 2, 3, 4, 5', examples: ['2×3=6', '4×5=20', '3×7=21'] },
      { grade: 3, desc: 'Bảng nhân 6, 7, 8, 9', examples: ['6×7=42', '8×9=72', '7×6=42'] },
      { grade: 4, desc: 'Nhân số có nhiều chữ số', examples: ['24×13=312', '45×26=1170'] },
    ],
    tips: [
      'Học thuộc bảng nhân từ 1 đến 9',
      'Nhân là cộng nhiều lần: 3×4 = 3+3+3+3',
      'Thứ tự nhân không đổi kết quả: 3×5 = 5×3',
    ],
  },
  {
    id: 'chia',
    title: 'Phép Chia',
    emoji: '➗',
    color: 'from-violet-400 to-violet-600',
    bgLight: 'bg-violet-50',
    border: 'border-violet-200',
    grades: [
      { grade: 3, desc: 'Chia trong bảng nhân', examples: ['12÷3=4', '20÷5=4', '36÷9=4'] },
      { grade: 4, desc: 'Chia có dư', examples: ['17÷5=3 dư 2', '25÷7=3 dư 4'] },
      { grade: 5, desc: 'Chia cho số có nhiều chữ số', examples: ['312÷12=26', '960÷24=40'] },
    ],
    tips: [
      'Chia là ngược của nhân: a÷b=c thì c×b=a',
      'Kiểm tra: thương × số chia + số dư = số bị chia',
      'Chia hết khi số dư = 0',
    ],
  },
  {
    id: 'phan-so',
    title: 'Phân Số',
    emoji: '½',
    color: 'from-sky-400 to-sky-600',
    bgLight: 'bg-sky-50',
    border: 'border-sky-200',
    grades: [
      { grade: 3, desc: 'Nhận biết phân số đơn giản', examples: ['1/2 là một nửa', '1/4 là một phần tư'] },
      { grade: 4, desc: 'So sánh và rút gọn phân số', examples: ['1/2 = 2/4 = 3/6', '4/6 rút gọn = 2/3'] },
      { grade: 5, desc: 'Cộng trừ nhân chia phân số', examples: ['1/3 + 1/3 = 2/3', '1/2 × 2/3 = 1/3'] },
    ],
    tips: [
      'Tử số là số ở trên, mẫu số là số ở dưới',
      'Muốn cộng/trừ phân số cùng mẫu: giữ mẫu, cộng/trừ tử',
      'Muốn cộng khác mẫu: quy đồng mẫu số trước',
    ],
  },
  {
    id: 'hinh-hoc',
    title: 'Hình Học',
    emoji: '📐',
    color: 'from-sun-400 to-sun-600',
    bgLight: 'bg-sun-50',
    border: 'border-sun-200',
    grades: [
      { grade: 1, desc: 'Nhận biết hình tròn, vuông, chữ nhật, tam giác', examples: ['Bánh pizza = hình tròn', 'Gạch = hình chữ nhật'] },
      { grade: 3, desc: 'Tính chu vi hình chữ nhật, hình vuông', examples: ['CV hình vuông = cạnh × 4', 'CV hình chữ nhật = (dài + rộng) × 2'] },
      { grade: 4, desc: 'Tính diện tích hình chữ nhật, hình vuông', examples: ['S hình vuông = cạnh × cạnh', 'S hình chữ nhật = dài × rộng'] },
    ],
    tips: [
      'Chu vi = tổng độ dài các cạnh',
      'Diện tích đo bằng cm², m², km²',
      'Hình vuông là hình chữ nhật đặc biệt có 4 cạnh bằng nhau',
    ],
  },
  {
    id: 'do-luong',
    title: 'Đo Lường',
    emoji: '📏',
    color: 'from-pink-400 to-pink-600',
    bgLight: 'bg-pink-50',
    border: 'border-pink-200',
    grades: [
      { grade: 1, desc: 'Đơn vị đo độ dài: cm, dm, m', examples: ['10mm = 1cm', '10cm = 1dm', '10dm = 1m'] },
      { grade: 2, desc: 'Đo khối lượng: g, kg', examples: ['1000g = 1kg', 'Quả táo ~200g'] },
      { grade: 3, desc: 'Đo thời gian: giây, phút, giờ', examples: ['60s = 1 phút', '60 phút = 1 giờ'] },
    ],
    tips: [
      'Nhớ bảng đổi đơn vị đo',
      'Khi đổi sang đơn vị nhỏ hơn thì nhân',
      'Khi đổi sang đơn vị lớn hơn thì chia',
    ],
  },
  {
    id: 'loi-van',
    title: 'Bài Toán Có Lời Văn',
    emoji: '📖',
    color: 'from-emerald-400 to-emerald-600',
    bgLight: 'bg-emerald-50',
    border: 'border-emerald-200',
    grades: [
      { grade: 1, desc: 'Bài toán thêm/bớt đơn giản', examples: ['Có 5 quả, thêm 3 quả → 5+3=8 quả'] },
      { grade: 3, desc: 'Bài toán nhân/chia thực tế', examples: ['4 hộp, mỗi hộp 6 cái → 4×6=24 cái'] },
      { grade: 5, desc: 'Bài toán nhiều bước', examples: ['Mua hàng, tính tiền thừa...'] },
    ],
    tips: [
      'Đọc kỹ đề bài, gạch chân dữ kiện',
      'Viết tóm tắt: Có/Cho..., Hỏi...',
      'Kiểm tra lại đáp án có hợp lý không',
    ],
  },
];

export default function BaiHocPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-black text-grass-800 mb-2" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
          ✏️ Bài Học
        </h1>
        <p className="text-grass-500 font-medium">
          Học toán theo chủ đề — phù hợp lớp 1 đến lớp 5
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {LESSONS.map((lesson, i) => (
          <div
            key={lesson.id}
            className={`card border-2 ${lesson.border} animate-fade-up`}
            style={{ animationDelay: `${i * 0.07}s` }}
          >
            {/* Header */}
            <div className={`-mx-6 -mt-6 mb-5 rounded-t-3xl bg-gradient-to-r ${lesson.color} p-5 text-white`}>
              <div className="flex items-center gap-3">
                <span className="text-4xl">{lesson.emoji}</span>
                <h2 className="text-2xl font-black" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
                  {lesson.title}
                </h2>
              </div>
            </div>

            {/* Grade breakdown */}
            <div className="space-y-3 mb-5">
              {lesson.grades.map(g => (
                <div key={g.grade} className={`${lesson.bgLight} rounded-2xl p-3 border ${lesson.border}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="badge bg-white border-grass-200 text-grass-700 text-xs">Lớp {g.grade}</span>
                    <span className="text-sm font-bold text-grass-700">{g.desc}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {g.examples.map(ex => (
                      <code key={ex} className="text-xs bg-white border border-grass-200 text-grass-600 font-mono px-2 py-0.5 rounded-lg">
                        {ex}
                      </code>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Tips */}
            <div className="mb-4">
              <p className="text-xs font-black text-grass-500 uppercase tracking-wide mb-2">💡 Mẹo học</p>
              <ul className="space-y-1">
                {lesson.tips.map(tip => (
                  <li key={tip} className="text-sm text-grass-600 font-medium flex items-start gap-2">
                    <span className="text-grass-400 mt-0.5 flex-shrink-0">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            <Link
              href={`/luyen-tap?chu-de=${lesson.id}`}
              className={`block text-center bg-gradient-to-r ${lesson.color} text-white font-black py-3 rounded-2xl hover:opacity-90 transition-opacity shadow-md`}
            >
              🎯 Luyện tập {lesson.title}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
