'use client';

interface ProgressData {
  label: string;
  value: number;
  max: number;
  color: string;
  emoji: string;
}

interface ProgressChartProps {
  data: ProgressData[];
  title: string;
}

export default function ProgressChart({ data, title }: ProgressChartProps) {
  return (
    <div className="card">
      <h3 className="text-lg font-black text-grass-800 mb-5">{title}</h3>
      <div className="space-y-4">
        {data.map((item) => {
          const pct = item.max > 0 ? Math.round((item.value / item.max) * 100) : 0;
          return (
            <div key={item.label}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-bold text-grass-700 flex items-center gap-1.5">
                  {item.emoji} {item.label}
                </span>
                <span className="text-sm font-black" style={{ color: item.color }}>
                  {item.value}/{item.max}
                </span>
              </div>
              <div className="h-3 bg-grass-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>
              <p className="text-xs text-grass-400 mt-0.5 text-right">{pct}%</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface CircularProgressProps {
  value: number;
  max: number;
  label: string;
  emoji: string;
  color: string;
}

export function CircularProgress({ value, max, label, emoji, color }: CircularProgressProps) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  const r = 36;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="card flex flex-col items-center text-center gap-3 py-6">
      <div className="relative w-24 h-24">
        <svg width="96" height="96" className="-rotate-90">
          <circle cx="48" cy="48" r={r} fill="none" stroke="#dcfce7" strokeWidth="8" />
          <circle
            cx="48" cy="48" r={r} fill="none"
            stroke={color} strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl">{emoji}</span>
          <span className="text-sm font-black" style={{ color }}>{pct}%</span>
        </div>
      </div>
      <div>
        <p className="font-black text-grass-800">{label}</p>
        <p className="text-sm text-grass-500">{value}/{max}</p>
      </div>
    </div>
  );
}
