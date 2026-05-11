-- Chạy file này trong Supabase SQL Editor (supabase.com → project → SQL Editor)

-- Bảng lưu bài học đã xử lý từ PDF
create table if not exists lessons (
  id text primary key,
  file_name text not null,
  title text not null,
  topics text[] default '{}',
  processed_at timestamptz default now(),
  slides jsonb default '[]',
  exercises jsonb default '[]'
);

-- Bảng học sinh (chỉ cần tên, không cần mật khẩu)
create table if not exists students (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  created_at timestamptz default now()
);

-- Bảng lưu từng bài nộp của học sinh
create table if not exists submissions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references students(id) on delete cascade,
  lesson_id text references lessons(id) on delete cascade,
  exercise_id integer not null,
  exercise_question text,
  answer_steps text[] default '{}',
  answer_number text,
  answer_unit text,
  is_correct boolean,
  score integer default 0,
  ai_feedback jsonb,
  submitted_at timestamptz default now()
);

-- Bảng lưu phiên học (mỗi ngày học 1 bài = 1 phiên)
create table if not exists learning_sessions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references students(id) on delete cascade,
  lesson_id text references lessons(id) on delete cascade,
  session_date date not null default current_date,
  problems_attempted integer default 0,
  problems_correct integer default 0,
  completed_at timestamptz default now(),
  unique(student_id, lesson_id, session_date)
);

-- Cho phép đọc/ghi không cần auth (public web, không login)
alter table lessons enable row level security;
alter table students enable row level security;
alter table submissions enable row level security;
alter table learning_sessions enable row level security;

create policy "public read lessons" on lessons for select using (true);
create policy "public insert lessons" on lessons for insert with check (true);
create policy "public update lessons" on lessons for update using (true);

create policy "public read students" on students for select using (true);
create policy "public insert students" on students for insert with check (true);

create policy "public read submissions" on submissions for select using (true);
create policy "public insert submissions" on submissions for insert with check (true);

create policy "public read sessions" on learning_sessions for select using (true);
create policy "public insert sessions" on learning_sessions for insert with check (true);
create policy "public update sessions" on learning_sessions for update using (true);
