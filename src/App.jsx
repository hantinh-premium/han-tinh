import { useState, useEffect, useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from "recharts";
import { supabase } from "./supabase";
import { LayoutDashboard, Target, BookOpen, Users, FileText, GraduationCap, ClipboardList, MessageSquare, Wallet, BarChart3, Plus, Pencil, Trash2, Search, Check, LogOut, X, ChevronRight, TrendingUp, TrendingDown, Bell, Save, Menu, Phone, MessageCircle, Handshake, AlertTriangle, Star, Award } from "lucide-react";
 
/* ═══════════════════════════════════════════
   DESIGN SYSTEM — single accent on pure black
   Accent: #10B981 (emerald)
   BG: #09090B
   Surface: rgba(255,255,255,0.[02-04])
   Border: rgba(255,255,255,0.06)
   Text: #FAFAFA / 0.5 / 0.3
   ═══════════════════════════════════════════ */
 
// ── DB ──
const FM={leads:{lastContact:"last_contact"},reports:{absentNames:"absent_names"},interactions:{refName:"ref_name",by:"by_user"},trials:{date:"trial_date",time:"trial_time",followUp:"follow_up"},contracts:{start:"start_date",end:"end_date"},hsk_exams:{examDate:"exam_date"}};
function toDb(t,o){const m=FM[t];if(!m)return{...o};const r={};for(const[k,v]of Object.entries(o))r[m[k]||k]=v;return r}
function toApp(t,o){const m=FM[t];if(!m)return{...o};const rm={};for(const[k,v]of Object.entries(m))rm[v]=k;const r={};for(const[k,v]of Object.entries(o))r[rm[k]||k]=v;return r}
async function loadT(t){try{const{data}=await supabase.from(t).select("*");return(data||[]).map(r=>toApp(t,r))}catch{return[]}}
async function addRow(t,row){const d=toDb(t,row);delete d.created_at;await supabase.from(t).insert([d])}
async function updateRow(t,row){const d=toDb(t,row);delete d.created_at;await supabase.from(t).update(d).eq("id",row.id)}
async function deleteRow(t,id){await supabase.from(t).delete().eq("id",id)}
 
const vnd=n=>new Intl.NumberFormat("vi-VN").format(n)+"\u0111";
const today=new Date().toISOString().slice(0,10);
const ACC="#10B981";
const CHART_C=["#10B981","#3B82F6","#8B5CF6","#F59E0B","#EF4444","#06B6D4","#F97316"];
const daysLeft=d=>{if(!d)return 0;const t=new Date(d).getTime();return Number.isFinite(t)?Math.ceil((t-Date.now())/86400000):0};
 
const USERS=[
{user:"admin",pass:"hantinh2026",role:"admin",name:"Admin",cls:"all"},
{user:"cohoa",pass:"gv2026",role:"teacher",name:"C\u00f4 Hoa",cls:"CN-A1"},
{user:"thaylong",pass:"gv2026",role:"teacher",name:"Th\u1ea7y Long",cls:"CN-A3,CN-B2"},
{user:"cowang",pass:"gv2026",role:"teacher",name:"C\u00f4 Wang Li",cls:"CN-A2"},
{user:"thaynam",pass:"gv2026",role:"teacher",name:"Th\u1ea7y Nam",cls:"CN-B1"},
];
const monthTrend=[{m:"T12",rev:42,lead:8,enroll:2},{m:"T1",rev:48,lead:12,enroll:4},{m:"T2",rev:52,lead:10,enroll:3},{m:"T3",rev:58,lead:15,enroll:5},{m:"T4",rev:65,lead:11,enroll:3},{m:"T5",rev:72,lead:14,enroll:5}];
const attendTrend=[{w:"T1",v:88},{w:"T2",v:91},{w:"T3",v:85},{w:"T4",v:93},{w:"T5",v:90},{w:"T6",v:87},{w:"T7",v:92},{w:"T8",v:94}];
 
/* ── Sparkline ── */
function Spark({data,w=80,h=32}){
  if(!data||data.length<2)return null;
  const mn=Math.min(...data),mx=Math.max(...data),rng=mx-mn||1;
  const pts=data.map((v,i)=>(i/(data.length-1))*w+","+(h-3-((v-mn)/rng)*(h-6))).join(" ");
  return<svg width={w} height={h} style={{display:"block"}}><polyline points={pts} fill="none" stroke={ACC} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity=".5"/></svg>;
}
 
/* ── Tooltip ── */
function CTip({active,payload,label}){
  if(!active||!payload?.length)return null;
  return<div style={{background:"#18181B",border:"1px solid rgba(255,255,255,.08)",borderRadius:10,padding:"10px 14px",fontSize:13,fontFamily:"Inter,sans-serif",boxShadow:"0 16px 48px rgba(0,0,0,.5)"}}>
    <div style={{color:"rgba(255,255,255,.4)",fontSize:11,fontWeight:600,marginBottom:4,textTransform:"uppercase",letterSpacing:".05em"}}>{label}</div>
    {payload.map((p,i)=><div key={i} style={{color:"#FAFAFA",fontWeight:700}}>{p.name}: <span style={{color:p.color||ACC}}>{p.value}</span></div>)}
  </div>;
}
 
/* ── Badge — no border, just tinted bg ── */
function Badge({text,variant="default"}){
  const v={ok:["rgba(16,185,129,.1)","#10B981"],err:["rgba(239,68,68,.08)","#EF4444"],warn:["rgba(245,158,11,.08)","#F59E0B"],info:["rgba(59,130,246,.08)","#3B82F6"],mute:["rgba(255,255,255,.04)","rgba(255,255,255,.4)"],purple:["rgba(139,92,246,.08)","#8B5CF6"],orange:["rgba(249,115,22,.08)","#F97316"]};
  const[bg,fg]=v[variant]||v.mute;
  return<span style={{display:"inline-block",padding:"3px 10px",borderRadius:6,fontSize:11,fontWeight:600,background:bg,color:fg,letterSpacing:".01em"}}>{text}</span>;
}
 
// ── MODAL ──
function ModalForm({type,initial,isNew,onSave,onClose,cls2,teachers,isAdmin,userName,mob}){
const d=useRef({...initial});
const is={padding:"11px 14px",border:"1px solid rgba(255,255,255,.06)",borderRadius:10,fontSize:14,outline:"none",width:"100%",fontFamily:"Inter,sans-serif",background:"rgba(255,255,255,.03)",color:"#FAFAFA",transition:"border-color .2s,box-shadow .2s"};
const fo=e=>{e.target.style.borderColor="rgba(16,185,129,.4)";e.target.style.boxShadow="0 0 0 3px rgba(16,185,129,.07)"};
const bl=e=>{e.target.style.borderColor="rgba(255,255,255,.06)";e.target.style.boxShadow="none"};
const F=({label,k,type:t})=><div style={{flex:1,marginBottom:14}}>
<label style={{display:"block",fontSize:11,color:"rgba(255,255,255,.3)",fontWeight:600,marginBottom:6,textTransform:"uppercase",letterSpacing:".05em"}}>{label}</label>
{t==="textarea"?<textarea style={{...is,minHeight:56,resize:"vertical"}} defaultValue={d.current[k]||""} onFocus={fo} onBlur={bl} onChange={e=>{d.current[k]=e.target.value}}/>
:t==="date"?<input style={is} type="date" defaultValue={d.current[k]||""} onFocus={fo} onBlur={bl} onChange={e=>{d.current[k]=e.target.value}}/>
:t==="number"?<input style={is} type="number" defaultValue={d.current[k]||0} onFocus={fo} onBlur={bl} onChange={e=>{d.current[k]=parseFloat(e.target.value)||0}}/>
:<input style={is} defaultValue={d.current[k]||""} onFocus={fo} onBlur={bl} onChange={e=>{d.current[k]=e.target.value}}/>}
  </div>;
  const S=({label,k,opts})=><div style={{flex:1,marginBottom:14}}>
    <label style={{display:"block",fontSize:11,color:"rgba(255,255,255,.3)",fontWeight:600,marginBottom:6,textTransform:"uppercase",letterSpacing:".05em"}}>{label}</label>
    <select style={{...is,appearance:"auto"}} defaultValue={d.current[k]||""} onChange={e=>{d.current[k]=e.target.value}}>{opts.map(o=>Array.isArray(o)?<option key={o[0]} value={o[0]}>{o[1]}</option>:<option key={o}>{o}</option>)}</select>
  </div>;
  const R=({children})=><div style={{display:"flex",gap:10}}>{children}</div>;
  const sources=["Facebook","TikTok","Gi\u1edbi thi\u1ec7u","Walk-in","Website"];
  const levels=["HSK 1","HSK 2","HSK 3","HSK 4","HSK 5","HSK 6"];
  const typeLabel={s:"H\u1ecdc vi\u00ean",l:"Kh\u00e1ch",tr:"H\u1ecdc th\u1eed",ct:"H\u1ee3p \u0111\u1ed3ng",hk:"HSK",r:"B\u00e1o c\u00e1o",i:"T\u01b0\u01a1ng t\u00e1c",f:"H\u1ecdc ph\u00ed"};
  return(
    <div className="modal-bg" onClick={onClose}>
      <div className={"modal-panel"+(mob?" modal-mob":"")} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <div style={{fontSize:16,fontWeight:700,color:"#FAFAFA"}}>{isNew?"Th\u00eam":"S\u1eeda"} {typeLabel[type]}</div>
          <button onClick={onClose} style={{background:"rgba(255,255,255,.04)",border:"none",width:30,height:30,borderRadius:8,cursor:"pointer",color:"rgba(255,255,255,.4)",display:"flex",alignItems:"center",justifyContent:"center"}}><X size={14}/></button>
        </div>
        {type==="l"&&<><R><F label="H\u1ecd t\u00ean" k="name"/><F label="S\u0110T" k="phone"/></R><R><S label="Ngu\u1ed3n" k="source" opts={sources}/><S label="Quan t\u00e2m" k="interest" opts={levels.slice(0,5)}/></R><S label="Giai \u0111o\u1ea1n" k="stage" opts={[["inquiry","H\u1ecfi th\u0103m"],["trial","H\u1ecdc th\u1eed"],["registered","\u0110\u00e3 \u0110K"],["lost","M\u1ea5t"]]}/><F label="Ghi ch\u00fa" k="note" type="textarea"/></>}
        {type==="s"&&<><R><F label="H\u1ecd t\u00ean" k="name"/><F label="S\u0110T" k="phone"/></R><R><S label="L\u1edbp" k="cls" opts={cls2.map(c=>c.id)}/><S label="Tr\u00ecnh \u0111\u1ed9" k="level" opts={levels}/></R><R><F label="\u0110i\u1ec3m" k="score" type="number"/><F label="CC %" k="attend" type="number"/></R><R><S label="Ngu\u1ed3n" k="source" opts={sources}/><S label="Tr\u1ea1ng th\u00e1i" k="status" opts={["\u0110ang h\u1ecdc","T\u1ea1m ngh\u1ec9","Ngh\u1ec9 h\u1ecdc"]}/></R></>}
        {type==="tr"&&<><R><F label="H\u1ecd t\u00ean" k="name"/><F label="S\u0110T" k="phone"/></R><R><F label="Ng\u00e0y" k="date" type="date"/><F label="Gi\u1edd" k="time"/></R><R><S label="L\u1edbp" k="cls" opts={cls2.map(c=>c.id)}/><S label="GV" k="teacher" opts={teachers}/></R><R><S label="TT" k="status" opts={[["scheduled","\u0110\u00e3 x\u1ebfp"],["completed","\u0110\u00e3 h\u1ecdc"],["no-show","Kh\u00f4ng \u0111\u1ebfn"]]}/><S label="KQ" k="result" opts={[["","\u2014"],["enrolled","\u0110\u00e3 \u0110K"],["thinking","Suy ngh\u0129"],["not-interested","Kh\u00f4ng QT"]]}/></R><F label="Nh\u1eafc l\u1ea1i" k="followUp" type="date"/></>}
        {type==="ct"&&<><F label="H\u1ecdc vi\u00ean" k="name"/><R><S label="L\u1edbp" k="cls" opts={cls2.map(c=>c.id)}/><S label="Th\u1eddi h\u1ea1n" k="duration" opts={["3 th\u00e1ng","6 th\u00e1ng","12 th\u00e1ng","18 th\u00e1ng"]}/></R><R><F label="B\u1eaft \u0111\u1ea7u" k="start" type="date"/><F label="K\u1ebft th\u00fac" k="end" type="date"/></R><F label="H\u1ecdc ph\u00ed" k="fee" type="number"/></>}
        {type==="hk"&&<><F label="H\u1ecdc vi\u00ean" k="name"/><R><S label="Level" k="level" opts={levels}/><F label="Ng\u00e0y thi" k="examDate" type="date"/></R><R><F label="\u0110i\u1ec3m" k="score" type="number"/><S label="KQ" k="passed" opts={[["","Ch\u01b0a thi"],["yes","\u0110\u1ea0T"],["no","Ch\u01b0a \u0111\u1ea1t"]]}/></R></>}
        {type==="r"&&<><R><F label="Ng\u00e0y" k="date" type="date"/>{isAdmin?<S label="GV" k="teacher" opts={teachers}/>:<div style={{flex:1}}><label style={{display:"block",fontSize:11,color:"rgba(255,255,255,.3)",fontWeight:600,marginBottom:6,textTransform:"uppercase",letterSpacing:".05em"}}>GV</label><input style={{...is,opacity:.5}} value={userName} disabled/></div>}<S label="L\u1edbp" k="cls" opts={cls2.map(c=>c.id)}/></R><R><F label="C\u00f3 m\u1eb7t" k="present" type="number"/><F label="V\u1eafng" k="absent" type="number"/></R><F label="HV v\u1eafng" k="absentNames"/><F label="B\u00e0i h\u1ecdc" k="lesson" type="textarea"/><F label="BTVN" k="homework" type="textarea"/><F label="Ch\u00fa \u00fd" k="flags" type="textarea"/><F label="N\u1ed5i b\u1eadt" k="highlights" type="textarea"/></>}
        {type==="i"&&<><R><F label="Ng\u01b0\u1eddi" k="refName"/><F label="Ng\u00e0y" k="date" type="date"/></R><R><S label="Lo\u1ea1i" k="type" opts={[["call","G\u1ecdi"],["message","Nh\u1eafn"],["meeting","G\u1eb7p"]]}/><F label="B\u1edfi" k="by"/></R><F label="N\u1ed9i dung" k="content" type="textarea"/></>}
        {type==="f"&&<><F label="H\u1ecd t\u00ean" k="name"/><R><S label="L\u1edbp" k="cls" opts={cls2.map(c=>c.id)}/><F label="T\u1ed5ng ph\u00ed" k="total" type="number"/></R><R><F label="H\u1ea1n \u0111\u1ee3t 2" k="d2d"/><S label="TT" k="st" opts={[["paid","\u0110\u00e3 \u0111\u00f3ng"],["pending","Ch\u1edd"],["overdue","Qu\u00e1 h\u1ea1n"]]}/></R></>}
        <div style={{display:"flex",gap:10,marginTop:20}}>
          <button className="btn-accent" style={{flex:1,justifyContent:"center"}} onClick={()=>{
            const data={...d.current};
            if(type==="f"&&data.total){data.d1=Math.round(data.total/2);data.d2=Math.round(data.total/2)}
            if(type==="hk"){data.status=data.passed==="yes"?"passed":data.passed==="no"?"failed":"registered"}
            onSave(data);
          }}><Save size={14}/>L\u01b0u</button>
          <button className="btn-mute" onClick={onClose}>Hu\u1ef7</button>
        </div>
      </div>
    </div>
  );
}
 
// ═══════════ APP ═══════════
export default function App(){
const[user,setUser]=useState(null);const[lu,setLu]=useState("");const[lp,setLp]=useState("");const[le,setLe]=useState("");
const[pg,setPg]=useState("home");const[mob,setMob]=useState(window.innerWidth<768);
const[stu,setStu]=useState([]);const[cls2,setCls2]=useState([]);const[fin,setFin]=useState([]);
const[rpt,setRpt]=useState([]);const[leads,setLeads]=useState([]);const[inter,setInter]=useState([]);
const[trials,setTrials]=useState([]);const[contracts,setContracts]=useState([]);const[hsk,setHsk]=useState([]);
const[modal,setModal]=useState(null);const[q,setQ]=useState("");const[dtab,setDtab]=useState("kpi");const[ok,setOk]=useState(false);
const[showMenu,setShowMenu]=useState(false);
 
useEffect(()=>{if(!document.getElementById("inter-font")){const l=document.createElement("link");l.id="inter-font";l.href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap";l.rel="stylesheet";document.head.appendChild(l)}},[]);
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
const login=()=>{const u=USERS.find(u=>u.user===lu&&u.pass===lp);if(u){setUser(u);localStorage.setItem("ht_user",JSON.stringify(u));setLe("")}else setLe("Sai t\u00e0i kho\u1ea3n ho\u1eb7c m\u1eadt kh\u1ea9u")};
const logout=()=>{setUser(null);localStorage.removeItem("ht_user");setPg("home")};
const isAdmin=user?.role==="admin";
const canSee=c=>isAdmin||(user?.cls||"").split(",").includes(c);
 
if(!ok)return<div style={{display:"flex",height:"100vh",alignItems:"center",justifyContent:"center",fontFamily:"Inter,sans-serif",background:"#09090B",color:"rgba(255,255,255,.3)",gap:10,fontSize:14}}>
  <div style={{width:16,height:16,border:"2px solid rgba(16,185,129,.2)",borderTopColor:ACC,borderRadius:"50%",animation:"_s .5s linear infinite"}}/>Loading
</div>;
 
if(!user)return(
<div style={{fontFamily:"Inter,sans-serif",minHeight:"100vh",background:"#09090B",display:"flex",alignItems:"center",justifyContent:"center",padding:20,position:"relative",overflow:"hidden"}}>
<style>{`@keyframes _s{to{transform:rotate(360deg)}}`}</style>
<div style={{position:"absolute",width:600,height:600,borderRadius:"50%",background:"radial-gradient(circle,rgba(16,185,129,.05),transparent 70%)",top:"-15%",right:"-5%",filter:"blur(60px)"}}/>
<div style={{width:mob?"100%":380,background:"rgba(255,255,255,.02)",border:"1px solid rgba(255,255,255,.06)",borderRadius:20,padding:mob?24:40,position:"relative"}}>
<div style={{width:44,height:44,borderRadius:12,background:ACC,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:20,fontWeight:900,margin:"0 auto 20px",boxShadow:"0 0 40px rgba(16,185,129,.2)"}}><span style={{fontFamily:"serif"}}>&#28450;</span></div>
<div style={{fontSize:22,fontWeight:800,color:"#FAFAFA",textAlign:"center",marginBottom:4}}>H&#225;n Tinh Premium</div>
<div style={{color:"rgba(255,255,255,.25)",fontSize:13,textAlign:"center",marginBottom:32}}>Management System</div>
<input className="inp" placeholder="T&#224;i kho&#7843;n" value={lu} onChange={e=>setLu(e.target.value)} onKeyDown={e=>e.key==="Enter"&&login()}/>
<input className="inp" placeholder="M&#7853;t kh&#7849;u" type="password" value={lp} onChange={e=>setLp(e.target.value)} onKeyDown={e=>e.key==="Enter"&&login()}/>
{le&&<div style={{color:"#EF4444",fontSize:13,marginBottom:10,textAlign:"center"}}>{le}</div>}
<button className="btn-accent" style={{width:"100%",justifyContent:"center"}} onClick={login}>&#272;&#259;ng nh&#7853;p</button>
</div>
</div>
);
 
// ── DATA ──
const query=q.trim().toLowerCase();
const act=stu.filter(s=>s.status==="\u0110ang h\u1ecdc"),ov=fin.filter(f=>f.st==="overdue"),pend=fin.filter(f=>f.st==="pending");
const ranked=[...act].sort((a,b)=>(b.score||0)-(a.score||0));
const teachers=[...new Set(cls2.map(c=>c.teacher).filter(Boolean))];
const needFU=trials.filter(t=>t.result==="thinking");
const hskP=hsk.filter(h=>h.passed==="yes").length,hskTt=hsk.filter(h=>h.status!=="registered").length,hskRate=hskTt>0?Math.round(hskP/hskTt*100):0;
const collected=fin.reduce((a,f)=>a+(f.d1||0)+(f.st==="paid"?(f.d2||0):0),0);
const srcData=["Facebook","TikTok","Gi\u1edbi thi\u1ec7u","Walk-in","Website"].map(s=>({name:s,v:[...stu,...leads].filter(x=>x.source===s).length})).filter(d=>d.v>0);
const funnelData=[{s:"H\u1ecfi th\u0103m",v:leads.filter(l=>l.stage!=="lost").length},{s:"H\u1ecdc th\u1eed",v:leads.filter(l=>l.stage==="trial"||l.stage==="registered").length},{s:"\u0110\u0103ng k\u00fd",v:leads.filter(l=>l.stage==="registered").length},{s:"\u0110ang h\u1ecdc",v:act.length}];
const payPie=[{n:"\u0110\u1ee7",v:fin.filter(f=>f.st==="paid").length},{n:"Ch\u1edd",v:pend.length},{n:"N\u1ee3",v:ov.length}];
const scoreDist=[{r:"<5",n:stu.filter(s=>(s.score||0)<5).length},{r:"5-6.5",n:stu.filter(s=>(s.score||0)>=5&&s.score<6.5).length},{r:"6.5-8",n:stu.filter(s=>(s.score||0)>=6.5&&s.score<8).length},{r:"8-9",n:stu.filter(s=>(s.score||0)>=8&&s.score<9).length},{r:"9+",n:stu.filter(s=>(s.score||0)>=9).length}];
 
const om=(t,d,n)=>setModal({t,d,n});
const g=c=>mob?"1fr":`repeat(${c},1fr)`;
const CC=({title,children,h=190})=><div className="card"><div style={{fontSize:12,fontWeight:600,color:"rgba(255,255,255,.3)",marginBottom:14,textTransform:"uppercase",letterSpacing:".06em"}}>{title}</div><ResponsiveContainer width="100%" height={h}>{children}</ResponsiveContainer></div>;
 
const srcBadge=s=>({Facebook:"info",TikTok:"purple","Gi\u1edbi thi\u1ec7u":"ok","Walk-in":"orange",Website:"warn"})[s]||"mute";
const stageBadge=s=>({inquiry:["H\u1ecfi","info"],trial:["Th\u1eed","warn"],registered:["\u0110K","ok"],lost:["M\u1ea5t","mute"]})[s]||[s,"mute"];
 
const adminMenu=[{id:"home",l:"T\u1ed5ng quan",ic:LayoutDashboard},{id:"leads",l:"Kh\u00e1ch m\u1edbi",ic:Target},{id:"trials",l:"H\u1ecdc th\u1eed",ic:BookOpen},{id:"stu",l:"H\u1ecdc vi\u00ean",ic:Users},{id:"contracts",l:"H\u1ee3p \u0111\u1ed3ng",ic:FileText},{id:"hsk",l:"HSK",ic:GraduationCap},{id:"rpt",l:"B\u00e1o c\u00e1o",ic:ClipboardList},{id:"log",l:"L\u1ecbch s\u1eed",ic:MessageSquare},{id:"fin",l:"T\u00e0i ch\u00ednh",ic:Wallet},{id:"charts",l:"Bi\u1ec3u \u0111\u1ed3",ic:BarChart3}];
const teacherMenu=[{id:"home",l:"T\u1ed5ng quan",ic:LayoutDashboard},{id:"stu",l:"H\u1ecdc vi\u00ean",ic:Users},{id:"rpt",l:"B\u00e1o c\u00e1o",ic:ClipboardList},{id:"hsk",l:"HSK",ic:GraduationCap}];
const menu=isAdmin?adminMenu:teacherMenu;
const mobNav=isAdmin?[{id:"home",ic:LayoutDashboard,l:"Home"},{id:"leads",ic:Target,l:"Kh\u00e1ch"},{id:"stu",ic:Users,l:"HV"},{id:"rpt",ic:ClipboardList,l:"BC"},{id:"more",ic:Menu,l:"More"}]:[{id:"home",ic:LayoutDashboard,l:"Home"},{id:"stu",ic:Users,l:"HV"},{id:"rpt",ic:ClipboardList,l:"BC"},{id:"hsk",ic:GraduationCap,l:"HSK"}];
const moreMenu=adminMenu.filter(m=>!["home","leads","stu","rpt"].includes(m.id));
 
return(
<div style={{fontFamily:"Inter,sans-serif",display:"flex",flexDirection:mob?"column":"row",height:"100vh",background:"#09090B",color:"#FAFAFA",overflow:"hidden",position:"relative"}}>
<style>{`
@keyframes _s{to{transform:rotate(360deg)}}
@keyframes _fi{from{opacity:0}to{opacity:1}}
@keyframes _si{from{opacity:0;transform:scale(.97)}to{opacity:1;transform:scale(1)}}
@keyframes _su{from{transform:translateY(100%)}to{transform:translateY(0)}}
*{box-sizing:border-box;margin:0;padding:0}
::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:rgba(255,255,255,.06);border-radius:99px}
input[type="date"]::-webkit-calendar-picker-indicator{filter:invert(.7)}
select{color-scheme:dark}
::selection{background:rgba(16,185,129,.2)}
 
.card{background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.06);border-radius:14px;padding:20px;transition:border-color .3s}
.card:hover{border-color:rgba(255,255,255,.1)}
 
.nav-item{display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:8px;cursor:pointer;font-size:13px;font-weight:500;color:rgba(255,255,255,.35);transition:all .2s}
.nav-item:hover{color:rgba(255,255,255,.7);background:rgba(255,255,255,.03)}
.nav-item.active{color:#FAFAFA;background:rgba(255,255,255,.05);font-weight:600}
 
.btn-accent{display:inline-flex;align-items:center;gap:6px;padding:10px 20px;border-radius:8px;border:none;cursor:pointer;font-size:13px;font-weight:600;font-family:Inter,sans-serif;background:${ACC};color:#fff;transition:all .2s;box-shadow:0 0 0 0 rgba(16,185,129,0)}
.btn-accent:hover{box-shadow:0 0 24px rgba(16,185,129,.25);filter:brightness(1.1)}
.btn-sm{padding:6px 12px;font-size:12px;border-radius:6px}
.btn-mute{padding:10px 20px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.06);border-radius:8px;font-size:13px;color:rgba(255,255,255,.5);cursor:pointer;font-family:Inter,sans-serif;font-weight:500;transition:all .2s}
.btn-mute:hover{background:rgba(255,255,255,.06);color:rgba(255,255,255,.8)}
.btn-outline{display:inline-flex;align-items:center;gap:4px;padding:6px 12px;border-radius:6px;border:1px solid rgba(255,255,255,.08);background:transparent;cursor:pointer;font-size:12px;font-weight:600;font-family:Inter,sans-serif;color:rgba(255,255,255,.5);transition:all .2s}
.btn-outline:hover{border-color:${ACC};color:${ACC};background:rgba(16,185,129,.04)}
 
table{width:100%;border-collapse:collapse;min-width:600px}
th{padding:10px 16px;text-align:left;font-size:11px;font-weight:600;color:rgba(255,255,255,.2);text-transform:uppercase;letter-spacing:.06em;border-bottom:1px solid rgba(255,255,255,.06)}
td{padding:12px 16px;font-size:14px;border-bottom:1px solid rgba(255,255,255,.03);color:rgba(255,255,255,.45);transition:background .15s}
tr:hover td{background:rgba(255,255,255,.02)}
 
.act-btn{padding:6px;border-radius:6px;border:none;background:transparent;color:rgba(255,255,255,.2);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;transition:all .15s}
.act-btn:hover{color:${ACC};background:rgba(16,185,129,.06)}
.act-btn.del:hover{color:#EF4444;background:rgba(239,68,68,.06)}
 
.tab-btn{padding:7px 16px;border-radius:6px;cursor:pointer;font-size:12px;font-weight:600;color:rgba(255,255,255,.3);border:none;background:transparent;font-family:Inter,sans-serif;transition:all .2s}
.tab-btn:hover{color:rgba(255,255,255,.6)}
.tab-btn.active{background:rgba(255,255,255,.06);color:#FAFAFA}
 
.inp{width:100%;padding:11px 14px;border:1px solid rgba(255,255,255,.06);border-radius:10px;font-size:14px;outline:none;font-family:Inter,sans-serif;background:rgba(255,255,255,.03);color:#FAFAFA;margin-bottom:12px;transition:border-color .2s,box-shadow .2s}
.inp:focus{border-color:rgba(16,185,129,.35);box-shadow:0 0 0 3px rgba(16,185,129,.06)}
.inp::placeholder{color:rgba(255,255,255,.15)}
 
.pb{height:3px;background:rgba(255,255,255,.04);border-radius:99px;overflow:hidden}
.pf{height:100%;border-radius:99px}
 
.bot-nav{display:flex;background:#09090B;border-top:1px solid rgba(255,255,255,.06);padding:6px 0}
.bot-item{flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;padding:8px 0;cursor:pointer;color:rgba(255,255,255,.25);transition:.15s}
.bot-item.active{color:${ACC}}
 
.more-popup{position:absolute;bottom:60px;right:8px;background:#18181B;border:1px solid rgba(255,255,255,.08);border-radius:12px;box-shadow:0 16px 48px rgba(0,0,0,.5);padding:4px;width:200px;z-index:50}
 
.modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.7);backdrop-filter:blur(16px);display:flex;align-items:center;justify-content:center;z-index:100;animation:_fi .15s}
.modal-panel{background:#18181B;border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:28px;width:520px;max-height:88vh;overflow-y:auto;animation:_si .2s ease-out}
.modal-mob{width:100%;max-height:92vh;border-radius:16px 16px 0 0;position:fixed;bottom:0;left:0;right:0;animation:_su .25s ease-out;padding:24px 20px 28px}
`}</style>
 
  {/* ═══ SIDEBAR ═══ */}
  {!mob&&<div style={{width:220,borderRight:"1px solid rgba(255,255,255,.06)",display:"flex",flexDirection:"column",flexShrink:0,background:"#09090B"}}>
    <div style={{padding:"20px 16px 16px",display:"flex",alignItems:"center",gap:12,borderBottom:"1px solid rgba(255,255,255,.04)",marginBottom:4}}>
      <div style={{width:32,height:32,borderRadius:8,background:ACC,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:15,fontWeight:900}}><span style={{fontFamily:"serif"}}>&#28450;</span></div>
      <div><div style={{fontWeight:800,fontSize:14,color:"#FAFAFA"}}>H&#225;n Tinh</div><div style={{fontSize:10,color:"rgba(255,255,255,.25)",fontWeight:600,letterSpacing:"1px"}}>PREMIUM</div></div>
    </div>
    <nav style={{flex:1,padding:"4px 8px",overflow:"auto"}}>
      {menu.map(m=>{const Icon=m.ic;return<div key={m.id} className={"nav-item"+(pg===m.id?" active":"")} onClick={()=>setPg(m.id)}>
        <Icon size={16} strokeWidth={pg===m.id?2.2:1.5}/>{m.l}
      </div>})}
    </nav>
    <div style={{padding:"12px 12px 16px",borderTop:"1px solid rgba(255,255,255,.04)"}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <div style={{width:30,height:30,borderRadius:8,background:"rgba(255,255,255,.06)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:"rgba(255,255,255,.5)"}}>{user.name.charAt(0)}</div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:12,fontWeight:600,color:"rgba(255,255,255,.7)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{user.name}</div>
          <div style={{fontSize:10,color:"rgba(255,255,255,.2)"}}>{isAdmin?"Admin":"GV"}</div>
        </div>
        <button onClick={logout} className="act-btn del" title="Tho\u00e1t"><LogOut size={14}/></button>
      </div>
    </div>
  </div>}
 
  {/* ═══ MAIN ═══ */}
  <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
    <div style={{padding:"10px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid rgba(255,255,255,.06)",flexShrink:0}}>
      {mob?<div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:26,height:26,borderRadius:7,background:ACC,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:11,fontWeight:900}}><span style={{fontFamily:"serif"}}>&#28450;</span></div><span style={{fontWeight:700,fontSize:14}}>H&#225;n Tinh</span></div>
      :<div style={{position:"relative",width:240}}><Search size={14} style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:"rgba(255,255,255,.15)"}}/><input className="inp" style={{marginBottom:0,paddingLeft:34}} placeholder="T\u00ecm..." value={q} onChange={e=>setQ(e.target.value)}/></div>}
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        {!mob&&(ov.length+needFU.length)>0&&<span style={{fontSize:11,fontWeight:600,color:"#EF4444",background:"rgba(239,68,68,.08)",padding:"4px 10px",borderRadius:6}}>{ov.length+needFU.length} c\u1ea7n x\u1eed l\u00fd</span>}
        {mob&&<button onClick={logout} className="act-btn del"><LogOut size={16}/></button>}
      </div>
    </div>
 
    <div style={{flex:1,overflow:"auto",padding:mob?14:24}}>
 
      {/* ════════ HOME ════════ */}
      {pg==="home"&&<div>
        <div style={{marginBottom:24}}><div style={{fontSize:mob?22:28,fontWeight:800,letterSpacing:"-.03em"}}>T\u1ed5ng quan</div><div style={{fontSize:13,color:"rgba(255,255,255,.25)",marginTop:4}}>D\u1eef li\u1ec7u c\u1eadp nh\u1eadt realtime</div></div>
        {isAdmin&&<div style={{display:"inline-flex",gap:2,background:"rgba(255,255,255,.03)",borderRadius:8,padding:2,marginBottom:16}}>
          {[["kpi","Ch\u1ec9 s\u1ed1"],["funnel","Ph\u1ec5u"],["trends","Xu h\u01b0\u1edbng"]].map(([id,l])=><button key={id} className={"tab-btn"+(dtab===id?" active":"")} onClick={()=>setDtab(id)}>{l}</button>)}
        </div>}
        <div style={{display:"grid",gridTemplateColumns:g(isAdmin?3:2),gap:12,marginBottom:20}}>
          {(isAdmin?[
            {l:"Kh\u00e1ch m\u1edbi",v:leads.filter(l=>l.stage!=="lost").length,spark:[8,12,10,15,11,14],trend:12},
            {l:"H\u1ecdc vi\u00ean",v:act.length,spark:[18,20,22,21,24,26],trend:8},
            {l:"HSK \u0111\u1ed7",v:hskRate+"%",spark:[60,65,70,68,75,hskRate]},
            {l:"\u0110\u00e3 thu",v:vnd(collected),spark:[42,48,52,58,65,72],trend:11},
            {l:"N\u1ee3 HP",v:ov.length,err:ov.length>0},
            {l:"C\u1ea7n nh\u1eafc",v:needFU.length}
          ]:[
            {l:"HV l\u1edbp t\u00f4i",v:stu.filter(s=>canSee(s.cls)).length},
            {l:"B\u00e1o c\u00e1o",v:rpt.filter(r=>r.teacher===user.name).length},
            {l:"\u0110i\u1ec3m TB",v:(stu.filter(s=>canSee(s.cls)&&s.status==="\u0110ang h\u1ecdc").reduce((a,s)=>a+s.score,0)/Math.max(stu.filter(s=>canSee(s.cls)&&s.status==="\u0110ang h\u1ecdc").length,1)).toFixed(1)},
            {l:"Chuy\u00ean c\u1ea7n",v:Math.round(stu.filter(s=>canSee(s.cls)&&s.status==="\u0110ang h\u1ecdc").reduce((a,s)=>a+s.attend,0)/Math.max(stu.filter(s=>canSee(s.cls)&&s.status==="\u0110ang h\u1ecdc").length,1))+"%"}
          ]).map((s,i)=><div key={i} className="card">
            <div style={{fontSize:11,fontWeight:600,color:"rgba(255,255,255,.25)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:10}}>{s.l}</div>
            <div style={{fontSize:mob?32:42,fontWeight:900,letterSpacing:"-.04em",color:s.err?"#EF4444":"#FAFAFA",lineHeight:1}}>{s.v}</div>
            <div style={{display:"flex",alignItems:"center",gap:8,marginTop:10}}>
              {s.spark&&<Spark data={s.spark}/>}
              {s.trend&&<span style={{fontSize:11,fontWeight:600,color:ACC,display:"flex",alignItems:"center",gap:2}}><TrendingUp size={12}/>{s.trend}%</span>}
            </div>
          </div>)}
        </div>
        {dtab==="kpi"&&isAdmin&&<div style={{display:"grid",gridTemplateColumns:g(3),gap:12}}>
          <div className="card"><div style={{fontSize:11,fontWeight:600,color:"rgba(255,255,255,.25)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:14}}>C\u1ea7n thu</div>{ov.map(f=><div key={f.id} style={{padding:"10px 0",borderBottom:"1px solid rgba(255,255,255,.03)",display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><div style={{fontWeight:600,color:"rgba(255,255,255,.7)",fontSize:13}}>{f.name}</div><div style={{color:"#EF4444",fontSize:12,marginTop:2}}>{vnd(f.d2)}</div></div><button className="btn-accent btn-sm" onClick={()=>{setFin(fin.map(x=>x.id===f.id?{...x,st:"paid"}:x));updateRow("finance",{...f,st:"paid"})}}><Check size={12}/></button></div>)}{ov.length===0&&<div style={{color:ACC,fontSize:13,display:"flex",alignItems:"center",gap:6}}><Check size={14}/>OK</div>}</div>
          <div className="card"><div style={{fontSize:11,fontWeight:600,color:"rgba(255,255,255,.25)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:14}}>Top 5</div>{ranked.slice(0,5).map((s,i)=><div key={s.id} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",fontSize:13}}><span style={{color:"rgba(255,255,255,.5)"}}><span style={{color:i<3?ACC:"rgba(255,255,255,.15)",fontWeight:700,marginRight:8,fontVariantNumeric:"tabular-nums"}}>{i+1}</span>{s.name}</span><span style={{fontWeight:800,fontVariantNumeric:"tabular-nums"}}>{s.score}</span></div>)}</div>
          <div className="card"><div style={{fontSize:11,fontWeight:600,color:"rgba(255,255,255,.25)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:14}}>B\u00e1o c\u00e1o m\u1edbi</div>{rpt.slice(0,4).map(r=><div key={r.id} style={{padding:"7px 0",borderBottom:"1px solid rgba(255,255,255,.03)",fontSize:12}}><span style={{color:"rgba(255,255,255,.6)",fontWeight:600}}>{r.teacher}</span> <span style={{color:"rgba(255,255,255,.15)"}}>&#183; {r.cls} &#183; {r.date}</span></div>)}</div>
        </div>}
        {dtab==="funnel"&&isAdmin&&<div style={{display:"grid",gridTemplateColumns:g(2),gap:12}}>
          <div className="card"><div style={{fontSize:11,fontWeight:600,color:"rgba(255,255,255,.25)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:16}}>Ph\u1ec5u</div>{funnelData.map((f,i)=><div key={f.s} style={{height:36,borderRadius:8,display:"flex",alignItems:"center",padding:"0 14px",color:"#000",fontWeight:700,fontSize:12,marginBottom:6,background:CHART_C[i],width:Math.max((f.v/Math.max(funnelData[0].v,1))*100,25)+"%",transition:"width .4s"}}>{f.s}: {f.v}</div>)}</div>
          <CC title="Ngu\u1ed3n"><PieChart><Pie data={srcData} cx="50%" cy="50%" innerRadius={35} outerRadius={65} dataKey="v" label={({name,v})=>name.slice(0,4)+":"+v} fontSize={10} stroke="none">{srcData.map((e,i)=><Cell key={i} fill={CHART_C[i]}/>)}</Pie><Tooltip content={<CTip/>}/></PieChart></CC>
        </div>}
        {dtab==="trends"&&isAdmin&&<div style={{display:"grid",gridTemplateColumns:g(2),gap:12}}>
          <CC title="Doanh thu"><BarChart data={monthTrend}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.03)"/><XAxis dataKey="m" fontSize={10} stroke="rgba(255,255,255,.12)" tickLine={false} axisLine={false}/><YAxis fontSize={10} stroke="rgba(255,255,255,.12)" tickLine={false} axisLine={false}/><Tooltip content={<CTip/>}/><Bar dataKey="rev" fill={ACC} radius={[4,4,0,0]}/></BarChart></CC>
          <CC title="Chuy\u00ean c\u1ea7n"><LineChart data={attendTrend}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.03)"/><XAxis dataKey="w" fontSize={10} stroke="rgba(255,255,255,.12)" tickLine={false} axisLine={false}/><YAxis domain={[80,100]} fontSize={10} stroke="rgba(255,255,255,.12)" tickLine={false} axisLine={false}/><Tooltip content={<CTip/>}/><Line type="monotone" dataKey="v" stroke="#3B82F6" strokeWidth={2} dot={{fill:"#3B82F6",r:3,strokeWidth:0}}/></LineChart></CC>
        </div>}
      </div>}
 
      {/* ════════ LEADS ════════ */}
      {pg==="leads"&&isAdmin&&<div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}><div style={{fontSize:22,fontWeight:800,letterSpacing:"-.03em"}}>Kh\u00e1ch ti\u1ec1m n\u0103ng</div><button className="btn-accent" onClick={()=>om("l",{id:"LD"+Date.now(),name:"",phone:"",source:"Facebook",stage:"inquiry",interest:"HSK 1",note:"",created:today,lastContact:today},1)}><Plus size={14}/>Th\u00eam</button></div>
        <div style={{overflow:"auto",borderRadius:14}}><div className="card" style={{padding:0}}><table><thead><tr>{["T\u00ean","S\u0110T","Ngu\u1ed3n","QT","G\u0110",""].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{leads.map(l=>{const[st,sv]=stageBadge(l.stage);return<tr key={l.id}><td style={{fontWeight:600,color:"rgba(255,255,255,.8)"}}>{l.name}</td><td>{l.phone}</td><td><Badge text={l.source} variant={srcBadge(l.source)}/></td><td><Badge text={l.interest} variant="info"/></td><td><Badge text={st} variant={sv}/></td>
          <td><div style={{display:"flex",gap:3,alignItems:"center"}}>{l.stage==="inquiry"&&<button className="btn-outline" onClick={()=>{setLeads(leads.map(x=>x.id===l.id?{...x,stage:"trial"}:x));updateRow("leads",{...l,stage:"trial"})}}><ChevronRight size={12}/>Th\u1eed</button>}{l.stage==="trial"&&<button className="btn-accent btn-sm" onClick={()=>{setLeads(leads.map(x=>x.id===l.id?{...x,stage:"registered"}:x));updateRow("leads",{...l,stage:"registered"})}}><ChevronRight size={12}/>\u0110K</button>}<button className="act-btn" onClick={()=>om("l",{...l},0)}><Pencil size={13}/></button><button className="act-btn del" onClick={()=>{if(confirm("Xo\u00e1?"))doDel("l",l.id)}}><Trash2 size={13}/></button></div></td></tr>})}</tbody></table></div></div>
      </div>}
 
      {/* ════════ STUDENTS ════════ */}
      {pg==="stu"&&<div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}><div style={{fontSize:22,fontWeight:800,letterSpacing:"-.03em"}}>H\u1ecdc vi\u00ean</div>{isAdmin&&<button className="btn-accent" onClick={()=>om("s",{id:"HV"+Date.now(),name:"",phone:"",cls:cls2[0]?.id||"",level:"HSK 1",status:"\u0110ang h\u1ecdc",score:0,attend:90,source:"Facebook"},1)}><Plus size={14}/>Th\u00eam</button>}</div>
        <div style={{overflow:"auto",borderRadius:14}}><div className="card" style={{padding:0}}><table><thead><tr>{["#","HV","Level","L\u1edbp","\u0110i\u1ec3m","CC","TT",...(isAdmin?[""]:[])] .map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{stu.filter(s=>(!q||s.name.toLowerCase().includes(query))&&canSee(s.cls)).map((s,i)=><tr key={s.id}><td style={{color:"rgba(255,255,255,.12)",fontSize:11,fontVariantNumeric:"tabular-nums"}}>{i+1}</td><td><div style={{fontWeight:600,color:"rgba(255,255,255,.8)"}}>{s.name}</div><div style={{color:"rgba(255,255,255,.2)",fontSize:12}}>{s.phone}</div></td><td><Badge text={s.level} variant="info"/></td><td style={{color:"rgba(255,255,255,.35)"}}>{s.cls}</td><td style={{fontWeight:800,color:s.score>=8?ACC:s.score>=6.5?"#F59E0B":"#EF4444",fontSize:18,fontVariantNumeric:"tabular-nums"}}>{s.score}</td><td><div style={{display:"flex",alignItems:"center",gap:6}}><div className="pb" style={{width:48}}><div className="pf" style={{width:s.attend+"%",background:s.attend>=90?ACC:"#F59E0B"}}/></div><span style={{fontSize:11,color:"rgba(255,255,255,.3)",fontWeight:600}}>{s.attend}%</span></div></td><td><Badge text={s.status} variant={s.status==="\u0110ang h\u1ecdc"?"ok":s.status==="T\u1ea1m ngh\u1ec9"?"warn":"mute"}/></td>
          {isAdmin&&<td><button className="act-btn" onClick={()=>om("s",{...s},0)}><Pencil size={13}/></button><button className="act-btn del" onClick={()=>{if(confirm("Xo\u00e1?"))doDel("s",s.id)}}><Trash2 size={13}/></button></td>}</tr>)}</tbody></table></div></div>
      </div>}
 
      {/* ════════ TRIALS ════════ */}
      {pg==="trials"&&isAdmin&&<div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}><div style={{fontSize:22,fontWeight:800,letterSpacing:"-.03em"}}>H\u1ecdc th\u1eed</div><button className="btn-accent" onClick={()=>om("tr",{id:"TL"+Date.now(),name:"",phone:"",source:"Facebook",date:today,time:"18:00",cls:cls2[0]?.id||"",teacher:teachers[0]||"",status:"scheduled",result:"",followUp:""},1)}><Plus size={14}/>X\u1ebfp l\u1ecbch</button></div>
        <div style={{overflow:"auto",borderRadius:14}}><div className="card" style={{padding:0}}><table><thead><tr>{["T\u00ean","Ng\u00e0y","L\u1edbp","TT","KQ","Nh\u1eafc",""].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{trials.map(t=><tr key={t.id}><td style={{fontWeight:600,color:"rgba(255,255,255,.8)"}}>{t.name}</td><td style={{fontSize:13,color:"rgba(255,255,255,.35)"}}>{t.date} {t.time}</td><td style={{color:"rgba(255,255,255,.35)"}}>{t.cls}</td><td><Badge text={{scheduled:"X\u1ebfp",completed:"Xong","no-show":"K\u0110"}[t.status]||t.status} variant={{scheduled:"info",completed:"ok","no-show":"err"}[t.status]||"mute"}/></td><td>{t.result?<Badge text={{enrolled:"\u0110K",thinking:"Ngh\u0129","not-interested":"KQT"}[t.result]} variant={{enrolled:"ok",thinking:"warn","not-interested":"mute"}[t.result]}/>:<span style={{color:"rgba(255,255,255,.1)"}}>&#8212;</span>}</td><td style={{color:t.followUp&&daysLeft(t.followUp)<=1?"#EF4444":"rgba(255,255,255,.2)",fontSize:13}}>{t.followUp||"\u2014"}</td>
          <td><div style={{display:"flex",gap:3}}>{t.status==="scheduled"&&<button className="btn-accent btn-sm" onClick={()=>{setTrials(trials.map(x=>x.id===t.id?{...x,status:"completed"}:x));updateRow("trials",{...t,status:"completed"})}}><Check size={12}/></button>}<button className="act-btn" onClick={()=>om("tr",{...t},0)}><Pencil size={13}/></button></div></td></tr>)}</tbody></table></div></div>
      </div>}
 
      {/* ════════ CONTRACTS ════════ */}
      {pg==="contracts"&&isAdmin&&<div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}><div style={{fontSize:22,fontWeight:800,letterSpacing:"-.03em"}}>H\u1ee3p \u0111\u1ed3ng</div><button className="btn-accent" onClick={()=>om("ct",{id:"HD"+Date.now(),name:"",cls:cls2[0]?.id||"",start:today,end:"",duration:"6 th\u00e1ng",fee:0,status:"active",note:""},1)}><Plus size={14}/>T\u1ea1o</button></div>
        <div style={{overflow:"auto",borderRadius:14}}><div className="card" style={{padding:0}}><table><thead><tr>{["HV","L\u1edbp","B\u0110","KT","Ph\u00ed","TT","C\u00f2n",""].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{contracts.map(c=>{const dl=daysLeft(c.end);const rs=c.status==="renewed"?"renewed":dl<=0?"expired":dl<=30?"expiring":"active";return<tr key={c.id}><td style={{fontWeight:600,color:"rgba(255,255,255,.8)"}}>{c.name}</td><td><Badge text={c.cls} variant="info"/></td><td style={{fontSize:13,color:"rgba(255,255,255,.35)"}}>{c.start}</td><td style={{fontSize:13,color:"rgba(255,255,255,.35)"}}>{c.end}</td><td style={{fontWeight:700,color:ACC}}>{vnd(c.fee)}</td><td><Badge text={{active:"OK",expiring:"S\u1eafp",expired:"H\u1ebft",renewed:"GH"}[rs]} variant={{active:"ok",expiring:"warn",expired:"err",renewed:"info"}[rs]}/></td><td style={{fontWeight:700,fontVariantNumeric:"tabular-nums",color:dl<=0?"#EF4444":dl<=30?"#F59E0B":ACC}}>{dl<=0?"H\u1ebft":dl+"d"}</td>
          <td><div style={{display:"flex",gap:3}}>{(rs==="expiring"||rs==="expired")&&<button className="btn-accent btn-sm" onClick={()=>{const nc={...c,status:"renewed"};setContracts(contracts.map(x=>x.id===c.id?nc:x));updateRow("contracts",nc)}}>GH</button>}<button className="act-btn" onClick={()=>om("ct",{...c},0)}><Pencil size={13}/></button></div></td></tr>})}</tbody></table></div></div>
      </div>}
 
      {/* ════════ HSK ════════ */}
      {pg==="hsk"&&<div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}><div style={{fontSize:22,fontWeight:800,letterSpacing:"-.03em"}}>Thi HSK</div>{isAdmin&&<button className="btn-accent" onClick={()=>om("hk",{id:"HSK"+Date.now(),name:"",level:"HSK 1",examDate:"",score:0,passed:"",status:"registered"},1)}><Plus size={14}/>\u0110K</button>}</div>
        <div style={{display:"grid",gridTemplateColumns:g(2),gap:12,marginBottom:16}}>
          <CC title="K\u1ebft qu\u1ea3"><BarChart data={["HSK 1","HSK 2","HSK 3","HSK 4","HSK 5"].map(l=>({l,p:hsk.filter(h=>h.level===l&&h.passed==="yes").length,f:hsk.filter(h=>h.level===l&&h.passed==="no").length}))}><XAxis dataKey="l" fontSize={10} stroke="rgba(255,255,255,.12)" tickLine={false} axisLine={false}/><YAxis fontSize={10} stroke="rgba(255,255,255,.12)" tickLine={false} axisLine={false}/><Tooltip content={<CTip/>}/><Bar dataKey="p" name="\u0110\u1ea1t" fill={ACC} stackId="a" radius={[4,4,0,0]}/><Bar dataKey="f" name="Tr\u01b0\u1ee3t" fill="#EF4444" stackId="a" radius={[4,4,0,0]}/></BarChart></CC>
          <div className="card" style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}><div style={{fontSize:11,fontWeight:600,color:"rgba(255,255,255,.25)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:16}}>T\u1ef7 l\u1ec7 \u0111\u1ed7</div><div style={{fontSize:56,fontWeight:900,color:hskRate>=70?ACC:"#F59E0B",lineHeight:1,letterSpacing:"-.05em"}}>{hskRate}%</div><div style={{fontSize:13,color:"rgba(255,255,255,.25)",marginTop:8}}>{hskP}/{hskTt} \u0111\u1ea1t</div><div className="pb" style={{marginTop:12,width:"50%"}}><div className="pf" style={{width:hskRate+"%",background:ACC}}/></div></div>
        </div>
        <div style={{overflow:"auto",borderRadius:14}}><div className="card" style={{padding:0}}><table><thead><tr>{["HV","Level","Ng\u00e0y","\u0110i\u1ec3m","KQ",...(isAdmin?[""]:[])] .map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{hsk.map(h=><tr key={h.id}><td style={{fontWeight:600,color:"rgba(255,255,255,.8)"}}>{h.name}</td><td><Badge text={h.level} variant="purple"/></td><td style={{fontSize:13,color:"rgba(255,255,255,.35)"}}>{h.examDate}</td><td style={{fontWeight:800,fontSize:18,fontVariantNumeric:"tabular-nums"}}>{h.score||<span style={{color:"rgba(255,255,255,.1)"}}>&#8212;</span>}</td><td>{h.passed==="yes"?<Badge text="\u0110\u1ea0T" variant="ok"/>:h.passed==="no"?<Badge text="Tr\u01b0\u1ee3t" variant="err"/>:<Badge text="Ch\u01b0a" variant="info"/>}</td>{isAdmin&&<td><button className="act-btn" onClick={()=>om("hk",{...h},0)}><Pencil size={13}/></button></td>}</tr>)}</tbody></table></div></div>
      </div>}
 
      {/* ════════ REPORTS ════════ */}
      {pg==="rpt"&&<div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}><div style={{fontSize:22,fontWeight:800,letterSpacing:"-.03em"}}>B\u00e1o c\u00e1o</div><button className="btn-accent" onClick={()=>om("r",{id:"RP"+Date.now(),date:today,teacher:isAdmin?(teachers[0]||""):user.name,cls:cls2[0]?.id||"",present:0,absent:0,absentNames:"",lesson:"",homework:"",flags:"",highlights:""},1)}><Plus size={14}/>T\u1ea1o</button></div>
        {rpt.filter(r=>isAdmin||r.teacher===user.name).map(r=><div key={r.id} className="card" style={{marginBottom:10}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <div><span style={{fontWeight:600,color:"rgba(255,255,255,.7)",fontSize:13}}>{r.teacher}</span> <span style={{color:"rgba(255,255,255,.15)",fontSize:12}}>&#183; {r.cls} &#183; {r.date}</span></div>
            <div style={{display:"flex",gap:6,alignItems:"center"}}><Badge text={r.present+"/"+(r.present+r.absent)} variant={r.absent===0?"ok":"warn"}/><button className="act-btn" onClick={()=>om("r",{...r},0)}><Pencil size={13}/></button></div>
          </div>
          <div style={{fontSize:13,color:"rgba(255,255,255,.4)",lineHeight:1.6}}>{r.lesson}</div>
          {r.flags&&<div style={{background:"rgba(239,68,68,.04)",borderRadius:8,padding:"8px 12px",marginTop:8,fontSize:12,color:"#EF4444",display:"flex",alignItems:"start",gap:6}}><AlertTriangle size={12} style={{marginTop:1,flexShrink:0}}/>{r.flags}</div>}
          {r.highlights&&<div style={{background:"rgba(16,185,129,.04)",borderRadius:8,padding:"8px 12px",marginTop:8,fontSize:12,color:ACC,display:"flex",alignItems:"start",gap:6}}><Star size={12} style={{marginTop:1,flexShrink:0}}/>{r.highlights}</div>}
        </div>)}
      </div>}
 
      {/* ════════ LOG ════════ */}
      {pg==="log"&&isAdmin&&<div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}><div style={{fontSize:22,fontWeight:800,letterSpacing:"-.03em"}}>L\u1ecbch s\u1eed</div><button className="btn-accent" onClick={()=>om("i",{id:"IT"+Date.now(),ref:"",refName:"",date:today,type:"call",content:"",by:"Admin"},1)}><Plus size={14}/>Th\u00eam</button></div>
        {inter.map(it=><div key={it.id} style={{display:"flex",gap:12,padding:"14px 0",borderBottom:"1px solid rgba(255,255,255,.03)"}}>
          <div style={{width:30,height:30,borderRadius:8,background:"rgba(255,255,255,.03)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,color:"rgba(255,255,255,.3)"}}>{it.type==="call"?<Phone size={14}/>:it.type==="meeting"?<Handshake size={14}/>:<MessageCircle size={14}/>}</div>
          <div style={{flex:1}}><div><span style={{fontWeight:600,color:"rgba(255,255,255,.7)",fontSize:13}}>{it.refName}</span> <span style={{color:"rgba(255,255,255,.15)",fontSize:11}}>{it.date}</span> <Badge text={it.type==="call"?"G\u1ecdi":it.type==="meeting"?"G\u1eb7p":"Nh\u1eafn"} variant={it.type==="call"?"ok":"info"}/></div><div style={{color:"rgba(255,255,255,.3)",marginTop:4,fontSize:13,lineHeight:1.5}}>{it.content}</div></div>
        </div>)}
      </div>}
 
      {/* ════════ FINANCE ════════ */}
      {pg==="fin"&&isAdmin&&<div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}><div style={{fontSize:22,fontWeight:800,letterSpacing:"-.03em"}}>T\u00e0i ch\u00ednh</div><button className="btn-accent" onClick={()=>om("f",{id:"HP"+Date.now(),name:"",cls:cls2[0]?.id||"",total:0,d1:0,d2:0,d2d:"",st:"pending"},1)}><Plus size={14}/>Th\u00eam</button></div>
        <div style={{overflow:"auto",borderRadius:14}}><div className="card" style={{padding:0}}><table><thead><tr>{["HV","L\u1edbp","T\u1ed5ng","\u01101","\u01102","H\u1ea1n","TT",""].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{fin.map(f=><tr key={f.id}><td style={{fontWeight:600,color:"rgba(255,255,255,.8)"}}>{f.name}</td><td><Badge text={f.cls} variant="info"/></td><td style={{fontWeight:700,color:ACC}}>{vnd(f.total)}</td><td style={{fontSize:13,color:"rgba(255,255,255,.35)"}}>{vnd(f.d1)}</td><td style={{fontSize:13,color:"rgba(255,255,255,.35)"}}>{vnd(f.d2)}</td><td style={{color:f.st==="overdue"?"#EF4444":"rgba(255,255,255,.2)",fontSize:13}}>{f.d2d}</td><td>{f.st==="paid"?<Badge text="OK" variant="ok"/>:f.st==="pending"?<Badge text="Ch\u1edd" variant="warn"/>:<Badge text="N\u1ee3" variant="err"/>}</td>
          <td><div style={{display:"flex",gap:3}}>{f.st!=="paid"&&<button className="btn-accent btn-sm" onClick={()=>{setFin(fin.map(x=>x.id===f.id?{...x,st:"paid"}:x));updateRow("finance",{...f,st:"paid"})}}><Check size={12}/></button>}<button className="act-btn" onClick={()=>om("f",{...f},0)}><Pencil size={13}/></button></div></td></tr>)}</tbody></table></div></div>
      </div>}
 
      {/* ════════ CHARTS ════════ */}
      {pg==="charts"&&isAdmin&&<div>
        <div style={{fontSize:22,fontWeight:800,letterSpacing:"-.03em",marginBottom:16}}>Bi\u1ec3u \u0111\u1ed3</div>
        <div style={{display:"grid",gridTemplateColumns:g(2),gap:12}}>
          <CC title="Doanh thu"><BarChart data={monthTrend}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.03)"/><XAxis dataKey="m" fontSize={10} stroke="rgba(255,255,255,.12)" tickLine={false} axisLine={false}/><YAxis fontSize={10} stroke="rgba(255,255,255,.12)" tickLine={false} axisLine={false}/><Tooltip content={<CTip/>}/><Bar dataKey="rev" fill={ACC} radius={[4,4,0,0]}/></BarChart></CC>
          <CC title="Chuy\u00ean c\u1ea7n"><LineChart data={attendTrend}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.03)"/><XAxis dataKey="w" fontSize={10} stroke="rgba(255,255,255,.12)" tickLine={false} axisLine={false}/><YAxis domain={[80,100]} fontSize={10} stroke="rgba(255,255,255,.12)" tickLine={false} axisLine={false}/><Tooltip content={<CTip/>}/><Line type="monotone" dataKey="v" stroke="#3B82F6" strokeWidth={2} dot={{fill:"#3B82F6",r:3,strokeWidth:0}}/></LineChart></CC>
          <CC title="Thanh to\u00e1n"><PieChart><Pie data={payPie} cx="50%" cy="50%" innerRadius={35} outerRadius={65} dataKey="v" label={({n,v})=>n+":"+v} fontSize={10} stroke="none">{payPie.map((e,i)=><Cell key={i} fill={[CHART_C[0],CHART_C[3],CHART_C[4]][i]}/>)}</Pie><Tooltip content={<CTip/>}/></PieChart></CC>
          <CC title="Ph\u00e2n b\u1ed1 \u0111i\u1ec3m"><BarChart data={scoreDist}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.03)"/><XAxis dataKey="r" fontSize={10} stroke="rgba(255,255,255,.12)" tickLine={false} axisLine={false}/><YAxis fontSize={10} stroke="rgba(255,255,255,.12)" tickLine={false} axisLine={false}/><Tooltip content={<CTip/>}/><Bar dataKey="n" fill="#8B5CF6" radius={[4,4,0,0]}/></BarChart></CC>
        </div>
      </div>}
    </div>
  </div>
 
  {/* ═══ MOBILE NAV ═══ */}
  {mob&&<div className="bot-nav">
    {mobNav.map(m=>{const Icon=m.ic;return<div key={m.id} className={"bot-item"+(pg===m.id||(m.id==="more"&&showMenu)?" active":"")} onClick={()=>{if(m.id==="more")setShowMenu(!showMenu);else{setPg(m.id);setShowMenu(false)}}}><Icon size={18} strokeWidth={pg===m.id?2.2:1.5}/><span style={{fontSize:10}}>{m.l}</span></div>})}
    {showMenu&&<div className="more-popup">{moreMenu.map(m=>{const Icon=m.ic;return<div key={m.id} className="nav-item" onClick={()=>{setPg(m.id);setShowMenu(false)}}><Icon size={15}/>{m.l}</div>})}<div className="nav-item" onClick={logout} style={{color:"#EF4444"}}><LogOut size={15}/>Tho\u00e1t</div></div>}
  </div>}
 
  {modal&&<ModalForm type={modal.t} initial={modal.d} isNew={modal.n} cls2={cls2} teachers={teachers} isAdmin={isAdmin} userName={user.name} mob={mob}
    onSave={async d=>{await doSave(modal.t,d,modal.n);setModal(null)}} onClose={()=>setModal(null)}/>}
</div>
);
}
