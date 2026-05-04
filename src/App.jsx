import { useState, useEffect, useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from "recharts";
import { supabase } from "./supabase";
import { LayoutDashboard, Target, BookOpen, Users, FileText, GraduationCap, ClipboardList, MessageSquare, Wallet, BarChart3, Plus, Pencil, Trash2, Search, Check, LogOut, X, ChevronRight, TrendingUp, TrendingDown, Bell, Save, Menu, Phone, MessageCircle, Handshake, AlertTriangle, Star, Award } from "lucide-react";
 
const D=s=>{try{return decodeURIComponent(s)}catch(e){return s}};
const L={
  tq:D("T%E1%BB%95ng%20quan"),
  km:D("Kh%C3%A1ch%20m%E1%BB%9Bi"),
  ht:D("H%E1%BB%8Dc%20th%E1%BB%AD"),
  hv:D("H%E1%BB%8Dc%20vi%C3%AAn"),
  hd:D("H%E1%BB%A3p%20%C4%91%E1%BB%93ng"),
  bc:D("B%C3%A1o%20c%C3%A1o"),
  ls:D("L%E1%BB%8Bch%20s%E1%BB%AD"),
  tc:D("T%C3%A0i%20ch%C3%ADnh"),
  bd:D("Bi%E1%BB%83u%20%C4%91%E1%BB%93"),
  ktn:D("Kh%C3%A1ch%20ti%E1%BB%81m%20n%C4%83ng"),
  htinh:D("H%C3%A1n%20Tinh"),
  dnhap:D("%C4%90%C4%83ng%20nh%E1%BA%ADp"),
  dnht:D("%C4%90%C4%83ng%20nh%E1%BA%ADp%20h%E1%BB%87%20th%E1%BB%91ng"),
  tkh:D("T%C3%A0i%20kho%E1%BA%A3n"),
  mk:D("M%E1%BA%ADt%20kh%E1%BA%A9u"),
  saitk:D("Sai%20t%C3%A0i%20kho%E1%BA%A3n%20ho%E1%BA%B7c%20m%E1%BA%ADt%20kh%E1%BA%A9u"),
  them:D("Th%C3%AAm"),
  themmoi:D("Th%C3%AAm%20m%E1%BB%9Bi"),
  sua:D("Ch%E1%BB%89nh%20s%E1%BB%ADa"),
  luu:D("L%C6%B0u"),
  huy:D("Hu%E1%BB%B7"),
  xlich:D("X%E1%BA%BFp%20l%E1%BB%8Bch"),
  tao:D("T%E1%BA%A1o"),
  thoat:D("Tho%C3%A1t"),
  xoa:D("Xo%C3%A1%3F"),
  dk:D("%C4%90K"),
  gh:D("Gia%20h%E1%BA%A1n"),
  dthu:D("%C4%90%C3%A3%20thu"),
  nohp:D("N%E1%BB%A3%20HP"),
  cnhac:D("C%E1%BA%A7n%20nh%E1%BA%AFc"),
  hvlt:D("HV%20l%E1%BB%9Bp%20t%C3%B4i"),
  dtb:D("%C4%90i%E1%BB%83m%20TB"),
  ccan:D("Chuy%C3%AAn%20c%E1%BA%A7n"),
  hskdo:D("HSK%20%C4%91%E1%BB%97"),
  cthu:D("C%E1%BA%A7n%20thu"),
  gday:D("G%E1%BA%A7n%20%C4%91%C3%A2y"),
  cxl:D("c%E1%BA%A7n%20x%E1%BB%AD%20l%C3%BD"),
  chiso:D("Ch%E1%BB%89%20s%E1%BB%91"),
  pheu:D("Ph%E1%BB%85u"),
  xhg:D("Xu%20h%C6%B0%E1%BB%9Bng"),
  dthu2:D("Doanh%20thu"),
  thtoan:D("Thanh%20to%C3%A1n"),
  kqua:D("K%E1%BA%BFt%20qu%E1%BA%A3"),
  tyle:D("T%E1%BB%B7%20l%E1%BB%87"),
  nguon:D("Ngu%E1%BB%93n"),
  diem:D("%C4%90i%E1%BB%83m"),
  ten:D("T%C3%AAn"),
  sdt:D("S%C4%90T"),
  nguonh:D("Ngu%E1%BB%93n"),
  lop:D("L%E1%BB%9Bp"),
  diemh:D("%C4%90i%E1%BB%83m"),
  ngay:D("Ng%C3%A0y"),
  han:D("H%E1%BA%A1n"),
  tong:D("T%E1%BB%95ng"),
  con:D("C%C3%B2n"),
  phi:D("Ph%C3%AD"),
  nhac:D("Nh%E1%BA%AFc"),
  gd:D("G%C4%90"),
  hoten:D("H%E1%BB%8D%20t%C3%AAn"),
  nguonf:D("Ngu%E1%BB%93n"),
  qtam:D("Quan%20t%C3%A2m"),
  gdoan:D("Giai%20%C4%91o%E1%BA%A1n"),
  gchu:D("Ghi%20ch%C3%BA"),
  tdo:D("Tr%C3%ACnh%20%C4%91%E1%BB%99"),
  tthai:D("Tr%E1%BA%A1ng%20th%C3%A1i"),
  than:D("Th%E1%BB%9Di%20h%E1%BA%A1n"),
  bdau:D("B%E1%BA%AFt%20%C4%91%E1%BA%A7u"),
  kthuc:D("K%E1%BA%BFt%20th%C3%BAc"),
  hphi:D("H%E1%BB%8Dc%20ph%C3%AD"),
  nthi:D("Ng%C3%A0y%20thi"),
  cthi:D("Ch%C6%B0a%20thi"),
  dat:D("%C4%90%E1%BA%A0T"),
  cdat:D("Ch%C6%B0a%20%C4%91%E1%BA%A1t"),
  comat:D("C%C3%B3%20m%E1%BA%B7t"),
  vang:D("V%E1%BA%AFng"),
  hvvang:D("HV%20v%E1%BA%AFng"),
  bhoc:D("B%C3%A0i%20h%E1%BB%8Dc"),
  chuy:D("Ch%C3%BA%20%C3%BD"),
  nbat:D("N%E1%BB%95i%20b%E1%BA%ADt"),
  ndung:D("N%E1%BB%99i%20dung"),
  nguoi:D("Ng%C6%B0%E1%BB%9Di"),
  loai:D("Lo%E1%BA%A1i"),
  boi:D("B%E1%BB%9Fi"),
  tphi:D("T%E1%BB%95ng%20ph%C3%AD"),
  hdot2:D("H%E1%BA%A1n%20%C4%91%E1%BB%A3t%202"),
  nlai:D("Nh%E1%BA%AFc%20l%E1%BA%A1i"),
  hvien:D("H%E1%BB%8Dc%20vi%C3%AAn"),
  gio:D("Gi%E1%BB%9D"),
  htham:D("H%E1%BB%8Fi%20th%C4%83m"),
  hthu:D("H%E1%BB%8Dc%20th%E1%BB%AD"),
  dadk:D("%C4%90%C3%A3%20%C4%90K"),
  mat:D("M%E1%BA%A5t"),
  dhoc:D("%C4%90ang%20h%E1%BB%8Dc"),
  tnghi:D("T%E1%BA%A1m%20ngh%E1%BB%89"),
  nghih:D("Ngh%E1%BB%89%20h%E1%BB%8Dc"),
  dxep:D("%C4%90%C3%A3%20x%E1%BA%BFp"),
  dahoc:D("%C4%90%C3%A3%20h%E1%BB%8Dc"),
  kden:D("Kh%C3%B4ng%20%C4%91%E1%BA%BFn"),
  snghi:D("Suy%20ngh%C4%A9"),
  kqt:D("Kh%C3%B4ng%20QT"),
  ddong:D("%C4%90%C3%A3%20%C4%91%C3%B3ng"),
  cho:D("Ch%E1%BB%9D"),
  qhan:D("Qu%C3%A1%20h%E1%BA%A1n"),
  "3t":D("3%20th%C3%A1ng"),
  "6t":D("6%20th%C3%A1ng"),
  "12t":D("12%20th%C3%A1ng"),
  "18t":D("18%20th%C3%A1ng"),
  gthieu:D("Gi%E1%BB%9Bi%20thi%E1%BB%87u"),
  goi:D("G%E1%BB%8Di"),
  nhan:D("Nh%E1%BA%AFn"),
  gap:D("G%E1%BA%B7p"),
  bhoi:D("H%E1%BB%8Fi"),
  bthu:D("Th%E1%BB%AD"),
  bxep:D("X%E1%BA%BFp"),
  bxong:D("Xong"),
  bkd:D("K%C4%90"),
  bnghi:D("Ngh%C4%A9"),
  bkqt:D("KQT"),
  bsap:D("S%E1%BA%AFp"),
  bhet:D("H%E1%BA%BFt"),
  btruot:D("Tr%C6%B0%E1%BB%A3t"),
  bchua:D("Ch%C6%B0a"),
  bdu:D("%C4%90%E1%BB%A7"),
  bno:D("N%E1%BB%A3"),
  bdatl:D("%C4%90%E1%BA%A1t"),
  cohoa:D("C%C3%B4%20Hoa"),
  tlong:D("Th%E1%BA%A7y%20Long"),
  cowang:D("C%C3%B4%20Wang%20Li"),
  tnam:D("Th%E1%BA%A7y%20Nam"),
  tkiem:D("T%C3%ACm%20ki%E1%BA%BFm..."),
  dong:D("%C4%91")
};
 
const FM={leads:{lastContact:"last_contact"},reports:{absentNames:"absent_names"},interactions:{refName:"ref_name",by:"by_user"},trials:{date:"trial_date",time:"trial_time",followUp:"follow_up"},contracts:{start:"start_date",end:"end_date"},hsk_exams:{examDate:"exam_date"}};
function toDb(t,o){const m=FM[t];if(!m)return{...o};const r={};for(const[k,v]of Object.entries(o))r[m[k]||k]=v;return r}
function toApp(t,o){const m=FM[t];if(!m)return{...o};const rm={};for(const[k,v]of Object.entries(m))rm[v]=k;const r={};for(const[k,v]of Object.entries(o))r[rm[k]||k]=v;return r}
async function loadT(t){try{const{data}=await supabase.from(t).select("*");return(data||[]).map(r=>toApp(t,r))}catch{return[]}}
async function addRow(t,row){const d=toDb(t,row);delete d.created_at;await supabase.from(t).insert([d])}
async function updateRow(t,row){const d=toDb(t,row);delete d.created_at;await supabase.from(t).update(d).eq("id",row.id)}
async function deleteRow(t,id){await supabase.from(t).delete().eq("id",id)}
 
const vnd=n=>new Intl.NumberFormat("vi-VN").format(n)+L.dong;
const today=new Date().toISOString().slice(0,10);
const A="#10B981";
const CX=["#10B981","#3B82F6","#8B5CF6","#F59E0B","#EF4444","#06B6D4","#F97316"];
const daysLeft=d=>{if(!d)return 0;const t=new Date(d).getTime();return Number.isFinite(t)?Math.ceil((t-Date.now())/86400000):0};
const FN="Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif";
const USERS=[
{user:"admin",pass:"hantinh2026",role:"admin",name:"Admin",cls:"all"},
{user:"cohoa",pass:"gv2026",role:"teacher",name:L.cohoa,cls:"CN-A1"},
{user:"thaylong",pass:"gv2026",role:"teacher",name:L.tlong,cls:"CN-A3,CN-B2"},
{user:"cowang",pass:"gv2026",role:"teacher",name:L.cowang,cls:"CN-A2"},
{user:"thaynam",pass:"gv2026",role:"teacher",name:L.tnam,cls:"CN-B1"},
];
const monthTrend=[{m:"T12",rev:42,lead:8,enroll:2},{m:"T1",rev:48,lead:12,enroll:4},{m:"T2",rev:52,lead:10,enroll:3},{m:"T3",rev:58,lead:15,enroll:5},{m:"T4",rev:65,lead:11,enroll:3},{m:"T5",rev:72,lead:14,enroll:5}];
const attendTrend=[{w:"T1",v:88},{w:"T2",v:91},{w:"T3",v:85},{w:"T4",v:93},{w:"T5",v:90},{w:"T6",v:87},{w:"T7",v:92},{w:"T8",v:94}];
 
function Spark({data,w=80,h=28}){if(!data||data.length<2)return null;const mn=Math.min(...data),mx=Math.max(...data),rg=mx-mn||1;const pts=data.map((v,i)=>(i/(data.length-1))*w+","+(h-2-((v-mn)/rg)*(h-4))).join(" ");return<svg width={w} height={h} style={{display:"block"}}><polyline points={pts} fill="none" stroke={A} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity=".45"/></svg>}
 
function Tip({active,payload,label}){if(!active||!payload?.length)return null;return<div style={{background:"#27272A",border:"1px solid #3F3F46",borderRadius:8,padding:"8px 12px",fontSize:12,fontFamily:FN}}><div style={{color:"#71717A",fontSize:10,fontWeight:600,marginBottom:4}}>{label}</div>{payload.map((p,i)=><div key={i} style={{color:"#FAFAFA",fontWeight:600}}>{p.name}: <span style={{color:p.color||A}}>{p.value}</span></div>)}</div>}
 
function Bd({t,v}){const m={ok:["#10B98118",A],er:["#EF444415","#EF4444"],wa:["#F59E0B12","#F59E0B"],in:["#3B82F612","#3B82F6"],mu:["#27272A","#71717A"],pu:["#8B5CF612","#8B5CF6"],or:["#F9731612","#F97316"]};const[bg,fg]=m[v]||m.mu;return<span style={{display:"inline-block",padding:"2px 8px",borderRadius:4,fontSize:10,fontWeight:600,background:bg,color:fg}}>{t}</span>}
 
function ModalForm({type,initial,isNew,onSave,onClose,cls2,teachers,isAdmin,userName,mob}){
const d=useRef({...initial});
const is={padding:"10px 12px",border:"1px solid #27272A",borderRadius:8,fontSize:14,outline:"none",width:"100%",fontFamily:FN,background:"#09090B",color:"#FAFAFA",transition:"border-color .15s,box-shadow .15s"};
const fo=e=>{e.target.style.borderColor="#10B981";e.target.style.boxShadow="0 0 0 3px #10B98112"};
const bl=e=>{e.target.style.borderColor="#27272A";e.target.style.boxShadow="none"};
const F=({label,k,type:t})=><div style={{flex:1,marginBottom:12}}>
<label style={{display:"block",fontSize:11,color:"#52525B",fontWeight:500,marginBottom:6}}>{label}</label>
{t==="textarea"?<textarea style={{...is,minHeight:56,resize:"vertical"}} defaultValue={d.current[k]||""} onFocus={fo} onBlur={bl} onChange={e=>{d.current[k]=e.target.value}}/>
:t==="date"?<input style={is} type="date" defaultValue={d.current[k]||""} onFocus={fo} onBlur={bl} onChange={e=>{d.current[k]=e.target.value}}/>
:t==="number"?<input style={is} type="number" defaultValue={d.current[k]||0} onFocus={fo} onBlur={bl} onChange={e=>{d.current[k]=parseFloat(e.target.value)||0}}/>
:<input style={is} defaultValue={d.current[k]||""} onFocus={fo} onBlur={bl} onChange={e=>{d.current[k]=e.target.value}}/>}
</div>;
const S=({label,k,opts})=><div style={{flex:1,marginBottom:12}}>
<label style={{display:"block",fontSize:11,color:"#52525B",fontWeight:500,marginBottom:6}}>{label}</label>
<select style={{...is,appearance:"auto"}} defaultValue={d.current[k]||""} onChange={e=>{d.current[k]=e.target.value}}>{opts.map(o=>Array.isArray(o)?<option key={o[0]} value={o[0]}>{o[1]}</option>:<option key={o}>{o}</option>)}</select>
</div>;
const R=({children})=><div style={{display:"flex",gap:8}}>{children}</div>;
const src=["Facebook","TikTok",L.gthieu,"Walk-in","Website"];
const lv=["HSK 1","HSK 2","HSK 3","HSK 4","HSK 5","HSK 6"];
return(
<div className="_mo" onClick={onClose}>
<div className={"_mp"+(mob?" _mm":"")} onClick={e=>e.stopPropagation()}>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
<span style={{fontSize:15,fontWeight:600,color:"#FAFAFA"}}>{isNew?L.themmoi:L.sua}</span>
<button className="_xb" onClick={onClose}><X size={14}/></button>
</div>
{type==="l"&&<><R><F label={L.hoten} k="name"/><F label={L.sdt} k="phone"/></R><R><S label={L.nguonh} k="source" opts={src}/><S label={L.qtam} k="interest" opts={lv.slice(0,5)}/></R><S label={L.gdoan} k="stage" opts={[["inquiry",L.htham],["trial",L.hthu],["registered",L.dadk],["lost",L.mat]]}/><F label={L.gchu} k="note" type="textarea"/></>}
{type==="s"&&<><R><F label={L.hoten} k="name"/><F label={L.sdt} k="phone"/></R><R><S label={L.lop} k="cls" opts={cls2.map(c=>c.id)}/><S label={L.tdo} k="level" opts={lv}/></R><R><F label={L.diemh} k="score" type="number"/><F label="CC %" k="attend" type="number"/></R><R><S label={L.nguonh} k="source" opts={src}/><S label={L.tthai} k="status" opts={[L.dhoc,L.tnghi,L.nghih]}/></R></>}
{type==="tr"&&<><R><F label={L.hoten} k="name"/><F label={L.sdt} k="phone"/></R><R><F label={L.ngay} k="date" type="date"/><F label={L.gio} k="time"/></R><R><S label={L.lop} k="cls" opts={cls2.map(c=>c.id)}/><S label="GV" k="teacher" opts={teachers}/></R><R><S label="TT" k="status" opts={[["scheduled",L.dxep],["completed",L.dahoc],["no-show",L.kden]]}/><S label="KQ" k="result" opts={[["","--"],["enrolled",L.dadk],["thinking",L.snghi],["not-interested",L.kqt]]}/></R><F label={L.nlai} k="followUp" type="date"/></>}
{type==="ct"&&<><F label={L.hvien} k="name"/><R><S label={L.lop} k="cls" opts={cls2.map(c=>c.id)}/><S label={L.than} k="duration" opts={[L["3t"],L["6t"],L["12t"],L["18t"]]}/></R><R><F label={L.bdau} k="start" type="date"/><F label={L.kthuc} k="end" type="date"/></R><F label={L.hphi} k="fee" type="number"/></>}
{type==="hk"&&<><F label={L.hvien} k="name"/><R><S label="Level" k="level" opts={lv}/><F label={L.nthi} k="examDate" type="date"/></R><R><F label={L.diemh} k="score" type="number"/><S label="KQ" k="passed" opts={[["",L.cthi],["yes","DAT"],["no",L.cdat]]}/></R></>}
{type==="r"&&<><R><F label={L.ngay} k="date" type="date"/>{isAdmin?<S label="GV" k="teacher" opts={teachers}/>:<div style={{flex:1}}><label style={{display:"block",fontSize:11,color:"#52525B",fontWeight:500,marginBottom:6}}>GV</label><input style={{...is,opacity:.5}} value={userName} disabled/></div>}<S label={L.lop} k="cls" opts={cls2.map(c=>c.id)}/></R><R><F label={L.comat} k="present" type="number"/><F label={L.vang} k="absent" type="number"/></R><F label={L.hvvang} k="absentNames"/><F label={L.bhoc} k="lesson" type="textarea"/><F label="BTVN" k="homework" type="textarea"/><F label={L.chuy} k="flags" type="textarea"/><F label={L.nbat} k="highlights" type="textarea"/></>}
{type==="i"&&<><R><F label={L.nguoi} k="refName"/><F label={L.ngay} k="date" type="date"/></R><R><S label={L.loai} k="type" opts={[["call",L.goi],["message",L.nhan],["meeting",L.gap]]}/><F label={L.boi} k="by"/></R><F label={L.ndung} k="content" type="textarea"/></>}
{type==="f"&&<><F label={L.hoten} k="name"/><R><S label={L.lop} k="cls" opts={cls2.map(c=>c.id)}/><F label={L.tphi} k="total" type="number"/></R><R><F label={L.hdot2} k="d2d"/><S label="TT" k="st" opts={[["paid",L.ddong],["pending",L.cho],["overdue",L.qhan]]}/></R></>}
<div style={{display:"flex",gap:8,marginTop:16}}>
<button className="_ba" style={{flex:1,justifyContent:"center"}} onClick={()=>{const data={...d.current};if(type==="f"&&data.total){data.d1=Math.round(data.total/2);data.d2=Math.round(data.total/2)}if(type==="hk"){data.status=data.passed==="yes"?"passed":data.passed==="no"?"failed":"registered"}onSave(data)}}><Save size={13}/>{L.luu}</button>
<button className="_bg" onClick={onClose}>{L.huy}</button>
</div></div></div>);
}
 
export default function App(){
const[user,setUser]=useState(null);const[lu,setLu]=useState("");const[lp,setLp]=useState("");const[le,setLe]=useState("");
const[pg,setPg]=useState("home");const[mob,setMob]=useState(window.innerWidth<768);
const[stu,setStu]=useState([]);const[cls2,setCls2]=useState([]);const[fin,setFin]=useState([]);
const[rpt,setRpt]=useState([]);const[leads,setLeads]=useState([]);const[inter,setInter]=useState([]);
const[trials,setTrials]=useState([]);const[contracts,setContracts]=useState([]);const[hsk,setHsk]=useState([]);
const[modal,setModal]=useState(null);const[q,setQ]=useState("");const[dtab,setDtab]=useState("kpi");const[ok,setOk]=useState(false);
const[showMenu,setShowMenu]=useState(false);
 
useEffect(()=>{if(document.getElementById("_htf"))return;const pc=document.createElement("link");pc.rel="preconnect";pc.href="https://fonts.googleapis.com";document.head.appendChild(pc);const pc2=document.createElement("link");pc2.rel="preconnect";pc2.href="https://fonts.gstatic.com";pc2.crossOrigin="anonymous";document.head.appendChild(pc2);const lk=document.createElement("link");lk.id="_htf";lk.rel="stylesheet";lk.href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap";document.head.appendChild(lk)},[]);
useEffect(()=>{const h=()=>setMob(window.innerWidth<768);window.addEventListener("resize",h);return()=>window.removeEventListener("resize",h)},[]);
useEffect(()=>{(async()=>{const[s,c,f,r,l,i,t,ct,h]=await Promise.all([loadT("students"),loadT("classes"),loadT("finance"),loadT("reports"),loadT("leads"),loadT("interactions"),loadT("trials"),loadT("contracts"),loadT("hsk_exams")]);setStu(s);setCls2(c);setFin(f);setRpt(r);setLeads(l);setInter(i);setTrials(t);setContracts(ct);setHsk(h);const su=localStorage.getItem("ht_user");if(su)setUser(JSON.parse(su));setOk(true)})()},[]);
 
const tbl={s:"students",l:"leads",tr:"trials",ct:"contracts",hk:"hsk_exams",r:"reports",i:"interactions",f:"finance"};
const stx={s:[stu,setStu],l:[leads,setLeads],tr:[trials,setTrials],ct:[contracts,setContracts],hk:[hsk,setHsk],r:[rpt,setRpt],i:[inter,setInter],f:[fin,setFin]};
const doSave=async(type,data,isNew)=>{const[arr,setter]=stx[type];if(isNew){setter(type==="r"||type==="i"?[data,...arr]:[...arr,data]);await addRow(tbl[type],data)}else{setter(arr.map(x=>x.id===data.id?data:x));await updateRow(tbl[type],data)}};
const doDel=async(type,id)=>{const[arr,setter]=stx[type];setter(arr.filter(x=>x.id!==id));await deleteRow(tbl[type],id)};
const login=()=>{const u=USERS.find(u=>u.user===lu&&u.pass===lp);if(u){setUser(u);localStorage.setItem("ht_user",JSON.stringify(u));setLe("")}else setLe(L.saitk)};
const logout=()=>{setUser(null);localStorage.removeItem("ht_user");setPg("home")};
const isAdmin=user?.role==="admin";
const canSee=c=>isAdmin||(user?.cls||"").split(",").includes(c);
 
if(!ok)return<div style={{display:"flex",height:"100vh",alignItems:"center",justifyContent:"center",fontFamily:FN,background:"#09090B",color:"#52525B",gap:8,fontSize:13}}><div style={{width:14,height:14,border:"2px solid #27272A",borderTopColor:A,borderRadius:"50%",animation:"_sp .5s linear infinite"}}/>Loading</div>;
 
if(!user)return(
<div style={{fontFamily:FN,minHeight:"100vh",background:"#09090B",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
<style>{`@keyframes _sp{to{transform:rotate(360deg)}}`}</style>
<div style={{width:mob?"100%":360,background:"#18181B",border:"1px solid #27272A",borderRadius:12,padding:mob?24:36}}>
<div style={{width:40,height:40,borderRadius:10,background:A,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:18,fontWeight:800,margin:"0 auto 20px"}}>H</div>
<div style={{fontSize:20,fontWeight:700,color:"#FAFAFA",textAlign:"center",marginBottom:4}}>{L.htinh} Premium</div>
<div style={{color:"#52525B",fontSize:13,textAlign:"center",marginBottom:28}}>{L.dnht}</div>
<input className="_in" placeholder={L.tkh} value={lu} onChange={e=>setLu(e.target.value)} onKeyDown={e=>e.key==="Enter"&&login()}/>
<input className="_in" placeholder={L.mk} type="password" value={lp} onChange={e=>setLp(e.target.value)} onKeyDown={e=>e.key==="Enter"&&login()}/>
{le&&<div style={{color:"#EF4444",fontSize:12,marginBottom:8,textAlign:"center"}}>{le}</div>}
<button className="_ba" style={{width:"100%",justifyContent:"center"}} onClick={login}>{L.dnhap}</button>
</div></div>);
 
const query=q.trim().toLowerCase();
const act=stu.filter(s=>s.status===L.dhoc),ov=fin.filter(f=>f.st==="overdue"),pend=fin.filter(f=>f.st==="pending");
const ranked=[...act].sort((a,b)=>(b.score||0)-(a.score||0));
const teachers=[...new Set(cls2.map(c=>c.teacher).filter(Boolean))];
const needFU=trials.filter(t=>t.result==="thinking");
const hskP=hsk.filter(h=>h.passed==="yes").length,hskTt=hsk.filter(h=>h.status!=="registered").length,hskRate=hskTt>0?Math.round(hskP/hskTt*100):0;
const collected=fin.reduce((a,f)=>a+(f.d1||0)+(f.st==="paid"?(f.d2||0):0),0);
const srcData=["Facebook","TikTok",L.gthieu,"Walk-in","Website"].map(s=>({name:s,v:[...stu,...leads].filter(x=>x.source===s).length})).filter(d=>d.v>0);
const funnelData=[{s:L.bhoi,v:leads.filter(l=>l.stage!=="lost").length},{s:L.bthu,v:leads.filter(l=>l.stage==="trial"||l.stage==="registered").length},{s:L.dk,v:leads.filter(l=>l.stage==="registered").length},{s:L.dhoc,v:act.length}];
const payPie=[{n:L.bdu,v:fin.filter(f=>f.st==="paid").length},{n:L.cho,v:pend.length},{n:L.bno,v:ov.length}];
const scoreDist=[{r:"<5",n:stu.filter(s=>(s.score||0)<5).length},{r:"5-6.5",n:stu.filter(s=>(s.score||0)>=5&&s.score<6.5).length},{r:"6.5-8",n:stu.filter(s=>(s.score||0)>=6.5&&s.score<8).length},{r:"8-9",n:stu.filter(s=>(s.score||0)>=8&&s.score<9).length},{r:"9+",n:stu.filter(s=>(s.score||0)>=9).length}];
 
const om=(t,d,n)=>setModal({t,d,n});
const gc=c=>mob?"1fr":`repeat(${c},1fr)`;
const Ch=({title,children,h=180})=><div className="_c"><div style={{fontSize:11,fontWeight:600,color:"#52525B",marginBottom:12,textTransform:"uppercase",letterSpacing:".05em"}}>{title}</div><ResponsiveContainer width="100%" height={h}>{children}</ResponsiveContainer></div>;
const sb=s=>({Facebook:"in",TikTok:"pu",[L.gthieu]:"ok","Walk-in":"or",Website:"wa"})[s]||"mu";
const stB=s=>({inquiry:["Hoi","in"],trial:["Thu","wa"],registered:["DK","ok"],lost:[L.mat,"mu"]})[s]||[s,"mu"];
 
const adminMenu=[{id:"home",l:L.tq,ic:LayoutDashboard},{id:"leads",l:L.km,ic:Target},{id:"trials",l:L.ht,ic:BookOpen},{id:"stu",l:L.hv,ic:Users},{id:"contracts",l:L.hd,ic:FileText},{id:"hsk",l:"HSK",ic:GraduationCap},{id:"rpt",l:L.bc,ic:ClipboardList},{id:"log",l:L.ls,ic:MessageSquare},{id:"fin",l:L.tc,ic:Wallet},{id:"charts",l:L.bd,ic:BarChart3}];
const teacherMenu=[{id:"home",l:L.tq,ic:LayoutDashboard},{id:"stu",l:L.hv,ic:Users},{id:"rpt",l:L.bc,ic:ClipboardList},{id:"hsk",l:"HSK",ic:GraduationCap}];
const menu=isAdmin?adminMenu:teacherMenu;
const mobNav=isAdmin?[{id:"home",ic:LayoutDashboard,l:"Home"},{id:"leads",ic:Target,l:"Khach"},{id:"stu",ic:Users,l:"HV"},{id:"rpt",ic:ClipboardList,l:"BC"},{id:"more",ic:Menu,l:"More"}]:[{id:"home",ic:LayoutDashboard,l:"Home"},{id:"stu",ic:Users,l:"HV"},{id:"rpt",ic:ClipboardList,l:"BC"},{id:"hsk",ic:GraduationCap,l:"HSK"}];
const moreMenu=adminMenu.filter(m=>!["home","leads","stu","rpt"].includes(m.id));
 
return(
<div style={{fontFamily:FN,display:"flex",flexDirection:mob?"column":"row",height:"100vh",background:"#09090B",color:"#FAFAFA",overflow:"hidden"}}>
<style>{`
@keyframes _sp{to{transform:rotate(360deg)}}@keyframes _fi{from{opacity:0}to{opacity:1}}@keyframes _si{from{opacity:0;transform:scale(.97)}to{opacity:1;transform:scale(1)}}@keyframes _su{from{transform:translateY(100%)}to{transform:translateY(0)}}
*{box-sizing:border-box;margin:0;padding:0}::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:#27272A;border-radius:99px}input[type="date"]::-webkit-calendar-picker-indicator{filter:invert(.5)}select{color-scheme:dark}::selection{background:#10B98130}
._c{background:#18181B;border:1px solid #27272A;border-radius:12px;padding:20px;transition:border-color .2s}._c:hover{border-color:#3F3F46}
._ni{display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:8px;cursor:pointer;font-size:13px;font-weight:500;color:#71717A;transition:all .15s}._ni:hover{color:#A1A1AA;background:#1F1F23}._ni._a{color:#FAFAFA;background:#27272A;font-weight:600}
._ba{display:inline-flex;align-items:center;gap:6px;padding:9px 18px;border-radius:8px;border:none;cursor:pointer;font-size:13px;font-weight:600;font-family:${FN};background:${A};color:#fff;transition:all .15s}._ba:hover{filter:brightness(1.15)}._bs{padding:5px 12px;font-size:11px;border-radius:6px}
._bg{padding:9px 18px;background:#27272A;border:none;border-radius:8px;font-size:13px;color:#A1A1AA;cursor:pointer;font-family:${FN};font-weight:500;transition:all .15s}._bg:hover{background:#3F3F46;color:#FAFAFA}
._bo{display:inline-flex;align-items:center;gap:4px;padding:5px 12px;border-radius:6px;border:1px solid #27272A;background:transparent;cursor:pointer;font-size:11px;font-weight:600;font-family:${FN};color:#71717A;transition:all .15s}._bo:hover{border-color:${A};color:${A}}
table{width:100%;border-collapse:collapse;min-width:600px}th{padding:10px 16px;text-align:left;font-size:11px;font-weight:600;color:#3F3F46;text-transform:uppercase;letter-spacing:.05em;background:#111113;border-bottom:1px solid #27272A}td{padding:11px 16px;font-size:14px;border-bottom:1px solid #1F1F23;color:#71717A;transition:background .1s}tr:hover td{background:#1F1F23}
._ab{padding:5px;border-radius:6px;border:none;background:transparent;color:#3F3F46;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;transition:all .1s}._ab:hover{color:${A};background:#18181B}._ab._d:hover{color:#EF4444;background:#18181B}
._tb{padding:6px 14px;border-radius:6px;cursor:pointer;font-size:12px;font-weight:600;color:#52525B;border:none;background:transparent;font-family:${FN};transition:all .15s}._tb:hover{color:#A1A1AA}._tb._a{background:#27272A;color:#FAFAFA}
._in{width:100%;padding:10px 12px;border:1px solid #27272A;border-radius:8px;font-size:14px;outline:none;font-family:${FN};background:#09090B;color:#FAFAFA;margin-bottom:10px;transition:border-color .15s,box-shadow .15s}._in:focus{border-color:${A};box-shadow:0 0 0 3px #10B98112}._in::placeholder{color:#3F3F46}
._pb{height:3px;background:#27272A;border-radius:99px;overflow:hidden}._pf{height:100%;border-radius:99px}
._bn{display:flex;background:#09090B;border-top:1px solid #27272A;padding:6px 0}._bi{flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;padding:8px 0;cursor:pointer;color:#3F3F46;transition:.15s}._bi._a{color:${A}}
._mp2{position:absolute;bottom:60px;right:8px;background:#18181B;border:1px solid #27272A;border-radius:10px;box-shadow:0 12px 40px rgba(0,0,0,.4);padding:4px;width:200px;z-index:50}
._mo{position:fixed;inset:0;background:rgba(0,0,0,.6);backdrop-filter:blur(20px);display:flex;align-items:center;justify-content:center;z-index:100;animation:_fi .1s}._mp{background:#18181B;border:1px solid #27272A;border-radius:14px;padding:24px;width:500px;max-height:88vh;overflow-y:auto;animation:_si .15s ease-out}._mm{width:100%;max-height:92vh;border-radius:14px 14px 0 0;position:fixed;bottom:0;left:0;right:0;animation:_su .2s ease-out;padding:20px 16px 28px}._xb{background:#27272A;border:none;width:28px;height:28px;border-radius:6px;cursor:pointer;color:#71717A;display:flex;align-items:center;justify-content:center;transition:all .1s}._xb:hover{background:#3F3F46;color:#FAFAFA}
`}</style>
 
{!mob&&<div style={{width:220,borderRight:"1px solid #27272A",display:"flex",flexDirection:"column",flexShrink:0}}>
<div style={{padding:"16px 14px",display:"flex",alignItems:"center",gap:10,borderBottom:"1px solid #1F1F23"}}>
<div style={{width:30,height:30,borderRadius:8,background:A,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:14,fontWeight:800}}>H</div>
<div><div style={{fontWeight:700,fontSize:14}}>{L.htinh}</div><div style={{fontSize:10,color:"#52525B",fontWeight:500}}>Premium</div></div>
</div>
<nav style={{flex:1,padding:"8px 6px",overflow:"auto"}}>{menu.map(m=>{const Ic=m.ic;return<div key={m.id} className={"_ni"+(pg===m.id?" _a":"")} onClick={()=>setPg(m.id)}><Ic size={15} strokeWidth={pg===m.id?2:1.5}/>{m.l}</div>})}</nav>
<div style={{padding:"12px 10px",borderTop:"1px solid #1F1F23"}}><div style={{display:"flex",alignItems:"center",gap:8}}>
<div style={{width:28,height:28,borderRadius:7,background:"#27272A",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:600,color:"#A1A1AA"}}>{user.name.charAt(0)}</div>
<div style={{flex:1,minWidth:0}}><div style={{fontSize:12,fontWeight:600,color:"#A1A1AA",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{user.name}</div><div style={{fontSize:10,color:"#3F3F46"}}>{isAdmin?"Admin":"GV"}</div></div>
<button onClick={logout} className="_ab _d"><LogOut size={13}/></button>
</div></div></div>}
 
<div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
<div style={{padding:"8px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid #1F1F23",flexShrink:0}}>
{mob?<div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:24,height:24,borderRadius:6,background:A,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:10,fontWeight:800}}>H</div><span style={{fontWeight:700,fontSize:13}}>{L.htinh}</span></div>
:<div style={{position:"relative",width:220}}><Search size={13} style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:"#3F3F46"}}/><input className="_in" style={{marginBottom:0,paddingLeft:30,fontSize:13}} placeholder={L.tkiem} value={q} onChange={e=>setQ(e.target.value)}/></div>}
<div style={{display:"flex",alignItems:"center",gap:6}}>
{!mob&&(ov.length+needFU.length)>0&&<span style={{fontSize:10,fontWeight:600,color:"#EF4444",background:"#EF444412",padding:"3px 8px",borderRadius:4}}>{ov.length+needFU.length} {L.cxl}</span>}
{mob&&<button onClick={logout} className="_ab _d"><LogOut size={14}/></button>}
</div></div>
 
<div style={{flex:1,overflow:"auto",padding:mob?12:20}}>
 
{pg==="home"&&<div>
<div style={{fontSize:mob?20:24,fontWeight:700,marginBottom:20}}>{L.tq}</div>
{isAdmin&&<div style={{display:"inline-flex",gap:2,background:"#18181B",borderRadius:8,padding:2,marginBottom:16,border:"1px solid #27272A"}}>
{[["kpi",L.chiso],["funnel",L.pheu],["trends",L.xhg]].map(([id,l])=><button key={id} className={"_tb"+(dtab===id?" _a":"")} onClick={()=>setDtab(id)}>{l}</button>)}
</div>}
<div style={{display:"grid",gridTemplateColumns:gc(isAdmin?3:2),gap:10,marginBottom:16}}>
{(isAdmin?[
{l:L.km,v:leads.filter(l=>l.stage!=="lost").length,sp:[8,12,10,15,11,14],tr:12},
{l:L.hv,v:act.length,sp:[18,20,22,21,24,26],tr:8},
{l:L.hskdo,v:hskRate+"%",sp:[60,65,70,68,75,hskRate]},
{l:L.dthu,v:vnd(collected),sp:[42,48,52,58,65,72],tr:11},
{l:L.nohp,v:ov.length,er:ov.length>0},
{l:L.cnhac,v:needFU.length}
]:[
{l:L.hvlt,v:stu.filter(s=>canSee(s.cls)).length},
{l:L.bc,v:rpt.filter(r=>r.teacher===user.name).length},
{l:L.dtb,v:(stu.filter(s=>canSee(s.cls)&&s.status===L.dhoc).reduce((a,s)=>a+s.score,0)/Math.max(stu.filter(s=>canSee(s.cls)&&s.status===L.dhoc).length,1)).toFixed(1)},
{l:L.ccan,v:Math.round(stu.filter(s=>canSee(s.cls)&&s.status===L.dhoc).reduce((a,s)=>a+s.attend,0)/Math.max(stu.filter(s=>canSee(s.cls)&&s.status===L.dhoc).length,1))+"%"}
]).map((s,i)=><div key={i} className="_c">
<div style={{fontSize:11,fontWeight:500,color:"#52525B",marginBottom:8}}>{s.l}</div>
<div style={{fontSize:mob?28:36,fontWeight:800,letterSpacing:"-.04em",color:s.er?"#EF4444":"#FAFAFA",lineHeight:1,fontVariantNumeric:"tabular-nums"}}>{s.v}</div>
{(s.sp||s.tr!==undefined)&&<div style={{display:"flex",alignItems:"center",gap:8,marginTop:8}}>
{s.sp&&<Spark data={s.sp}/>}
{s.tr&&<span style={{fontSize:11,fontWeight:600,color:A,display:"flex",alignItems:"center",gap:2}}><TrendingUp size={11}/>{s.tr}%</span>}
</div>}</div>)}
</div>
{dtab==="kpi"&&isAdmin&&<div style={{display:"grid",gridTemplateColumns:gc(3),gap:10}}>
<div className="_c"><div style={{fontSize:11,fontWeight:600,color:"#52525B",marginBottom:12,textTransform:"uppercase",letterSpacing:".05em"}}>{L.cthu}</div>{ov.map(f=><div key={f.id} style={{padding:"8px 0",borderBottom:"1px solid #1F1F23",display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><div style={{fontWeight:600,color:"#A1A1AA",fontSize:13}}>{f.name}</div><div style={{color:"#EF4444",fontSize:12}}>{vnd(f.d2)}</div></div><button className="_ba _bs" onClick={()=>{setFin(fin.map(x=>x.id===f.id?{...x,st:"paid"}:x));updateRow("finance",{...f,st:"paid"})}}><Check size={11}/></button></div>)}{ov.length===0&&<div style={{color:A,fontSize:12}}>OK</div>}</div>
<div className="_c"><div style={{fontSize:11,fontWeight:600,color:"#52525B",marginBottom:12,textTransform:"uppercase",letterSpacing:".05em"}}>Top 5</div>{ranked.slice(0,5).map((s,i)=><div key={s.id} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",fontSize:13}}><span style={{color:"#71717A"}}><span style={{color:i<3?A:"#3F3F46",fontWeight:700,marginRight:8}}>{i+1}</span>{s.name}</span><span style={{fontWeight:700}}>{s.score}</span></div>)}</div>
<div className="_c"><div style={{fontSize:11,fontWeight:600,color:"#52525B",marginBottom:12,textTransform:"uppercase",letterSpacing:".05em"}}>{L.gday}</div>{rpt.slice(0,4).map(r=><div key={r.id} style={{padding:"6px 0",borderBottom:"1px solid #1F1F23",fontSize:12}}><span style={{color:"#A1A1AA",fontWeight:600}}>{r.teacher}</span> <span style={{color:"#3F3F46"}}>{r.cls} {r.date}</span></div>)}</div>
</div>}
{dtab==="funnel"&&isAdmin&&<div style={{display:"grid",gridTemplateColumns:gc(2),gap:10}}>
<div className="_c"><div style={{fontSize:11,fontWeight:600,color:"#52525B",marginBottom:14,textTransform:"uppercase",letterSpacing:".05em"}}>Pheu</div>{funnelData.map((f,i)=><div key={f.s} style={{height:32,borderRadius:6,display:"flex",alignItems:"center",padding:"0 12px",color:"#000",fontWeight:700,fontSize:11,marginBottom:6,background:CX[i],width:Math.max((f.v/Math.max(funnelData[0].v,1))*100,25)+"%"}}>{f.s}: {f.v}</div>)}</div>
<Ch title={L.nguon}><PieChart><Pie data={srcData} cx="50%" cy="50%" innerRadius={30} outerRadius={60} dataKey="v" label={({name,v})=>name.slice(0,3)+":"+v} fontSize={10} stroke="none">{srcData.map((e,i)=><Cell key={i} fill={CX[i]}/>)}</Pie><Tooltip content={<Tip/>}/></PieChart></Ch>
</div>}
{dtab==="trends"&&isAdmin&&<div style={{display:"grid",gridTemplateColumns:gc(2),gap:10}}>
<Ch title={L.dthu2}><BarChart data={monthTrend}><CartesianGrid strokeDasharray="3 3" stroke="#1F1F23"/><XAxis dataKey="m" fontSize={10} stroke="#3F3F46" tickLine={false} axisLine={false}/><YAxis fontSize={10} stroke="#3F3F46" tickLine={false} axisLine={false}/><Tooltip content={<Tip/>}/><Bar dataKey="rev" fill={A} radius={[4,4,0,0]}/></BarChart></Ch>
<Ch title={L.ccan}><LineChart data={attendTrend}><CartesianGrid strokeDasharray="3 3" stroke="#1F1F23"/><XAxis dataKey="w" fontSize={10} stroke="#3F3F46" tickLine={false} axisLine={false}/><YAxis domain={[80,100]} fontSize={10} stroke="#3F3F46" tickLine={false} axisLine={false}/><Tooltip content={<Tip/>}/><Line type="monotone" dataKey="v" stroke="#3B82F6" strokeWidth={1.5} dot={{fill:"#3B82F6",r:3,strokeWidth:0}}/></LineChart></Ch>
</div>}
</div>}
 
{pg==="leads"&&isAdmin&&<div>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}><div style={{fontSize:20,fontWeight:700}}>{L.ktn}</div><button className="_ba" onClick={()=>om("l",{id:"LD"+Date.now(),name:"",phone:"",source:"Facebook",stage:"inquiry",interest:"HSK 1",note:"",created:today,lastContact:today},1)}><Plus size={13}/>{L.them}</button></div>
<div style={{overflow:"auto",borderRadius:12}}><div className="_c" style={{padding:0}}><table><thead><tr>{[L.ten,L.sdt,L.nguonh,"QT","GD",""].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{leads.map(l=>{const[st,sv]=stB(l.stage);return<tr key={l.id}><td style={{fontWeight:600,color:"#D4D4D8"}}>{l.name}</td><td>{l.phone}</td><td><Bd t={l.source} v={sb(l.source)}/></td><td><Bd t={l.interest} v="in"/></td><td><Bd t={st} v={sv}/></td>
<td><div style={{display:"flex",gap:3,alignItems:"center"}}>{l.stage==="inquiry"&&<button className="_bo" onClick={()=>{setLeads(leads.map(x=>x.id===l.id?{...x,stage:"trial"}:x));updateRow("leads",{...l,stage:"trial"})}}><ChevronRight size={11}/>{L.bthu}</button>}{l.stage==="trial"&&<button className="_ba _bs" onClick={()=>{setLeads(leads.map(x=>x.id===l.id?{...x,stage:"registered"}:x));updateRow("leads",{...l,stage:"registered"})}}>DK</button>}<button className="_ab" onClick={()=>om("l",{...l},0)}><Pencil size={12}/></button><button className="_ab _d" onClick={()=>{if(confirm(L.xoa))doDel("l",l.id)}}><Trash2 size={12}/></button></div></td></tr>})}</tbody></table></div></div>
</div>}
 
{pg==="stu"&&<div>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}><div style={{fontSize:20,fontWeight:700}}>{L.hv}</div>{isAdmin&&<button className="_ba" onClick={()=>om("s",{id:"HV"+Date.now(),name:"",phone:"",cls:cls2[0]?.id||"",level:"HSK 1",status:L.dhoc,score:0,attend:90,source:"Facebook"},1)}><Plus size={13}/>{L.them}</button>}</div>
<div style={{overflow:"auto",borderRadius:12}}><div className="_c" style={{padding:0}}><table><thead><tr>{["#","HV","Level",L.lop,L.diemh,"CC","TT",...(isAdmin?[""]:[])] .map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{stu.filter(s=>(!q||s.name.toLowerCase().includes(query))&&canSee(s.cls)).map((s,i)=><tr key={s.id}><td style={{color:"#3F3F46",fontSize:11}}>{i+1}</td><td><div style={{fontWeight:600,color:"#D4D4D8"}}>{s.name}</div><div style={{color:"#52525B",fontSize:12}}>{s.phone}</div></td><td><Bd t={s.level} v="in"/></td><td style={{color:"#52525B"}}>{s.cls}</td><td style={{fontWeight:800,color:s.score>=8?A:s.score>=6.5?"#F59E0B":"#EF4444",fontSize:18,fontVariantNumeric:"tabular-nums"}}>{s.score}</td><td><div style={{display:"flex",alignItems:"center",gap:6}}><div className="_pb" style={{width:44}}><div className="_pf" style={{width:s.attend+"%",background:s.attend>=90?A:"#F59E0B"}}/></div><span style={{fontSize:10,color:"#52525B",fontWeight:600}}>{s.attend}%</span></div></td><td><Bd t={s.status} v={s.status===L.dhoc?"ok":s.status===L.tnghi?"wa":"mu"}/></td>
{isAdmin&&<td><button className="_ab" onClick={()=>om("s",{...s},0)}><Pencil size={12}/></button><button className="_ab _d" onClick={()=>{if(confirm(L.xoa))doDel("s",s.id)}}><Trash2 size={12}/></button></td>}</tr>)}</tbody></table></div></div>
</div>}
 
{pg==="trials"&&isAdmin&&<div>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}><div style={{fontSize:20,fontWeight:700}}>{L.ht}</div><button className="_ba" onClick={()=>om("tr",{id:"TL"+Date.now(),name:"",phone:"",source:"Facebook",date:today,time:"18:00",cls:cls2[0]?.id||"",teacher:teachers[0]||"",status:"scheduled",result:"",followUp:""},1)}><Plus size={13}/>{L.xlich}</button></div>
<div style={{overflow:"auto",borderRadius:12}}><div className="_c" style={{padding:0}}><table><thead><tr>{[L.ten,L.ngay,L.lop,"TT","KQ",L.nhac,""].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{trials.map(t=><tr key={t.id}><td style={{fontWeight:600,color:"#D4D4D8"}}>{t.name}</td><td style={{fontSize:13,color:"#52525B"}}>{t.date} {t.time}</td><td style={{color:"#52525B"}}>{t.cls}</td><td><Bd t={{scheduled:"Xep",completed:"Xong","no-show":"KD"}[t.status]||t.status} v={{scheduled:"in",completed:"ok","no-show":"er"}[t.status]||"mu"}/></td><td>{t.result?<Bd t={{enrolled:"DK",thinking:"Nghi","not-interested":"KQT"}[t.result]} v={{enrolled:"ok",thinking:"wa","not-interested":"mu"}[t.result]}/>:<span style={{color:"#27272A"}}>--</span>}</td><td style={{color:t.followUp&&daysLeft(t.followUp)<=1?"#EF4444":"#3F3F46",fontSize:12}}>{t.followUp||"--"}</td>
<td><div style={{display:"flex",gap:3}}>{t.status==="scheduled"&&<button className="_ba _bs" onClick={()=>{setTrials(trials.map(x=>x.id===t.id?{...x,status:"completed"}:x));updateRow("trials",{...t,status:"completed"})}}><Check size={11}/></button>}<button className="_ab" onClick={()=>om("tr",{...t},0)}><Pencil size={12}/></button></div></td></tr>)}</tbody></table></div></div>
</div>}
 
{pg==="contracts"&&isAdmin&&<div>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}><div style={{fontSize:20,fontWeight:700}}>{L.hd}</div><button className="_ba" onClick={()=>om("ct",{id:"HD"+Date.now(),name:"",cls:cls2[0]?.id||"",start:today,end:"",duration:L["6t"],fee:0,status:"active",note:""},1)}><Plus size={13}/>{L.tao}</button></div>
<div style={{overflow:"auto",borderRadius:12}}><div className="_c" style={{padding:0}}><table><thead><tr>{["HV",L.lop,"BD","KT",L.phi,"TT",L.con,""].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{contracts.map(c=>{const dl=daysLeft(c.end);const rs=c.status==="renewed"?"renewed":dl<=0?"expired":dl<=30?"expiring":"active";return<tr key={c.id}><td style={{fontWeight:600,color:"#D4D4D8"}}>{c.name}</td><td><Bd t={c.cls} v="in"/></td><td style={{fontSize:12,color:"#52525B"}}>{c.start}</td><td style={{fontSize:12,color:"#52525B"}}>{c.end}</td><td style={{fontWeight:700,color:A}}>{vnd(c.fee)}</td><td><Bd t={{active:"OK",expiring:"Sap",expired:"Het",renewed:"GH"}[rs]} v={{active:"ok",expiring:"wa",expired:"er",renewed:"in"}[rs]}/></td><td style={{fontWeight:700,color:dl<=0?"#EF4444":dl<=30?"#F59E0B":A,fontVariantNumeric:"tabular-nums"}}>{dl<=0?"Het":dl+L.dong}</td>
<td><div style={{display:"flex",gap:3}}>{(rs==="expiring"||rs==="expired")&&<button className="_ba _bs" onClick={()=>{const nc={...c,status:"renewed"};setContracts(contracts.map(x=>x.id===c.id?nc:x));updateRow("contracts",nc)}}>GH</button>}<button className="_ab" onClick={()=>om("ct",{...c},0)}><Pencil size={12}/></button></div></td></tr>})}</tbody></table></div></div>
</div>}
 
{pg==="hsk"&&<div>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}><div style={{fontSize:20,fontWeight:700}}>Thi HSK</div>{isAdmin&&<button className="_ba" onClick={()=>om("hk",{id:"HSK"+Date.now(),name:"",level:"HSK 1",examDate:"",score:0,passed:"",status:"registered"},1)}><Plus size={13}/>{L.dk}</button>}</div>
<div style={{display:"grid",gridTemplateColumns:gc(2),gap:10,marginBottom:14}}>
<Ch title={L.kqua}><BarChart data={["HSK 1","HSK 2","HSK 3","HSK 4","HSK 5"].map(l=>({l,p:hsk.filter(h=>h.level===l&&h.passed==="yes").length,f:hsk.filter(h=>h.level===l&&h.passed==="no").length}))}><XAxis dataKey="l" fontSize={10} stroke="#3F3F46" tickLine={false} axisLine={false}/><YAxis fontSize={10} stroke="#3F3F46" tickLine={false} axisLine={false}/><Tooltip content={<Tip/>}/><Bar dataKey="p" name="Dat" fill={A} stackId="a" radius={[4,4,0,0]}/><Bar dataKey="f" name="Truot" fill="#EF4444" stackId="a" radius={[4,4,0,0]}/></BarChart></Ch>
<div className="_c" style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}><div style={{fontSize:11,fontWeight:600,color:"#52525B",marginBottom:12,textTransform:"uppercase",letterSpacing:".05em"}}>Ty le</div><div style={{fontSize:48,fontWeight:800,color:hskRate>=70?A:"#F59E0B",lineHeight:1,fontVariantNumeric:"tabular-nums"}}>{hskRate}%</div><div style={{fontSize:12,color:"#52525B",marginTop:6}}>{hskP}/{hskTt}</div><div className="_pb" style={{marginTop:10,width:"40%"}}><div className="_pf" style={{width:hskRate+"%",background:A}}/></div></div>
</div>
<div style={{overflow:"auto",borderRadius:12}}><div className="_c" style={{padding:0}}><table><thead><tr>{["HV","Level",L.ngay,L.diemh,"KQ",...(isAdmin?[""]:[])] .map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{hsk.map(h=><tr key={h.id}><td style={{fontWeight:600,color:"#D4D4D8"}}>{h.name}</td><td><Bd t={h.level} v="pu"/></td><td style={{fontSize:12,color:"#52525B"}}>{h.examDate}</td><td style={{fontWeight:800,fontSize:16,fontVariantNumeric:"tabular-nums"}}>{h.score||<span style={{color:"#27272A"}}>--</span>}</td><td>{h.passed==="yes"?<Bd t="DAT" v="ok"/>:h.passed==="no"?<Bd t="Truot" v="er"/>:<Bd t="Chua" v="in"/>}</td>{isAdmin&&<td><button className="_ab" onClick={()=>om("hk",{...h},0)}><Pencil size={12}/></button></td>}</tr>)}</tbody></table></div></div>
</div>}
 
{pg==="rpt"&&<div>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}><div style={{fontSize:20,fontWeight:700}}>{L.bc}</div><button className="_ba" onClick={()=>om("r",{id:"RP"+Date.now(),date:today,teacher:isAdmin?(teachers[0]||""):user.name,cls:cls2[0]?.id||"",present:0,absent:0,absentNames:"",lesson:"",homework:"",flags:"",highlights:""},1)}><Plus size={13}/>{L.tao}</button></div>
{rpt.filter(r=>isAdmin||r.teacher===user.name).map(r=><div key={r.id} className="_c" style={{marginBottom:8}}>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
<div><span style={{fontWeight:600,color:"#A1A1AA",fontSize:13}}>{r.teacher}</span> <span style={{color:"#3F3F46",fontSize:11}}>{r.cls} {r.date}</span></div>
<div style={{display:"flex",gap:4,alignItems:"center"}}><Bd t={r.present+"/"+(r.present+r.absent)} v={r.absent===0?"ok":"wa"}/><button className="_ab" onClick={()=>om("r",{...r},0)}><Pencil size={12}/></button></div>
</div>
<div style={{fontSize:13,color:"#71717A",lineHeight:1.6}}>{r.lesson}</div>
{r.flags&&<div style={{background:"#EF44440A",borderRadius:6,padding:"6px 10px",marginTop:6,fontSize:11,color:"#EF4444",display:"flex",alignItems:"start",gap:6}}><AlertTriangle size={11} style={{marginTop:1,flexShrink:0}}/>{r.flags}</div>}
{r.highlights&&<div style={{background:"#10B9810A",borderRadius:6,padding:"6px 10px",marginTop:6,fontSize:11,color:A,display:"flex",alignItems:"start",gap:6}}><Star size={11} style={{marginTop:1,flexShrink:0}}/>{r.highlights}</div>}
</div>)}
</div>}
 
{pg==="log"&&isAdmin&&<div>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}><div style={{fontSize:20,fontWeight:700}}>{L.ls}</div><button className="_ba" onClick={()=>om("i",{id:"IT"+Date.now(),ref:"",refName:"",date:today,type:"call",content:"",by:"Admin"},1)}><Plus size={13}/>{L.them}</button></div>
{inter.map(it=><div key={it.id} style={{display:"flex",gap:10,padding:"12px 0",borderBottom:"1px solid #1F1F23"}}>
<div style={{width:28,height:28,borderRadius:7,background:"#27272A",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,color:"#52525B"}}>{it.type==="call"?<Phone size={12}/>:it.type==="meeting"?<Handshake size={12}/>:<MessageCircle size={12}/>}</div>
<div><div><span style={{fontWeight:600,color:"#A1A1AA",fontSize:13}}>{it.refName}</span> <span style={{color:"#3F3F46",fontSize:10}}>{it.date}</span> <Bd t={it.type==="call"?L.goi:it.type==="meeting"?L.gap:L.nhan} v={it.type==="call"?"ok":"in"}/></div><div style={{color:"#52525B",marginTop:4,fontSize:13,lineHeight:1.5}}>{it.content}</div></div>
</div>)}
</div>}
 
{pg==="fin"&&isAdmin&&<div>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}><div style={{fontSize:20,fontWeight:700}}>{L.tc}</div><button className="_ba" onClick={()=>om("f",{id:"HP"+Date.now(),name:"",cls:cls2[0]?.id||"",total:0,d1:0,d2:0,d2d:"",st:"pending"},1)}><Plus size={13}/>{L.them}</button></div>
<div style={{overflow:"auto",borderRadius:12}}><div className="_c" style={{padding:0}}><table><thead><tr>{["HV",L.lop,L.tong,"D1","D2",L.han,"TT",""].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{fin.map(f=><tr key={f.id}><td style={{fontWeight:600,color:"#D4D4D8"}}>{f.name}</td><td><Bd t={f.cls} v="in"/></td><td style={{fontWeight:700,color:A}}>{vnd(f.total)}</td><td style={{fontSize:12,color:"#52525B"}}>{vnd(f.d1)}</td><td style={{fontSize:12,color:"#52525B"}}>{vnd(f.d2)}</td><td style={{color:f.st==="overdue"?"#EF4444":"#3F3F46",fontSize:12}}>{f.d2d}</td><td>{f.st==="paid"?<Bd t="OK" v="ok"/>:f.st==="pending"?<Bd t={L.cho} v="wa"/>:<Bd t={L.bno} v="er"/>}</td>
<td><div style={{display:"flex",gap:3}}>{f.st!=="paid"&&<button className="_ba _bs" onClick={()=>{setFin(fin.map(x=>x.id===f.id?{...x,st:"paid"}:x));updateRow("finance",{...f,st:"paid"})}}><Check size={11}/></button>}<button className="_ab" onClick={()=>om("f",{...f},0)}><Pencil size={12}/></button></div></td></tr>)}</tbody></table></div></div>
</div>}
 
{pg==="charts"&&isAdmin&&<div>
<div style={{fontSize:20,fontWeight:700,marginBottom:16}}>{L.bd}</div>
<div style={{display:"grid",gridTemplateColumns:gc(2),gap:10}}>
<Ch title={L.dthu2}><BarChart data={monthTrend}><CartesianGrid strokeDasharray="3 3" stroke="#1F1F23"/><XAxis dataKey="m" fontSize={10} stroke="#3F3F46" tickLine={false} axisLine={false}/><YAxis fontSize={10} stroke="#3F3F46" tickLine={false} axisLine={false}/><Tooltip content={<Tip/>}/><Bar dataKey="rev" fill={A} radius={[4,4,0,0]}/></BarChart></Ch>
<Ch title={L.ccan}><LineChart data={attendTrend}><CartesianGrid strokeDasharray="3 3" stroke="#1F1F23"/><XAxis dataKey="w" fontSize={10} stroke="#3F3F46" tickLine={false} axisLine={false}/><YAxis domain={[80,100]} fontSize={10} stroke="#3F3F46" tickLine={false} axisLine={false}/><Tooltip content={<Tip/>}/><Line type="monotone" dataKey="v" stroke="#3B82F6" strokeWidth={1.5} dot={{fill:"#3B82F6",r:3,strokeWidth:0}}/></LineChart></Ch>
<Ch title={L.thtoan}><PieChart><Pie data={payPie} cx="50%" cy="50%" innerRadius={30} outerRadius={60} dataKey="v" label={({n,v})=>n+":"+v} fontSize={10} stroke="none">{payPie.map((e,i)=><Cell key={i} fill={[CX[0],CX[3],CX[4]][i]}/>)}</Pie><Tooltip content={<Tip/>}/></PieChart></Ch>
<Ch title={L.diem}><BarChart data={scoreDist}><CartesianGrid strokeDasharray="3 3" stroke="#1F1F23"/><XAxis dataKey="r" fontSize={10} stroke="#3F3F46" tickLine={false} axisLine={false}/><YAxis fontSize={10} stroke="#3F3F46" tickLine={false} axisLine={false}/><Tooltip content={<Tip/>}/><Bar dataKey="n" fill="#8B5CF6" radius={[4,4,0,0]}/></BarChart></Ch>
</div></div>}
 
</div></div>
 
{mob&&<div className="_bn">
{mobNav.map(m=>{const Ic=m.ic;return<div key={m.id} className={"_bi"+(pg===m.id||(m.id==="more"&&showMenu)?" _a":"")} onClick={()=>{if(m.id==="more")setShowMenu(!showMenu);else{setPg(m.id);setShowMenu(false)}}}><Ic size={16} strokeWidth={pg===m.id?2:1.5}/><span style={{fontSize:9}}>{m.l}</span></div>})}
{showMenu&&<div className="_mp2">{moreMenu.map(m=>{const Ic=m.ic;return<div key={m.id} className="_ni" onClick={()=>{setPg(m.id);setShowMenu(false)}}><Ic size={14}/>{m.l}</div>})}<div className="_ni" onClick={logout} style={{color:"#EF4444"}}><LogOut size={14}/>{L.thoat}</div></div>}
</div>}
 
{modal&&<ModalForm type={modal.t} initial={modal.d} isNew={modal.n} cls2={cls2} teachers={teachers} isAdmin={isAdmin} userName={user.name} mob={mob}
onSave={async d=>{await doSave(modal.t,d,modal.n);setModal(null)}} onClose={()=>setModal(null)}/>}
</div>);
}
