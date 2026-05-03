import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, AreaChart, Area } from "recharts";
import { supabase } from "./supabase";
 
// ── DB helpers ──
const FM = {
  leads: { lastContact: "last_contact" },
  reports: { absentNames: "absent_names" },
  interactions: { refName: "ref_name", by: "by_user" },
  trials: { date: "trial_date", time: "trial_time", followUp: "follow_up" },
  contracts: { start: "start_date", end: "end_date" },
  hsk_exams: { examDate: "exam_date" },
};
 
function toDb(t, obj) {
  const m = FM[t]; if (!m) return { ...obj };
  const r = {}; for (const [k, v] of Object.entries(obj)) { r[m[k] || k] = v; } return r;
}
function toApp(t, obj) {
  const m = FM[t]; if (!m) return { ...obj };
  const rm = {}; for (const [k, v] of Object.entries(m)) rm[v] = k;
  const r = {}; for (const [k, v] of Object.entries(obj)) { r[rm[k] || k] = v; } return r;
}
 
async function loadT(t) {
  try {
    const { data, error } = await supabase.from(t).select("*");
    if (error) { console.error("Load " + t, error); return []; }
    return (data || []).map(r => toApp(t, r));
  } catch (e) { console.error(t, e); return []; }
}
 
async function addRow(t, row) {
  const dbRow = toDb(t, row);
  delete dbRow.created_at;
  const { error } = await supabase.from(t).insert([dbRow]);
  if (error) console.error("Add " + t, error);
}
 
async function updateRow(t, row) {
  const dbRow = toDb(t, row);
  delete dbRow.created_at;
  const { error } = await supabase.from(t).update(dbRow).eq("id", row.id);
  if (error) console.error("Update " + t, error);
}
 
async function deleteRow(t, id) {
  const { error } = await supabase.from(t).delete().eq("id", id);
  if (error) console.error("Del " + t, error);
}
 
const vnd = n => new Intl.NumberFormat("vi-VN").format(n) + "đ";
const today = new Date().toISOString().slice(0, 10);
const CL = ["#16a34a", "#0d9488", "#2563eb", "#ca8a04", "#dc2626", "#7c3aed", "#ea580c"];
const daysLeft = d => Math.ceil((new Date(d) - new Date()) / 86400000);
 
const USERS = [
  { user: "admin", pass: "hantinh2026", role: "admin", name: "Admin", cls: "all" },
  { user: "cohoa", pass: "gv2026", role: "teacher", name: "Cô Hoa", cls: "CN-A1" },
  { user: "thaylong", pass: "gv2026", role: "teacher", name: "Thầy Long", cls: "CN-A3,CN-B2" },
  { user: "cowang", pass: "gv2026", role: "teacher", name: "Cô Wang Li", cls: "CN-A2" },
  { user: "thaynam", pass: "gv2026", role: "teacher", name: "Thầy Nam", cls: "CN-B1" },
];
 
const monthTrend = [{m:"T12",rev:42,lead:8,trial:3,enroll:2},{m:"T1",rev:48,lead:12,trial:5,enroll:4},{m:"T2",rev:52,lead:10,trial:4,enroll:3},{m:"T3",rev:58,lead:15,trial:6,enroll:5},{m:"T4",rev:65,lead:11,trial:5,enroll:3},{m:"T5",rev:72,lead:14,trial:7,enroll:5}];
const attendTrend = [{w:"W1",v:88},{w:"W2",v:91},{w:"W3",v:85},{w:"W4",v:93},{w:"W5",v:90},{w:"W6",v:87},{w:"W7",v:92},{w:"W8",v:94}];
 
export default function App() {
  const [user, setUser] = useState(null);
  const [lu, setLu] = useState("");
  const [lp, setLp] = useState("");
  const [le, setLe] = useState("");
  const [pg, setPg] = useState("home");
  const [stu, setStu] = useState([]);
  const [cls2, setCls2] = useState([]);
  const [fin, setFin] = useState([]);
  const [rpt, setRpt] = useState([]);
  const [leads, setLeads] = useState([]);
  const [inter, setInter] = useState([]);
  const [trials, setTrials] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [hsk, setHsk] = useState([]);
  const [modal, setModal] = useState(null);
  const [q, setQ] = useState("");
  const [dtab, setDtab] = useState("kpi");
  const [ok, setOk] = useState(false);
 
  useEffect(() => {
    (async () => {
      setStu(await loadT("students")); setCls2(await loadT("classes"));
      setFin(await loadT("finance")); setRpt(await loadT("reports"));
      setLeads(await loadT("leads")); setInter(await loadT("interactions"));
      setTrials(await loadT("trials")); setContracts(await loadT("contracts"));
      setHsk(await loadT("hsk_exams"));
      const su = localStorage.getItem("ht_user");
      if (su) setUser(JSON.parse(su));
      setOk(true);
    })();
  }, []);
 
  const login = () => {
    const u = USERS.find(u => u.user === lu && u.pass === lp);
    if (u) { setUser(u); localStorage.setItem("ht_user", JSON.stringify(u)); setLe(""); }
    else setLe("Sai tài khoản hoặc mật khẩu");
  };
  const logout = () => { setUser(null); localStorage.removeItem("ht_user"); setPg("home"); };
  const isAdmin = user?.role === "admin";
  const canSee = c => isAdmin || user?.cls === "all" || (user?.cls || "").split(",").includes(c);
 
  // Table name mapping for DB operations
  const tblMap = { s: "students", l: "leads", tr: "trials", ct: "contracts", hk: "hsk_exams", r: "reports", i: "interactions", f: "finance" };
  const stateMap = { s: [stu, setStu], l: [leads, setLeads], tr: [trials, setTrials], ct: [contracts, setContracts], hk: [hsk, setHsk], r: [rpt, setRpt], i: [inter, setInter], f: [fin, setFin] };
 
  const doSave = async (type, data, isNew) => {
    const tbl = tblMap[type];
    const [, setter] = stateMap[type];
    if (isNew) {
      const [arr] = stateMap[type];
      const newArr = type === "r" || type === "i" ? [data, ...arr] : [...arr, data];
      setter(newArr);
      await addRow(tbl, data);
    } else {
      const [arr] = stateMap[type];
      setter(arr.map(x => x.id === data.id ? data : x));
      await updateRow(tbl, data);
    }
  };
 
  const doDelete = async (type, id) => {
    const tbl = tblMap[type];
    const [arr, setter] = stateMap[type];
    setter(arr.filter(x => x.id !== id));
    await deleteRow(tbl, id);
  };
 
  if (!ok) return <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", fontFamily: "system-ui", fontSize: 16 }}>Đang kết nối Supabase...</div>;
 
  // ── LOGIN ──
  if (!user) return (
    <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#f0fdf4,#ecfdf5)", fontFamily: "system-ui" }}>
      <div style={{ background: "#fff", borderRadius: 20, padding: 40, width: 380, boxShadow: "0 20px 60px rgba(0,0,0,.08)", textAlign: "center" }}>
        <div style={{ width: 64, height: 64, borderRadius: 16, background: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 32, fontWeight: 800, margin: "0 auto 14px" }}>漢</div>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: "#15803d", marginBottom: 4 }}>Hán Tinh Premium</h2>
        <p style={{ color: "#9ca3af", fontSize: 14, marginBottom: 28 }}>Hệ thống quản lý trung tâm tiếng Trung</p>
        <input style={{ width: "100%", padding: "12px 16px", border: "1.5px solid #e5e7eb", borderRadius: 10, fontSize: 15, marginBottom: 10, outline: "none", fontFamily: "inherit" }} placeholder="Tài khoản" value={lu} onChange={e => setLu(e.target.value)} onKeyDown={e => e.key === "Enter" && login()} />
        <input style={{ width: "100%", padding: "12px 16px", border: "1.5px solid #e5e7eb", borderRadius: 10, fontSize: 15, marginBottom: 10, outline: "none", fontFamily: "inherit" }} placeholder="Mật khẩu" type="password" value={lp} onChange={e => setLp(e.target.value)} onKeyDown={e => e.key === "Enter" && login()} />
        {le && <div style={{ color: "#dc2626", fontSize: 13, marginBottom: 8 }}>{le}</div>}
        <button onClick={login} style={{ width: "100%", padding: 13, background: "#16a34a", color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Đăng nhập</button>
      </div>
    </div>
  );
 
  // ── COMPUTED ──
  const act = stu.filter(s => s.status === "Đang học");
  const ov = fin.filter(f => f.st === "overdue");
  const pend = fin.filter(f => f.st === "pending");
  const ranked = [...stu].filter(s => s.status === "Đang học").sort((a, b) => b.score - a.score);
  const teachers = [...new Set(cls2.map(c => c.teacher))];
  const expiring = contracts.filter(c => { const dl = daysLeft(c.end); return dl > 0 && dl <= 30; });
  const expired = contracts.filter(c => daysLeft(c.end) <= 0 && c.status !== "renewed");
  const upTrials = trials.filter(t => t.status === "scheduled");
  const needFU = trials.filter(t => t.result === "thinking");
  const hskP = hsk.filter(h => h.passed === "yes").length;
  const hskT = hsk.filter(h => h.status !== "registered").length;
  const hskRate = hskT > 0 ? Math.round(hskP / hskT * 100) : 0;
  const collected = fin.reduce((a, f) => a + (f.d1 || 0) + (f.st === "paid" ? (f.d2 || 0) : 0), 0);
  const srcData = ["Facebook", "TikTok", "Giới thiệu", "Walk-in", "Website"].map(s => ({ name: s, v: [...stu, ...leads].filter(x => x.source === s).length })).filter(d => d.v > 0);
  const funnelData = [{ stage: "Hỏi thăm", v: leads.filter(l => l.stage !== "lost").length }, { stage: "Học thử", v: leads.filter(l => l.stage === "trial" || l.stage === "registered").length }, { stage: "Đăng ký", v: leads.filter(l => l.stage === "registered").length }, { stage: "Đang học", v: act.length }];
  const payPie = [{ n: "Đủ", v: fin.filter(f => f.st === "paid").length }, { n: "Chờ", v: pend.length }, { n: "Nợ", v: ov.length }];
  const scoreDist = [{ r: "<5", n: stu.filter(s => s.score < 5).length }, { r: "5-6.5", n: stu.filter(s => s.score >= 5 && s.score < 6.5).length }, { r: "6.5-8", n: stu.filter(s => s.score >= 6.5 && s.score < 8).length }, { r: "8-9", n: stu.filter(s => s.score >= 8 && s.score < 9).length }, { r: "9+", n: stu.filter(s => s.score >= 9).length }];
 
  const B = (t, c) => { const m = { g: ["#dcfce7", "#16a34a"], r: ["#fef2f2", "#dc2626"], y: ["#fefce8", "#ca8a04"], b: ["#eff6ff", "#2563eb"], gr: ["#f3f4f6", "#6b7280"], p: ["#f3e8ff", "#7c3aed"], o: ["#fff7ed", "#ea580c"] }; const [bg, fg] = m[c] || m.gr; return <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: bg, color: fg }}>{t}</span>; };
  const md = modal?.d;
  const setMd = (k, v) => setModal({ ...modal, d: { ...modal.d, [k]: v } });
  const Fd = ({ label, children }) => <div style={{ flex: 1, marginBottom: 10 }}><label style={{ display: "block", fontSize: 12, color: "#6b7280", fontWeight: 600, marginBottom: 4 }}>{label}</label>{children}</div>;
  const Fl = ({ children }) => <div style={{ display: "flex", gap: 8 }}>{children}</div>;
  const CC = ({ title, children, h = 160 }) => <div className="cd"><div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>{title}</div><ResponsiveContainer width="100%" height={h}>{children}</ResponsiveContainer></div>;
 
  const adminMenu = [{ id: "home", l: "Tổng quan", i: "📊" }, { id: "leads", l: "Lead Pipeline", i: "🎯" }, { id: "trials", l: "Học thử", i: "📚" }, { id: "stu", l: "Học viên", i: "👨‍🎓" }, { id: "contracts", l: "Hợp đồng", i: "📄" }, { id: "hsk", l: "Thi HSK", i: "🎓" }, { id: "rpt", l: "Báo cáo GV", i: "📋" }, { id: "log", l: "Lịch sử", i: "💬" }, { id: "fin", l: "Tài chính", i: "💰" }, { id: "charts", l: "Biểu đồ", i: "📈" }];
  const teacherMenu = [{ id: "home", l: "Tổng quan", i: "📊" }, { id: "stu", l: "Học viên", i: "👨‍🎓" }, { id: "rpt", l: "Báo cáo", i: "📋" }, { id: "hsk", l: "Thi HSK", i: "🎓" }];
  const menu = isAdmin ? adminMenu : teacherMenu;
 
  return (
    <div style={{ fontFamily: "system-ui,sans-serif", display: "flex", height: "100vh", background: "#f8faf8", color: "#1a1a1a", overflow: "hidden" }}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:#d1d5db;border-radius:2px}
        .ni{display:flex;align-items:center;gap:8px;padding:9px 12px;border-radius:9px;cursor:pointer;font-size:13px;font-weight:500;color:#6b7280;transition:all .12s}
        .ni:hover{background:#f0fdf4;color:#16a34a}.ni.a{background:linear-gradient(135deg,#16a34a,#15803d);color:#fff;font-weight:700}
        .cd{background:#fff;border-radius:14px;padding:16px;box-shadow:0 1px 3px rgba(0,0,0,.05);border:1px solid #e5e7eb}
        .btn{display:inline-flex;align-items:center;gap:4px;padding:7px 14px;border-radius:8px;border:none;cursor:pointer;font-size:12px;font-weight:600;font-family:inherit}
        .btn-p{background:#16a34a;color:#fff}.btn-p:hover{box-shadow:0 2px 8px rgba(22,163,74,.3)}
        .btn-o{background:#fff;border:1.5px solid #d1d5db;color:#6b7280}.btn-sm{padding:5px 10px;font-size:11px}
        .inp{padding:9px 12px;border:1.5px solid #e5e7eb;border-radius:8px;font-size:14px;outline:none;width:100%;font-family:inherit;background:#fff}
        .inp:focus{border-color:#16a34a}select.inp{appearance:auto}textarea.inp{resize:vertical;min-height:50px}
        table{width:100%;border-collapse:collapse}
        th{padding:10px 12px;text-align:left;font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;background:#f9fafb;border-bottom:1px solid #e5e7eb}
        td{padding:10px 12px;font-size:13px;border-bottom:1px solid #f3f4f6}tr:hover td{background:#f0fdf4}
        .mbg{position:fixed;inset:0;background:rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;z-index:100}
        .mdl{background:#fff;border-radius:16px;padding:24px;width:480px;max-height:85vh;overflow-y:auto}
        .ib{cursor:pointer;padding:4px 6px;border-radius:6px;border:none;background:none;color:#9ca3af;font-size:13px}.ib:hover{color:#16a34a;background:#f0fdf4}
        .pb{height:6px;background:#f3f4f6;border-radius:3px;overflow:hidden}.pf{height:100%;border-radius:3px}
        .tab{padding:6px 12px;border-radius:7px;cursor:pointer;font-size:12px;font-weight:600;color:#6b7280;border:none;background:none;font-family:inherit}.tab.a{background:#16a34a;color:#fff}
        .al{border-radius:8px;padding:10px;margin-bottom:6px;font-size:12px}
        .funnel-bar{height:32px;border-radius:8px;display:flex;align-items:center;padding:0 12px;color:#fff;font-weight:700;font-size:13px;margin-bottom:5px}
      `}</style>
 
      {/* SIDEBAR */}
      <div style={{ width: 190, background: "#fff", borderRight: "1px solid #e5e7eb", display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ padding: "14px 12px", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 16, fontWeight: 800 }}>漢</div>
          <div><div style={{ fontWeight: 800, fontSize: 14, color: "#15803d" }}>Hán Tinh</div><div style={{ fontSize: 9, color: "#16a34a", fontWeight: 700, letterSpacing: 1.5 }}>PREMIUM</div></div>
        </div>
        <nav style={{ padding: "6px 6px", flex: 1 }}>{menu.map(m => <div key={m.id} className={`ni ${pg === m.id ? "a" : ""}`} onClick={() => setPg(m.id)}>{m.i} {m.l}</div>)}</nav>
        <div style={{ padding: "0 6px 8px", fontSize: 11 }}>
          {isAdmin && upTrials.length > 0 && <div className="al" style={{ background: "#eff6ff", border: "1px solid #bfdbfe", color: "#2563eb", fontWeight: 600, cursor: "pointer" }} onClick={() => setPg("trials")}>📚 {upTrials.length} học thử</div>}
          {isAdmin && (expiring.length + expired.length) > 0 && <div className="al" style={{ background: "#fefce8", border: "1px solid #fde68a", color: "#ca8a04", fontWeight: 600, cursor: "pointer" }} onClick={() => setPg("contracts")}>📄 {expiring.length + expired.length} HĐ</div>}
          {isAdmin && ov.length > 0 && <div className="al" style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", fontWeight: 600, cursor: "pointer" }} onClick={() => setPg("fin")}>⚠️ {ov.length} nợ HP</div>}
          <div style={{ padding: "8px 6px", borderTop: "1px solid #e5e7eb", marginTop: 4 }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>{user.name}</div>
            <div style={{ fontSize: 11, color: "#9ca3af" }}>{isAdmin ? "Quản trị viên" : "Giáo viên"}</div>
            <button onClick={logout} style={{ marginTop: 4, fontSize: 11, color: "#dc2626", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>Đăng xuất</button>
          </div>
        </div>
      </div>
 
      {/* MAIN */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ background: "#fff", padding: "8px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #e5e7eb", flexShrink: 0 }}>
          <input className="inp" placeholder="🔍 Tìm kiếm..." style={{ width: 240, fontSize: 13 }} value={q} onChange={e => setQ(e.target.value)} />
          <div style={{ fontSize: 12, color: "#9ca3af" }}>{user.name} · ☁️ Cloud</div>
        </div>
 
        <div style={{ flex: 1, overflow: "auto", padding: 16 }}>
 
          {/* ══ DASHBOARD ══ */}
          {pg === "home" && <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800 }}><span style={{ color: "#16a34a" }}>Hán Tinh</span> — {isAdmin ? "Dashboard" : "Xin chào " + user.name}</h2>
              {isAdmin && <div style={{ display: "flex", gap: 3, background: "#f3f4f6", borderRadius: 8, padding: 3 }}>
                {["kpi", "funnel", "trends"].map(t => <button key={t} className={`tab ${dtab === t ? "a" : ""}`} onClick={() => setDtab(t)}>{t === "kpi" ? "KPI" : t === "funnel" ? "Funnel" : "Xu hướng"}</button>)}
              </div>}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: isAdmin ? "repeat(6,1fr)" : "repeat(4,1fr)", gap: 8, marginBottom: 14 }}>
              {(isAdmin ? [
                { l: "Lead", v: leads.filter(l => l.stage !== "lost").length, c: "#2563eb" },
                { l: "Học viên", v: act.length, c: "#16a34a" },
                { l: "HSK đỗ", v: hskRate + "%", c: "#7c3aed" },
                { l: "Đã thu", v: vnd(collected), c: "#16a34a" },
                { l: "Nợ HP", v: ov.length, c: "#dc2626" },
                { l: "Follow-up", v: needFU.length, c: "#ea580c" },
              ] : [
                { l: "HV lớp tôi", v: stu.filter(s => canSee(s.cls)).length, c: "#16a34a" },
                { l: "Báo cáo", v: rpt.filter(r => r.teacher === user.name).length, c: "#7c3aed" },
                { l: "Điểm TB", v: (stu.filter(s => canSee(s.cls) && s.status === "Đang học").reduce((a, s) => a + s.score, 0) / Math.max(stu.filter(s => canSee(s.cls) && s.status === "Đang học").length, 1)).toFixed(1), c: "#2563eb" },
                { l: "CC TB", v: Math.round(stu.filter(s => canSee(s.cls) && s.status === "Đang học").reduce((a, s) => a + s.attend, 0) / Math.max(stu.filter(s => canSee(s.cls) && s.status === "Đang học").length, 1)) + "%", c: "#0d9488" },
              ]).map((s, i) => <div key={i} className="cd" style={{ textAlign: "center", padding: 12 }}><div style={{ fontSize: 22, fontWeight: 800, color: s.c }}>{s.v}</div><div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{s.l}</div></div>)}
            </div>
            {dtab === "funnel" && isAdmin && <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div className="cd"><div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>🎯 Lead Funnel</div>{funnelData.map((f, i) => <div key={f.stage} className="funnel-bar" style={{ width: Math.max((f.v / Math.max(funnelData[0].v, 1)) * 100, 25) + "%", background: CL[i] }}>{f.stage}: {f.v}</div>)}</div>
              <CC title="📊 Nguồn HV"><PieChart><Pie data={srcData} cx="50%" cy="50%" innerRadius={30} outerRadius={55} dataKey="v" label={({ name, v }) => name.slice(0, 5) + ":" + v} fontSize={10}>{srcData.map((e, i) => <Cell key={i} fill={CL[i]} />)}</Pie><Tooltip /></PieChart></CC>
            </div>}
            {dtab === "trends" && isAdmin && <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <CC title="📈 Doanh thu (triệu)" h={180}><BarChart data={monthTrend}><CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" /><XAxis dataKey="m" fontSize={11} /><YAxis fontSize={11} /><Tooltip /><Bar dataKey="rev" fill="#16a34a" radius={[4, 4, 0, 0]} /></BarChart></CC>
              <CC title="🎯 Lead → Enroll" h={180}><AreaChart data={monthTrend}><CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" /><XAxis dataKey="m" fontSize={11} /><YAxis fontSize={11} /><Tooltip /><Area type="monotone" dataKey="lead" stroke="#2563eb" fill="#eff6ff" /><Area type="monotone" dataKey="enroll" stroke="#16a34a" fill="#f0fdf4" /></AreaChart></CC>
              <CC title="📊 Chuyên cần (%)" h={180}><LineChart data={attendTrend}><CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" /><XAxis dataKey="w" fontSize={11} /><YAxis domain={[80, 100]} fontSize={11} /><Tooltip /><Line type="monotone" dataKey="v" stroke="#16a34a" strokeWidth={2.5} dot={{ fill: "#16a34a", r: 4 }} /></LineChart></CC>
              <CC title="🎯 Phân bố điểm" h={180}><BarChart data={scoreDist}><CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" /><XAxis dataKey="r" fontSize={11} /><YAxis fontSize={11} /><Tooltip /><Bar dataKey="n" fill="#0d9488" radius={[4, 4, 0, 0]} /></BarChart></CC>
            </div>}
            {dtab === "kpi" && isAdmin && <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              <div className="cd"><div style={{ fontWeight: 700, fontSize: 13, color: "#dc2626", marginBottom: 8 }}>⚠️ Cần thu tiền</div>{ov.map(f => <div key={f.id} style={{ padding: "6px 0", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}><div><strong style={{ fontSize: 13 }}>{f.name}</strong><br /><span style={{ color: "#dc2626", fontSize: 12 }}>{vnd(f.d2)}</span></div><button className="btn btn-p btn-sm" onClick={() => { const nf = fin.map(x => x.id === f.id ? { ...x, st: "paid" } : x); setFin(nf); updateRow("finance", { ...f, st: "paid" }); }}>✓ Thu</button></div>)}{ov.length === 0 && <div style={{ color: "#9ca3af", fontSize: 13 }}>OK ✅</div>}</div>
              <div className="cd"><div style={{ fontWeight: 700, fontSize: 13, color: "#16a34a", marginBottom: 8 }}>🏆 Top 5</div>{ranked.slice(0, 5).map((s, i) => <div key={s.id} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", fontSize: 13 }}><span>{["🥇", "🥈", "🥉", "4.", "5."][i]} {s.name}</span><strong style={{ color: "#16a34a" }}>{s.score}</strong></div>)}</div>
              <div className="cd"><div style={{ fontWeight: 700, fontSize: 13, color: "#7c3aed", marginBottom: 8 }}>📋 Báo cáo mới</div>{rpt.slice(0, 4).map(r => <div key={r.id} style={{ padding: "5px 0", borderBottom: "1px solid #f3f4f6", fontSize: 12 }}><strong>{r.teacher}</strong> · {r.cls} · {r.date}{r.flags && <div style={{ color: "#dc2626", fontSize: 11 }}>⚠️ {r.flags}</div>}</div>)}</div>
            </div>}
          </div>}
 
          {/* ══ LEADS ══ */}
          {pg === "leads" && isAdmin && <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800 }}>🎯 Lead Pipeline</h2>
              <button className="btn btn-p" onClick={() => setModal({ t: "l", d: { id: "LD" + Date.now(), name: "", phone: "", source: "Facebook", stage: "inquiry", interest: "HSK 1", note: "", created: today, lastContact: today }, n: 1 })}>+ Lead mới</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 12 }}>
              {[{ s: "inquiry", l: "Hỏi thăm", c: "#2563eb" }, { s: "trial", l: "Học thử", c: "#ea580c" }, { s: "registered", l: "Đã ĐK", c: "#16a34a" }, { s: "lost", l: "Mất", c: "#6b7280" }].map(p => <div key={p.s} style={{ textAlign: "center", padding: 10, borderRadius: 8, background: "#f9fafb", fontWeight: 700, color: p.c }}><div style={{ fontSize: 24 }}>{leads.filter(l => l.stage === p.s).length}</div><div style={{ fontSize: 12 }}>{p.l}</div></div>)}
            </div>
            <div className="cd" style={{ padding: 0 }}><table><thead><tr>{["Tên", "SĐT", "Nguồn", "Quan tâm", "Giai đoạn", ""].map(h => <th key={h}>{h}</th>)}</tr></thead><tbody>{leads.map(l => <tr key={l.id}>
              <td style={{ fontWeight: 600 }}>{l.name}</td><td>{l.phone}</td>
              <td>{B(l.source, { Facebook: "b", TikTok: "p", "Giới thiệu": "g", "Walk-in": "o", Website: "y" }[l.source] || "gr")}</td>
              <td>{B(l.interest, "b")}</td>
              <td>{{ inquiry: B("Hỏi thăm", "b"), trial: B("Học thử", "o"), registered: B("Đã ĐK", "g"), lost: B("Mất", "gr") }[l.stage]}</td>
              <td><div style={{ display: "flex", gap: 3 }}>
                {l.stage === "inquiry" && <button className="btn btn-sm" style={{ background: "#fff7ed", color: "#ea580c", border: "none" }} onClick={() => { const nl = { ...l, stage: "trial" }; setLeads(leads.map(x => x.id === l.id ? nl : x)); updateRow("leads", nl); }}>→ Thử</button>}
                {l.stage === "trial" && <button className="btn btn-sm btn-p" onClick={() => { const nl = { ...l, stage: "registered" }; setLeads(leads.map(x => x.id === l.id ? nl : x)); updateRow("leads", nl); }}>→ ĐK</button>}
                <button className="ib" onClick={() => setModal({ t: "l", d: { ...l }, n: 0 })}>✏️</button>
                <button className="ib" style={{ color: "#dc2626" }} onClick={() => { if (confirm("Xoá?")) doDelete("l", l.id); }}>🗑️</button>
              </div></td>
            </tr>)}</tbody></table></div>
          </div>}
 
          {/* ══ TRIALS ══ */}
          {pg === "trials" && isAdmin && <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800 }}>📚 Quản lý Học thử</h2>
              <button className="btn btn-p" onClick={() => setModal({ t: "tr", d: { id: "TL" + Date.now(), name: "", phone: "", source: "Facebook", date: today, time: "18:00", cls: cls2[0]?.id || "", teacher: teachers[0] || "", status: "scheduled", result: "", followUp: "", note: "" }, n: 1 })}>+ Xếp lịch</button>
            </div>
            {needFU.length > 0 && <div className="al" style={{ background: "#fff7ed", border: "1px solid #fed7aa", color: "#ea580c", fontWeight: 600 }}>🔔 Cần follow-up: {needFU.map(t => t.name).join(", ")}</div>}
            <div className="cd" style={{ padding: 0 }}><table><thead><tr>{["Tên", "Ngày giờ", "Lớp", "Trạng thái", "Kết quả", "Follow-up", ""].map(h => <th key={h}>{h}</th>)}</tr></thead><tbody>{trials.map(t => <tr key={t.id}>
              <td><div style={{ fontWeight: 600 }}>{t.name}</div><div style={{ color: "#9ca3af", fontSize: 11 }}>{t.source}</div></td>
              <td style={{ fontSize: 12 }}>{t.date} {t.time}</td><td>{t.cls}</td>
              <td>{{ scheduled: B("Đã xếp", "b"), completed: B("Đã học", "g"), "no-show": B("Không đến", "r") }[t.status] || B(t.status, "gr")}</td>
              <td>{t.result ? { enrolled: B("Đã ĐK", "g"), thinking: B("Suy nghĩ", "y"), "not-interested": B("Không QT", "gr") }[t.result] || "—" : "—"}</td>
              <td style={{ fontSize: 12, color: t.followUp && daysLeft(t.followUp) <= 1 ? "#dc2626" : "#9ca3af" }}>{t.followUp || "—"}</td>
              <td><div style={{ display: "flex", gap: 3 }}>
                {t.status === "scheduled" && <button className="btn btn-sm btn-p" onClick={() => { const nt = { ...t, status: "completed" }; setTrials(trials.map(x => x.id === t.id ? nt : x)); updateRow("trials", nt); }}>✓ Xong</button>}
                <button className="ib" onClick={() => setModal({ t: "tr", d: { ...t }, n: 0 })}>✏️</button>
              </div></td>
            </tr>)}</tbody></table></div>
          </div>}
 
          {/* ══ STUDENTS ══ */}
          {pg === "stu" && <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800 }}>👨‍🎓 Học viên ({stu.filter(s => canSee(s.cls)).length})</h2>
              {isAdmin && <button className="btn btn-p" onClick={() => setModal({ t: "s", d: { id: "HV" + Date.now(), name: "", phone: "", cls: cls2[0]?.id || "", level: "HSK 1", status: "Đang học", score: 0, attend: 90, source: "Facebook" }, n: 1 })}>+ Thêm HV</button>}
            </div>
            <div className="cd" style={{ padding: 0 }}><table><thead><tr>{["#", "Học viên", "Level", "Lớp", "Điểm", "CC", "Nguồn", "Trạng thái", ...(isAdmin ? [""] : [])].map(h => <th key={h}>{h}</th>)}</tr></thead><tbody>{stu.filter(s => (!q || s.name.toLowerCase().includes(q.toLowerCase())) && canSee(s.cls)).map((s, i) => <tr key={s.id}>
              <td style={{ color: "#9ca3af" }}>{i + 1}</td>
              <td><div style={{ fontWeight: 600 }}>{s.name}</div><div style={{ color: "#9ca3af", fontSize: 11 }}>{s.phone}</div></td>
              <td>{B(s.level, "b")}</td><td>{s.cls}</td>
              <td style={{ fontWeight: 800, color: s.score >= 8 ? "#16a34a" : s.score >= 6.5 ? "#ca8a04" : "#dc2626", fontSize: 15 }}>{s.score}</td>
              <td style={{ color: s.attend >= 90 ? "#16a34a" : "#ca8a04" }}>{s.attend}%</td>
              <td>{B(s.source, "gr")}</td>
              <td>{B(s.status, s.status === "Đang học" ? "g" : s.status === "Tạm nghỉ" ? "y" : "gr")}</td>
              {isAdmin && <td><button className="ib" onClick={() => setModal({ t: "s", d: { ...s }, n: 0 })}>✏️</button><button className="ib" style={{ color: "#dc2626" }} onClick={() => { if (confirm("Xoá " + s.name + "?")) doDelete("s", s.id); }}>🗑️</button></td>}
            </tr>)}</tbody></table></div>
          </div>}
 
          {/* ══ CONTRACTS ══ */}
          {pg === "contracts" && isAdmin && <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800 }}>📄 Hợp đồng & Gia hạn</h2>
              <button className="btn btn-p" onClick={() => setModal({ t: "ct", d: { id: "HD" + Date.now(), name: "", cls: cls2[0]?.id || "", start: today, end: "", duration: "6 tháng", fee: 0, status: "active", note: "" }, n: 1 })}>+ Tạo HĐ</button>
            </div>
            <div className="cd" style={{ padding: 0 }}><table><thead><tr>{["Học viên", "Lớp", "Bắt đầu", "Kết thúc", "Học phí", "Trạng thái", "Còn lại", ""].map(h => <th key={h}>{h}</th>)}</tr></thead><tbody>{contracts.map(c => { const dl = daysLeft(c.end); const rs = c.status === "renewed" ? "renewed" : dl <= 0 ? "expired" : dl <= 30 ? "expiring" : "active"; return <tr key={c.id}>
              <td style={{ fontWeight: 600 }}>{c.name}</td><td>{B(c.cls, "b")}</td><td style={{ fontSize: 12 }}>{c.start}</td><td style={{ fontSize: 12 }}>{c.end}</td>
              <td style={{ fontWeight: 700, color: "#16a34a" }}>{vnd(c.fee)}</td>
              <td>{{ active: B("Hiệu lực", "g"), expiring: B("Sắp hết", "y"), expired: B("Hết hạn", "r"), renewed: B("Gia hạn", "b") }[rs]}</td>
              <td style={{ fontWeight: 700, color: dl <= 0 ? "#dc2626" : dl <= 30 ? "#ca8a04" : "#16a34a" }}>{dl <= 0 ? "Hết hạn" : dl + " ngày"}</td>
              <td><div style={{ display: "flex", gap: 3 }}>
                {(rs === "expiring" || rs === "expired") && <button className="btn btn-sm btn-p" onClick={() => { const nc = { ...c, status: "renewed", note: "Gia hạn " + today }; setContracts(contracts.map(x => x.id === c.id ? nc : x)); updateRow("contracts", nc); }}>↻ Gia hạn</button>}
                <button className="ib" onClick={() => setModal({ t: "ct", d: { ...c }, n: 0 })}>✏️</button>
              </div></td>
            </tr>; })}</tbody></table></div>
          </div>}
 
          {/* ══ HSK ══ */}
          {pg === "hsk" && <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800 }}>🎓 Theo dõi thi HSK</h2>
              {isAdmin && <button className="btn btn-p" onClick={() => setModal({ t: "hk", d: { id: "HSK" + Date.now(), name: "", level: "HSK 1", examDate: "", score: 0, passed: "", status: "registered" }, n: 1 })}>+ ĐK thi</button>}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
              <CC title="Kết quả theo Level" h={150}><BarChart data={["HSK 1", "HSK 2", "HSK 3", "HSK 4", "HSK 5"].map(l => ({ l, p: hsk.filter(h => h.level === l && h.passed === "yes").length, f: hsk.filter(h => h.level === l && h.passed === "no").length }))}><XAxis dataKey="l" fontSize={10} /><YAxis fontSize={10} /><Tooltip /><Bar dataKey="p" name="Đạt" fill="#16a34a" stackId="a" radius={[4, 4, 0, 0]} /><Bar dataKey="f" name="Trượt" fill="#dc2626" stackId="a" radius={[4, 4, 0, 0]} /></BarChart></CC>
              <div className="cd" style={{ textAlign: "center" }}><div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>Tỷ lệ đỗ tổng thể</div><div style={{ fontSize: 48, fontWeight: 800, color: hskRate >= 70 ? "#16a34a" : "#ca8a04" }}>{hskRate}%</div><div style={{ fontSize: 13, color: "#9ca3af" }}>{hskP}/{hskT} đạt</div><div className="pb" style={{ marginTop: 8 }}><div className="pf" style={{ width: hskRate + "%", background: hskRate >= 70 ? "#16a34a" : "#ca8a04" }} /></div></div>
            </div>
            <div className="cd" style={{ padding: 0 }}><table><thead><tr>{["Học viên", "Level", "Ngày thi", "Điểm", "Kết quả", ...(isAdmin ? [""] : [])].map(h => <th key={h}>{h}</th>)}</tr></thead><tbody>{hsk.map(h => <tr key={h.id}>
              <td style={{ fontWeight: 600 }}>{h.name}</td><td>{B(h.level, "p")}</td><td>{h.examDate}</td>
              <td style={{ fontWeight: 700, fontSize: 15 }}>{h.score || "—"}</td>
              <td>{h.passed === "yes" ? B("ĐẠT", "g") : h.passed === "no" ? B("Chưa đạt", "r") : B("Chưa thi", "b")}</td>
              {isAdmin && <td><button className="ib" onClick={() => setModal({ t: "hk", d: { ...h }, n: 0 })}>✏️</button></td>}
            </tr>)}</tbody></table></div>
          </div>}
 
          {/* ══ REPORTS ══ */}
          {pg === "rpt" && <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800 }}>📋 Báo cáo buổi học</h2>
              <button className="btn btn-p" onClick={() => setModal({ t: "r", d: { id: "RP" + Date.now(), date: today, teacher: isAdmin ? (teachers[0] || "") : user.name, cls: cls2[0]?.id || "", present: 0, absent: 0, absentNames: "", lesson: "", homework: "", flags: "", highlights: "" }, n: 1 })}>+ Tạo báo cáo</button>
            </div>
            {rpt.filter(r => isAdmin || r.teacher === user.name).map(r => <div key={r.id} style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: 14, marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <div><strong style={{ fontSize: 14 }}>{r.teacher}</strong> <span style={{ color: "#9ca3af", fontSize: 12 }}>{r.cls} · {r.date}</span></div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {B(r.present + "/" + (r.present + r.absent) + " có mặt", r.absent === 0 ? "g" : "y")}
                  {(isAdmin || r.teacher === user.name) && <button className="ib" onClick={() => setModal({ t: "r", d: { ...r }, n: 0 })}>✏️</button>}
                </div>
              </div>
              <div style={{ fontSize: 13 }}>📖 {r.lesson}</div>
              {r.homework && <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>📝 BTVN: {r.homework}</div>}
              {r.flags && <div style={{ background: "#fef2f2", borderRadius: 6, padding: "6px 10px", marginTop: 6, fontSize: 12, color: "#dc2626" }}>⚠️ {r.flags}</div>}
              {r.highlights && <div style={{ background: "#f0fdf4", borderRadius: 6, padding: "6px 10px", marginTop: 6, fontSize: 12, color: "#16a34a" }}>⭐ {r.highlights}</div>}
            </div>)}
          </div>}
 
          {/* ══ LOG ══ */}
          {pg === "log" && isAdmin && <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800 }}>💬 Lịch sử tương tác</h2>
              <button className="btn btn-p" onClick={() => setModal({ t: "i", d: { id: "IT" + Date.now(), ref: "", refName: "", date: today, type: "call", content: "", by: "Admin" }, n: 1 })}>+ Ghi nhận</button>
            </div>
            {inter.map(it => <div key={it.id} style={{ display: "flex", gap: 10, padding: "10px 0", borderBottom: "1px solid #f3f4f6" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: it.type === "call" ? "#16a34a" : "#2563eb", marginTop: 5, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13 }}><strong>{it.refName}</strong> <span style={{ color: "#9ca3af", fontSize: 11 }}>{it.date}</span> {B(it.type === "call" ? "📞 Gọi" : it.type === "message" ? "💬 Nhắn" : "🤝 Gặp", it.type === "call" ? "g" : it.type === "message" ? "b" : "o")}</div>
                <div style={{ fontSize: 13, color: "#374151", marginTop: 3 }}>{it.content}</div>
              </div>
            </div>)}
          </div>}
 
          {/* ══ FINANCE ══ */}
          {pg === "fin" && isAdmin && <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800 }}>💰 Tài chính 50/50</h2>
              <button className="btn btn-p" onClick={() => setModal({ t: "f", d: { id: "HP" + Date.now(), name: "", cls: cls2[0]?.id || "", total: 0, d1: 0, d2: 0, d2d: "", st: "pending" }, n: 1 })}>+ Thêm</button>
            </div>
            <div className="cd" style={{ padding: 0 }}><table><thead><tr>{["Học viên", "Lớp", "Tổng phí", "Đợt 1", "Đợt 2", "Hạn Đ2", "Trạng thái", ""].map(h => <th key={h}>{h}</th>)}</tr></thead><tbody>{fin.map(f => <tr key={f.id}>
              <td style={{ fontWeight: 600 }}>{f.name}</td><td>{B(f.cls, "b")}</td>
              <td style={{ fontWeight: 700, color: "#16a34a" }}>{vnd(f.total)}</td><td>{vnd(f.d1)}</td><td style={{ fontWeight: 600 }}>{vnd(f.d2)}</td>
              <td style={{ color: f.st === "overdue" ? "#dc2626" : "#9ca3af", fontSize: 12 }}>{f.d2d}</td>
              <td>{f.st === "paid" ? B("Đã đóng", "g") : f.st === "pending" ? B("Chờ đóng", "y") : B("Quá hạn", "r")}</td>
              <td><div style={{ display: "flex", gap: 3 }}>
                {f.st !== "paid" && <button className="btn btn-p btn-sm" onClick={() => { const nf = { ...f, st: "paid" }; setFin(fin.map(x => x.id === f.id ? nf : x)); updateRow("finance", nf); }}>✓ Thu</button>}
                <button className="ib" onClick={() => setModal({ t: "f", d: { ...f }, n: 0 })}>✏️</button>
              </div></td>
            </tr>)}</tbody></table></div>
          </div>}
 
          {/* ══ CHARTS ══ */}
          {pg === "charts" && isAdmin && <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 12 }}>📈 Biểu đồ tổng hợp</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <CC title="📊 Doanh thu theo tháng" h={190}><BarChart data={monthTrend}><CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" /><XAxis dataKey="m" fontSize={11} /><YAxis fontSize={11} /><Tooltip /><Bar dataKey="rev" fill="#16a34a" radius={[4, 4, 0, 0]} /></BarChart></CC>
              <CC title="🎯 Lead → Enroll" h={190}><AreaChart data={monthTrend}><CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" /><XAxis dataKey="m" fontSize={11} /><YAxis fontSize={11} /><Tooltip /><Area type="monotone" dataKey="lead" stroke="#2563eb" fill="#eff6ff" /><Area type="monotone" dataKey="trial" stroke="#ea580c" fill="#fff7ed" /><Area type="monotone" dataKey="enroll" stroke="#16a34a" fill="#f0fdf4" /></AreaChart></CC>
              <CC title="📊 Thanh toán"><PieChart><Pie data={payPie} cx="50%" cy="50%" innerRadius={30} outerRadius={60} dataKey="v" label={({ n, v }) => n + ":" + v} fontSize={11}>{payPie.map((e, i) => <Cell key={i} fill={[CL[0], CL[3], CL[4]][i]} />)}</Pie><Tooltip /></PieChart></CC>
              <CC title="📊 Nguồn HV"><PieChart><Pie data={srcData} cx="50%" cy="50%" innerRadius={30} outerRadius={60} dataKey="v" label={({ name, v }) => name.slice(0, 6) + ":" + v} fontSize={11}>{srcData.map((e, i) => <Cell key={i} fill={CL[i]} />)}</Pie><Tooltip /></PieChart></CC>
            </div>
          </div>}
        </div>
      </div>
 
      {/* ══ MODAL ══ */}
      {modal && <div className="mbg" onClick={() => setModal(null)}><div className="mdl" onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>{modal.n ? "Thêm" : "Sửa"} {{ s: "Học viên", l: "Lead", tr: "Học thử", ct: "Hợp đồng", hk: "Thi HSK", r: "Báo cáo", i: "Tương tác", f: "Học phí" }[modal.t]}</h3>
          <button className="ib" style={{ fontSize: 16 }} onClick={() => setModal(null)}>✕</button>
        </div>
 
        {modal.t === "l" && <div>
          <Fl><Fd label="Họ tên"><input className="inp" value={md.name} onChange={e => setMd("name", e.target.value)} /></Fd><Fd label="SĐT"><input className="inp" value={md.phone} onChange={e => setMd("phone", e.target.value)} /></Fd></Fl>
          <Fl><Fd label="Nguồn"><select className="inp" value={md.source} onChange={e => setMd("source", e.target.value)}>{["Facebook", "TikTok", "Giới thiệu", "Walk-in", "Website"].map(o => <option key={o}>{o}</option>)}</select></Fd><Fd label="Quan tâm"><select className="inp" value={md.interest} onChange={e => setMd("interest", e.target.value)}>{["HSK 1", "HSK 2", "HSK 3", "HSK 4", "HSK 5"].map(o => <option key={o}>{o}</option>)}</select></Fd></Fl>
          <Fd label="Giai đoạn"><select className="inp" value={md.stage} onChange={e => setMd("stage", e.target.value)}>{[["inquiry", "Hỏi thăm"], ["trial", "Học thử"], ["registered", "Đã ĐK"], ["lost", "Mất"]].map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></Fd>
          <Fd label="Ghi chú"><textarea className="inp" value={md.note} onChange={e => setMd("note", e.target.value)} /></Fd>
        </div>}
 
        {modal.t === "s" && <div>
          <Fl><Fd label="Họ tên"><input className="inp" value={md.name} onChange={e => setMd("name", e.target.value)} /></Fd><Fd label="SĐT"><input className="inp" value={md.phone} onChange={e => setMd("phone", e.target.value)} /></Fd></Fl>
          <Fl><Fd label="Lớp"><select className="inp" value={md.cls} onChange={e => setMd("cls", e.target.value)}>{cls2.map(c => <option key={c.id}>{c.id}</option>)}</select></Fd><Fd label="Level"><select className="inp" value={md.level} onChange={e => setMd("level", e.target.value)}>{["HSK 1", "HSK 2", "HSK 3", "HSK 4", "HSK 5", "HSK 6"].map(o => <option key={o}>{o}</option>)}</select></Fd></Fl>
          <Fl><Fd label="Điểm"><input className="inp" type="number" value={md.score} onChange={e => setMd("score", parseFloat(e.target.value) || 0)} /></Fd><Fd label="Chuyên cần %"><input className="inp" type="number" value={md.attend} onChange={e => setMd("attend", parseFloat(e.target.value) || 0)} /></Fd></Fl>
          <Fl><Fd label="Nguồn"><select className="inp" value={md.source} onChange={e => setMd("source", e.target.value)}>{["Facebook", "TikTok", "Giới thiệu", "Walk-in", "Website"].map(o => <option key={o}>{o}</option>)}</select></Fd><Fd label="Trạng thái"><select className="inp" value={md.status} onChange={e => setMd("status", e.target.value)}>{["Đang học", "Tạm nghỉ", "Nghỉ học"].map(o => <option key={o}>{o}</option>)}</select></Fd></Fl>
        </div>}
 
        {modal.t === "tr" && <div>
          <Fl><Fd label="Họ tên"><input className="inp" value={md.name} onChange={e => setMd("name", e.target.value)} /></Fd><Fd label="SĐT"><input className="inp" value={md.phone} onChange={e => setMd("phone", e.target.value)} /></Fd></Fl>
          <Fl><Fd label="Ngày"><input className="inp" type="date" value={md.date} onChange={e => setMd("date", e.target.value)} /></Fd><Fd label="Giờ"><input className="inp" value={md.time} onChange={e => setMd("time", e.target.value)} /></Fd></Fl>
          <Fl><Fd label="Lớp"><select className="inp" value={md.cls} onChange={e => setMd("cls", e.target.value)}>{cls2.map(c => <option key={c.id}>{c.id}</option>)}</select></Fd><Fd label="GV"><select className="inp" value={md.teacher} onChange={e => setMd("teacher", e.target.value)}>{teachers.map(t => <option key={t}>{t}</option>)}</select></Fd></Fl>
          <Fl><Fd label="Trạng thái"><select className="inp" value={md.status} onChange={e => setMd("status", e.target.value)}>{[["scheduled", "Đã xếp"], ["completed", "Đã học"], ["no-show", "Không đến"]].map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></Fd><Fd label="Kết quả"><select className="inp" value={md.result} onChange={e => setMd("result", e.target.value)}><option value="">—</option>{[["enrolled", "Đã ĐK"], ["thinking", "Suy nghĩ"], ["not-interested", "Không QT"]].map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></Fd></Fl>
          <Fd label="Follow-up"><input className="inp" type="date" value={md.followUp} onChange={e => setMd("followUp", e.target.value)} /></Fd>
          <Fd label="Ghi chú"><textarea className="inp" value={md.note} onChange={e => setMd("note", e.target.value)} /></Fd>
        </div>}
 
        {modal.t === "ct" && <div>
          <Fd label="Học viên"><input className="inp" value={md.name} onChange={e => setMd("name", e.target.value)} /></Fd>
          <Fl><Fd label="Lớp"><select className="inp" value={md.cls} onChange={e => setMd("cls", e.target.value)}>{cls2.map(c => <option key={c.id}>{c.id}</option>)}</select></Fd><Fd label="Thời hạn"><select className="inp" value={md.duration} onChange={e => setMd("duration", e.target.value)}>{["3 tháng", "6 tháng", "12 tháng", "18 tháng"].map(o => <option key={o}>{o}</option>)}</select></Fd></Fl>
          <Fl><Fd label="Bắt đầu"><input className="inp" type="date" value={md.start} onChange={e => setMd("start", e.target.value)} /></Fd><Fd label="Kết thúc"><input className="inp" type="date" value={md.end} onChange={e => setMd("end", e.target.value)} /></Fd></Fl>
          <Fd label="Học phí"><input className="inp" type="number" value={md.fee} onChange={e => setMd("fee", parseFloat(e.target.value) || 0)} /></Fd>
        </div>}
 
        {modal.t === "hk" && <div>
          <Fd label="Học viên"><input className="inp" value={md.name} onChange={e => setMd("name", e.target.value)} /></Fd>
          <Fl><Fd label="Level"><select className="inp" value={md.level} onChange={e => setMd("level", e.target.value)}>{["HSK 1", "HSK 2", "HSK 3", "HSK 4", "HSK 5", "HSK 6"].map(o => <option key={o}>{o}</option>)}</select></Fd><Fd label="Ngày thi"><input className="inp" type="date" value={md.examDate} onChange={e => setMd("examDate", e.target.value)} /></Fd></Fl>
          <Fl><Fd label="Điểm"><input className="inp" type="number" value={md.score} onChange={e => setMd("score", parseFloat(e.target.value) || 0)} /></Fd><Fd label="Kết quả"><select className="inp" value={md.passed} onChange={e => { const v = e.target.value; setModal({ ...modal, d: { ...md, passed: v, status: v === "yes" ? "passed" : v === "no" ? "failed" : "registered" } }); }}><option value="">Chưa thi</option><option value="yes">ĐẠT</option><option value="no">Chưa đạt</option></select></Fd></Fl>
        </div>}
 
        {modal.t === "r" && <div>
          <Fl><Fd label="Ngày"><input className="inp" type="date" value={md.date} onChange={e => setMd("date", e.target.value)} /></Fd>
          {isAdmin ? <Fd label="Giáo viên"><select className="inp" value={md.teacher} onChange={e => setMd("teacher", e.target.value)}>{teachers.map(t => <option key={t}>{t}</option>)}</select></Fd> : <Fd label="GV"><input className="inp" value={user.name} disabled /></Fd>}
          <Fd label="Lớp"><select className="inp" value={md.cls} onChange={e => setMd("cls", e.target.value)}>{cls2.filter(c => isAdmin || canSee(c.id)).map(c => <option key={c.id}>{c.id}</option>)}</select></Fd></Fl>
          <Fl><Fd label="Có mặt"><input className="inp" type="number" value={md.present} onChange={e => setMd("present", parseInt(e.target.value) || 0)} /></Fd><Fd label="Vắng"><input className="inp" type="number" value={md.absent} onChange={e => setMd("absent", parseInt(e.target.value) || 0)} /></Fd></Fl>
          <Fd label="HV vắng"><input className="inp" value={md.absentNames} onChange={e => setMd("absentNames", e.target.value)} /></Fd>
          <Fd label="📖 Bài học hôm nay"><textarea className="inp" value={md.lesson} onChange={e => setMd("lesson", e.target.value)} /></Fd>
          <Fd label="📝 BTVN"><textarea className="inp" value={md.homework} onChange={e => setMd("homework", e.target.value)} /></Fd>
          <Fd label="⚠️ Vấn đề cần chú ý"><textarea className="inp" value={md.flags} onChange={e => setMd("flags", e.target.value)} placeholder="HV yếu, vắng nhiều..." /></Fd>
          <Fd label="⭐ Điểm nổi bật"><textarea className="inp" value={md.highlights} onChange={e => setMd("highlights", e.target.value)} placeholder="HV tiến bộ, kết quả tốt..." /></Fd>
        </div>}
 
        {modal.t === "i" && <div>
          <Fl><Fd label="Người liên quan"><input className="inp" value={md.refName} onChange={e => setMd("refName", e.target.value)} /></Fd><Fd label="Ngày"><input className="inp" type="date" value={md.date} onChange={e => setMd("date", e.target.value)} /></Fd></Fl>
          <Fl><Fd label="Loại"><select className="inp" value={md.type} onChange={e => setMd("type", e.target.value)}>{[["call", "📞 Gọi điện"], ["message", "💬 Tin nhắn"], ["meeting", "🤝 Gặp mặt"]].map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></Fd><Fd label="Bởi"><input className="inp" value={md.by} onChange={e => setMd("by", e.target.value)} /></Fd></Fl>
          <Fd label="Nội dung"><textarea className="inp" value={md.content} onChange={e => setMd("content", e.target.value)} placeholder="Nội dung trao đổi..." /></Fd>
        </div>}
 
        {modal.t === "f" && <div>
          <div style={{ background: "#f0fdf4", borderRadius: 8, padding: 10, marginBottom: 14, fontSize: 12, color: "#16a34a", fontWeight: 600, border: "1px solid #bbf7d0" }}>50% trước khoá → 1 tháng → 50% còn lại</div>
          <Fd label="Họ tên"><input className="inp" value={md.name} onChange={e => setMd("name", e.target.value)} /></Fd>
          <Fl><Fd label="Lớp"><select className="inp" value={md.cls} onChange={e => setMd("cls", e.target.value)}>{cls2.map(c => <option key={c.id}>{c.id}</option>)}</select></Fd><Fd label="Tổng phí"><input className="inp" type="number" value={md.total} onChange={e => { const v = parseFloat(e.target.value) || 0; setModal({ ...modal, d: { ...md, total: v, d1: Math.round(v / 2), d2: Math.round(v / 2) } }); }} /></Fd></Fl>
          <Fl><Fd label="Hạn đợt 2"><input className="inp" value={md.d2d} onChange={e => setMd("d2d", e.target.value)} placeholder="DD/MM" /></Fd><Fd label="Trạng thái đợt 2"><select className="inp" value={md.st} onChange={e => setMd("st", e.target.value)}><option value="paid">Đã đóng</option><option value="pending">Chờ đóng</option><option value="overdue">Quá hạn</option></select></Fd></Fl>
        </div>}
 
        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          <button className="btn btn-p" style={{ flex: 1, padding: 10, fontSize: 14 }} onClick={async () => {
            await doSave(modal.t, modal.d, modal.n);
            setModal(null);
          }}>💾 Lưu</button>
          <button className="btn btn-o" style={{ padding: 10, fontSize: 14 }} onClick={() => setModal(null)}>Huỷ</button>
        </div>
      </div></div>}
    </div>
  );
}
