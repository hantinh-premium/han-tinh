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
const CL=["#16a34a","#0d9488","#2563eb","#ca8a04","#dc2626","#7c3aed","#ea580c"];
const daysLeft=d=>Math.ceil((new Date(d)-new Date())/86400000);
 
const USERS=[
  {user:"admin",pass:"hantinh2026",role:"admin",name:"Admin",cls:"all"},
  {user:"cohoa",pass:"gv2026",role:"teacher",name:"Cô Hoa",cls:"CN-A1"},
  {user:"thaylong",pass:"gv2026",role:"teacher",name:"Thầy Long",cls:"CN-A3,CN-B2"},
  {user:"cowang",pass:"gv2026",role:"teacher",name:"Cô Wang Li",cls:"CN-A2"},
  {user:"thaynam",pass:"gv2026",role:"teacher",name:"Thầy Nam",cls:"CN-B1"},
];
const monthTrend=[{m:"T12",rev:42,lead:8,enroll:2},{m:"T1",rev:48,lead:12,enroll:4},{m:"T2",rev:52,lead:10,enroll:3},{m:"T3",rev:58,lead:15,enroll:5},{m:"T4",rev:65,lead:11,enroll:3},{m:"T5",rev:72,lead:14,enroll:5}];
const attendTrend=[{w:"T1",v:88},{w:"T2",v:91},{w:"T3",v:85},{w:"T4",v:93},{w:"T5",v:90},{w:"T6",v:87},{w:"T7",v:92},{w:"T8",v:94}];
 
// ── MODAL - useRef = KHÔNG LAG KHI GÕ ──
function ModalForm({type,initial,isNew,onSave,onClose,cls2,teachers,isAdmin,userName}){
  const d=useRef({...initial});
  const IS={padding:"12px 16px",border:"1.5px solid #e5e7eb",borderRadius:10,fontSize:16,outline:"none",width:"100%",fontFamily:"inherit",background:"#fff"};
 
  const F=({label,k,type:t})=><div style={{flex:1,marginBottom:14}}>
    <label style={{display:"block",fontSize:14,color:"#374151",fontWeight:600,marginBottom:5}}>{label}</label>
    {t==="textarea"?<textarea style={{...IS,minHeight:60,resize:"vertical"}} defaultValue={d.current[k]||""} onChange={e=>{d.current[k]=e.target.value}}/>
    :t==="date"?<input style={IS} type="date" defaultValue={d.current[k]||""} onChange={e=>{d.current[k]=e.target.value}}/>
    :t==="number"?<input style={IS} type="number" defaultValue={d.current[k]||0} onChange={e=>{d.current[k]=parseFloat(e.target.value)||0}}/>
    :<input style={IS} defaultValue={d.current[k]||""} onChange={e=>{d.current[k]=e.target.value}}/>}
  </div>;
 
  const S=({label,k,opts})=><div style={{flex:1,marginBottom:14}}>
    <label style={{display:"block",fontSize:14,color:"#374151",fontWeight:600,marginBottom:5}}>{label}</label>
    <select style={{...IS,appearance:"auto"}} defaultValue={d.current[k]||""} onChange={e=>{d.current[k]=e.target.value}}>
      {opts.map(o=>Array.isArray(o)?<option key={o[0]} value={o[0]}>{o[1]}</option>:<option key={o}>{o}</option>)}
    </select>
  </div>;
 
  const Fl=({children})=><div style={{display:"flex",gap:10}}>{children}</div>;
  const sources=["Facebook","TikTok","Giới thiệu","Walk-in","Website"];
  const levels=["HSK 1","HSK 2","HSK 3","HSK 4","HSK 5","HSK 6"];
 
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.35)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100}} onClick={onClose}>
      <div style={{background:"#fff",borderRadius:20,padding:30,width:540,maxHeight:"88vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:20}}>
          <h3 style={{fontSize:20,fontWeight:700}}>{isNew?"Thêm":"Sửa"} {{s:"Học viên",l:"Khách tiềm năng",tr:"Học thử",ct:"Hợp đồng",hk:"Thi HSK",r:"Báo cáo buổi học",i:"Ghi nhận tương tác",f:"Học phí"}[type]}</h3>
          <button style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#9ca3af"}} onClick={onClose}>✕</button>
        </div>
 
        {type==="l"&&<><Fl><F label="Họ tên" k="name"/><F label="Số điện thoại" k="phone"/></Fl><Fl><S label="Nguồn" k="source" opts={sources}/><S label="Quan tâm" k="interest" opts={levels.slice(0,5)}/></Fl><S label="Giai đoạn" k="stage" opts={[["inquiry","Hỏi thăm"],["trial","Học thử"],["registered","Đã đăng ký"],["lost","Mất"]]}/><F label="Ghi chú" k="note" type="textarea"/></>}
 
        {type==="s"&&<><Fl><F label="Họ tên" k="name"/><F label="Số điện thoại" k="phone"/></Fl><Fl><S label="Lớp" k="cls" opts={cls2.map(c=>c.id)}/><S label="Trình độ" k="level" opts={levels}/></Fl><Fl><F label="Điểm trung bình" k="score" type="number"/><F label="Chuyên cần (%)" k="attend" type="number"/></Fl><Fl><S label="Nguồn" k="source" opts={sources}/><S label="Trạng thái" k="status" opts={["Đang học","Tạm nghỉ","Nghỉ học"]}/></Fl></>}
 
        {type==="tr"&&<><Fl><F label="Họ tên" k="name"/><F label="Số điện thoại" k="phone"/></Fl><Fl><F label="Ngày" k="date" type="date"/><F label="Giờ" k="time"/></Fl><Fl><S label="Lớp" k="cls" opts={cls2.map(c=>c.id)}/><S label="Giáo viên" k="teacher" opts={teachers}/></Fl><Fl><S label="Trạng thái" k="status" opts={[["scheduled","Đã xếp lịch"],["completed","Đã học"],["no-show","Không đến"]]}/><S label="Kết quả" k="result" opts={[["","Chưa có"],["enrolled","Đã đăng ký"],["thinking","Đang suy nghĩ"],["not-interested","Không quan tâm"]]}/></Fl><F label="Ngày nhắc lại" k="followUp" type="date"/></>}
 
        {type==="ct"&&<><F label="Học viên" k="name"/><Fl><S label="Lớp" k="cls" opts={cls2.map(c=>c.id)}/><S label="Thời hạn" k="duration" opts={["3 tháng","6 tháng","12 tháng","18 tháng"]}/></Fl><Fl><F label="Ngày bắt đầu" k="start" type="date"/><F label="Ngày kết thúc" k="end" type="date"/></Fl><F label="Học phí" k="fee" type="number"/></>}
 
        {type==="hk"&&<><F label="Học viên" k="name"/><Fl><S label="Trình độ" k="level" opts={levels}/><F label="Ngày thi" k="examDate" type="date"/></Fl><Fl><F label="Điểm" k="score" type="number"/><S label="Kết quả" k="passed" opts={[["","Chưa thi"],["yes","ĐẠT"],["no","Chưa đạt"]]}/></Fl></>}
 
        {type==="r"&&<><Fl><F label="Ngày" k="date" type="date"/>
          {isAdmin?<S label="Giáo viên" k="teacher" opts={teachers}/>:<div style={{flex:1,marginBottom:14}}><label style={{display:"block",fontSize:14,color:"#374151",fontWeight:600,marginBottom:5}}>Giáo viên</label><input style={{...IS,background:"#f3f4f6"}} value={userName} disabled/></div>}
          <S label="Lớp" k="cls" opts={cls2.map(c=>c.id)}/></Fl>
          <Fl><F label="Số có mặt" k="present" type="number"/><F label="Số vắng" k="absent" type="number"/></Fl>
          <F label="Tên học viên vắng" k="absentNames"/>
          <F label="📖 Bài học hôm nay" k="lesson" type="textarea"/>
          <F label="📝 Bài tập về nhà" k="homework" type="textarea"/>
          <F label="⚠️ Vấn đề cần chú ý" k="flags" type="textarea"/>
          <F label="⭐ Điểm nổi bật" k="highlights" type="textarea"/>
        </>}
 
        {type==="i"&&<><Fl><F label="Người liên quan" k="refName"/><F label="Ngày" k="date" type="date"/></Fl><Fl><S label="Hình thức" k="type" opts={[["call","📞 Gọi điện"],["message","💬 Tin nhắn"],["meeting","🤝 Gặp mặt"]]}/><F label="Người thực hiện" k="by"/></Fl><F label="Nội dung" k="content" type="textarea"/></>}
 
        {type==="f"&&<><div style={{background:"#f0fdf4",borderRadius:10,padding:14,marginBottom:16,fontSize:15,color:"#16a34a",fontWeight:600,border:"1px solid #bbf7d0"}}>Đợt 1: 50% trước khoá → Đợt 2: 50% sau 1 tháng</div>
          <F label="Họ tên học viên" k="name"/><Fl><S label="Lớp" k="cls" opts={cls2.map(c=>c.id)}/><F label="Tổng học phí" k="total" type="number"/></Fl><Fl><F label="Hạn đóng đợt 2" k="d2d"/><S label="Trạng thái đợt 2" k="st" opts={[["paid","Đã đóng"],["pending","Chờ đóng"],["overdue","Quá hạn"]]}/></Fl></>}
 
        <div style={{display:"flex",gap:10,marginTop:22}}>
          <button style={{flex:1,padding:14,background:"#16a34a",color:"#fff",border:"none",borderRadius:12,fontSize:17,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}} onClick={()=>{
            const data={...d.current};
            if(type==="f"&&data.total){data.d1=Math.round(data.total/2);data.d2=Math.round(data.total/2)}
            if(type==="hk"){data.status=data.passed==="yes"?"passed":data.passed==="no"?"failed":"registered"}
            onSave(data);
          }}>💾 Lưu</button>
          <button style={{padding:"14px 28px",background:"#fff",border:"1.5px solid #d1d5db",borderRadius:12,fontSize:17,color:"#6b7280",cursor:"pointer",fontFamily:"inherit"}} onClick={onClose}>Huỷ</button>
        </div>
      </div>
    </div>
  );
}
 
// ── APP ──
export default function App(){
  const[user,setUser]=useState(null);const[lu,setLu]=useState("");const[lp,setLp]=useState("");const[le,setLe]=useState("");
  const[pg,setPg]=useState("home");
  const[stu,setStu]=useState([]);const[cls2,setCls2]=useState([]);const[fin,setFin]=useState([]);
  const[rpt,setRpt]=useState([]);const[leads,setLeads]=useState([]);const[inter,setInter]=useState([]);
  const[trials,setTrials]=useState([]);const[contracts,setContracts]=useState([]);const[hsk,setHsk]=useState([]);
  const[modal,setModal]=useState(null);const[q,setQ]=useState("");const[dtab,setDtab]=useState("kpi");const[ok,setOk]=useState(false);
 
  useEffect(()=>{(async()=>{
    setStu(await loadT("students"));setCls2(await loadT("classes"));setFin(await loadT("finance"));
    setRpt(await loadT("reports"));setLeads(await loadT("leads"));setInter(await loadT("interactions"));
    setTrials(await loadT("trials"));setContracts(await loadT("contracts"));setHsk(await loadT("hsk_exams"));
    const su=localStorage.getItem("ht_user");if(su)setUser(JSON.parse(su));setOk(true);
  })()},[]);
 
  const tbl={s:"students",l:"leads",tr:"trials",ct:"contracts",hk:"hsk_exams",r:"reports",i:"interactions",f:"finance"};
  const st={s:[stu,setStu],l:[leads,setLeads],tr:[trials,setTrials],ct:[contracts,setContracts],hk:[hsk,setHsk],r:[rpt,setRpt],i:[inter,setInter],f:[fin,setFin]};
  const doSave=async(type,data,isNew)=>{const[arr,setter]=st[type];if(isNew){setter(type==="r"||type==="i"?[data,...arr]:[...arr,data]);await addRow(tbl[type],data)}else{setter(arr.map(x=>x.id===data.id?data:x));await updateRow(tbl[type],data)}};
  const doDel=async(type,id)=>{const[arr,setter]=st[type];setter(arr.filter(x=>x.id!==id));await deleteRow(tbl[type],id)};
 
  const login=()=>{const u=USERS.find(u=>u.user===lu&&u.pass===lp);if(u){setUser(u);localStorage.setItem("ht_user",JSON.stringify(u));setLe("")}else setLe("Sai tài khoản hoặc mật khẩu")};
  const logout=()=>{setUser(null);localStorage.removeItem("ht_user");setPg("home")};
  const isAdmin=user?.role==="admin";
  const canSee=c=>isAdmin||(user?.cls||"").split(",").includes(c);
 
  if(!ok)return<div style={{display:"flex",height:"100vh",alignItems:"center",justifyContent:"center",fontFamily:"system-ui",fontSize:18}}>Đang kết nối...</div>;
 
  if(!user)return(
    <div style={{display:"flex",height:"100vh",alignItems:"center",justifyContent:"center",background:"linear-gradient(135deg,#f0fdf4,#ecfdf5)",fontFamily:"system-ui"}}>
      <div style={{background:"#fff",borderRadius:24,padding:48,width:420,boxShadow:"0 20px 60px rgba(0,0,0,.08)",textAlign:"center"}}>
        <div style={{width:76,height:76,borderRadius:20,background:"#16a34a",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:38,fontWeight:800,margin:"0 auto 18px"}}>漢</div>
        <h2 style={{fontSize:30,fontWeight:800,color:"#15803d",marginBottom:6}}>Hán Tinh Premium</h2>
        <p style={{color:"#9ca3af",fontSize:17,marginBottom:34}}>Hệ thống quản lý trung tâm tiếng Trung</p>
        <input style={{width:"100%",padding:"15px 20px",border:"1.5px solid #e5e7eb",borderRadius:12,fontSize:17,marginBottom:14,outline:"none",fontFamily:"inherit"}} placeholder="Tài khoản" value={lu} onChange={e=>setLu(e.target.value)} onKeyDown={e=>e.key==="Enter"&&login()}/>
        <input style={{width:"100%",padding:"15px 20px",border:"1.5px solid #e5e7eb",borderRadius:12,fontSize:17,marginBottom:14,outline:"none",fontFamily:"inherit"}} placeholder="Mật khẩu" type="password" value={lp} onChange={e=>setLp(e.target.value)} onKeyDown={e=>e.key==="Enter"&&login()}/>
        {le&&<div style={{color:"#dc2626",fontSize:15,marginBottom:10}}>{le}</div>}
        <button onClick={login} style={{width:"100%",padding:16,background:"#16a34a",color:"#fff",border:"none",borderRadius:12,fontSize:18,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Đăng nhập</button>
      </div>
    </div>
  );
 
  const act=stu.filter(s=>s.status==="Đang học"),ov=fin.filter(f=>f.st==="overdue"),pend=fin.filter(f=>f.st==="pending");
  const ranked=[...stu].filter(s=>s.status==="Đang học").sort((a,b)=>b.score-a.score);
  const teachers=[...new Set(cls2.map(c=>c.teacher))];
  const expiring=contracts.filter(c=>{const dl=daysLeft(c.end);return dl>0&&dl<=30});
  const expired=contracts.filter(c=>daysLeft(c.end)<=0&&c.status!=="renewed");
  const upTrials=trials.filter(t=>t.status==="scheduled"),needFU=trials.filter(t=>t.result==="thinking");
  const hskP=hsk.filter(h=>h.passed==="yes").length,hskTt=hsk.filter(h=>h.status!=="registered").length,hskRate=hskTt>0?Math.round(hskP/hskTt*100):0;
  const collected=fin.reduce((a,f)=>a+(f.d1||0)+(f.st==="paid"?(f.d2||0):0),0);
  const srcData=["Facebook","TikTok","Giới thiệu","Walk-in","Website"].map(s=>({name:s,v:[...stu,...leads].filter(x=>x.source===s).length})).filter(d=>d.v>0);
  const funnelData=[{s:"Hỏi thăm",v:leads.filter(l=>l.stage!=="lost").length},{s:"Học thử",v:leads.filter(l=>l.stage==="trial"||l.stage==="registered").length},{s:"Đăng ký",v:leads.filter(l=>l.stage==="registered").length},{s:"Đang học",v:act.length}];
  const payPie=[{n:"Đủ",v:fin.filter(f=>f.st==="paid").length},{n:"Chờ",v:pend.length},{n:"Nợ",v:ov.length}];
  const scoreDist=[{r:"<5",n:stu.filter(s=>s.score<5).length},{r:"5-6.5",n:stu.filter(s=>s.score>=5&&s.score<6.5).length},{r:"6.5-8",n:stu.filter(s=>s.score>=6.5&&s.score<8).length},{r:"8-9",n:stu.filter(s=>s.score>=8&&s.score<9).length},{r:"9+",n:stu.filter(s=>s.score>=9).length}];
 
  const B=(t,c)=>{const m={g:["#dcfce7","#16a34a"],r:["#fef2f2","#dc2626"],y:["#fefce8","#ca8a04"],b:["#eff6ff","#2563eb"],gr:["#f3f4f6","#6b7280"],p:["#f3e8ff","#7c3aed"],o:["#fff7ed","#ea580c"]};const[bg,fg]=m[c]||m.gr;return<span style={{display:"inline-block",padding:"4px 13px",borderRadius:20,fontSize:13,fontWeight:700,background:bg,color:fg}}>{t}</span>};
  const CC=({title,children,h=190})=><div className="cd"><div style={{fontWeight:700,fontSize:16,marginBottom:12}}>{title}</div><ResponsiveContainer width="100%" height={h}>{children}</ResponsiveContainer></div>;
  const om=(t,d,n)=>setModal({t,d,n});
 
  const adminMenu=[{id:"home",l:"Tổng quan",i:"📊"},{id:"leads",l:"Khách tiềm năng",i:"🎯"},{id:"trials",l:"Học thử",i:"📚"},{id:"stu",l:"Học viên",i:"👨‍🎓"},{id:"contracts",l:"Hợp đồng",i:"📄"},{id:"hsk",l:"Thi HSK",i:"🎓"},{id:"rpt",l:"Báo cáo GV",i:"📋"},{id:"log",l:"Lịch sử",i:"💬"},{id:"fin",l:"Tài chính",i:"💰"},{id:"charts",l:"Biểu đồ",i:"📈"}];
  const teacherMenu=[{id:"home",l:"Tổng quan",i:"📊"},{id:"stu",l:"Học viên",i:"👨‍🎓"},{id:"rpt",l:"Báo cáo",i:"📋"},{id:"hsk",l:"Thi HSK",i:"🎓"}];
 
  return(
    <div style={{fontFamily:"system-ui,sans-serif",display:"flex",height:"100vh",background:"#f8faf8",color:"#1a1a1a",overflow:"hidden"}}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:#d1d5db;border-radius:3px}
        .ni{display:flex;align-items:center;gap:9px;padding:11px 14px;border-radius:10px;cursor:pointer;font-size:15px;font-weight:500;color:#6b7280;transition:all .12s}
        .ni:hover{background:#f0fdf4;color:#16a34a}.ni.a{background:linear-gradient(135deg,#16a34a,#15803d);color:#fff;font-weight:700}
        .cd{background:#fff;border-radius:16px;padding:20px;box-shadow:0 1px 4px rgba(0,0,0,.06);border:1px solid #e5e7eb}
        .btn{display:inline-flex;align-items:center;gap:5px;padding:10px 20px;border-radius:10px;border:none;cursor:pointer;font-size:15px;font-weight:600;font-family:inherit}
        .btn-p{background:#16a34a;color:#fff}.btn-p:hover{box-shadow:0 3px 10px rgba(22,163,74,.3)}
        .btn-o{background:#fff;border:1.5px solid #d1d5db;color:#6b7280}.btn-sm{padding:7px 14px;font-size:13px}
        table{width:100%;border-collapse:collapse}
        th{padding:13px 16px;text-align:left;font-size:13px;font-weight:700;color:#9ca3af;text-transform:uppercase;background:#f9fafb;border-bottom:1px solid #e5e7eb}
        td{padding:13px 16px;font-size:15px;border-bottom:1px solid #f3f4f6}tr:hover td{background:#f0fdf4}
        .ib{cursor:pointer;padding:6px 8px;border-radius:8px;border:none;background:none;color:#9ca3af;font-size:16px}.ib:hover{color:#16a34a;background:#f0fdf4}
        .pb{height:8px;background:#f3f4f6;border-radius:4px;overflow:hidden}.pf{height:100%;border-radius:4px}
        .tab{padding:8px 16px;border-radius:8px;cursor:pointer;font-size:14px;font-weight:600;color:#6b7280;border:none;background:none;font-family:inherit}.tab.a{background:#16a34a;color:#fff}
        .al{border-radius:10px;padding:12px;margin-bottom:8px;font-size:14px}
        .fb{height:38px;border-radius:8px;display:flex;align-items:center;padding:0 14px;color:#fff;font-weight:700;font-size:15px;margin-bottom:6px}
      `}</style>
 
      {/* SIDEBAR */}
      <div style={{width:220,background:"#fff",borderRight:"1px solid #e5e7eb",display:"flex",flexDirection:"column",flexShrink:0}}>
        <div style={{padding:"16px 14px",borderBottom:"1px solid #e5e7eb",display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:38,height:38,borderRadius:10,background:"#16a34a",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:20,fontWeight:800}}>漢</div>
          <div><div style={{fontWeight:800,fontSize:17,color:"#15803d"}}>Hán Tinh</div><div style={{fontSize:10,color:"#16a34a",fontWeight:700,letterSpacing:1.5}}>PREMIUM</div></div>
        </div>
        <nav style={{padding:"8px 6px",flex:1}}>{(isAdmin?adminMenu:teacherMenu).map(m=><div key={m.id} className={`ni ${pg===m.id?"a":""}`} onClick={()=>setPg(m.id)}>{m.i} {m.l}</div>)}</nav>
        <div style={{padding:"0 8px 10px"}}>
          {isAdmin&&upTrials.length>0&&<div className="al" style={{background:"#eff6ff",border:"1px solid #bfdbfe",color:"#2563eb",fontWeight:600,cursor:"pointer"}} onClick={()=>setPg("trials")}>📚 {upTrials.length} buổi học thử</div>}
          {isAdmin&&ov.length>0&&<div className="al" style={{background:"#fef2f2",border:"1px solid #fecaca",color:"#dc2626",fontWeight:600,cursor:"pointer"}} onClick={()=>setPg("fin")}>⚠️ {ov.length} nợ học phí</div>}
          <div style={{padding:"10px 8px",borderTop:"1px solid #e5e7eb",marginTop:6}}>
            <div style={{fontSize:15,fontWeight:700}}>{user.name}</div>
            <div style={{fontSize:13,color:"#9ca3af"}}>{isAdmin?"Quản trị viên":"Giáo viên"}</div>
            <button onClick={logout} style={{marginTop:5,fontSize:13,color:"#dc2626",background:"none",border:"none",cursor:"pointer",fontWeight:600}}>Đăng xuất</button>
          </div>
        </div>
      </div>
 
      {/* NỘI DUNG */}
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <div style={{background:"#fff",padding:"10px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid #e5e7eb",flexShrink:0}}>
          <input style={{padding:"10px 16px",border:"1.5px solid #e5e7eb",borderRadius:10,fontSize:15,outline:"none",width:300,fontFamily:"inherit"}} placeholder="🔍 Tìm kiếm..." value={q} onChange={e=>setQ(e.target.value)}/>
          <div style={{fontSize:14,color:"#9ca3af"}}>{user.name} · Trực tuyến</div>
        </div>
 
        <div style={{flex:1,overflow:"auto",padding:20}}>
 
          {/* TỔNG QUAN */}
          {pg==="home"&&<div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <h2 style={{fontSize:24,fontWeight:800}}><span style={{color:"#16a34a"}}>Hán Tinh</span> — Tổng quan</h2>
              {isAdmin&&<div style={{display:"flex",gap:3,background:"#f3f4f6",borderRadius:9,padding:3}}>
                {[["kpi","Chỉ số"],["funnel","Phễu"],["trends","Xu hướng"]].map(([id,l])=><button key={id} className={`tab ${dtab===id?"a":""}`} onClick={()=>setDtab(id)}>{l}</button>)}
              </div>}
            </div>
            <div style={{display:"grid",gridTemplateColumns:isAdmin?"repeat(6,1fr)":"repeat(4,1fr)",gap:10,marginBottom:16}}>
              {(isAdmin?[{l:"Khách mới",v:leads.filter(l=>l.stage!=="lost").length,c:"#2563eb"},{l:"Học viên",v:act.length,c:"#16a34a"},{l:"Tỷ lệ đỗ HSK",v:hskRate+"%",c:"#7c3aed"},{l:"Đã thu",v:vnd(collected),c:"#16a34a"},{l:"Nợ học phí",v:ov.length,c:"#dc2626"},{l:"Cần nhắc",v:needFU.length,c:"#ea580c"}]
              :[{l:"HV lớp tôi",v:stu.filter(s=>canSee(s.cls)).length,c:"#16a34a"},{l:"Báo cáo",v:rpt.filter(r=>r.teacher===user.name).length,c:"#7c3aed"},{l:"Điểm TB",v:(stu.filter(s=>canSee(s.cls)&&s.status==="Đang học").reduce((a,s)=>a+s.score,0)/Math.max(stu.filter(s=>canSee(s.cls)&&s.status==="Đang học").length,1)).toFixed(1),c:"#2563eb"},{l:"Chuyên cần",v:Math.round(stu.filter(s=>canSee(s.cls)&&s.status==="Đang học").reduce((a,s)=>a+s.attend,0)/Math.max(stu.filter(s=>canSee(s.cls)&&s.status==="Đang học").length,1))+"%",c:"#0d9488"}]).map((s,i)=><div key={i} className="cd" style={{textAlign:"center",padding:16}}><div style={{fontSize:28,fontWeight:800,color:s.c}}>{s.v}</div><div style={{fontSize:14,color:"#9ca3af",marginTop:4}}>{s.l}</div></div>)}
            </div>
            {dtab==="kpi"&&isAdmin&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
              <div className="cd"><div style={{fontWeight:700,fontSize:17,color:"#dc2626",marginBottom:12}}>⚠️ Cần thu tiền</div>{ov.map(f=><div key={f.id} style={{padding:"8px 0",borderBottom:"1px solid #f3f4f6",display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><strong style={{fontSize:16}}>{f.name}</strong><br/><span style={{color:"#dc2626",fontSize:15}}>{vnd(f.d2)}</span></div><button className="btn btn-p btn-sm" onClick={()=>{setFin(fin.map(x=>x.id===f.id?{...x,st:"paid"}:x));updateRow("finance",{...f,st:"paid"})}}>✓ Đã thu</button></div>)}{ov.length===0&&<div style={{color:"#16a34a",fontSize:16}}>Tất cả đã đóng đủ ✅</div>}</div>
              <div className="cd"><div style={{fontWeight:700,fontSize:17,color:"#16a34a",marginBottom:12}}>🏆 Xếp hạng</div>{ranked.slice(0,5).map((s,i)=><div key={s.id} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",fontSize:16}}><span>{["🥇","🥈","🥉","4.","5."][i]} {s.name}</span><strong style={{color:"#16a34a"}}>{s.score}</strong></div>)}</div>
              <div className="cd"><div style={{fontWeight:700,fontSize:17,color:"#7c3aed",marginBottom:12}}>📋 Báo cáo mới</div>{rpt.slice(0,4).map(r=><div key={r.id} style={{padding:"7px 0",borderBottom:"1px solid #f3f4f6",fontSize:15}}><strong>{r.teacher}</strong> · {r.cls}<br/><span style={{color:"#9ca3af",fontSize:13}}>{r.date}</span>{r.flags&&<span style={{color:"#dc2626",fontSize:13}}> · ⚠️ {r.flags.slice(0,30)}</span>}</div>)}</div>
            </div>}
            {dtab==="funnel"&&isAdmin&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <div className="cd"><div style={{fontWeight:700,fontSize:17,marginBottom:14}}>🎯 Phễu chuyển đổi</div>{funnelData.map((f,i)=><div key={f.s} className="fb" style={{width:Math.max((f.v/Math.max(funnelData[0].v,1))*100,25)+"%",background:CL[i]}}>{f.s}: {f.v}</div>)}</div>
              <CC title="📊 Nguồn học viên"><PieChart><Pie data={srcData} cx="50%" cy="50%" innerRadius={35} outerRadius={65} dataKey="v" label={({name,v})=>name.slice(0,5)+":"+v} fontSize={12}>{srcData.map((e,i)=><Cell key={i} fill={CL[i]}/>)}</Pie><Tooltip/></PieChart></CC>
            </div>}
            {dtab==="trends"&&isAdmin&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <CC title="📈 Doanh thu theo tháng (triệu)"><BarChart data={monthTrend}><CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/><XAxis dataKey="m" fontSize={13}/><YAxis fontSize={13}/><Tooltip/><Bar dataKey="rev" name="Doanh thu" fill="#16a34a" radius={[4,4,0,0]}/></BarChart></CC>
              <CC title="📊 Chuyên cần theo tuần (%)"><LineChart data={attendTrend}><CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/><XAxis dataKey="w" fontSize={13}/><YAxis domain={[80,100]} fontSize={13}/><Tooltip/><Line type="monotone" dataKey="v" name="Chuyên cần" stroke="#16a34a" strokeWidth={2.5} dot={{fill:"#16a34a",r:4}}/></LineChart></CC>
            </div>}
          </div>}
 
          {/* KHÁCH TIỀM NĂNG */}
          {pg==="leads"&&isAdmin&&<div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}><h2 style={{fontSize:24,fontWeight:800}}>🎯 Khách tiềm năng</h2><button className="btn btn-p" onClick={()=>om("l",{id:"LD"+Date.now(),name:"",phone:"",source:"Facebook",stage:"inquiry",interest:"HSK 1",note:"",created:today,lastContact:today},1)}>+ Thêm mới</button></div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
              {[{s:"inquiry",l:"Hỏi thăm",c:"#2563eb"},{s:"trial",l:"Học thử",c:"#ea580c"},{s:"registered",l:"Đã đăng ký",c:"#16a34a"},{s:"lost",l:"Mất",c:"#6b7280"}].map(p=><div key={p.s} style={{textAlign:"center",padding:14,borderRadius:12,background:"#f9fafb",fontWeight:700,color:p.c}}><div style={{fontSize:30}}>{leads.filter(l=>l.stage===p.s).length}</div><div style={{fontSize:14}}>{p.l}</div></div>)}
            </div>
            <div className="cd" style={{padding:0}}><table><thead><tr>{["Họ tên","SĐT","Nguồn","Quan tâm","Giai đoạn",""].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{leads.map(l=><tr key={l.id}><td style={{fontWeight:600}}>{l.name}</td><td>{l.phone}</td><td>{B(l.source,{Facebook:"b",TikTok:"p","Giới thiệu":"g","Walk-in":"o",Website:"y"}[l.source]||"gr")}</td><td>{B(l.interest,"b")}</td><td>{{inquiry:B("Hỏi thăm","b"),trial:B("Học thử","o"),registered:B("Đã ĐK","g"),lost:B("Mất","gr")}[l.stage]}</td>
              <td><div style={{display:"flex",gap:4}}>
                {l.stage==="inquiry"&&<button className="btn btn-sm" style={{background:"#fff7ed",color:"#ea580c",border:"none"}} onClick={()=>{setLeads(leads.map(x=>x.id===l.id?{...x,stage:"trial"}:x));updateRow("leads",{...l,stage:"trial"})}}>→ Học thử</button>}
                {l.stage==="trial"&&<button className="btn btn-sm btn-p" onClick={()=>{setLeads(leads.map(x=>x.id===l.id?{...x,stage:"registered"}:x));updateRow("leads",{...l,stage:"registered"})}}>→ Đăng ký</button>}
                <button className="ib" onClick={()=>om("l",{...l},0)}>✏️</button>
                <button className="ib" style={{color:"#dc2626"}} onClick={()=>{if(confirm("Xoá?"))doDel("l",l.id)}}>🗑️</button>
              </div></td></tr>)}</tbody></table></div>
          </div>}
 
          {/* HỌC THỬ */}
          {pg==="trials"&&isAdmin&&<div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}><h2 style={{fontSize:24,fontWeight:800}}>📚 Quản lý học thử</h2><button className="btn btn-p" onClick={()=>om("tr",{id:"TL"+Date.now(),name:"",phone:"",source:"Facebook",date:today,time:"18:00",cls:cls2[0]?.id||"",teacher:teachers[0]||"",status:"scheduled",result:"",followUp:"",note:""},1)}>+ Xếp lịch</button></div>
            {needFU.length>0&&<div className="al" style={{background:"#fff7ed",border:"1px solid #fed7aa",color:"#ea580c",fontWeight:600}}>🔔 Cần nhắc lại: {needFU.map(t=>t.name).join(", ")}</div>}
            <div className="cd" style={{padding:0}}><table><thead><tr>{["Họ tên","Ngày giờ","Lớp","Trạng thái","Kết quả","Nhắc lại",""].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{trials.map(t=><tr key={t.id}><td><div style={{fontWeight:600}}>{t.name}</div><div style={{color:"#9ca3af",fontSize:13}}>{t.source}</div></td><td>{t.date} {t.time}</td><td>{t.cls}</td>
              <td>{{scheduled:B("Đã xếp","b"),completed:B("Đã học","g"),"no-show":B("Không đến","r")}[t.status]||B(t.status,"gr")}</td>
              <td>{t.result?{enrolled:B("Đã ĐK","g"),thinking:B("Suy nghĩ","y"),"not-interested":B("Không QT","gr")}[t.result]||"—":"—"}</td>
              <td style={{color:t.followUp&&daysLeft(t.followUp)<=1?"#dc2626":"#9ca3af"}}>{t.followUp||"—"}</td>
              <td><div style={{display:"flex",gap:4}}>{t.status==="scheduled"&&<button className="btn btn-sm btn-p" onClick={()=>{setTrials(trials.map(x=>x.id===t.id?{...x,status:"completed"}:x));updateRow("trials",{...t,status:"completed"})}}>✓ Xong</button>}<button className="ib" onClick={()=>om("tr",{...t},0)}>✏️</button></div></td></tr>)}</tbody></table></div>
          </div>}
 
          {/* HỌC VIÊN */}
          {pg==="stu"&&<div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}><h2 style={{fontSize:24,fontWeight:800}}>👨‍🎓 Học viên ({stu.filter(s=>canSee(s.cls)).length})</h2>{isAdmin&&<button className="btn btn-p" onClick={()=>om("s",{id:"HV"+Date.now(),name:"",phone:"",cls:cls2[0]?.id||"",level:"HSK 1",status:"Đang học",score:0,attend:90,source:"Facebook"},1)}>+ Thêm học viên</button>}</div>
            <div className="cd" style={{padding:0}}><table><thead><tr>{["STT","Học viên","Trình độ","Lớp","Điểm","Chuyên cần","Nguồn","Trạng thái",...(isAdmin?[""]:[])] .map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{stu.filter(s=>(!q||s.name.toLowerCase().includes(q.toLowerCase()))&&canSee(s.cls)).map((s,i)=><tr key={s.id}><td style={{color:"#9ca3af"}}>{i+1}</td><td><div style={{fontWeight:600}}>{s.name}</div><div style={{color:"#9ca3af",fontSize:13}}>{s.phone}</div></td><td>{B(s.level,"b")}</td><td>{s.cls}</td><td style={{fontWeight:800,color:s.score>=8?"#16a34a":s.score>=6.5?"#ca8a04":"#dc2626",fontSize:18}}>{s.score}</td><td style={{color:s.attend>=90?"#16a34a":"#ca8a04"}}>{s.attend}%</td><td>{B(s.source,"gr")}</td><td>{B(s.status,s.status==="Đang học"?"g":s.status==="Tạm nghỉ"?"y":"gr")}</td>
              {isAdmin&&<td><button className="ib" onClick={()=>om("s",{...s},0)}>✏️</button><button className="ib" style={{color:"#dc2626"}} onClick={()=>{if(confirm("Xoá?"))doDel("s",s.id)}}>🗑️</button></td>}</tr>)}</tbody></table></div>
          </div>}
 
          {/* HỢP ĐỒNG */}
          {pg==="contracts"&&isAdmin&&<div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}><h2 style={{fontSize:24,fontWeight:800}}>📄 Hợp đồng & Gia hạn</h2><button className="btn btn-p" onClick={()=>om("ct",{id:"HD"+Date.now(),name:"",cls:cls2[0]?.id||"",start:today,end:"",duration:"6 tháng",fee:0,status:"active",note:""},1)}>+ Tạo hợp đồng</button></div>
            <div className="cd" style={{padding:0}}><table><thead><tr>{["Học viên","Lớp","Bắt đầu","Kết thúc","Học phí","Trạng thái","Còn lại",""].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{contracts.map(c=>{const dl=daysLeft(c.end);const rs=c.status==="renewed"?"renewed":dl<=0?"expired":dl<=30?"expiring":"active";return<tr key={c.id}><td style={{fontWeight:600}}>{c.name}</td><td>{B(c.cls,"b")}</td><td>{c.start}</td><td>{c.end}</td><td style={{fontWeight:700,color:"#16a34a"}}>{vnd(c.fee)}</td><td>{{active:B("Hiệu lực","g"),expiring:B("Sắp hết","y"),expired:B("Hết hạn","r"),renewed:B("Đã gia hạn","b")}[rs]}</td><td style={{fontWeight:700,color:dl<=0?"#dc2626":dl<=30?"#ca8a04":"#16a34a"}}>{dl<=0?"Hết hạn":dl+" ngày"}</td>
              <td><div style={{display:"flex",gap:4}}>{(rs==="expiring"||rs==="expired")&&<button className="btn btn-sm btn-p" onClick={()=>{const nc={...c,status:"renewed"};setContracts(contracts.map(x=>x.id===c.id?nc:x));updateRow("contracts",nc)}}>↻ Gia hạn</button>}<button className="ib" onClick={()=>om("ct",{...c},0)}>✏️</button></div></td></tr>})}</tbody></table></div>
          </div>}
 
          {/* THI HSK */}
          {pg==="hsk"&&<div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}><h2 style={{fontSize:24,fontWeight:800}}>🎓 Theo dõi thi HSK</h2>{isAdmin&&<button className="btn btn-p" onClick={()=>om("hk",{id:"HSK"+Date.now(),name:"",level:"HSK 1",examDate:"",score:0,passed:"",status:"registered"},1)}>+ Đăng ký thi</button>}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
              <CC title="Kết quả theo trình độ"><BarChart data={["HSK 1","HSK 2","HSK 3","HSK 4","HSK 5"].map(l=>({l,p:hsk.filter(h=>h.level===l&&h.passed==="yes").length,f:hsk.filter(h=>h.level===l&&h.passed==="no").length}))}><XAxis dataKey="l" fontSize={12}/><YAxis fontSize={12}/><Tooltip/><Bar dataKey="p" name="Đạt" fill="#16a34a" stackId="a" radius={[4,4,0,0]}/><Bar dataKey="f" name="Chưa đạt" fill="#dc2626" stackId="a" radius={[4,4,0,0]}/></BarChart></CC>
              <div className="cd" style={{textAlign:"center"}}><div style={{fontSize:18,fontWeight:700,marginBottom:12}}>Tỷ lệ đỗ tổng thể</div><div style={{fontSize:56,fontWeight:800,color:hskRate>=70?"#16a34a":"#ca8a04"}}>{hskRate}%</div><div style={{fontSize:16,color:"#9ca3af"}}>{hskP}/{hskTt} đạt</div><div className="pb" style={{marginTop:12}}><div className="pf" style={{width:hskRate+"%",background:hskRate>=70?"#16a34a":"#ca8a04"}}/></div></div>
            </div>
            <div className="cd" style={{padding:0}}><table><thead><tr>{["Học viên","Trình độ","Ngày thi","Điểm","Kết quả",...(isAdmin?[""]:[])] .map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{hsk.map(h=><tr key={h.id}><td style={{fontWeight:600}}>{h.name}</td><td>{B(h.level,"p")}</td><td>{h.examDate}</td><td style={{fontWeight:700,fontSize:18}}>{h.score||"—"}</td><td>{h.passed==="yes"?B("ĐẠT","g"):h.passed==="no"?B("Chưa đạt","r"):B("Chưa thi","b")}</td>{isAdmin&&<td><button className="ib" onClick={()=>om("hk",{...h},0)}>✏️</button></td>}</tr>)}</tbody></table></div>
          </div>}
 
          {/* BÁO CÁO GV */}
          {pg==="rpt"&&<div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}><h2 style={{fontSize:24,fontWeight:800}}>📋 Báo cáo buổi học</h2><button className="btn btn-p" onClick={()=>om("r",{id:"RP"+Date.now(),date:today,teacher:isAdmin?(teachers[0]||""):user.name,cls:cls2[0]?.id||"",present:0,absent:0,absentNames:"",lesson:"",homework:"",flags:"",highlights:""},1)}>+ Tạo báo cáo</button></div>
            {rpt.filter(r=>isAdmin||r.teacher===user.name).map(r=><div key={r.id} style={{border:"1px solid #e5e7eb",borderRadius:14,padding:18,marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}><div><strong style={{fontSize:17}}>{r.teacher}</strong> <span style={{color:"#9ca3af",fontSize:15}}>{r.cls} · {r.date}</span></div><div style={{display:"flex",alignItems:"center",gap:8}}>{B(r.present+"/"+(r.present+r.absent)+" có mặt",r.absent===0?"g":"y")}{(isAdmin||r.teacher===user.name)&&<button className="ib" onClick={()=>om("r",{...r},0)}>✏️</button>}</div></div>
              <div style={{fontSize:16}}>📖 {r.lesson}</div>
              {r.homework&&<div style={{fontSize:15,color:"#6b7280",marginTop:4}}>📝 BTVN: {r.homework}</div>}
              {r.flags&&<div style={{background:"#fef2f2",borderRadius:8,padding:"8px 14px",marginTop:8,fontSize:15,color:"#dc2626"}}>⚠️ {r.flags}</div>}
              {r.highlights&&<div style={{background:"#f0fdf4",borderRadius:8,padding:"8px 14px",marginTop:8,fontSize:15,color:"#16a34a"}}>⭐ {r.highlights}</div>}
            </div>)}
          </div>}
 
          {/* LỊCH SỬ */}
          {pg==="log"&&isAdmin&&<div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}><h2 style={{fontSize:24,fontWeight:800}}>💬 Lịch sử tương tác</h2><button className="btn btn-p" onClick={()=>om("i",{id:"IT"+Date.now(),ref:"",refName:"",date:today,type:"call",content:"",by:"Admin"},1)}>+ Ghi nhận</button></div>
            {inter.map(it=><div key={it.id} style={{display:"flex",gap:14,padding:"14px 0",borderBottom:"1px solid #f3f4f6"}}><div style={{width:12,height:12,borderRadius:"50%",background:it.type==="call"?"#16a34a":it.type==="message"?"#2563eb":"#ea580c",marginTop:6,flexShrink:0}}/><div><div style={{fontSize:16}}><strong>{it.refName}</strong> <span style={{color:"#9ca3af",fontSize:14}}>{it.date}</span> {B(it.type==="call"?"📞 Gọi điện":it.type==="message"?"💬 Tin nhắn":"🤝 Gặp mặt",it.type==="call"?"g":it.type==="message"?"b":"o")}</div><div style={{fontSize:16,color:"#374151",marginTop:4}}>{it.content}</div></div></div>)}
          </div>}
 
          {/* TÀI CHÍNH */}
          {pg==="fin"&&isAdmin&&<div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}><h2 style={{fontSize:24,fontWeight:800}}>💰 Tài chính — Thanh toán 50/50</h2><button className="btn btn-p" onClick={()=>om("f",{id:"HP"+Date.now(),name:"",cls:cls2[0]?.id||"",total:0,d1:0,d2:0,d2d:"",st:"pending"},1)}>+ Thêm</button></div>
            <div className="cd" style={{padding:0}}><table><thead><tr>{["Học viên","Lớp","Tổng phí","Đợt 1","Đợt 2","Hạn đợt 2","Trạng thái",""].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{fin.map(f=><tr key={f.id}><td style={{fontWeight:600}}>{f.name}</td><td>{B(f.cls,"b")}</td><td style={{fontWeight:700,color:"#16a34a"}}>{vnd(f.total)}</td><td>{vnd(f.d1)}</td><td style={{fontWeight:600}}>{vnd(f.d2)}</td><td style={{color:f.st==="overdue"?"#dc2626":"#9ca3af"}}>{f.d2d}</td><td>{f.st==="paid"?B("Đã đóng","g"):f.st==="pending"?B("Chờ đóng","y"):B("Quá hạn","r")}</td>
              <td><div style={{display:"flex",gap:4}}>{f.st!=="paid"&&<button className="btn btn-p btn-sm" onClick={()=>{setFin(fin.map(x=>x.id===f.id?{...x,st:"paid"}:x));updateRow("finance",{...f,st:"paid"})}}>✓ Đã thu</button>}<button className="ib" onClick={()=>om("f",{...f},0)}>✏️</button></div></td></tr>)}</tbody></table></div>
          </div>}
 
          {/* BIỂU ĐỒ */}
          {pg==="charts"&&isAdmin&&<div>
            <h2 style={{fontSize:24,fontWeight:800,marginBottom:14}}>📈 Biểu đồ tổng hợp</h2>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <CC title="📊 Doanh thu theo tháng (triệu đồng)"><BarChart data={monthTrend}><CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/><XAxis dataKey="m" fontSize={13}/><YAxis fontSize={13}/><Tooltip/><Bar dataKey="rev" name="Doanh thu" fill="#16a34a" radius={[4,4,0,0]}/></BarChart></CC>
              <CC title="📊 Chuyên cần theo tuần (%)"><LineChart data={attendTrend}><CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/><XAxis dataKey="w" fontSize={13}/><YAxis domain={[80,100]} fontSize={13}/><Tooltip/><Line type="monotone" dataKey="v" name="Chuyên cần" stroke="#16a34a" strokeWidth={2.5} dot={{fill:"#16a34a",r:4}}/></LineChart></CC>
              <CC title="💳 Tình hình thanh toán"><PieChart><Pie data={payPie} cx="50%" cy="50%" innerRadius={35} outerRadius={65} dataKey="v" label={({n,v})=>n+": "+v} fontSize={13}>{payPie.map((e,i)=><Cell key={i} fill={[CL[0],CL[3],CL[4]][i]}/>)}</Pie><Tooltip/></PieChart></CC>
              <CC title="🎯 Phân bố điểm số"><BarChart data={scoreDist}><CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/><XAxis dataKey="r" fontSize={13}/><YAxis fontSize={13}/><Tooltip/><Bar dataKey="n" name="Số HV" fill="#0d9488" radius={[4,4,0,0]}/></BarChart></CC>
            </div>
          </div>}
        </div>
      </div>
 
      {/* MODAL */}
      {modal&&<ModalForm type={modal.t} initial={modal.d} isNew={modal.n} cls2={cls2} teachers={teachers} isAdmin={isAdmin} userName={user.name}
        onSave={async d=>{await doSave(modal.t,d,modal.n);setModal(null)}} onClose={()=>setModal(null)}/>}
    </div>
  );
}
