import { useState, useEffect, useRef, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, AreaChart, Area } from "recharts";
import { supabase } from "./supabase";

// ── DB ──
const FM={leads:{lastContact:"last_contact"},reports:{absentNames:"absent_names"},interactions:{refName:"ref_name",by:"by_user"},trials:{date:"trial_date",time:"trial_time",followUp:"follow_up"},contracts:{start:"start_date",end:"end_date"},hsk_exams:{examDate:"exam_date"}};
function toDb(t,o){const m=FM[t];if(!m)return{...o};const r={};for(const[k,v]of Object.entries(o))r[m[k]||k]=v;return r}
function toApp(t,o){const m=FM[t];if(!m)return{...o};const rm={};for(const[k,v]of Object.entries(m))rm[v]=k;const r={};for(const[k,v]of Object.entries(o))r[rm[k]||k]=v;return r}
async function loadT(t){
  try{
    const{data,error}=await supabase.from(t).select("*");
    if(error) throw error;
    return(data||[]).map(r=>toApp(t,r));
  }catch(e){console.warn(`[${t}] load failed`,e);return[]}
}
async function addRow(t,row){const d=toDb(t,row);delete d.created_at;const{error}=await supabase.from(t).insert([d]);if(error)throw error}
async function updateRow(t,row){const d=toDb(t,row);delete d.created_at;const{error}=await supabase.from(t).update(d).eq("id",row.id);if(error)throw error}
async function deleteRow(t,id){const{error}=await supabase.from(t).delete().eq("id",id);if(error)throw error}

const vnd=n=>new Intl.NumberFormat("vi-VN").format(n)+"đ";
const today=new Date().toISOString().slice(0,10);
const CL=["#16a34a","#0d9488","#2563eb","#ca8a04","#dc2626","#7c3aed","#ea580c"];
const daysLeft=d=>{if(!d)return 0;const t=new Date(d).getTime();return Number.isFinite(t)?Math.ceil((t-Date.now())/86400000):0};

const USERS=[
  {user:"admin",pass:"hantinh2026",role:"admin",name:"Admin",cls:"all"},
  {user:"cohoa",pass:"gv2026",role:"teacher",name:"Cô Hoa",cls:"CN-A1"},
  {user:"thaylong",pass:"gv2026",role:"teacher",name:"Thầy Long",cls:"CN-A3,CN-B2"},
  {user:"cowang",pass:"gv2026",role:"teacher",name:"Cô Wang Li",cls:"CN-A2"},
  {user:"thaynam",pass:"gv2026",role:"teacher",name:"Thầy Nam",cls:"CN-B1"},
];
const monthTrend=[{m:"T12",rev:42,lead:8,enroll:2},{m:"T1",rev:48,lead:12,enroll:4},{m:"T2",rev:52,lead:10,enroll:3},{m:"T3",rev:58,lead:15,enroll:5},{m:"T4",rev:65,lead:11,enroll:3},{m:"T5",rev:72,lead:14,enroll:5}];
const attendTrend=[{w:"T1",v:88},{w:"T2",v:91},{w:"T3",v:85},{w:"T4",v:93},{w:"T5",v:90},{w:"T6",v:87},{w:"T7",v:92},{w:"T8",v:94}];

// ── MODAL (useRef = không lag) ──
function ModalForm({type,initial,isNew,onSave,onClose,cls2,teachers,isAdmin,userName,mob}){
  const d=useRef({...initial});
  const IS={padding:mob?"10px 12px":"12px 16px",border:"1.5px solid #e5e7eb",borderRadius:10,fontSize:mob?15:16,outline:"none",width:"100%",fontFamily:"inherit",background:"#fff"};

  const F=({label,k,type:t})=><div style={{flex:1,marginBottom:mob?10:14}}>
    <label style={{display:"block",fontSize:mob?13:14,color:"#374151",fontWeight:600,marginBottom:4}}>{label}</label>
    {t==="textarea"?<textarea style={{...IS,minHeight:mob?50:60,resize:"vertical"}} defaultValue={d.current[k]||""} onChange={e=>{d.current[k]=e.target.value}}/>
    :t==="date"?<input style={IS} type="date" defaultValue={d.current[k]||""} onChange={e=>{d.current[k]=e.target.value}}/>
    :t==="number"?<input style={IS} type="number" defaultValue={d.current[k]||0} onChange={e=>{d.current[k]=parseFloat(e.target.value)||0}}/>
    :<input style={IS} defaultValue={d.current[k]||""} onChange={e=>{d.current[k]=e.target.value}}/>}
  </div>;

  const S=({label,k,opts})=><div style={{flex:1,marginBottom:mob?10:14}}>
    <label style={{display:"block",fontSize:mob?13:14,color:"#374151",fontWeight:600,marginBottom:4}}>{label}</label>
    <select style={{...IS,appearance:"auto"}} defaultValue={d.current[k]||""} onChange={e=>{d.current[k]=e.target.value}}>
      {opts.map(o=>Array.isArray(o)?<option key={o[0]} value={o[0]}>{o[1]}</option>:<option key={o}>{o}</option>)}
    </select>
  </div>;

  const Fl=({children})=><div style={{display:"flex",gap:mob?6:10,flexDirection:mob?"column":"row"}}>{children}</div>;
  const sources=["Facebook","TikTok","Giới thiệu","Walk-in","Website"];
  const levels=["HSK 1","HSK 2","HSK 3","HSK 4","HSK 5","HSK 6"];

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.35)",display:"flex",alignItems:mob?"flex-end":"center",justifyContent:"center",zIndex:100}} onClick={onClose}>
      <div style={{background:"#fff",borderRadius:mob?"20px 20px 0 0":"20px",padding:mob?20:30,width:mob?"100%":"540px",maxHeight:mob?"92vh":"88vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:mob?14:20}}>
          <h3 style={{fontSize:mob?18:20,fontWeight:700}}>{isNew?"Thêm":"Sửa"} {{s:"Học viên",l:"Khách tiềm năng",tr:"Học thử",ct:"Hợp đồng",hk:"Thi HSK",r:"Báo cáo buổi học",i:"Ghi nhận tương tác",f:"Học phí"}[type]}</h3>
          <button style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#9ca3af"}} onClick={onClose}>✕</button>
        </div>

        {type==="l"&&<><Fl><F label="Họ tên" k="name"/><F label="Số điện thoại" k="phone"/></Fl><Fl><S label="Nguồn" k="source" opts={sources}/><S label="Quan tâm" k="interest" opts={levels.slice(0,5)}/></Fl><S label="Giai đoạn" k="stage" opts={[["inquiry","Hỏi thăm"],["trial","Học thử"],["registered","Đã đăng ký"],["lost","Mất"]]}/><F label="Ghi chú" k="note" type="textarea"/></>}
        {type==="s"&&<><Fl><F label="Họ tên" k="name"/><F label="Số điện thoại" k="phone"/></Fl><Fl><S label="Lớp" k="cls" opts={cls2.map(c=>c.id)}/><S label="Trình độ" k="level" opts={levels}/></Fl><Fl><F label="Điểm TB" k="score" type="number"/><F label="Chuyên cần %" k="attend" type="number"/></Fl><Fl><S label="Nguồn" k="source" opts={sources}/><S label="Trạng thái" k="status" opts={["Đang học","Tạm nghỉ","Nghỉ học"]}/></Fl></>}
        {type==="tr"&&<><Fl><F label="Họ tên" k="name"/><F label="SĐT" k="phone"/></Fl><Fl><F label="Ngày" k="date" type="date"/><F label="Giờ" k="time"/></Fl><Fl><S label="Lớp" k="cls" opts={cls2.map(c=>c.id)}/><S label="Giáo viên" k="teacher" opts={teachers}/></Fl><Fl><S label="Trạng thái" k="status" opts={[["scheduled","Đã xếp"],["completed","Đã học"],["no-show","Không đến"]]}/><S label="Kết quả" k="result" opts={[["","Chưa có"],["enrolled","Đã ĐK"],["thinking","Suy nghĩ"],["not-interested","Không QT"]]}/></Fl><F label="Ngày nhắc lại" k="followUp" type="date"/></>}
        {type==="ct"&&<><F label="Học viên" k="name"/><Fl><S label="Lớp" k="cls" opts={cls2.map(c=>c.id)}/><S label="Thời hạn" k="duration" opts={["3 tháng","6 tháng","12 tháng","18 tháng"]}/></Fl><Fl><F label="Ngày bắt đầu" k="start" type="date"/><F label="Ngày kết thúc" k="end" type="date"/></Fl><F label="Học phí" k="fee" type="number"/></>}
        {type==="hk"&&<><F label="Học viên" k="name"/><Fl><S label="Trình độ" k="level" opts={levels}/><F label="Ngày thi" k="examDate" type="date"/></Fl><Fl><F label="Điểm" k="score" type="number"/><S label="Kết quả" k="passed" opts={[["","Chưa thi"],["yes","ĐẠT"],["no","Chưa đạt"]]}/></Fl></>}
        {type==="r"&&<><Fl><F label="Ngày" k="date" type="date"/>{isAdmin?<S label="Giáo viên" k="teacher" opts={teachers}/>:<div style={{flex:1,marginBottom:14}}><label style={{display:"block",fontSize:14,color:"#374151",fontWeight:600,marginBottom:4}}>Giáo viên</label><input style={{...IS,background:"#f3f4f6"}} value={userName} disabled/></div>}<S label="Lớp" k="cls" opts={cls2.map(c=>c.id)}/></Fl><Fl><F label="Có mặt" k="present" type="number"/><F label="Vắng" k="absent" type="number"/></Fl><F label="HV vắng" k="absentNames"/><F label="📖 Bài học" k="lesson" type="textarea"/><F label="📝 BTVN" k="homework" type="textarea"/><F label="⚠️ Cần chú ý" k="flags" type="textarea"/><F label="⭐ Nổi bật" k="highlights" type="textarea"/></>}
        {type==="i"&&<><Fl><F label="Người liên quan" k="refName"/><F label="Ngày" k="date" type="date"/></Fl><Fl><S label="Hình thức" k="type" opts={[["call","📞 Gọi điện"],["message","💬 Tin nhắn"],["meeting","🤝 Gặp mặt"]]}/><F label="Người thực hiện" k="by"/></Fl><F label="Nội dung" k="content" type="textarea"/></>}
        {type==="f"&&<><div style={{background:"#f0fdf4",borderRadius:10,padding:12,marginBottom:14,fontSize:14,color:"#16a34a",fontWeight:600,border:"1px solid #bbf7d0"}}>Đợt 1: 50% trước khoá → Đợt 2: 50% sau 1 tháng</div><F label="Họ tên" k="name"/><Fl><S label="Lớp" k="cls" opts={cls2.map(c=>c.id)}/><F label="Tổng học phí" k="total" type="number"/></Fl><Fl><F label="Hạn đợt 2" k="d2d"/><S label="Trạng thái" k="st" opts={[["paid","Đã đóng"],["pending","Chờ đóng"],["overdue","Quá hạn"]]}/></Fl></>}

        <div style={{display:"flex",gap:10,marginTop:mob?16:22}}>
          <button style={{flex:1,padding:mob?12:14,background:"#16a34a",color:"#fff",border:"none",borderRadius:12,fontSize:mob?16:17,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}} onClick={()=>{
            const data={...d.current};
            if(type==="f"&&data.total){data.d1=Math.round(data.total/2);data.d2=Math.round(data.total/2)}
            if(type==="hk"){data.status=data.passed==="yes"?"passed":data.passed==="no"?"failed":"registered"}
            onSave(data);
          }}>💾 Lưu</button>
          <button style={{padding:mob?"12px 20px":"14px 28px",background:"#fff",border:"1.5px solid #d1d5db",borderRadius:12,fontSize:mob?16:17,color:"#6b7280",cursor:"pointer",fontFamily:"inherit"}} onClick={onClose}>Huỷ</button>
        </div>
      </div>
    </div>
  );
}

// ── APP ──
export default function App(){
  const[user,setUser]=useState(null);const[lu,setLu]=useState("");const[lp,setLp]=useState("");const[le,setLe]=useState("");
  const[pg,setPg]=useState("home");const[mob,setMob]=useState(typeof window!=="undefined"&&window.innerWidth<768);
  const[stu,setStu]=useState([]);const[cls2,setCls2]=useState([]);const[fin,setFin]=useState([]);
  const[rpt,setRpt]=useState([]);const[leads,setLeads]=useState([]);const[inter,setInter]=useState([]);
  const[trials,setTrials]=useState([]);const[contracts,setContracts]=useState([]);const[hsk,setHsk]=useState([]);
  const[modal,setModal]=useState(null);const[q,setQ]=useState("");const[dtab,setDtab]=useState("kpi");const[ok,setOk]=useState(false);
  const[showMenu,setShowMenu]=useState(false);const[saveErr,setSaveErr]=useState("");

  useEffect(()=>{
    let raf=0;
    const h=()=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>setMob(window.innerWidth<768))};
    window.addEventListener("resize",h,{passive:true});
    return()=>{cancelAnimationFrame(raf);window.removeEventListener("resize",h)};
  },[]);

  useEffect(()=>{(async()=>{
    const [students,classes,finance,reports,leadRows,interactions,trialRows,contractRows,hskRows]=await Promise.all([
      loadT("students"),loadT("classes"),loadT("finance"),loadT("reports"),loadT("leads"),loadT("interactions"),loadT("trials"),loadT("contracts"),loadT("hsk_exams")
    ]);
    setStu(students);setCls2(classes);setFin(finance);setRpt(reports);setLeads(leadRows);setInter(interactions);setTrials(trialRows);setContracts(contractRows);setHsk(hskRows);
    const su=localStorage.getItem("ht_user");if(su)setUser(JSON.parse(su));setOk(true);
  })()},[]);

  const tbl={s:"students",l:"leads",tr:"trials",ct:"contracts",hk:"hsk_exams",r:"reports",i:"interactions",f:"finance"};
  const stx={s:[stu,setStu],l:[leads,setLeads],tr:[trials,setTrials],ct:[contracts,setContracts],hk:[hsk,setHsk],r:[rpt,setRpt],i:[inter,setInter],f:[fin,setFin]};
  const doSave=async(type,data,isNew)=>{setSaveErr("");const[arr,setter]=stx[type];const prev=arr;try{if(isNew){setter(type==="r"||type==="i"?[data,...arr]:[...arr,data]);await addRow(tbl[type],data)}else{setter(arr.map(x=>x.id===data.id?data:x));await updateRow(tbl[type],data)}}catch(e){setter(prev);setSaveErr("Không lưu được dữ liệu. Kiểm tra Supabase/RLS/schema rồi thử lại.");console.error(e)}};
  const doDel=async(type,id)=>{setSaveErr("");const[arr,setter]=stx[type];const prev=arr;try{setter(arr.filter(x=>x.id!==id));await deleteRow(tbl[type],id)}catch(e){setter(prev);setSaveErr("Không xoá được dữ liệu. Kiểm tra Supabase/RLS/schema rồi thử lại.");console.error(e)}};

  const login=()=>{const u=USERS.find(u=>u.user===lu&&u.pass===lp);if(u){setUser(u);localStorage.setItem("ht_user",JSON.stringify(u));setLe("")}else setLe("Sai tài khoản hoặc mật khẩu")};
  const logout=()=>{setUser(null);localStorage.removeItem("ht_user");setPg("home")};
  const isAdmin=user?.role==="admin";
  const canSee=c=>isAdmin||(user?.cls||"").split(",").includes(c);

  if(!ok)return<div style={{display:"flex",height:"100vh",alignItems:"center",justifyContent:"center",fontFamily:"system-ui",fontSize:18}}>Đang kết nối...</div>;

  // ── ĐĂNG NHẬP · TECH HERO ──
  if(!user)return(
    <div className="login-shell" style={{fontFamily:"Inter, ui-sans-serif, system-ui, sans-serif",padding:mob?18:0}}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}::-webkit-scrollbar{width:6px;height:6px}::-webkit-scrollbar-thumb{background:rgba(148,163,184,.38);border-radius:999px}
        .app-shell{position:relative;background:#05070b}
        .app-shell:before{content:"";position:fixed;inset:0;pointer-events:none;background:radial-gradient(circle at 18% 4%,rgba(122,240,191,.16),transparent 32%),radial-gradient(circle at 70% 0%,rgba(56,189,248,.10),transparent 28%),linear-gradient(rgba(255,255,255,.018) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.018) 1px,transparent 1px);background-size:auto,auto,54px 54px,54px 54px}
        .ni{display:flex;align-items:center;gap:10px;padding:11px 14px;border-radius:14px;cursor:pointer;font-size:14px;font-weight:650;color:#94a3b8;transition:all .16s;border:1px solid transparent}
        .ni:hover{background:rgba(255,255,255,.055);color:#f8fafc;border-color:rgba(255,255,255,.08)}.ni.a{background:linear-gradient(135deg,rgba(122,240,191,.20),rgba(34,211,238,.10));color:#f8fafc;font-weight:800;border-color:rgba(122,240,191,.24);box-shadow:0 12px 32px rgba(0,0,0,.18)}
        .cd{background:linear-gradient(180deg,rgba(255,255,255,.078),rgba(255,255,255,.035));border-radius:22px;padding:${mob?14:20}px;box-shadow:0 20px 70px rgba(0,0,0,.22);border:1px solid rgba(255,255,255,.105);backdrop-filter:blur(18px);color:#e5e7eb}
        .cd strong{color:#f8fafc}.btn{display:inline-flex;align-items:center;gap:6px;padding:10px 20px;border-radius:14px;border:1px solid rgba(255,255,255,.10);cursor:pointer;font-size:14px;font-weight:750;font-family:inherit;transition:.16s}
        .btn-p{background:linear-gradient(135deg,#ecfff6,#7af0bf 45%,#22d3ee);color:#04110b;border:none;box-shadow:0 14px 36px rgba(122,240,191,.15)}.btn-sm{padding:7px 13px;font-size:13px}
        .tbl-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch;border-radius:22px}table{width:100%;border-collapse:collapse;min-width:${mob?"600px":"auto"}}
        th{padding:${mob?"10px":"13px 16px"};text-align:left;font-size:${mob?11:12}px;font-weight:800;color:#64748b;text-transform:uppercase;background:rgba(255,255,255,.035);border-bottom:1px solid rgba(255,255,255,.075);white-space:nowrap;letter-spacing:.7px}
        td{padding:${mob?"10px":"13px 16px"};font-size:${mob?14:15}px;border-bottom:1px solid rgba(255,255,255,.055);white-space:nowrap;color:#cbd5e1}tr:hover td{background:rgba(122,240,191,.055)}
        .ib{cursor:pointer;padding:6px 8px;border-radius:10px;border:1px solid transparent;background:transparent;color:#94a3b8;font-size:16px}.ib:hover{color:#7af0bf;background:rgba(122,240,191,.08);border-color:rgba(122,240,191,.14)}
        .pb{height:8px;background:rgba(255,255,255,.08);border-radius:999px;overflow:hidden}.pf{height:100%;border-radius:999px}.tab{padding:8px 16px;border-radius:999px;cursor:pointer;font-size:13px;font-weight:750;color:#94a3b8;border:1px solid transparent;background:transparent;font-family:inherit}.tab.a{background:#f8fafc;color:#020617}
        .al{border-radius:16px;padding:12px;margin-bottom:8px;font-size:14px}.fb{height:38px;border-radius:12px;display:flex;align-items:center;padding:0 14px;color:#03120b;font-weight:850;font-size:14px;margin-bottom:8px}
        .bot-nav{display:flex;background:rgba(2,6,23,.92);border-top:1px solid rgba(255,255,255,.10);padding:6px 0;position:relative;backdrop-filter:blur(18px)}.bot-item{flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;padding:6px 0;cursor:pointer;font-size:10px;color:#94a3b8;font-weight:600}.bot-item.a{color:#7af0bf;font-weight:800}.bot-item span:first-child{font-size:20px}.more-menu{position:absolute;bottom:60px;right:8px;background:#071018;border:1px solid rgba(255,255,255,.12);border-radius:18px;box-shadow:0 18px 70px rgba(0,0,0,.5);padding:8px;width:200px;z-index:50}
      `}</style>
      <div className="login-card">
        <section className="hero-panel">
          <div>
            <div style={{display:"inline-flex",gap:8,alignItems:"center",padding:"7px 11px",border:"1px solid rgba(255,255,255,.12)",borderRadius:999,color:"#a7f3d0",fontSize:12,fontWeight:800,letterSpacing:1.6,textTransform:"uppercase",marginBottom:24}}>
              <span style={{width:7,height:7,borderRadius:999,background:"#7af0bf",boxShadow:"0 0 18px #7af0bf"}}/> Hanxing OS
            </div>
            <h1 style={{fontSize:mob?36:62,lineHeight:.94,letterSpacing:-2.4,fontWeight:850,maxWidth:640}}>Vận hành trung tâm bằng một lớp trí tuệ rõ ràng.</h1>
            <p style={{marginTop:18,color:"#94a3b8",fontSize:mob?15:18,lineHeight:1.65,maxWidth:560}}>Dashboard quản trị học viên, học thử, hợp đồng, HSK và tài chính — gọn, tối, hiện đại, giống một control room.</p>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,position:"relative",zIndex:1}}>
            {["Leads","Learning","Finance"].map((x,i)=><div key={x} style={{padding:14,border:"1px solid rgba(255,255,255,.10)",borderRadius:18,background:"rgba(2,6,23,.42)"}}><div style={{fontSize:20,fontWeight:850,color:i===0?"#7af0bf":i===1?"#e2e8f0":"#22d3ee"}}>{i===0?leads.length:i===1?stu.length:fin.length}</div><div style={{fontSize:12,color:"#64748b",marginTop:4}}>{x}</div></div>)}
          </div>
        </section>
        <section className="auth-panel">
          <div style={{width:58,height:58,borderRadius:18,background:"linear-gradient(135deg,#f8fafc,#7af0bf)",display:"flex",alignItems:"center",justifyContent:"center",color:"#03120b",fontSize:28,fontWeight:900,marginBottom:18}}>漢</div>
          <h2 style={{fontSize:mob?24:30,fontWeight:850,letterSpacing:-.8,marginBottom:6}}>Hán Tinh Premium</h2>
          <p style={{color:"#94a3b8",fontSize:15,lineHeight:1.55,marginBottom:24}}>Đăng nhập vào hệ thống vận hành.</p>
          <input className="tech-input" placeholder="Tài khoản" value={lu} onChange={e=>setLu(e.target.value)} onKeyDown={e=>e.key==="Enter"&&login()}/>
          <input className="tech-input" placeholder="Mật khẩu" type="password" value={lp} onChange={e=>setLp(e.target.value)} onKeyDown={e=>e.key==="Enter"&&login()}/>
          {le&&<div style={{color:"#fca5a5",fontSize:14,marginBottom:12}}>{le}</div>}
          <button className="tech-button" onClick={login}>Đăng nhập</button>
        </section>
      </div>
    </div>
  );

  // ── DỮ LIỆU ──
  const query=q.trim().toLowerCase();
  const {act,ov,pend,ranked,teachers,expiring,expired,upTrials,needFU,hskRate,collected,srcData,funnelData,payPie,scoreDist}=useMemo(()=>{
    const active=stu.filter(s=>s.status==="Đang học");
    const overdue=fin.filter(f=>f.st==="overdue");
    const pending=fin.filter(f=>f.st==="pending");
    const hskPassed=hsk.filter(h=>h.passed==="yes").length;
    const hskTested=hsk.filter(h=>h.status!=="registered").length;
    const sources=["Facebook","TikTok","Giới thiệu","Walk-in","Website"];
    return {
      act:active,
      ov:overdue,
      pend:pending,
      ranked:[...active].sort((a,b)=>(b.score||0)-(a.score||0)),
      teachers:[...new Set(cls2.map(c=>c.teacher).filter(Boolean))],
      expiring:contracts.filter(c=>{const dl=daysLeft(c.end);return dl>0&&dl<=30}),
      expired:contracts.filter(c=>daysLeft(c.end)<=0&&c.status!=="renewed"),
      upTrials:trials.filter(t=>t.status==="scheduled"),
      needFU:trials.filter(t=>t.result==="thinking"),
      hskRate:hskTested>0?Math.round(hskPassed/hskTested*100):0,
      collected:fin.reduce((a,f)=>a+(f.d1||0)+(f.st==="paid"?(f.d2||0):0),0),
      srcData:sources.map(s=>({name:s,v:[...stu,...leads].filter(x=>x.source===s).length})).filter(d=>d.v>0),
      funnelData:[{s:"Hỏi thăm",v:leads.filter(l=>l.stage!=="lost").length},{s:"Học thử",v:leads.filter(l=>l.stage==="trial"||l.stage==="registered").length},{s:"Đăng ký",v:leads.filter(l=>l.stage==="registered").length},{s:"Đang học",v:active.length}],
      payPie:[{n:"Đủ",v:fin.filter(f=>f.st==="paid").length},{n:"Chờ",v:pending.length},{n:"Nợ",v:overdue.length}],
      scoreDist:[{r:"<5",n:stu.filter(s=>(s.score||0)<5).length},{r:"5-6.5",n:stu.filter(s=>(s.score||0)>=5&&(s.score||0)<6.5).length},{r:"6.5-8",n:stu.filter(s=>(s.score||0)>=6.5&&(s.score||0)<8).length},{r:"8-9",n:stu.filter(s=>(s.score||0)>=8&&(s.score||0)<9).length},{r:"9+",n:stu.filter(s=>(s.score||0)>=9).length}]
    }
  },[stu,fin,cls2,contracts,trials,hsk,leads]);

  const B=(t,c)=>{const m={g:["#dcfce7","#16a34a"],r:["#fef2f2","#dc2626"],y:["#fefce8","#ca8a04"],b:["#eff6ff","#2563eb"],gr:["#f3f4f6","#6b7280"],p:["#f3e8ff","#7c3aed"],o:["#fff7ed","#ea580c"]};const[bg,fg]=m[c]||m.gr;return<span style={{display:"inline-block",padding:"4px 13px",borderRadius:20,fontSize:13,fontWeight:700,background:bg,color:fg}}>{t}</span>};
  const CC=({title,children,h=190})=><div className="cd"><div style={{fontWeight:700,fontSize:16,marginBottom:12}}>{title}</div><ResponsiveContainer width="100%" height={h}>{children}</ResponsiveContainer></div>;
  const om=(t,d,n)=>setModal({t,d,n});

  const adminMenu=[{id:"home",l:"Tổng quan",i:"📊"},{id:"leads",l:"Khách mới",i:"🎯"},{id:"trials",l:"Học thử",i:"📚"},{id:"stu",l:"Học viên",i:"👨‍🎓"},{id:"contracts",l:"Hợp đồng",i:"📄"},{id:"hsk",l:"HSK",i:"🎓"},{id:"rpt",l:"Báo cáo",i:"📋"},{id:"log",l:"Lịch sử",i:"💬"},{id:"fin",l:"Tài chính",i:"💰"},{id:"charts",l:"Biểu đồ",i:"📈"}];
  const teacherMenu=[{id:"home",l:"Tổng quan",i:"📊"},{id:"stu",l:"Học viên",i:"👨‍🎓"},{id:"rpt",l:"Báo cáo",i:"📋"},{id:"hsk",l:"HSK",i:"🎓"}];
  const menu=isAdmin?adminMenu:teacherMenu;

  // Mobile bottom nav - show only 5 main items
  const mobNav=isAdmin?[{id:"home",i:"📊",l:"Tổng quan"},{id:"leads",i:"🎯",l:"Khách"},{id:"stu",i:"👨‍🎓",l:"HV"},{id:"rpt",i:"📋",l:"Báo cáo"},{id:"more",i:"☰",l:"Thêm"}]
    :[{id:"home",i:"📊",l:"Tổng quan"},{id:"stu",i:"👨‍🎓",l:"HV"},{id:"rpt",i:"📋",l:"Báo cáo"},{id:"hsk",i:"🎓",l:"HSK"}];
  const moreMenu=adminMenu.filter(m=>!["home","leads","stu","rpt"].includes(m.id));

  const grd=(cols)=>mob?`repeat(${Math.min(cols,2)},1fr)`:`repeat(${cols},1fr)`;

  return(
    <div className="app-shell" style={{fontFamily:"Inter, ui-sans-serif, system-ui, sans-serif",display:"flex",flexDirection:mob?"column":"row",height:"100vh",background:"#05070b",color:"#e5e7eb",overflow:"hidden"}}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:#d1d5db;border-radius:3px}
        .ni{display:flex;align-items:center;gap:9px;padding:11px 14px;border-radius:10px;cursor:pointer;font-size:15px;font-weight:500;color:#6b7280;transition:all .12s}
        .ni:hover{background:#f0fdf4;color:#16a34a}.ni.a{background:linear-gradient(135deg,#16a34a,#15803d);color:#fff;font-weight:700}
        .cd{background:#fff;border-radius:16px;padding:${mob?14:20}px;box-shadow:0 1px 4px rgba(0,0,0,.06);border:1px solid #e5e7eb}
        .btn{display:inline-flex;align-items:center;gap:5px;padding:10px 20px;border-radius:10px;border:none;cursor:pointer;font-size:15px;font-weight:600;font-family:inherit}
        .btn-p{background:#16a34a;color:#fff}.btn-sm{padding:7px 14px;font-size:13px}
        .tbl-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch}
        table{width:100%;border-collapse:collapse;min-width:${mob?"600px":"auto"}}
        th{padding:${mob?"10px":"13px 16px"};text-align:left;font-size:${mob?11:13}px;font-weight:700;color:#9ca3af;text-transform:uppercase;background:#f9fafb;border-bottom:1px solid #e5e7eb;white-space:nowrap}
        td{padding:${mob?"10px":"13px 16px"};font-size:${mob?14:15}px;border-bottom:1px solid #f3f4f6;white-space:nowrap}
        tr:hover td{background:#f0fdf4}
        .ib{cursor:pointer;padding:6px 8px;border-radius:8px;border:none;background:none;color:#9ca3af;font-size:16px}.ib:hover{color:#16a34a;background:#f0fdf4}
        .pb{height:8px;background:#f3f4f6;border-radius:4px;overflow:hidden}.pf{height:100%;border-radius:4px}
        .tab{padding:8px 16px;border-radius:8px;cursor:pointer;font-size:14px;font-weight:600;color:#6b7280;border:none;background:none;font-family:inherit}.tab.a{background:#16a34a;color:#fff}
        .al{border-radius:10px;padding:12px;margin-bottom:8px;font-size:14px}
        .fb{height:38px;border-radius:8px;display:flex;align-items:center;padding:0 14px;color:#fff;font-weight:700;font-size:15px;margin-bottom:6px}
        .bot-nav{display:flex;background:#fff;border-top:1px solid #e5e7eb;padding:6px 0;position:relative}
        .bot-item{flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;padding:6px 0;cursor:pointer;font-size:10px;color:#6b7280;font-weight:500}
        .bot-item.a{color:#16a34a;font-weight:700}
        .bot-item span:first-child{font-size:20px}
        .more-menu{position:absolute;bottom:60px;right:8px;background:#fff;border-radius:14px;box-shadow:0 8px 30px rgba(0,0,0,.15);padding:8px;width:200px;z-index:50}
      `}</style>

      {/* SIDEBAR - chỉ hiện trên desktop */}
      {!mob&&<div style={{width:242,background:"rgba(2,6,23,.74)",borderRight:"1px solid rgba(255,255,255,.09)",display:"flex",flexDirection:"column",flexShrink:0,backdropFilter:"blur(24px)",position:"relative",zIndex:1}}>
        <div style={{padding:"18px 16px",borderBottom:"1px solid rgba(255,255,255,.08)",display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:40,height:40,borderRadius:14,background:"linear-gradient(135deg,#f8fafc,#7af0bf)",display:"flex",alignItems:"center",justifyContent:"center",color:"#03120b",fontSize:20,fontWeight:900,boxShadow:"0 0 36px rgba(122,240,191,.20)"}}>漢</div>
          <div><div style={{fontWeight:850,fontSize:17,color:"#f8fafc",letterSpacing:-.3}}>Hán Tinh</div><div style={{fontSize:10,color:"#7af0bf",fontWeight:850,letterSpacing:1.8}}>PREMIUM OS</div></div>
        </div>
        <nav style={{padding:"8px 6px",flex:1}}>{menu.map(m=><div key={m.id} className={`ni ${pg===m.id?"a":""}`} onClick={()=>setPg(m.id)}>{m.i} {m.l}</div>)}</nav>
        <div style={{padding:"0 8px 10px"}}>
          {isAdmin&&ov.length>0&&<div className="al" style={{background:"#fef2f2",border:"1px solid #fecaca",color:"#dc2626",fontWeight:600,cursor:"pointer"}} onClick={()=>setPg("fin")}>⚠️ {ov.length} nợ học phí</div>}
          <div style={{padding:"12px 10px",borderTop:"1px solid rgba(255,255,255,.08)",marginTop:6}}>
            <div style={{fontSize:15,fontWeight:700}}>{user.name}</div>
            <div style={{fontSize:13,color:"#9ca3af"}}>{isAdmin?"Quản trị viên":"Giáo viên"}</div>
            <button onClick={logout} style={{marginTop:5,fontSize:13,color:"#dc2626",background:"none",border:"none",cursor:"pointer",fontWeight:600}}>Đăng xuất</button>
          </div>
        </div>
      </div>}

      {/* NỘI DUNG */}
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        {/* TOPBAR */}
        <div style={{background:"rgba(2,6,23,.72)",padding:mob?"10px 12px":"14px 22px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid rgba(255,255,255,.08)",flexShrink:0,backdropFilter:"blur(18px)",position:"relative",zIndex:1}}>
          {mob?<div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:30,height:30,borderRadius:10,background:"linear-gradient(135deg,#f8fafc,#7af0bf)",display:"flex",alignItems:"center",justifyContent:"center",color:"#03120b",fontSize:14,fontWeight:900}}>漢</div><span style={{fontWeight:800,fontSize:15,color:"#f8fafc"}}>Hán Tinh</span></div>
          :<input style={{padding:"11px 16px",border:"1px solid rgba(255,255,255,.10)",borderRadius:999,fontSize:14,outline:"none",width:320,fontFamily:"inherit",background:"rgba(255,255,255,.055)",color:"#f8fafc"}} placeholder="Tìm kiếm trong hệ thống..." value={q} onChange={e=>setQ(e.target.value)}/>}
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            {mob&&ov.length>0&&<span style={{background:"#dc2626",color:"#fff",borderRadius:20,padding:"2px 8px",fontSize:11,fontWeight:700}} onClick={()=>setPg("fin")}>{ov.length} nợ</span>}
            {!mob&&<div style={{fontSize:14,color:"#9ca3af"}}>{user.name}</div>}
            {mob&&<button onClick={logout} style={{fontSize:12,color:"#dc2626",background:"none",border:"none",cursor:"pointer",fontWeight:600}}>Thoát</button>}
          </div>
        </div>

        {/* SEARCH on mobile */}
        {mob&&<div style={{padding:"10px 12px",background:"rgba(2,6,23,.72)",borderBottom:"1px solid rgba(255,255,255,.08)",backdropFilter:"blur(18px)"}}>
          <input style={{padding:"10px 14px",border:"1px solid rgba(255,255,255,.10)",borderRadius:999,fontSize:15,outline:"none",width:"100%",fontFamily:"inherit",background:"rgba(255,255,255,.055)",color:"#f8fafc"}} placeholder="Tìm kiếm..." value={q} onChange={e=>setQ(e.target.value)}/>
        </div>}

        <div style={{flex:1,overflow:"auto",padding:mob?14:24,position:"relative",zIndex:1}}>
          {saveErr&&<div className="al" style={{background:"#fef2f2",border:"1px solid #fecaca",color:"#dc2626",fontWeight:600,marginBottom:12}}>{saveErr}</div>}

          {/* TỔNG QUAN */}
          {pg==="home"&&<div>
            <div style={{border:"1px solid rgba(255,255,255,.10)",background:"linear-gradient(135deg,rgba(255,255,255,.09),rgba(122,240,191,.045) 52%,rgba(34,211,238,.035))",borderRadius:mob?24:32,padding:mob?20:30,marginBottom:18,boxShadow:"0 28px 90px rgba(0,0,0,.24)",position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",right:-80,top:-80,width:260,height:260,borderRadius:999,background:"rgba(122,240,191,.12)",filter:"blur(8px)"}}/>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:16,flexWrap:"wrap",position:"relative",zIndex:1}}>
                <div>
                  <div style={{display:"inline-flex",alignItems:"center",gap:8,padding:"6px 10px",borderRadius:999,border:"1px solid rgba(122,240,191,.22)",color:"#7af0bf",fontSize:12,fontWeight:850,letterSpacing:1.5,textTransform:"uppercase",marginBottom:14}}><span style={{width:7,height:7,borderRadius:999,background:"#7af0bf",boxShadow:"0 0 16px #7af0bf"}}/>Live Control Room</div>
                  <h2 style={{fontSize:mob?32:54,lineHeight:.96,letterSpacing:mob?-1.2:-2.4,fontWeight:900,color:"#f8fafc",maxWidth:760}}>Hán Tinh Operating System</h2>
                  <p style={{color:"#94a3b8",fontSize:mob?14:17,lineHeight:1.65,maxWidth:680,marginTop:12}}>Một màn hình để nhìn toàn bộ dòng chảy: khách mới → học thử → học viên → hợp đồng → HSK → tài chính.</p>
                </div>
              {isAdmin&&<div style={{display:"flex",gap:4,background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.08)",borderRadius:999,padding:4}}>
                {[["kpi","Chỉ số"],["funnel","Phễu"],["trends","Xu hướng"]].map(([id,l])=><button key={id} className={`tab ${dtab===id?"a":""}`} onClick={()=>setDtab(id)}>{l}</button>)}
              </div>}
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:grd(isAdmin?3:2),gap:mob?10:12,marginBottom:16}}>
              {(isAdmin?[{l:"Khách mới",v:leads.filter(l=>l.stage!=="lost").length,c:"#2563eb"},{l:"Học viên",v:act.length,c:"#16a34a"},{l:"Tỷ lệ đỗ HSK",v:hskRate+"%",c:"#7c3aed"},{l:"Đã thu",v:vnd(collected),c:"#16a34a"},{l:"Nợ học phí",v:ov.length,c:"#dc2626"},{l:"Cần nhắc",v:needFU.length,c:"#ea580c"}]
              :[{l:"HV lớp tôi",v:stu.filter(s=>canSee(s.cls)).length,c:"#16a34a"},{l:"Báo cáo",v:rpt.filter(r=>r.teacher===user.name).length,c:"#7c3aed"},{l:"Điểm TB",v:(stu.filter(s=>canSee(s.cls)&&s.status==="Đang học").reduce((a,s)=>a+s.score,0)/Math.max(stu.filter(s=>canSee(s.cls)&&s.status==="Đang học").length,1)).toFixed(1),c:"#2563eb"},{l:"Chuyên cần",v:Math.round(stu.filter(s=>canSee(s.cls)&&s.status==="Đang học").reduce((a,s)=>a+s.attend,0)/Math.max(stu.filter(s=>canSee(s.cls)&&s.status==="Đang học").length,1))+"%",c:"#0d9488"}]).map((s,i)=><div key={i} className="cd" style={{textAlign:"center",padding:mob?12:16}}><div style={{fontSize:mob?22:28,fontWeight:800,color:s.c}}>{s.v}</div><div style={{fontSize:mob?12:14,color:"#9ca3af",marginTop:3}}>{s.l}</div></div>)}
            </div>
            {dtab==="kpi"&&isAdmin&&<div style={{display:"grid",gridTemplateColumns:grd(3),gap:mob?8:12}}>
              <div className="cd"><div style={{fontWeight:700,fontSize:mob?15:17,color:"#dc2626",marginBottom:10}}>⚠️ Cần thu tiền</div>{ov.map(f=><div key={f.id} style={{padding:"8px 0",borderBottom:"1px solid #f3f4f6",display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><strong style={{fontSize:15}}>{f.name}</strong><br/><span style={{color:"#dc2626",fontSize:14}}>{vnd(f.d2)}</span></div><button className="btn btn-p btn-sm" onClick={()=>{setFin(fin.map(x=>x.id===f.id?{...x,st:"paid"}:x));updateRow("finance",{...f,st:"paid"})}}>✓</button></div>)}{ov.length===0&&<div style={{color:"#16a34a",fontSize:15}}>Tất cả OK ✅</div>}</div>
              <div className="cd"><div style={{fontWeight:700,fontSize:mob?15:17,color:"#16a34a",marginBottom:10}}>🏆 Xếp hạng</div>{ranked.slice(0,5).map((s,i)=><div key={s.id} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",fontSize:15}}><span>{["🥇","🥈","🥉","4.","5."][i]} {s.name}</span><strong style={{color:"#16a34a"}}>{s.score}</strong></div>)}</div>
              <div className="cd"><div style={{fontWeight:700,fontSize:mob?15:17,color:"#7c3aed",marginBottom:10}}>📋 Báo cáo mới</div>{rpt.slice(0,4).map(r=><div key={r.id} style={{padding:"6px 0",borderBottom:"1px solid #f3f4f6",fontSize:14}}><strong>{r.teacher}</strong> · {r.cls}<br/><span style={{color:"#9ca3af",fontSize:13}}>{r.date}</span></div>)}</div>
            </div>}
            {dtab==="funnel"&&isAdmin&&<div style={{display:"grid",gridTemplateColumns:grd(2),gap:12}}>
              <div className="cd"><div style={{fontWeight:700,fontSize:17,marginBottom:14}}>🎯 Phễu chuyển đổi</div>{funnelData.map((f,i)=><div key={f.s} className="fb" style={{width:Math.max((f.v/Math.max(funnelData[0].v,1))*100,25)+"%",background:CL[i]}}>{f.s}: {f.v}</div>)}</div>
              <CC title="📊 Nguồn học viên"><PieChart><Pie data={srcData} cx="50%" cy="50%" innerRadius={35} outerRadius={65} dataKey="v" label={({name,v})=>name.slice(0,5)+":"+v} fontSize={12}>{srcData.map((e,i)=><Cell key={i} fill={CL[i]}/>)}</Pie><Tooltip/></PieChart></CC>
            </div>}
            {dtab==="trends"&&isAdmin&&<div style={{display:"grid",gridTemplateColumns:grd(2),gap:12}}>
              <CC title="📈 Doanh thu (triệu)"><BarChart data={monthTrend}><CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/><XAxis dataKey="m" fontSize={13}/><YAxis fontSize={13}/><Tooltip/><Bar dataKey="rev" name="Doanh thu" fill="#16a34a" radius={[4,4,0,0]}/></BarChart></CC>
              <CC title="📊 Chuyên cần (%)"><LineChart data={attendTrend}><CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/><XAxis dataKey="w" fontSize={13}/><YAxis domain={[80,100]} fontSize={13}/><Tooltip/><Line type="monotone" dataKey="v" name="%" stroke="#16a34a" strokeWidth={2.5} dot={{fill:"#16a34a",r:4}}/></LineChart></CC>
            </div>}
          </div>}

          {/* BẢNG DỮ LIỆU - pattern chung cho các trang */}
          {pg==="leads"&&isAdmin&&<div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,flexWrap:"wrap",gap:8}}><h2 style={{fontSize:mob?20:24,fontWeight:800}}>🎯 Khách tiềm năng</h2><button className="btn btn-p" onClick={()=>om("l",{id:"LD"+Date.now(),name:"",phone:"",source:"Facebook",stage:"inquiry",interest:"HSK 1",note:"",created:today,lastContact:today},1)}>+ Thêm</button></div>
            <div style={{display:"grid",gridTemplateColumns:grd(4),gap:mob?6:10,marginBottom:14}}>
              {[{s:"inquiry",l:"Hỏi thăm",c:"#2563eb"},{s:"trial",l:"Học thử",c:"#ea580c"},{s:"registered",l:"Đã ĐK",c:"#16a34a"},{s:"lost",l:"Mất",c:"#6b7280"}].map(p=><div key={p.s} style={{textAlign:"center",padding:mob?10:14,borderRadius:12,background:"#f9fafb",fontWeight:700,color:p.c}}><div style={{fontSize:mob?22:30}}>{leads.filter(l=>l.stage===p.s).length}</div><div style={{fontSize:mob?12:14}}>{p.l}</div></div>)}
            </div>
            <div className="tbl-wrap"><div className="cd" style={{padding:0}}><table><thead><tr>{["Họ tên","SĐT","Nguồn","Quan tâm","Giai đoạn",""].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{leads.map(l=><tr key={l.id}><td style={{fontWeight:600}}>{l.name}</td><td>{l.phone}</td><td>{B(l.source,{Facebook:"b",TikTok:"p","Giới thiệu":"g","Walk-in":"o",Website:"y"}[l.source]||"gr")}</td><td>{B(l.interest,"b")}</td><td>{{inquiry:B("Hỏi thăm","b"),trial:B("Học thử","o"),registered:B("Đã ĐK","g"),lost:B("Mất","gr")}[l.stage]}</td>
              <td><div style={{display:"flex",gap:4}}>
                {l.stage==="inquiry"&&<button className="btn btn-sm" style={{background:"#fff7ed",color:"#ea580c",border:"none"}} onClick={()=>{setLeads(leads.map(x=>x.id===l.id?{...x,stage:"trial"}:x));updateRow("leads",{...l,stage:"trial"})}}>→ Thử</button>}
                {l.stage==="trial"&&<button className="btn btn-sm btn-p" onClick={()=>{setLeads(leads.map(x=>x.id===l.id?{...x,stage:"registered"}:x));updateRow("leads",{...l,stage:"registered"})}}>→ ĐK</button>}
                <button className="ib" onClick={()=>om("l",{...l},0)}>✏️</button>
                <button className="ib" style={{color:"#dc2626"}} onClick={()=>{if(confirm("Xoá?"))doDel("l",l.id)}}>🗑️</button>
              </div></td></tr>)}</tbody></table></div></div>
          </div>}

          {pg==="stu"&&<div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,flexWrap:"wrap",gap:8}}><h2 style={{fontSize:mob?20:24,fontWeight:800}}>👨‍🎓 Học viên ({stu.filter(s=>canSee(s.cls)).length})</h2>{isAdmin&&<button className="btn btn-p" onClick={()=>om("s",{id:"HV"+Date.now(),name:"",phone:"",cls:cls2[0]?.id||"",level:"HSK 1",status:"Đang học",score:0,attend:90,source:"Facebook"},1)}>+ Thêm</button>}</div>
            <div className="tbl-wrap"><div className="cd" style={{padding:0}}><table><thead><tr>{["STT","Học viên","Trình độ","Lớp","Điểm","CC","Nguồn","Trạng thái",...(isAdmin?[""]:[])] .map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{stu.filter(s=>(!q||s.name.toLowerCase().includes(query))&&canSee(s.cls)).map((s,i)=><tr key={s.id}><td style={{color:"#9ca3af"}}>{i+1}</td><td><div style={{fontWeight:600}}>{s.name}</div><div style={{color:"#9ca3af",fontSize:13}}>{s.phone}</div></td><td>{B(s.level,"b")}</td><td>{s.cls}</td><td style={{fontWeight:800,color:s.score>=8?"#16a34a":s.score>=6.5?"#ca8a04":"#dc2626",fontSize:18}}>{s.score}</td><td style={{color:s.attend>=90?"#16a34a":"#ca8a04"}}>{s.attend}%</td><td>{B(s.source,"gr")}</td><td>{B(s.status,s.status==="Đang học"?"g":s.status==="Tạm nghỉ"?"y":"gr")}</td>
              {isAdmin&&<td><button className="ib" onClick={()=>om("s",{...s},0)}>✏️</button><button className="ib" style={{color:"#dc2626"}} onClick={()=>{if(confirm("Xoá?"))doDel("s",s.id)}}>🗑️</button></td>}</tr>)}</tbody></table></div></div>
          </div>}

          {pg==="trials"&&isAdmin&&<div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,flexWrap:"wrap",gap:8}}><h2 style={{fontSize:mob?20:24,fontWeight:800}}>📚 Học thử</h2><button className="btn btn-p" onClick={()=>om("tr",{id:"TL"+Date.now(),name:"",phone:"",source:"Facebook",date:today,time:"18:00",cls:cls2[0]?.id||"",teacher:teachers[0]||"",status:"scheduled",result:"",followUp:"",note:""},1)}>+ Xếp lịch</button></div>
            {needFU.length>0&&<div className="al" style={{background:"#fff7ed",border:"1px solid #fed7aa",color:"#ea580c",fontWeight:600}}>🔔 Cần nhắc: {needFU.map(t=>t.name).join(", ")}</div>}
            <div className="tbl-wrap"><div className="cd" style={{padding:0}}><table><thead><tr>{["Họ tên","Ngày giờ","Lớp","Trạng thái","Kết quả","Nhắc lại",""].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{trials.map(t=><tr key={t.id}><td><div style={{fontWeight:600}}>{t.name}</div><div style={{color:"#9ca3af",fontSize:13}}>{t.source}</div></td><td>{t.date} {t.time}</td><td>{t.cls}</td><td>{{scheduled:B("Đã xếp","b"),completed:B("Đã học","g"),"no-show":B("Không đến","r")}[t.status]||B(t.status,"gr")}</td><td>{t.result?{enrolled:B("Đã ĐK","g"),thinking:B("Suy nghĩ","y"),"not-interested":B("Không QT","gr")}[t.result]:"—"}</td><td style={{color:t.followUp&&daysLeft(t.followUp)<=1?"#dc2626":"#9ca3af"}}>{t.followUp||"—"}</td>
              <td><div style={{display:"flex",gap:4}}>{t.status==="scheduled"&&<button className="btn btn-sm btn-p" onClick={()=>{setTrials(trials.map(x=>x.id===t.id?{...x,status:"completed"}:x));updateRow("trials",{...t,status:"completed"})}}>✓</button>}<button className="ib" onClick={()=>om("tr",{...t},0)}>✏️</button></div></td></tr>)}</tbody></table></div></div>
          </div>}

          {pg==="contracts"&&isAdmin&&<div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,flexWrap:"wrap",gap:8}}><h2 style={{fontSize:mob?20:24,fontWeight:800}}>📄 Hợp đồng</h2><button className="btn btn-p" onClick={()=>om("ct",{id:"HD"+Date.now(),name:"",cls:cls2[0]?.id||"",start:today,end:"",duration:"6 tháng",fee:0,status:"active",note:""},1)}>+ Tạo</button></div>
            <div className="tbl-wrap"><div className="cd" style={{padding:0}}><table><thead><tr>{["Học viên","Lớp","Bắt đầu","Kết thúc","Học phí","Trạng thái","Còn lại",""].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{contracts.map(c=>{const dl=daysLeft(c.end);const rs=c.status==="renewed"?"renewed":dl<=0?"expired":dl<=30?"expiring":"active";return<tr key={c.id}><td style={{fontWeight:600}}>{c.name}</td><td>{B(c.cls,"b")}</td><td>{c.start}</td><td>{c.end}</td><td style={{fontWeight:700,color:"#16a34a"}}>{vnd(c.fee)}</td><td>{{active:B("Hiệu lực","g"),expiring:B("Sắp hết","y"),expired:B("Hết hạn","r"),renewed:B("Gia hạn","b")}[rs]}</td><td style={{fontWeight:700,color:dl<=0?"#dc2626":dl<=30?"#ca8a04":"#16a34a"}}>{dl<=0?"Hết":dl+"d"}</td>
              <td>{(rs==="expiring"||rs==="expired")&&<button className="btn btn-sm btn-p" onClick={()=>{const nc={...c,status:"renewed"};setContracts(contracts.map(x=>x.id===c.id?nc:x));updateRow("contracts",nc)}}>↻</button>}<button className="ib" onClick={()=>om("ct",{...c},0)}>✏️</button></td></tr>})}</tbody></table></div></div>
          </div>}

          {pg==="hsk"&&<div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,flexWrap:"wrap",gap:8}}><h2 style={{fontSize:mob?20:24,fontWeight:800}}>🎓 Thi HSK</h2>{isAdmin&&<button className="btn btn-p" onClick={()=>om("hk",{id:"HSK"+Date.now(),name:"",level:"HSK 1",examDate:"",score:0,passed:"",status:"registered"},1)}>+ ĐK thi</button>}</div>
            <div style={{display:"grid",gridTemplateColumns:grd(2),gap:12,marginBottom:14}}>
              <CC title="Kết quả theo trình độ"><BarChart data={["HSK 1","HSK 2","HSK 3","HSK 4","HSK 5"].map(l=>({l,p:hsk.filter(h=>h.level===l&&h.passed==="yes").length,f:hsk.filter(h=>h.level===l&&h.passed==="no").length}))}><XAxis dataKey="l" fontSize={12}/><YAxis fontSize={12}/><Tooltip/><Bar dataKey="p" name="Đạt" fill="#16a34a" stackId="a" radius={[4,4,0,0]}/><Bar dataKey="f" name="Chưa đạt" fill="#dc2626" stackId="a" radius={[4,4,0,0]}/></BarChart></CC>
              <div className="cd" style={{textAlign:"center"}}><div style={{fontSize:18,fontWeight:700,marginBottom:10}}>Tỷ lệ đỗ</div><div style={{fontSize:mob?44:56,fontWeight:800,color:hskRate>=70?"#16a34a":"#ca8a04"}}>{hskRate}%</div><div style={{fontSize:15,color:"#9ca3af"}}>{hskP}/{hskTt} đạt</div><div className="pb" style={{marginTop:10}}><div className="pf" style={{width:hskRate+"%",background:hskRate>=70?"#16a34a":"#ca8a04"}}/></div></div>
            </div>
            <div className="tbl-wrap"><div className="cd" style={{padding:0}}><table><thead><tr>{["Học viên","Trình độ","Ngày thi","Điểm","Kết quả",...(isAdmin?[""]:[])] .map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{hsk.map(h=><tr key={h.id}><td style={{fontWeight:600}}>{h.name}</td><td>{B(h.level,"p")}</td><td>{h.examDate}</td><td style={{fontWeight:700,fontSize:18}}>{h.score||"—"}</td><td>{h.passed==="yes"?B("ĐẠT","g"):h.passed==="no"?B("Chưa đạt","r"):B("Chưa thi","b")}</td>{isAdmin&&<td><button className="ib" onClick={()=>om("hk",{...h},0)}>✏️</button></td>}</tr>)}</tbody></table></div></div>
          </div>}

          {pg==="rpt"&&<div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,flexWrap:"wrap",gap:8}}><h2 style={{fontSize:mob?20:24,fontWeight:800}}>📋 Báo cáo buổi học</h2><button className="btn btn-p" onClick={()=>om("r",{id:"RP"+Date.now(),date:today,teacher:isAdmin?(teachers[0]||""):user.name,cls:cls2[0]?.id||"",present:0,absent:0,absentNames:"",lesson:"",homework:"",flags:"",highlights:""},1)}>+ Tạo</button></div>
            {rpt.filter(r=>isAdmin||r.teacher===user.name).map(r=><div key={r.id} style={{border:"1px solid #e5e7eb",borderRadius:14,padding:mob?14:18,marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8,flexWrap:"wrap",gap:6}}><div><strong style={{fontSize:mob?15:17}}>{r.teacher}</strong> <span style={{color:"#9ca3af",fontSize:mob?13:15}}>{r.cls} · {r.date}</span></div><div style={{display:"flex",alignItems:"center",gap:8}}>{B(r.present+"/"+(r.present+r.absent)+" có mặt",r.absent===0?"g":"y")}{(isAdmin||r.teacher===user.name)&&<button className="ib" onClick={()=>om("r",{...r},0)}>✏️</button>}</div></div>
              <div style={{fontSize:mob?14:16}}>📖 {r.lesson}</div>
              {r.homework&&<div style={{fontSize:mob?13:15,color:"#6b7280",marginTop:4}}>📝 {r.homework}</div>}
              {r.flags&&<div style={{background:"#fef2f2",borderRadius:8,padding:"8px 14px",marginTop:8,fontSize:mob?13:15,color:"#dc2626"}}>⚠️ {r.flags}</div>}
              {r.highlights&&<div style={{background:"#f0fdf4",borderRadius:8,padding:"8px 14px",marginTop:8,fontSize:mob?13:15,color:"#16a34a"}}>⭐ {r.highlights}</div>}
            </div>)}
          </div>}

          {pg==="log"&&isAdmin&&<div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,flexWrap:"wrap",gap:8}}><h2 style={{fontSize:mob?20:24,fontWeight:800}}>💬 Lịch sử tương tác</h2><button className="btn btn-p" onClick={()=>om("i",{id:"IT"+Date.now(),ref:"",refName:"",date:today,type:"call",content:"",by:"Admin"},1)}>+ Ghi nhận</button></div>
            {inter.map(it=><div key={it.id} style={{display:"flex",gap:12,padding:"12px 0",borderBottom:"1px solid #f3f4f6"}}><div style={{width:12,height:12,borderRadius:"50%",background:it.type==="call"?"#16a34a":it.type==="message"?"#2563eb":"#ea580c",marginTop:6,flexShrink:0}}/><div><div style={{fontSize:mob?14:16}}><strong>{it.refName}</strong> <span style={{color:"#9ca3af",fontSize:mob?12:14}}>{it.date}</span> {B(it.type==="call"?"📞 Gọi":it.type==="message"?"💬 Nhắn":"🤝 Gặp",it.type==="call"?"g":it.type==="message"?"b":"o")}</div><div style={{fontSize:mob?14:16,color:"#374151",marginTop:4}}>{it.content}</div></div></div>)}
          </div>}

          {pg==="fin"&&isAdmin&&<div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,flexWrap:"wrap",gap:8}}><h2 style={{fontSize:mob?20:24,fontWeight:800}}>💰 Tài chính 50/50</h2><button className="btn btn-p" onClick={()=>om("f",{id:"HP"+Date.now(),name:"",cls:cls2[0]?.id||"",total:0,d1:0,d2:0,d2d:"",st:"pending"},1)}>+ Thêm</button></div>
            <div className="tbl-wrap"><div className="cd" style={{padding:0}}><table><thead><tr>{["Học viên","Lớp","Tổng","Đợt 1","Đợt 2","Hạn","TT",""].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{fin.map(f=><tr key={f.id}><td style={{fontWeight:600}}>{f.name}</td><td>{B(f.cls,"b")}</td><td style={{fontWeight:700,color:"#16a34a"}}>{vnd(f.total)}</td><td>{vnd(f.d1)}</td><td style={{fontWeight:600}}>{vnd(f.d2)}</td><td style={{color:f.st==="overdue"?"#dc2626":"#9ca3af"}}>{f.d2d}</td><td>{f.st==="paid"?B("Đã đóng","g"):f.st==="pending"?B("Chờ","y"):B("Quá hạn","r")}</td>
              <td><div style={{display:"flex",gap:4}}>{f.st!=="paid"&&<button className="btn btn-p btn-sm" onClick={()=>{setFin(fin.map(x=>x.id===f.id?{...x,st:"paid"}:x));updateRow("finance",{...f,st:"paid"})}}>✓</button>}<button className="ib" onClick={()=>om("f",{...f},0)}>✏️</button></div></td></tr>)}</tbody></table></div></div>
          </div>}

          {pg==="charts"&&isAdmin&&<div>
            <h2 style={{fontSize:mob?20:24,fontWeight:800,marginBottom:14}}>📈 Biểu đồ tổng hợp</h2>
            <div style={{display:"grid",gridTemplateColumns:grd(2),gap:12}}>
              <CC title="📊 Doanh thu (triệu)"><BarChart data={monthTrend}><CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/><XAxis dataKey="m" fontSize={13}/><YAxis fontSize={13}/><Tooltip/><Bar dataKey="rev" name="Doanh thu" fill="#16a34a" radius={[4,4,0,0]}/></BarChart></CC>
              <CC title="📊 Chuyên cần (%)"><LineChart data={attendTrend}><CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/><XAxis dataKey="w" fontSize={13}/><YAxis domain={[80,100]} fontSize={13}/><Tooltip/><Line type="monotone" dataKey="v" name="%" stroke="#16a34a" strokeWidth={2.5} dot={{fill:"#16a34a",r:4}}/></LineChart></CC>
              <CC title="💳 Thanh toán"><PieChart><Pie data={payPie} cx="50%" cy="50%" innerRadius={35} outerRadius={65} dataKey="v" label={({n,v})=>n+": "+v} fontSize={13}>{payPie.map((e,i)=><Cell key={i} fill={[CL[0],CL[3],CL[4]][i]}/>)}</Pie><Tooltip/></PieChart></CC>
              <CC title="🎯 Phân bố điểm"><BarChart data={scoreDist}><CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/><XAxis dataKey="r" fontSize={13}/><YAxis fontSize={13}/><Tooltip/><Bar dataKey="n" name="HV" fill="#0d9488" radius={[4,4,0,0]}/></BarChart></CC>
            </div>
          </div>}
        </div>
      </div>

      {/* BOTTOM NAV - chỉ hiện trên điện thoại */}
      {mob&&<div className="bot-nav">
        {mobNav.map(m=><div key={m.id} className={`bot-item ${pg===m.id?"a":""}`} onClick={()=>{
          if(m.id==="more"){setShowMenu(!showMenu)}else{setPg(m.id);setShowMenu(false)}
        }}><span>{m.i}</span><span>{m.l}</span></div>)}
        {showMenu&&<div className="more-menu">
          {moreMenu.map(m=><div key={m.id} className="ni" onClick={()=>{setPg(m.id);setShowMenu(false)}} style={{padding:"10px 12px",fontSize:15}}>{m.i} {m.l}</div>)}
          <div className="ni" onClick={logout} style={{padding:"10px 12px",fontSize:15,color:"#dc2626"}}>🚪 Đăng xuất</div>
        </div>}
      </div>}

      {/* MODAL */}
      {modal&&<ModalForm type={modal.t} initial={modal.d} isNew={modal.n} cls2={cls2} teachers={teachers} isAdmin={isAdmin} userName={user.name} mob={mob}
        onSave={async d=>{await doSave(modal.t,d,modal.n);setModal(null)}} onClose={()=>setModal(null)}/>}
    </div>
  );
}
