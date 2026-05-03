import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, AreaChart, Area, Legend } from "recharts";
import { supabase } from "./supabase";

// ── Field mapping: app (camelCase) ↔ DB (snake_case) ──
const FM = {
  leads: { lastContact: "last_contact" },
  reports: { absentNames: "absent_names" },
  interactions: { refName: "ref_name", by: "by_user" },
  trials: { date: "trial_date", time: "trial_time", followUp: "follow_up" },
  contracts: { start: "start_date", end: "end_date" },
  hsk_exams: { examDate: "exam_date" },
};
const rev = (m) => { const r = {}; for (const [k, v] of Object.entries(m)) r[v] = k; return r; };
const toDb = (t, obj) => { const m = FM[t]; if (!m) return { ...obj }; const r = {}; for (const [k, v] of Object.entries(obj)) r[m[k] || k] = v; return r; };
const toApp = (t, obj) => { const m = FM[t]; if (!m) return { ...obj }; const rm = rev(m); const r = {}; for (const [k, v] of Object.entries(obj)) r[rm[k] || k] = v; return r; };

const loadT = async (t, fb) => {
  try { const { data } = await supabase.from(t).select("*"); return data && data.length > 0 ? data.map(r => toApp(t, r)) : fb; }
  catch { return fb; }
};
const saveT = async (t, arr) => {
  try {
    await supabase.from(t).delete().neq("id", "___");
    if (arr.length > 0) await supabase.from(t).insert(arr.map(r => toDb(t, r)));
  } catch (e) { console.error(t, e); }
};

const vnd = n => (n / 1e6).toFixed(1) + "tr";
const today = new Date().toISOString().slice(0, 10);
const CL = ["#16a34a", "#0d9488", "#2563eb", "#ca8a04", "#dc2626", "#7c3aed", "#ea580c"];
const daysLeft = d => Math.ceil((new Date(d) - new Date()) / 86400000);

const USERS = [
  { user: "admin", pass: "admin", role: "admin", name: "Admin", cls: "all" },
  { user: "cohoa", pass: "123", role: "teacher", name: "Cô Hoa", cls: "CN-A1" },
  { user: "thaylong", pass: "123", role: "teacher", name: "Thầy Long", cls: "CN-A3,CN-B2" },
  { user: "cowang", pass: "123", role: "teacher", name: "Cô Wang Li", cls: "CN-A2" },
  { user: "thaynam", pass: "123", role: "teacher", name: "Thầy Nam", cls: "CN-B1" },
];

const monthTrend = [{m:"T12",hv:5,rev:42,lead:8,trial:3,enroll:2},{m:"T1",hv:7,rev:48,lead:12,trial:5,enroll:4},{m:"T2",hv:4,rev:52,lead:10,trial:4,enroll:3},{m:"T3",hv:8,rev:58,lead:15,trial:6,enroll:5},{m:"T4",hv:6,rev:65,lead:11,trial:5,enroll:3},{m:"T5",hv:9,rev:72,lead:14,trial:7,enroll:5}];
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

  useEffect(() => { (async () => {
    setStu(await loadT("students", [])); setCls2(await loadT("classes", []));
    setFin(await loadT("finance", [])); setRpt(await loadT("reports", []));
    setLeads(await loadT("leads", [])); setInter(await loadT("interactions", []));
    setTrials(await loadT("trials", [])); setContracts(await loadT("contracts", []));
    setHsk(await loadT("hsk_exams", []));
    const su = localStorage.getItem("ht_user"); if (su) setUser(JSON.parse(su));
    setOk(true);
  })(); }, []);

  const uS = d => { setStu(d); saveT("students", d); };
  const uF = d => { setFin(d); saveT("finance", d); };
  const uR = d => { setRpt(d); saveT("reports", d); };
  const uL = d => { setLeads(d); saveT("leads", d); };
  const uI = d => { setInter(d); saveT("interactions", d); };
  const uTr = d => { setTrials(d); saveT("trials", d); };
  const uCt = d => { setContracts(d); saveT("contracts", d); };
  const uHk = d => { setHsk(d); saveT("hsk_exams", d); };

  const login = () => {
    const u = USERS.find(u => u.user === lu && u.pass === lp);
    if (u) { setUser(u); localStorage.setItem("ht_user", JSON.stringify(u)); setLe(""); }
    else setLe("Sai tài khoản");
  };
  const logout = () => { setUser(null); localStorage.removeItem("ht_user"); setPg("home"); };
  const isAdmin = user?.role === "admin";
  const canSee = c => isAdmin || user?.cls === "all" || (user?.cls || "").split(",").includes(c);

  if (!ok) return <div style={{display:"flex",height:"100vh",alignItems:"center",justifyContent:"center",fontFamily:"system-ui"}}>Đang tải dữ liệu từ Supabase...</div>;

  if (!user) return (
    <div style={{display:"flex",height:"100vh",alignItems:"center",justifyContent:"center",background:"linear-gradient(135deg,#f0fdf4,#ecfdf5)",fontFamily:"system-ui"}}>
      <div style={{background:"#fff",borderRadius:20,padding:36,width:360,boxShadow:"0 20px 60px rgba(0,0,0,.08)",textAlign:"center"}}>
        <div style={{width:56,height:56,borderRadius:14,background:"#16a34a",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:28,fontWeight:800,margin:"0 auto 10px"}}>漢</div>
        <h2 style={{fontSize:20,fontWeight:800,color:"#15803d",marginBottom:3}}>Hán Tinh Premium</h2>
        <p style={{color:"#9ca3af",fontSize:11,marginBottom:20}}>Hệ thống quản lý trung tâm tiếng Trung</p>
        <input style={{width:"100%",padding:"10px 14px",border:"1.5px solid #e5e7eb",borderRadius:9,fontSize:13,marginBottom:8,outline:"none",fontFamily:"inherit"}} placeholder="Tài khoản" value={lu} onChange={e=>setLu(e.target.value)} onKeyDown={e=>e.key==="Enter"&&login()} />
        <input style={{width:"100%",padding:"10px 14px",border:"1.5px solid #e5e7eb",borderRadius:9,fontSize:13,marginBottom:8,outline:"none",fontFamily:"inherit"}} placeholder="Mật khẩu" type="password" value={lp} onChange={e=>setLp(e.target.value)} onKeyDown={e=>e.key==="Enter"&&login()} />
        {le && <div style={{color:"#dc2626",fontSize:11,marginBottom:6}}>{le}</div>}
        <button onClick={login} style={{width:"100%",padding:11,background:"#16a34a",color:"#fff",border:"none",borderRadius:9,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit",marginBottom:14}}>Đăng nhập</button>
        <div style={{fontSize:10,color:"#9ca3af",textAlign:"left",background:"#f9fafb",borderRadius:7,padding:10,lineHeight:1.8}}>
          <strong>Demo:</strong> admin/admin · cohoa/123 · thaylong/123
        </div>
      </div>
    </div>
  );

  const act=stu.filter(s=>s.status==="Đang học"),ov=fin.filter(f=>f.st==="overdue"),pend=fin.filter(f=>f.st==="pending");
  const ranked=[...stu].filter(s=>s.status==="Đang học").sort((a,b)=>b.score-a.score);
  const teachers=[...new Set(cls2.map(c=>c.teacher))];
  const expiring=contracts.filter(c=>{const dl=daysLeft(c.end);return dl>0&&dl<=30});
  const expired=contracts.filter(c=>daysLeft(c.end)<=0&&c.status!=="renewed");
  const upTrials=trials.filter(t=>t.status==="scheduled");
  const needFU=trials.filter(t=>t.result==="thinking");
  const hskP=hsk.filter(h=>h.passed==="yes").length,hskT=hsk.filter(h=>h.status!=="registered").length;
  const hskRate=hskT>0?Math.round(hskP/hskT*100):0;
  const collected=fin.reduce((a,f)=>a+f.d1+(f.st==="paid"?f.d2:0),0);
  const srcData=["Facebook","TikTok","Giới thiệu","Walk-in","Website"].map(s=>({name:s,v:[...stu,...leads].filter(x=>x.source===s).length})).filter(d=>d.v>0);
  const funnelData=[{stage:"Hỏi thăm",v:leads.filter(l=>l.stage!=="lost").length},{stage:"Học thử",v:leads.filter(l=>l.stage==="trial"||l.stage==="registered").length+trials.filter(t=>t.status==="completed").length},{stage:"Đăng ký",v:leads.filter(l=>l.stage==="registered").length},{stage:"Đang học",v:act.length}];
  const payPie=[{n:"Đủ",v:fin.filter(f=>f.st==="paid").length},{n:"Chờ",v:pend.length},{n:"Nợ",v:ov.length}];
  const scoreDist=[{r:"<5",n:stu.filter(s=>s.score<5).length},{r:"5-6.5",n:stu.filter(s=>s.score>=5&&s.score<6.5).length},{r:"6.5-8",n:stu.filter(s=>s.score>=6.5&&s.score<8).length},{r:"8-9",n:stu.filter(s=>s.score>=8&&s.score<9).length},{r:"9-10",n:stu.filter(s=>s.score>=9).length}];

  const B=(t,c)=>{const m={g:["#dcfce7","#16a34a"],r:["#fef2f2","#dc2626"],y:["#fefce8","#ca8a04"],b:["#eff6ff","#2563eb"],gr:["#f3f4f6","#6b7280"],p:["#f3e8ff","#7c3aed"],o:["#fff7ed","#ea580c"]};const[bg,fg]=m[c]||m.gr;return<span style={{display:"inline-block",padding:"2px 8px",borderRadius:20,fontSize:9,fontWeight:700,background:bg,color:fg}}>{t}</span>};
  const md=modal?.d;const setMd=(k,v)=>setModal({...modal,d:{...modal.d,[k]:v}});
  const Fd=({label,children})=><div style={{flex:1,marginBottom:6}}><label style={{display:"block",fontSize:9,color:"#6b7280",fontWeight:600,marginBottom:2}}>{label}</label>{children}</div>;
  const Fl=({children})=><div style={{display:"flex",gap:6}}>{children}</div>;
  const CC=({title,children,h=150})=><div className="cd"><div style={{fontWeight:700,fontSize:11,marginBottom:8}}>{title}</div><ResponsiveContainer width="100%" height={h}>{children}</ResponsiveContainer></div>;

  const adminMenu=[{id:"home",l:"Tổng quan",i:"📊"},{id:"leads",l:"Lead Pipeline",i:"🎯"},{id:"trials",l:"Học thử",i:"📚"},{id:"stu",l:"Học viên",i:"👨‍🎓"},{id:"contracts",l:"Hợp đồng",i:"📄"},{id:"hsk",l:"Thi HSK",i:"🎓"},{id:"rpt",l:"Báo cáo GV",i:"📋"},{id:"log",l:"Lịch sử",i:"💬"},{id:"fin",l:"Tài chính",i:"💰"},{id:"charts",l:"Biểu đồ",i:"📈"}];
  const teacherMenu=[{id:"home",l:"Tổng quan",i:"📊"},{id:"stu",l:"Học viên",i:"👨‍🎓"},{id:"rpt",l:"Báo cáo",i:"📋"},{id:"hsk",l:"Thi HSK",i:"🎓"}];
  const menu=isAdmin?adminMenu:teacherMenu;

  return(<div style={{fontFamily:"system-ui,sans-serif",display:"flex",height:"100vh",background:"#f8faf8",color:"#1a1a1a",overflow:"hidden"}}>
    <style>{`*{box-sizing:border-box;margin:0;padding:0}::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:#d1d5db;border-radius:2px}.ni{display:flex;align-items:center;gap:6px;padding:7px 10px;border-radius:8px;cursor:pointer;font-size:11px;font-weight:500;color:#6b7280;transition:all .12s}.ni:hover{background:#f0fdf4;color:#16a34a}.ni.a{background:linear-gradient(135deg,#16a34a,#15803d);color:#fff;font-weight:700}.cd{background:#fff;border-radius:12px;padding:14px;box-shadow:0 1px 3px rgba(0,0,0,.05);border:1px solid #e5e7eb}.btn{display:inline-flex;align-items:center;gap:3px;padding:5px 10px;border-radius:7px;border:none;cursor:pointer;font-size:10px;font-weight:600;font-family:inherit}.btn-p{background:#16a34a;color:#fff}.btn-o{background:#fff;border:1.5px solid #d1d5db;color:#6b7280}.btn-sm{padding:3px 7px;font-size:9px}.inp{padding:6px 8px;border:1.5px solid #e5e7eb;border-radius:6px;font-size:11px;outline:none;width:100%;font-family:inherit;background:#fff}.inp:focus{border-color:#16a34a}select.inp{appearance:auto}textarea.inp{resize:vertical;min-height:35px}table{width:100%;border-collapse:collapse}th{padding:6px 8px;text-align:left;font-size:8px;font-weight:700;color:#9ca3af;text-transform:uppercase;background:#f9fafb;border-bottom:1px solid #e5e7eb}td{padding:6px 8px;font-size:11px;border-bottom:1px solid #f3f4f6}tr:hover td{background:#f0fdf4}.mbg{position:fixed;inset:0;background:rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;z-index:100}.mdl{background:#fff;border-radius:14px;padding:18px;width:440px;max-height:82vh;overflow-y:auto}.ib{cursor:pointer;padding:2px;border-radius:4px;border:none;background:none;color:#9ca3af;font-size:11px}.ib:hover{color:#16a34a}.pb{height:5px;background:#f3f4f6;border-radius:3px;overflow:hidden}.pf{height:100%;border-radius:3px}.tab{padding:4px 9px;border-radius:6px;cursor:pointer;font-size:10px;font-weight:600;color:#6b7280;border:none;background:none;font-family:inherit}.tab.a{background:#16a34a;color:#fff}.al{border-radius:7px;padding:8px;margin-bottom:4px;font-size:10px}.funnel-bar{height:28px;border-radius:6px;display:flex;align-items:center;padding:0 10px;color:#fff;font-weight:700;font-size:11px;margin-bottom:4px}`}</style>

    {/* SIDEBAR */}
    <div style={{width:160,background:"#fff",borderRight:"1px solid #e5e7eb",display:"flex",flexDirection:"column",flexShrink:0}}>
      <div style={{padding:"10px 8px",borderBottom:"1px solid #e5e7eb",display:"flex",alignItems:"center",gap:6}}>
        <div style={{width:24,height:24,borderRadius:6,background:"#16a34a",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:11,fontWeight:800}}>漢</div>
        <div style={{fontWeight:800,fontSize:11,color:"#15803d"}}>Hán Tinh</div>
      </div>
      <nav style={{padding:"4px 4px",flex:1}}>{menu.map(m=><div key={m.id} className={`ni ${pg===m.id?"a":""}`} onClick={()=>setPg(m.id)}>{m.i} {m.l}</div>)}</nav>
      <div style={{padding:"0 4px 6px",fontSize:9}}>
        {isAdmin&&upTrials.length>0&&<div className="al" style={{background:"#eff6ff",border:"1px solid #bfdbfe",color:"#2563eb",fontWeight:600,cursor:"pointer"}} onClick={()=>setPg("trials")}>📚 {upTrials.length} học thử</div>}
        {isAdmin&&(expiring.length+expired.length)>0&&<div className="al" style={{background:"#fefce8",border:"1px solid #fde68a",color:"#ca8a04",fontWeight:600,cursor:"pointer"}} onClick={()=>setPg("contracts")}>📄 {expiring.length+expired.length} HĐ</div>}
        {isAdmin&&ov.length>0&&<div className="al" style={{background:"#fef2f2",border:"1px solid #fecaca",color:"#dc2626",fontWeight:600,cursor:"pointer"}} onClick={()=>setPg("fin")}>⚠️ {ov.length} nợ HP</div>}
        <div style={{padding:"6px 4px",borderTop:"1px solid #e5e7eb",marginTop:4}}>
          <div style={{fontSize:10,fontWeight:700}}>{user.name}</div>
          <div style={{fontSize:8,color:"#9ca3af"}}>{isAdmin?"Admin":"Giáo viên"}</div>
          <button onClick={logout} style={{marginTop:3,fontSize:8,color:"#dc2626",background:"none",border:"none",cursor:"pointer",fontWeight:600}}>Đăng xuất</button>
        </div>
      </div>
    </div>

    {/* MAIN */}
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <div style={{background:"#fff",padding:"6px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid #e5e7eb",flexShrink:0}}>
        <input className="inp" placeholder="🔍 Tìm..." style={{width:180}} value={q} onChange={e=>setQ(e.target.value)} />
        <div style={{fontSize:9,color:"#9ca3af"}}>{user.name} · ☁️ Supabase</div>
      </div>

      <div style={{flex:1,overflow:"auto",padding:12}}>

        {/* DASHBOARD */}
        {pg==="home"&&<div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <h2 style={{fontSize:14,fontWeight:800}}><span style={{color:"#16a34a"}}>Hán Tinh</span> — {isAdmin?"Dashboard":"Xin chào "+user.name}</h2>
            {isAdmin&&<div style={{display:"flex",gap:2,background:"#f3f4f6",borderRadius:6,padding:2}}>
              {["kpi","funnel","trends"].map(t=><button key={t} className={`tab ${dtab===t?"a":""}`} onClick={()=>setDtab(t)}>{t==="kpi"?"KPI":t==="funnel"?"Funnel":"Xu hướng"}</button>)}
            </div>}
          </div>
          <div style={{display:"grid",gridTemplateColumns:isAdmin?"repeat(8,1fr)":"repeat(4,1fr)",gap:6,marginBottom:10}}>
            {(isAdmin?[{l:"Lead",v:leads.filter(l=>l.stage!=="lost").length,c:"#2563eb"},{l:"Học thử",v:upTrials.length,c:"#ea580c"},{l:"Học viên",v:act.length,c:"#16a34a"},{l:"HĐ cần XL",v:expiring.length+expired.length,c:"#ca8a04"},{l:"HSK đỗ",v:hskRate+"%",c:"#7c3aed"},{l:"Đã thu",v:vnd(collected),c:"#16a34a"},{l:"Nợ HP",v:ov.length,c:"#dc2626"},{l:"Follow",v:needFU.length,c:"#ea580c"}]
            :[{l:"HV lớp tôi",v:stu.filter(s=>canSee(s.cls)).length,c:"#16a34a"},{l:"Báo cáo",v:rpt.filter(r=>r.teacher===user.name).length,c:"#7c3aed"},{l:"Điểm TB",v:(stu.filter(s=>canSee(s.cls)&&s.status==="Đang học").reduce((a,s)=>a+s.score,0)/Math.max(stu.filter(s=>canSee(s.cls)&&s.status==="Đang học").length,1)).toFixed(1),c:"#2563eb"},{l:"CC",v:Math.round(stu.filter(s=>canSee(s.cls)&&s.status==="Đang học").reduce((a,s)=>a+s.attend,0)/Math.max(stu.filter(s=>canSee(s.cls)&&s.status==="Đang học").length,1))+"%",c:"#0d9488"}]).map((s,i)=>
              <div key={i} className="cd" style={{textAlign:"center",padding:8}}><div style={{fontSize:16,fontWeight:800,color:s.c}}>{s.v}</div><div style={{fontSize:8,color:"#9ca3af"}}>{s.l}</div></div>)}
          </div>
          {dtab==="kpi"&&isAdmin&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8}}>
            <div className="cd"><div style={{fontWeight:700,fontSize:10,color:"#ea580c",marginBottom:6}}>📚 Học thử</div>{upTrials.length===0?<div style={{color:"#9ca3af",fontSize:9}}>Không có</div>:upTrials.map(t=><div key={t.id} style={{fontSize:9,padding:"3px 0",borderBottom:"1px solid #f3f4f6"}}><strong>{t.name}</strong> · {t.date}</div>)}</div>
            <div className="cd"><div style={{fontWeight:700,fontSize:10,color:"#ca8a04",marginBottom:6}}>📄 HĐ sắp hết</div>{[...expiring,...expired].slice(0,3).map(c=><div key={c.id} style={{fontSize:9,padding:"3px 0",borderBottom:"1px solid #f3f4f6"}}><strong>{c.name}</strong> · <span style={{color:daysLeft(c.end)<=0?"#dc2626":"#ca8a04"}}>{daysLeft(c.end)<=0?"Hết hạn":daysLeft(c.end)+"d"}</span></div>)}</div>
            <div className="cd"><div style={{fontWeight:700,fontSize:10,color:"#dc2626",marginBottom:6}}>⚠️ Nợ HP</div>{ov.map(f=><div key={f.id} style={{fontSize:9,padding:"3px 0"}}><strong>{f.name}</strong> · <span style={{color:"#dc2626"}}>{vnd(f.d2)}</span></div>)}{ov.length===0&&<div style={{color:"#9ca3af",fontSize:9}}>OK ✅</div>}</div>
            <div className="cd"><div style={{fontWeight:700,fontSize:10,color:"#16a34a",marginBottom:6}}>🏆 Top 3</div>{ranked.slice(0,3).map((s,i)=><div key={s.id} style={{display:"flex",justifyContent:"space-between",fontSize:10,padding:"3px 0"}}><span>{["🥇","🥈","🥉"][i]} {s.name}</span><strong style={{color:"#16a34a"}}>{s.score}</strong></div>)}</div>
          </div>}
          {dtab==="funnel"&&isAdmin&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <div className="cd"><div style={{fontWeight:700,fontSize:11,marginBottom:10}}>🎯 Lead Funnel</div>{funnelData.map((f,i)=><div key={f.stage} className="funnel-bar" style={{width:Math.max((f.v/Math.max(funnelData[0].v,1))*100,20)+"%",background:CL[i]}}>{f.stage}: {f.v}</div>)}</div>
            <CC title="📊 Nguồn HV"><PieChart><Pie data={srcData} cx="50%" cy="50%" innerRadius={25} outerRadius={50} dataKey="v" label={({name,v})=>name.slice(0,4)+":"+v} fontSize={8}>{srcData.map((e,i)=><Cell key={i} fill={CL[i]}/>)}</Pie><Tooltip/></PieChart></CC>
            <CC title="💳 Thanh toán"><PieChart><Pie data={payPie} cx="50%" cy="50%" innerRadius={25} outerRadius={50} dataKey="v" label={({n,v})=>n+":"+v} fontSize={8}>{payPie.map((e,i)=><Cell key={i} fill={[CL[0],CL[3],CL[4]][i]}/>)}</Pie><Tooltip/></PieChart></CC>
            <div className="cd"><div style={{fontWeight:700,fontSize:11,marginBottom:6}}>🎓 HSK</div><div style={{textAlign:"center"}}><div style={{fontSize:36,fontWeight:800,color:hskRate>=70?"#16a34a":"#ca8a04"}}>{hskRate}%</div><div style={{fontSize:9,color:"#9ca3af"}}>{hskP}/{hskT} đạt</div><div className="pb" style={{marginTop:6}}><div className="pf" style={{width:hskRate+"%",background:hskRate>=70?"#16a34a":"#ca8a04"}}/></div></div></div>
          </div>}
          {dtab==="trends"&&isAdmin&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <CC title="📈 Doanh thu & HV mới" h={170}><BarChart data={monthTrend}><CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/><XAxis dataKey="m" fontSize={9}/><YAxis fontSize={9}/><Tooltip/><Bar dataKey="rev" name="DT(tr)" fill="#16a34a" radius={[3,3,0,0]}/><Bar dataKey="hv" name="HV mới" fill="#2563eb" radius={[3,3,0,0]}/></BarChart></CC>
            <CC title="🎯 Lead→Trial→Enroll" h={170}><AreaChart data={monthTrend}><CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/><XAxis dataKey="m" fontSize={9}/><YAxis fontSize={9}/><Tooltip/><Area type="monotone" dataKey="lead" stroke="#2563eb" fill="#eff6ff"/><Area type="monotone" dataKey="trial" stroke="#ea580c" fill="#fff7ed"/><Area type="monotone" dataKey="enroll" stroke="#16a34a" fill="#f0fdf4"/></AreaChart></CC>
            <CC title="📊 Chuyên cần (%)" h={170}><LineChart data={attendTrend}><CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/><XAxis dataKey="w" fontSize={9}/><YAxis domain={[80,100]} fontSize={9}/><Tooltip/><Line type="monotone" dataKey="v" stroke="#16a34a" strokeWidth={2} dot={{fill:"#16a34a",r:3}}/></LineChart></CC>
            <CC title="🎯 Phân bố điểm" h={170}><BarChart data={scoreDist}><CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/><XAxis dataKey="r" fontSize={9}/><YAxis fontSize={9}/><Tooltip/><Bar dataKey="n" fill="#0d9488" radius={[3,3,0,0]}/></BarChart></CC>
          </div>}
        </div>}

        {/* LEADS */}
        {pg==="leads"&&isAdmin&&<div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}><h2 style={{fontSize:14,fontWeight:800}}>🎯 Lead Pipeline</h2><button className="btn btn-p" onClick={()=>setModal({t:"l",d:{id:"LD"+String(leads.length+1).padStart(3,"0"),name:"",phone:"",source:"Facebook",stage:"inquiry",interest:"HSK 1",note:"",created:today,lastContact:today},n:1})}>+ Lead</button></div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,marginBottom:8}}>
            {[{s:"inquiry",l:"Hỏi thăm",c:"#2563eb"},{s:"trial",l:"Học thử",c:"#ea580c"},{s:"registered",l:"Đã ĐK",c:"#16a34a"},{s:"lost",l:"Mất",c:"#6b7280"}].map(p=><div key={p.s} style={{textAlign:"center",padding:8,borderRadius:7,background:"#f9fafb",fontWeight:700,fontSize:10,color:p.c}}><div style={{fontSize:18}}>{leads.filter(l=>l.stage===p.s).length}</div>{p.l}</div>)}
          </div>
          <div className="cd" style={{padding:0}}><table><thead><tr>{["Tên","Nguồn","QT","GĐ","Note",""].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{leads.map(l=><tr key={l.id}>
            <td><div style={{fontWeight:600}}>{l.name}</div><div style={{color:"#9ca3af",fontSize:9}}>{l.phone}</div></td>
            <td>{B(l.source,{Facebook:"b",TikTok:"p","Giới thiệu":"g","Walk-in":"o",Website:"y"}[l.source]||"gr")}</td>
            <td>{B(l.interest,"b")}</td><td>{{inquiry:B("Hỏi","b"),trial:B("Thử","o"),registered:B("ĐK","g"),lost:B("Mất","gr")}[l.stage]}</td>
            <td style={{color:"#9ca3af",fontSize:9}}>{l.note}</td>
            <td><div style={{display:"flex",gap:1}}>
              {l.stage==="inquiry"&&<button className="btn btn-sm" style={{background:"#fff7ed",color:"#ea580c",border:"none"}} onClick={()=>uL(leads.map(x=>x.id===l.id?{...x,stage:"trial"}:x))}>→Thử</button>}
              {l.stage==="trial"&&<button className="btn btn-sm btn-p" onClick={()=>uL(leads.map(x=>x.id===l.id?{...x,stage:"registered"}:x))}>→ĐK</button>}
              <button className="ib" onClick={()=>setModal({t:"l",d:{...l},n:0})}>✏️</button>
            </div></td></tr>)}</tbody></table></div>
        </div>}

        {/* TRIALS */}
        {pg==="trials"&&isAdmin&&<div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}><h2 style={{fontSize:14,fontWeight:800}}>📚 Học thử</h2><button className="btn btn-p" onClick={()=>setModal({t:"tr",d:{id:"TL"+String(trials.length+1).padStart(3,"0"),name:"",phone:"",source:"Facebook",date:today,time:"18:00",cls:"CN-A1",teacher:teachers[0]||"",status:"scheduled",result:"",followUp:"",note:""},n:1})}>+ Xếp lịch</button></div>
          {needFU.length>0&&<div className="al" style={{background:"#fff7ed",border:"1px solid #fed7aa",color:"#ea580c",fontWeight:600}}>🔔 Follow: {needFU.map(t=>t.name).join(", ")}</div>}
          <div className="cd" style={{padding:0}}><table><thead><tr>{["Tên","Ngày","Lớp","TT","KQ","FU",""].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{trials.map(t=><tr key={t.id}>
            <td><div style={{fontWeight:600}}>{t.name}</div><div style={{color:"#9ca3af",fontSize:9}}>{t.source}</div></td>
            <td style={{fontSize:10}}>{t.date} {t.time}</td><td>{t.cls}</td>
            <td>{{scheduled:B("Xếp","b"),completed:B("Xong","g"),"no-show":B("KĐ","r")}[t.status]||B(t.status,"gr")}</td>
            <td>{t.result?{enrolled:B("ĐK","g"),thinking:B("Nghĩ","y"),"not-interested":B("KQT","gr")}[t.result]||"—":"—"}</td>
            <td style={{fontSize:9,color:t.followUp&&daysLeft(t.followUp)<=1?"#dc2626":"#9ca3af"}}>{t.followUp||"—"}</td>
            <td>{t.status==="scheduled"&&<button className="btn btn-sm btn-p" onClick={()=>uTr(trials.map(x=>x.id===t.id?{...x,status:"completed"}:x))}>✓</button>}<button className="ib" onClick={()=>setModal({t:"tr",d:{...t},n:0})}>✏️</button></td>
          </tr>)}</tbody></table></div>
        </div>}

        {/* STUDENTS */}
        {pg==="stu"&&<div>
          <h2 style={{fontSize:14,fontWeight:800,marginBottom:6}}>👨‍🎓 Học viên</h2>
          <div className="cd" style={{padding:0}}><table><thead><tr>{["#","HV","Level","Lớp","Điểm","CC","Nguồn","TT",""].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{stu.filter(s=>(!q||s.name.toLowerCase().includes(q.toLowerCase()))&&canSee(s.cls)).map((s,i)=><tr key={s.id}>
            <td style={{color:"#9ca3af"}}>{i+1}</td><td><div style={{fontWeight:600}}>{s.name}</div><div style={{color:"#9ca3af",fontSize:9}}>{s.phone}</div></td>
            <td>{B(s.level,"b")}</td><td>{s.cls}</td>
            <td style={{fontWeight:800,color:s.score>=8?"#16a34a":s.score>=6.5?"#ca8a04":"#dc2626"}}>{s.score}</td>
            <td style={{color:s.attend>=90?"#16a34a":"#ca8a04",fontSize:10}}>{s.attend}%</td><td>{B(s.source,"gr")}</td>
            <td>{B(s.status,s.status==="Đang học"?"g":s.status==="Tạm nghỉ"?"y":"gr")}</td>
            <td><button className="ib" onClick={()=>setModal({t:"s",d:{...s},n:0})}>✏️</button></td>
          </tr>)}</tbody></table></div>
        </div>}

        {/* CONTRACTS */}
        {pg==="contracts"&&isAdmin&&<div>
          <h2 style={{fontSize:14,fontWeight:800,marginBottom:6}}>📄 Hợp đồng</h2>
          <div className="cd" style={{padding:0}}><table><thead><tr>{["HV","Lớp","BĐ","KT","TH","Phí","TT","Còn",""].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{contracts.map(c=>{const dl=daysLeft(c.end);const rs=c.status==="renewed"?"renewed":dl<=0?"expired":dl<=30?"expiring":"active";return<tr key={c.id}>
            <td style={{fontWeight:600}}>{c.name}</td><td>{B(c.cls,"b")}</td><td style={{fontSize:9}}>{c.start}</td><td style={{fontSize:9}}>{c.end}</td><td>{c.duration}</td>
            <td style={{fontWeight:700,color:"#16a34a"}}>{vnd(c.fee)}</td>
            <td>{{active:B("OK","g"),expiring:B("Sắp hết","y"),expired:B("Hết","r"),renewed:B("Gia hạn","b")}[rs]}</td>
            <td style={{fontWeight:700,color:dl<=0?"#dc2626":dl<=30?"#ca8a04":"#16a34a",fontSize:10}}>{dl<=0?"Hết":dl+"d"}</td>
            <td>{rs!=="renewed"&&rs!=="active"&&<button className="btn btn-sm btn-p" onClick={()=>uCt(contracts.map(x=>x.id===c.id?{...x,status:"renewed"}:x))}>↻</button>}<button className="ib" onClick={()=>setModal({t:"ct",d:{...c},n:0})}>✏️</button></td>
          </tr>})}</tbody></table></div>
        </div>}

        {/* HSK */}
        {pg==="hsk"&&<div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}><h2 style={{fontSize:14,fontWeight:800}}>🎓 Thi HSK</h2><button className="btn btn-p" onClick={()=>setModal({t:"hk",d:{id:"HSK"+String(hsk.length+1).padStart(3,"0"),name:"",level:"HSK 1",examDate:"",score:0,passed:"",status:"registered"},n:1})}>+ ĐK</button></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
            <CC title="Kết quả" h={130}><BarChart data={["HSK 1","HSK 2","HSK 3","HSK 4","HSK 5"].map(l=>({l,p:hsk.filter(h=>h.level===l&&h.passed==="yes").length,f:hsk.filter(h=>h.level===l&&h.passed==="no").length}))}><XAxis dataKey="l" fontSize={8}/><YAxis fontSize={8}/><Tooltip/><Bar dataKey="p" name="Đạt" fill="#16a34a" stackId="a" radius={[3,3,0,0]}/><Bar dataKey="f" name="Trượt" fill="#dc2626" stackId="a" radius={[3,3,0,0]}/></BarChart></CC>
            <div className="cd" style={{textAlign:"center"}}><div style={{fontSize:11,fontWeight:700,marginBottom:4}}>Tỷ lệ đỗ</div><div style={{fontSize:40,fontWeight:800,color:hskRate>=70?"#16a34a":"#ca8a04"}}>{hskRate}%</div><div style={{fontSize:9,color:"#9ca3af"}}>{hskP}/{hskT} đạt</div><div className="pb" style={{marginTop:6}}><div className="pf" style={{width:hskRate+"%",background:hskRate>=70?"#16a34a":"#ca8a04"}}/></div></div>
          </div>
          <div className="cd" style={{padding:0}}><table><thead><tr>{["HV","Level","Ngày","Điểm","KQ",""].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{hsk.map(h=><tr key={h.id}>
            <td style={{fontWeight:600}}>{h.name}</td><td>{B(h.level,"p")}</td><td style={{fontSize:9}}>{h.examDate}</td>
            <td style={{fontWeight:700}}>{h.score||"—"}</td><td>{h.passed==="yes"?B("ĐẠT","g"):h.passed==="no"?B("Trượt","r"):"—"}</td>
            <td><button className="ib" onClick={()=>setModal({t:"hk",d:{...h},n:0})}>✏️</button></td>
          </tr>)}</tbody></table></div>
        </div>}

        {/* REPORTS */}
        {pg==="rpt"&&<div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}><h2 style={{fontSize:14,fontWeight:800}}>📋 Báo cáo GV</h2><button className="btn btn-p" onClick={()=>setModal({t:"r",d:{id:"RP"+String(rpt.length+1).padStart(3,"0"),date:today,teacher:isAdmin?(teachers[0]||""):user.name,cls:cls2[0]?.id||"",present:0,absent:0,absentNames:"",lesson:"",homework:"",flags:"",highlights:""},n:1})}>+ Tạo</button></div>
          {rpt.filter(r=>isAdmin||r.teacher===user.name).map(r=><div key={r.id} style={{border:"1px solid #e5e7eb",borderRadius:8,padding:10,marginBottom:5}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><div><strong style={{fontSize:10}}>{r.teacher}</strong> <span style={{color:"#9ca3af",fontSize:8}}>{r.cls} · {r.date}</span></div>{B(r.present+"/"+(r.present+r.absent),r.absent===0?"g":"y")}</div>
            <div style={{fontSize:9}}>📖 {r.lesson}</div>
            {r.flags&&<div style={{background:"#fef2f2",borderRadius:5,padding:4,marginTop:3,fontSize:9,color:"#dc2626"}}>⚠️ {r.flags}</div>}
            {r.highlights&&<div style={{background:"#f0fdf4",borderRadius:5,padding:4,marginTop:3,fontSize:9,color:"#16a34a"}}>⭐ {r.highlights}</div>}
          </div>)}
        </div>}

        {/* LOG */}
        {pg==="log"&&isAdmin&&<div>
          <h2 style={{fontSize:14,fontWeight:800,marginBottom:6}}>💬 Lịch sử</h2>
          {inter.map(it=><div key={it.id} style={{display:"flex",gap:6,padding:"6px 0",borderBottom:"1px solid #f3f4f6",fontSize:10}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:it.type==="call"?"#16a34a":"#2563eb",marginTop:4,flexShrink:0}}/>
            <div><strong>{it.refName}</strong> <span style={{color:"#9ca3af",fontSize:8}}>{it.date}</span> {B(it.type==="call"?"📞":"💬",it.type==="call"?"g":"b")}<div style={{color:"#374151",marginTop:1}}>{it.content}</div></div>
          </div>)}
        </div>}

        {/* FINANCE */}
        {pg==="fin"&&isAdmin&&<div>
          <h2 style={{fontSize:14,fontWeight:800,marginBottom:6}}>💰 Tài chính 50/50</h2>
          <div className="cd" style={{padding:0}}><table><thead><tr>{["HV","Lớp","Tổng","Đ1","Đ2","Hạn","TT",""].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{fin.map(f=><tr key={f.id}>
            <td style={{fontWeight:600}}>{f.name}</td><td>{B(f.cls,"b")}</td><td style={{fontWeight:700,color:"#16a34a"}}>{vnd(f.total)}</td><td>{vnd(f.d1)}</td><td style={{fontWeight:600}}>{vnd(f.d2)}</td>
            <td style={{color:f.st==="overdue"?"#dc2626":"#9ca3af",fontSize:9}}>{f.d2d}</td><td>{f.st==="paid"?B("OK","g"):f.st==="pending"?B("Chờ","y"):B("Nợ","r")}</td>
            <td>{f.st!=="paid"&&<button className="btn btn-p btn-sm" onClick={()=>uF(fin.map(x=>x.id===f.id?{...x,st:"paid"}:x))}>✓</button>}</td>
          </tr>)}</tbody></table></div>
        </div>}

        {/* CHARTS */}
        {pg==="charts"&&isAdmin&&<div>
          <h2 style={{fontSize:14,fontWeight:800,marginBottom:8}}>📈 Biểu đồ</h2>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <CC title="📊 Doanh thu" h={170}><BarChart data={monthTrend}><CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/><XAxis dataKey="m" fontSize={9}/><YAxis fontSize={9}/><Tooltip/><Bar dataKey="rev" fill="#16a34a" radius={[3,3,0,0]}/></BarChart></CC>
            <CC title="🎯 Funnel" h={170}><AreaChart data={monthTrend}><CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/><XAxis dataKey="m" fontSize={9}/><YAxis fontSize={9}/><Tooltip/><Area type="monotone" dataKey="lead" stroke="#2563eb" fill="#eff6ff"/><Area type="monotone" dataKey="enroll" stroke="#16a34a" fill="#f0fdf4"/></AreaChart></CC>
            <CC title="📊 Chuyên cần" h={170}><LineChart data={attendTrend}><CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/><XAxis dataKey="w" fontSize={9}/><YAxis domain={[80,100]} fontSize={9}/><Tooltip/><Line type="monotone" dataKey="v" stroke="#16a34a" strokeWidth={2} dot={{fill:"#16a34a",r:3}}/></LineChart></CC>
            <CC title="📊 Nguồn"><PieChart><Pie data={srcData} cx="50%" cy="50%" innerRadius={25} outerRadius={55} dataKey="v" label={({name,v})=>name.slice(0,5)+":"+v} fontSize={9}>{srcData.map((e,i)=><Cell key={i} fill={CL[i]}/>)}</Pie><Tooltip/></PieChart></CC>
          </div>
        </div>}
      </div>
    </div>

    {/* MODAL */}
    {modal&&<div className="mbg" onClick={()=>setModal(null)}><div className="mdl" onClick={e=>e.stopPropagation()}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
        <h3 style={{fontSize:12,fontWeight:700}}>{modal.n?"Thêm":"Sửa"} {{s:"Học viên",l:"Lead",tr:"Học thử",ct:"Hợp đồng",hk:"HSK",r:"Báo cáo",i:"Tương tác"}[modal.t]}</h3>
        <button className="ib" onClick={()=>setModal(null)}>✕</button>
      </div>

      {modal.t==="l"&&<div><Fl><Fd label="Tên"><input className="inp" value={md.name} onChange={e=>setMd("name",e.target.value)}/></Fd><Fd label="SĐT"><input className="inp" value={md.phone} onChange={e=>setMd("phone",e.target.value)}/></Fd></Fl><Fl><Fd label="Nguồn"><select className="inp" value={md.source} onChange={e=>setMd("source",e.target.value)}>{["Facebook","TikTok","Giới thiệu","Walk-in","Website"].map(o=><option key={o}>{o}</option>)}</select></Fd><Fd label="QT"><select className="inp" value={md.interest} onChange={e=>setMd("interest",e.target.value)}>{["HSK 1","HSK 2","HSK 3","HSK 4","HSK 5"].map(o=><option key={o}>{o}</option>)}</select></Fd></Fl><Fd label="GĐ"><select className="inp" value={md.stage} onChange={e=>setMd("stage",e.target.value)}>{[["inquiry","Hỏi"],["trial","Thử"],["registered","ĐK"],["lost","Mất"]].map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></Fd><Fd label="Note"><textarea className="inp" value={md.note} onChange={e=>setMd("note",e.target.value)}/></Fd></div>}

      {modal.t==="s"&&<div><Fl><Fd label="Tên"><input className="inp" value={md.name} onChange={e=>setMd("name",e.target.value)}/></Fd><Fd label="SĐT"><input className="inp" value={md.phone} onChange={e=>setMd("phone",e.target.value)}/></Fd></Fl><Fl><Fd label="Lớp"><select className="inp" value={md.cls} onChange={e=>setMd("cls",e.target.value)}>{cls2.map(c=><option key={c.id}>{c.id}</option>)}</select></Fd><Fd label="Level"><select className="inp" value={md.level} onChange={e=>setMd("level",e.target.value)}>{["HSK 1","HSK 2","HSK 3","HSK 4","HSK 5"].map(o=><option key={o}>{o}</option>)}</select></Fd></Fl><Fl><Fd label="Điểm"><input className="inp" type="number" value={md.score} onChange={e=>setMd("score",parseFloat(e.target.value)||0)}/></Fd><Fd label="CC%"><input className="inp" type="number" value={md.attend} onChange={e=>setMd("attend",parseFloat(e.target.value)||0)}/></Fd></Fl><Fl><Fd label="Nguồn"><select className="inp" value={md.source} onChange={e=>setMd("source",e.target.value)}>{["Facebook","TikTok","Giới thiệu","Walk-in","Website"].map(o=><option key={o}>{o}</option>)}</select></Fd><Fd label="TT"><select className="inp" value={md.status} onChange={e=>setMd("status",e.target.value)}>{["Đang học","Tạm nghỉ","Nghỉ học"].map(o=><option key={o}>{o}</option>)}</select></Fd></Fl></div>}

      {modal.t==="tr"&&<div><Fl><Fd label="Tên"><input className="inp" value={md.name} onChange={e=>setMd("name",e.target.value)}/></Fd><Fd label="SĐT"><input className="inp" value={md.phone} onChange={e=>setMd("phone",e.target.value)}/></Fd></Fl><Fl><Fd label="Ngày"><input className="inp" type="date" value={md.date} onChange={e=>setMd("date",e.target.value)}/></Fd><Fd label="Giờ"><input className="inp" value={md.time} onChange={e=>setMd("time",e.target.value)}/></Fd></Fl><Fl><Fd label="Lớp"><select className="inp" value={md.cls} onChange={e=>setMd("cls",e.target.value)}>{cls2.map(c=><option key={c.id}>{c.id}</option>)}</select></Fd><Fd label="GV"><select className="inp" value={md.teacher} onChange={e=>setMd("teacher",e.target.value)}>{teachers.map(t=><option key={t}>{t}</option>)}</select></Fd></Fl><Fl><Fd label="TT"><select className="inp" value={md.status} onChange={e=>setMd("status",e.target.value)}>{[["scheduled","Xếp"],["completed","Xong"],["no-show","KĐ"]].map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></Fd><Fd label="KQ"><select className="inp" value={md.result} onChange={e=>setMd("result",e.target.value)}><option value="">—</option>{[["enrolled","ĐK"],["thinking","Nghĩ"],["not-interested","KQT"]].map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></Fd></Fl><Fd label="Follow-up"><input className="inp" type="date" value={md.followUp} onChange={e=>setMd("followUp",e.target.value)}/></Fd></div>}

      {modal.t==="ct"&&<div><Fd label="HV"><input className="inp" value={md.name} onChange={e=>setMd("name",e.target.value)}/></Fd><Fl><Fd label="Lớp"><select className="inp" value={md.cls} onChange={e=>setMd("cls",e.target.value)}>{cls2.map(c=><option key={c.id}>{c.id}</option>)}</select></Fd><Fd label="TH"><select className="inp" value={md.duration} onChange={e=>setMd("duration",e.target.value)}>{["3 tháng","6 tháng","12 tháng"].map(o=><option key={o}>{o}</option>)}</select></Fd></Fl><Fl><Fd label="BĐ"><input className="inp" type="date" value={md.start} onChange={e=>setMd("start",e.target.value)}/></Fd><Fd label="KT"><input className="inp" type="date" value={md.end} onChange={e=>setMd("end",e.target.value)}/></Fd></Fl><Fd label="Phí"><input className="inp" type="number" value={md.fee} onChange={e=>setMd("fee",parseFloat(e.target.value)||0)}/></Fd></div>}

      {modal.t==="hk"&&<div><Fd label="HV"><input className="inp" value={md.name} onChange={e=>setMd("name",e.target.value)}/></Fd><Fl><Fd label="Level"><select className="inp" value={md.level} onChange={e=>setMd("level",e.target.value)}>{["HSK 1","HSK 2","HSK 3","HSK 4","HSK 5","HSK 6"].map(o=><option key={o}>{o}</option>)}</select></Fd><Fd label="Ngày thi"><input className="inp" type="date" value={md.examDate} onChange={e=>setMd("examDate",e.target.value)}/></Fd></Fl><Fl><Fd label="Điểm"><input className="inp" type="number" value={md.score} onChange={e=>setMd("score",parseFloat(e.target.value)||0)}/></Fd><Fd label="KQ"><select className="inp" value={md.passed} onChange={e=>{const v=e.target.value;setModal({...modal,d:{...md,passed:v,status:v==="yes"?"passed":v==="no"?"failed":"registered"}})}}><option value="">Chưa</option><option value="yes">ĐẠT</option><option value="no">Trượt</option></select></Fd></Fl></div>}

      {modal.t==="r"&&<div><Fl><Fd label="Ngày"><input className="inp" type="date" value={md.date} onChange={e=>setMd("date",e.target.value)}/></Fd><Fd label="GV"><select className="inp" value={md.teacher} onChange={e=>setMd("teacher",e.target.value)}>{teachers.map(t=><option key={t}>{t}</option>)}</select></Fd><Fd label="Lớp"><select className="inp" value={md.cls} onChange={e=>setMd("cls",e.target.value)}>{cls2.map(c=><option key={c.id}>{c.id}</option>)}</select></Fd></Fl><Fl><Fd label="Có mặt"><input className="inp" type="number" value={md.present} onChange={e=>setMd("present",parseInt(e.target.value)||0)}/></Fd><Fd label="Vắng"><input className="inp" type="number" value={md.absent} onChange={e=>setMd("absent",parseInt(e.target.value)||0)}/></Fd></Fl><Fd label="📖 Bài"><textarea className="inp" value={md.lesson} onChange={e=>setMd("lesson",e.target.value)}/></Fd><Fd label="⚠️ Chú ý"><textarea className="inp" value={md.flags} onChange={e=>setMd("flags",e.target.value)}/></Fd><Fd label="⭐ Nổi bật"><textarea className="inp" value={md.highlights} onChange={e=>setMd("highlights",e.target.value)}/></Fd></div>}

      <div style={{display:"flex",gap:6,marginTop:10}}>
        <button className="btn btn-p" style={{flex:1}} onClick={()=>{
          const d=modal.d;
          const map={s:[stu,uS],l:[leads,uL],tr:[trials,uTr],ct:[contracts,uCt],hk:[hsk,uHk],r:[rpt,uR],i:[inter,uI]};
          const[arr,setter]=map[modal.t]||[];
          if(arr&&setter){modal.n?setter(modal.t==="r"?[d,...arr]:[...arr,d]):setter(arr.map(x=>x.id===d.id?d:x))}
          setModal(null);
        }}>💾 Lưu</button>
        <button className="btn btn-o" onClick={()=>setModal(null)}>Huỷ</button>
      </div>
    </div></div>}
  </div>);
}
