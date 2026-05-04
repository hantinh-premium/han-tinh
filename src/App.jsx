import { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabase";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  LayoutDashboard,
  Target,
  Users,
  BookOpen,
  Wallet,
  ClipboardList,
  BarChart3,
  Plus,
  Pencil,
  Trash2,
  Archive,
  Search,
  Save,
  X,
  LogOut,
  Check,
  AlertTriangle,
  Menu,
  Filter,
  Download,
  RefreshCw,
} from "lucide-react";

const FONT = "'Be Vietnam Pro', Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const GREEN = "#00D084";
const GREEN_DARK = "#059669";
const GREEN_SOFT = "#7CFFB2";
const BG = "#03120B";
const PANEL = "rgba(7, 26, 17, .78)";
const LINE = "rgba(255,255,255,.10)";
const TEXT = "#F5FFF8";
const MUTED = "#A8B8AE";
const DIM = "#607368";
const RED = "#FB7185";
const AMBER = "#FBBF24";
const BLUE = "#8FFFD2";
const COLORS = [GREEN, "#16A34A", BLUE, AMBER, RED, "#22C55E"];
const today = new Date().toISOString().slice(0, 10);

const USERS = [
  { user: "admin", pass: "hantinh2026", role: "admin", name: "Admin", cls: "all" },
  { user: "cohoa", pass: "gv2026", role: "teacher", name: "Cô Hoa", cls: "CN-A1" },
  { user: "thaylong", pass: "gv2026", role: "teacher", name: "Thầy Long", cls: "CN-A3,CN-B2" },
  { user: "cowang", pass: "gv2026", role: "teacher", name: "Cô Wang Li", cls: "CN-A2" },
  { user: "thaynam", pass: "gv2026", role: "teacher", name: "Thầy Nam", cls: "CN-B1" },
];

const FIELD_MAP = {
  trials: { date: "trial_date", time: "trial_time", followUp: "follow_up" },
  reports: { absentNames: "absent_names" },
  interactions: { refName: "ref_name", by: "by_user" },
  contracts: { start: "start_date", end: "end_date" },
  hsk_exams: { examDate: "exam_date" },
};

const TABLE = {
  leads: "leads",
  trials: "trials",
  students: "students",
  finance: "finance",
  reports: "reports",
  contracts: "contracts",
  hsk: "hsk_exams",
  interactions: "interactions",
};

const SEED = {
  classes: [
    { id: "CN-A1", teacher: "Cô Hoa" },
    { id: "CN-A2", teacher: "Cô Wang Li" },
    { id: "CN-A3", teacher: "Thầy Long" },
    { id: "CN-B1", teacher: "Thầy Nam" },
    { id: "CN-B2", teacher: "Thầy Long" },
  ],
  leads: [
    { id: "LD001", name: "Thanh Vy", phone: "0911111111", source: "Facebook", stage: "inquiry", interest: "HSK 1", note: "Quan tâm lớp tối", status: "active", created: today, lastContact: today },
    { id: "LD002", name: "Bảo Ngọc", phone: "0922222222", source: "TikTok", stage: "trial", interest: "HSK 2", note: "Muốn học thử cuối tuần", status: "active", created: today, lastContact: today },
  ],
  trials: [
    { id: "TL001", name: "Bảo Ngọc", phone: "0922222222", date: today, time: "18:00", cls: "CN-A2", teacher: "Cô Wang Li", status: "scheduled", result: "thinking", followUp: today, archived: false },
  ],
  students: [
    { id: "HV001", name: "Võ Thanh Tùng", phone: "0900000001", cls: "CN-B2", level: "HSK 4", score: 9.5, attend: 96, source: "Facebook", status: "Đang học", archived: false },
    { id: "HV002", name: "Lê Thị Hồng", phone: "0900000002", cls: "CN-B1", level: "HSK 3", score: 9.1, attend: 92, source: "TikTok", status: "Đang học", archived: false },
    { id: "HV003", name: "Nguyễn Minh Anh", phone: "0900000003", cls: "CN-A3", level: "HSK 2", score: 8.5, attend: 90, source: "Giới thiệu", status: "Đang học", archived: false },
    { id: "HV004", name: "Đặng Thuỳ Linh", phone: "0900000004", cls: "CN-A2", level: "HSK 2", score: 8, attend: 88, source: "Website", status: "Đang học", archived: false },
  ],
  contracts: [
    { id: "HD001", name: "Võ Thanh Tùng", cls: "CN-B2", start: today, end: "2026-08-31", duration: "6 tháng", fee: 12000000, status: "active", archived: false },
  ],
  finance: [
    { id: "HP001", name: "Võ Thanh Tùng", cls: "CN-B2", total: 12000000, d1: 6000000, d2: 6000000, d2d: "2026-06-01", st: "pending", archived: false },
    { id: "HP002", name: "Lê Thị Hồng", cls: "CN-B1", total: 12000000, d1: 6000000, d2: 6000000, d2d: "2026-05-01", st: "overdue", archived: false },
  ],
  reports: [
    { id: "RP001", date: "2026-05-02", teacher: "Cô Hoa", cls: "CN-A1", present: 16, absent: 2, absentNames: "", lesson: "Ôn giao tiếp cơ bản và luyện phản xạ", homework: "Làm bài nghe 1", flags: "", highlights: "Lớp tương tác tốt", archived: false },
    { id: "RP002", date: "2026-05-01", teacher: "Thầy Long", cls: "CN-A3", present: 11, absent: 1, absentNames: "", lesson: "Luyện đọc hội thoại", homework: "", flags: "Một bạn vắng 2 buổi", highlights: "", archived: false },
  ],
  hsk: [
    { id: "HSK001", name: "Võ Thanh Tùng", level: "HSK 4", examDate: "2026-06-12", score: 278, passed: "yes", status: "passed", archived: false },
  ],
  interactions: [
    { id: "IT001", refName: "Thanh Vy", date: today, type: "message", by: "Admin", content: "Đã gửi lịch học thử và bảng học phí.", archived: false },
  ],
};

function toDb(table, row) {
  const map = FIELD_MAP[table] || {};
  const out = {};
  Object.entries(row || {}).forEach(([k, v]) => {
    if (k !== "created_at") out[map[k] || k] = v;
  });
  return out;
}

function toApp(table, row) {
  const map = FIELD_MAP[table] || {};
  const reverse = Object.fromEntries(Object.entries(map).map(([k, v]) => [v, k]));
  const out = {};
  Object.entries(row || {}).forEach(([k, v]) => {
    out[reverse[k] || k] = v;
  });
  return out;
}

async function loadTable(table) {
  try {
    const { data, error } = await supabase.from(table).select("*").limit(5000);
    if (error) return [];
    return (data || []).map((r) => toApp(table, r));
  } catch {
    return [];
  }
}

async function insertRow(table, row) {
  const payload = toDb(table, row);
  delete payload.created_at;
  const { error } = await supabase.from(table).insert([payload]);
  if (error) throw error;
}

async function patchRow(table, row) {
  const payload = toDb(table, row);
  delete payload.created_at;
  const { error } = await supabase.from(table).update(payload).eq("id", row.id);
  if (error) throw error;
}

async function removeRow(table, id) {
  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) throw error;
}

const money = (n) => new Intl.NumberFormat("vi-VN").format(Number(n || 0)) + "đ";
const uid = (prefix) => `${prefix}${Date.now()}`;
const isActive = (x) => !x.archived && x.status !== "archived";
const dayLeft = (d) => {
  if (!d) return 0;
  const t = new Date(d).getTime();
  return Number.isFinite(t) ? Math.ceil((t - Date.now()) / 86400000) : 0;
};

function useData(toast) {
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [leads, setLeads] = useState([]);
  const [trials, setTrials] = useState([]);
  const [students, setStudents] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [finance, setFinance] = useState([]);
  const [reports, setReports] = useState([]);
  const [hsk, setHsk] = useState([]);
  const [interactions, setInteractions] = useState([]);

  async function refresh() {
    setLoading(true);
    const [c, l, t, s, ct, f, r, h, i] = await Promise.all([
      loadTable("classes"),
      loadTable("leads"),
      loadTable("trials"),
      loadTable("students"),
      loadTable("contracts"),
      loadTable("finance"),
      loadTable("reports"),
      loadTable("hsk_exams"),
      loadTable("interactions"),
    ]);
    setClasses(c.length ? c : SEED.classes);
    setLeads(l.length ? l : SEED.leads);
    setTrials(t.length ? t : SEED.trials);
    setStudents(s.length ? s : SEED.students);
    setContracts(ct.length ? ct : SEED.contracts);
    setFinance(f.length ? f : SEED.finance);
    setReports(r.length ? r : SEED.reports);
    setHsk(h.length ? h : SEED.hsk);
    setInteractions(i.length ? i : SEED.interactions);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  const state = {
    leads: [leads, setLeads],
    trials: [trials, setTrials],
    students: [students, setStudents],
    contracts: [contracts, setContracts],
    finance: [finance, setFinance],
    reports: [reports, setReports],
    hsk: [hsk, setHsk],
    interactions: [interactions, setInteractions],
  };

  async function save(kind, row, isNew) {
    const [arr, setArr] = state[kind];
    const table = TABLE[kind];
    const final = { ...row };
    try {
      if (isNew) {
        setArr([final, ...arr]);
        await insertRow(table, final);
        toast("Đã thêm dữ liệu", "ok");
      } else {
        setArr(arr.map((x) => (x.id === final.id ? final : x)));
        await patchRow(table, final);
        toast("Đã lưu thay đổi", "ok");
      }
    } catch (e) {
      toast("Không lưu được vào Supabase. Kiểm tra table/RLS.", "err");
      await refresh();
    }
  }

  async function archive(kind, row) {
    await save(kind, { ...row, archived: true, status: row.status === "Đang học" ? "Tạm nghỉ" : row.status || "archived" }, false);
  }

  async function del(kind, id) {
    const [arr, setArr] = state[kind];
    const table = TABLE[kind];
    try {
      setArr(arr.filter((x) => x.id !== id));
      await removeRow(table, id);
      toast("Đã xoá", "ok");
    } catch {
      toast("Không xoá được. Kiểm tra Supabase.", "err");
      await refresh();
    }
  }

  return {
    loading,
    refresh,
    save,
    archive,
    del,
    classes,
    leads,
    trials,
    students,
    contracts,
    finance,
    reports,
    hsk,
    interactions,
  };
}

function Styles() {
  return (
    <style>{`
*{box-sizing:border-box}html,body,#root{margin:0;min-height:100%;background:${BG};font-family:${FONT};color:${TEXT};-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}button,input,select,textarea{font-family:${FONT}}button{touch-action:manipulation}::-webkit-scrollbar{width:6px;height:6px}::-webkit-scrollbar-thumb{background:rgba(255,255,255,.16);border-radius:999px}::selection{background:rgba(0,208,132,.35)}
.app{height:100dvh;background:radial-gradient(circle at 80% -10%,rgba(0,208,132,.28),transparent 34%),radial-gradient(circle at 10% 80%,rgba(22,163,74,.18),transparent 36%),${BG};overflow:hidden;position:relative}.app:before{content:"";position:fixed;inset:0;background-image:linear-gradient(rgba(255,255,255,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.025) 1px,transparent 1px);background-size:56px 56px;mask-image:radial-gradient(circle at 50% 20%,black,transparent 78%);pointer-events:none}.shell{height:100dvh;display:flex;position:relative;z-index:1}.sidebar{width:248px;flex:0 0 248px;border-right:1px solid ${LINE};background:rgba(2,8,6,.74);backdrop-filter:blur(26px);display:flex;flex-direction:column}.brand{height:74px;padding:0 16px;border-bottom:1px solid ${LINE};display:flex;align-items:center;gap:12px}.logo{width:40px;height:40px;border-radius:14px;background:linear-gradient(135deg,${GREEN_SOFT},${GREEN});box-shadow:0 0 38px rgba(0,208,132,.38);display:grid;place-items:center;color:#03120B;font-weight:900}.brand b{display:block;font-size:16px;letter-spacing:-.02em}.brand span{font-size:9px;color:${GREEN};font-weight:900;letter-spacing:.16em}.nav{flex:1;padding:12px 10px;overflow:auto}.nav-item{height:42px;border-radius:14px;display:flex;align-items:center;gap:11px;padding:0 12px;color:${MUTED};font-size:13px;font-weight:800;cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;transition:.18s}.nav-item svg{flex:0 0 auto}.nav-item:hover{background:rgba(255,255,255,.055);color:${TEXT}}.nav-item.active{background:linear-gradient(90deg,rgba(0,208,132,.20),rgba(0,208,132,.06));color:${TEXT};box-shadow:inset 0 0 0 1px rgba(0,208,132,.24)}.user{padding:14px;border-top:1px solid ${LINE};display:flex;align-items:center;gap:10px}.avatar{width:34px;height:34px;border-radius:12px;background:rgba(255,255,255,.08);border:1px solid ${LINE};display:grid;place-items:center;font-weight:900}.main{flex:1;min-width:0;display:flex;flex-direction:column}.topbar{height:74px;flex:0 0 74px;border-bottom:1px solid ${LINE};background:rgba(3,18,11,.62);backdrop-filter:blur(26px);display:flex;align-items:center;justify-content:space-between;gap:14px;padding:0 26px}.search{position:relative;width:min(380px,44vw)}.search svg{position:absolute;left:13px;top:50%;transform:translateY(-50%);color:${DIM}}.input,.select,.textarea{width:100%;height:42px;border:1px solid ${LINE};background:rgba(255,255,255,.055);border-radius:14px;color:${TEXT};outline:0;padding:0 13px;font-size:14px}.input{padding-left:38px}.textarea{height:86px;padding:11px 13px;resize:vertical}.input:focus,.select:focus,.textarea:focus{border-color:${GREEN};box-shadow:0 0 0 4px rgba(0,208,132,.13)}.content{flex:1;overflow:auto;padding:26px}.hero{border:1px solid ${LINE};border-radius:30px;background:radial-gradient(circle at 75% 10%,rgba(0,208,132,.30),transparent 34%),linear-gradient(135deg,rgba(6,37,24,.96),rgba(2,13,9,.80));padding:30px;box-shadow:0 26px 90px rgba(0,0,0,.36);overflow:hidden;margin-bottom:16px;position:relative}.hero:after{content:"";position:absolute;right:70px;top:-140px;width:330px;height:330px;border-radius:50%;border:1px solid rgba(0,208,132,.26);box-shadow:0 0 60px rgba(0,208,132,.20),inset 0 0 40px rgba(0,208,132,.12)}.hero-grid{position:relative;z-index:1;display:grid;grid-template-columns:1.2fr .8fr;gap:24px;align-items:center}.eyebrow{display:inline-flex;align-items:center;gap:8px;font-size:11px;font-weight:900;color:${GREEN_SOFT};letter-spacing:.08em;text-transform:uppercase;background:rgba(0,208,132,.12);border:1px solid rgba(0,208,132,.24);border-radius:999px;padding:7px 12px}.title{font-size:clamp(30px,4vw,56px);line-height:1.04;letter-spacing:-.045em;font-weight:900;margin:16px 0 10px}.sub{color:${MUTED};font-size:14px;line-height:1.65;max-width:720px;margin:0}.hero-number{text-align:center}.hero-number b{font-size:clamp(42px,6vw,78px);line-height:1;font-weight:900;color:${GREEN};letter-spacing:-.04em}.hero-number span{display:block;color:${MUTED};font-size:13px;line-height:1.5;margin-top:10px}.btn{height:40px;border:0;border-radius:13px;padding:0 15px;display:inline-flex;align-items:center;justify-content:center;gap:8px;font-size:13px;font-weight:900;cursor:pointer;color:${TEXT};transition:.18s}.btn.primary{background:linear-gradient(135deg,${GREEN_SOFT},${GREEN_DARK});color:#03120B;box-shadow:0 10px 30px rgba(0,208,132,.24)}.btn.primary:hover{transform:translateY(-1px);box-shadow:0 14px 40px rgba(0,208,132,.35)}.btn.ghost{background:rgba(255,255,255,.065);border:1px solid ${LINE};color:${TEXT}}.btn.warn{background:rgba(251,191,36,.12);border:1px solid rgba(251,191,36,.25);color:#FFE3A3}.btn.danger{background:rgba(251,113,133,.12);border:1px solid rgba(251,113,133,.25);color:#FDA4AF}.icon{width:34px;height:34px;border-radius:12px;border:1px solid ${LINE};background:rgba(255,255,255,.055);color:${MUTED};display:inline-grid;place-items:center;cursor:pointer}.icon:hover{color:${TEXT};border-color:rgba(255,255,255,.2)}.grid{display:grid;gap:14px}.kpis{grid-template-columns:repeat(4,minmax(0,1fr));margin-bottom:14px}.two{grid-template-columns:repeat(2,minmax(0,1fr))}.three{grid-template-columns:repeat(3,minmax(0,1fr))}.card{border:1px solid ${LINE};background:linear-gradient(180deg,rgba(7,26,17,.84),rgba(3,14,9,.68));border-radius:22px;box-shadow:0 20px 70px rgba(0,0,0,.24);backdrop-filter:blur(22px);overflow:hidden}.panel{padding:20px}.panel-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:15px}.panel-title{font-size:12px;color:${TEXT};font-weight:900;text-transform:uppercase;letter-spacing:.08em;line-height:1.35}.kpi{padding:20px;min-height:138px}.kpi-top{display:flex;align-items:center;justify-content:space-between;color:${MUTED};font-size:11px;text-transform:uppercase;letter-spacing:.08em;font-weight:900}.kpi-value{font-size:clamp(28px,3vw,40px);font-weight:900;letter-spacing:-.035em;margin-top:18px;line-height:1.05}.kpi-note{display:inline-flex;gap:5px;align-items:center;margin-top:11px;color:${GREEN_SOFT};font-size:12px;font-weight:900}.flow{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px}.flow-step{border:1px solid ${LINE};background:rgba(255,255,255,.045);border-radius:18px;padding:15px;min-height:112px;display:flex;flex-direction:column;gap:8px}.flow-step em{width:28px;height:28px;border-radius:10px;background:linear-gradient(135deg,${GREEN_SOFT},${GREEN});color:#03120B;display:grid;place-items:center;font-style:normal;font-weight:900}.flow-step b{font-size:14px;line-height:1.35}.flow-step span{font-size:12px;color:${MUTED};line-height:1.45}.decision{display:flex;flex-direction:column;gap:8px}.decision b{font-size:15px;line-height:1.35}.decision span{color:${MUTED};font-size:13px;line-height:1.6}.table-wrap{border:1px solid ${LINE};border-radius:22px;overflow:auto;background:rgba(2,10,7,.45)}table{width:100%;min-width:780px;border-collapse:collapse}th{padding:13px 16px;text-align:left;font-size:10px;color:${DIM};text-transform:uppercase;letter-spacing:.1em;border-bottom:1px solid ${LINE};background:rgba(2,10,7,.72)}td{padding:14px 16px;border-bottom:1px solid rgba(255,255,255,.065);font-size:14px;color:${MUTED};vertical-align:middle}tr:hover td{background:rgba(0,208,132,.035)}.name{color:${TEXT};font-weight:900;line-height:1.35}.small{display:block;color:${DIM};font-size:12px;line-height:1.35;margin-top:4px}.badge{display:inline-flex;align-items:center;border-radius:999px;padding:5px 10px;font-size:11px;font-weight:900;border:1px solid ${LINE};background:rgba(255,255,255,.055);color:${MUTED};white-space:nowrap}.badge.ok{color:#9AFCD0;background:rgba(52,211,153,.12);border-color:rgba(52,211,153,.24)}.badge.warn{color:#FFE3A3;background:rgba(251,191,36,.12);border-color:rgba(251,191,36,.25)}.badge.err{color:#FDA4AF;background:rgba(251,113,133,.12);border-color:rgba(251,113,133,.25)}.badge.info{color:${BLUE};background:rgba(143,255,210,.09);border-color:rgba(143,255,210,.22)}.progress{width:78px;height:7px;border-radius:999px;background:rgba(255,255,255,.08);overflow:hidden}.progress i{display:block;height:100%;background:linear-gradient(90deg,${GREEN_DARK},${GREEN});border-radius:999px}.filters{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:14px}.filters .select,.filters .input{width:auto;min-width:160px;padding-left:13px}.page-head{display:flex;align-items:flex-end;justify-content:space-between;gap:14px;margin-bottom:18px}.page-title{font-size:34px;line-height:1.08;letter-spacing:-.035em;margin:0;font-weight:900}.modal-back{position:fixed;inset:0;background:rgba(2,8,6,.78);backdrop-filter:blur(20px);z-index:80;display:flex;align-items:center;justify-content:center;padding:18px}.modal{width:min(720px,100%);max-height:90dvh;overflow:auto;border-radius:26px;border:1px solid ${LINE};background:linear-gradient(180deg,rgba(8,35,22,.98),rgba(3,14,9,.96));box-shadow:0 40px 120px rgba(0,0,0,.58);padding:22px}.modal-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;padding-bottom:16px;border-bottom:1px solid ${LINE}}.modal h3{margin:0;font-size:24px;letter-spacing:-.03em}.form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:13px}.field{display:flex;flex-direction:column;gap:7px}.field label{font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:.08em;color:${DIM}}.field input,.field select,.field textarea{width:100%;min-height:42px;border:1px solid ${LINE};background:rgba(255,255,255,.055);border-radius:14px;color:${TEXT};outline:0;padding:10px 12px;font-size:14px}.field textarea{min-height:82px;resize:vertical}.field input:focus,.field select:focus,.field textarea:focus{border-color:${GREEN};box-shadow:0 0 0 4px rgba(0,208,132,.13)}.modal-actions{display:flex;gap:10px;margin-top:18px;padding-top:16px;border-top:1px solid ${LINE}}.toast{position:fixed;right:18px;bottom:18px;z-index:120;min-width:260px;border:1px solid ${LINE};border-radius:16px;padding:13px 14px;background:rgba(5,22,14,.96);box-shadow:0 20px 60px rgba(0,0,0,.45);font-size:13px;font-weight:800}.toast.ok{color:${GREEN_SOFT}}.toast.err{color:#FDA4AF}.mobile-nav{display:none}.mobile-more{position:fixed;right:10px;bottom:76px;width:220px;max-height:60dvh;overflow:auto;border:1px solid ${LINE};border-radius:18px;background:rgba(5,22,14,.97);box-shadow:0 24px 80px rgba(0,0,0,.55);z-index:70;padding:8px}.empty{padding:24px;color:${DIM};text-align:center;font-size:13px}.login{height:100dvh;display:grid;place-items:center;padding:18px}.login-card{width:min(420px,100%);border:1px solid ${LINE};background:linear-gradient(180deg,rgba(8,35,22,.92),rgba(3,14,9,.82));border-radius:28px;padding:34px;box-shadow:0 36px 110px rgba(0,0,0,.52);backdrop-filter:blur(24px)}.login-title{text-align:center;font-size:30px;line-height:1.06;letter-spacing:-.045em;font-weight:900;margin:18px 0 8px}.login-sub{text-align:center;color:${MUTED};font-size:13px;margin-bottom:24px}.loader{height:100dvh;display:grid;place-items:center;color:${MUTED};font-weight:900}.loader span{display:inline-block;width:20px;height:20px;border-radius:50%;border:2px solid rgba(255,255,255,.12);border-top-color:${GREEN};animation:spin .7s linear infinite;margin-right:10px}@keyframes spin{to{transform:rotate(360deg)}}
@media(max-width:980px){.sidebar{display:none}.shell{display:block}.main{height:100dvh}.topbar{height:62px;flex:0 0 62px;padding:0 14px}.search{width:100%;max-width:100%}.content{height:calc(100dvh - 62px);padding:14px 14px 92px}.hero{padding:20px;border-radius:22px}.hero-grid{display:block}.hero-number{text-align:left;margin-top:22px}.title{font-size:32px;line-height:1.08;letter-spacing:-.025em}.kpis,.two,.three{grid-template-columns:1fr}.flow{grid-template-columns:1fr}.panel{padding:17px}.page-head{align-items:stretch;flex-direction:column}.page-title{font-size:30px}.form{grid-template-columns:1fr}.filters .select,.filters .input{width:100%;min-width:0}.mobile-nav{display:flex;position:fixed;left:0;right:0;bottom:0;height:72px;padding-bottom:env(safe-area-inset-bottom);border-top:1px solid ${LINE};background:rgba(3,18,11,.94);backdrop-filter:blur(22px);z-index:60}.mobile-item{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;color:${MUTED};font-size:9px;font-weight:900}.mobile-item.active{color:${GREEN}}.modal{position:fixed;left:0;right:0;bottom:0;max-height:92dvh;border-radius:24px 24px 0 0}.toast{left:12px;right:12px;bottom:82px;min-width:auto}table{min-width:720px}}
`}</style>
  );
}

function Badge({ tone = "", children }) {
  return <span className={`badge ${tone}`}>{children}</span>;
}

function Kpi({ label, value, icon: Icon, note }) {
  return (
    <div className="card kpi">
      <div className="kpi-top"><span>{label}</span><Icon size={18} /></div>
      <div className="kpi-value">{value}</div>
      {note && <div className="kpi-note"><Check size={13} />{note}</div>}
    </div>
  );
}

function Panel({ title, action, children }) {
  return (
    <section className="card panel">
      {(title || action) && <div className="panel-head"><div className="panel-title">{title}</div>{action}</div>}
      {children}
    </section>
  );
}

function ChartPanel({ title, children, h = 230 }) {
  return (
    <Panel title={title}>
      <div style={{ height: h }}>
        <ResponsiveContainer width="100%" height="100%">{children}</ResponsiveContainer>
      </div>
    </Panel>
  );
}

function Tip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "rgba(2,10,7,.96)", border: `1px solid ${LINE}`, borderRadius: 14, padding: 12, boxShadow: "0 18px 50px rgba(0,0,0,.45)" }}>
      <div style={{ color: DIM, fontSize: 10, fontWeight: 900, textTransform: "uppercase", marginBottom: 6 }}>{label}</div>
      {payload.map((p, i) => <div key={i} style={{ color: TEXT, fontSize: 12, fontWeight: 800 }}>{p.name}: <span style={{ color: p.color }}>{p.value}</span></div>)}
    </div>
  );
}

function Field({ label, value, setValue, type = "text", options }) {
  return (
    <div className="field">
      <label>{label}</label>
      {options ? (
        <select value={value ?? ""} onChange={(e) => setValue(e.target.value)}>
          {options.map((o) => <option key={Array.isArray(o) ? o[0] : o} value={Array.isArray(o) ? o[0] : o}>{Array.isArray(o) ? o[1] : o}</option>)}
        </select>
      ) : type === "textarea" ? (
        <textarea value={value ?? ""} onChange={(e) => setValue(e.target.value)} />
      ) : (
        <input type={type} value={value ?? ""} onChange={(e) => setValue(type === "number" ? Number(e.target.value) : e.target.value)} />
      )}
    </div>
  );
}

function Modal({ modal, classes, teachers, user, isAdmin, onClose, onSave }) {
  const [f, setF] = useState(modal.row || {});
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const classOpts = classes.map((c) => c.id);
  const levels = ["HSK 1", "HSK 2", "HSK 3", "HSK 4", "HSK 5", "HSK 6"];
  const sources = ["Facebook", "TikTok", "Giới thiệu", "Walk-in", "Website"];
  const title = modal.isNew ? "Thêm mới" : "Chỉnh sửa";

  return (
    <div className="modal-back" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div><div className="eyebrow">Hán Tinh CRM</div><h3>{title}</h3></div>
          <button className="icon" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="form">
          {modal.kind === "leads" && <>
            <Field label="Họ tên" value={f.name} setValue={(v) => set("name", v)} />
            <Field label="SĐT" value={f.phone} setValue={(v) => set("phone", v)} />
            <Field label="Nguồn" value={f.source} setValue={(v) => set("source", v)} options={sources} />
            <Field label="Quan tâm" value={f.interest} setValue={(v) => set("interest", v)} options={levels} />
            <Field label="Giai đoạn" value={f.stage} setValue={(v) => set("stage", v)} options={[["inquiry", "Cần tư vấn"], ["trial", "Học thử"], ["registered", "Đã đăng ký"], ["lost", "Không chốt"]]} />
            <Field label="Ghi chú" value={f.note} setValue={(v) => set("note", v)} type="textarea" />
          </>}
          {modal.kind === "students" && <>
            <Field label="Họ tên" value={f.name} setValue={(v) => set("name", v)} />
            <Field label="SĐT" value={f.phone} setValue={(v) => set("phone", v)} />
            <Field label="Lớp" value={f.cls} setValue={(v) => set("cls", v)} options={classOpts} />
            <Field label="Trình độ" value={f.level} setValue={(v) => set("level", v)} options={levels} />
            <Field label="Điểm" value={f.score} setValue={(v) => set("score", v)} type="number" />
            <Field label="Chuyên cần %" value={f.attend} setValue={(v) => set("attend", v)} type="number" />
            <Field label="Nguồn" value={f.source} setValue={(v) => set("source", v)} options={sources} />
            <Field label="Trạng thái" value={f.status} setValue={(v) => set("status", v)} options={["Đang học", "Tạm nghỉ", "Nghỉ học"]} />
          </>}
          {modal.kind === "trials" && <>
            <Field label="Họ tên" value={f.name} setValue={(v) => set("name", v)} />
            <Field label="SĐT" value={f.phone} setValue={(v) => set("phone", v)} />
            <Field label="Ngày" value={f.date} setValue={(v) => set("date", v)} type="date" />
            <Field label="Giờ" value={f.time} setValue={(v) => set("time", v)} />
            <Field label="Lớp" value={f.cls} setValue={(v) => set("cls", v)} options={classOpts} />
            <Field label="Giáo viên" value={f.teacher} setValue={(v) => set("teacher", v)} options={teachers} />
            <Field label="Trạng thái" value={f.status} setValue={(v) => set("status", v)} options={[["scheduled", "Đã xếp"], ["completed", "Đã học"], ["no-show", "Không đến"]]} />
            <Field label="Kết quả" value={f.result} setValue={(v) => set("result", v)} options={[["", "--"], ["enrolled", "Đã đăng ký"], ["thinking", "Suy nghĩ"], ["not-interested", "Không quan tâm"]]} />
            <Field label="Nhắc lại" value={f.followUp} setValue={(v) => set("followUp", v)} type="date" />
          </>}
          {modal.kind === "finance" && <>
            <Field label="Học viên" value={f.name} setValue={(v) => set("name", v)} />
            <Field label="Lớp" value={f.cls} setValue={(v) => set("cls", v)} options={classOpts} />
            <Field label="Tổng phí" value={f.total} setValue={(v) => { set("total", v); set("d1", Math.round(v / 2)); set("d2", Math.round(v / 2)); }} type="number" />
            <Field label="Đợt 1" value={f.d1} setValue={(v) => set("d1", v)} type="number" />
            <Field label="Đợt 2" value={f.d2} setValue={(v) => set("d2", v)} type="number" />
            <Field label="Hạn đợt 2" value={f.d2d} setValue={(v) => set("d2d", v)} type="date" />
            <Field label="Trạng thái" value={f.st} setValue={(v) => set("st", v)} options={[["paid", "Đã đóng"], ["pending", "Chờ"], ["overdue", "Quá hạn"]]} />
          </>}
          {modal.kind === "reports" && <>
            <Field label="Ngày" value={f.date} setValue={(v) => set("date", v)} type="date" />
            <Field label="Giáo viên" value={f.teacher || user.name} setValue={(v) => set("teacher", v)} options={isAdmin ? teachers : [user.name]} />
            <Field label="Lớp" value={f.cls} setValue={(v) => set("cls", v)} options={classOpts} />
            <Field label="Có mặt" value={f.present} setValue={(v) => set("present", v)} type="number" />
            <Field label="Vắng" value={f.absent} setValue={(v) => set("absent", v)} type="number" />
            <Field label="Tên học viên vắng" value={f.absentNames} setValue={(v) => set("absentNames", v)} />
            <Field label="Bài học" value={f.lesson} setValue={(v) => set("lesson", v)} type="textarea" />
            <Field label="Bài tập" value={f.homework} setValue={(v) => set("homework", v)} type="textarea" />
            <Field label="Cần chú ý" value={f.flags} setValue={(v) => set("flags", v)} type="textarea" />
            <Field label="Điểm nổi bật" value={f.highlights} setValue={(v) => set("highlights", v)} type="textarea" />
          </>}
          {modal.kind === "contracts" && <>
            <Field label="Học viên" value={f.name} setValue={(v) => set("name", v)} />
            <Field label="Lớp" value={f.cls} setValue={(v) => set("cls", v)} options={classOpts} />
            <Field label="Thời hạn" value={f.duration} setValue={(v) => set("duration", v)} options={["3 tháng", "6 tháng", "12 tháng", "18 tháng"]} />
            <Field label="Bắt đầu" value={f.start} setValue={(v) => set("start", v)} type="date" />
            <Field label="Kết thúc" value={f.end} setValue={(v) => set("end", v)} type="date" />
            <Field label="Học phí" value={f.fee} setValue={(v) => set("fee", v)} type="number" />
          </>}
          {modal.kind === "hsk" && <>
            <Field label="Học viên" value={f.name} setValue={(v) => set("name", v)} />
            <Field label="Level" value={f.level} setValue={(v) => set("level", v)} options={levels} />
            <Field label="Ngày thi" value={f.examDate} setValue={(v) => set("examDate", v)} type="date" />
            <Field label="Điểm" value={f.score} setValue={(v) => set("score", v)} type="number" />
            <Field label="Kết quả" value={f.passed} setValue={(v) => set("passed", v)} options={[["", "Chưa thi"], ["yes", "Đạt"], ["no", "Chưa đạt"]]} />
          </>}
        </div>
        <div className="modal-actions">
          <button className="btn primary" onClick={() => onSave(f)}><Save size={15} />Lưu</button>
          <button className="btn ghost" onClick={onClose}>Huỷ</button>
        </div>
      </div>
    </div>
  );
}

function Actions({ onEdit, onArchive, onDelete, extra }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      {extra}
      <button className="icon" onClick={onEdit} title="Sửa"><Pencil size={14} /></button>
      {onArchive && <button className="icon" onClick={onArchive} title="Lưu trữ"><Archive size={14} /></button>}
      {onDelete && <button className="icon" onClick={onDelete} title="Xoá"><Trash2 size={14} /></button>}
    </div>
  );
}

function Page({ title, action, children }) {
  return <><div className="page-head"><h1 className="page-title">{title}</h1>{action}</div>{children}</>;
}

function ExportButton({ rows, name }) {
  function run() {
    const cols = Array.from(new Set(rows.flatMap((r) => Object.keys(r))));
    const csv = [cols.join(","), ...rows.map((r) => cols.map((c) => `"${String(r[c] ?? "").replaceAll('"', '""')}"`).join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name}-${today}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
  return <button className="btn ghost" onClick={run}><Download size={15} />Xuất CSV</button>;
}

function Home({ d, user, setPage }) {
  const isAdmin = user.role === "admin";
  const activeStudents = d.students.filter((s) => isActive(s) && s.status === "Đang học");
  const activeLeads = d.leads.filter((l) => isActive(l) && l.stage !== "lost");
  const pendingMoney = d.finance.filter((f) => isActive(f) && ["pending", "overdue"].includes(f.st));
  const overdue = d.finance.filter((f) => isActive(f) && f.st === "overdue");
  const thinkingTrials = d.trials.filter((t) => isActive(t) && t.result === "thinking");
  const collected = d.finance.filter(isActive).reduce((sum, f) => sum + Number(f.d1 || 0) + (f.st === "paid" ? Number(f.d2 || 0) : 0), 0);
  const hskDone = d.hsk.filter((h) => isActive(h) && h.passed).length;
  const hskPass = d.hsk.filter((h) => isActive(h) && h.passed === "yes").length;
  const hskRate = hskDone ? Math.round((hskPass / hskDone) * 100) : 0;
  const ranked = [...activeStudents].sort((a, b) => Number(b.score || 0) - Number(a.score || 0)).slice(0, 5);
  const funnel = [
    { s: "Tư vấn", v: d.leads.filter((l) => isActive(l) && l.stage === "inquiry").length },
    { s: "Học thử", v: d.leads.filter((l) => isActive(l) && l.stage === "trial").length + d.trials.filter((t) => isActive(t) && t.status === "scheduled").length },
    { s: "Đăng ký", v: d.leads.filter((l) => isActive(l) && l.stage === "registered").length },
    { s: "Đang học", v: activeStudents.length },
    { s: "Cần thu", v: pendingMoney.length },
  ];
  const sources = ["Facebook", "TikTok", "Giới thiệu", "Walk-in", "Website"].map((s) => ({ name: s, v: [...d.leads, ...d.students].filter((x) => isActive(x) && x.source === s).length })).filter((x) => x.v);
  const scores = [
    { r: "<5", n: activeStudents.filter((s) => Number(s.score || 0) < 5).length },
    { r: "5-6.5", n: activeStudents.filter((s) => Number(s.score || 0) >= 5 && Number(s.score || 0) < 6.5).length },
    { r: "6.5-8", n: activeStudents.filter((s) => Number(s.score || 0) >= 6.5 && Number(s.score || 0) < 8).length },
    { r: "8-9", n: activeStudents.filter((s) => Number(s.score || 0) >= 8 && Number(s.score || 0) < 9).length },
    { r: "9+", n: activeStudents.filter((s) => Number(s.score || 0) >= 9).length },
  ];
  const months = [
    { m: "T1", rev: 48, lead: 12 },
    { m: "T2", rev: 52, lead: 10 },
    { m: "T3", rev: 58, lead: 15 },
    { m: "T4", rev: 65, lead: 11 },
    { m: "T5", rev: 72, lead: 14 },
    { m: "T6", rev: Math.round(collected / 1000000), lead: activeLeads.length },
  ];

  return (
    <>
      <section className="hero">
        <div className="hero-grid">
          <div>
            <div className="eyebrow">Trung tâm vận hành Hán Tinh Premium</div>
            <h1 className="title">CRM dùng thật cho tuyển sinh, lớp học và học phí</h1>
            <p className="sub">Luồng xử lý rõ: khách mới → học thử → đăng ký → theo học → thu phí → báo cáo. Dữ liệu cũ được lưu trữ, không xoá hàng tháng.</p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 18 }}>
              <button className="btn primary" onClick={() => setPage("leads")}>Xử lý khách mới</button>
              <button className="btn ghost" onClick={() => setPage("finance")}>Kiểm tra học phí</button>
            </div>
          </div>
          <div className="hero-number"><b>{activeStudents.length}</b><span>học viên đang học · {activeLeads.length} khách tiềm năng · {pendingMoney.length} khoản cần thu</span></div>
        </div>
      </section>

      <div className="grid kpis">
        <Kpi label="Khách tiềm năng" value={activeLeads.length} icon={Target} note="theo nguồn" />
        <Kpi label="Học viên" value={activeStudents.length} icon={Users} note="đang học" />
        <Kpi label="Doanh thu đã thu" value={money(collected)} icon={Wallet} note="đợt 1 + đợt 2" />
        <Kpi label="HSK đỗ" value={`${hskRate}%`} icon={BookOpen} note={`${hskPass}/${hskDone || 0}`} />
      </div>

      {isAdmin && <Panel title="Bản đồ vận hành hôm nay">
        <div className="flow">
          <div className="flow-step"><em>1</em><b>Lead mới</b><span>{funnel[0].v} cần tư vấn</span></div>
          <div className="flow-step"><em>2</em><b>Học thử</b><span>{funnel[1].v} lịch / cơ hội</span></div>
          <div className="flow-step"><em>3</em><b>Đăng ký</b><span>{funnel[2].v} đã chốt</span></div>
          <div className="flow-step"><em>4</em><b>Theo học</b><span>{funnel[3].v} đang học</span></div>
          <div className="flow-step"><em>5</em><b>Học phí</b><span>{funnel[4].v} cần xử lý</span></div>
        </div>
      </Panel>}

      {isAdmin && <div className="grid two" style={{ marginTop: 14 }}>
        <ChartPanel title="Luồng tuyển sinh → đăng ký"><BarChart data={funnel} layout="vertical" margin={{ left: 12, right: 16 }}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.06)" /><XAxis type="number" stroke={DIM} fontSize={11} tickLine={false} axisLine={false} /><YAxis type="category" dataKey="s" width={72} stroke={DIM} fontSize={11} tickLine={false} axisLine={false} /><Tooltip content={<Tip />} /><Bar dataKey="v" name="Số lượng" fill={GREEN} radius={[0, 10, 10, 0]} /></BarChart></ChartPanel>
        <ChartPanel title="Doanh thu & lead"><LineChart data={months}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.06)" /><XAxis dataKey="m" stroke={DIM} fontSize={11} tickLine={false} axisLine={false} /><YAxis stroke={DIM} fontSize={11} tickLine={false} axisLine={false} /><Tooltip content={<Tip />} /><Line type="monotone" dataKey="rev" name="Doanh thu" stroke={GREEN} strokeWidth={3} dot={{ r: 4, fill: GREEN, strokeWidth: 0 }} /><Line type="monotone" dataKey="lead" name="Lead" stroke={BLUE} strokeWidth={2} dot={{ r: 3, fill: BLUE, strokeWidth: 0 }} /></LineChart></ChartPanel>
        <ChartPanel title="Nguồn khách hàng"><PieChart><Pie data={sources} cx="50%" cy="50%" innerRadius={46} outerRadius={80} dataKey="v" stroke="none" label={({ name, v }) => `${name}: ${v}`}>{sources.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip content={<Tip />} /></PieChart></ChartPanel>
        <ChartPanel title="Phân bố điểm"><BarChart data={scores}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.06)" /><XAxis dataKey="r" stroke={DIM} fontSize={11} tickLine={false} axisLine={false} /><YAxis stroke={DIM} fontSize={11} tickLine={false} axisLine={false} /><Tooltip content={<Tip />} /><Bar dataKey="n" name="Học viên" fill={GREEN_SOFT} radius={[9, 9, 0, 0]} /></BarChart></ChartPanel>
      </div>}

      <div className="grid three" style={{ marginTop: 14 }}>
        <Panel title="Top học viên">{ranked.length ? ranked.map((s, i) => <div key={s.id} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "11px 0", borderBottom: `1px solid ${LINE}` }}><div><div className="name">{i + 1}. {s.name}</div><span className="small">{s.cls}</span></div><Badge tone="ok">{s.score}</Badge></div>) : <div className="empty">Chưa có học viên</div>}</Panel>
        <Panel title="Gần đây">{d.reports.filter(isActive).slice(0, 4).map((r) => <div key={r.id} style={{ padding: "11px 0", borderBottom: `1px solid ${LINE}` }}><div className="name">{r.teacher}</div><span className="small">{r.cls} · {r.date} · {r.present}/{Number(r.present || 0) + Number(r.absent || 0)}</span></div>)}</Panel>
        <Panel title="Ưu tiên xử lý"><div className="decision"><b>1. Chốt học thử</b><span>{thinkingTrials.length} bạn đang suy nghĩ, cần nhắc lại trong 24–48h.</span><b>2. Thu học phí</b><span>{overdue.length} khoản quá hạn, cần xử lý trước cuối tuần.</span><b>3. Giữ chuyên cần</b><span>Hỏi thăm học viên vắng nhiều trước khi thành nghỉ học.</span></div></Panel>
      </div>
    </>
  );
}

function DataTable({ kind, rows, columns, onEdit, onArchive, onDelete, extraAction }) {
  return (
    <div className="table-wrap">
      <table>
        <thead><tr>{columns.map((c) => <th key={c.key}>{c.label}</th>)}<th></th></tr></thead>
        <tbody>
          {rows.map((row) => <tr key={row.id}>{columns.map((c) => <td key={c.key}>{c.render ? c.render(row) : row[c.key]}</td>)}<td><Actions onEdit={() => onEdit(row)} onArchive={() => onArchive(row)} onDelete={() => onDelete(row)} extra={extraAction?.(row)} /></td></tr>)}
        </tbody>
      </table>
      {!rows.length && <div className="empty">Không có dữ liệu phù hợp</div>}
    </div>
  );
}

function ModulePage({ kind, title, rows, classes, user, data, openModal, onArchive, onDelete, refresh }) {
  const [q, setQ] = useState("");
  const [cls, setCls] = useState("all");
  const [status, setStatus] = useState("active");
  const isAdmin = user.role === "admin";
  const canSee = (c) => isAdmin || (user.cls || "").split(",").includes(c);
  const classOptions = ["all", ...classes.map((c) => c.id)];
  const filtered = rows.filter((r) => {
    const text = `${r.name || ""} ${r.phone || ""} ${r.cls || ""} ${r.teacher || ""} ${r.refName || ""}`.toLowerCase();
    const okText = !q || text.includes(q.toLowerCase());
    const okClass = cls === "all" || r.cls === cls;
    const okArchive = status === "all" ? true : status === "archived" ? !isActive(r) : isActive(r);
    const okRole = !r.cls || canSee(r.cls);
    return okText && okClass && okArchive && okRole;
  });

  const commonAction = <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}><ExportButton rows={filtered} name={kind} /><button className="btn ghost" onClick={refresh}><RefreshCw size={15} />Tải lại</button><button className="btn primary" onClick={() => openModal(kind, null, true)}><Plus size={15} />Thêm</button></div>;

  const columns = {
    leads: [
      { key: "name", label: "Khách", render: (r) => <><div className="name">{r.name}</div><span className="small">{r.phone}</span></> },
      { key: "source", label: "Nguồn", render: (r) => <Badge tone="info">{r.source}</Badge> },
      { key: "interest", label: "Quan tâm", render: (r) => <Badge>{r.interest}</Badge> },
      { key: "stage", label: "Giai đoạn", render: (r) => <Badge tone={r.stage === "registered" ? "ok" : r.stage === "trial" ? "warn" : r.stage === "lost" ? "err" : "info"}>{({ inquiry: "Cần tư vấn", trial: "Học thử", registered: "Đã đăng ký", lost: "Không chốt" })[r.stage] || r.stage}</Badge> },
      { key: "note", label: "Ghi chú" },
    ],
    trials: [
      { key: "name", label: "Học thử", render: (r) => <><div className="name">{r.name}</div><span className="small">{r.phone}</span></> },
      { key: "date", label: "Lịch", render: (r) => <>{r.date} <span className="small">{r.time}</span></> },
      { key: "cls", label: "Lớp" },
      { key: "teacher", label: "GV" },
      { key: "result", label: "Kết quả", render: (r) => <Badge tone={r.result === "enrolled" ? "ok" : r.result === "thinking" ? "warn" : r.result === "not-interested" ? "err" : "info"}>{({ enrolled: "Đã đăng ký", thinking: "Suy nghĩ", "not-interested": "Không quan tâm", "": "--" })[r.result] || "--"}</Badge> },
    ],
    students: [
      { key: "name", label: "Học viên", render: (r) => <><div className="name">{r.name}</div><span className="small">{r.phone}</span></> },
      { key: "level", label: "Level", render: (r) => <Badge tone="info">{r.level}</Badge> },
      { key: "cls", label: "Lớp" },
      { key: "score", label: "Điểm", render: (r) => <b style={{ color: Number(r.score) >= 8 ? GREEN_SOFT : Number(r.score) >= 6.5 ? AMBER : RED, fontSize: 20 }}>{r.score}</b> },
      { key: "attend", label: "CC", render: (r) => <div style={{ display: "flex", gap: 8, alignItems: "center" }}><div className="progress"><i style={{ width: `${r.attend || 0}%` }} /></div>{r.attend}%</div> },
      { key: "status", label: "TT", render: (r) => <Badge tone={r.status === "Đang học" ? "ok" : r.status === "Tạm nghỉ" ? "warn" : "err"}>{r.status}</Badge> },
    ],
    finance: [
      { key: "name", label: "Học viên", render: (r) => <div className="name">{r.name}</div> },
      { key: "cls", label: "Lớp" },
      { key: "total", label: "Tổng", render: (r) => <b style={{ color: GREEN_SOFT }}>{money(r.total)}</b> },
      { key: "d1", label: "Đợt 1", render: (r) => money(r.d1) },
      { key: "d2", label: "Đợt 2", render: (r) => money(r.d2) },
      { key: "d2d", label: "Hạn", render: (r) => <span style={{ color: r.st === "overdue" || dayLeft(r.d2d) < 0 ? RED : MUTED }}>{r.d2d}</span> },
      { key: "st", label: "TT", render: (r) => <Badge tone={r.st === "paid" ? "ok" : r.st === "pending" ? "warn" : "err"}>{r.st === "paid" ? "Đã đóng" : r.st === "pending" ? "Chờ" : "Quá hạn"}</Badge> },
    ],
    reports: [
      { key: "teacher", label: "Giáo viên", render: (r) => <div className="name">{r.teacher}</div> },
      { key: "cls", label: "Lớp" },
      { key: "date", label: "Ngày" },
      { key: "present", label: "Sĩ số", render: (r) => <Badge tone={Number(r.absent) ? "warn" : "ok"}>{r.present}/{Number(r.present || 0) + Number(r.absent || 0)}</Badge> },
      { key: "lesson", label: "Bài học" },
      { key: "flags", label: "Chú ý", render: (r) => r.flags ? <Badge tone="err">{r.flags}</Badge> : "--" },
    ],
    contracts: [
      { key: "name", label: "Học viên", render: (r) => <div className="name">{r.name}</div> },
      { key: "cls", label: "Lớp" },
      { key: "start", label: "Bắt đầu" },
      { key: "end", label: "Kết thúc" },
      { key: "fee", label: "Học phí", render: (r) => money(r.fee) },
      { key: "status", label: "TT", render: (r) => <Badge tone={dayLeft(r.end) <= 30 ? "warn" : "ok"}>{dayLeft(r.end) <= 0 ? "Hết hạn" : `${dayLeft(r.end)} ngày`}</Badge> },
    ],
    hsk: [
      { key: "name", label: "Học viên", render: (r) => <div className="name">{r.name}</div> },
      { key: "level", label: "Level" },
      { key: "examDate", label: "Ngày thi" },
      { key: "score", label: "Điểm" },
      { key: "passed", label: "Kết quả", render: (r) => <Badge tone={r.passed === "yes" ? "ok" : r.passed === "no" ? "err" : "info"}>{r.passed === "yes" ? "Đạt" : r.passed === "no" ? "Chưa đạt" : "Chưa thi"}</Badge> },
    ],
  }[kind];

  const extraAction = kind === "finance" ? (r) => r.st !== "paid" ? <button className="btn primary" onClick={() => data.save("finance", { ...r, st: "paid" }, false)}><Check size={14} />Đã thu</button> : null : null;

  return (
    <Page title={title} action={commonAction}>
      <div className="filters">
        <div style={{ position: "relative", minWidth: 220 }}><Search size={15} style={{ position: "absolute", left: 12, top: 13, color: DIM }} /><input className="input" placeholder="Tìm tên, SĐT, lớp..." value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <select className="select" value={cls} onChange={(e) => setCls(e.target.value)}>{classOptions.map((c) => <option key={c} value={c}>{c === "all" ? "Tất cả lớp" : c}</option>)}</select>
        <select className="select" value={status} onChange={(e) => setStatus(e.target.value)}><option value="active">Đang dùng</option><option value="archived">Đã lưu trữ</option><option value="all">Tất cả</option></select>
      </div>
      <DataTable kind={kind} rows={filtered} columns={columns} onEdit={(r) => openModal(kind, r, false)} onArchive={(r) => onArchive(kind, r)} onDelete={(r) => window.confirm("Xoá vĩnh viễn dữ liệu này?") && onDelete(kind, r.id)} extraAction={extraAction} />
    </Page>
  );
}

function ChartsPage({ d }) {
  const activeStudents = d.students.filter((s) => isActive(s) && s.status === "Đang học");
  const pay = [
    { name: "Đã đóng", v: d.finance.filter((f) => isActive(f) && f.st === "paid").length },
    { name: "Chờ", v: d.finance.filter((f) => isActive(f) && f.st === "pending").length },
    { name: "Quá hạn", v: d.finance.filter((f) => isActive(f) && f.st === "overdue").length },
  ];
  const attend = activeStudents.map((s) => ({ name: s.name.split(" ").slice(-1)[0], v: Number(s.attend || 0) }));
  return (
    <Page title="Biểu đồ vận hành">
      <div className="grid two">
        <ChartPanel title="Tình trạng học phí"><PieChart><Pie data={pay} cx="50%" cy="50%" innerRadius={48} outerRadius={82} dataKey="v" stroke="none" label={({ name, v }) => `${name}: ${v}`}>{pay.map((_, i) => <Cell key={i} fill={[GREEN, AMBER, RED][i]} />)}</Pie><Tooltip content={<Tip />} /></PieChart></ChartPanel>
        <ChartPanel title="Chuyên cần học viên"><BarChart data={attend}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.06)" /><XAxis dataKey="name" stroke={DIM} fontSize={11} tickLine={false} axisLine={false} /><YAxis domain={[0, 100]} stroke={DIM} fontSize={11} tickLine={false} axisLine={false} /><Tooltip content={<Tip />} /><Bar dataKey="v" name="Chuyên cần" fill={GREEN} radius={[9, 9, 0, 0]} /></BarChart></ChartPanel>
      </div>
    </Page>
  );
}

export default function App() {
  const [toast, setToast] = useState(null);
  const showToast = (text, type = "ok") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 2800);
  };
  const d = useData(showToast);
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("ht_user") || "null"); } catch { return null; }
  });
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginError, setLoginError] = useState("");
  const [page, setPage] = useState("home");
  const [modal, setModal] = useState(null);
  const [more, setMore] = useState(false);

  useEffect(() => {
    if (document.getElementById("ht-font")) return;
    const a = document.createElement("link");
    a.rel = "preconnect";
    a.href = "https://fonts.googleapis.com";
    document.head.appendChild(a);
    const b = document.createElement("link");
    b.rel = "preconnect";
    b.href = "https://fonts.gstatic.com";
    b.crossOrigin = "anonymous";
    document.head.appendChild(b);
    const l = document.createElement("link");
    l.id = "ht-font";
    l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700;800;900&display=swap";
    document.head.appendChild(l);
  }, []);

  const isAdmin = user?.role === "admin";
  const teachers = useMemo(() => Array.from(new Set(d.classes.map((c) => c.teacher).filter(Boolean))), [d.classes]);
  const openModal = (kind, row, isNew) => {
    const defaults = {
      leads: { id: uid("LD"), name: "", phone: "", source: "Facebook", stage: "inquiry", interest: "HSK 1", note: "", status: "active", created: today, lastContact: today },
      trials: { id: uid("TL"), name: "", phone: "", date: today, time: "18:00", cls: d.classes[0]?.id || "", teacher: teachers[0] || "", status: "scheduled", result: "", followUp: "", archived: false },
      students: { id: uid("HV"), name: "", phone: "", cls: d.classes[0]?.id || "", level: "HSK 1", score: 0, attend: 90, source: "Facebook", status: "Đang học", archived: false },
      finance: { id: uid("HP"), name: "", cls: d.classes[0]?.id || "", total: 0, d1: 0, d2: 0, d2d: today, st: "pending", archived: false },
      reports: { id: uid("RP"), date: today, teacher: isAdmin ? teachers[0] || "" : user.name, cls: d.classes[0]?.id || "", present: 0, absent: 0, absentNames: "", lesson: "", homework: "", flags: "", highlights: "", archived: false },
      contracts: { id: uid("HD"), name: "", cls: d.classes[0]?.id || "", start: today, end: "", duration: "6 tháng", fee: 0, status: "active", archived: false },
      hsk: { id: uid("HSK"), name: "", level: "HSK 1", examDate: today, score: 0, passed: "", status: "registered", archived: false },
    };
    setModal({ kind, row: row || defaults[kind], isNew });
  };

  function login() {
    const u = USERS.find((x) => x.user === loginUser && x.pass === loginPass);
    if (!u) return setLoginError("Sai tài khoản hoặc mật khẩu");
    setUser(u);
    localStorage.setItem("ht_user", JSON.stringify(u));
    setLoginError("");
  }

  function logout() {
    setUser(null);
    localStorage.removeItem("ht_user");
    setPage("home");
  }

  const adminMenu = [
    { id: "home", label: "Tổng quan", icon: LayoutDashboard },
    { id: "leads", label: "Khách mới", icon: Target },
    { id: "trials", label: "Học thử", icon: BookOpen },
    { id: "students", label: "Học viên", icon: Users },
    { id: "finance", label: "Tài chính", icon: Wallet },
    { id: "reports", label: "Báo cáo", icon: ClipboardList },
    { id: "contracts", label: "Hợp đồng", icon: Archive },
    { id: "hsk", label: "HSK", icon: Check },
    { id: "charts", label: "Biểu đồ", icon: BarChart3 },
  ];
  const teacherMenu = [
    { id: "home", label: "Tổng quan", icon: LayoutDashboard },
    { id: "students", label: "Học viên", icon: Users },
    { id: "reports", label: "Báo cáo", icon: ClipboardList },
    { id: "hsk", label: "HSK", icon: Check },
  ];
  const menu = isAdmin ? adminMenu : teacherMenu;
  const mobileMenu = isAdmin ? [adminMenu[0], adminMenu[1], adminMenu[3], adminMenu[4], { id: "more", label: "Thêm", icon: Menu }] : teacherMenu;
  const moreMenu = adminMenu.filter((m) => !["home", "leads", "students", "finance"].includes(m.id));

  if (!user) {
    return <div className="app"><Styles /><div className="login"><div className="login-card"><div className="logo" style={{ margin: "0 auto" }}>H</div><div className="login-title">Hán Tinh<br />Premium CRM</div><div className="login-sub">Đăng nhập hệ thống vận hành</div><input className="input" placeholder="Tài khoản" value={loginUser} onChange={(e) => setLoginUser(e.target.value)} onKeyDown={(e) => e.key === "Enter" && login()} /><input className="input" type="password" placeholder="Mật khẩu" value={loginPass} onChange={(e) => setLoginPass(e.target.value)} onKeyDown={(e) => e.key === "Enter" && login()} style={{ marginTop: 10 }} />{loginError && <div style={{ color: RED, fontSize: 12, fontWeight: 800, textAlign: "center", marginTop: 10 }}>{loginError}</div>}<button className="btn primary" style={{ width: "100%", height: 46, marginTop: 14 }} onClick={login}>Đăng nhập</button></div></div></div>;
  }

  if (d.loading) return <div className="app"><Styles /><div className="loader"><div><span />Đang tải dữ liệu</div></div></div>;

  const pageData = {
    leads: { title: "Khách mới", rows: d.leads },
    trials: { title: "Học thử", rows: d.trials },
    students: { title: "Học viên", rows: d.students },
    finance: { title: "Tài chính", rows: d.finance },
    reports: { title: "Báo cáo lớp", rows: d.reports },
    contracts: { title: "Hợp đồng", rows: d.contracts },
    hsk: { title: "Thi HSK", rows: d.hsk },
  };

  return (
    <div className="app">
      <Styles />
      <div className="shell">
        <aside className="sidebar">
          <div className="brand"><div className="logo">H</div><div><b>Hán Tinh</b><span>PREMIUM CRM</span></div></div>
          <nav className="nav">{menu.map((m) => { const Icon = m.icon; return <div key={m.id} className={`nav-item ${page === m.id ? "active" : ""}`} onClick={() => setPage(m.id)}><Icon size={17} />{m.label}</div>; })}</nav>
          <div className="user"><div className="avatar">{user.name.charAt(0)}</div><div style={{ flex: 1, minWidth: 0 }}><div className="name" style={{ fontSize: 13 }}>{user.name}</div><span className="small">{isAdmin ? "Quản trị" : "Giáo viên"}</span></div><button className="icon" onClick={logout}><LogOut size={15} /></button></div>
        </aside>
        <main className="main">
          <header className="topbar">
            <div className="brand" style={{ height: "auto", padding: 0, border: 0 }}><div className="logo" style={{ width: 34, height: 34 }}>H</div><div><b>Hán Tinh</b><span>CRM</span></div></div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}><button className="btn ghost" onClick={d.refresh}><RefreshCw size={15} />Tải lại</button><button className="icon" onClick={logout}><LogOut size={15} /></button></div>
          </header>
          <section className="content">
            {page === "home" && <Home d={d} user={user} setPage={setPage} />}
            {pageData[page] && <ModulePage kind={page} title={pageData[page].title} rows={pageData[page].rows} classes={d.classes} user={user} data={d} openModal={openModal} onArchive={d.archive} onDelete={d.del} refresh={d.refresh} />}
            {page === "charts" && <ChartsPage d={d} />}
          </section>
        </main>
      </div>
      <nav className="mobile-nav">{mobileMenu.map((m) => { const Icon = m.icon; const active = page === m.id || (m.id === "more" && more); return <div key={m.id} className={`mobile-item ${active ? "active" : ""}`} onClick={() => { if (m.id === "more") setMore(!more); else { setPage(m.id); setMore(false); } }}><Icon size={19} /><span>{m.label}</span></div>; })}</nav>
      {more && <div className="mobile-more">{moreMenu.map((m) => { const Icon = m.icon; return <div key={m.id} className="nav-item" onClick={() => { setPage(m.id); setMore(false); }}><Icon size={16} />{m.label}</div>; })}</div>}
      {modal && <Modal modal={modal} classes={d.classes} teachers={teachers} user={user} isAdmin={isAdmin} onClose={() => setModal(null)} onSave={async (row) => { await d.save(modal.kind, row, modal.isNew); setModal(null); }} />}
      {toast && <div className={`toast ${toast.type}`}>{toast.text}</div>}
    </div>
  );
}
