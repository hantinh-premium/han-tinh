import { useState, useEffect, useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from "recharts";
import { supabase } from "./supabase";
 
// ── DB (unchanged) ──
const FM={leads:{lastContact:"last_contact"},reports:{absentNames:"absent_names"},interactions:{refName:"ref_name",by:"by_user"},trials:{date:"trial_date",time:"trial_time",followUp:"follow_up"},contracts:{start:"start_date",end:"end_date"},hsk_exams:{examDate:"exam_date"}};
function toDb(t,o){const m=FM[t];if(!m)return{...o};const r={};for(const[k,v]of Object.entries(o))r[m[k]||k]=v;return r}
function toApp(t,o){const m=FM[t];if(!m)return{...o};const rm={};for(const[k,v]of Object.entries(m))rm[v]=k;const r={};for(const[k,v]of Object.entries(o))r[rm[k]||k]=v;return r}
async function loadT(t){try{const{data}=await supabase.from(t).select("*");return(data||[]).map(r=>toApp(t,r))}catch{return[]}}
async function addRow(t,row){const d=toDb(t,row);delete d.created_at;await supabase.from(t).insert([d])}
async function updateRow(t,row){const d=toDb(t,row);delete d.created_at;await supabase.from(t).update(d).eq("id",row.id)}
async function deleteRow(t,id){await supabase.from(t).delete().eq("id",id)}
 
const vnd=n=>new Intl.NumberFormat("vi-VN").format(n)+"\u0111";
const today=new Date().toISOString().slice(0,10);
const CL=["#00F0B5","#00B4D8","#7C3AED","#FBBF24","#EF4444","#38BDF8","#F97316"];
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
 
/* Sparkline */
function Spark({data,color="#00F0B5",w=72,h=28}){
  if(!data||data.length<2)return null;
  const mn=Math.min(...data),mx=Math.max(...data),rng=mx-mn||1;
  const pts=data.map((v,i)=>(i/(data.length-1))*w+","+(h-2-((v-mn)/rng)*(h-4))).join(" ");
  return <svg width={w} height={h} style={{display:"block",opacity:.8}}><polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
 
/* Custom Tooltip */
function TT({active,payload,label}){
  if(!active||!payload?.length)return null;
  return <div style={{background:"rgba(0,0,0,.85)",backdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,.08)",borderRadius:14,padding:"12px 16px",boxShadow:"0 12px 40px rgba(0,0,0,.5)",fontFamily:"Inter,system-ui,sans-serif"}}>
    <div style={{fontSize:11,color:"rgba(255,255,255,.4)",marginBottom:6,fontWeight:600,textTransform:"uppercase",letterSpacing:".08em"}}>{label}</div>
    {payload.map((p,i)=><div key={i} style={{fontSize:15,fontWeight:700,color:p.color||"#fff"}}>{p.name}: {p.value}</div>)}
  </div>;
}
 
// ── MODAL ──
function ModalForm({type,initial,isNew,onSave,onClose,cls2,teachers,isAdmin,userName,mob}){
const d=useRef({...initial});
const IS={padding:"13px 16px",border:"1px solid rgba(255,255,255,.06)",borderRadius:12,fontSize:15,outline:"none",width:"100%",fontFamily:"Inter,system-ui,sans-serif",background:"rgba(255,255,255,.03)",color:"#fff",transition:"border-color .25s,box-shadow .25s"};
const fo=e=>{e.target.style.borderColor="rgba(0,240,181,.3)";e.target.style.boxShadow="0 0 0 4px rgba(0,240,181,.06),0 0 20px rgba(0,240,181,.05)"};
const bl=e=>{e.target.style.borderColor="rgba(255,255,255,.06)";e.target.style.boxShadow="none"};
const F=({label,k,type:t})=><div style={{flex:1,marginBottom:16}}>
<label style={{display:"block",fontSize:12,color:"rgba(255,255,255,.35)",fontWeight:600,marginBottom:8,textTransform:"uppercase",letterSpacing:".06em"}}>{label}</label>
{t==="textarea"?<textarea style={{...IS,minHeight:64,resize:"vertical"}} defaultValue={d.current[k]||""} onFocus={fo} onBlur={bl} onChange={e=>{d.current[k]=e.target.value}}/>
:t==="date"?<input style={IS} type="date" defaultValue={d.current[k]||""} onFocus={fo} onBlur={bl} onChange={e=>{d.current[k]=e.target.value}}/>
:t==="number"?<input style={IS} type="number" defaultValue={d.current[k]||0} onFocus={fo} onBlur={bl} onChange={e=>{d.current[k]=parseFloat(e.target.value)||0}}/>
:<input style={IS} defaultValue={d.current[k]||""} onFocus={fo} onBlur={bl} onChange={e=>{d.current[k]=e.target.value}}/>}
  </div>;
  const S=({label,k,opts})=><div style={{flex:1,marginBottom:16}}>
    <label style={{display:"block",fontSize:12,color:"rgba(255,255,255,.35)",fontWeight:600,marginBottom:8,textTransform:"uppercase",letterSpacing:".06em"}}>{label}</label>
    <select style={{...IS,appearance:"auto"}} defaultValue={d.current[k]||""} onChange={e=>{d.current[k]=e.target.value}}>
      {opts.map(o=>Array.isArray(o)?<option key={o[0]} value={o[0]}>{o[1]}</option>:<option key={o}>{o}</option>)}
    </select>
  </div>;
  const Fl=({children})=><div style={{display:"flex",gap:12}}>{children}</div>;
  const sources=["Facebook","TikTok","Gi\u1edbi thi\u1ec7u","Walk-in","Website"];
  const levels=["HSK 1","HSK 2","HSK 3","HSK 4","HSK 5","HSK 6"];
  return(
    <div className="mo" onClick={onClose}>
      <div className={"mb"+(mob?" mm":"")} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
          <h3 style={{fontSize:20,fontWeight:800,color:"#fff",letterSpacing:"-.02em"}}>{isNew?"Th\u00eam m\u1edbi":"Ch\u1ec9nh s\u1eeda"}</h3>
          <button className="xb" onClick={onClose}>\u2715</button>
        </div>
        {type==="l"&&<><Fl><F label="H\u1ecd t\u00ean" k="name"/><F label="S\u0110T" k="phone"/></Fl><Fl><S label="Ngu\u1ed3n" k="source" opts={sources}/><S label="Quan t\u00e2m" k="interest" opts={levels.slice(0,5)}/></Fl><S label="Giai \u0111o\u1ea1n" k="stage" opts={[["inquiry","H\u1ecfi th\u0103m"],["trial","H\u1ecdc th\u1eed"],["registered","\u0110\u00e3 \u0110K"],["lost","M\u1ea5t"]]}/><F label="Ghi ch\u00fa" k="note" type="textarea"/></>}
        {type==="s"&&<><Fl><F label="H\u1ecd t\u00ean" k="name"/><F label="S\u0110T" k="phone"/></Fl><Fl><S label="L\u1edbp" k="cls" opts={cls2.map(c=>c.id)}/><S label="Tr\u00ecnh \u0111\u1ed9" k="level" opts={levels}/></Fl><Fl><F label="\u0110i\u1ec3m" k="score" type="number"/><F label="CC %" k="attend" type="number"/></Fl><Fl><S label="Ngu\u1ed3n" k="source" opts={sources}/><S label="Tr\u1ea1ng th\u00e1i" k="status" opts={["\u0110ang h\u1ecdc","T\u1ea1m ngh\u1ec9","Ngh\u1ec9 h\u1ecdc"]}/></Fl></>}
        {type==="tr"&&<><Fl><F label="H\u1ecd t\u00ean" k="name"/><F label="S\u0110T" k="phone"/></Fl><Fl><F label="Ng\u00e0y" k="date" type="date"/><F label="Gi\u1edd" k="time"/></Fl><Fl><S label="L\u1edbp" k="cls" opts={cls2.map(c=>c.id)}/><S label="GV" k="teacher" opts={teachers}/></Fl><Fl><S label="TT" k="status" opts={[["scheduled","\u0110\u00e3 x\u1ebfp"],["completed","\u0110\u00e3 h\u1ecdc"],["no-show","Kh\u00f4ng \u0111\u1ebfn"]]}/><S label="KQ" k="result" opts={[["","\u2014"],["enrolled","\u0110\u00e3 \u0110K"],["thinking","Suy ngh\u0129"],["not-interested","Kh\u00f4ng QT"]]}/></Fl><F label="Nh\u1eafc l\u1ea1i" k="followUp" type="date"/></>}
        {type==="ct"&&<><F label="H\u1ecdc vi\u00ean" k="name"/><Fl><S label="L\u1edbp" k="cls" opts={cls2.map(c=>c.id)}/><S label="Th\u1eddi h\u1ea1n" k="duration" opts={["3 th\u00e1ng","6 th\u00e1ng","12 th\u00e1ng","18 th\u00e1ng"]}/></Fl><Fl><F label="B\u1eaft \u0111\u1ea7u" k="start" type="date"/><F label="K\u1ebft th\u00fac" k="end" type="date"/></Fl><F label="H\u1ecdc ph\u00ed" k="fee" type="number"/></>}
        {type==="hk"&&<><F label="H\u1ecdc vi\u00ean" k="name"/><Fl><S label="Level" k="level" opts={levels}/><F label="Ng\u00e0y thi" k="examDate" type="date"/></Fl><Fl><F label="\u0110i\u1ec3m" k="score" type="number"/><S label="KQ" k="passed" opts={[["","Ch\u01b0a thi"],["yes","\u0110\u1ea0T"],["no","Ch\u01b0a \u0111\u1ea1t"]]}/></Fl></>}
        {type==="r"&&<><Fl><F label="Ng\u00e0y" k="date" type="date"/>{isAdmin?<S label="GV" k="teacher" opts={teachers}/>:<div style={{flex:1}}><label style={{display:"block",fontSize:12,color:"rgba(255,255,255,.35)",fontWeight:600,marginBottom:8,textTransform:"uppercase",letterSpacing:".06em"}}>GV</label><input style={{...IS,opacity:.5}} value={userName} disabled/></div>}<S label="L\u1edbp" k="cls" opts={cls2.map(c=>c.id)}/></Fl><Fl><F label="C\u00f3 m\u1eb7t" k="present" type="number"/><F label="V\u1eafng" k="absent" type="number"/></Fl><F label="HV v\u1eafng" k="absentNames"/><F label="B\u00e0i h\u1ecdc" k="lesson" type="textarea"/><F label="BTVN" k="homework" type="textarea"/><F label="Ch\u00fa \u00fd" k="flags" type="textarea"/><F label="N\u1ed5i b\u1eadt" k="highlights" type="textarea"/></>}
        {type==="i"&&<><Fl><F label="Ng\u01b0\u1eddi" k="refName"/><F label="Ng\u00e0y" k="date" type="date"/></Fl><Fl><S label="Lo\u1ea1i" k="type" opts={[["call","G\u1ecdi \u0111i\u1ec7n"],["message","Nh\u1eafn tin"],["meeting","G\u1eb7p m\u1eb7t"]]}/><F label="B\u1edfi" k="by"/></Fl><F label="N\u1ed9i dung" k="content" type="textarea"/></>}
        {type==="f"&&<><F label="H\u1ecd t\u00ean" k="name"/><Fl><S label="L\u1edbp" k="cls" opts={cls2.map(c=>c.id)}/><F label="T\u1ed5ng ph\u00ed" k="total" type="number"/></Fl><Fl><F label="H\u1ea1n \u0111\u1ee3t 2" k="d2d"/><S label="TT" k="st" opts={[["paid","\u0110\u00e3 \u0111\u00f3ng"],["pending","Ch\u1edd"],["overdue","Qu\u00e1 h\u1ea1n"]]}/></Fl></>}
        <div style={{display:"flex",gap:12,marginTop:24}}>
          <button className="btn-glow" style={{flex:1}} onClick={()=>{
            const data={...d.current};
            if(type==="f"&&data.total){data.d1=Math.round(data.total/2);data.d2=Math.round(data.total/2)}
            if(type==="hk"){data.status=data.passed==="yes"?"passed":data.passed==="no"?"failed":"registered"}
            onSave(data);
          }}>L\u01b0u</button>
          <button className="btn-ghost" onClick={onClose}>Hu\u1ef7</button>
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
 
/* Load Inter font */
useEffect(()=>{
  const link=document.createElement("link");
  link.href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap";
  link.rel="stylesheet";
  document.head.appendChild(link);
},[]);
 
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
 
// ── LOADING ──
if(!ok)return<div style={{display:"flex",height:"100vh",alignItems:"center",justifyContent:"center",fontFamily:"Inter,system-ui,sans-serif",fontSize:15,background:"#000",color:"rgba(255,255,255,.4)",gap:12}}>
  <div style={{width:18,height:18,border:"2px solid rgba(0,240,181,.15)",borderTop:"2px solid #00F0B5",borderRadius:"50%",animation:"spin .5s linear infinite"}}/>
  <span>Loading...</span>
</div>;
 
// ── LOGIN ──
if(!user)return(
<div style={{fontFamily:"Inter,system-ui,sans-serif",minHeight:"100vh",background:"#000",display:"flex",alignItems:"center",justifyContent:"center",padding:16,position:"relative",overflow:"hidden"}}>
<div style={{position:"absolute",width:600,height:600,borderRadius:"50%",background:"radial-gradient(circle,rgba(0,240,181,.07) 0%,transparent 60%)",top:"-20%",right:"-10%",filter:"blur(40px)"}}/>
<div style={{position:"absolute",width:500,height:500,borderRadius:"50%",background:"radial-gradient(circle,rgba(124,58,237,.06) 0%,transparent 60%)",bottom:"-15%",left:"-10%",filter:"blur(40px)"}}/>
<div style={{width:mob?"100%":400,background:"rgba(255,255,255,.02)",border:"1px solid rgba(255,255,255,.06)",borderRadius:28,padding:mob?28:48,backdropFilter:"blur(40px)",position:"relative",boxShadow:"0 0 80px rgba(0,0,0,.3),inset 0 1px 0 rgba(255,255,255,.04)"}}>
<div style={{width:52,height:52,borderRadius:16,background:"linear-gradient(135deg,#00F0B5,#7C3AED)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:24,fontWeight:900,margin:"0 auto 24px",boxShadow:"0 8px 40px rgba(0,240,181,.2)"}}><span style={{fontFamily:"serif"}}>&#28450;</span></div>
<h2 style={{fontSize:28,fontWeight:900,color:"#fff",textAlign:"center",marginBottom:4,letterSpacing:"-.03em"}}>H&#225;n Tinh</h2>
<p style={{color:"rgba(255,255,255,.3)",fontSize:14,textAlign:"center",marginBottom:36,fontWeight:500}}>Premium Management System</p>
<input className="lg-in" placeholder="T&#224;i kho&#7843;n" value={lu} onChange={e=>setLu(e.target.value)} onKeyDown={e=>e.key==="Enter"&&login()}/>
<input className="lg-in" placeholder="M&#7853;t kh&#7849;u" type="password" value={lp} onChange={e=>setLp(e.target.value)} onKeyDown={e=>e.key==="Enter"&&login()}/>
{le&&<div style={{color:"#EF4444",fontSize:13,marginBottom:12,textAlign:"center",fontWeight:500}}>{le}</div>}
<button className="btn-glow" style={{width:"100%"}} onClick={login}>&#272;&#259;ng nh&#7853;p</button>
</div>
</div>
);
 
// ── DATA ──
const query=q.trim().toLowerCase();
const act=stu.filter(s=>s.status==="\u0110ang h\u1ecdc"),ov=fin.filter(f=>f.st==="overdue"),pend=fin.filter(f=>f.st==="pending");
const ranked=[...act].sort((a,b)=>(b.score||0)-(a.score||0));
const teachers=[...new Set(cls2.map(c=>c.teacher).filter(Boolean))];
const expiring=contracts.filter(c=>{const dl=daysLeft(c.end);return dl>0&&dl<=30});
const expired=contracts.filter(c=>daysLeft(c.end)<=0&&c.status!=="renewed");
const upTrials=trials.filter(t=>t.status==="scheduled"),needFU=trials.filter(t=>t.result==="thinking");
const hskP=hsk.filter(h=>h.passed==="yes").length,hskTt=hsk.filter(h=>h.status!=="registered").length,hskRate=hskTt>0?Math.round(hskP/hskTt*100):0;
const collected=fin.reduce((a,f)=>a+(f.d1||0)+(f.st==="paid"?(f.d2||0):0),0);
const srcData=["Facebook","TikTok","Gi\u1edbi thi\u1ec7u","Walk-in","Website"].map(s=>({name:s,v:[...stu,...leads].filter(x=>x.source===s).length})).filter(d=>d.v>0);
const funnelData=[{s:"H\u1ecfi th\u0103m",v:leads.filter(l=>l.stage!=="lost").length},{s:"H\u1ecdc th\u1eed",v:leads.filter(l=>l.stage==="trial"||l.stage==="registered").length},{s:"\u0110\u0103ng k\u00fd",v:leads.filter(l=>l.stage==="registered").length},{s:"\u0110ang h\u1ecdc",v:act.length}];
const payPie=[{n:"\u0110\u1ee7",v:fin.filter(f=>f.st==="paid").length},{n:"Ch\u1edd",v:pend.length},{n:"N\u1ee3",v:ov.length}];
const scoreDist=[{r:"<5",n:stu.filter(s=>(s.score||0)<5).length},{r:"5-6.5",n:stu.filter(s=>(s.score||0)>=5&&s.score<6.5).length},{r:"6.5-8",n:stu.filter(s=>(s.score||0)>=6.5&&s.score<8).length},{r:"8-9",n:stu.filter(s=>(s.score||0)>=8&&s.score<9).length},{r:"9+",n:stu.filter(s=>(s.score||0)>=9).length}];
 
// ── HELPERS ──
const B=(t,c)=>{const m={g:["rgba(0,240,181,.1)","#00F0B5"],r:["rgba(239,68,68,.08)","#EF4444"],y:["rgba(251,191,36,.08)","#FBBF24"],b:["rgba(0,180,216,.08)","#00B4D8"],gr:["rgba(255,255,255,.04)","rgba(255,255,255,.35)"],p:["rgba(124,58,237,.08)","#7C3AED"],o:["rgba(249,115,22,.08)","#F97316"]};const[bg,fg]=m[c]||m.gr;return<span style={{display:"inline-block",padding:"4px 14px",borderRadius:99,fontSize:11,fontWeight:700,background:bg,color:fg,letterSpacing:".02em",border:"1px solid "+fg.replace(")",",0.1)").replace("rgb","rgba")}}>{t}</span>};
const CC=({title,children,h=190})=><div className="gc"><div style={{fontWeight:700,fontSize:14,marginBottom:14,color:"rgba(255,255,255,.6)",letterSpacing:"-.01em"}}>{title}</div><ResponsiveContainer width="100%" height={h}>{children}</ResponsiveContainer></div>;
const om=(t,d,n)=>setModal({t,d,n});
const grd=c=>mob?"1fr":`repeat(${c},1fr)`;
 
const adminMenu=[{id:"home",l:"T\u1ed5ng quan",e:"\u25a0"},{id:"leads",l:"Kh\u00e1ch m\u1edbi",e:"\u25ce"},{id:"trials",l:"H\u1ecdc th\u1eed",e:"\u25b7"},{id:"stu",l:"H\u1ecdc vi\u00ean",e:"\u25cb"},{id:"contracts",l:"H\u1ee3p \u0111\u1ed3ng",e:"\u25a1"},{id:"hsk",l:"HSK",e:"\u2605"},{id:"rpt",l:"B\u00e1o c\u00e1o",e:"\u2261"},{id:"log",l:"L\u1ecbch s\u1eed",e:"\u25e6"},{id:"fin",l:"T\u00e0i ch\u00ednh",e:"\u25c8"},{id:"charts",l:"Bi\u1ec3u \u0111\u1ed3",e:"\u25e2"}];
const teacherMenu=[{id:"home",l:"T\u1ed5ng quan",e:"\u25a0"},{id:"stu",l:"H\u1ecdc vi\u00ean",e:"\u25cb"},{id:"rpt",l:"B\u00e1o c\u00e1o",e:"\u2261"},{id:"hsk",l:"HSK",e:"\u2605"}];
const menu=isAdmin?adminMenu:teacherMenu;
const mobNav=isAdmin?[{id:"home",l:"T\u1ed5ng quan"},{id:"leads",l:"Kh\u00e1ch"},{id:"stu",l:"HV"},{id:"rpt",l:"B\u00e1o c\u00e1o"},{id:"more",l:"Th\u00eam"}]:[{id:"home",l:"T\u1ed5ng quan"},{id:"stu",l:"HV"},{id:"rpt",l:"B\u00e1o c\u00e1o"},{id:"hsk",l:"HSK"}];
const moreMenu=adminMenu.filter(m=>!["home","leads","stu","rpt"].includes(m.id));
 
/* KPI */
const KPI=({label,value,color,sparkData,trend})=><div className="gc kpi" style={{position:"relative",overflow:"hidden"}}>
  <div style={{position:"absolute",top:0,left:"50%",transform:"translateX(-50%)",width:"70%",height:1,background:`linear-gradient(90deg,transparent,${color},transparent)`,opacity:.6}}/>
  <div style={{position:"absolute",top:0,right:0,width:80,height:80,background:`radial-gradient(circle,${color}08,transparent)`,borderRadius:"50%"}}/>
  <div style={{fontSize:13,color:"rgba(255,255,255,.35)",fontWeight:600,marginBottom:8,letterSpacing:".02em"}}>{label}</div>
  <div style={{fontSize:mob?28:34,fontWeight:900,color:"#fff",letterSpacing:"-.03em",lineHeight:1}}>{value}</div>
  <div style={{display:"flex",alignItems:"center",gap:8,marginTop:8}}>
    {sparkData&&<Spark data={sparkData} color={color}/>}
    {trend!==undefined&&trend!==0&&<span style={{fontSize:12,fontWeight:700,color:trend>0?"#00F0B5":"#EF4444",display:"flex",alignItems:"center",gap:2}}>
      {trend>0?"\u2197":"\u2198"} {Math.abs(trend)}%
    </span>}
  </div>
</div>;
 
return(
<div style={{fontFamily:"Inter,system-ui,sans-serif",display:"flex",flexDirection:mob?"column":"row",height:"100vh",background:"#000",color:"#fff",overflow:"hidden",position:"relative"}}>
 
{/* ── GLOBAL CSS ── */}
<style>{`
*{box-sizing:border-box;margin:0;padding:0}
::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:rgba(255,255,255,.08);border-radius:99px}::-webkit-scrollbar-thumb:hover{background:rgba(255,255,255,.15)}
input[type="date"]::-webkit-calendar-picker-indicator{filter:invert(.7)}
select{color-scheme:dark}
::selection{background:rgba(0,240,181,.2)}
 
/* Glass Card */
.gc{background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.05);border-radius:20px;padding:22px;position:relative;transition:border-color .3s,box-shadow .3s,transform .3s}
.gc:hover{border-color:rgba(255,255,255,.1);box-shadow:0 8px 40px rgba(0,0,0,.2);transform:translateY(-1px)}
.kpi{padding:24px}
 
/* Sidebar nav */
.sn{display:flex;align-items:center;gap:12px;padding:11px 16px;border-radius:14px;cursor:pointer;font-size:14px;font-weight:500;color:rgba(255,255,255,.35);transition:all .25s;border:none;background:transparent;width:100%;text-align:left;position:relative}
.sn:hover{color:rgba(255,255,255,.7);background:rgba(255,255,255,.03)}
.sn.ac{color:#00F0B5;font-weight:700;background:rgba(0,240,181,.04);border:1px solid rgba(0,240,181,.08)}
.sn .dot{width:6px;height:6px;border-radius:50%;background:currentColor;opacity:.6;flex-shrink:0}
 
/* Buttons */
.btn-glow{padding:14px 28px;background:linear-gradient(135deg,#00F0B5,#00B4D8);color:#000;border:none;border-radius:14px;font-size:15px;font-weight:800;cursor:pointer;font-family:Inter,system-ui,sans-serif;transition:all .3s;box-shadow:0 4px 20px rgba(0,240,181,.15);letter-spacing:-.01em}
.btn-glow:hover{box-shadow:0 8px 40px rgba(0,240,181,.3),0 0 60px rgba(0,240,181,.1);transform:translateY(-2px)}
.btn-ghost{padding:14px 28px;background:transparent;border:1px solid rgba(255,255,255,.08);border-radius:14px;font-size:15px;color:rgba(255,255,255,.5);cursor:pointer;font-family:Inter,system-ui,sans-serif;font-weight:600;transition:all .25s}
.btn-ghost:hover{border-color:rgba(255,255,255,.15);color:rgba(255,255,255,.8);background:rgba(255,255,255,.03)}
.btn-s{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:10px;border:none;cursor:pointer;font-size:13px;font-weight:700;font-family:Inter,system-ui,sans-serif;transition:all .25s}
.btn-s.glow{background:linear-gradient(135deg,#00F0B5,#00B4D8);color:#000;box-shadow:0 2px 12px rgba(0,240,181,.12)}
.btn-s.glow:hover{box-shadow:0 4px 24px rgba(0,240,181,.25);transform:translateY(-1px)}
 
/* Table */
.tw{overflow-x:auto;border-radius:20px}
table{width:100%;border-collapse:collapse;min-width:600px}
th{padding:14px 18px;text-align:left;font-size:11px;font-weight:700;color:rgba(255,255,255,.25);text-transform:uppercase;letter-spacing:.08em;border-bottom:1px solid rgba(255,255,255,.04);white-space:nowrap}
td{padding:14px 18px;font-size:15px;border-bottom:1px solid rgba(255,255,255,.03);white-space:nowrap;color:rgba(255,255,255,.5);transition:all .2s}
tr{transition:all .2s}
tr:hover td{background:rgba(0,240,181,.02);color:rgba(255,255,255,.7)}
 
/* Icon buttons */
.ib{cursor:pointer;padding:8px;border-radius:10px;border:none;background:transparent;color:rgba(255,255,255,.2);font-size:14px;transition:all .25s;display:inline-flex;align-items:center;justify-content:center}
.ib:hover{color:#00F0B5;background:rgba(0,240,181,.06)}
.ib.r:hover{color:#EF4444;background:rgba(239,68,68,.06)}
 
/* Progress */
.pb{height:4px;background:rgba(255,255,255,.04);border-radius:99px;overflow:hidden}.pf{height:100%;border-radius:99px;transition:width .5s}
 
/* Tabs */
.tb{padding:9px 20px;border-radius:99px;cursor:pointer;font-size:13px;font-weight:600;color:rgba(255,255,255,.3);border:none;background:transparent;font-family:Inter,system-ui,sans-serif;transition:all .25s}
.tb:hover{color:rgba(255,255,255,.6)}.tb.ac{background:rgba(0,240,181,.08);color:#00F0B5;border:1px solid rgba(0,240,181,.12)}
 
/* Funnel bar */
.fb{height:40px;border-radius:12px;display:flex;align-items:center;padding:0 16px;color:#000;font-weight:800;font-size:13px;margin-bottom:8px;transition:width .5s}
 
/* Bottom nav */
.bn{display:flex;background:rgba(0,0,0,.95);border-top:1px solid rgba(255,255,255,.04);padding:8px 0;backdrop-filter:blur(20px)}
.bi{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;padding:8px 0;cursor:pointer;font-size:10px;color:rgba(255,255,255,.25);font-weight:600;transition:color .2s}
.bi.ac{color:#00F0B5}
 
/* More menu */
.mm-p{position:absolute;bottom:68px;right:8px;background:rgba(10,10,10,.97);border:1px solid rgba(255,255,255,.06);border-radius:18px;box-shadow:0 20px 80px rgba(0,0,0,.6);padding:8px;width:210px;z-index:50;backdrop-filter:blur(24px);animation:fu .2s ease-out}
 
/* Modal */
.mo{position:fixed;inset:0;background:rgba(0,0,0,.7);backdrop-filter:blur(12px);display:flex;align-items:center;justify-content:center;z-index:100;animation:fi .15s}
.mb{background:#0A0A0A;border:1px solid rgba(255,255,255,.06);border-radius:24px;padding:32px;width:560px;max-height:88vh;overflow-y:auto;color:#fff;animation:si .25s ease-out;box-shadow:0 40px 100px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,255,255,.04)}
.mm{width:100%;border-radius:24px 24px 0 0;max-height:92vh;animation:su .3s ease-out;position:fixed;bottom:0;left:0;right:0;padding:28px 24px 32px}
.xb{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.06);width:34px;height:34px;border-radius:10px;cursor:pointer;color:rgba(255,255,255,.4);display:flex;align-items:center;justify-content:center;font-size:14px;transition:all .2s}
.xb:hover{background:rgba(255,255,255,.08);color:#fff}
 
/* Login input */
.lg-in{width:100%;padding:14px 18px;border:1px solid rgba(255,255,255,.05);border-radius:14px;font-size:15px;outline:none;font-family:Inter,system-ui,sans-serif;background:rgba(255,255,255,.02);color:#fff;margin-bottom:14px;transition:border-color .25s,box-shadow .25s}
.lg-in:focus{border-color:rgba(0,240,181,.25);box-shadow:0 0 0 4px rgba(0,240,181,.06),0 0 30px rgba(0,240,181,.04)}
.lg-in::placeholder{color:rgba(255,255,255,.2)}
 
/* Alert cards */
.al-r{background:rgba(239,68,68,.03);border:1px solid rgba(239,68,68,.06);border-radius:12px;padding:10px 14px;margin-top:8px;font-size:13px;color:#EF4444}
.al-g{background:rgba(0,240,181,.03);border:1px solid rgba(0,240,181,.06);border-radius:12px;padding:10px 14px;margin-top:8px;font-size:13px;color:#00F0B5}
 
/* Animations */
@keyframes fi{from{opacity:0}to{opacity:1}}
@keyframes si{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}
@keyframes su{from{transform:translateY(100%)}to{transform:translateY(0)}}
@keyframes fu{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes spin{to{transform:rotate(360deg)}}
 
/* Ambient orbs */
.orb{position:fixed;border-radius:50%;pointer-events:none;filter:blur(80px)}
`}</style>
 
{/* Ambient background orbs */}
<div className="orb" style={{width:500,height:500,background:"radial-gradient(circle,rgba(0,240,181,.04),transparent)",top:"-10%",right:"10%"}}/>
<div className="orb" style={{width:400,height:400,background:"radial-gradient(circle,rgba(124,58,237,.03),transparent)",bottom:"5%",left:"5%"}}/>
 
  {/* ── SIDEBAR ── */}
  {!mob&&<div style={{width:240,background:"rgba(255,255,255,.01)",borderRight:"1px solid rgba(255,255,255,.04)",display:"flex",flexDirection:"column",flexShrink:0,position:"relative",zIndex:2}}>
    <div style={{padding:"22px 20px",display:"flex",alignItems:"center",gap:14}}>
      <div style={{width:38,height:38,borderRadius:12,background:"linear-gradient(135deg,#00F0B5,#7C3AED)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:18,fontWeight:900,boxShadow:"0 4px 24px rgba(0,240,181,.2)"}}><span style={{fontFamily:"serif"}}>&#28450;</span></div>
      <div><div style={{fontWeight:900,fontSize:16,color:"#fff",letterSpacing:"-.02em"}}>H&#225;n Tinh</div><div style={{fontSize:10,color:"rgba(0,240,181,.6)",fontWeight:700,letterSpacing:"2px"}}>PREMIUM</div></div>
    </div>
    <nav style={{flex:1,padding:"8px 10px",overflow:"auto"}}>
      {menu.map(m=><div key={m.id} className={"sn"+(pg===m.id?" ac":"")} onClick={()=>setPg(m.id)}>
        <span className="dot"/>{m.l}
      </div>)}
    </nav>
    <div style={{padding:"18px 16px",borderTop:"1px solid rgba(255,255,255,.04)"}}>
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        <div style={{width:34,height:34,borderRadius:11,background:"linear-gradient(135deg,rgba(0,240,181,.1),rgba(124,58,237,.08))",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:"#00F0B5",border:"1px solid rgba(0,240,181,.1)"}}>{user.name.charAt(0)}</div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:13,fontWeight:700,color:"rgba(255,255,255,.8)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user.name}</div>
          <div style={{fontSize:11,color:"rgba(255,255,255,.2)"}}>{isAdmin?"Qu\u1ea3n tr\u1ecb":"Gi\u00e1o vi\u00ean"}</div>
        </div>
        <button onClick={logout} style={{background:"rgba(239,68,68,.06)",border:"1px solid rgba(239,68,68,.08)",width:30,height:30,borderRadius:9,cursor:"pointer",color:"#EF4444",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,transition:"all .2s"}} title="\u0110\u0103ng xu\u1ea5t">{"\u23FB"}</button>
      </div>
    </div>
  </div>}
 
  {/* ── MAIN ── */}
  <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",position:"relative",zIndex:1}}>
    {/* Header */}
    <div style={{background:"rgba(0,0,0,.6)",padding:"12px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid rgba(255,255,255,.04)",flexShrink:0,backdropFilter:"blur(20px)"}}>
      {mob?<div style={{display:"flex",alignItems:"center",gap:10}}><div style={{width:28,height:28,borderRadius:9,background:"linear-gradient(135deg,#00F0B5,#7C3AED)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:12,fontWeight:900}}><span style={{fontFamily:"serif"}}>&#28450;</span></div><span style={{fontWeight:800,fontSize:15,color:"#fff"}}>H&#225;n Tinh</span></div>
      :<div style={{position:"relative",width:260}}><span style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",color:"rgba(255,255,255,.15)",fontSize:14}}>{"\u2315"}</span><input style={{width:"100%",padding:"10px 16px 10px 36px",border:"1px solid rgba(255,255,255,.05)",borderRadius:12,fontSize:14,outline:"none",fontFamily:"Inter,system-ui,sans-serif",background:"rgba(255,255,255,.02)",color:"#fff",transition:"border-color .25s"}} placeholder="T\u00ecm ki\u1ebfm..." value={q} onChange={e=>setQ(e.target.value)}/></div>}
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        {!mob&&(ov.length>0||needFU.length>0)&&<div style={{padding:"6px 14px",borderRadius:99,background:"rgba(239,68,68,.06)",border:"1px solid rgba(239,68,68,.08)",fontSize:12,fontWeight:700,color:"#EF4444"}}>{ov.length+needFU.length} c\u1ea7n x\u1eed l\u00fd</div>}
        {mob&&<button onClick={logout} style={{fontSize:12,color:"#EF4444",background:"rgba(239,68,68,.05)",border:"1px solid rgba(239,68,68,.08)",borderRadius:9,padding:"6px 14px",cursor:"pointer",fontWeight:700,fontFamily:"Inter,system-ui,sans-serif"}}>Tho\u00e1t</button>}
      </div>
    </div>
 
    {/* Content */}
    <div style={{flex:1,overflow:"auto",padding:mob?16:28}}>
 
      {/* ════ HOME ════ */}
      {pg==="home"&&<div>
        <h2 style={{fontSize:mob?22:28,fontWeight:900,color:"#fff",marginBottom:20,letterSpacing:"-.03em"}}>T\u1ed5ng quan</h2>
        {isAdmin&&<div style={{display:"inline-flex",gap:2,background:"rgba(255,255,255,.02)",borderRadius:99,padding:3,marginBottom:18,border:"1px solid rgba(255,255,255,.04)"}}>
          {[["kpi","Ch\u1ec9 s\u1ed1"],["funnel","Ph\u1ec5u"],["trends","Xu h\u01b0\u1edbng"]].map(([id,l])=><button key={id} className={"tb"+(dtab===id?" ac":"")} onClick={()=>setDtab(id)}>{l}</button>)}
        </div>}
        <div style={{display:"grid",gridTemplateColumns:grd(isAdmin?3:2),gap:12,marginBottom:20}}>
          {(isAdmin?[
            {l:"Kh\u00e1ch m\u1edbi",v:leads.filter(l=>l.stage!=="lost").length,c:"#00B4D8",spark:[8,12,10,15,11,14],trend:12},
            {l:"H\u1ecdc vi\u00ean",v:act.length,c:"#00F0B5",spark:[18,20,22,21,24,26],trend:8},
            {l:"HSK \u0111\u1ed7",v:hskRate+"%",c:"#7C3AED",spark:[60,65,70,68,75,hskRate]},
            {l:"\u0110\u00e3 thu",v:vnd(collected),c:"#00F0B5",spark:[42,48,52,58,65,72],trend:11},
            {l:"N\u1ee3 HP",v:ov.length,c:"#EF4444",trend:ov.length>0?-ov.length*5:0},
            {l:"C\u1ea7n nh\u1eafc",v:needFU.length,c:"#F97316"}
          ]:[
            {l:"HV l\u1edbp t\u00f4i",v:stu.filter(s=>canSee(s.cls)).length,c:"#00F0B5"},
            {l:"B\u00e1o c\u00e1o",v:rpt.filter(r=>r.teacher===user.name).length,c:"#7C3AED"},
            {l:"\u0110i\u1ec3m TB",v:(stu.filter(s=>canSee(s.cls)&&s.status==="\u0110ang h\u1ecdc").reduce((a,s)=>a+s.score,0)/Math.max(stu.filter(s=>canSee(s.cls)&&s.status==="\u0110ang h\u1ecdc").length,1)).toFixed(1),c:"#00B4D8"},
            {l:"Chuy\u00ean c\u1ea7n",v:Math.round(stu.filter(s=>canSee(s.cls)&&s.status==="\u0110ang h\u1ecdc").reduce((a,s)=>a+s.attend,0)/Math.max(stu.filter(s=>canSee(s.cls)&&s.status==="\u0110ang h\u1ecdc").length,1))+"%",c:"#00F0B5"}
          ]).map((s,i)=><KPI key={i} label={s.l} value={s.v} color={s.c} sparkData={s.spark} trend={s.trend}/>)}
        </div>
        {dtab==="kpi"&&isAdmin&&<div style={{display:"grid",gridTemplateColumns:grd(3),gap:14}}>
          <div className="gc"><div style={{fontSize:13,fontWeight:700,color:"#EF4444",marginBottom:14,textTransform:"uppercase",letterSpacing:".06em"}}>C\u1ea7n thu</div>{ov.map(f=><div key={f.id} style={{padding:"12px 0",borderBottom:"1px solid rgba(255,255,255,.03)",display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><div style={{fontWeight:600,color:"rgba(255,255,255,.8)",fontSize:14}}>{f.name}</div><span style={{color:"#EF4444",fontSize:13}}>{vnd(f.d2)}</span></div><button className="btn-s glow" onClick={()=>{setFin(fin.map(x=>x.id===f.id?{...x,st:"paid"}:x));updateRow("finance",{...f,st:"paid"})}}>&#10003;</button></div>)}{ov.length===0&&<div style={{color:"#00F0B5",fontSize:14}}>T\u1ea5t c\u1ea3 OK &#10003;</div>}</div>
          <div className="gc"><div style={{fontSize:13,fontWeight:700,color:"#FBBF24",marginBottom:14,textTransform:"uppercase",letterSpacing:".06em"}}>Top 5</div>{ranked.slice(0,5).map((s,i)=><div key={s.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",fontSize:14}}><span style={{color:"rgba(255,255,255,.6)"}}><span style={{fontWeight:800,color:i<3?"#FBBF24":"rgba(255,255,255,.2)",marginRight:8,fontSize:12}}>{i+1}</span>{s.name}</span><strong style={{color:"#00F0B5",fontSize:16}}>{s.score}</strong></div>)}</div>
          <div className="gc"><div style={{fontSize:13,fontWeight:700,color:"rgba(255,255,255,.4)",marginBottom:14,textTransform:"uppercase",letterSpacing:".06em"}}>B\u00e1o c\u00e1o m\u1edbi</div>{rpt.slice(0,4).map(r=><div key={r.id} style={{padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,.03)",fontSize:13}}><span style={{fontWeight:600,color:"rgba(255,255,255,.7)"}}>{r.teacher}</span> <span style={{color:"rgba(255,255,255,.2)"}}>&#183; {r.cls} &#183; {r.date}</span></div>)}</div>
        </div>}
        {dtab==="funnel"&&isAdmin&&<div style={{display:"grid",gridTemplateColumns:grd(2),gap:14}}>
          <div className="gc"><div style={{fontSize:13,fontWeight:700,color:"rgba(255,255,255,.4)",marginBottom:16,textTransform:"uppercase",letterSpacing:".06em"}}>Ph\u1ec5u chuy\u1ec3n \u0111\u1ed5i</div>{funnelData.map((f,i)=><div key={f.s} className="fb" style={{width:Math.max((f.v/Math.max(funnelData[0].v,1))*100,25)+"%",background:CL[i]}}>{f.s}: {f.v}</div>)}</div>
          <CC title="Ngu\u1ed3n kh\u00e1ch"><PieChart><Pie data={srcData} cx="50%" cy="50%" innerRadius={35} outerRadius={65} dataKey="v" label={({name,v})=>name.slice(0,5)+":"+v} fontSize={11} stroke="none">{srcData.map((e,i)=><Cell key={i} fill={CL[i]}/>)}</Pie><Tooltip content={<TT/>}/></PieChart></CC>
        </div>}
        {dtab==="trends"&&isAdmin&&<div style={{display:"grid",gridTemplateColumns:grd(2),gap:14}}>
          <CC title="Doanh thu theo th\u00e1ng"><BarChart data={monthTrend}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.03)"/><XAxis dataKey="m" fontSize={11} stroke="rgba(255,255,255,.15)" tickLine={false} axisLine={false}/><YAxis fontSize={11} stroke="rgba(255,255,255,.15)" tickLine={false} axisLine={false}/><Tooltip content={<TT/>}/><Bar dataKey="rev" fill="#00F0B5" radius={[8,8,0,0]}/></BarChart></CC>
          <CC title="Chuy\u00ean c\u1ea7n theo tu\u1ea7n"><LineChart data={attendTrend}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.03)"/><XAxis dataKey="w" fontSize={11} stroke="rgba(255,255,255,.15)" tickLine={false} axisLine={false}/><YAxis domain={[80,100]} fontSize={11} stroke="rgba(255,255,255,.15)" tickLine={false} axisLine={false}/><Tooltip content={<TT/>}/><Line type="monotone" dataKey="v" stroke="#00B4D8" strokeWidth={2.5} dot={{fill:"#00B4D8",r:4,strokeWidth:0}}/></LineChart></CC>
        </div>}
      </div>}
 
      {/* ════ LEADS ════ */}
      {pg==="leads"&&isAdmin&&<div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18,flexWrap:"wrap",gap:8}}><h2 style={{fontSize:24,fontWeight:900,color:"#fff",letterSpacing:"-.03em"}}>Kh\u00e1ch ti\u1ec1m n\u0103ng</h2><button className="btn-glow" onClick={()=>om("l",{id:"LD"+Date.now(),name:"",phone:"",source:"Facebook",stage:"inquiry",interest:"HSK 1",note:"",created:today,lastContact:today},1)}>+ Th\u00eam</button></div>
        <div className="tw"><div className="gc" style={{padding:0,overflow:"hidden"}}><table><thead><tr>{["T\u00ean","S\u0110T","Ngu\u1ed3n","QT","G\u0110",""].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{leads.map(l=><tr key={l.id}><td style={{fontWeight:600,color:"rgba(255,255,255,.85)"}}>{l.name}</td><td>{l.phone}</td><td>{B(l.source,{Facebook:"b",TikTok:"p","Gi\u1edbi thi\u1ec7u":"g","Walk-in":"o",Website:"y"}[l.source]||"gr")}</td><td>{B(l.interest,"b")}</td><td>{{inquiry:B("H\u1ecfi","b"),trial:B("Th\u1eed","o"),registered:B("\u0110K","g"),lost:B("M\u1ea5t","gr")}[l.stage]}</td>
          <td><div style={{display:"flex",gap:4,alignItems:"center"}}>{l.stage==="inquiry"&&<button className="btn-s" style={{background:"rgba(249,115,22,.08)",color:"#F97316",border:"1px solid rgba(249,115,22,.12)"}} onClick={()=>{setLeads(leads.map(x=>x.id===l.id?{...x,stage:"trial"}:x));updateRow("leads",{...l,stage:"trial"})}}>&#8594; Th\u1eed</button>}{l.stage==="trial"&&<button className="btn-s glow" onClick={()=>{setLeads(leads.map(x=>x.id===l.id?{...x,stage:"registered"}:x));updateRow("leads",{...l,stage:"registered"})}}>&#8594; \u0110K</button>}<button className="ib" onClick={()=>om("l",{...l},0)}>&#9998;</button><button className="ib r" onClick={()=>{if(confirm("Xo\u00e1?"))doDel("l",l.id)}}>{"\u2717"}</button></div></td></tr>)}</tbody></table></div></div>
      </div>}
 
      {/* ════ STUDENTS ════ */}
      {pg==="stu"&&<div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18,flexWrap:"wrap",gap:8}}><h2 style={{fontSize:24,fontWeight:900,color:"#fff",letterSpacing:"-.03em"}}>H\u1ecdc vi\u00ean</h2>{isAdmin&&<button className="btn-glow" onClick={()=>om("s",{id:"HV"+Date.now(),name:"",phone:"",cls:cls2[0]?.id||"",level:"HSK 1",status:"\u0110ang h\u1ecdc",score:0,attend:90,source:"Facebook"},1)}>+ Th\u00eam</button>}</div>
        <div className="tw"><div className="gc" style={{padding:0,overflow:"hidden"}}><table><thead><tr>{["#","HV","Level","L\u1edbp","\u0110i\u1ec3m","CC","TT",...(isAdmin?[""]:[])] .map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{stu.filter(s=>(!q||s.name.toLowerCase().includes(query))&&canSee(s.cls)).map((s,i)=><tr key={s.id}><td style={{color:"rgba(255,255,255,.15)",fontSize:12}}>{i+1}</td><td><div style={{fontWeight:600,color:"rgba(255,255,255,.85)"}}>{s.name}</div><div style={{color:"rgba(255,255,255,.2)",fontSize:13}}>{s.phone}</div></td><td>{B(s.level,"b")}</td><td style={{fontWeight:500,color:"rgba(255,255,255,.4)"}}>{s.cls}</td><td style={{fontWeight:900,color:s.score>=8?"#00F0B5":s.score>=6.5?"#FBBF24":"#EF4444",fontSize:20}}>{s.score}</td><td><div style={{display:"flex",alignItems:"center",gap:8}}><div className="pb" style={{width:56}}><div className="pf" style={{width:s.attend+"%",background:s.attend>=90?"#00F0B5":"#FBBF24"}}/></div><span style={{fontSize:12,color:s.attend>=90?"#00F0B5":"#FBBF24",fontWeight:700}}>{s.attend}%</span></div></td><td>{B(s.status,s.status==="\u0110ang h\u1ecdc"?"g":s.status==="T\u1ea1m ngh\u1ec9"?"y":"gr")}</td>
          {isAdmin&&<td><div style={{display:"flex",gap:2}}><button className="ib" onClick={()=>om("s",{...s},0)}>&#9998;</button><button className="ib r" onClick={()=>{if(confirm("Xo\u00e1?"))doDel("s",s.id)}}>{"\u2717"}</button></div></td>}</tr>)}</tbody></table></div></div>
      </div>}
 
      {/* ════ TRIALS ════ */}
      {pg==="trials"&&isAdmin&&<div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18,flexWrap:"wrap",gap:8}}><h2 style={{fontSize:24,fontWeight:900,color:"#fff",letterSpacing:"-.03em"}}>H\u1ecdc th\u1eed</h2><button className="btn-glow" onClick={()=>om("tr",{id:"TL"+Date.now(),name:"",phone:"",source:"Facebook",date:today,time:"18:00",cls:cls2[0]?.id||"",teacher:teachers[0]||"",status:"scheduled",result:"",followUp:""},1)}>+ X\u1ebfp l\u1ecbch</button></div>
        <div className="tw"><div className="gc" style={{padding:0,overflow:"hidden"}}><table><thead><tr>{["T\u00ean","Ng\u00e0y","L\u1edbp","TT","KQ","Nh\u1eafc",""].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{trials.map(t=><tr key={t.id}><td style={{fontWeight:600,color:"rgba(255,255,255,.85)"}}>{t.name}</td><td style={{fontSize:14,color:"rgba(255,255,255,.4)"}}>{t.date} {t.time}</td><td>{t.cls}</td><td>{{scheduled:B("X\u1ebfp","b"),completed:B("Xong","g"),"no-show":B("K\u0110","r")}[t.status]||B(t.status,"gr")}</td><td>{t.result?{enrolled:B("\u0110K","g"),thinking:B("Ngh\u0129","y"),"not-interested":B("KQT","gr")}[t.result]:<span style={{color:"rgba(255,255,255,.15)"}}>&#8212;</span>}</td><td style={{color:t.followUp&&daysLeft(t.followUp)<=1?"#EF4444":"rgba(255,255,255,.2)",fontSize:14}}>{t.followUp||"&#8212;"}</td>
          <td><div style={{display:"flex",gap:4,alignItems:"center"}}>{t.status==="scheduled"&&<button className="btn-s glow" onClick={()=>{setTrials(trials.map(x=>x.id===t.id?{...x,status:"completed"}:x));updateRow("trials",{...t,status:"completed"})}}>&#10003;</button>}<button className="ib" onClick={()=>om("tr",{...t},0)}>&#9998;</button></div></td></tr>)}</tbody></table></div></div>
      </div>}
 
      {/* ════ CONTRACTS ════ */}
      {pg==="contracts"&&isAdmin&&<div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18,flexWrap:"wrap",gap:8}}><h2 style={{fontSize:24,fontWeight:900,color:"#fff",letterSpacing:"-.03em"}}>H\u1ee3p \u0111\u1ed3ng</h2><button className="btn-glow" onClick={()=>om("ct",{id:"HD"+Date.now(),name:"",cls:cls2[0]?.id||"",start:today,end:"",duration:"6 th\u00e1ng",fee:0,status:"active",note:""},1)}>+ T\u1ea1o</button></div>
        <div className="tw"><div className="gc" style={{padding:0,overflow:"hidden"}}><table><thead><tr>{["HV","L\u1edbp","B\u0110","KT","Ph\u00ed","TT","C\u00f2n",""].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{contracts.map(c=>{const dl=daysLeft(c.end);const rs=c.status==="renewed"?"renewed":dl<=0?"expired":dl<=30?"expiring":"active";return<tr key={c.id}><td style={{fontWeight:600,color:"rgba(255,255,255,.85)"}}>{c.name}</td><td>{B(c.cls,"b")}</td><td style={{fontSize:14,color:"rgba(255,255,255,.4)"}}>{c.start}</td><td style={{fontSize:14,color:"rgba(255,255,255,.4)"}}>{c.end}</td><td style={{fontWeight:800,color:"#00F0B5"}}>{vnd(c.fee)}</td><td>{{active:B("OK","g"),expiring:B("S\u1eafp h\u1ebft","y"),expired:B("H\u1ebft","r"),renewed:B("GH","b")}[rs]}</td><td style={{fontWeight:800,color:dl<=0?"#EF4444":dl<=30?"#FBBF24":"#00F0B5"}}>{dl<=0?"H\u1ebft":dl+"d"}</td>
          <td><div style={{display:"flex",gap:4,alignItems:"center"}}>{(rs==="expiring"||rs==="expired")&&<button className="btn-s glow" onClick={()=>{const nc={...c,status:"renewed"};setContracts(contracts.map(x=>x.id===c.id?nc:x));updateRow("contracts",nc)}}>Gia h\u1ea1n</button>}<button className="ib" onClick={()=>om("ct",{...c},0)}>&#9998;</button></div></td></tr>})}</tbody></table></div></div>
      </div>}
 
      {/* ════ HSK ════ */}
      {pg==="hsk"&&<div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18,flexWrap:"wrap",gap:8}}><h2 style={{fontSize:24,fontWeight:900,color:"#fff",letterSpacing:"-.03em"}}>Thi HSK</h2>{isAdmin&&<button className="btn-glow" onClick={()=>om("hk",{id:"HSK"+Date.now(),name:"",level:"HSK 1",examDate:"",score:0,passed:"",status:"registered"},1)}>+ \u0110\u0103ng k\u00fd</button>}</div>
        <div style={{display:"grid",gridTemplateColumns:grd(2),gap:14,marginBottom:18}}>
          <CC title="K\u1ebft qu\u1ea3 theo level"><BarChart data={["HSK 1","HSK 2","HSK 3","HSK 4","HSK 5"].map(l=>({l,p:hsk.filter(h=>h.level===l&&h.passed==="yes").length,f:hsk.filter(h=>h.level===l&&h.passed==="no").length}))}><XAxis dataKey="l" fontSize={11} stroke="rgba(255,255,255,.15)" tickLine={false} axisLine={false}/><YAxis fontSize={11} stroke="rgba(255,255,255,.15)" tickLine={false} axisLine={false}/><Tooltip content={<TT/>}/><Bar dataKey="p" name="\u0110\u1ea1t" fill="#00F0B5" stackId="a" radius={[8,8,0,0]}/><Bar dataKey="f" name="Tr\u01b0\u1ee3t" fill="#EF4444" stackId="a" radius={[8,8,0,0]}/></BarChart></CC>
          <div className="gc" style={{textAlign:"center",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}><div style={{fontSize:13,fontWeight:700,color:"rgba(255,255,255,.3)",marginBottom:16,textTransform:"uppercase",letterSpacing:".06em"}}>T\u1ef7 l\u1ec7 \u0111\u1ed7</div><div style={{fontSize:56,fontWeight:900,color:hskRate>=70?"#00F0B5":"#FBBF24",lineHeight:1,letterSpacing:"-.04em"}}>{hskRate}%</div><div style={{fontSize:14,color:"rgba(255,255,255,.3)",marginTop:8}}>{hskP}/{hskTt} \u0111\u1ea1t</div><div className="pb" style={{marginTop:14,width:"50%"}}><div className="pf" style={{width:hskRate+"%",background:hskRate>=70?"linear-gradient(90deg,#00F0B5,#00B4D8)":"#FBBF24"}}/></div></div>
        </div>
        <div className="tw"><div className="gc" style={{padding:0,overflow:"hidden"}}><table><thead><tr>{["HV","Level","Ng\u00e0y","\u0110i\u1ec3m","KQ",...(isAdmin?[""]:[])] .map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{hsk.map(h=><tr key={h.id}><td style={{fontWeight:600,color:"rgba(255,255,255,.85)"}}>{h.name}</td><td>{B(h.level,"p")}</td><td style={{fontSize:14,color:"rgba(255,255,255,.4)"}}>{h.examDate}</td><td style={{fontWeight:800,fontSize:18}}>{h.score||<span style={{color:"rgba(255,255,255,.15)"}}>&#8212;</span>}</td><td>{h.passed==="yes"?B("\u0110\u1ea0T","g"):h.passed==="no"?B("Tr\u01b0\u1ee3t","r"):B("Ch\u01b0a","b")}</td>{isAdmin&&<td><button className="ib" onClick={()=>om("hk",{...h},0)}>&#9998;</button></td>}</tr>)}</tbody></table></div></div>
      </div>}
 
      {/* ════ REPORTS ════ */}
      {pg==="rpt"&&<div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18,flexWrap:"wrap",gap:8}}><h2 style={{fontSize:24,fontWeight:900,color:"#fff",letterSpacing:"-.03em"}}>B\u00e1o c\u00e1o</h2><button className="btn-glow" onClick={()=>om("r",{id:"RP"+Date.now(),date:today,teacher:isAdmin?(teachers[0]||""):user.name,cls:cls2[0]?.id||"",present:0,absent:0,absentNames:"",lesson:"",homework:"",flags:"",highlights:""},1)}>+ T\u1ea1o</button></div>
        {rpt.filter(r=>isAdmin||r.teacher===user.name).map(r=><div key={r.id} className="gc" style={{marginBottom:12}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:30,height:30,borderRadius:10,background:"linear-gradient(135deg,rgba(124,58,237,.1),rgba(0,240,181,.06))",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:"#7C3AED"}}>{r.teacher?.charAt(0)}</div>
              <div><strong style={{fontSize:14,color:"rgba(255,255,255,.8)"}}>{r.teacher}</strong> <span style={{color:"rgba(255,255,255,.2)",fontSize:13}}>{r.cls} &#183; {r.date}</span></div>
            </div>
            <div style={{display:"flex",gap:6,alignItems:"center"}}>{B(r.present+"/"+(r.present+r.absent),r.absent===0?"g":"y")}<button className="ib" onClick={()=>om("r",{...r},0)}>&#9998;</button></div>
          </div>
          <div style={{fontSize:14,color:"rgba(255,255,255,.45)",lineHeight:1.6}}>{r.lesson}</div>
          {r.flags&&<div className="al-r">{r.flags}</div>}
          {r.highlights&&<div className="al-g">{r.highlights}</div>}
        </div>)}
      </div>}
 
      {/* ════ LOG ════ */}
      {pg==="log"&&isAdmin&&<div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}><h2 style={{fontSize:24,fontWeight:900,color:"#fff",letterSpacing:"-.03em"}}>L\u1ecbch s\u1eed</h2><button className="btn-glow" onClick={()=>om("i",{id:"IT"+Date.now(),ref:"",refName:"",date:today,type:"call",content:"",by:"Admin"},1)}>+ Th\u00eam</button></div>
        {inter.map(it=><div key={it.id} style={{display:"flex",gap:14,padding:"16px 0",borderBottom:"1px solid rgba(255,255,255,.03)"}}>
          <div style={{width:34,height:34,borderRadius:11,background:it.type==="call"?"rgba(0,240,181,.06)":it.type==="meeting"?"rgba(251,191,36,.06)":"rgba(0,180,216,.06)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:16}}>
            {it.type==="call"?"\u260E":it.type==="meeting"?"\u{1F91D}":"\u2709"}
          </div>
          <div style={{flex:1}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}><strong style={{color:"rgba(255,255,255,.8)",fontSize:14}}>{it.refName}</strong><span style={{color:"rgba(255,255,255,.15)",fontSize:12}}>{it.date}</span>{B(it.type==="call"?"G\u1ecdi":it.type==="meeting"?"G\u1eb7p":"Nh\u1eafn",it.type==="call"?"g":it.type==="meeting"?"y":"b")}</div>
            <div style={{color:"rgba(255,255,255,.35)",marginTop:6,fontSize:14,lineHeight:1.6}}>{it.content}</div>
          </div>
        </div>)}
      </div>}
 
      {/* ════ FINANCE ════ */}
      {pg==="fin"&&isAdmin&&<div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}><h2 style={{fontSize:24,fontWeight:900,color:"#fff",letterSpacing:"-.03em"}}>T\u00e0i ch\u00ednh</h2><button className="btn-glow" onClick={()=>om("f",{id:"HP"+Date.now(),name:"",cls:cls2[0]?.id||"",total:0,d1:0,d2:0,d2d:"",st:"pending"},1)}>+ Th\u00eam</button></div>
        <div className="tw"><div className="gc" style={{padding:0,overflow:"hidden"}}><table><thead><tr>{["HV","L\u1edbp","T\u1ed5ng","\u01101","\u01102","H\u1ea1n","TT",""].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{fin.map(f=><tr key={f.id}><td style={{fontWeight:600,color:"rgba(255,255,255,.85)"}}>{f.name}</td><td>{B(f.cls,"b")}</td><td style={{fontWeight:800,color:"#00F0B5"}}>{vnd(f.total)}</td><td style={{fontSize:14,color:"rgba(255,255,255,.4)"}}>{vnd(f.d1)}</td><td style={{fontSize:14,color:"rgba(255,255,255,.4)"}}>{vnd(f.d2)}</td><td style={{color:f.st==="overdue"?"#EF4444":"rgba(255,255,255,.2)",fontSize:14}}>{f.d2d}</td><td>{f.st==="paid"?B("OK","g"):f.st==="pending"?B("Ch\u1edd","y"):B("N\u1ee3","r")}</td>
          <td><div style={{display:"flex",gap:4,alignItems:"center"}}>{f.st!=="paid"&&<button className="btn-s glow" onClick={()=>{setFin(fin.map(x=>x.id===f.id?{...x,st:"paid"}:x));updateRow("finance",{...f,st:"paid"})}}>&#10003;</button>}<button className="ib" onClick={()=>om("f",{...f},0)}>&#9998;</button></div></td></tr>)}</tbody></table></div></div>
      </div>}
 
      {/* ════ CHARTS ════ */}
      {pg==="charts"&&isAdmin&&<div>
        <h2 style={{fontSize:24,fontWeight:900,marginBottom:18,color:"#fff",letterSpacing:"-.03em"}}>Bi\u1ec3u \u0111\u1ed3</h2>
        <div style={{display:"grid",gridTemplateColumns:grd(2),gap:14}}>
          <CC title="Doanh thu"><BarChart data={monthTrend}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.03)"/><XAxis dataKey="m" fontSize={11} stroke="rgba(255,255,255,.15)" tickLine={false} axisLine={false}/><YAxis fontSize={11} stroke="rgba(255,255,255,.15)" tickLine={false} axisLine={false}/><Tooltip content={<TT/>}/><Bar dataKey="rev" fill="#00F0B5" radius={[8,8,0,0]}/></BarChart></CC>
          <CC title="Chuy\u00ean c\u1ea7n"><LineChart data={attendTrend}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.03)"/><XAxis dataKey="w" fontSize={11} stroke="rgba(255,255,255,.15)" tickLine={false} axisLine={false}/><YAxis domain={[80,100]} fontSize={11} stroke="rgba(255,255,255,.15)" tickLine={false} axisLine={false}/><Tooltip content={<TT/>}/><Line type="monotone" dataKey="v" stroke="#00B4D8" strokeWidth={2.5} dot={{fill:"#00B4D8",r:4,strokeWidth:0}}/></LineChart></CC>
          <CC title="Thanh to\u00e1n"><PieChart><Pie data={payPie} cx="50%" cy="50%" innerRadius={35} outerRadius={65} dataKey="v" label={({n,v})=>n+":"+v} fontSize={11} stroke="none">{payPie.map((e,i)=><Cell key={i} fill={[CL[0],CL[3],CL[4]][i]}/>)}</Pie><Tooltip content={<TT/>}/></PieChart></CC>
          <CC title="Ph\u00e2n b\u1ed1 \u0111i\u1ec3m"><BarChart data={scoreDist}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.03)"/><XAxis dataKey="r" fontSize={11} stroke="rgba(255,255,255,.15)" tickLine={false} axisLine={false}/><YAxis fontSize={11} stroke="rgba(255,255,255,.15)" tickLine={false} axisLine={false}/><Tooltip content={<TT/>}/><Bar dataKey="n" fill="#7C3AED" radius={[8,8,0,0]}/></BarChart></CC>
        </div>
      </div>}
    </div>
  </div>
 
  {/* ── MOBILE NAV ── */}
  {mob&&<div className="bn">
    {mobNav.map(m=><div key={m.id} className={"bi"+(pg===m.id||(m.id==="more"&&showMenu)?" ac":"")} onClick={()=>{if(m.id==="more")setShowMenu(!showMenu);else{setPg(m.id);setShowMenu(false)}}}><span style={{fontSize:18}}>{m.id==="home"?"\u25a0":m.id==="leads"?"\u25ce":m.id==="stu"?"\u25cb":m.id==="rpt"?"\u2261":m.id==="hsk"?"\u2605":"\u2630"}</span><span>{m.l}</span></div>)}
    {showMenu&&<div className="mm-p">{moreMenu.map(m=><div key={m.id} className="sn" onClick={()=>{setPg(m.id);setShowMenu(false)}}><span className="dot"/>{m.l}</div>)}<div className="sn" onClick={logout} style={{color:"#EF4444"}}><span className="dot" style={{background:"#EF4444"}}/> Tho\u00e1t</div></div>}
  </div>}
 
  {modal&&<ModalForm type={modal.t} initial={modal.d} isNew={modal.n} cls2={cls2} teachers={teachers} isAdmin={isAdmin} userName={user.name} mob={mob}
    onSave={async d=>{await doSave(modal.t,d,modal.n);setModal(null)}} onClose={()=>setModal(null)}/>}
</div>
);
}
