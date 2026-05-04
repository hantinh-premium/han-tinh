create table students (
  id text primary key,
  name text not null,
  phone text,
  cls text,
  level text,
  status text default 'Đang học',
  score real default 0,
  attend real default 90,
  source text default 'Facebook',
  joined date default current_date,
  created_at timestamptz default now()
);

create table classes (
  id text primary key,
  name text not null,
  teacher text,
  cnt int default 0,
  sched text,
  prog int default 0,
  fee bigint default 0
);

create table finance (
  id text primary key,
  name text not null,
  cls text,
  total bigint default 0,
  d1 bigint default 0,
  d2 bigint default 0,
  d2d text,
  st text default 'pending'
);

create table leads (
  id text primary key,
  name text not null,
  phone text,
  source text default 'Facebook',
  stage text default 'inquiry',
  interest text,
  note text,
  created date default current_date,
  last_contact date default current_date
);

create table reports (
  id text primary key,
  date date default current_date,
  teacher text,
  cls text,
  present int default 0,
  absent int default 0,
  absent_names text,
  lesson text,
  homework text,
  flags text,
  highlights text
);

create table interactions (
  id text primary key,
  ref text,
  ref_name text,
  date date default current_date,
  type text default 'call',
  content text,
  by_user text default 'Admin'
);

insert into students values
('HV001','Nguyễn Minh Anh','0901234567','CN-A3','HSK 3','Đang học',8.5,92,'Facebook','2025-09-01',now()),
('HV002','Trần Đức Huy','0912345678','CN-A2','HSK 2','Đang học',7.2,88,'Giới thiệu','2025-10-15',now()),
('HV003','Lê Thị Hồng','0923456789','CN-B1','HSK 4','Đang học',9.1,95,'TikTok','2025-08-20',now()),
('HV004','Phạm Quốc Bảo','0934567890','CN-A1','HSK 1','Đang học',6.8,78,'Walk-in','2026-01-10',now()),
('HV005','Hoàng Yến Nhi','0945678901','CN-A3','HSK 3','Tạm nghỉ',7.9,65,'Facebook','2025-07-05',now()),
('HV006','Võ Thanh Tùng','0956789012','CN-B2','HSK 5','Đang học',9.5,98,'Giới thiệu','2025-03-18',now()),
('HV007','Đặng Thùy Linh','0967890123','CN-A2','HSK 2','Đang học',8.0,90,'Facebook','2026-02-01',now());

insert into classes values
('CN-A1','Sơ cấp 1','Cô Hoa',18,'T2,T4,T6 18h',65,4800000),
('CN-A2','Sơ cấp 2','Cô Wang Li',15,'T3,T5 19h',45,5600000),
('CN-A3','Trung cấp 1','Thầy Long',12,'T2,T4 19h30',80,6400000),
('CN-B1','Trung cấp 2','Thầy Nam',10,'T3,T5,T7 18h',30,7200000),
('CN-B2','Nâng cao','Thầy Long',8,'T7,CN 9h',55,8400000);

insert into finance values
('HP001','Nguyễn Minh Anh','CN-A3',6400000,3200000,3200000,'01/10','paid'),
('HP003','Lê Thị Hồng','CN-B1',7200000,3600000,3600000,'20/09','overdue'),
('HP005','Hoàng Yến Nhi','CN-A3',6400000,3200000,3200000,'05/08','overdue'),
('HP007','Đặng Thùy Linh','CN-A2',5600000,2800000,2800000,'01/03','pending');

insert into leads values
('LD001','Trương Văn Kiên','0981112233','Facebook','inquiry','HSK 1','Hỏi qua FB','2026-05-01','2026-05-01'),
('LD002','Lý Thanh Hà','0972223344','TikTok','trial','HSK 2','Xếp học thử','2026-04-28','2026-05-02'),
('LD003','Ngô Minh Tuấn','0963334455','Giới thiệu','registered','HSK 3','Đã ĐK','2026-04-25','2026-05-01'),
('LD004','Đinh Quốc Anh','0945556677','Facebook','inquiry','HSK 4','Chưa phản hồi','2026-04-30','2026-04-30');

insert into reports values
('RP001','2026-05-02','Cô Hoa','CN-A1',16,2,'Khoa','Bài 12: 你好吗','Viết 10 câu','Bảo cần phụ đạo','Lớp tiến bộ'),
('RP002','2026-05-01','Thầy Long','CN-A3',11,1,'Yến Nhi','Bài 15: 天气','100 chữ','Nhi vắng 3 buổi','Minh Anh 9.5');

insert into interactions values
('IT001','LD002','Lý Thanh Hà','2026-05-02','call','Xác nhận học thử','Admin'),
('IT002','HV003','Lê Thị Hồng','2026-04-28','call','Nhắc HP đợt 2','Admin');

alter table students enable row level security;
alter table classes enable row level security;
alter table finance enable row level security;
alter table leads enable row level security;
alter table reports enable row level security;
alter table interactions enable row level security;

create policy "Allow all" on students for all using (true) with check (true);
create policy "Allow all" on classes for all using (true) with check (true);
create policy "Allow all" on finance for all using (true) with check (true);
create policy "Allow all" on leads for all using (true) with check (true);
create policy "Allow all" on reports for all using (true) with check (true);
create policy "Allow all" on interactions for all using (true) with check (true);
