create table trials (
  id text primary key,
  name text,
  phone text,
  source text,
  trial_date date,
  trial_time text,
  cls text,
  teacher text,
  status text default 'scheduled',
  result text default '',
  follow_up text default '',
  note text default ''
);

create table contracts (
  id text primary key,
  name text,
  cls text,
  start_date text,
  end_date text,
  duration text,
  fee bigint default 0,
  status text default 'active',
  note text default ''
);

create table hsk_exams (
  id text primary key,
  name text,
  level text,
  exam_date text,
  score real default 0,
  passed text default '',
  status text default 'registered'
);

insert into trials values
('TL001','Lý Thanh Hà','0972223344','TikTok','2026-05-04','18:00','CN-A2','Cô Wang Li','scheduled','','2026-05-05',''),
('TL002','Ngô Minh Tuấn','0963334455','Giới thiệu','2026-04-28','19:30','CN-A3','Thầy Long','completed','enrolled','','ĐK ngay'),
('TL003','Trần Hương','0918887766','Facebook','2026-04-20','18:00','CN-A1','Cô Hoa','completed','thinking','2026-05-03','Chưa quyết');

insert into contracts values
('HD001','Nguyễn Minh Anh','CN-A3','2025-09-01','2026-06-01','6 tháng',6400000,'expiring',''),
('HD002','Trần Đức Huy','CN-A2','2025-10-15','2026-04-15','6 tháng',5600000,'expired',''),
('HD003','Lê Thị Hồng','CN-B1','2025-08-20','2026-08-20','12 tháng',7200000,'active',''),
('HD004','Võ Thanh Tùng','CN-B2','2025-03-18','2026-09-18','18 tháng',8400000,'active','');

insert into hsk_exams values
('HSK001','Nguyễn Minh Anh','HSK 3','2026-06-15',0,'','registered'),
('HSK002','Võ Thanh Tùng','HSK 5','2026-06-15',0,'','registered'),
('HSK003','Trần Đức Huy','HSK 2','2025-12-10',178,'yes','passed'),
('HSK004','Đặng Thùy Linh','HSK 2','2025-12-10',155,'yes','passed'),
('HSK005','Phạm Quốc Bảo','HSK 1','2025-12-10',112,'no','failed'),
('HSK006','Hoàng Yến Nhi','HSK 3','2025-12-10',195,'yes','passed');

alter table trials enable row level security;
alter table contracts enable row level security;
alter table hsk_exams enable row level security;
create policy "Allow all" on trials for all using (true) with check (true);
create policy "Allow all" on contracts for all using (true) with check (true);
create policy "Allow all" on hsk_exams for all using (true) with check (true);
