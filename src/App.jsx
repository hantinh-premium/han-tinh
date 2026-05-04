import { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import { supabase } from "./supabase";
import {
  LayoutDashboard,
  Target,
  BookOpen,
  Users,
  FileText,
  GraduationCap,
  ClipboardList,
  MessageSquare,
  Wallet,
  BarChart3,
  Plus,
  Pencil,
  Trash2,
  Search,
  Check,
  LogOut,
  X,
  ChevronRight,
  TrendingUp,
  Save,
  Menu,
  Sparkles,
  ShieldCheck,
  Network,
  Coins,
  Activity,
  ArrowUpRight,
} from "lucide-react";

const BRAND = {
  bg: "#03120B",
  panel: "rgba(5, 22, 14, 0.78)",
  panel2: "rgba(8, 38, 24, 0.90)",
  line: "rgba(255,255,255,.10)",
  text: "#F5FFF8",
  muted: "#A8B8AE",
  dim: "#607368",
  pink: "#00D084",
  pink2: "#7CFFB2",
  violet: "#14B86A",
  cyan: "#8FFFD2",
  green: "#34D399",
  amber: "#FBBF24",
  red: "#FB7185",
};

const A = BRAND.pink;
const A2 = "#059669";
const FN = "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const today = new Date().toISOString().slice(0, 10);
const CX = [BRAND.pink, "#16A34A", BRAND.cyan, BRAND.green, BRAND.amber, BRAND.red, "#F97316"];

const USERS = [
  { user: "admin", pass: "hantinh2026", role: "admin", name: "Admin", cls: "all" },
  { user: "cohoa", pass: "gv2026", role: "teacher", name: "Cô Hoa", cls: "CN-A1" },
  { user: "thaylong", pass: "gv2026", role: "teacher", name: "Thầy Long", cls: "CN-A3,CN-B2" },
  { user: "cowang", pass: "gv2026", role: "teacher", name: "Cô Wang Li", cls: "CN-A2" },
  { user: "thaynam", pass: "gv2026", role: "teacher", name: "Thầy Nam", cls: "CN-B1" },
];

const LABEL = {
  home: "Tổng quan",
  leads: "Khách mới",
  trials: "Học thử",
  students: "Học viên",
  contracts: "Hợp đồng",
  hsk: "HSK",
  reports: "Báo cáo",
  log: "Lịch sử",
  finance: "Tài chính",
  charts: "Biểu đồ",
  login: "Đăng nhập hệ thống",
  account: "Tài khoản",
  pass: "Mật khẩu",
  wrong: "Sai tài khoản hoặc mật khẩu",
  add: "Thêm",
  new: "Thêm mới",
  edit: "Chỉnh sửa",
  save: "Lưu",
  cancel: "Huỷ",
  create: "Tạo",
  schedule: "Xếp lịch",
  logout: "Thoát",
  delete: "Xoá?",
  search: "Tìm kiếm...",
  activeStudents: "HV đang học",
  revenue: "Doanh thu",
  debt: "Nợ HP",
  follow: "Cần nhắc",
  collect: "Cần thu",
  recent: "Gần đây",
  source: "Nguồn",
  funnel: "Phễu",
  trend: "Xu hướng",
  index: "Chỉ số",
  conversion: "Chuyển đổi",
  attendance: "Chuyên cần",
  result: "Kết quả",
  rate: "Tỷ lệ",
  paid: "Đã đóng",
  pending: "Chờ",
  overdue: "Quá hạn",
  name: "Họ tên",
  phone: "SĐT",
  class: "Lớp",
  level: "Trình độ",
  score: "Điểm",
  status: "Trạng thái",
  note: "Ghi chú",
  date: "Ngày",
  time: "Giờ",
  teacher: "GV",
  start: "Bắt đầu",
  end: "Kết thúc",
  fee: "Học phí",
  duration: "Thời hạn",
  reminder: "Nhắc",
  present: "Có mặt",
  absent: "Vắng",
  lesson: "Bài học",
  homework: "BTVN",
  flags: "Chú ý",
  highlights: "Nổi bật",
  content: "Nội dung",
};

const FM = {
  leads: { lastContact: "last_contact" },
  reports: { absentNames: "absent_names" },
  interactions: { refName: "ref_name", by: "by_user" },
  trials: { date: "trial_date", time: "trial_time", followUp: "follow_up" },
  contracts: { start: "start_date", end: "end_date" },
  hsk_exams: { examDate: "exam_date" },
};

function toDb(t, o) {
  const m = FM[t];
  if (!m) return { ...o };
  const r = {};
  Object.entries(o || {}).forEach(([k, v]) => (r[m[k] || k] = v));
  return r;
}

function toApp(t, o) {
  const m = FM[t];
  const rm = {};
  if (m) Object.entries(m).forEach(([k, v]) => (rm[v] = k));
  const r = {};
  Object.entries(o || {}).forEach(([k, v]) => (r[rm[k] || k] = v));
  return r;
}

async function loadT(t) {
  try {
    const { data, error } = await supabase.from(t).select("*");
    if (error) return [];
    return (data || []).map((r) => toApp(t, r));
  } catch {
    return [];
  }
}
async function addRow(t, row) {
  const d = toDb(t, row);
  delete d.created_at;
  await supabase.from(t).insert([d]);
}
async function updateRow(t, row) {
  const d = toDb(t, row);
  delete d.created_at;
  await supabase.from(t).update(d).eq("id", row.id);
}
async function deleteRow(t, id) {
  await supabase.from(t).delete().eq("id", id);
}

const vnd = (n) => new Intl.NumberFormat("vi-VN").format(n || 0) + "đ";
const daysLeft = (d) => {
  if (!d) return 0;
  const t = new Date(d).getTime();
  return Number.isFinite(t) ? Math.ceil((t - Date.now()) / 86400000) : 0;
};

const seed = {
  classes: [
    { id: "CN-A1", teacher: "Cô Hoa" },
    { id: "CN-A2", teacher: "Cô Wang Li" },
    { id: "CN-A3", teacher: "Thầy Long" },
    { id: "CN-B1", teacher: "Thầy Nam" },
  ],
  students: [
    { id: "HV001", name: "Minh Anh", phone: "0900000001", cls: "CN-A1", level: "HSK 2", score: 8.7, attend: 94, status: "Đang học", source: "Facebook" },
    { id: "HV002", name: "Gia Hân", phone: "0900000002", cls: "CN-A2", level: "HSK 3", score: 7.8, attend: 89, status: "Đang học", source: "TikTok" },
    { id: "HV003", name: "Hoàng Nam", phone: "0900000003", cls: "CN-A3", level: "HSK 1", score: 9.1, attend: 96, status: "Đang học", source: "Giới thiệu" },
  ],
  leads: [
    { id: "LD001", name: "Thanh Vy", phone: "0911111111", source: "Facebook", stage: "inquiry", interest: "HSK 1", note: "Quan tâm lớp tối", created: today, lastContact: today },
    { id: "LD002", name: "Bảo Ngọc", phone: "0922222222", source: "TikTok", stage: "trial", interest: "HSK 2", note: "Muốn học thử cuối tuần", created: today, lastContact: today },
  ],
  trials: [
    { id: "TL001", name: "Bảo Ngọc", phone: "0922222222", date: today, time: "18:00", cls: "CN-A2", teacher: "Cô Wang Li", status: "scheduled", result: "", followUp: "" },
  ],
  contracts: [
    { id: "HD001", name: "Minh Anh", cls: "CN-A1", start: today, end: "2026-08-31", duration: "6 tháng", fee: 12000000, status: "active" },
  ],
  hsk: [
    { id: "HSK001", name: "Minh Anh", level: "HSK 2", examDate: "2026-06-12", score: 245, passed: "yes", status: "passed" },
  ],
  finance: [
    { id: "HP001", name: "Minh Anh", cls: "CN-A1", total: 12000000, d1: 6000000, d2: 6000000, d2d: "2026-06-01", st: "pending" },
  ],
  reports: [
    { id: "RP001", date: today, teacher: "Cô Hoa", cls: "CN-A1", present: 8, absent: 1, absentNames: "", lesson: "Ôn mẫu câu giao tiếp cơ bản", homework: "", flags: "", highlights: "Lớp tương tác tốt" },
  ],
  interactions: [
    { id: "IT001", refName: "Thanh Vy", date: today, type: "message", by: "Admin", content: "Đã gửi lịch học thử và bảng học phí." },
  ],
};

function useAppData() {
  const [ok, setOk] = useState(false);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [finance, setFinance] = useState([]);
  const [reports, setReports] = useState([]);
  const [leads, setLeads] = useState([]);
  const [interactions, setInteractions] = useState([]);
  const [trials, setTrials] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [hsk, setHsk] = useState([]);

  useEffect(() => {
    (async () => {
      const [s, c, f, r, l, i, t, ct, h] = await Promise.all([
        loadT("students"),
        loadT("classes"),
        loadT("finance"),
        loadT("reports"),
        loadT("leads"),
        loadT("interactions"),
        loadT("trials"),
        loadT("contracts"),
        loadT("hsk_exams"),
      ]);
      setStudents(s.length ? s : seed.students);
      setClasses(c.length ? c : seed.classes);
      setFinance(f.length ? f : seed.finance);
      setReports(r.length ? r : seed.reports);
      setLeads(l.length ? l : seed.leads);
      setInteractions(i.length ? i : seed.interactions);
      setTrials(t.length ? t : seed.trials);
      setContracts(ct.length ? ct : seed.contracts);
      setHsk(h.length ? h : seed.hsk);
      setOk(true);
    })();
  }, []);

  return {
    ok,
    students,
    setStudents,
    classes,
    setClasses,
    finance,
    setFinance,
    reports,
    setReports,
    leads,
    setLeads,
    interactions,
    setInteractions,
    trials,
    setTrials,
    contracts,
    setContracts,
    hsk,
    setHsk,
  };
}

function Tip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="tip">
      <div className="tip-label">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="tip-row">
          {p.name}: <span style={{ color: p.color || A }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
}

function Badge({ children, tone = "muted" }) {
  return <span className={`badge ${tone}`}>{children}</span>;
}

function OrbLogo({ small = false }) {
  return (
    <div className={small ? "orb-logo small" : "orb-logo"}>
      <Sparkles size={small ? 15 : 22} />
    </div>
  );
}

function KpiCard({ label, value, icon: Icon, trend, tone = "pink" }) {
  return (
    <div className={`kpi-card ${tone}`}>
      <div className="kpi-head">
        <span>{label}</span>
        <Icon size={18} />
      </div>
      <div className="kpi-value">{value}</div>
      {trend && (
        <div className="kpi-trend">
          <TrendingUp size={14} />
          {trend}
        </div>
      )}
    </div>
  );
}

function Panel({ title, children, className = "", action }) {
  return (
    <section className={`panel ${className}`}>
      {(title || action) && (
        <div className="panel-title">
          <span>{title}</span>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

function ChartBox({ title, children, h = 210 }) {
  return (
    <Panel title={title}>
      <div style={{ height: h }}>
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </Panel>
  );
}

function Field({ label, value, onChange, type = "text", options }) {
  return (
    <label className="field">
      <span>{label}</span>
      {options ? (
        <select value={value ?? ""} onChange={(e) => onChange(e.target.value)}>
          {options.map((o) => (
            <option key={Array.isArray(o) ? o[0] : o} value={Array.isArray(o) ? o[0] : o}>
              {Array.isArray(o) ? o[1] : o}
            </option>
          ))}
        </select>
      ) : type === "textarea" ? (
        <textarea value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input type={type} value={value ?? ""} onChange={(e) => onChange(type === "number" ? Number(e.target.value) : e.target.value)} />
      )}
    </label>
  );
}

function ModalForm({ modal, onClose, onSave, classes, teachers, user, isAdmin }) {
  const [form, setForm] = useState(modal.d || {});
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const type = modal.t;
  const classOpts = classes.map((c) => c.id);
  const lv = ["HSK 1", "HSK 2", "HSK 3", "HSK 4", "HSK 5", "HSK 6"];
  const src = ["Facebook", "TikTok", "Giới thiệu", "Walk-in", "Website"];

  return (
    <div className="modal-back" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <div className="eyebrow">Hán Tinh CRM</div>
            <h3>{modal.n ? LABEL.new : LABEL.edit}</h3>
          </div>
          <button className="icon-btn" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="form-grid">
          {type === "l" && (
            <>
              <Field label={LABEL.name} value={form.name} onChange={(v) => set("name", v)} />
              <Field label={LABEL.phone} value={form.phone} onChange={(v) => set("phone", v)} />
              <Field label={LABEL.source} value={form.source} onChange={(v) => set("source", v)} options={src} />
              <Field label="Quan tâm" value={form.interest} onChange={(v) => set("interest", v)} options={lv} />
              <Field label="Giai đoạn" value={form.stage} onChange={(v) => set("stage", v)} options={[["inquiry", "Hỏi thăm"], ["trial", "Học thử"], ["registered", "Đã ĐK"], ["lost", "Mất"]]} />
              <Field label={LABEL.note} value={form.note} onChange={(v) => set("note", v)} type="textarea" />
            </>
          )}

          {type === "s" && (
            <>
              <Field label={LABEL.name} value={form.name} onChange={(v) => set("name", v)} />
              <Field label={LABEL.phone} value={form.phone} onChange={(v) => set("phone", v)} />
              <Field label={LABEL.class} value={form.cls} onChange={(v) => set("cls", v)} options={classOpts} />
              <Field label={LABEL.level} value={form.level} onChange={(v) => set("level", v)} options={lv} />
              <Field label={LABEL.score} value={form.score} onChange={(v) => set("score", v)} type="number" />
              <Field label="Chuyên cần %" value={form.attend} onChange={(v) => set("attend", v)} type="number" />
              <Field label={LABEL.source} value={form.source} onChange={(v) => set("source", v)} options={src} />
              <Field label={LABEL.status} value={form.status} onChange={(v) => set("status", v)} options={["Đang học", "Tạm nghỉ", "Nghỉ học"]} />
            </>
          )}

          {type === "tr" && (
            <>
              <Field label={LABEL.name} value={form.name} onChange={(v) => set("name", v)} />
              <Field label={LABEL.phone} value={form.phone} onChange={(v) => set("phone", v)} />
              <Field label={LABEL.date} value={form.date} onChange={(v) => set("date", v)} type="date" />
              <Field label={LABEL.time} value={form.time} onChange={(v) => set("time", v)} />
              <Field label={LABEL.class} value={form.cls} onChange={(v) => set("cls", v)} options={classOpts} />
              <Field label={LABEL.teacher} value={form.teacher} onChange={(v) => set("teacher", v)} options={teachers} />
              <Field label={LABEL.status} value={form.status} onChange={(v) => set("status", v)} options={[["scheduled", "Đã xếp"], ["completed", "Đã học"], ["no-show", "Không đến"]]} />
              <Field label={LABEL.result} value={form.result} onChange={(v) => set("result", v)} options={[["", "--"], ["enrolled", "Đã ĐK"], ["thinking", "Suy nghĩ"], ["not-interested", "Không QT"]]} />
            </>
          )}

          {type === "ct" && (
            <>
              <Field label={LABEL.name} value={form.name} onChange={(v) => set("name", v)} />
              <Field label={LABEL.class} value={form.cls} onChange={(v) => set("cls", v)} options={classOpts} />
              <Field label={LABEL.duration} value={form.duration} onChange={(v) => set("duration", v)} options={["3 tháng", "6 tháng", "12 tháng", "18 tháng"]} />
              <Field label={LABEL.start} value={form.start} onChange={(v) => set("start", v)} type="date" />
              <Field label={LABEL.end} value={form.end} onChange={(v) => set("end", v)} type="date" />
              <Field label={LABEL.fee} value={form.fee} onChange={(v) => set("fee", v)} type="number" />
            </>
          )}

          {type === "hk" && (
            <>
              <Field label={LABEL.name} value={form.name} onChange={(v) => set("name", v)} />
              <Field label="Level" value={form.level} onChange={(v) => set("level", v)} options={lv} />
              <Field label="Ngày thi" value={form.examDate} onChange={(v) => set("examDate", v)} type="date" />
              <Field label={LABEL.score} value={form.score} onChange={(v) => set("score", v)} type="number" />
              <Field label="Kết quả" value={form.passed} onChange={(v) => set("passed", v)} options={[["", "Chưa thi"], ["yes", "ĐẠT"], ["no", "Chưa đạt"]]} />
            </>
          )}

          {type === "r" && (
            <>
              <Field label={LABEL.date} value={form.date} onChange={(v) => set("date", v)} type="date" />
              <Field label={LABEL.teacher} value={form.teacher || user.name} onChange={(v) => set("teacher", v)} options={isAdmin ? teachers : [user.name]} />
              <Field label={LABEL.class} value={form.cls} onChange={(v) => set("cls", v)} options={classOpts} />
              <Field label={LABEL.present} value={form.present} onChange={(v) => set("present", v)} type="number" />
              <Field label={LABEL.absent} value={form.absent} onChange={(v) => set("absent", v)} type="number" />
              <Field label="HV vắng" value={form.absentNames} onChange={(v) => set("absentNames", v)} />
              <Field label={LABEL.lesson} value={form.lesson} onChange={(v) => set("lesson", v)} type="textarea" />
              <Field label={LABEL.homework} value={form.homework} onChange={(v) => set("homework", v)} type="textarea" />
              <Field label={LABEL.flags} value={form.flags} onChange={(v) => set("flags", v)} type="textarea" />
              <Field label={LABEL.highlights} value={form.highlights} onChange={(v) => set("highlights", v)} type="textarea" />
            </>
          )}

          {type === "i" && (
            <>
              <Field label="Người" value={form.refName} onChange={(v) => set("refName", v)} />
              <Field label={LABEL.date} value={form.date} onChange={(v) => set("date", v)} type="date" />
              <Field label="Loại" value={form.type} onChange={(v) => set("type", v)} options={[["call", "Gọi"], ["message", "Nhắn"], ["meeting", "Gặp"]]} />
              <Field label="Bởi" value={form.by} onChange={(v) => set("by", v)} />
              <Field label={LABEL.content} value={form.content} onChange={(v) => set("content", v)} type="textarea" />
            </>
          )}

          {type === "f" && (
            <>
              <Field label={LABEL.name} value={form.name} onChange={(v) => set("name", v)} />
              <Field label={LABEL.class} value={form.cls} onChange={(v) => set("cls", v)} options={classOpts} />
              <Field label="Tổng phí" value={form.total} onChange={(v) => set("total", v)} type="number" />
              <Field label="Hạn đợt 2" value={form.d2d} onChange={(v) => set("d2d", v)} />
              <Field label="TT" value={form.st} onChange={(v) => set("st", v)} options={[["paid", "Đã đóng"], ["pending", "Chờ"], ["overdue", "Quá hạn"]]} />
            </>
          )}
        </div>

        <div className="modal-actions">
          <button className="btn primary" onClick={() => onSave({ ...form })}><Save size={15} />{LABEL.save}</button>
          <button className="btn ghost" onClick={onClose}>{LABEL.cancel}</button>
        </div>
      </div>
    </div>
  );
}

function Empty({ text = "Chưa có dữ liệu" }) {
  return <div className="empty">{text}</div>;
}

function AppStyles() {
  return (
    <style>{`
*{box-sizing:border-box} html,body,#root{min-height:100%;margin:0} body{background:${BRAND.bg};font-family:${FN};color:${BRAND.text}} button,input,select,textarea{font-family:${FN}} ::selection{background:${A}44} ::-webkit-scrollbar{width:6px;height:6px} ::-webkit-scrollbar-thumb{background:rgba(255,255,255,.11);border-radius:999px} select{color-scheme:dark} input[type="date"]::-webkit-calendar-picker-indicator{filter:invert(.75)}
.app{min-height:100vh;background:radial-gradient(circle at 72% 4%, rgba(0,208,132,.20), transparent 28%),radial-gradient(circle at 18% 80%, rgba(20,184,106,.16), transparent 35%),#03120B;position:relative;overflow:hidden;color:${BRAND.text}}
.app:before{content:"";position:fixed;inset:0;background-image:linear-gradient(rgba(255,255,255,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.025) 1px,transparent 1px);background-size:64px 64px;mask-image:radial-gradient(circle at 50% 20%,black,transparent 78%);pointer-events:none}.app:after{content:"";position:fixed;inset:-20%;background:conic-gradient(from 180deg at 50% 50%,transparent,rgba(0,208,132,.12),transparent,rgba(20,184,106,.1),transparent);filter:blur(80px);opacity:.45;pointer-events:none;animation:spinSlow 26s linear infinite}@keyframes spinSlow{to{transform:rotate(360deg)}}
.login-wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;position:relative;z-index:1}.login-card{width:min(430px,100%);background:linear-gradient(180deg,rgba(22,18,35,.84),rgba(8,8,15,.76));border:1px solid rgba(255,255,255,.1);border-radius:28px;padding:42px;box-shadow:0 40px 120px rgba(0,0,0,.55), inset 0 1px 0 rgba(255,255,255,.06);backdrop-filter:blur(28px);position:relative;overflow:hidden}.login-card:before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 80% 0%,rgba(0,208,132,.2),transparent 40%);pointer-events:none}.login-title{font-size:30px;line-height:1;font-weight:900;letter-spacing:-.06em;text-align:center;margin:20px 0 8px}.login-sub{text-align:center;color:${BRAND.muted};font-size:13px;margin-bottom:30px}.input{width:100%;height:48px;border:1px solid rgba(255,255,255,.09);background:rgba(255,255,255,.045);border-radius:14px;color:${BRAND.text};outline:0;padding:0 15px;margin-bottom:12px;font-size:14px}.input:focus{border-color:${A};box-shadow:0 0 0 4px rgba(0,208,132,.13)}.err{color:${BRAND.red};font-size:12px;text-align:center;margin-bottom:10px}
.shell{height:100vh;display:flex;position:relative;z-index:1}.sidebar{width:258px;flex:0 0 258px;border-right:1px solid rgba(255,255,255,.08);background:rgba(3,3,8,.62);backdrop-filter:blur(28px);display:flex;flex-direction:column}.brand-row{height:74px;padding:0 18px;display:flex;align-items:center;gap:13px;border-bottom:1px solid rgba(255,255,255,.07)}.brand-name{font-weight:900;font-size:16px;letter-spacing:-.03em}.brand-tag{font-size:9px;color:${A};font-weight:900;letter-spacing:.18em}.orb-logo{width:52px;height:52px;border-radius:18px;display:grid;place-items:center;background:radial-gradient(circle at 30% 20%,#fff,${A} 26%,${A2} 72%);color:#120713;box-shadow:0 0 46px rgba(0,208,132,.45)}.orb-logo.small{width:34px;height:34px;border-radius:12px}.nav{flex:1;padding:14px 10px;overflow:auto}.nav-item{display:flex;align-items:center;gap:11px;height:42px;padding:0 13px;border-radius:14px;color:${BRAND.dim};font-size:13px;font-weight:750;cursor:pointer;transition:.2s}.nav-item:hover{background:rgba(255,255,255,.045);color:#DCD4EA}.nav-item.active{background:linear-gradient(90deg,rgba(0,208,132,.17),rgba(20,184,106,.09));color:${BRAND.text};box-shadow:inset 0 0 0 1px rgba(0,208,132,.18)}.user-box{padding:14px;border-top:1px solid rgba(255,255,255,.07);display:flex;align-items:center;gap:10px}.avatar{width:36px;height:36px;border-radius:13px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.09);display:grid;place-items:center;font-weight:900;color:${BRAND.muted}}
.main{flex:1;display:flex;flex-direction:column;min-width:0}.topbar{height:74px;flex:0 0 74px;border-bottom:1px solid rgba(255,255,255,.07);background:rgba(5,5,11,.55);backdrop-filter:blur(28px);display:flex;align-items:center;justify-content:space-between;padding:0 30px}.search{position:relative;width:min(360px,44vw)}.search svg{position:absolute;left:14px;top:50%;transform:translateY(-50%);color:${BRAND.dim}}.search input{padding-left:40px;margin:0}.warn-pill{font-size:12px;font-weight:850;color:#FFC0D9;background:rgba(0,208,132,.12);border:1px solid rgba(0,208,132,.22);border-radius:999px;padding:7px 13px}.content{flex:1;overflow:auto;padding:30px}.page-title{font-size:clamp(28px,3.4vw,54px);line-height:.95;font-weight:950;letter-spacing:-.075em;margin:0}.page-sub{color:${BRAND.muted};font-size:14px;margin-top:12px;max-width:640px;line-height:1.6}.hero{min-height:250px;border:1px solid rgba(255,255,255,.08);border-radius:32px;background:radial-gradient(circle at 70% 20%,rgba(0,208,132,.30),transparent 38%),linear-gradient(135deg,rgba(18,15,28,.92),rgba(8,7,15,.7));padding:34px;position:relative;overflow:hidden;box-shadow:0 32px 100px rgba(0,0,0,.42);margin-bottom:18px}.hero:before{content:"";position:absolute;right:80px;top:-130px;width:320px;height:320px;border:1px solid rgba(0,208,132,.26);border-radius:50%;box-shadow:0 0 42px rgba(0,208,132,.16), inset 0 0 30px rgba(0,208,132,.10)}.hero:after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(255,255,255,.035),transparent);transform:translateX(-100%);animation:sheen 7s ease-in-out infinite}@keyframes sheen{50%,100%{transform:translateX(100%)}}.hero-inner{position:relative;z-index:1;display:grid;grid-template-columns:1.1fr .9fr;gap:24px;align-items:center}.hero-stat{text-align:center}.hero-stat .big{font-size:clamp(36px,5vw,72px);font-weight:950;letter-spacing:.06em}.hero-stat .big span{color:${A}}.hero-stat p{color:${BRAND.muted};font-size:13px;line-height:1.5;margin:12px auto 22px;max-width:430px}.hero-actions{display:flex;gap:10px;justify-content:center}.floating-icons{position:absolute;inset:0;pointer-events:none}.floating-icons span{position:absolute;width:38px;height:38px;border-radius:14px;border:1px solid rgba(255,255,255,.08);display:grid;place-items:center;color:rgba(255,255,255,.38);background:rgba(0,0,0,.18)}.floating-icons span:nth-child(1){left:58%;top:12%}.floating-icons span:nth-child(2){right:9%;top:18%}.floating-icons span:nth-child(3){right:18%;bottom:22%}.floating-icons span:nth-child(4){left:44%;bottom:15%}
.grid{display:grid;gap:16px}.grid.kpis{grid-template-columns:repeat(4,minmax(0,1fr));margin-bottom:16px}.grid.two{grid-template-columns:repeat(2,minmax(0,1fr))}.grid.three{grid-template-columns:repeat(3,minmax(0,1fr))}.panel,.kpi-card{border:1px solid rgba(255,255,255,.08);background:linear-gradient(180deg,rgba(18,14,31,.76),rgba(8,8,15,.62));border-radius:24px;box-shadow:0 20px 70px rgba(0,0,0,.25),inset 0 1px 0 rgba(255,255,255,.04);backdrop-filter:blur(24px)}.panel{padding:22px;overflow:hidden}.panel-title{display:flex;align-items:center;justify-content:space-between;color:${BRAND.text};font-size:13px;font-weight:900;letter-spacing:.08em;text-transform:uppercase;margin-bottom:18px}.kpi-card{padding:22px;min-height:148px;position:relative;overflow:hidden}.kpi-card:before{content:"";position:absolute;right:-28px;top:-34px;width:100px;height:100px;border-radius:50%;background:rgba(0,208,132,.12);filter:blur(3px)}.kpi-card.violet:before{background:rgba(20,184,106,.15)}.kpi-card.green:before{background:rgba(52,211,153,.14)}.kpi-card.amber:before{background:rgba(251,191,36,.14)}.kpi-head{display:flex;align-items:center;justify-content:space-between;color:${BRAND.muted};font-size:12px;font-weight:900;text-transform:uppercase;letter-spacing:.08em}.kpi-value{margin-top:18px;font-size:clamp(28px,3vw,42px);font-weight:950;letter-spacing:-.06em;line-height:1}.kpi-trend{display:inline-flex;align-items:center;gap:5px;margin-top:14px;font-size:12px;color:${BRAND.green};font-weight:900}.btn{height:40px;border:0;border-radius:13px;padding:0 17px;display:inline-flex;align-items:center;justify-content:center;gap:8px;cursor:pointer;font-size:13px;font-weight:900;color:${BRAND.text};transition:.2s}.btn.primary{background:linear-gradient(135deg,${A},${A2});color:#140615;box-shadow:0 8px 30px rgba(0,208,132,.28)}.btn.primary:hover{transform:translateY(-1px);box-shadow:0 14px 40px rgba(0,208,132,.38)}.btn.ghost{background:rgba(255,255,255,.055);border:1px solid rgba(255,255,255,.09);color:#D6CCDF}.btn.danger{background:rgba(251,113,133,.1);color:${BRAND.red};border:1px solid rgba(251,113,133,.2)}.icon-btn{width:34px;height:34px;border-radius:12px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.045);color:${BRAND.muted};display:inline-grid;place-items:center;cursor:pointer}.icon-btn:hover{color:${BRAND.text};border-color:rgba(255,255,255,.18)}.table-wrap{overflow:auto;border-radius:22px;border:1px solid rgba(255,255,255,.08);background:rgba(7,7,13,.45)}table{width:100%;border-collapse:collapse;min-width:760px}th{padding:14px 18px;text-align:left;font-size:10px;color:${BRAND.dim};text-transform:uppercase;letter-spacing:.11em;background:rgba(5,5,11,.62);border-bottom:1px solid rgba(255,255,255,.07)}td{padding:15px 18px;border-bottom:1px solid rgba(255,255,255,.055);font-size:14px;color:${BRAND.muted}tr:hover td{background:rgba(0,208,132,.035)}.primary-text{color:${BRAND.text};font-weight:900}.subtext{color:${BRAND.dim};font-size:12px;margin-top:4px}.badge{display:inline-flex;align-items:center;border-radius:999px;padding:4px 10px;font-size:11px;font-weight:900;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.055);color:${BRAND.muted};white-space:nowrap}.badge.ok{color:#80F0C4;background:rgba(52,211,153,.10);border-color:rgba(52,211,153,.20)}.badge.warn{color:#FFD37A;background:rgba(251,191,36,.10);border-color:rgba(251,191,36,.20)}.badge.err{color:#FDA4AF;background:rgba(251,113,133,.10);border-color:rgba(251,113,133,.20)}.badge.info{color:#A8D9FF;background:rgba(125,211,252,.10);border-color:rgba(125,211,252,.20)}.badge.pink{color:#FFC0D9;background:rgba(0,208,132,.11);border-color:rgba(0,208,132,.23)}.badge.violet{color:#C4B5FD;background:rgba(20,184,106,.12);border-color:rgba(20,184,106,.25)}.progress{width:74px;height:6px;border-radius:999px;background:rgba(255,255,255,.06);overflow:hidden}.progress b{display:block;height:100%;border-radius:999px;background:linear-gradient(90deg,${A2},${A})}.tabs{display:inline-flex;gap:4px;background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.08);padding:4px;border-radius:15px;margin:18px 0}.tab{height:34px;border:0;background:transparent;color:${BRAND.dim};border-radius:12px;padding:0 15px;font-weight:900;cursor:pointer}.tab.active{background:rgba(0,208,132,.16);color:${BRAND.text}}.funnel-row{height:42px;border-radius:14px;display:flex;align-items:center;padding:0 14px;color:#100710;font-weight:950;margin-bottom:9px;box-shadow:0 10px 30px rgba(0,0,0,.18)}.tip{background:rgba(9,7,16,.96);border:1px solid rgba(255,255,255,.11);border-radius:14px;padding:12px 14px;box-shadow:0 20px 60px rgba(0,0,0,.45);backdrop-filter:blur(20px)}.tip-label{color:${BRAND.dim};font-size:10px;text-transform:uppercase;font-weight:900;letter-spacing:.1em;margin-bottom:6px}.tip-row{color:${BRAND.text};font-size:12px;font-weight:800}.empty{padding:28px;text-align:center;color:${BRAND.dim};font-size:13px}.modal-back{position:fixed;inset:0;background:rgba(3,3,8,.76);backdrop-filter:blur(24px);z-index:50;display:flex;align-items:center;justify-content:center;padding:20px}.modal{width:min(680px,100%);max-height:90vh;overflow:auto;border-radius:28px;background:linear-gradient(180deg,rgba(22,18,35,.97),rgba(8,8,15,.95));border:1px solid rgba(255,255,255,.11);box-shadow:0 40px 140px rgba(0,0,0,.65);padding:24px}.modal-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;padding-bottom:18px;border-bottom:1px solid rgba(255,255,255,.08)}.modal h3{margin:0;font-size:24px;letter-spacing:-.04em}.eyebrow{font-size:10px;color:${A};font-weight:950;letter-spacing:.16em;text-transform:uppercase;margin-bottom:5px}.form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.field{display:flex;flex-direction:column;gap:7px}.field span{font-size:11px;color:${BRAND.dim};font-weight:900;letter-spacing:.08em;text-transform:uppercase}.field input,.field select,.field textarea{min-height:44px;border-radius:14px;border:1px solid rgba(255,255,255,.09);background:rgba(255,255,255,.045);color:${BRAND.text};outline:0;padding:10px 13px;font-size:14px}.field textarea{min-height:82px;resize:vertical}.field input:focus,.field select:focus,.field textarea:focus{border-color:${A};box-shadow:0 0 0 4px rgba(0,208,132,.12)}.modal-actions{display:flex;gap:10px;margin-top:20px;padding-top:18px;border-top:1px solid rgba(255,255,255,.08)}.mini-row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 0;border-bottom:1px solid rgba(255,255,255,.06)}.mini-row:last-child{border-bottom:0}.mini-row b{display:block;color:${BRAND.text};font-size:13px}.mini-row span{display:block;color:${BRAND.dim};font-size:12px;margin-top:4px}.mobile-nav{display:none}.mobile-more{position:fixed;right:10px;bottom:68px;width:210px;z-index:20;border:1px solid rgba(255,255,255,.1);border-radius:20px;background:rgba(12,10,22,.96);box-shadow:0 24px 80px rgba(0,0,0,.55);padding:8px;backdrop-filter:blur(24px)}
@keyframes loadspin{to{transform:rotate(360deg)}}.loader{min-height:100vh;display:flex;align-items:center;justify-content:center;gap:12px;color:${BRAND.dim};background:${BRAND.bg};font-weight:900;letter-spacing:.08em}.loader b{width:20px;height:20px;border-radius:50%;border:2px solid rgba(255,255,255,.08);border-top-color:${A};animation:loadspin .7s linear infinite}
@media(max-width:980px){.app{overflow:hidden}.shell{display:flex;height:100dvh}.main{height:100dvh;min-height:0}.content{height:calc(100dvh - 62px);overflow:auto}.sidebar{display:none}.topbar{height:62px;padding:0 14px}.content{padding:14px 14px 92px}.hero{padding:22px;border-radius:24px}.hero-inner{display:block}.hero-stat{text-align:left;margin-top:26px}.hero-actions{justify-content:flex-start;flex-wrap:wrap}.grid.kpis,.grid.two,.grid.three{grid-template-columns:1fr}.form-grid{grid-template-columns:1fr}.mobile-nav{display:flex;position:fixed;left:0;right:0;bottom:0;height:72px;padding-bottom:env(safe-area-inset-bottom);background:rgba(5,5,11,.92);border-top:1px solid rgba(255,255,255,.08);z-index:15;backdrop-filter:blur(24px)}.mobile-item{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;color:${BRAND.dim};font-size:9px;font-weight:950}.mobile-item.active{color:${A}}.page-title{font-size:34px}.panel,.kpi-card{border-radius:20px}.modal{border-radius:24px 24px 0 0;position:fixed;bottom:0;left:0;right:0;max-height:92vh}.search{width:100%}.search.desktop{display:none}.brand-mobile{display:flex!important}}`}</style>
  );
}

function Home({ isAdmin, students, leads, finance, trials, reports, hsk, setPg }) {
  const [tab, setTab] = useState("kpi");
  const active = students.filter((s) => s.status === "Đang học");
  const overdue = finance.filter((f) => f.st === "overdue");
  const pending = finance.filter((f) => f.st === "pending");
  const needFollow = trials.filter((t) => t.result === "thinking");
  const collected = finance.reduce((a, f) => a + (f.d1 || 0) + (f.st === "paid" ? f.d2 || 0 : 0), 0);
  const hskPass = hsk.filter((x) => x.passed === "yes").length;
  const hskDone = hsk.filter((x) => x.status !== "registered").length;
  const hskRate = hskDone ? Math.round((hskPass / hskDone) * 100) : 0;
  const ranked = [...active].sort((a, b) => (b.score || 0) - (a.score || 0));

  const srcData = ["Facebook", "TikTok", "Giới thiệu", "Walk-in", "Website"]
    .map((s) => ({ name: s, v: [...students, ...leads].filter((x) => x.source === s).length }))
    .filter((d) => d.v > 0);
  const funnelData = [
    { s: "Hỏi", v: leads.filter((l) => l.stage !== "lost").length },
    { s: "Thử", v: leads.filter((l) => ["trial", "registered"].includes(l.stage)).length },
    { s: "Đăng ký", v: leads.filter((l) => l.stage === "registered").length },
    { s: "Đang học", v: active.length },
  ];
  const monthTrend = [
    { m: "T12", rev: 42, lead: 8, enroll: 2 },
    { m: "T1", rev: 48, lead: 12, enroll: 4 },
    { m: "T2", rev: 52, lead: 10, enroll: 3 },
    { m: "T3", rev: 58, lead: 15, enroll: 5 },
    { m: "T4", rev: 65, lead: 11, enroll: 3 },
    { m: "T5", rev: 72, lead: 14, enroll: 5 },
  ];
  const attendTrend = [
    { w: "T1", v: 88 },
    { w: "T2", v: 91 },
    { w: "T3", v: 85 },
    { w: "T4", v: 93 },
    { w: "T5", v: 90 },
    { w: "T6", v: 87 },
    { w: "T7", v: 92 },
    { w: "T8", v: 94 },
  ];

  return (
    <>
      <div className="hero">
        <div className="floating-icons"><span><Coins size={18} /></span><span><ShieldCheck size={18} /></span><span><Network size={18} /></span><span><Activity size={18} /></span></div>
        <div className="hero-inner">
          <div>
            <Badge tone="pink">Trung tâm vận hành Hán Tinh Premium</Badge>
            <h1 className="page-title" style={{ marginTop: 18 }}>Bảng điều khiển<br />tăng trưởng học viên</h1>
            <p className="page-sub">Một CRM xanh đậm, tương phản mạnh, dễ thao tác: theo dõi tuyển sinh, học thử, học viên, học phí, báo cáo lớp và chỉ số HSK trong cùng một luồng xử lý.</p>
            <div className="hero-actions">
              <button className="btn primary" onClick={() => setPg("leads")}>Mở tuyển sinh <ArrowUpRight size={16} /></button>
              <button className="btn ghost" onClick={() => setPg("charts")}>Xem biểu đồ</button>
            </div>
          </div>
          <div className="hero-stat">
            <div className="big"><span>{active.length}</span> đang học</div>
            <p>{leads.filter((l) => l.stage !== "lost").length} khách tiềm năng, {pending.length + overdue.length} khoản học phí cần xử lý, {needFollow.length} học thử cần nhắc lại.</p>
          </div>
        </div>
      </div>

      {isAdmin && (
        <div className="tabs">
          {[["kpi", LABEL.index], ["funnel", LABEL.funnel], ["trends", LABEL.trend]].map(([id, label]) => (
            <button key={id} className={`tab ${tab === id ? "active" : ""}`} onClick={() => setTab(id)}>{label}</button>
          ))}
        </div>
      )}

      <div className="grid kpis">
        <KpiCard label={LABEL.leads} value={leads.filter((l) => l.stage !== "lost").length} icon={Target} trend="+12%" />
        <KpiCard label={LABEL.students} value={active.length} icon={Users} tone="violet" trend="+8%" />
        <KpiCard label="HSK đỗ" value={`${hskRate}%`} icon={GraduationCap} tone="green" />
        <KpiCard label={LABEL.revenue} value={vnd(collected)} icon={Wallet} tone="amber" trend="+11%" />
      </div>

      {isAdmin && (
        <div className="grid two analysis-grid" style={{ marginBottom: 16 }}>
          <ChartBox title="Luồng tuyển sinh → đăng ký">
            <BarChart data={funnelData} layout="vertical" margin={{ left: 18, right: 18 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.05)" />
              <XAxis type="number" stroke="#6B6478" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="s" stroke="#6B6478" fontSize={11} tickLine={false} axisLine={false} width={72} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="v" fill={A} radius={[0, 10, 10, 0]} />
            </BarChart>
          </ChartBox>
          <ChartBox title="Doanh thu & nhịp tăng trưởng">
            <LineChart data={monthTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.05)" />
              <XAxis dataKey="m" stroke="#6B6478" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#6B6478" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip content={<Tip />} />
              <Line type="monotone" dataKey="rev" name="Doanh thu" stroke={A} strokeWidth={3} dot={{ fill: A, r: 4, strokeWidth: 0 }} />
              <Line type="monotone" dataKey="lead" name="Lead" stroke={BRAND.cyan} strokeWidth={2} dot={{ fill: BRAND.cyan, r: 3, strokeWidth: 0 }} />
            </LineChart>
          </ChartBox>
          <ChartBox title="Nguồn khách hàng">
            <PieChart>
              <Pie data={srcData} cx="50%" cy="50%" innerRadius={44} outerRadius={78} dataKey="v" stroke="none" label={({ name, v }) => `${name}:${v}`}>
                {srcData.map((_, i) => <Cell key={i} fill={CX[i]} />)}
              </Pie>
              <Tooltip content={<Tip />} />
            </PieChart>
          </ChartBox>
          <ChartBox title="Chuyên cần theo tuần">
            <LineChart data={attendTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.05)" />
              <XAxis dataKey="w" stroke="#6B6478" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis domain={[80, 100]} stroke="#6B6478" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip content={<Tip />} />
              <Line type="monotone" dataKey="v" name="Chuyên cần" stroke={BRAND.green} strokeWidth={3} dot={{ fill: BRAND.green, r: 4, strokeWidth: 0 }} />
            </LineChart>
          </ChartBox>
        </div>
      )}

      {(!isAdmin || tab === "kpi") && (
        <div className="grid three">
          <Panel title={LABEL.collect}>{overdue.length ? overdue.map((f) => <div key={f.id} className="mini-row"><div><b>{f.name}</b><span>{vnd(f.d2)}</span></div><Badge tone="err">Nợ</Badge></div>) : <Empty text="Không có khoản quá hạn" />}</Panel>
          <Panel title="Top học viên">{ranked.slice(0, 5).map((s, i) => <div key={s.id} className="mini-row"><div><b>{i + 1}. {s.name}</b><span>{s.cls}</span></div><Badge tone="ok">{s.score}</Badge></div>)}</Panel>
          <Panel title={LABEL.recent}>{reports.slice(0, 4).map((r) => <div key={r.id} className="mini-row"><div><b>{r.teacher}</b><span>{r.cls} · {r.date}</span></div><Badge tone={r.absent ? "warn" : "ok"}>{r.present}/{r.present + r.absent}</Badge></div>)}</Panel>
        </div>
      )}

      {isAdmin && tab === "funnel" && (
        <div className="grid two">
          <Panel title={LABEL.funnel}>
            {funnelData.map((f, i) => (
              <div key={f.s} className="funnel-row" style={{ width: `${Math.max((f.v / Math.max(funnelData[0]?.v || 1, 1)) * 100, 25)}%`, background: `linear-gradient(90deg, ${CX[i]}, ${CX[i]}AA)` }}>{f.s}: {f.v}</div>
            ))}
          </Panel>
          <ChartBox title={LABEL.source}>
            <PieChart><Pie data={srcData} cx="50%" cy="50%" innerRadius={44} outerRadius={78} dataKey="v" stroke="none" label={({ name, v }) => `${name.slice(0, 3)}:${v}`}>{srcData.map((_, i) => <Cell key={i} fill={CX[i]} />)}</Pie><Tooltip content={<Tip />} /></PieChart>
          </ChartBox>
        </div>
      )}

      {isAdmin && tab === "trends" && (
        <div className="grid two">
          <ChartBox title={LABEL.revenue}><BarChart data={monthTrend}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.05)" /><XAxis dataKey="m" stroke="#6B6478" fontSize={11} tickLine={false} axisLine={false} /><YAxis stroke="#6B6478" fontSize={11} tickLine={false} axisLine={false} /><Tooltip content={<Tip />} /><Bar dataKey="rev" fill={A} radius={[8, 8, 0, 0]} /></BarChart></ChartBox>
          <ChartBox title={LABEL.attendance}><LineChart data={attendTrend}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.05)" /><XAxis dataKey="w" stroke="#6B6478" fontSize={11} tickLine={false} axisLine={false} /><YAxis domain={[80, 100]} stroke="#6B6478" fontSize={11} tickLine={false} axisLine={false} /><Tooltip content={<Tip />} /><Line type="monotone" dataKey="v" stroke={BRAND.cyan} strokeWidth={3} dot={{ fill: BRAND.cyan, r: 4, strokeWidth: 0 }} /></LineChart></ChartBox>
        </div>
      )}
    </>
  );
}

function DataPage({ title, button, children }) {
  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, marginBottom: 22 }}>
        <div><h1 className="page-title">{title}</h1></div>
        {button}
      </div>
      {children}
    </>
  );
}

function MiniActions({ onEdit, onDelete, extra }) {
  return <div style={{ display: "flex", gap: 6, alignItems: "center" }}>{extra}<button className="icon-btn" onClick={onEdit}><Pencil size={14} /></button>{onDelete && <button className="icon-btn" onClick={onDelete}><Trash2 size={14} /></button>}</div>;
}

export default function App() {
  const data = useAppData();
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("ht_user") || "null"); } catch { return null; }
  });
  const [lu, setLu] = useState("");
  const [lp, setLp] = useState("");
  const [le, setLe] = useState("");
  const [pg, setPg] = useState("home");
  const [q, setQ] = useState("");
  const [modal, setModal] = useState(null);
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    if (document.getElementById("_ht_font")) return;
    const pre = document.createElement("link");
    pre.rel = "preconnect";
    pre.href = "https://fonts.googleapis.com";
    document.head.appendChild(pre);
    const pre2 = document.createElement("link");
    pre2.rel = "preconnect";
    pre2.href = "https://fonts.gstatic.com";
    pre2.crossOrigin = "anonymous";
    document.head.appendChild(pre2);
    const lk = document.createElement("link");
    lk.id = "_ht_font";
    lk.rel = "stylesheet";
    lk.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap";
    document.head.appendChild(lk);
  }, []);

  const isAdmin = user?.role === "admin";
  const canSee = (c) => isAdmin || (user?.cls || "").split(",").includes(c);
  const teachers = useMemo(() => [...new Set(data.classes.map((c) => c.teacher).filter(Boolean))], [data.classes]);
  const query = q.trim().toLowerCase();

  const setters = {
    s: [data.students, data.setStudents, "students"],
    l: [data.leads, data.setLeads, "leads"],
    tr: [data.trials, data.setTrials, "trials"],
    ct: [data.contracts, data.setContracts, "contracts"],
    hk: [data.hsk, data.setHsk, "hsk_exams"],
    r: [data.reports, data.setReports, "reports"],
    i: [data.interactions, data.setInteractions, "interactions"],
    f: [data.finance, data.setFinance, "finance"],
  };

  const openModal = (t, d, n = false) => setModal({ t, d, n });
  const doSave = async (type, row) => {
    const [arr, setter, tbl] = setters[type];
    let final = { ...row };
    if (type === "f" && final.total) {
      final.d1 = Math.round(final.total / 2);
      final.d2 = Math.round(final.total / 2);
    }
    if (type === "hk") final.status = final.passed === "yes" ? "passed" : final.passed === "no" ? "failed" : "registered";
    if (modal.n) {
      setter(type === "r" || type === "i" ? [final, ...arr] : [...arr, final]);
      await addRow(tbl, final);
    } else {
      setter(arr.map((x) => (x.id === final.id ? final : x)));
      await updateRow(tbl, final);
    }
    setModal(null);
  };
  const doDel = async (type, id) => {
    const [arr, setter, tbl] = setters[type];
    setter(arr.filter((x) => x.id !== id));
    await deleteRow(tbl, id);
  };

  const login = () => {
    const u = USERS.find((x) => x.user === lu && x.pass === lp);
    if (!u) return setLe(LABEL.wrong);
    setUser(u);
    localStorage.setItem("ht_user", JSON.stringify(u));
    setLe("");
  };
  const logout = () => {
    setUser(null);
    localStorage.removeItem("ht_user");
    setPg("home");
  };

  const adminMenu = [
    { id: "home", l: LABEL.home, ic: LayoutDashboard },
    { id: "leads", l: LABEL.leads, ic: Target },
    { id: "trials", l: LABEL.trials, ic: BookOpen },
    { id: "stu", l: LABEL.students, ic: Users },
    { id: "contracts", l: LABEL.contracts, ic: FileText },
    { id: "hsk", l: LABEL.hsk, ic: GraduationCap },
    { id: "rpt", l: LABEL.reports, ic: ClipboardList },
    { id: "log", l: LABEL.log, ic: MessageSquare },
    { id: "fin", l: LABEL.finance, ic: Wallet },
    { id: "charts", l: LABEL.charts, ic: BarChart3 },
  ];
  const teacherMenu = [
    { id: "home", l: LABEL.home, ic: LayoutDashboard },
    { id: "stu", l: LABEL.students, ic: Users },
    { id: "rpt", l: LABEL.reports, ic: ClipboardList },
    { id: "hsk", l: LABEL.hsk, ic: GraduationCap },
  ];
  const menu = isAdmin ? adminMenu : teacherMenu;
  const mobNav = isAdmin ? [adminMenu[0], adminMenu[1], adminMenu[3], adminMenu[6], { id: "more", l: "More", ic: Menu }] : teacherMenu;
  const moreMenu = adminMenu.filter((m) => !["home", "leads", "stu", "rpt"].includes(m.id));

  if (!data.ok) return <><AppStyles /><div className="loader"><b />Loading</div></>;

  if (!user) {
    return (
      <div className="app">
        <AppStyles />
        <div className="login-wrap">
          <div className="login-card">
            <div style={{ display: "grid", placeItems: "center" }}><OrbLogo /></div>
            <div className="login-title">Hán Tinh<br />Premium CRM</div>
            <div className="login-sub">{LABEL.login}</div>
            <input className="input" placeholder={LABEL.account} value={lu} onChange={(e) => setLu(e.target.value)} onKeyDown={(e) => e.key === "Enter" && login()} />
            <input className="input" placeholder={LABEL.pass} type="password" value={lp} onChange={(e) => setLp(e.target.value)} onKeyDown={(e) => e.key === "Enter" && login()} />
            {le && <div className="err">{le}</div>}
            <button className="btn primary" style={{ width: "100%", height: 48 }} onClick={login}>Đăng nhập</button>
          </div>
        </div>
      </div>
    );
  }

  const overdue = data.finance.filter((f) => f.st === "overdue");
  const needFollow = data.trials.filter((t) => t.result === "thinking");
  const hskPass = data.hsk.filter((h) => h.passed === "yes").length;
  const hskDone = data.hsk.filter((h) => h.status !== "registered").length;
  const hskRate = hskDone ? Math.round((hskPass / hskDone) * 100) : 0;

  return (
    <div className="app">
      <AppStyles />
      <div className="shell">
        <aside className="sidebar">
          <div className="brand-row">
            <OrbLogo small />
            <div><div className="brand-name">Hán Tinh</div><div className="brand-tag">PREMIUM</div></div>
          </div>
          <nav className="nav">
            {menu.map((m) => {
              const Ic = m.ic;
              return <div key={m.id} className={`nav-item ${pg === m.id ? "active" : ""}`} onClick={() => setPg(m.id)}><Ic size={17} />{m.l}</div>;
            })}
          </nav>
          <div className="user-box">
            <div className="avatar">{user.name.charAt(0)}</div>
            <div style={{ flex: 1, minWidth: 0 }}><div className="primary-text" style={{ fontSize: 13 }}>{user.name}</div><div className="subtext">{isAdmin ? "Quản trị" : "Giáo viên"}</div></div>
            <button className="icon-btn" onClick={logout}><LogOut size={15} /></button>
          </div>
        </aside>

        <main className="main">
          <header className="topbar">
            <div className="brand-mobile" style={{ display: "none", alignItems: "center", gap: 8 }}><OrbLogo small /><b>Hán Tinh</b></div>
            <div className="search desktop"><Search size={16} /><input className="input" placeholder={LABEL.search} value={q} onChange={(e) => setQ(e.target.value)} /></div>
            <div>{isAdmin && overdue.length + needFollow.length > 0 && <span className="warn-pill">{overdue.length + needFollow.length} việc cần xử lý</span>}</div>
          </header>

          <div className="content">
            {pg === "home" && <Home isAdmin={isAdmin} students={data.students} leads={data.leads} finance={data.finance} trials={data.trials} reports={data.reports} hsk={data.hsk} setPg={setPg} />}

            {pg === "leads" && isAdmin && (
              <DataPage title="Khách tiềm năng" button={<button className="btn primary" onClick={() => openModal("l", { id: `LD${Date.now()}`, name: "", phone: "", source: "Facebook", stage: "inquiry", interest: "HSK 1", note: "", created: today, lastContact: today }, true)}><Plus size={15} />{LABEL.add}</button>}>
                <div className="table-wrap"><table><thead><tr>{[LABEL.name, LABEL.phone, LABEL.source, "Quan tâm", "Giai đoạn", ""].map((h) => <th key={h}>{h}</th>)}</tr></thead><tbody>{data.leads.map((l) => <tr key={l.id}><td><div className="primary-text">{l.name}</div></td><td>{l.phone}</td><td><Badge tone="info">{l.source}</Badge></td><td><Badge tone="violet">{l.interest}</Badge></td><td><Badge tone={l.stage === "registered" ? "ok" : l.stage === "lost" ? "err" : l.stage === "trial" ? "warn" : "pink"}>{({ inquiry: "Hỏi thăm", trial: "Học thử", registered: "Đã ĐK", lost: "Mất" })[l.stage] || l.stage}</Badge></td><td><MiniActions onEdit={() => openModal("l", { ...l })} onDelete={() => confirm(LABEL.delete) && doDel("l", l.id)} extra={l.stage === "inquiry" && <button className="btn ghost" onClick={() => { const next = { ...l, stage: "trial" }; data.setLeads(data.leads.map((x) => x.id === l.id ? next : x)); updateRow("leads", next); }}><ChevronRight size={14} />Thử</button>} /></td></tr>)}</tbody></table></div>
              </DataPage>
            )}

            {pg === "stu" && (
              <DataPage title="Học viên" button={isAdmin && <button className="btn primary" onClick={() => openModal("s", { id: `HV${Date.now()}`, name: "", phone: "", cls: data.classes[0]?.id || "", level: "HSK 1", status: "Đang học", score: 0, attend: 90, source: "Facebook" }, true)}><Plus size={15} />{LABEL.add}</button>}>
                <div className="table-wrap"><table><thead><tr>{["#", "HV", "Level", LABEL.class, LABEL.score, "CC", "TT", ...(isAdmin ? [""] : [])].map((h) => <th key={h}>{h}</th>)}</tr></thead><tbody>{data.students.filter((s) => (!query || s.name.toLowerCase().includes(query)) && canSee(s.cls)).map((s, i) => <tr key={s.id}><td>{i + 1}</td><td><div className="primary-text">{s.name}</div><div className="subtext">{s.phone}</div></td><td><Badge tone="info">{s.level}</Badge></td><td>{s.cls}</td><td><b style={{ color: s.score >= 8 ? BRAND.green : s.score >= 6.5 ? BRAND.amber : BRAND.red, fontSize: 22 }}>{s.score}</b></td><td><div style={{ display: "flex", alignItems: "center", gap: 8 }}><div className="progress"><b style={{ width: `${s.attend}%` }} /></div><span>{s.attend}%</span></div></td><td><Badge tone={s.status === "Đang học" ? "ok" : s.status === "Tạm nghỉ" ? "warn" : "err"}>{s.status}</Badge></td>{isAdmin && <td><MiniActions onEdit={() => openModal("s", { ...s })} onDelete={() => confirm(LABEL.delete) && doDel("s", s.id)} /></td>}</tr>)}</tbody></table></div>
              </DataPage>
            )}

            {pg === "trials" && isAdmin && (
              <DataPage title="Học thử" button={<button className="btn primary" onClick={() => openModal("tr", { id: `TL${Date.now()}`, name: "", phone: "", date: today, time: "18:00", cls: data.classes[0]?.id || "", teacher: teachers[0] || "", status: "scheduled", result: "", followUp: "" }, true)}><Plus size={15} />{LABEL.schedule}</button>}>
                <div className="table-wrap"><table><thead><tr>{[LABEL.name, LABEL.date, LABEL.class, "TT", "KQ", LABEL.reminder, ""].map((h) => <th key={h}>{h}</th>)}</tr></thead><tbody>{data.trials.map((t) => <tr key={t.id}><td><div className="primary-text">{t.name}</div></td><td>{t.date} {t.time}</td><td>{t.cls}</td><td><Badge tone={t.status === "completed" ? "ok" : t.status === "no-show" ? "err" : "info"}>{({ scheduled: "Đã xếp", completed: "Đã học", "no-show": "Không đến" })[t.status]}</Badge></td><td>{t.result ? <Badge tone={t.result === "enrolled" ? "ok" : t.result === "thinking" ? "warn" : "err"}>{({ enrolled: "Đã ĐK", thinking: "Suy nghĩ", "not-interested": "Không QT" })[t.result]}</Badge> : "--"}</td><td>{t.followUp || "--"}</td><td><MiniActions onEdit={() => openModal("tr", { ...t })} extra={t.status === "scheduled" && <button className="btn primary" onClick={() => { const next = { ...t, status: "completed" }; data.setTrials(data.trials.map((x) => x.id === t.id ? next : x)); updateRow("trials", next); }}><Check size={14} /></button>} /></td></tr>)}</tbody></table></div>
              </DataPage>
            )}

            {pg === "contracts" && isAdmin && (
              <DataPage title="Hợp đồng" button={<button className="btn primary" onClick={() => openModal("ct", { id: `HD${Date.now()}`, name: "", cls: data.classes[0]?.id || "", start: today, end: "", duration: "6 tháng", fee: 0, status: "active" }, true)}><Plus size={15} />{LABEL.create}</button>}>
                <div className="table-wrap"><table><thead><tr>{["HV", LABEL.class, "BD", "KT", LABEL.fee, "TT", "Còn", ""].map((h) => <th key={h}>{h}</th>)}</tr></thead><tbody>{data.contracts.map((c) => { const dl = daysLeft(c.end); const rs = c.status === "renewed" ? "renewed" : dl <= 0 ? "expired" : dl <= 30 ? "expiring" : "active"; return <tr key={c.id}><td><div className="primary-text">{c.name}</div></td><td><Badge tone="info">{c.cls}</Badge></td><td>{c.start}</td><td>{c.end}</td><td><b style={{ color: BRAND.green }}>{vnd(c.fee)}</b></td><td><Badge tone={rs === "active" || rs === "renewed" ? "ok" : rs === "expiring" ? "warn" : "err"}>{({ active: "OK", expiring: "Sắp hết", expired: "Hết", renewed: "Gia hạn" })[rs]}</Badge></td><td style={{ color: dl <= 0 ? BRAND.red : dl <= 30 ? BRAND.amber : BRAND.green, fontWeight: 900 }}>{dl <= 0 ? "Hết" : `${dl} ngày`}</td><td><MiniActions onEdit={() => openModal("ct", { ...c })} /></td></tr>; })}</tbody></table></div>
              </DataPage>
            )}

            {pg === "hsk" && (
              <DataPage title="Thi HSK" button={isAdmin && <button className="btn primary" onClick={() => openModal("hk", { id: `HSK${Date.now()}`, name: "", level: "HSK 1", examDate: "", score: 0, passed: "", status: "registered" }, true)}><Plus size={15} />Đăng ký</button>}>
                <div className="grid two" style={{ marginBottom: 16 }}>
                  <ChartBox title={LABEL.result}><BarChart data={["HSK 1", "HSK 2", "HSK 3", "HSK 4", "HSK 5"].map((l) => ({ l, p: data.hsk.filter((h) => h.level === l && h.passed === "yes").length, f: data.hsk.filter((h) => h.level === l && h.passed === "no").length }))}><XAxis dataKey="l" stroke="#6B6478" fontSize={11} tickLine={false} axisLine={false} /><YAxis stroke="#6B6478" fontSize={11} tickLine={false} axisLine={false} /><Tooltip content={<Tip />} /><Bar dataKey="p" name="Đạt" fill={BRAND.green} stackId="a" radius={[8, 8, 0, 0]} /><Bar dataKey="f" name="Trượt" fill={BRAND.red} stackId="a" radius={[8, 8, 0, 0]} /></BarChart></ChartBox>
                  <Panel title={LABEL.rate}><div style={{ display: "grid", placeItems: "center", minHeight: 210 }}><div style={{ fontSize: 72, fontWeight: 950, letterSpacing: "-.08em", color: hskRate >= 70 ? BRAND.green : BRAND.amber }}>{hskRate}%</div><div className="subtext">{hskPass}/{hskDone}</div></div></Panel>
                </div>
                <div className="table-wrap"><table><thead><tr>{["HV", "Level", LABEL.date, LABEL.score, "KQ", ...(isAdmin ? [""] : [])].map((h) => <th key={h}>{h}</th>)}</tr></thead><tbody>{data.hsk.map((h) => <tr key={h.id}><td><div className="primary-text">{h.name}</div></td><td><Badge tone="violet">{h.level}</Badge></td><td>{h.examDate}</td><td><b>{h.score || "--"}</b></td><td><Badge tone={h.passed === "yes" ? "ok" : h.passed === "no" ? "err" : "info"}>{h.passed === "yes" ? "ĐẠT" : h.passed === "no" ? "Chưa đạt" : "Chưa thi"}</Badge></td>{isAdmin && <td><MiniActions onEdit={() => openModal("hk", { ...h })} /></td>}</tr>)}</tbody></table></div>
              </DataPage>
            )}

            {pg === "rpt" && (
              <DataPage title="Báo cáo lớp" button={<button className="btn primary" onClick={() => openModal("r", { id: `RP${Date.now()}`, date: today, teacher: isAdmin ? teachers[0] || "" : user.name, cls: data.classes[0]?.id || "", present: 0, absent: 0, absentNames: "", lesson: "", homework: "", flags: "", highlights: "" }, true)}><Plus size={15} />{LABEL.create}</button>}>
                <div className="grid two">{data.reports.filter((r) => isAdmin || r.teacher === user.name).map((r) => <Panel key={r.id} title={`${r.teacher} · ${r.cls}`} action={<MiniActions onEdit={() => openModal("r", { ...r })} />}><Badge tone={r.absent === 0 ? "ok" : "warn"}>{r.present}/{r.present + r.absent}</Badge><p className="page-sub" style={{ marginTop: 12 }}>{r.lesson}</p>{r.flags && <div style={{ marginTop: 10 }}><Badge tone="err">! {r.flags}</Badge></div>}{r.highlights && <div style={{ marginTop: 10 }}><Badge tone="ok">* {r.highlights}</Badge></div>}</Panel>)}</div>
              </DataPage>
            )}

            {pg === "log" && isAdmin && (
              <DataPage title="Lịch sử tương tác" button={<button className="btn primary" onClick={() => openModal("i", { id: `IT${Date.now()}`, refName: "", date: today, type: "message", content: "", by: "Admin" }, true)}><Plus size={15} />{LABEL.add}</button>}>
                <div className="grid two">{data.interactions.map((it) => <Panel key={it.id} title={it.refName} action={<MiniActions onEdit={() => openModal("i", { ...it })} />}><Badge tone="info">{it.type}</Badge><p className="page-sub">{it.content}</p><div className="subtext">{it.date} · {it.by}</div></Panel>)}</div>
              </DataPage>
            )}

            {pg === "fin" && isAdmin && (
              <DataPage title="Tài chính" button={<button className="btn primary" onClick={() => openModal("f", { id: `HP${Date.now()}`, name: "", cls: data.classes[0]?.id || "", total: 0, d1: 0, d2: 0, d2d: "", st: "pending" }, true)}><Plus size={15} />{LABEL.add}</button>}>
                <div className="table-wrap"><table><thead><tr>{["HV", LABEL.class, "Tổng", "D1", "D2", "Hạn", "TT", ""].map((h) => <th key={h}>{h}</th>)}</tr></thead><tbody>{data.finance.map((f) => <tr key={f.id}><td><div className="primary-text">{f.name}</div></td><td><Badge tone="info">{f.cls}</Badge></td><td><b style={{ color: BRAND.green }}>{vnd(f.total)}</b></td><td>{vnd(f.d1)}</td><td>{vnd(f.d2)}</td><td>{f.d2d}</td><td><Badge tone={f.st === "paid" ? "ok" : f.st === "pending" ? "warn" : "err"}>{f.st === "paid" ? "OK" : f.st === "pending" ? "Chờ" : "Nợ"}</Badge></td><td><MiniActions onEdit={() => openModal("f", { ...f })} extra={f.st !== "paid" && <button className="btn primary" onClick={() => { const next = { ...f, st: "paid" }; data.setFinance(data.finance.map((x) => x.id === f.id ? next : x)); updateRow("finance", next); }}><Check size={14} /></button>} /></td></tr>)}</tbody></table></div>
              </DataPage>
            )}

            {pg === "charts" && isAdmin && (
              <DataPage title="Biểu đồ">
                <div className="grid two">
                  <ChartBox title="Doanh thu"><BarChart data={[{ m: "T12", rev: 42 }, { m: "T1", rev: 48 }, { m: "T2", rev: 52 }, { m: "T3", rev: 58 }, { m: "T4", rev: 65 }, { m: "T5", rev: 72 }]}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.05)" /><XAxis dataKey="m" stroke="#6B6478" fontSize={11} tickLine={false} axisLine={false} /><YAxis stroke="#6B6478" fontSize={11} tickLine={false} axisLine={false} /><Tooltip content={<Tip />} /><Bar dataKey="rev" fill={A} radius={[8, 8, 0, 0]} /></BarChart></ChartBox>
                  <ChartBox title="Thanh toán"><PieChart><Pie data={[{ n: "Đủ", v: data.finance.filter((f) => f.st === "paid").length }, { n: "Chờ", v: data.finance.filter((f) => f.st === "pending").length }, { n: "Nợ", v: data.finance.filter((f) => f.st === "overdue").length }]} cx="50%" cy="50%" innerRadius={44} outerRadius={78} dataKey="v" stroke="none" label={({ n, v }) => `${n}:${v}`}>{[BRAND.green, BRAND.amber, BRAND.red].map((c, i) => <Cell key={i} fill={c} />)}</Pie><Tooltip content={<Tip />} /></PieChart></ChartBox>
                </div>
              </DataPage>
            )}
          </div>
        </main>
      </div>

      <div className="mobile-nav">
        {mobNav.map((m) => {
          const Ic = m.ic;
          const active = pg === m.id || (m.id === "more" && showMore);
          return <div key={m.id} className={`mobile-item ${active ? "active" : ""}`} onClick={() => { if (m.id === "more") setShowMore(!showMore); else { setPg(m.id); setShowMore(false); } }}><Ic size={19} /><span>{m.l === "More" ? "Thêm" : m.l}</span></div>;
        })}
      </div>
      {showMore && <div className="mobile-more">{moreMenu.map((m) => { const Ic = m.ic; return <div key={m.id} className="nav-item" onClick={() => { setPg(m.id); setShowMore(false); }}><Ic size={16} />{m.l}</div>; })}<div className="nav-item" style={{ color: BRAND.red }} onClick={logout}><LogOut size={16} />{LABEL.logout}</div></div>}

      {modal && <ModalForm modal={modal} onClose={() => setModal(null)} onSave={(row) => doSave(modal.t, row)} classes={data.classes} teachers={teachers} user={user} isAdmin={isAdmin} />}
    </div>
  );
}
