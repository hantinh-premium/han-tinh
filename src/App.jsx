import { useState, useEffect, useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, AreaChart, Area } from "recharts";
import { supabase } from "./supabase";
 
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
const CL=["#7af0bf","#0d9488","#38bdf8","#facc15","#f87171","#a78bfa","#fb923c"];
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
  const IS={padding:"12px 16px",border:"1px solid rgba(255,255,255,.12)",borderRadius:12,fontSize:16,outline:"none",width:"100%",fontFamily:"inherit",background:"rgba(255,255,255,.06)",color:"#f8fafc"};
  const F=({label,k,type:t})=><div style={{flex:1,marginBottom:14}}>
    <label style={{display:"block",fontSize:14,color:"#94a3b8",fontWeight:600,marginBottom:4}}>{label}</label>
    {t==="textarea"?<textarea style={{...IS,minHeight:60,resize:"vertical"}} defaultValue={d.current[k]||""} onChange={e=>{d.current[k]=e.target.value}}/>
    :t==="date"?<input style={IS} type="date" defaultValue={d.current[k]||""} onChange={e=>{d.current[k]=e.target.value}}/>
    :t==="number"?<input style={IS} type="number" defaultValue={d.current[k]||0} onChange={e=>{d.current[k]=parseFloat(e.target.value)||0}}/>
    :<input style={IS} defaultValue={d.current[k]||""} onChange={e=>{d.current[k]=e.target.value}}/>}
  </div>;
  const S=({label,k,opts})=><div style={{flex:1,marginBottom:14}}>
    <label style={{display:"block",fontSize:14,color:"#94a3b8",fontWeight:600,marginBottom:4}}>{label}</label>
    <select style={{...IS,appearance:"auto"}} defaultValue={d.current[k]||""} onChange={e=>{d.current[k]=e.target.value}}>
      {opts.map(o=>Array.isArray(o)?<option key={o[0]} value={o[0]}>{o[1]}</option>:<option key={o}>{o}</option>)}
    </select>
  </div>;
  const Fl=({children})=><div style={{display:"flex",gap:10}}>{children}</div>;
  const sources=["Facebook","TikTok","Giới thiệu","Walk-in","Website"];
  const levels=["HSK 1","HSK 2","HSK 3","HSK 4","HSK 5","HSK 6"];
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",display:"flex",alignItems:mob?"flex-end":"center",justifyContent:"center",zIndex:100}} onClick={onClose}>
      <div style={{background:"#0f1724",border:"1px solid rgba(255,255,255,.12)",borderRadius:mob?"20px 20px 0 0":"20px",padding:mob?20:30,width:mob?"100%":"540px",maxHeight:mob?"92vh":"88vh",overflowY:"auto",color:"#e2e8f0"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:20}}>
          <h3 style={{fontSize:20,fontWeight:700,color:"#f8fafc"}}>{isNew?"Thêm":"Sửa"} {{s:"Học viên",l:"Khách tiềm năng",tr:"Học thử",ct:"Hợp đồng",hk:"Thi HSK",r:"Báo cáo",i:"Tương tác",f:"Học phí"}[type]}</h3>
          <button style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#64748b"}} onClick={onClose}>✕</button>
        </div>
        {type==="l"&&<><Fl><F label="Họ tên" k="name"/><F label="SĐT" k="phone"/></Fl><Fl><S label="Nguồn" k="source" opts={sources}/><S label="Quan tâm" k="interest" opts={levels.slice(0,5)}/></Fl><S label="Giai đoạn" k="stage" opts={[["inquiry","Hỏi thăm"],["trial","Học thử"],["registered","Đã ĐK"],["lost","Mất"]]}/><F label="Ghi chú" k="note" type="textarea"/></>}
        {type==="s"&&<><Fl><F label="Họ tên" k="name"/><F label="SĐT" k="phone"/></Fl><Fl><S label="Lớp" k="cls" opts={cls2.map(c=>c.id)}/><S label="Trình độ" k="level" opts={levels}/></Fl><Fl><F label="Điểm" k="score" type="number"/><F label="CC %" k="attend" type="number"/></Fl><Fl><S label="Nguồn" k="source" opts={sources}/><S label="Trạng thái" k="status" opts={["Đang học","Tạm nghỉ","Nghỉ học"]}/></Fl></>}
        {type==="tr"&&<><Fl><F label="Họ tên" k="name"/><F label="SĐT" k="phone"/></Fl><Fl><F label="Ngày" k="date" type="date"/><F label="Giờ" k="time"/></Fl><Fl><S label="Lớp" k="cls" opts={cls2.map(c=>c.id)}/><S label="GV" k="teacher" opts={teachers}/></Fl><Fl><S label="TT" k="status" opts={[["scheduled","Đã xếp"],["completed","Đã học"],["no-show","Không đến"]]}/><S label="KQ" k="result" opts={[["","—"],["enrolled","Đã ĐK"],["thinking","Suy nghĩ"],["not-interested","Không QT"]]}/></Fl><F label="Nhắc lại" k="followUp" type="date"/></>}
        {type==="ct"&&<><F label="Học viên" k="name"/><Fl><S label="Lớp" k="cls" opts={cls2.map(c=>c.id)}/><S label="Thời hạn" k="duration" opts={["3 tháng","6 tháng","12 tháng","18 tháng"]}/></Fl><Fl><F label="Bắt đầu" k="start" type="date"/><F label="Kết thúc" k="end" type="date"/></Fl><F label="Học phí" k="fee" type="number"/></>}
        {type==="hk"&&<><F label="Học viên" k="name"/><Fl><S label="Level" k="level" opts={levels}/><F label="Ngày thi" k="examDate" type="date"/></Fl><Fl><F label="Điểm" k="score" type="number"/><S label="KQ" k="passed" opts={[["","Chưa thi"],["yes","ĐẠT"],["no","Chưa đạt"]]}/></Fl></>}
        {type==="r"&&<><Fl><F label="Ngày" k="date" type="date"/>{isAdmin?<S label="GV" k="teacher" opts={teachers}/>:<div style={{flex:1}}><label style={{display:"block",fontSize:14,color:"#94a3b8",fontWeight:600,marginBottom:4}}>GV</label><input style={{...IS,opacity:.6}} value={userName} disabled/></div>}<S label="Lớp" k="cls" opts={cls2.map(c=>c.id)}/></Fl><Fl><F label="Có mặt" k="present" type="number"/><F label="Vắng" k="absent" type="number"/></Fl><F label="HV vắng" k="absentNames"/><F label="📖 Bài học" k="lesson" type="textarea"/><F label="📝 BTVN" k="homework" type="textarea"/><F label="⚠️ Chú ý" k="flags" type="textarea"/><F label="⭐ Nổi bật" k="highlights" type="textarea"/></>}
        {type==="i"&&<><Fl><F label="Người" k="refName"/><F label="Ngày" k="date" type="date"/></Fl><Fl><S label="Loại" k="type" opts={[["call","📞 Gọi"],["message","💬 Nhắn"],["meeting","🤝 Gặp"]]}/><F label="Bởi" k="by"/></Fl><F label="Nội dung" k="content" type="textarea"/></>}
        {type==="f"&&<><F label="Họ tên" k="name"/><Fl><S label="Lớp" k="cls" opts={cls2.map(c=>c.id)}/><F label="Tổng phí" k="total" type="number"/></Fl><Fl><F label="Hạn đợt 2" k="d2d"/><S label="TT" k="st" opts={[["paid","Đã đóng"],["pending","Chờ"],["overdue","Quá hạn"]]}/></Fl></>}
        <div style={{display:"flex",gap:10,marginTop:22}}>
          <button style={{flex:1,padding:14,background:"linear-gradient(135deg,#ecfff6,#7af0bf 50%,#22d3ee)",color:"#03120b",border:"none",borderRadius:14,fontSize:17,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}} onClick={()=>{
            const data={...d.current};
            if(type==="f"&&data.total){data.d1=Math.round(data.total/2);data.d2=Math.round(data.total/2)}
            if(type==="hk"){data.status=data.passed==="yes"?"passed":data.passed==="no"?"failed":"registered"}
            onSave(data);
          }}>💾 Lưu</button>
          <button style={{padding:"14px 28px",background:"transparent",border:"1px solid rgba(255,255,255,.12)",borderRadius:14,fontSize:17,color:"#94a3b8",cursor:"pointer",fontFamily:"inherit"}} onClick={onClose}>Huỷ</button>
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
 
  if(!ok)return<div style={{display:"flex",height:"100vh",alignItems:"center",justifyContent:"center",fontFamily:"system-ui",fontSize:18,background:"#05070b",color:"#94a3b8"}}>Đang khởi động...</div>;
 
  if(!user)return(
    <div style={{fontFamily:"system-ui",minHeight:"100vh",background:"#05070b",display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{width:mob?"100%":400,background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.1)",borderRadius:24,padding:mob?28:40,backdropFilter:"blur(20px)"}}>
        <div style={{width:64,height:64,borderRadius:18,background:"linear-gradient(135deg,#f8fafc,#7af0bf)",display:"flex",alignItems:"center",justifyContent:"center",color:"#03120b",fontSize:32,fontWeight:900,margin:"0 auto 18px"}}>漢</div>
        <h2 style={{fontSize:28,fontWeight:850,color:"#f8fafc",textAlign:"center",marginBottom:6}}>Hán Tinh Premium</h2>
        <p style={{color:"#64748b",fontSize:15,textAlign:"center",marginBottom:28}}>Đăng nhập vào hệ thống</p>
        <input style={{width:"100%",padding:"14px 18px",border:"1px solid rgba(255,255,255,.12)",borderRadius:14,fontSize:16,outline:"none",fontFamily:"inherit",background:"rgba(255,255,255,.06)",color:"#f8fafc",marginBottom:12}} placeholder="Tài khoản" value={lu} onChange={e=>setLu(e.target.value)} onKeyDown={e=>e.key==="Enter"&&login()}/>
        <input style={{width:"100%",padding:"14px 18px",border:"1px solid rgba(255,255,255,.12)",borderRadius:14,fontSize:16,outline:"none",fontFamily:"inherit",background:"rgba(255,255,255,.06)",color:"#f8fafc",marginBottom:12}} placeholder="Mật khẩu" type="password" value={lp} onChange={e=>setLp(e.target.value)} onKeyDown={e=>e.key==="Enter"&&login()}/>
        {le&&<div style={{color:"#f87171",fontSize:14,marginBottom:10,textAlign:"center"}}>{le}</div>}
        <button onClick={login} style={{width:"100%",padding:14,background:"linear-gradient(135deg,#ecfff6,#7af0bf 50%,#22d3ee)",color:"#03120b",border:"none",borderRadius:14,fontSize:17,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Đăng nhập</button>
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
 
  const B=(t,c)=>{const m={g:["rgba(122,240,191,.15)","#7af0bf"],r:["rgba(248,113,113,.12)","#f87171"],y:["rgba(250,204,21,.12)","#facc15"],b:["rgba(56,189,248,.12)","#38bdf8"],gr:["rgba(148,163,184,.1)","#94a3b8"],p:["rgba(167,139,250,.12)","#a78bfa"],o:["rgba(251,146,60,.12)","#fb923c"]};const[bg,fg]=m[c]||m.gr;return<span style={{display:"inline-block",padding:"4px 12px",borderRadius:99,fontSize:12,fontWeight:700,background:bg,color:fg}}>{t}</span>};
  const CC=({title,children,h=190})=><div className="cd"><div style={{fontWeight:700,fontSize:16,marginBottom:12,color:"#f1f5f9"}}>{title}</div><ResponsiveContainer width="100%" height={h}>{children}</ResponsiveContainer></div>;
  const om=(t,d,n)=>setModal({t,d,n});
  const grd=c=>mob?"1fr":`repeat(${c},1fr)`;
 
  const adminMenu=[{id:"home",l:"Tổng quan",i:"📊"},{id:"leads",l:"Khách mới",i:"🎯"},{id:"trials",l:"Học thử",i:"📚"},{id:"stu",l:"Học viên",i:"👨‍🎓"},{id:"contracts",l:"Hợp đồng",i:"📄"},{id:"hsk",l:"HSK",i:"🎓"},{id:"rpt",l:"Báo cáo",i:"📋"},{id:"log",l:"Lịch sử",i:"💬"},{id:"fin",l:"Tài chính",i:"💰"},{id:"charts",l:"Biểu đồ",i:"📈"}];
  const teacherMenu=[{id:"home",l:"Tổng quan",i:"📊"},{id:"stu",l:"Học viên",i:"👨‍🎓"},{id:"rpt",l:"Báo cáo",i:"📋"},{id:"hsk",l:"HSK",i:"🎓"}];
  const menu=isAdmin?adminMenu:teacherMenu;
  const mobNav=isAdmin?[{id:"home",i:"📊",l:"Tổng quan"},{id:"leads",i:"🎯",l:"Khách"},{id:"stu",i:"👨‍🎓",l:"HV"},{id:"rpt",i:"📋",l:"Báo cáo"},{id:"more",i:"☰",l:"Thêm"}]:[{id:"home",i:"📊",l:"Tổng quan"},{id:"stu",i:"👨‍🎓",l:"HV"},{id:"rpt",i:"📋",l:"Báo cáo"},{id:"hsk",i:"🎓",l:"HSK"}];
  const moreMenu=adminMenu.filter(m=>!["home","leads","stu","rpt"].includes(m.id));
 
  return(
    <div style={{fontFamily:"system-ui,sans-serif",display:"flex",flexDirection:mob?"column":"row",height:"100vh",background:"#05070b",color:"#e2e8f0",overflow:"hidden",position:"relative"}}>
      <style>{`
*{box-sizing:border-box;margin:0;padding:0}::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:rgba(148,163,184,.3);border-radius:99px}
.ni{display:flex;align-items:center;gap:10px;padding:11px 14px;border-radius:14px;cursor:pointer;font-size:15px;font-weight:600;color:#94a3b8;transition:.15s;border:1px solid transparent}
.ni:hover{background:rgba(255,255,255,.05);color:#f1f5f9}.ni.a{background:linear-gradient(135deg,rgba(122,240,191,.18),rgba(34,211,238,.08));color:#f8fafc;font-weight:800;border-color:rgba(122,240,191,.2)}
.cd{background:rgba(255,255,255,.05);border-radius:20px;padding:20px;border:1px solid rgba(255,255,255,.08);color:#e2e8f0}
.btn{display:inline-flex;align-items:center;gap:5px;padding:10px 20px;border-radius:12px;border:none;cursor:pointer;font-size:14px;font-weight:700;font-family:inherit}
.btn-p{background:linear-gradient(135deg,#ecfff6,#7af0bf 50%,#22d3ee);color:#03120b}.btn-sm{padding:7px 13px;font-size:13px}
.tbl-wrap{overflow-x:auto;border-radius:20px}table{width:100%;border-collapse:collapse;min-width:600px}
th{padding:13px 16px;text-align:left;font-size:12px;font-weight:800;color:#64748b;text-transform:uppercase;background:rgba(255,255,255,.03);border-bottom:1px solid rgba(255,255,255,.07);white-space:nowrap}
td{padding:13px 16px;font-size:15px;border-bottom:1px solid rgba(255,255,255,.05);white-space:nowrap;color:#cbd5e1}tr:hover td{background:rgba(122,240,191,.04)}
.ib{cursor:pointer;padding:6px 8px;border-radius:9px;border:none;background:transparent;color:#94a3b8;font-size:16px}.ib:hover{color:#7af0bf}
.pb{height:8px;background:rgba(255,255,255,.07);border-radius:99px;overflow:hidden}.pf{height:100%;border-radius:99px}
.tab{padding:8px 16px;border-radius:99px;cursor:pointer;font-size:13px;font-weight:700;color:#94a3b8;border:none;background:transparent;font-family:inherit}.tab.a{background:#f8fafc;color:#020617}
.al{border-radius:14px;padding:12px;margin-bottom:8px;font-size:14px}
.fb{height:36px;border-radius:10px;display:flex;align-items:center;padding:0 14px;color:#03120b;font-weight:800;font-size:14px;margin-bottom:6px}
.bot-nav{display:flex;background:rgba(2,6,23,.92);border-top:1px solid rgba(255,255,255,.08);padding:6px 0}
.bot-item{flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;padding:6px 0;cursor:pointer;font-size:10px;color:#94a3b8;font-weight:600}
.bot-item.a{color:#7af0bf;font-weight:800}.bot-item span:first-child{font-size:20px}
.more-menu{position:absolute;bottom:60px;right:8px;background:#0a1118;border:1px solid rgba(255,255,255,.1);border-radius:16px;box-shadow:0 16px 60px rgba(0,0,0,.5);padding:8px;width:200px;z-index:50}
      `}</style>
 
      {!mob&&<div style={{width:220,background:"rgba(2,6,23,.7)",borderRight:"1px solid rgba(255,255,255,.07)",display:"flex",flexDirection:"column",flexShrink:0}}>
        <div style={{padding:"16px 14px",borderBottom:"1px solid rgba(255,255,255,.06)",display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:36,height:36,borderRadius:12,background:"linear-gradient(135deg,#f8fafc,#7af0bf)",display:"flex",alignItems:"center",justifyContent:"center",color:"#03120b",fontSize:18,fontWeight:900}}>漢</div>
          <div><div style={{fontWeight:850,fontSize:16,color:"#f8fafc"}}>Hán Tinh</div><div style={{fontSize:10,color:"#7af0bf",fontWeight:800,letterSpacing:1.5}}>PREMIUM</div></div>
        </div>
        <nav style={{padding:"8px 6px",flex:1}}>{menu.map(m=><div key={m.id} className={`ni ${pg===m.id?"a":""}`} onClick={()=>setPg(m.id)}>{m.i} {m.l}</div>)}</nav>
        <div style={{padding:"10px 8px",borderTop:"1px solid rgba(255,255,255,.06)"}}>
          <div style={{fontSize:14,fontWeight:700,color:"#f1f5f9"}}>{user.name}</div>
          <div style={{fontSize:12,color:"#64748b"}}>{isAdmin?"Quản trị viên":"Giáo viên"}</div>
          <button onClick={logout} style={{marginTop:4,fontSize:12,color:"#f87171",background:"none",border:"none",cursor:"pointer",fontWeight:600}}>Đăng xuất</button>
        </div>
      </div>}
 
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <div style={{background:"rgba(2,6,23,.7)",padding:"10px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid rgba(255,255,255,.06)",flexShrink:0}}>
          {mob?<div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:28,height:28,borderRadius:8,background:"linear-gradient(135deg,#f8fafc,#7af0bf)",display:"flex",alignItems:"center",justifyContent:"center",color:"#03120b",fontSize:13,fontWeight:900}}>漢</div><span style={{fontWeight:800,fontSize:15,color:"#f8fafc"}}>Hán Tinh</span></div>
          :<input style={{padding:"10px 16px",border:"1px solid rgba(255,255,255,.1)",borderRadius:99,fontSize:14,outline:"none",width:300,fontFamily:"inherit",background:"rgba(255,255,255,.05)",color:"#f8fafc"}} placeholder="🔍 Tìm kiếm..." value={q} onChange={e=>setQ(e.target.value)}/>}
          <div style={{display:"flex",alignItems:"center",gap:8}}>{!mob&&<span style={{fontSize:13,color:"#64748b"}}>{user.name}</span>}{mob&&<button onClick={logout} style={{fontSize:12,color:"#f87171",background:"none",border:"none",cursor:"pointer",fontWeight:600}}>Thoát</button>}</div>
        </div>
 
        <div style={{flex:1,overflow:"auto",padding:mob?14:22}}>
 
          {pg==="home"&&<div>
            <h2 style={{fontSize:mob?20:26,fontWeight:800,color:"#f8fafc",marginBottom:16}}>Tổng quan</h2>
            {isAdmin&&<div style={{display:"flex",gap:3,background:"rgba(255,255,255,.05)",borderRadius:99,padding:3,marginBottom:14,width:"fit-content"}}>
              {[["kpi","Chỉ số"],["funnel","Phễu"],["trends","Xu hướng"]].map(([id,l])=><button key={id} className={`tab ${dtab===id?"a":""}`} onClick={()=>setDtab(id)}>{l}</button>)}
            </div>}
            <div style={{display:"grid",gridTemplateColumns:grd(isAdmin?3:2),gap:10,marginBottom:16}}>
              {(isAdmin?[{l:"Khách mới",v:leads.filter(l=>l.stage!=="lost").length,c:"#38bdf8"},{l:"Học viên",v:act.length,c:"#7af0bf"},{l:"HSK đỗ",v:hskRate+"%",c:"#a78bfa"},{l:"Đã thu",v:vnd(collected),c:"#7af0bf"},{l:"Nợ HP",v:ov.length,c:"#f87171"},{l:"Cần nhắc",v:needFU.length,c:"#fb923c"}]
              :[{l:"HV lớp tôi",v:stu.filter(s=>canSee(s.cls)).length,c:"#7af0bf"},{l:"Báo cáo",v:rpt.filter(r=>r.teacher===user.name).length,c:"#a78bfa"},{l:"Điểm TB",v:(stu.filter(s=>canSee(s.cls)&&s.status==="Đang học").reduce((a,s)=>a+s.score,0)/Math.max(stu.filter(s=>canSee(s.cls)&&s.status==="Đang học").length,1)).toFixed(1),c:"#38bdf8"},{l:"Chuyên cần",v:Math.round(stu.filter(s=>canSee(s.cls)&&s.status==="Đang học").reduce((a,s)=>a+s.attend,0)/Math.max(stu.filter(s=>canSee(s.cls)&&s.status==="Đang học").length,1))+"%",c:"#0d9488"}]).map((s,i)=><div key={i} className="cd" style={{textAlign:"center",padding:16}}><div style={{fontSize:28,fontWeight:800,color:s.c}}>{s.v}</div><div style={{fontSize:14,color:"#64748b",marginTop:3}}>{s.l}</div></div>)}
            </div>
            {dtab==="kpi"&&isAdmin&&<div style={{display:"grid",gridTemplateColumns:grd(3),gap:12}}>
              <div className="cd"><div style={{fontWeight:700,fontSize:16,color:"#f87171",marginBottom:10}}>⚠️ Cần thu</div>{ov.map(f=><div key={f.id} style={{padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,.06)",display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><strong>{f.name}</strong><br/><span style={{color:"#f87171"}}>{vnd(f.d2)}</span></div><button className="btn btn-p btn-sm" onClick={()=>{setFin(fin.map(x=>x.id===f.id?{...x,st:"paid"}:x));updateRow("finance",{...f,st:"paid"})}}>✓</button></div>)}{ov.length===0&&<div style={{color:"#7af0bf"}}>Tất cả OK ✅</div>}</div>
              <div className="cd"><div style={{fontWeight:700,fontSize:16,color:"#7af0bf",marginBottom:10}}>🏆 Top 5</div>{ranked.slice(0,5).map((s,i)=><div key={s.id} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",fontSize:15}}><span>{["🥇","🥈","🥉","4.","5."][i]} {s.name}</span><strong style={{color:"#7af0bf"}}>{s.score}</strong></div>)}</div>
              <div className="cd"><div style={{fontWeight:700,fontSize:16,color:"#a78bfa",marginBottom:10}}>📋 Báo cáo mới</div>{rpt.slice(0,4).map(r=><div key={r.id} style={{padding:"6px 0",borderBottom:"1px solid rgba(255,255,255,.05)",fontSize:14}}><strong>{r.teacher}</strong> · {r.cls} · <span style={{color:"#64748b"}}>{r.date}</span></div>)}</div>
            </div>}
            {dtab==="funnel"&&isAdmin&&<div style={{display:"grid",gridTemplateColumns:grd(2),gap:12}}>
              <div className="cd"><div style={{fontWeight:700,fontSize:16,marginBottom:14}}>🎯 Phễu</div>{funnelData.map((f,i)=><div key={f.s} className="fb" style={{width:Math.max((f.v/Math.max(funnelData[0].v,1))*100,25)+"%",background:CL[i]}}>{f.s}: {f.v}</div>)}</div>
              <CC title="📊 Nguồn"><PieChart><Pie data={srcData} cx="50%" cy="50%" innerRadius={35} outerRadius={65} dataKey="v" label={({name,v})=>name.slice(0,5)+":"+v} fontSize={12}>{srcData.map((e,i)=><Cell key={i} fill={CL[i]}/>)}</Pie><Tooltip/></PieChart></CC>
            </div>}
            {dtab==="trends"&&isAdmin&&<div style={{display:"grid",gridTemplateColumns:grd(2),gap:12}}>
              <CC title="📈 Doanh thu"><BarChart data={monthTrend}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.06)"/><XAxis dataKey="m" fontSize={12} stroke="#64748b"/><YAxis fontSize={12} stroke="#64748b"/><Tooltip/><Bar dataKey="rev" fill="#7af0bf" radius={[4,4,0,0]}/></BarChart></CC>
              <CC title="📊 Chuyên cần"><LineChart data={attendTrend}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.06)"/><XAxis dataKey="w" fontSize={12} stroke="#64748b"/><YAxis domain={[80,100]} fontSize={12} stroke="#64748b"/><Tooltip/><Line type="monotone" dataKey="v" stroke="#7af0bf" strokeWidth={2.5} dot={{fill:"#7af0bf",r:4}}/></LineChart></CC>
            </div>}
          </div>}
 
          {pg==="leads"&&isAdmin&&<div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,flexWrap:"wrap",gap:8}}><h2 style={{fontSize:22,fontWeight:800,color:"#f8fafc"}}>🎯 Khách tiềm năng</h2><button className="btn btn-p" onClick={()=>om("l",{id:"LD"+Date.now(),name:"",phone:"",source:"Facebook",stage:"inquiry",interest:"HSK 1",note:"",created:today,lastContact:today},1)}>+ Thêm</button></div>
            <div className="tbl-wrap"><div className="cd" style={{padding:0}}><table><thead><tr>{["Tên","SĐT","Nguồn","QT","GĐ",""].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{leads.map(l=><tr key={l.id}><td style={{fontWeight:600,color:"#f1f5f9"}}>{l.name}</td><td>{l.phone}</td><td>{B(l.source,{Facebook:"b",TikTok:"p","Giới thiệu":"g","Walk-in":"o",Website:"y"}[l.source]||"gr")}</td><td>{B(l.interest,"b")}</td><td>{{inquiry:B("Hỏi","b"),trial:B("Thử","o"),registered:B("ĐK","g"),lost:B("Mất","gr")}[l.stage]}</td>
              <td><div style={{display:"flex",gap:4}}>{l.stage==="inquiry"&&<button className="btn btn-sm" style={{background:"rgba(251,146,60,.12)",color:"#fb923c",border:"1px solid rgba(251,146,60,.2)"}} onClick={()=>{setLeads(leads.map(x=>x.id===l.id?{...x,stage:"trial"}:x));updateRow("leads",{...l,stage:"trial"})}}>→Thử</button>}{l.stage==="trial"&&<button className="btn btn-sm btn-p" onClick={()=>{setLeads(leads.map(x=>x.id===l.id?{...x,stage:"registered"}:x));updateRow("leads",{...l,stage:"registered"})}}>→ĐK</button>}<button className="ib" onClick={()=>om("l",{...l},0)}>✏️</button><button className="ib" style={{color:"#f87171"}} onClick={()=>{if(confirm("Xoá?"))doDel("l",l.id)}}>🗑️</button></div></td></tr>)}</tbody></table></div></div>
          </div>}
 
          {pg==="stu"&&<div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,flexWrap:"wrap",gap:8}}><h2 style={{fontSize:22,fontWeight:800,color:"#f8fafc"}}>👨‍🎓 Học viên</h2>{isAdmin&&<button className="btn btn-p" onClick={()=>om("s",{id:"HV"+Date.now(),name:"",phone:"",cls:cls2[0]?.id||"",level:"HSK 1",status:"Đang học",score:0,attend:90,source:"Facebook"},1)}>+ Thêm</button>}</div>
            <div className="tbl-wrap"><div className="cd" style={{padding:0}}><table><thead><tr>{["#","HV","Level","Lớp","Điểm","CC","TT",...(isAdmin?[""]:[])] .map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{stu.filter(s=>(!q||s.name.toLowerCase().includes(query))&&canSee(s.cls)).map((s,i)=><tr key={s.id}><td style={{color:"#64748b"}}>{i+1}</td><td><div style={{fontWeight:600,color:"#f1f5f9"}}>{s.name}</div><div style={{color:"#64748b",fontSize:13}}>{s.phone}</div></td><td>{B(s.level,"b")}</td><td>{s.cls}</td><td style={{fontWeight:800,color:s.score>=8?"#7af0bf":s.score>=6.5?"#facc15":"#f87171",fontSize:18}}>{s.score}</td><td style={{color:s.attend>=90?"#7af0bf":"#facc15"}}>{s.attend}%</td><td>{B(s.status,s.status==="Đang học"?"g":s.status==="Tạm nghỉ"?"y":"gr")}</td>
              {isAdmin&&<td><button className="ib" onClick={()=>om("s",{...s},0)}>✏️</button><button className="ib" style={{color:"#f87171"}} onClick={()=>{if(confirm("Xoá?"))doDel("s",s.id)}}>🗑️</button></td>}</tr>)}</tbody></table></div></div>
          </div>}
 
          {pg==="trials"&&isAdmin&&<div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,flexWrap:"wrap",gap:8}}><h2 style={{fontSize:22,fontWeight:800,color:"#f8fafc"}}>📚 Học thử</h2><button className="btn btn-p" onClick={()=>om("tr",{id:"TL"+Date.now(),name:"",phone:"",source:"Facebook",date:today,time:"18:00",cls:cls2[0]?.id||"",teacher:teachers[0]||"",status:"scheduled",result:"",followUp:""},1)}>+ Xếp lịch</button></div>
            <div className="tbl-wrap"><div className="cd" style={{padding:0}}><table><thead><tr>{["Tên","Ngày","Lớp","TT","KQ","Nhắc",""].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{trials.map(t=><tr key={t.id}><td style={{fontWeight:600,color:"#f1f5f9"}}>{t.name}</td><td>{t.date} {t.time}</td><td>{t.cls}</td><td>{{scheduled:B("Xếp","b"),completed:B("Xong","g"),"no-show":B("KĐ","r")}[t.status]||B(t.status,"gr")}</td><td>{t.result?{enrolled:B("ĐK","g"),thinking:B("Nghĩ","y"),"not-interested":B("KQT","gr")}[t.result]:"—"}</td><td style={{color:t.followUp&&daysLeft(t.followUp)<=1?"#f87171":"#64748b"}}>{t.followUp||"—"}</td>
              <td>{t.status==="scheduled"&&<button className="btn btn-sm btn-p" onClick={()=>{setTrials(trials.map(x=>x.id===t.id?{...x,status:"completed"}:x));updateRow("trials",{...t,status:"completed"})}}>✓</button>}<button className="ib" onClick={()=>om("tr",{...t},0)}>✏️</button></td></tr>)}</tbody></table></div></div>
          </div>}
 
          {pg==="contracts"&&isAdmin&&<div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,flexWrap:"wrap",gap:8}}><h2 style={{fontSize:22,fontWeight:800,color:"#f8fafc"}}>📄 Hợp đồng</h2><button className="btn btn-p" onClick={()=>om("ct",{id:"HD"+Date.now(),name:"",cls:cls2[0]?.id||"",start:today,end:"",duration:"6 tháng",fee:0,status:"active",note:""},1)}>+ Tạo</button></div>
            <div className="tbl-wrap"><div className="cd" style={{padding:0}}><table><thead><tr>{["HV","Lớp","BĐ","KT","Phí","TT","Còn",""].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{contracts.map(c=>{const dl=daysLeft(c.end);const rs=c.status==="renewed"?"renewed":dl<=0?"expired":dl<=30?"expiring":"active";return<tr key={c.id}><td style={{fontWeight:600,color:"#f1f5f9"}}>{c.name}</td><td>{B(c.cls,"b")}</td><td>{c.start}</td><td>{c.end}</td><td style={{fontWeight:700,color:"#7af0bf"}}>{vnd(c.fee)}</td><td>{{active:B("OK","g"),expiring:B("Sắp hết","y"),expired:B("Hết","r"),renewed:B("GH","b")}[rs]}</td><td style={{fontWeight:700,color:dl<=0?"#f87171":dl<=30?"#facc15":"#7af0bf"}}>{dl<=0?"Hết":dl+"d"}</td>
              <td>{(rs==="expiring"||rs==="expired")&&<button className="btn btn-sm btn-p" onClick={()=>{const nc={...c,status:"renewed"};setContracts(contracts.map(x=>x.id===c.id?nc:x));updateRow("contracts",nc)}}>↻</button>}<button className="ib" onClick={()=>om("ct",{...c},0)}>✏️</button></td></tr>})}</tbody></table></div></div>
          </div>}
 
          {pg==="hsk"&&<div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,flexWrap:"wrap",gap:8}}><h2 style={{fontSize:22,fontWeight:800,color:"#f8fafc"}}>🎓 Thi HSK</h2>{isAdmin&&<button className="btn btn-p" onClick={()=>om("hk",{id:"HSK"+Date.now(),name:"",level:"HSK 1",examDate:"",score:0,passed:"",status:"registered"},1)}>+ ĐK</button>}</div>
            <div style={{display:"grid",gridTemplateColumns:grd(2),gap:12,marginBottom:14}}>
              <CC title="Kết quả"><BarChart data={["HSK 1","HSK 2","HSK 3","HSK 4","HSK 5"].map(l=>({l,p:hsk.filter(h=>h.level===l&&h.passed==="yes").length,f:hsk.filter(h=>h.level===l&&h.passed==="no").length}))}><XAxis dataKey="l" fontSize={12} stroke="#64748b"/><YAxis fontSize={12} stroke="#64748b"/><Tooltip/><Bar dataKey="p" name="Đạt" fill="#7af0bf" stackId="a" radius={[4,4,0,0]}/><Bar dataKey="f" name="Trượt" fill="#f87171" stackId="a" radius={[4,4,0,0]}/></BarChart></CC>
              <div className="cd" style={{textAlign:"center"}}><div style={{fontSize:18,fontWeight:700,marginBottom:10}}>Tỷ lệ đỗ</div><div style={{fontSize:52,fontWeight:800,color:hskRate>=70?"#7af0bf":"#facc15"}}>{hskRate}%</div><div style={{fontSize:15,color:"#64748b"}}>{hskP}/{hskTt} đạt</div><div className="pb" style={{marginTop:10}}><div className="pf" style={{width:hskRate+"%",background:hskRate>=70?"#7af0bf":"#facc15"}}/></div></div>
            </div>
            <div className="tbl-wrap"><div className="cd" style={{padding:0}}><table><thead><tr>{["HV","Level","Ngày","Điểm","KQ",...(isAdmin?[""]:[])] .map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{hsk.map(h=><tr key={h.id}><td style={{fontWeight:600,color:"#f1f5f9"}}>{h.name}</td><td>{B(h.level,"p")}</td><td>{h.examDate}</td><td style={{fontWeight:700,fontSize:18}}>{h.score||"—"}</td><td>{h.passed==="yes"?B("ĐẠT","g"):h.passed==="no"?B("Trượt","r"):B("Chưa","b")}</td>{isAdmin&&<td><button className="ib" onClick={()=>om("hk",{...h},0)}>✏️</button></td>}</tr>)}</tbody></table></div></div>
          </div>}
 
          {pg==="rpt"&&<div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,flexWrap:"wrap",gap:8}}><h2 style={{fontSize:22,fontWeight:800,color:"#f8fafc"}}>📋 Báo cáo</h2><button className="btn btn-p" onClick={()=>om("r",{id:"RP"+Date.now(),date:today,teacher:isAdmin?(teachers[0]||""):user.name,cls:cls2[0]?.id||"",present:0,absent:0,absentNames:"",lesson:"",homework:"",flags:"",highlights:""},1)}>+ Tạo</button></div>
            {rpt.filter(r=>isAdmin||r.teacher===user.name).map(r=><div key={r.id} className="cd" style={{marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}><div><strong style={{fontSize:16}}>{r.teacher}</strong> <span style={{color:"#64748b",fontSize:14}}>{r.cls} · {r.date}</span></div><div style={{display:"flex",gap:6}}>{B(r.present+"/"+(r.present+r.absent),r.absent===0?"g":"y")}<button className="ib" onClick={()=>om("r",{...r},0)}>✏️</button></div></div>
              <div style={{fontSize:15}}>📖 {r.lesson}</div>
              {r.flags&&<div style={{background:"rgba(248,113,113,.06)",borderRadius:8,padding:"8px 12px",marginTop:6,fontSize:14,color:"#f87171",border:"1px solid rgba(248,113,113,.12)"}}>⚠️ {r.flags}</div>}
              {r.highlights&&<div style={{background:"rgba(122,240,191,.06)",borderRadius:8,padding:"8px 12px",marginTop:6,fontSize:14,color:"#7af0bf",border:"1px solid rgba(122,240,191,.12)"}}>⭐ {r.highlights}</div>}
            </div>)}
          </div>}
 
          {pg==="log"&&isAdmin&&<div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}><h2 style={{fontSize:22,fontWeight:800,color:"#f8fafc"}}>💬 Lịch sử</h2><button className="btn btn-p" onClick={()=>om("i",{id:"IT"+Date.now(),ref:"",refName:"",date:today,type:"call",content:"",by:"Admin"},1)}>+ Thêm</button></div>
            {inter.map(it=><div key={it.id} style={{display:"flex",gap:12,padding:"12px 0",borderBottom:"1px solid rgba(255,255,255,.05)"}}><div style={{width:10,height:10,borderRadius:"50%",background:it.type==="call"?"#7af0bf":"#38bdf8",marginTop:6,flexShrink:0}}/><div><strong style={{color:"#f1f5f9"}}>{it.refName}</strong> <span style={{color:"#64748b",fontSize:13}}>{it.date}</span> {B(it.type==="call"?"📞":"💬",it.type==="call"?"g":"b")}<div style={{color:"#94a3b8",marginTop:4}}>{it.content}</div></div></div>)}
          </div>}
 
          {pg==="fin"&&isAdmin&&<div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}><h2 style={{fontSize:22,fontWeight:800,color:"#f8fafc"}}>💰 Tài chính</h2><button className="btn btn-p" onClick={()=>om("f",{id:"HP"+Date.now(),name:"",cls:cls2[0]?.id||"",total:0,d1:0,d2:0,d2d:"",st:"pending"},1)}>+ Thêm</button></div>
            <div className="tbl-wrap"><div className="cd" style={{padding:0}}><table><thead><tr>{["HV","Lớp","Tổng","Đ1","Đ2","Hạn","TT",""].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{fin.map(f=><tr key={f.id}><td style={{fontWeight:600,color:"#f1f5f9"}}>{f.name}</td><td>{B(f.cls,"b")}</td><td style={{fontWeight:700,color:"#7af0bf"}}>{vnd(f.total)}</td><td>{vnd(f.d1)}</td><td>{vnd(f.d2)}</td><td style={{color:f.st==="overdue"?"#f87171":"#64748b"}}>{f.d2d}</td><td>{f.st==="paid"?B("OK","g"):f.st==="pending"?B("Chờ","y"):B("Nợ","r")}</td>
              <td>{f.st!=="paid"&&<button className="btn btn-p btn-sm" onClick={()=>{setFin(fin.map(x=>x.id===f.id?{...x,st:"paid"}:x));updateRow("finance",{...f,st:"paid"})}}>✓</button>}<button className="ib" onClick={()=>om("f",{...f},0)}>✏️</button></td></tr>)}</tbody></table></div></div>
          </div>}
 
          {pg==="charts"&&isAdmin&&<div>
            <h2 style={{fontSize:22,fontWeight:800,marginBottom:14,color:"#f8fafc"}}>📈 Biểu đồ</h2>
            <div style={{display:"grid",gridTemplateColumns:grd(2),gap:12}}>
              <CC title="Doanh thu"><BarChart data={monthTrend}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.06)"/><XAxis dataKey="m" fontSize={12} stroke="#64748b"/><YAxis fontSize={12} stroke="#64748b"/><Tooltip/><Bar dataKey="rev" fill="#7af0bf" radius={[4,4,0,0]}/></BarChart></CC>
              <CC title="Chuyên cần"><LineChart data={attendTrend}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.06)"/><XAxis dataKey="w" fontSize={12} stroke="#64748b"/><YAxis domain={[80,100]} fontSize={12} stroke="#64748b"/><Tooltip/><Line type="monotone" dataKey="v" stroke="#7af0bf" strokeWidth={2.5} dot={{fill:"#7af0bf",r:4}}/></LineChart></CC>
              <CC title="Thanh toán"><PieChart><Pie data={payPie} cx="50%" cy="50%" innerRadius={35} outerRadius={65} dataKey="v" label={({n,v})=>n+":"+v} fontSize={12}>{payPie.map((e,i)=><Cell key={i} fill={[CL[0],CL[3],CL[4]][i]}/>)}</Pie><Tooltip/></PieChart></CC>
              <CC title="Phân bố điểm"><BarChart data={scoreDist}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.06)"/><XAxis dataKey="r" fontSize={12} stroke="#64748b"/><YAxis fontSize={12} stroke="#64748b"/><Tooltip/><Bar dataKey="n" fill="#38bdf8" radius={[4,4,0,0]}/></BarChart></CC>
            </div>
          </div>}
        </div>
      </div>
 
      {mob&&<div className="bot-nav">
        {mobNav.map(m=><div key={m.id} className={`bot-item ${pg===m.id?"a":""}`} onClick={()=>{if(m.id==="more")setShowMenu(!showMenu);else{setPg(m.id);setShowMenu(false)}}}><span>{m.i}</span><span>{m.l}</span></div>)}
        {showMenu&&<div className="more-menu">{moreMenu.map(m=><div key={m.id} className="ni" onClick={()=>{setPg(m.id);setShowMenu(false)}}>{m.i} {m.l}</div>)}<div className="ni" onClick={logout} style={{color:"#f87171"}}>🚪 Thoát</div></div>}
      </div>}
 
      {modal&&<ModalForm type={modal.t} initial={modal.d} isNew={modal.n} cls2={cls2} teachers={teachers} isAdmin={isAdmin} userName={user.name} mob={mob}
        onSave={async d=>{await doSave(modal.t,d,modal.n);setModal(null)}} onClose={()=>setModal(null)}/>}
    </div>
  );
}
