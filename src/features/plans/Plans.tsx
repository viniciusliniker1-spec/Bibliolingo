import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { bibleBooks } from "../../content/bible/catalog";
import { buildAdaptiveActivityCatalog, adaptiveWebPath } from "../../domain/adaptiveCatalog";
import { getReviewQueue } from "../../domain/review";
import {
  STUDY_PLAN_CATALOG, addLocalDays, createActivityPlanDefinition, createBookReadingPlan, createEnrollment,
  latestCompletionMap, localDateKey, personalGoalProgress, planProgress, readingRoute, reorganizeEnrollment, scheduledSteps,
  updateEnrollmentStatus, type GoalMetric, type PlanCompletionEvent, type PlanEnrollment, type StudyPlanDefinition
} from "../../domain/studyPlans";
import { useApp } from "../../state/AppContext";

const uid=(prefix:string)=>prefix+"-"+(globalThis.crypto?.randomUUID?.()??Date.now().toString(36)+Math.random().toString(36).slice(2));
const timezone=()=>Intl.DateTimeFormat().resolvedOptions().timeZone||"UTC";
const weekdays=[{id:0,label:"D"},{id:1,label:"S"},{id:2,label:"T"},{id:3,label:"Q"},{id:4,label:"Q"},{id:5,label:"S"},{id:6,label:"S"}];
const metricLabels:Record<GoalMetric,string>={minutes:"minutos",lessons:"lições",reviews:"revisões",checkpoints:"checkpoints",chapters:"capítulos",concepts:"conceitos",units:"unidades"};

function planRoute(step:PlanEnrollment["stepsSnapshot"][number],enrollmentId:string){
  if(step.activityKind==="bible-reading")return readingRoute(step,"/plans?enrollment="+encodeURIComponent(enrollmentId));
  if(step.activityKind==="review")return "/study";
  if(!step.activityId)return "/plans";
  return adaptiveWebPath(step.activityKind==="bible"?"bible":step.activityKind,step.activityId);
}

export function Plans(){
  const {state,dispatch}=useApp();const navigate=useNavigate();const today=localDateKey(new Date());
  const [notice,setNotice]=useState("");const [goalMetric,setGoalMetric]=useState<GoalMetric>("minutes");const [goalCadence,setGoalCadence]=useState<"daily"|"weekly">("daily");
  const [goalTarget,setGoalTarget]=useState(15);const [bookOsis,setBookOsis]=useState("Rom");const [bookDays,setBookDays]=useState(30);
  const [selectedDays,setSelectedDays]=useState([0,1,2,3,4,5,6]);
  const activities=useMemo(()=>buildAdaptiveActivityCatalog({completedLessonIds:state.completedLessonIds,completedCheckpointIds:state.completedCheckpointIds}),[state.completedLessonIds,state.completedCheckpointIds]);
  const educationPlans=useMemo(()=>{
    const definitions:StudyPlanDefinition[]=[];const specs=[
      {id:"journey-guided",kind:"bible" as const,title:"Jornada bíblica guiada",category:"faith" as const,level:"beginner" as const,days:180},
      {id:"formation-guided",kind:"formation" as const,title:"Formação pastoral",category:"formation" as const,level:"intermediate" as const,days:180},
      {id:"greek-guided",kind:"greek" as const,title:"Grego bíblico do zero",category:"greek" as const,level:"beginner" as const,days:120},
      {id:"deepen-guided",kind:"deepen" as const,title:"Aprofundamento teológico",category:"theology" as const,level:"advanced" as const,days:60}
    ];
    for(const spec of specs){const selected=activities.filter(item=>item.kind===spec.kind);if(selected.length)definitions.push(createActivityPlanDefinition({
      id:spec.id,title:spec.title,description:"Plano baseado exclusivamente nas atividades existentes do Bibliolingo.",category:spec.category,
      objective:"Avançar pela sequência educacional publicada.",suggestedLevel:spec.level,estimatedDays:spec.days,
      activities:selected.map(item=>({id:item.id,title:item.title,kind:item.kind,estimatedMinutes:item.estimatedMinutes}))
    }));}return definitions;
  },[activities]);
  const catalog=[...STUDY_PLAN_CATALOG,...educationPlans];
  const active=state.planEnrollments.filter(item=>item.status==="active"||item.status==="paused");
  const completionMap=latestCompletionMap(state.planCompletionEvents);
  const allToday=active.filter(item=>item.status==="active").flatMap(item=>scheduledSteps(item,state.planCompletionEvents,today))
    .filter(item=>item.scheduledDate<=today&&!item.completed).sort((a,b)=>a.scheduledDate.localeCompare(b.scheduledDate));
  const reviews=getReviewQueue(state.reviewItems,new Date());

  const startPlan=(plan:StudyPlanDefinition)=>{
    if(state.planEnrollments.some(item=>item.planId===plan.id&&item.status!=="archived"&&item.status!=="completed")){setNotice("Este plano já está em andamento.");return;}
    try{const enrollment=createEnrollment(plan,{id:uid("plan"),startDate:today,studyWeekdays:selectedDays});
      dispatch({type:"UPSERT_PLAN_ENROLLMENT",enrollment});dispatch({type:"RECORD_PLAN_CHANGE",event:{id:uid("change"),enrollmentId:enrollment.id,kind:"created",occurredAt:new Date().toISOString()}});
      setNotice("Plano iniciado. A primeira atividade já aparece em Hoje.");
    }catch(error){setNotice(error instanceof Error?error.message:"Não foi possível iniciar o plano.");}
  };
  const saveGoal=()=>{const max=goalMetric==="minutes"?1440:100;if(!Number.isInteger(goalTarget)||goalTarget<1||goalTarget>max){setNotice("Informe uma meta válida entre 1 e "+max+".");return;}
    const now=new Date().toISOString();dispatch({type:"UPSERT_PERSONAL_GOAL",goal:{id:uid("goal"),title:`${goalTarget} ${metricLabels[goalMetric]} por ${goalCadence==="daily"?"dia":"semana"}`,
      metric:goalMetric,cadence:goalCadence,target:goalTarget,active:true,createdAt:now,updatedAt:now}});setNotice("Meta personalizada salva.");};
  const createCustom=()=>{try{startPlan(createBookReadingPlan(bookOsis,bookDays));}catch(error){setNotice(error instanceof Error?error.message:"Plano inválido.");}};
  const toggleStep=(enrollment:PlanEnrollment,stepId:string)=>{
    const current=completionMap.get(enrollment.id+":"+stepId)?.completed??false;const now=new Date();
    const event:PlanCompletionEvent={id:uid("completion"),enrollmentId:enrollment.id,stepId,completed:!current,occurredAt:now.toISOString(),localDate:localDateKey(now),timezone:timezone()};
    dispatch({type:"RECORD_PLAN_COMPLETION",event});
    const currentProgress=planProgress(enrollment,[...state.planCompletionEvents,event]);
    if(currentProgress.complete){const completed=updateEnrollmentStatus(enrollment,"completed",now);dispatch({type:"UPSERT_PLAN_ENROLLMENT",enrollment:completed});
      dispatch({type:"RECORD_PLAN_CHANGE",event:{id:uid("change"),enrollmentId:enrollment.id,kind:"completed",occurredAt:now.toISOString()}});}
  };
  const changeStatus=(enrollment:PlanEnrollment,status:"active"|"paused"|"archived")=>{const updated=updateEnrollmentStatus(enrollment,status);dispatch({type:"UPSERT_PLAN_ENROLLMENT",enrollment:updated});
    dispatch({type:"RECORD_PLAN_CHANGE",event:{id:uid("change"),enrollmentId:enrollment.id,kind:status==="active"?"resumed":status==="paused"?"paused":"archived",occurredAt:new Date().toISOString()}});};
  const reschedule=(enrollment:PlanEnrollment,strategy:"extend"|"from-today"|"reduce")=>{const pending=scheduledSteps(enrollment,state.planCompletionEvents,today).filter(item=>!item.completed).map(item=>item.step.id);
    const updated=reorganizeEnrollment(enrollment,{strategy,today,pendingStepIds:pending});dispatch({type:"UPSERT_PLAN_ENROLLMENT",enrollment:updated});
    dispatch({type:"RECORD_PLAN_CHANGE",event:{id:uid("change"),enrollmentId:enrollment.id,kind:"rescheduled",occurredAt:new Date().toISOString(),details:strategy}});
    setNotice("Cronograma reorganizado sem apagar conclusões.");};

  return <main className="page">
    <header className="home-header"><div><p className="eyebrow">ORGANIZAÇÃO FLEXÍVEL</p><h1>Planos de Estudo</h1><p>Metas e jornadas no seu ritmo, sem punição por atrasos.</p></div></header>
    {notice&&<p role="status" className="context-card">{notice}</p>}

    <section className="alternative-paths" aria-labelledby="today-title"><div className="section-title"><div><p className="eyebrow">Hoje</p><h2 id="today-title">Atividades previstas</h2></div></div>
      {reviews.length>0&&<div className="context-card"><strong>{reviews.length} revisão(ões) disponível(is)</strong><p>A agenda de memória foi preservada. Você escolhe revisar agora ou seguir o plano.</p><button className="small-button" onClick={()=>navigate("/study")}>Abrir revisões</button></div>}
      {allToday.length?allToday.slice(0,8).map(item=><article className="context-card" key={item.enrollmentId+item.step.id}>
        <small>{item.overdue?"Pendente desde ":"Prevista para "}{item.scheduledDate}</small><strong>{item.step.title}</strong>
        <p>{item.step.estimatedMinutes} min · {state.planEnrollments.find(plan=>plan.id===item.enrollmentId)?.title}</p>
        <div><button className="small-button" onClick={()=>navigate(planRoute(item.step,item.enrollmentId)??"/plans")}>Abrir</button>
          <button className="text-button" onClick={()=>toggleStep(state.planEnrollments.find(plan=>plan.id===item.enrollmentId)!,item.step.id)}>Marcar concluída</button></div>
      </article>):<div className="context-card"><strong>Nada pendente para hoje</strong><p>Você pode explorar livremente ou iniciar um novo plano.</p></div>}
    </section>

    <section className="alternative-paths"><div className="section-title"><div><p className="eyebrow">Metas</p><h2>Metas personalizadas</h2></div></div>
      <div className="context-card"><label>Tipo <select value={goalMetric} onChange={event=>setGoalMetric(event.target.value as GoalMetric)}>{Object.entries(metricLabels).map(([id,label])=><option value={id} key={id}>{label}</option>)}</select></label>
        <label>Período <select value={goalCadence} onChange={event=>setGoalCadence(event.target.value as "daily"|"weekly")}><option value="daily">Diária</option><option value="weekly">Semanal</option></select></label>
        <label>Quantidade <input type="number" min="1" max={goalMetric==="minutes"?1440:100} value={goalTarget} onChange={event=>setGoalTarget(Number(event.target.value))}/></label>
        <button className="primary-button" onClick={saveGoal}>Salvar meta</button></div>
      {state.personalGoals.filter(goal=>goal.active).map(goal=>{const progress=personalGoalProgress(goal,{activity:state.activity,attempts:state.attempts,completionEvents:state.planCompletionEvents,enrollments:state.planEnrollments});return <div className="context-card" key={goal.id}><strong>{goal.title}</strong><p>{progress.value}/{progress.target} · {progress.percent}%</p><small>Baseada apenas em atividade efetivamente registrada.</small></div>;})}
    </section>

    <section className="alternative-paths"><div className="section-title"><div><p className="eyebrow">Meus planos</p><h2>Ativos, pausados e concluídos</h2></div></div>
      {state.planEnrollments.length?state.planEnrollments.filter(item=>item.status!=="archived").map(enrollment=>{const progress=planProgress(enrollment,state.planCompletionEvents);const items=scheduledSteps(enrollment,state.planCompletionEvents,today);const overdue=items.filter(item=>item.overdue).length;
        return <details className="context-card" key={enrollment.id} open={enrollment.status==="active"}><summary><strong>{enrollment.title}</strong> · {progress.percent}% · {enrollment.status}</summary>
          <p>{progress.completed}/{progress.total} concluídas · término estimado {enrollment.targetEndDate}</p>{overdue>0&&<p>{overdue} atividade(s) pendente(s). Reorganize somente se desejar.</p>}
          <div>{enrollment.status==="active"?<button className="text-button" onClick={()=>changeStatus(enrollment,"paused")}>Pausar</button>:enrollment.status==="paused"?<button className="small-button" onClick={()=>changeStatus(enrollment,"active")}>Retomar</button>:null}
            {enrollment.status!=="completed"&&<button className="text-button" onClick={()=>changeStatus(enrollment,"archived")}>Arquivar</button>}</div>
          {overdue>0&&<div><button className="small-button" onClick={()=>reschedule(enrollment,"extend")}>Distribuir a partir de amanhã</button><button className="text-button" onClick={()=>reschedule(enrollment,"from-today")}>Retomar hoje</button><button className="text-button" onClick={()=>reschedule(enrollment,"reduce")}>Reduzir intensidade</button></div>}
          <ol>{items.slice(0,20).map(item=><li key={item.step.id}><span>{item.scheduledDate} · {item.step.title}</span> <button className="text-button" onClick={()=>toggleStep(enrollment,item.step.id)}>{item.completed?"Desmarcar":"Concluir"}</button></li>)}</ol>
        </details>;}):<div className="context-card"><p>Você ainda não iniciou planos. Isso não limita nenhuma área do aplicativo.</p></div>}
    </section>

    <section className="alternative-paths"><div className="section-title"><div><p className="eyebrow">Explorar planos</p><h2>Catálogo validado</h2></div></div>
      <p>Todos os modelos abaixo apontam para capítulos ou atividades existentes. O plano cronológico não foi publicado sem sequência editorial aprovada.</p>
      <div className="alternative-path-list">{catalog.map(plan=><article className="context-card" key={plan.id}><strong>{plan.title}</strong><p>{plan.description}</p><small>{plan.category} · {plan.steps.length} etapas · cerca de {plan.estimatedDays} dias</small><button className="primary-button" onClick={()=>startPlan(plan)}>Iniciar plano</button></article>)}</div>
    </section>

    <section className="alternative-paths"><div className="section-title"><div><p className="eyebrow">Criar plano</p><h2>Leitura personalizada por livro</h2></div></div>
      <div className="context-card"><label>Livro <select value={bookOsis} onChange={event=>setBookOsis(event.target.value)}>{bibleBooks.map(book=><option value={book.osis} key={book.osis}>{book.name}</option>)}</select></label>
        <label>Duração em dias <input type="number" min="1" max="730" value={bookDays} onChange={event=>setBookDays(Number(event.target.value))}/></label>
        <fieldset><legend>Dias disponíveis</legend>{weekdays.map(day=><label key={day.id}><input type="checkbox" checked={selectedDays.includes(day.id)} onChange={()=>setSelectedDays(current=>current.includes(day.id)?current.filter(value=>value!==day.id):[...current,day.id].sort())}/>{day.label}</label>)}</fieldset>
        <button className="primary-button" onClick={createCustom}>Criar e iniciar</button></div>
    </section>

    <section className="alternative-paths"><div className="section-title"><div><p className="eyebrow">Calendário</p><h2>Próximos 35 dias</h2></div></div>
      <div className="activity-calendar" role="grid" aria-label="Calendário dos planos">{Array.from({length:35},(_,index)=>{const date=addLocalDays(today,index);const items=active.flatMap(plan=>scheduledSteps(plan,state.planCompletionEvents,today)).filter(item=>item.scheduledDate===date);
        return <div role="gridcell" className="activity-cell" key={date} aria-label={date+": "+items.length+" atividades"}><small>{date.slice(8)}</small><strong>{items.length||"—"}</strong></div>;})}</div>
    </section>
  </main>;
}
