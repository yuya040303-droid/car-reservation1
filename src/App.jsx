import { useState } from "react";
const CARS = [
  { id: 1, name: "社用車 A", plate: "品川 300 あ 1234", color: "#E74C3C", icon: "🚗" },
  { id: 2, name: "社用車 B", plate: "品川 300 い 5678", color: "#2980B9", icon: "🚙" },
  { id: 3, name: "社用車 C", plate: "品川 300 う 9012", color: "#27AE60", icon: "🚘" },
];
const USERS = ["田中 太郎","鈴木 花子","佐藤 健","高橋 美咲","伊藤 浩","渡辺 由美","山本 翔","中村 彩","小林 大輔","加藤 未来"];
const TIME_SLOTS = ["08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30","12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30","17:00","17:30","18:00","18:30","19:00"];
const today = () => new Date().toISOString().split("T")[0];
const formatDate = (d) => { const dt = new Date(d+"T00:00:00"); const days=["日","月","火","水","木","金","土"]; return `${dt.getMonth()+1}/${dt.getDate()}(${days[dt.getDay()]})`; };
const getWeekDates = (base) => { const d=new Date(base+"T00:00:00"); const day=d.getDay(); const mon=new Date(d); mon.setDate(d.getDate()-(day===0?6:day-1)); return Array.from({length:7},(_,i)=>{ const dd=new Date(mon); dd.setDate(mon.getDate()+i); return dd.toISOString().split("T")[0]; }); };
const navBtn={background:"#fff",border:"1px solid #E2E8F0",borderRadius:8,padding:"6px 14px",cursor:"pointer",fontSize:16,color:"#4A5568"};
const cardStyle={background:"#fff",borderRadius:14,padding:"14px",marginBottom:10,boxShadow:"0 2px 10px rgba(0,0,0,0.06)"};
const labelStyle={display:"block",fontSize:12,color:"#718096",marginBottom:5,fontWeight:600};
const inputStyle={width:"100%",padding:"10px 12px",borderRadius:9,border:"1px solid #E2E8F0",fontSize:14,background:"#F7FAFC",outline:"none",color:"#2D3748"};
const overlay={position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:150};
const modal={background:"#fff",borderRadius:"20px 20px 0 0",padding:20,width:"100%",maxWidth:480,maxHeight:"80vh",overflowY:"auto"};
export default function App() {
  const [view,setView]=useState("calendar");
  const [currentUser,setCurrentUser]=useState(USERS[0]);
  const [reservations,setReservations]=useState([]);
  const [selectedDate,setSelectedDate]=useState(today());
  const [weekOffset,setWeekOffset]=useState(0);
  const [form,setForm]=useState({carId:1,date:today(),startTime:"09:00",endTime:"10:00",destination:"",purpose:""});
  const [toast,setToast]=useState(null);
  const [confirmDelete,setConfirmDelete]=useState(null);
  const [loginOpen,setLoginOpen]=useState(false);
  const weekBase=(()=>{ const d=new Date(today()+"T00:00:00"); d.setDate(d.getDate()+weekOffset*7); return d.toISOString().split("T")[0]; })();
  const weekDates=getWeekDates(weekBase);
  const showToast=(msg,type="success")=>{ setToast({msg,type}); setTimeout(()=>setToast(null),2800); };
  const isConflict=(carId,date,start,end,excludeId=null)=>reservations.some(r=>r.id!==excludeId&&r.carId===carId&&r.date===date&&r.startTime<end&&r.endTime>start);
  const handleReserve=()=>{ if(!form.destination.trim()){showToast("行先を入力してください","error");return;} if(form.startTime>=form.endTime){showToast("終了時刻は開始より後にしてください","error");return;} if(form.date<today()){showToast("過去の日付には予約できません","error");return;} if(isConflict(form.carId,form.date,form.startTime,form.endTime)){showToast("その時間帯はすでに予約されています","error");return;} setReservations(prev=>[...prev,{id:Date.now(),...form,user:currentUser,createdAt:new Date().toISOString()}]); showToast("予約が完了しました！"); setView("myBookings"); };
  const handleDelete=(id)=>{ setReservations(prev=>prev.filter(r=>r.id!==id)); setConfirmDelete(null); showToast("予約を取り消しました","info"); };
  const myReservations=reservations.filter(r=>r.user===currentUser).sort((a,b)=>a.date.localeCompare(b.date)||a.startTime.localeCompare(b.startTime));
  const getCarStatus=(carId,date)=>{ const now=new Date(); const nowStr=`${now.getHours().toString().padStart(2,"0")}:${now.getMinutes().toString().padStart(2,"0")}`; const t=today(); return reservations.find(r=>r.carId===carId&&r.date===date&&(date>t||(date===t&&r.startTime<=nowStr&&r.endTime>nowStr))); };
  return (
    <div style={{minHeight:"100vh",background:"#F0F4F8",fontFamily:"'Noto Sans JP','Hiragino Sans',sans-serif",maxWidth:480,margin:"0 auto"}}>
      <div style={{background:"linear-gradient(135deg,#1A2980 0%,#26D0CE 100%)",padding:"16px 18px 12px",color:"#fff",position:"sticky",top:0,zIndex:100,boxShadow:"0 2px 12px rgba(0,0,0,0.18)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div><div style={{fontSize:18,fontWeight:700}}>🚗 社用車予約</div><div style={{fontSize:11,opacity:0.85}}>3台 ／ 営業部10名</div></div>
          <button onClick={()=>setLoginOpen(true)} style={{background:"rgba(255,255,255,0.2)",border:"1px solid rgba(255,255,255,0.4)",borderRadius:20,padding:"5px 12px",color:"#fff",fontSize:12,cursor:"pointer"}}>👤 {currentUser.split(" ")[0]}</button>
        </div>
      </div>
      <div style={{display:"flex",background:"#fff",borderBottom:"1px solid #E2E8F0",position:"sticky",top:68,zIndex:99}}>
        {[{key:"calendar",label:"📅 カレンダー"},{key:"reserve",label:"＋ 予約"},{key:"myBookings",label:"📋 マイ予約"},{key:"admin",label:"⚙ 管理"}].map(tab=>(
          <button key={tab.key} onClick={()=>setView(tab.key)} style={{flex:1,padding:"10px 0",fontSize:11,fontWeight:view===tab.key?700:400,color:view===tab.key?"#1A2980":"#718096",background:"none",border:"none",cursor:"pointer",borderBottom:view===tab.key?"2px solid #1A2980":"2px solid transparent"}}>{tab.label}</button>
        ))}
      </div>
      <div style={{padding:"14px 14px 80px"}}>
        {view==="calendar"&&(
          <div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
              <button onClick={()=>setWeekOffset(w=>w-1)} style={navBtn}>◀</button>
              <span style={{fontWeight:700,fontSize:14}}>{formatDate(weekDates[0])} 〜 {formatDate(weekDates[6])}</span>
              <button onClick={()=>setWeekOffset(w=>w+1)} style={navBtn}>▶</button>
            </div>
            <div style={{display:"flex",gap:4,marginBottom:14,overflowX:"auto",paddingBottom:4}}>
              {weekDates.map(d=>{ const isSel=d===selectedDate; const isT=d===today(); return(
                <button key={d} onClick={()=>setSelectedDate(d)} style={{minWidth:46,padding:"7px 4px",borderRadius:10,border:"none",background:isSel?"#1A2980":isT?"#EBF4FF":"#fff",color:isSel?"#fff":isT?"#1A2980":"#4A5568",fontWeight:isSel||isT?700:400,fontSize:12,cursor:"pointer",flex:"0 0 auto"}}>
                  {formatDate(d).split("(")[0]}<br/><span style={{fontSize:10}}>({formatDate(d).split("(")[1]}</span>
                </button>
              );})}
            </div>
            {CARS.map(car=>{ const active=getCarStatus(car.id,selectedDate); const dayRes=reservations.filter(r=>r.carId===car.id&&r.date===selectedDate).sort((a,b)=>a.startTime.localeCompare(b.startTime)); return(
              <div key={car.id} style={{background:"#fff",borderRadius:14,marginBottom:10,overflow:"hidden",boxShadow:"0 2px 10px rgba(0,0,0,0.07)",borderLeft:`4px solid ${car.color}`}}>
                <div style={{display:"flex",alignItems:"center",padding:"12px 14px 8px"}}>
                  <span style={{fontSize:22,marginRight:10}}>{car.icon}</span>
                  <div style={{flex:1}}><div style={{fontWeight:700,fontSize:14}}>{car.name}</div><div style={{fontSize:11,color:"#718096"}}>{car.plate}</div></div>
                  <span style={{fontSize:11,padding:"3px 10px",borderRadius:20,fontWeight:600,background:active?"#FFF0F0":"#F0FFF4",color:active?"#C53030":"#276749"}}>{active?"使用中":"空き"}</span>
                </div>
                {dayRes.length>0?<div style={{padding:"0 14px 12px"}}>{dayRes.map(r=><div key={r.id} style={{fontSize:12,padding:"6px 10px",borderRadius:8,background:"#F7FAFC",marginBottom:4,display:"flex",justifyContent:"space-between"}}><span>🕐 {r.startTime}〜{r.endTime}</span><span>📍{r.destination}</span><span style={{color:"#718096"}}>{r.user.split(" ")[0]}</span></div>)}</div>:<div style={{fontSize:12,color:"#A0AEC0",padding:"0 14px 12px"}}>予約なし</div>}
              </div>
            );})}
          </div>
        )}
        {view==="reserve"&&(
          <div>
            <div style={cardStyle}>
              <div style={{fontWeight:700,fontSize:14,marginBottom:10}}>🚗 車両を選択</div>
              <div style={{display:"flex",gap:8}}>
                {CARS.map(c=><button key={c.id} onClick={()=>setForm(f=>({...f,carId:c.id}))} style={{flex:1,padding:"10px 4px",borderRadius:10,border:`2px solid ${form.carId===c.id?c.color:"#E2E8F0"}`,background:form.carId===c.id?c.color+"15":"#fff",cursor:"pointer"}}><div style={{fontSize:20}}>{c.icon}</div><div style={{fontSize:11,fontWeight:700,color:form.carId===c.id?c.color:"#4A5568"}}>{c.name}</div></button>)}
              </div>
            </div>
            <div style={cardStyle}>
              <div style={{fontWeight:700,fontSize:14,marginBottom:10}}>📅 日時を選択</div>
              <label style={labelStyle}>日付</label>
              <input type="date" value={form.date} min={today()} onChange={e=>setForm(f=>({...f,date:e.target.value}))} style={inputStyle}/>
              <div style={{display:"flex",gap:10,marginTop:10}}>
                <div style={{flex:1}}><label style={labelStyle}>開始時刻</label><select value={form.startTime} onChange={e=>setForm(f=>({...f,startTime:e.target.value}))} style={inputStyle}>{TIME_SLOTS.map(t=><option key={t}>{t}</option>)}</select></div>
                <div style={{flex:1}}><label style={labelStyle}>終了時刻</label><select value={form.endTime} onChange={e=>setForm(f=>({...f,endTime:e.target.value}))} style={inputStyle}>{TIME_SLOTS.map(t=><option key={t}>{t}</option>)}</select></div>
              </div>
              {isConflict(form.carId,form.date,form.startTime,form.endTime)&&<div style={{marginTop:8,padding:"8px 12px",background:"#FFF0F0",borderRadius:8,fontSize:12,color:"#C53030"}}>⚠ この時間帯は予約済みです</div>}
            </div>
            <div style={cardStyle}>
              <div style={{fontWeight:700,fontSize:14,marginBottom:10}}>📝 詳細</div>
              <label style={labelStyle}>行先 *</label>
              <input type="text" placeholder="例：渋谷区〇〇様事務所" value={form.destination} onChange={e=>setForm(f=>({...f,destination:e.target.value}))} style={inputStyle}/>
              <label style={{...labelStyle,marginTop:10}}>目的（任意）</label>
              <input type="text" placeholder="例：商談、納品" value={form.purpose} onChange={e=>setForm(f=>({...f,purpose:e.target.value}))} style={inputStyle}/>
            </div>
            <div style={{...cardStyle,background:"#F0F4FF",border:"1px solid #C3D0F0"}}>
              <div style={{fontSize:13,fontWeight:700,color:"#1A2980",marginBottom:8}}>予約内容の確認</div>
              <div style={{fontSize:13,lineHeight:1.9,color:"#2D3748"}}>
                <div>🚗 {CARS.find(c=>c.id===form.carId)?.name}</div>
                <div>📅 {formatDate(form.date)} {form.startTime}〜{form.endTime}</div>
                <div>📍 {form.destination||"—"}</div>
                <div>👤 {currentUser}</div>
              </div>
            </div>
            <button onClick={handleReserve} style={{width:"100%",padding:"15px",borderRadius:12,border:"none",background:"linear-gradient(135deg,#1A2980,#26D0CE)",color:"#fff",fontSize:16,fontWeight:700,cursor:"pointer",marginTop:4,boxShadow:"0 4px 15px rgba(26,41,128,0.4)"}}>予約を確定する</button>
          </div>
        )}
        {view==="myBookings"&&(
          <div>
            <div style={{fontWeight:700,fontSize:14,marginBottom:12}}>{currentUser} の予約一覧 ({myReservations.length}件)</div>
            {myReservations.length===0?<div style={{textAlign:"center",padding:40,color:"#A0AEC0"}}><div style={{fontSize:40}}>📭</div><div style={{fontSize:14,marginTop:8}}>予約がありません</div></div>:myReservations.map(r=>{ const c=CARS.find(car=>car.id===r.carId); const isPast=r.date<today()||(r.date===today()&&r.endTime<new Date().toTimeString().slice(0,5)); return(
              <div key={r.id} style={{...cardStyle,opacity:isPast?0.6:1,borderLeft:`4px solid ${c.color}`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                  <div><div style={{fontWeight:700,fontSize:14,marginBottom:4}}>{c.icon} {c.name}</div><div style={{fontSize:13,color:"#4A5568",lineHeight:1.7}}><div>📅 {formatDate(r.date)} {r.startTime}〜{r.endTime}</div><div>📍 {r.destination}</div>{r.purpose&&<div>🗒 {r.purpose}</div>}</div></div>
                  {!isPast&&<button onClick={()=>setConfirmDelete(r.id)} style={{background:"#FFF0F0",border:"1px solid #FEB2B2",borderRadius:8,color:"#C53030",padding:"5px 10px",fontSize:12,cursor:"pointer"}}>取消</button>}
                </div>
                {isPast&&<div style={{fontSize:11,color:"#A0AEC0",marginTop:6}}>✓ 完了</div>}
              </div>
            );})}
          </div>
        )}
        {view==="admin"&&(
          <div>
            <div style={{fontWeight:700,fontSize:14,marginBottom:12}}>全予約管理 ({reservations.length}件)</div>
            <div style={{display:"flex",gap:8,marginBottom:14}}>
              {CARS.map(c=>{ const count=reservations.filter(r=>r.carId===c.id&&r.date>=today()).length; return(<div key={c.id} style={{flex:1,background:"#fff",borderRadius:12,padding:"12px 8px",textAlign:"center",boxShadow:"0 2px 8px rgba(0,0,0,0.07)",borderTop:`3px solid ${c.color}`}}><div style={{fontSize:22}}>{c.icon}</div><div style={{fontSize:11,fontWeight:700}}>{c.name}</div><div style={{fontSize:18,fontWeight:800,color:c.color}}>{count}</div><div style={{fontSize:10,color:"#A0AEC0"}}>今後の予約</div></div>);})}
            </div>
            {reservations.length===0?<div style={{textAlign:"center",padding:40,color:"#A0AEC0"}}><div style={{fontSize:40}}>📋</div><div style={{fontSize:14,marginTop:8}}>予約データなし</div></div>:[...reservations].sort((a,b)=>a.date.localeCompare(b.date)||a.startTime.localeCompare(b.startTime)).map(r=>{ const c=CARS.find(car=>car.id===r.carId); return(<div key={r.id} style={{...cardStyle,borderLeft:`4px solid ${c.color}`}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}><div><div style={{fontWeight:700,fontSize:13}}>{c.icon} {c.name}</div><div style={{fontSize:12,color:"#4A5568",lineHeight:1.7,marginTop:2}}><div>📅 {formatDate(r.date)} {r.startTime}〜{r.endTime}</div><div>👤 {r.user} ／ 📍 {r.destination}</div>{r.purpose&&<div>🗒 {r.purpose}</div>}</div></div><button onClick={()=>setConfirmDelete(r.id)} style={{background:"#FFF0F0",border:"1px solid #FEB2B2",borderRadius:8,color:"#C53030",padding:"5px 10px",fontSize:11,cursor:"pointer"}}>削除</button></div></div>);})}
          </div>
        )}
      </div>
      {loginOpen&&(<div style={overlay} onClick={()=>setLoginOpen(false)}><div style={modal} onClick={e=>e.stopPropagation()}><div style={{fontWeight:700,fontSize:16,marginBottom:14}}>👤 ユーザー切替</div>{USERS.map(u=><button key={u} onClick={()=>{setCurrentUser(u);setLoginOpen(false);}} style={{width:"100%",padding:"11px 14px",marginBottom:6,borderRadius:10,border:`2px solid ${u===currentUser?"#1A2980":"#E2E8F0"}`,background:u===currentUser?"#EBF4FF":"#fff",color:u===currentUser?"#1A2980":"#2D3748",fontWeight:u===currentUser?700:400,cursor:"pointer",textAlign:"left",fontSize:14}}>{u===currentUser?"✓ ":""}{u}</button>)}</div></div>)}
      {confirmDelete&&(<div style={overlay}><div style={{...modal,maxWidth:300}}><div style={{fontSize:15,fontWeight:700,marginBottom:8}}>予約を取り消しますか？</div><div style={{fontSize:13,color:"#718096",marginBottom:16}}>この操作は元に戻せません</div><div style={{display:"flex",gap:8}}><button onClick={()=>setConfirmDelete(null)} style={{flex:1,padding:11,borderRadius:10,border:"1px solid #E2E8F0",background:"#fff",cursor:"pointer",fontSize:14}}>キャンセル</button><button onClick={()=>handleDelete(confirmDelete)} style={{flex:1,padding:11,borderRadius:10,border:"none",background:"#C53030",color:"#fff",cursor:"pointer",fontSize:14,fontWeight:700}}>取り消す</button></div></div></div>)}
      {toast&&(<div style={{position:"fixed",bottom:80,left:"50%",transform:"translateX(-50%)",background:toast.type==="error"?"#C53030":toast.type==="info"?"#2B6CB0":"#276749",color:"#fff",padding:"12px 22px",borderRadius:25,fontSize:14,fontWeight:600,boxShadow:"0 4px 20px rgba(0,0,0,0.2)",zIndex:200,whiteSpace:"nowrap"}}>{toast.type==="success"?"✓ ":toast.type==="error"?"⚠ ":"ℹ "}{toast.msg}</div>)}
      <style>{`*{box-sizing:border-box;-webkit-tap-highlight-color:transparent;}input[type="date"]::-webkit-calendar-picker-indicator{opacity:0.6;}select{appearance:auto;}`}</style>
    </div>
  );
}
