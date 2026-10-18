import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { bibleBooks } from "../../src/content/bible/catalog";
import { buildAdaptiveActivityCatalog } from "../../src/domain/adaptiveCatalog";
import { getReviewQueue } from "../../src/domain/review";
import {
  STUDY_PLAN_CATALOG, addLocalDays, createActivityPlanDefinition, createBookReadingPlan, createEnrollment,
  latestCompletionMap, localDateKey, personalGoalProgress, planProgress, reorganizeEnrollment, scheduledSteps, updateEnrollmentStatus,
  type GoalMetric, type PlanCompletionEvent, type PlanEnrollment, type StudyPlanDefinition
} from "../../src/domain/studyPlans";
import { PrimaryButton } from "../components/PrimaryButton";
import { Screen } from "../components/Screen";
import { useMobileProgress } from "../providers/MobileProgressProvider";
import { colors, radius, spacing } from "../theme/tokens";

const uid=(prefix:string)=>prefix+"-"+(globalThis.crypto?.randomUUID?.()??Date.now().toString(36)+Math.random().toString(36).slice(2));
const timezone=()=>Intl.DateTimeFormat().resolvedOptions().timeZone||"UTC";
const metrics:Array<{id:GoalMetric;label:string}>=[{id:"minutes",label:"Minutos"},{id:"lessons",label:"Lições"},{id:"reviews",label:"Revisões"},{id:"checkpoints",label:"Checkpoints"},{id:"chapters",label:"Capítulos"},{id:"concepts",label:"Conceitos"},{id:"units",label:"Unidades"}];

export default function PlansScreen(){
 const router=useRouter();const {progress,savePersonalGoal,savePlanEnrollment,recordPlanCompletion,recordPlanChange}=useMobileProgress();const today=localDateKey(new Date());
 const [notice,setNotice]=useState("");const [goalMetric,setGoalMetric]=useState<GoalMetric>("minutes");const [goalTarget,setGoalTarget]=useState("15");
 const [bookOsis,setBookOsis]=useState("Rom");const [bookDays,setBookDays]=useState("30");
 const activities=useMemo(()=>buildAdaptiveActivityCatalog({completedLessonIds:progress.completedLessonIds,completedCheckpointIds:progress.completedCheckpointIds}),[progress.completedLessonIds,progress.completedCheckpointIds]);
 const education=useMemo(()=>[
  {id:"journey-guided",kind:"bible" as const,title:"Jornada bíblica guiada",category:"faith" as const,level:"beginner" as const,days:180},
  {id:"formation-guided",kind:"formation" as const,title:"Formação pastoral",category:"formation" as const,level:"intermediate" as const,days:180},
  {id:"greek-guided",kind:"greek" as const,title:"Grego bíblico do zero",category:"greek" as const,level:"beginner" as const,days:120},
  {id:"deepen-guided",kind:"deepen" as const,title:"Aprofundamento teológico",category:"theology" as const,level:"advanced" as const,days:60}
 ].flatMap(spec=>{const selected=activities.filter(item=>item.kind===spec.kind);return selected.length?[createActivityPlanDefinition({id:spec.id,title:spec.title,
  description:"Plano baseado nas atividades existentes do Bibliolingo.",category:spec.category,objective:"Avançar pela sequência educacional publicada.",
  suggestedLevel:spec.level,estimatedDays:spec.days,activities:selected.map(item=>({id:item.id,title:item.title,kind:item.kind,estimatedMinutes:item.estimatedMinutes}))})]:[];}),[activities]);
 const catalog=[...STUDY_PLAN_CATALOG,...education];const active=progress.planEnrollments.filter(item=>item.status==="active"||item.status==="paused");
 const completions=latestCompletionMap(progress.planCompletionEvents);
 const due=active.filter(item=>item.status==="active").flatMap(item=>scheduledSteps(item,progress.planCompletionEvents,today)).filter(item=>item.scheduledDate<=today&&!item.completed);
 const reviews=getReviewQueue(progress.reviewItems,new Date());

 const start=(plan:StudyPlanDefinition)=>{if(progress.planEnrollments.some(item=>item.planId===plan.id&&item.status!=="completed"&&item.status!=="archived")){setNotice("Este plano já está em andamento.");return;}
  try{const enrollment=createEnrollment(plan,{id:uid("plan"),startDate:today,studyWeekdays:[0,1,2,3,4,5,6]});savePlanEnrollment(enrollment);
   recordPlanChange({id:uid("change"),enrollmentId:enrollment.id,kind:"created",occurredAt:new Date().toISOString()});setNotice("Plano iniciado.");}
  catch(error){setNotice(error instanceof Error?error.message:"Não foi possível iniciar.");}};
 const toggle=(enrollment:PlanEnrollment,stepId:string)=>{const current=completions.get(enrollment.id+":"+stepId)?.completed??false;const now=new Date();
  const event:PlanCompletionEvent={id:uid("completion"),enrollmentId:enrollment.id,stepId,completed:!current,occurredAt:now.toISOString(),localDate:localDateKey(now),timezone:timezone()};
  recordPlanCompletion(event);if(planProgress(enrollment,[...progress.planCompletionEvents,event]).complete){savePlanEnrollment(updateEnrollmentStatus(enrollment,"completed",now));
   recordPlanChange({id:uid("change"),enrollmentId:enrollment.id,kind:"completed",occurredAt:now.toISOString()});}};
 const open=(enrollment:PlanEnrollment,step:PlanEnrollment["stepsSnapshot"][number])=>{if(step.activityKind==="bible-reading"){const chapter=step.chapters?.[0];if(chapter)router.push({pathname:"/(tabs)/bible",params:{osis:chapter.bookOsis,chapter:String(chapter.chapter),returnPlanId:enrollment.id}});return;}
  if(step.activityKind==="review"){router.push("/(tabs)/review");return;}if(!step.activityId)return;
  if(step.activityKind==="bible")router.push({pathname:"/lesson/[activityId]",params:{activityId:step.activityId}});
  else router.push({pathname:"/activity/[kind]/[activityId]",params:{kind:step.activityKind,activityId:step.activityId}});};
 const status=(enrollment:PlanEnrollment,next:"active"|"paused"|"archived")=>{savePlanEnrollment(updateEnrollmentStatus(enrollment,next));recordPlanChange({id:uid("change"),enrollmentId:enrollment.id,
  kind:next==="active"?"resumed":next==="paused"?"paused":"archived",occurredAt:new Date().toISOString()});};
 const reschedule=(enrollment:PlanEnrollment,strategy:"extend"|"from-today"|"reduce")=>{const pending=scheduledSteps(enrollment,progress.planCompletionEvents,today).filter(item=>!item.completed).map(item=>item.step.id);
  savePlanEnrollment(reorganizeEnrollment(enrollment,{strategy,today,pendingStepIds:pending}));recordPlanChange({id:uid("change"),enrollmentId:enrollment.id,kind:"rescheduled",occurredAt:new Date().toISOString(),details:strategy});setNotice("Cronograma reorganizado.");};
 const saveGoal=()=>{const target=Number(goalTarget),max=goalMetric==="minutes"?1440:100;if(!Number.isInteger(target)||target<1||target>max){setNotice("Meta inválida.");return;}const now=new Date().toISOString();
  savePersonalGoal({id:uid("goal"),title:`${target} ${metrics.find(item=>item.id===goalMetric)?.label.toLowerCase()} por dia`,metric:goalMetric,cadence:"daily",target,active:true,createdAt:now,updatedAt:now});setNotice("Meta salva.");};

 return <Screen>
  <View><Text style={styles.eyebrow}>ORGANIZAÇÃO FLEXÍVEL</Text><Text style={styles.title}>Planos de Estudo</Text><Text style={styles.muted}>Organize leituras e atividades sem punição por atrasos.</Text></View>
  {notice?<Text accessibilityLiveRegion="polite" style={styles.notice}>{notice}</Text>:null}

  <View style={styles.section}><Text style={styles.eyebrow}>HOJE</Text><Text style={styles.heading}>Atividades previstas</Text>
   {reviews.length?<Pressable style={styles.card} onPress={()=>router.push("/(tabs)/review")}><Text style={styles.cardTitle}>{reviews.length} revisões disponíveis</Text><Text style={styles.muted}>Agenda de memória preservada; revisar é opcional.</Text></Pressable>:null}
   {due.length?due.slice(0,6).map(item=>{const enrollment=progress.planEnrollments.find(plan=>plan.id===item.enrollmentId)!;return <View style={styles.card} key={item.enrollmentId+item.step.id}>
    <Text style={styles.small}>{item.overdue?"Pendente desde ":"Prevista para "}{item.scheduledDate}</Text><Text style={styles.cardTitle}>{item.step.title}</Text><Text style={styles.muted}>{enrollment.title} · ~{item.step.estimatedMinutes} min</Text>
    <View style={styles.row}><Pressable style={styles.action} onPress={()=>open(enrollment,item.step)}><Text style={styles.actionText}>Abrir</Text></Pressable><Pressable onPress={()=>toggle(enrollment,item.step.id)}><Text style={styles.link}>Concluir</Text></Pressable></View>
   </View>}):<View style={styles.card}><Text style={styles.cardTitle}>Nada pendente para hoje</Text><Text style={styles.muted}>Explore livremente ou inicie um plano.</Text></View>}
  </View>

  <View style={styles.section}><Text style={styles.eyebrow}>METAS</Text><Text style={styles.heading}>Meta diária personalizada</Text>
   <View style={styles.chips}>{metrics.map(item=><Pressable key={item.id} onPress={()=>setGoalMetric(item.id)} style={[styles.chip,goalMetric===item.id&&styles.chipActive]}><Text>{item.label}</Text></Pressable>)}</View>
   <TextInput accessibilityLabel="Quantidade da meta" keyboardType="number-pad" value={goalTarget} onChangeText={setGoalTarget} style={styles.input}/>
   <PrimaryButton onPress={saveGoal}>Salvar meta</PrimaryButton>
   {progress.personalGoals.filter(goal=>goal.active).map(goal=>{const status=personalGoalProgress(goal,{activity:progress.activity,attempts:progress.attempts,completionEvents:progress.planCompletionEvents,enrollments:progress.planEnrollments});return <View style={styles.card} key={goal.id}><Text style={styles.cardTitle}>{goal.title}</Text><Text style={styles.muted}>{status.value}/{status.target} · {status.percent}% · atividade efetivamente registrada.</Text></View>;})}
  </View>

  <View style={styles.section}><Text style={styles.eyebrow}>MEUS PLANOS</Text><Text style={styles.heading}>Progresso independente</Text>
   {progress.planEnrollments.filter(item=>item.status!=="archived").map(enrollment=>{const summary=planProgress(enrollment,progress.planCompletionEvents);const items=scheduledSteps(enrollment,progress.planCompletionEvents,today);const overdue=items.filter(item=>item.overdue).length;
    return <View style={styles.card} key={enrollment.id}><Text style={styles.cardTitle}>{enrollment.title}</Text><Text style={styles.muted}>{summary.completed}/{summary.total} · {summary.percent}% · {enrollment.status}</Text>
     {overdue?<Text style={styles.warning}>{overdue} pendência(s), sem penalidade.</Text>:null}<View style={styles.row}>{enrollment.status==="active"?<Pressable onPress={()=>status(enrollment,"paused")}><Text style={styles.link}>Pausar</Text></Pressable>:enrollment.status==="paused"?<Pressable onPress={()=>status(enrollment,"active")}><Text style={styles.link}>Retomar</Text></Pressable>:null}
      {enrollment.status!=="completed"?<Pressable onPress={()=>status(enrollment,"archived")}><Text style={styles.link}>Arquivar</Text></Pressable>:null}</View>
     {overdue?<View style={styles.row}><Pressable onPress={()=>reschedule(enrollment,"extend")}><Text style={styles.link}>A partir de amanhã</Text></Pressable><Pressable onPress={()=>reschedule(enrollment,"reduce")}><Text style={styles.link}>Reduzir ritmo</Text></Pressable></View>:null}
     {items.slice(0,8).map(item=><View style={styles.step} key={item.step.id}><Text style={styles.flex}>{item.scheduledDate} · {item.step.title}</Text><Pressable onPress={()=>toggle(enrollment,item.step.id)}><Text style={styles.link}>{item.completed?"Desmarcar":"Concluir"}</Text></Pressable></View>)}
    </View>;})}
  </View>

  <View style={styles.section}><Text style={styles.eyebrow}>EXPLORAR</Text><Text style={styles.heading}>Catálogo validado</Text><Text style={styles.muted}>O plano cronológico aguarda uma sequência editorial aprovada.</Text>
   {catalog.map(plan=><View style={styles.card} key={plan.id}><Text style={styles.cardTitle}>{plan.title}</Text><Text style={styles.muted}>{plan.description}</Text><Text style={styles.small}>{plan.steps.length} etapas · ~{plan.estimatedDays} dias</Text><PrimaryButton onPress={()=>start(plan)}>Iniciar</PrimaryButton></View>)}
  </View>

  <View style={styles.section}><Text style={styles.eyebrow}>CRIAR PLANO</Text><Text style={styles.heading}>Livro personalizado</Text>
   <View style={styles.chips}>{bibleBooks.map(book=><Pressable key={book.osis} onPress={()=>setBookOsis(book.osis)} style={[styles.chip,bookOsis===book.osis&&styles.chipActive]}><Text>{book.abbreviation}</Text></Pressable>)}</View>
   <TextInput accessibilityLabel="Duração em dias" keyboardType="number-pad" value={bookDays} onChangeText={setBookDays} style={styles.input}/>
   <PrimaryButton onPress={()=>{try{start(createBookReadingPlan(bookOsis,Number(bookDays)));}catch(error){setNotice(error instanceof Error?error.message:"Plano inválido.");}}}>Criar e iniciar</PrimaryButton>
  </View>

  <View style={styles.section}><Text style={styles.eyebrow}>CALENDÁRIO</Text><Text style={styles.heading}>Próximos 14 dias</Text><View style={styles.calendar}>{Array.from({length:14},(_,index)=>{const date=addLocalDays(today,index);const count=active.flatMap(plan=>scheduledSteps(plan,progress.planCompletionEvents,today)).filter(item=>item.scheduledDate===date).length;
   return <View style={styles.day} key={date} accessibilityLabel={date+": "+count+" atividades"}><Text style={styles.small}>{date.slice(8)}</Text><Text style={styles.cardTitle}>{count||"—"}</Text></View>;})}</View>
  </View>
 </Screen>;
}

const styles=StyleSheet.create({section:{gap:spacing.md},eyebrow:{color:colors.tealDark,fontSize:11,fontWeight:"900",letterSpacing:1.2},title:{color:colors.navy,fontSize:30,fontWeight:"900"},heading:{color:colors.navy,fontSize:20,fontWeight:"900"},muted:{color:colors.muted,lineHeight:20},notice:{padding:spacing.md,borderRadius:radius.md,backgroundColor:"#e7f6f3",color:colors.tealDark,fontWeight:"700"},card:{gap:spacing.sm,padding:spacing.md,borderWidth:1,borderColor:colors.border,borderRadius:radius.md,backgroundColor:colors.surface},cardTitle:{color:colors.navy,fontWeight:"900"},small:{color:colors.muted,fontSize:11},warning:{color:"#8b5b00",fontWeight:"700"},row:{flexDirection:"row",alignItems:"center",gap:spacing.lg,flexWrap:"wrap"},action:{paddingHorizontal:spacing.md,paddingVertical:spacing.sm,borderRadius:radius.md,backgroundColor:colors.teal},actionText:{color:colors.navy,fontWeight:"900"},link:{color:colors.tealDark,fontWeight:"800"},chips:{flexDirection:"row",flexWrap:"wrap",gap:spacing.sm},chip:{minWidth:44,minHeight:44,alignItems:"center",justifyContent:"center",paddingHorizontal:spacing.sm,borderRadius:radius.md,borderWidth:1,borderColor:colors.border,backgroundColor:colors.surface},chipActive:{borderColor:colors.teal,backgroundColor:"#d8f2ee"},input:{minHeight:48,paddingHorizontal:spacing.md,borderWidth:1,borderColor:colors.border,borderRadius:radius.md,backgroundColor:colors.surface,color:colors.navy},step:{flexDirection:"row",alignItems:"center",gap:spacing.sm,paddingTop:spacing.sm,borderTopWidth:1,borderTopColor:colors.border},flex:{flex:1,color:colors.navy},calendar:{flexDirection:"row",flexWrap:"wrap",gap:spacing.sm},day:{width:"13%",minWidth:42,alignItems:"center",gap:4,paddingVertical:spacing.sm,borderWidth:1,borderColor:colors.border,borderRadius:radius.md,backgroundColor:colors.surface}});
