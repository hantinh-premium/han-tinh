import { useState, useEffect, useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, AreaChart, Area } from "recharts";
import { supabase } from "./supabase";
import {
  LayoutDashboard, Target, BookOpen, GraduationCap, FileText, ClipboardList,
  MessageSquare, Wallet, BarChart3, Users, LogOut, Plus, Pencil, Trash2,
  Search, ChevronRight, Phone, MessageCircle, Handshake, CheckCircle,
  ArrowUpRight, ArrowDownRight, TrendingUp, Menu, X, Bell, Save,
  CalendarDays, Clock, AlertTriangle, Star, Award, ChevronDown
} from "lucide-react";
 
// ── DB ──
const FM={leads:{lastContact:"last_contact"},reports:{absentNames:"absent_names"},interactions:{refName:"ref_name",by:"by_user"},trials:{date:"trial_date",time:"trial_time",followUp:"follow_up"},contracts:{start:"start_date",end:"end_date"},hsk_exams:{examDate:"exam_date"}};
function toDb(t,o){const m=FM[t];if(!m)return{...o};const r={};for(const[k,v]of Object.entries(o))r[m[k]||k]=v;return r}
function toApp(t,o){const m=FM[t];if(!m)return{...o};const rm={};for(const[k,v]of Object.entries(m))rm[v]=k;const r={};for(const[k,v]of Object.entries(o))r[rm[k]||k]=v;return r}
async function loadT(t){try{const{data}=await supabase.from(t).select("*");return(data||[]).map(r=>toApp(t,r))}catch{return[]}}
async function addRow(t,row){const d=toDb(t,row);delete d.created_at;await supabase.from(t).insert([d])}
async function updateRow(t,row){const d=toDb(t,row);delete d.created_at;await supabase.from(t).update(d).eq("id",row.id)}
async function deleteRow(t,id){await supabase.from(t).delete().eq("id",id)}
 
const vnd=n=>new Intl.NumberFormat("vi-VN").format(n)+"đ";
const today=new Date().toISOString().slice(0,10);
const CL=["#34d399","#0ea5e9","#a78bfa","#fbbf24","#f87171","#38bdf8","#fb923c"];
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
 
/* ── Mini Sparkline SVG ── */
function Spark({data,color="#34d399",w=64,h=24}){
  if(!data||data.length<2)return null;
  const mn=Math.min(...data),mx=Math.max(...data),rng=mx-mn||1;
  const pts=data.map((v,i)=>`${(i/(data.length-1))*w},${h-((v-mn)/rng)*h}`).join(" ");
  return <svg width={w} height={h} style={{display:"block"}}><polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
 
/* ── Custom Recharts Tooltip ── */
function ChartTooltip({active,payload,label}){
  if(!active||!payload?.length)return null;
  return <div style={{background:"rgba(10,17,30,.92)",backdropFilter:"blur(12px)",border:"1px solid rgba(255,255,255,.1)",borderRadius:12,padding:"10px 14px",boxShadow:"0 8px 32px rgba(0,0,0,.4)"}}>
    <div style={{fontSize:12,color:"#94a3b8",marginBottom:4,fontWeight:600}}>{label}</div>
    {payload.map((p,i)=><div key={i} style={{fontSize:14,fontWeight:700,color:p.color||"#f1f5f9"}}>{p.name}: {p.value}</div>)}
  </div>;
}
 
// ── MODAL (useRef = không lag) ──
function ModalForm({type,initial,isNew,onSave,onClose,cls2,teachers,isAdmin,userName,mob}){
const d=useRef({...initial});
const IS={padding:"12px 16px",border:"1px solid rgba(255,255,255,.08)",borderRadius:12,fontSize:15,outline:"none",width:"100%",fontFamily:"'Inter',sans-serif",background:"rgba(255,255,255,.04)",color:"#f1f5f9",transition:"border-color .2s, box-shadow .2s"};
const F=({label,k,type:t})=><div style={{flex:1,marginBottom:14}}>
<label style={{display:"block",fontSize:13,color:"#64748b",fontWeight:600,marginBottom:6,letterSpacing:".03em"}}>{label}</label>
{t==="textarea"?<textarea style={{...IS,minHeight:60,resize:"vertical"}} defaultValue={d.current[k]||""} onFocus={e=>{e.target.style.borderColor="rgba(52,211,153,.4)";e.target.style.boxShadow="0 0 0 3px rgba(52,211,153,.08)"}} onBlur={e=>{e.target.style.borderColor="rgba(255,255,255,.08)";e.target.style.boxShadow="none"}} onChange={e=>{d.current[k]=e.target.value}}/>
:t==="date"?<input style={IS} type="date" defaultValue={d.current[k]||""} onFocus={e=>{e.target.style.borderColor="rgba(52,211,153,.4)";e.target.style.boxShadow="0 0 0 3px rgba(52,211,153,.08)"}} onBlur={e=>{e.target.style.borderColor="rgba(255,255,255,.08)";e.target.style.boxShadow="none"}} onChange={e=>{d.current[k]=e.target.value}}/>
:t==="number"?<input style={IS} type="number" defaultValue={d.current[k]||0} onFocus={e=>{e.target.style.borderColor="rgba(52,211,153,.4)";e.target.style.boxShadow="0 0 0 3px rgba(52,211,153,.08)"}} onBlur={e=>{e.target.style.borderColor="rgba(255,255,255,.08)";e.target.style.boxShadow="none"}} onChange={e=>{d.current[k]=parseFloat(e.target.value)||0}}/>
:<input style={IS} defaultValue={d.current[k]||""} onFocus={e=>{e.target.style.borderColor="rgba(52,211,153,.4)";e.target.style.boxShadow="0 0 0 3px rgba(52,211,153,.08)"}} onBlur={e=>{e.target.style.borderColor="rgba(255,255,255,.08)";e.target.style.boxShadow="none"}} onChange={e=>{d.current[k]=e.target.value}}/>}
  </div>;
  const S=({label,k,opts})=><div style={{flex:1,marginBottom:14}}>
    <label style={{display:"block",fontSize:13,color:"#64748b",fontWeight:600,marginBottom:6,letterSpacing:".03em"}}>{label}</label>
    <select style={{...IS,appearance:"auto"}} defaultValue={d.current[k]||""} onChange={e=>{d.current[k]=e.target.value}}>
      {opts.map(o=>Array.isArray(o)?<option key={o[0]} value={o[0]}>{o[1]}</option>:<option key={o}>{o}</option>)}
    </select>
  </div>;
  const Fl=({children})=><div style={{display:"flex",gap:10}}>{children}</div>;
  const sources=["Facebook","TikTok","Giới thiệu","Walk-in","Website"];
  const levels=["HSK 1","HSK 2","HSK 3","HSK 4","HSK 5","HSK 6"];
  return(
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal-box ${mob?"modal-mob":""}`} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}>
          <h3 style={{fontSize:18,fontWeight:700,color:"#f1f5f9",letterSpacing:"-.01em"}}>{isNew?"Thêm":"Sửa"} {{s:"Học viên",l:"Khách tiềm năng",tr:"Học thử",ct:"Hợp đồng",hk:"Thi HSK",r:"Báo cáo",i:"Tương tác",f:"Học phí"}[type]}</h3>
          <button style={{background:"rgba(255,255,255,.06)",border:"none",width:32,height:32,borderRadius:10,cursor:"pointer",color:"#64748b",display:"flex",alignItems:"center",justifyContent:"center"}} onClick={onClose}><X size={16}/></button>
        </div>
        {type==="l"&&<><Fl><F label="Họ tên" k="name"/><F label="SĐT" k="phone"/></Fl><Fl><S label="Nguồn" k="source" opts={sources}/><S label="Quan tâm" k="interest" opts={levels.slice(0,5)}/></Fl><S label="Giai đoạn" k="stage" opts={[["inquiry","Hỏi thăm"],["trial","Học thử"],["registered","Đã ĐK"],["lost","Mất"]]}/><F label="Ghi chú" k="note" type="textarea"/></>}
        {type==="s"&&<><Fl><F label="Họ tên" k="name"/><F label="SĐT" k="phone"/></Fl><Fl><S label="Lớp" k="cls" opts={cls2.map(c=>c.id)}/><S label="Trình độ" k="level" opts={levels}/></Fl><Fl><F label="Điểm" k="score" type="number"/><F label="CC %" k="attend" type="number"/></Fl><Fl><S label="Nguồn" k="source" opts={sources}/><S label="Trạng thái" k="status" opts={["Đang học","Tạm nghỉ","Nghỉ học"]}/></Fl></>}
        {type==="tr"&&<><Fl><F label="Họ tên" k="name"/><F label="SĐT" k="phone"/></Fl><Fl><F label="Ngày" k="date" type="date"/><F label="Giờ" k="time"/></Fl><Fl><S label="Lớp" k="cls" opts={cls2.map(c=>c.id)}/><S label="GV" k="teacher" opts={teachers}/></Fl><Fl><S label="TT" k="status" opts={[["scheduled","Đã xếp"],["completed","Đã học"],["no-show","Không đến"]]}/><S label="KQ" k="result" opts={[["","—"],["enrolled","Đã ĐK"],["thinking","Suy nghĩ"],["not-interested","Không QT"]]}/></Fl><F label="Nhắc lại" k="followUp" type="date"/></>}
        {type==="ct"&&<><F label="Học viên" k="name"/><Fl><S label="Lớp" k="cls" opts={cls2.map(c=>c.id)}/><S label="Thời hạn" k="duration" opts={["3 tháng","6 tháng","12 tháng","18 tháng"]}/></Fl><Fl><F label="Bắt đầu" k="start" type="date"/><F label="Kết thúc" k="end" type="date"/></Fl><F label="Học phí" k="fee" type="number"/></>}
        {type==="hk"&&<><F label="Học viên" k="name"/><Fl><S label="Level" k="level" opts={levels}/><F label="Ngày thi" k="examDate" type="date"/></Fl><Fl><F label="Điểm" k="score" type="number"/><S label="KQ" k="passed" opts={[["","Chưa thi"],["yes","ĐẠT"],["no","Chưa đạt"]]}/></Fl></>}
        {type==="r"&&<><Fl><F label="Ngày" k="date" type="date"/>{isAdmin?<S label="GV" k="teacher" opts={teachers}/>:<div style={{flex:1}}><label style={{display:"block",fontSize:13,color:"#64748b",fontWeight:600,marginBottom:6}}>GV</label><input style={{...IS,opacity:.6}} value={userName} disabled/></div>}<S label="Lớp" k="cls" opts={cls2.map(c=>c.id)}/></Fl><Fl><F label="Có mặt" k="present" type="number"/><F label="Vắng" k="absent" type="number"/></Fl><F label="HV vắng" k="absentNames"/><F label="Bài học" k="lesson" type="textarea"/><F label="BTVN" k="homework" type="textarea"/><F label="Chú ý" k="flags" type="textarea"/><F label="Nổi bật" k="highlights" type="textarea"/></>}
        {type==="i"&&<><Fl><F label="Người" k="refName"/><F label="Ngày" k="date" type="date"/></Fl><Fl><S label="Loại" k="type" opts={[["call","Gọi điện"],["message","Nhắn tin"],["meeting","Gặp mặt"]]}/><F label="Bởi" k="by"/></Fl><F label="Nội dung" k="content" type="textarea"/></>}
        {type==="f"&&<><F label="Họ tên" k="name"/><Fl><S label="Lớp" k="cls" opts={cls2.map(c=>c.id)}/><F label="Tổng phí" k="total" type="number"/></Fl><Fl><F label="Hạn đợt 2" k="d2d"/><S label="TT" k="st" opts={[["paid","Đã đóng"],["pending","Chờ"],["overdue","Quá hạn"]]}/></Fl></>}
        <div style={{display:"flex",gap:10,marginTop:22}}>
          <button className="btn-save" onClick={()=>{
            const data={...d.current};
            if(type==="f"&&data.total){data.d1=Math.round(data.total/2);data.d2=Math.round(data.total/2)}
            if(type==="hk"){data.status=data.passed==="yes"?"passed":data.passed==="no"?"failed":"registered"}
            onSave(data);
          }}><Save size={16}/> Lưu</button>
          <button className="btn-cancel" onClick={onClose}>Huỷ</button>
        </div>
      </div>
    </div>
  );
}
 
// ── APP ──
export default function App(){
const[user,setUser]=useState(null);const[lu,setLu]=useState("");const[lp,setLp]=useState("");const[le,setLe]=useState("");
const[pg,setPg]=useState("home");const[mob,setMob]=useState(window.innerWidth<768);
const[stu,setStu]=useState([]);const[cls2,setCls2]=useState([]);const[fin,setFin]=useState([]);
const[rpt,setRpt]=useState([]);const[leads,setLeads]=useState([]);const[inter,setInter]=useState([]);
const[trials,setTrials]=useState([]);const[contracts,setContracts]=useState([]);const[hsk,setHsk]=useState([]);
const[modal,setModal]=useState(null);const[q,setQ]=useState("");const[dtab,setDtab]=useState("kpi");const[ok,setOk]=useState(false);
const[showMenu,setShowMenu]=useState(false);
 
useEffect(()=>{const h=()=>setMob(window.innerWidth<768);window.addEventListener("resize",h);return()=>window.removeEventListener("resize",h)},[]);
useEffect(()=>{(async()=>{
const[s,c,f,r,l,i,t,ct,h]=await Promise.all([loadT("students"),loadT("classes"),loadT("finance"),loadT("reports"),loadT("leads"),loadT("interactions"),loadT("trials"),loadT("contracts"),loadT("hsk_exams")]);
setStu(s);setCls2(c);setFin(f);setRpt(r);setLeads(l);setInter(i);setTrials(t);setContracts(ct);setHsk(h);
const su=localStorage.getItem("ht_user");if(su)setUser(JSON.parse(su));setOk(true);
})()},[]);
 
const tbl={s:"students",l:"leads",tr:"trials",ct:"contracts",hk:"hsk_exams",r:"reports",i:"interactions",f:"finance"};
const stx={s:[stu,setStu],l:[leads,setLeads],tr:[trials,setTrials],ct:[contracts,setContracts],hk:[hsk,setHsk],r:[rpt,setRpt],i:[inter,setInter],f:[fin,setFin]};
const doSave=async(type,data,isNew)=>{const[arr,setter]=stx[type];if(isNew){setter(type==="r"||type==="i"?[data,...arr]:[...arr,data]);await addRow(tbl[type],data)}else{setter(arr.map(x=>x.id===data.id?data:x));await updateRow(tbl[type],data)}};
const doDel=async(type,id)=>{const[arr,setter]=stx[type];setter(arr.filter(x=>x.id!==id));await deleteRow(tbl[type],id)};
const login=()=>{const u=USERS.find(u=>u.user===lu&&u.pass===lp);if(u){setUser(u);localStorage.setItem("ht_user",JSON.stringify(u));setLe("")}else setLe("Sai tài khoản hoặc mật khẩu")};
const logout=()=>{setUser(null);localStorage.removeItem("ht_user");setPg("home")};
const isAdmin=user?.role==="admin";
const canSee=c=>isAdmin||(user?.cls||"").split(",").includes(c);
 
if(!ok)return<div style={{display:"flex",height:"100vh",alignItems:"center",justifyContent:"center",fontFamily:"'Inter',sans-serif",fontSize:16,background:"#060a13",color:"#64748b",gap:10}}>
  <div className="spin" style={{width:20,height:20,border:"2px solid rgba(52,211,153,.2)",borderTop:"2px solid #34d399",borderRadius:"50%"}}/>Đang khởi động…
</div>;
 
if(!user)return(
<div style={{fontFamily:"'Inter',sans-serif",minHeight:"100vh",background:"#060a13",display:"flex",alignItems:"center",justifyContent:"center",padding:16,position:"relative",overflow:"hidden"}}>
<div style={{position:"absolute",width:500,height:500,borderRadius:"50%",background:"radial-gradient(circle,rgba(52,211,153,.06) 0%,transparent 70%)",top:"-10%",right:"-10%"}}/>
<div style={{position:"absolute",width:400,height:400,borderRadius:"50%",background:"radial-gradient(circle,rgba(14,165,233,.05) 0%,transparent 70%)",bottom:"-10%",left:"-5%"}}/>
<div style={{width:mob?"100%":420,background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.06)",borderRadius:24,padding:mob?28:44,backdropFilter:"blur(24px)",position:"relative",boxShadow:"0 32px 80px rgba(0,0,0,.3)"}}>
<div style={{width:56,height:56,borderRadius:16,background:"linear-gradient(135deg,#34d399,#0ea5e9)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:26,fontWeight:800,margin:"0 auto 20px",boxShadow:"0 8px 32px rgba(52,211,153,.25)"}}><span style={{fontFamily:"serif"}}>漢</span></div>
<h2 style={{fontSize:26,fontWeight:800,color:"#f1f5f9",textAlign:"center",marginBottom:4,letterSpacing:"-.02em"}}>Hán Tinh Premium</h2>
<p style={{color:"#475569",fontSize:14,textAlign:"center",marginBottom:32}}>Đăng nhập vào hệ thống quản lý</p>
<input className="login-input" placeholder="Tài khoản" value={lu} onChange={e=>setLu(e.target.value)} onKeyDown={e=>e.key==="Enter"&&login()}/>
<input className="login-input" placeholder="Mật khẩu" type="password" value={lp} onChange={e=>setLp(e.target.value)} onKeyDown={e=>e.key==="Enter"&&login()}/>
{le&&<div style={{color:"#f87171",fontSize:13,marginBottom:10,textAlign:"center",fontWeight:500}}>{le}</div>}
<button className="btn-login" onClick={login}>Đăng nhập</button>
</div>
</div>
);
 
// ── DỮ LIỆU ──
const query=q.trim().toLowerCase();
const act=stu.filter(s=>s.status==="Đang học"),ov=fin.filter(f=>f.st==="overdue"),pend=fin.filter(f=>f.st==="pending");
const ranked=[...act].sort((a,b)=>(b.score||0)-(a.score||0));
const teachers=[...new Set(cls2.map(c=>c.teacher).filter(Boolean))];
const expiring=contracts.filter(c=>{const dl=daysLeft(c.end);return dl>0&&dl<=30});
const expired=contracts.filter(c=>daysLeft(c.end)<=0&&c.status!=="renewed");
const upTrials=trials.filter(t=>t.status==="scheduled"),needFU=trials.filter(t=>t.result==="thinking");
const hskP=hsk.filter(h=>h.passed==="yes").length,hskTt=hsk.filter(h=>h.status!=="registered").length,hskRate=hskTt>0?Math.round(hskP/hskTt*100):0;
const collected=fin.reduce((a,f)=>a+(f.d1||0)+(f.st==="paid"?(f.d2||0):0),0);
const srcData=["Facebook","TikTok","Giới thiệu","Walk-in","Website"].map(s=>({name:s,v:[...stu,...leads].filter(x=>x.source===s).length})).filter(d=>d.v>0);
const funnelData=[{s:"Hỏi thăm",v:leads.filter(l=>l.stage!=="lost").length},{s:"Học thử",v:leads.filter(l=>l.stage==="trial"||l.stage==="registered").length},{s:"Đăng ký",v:leads.filter(l=>l.stage==="registered").length},{s:"Đang học",v:act.length}];
const payPie=[{n:"Đủ",v:fin.filter(f=>f.st==="paid").length},{n:"Chờ",v:pend.length},{n:"Nợ",v:ov.length}];
const scoreDist=[{r:"<5",n:stu.filter(s=>(s.score||0)<5).length},{r:"5-6.5",n:stu.filter(s=>(s.score||0)>=5&&s.score<6.5).length},{r:"6.5-8",n:stu.filter(s=>(s.score||0)>=6.5&&s.score<8).length},{r:"8-9",n:stu.filter(s=>(s.score||0)>=8&&s.score<9).length},{r:"9+",n:stu.filter(s=>(s.score||0)>=9).length}];
 
const B=(t,c)=>{const m={g:["rgba(52,211,153,.12)","#34d399"],r:["rgba(248,113,113,.10)","#f87171"],y:["rgba(251,191,36,.10)","#fbbf24"],b:["rgba(14,165,233,.10)","#0ea5e9"],gr:["rgba(100,116,139,.08)","#94a3b8"],p:["rgba(167,139,250,.10)","#a78bfa"],o:["rgba(251,146,60,.10)","#fb923c"]};const[bg,fg]=m[c]||m.gr;return<span style={{display:"inline-block",padding:"4px 12px",borderRadius:99,fontSize:12,fontWeight:600,background:bg,color:fg,letterSpacing:".01em"}}>{t}</span>};
const CC=({title,icon,children,h=190})=><div className="card"><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>{icon}<span style={{fontWeight:700,fontSize:15,color:"#e2e8f0"}}>{title}</span></div><ResponsiveContainer width="100%" height={h}>{children}</ResponsiveContainer></div>;
const om=(t,d,n)=>setModal({t,d,n});
const grd=c=>mob?"1fr":`repeat(${c},1fr)`;
 
const ico={home:<LayoutDashboard size={18}/>,leads:<Target size={18}/>,trials:<BookOpen size={18}/>,stu:<Users size={18}/>,contracts:<FileText size={18}/>,hsk:<GraduationCap size={18}/>,rpt:<ClipboardList size={18}/>,log:<MessageSquare size={18}/>,fin:<Wallet size={18}/>,charts:<BarChart3 size={18}/>};
const adminMenu=[{id:"home",l:"Tổng quan"},{id:"leads",l:"Khách mới"},{id:"trials",l:"Học thử"},{id:"stu",l:"Học viên"},{id:"contracts",l:"Hợp đồng"},{id:"hsk",l:"HSK"},{id:"rpt",l:"Báo cáo"},{id:"log",l:"Lịch sử"},{id:"fin",l:"Tài chính"},{id:"charts",l:"Biểu đồ"}];
const teacherMenu=[{id:"home",l:"Tổng quan"},{id:"stu",l:"Học viên"},{id:"rpt",l:"Báo cáo"},{id:"hsk",l:"HSK"}];
const menu=isAdmin?adminMenu:teacherMenu;
const mobNav=isAdmin?[{id:"home",l:"Tổng quan"},{id:"leads",l:"Khách"},{id:"stu",l:"HV"},{id:"rpt",l:"Báo cáo"},{id:"more",l:"Thêm"}]:[{id:"home",l:"Tổng quan"},{id:"stu",l:"HV"},{id:"rpt",l:"Báo cáo"},{id:"hsk",l:"HSK"}];
const moreMenu=adminMenu.filter(m=>!["home","leads","stu","rpt"].includes(m.id));
const mIco={home:<LayoutDashboard size={20}/>,leads:<Target size={20}/>,stu:<Users size={20}/>,rpt:<ClipboardList size={20}/>,hsk:<GraduationCap size={20}/>,more:<Menu size={20}/>};
 
/* KPI card with optional sparkline + trend */
const KPI=({label,value,color,sparkData,trend})=><div className="card kpi-card" style={{textAlign:"center",padding:"18px 14px",position:"relative",overflow:"hidden"}}>
  <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,transparent,${color},transparent)`,opacity:.5}}/>
  <div style={{fontSize:mob?26:30,fontWeight:800,color,letterSpacing:"-.02em",lineHeight:1.1}}>{value}</div>
  {sparkData&&<div style={{display:"flex",justifyContent:"center",margin:"6px 0 2px"}}><Spark data={sparkData} color={color}/></div>}
  {trend!==undefined&&<div style={{display:"inline-flex",alignItems:"center",gap:2,fontSize:11,fontWeight:700,color:trend>=0?"#34d399":"#f87171",marginTop:sparkData?0:4}}>
    {trend>=0?<ArrowUpRight size={12}/>:<ArrowDownRight size={12}/>}{Math.abs(trend)}%
  </div>}
  <div style={{fontSize:13,color:"#64748b",marginTop:4,fontWeight:500}}>{label}</div>
</div>;
 
return(
<div style={{fontFamily:"'Inter',sans-serif",display:"flex",flexDirection:mob?"column":"row",height:"100vh",background:"#060a13",color:"#e2e8f0",overflow:"hidden",position:"relative"}}>
<style>{`
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:rgba(148,163,184,.2);border-radius:99px}::-webkit-scrollbar-thumb:hover{background:rgba(148,163,184,.35)}
input[type="date"]::-webkit-calendar-picker-indicator{filter:invert(.6)}
select{color-scheme:dark}
 
.card{background:rgba(255,255,255,.03);border-radius:16px;padding:20px;border:1px solid rgba(255,255,255,.06);transition:border-color .25s,box-shadow .25s}
.card:hover{border-color:rgba(255,255,255,.1);box-shadow:0 4px 24px rgba(0,0,0,.15)}
.kpi-card{background:rgba(255,255,255,.025);backdrop-filter:blur(8px)}
 
.ni{display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:12px;cursor:pointer;font-size:14px;font-weight:500;color:#64748b;transition:all .2s;border:none;background:transparent;width:100%;text-align:left}
.ni:hover{background:rgba(255,255,255,.04);color:#cbd5e1}
.ni.a{background:rgba(52,211,153,.08);color:#34d399;font-weight:700}
.ni.a::before{content:'';position:absolute;left:0;top:50%;transform:translateY(-50%);width:3px;height:20px;border-radius:0 3px 3px 0;background:#34d399}
 
.btn{display:inline-flex;align-items:center;gap:6px;padding:10px 20px;border-radius:12px;border:none;cursor:pointer;font-size:14px;font-weight:600;font-family:'Inter',sans-serif;transition:all .2s}
.btn-p{background:linear-gradient(135deg,#34d399,#0ea5e9);color:#fff;box-shadow:0 2px 12px rgba(52,211,153,.15)}
.btn-p:hover{box-shadow:0 4px 24px rgba(52,211,153,.3);transform:translateY(-1px)}
.btn-sm{padding:7px 14px;font-size:13px;border-radius:10px}
 
.btn-save{flex:1;display:flex;align-items:center;justify-content:center;gap:8px;padding:14px;background:linear-gradient(135deg,#34d399,#0ea5e9);color:#fff;border:none;border-radius:14px;font-size:15px;font-weight:700;cursor:pointer;font-family:'Inter',sans-serif;transition:all .2s;box-shadow:0 4px 20px rgba(52,211,153,.2)}
.btn-save:hover{box-shadow:0 6px 32px rgba(52,211,153,.35);transform:translateY(-1px)}
.btn-cancel{padding:14px 28px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:14px;font-size:15px;color:#94a3b8;cursor:pointer;font-family:'Inter',sans-serif;font-weight:500;transition:all .2s}
.btn-cancel:hover{background:rgba(255,255,255,.07);color:#cbd5e1}
 
.btn-login{width:100%;padding:14px;background:linear-gradient(135deg,#34d399,#0ea5e9);color:#fff;border:none;border-radius:14px;font-size:16px;font-weight:700;cursor:pointer;font-family:'Inter',sans-serif;transition:all .25s;box-shadow:0 4px 20px rgba(52,211,153,.2)}
.btn-login:hover{box-shadow:0 8px 40px rgba(52,211,153,.35);transform:translateY(-1px)}
.login-input{width:100%;padding:14px 18px;border:1px solid rgba(255,255,255,.06);border-radius:14px;font-size:15px;outline:none;font-family:'Inter',sans-serif;background:rgba(255,255,255,.03);color:#f1f5f9;margin-bottom:12px;transition:border-color .2s,box-shadow .2s}
.login-input:focus{border-color:rgba(52,211,153,.35);box-shadow:0 0 0 3px rgba(52,211,153,.08)}
.login-input::placeholder{color:#475569}
 
.tbl-wrap{overflow-x:auto;border-radius:16px}
table{width:100%;border-collapse:collapse;min-width:600px}
th{padding:12px 16px;text-align:left;font-size:11px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:.06em;background:rgba(255,255,255,.02);border-bottom:1px solid rgba(255,255,255,.06);white-space:nowrap}
td{padding:13px 16px;font-size:15px;border-bottom:1px solid rgba(255,255,255,.04);white-space:nowrap;color:#94a3b8;transition:background .15s}
tr{transition:background .15s}
tr:hover td{background:rgba(52,211,153,.03)}
 
.ib{cursor:pointer;padding:6px;border-radius:8px;border:none;background:transparent;color:#475569;transition:all .2s;display:inline-flex;align-items:center;justify-content:center}
.ib:hover{color:#34d399;background:rgba(52,211,153,.08)}
.ib-r:hover{color:#f87171;background:rgba(248,113,113,.08)}
 
.pb{height:6px;background:rgba(255,255,255,.05);border-radius:99px;overflow:hidden}.pf{height:100%;border-radius:99px;transition:width .4s}
.tab{padding:8px 18px;border-radius:99px;cursor:pointer;font-size:13px;font-weight:600;color:#64748b;border:none;background:transparent;font-family:'Inter',sans-serif;transition:all .2s}
.tab:hover{color:#cbd5e1}.tab.a{background:rgba(52,211,153,.1);color:#34d399}
 
.fb{height:36px;border-radius:10px;display:flex;align-items:center;padding:0 14px;color:#060a13;font-weight:700;font-size:13px;margin-bottom:6px;transition:width .4s}
 
.bot-nav{display:flex;background:rgba(6,10,19,.96);border-top:1px solid rgba(255,255,255,.06);padding:6px 0;backdrop-filter:blur(12px)}
.bot-item{flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;padding:8px 0;cursor:pointer;font-size:10px;color:#475569;font-weight:600;transition:color .15s}
.bot-item.a{color:#34d399}
.bot-item svg{transition:transform .15s}
.bot-item.a svg{transform:scale(1.1)}
 
.more-menu{position:absolute;bottom:64px;right:8px;background:rgba(10,17,30,.96);border:1px solid rgba(255,255,255,.08);border-radius:16px;box-shadow:0 16px 64px rgba(0,0,0,.5);padding:6px;width:200px;z-index:50;backdrop-filter:blur(16px);animation:fadeUp .15s ease-out}
 
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.6);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;z-index:100;animation:fadeIn .15s}
.modal-box{background:#0c1322;border:1px solid rgba(255,255,255,.08);border-radius:20px;padding:28px;width:540px;max-height:88vh;overflow-y:auto;color:#e2e8f0;animation:scaleIn .2s ease-out;box-shadow:0 32px 80px rgba(0,0,0,.4)}
.modal-mob{width:100%;border-radius:20px 20px 0 0;max-height:92vh;animation:slideUp .25s ease-out;position:fixed;bottom:0;left:0;right:0}
 
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes scaleIn{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}
@keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes spin{to{transform:rotate(360deg)}}.spin{animation:spin .6s linear infinite}
 
.sidebar-section{padding:6px;position:relative}
.sidebar-section::before{content:'';display:block;height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.06),transparent);margin:4px 10px 8px}
`}</style>
 
  {!mob&&<div style={{width:230,background:"rgba(6,10,19,.8)",borderRight:"1px solid rgba(255,255,255,.05)",display:"flex",flexDirection:"column",flexShrink:0}}>
    <div style={{padding:"18px 16px",display:"flex",alignItems:"center",gap:12}}>
      <div style={{width:36,height:36,borderRadius:12,background:"linear-gradient(135deg,#34d399,#0ea5e9)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:18,fontWeight:800,boxShadow:"0 4px 16px rgba(52,211,153,.2)"}}><span style={{fontFamily:"serif"}}>漢</span></div>
      <div><div style={{fontWeight:800,fontSize:15,color:"#f1f5f9",letterSpacing:"-.01em"}}>Hán Tinh</div><div style={{fontSize:10,color:"#34d399",fontWeight:700,letterSpacing:"1.5px"}}>PREMIUM</div></div>
    </div>
    <nav style={{flex:1,padding:"4px 8px",overflow:"auto"}}>
      {menu.map(m=><div key={m.id} className={`ni ${pg===m.id?"a":""}`} style={{position:"relative",marginBottom:2}} onClick={()=>setPg(m.id)}>
        <span style={{opacity:pg===m.id?1:.5,transition:"opacity .2s"}}>{ico[m.id]}</span> {m.l}
      </div>)}
    </nav>
    <div style={{padding:"14px 16px",borderTop:"1px solid rgba(255,255,255,.05)"}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <div style={{width:32,height:32,borderRadius:10,background:"linear-gradient(135deg,rgba(52,211,153,.15),rgba(14,165,233,.1))",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:"#34d399",border:"1px solid rgba(52,211,153,.15)"}}>{user.name.charAt(0)}</div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:13,fontWeight:700,color:"#e2e8f0",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user.name}</div>
          <div style={{fontSize:11,color:"#475569"}}>{isAdmin?"Quản trị viên":"Giáo viên"}</div>
        </div>
        <button onClick={logout} style={{background:"rgba(248,113,113,.08)",border:"none",width:28,height:28,borderRadius:8,cursor:"pointer",color:"#f87171",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .2s"}} title="Đăng xuất"><LogOut size={14}/></button>
      </div>
    </div>
  </div>}
 
  <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
    <div style={{background:"rgba(6,10,19,.7)",padding:"10px 22px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid rgba(255,255,255,.05)",flexShrink:0,backdropFilter:"blur(12px)"}}>
      {mob?<div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:28,height:28,borderRadius:8,background:"linear-gradient(135deg,#34d399,#0ea5e9)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:12,fontWeight:800}}><span style={{fontFamily:"serif"}}>漢</span></div><span style={{fontWeight:800,fontSize:15,color:"#f1f5f9"}}>Hán Tinh</span></div>
      :<div style={{position:"relative",width:280}}><Search size={15} style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",color:"#475569"}}/><input style={{width:"100%",padding:"10px 16px 10px 38px",border:"1px solid rgba(255,255,255,.06)",borderRadius:12,fontSize:14,outline:"none",fontFamily:"'Inter',sans-serif",background:"rgba(255,255,255,.03)",color:"#f1f5f9",transition:"border-color .2s"}} placeholder="Tìm kiếm..." value={q} onChange={e=>setQ(e.target.value)}/></div>}
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        {!mob&&<div style={{position:"relative"}}>
          <div style={{width:32,height:32,borderRadius:10,background:"rgba(255,255,255,.04)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"#475569"}}><Bell size={16}/></div>
          {(ov.length>0||needFU.length>0)&&<div style={{position:"absolute",top:-2,right:-2,width:8,height:8,borderRadius:"50%",background:"#f87171",border:"2px solid #060a13"}}/>}
        </div>}
        {!mob&&<div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:32,height:32,borderRadius:10,background:"linear-gradient(135deg,rgba(52,211,153,.12),rgba(14,165,233,.08))",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:"#34d399"}}>{user.name.charAt(0)}</div><span style={{fontSize:13,color:"#94a3b8",fontWeight:500}}>{user.name}</span></div>}
        {mob&&<button onClick={logout} style={{fontSize:12,color:"#f87171",background:"rgba(248,113,113,.06)",border:"1px solid rgba(248,113,113,.1)",borderRadius:8,padding:"5px 12px",cursor:"pointer",fontWeight:600,fontFamily:"'Inter',sans-serif",display:"flex",alignItems:"center",gap:4}}><LogOut size={12}/>Thoát</button>}
      </div>
    </div>
 
    <div style={{flex:1,overflow:"auto",padding:mob?14:24}}>
 
      {pg==="home"&&<div>
        <h2 style={{fontSize:mob?20:24,fontWeight:800,color:"#f1f5f9",marginBottom:18,letterSpacing:"-.02em"}}>Tổng quan</h2>
        {isAdmin&&<div style={{display:"flex",gap:2,background:"rgba(255,255,255,.03)",borderRadius:99,padding:3,marginBottom:16,width:"fit-content",border:"1px solid rgba(255,255,255,.05)"}}>
          {[["kpi","Chỉ số"],["funnel","Phễu"],["trends","Xu hướng"]].map(([id,l])=><button key={id} className={`tab ${dtab===id?"a":""}`} onClick={()=>setDtab(id)}>{l}</button>)}
        </div>}
        <div style={{display:"grid",gridTemplateColumns:grd(isAdmin?3:2),gap:10,marginBottom:18}}>
          {(isAdmin?[
            {l:"Khách mới",v:leads.filter(l=>l.stage!=="lost").length,c:"#0ea5e9",spark:[8,12,10,15,11,14],trend:12},
            {l:"Học viên",v:act.length,c:"#34d399",spark:[18,20,22,21,24,26],trend:8},
            {l:"HSK đỗ",v:hskRate+"%",c:"#a78bfa",spark:[60,65,70,68,75,hskRate]},
            {l:"Đã thu",v:vnd(collected),c:"#34d399",spark:[42,48,52,58,65,72],trend:11},
            {l:"Nợ HP",v:ov.length,c:"#f87171",trend:ov.length>0?-ov.length*5:0},
            {l:"Cần nhắc",v:needFU.length,c:"#fb923c"}
          ]:[
            {l:"HV lớp tôi",v:stu.filter(s=>canSee(s.cls)).length,c:"#34d399"},
            {l:"Báo cáo",v:rpt.filter(r=>r.teacher===user.name).length,c:"#a78bfa"},
            {l:"Điểm TB",v:(stu.filter(s=>canSee(s.cls)&&s.status==="Đang học").reduce((a,s)=>a+s.score,0)/Math.max(stu.filter(s=>canSee(s.cls)&&s.status==="Đang học").length,1)).toFixed(1),c:"#0ea5e9"},
            {l:"Chuyên cần",v:Math.round(stu.filter(s=>canSee(s.cls)&&s.status==="Đang học").reduce((a,s)=>a+s.attend,0)/Math.max(stu.filter(s=>canSee(s.cls)&&s.status==="Đang học").length,1))+"%",c:"#34d399"}
          ]).map((s,i)=><KPI key={i} label={s.l} value={s.v} color={s.c} sparkData={s.spark} trend={s.trend}/>)}
        </div>
        {dtab==="kpi"&&isAdmin&&<div style={{display:"grid",gridTemplateColumns:grd(3),gap:12}}>
          <div className="card"><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}><AlertTriangle size={16} style={{color:"#f87171"}}/><span style={{fontWeight:700,fontSize:15,color:"#f87171"}}>Cần thu</span></div>{ov.map(f=><div key={f.id} style={{padding:"10px 0",borderBottom:"1px solid rgba(255,255,255,.04)",display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><div style={{fontWeight:600,color:"#e2e8f0",fontSize:14}}>{f.name}</div><span style={{color:"#f87171",fontSize:13}}>{vnd(f.d2)}</span></div><button className="btn btn-p btn-sm" onClick={()=>{setFin(fin.map(x=>x.id===f.id?{...x,st:"paid"}:x));updateRow("finance",{...f,st:"paid"})}}><CheckCircle size={14}/></button></div>)}{ov.length===0&&<div style={{color:"#34d399",display:"flex",alignItems:"center",gap:6,fontSize:14}}><CheckCircle size={14}/>Tất cả OK</div>}</div>
          <div className="card"><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}><Award size={16} style={{color:"#fbbf24"}}/><span style={{fontWeight:700,fontSize:15,color:"#e2e8f0"}}>Top 5</span></div>{ranked.slice(0,5).map((s,i)=><div key={s.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",fontSize:14}}><span style={{color:"#cbd5e1"}}><span style={{fontWeight:700,color:i<3?"#fbbf24":"#64748b",marginRight:6}}>{["1","2","3","4","5"][i]}</span>{s.name}</span><strong style={{color:"#34d399"}}>{s.score}</strong></div>)}</div>
          <div className="card"><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}><ClipboardList size={16} style={{color:"#a78bfa"}}/><span style={{fontWeight:700,fontSize:15,color:"#e2e8f0"}}>Báo cáo mới</span></div>{rpt.slice(0,4).map(r=><div key={r.id} style={{padding:"7px 0",borderBottom:"1px solid rgba(255,255,255,.04)",fontSize:13}}><span style={{fontWeight:600,color:"#e2e8f0"}}>{r.teacher}</span> <span style={{color:"#64748b"}}>· {r.cls} · {r.date}</span></div>)}</div>
        </div>}
        {dtab==="funnel"&&isAdmin&&<div style={{display:"grid",gridTemplateColumns:grd(2),gap:12}}>
          <div className="card"><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}><Target size={16} style={{color:"#34d399"}}/><span style={{fontWeight:700,fontSize:15,color:"#e2e8f0"}}>Phễu chuyển đổi</span></div>{funnelData.map((f,i)=><div key={f.s} className="fb" style={{width:Math.max((f.v/Math.max(funnelData[0].v,1))*100,25)+"%",background:CL[i],transition:"width .4s"}}>{f.s}: {f.v}</div>)}</div>
          <CC title="Nguồn khách" icon={<BarChart3 size={16} style={{color:"#0ea5e9"}}/>}><PieChart><Pie data={srcData} cx="50%" cy="50%" innerRadius={35} outerRadius={65} dataKey="v" label={({name,v})=>name.slice(0,5)+":"+v} fontSize={12}>{srcData.map((e,i)=><Cell key={i} fill={CL[i]}/>)}</Pie><Tooltip content={<ChartTooltip/>}/></PieChart></CC>
        </div>}
        {dtab==="trends"&&isAdmin&&<div style={{display:"grid",gridTemplateColumns:grd(2),gap:12}}>
          <CC title="Doanh thu theo tháng" icon={<TrendingUp size={16} style={{color:"#34d399"}}/>}><BarChart data={monthTrend}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.04)"/><XAxis dataKey="m" fontSize={12} stroke="#475569" tickLine={false}/><YAxis fontSize={12} stroke="#475569" tickLine={false} axisLine={false}/><Tooltip content={<ChartTooltip/>}/><Bar dataKey="rev" fill="#34d399" radius={[6,6,0,0]}/></BarChart></CC>
          <CC title="Chuyên cần theo tuần" icon={<BarChart3 size={16} style={{color:"#0ea5e9"}}/>}><LineChart data={attendTrend}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.04)"/><XAxis dataKey="w" fontSize={12} stroke="#475569" tickLine={false}/><YAxis domain={[80,100]} fontSize={12} stroke="#475569" tickLine={false} axisLine={false}/><Tooltip content={<ChartTooltip/>}/><Line type="monotone" dataKey="v" stroke="#0ea5e9" strokeWidth={2.5} dot={{fill:"#0ea5e9",r:4,strokeWidth:0}}/></LineChart></CC>
        </div>}
      </div>}
 
      {pg==="leads"&&isAdmin&&<div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:8}}><h2 style={{fontSize:22,fontWeight:800,color:"#f1f5f9",display:"flex",alignItems:"center",gap:8}}><Target size={22} style={{color:"#34d399"}}/>Khách tiềm năng</h2><button className="btn btn-p" onClick={()=>om("l",{id:"LD"+Date.now(),name:"",phone:"",source:"Facebook",stage:"inquiry",interest:"HSK 1",note:"",created:today,lastContact:today},1)}><Plus size={16}/>Thêm</button></div>
        <div className="tbl-wrap"><div className="card" style={{padding:0,overflow:"hidden"}}><table><thead><tr>{["Tên","SĐT","Nguồn","QT","GĐ",""].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{leads.map(l=><tr key={l.id}><td style={{fontWeight:600,color:"#e2e8f0"}}>{l.name}</td><td>{l.phone}</td><td>{B(l.source,{Facebook:"b",TikTok:"p","Giới thiệu":"g","Walk-in":"o",Website:"y"}[l.source]||"gr")}</td><td>{B(l.interest,"b")}</td><td>{{inquiry:B("Hỏi","b"),trial:B("Thử","o"),registered:B("ĐK","g"),lost:B("Mất","gr")}[l.stage]}</td>
          <td><div style={{display:"flex",gap:4,alignItems:"center"}}>{l.stage==="inquiry"&&<button className="btn btn-sm" style={{background:"rgba(251,146,60,.1)",color:"#fb923c",border:"1px solid rgba(251,146,60,.15)"}} onClick={()=>{setLeads(leads.map(x=>x.id===l.id?{...x,stage:"trial"}:x));updateRow("leads",{...l,stage:"trial"})}}><ChevronRight size={14}/>Thử</button>}{l.stage==="trial"&&<button className="btn btn-sm btn-p" onClick={()=>{setLeads(leads.map(x=>x.id===l.id?{...x,stage:"registered"}:x));updateRow("leads",{...l,stage:"registered"})}}><ChevronRight size={14}/>ĐK</button>}<button className="ib" onClick={()=>om("l",{...l},0)}><Pencil size={14}/></button><button className="ib ib-r" onClick={()=>{if(confirm("Xoá?"))doDel("l",l.id)}}><Trash2 size={14}/></button></div></td></tr>)}</tbody></table></div></div>
      </div>}
 
      {pg==="stu"&&<div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:8}}><h2 style={{fontSize:22,fontWeight:800,color:"#f1f5f9",display:"flex",alignItems:"center",gap:8}}><Users size={22} style={{color:"#34d399"}}/>Học viên</h2>{isAdmin&&<button className="btn btn-p" onClick={()=>om("s",{id:"HV"+Date.now(),name:"",phone:"",cls:cls2[0]?.id||"",level:"HSK 1",status:"Đang học",score:0,attend:90,source:"Facebook"},1)}><Plus size={16}/>Thêm</button>}</div>
        <div className="tbl-wrap"><div className="card" style={{padding:0,overflow:"hidden"}}><table><thead><tr>{["#","HV","Level","Lớp","Điểm","CC","TT",...(isAdmin?[""]:[])] .map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{stu.filter(s=>(!q||s.name.toLowerCase().includes(query))&&canSee(s.cls)).map((s,i)=><tr key={s.id}><td style={{color:"#475569",fontSize:13}}>{i+1}</td><td><div style={{fontWeight:600,color:"#e2e8f0"}}>{s.name}</div><div style={{color:"#475569",fontSize:13}}>{s.phone}</div></td><td>{B(s.level,"b")}</td><td style={{fontWeight:500}}>{s.cls}</td><td style={{fontWeight:800,color:s.score>=8?"#34d399":s.score>=6.5?"#fbbf24":"#f87171",fontSize:18}}>{s.score}</td><td><div style={{display:"flex",alignItems:"center",gap:6}}><div className="pb" style={{width:60}}><div className="pf" style={{width:s.attend+"%",background:s.attend>=90?"#34d399":"#fbbf24"}}/></div><span style={{fontSize:13,color:s.attend>=90?"#34d399":"#fbbf24",fontWeight:600}}>{s.attend}%</span></div></td><td>{B(s.status,s.status==="Đang học"?"g":s.status==="Tạm nghỉ"?"y":"gr")}</td>
          {isAdmin&&<td><div style={{display:"flex",gap:2}}><button className="ib" onClick={()=>om("s",{...s},0)}><Pencil size={14}/></button><button className="ib ib-r" onClick={()=>{if(confirm("Xoá?"))doDel("s",s.id)}}><Trash2 size={14}/></button></div></td>}</tr>)}</tbody></table></div></div>
      </div>}
 
      {pg==="trials"&&isAdmin&&<div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:8}}><h2 style={{fontSize:22,fontWeight:800,color:"#f1f5f9",display:"flex",alignItems:"center",gap:8}}><BookOpen size={22} style={{color:"#34d399"}}/>Học thử</h2><button className="btn btn-p" onClick={()=>om("tr",{id:"TL"+Date.now(),name:"",phone:"",source:"Facebook",date:today,time:"18:00",cls:cls2[0]?.id||"",teacher:teachers[0]||"",status:"scheduled",result:"",followUp:""},1)}><Plus size={16}/>Xếp lịch</button></div>
        <div className="tbl-wrap"><div className="card" style={{padding:0,overflow:"hidden"}}><table><thead><tr>{["Tên","Ngày","Lớp","TT","KQ","Nhắc",""].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{trials.map(t=><tr key={t.id}><td style={{fontWeight:600,color:"#e2e8f0"}}>{t.name}</td><td style={{fontSize:14}}><div style={{display:"flex",alignItems:"center",gap:4}}><CalendarDays size={13} style={{color:"#475569"}}/>{t.date} <Clock size={13} style={{color:"#475569",marginLeft:4}}/>{t.time}</div></td><td>{t.cls}</td><td>{{scheduled:B("Xếp","b"),completed:B("Xong","g"),"no-show":B("KĐ","r")}[t.status]||B(t.status,"gr")}</td><td>{t.result?{enrolled:B("ĐK","g"),thinking:B("Nghĩ","y"),"not-interested":B("KQT","gr")}[t.result]:<span style={{color:"#475569"}}>—</span>}</td><td style={{color:t.followUp&&daysLeft(t.followUp)<=1?"#f87171":"#475569",fontSize:14}}>{t.followUp||"—"}</td>
          <td><div style={{display:"flex",gap:4,alignItems:"center"}}>{t.status==="scheduled"&&<button className="btn btn-sm btn-p" onClick={()=>{setTrials(trials.map(x=>x.id===t.id?{...x,status:"completed"}:x));updateRow("trials",{...t,status:"completed"})}}><CheckCircle size={14}/></button>}<button className="ib" onClick={()=>om("tr",{...t},0)}><Pencil size={14}/></button></div></td></tr>)}</tbody></table></div></div>
      </div>}
 
      {pg==="contracts"&&isAdmin&&<div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:8}}><h2 style={{fontSize:22,fontWeight:800,color:"#f1f5f9",display:"flex",alignItems:"center",gap:8}}><FileText size={22} style={{color:"#34d399"}}/>Hợp đồng</h2><button className="btn btn-p" onClick={()=>om("ct",{id:"HD"+Date.now(),name:"",cls:cls2[0]?.id||"",start:today,end:"",duration:"6 tháng",fee:0,status:"active",note:""},1)}><Plus size={16}/>Tạo</button></div>
        <div className="tbl-wrap"><div className="card" style={{padding:0,overflow:"hidden"}}><table><thead><tr>{["HV","Lớp","BĐ","KT","Phí","TT","Còn",""].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{contracts.map(c=>{const dl=daysLeft(c.end);const rs=c.status==="renewed"?"renewed":dl<=0?"expired":dl<=30?"expiring":"active";return<tr key={c.id}><td style={{fontWeight:600,color:"#e2e8f0"}}>{c.name}</td><td>{B(c.cls,"b")}</td><td style={{fontSize:14}}>{c.start}</td><td style={{fontSize:14}}>{c.end}</td><td style={{fontWeight:700,color:"#34d399"}}>{vnd(c.fee)}</td><td>{{active:B("OK","g"),expiring:B("Sắp hết","y"),expired:B("Hết","r"),renewed:B("GH","b")}[rs]}</td><td style={{fontWeight:700,color:dl<=0?"#f87171":dl<=30?"#fbbf24":"#34d399"}}>{dl<=0?"Hết":dl+"d"}</td>
          <td><div style={{display:"flex",gap:4,alignItems:"center"}}>{(rs==="expiring"||rs==="expired")&&<button className="btn btn-sm btn-p" onClick={()=>{const nc={...c,status:"renewed"};setContracts(contracts.map(x=>x.id===c.id?nc:x));updateRow("contracts",nc)}}>Gia hạn</button>}<button className="ib" onClick={()=>om("ct",{...c},0)}><Pencil size={14}/></button></div></td></tr>})}</tbody></table></div></div>
      </div>}
 
      {pg==="hsk"&&<div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:8}}><h2 style={{fontSize:22,fontWeight:800,color:"#f1f5f9",display:"flex",alignItems:"center",gap:8}}><GraduationCap size={22} style={{color:"#34d399"}}/>Thi HSK</h2>{isAdmin&&<button className="btn btn-p" onClick={()=>om("hk",{id:"HSK"+Date.now(),name:"",level:"HSK 1",examDate:"",score:0,passed:"",status:"registered"},1)}><Plus size={16}/>Đăng ký</button>}</div>
        <div style={{display:"grid",gridTemplateColumns:grd(2),gap:12,marginBottom:16}}>
          <CC title="Kết quả theo level" icon={<BarChart3 size={16} style={{color:"#a78bfa"}}/>}><BarChart data={["HSK 1","HSK 2","HSK 3","HSK 4","HSK 5"].map(l=>({l,p:hsk.filter(h=>h.level===l&&h.passed==="yes").length,f:hsk.filter(h=>h.level===l&&h.passed==="no").length}))}><XAxis dataKey="l" fontSize={12} stroke="#475569" tickLine={false}/><YAxis fontSize={12} stroke="#475569" tickLine={false} axisLine={false}/><Tooltip content={<ChartTooltip/>}/><Bar dataKey="p" name="Đạt" fill="#34d399" stackId="a" radius={[6,6,0,0]}/><Bar dataKey="f" name="Trượt" fill="#f87171" stackId="a" radius={[6,6,0,0]}/></BarChart></CC>
          <div className="card" style={{textAlign:"center",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}><div style={{fontSize:16,fontWeight:700,marginBottom:12,color:"#e2e8f0"}}>Tỷ lệ đỗ</div><div style={{fontSize:52,fontWeight:800,color:hskRate>=70?"#34d399":"#fbbf24",lineHeight:1}}>{hskRate}%</div><div style={{fontSize:14,color:"#64748b",marginTop:6}}>{hskP}/{hskTt} đạt</div><div className="pb" style={{marginTop:12,width:"60%"}}><div className="pf" style={{width:hskRate+"%",background:hskRate>=70?"linear-gradient(90deg,#34d399,#0ea5e9)":"#fbbf24"}}/></div></div>
        </div>
        <div className="tbl-wrap"><div className="card" style={{padding:0,overflow:"hidden"}}><table><thead><tr>{["HV","Level","Ngày","Điểm","KQ",...(isAdmin?[""]:[])] .map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{hsk.map(h=><tr key={h.id}><td style={{fontWeight:600,color:"#e2e8f0"}}>{h.name}</td><td>{B(h.level,"p")}</td><td style={{fontSize:14}}>{h.examDate}</td><td style={{fontWeight:700,fontSize:18}}>{h.score||<span style={{color:"#475569"}}>—</span>}</td><td>{h.passed==="yes"?B("ĐẠT","g"):h.passed==="no"?B("Trượt","r"):B("Chưa","b")}</td>{isAdmin&&<td><button className="ib" onClick={()=>om("hk",{...h},0)}><Pencil size={14}/></button></td>}</tr>)}</tbody></table></div></div>
      </div>}
 
      {pg==="rpt"&&<div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:8}}><h2 style={{fontSize:22,fontWeight:800,color:"#f1f5f9",display:"flex",alignItems:"center",gap:8}}><ClipboardList size={22} style={{color:"#34d399"}}/>Báo cáo</h2><button className="btn btn-p" onClick={()=>om("r",{id:"RP"+Date.now(),date:today,teacher:isAdmin?(teachers[0]||""):user.name,cls:cls2[0]?.id||"",present:0,absent:0,absentNames:"",lesson:"",homework:"",flags:"",highlights:""},1)}><Plus size={16}/>Tạo</button></div>
        {rpt.filter(r=>isAdmin||r.teacher===user.name).map(r=><div key={r.id} className="card" style={{marginBottom:10}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:28,height:28,borderRadius:8,background:"linear-gradient(135deg,rgba(167,139,250,.1),rgba(52,211,153,.08))",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:"#a78bfa"}}>{r.teacher?.charAt(0)}</div>
              <div><strong style={{fontSize:14,color:"#e2e8f0"}}>{r.teacher}</strong> <span style={{color:"#475569",fontSize:13}}>{r.cls} · {r.date}</span></div>
            </div>
            <div style={{display:"flex",gap:6,alignItems:"center"}}>{B(r.present+"/"+(r.present+r.absent),r.absent===0?"g":"y")}<button className="ib" onClick={()=>om("r",{...r},0)}><Pencil size={14}/></button></div>
          </div>
          <div style={{fontSize:14,color:"#94a3b8",display:"flex",alignItems:"start",gap:6}}><BookOpen size={14} style={{color:"#64748b",marginTop:2,flexShrink:0}}/>{r.lesson}</div>
          {r.flags&&<div style={{background:"rgba(248,113,113,.04)",borderRadius:10,padding:"8px 12px",marginTop:8,fontSize:13,color:"#f87171",border:"1px solid rgba(248,113,113,.08)",display:"flex",alignItems:"start",gap:6}}><AlertTriangle size={13} style={{marginTop:1,flexShrink:0}}/>{r.flags}</div>}
          {r.highlights&&<div style={{background:"rgba(52,211,153,.04)",borderRadius:10,padding:"8px 12px",marginTop:8,fontSize:13,color:"#34d399",border:"1px solid rgba(52,211,153,.08)",display:"flex",alignItems:"start",gap:6}}><Star size={13} style={{marginTop:1,flexShrink:0}}/>{r.highlights}</div>}
        </div>)}
      </div>}
 
      {pg==="log"&&isAdmin&&<div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}><h2 style={{fontSize:22,fontWeight:800,color:"#f1f5f9",display:"flex",alignItems:"center",gap:8}}><MessageSquare size={22} style={{color:"#34d399"}}/>Lịch sử tương tác</h2><button className="btn btn-p" onClick={()=>om("i",{id:"IT"+Date.now(),ref:"",refName:"",date:today,type:"call",content:"",by:"Admin"},1)}><Plus size={16}/>Thêm</button></div>
        {inter.map(it=><div key={it.id} style={{display:"flex",gap:14,padding:"14px 0",borderBottom:"1px solid rgba(255,255,255,.04)"}}>
          <div style={{width:32,height:32,borderRadius:10,background:it.type==="call"?"rgba(52,211,153,.08)":it.type==="meeting"?"rgba(251,191,36,.08)":"rgba(14,165,233,.08)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            {it.type==="call"?<Phone size={14} style={{color:"#34d399"}}/>:it.type==="meeting"?<Handshake size={14} style={{color:"#fbbf24"}}/>:<MessageCircle size={14} style={{color:"#0ea5e9"}}/>}
          </div>
          <div style={{flex:1}}>
            <div style={{display:"flex",alignItems:"center",gap:6}}><strong style={{color:"#e2e8f0",fontSize:14}}>{it.refName}</strong><span style={{color:"#475569",fontSize:12}}>{it.date}</span>{B(it.type==="call"?"Gọi":it.type==="meeting"?"Gặp":"Nhắn",it.type==="call"?"g":it.type==="meeting"?"y":"b")}</div>
            <div style={{color:"#94a3b8",marginTop:4,fontSize:14,lineHeight:1.5}}>{it.content}</div>
          </div>
        </div>)}
      </div>}
 
      {pg==="fin"&&isAdmin&&<div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}><h2 style={{fontSize:22,fontWeight:800,color:"#f1f5f9",display:"flex",alignItems:"center",gap:8}}><Wallet size={22} style={{color:"#34d399"}}/>Tài chính</h2><button className="btn btn-p" onClick={()=>om("f",{id:"HP"+Date.now(),name:"",cls:cls2[0]?.id||"",total:0,d1:0,d2:0,d2d:"",st:"pending"},1)}><Plus size={16}/>Thêm</button></div>
        <div className="tbl-wrap"><div className="card" style={{padding:0,overflow:"hidden"}}><table><thead><tr>{["HV","Lớp","Tổng","Đ1","Đ2","Hạn","TT",""].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{fin.map(f=><tr key={f.id}><td style={{fontWeight:600,color:"#e2e8f0"}}>{f.name}</td><td>{B(f.cls,"b")}</td><td style={{fontWeight:700,color:"#34d399"}}>{vnd(f.total)}</td><td style={{fontSize:14}}>{vnd(f.d1)}</td><td style={{fontSize:14}}>{vnd(f.d2)}</td><td style={{color:f.st==="overdue"?"#f87171":"#475569",fontSize:14}}>{f.d2d}</td><td>{f.st==="paid"?B("OK","g"):f.st==="pending"?B("Chờ","y"):B("Nợ","r")}</td>
          <td><div style={{display:"flex",gap:4,alignItems:"center"}}>{f.st!=="paid"&&<button className="btn btn-p btn-sm" onClick={()=>{setFin(fin.map(x=>x.id===f.id?{...x,st:"paid"}:x));updateRow("finance",{...f,st:"paid"})}}><CheckCircle size={14}/></button>}<button className="ib" onClick={()=>om("f",{...f},0)}><Pencil size={14}/></button></div></td></tr>)}</tbody></table></div></div>
      </div>}
 
      {pg==="charts"&&isAdmin&&<div>
        <h2 style={{fontSize:22,fontWeight:800,marginBottom:16,color:"#f1f5f9",display:"flex",alignItems:"center",gap:8}}><BarChart3 size={22} style={{color:"#34d399"}}/>Biểu đồ</h2>
        <div style={{display:"grid",gridTemplateColumns:grd(2),gap:12}}>
          <CC title="Doanh thu" icon={<TrendingUp size={16} style={{color:"#34d399"}}/>}><BarChart data={monthTrend}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.04)"/><XAxis dataKey="m" fontSize={12} stroke="#475569" tickLine={false}/><YAxis fontSize={12} stroke="#475569" tickLine={false} axisLine={false}/><Tooltip content={<ChartTooltip/>}/><Bar dataKey="rev" fill="#34d399" radius={[6,6,0,0]}/></BarChart></CC>
          <CC title="Chuyên cần" icon={<BarChart3 size={16} style={{color:"#0ea5e9"}}/>}><LineChart data={attendTrend}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.04)"/><XAxis dataKey="w" fontSize={12} stroke="#475569" tickLine={false}/><YAxis domain={[80,100]} fontSize={12} stroke="#475569" tickLine={false} axisLine={false}/><Tooltip content={<ChartTooltip/>}/><Line type="monotone" dataKey="v" stroke="#0ea5e9" strokeWidth={2.5} dot={{fill:"#0ea5e9",r:4,strokeWidth:0}}/></LineChart></CC>
          <CC title="Thanh toán" icon={<Wallet size={16} style={{color:"#fbbf24"}}/>}><PieChart><Pie data={payPie} cx="50%" cy="50%" innerRadius={35} outerRadius={65} dataKey="v" label={({n,v})=>n+":"+v} fontSize={12}>{payPie.map((e,i)=><Cell key={i} fill={[CL[0],CL[3],CL[4]][i]}/>)}</Pie><Tooltip content={<ChartTooltip/>}/></PieChart></CC>
          <CC title="Phân bố điểm" icon={<GraduationCap size={16} style={{color:"#a78bfa"}}/>}><BarChart data={scoreDist}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.04)"/><XAxis dataKey="r" fontSize={12} stroke="#475569" tickLine={false}/><YAxis fontSize={12} stroke="#475569" tickLine={false} axisLine={false}/><Tooltip content={<ChartTooltip/>}/><Bar dataKey="n" fill="#a78bfa" radius={[6,6,0,0]}/></BarChart></CC>
        </div>
      </div>}
    </div>
  </div>
 
  {mob&&<div className="bot-nav">
    {mobNav.map(m=><div key={m.id} className={`bot-item ${pg===m.id||(m.id==="more"&&showMenu)?"a":""}`} onClick={()=>{if(m.id==="more")setShowMenu(!showMenu);else{setPg(m.id);setShowMenu(false)}}}><span>{mIco[m.id]}</span><span>{m.l}</span></div>)}
    {showMenu&&<div className="more-menu">{moreMenu.map(m=><div key={m.id} className="ni" onClick={()=>{setPg(m.id);setShowMenu(false)}}>{ico[m.id]} {m.l}</div>)}<div className="ni" onClick={logout} style={{color:"#f87171"}}><LogOut size={16}/> Thoát</div></div>}
  </div>}
 
  {modal&&<ModalForm type={modal.t} initial={modal.d} isNew={modal.n} cls2={cls2} teachers={teachers} isAdmin={isAdmin} userName={user.name} mob={mob}
    onSave={async d=>{await doSave(modal.t,d,modal.n);setModal(null)}} onClose={()=>setModal(null)}/>}
</div>
);
}
