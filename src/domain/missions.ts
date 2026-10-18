import type { ActivityDay, QuestionAttempt, ReviewItem } from "../types/progress";
import type { PlanCompletionEvent, PlanEnrollment } from "./studyPlans";
import { addLocalDays, latestCompletionMap, localDateKey, scheduledSteps } from "./studyPlans";

export type MissionCadence="daily"|"weekly"|"thematic"|"open";
export type MissionCategory="practice"|"reading"|"continuity"|"reinforcement"|"thematic";
export type MissionMetric="questions"|"lessons"|"reviews"|"checkpoints"|"plan-steps"|"chapters"|"activity";
export type MissionStatus="available"|"in-progress"|"completed"|"expired"|"cancelled";
export type MissionEventKind="mission_started"|"mission_progressed"|"mission_completed"|"mission_expired"|"mission_cancelled";

export interface MissionReference {activityId?:string;activityKind?:"bible"|"formation"|"greek"|"deepen"|"review";enrollmentId?:string;conceptId?:string;route:string;}
export interface MissionAssignment {
 id:string;definitionVersion:1;cadence:MissionCadence;category:MissionCategory;title:string;description:string;reason:string;
 metric:MissionMetric;target:number;baseline:number;startAt:string;startDate:string;endDate?:string;timezone:string;
 reference:MissionReference;createdAt:string;
}
export interface MissionEvent {id:string;missionId:string;kind:MissionEventKind;occurredAt:string;observedProgress:number;sourceEventIds:string[];}
export interface MissionEvidence {
 attempts:QuestionAttempt[];reviewItems:ReviewItem[];activity:Record<string,ActivityDay>;completedLessonIds:string[];completedCheckpointIds:string[];
 planEnrollments:PlanEnrollment[];planCompletionEvents:PlanCompletionEvent[];
}
export interface MissionRecommendation {id:string;title:string;reason:string;activityId?:string;activityKind?:MissionReference["activityKind"];conceptId?:string;route?:string;}
export interface MissionGenerationInput extends MissionEvidence {
 existing:MissionAssignment[];now?:Date;timezone:string;dailyMinutes:number;recommendation?:MissionRecommendation;nextLessonId?:string;
}
export interface MissionProgress {current:number;target:number;percent:number;status:MissionStatus;}

const parseDate=(key:string)=>new Date(key+"T12:00:00");
export function startOfLocalWeek(date:Date){const local=new Date(date.getFullYear(),date.getMonth(),date.getDate(),12);const day=local.getDay();local.setDate(local.getDate()-(day===0?6:day-1));return localDateKey(local);}
export function periodFor(cadence:"daily"|"weekly",now=new Date()){const start=cadence==="daily"?localDateKey(now):startOfLocalWeek(now);return {start,end:cadence==="daily"?start:addLocalDays(start,6)};}
function inPeriod(value:string,start:string,end?:string){const key=value.slice(0,10);return key>=start&&(!end||key<=end);}
function completionState(events:PlanCompletionEvent[]){return latestCompletionMap(events);}
function readingStep(enrollments:PlanEnrollment[],enrollmentId:string,stepId:string){return enrollments.find(item=>item.id===enrollmentId)?.stepsSnapshot.find(step=>step.id===stepId)?.activityKind==="bible-reading";}
function scopedCompletions(mission:MissionAssignment,evidence:MissionEvidence){
 const latest=completionState(evidence.planCompletionEvents);let count=0;
 for(const event of latest.values()){if(!event.completed)continue;if(mission.reference.enrollmentId&&event.enrollmentId!==mission.reference.enrollmentId)continue;
  if(mission.metric==="chapters"&&!readingStep(evidence.planEnrollments,event.enrollmentId,event.stepId))continue;count++;}
 return count;
}
export function missionMetricValue(mission:MissionAssignment,evidence:MissionEvidence){
 if(mission.metric==="questions"){const ids=new Set(evidence.attempts.filter(a=>inPeriod(a.answeredAt,mission.startDate,mission.endDate)&&a.mode!=="review").map(a=>a.questionId+"@"+a.answeredAt.slice(0,10)));return ids.size;}
 if(mission.metric==="reviews")return new Set(evidence.attempts.filter(a=>a.mode==="review"&&inPeriod(a.answeredAt,mission.startDate,mission.endDate)).map(a=>a.id)).size;
 if(mission.metric==="lessons")return Object.values(evidence.activity).filter(day=>inPeriod(day.date,mission.startDate,mission.endDate)).reduce((sum,day)=>sum+day.lessons,0);
 if(mission.metric==="checkpoints")return evidence.completedCheckpointIds.length;
 if(mission.metric==="plan-steps"||mission.metric==="chapters")return scopedCompletions(mission,evidence);
 if(mission.metric==="activity")return mission.reference.activityId&&(evidence.completedLessonIds.includes(mission.reference.activityId)||evidence.completedCheckpointIds.includes(mission.reference.activityId))?1:0;
 return 0;
}
export function missionStatus(mission:MissionAssignment,events:MissionEvent[],evidence:MissionEvidence,now=new Date()):MissionProgress{
 const own=events.filter(event=>event.missionId===mission.id).sort((a,b)=>a.occurredAt.localeCompare(b.occurredAt));const terminal=[...own].reverse().find(e=>e.kind==="mission_completed"||e.kind==="mission_expired"||e.kind==="mission_cancelled");
 const current=Math.max(0,missionMetricValue(mission,evidence)-mission.baseline);const percent=Math.min(100,Math.round(current/mission.target*100));
 if(terminal?.kind==="mission_completed")return {current:Math.max(current,terminal.observedProgress),target:mission.target,percent:100,status:"completed"};
 if(terminal?.kind==="mission_expired")return {current:terminal.observedProgress,target:mission.target,percent,status:"expired"};
 if(terminal?.kind==="mission_cancelled")return {current,target:mission.target,percent,status:"cancelled"};
 if(current>=mission.target)return {current,target:mission.target,percent:100,status:"completed"};
 if(mission.endDate&&localDateKey(now)>mission.endDate)return {current,target:mission.target,percent,status:"expired"};
 return {current,target:mission.target,percent,status:current>0?"in-progress":"available"};
}
function assignment(input:MissionGenerationInput,data:Omit<MissionAssignment,"definitionVersion"|"baseline"|"startAt"|"createdAt"|"timezone">):MissionAssignment{
 const created=(input.now??new Date()).toISOString();const draft={...data,definitionVersion:1 as const,baseline:0,startAt:created,createdAt:created,timezone:input.timezone};
 return {...draft,baseline:missionMetricValue(draft,input)};
}
function availablePlan(input:MissionGenerationInput){const today=localDateKey(input.now??new Date());for(const enrollment of input.planEnrollments.filter(p=>p.status==="active")){
 const item=scheduledSteps(enrollment,input.planCompletionEvents,today).find(step=>!step.completed&&step.scheduledDate<=today);if(item)return {enrollment,item};}return undefined;}
export function generateMissions(input:MissionGenerationInput){
 const now=input.now??new Date(),daily=periodFor("daily",now),weekly=periodFor("weekly",now),out:MissionAssignment[]=[];const ids=new Set(input.existing.map(m=>m.id));
 const add=(m:MissionAssignment)=>{if(!ids.has(m.id)&&m.target>0){ids.add(m.id);out.push(m);}};
 const questionTarget=input.dailyMinutes<=5?3:input.dailyMinutes<=15?5:8;
 add(assignment(input,{id:`daily:${daily.start}:questions`,cadence:"daily",category:"practice",title:`Responda ${questionTarget} questões`,description:"Pratique com questões reais, sem contar repetidamente a mesma questão no mesmo dia.",reason:"A quantidade acompanha seu tempo diário configurado.",metric:"questions",target:questionTarget,startDate:daily.start,endDate:daily.end,reference:{route:input.nextLessonId?"/lesson/"+input.nextLessonId:"/"}}));
 const plan=availablePlan(input);if(plan)add(assignment(input,{id:`daily:${daily.start}:plan:${plan.enrollment.id}`,cadence:"daily",category:plan.item.step.activityKind==="bible-reading"?"reading":"continuity",title:plan.item.step.activityKind==="bible-reading"?"Continue sua leitura":"Continue seu plano",description:plan.item.step.title,reason:"Esta é uma atividade real prevista no seu plano ativo.",metric:plan.item.step.activityKind==="bible-reading"?"chapters":"plan-steps",target:1,startDate:daily.start,endDate:daily.end,reference:{enrollmentId:plan.enrollment.id,route:"/plans"}}));
 const weeklyTarget=input.dailyMinutes<=10?3:5;
 add(assignment(input,{id:`weekly:${weekly.start}:lessons`,cadence:"weekly",category:"continuity",title:`Conclua ${weeklyTarget} lições nesta semana`,description:"Avance em qualquer trilha disponível.",reason:"O desafio semanal é moderado de acordo com seu ritmo declarado.",metric:"lessons",target:weeklyTarget,startDate:weekly.start,endDate:weekly.end,reference:{route:"/"}}));
 const due=input.reviewItems.filter(item=>item.dueDate<=daily.start).length;if(due)add(assignment(input,{id:`daily:${daily.start}:reviews`,cadence:"daily",category:"reinforcement",title:`Revise ${Math.min(3,due)} conceito(s)`,description:"Faça revisões já vencidas na agenda de memória.",reason:"Há conceitos disponíveis para reforço; os intervalos da revisão não serão alterados.",metric:"reviews",target:Math.min(3,due),startDate:daily.start,endDate:daily.end,reference:{activityKind:"review",route:"/study"}}));
 const rec=input.recommendation;if(rec?.activityId)add(assignment(input,{id:`thematic:${weekly.start}:${rec.id}`,cadence:"thematic",category:"thematic",title:rec.title,description:"Conclua a atividade curricular relacionada.",reason:rec.reason,metric:"activity",target:1,startDate:weekly.start,endDate:weekly.end,reference:{activityId:rec.activityId,activityKind:rec.activityKind,conceptId:rec.conceptId,route:rec.route??"/"}}));
 return out;
}
export function reconcileMissionEvents(assignments:MissionAssignment[],events:MissionEvent[],evidence:MissionEvidence,now=new Date()){
 const ids=new Set(events.map(e=>e.id));const created:MissionEvent[]=[];
 for(const mission of assignments){const progress=missionStatus(mission,events,evidence,now);const kind=progress.status==="completed"?"mission_completed":progress.status==="expired"?"mission_expired":undefined;if(!kind)continue;
  const id=mission.id+":"+kind;if(ids.has(id))continue;created.push({id,missionId:mission.id,kind,occurredAt:now.toISOString(),observedProgress:progress.current,sourceEventIds:[]});}
 return created;
}
export function missionHistory(assignments:MissionAssignment[],events:MissionEvent[],evidence:MissionEvidence,now=new Date()){return assignments.map(mission=>({mission,progress:missionStatus(mission,events,evidence,now)})).sort((a,b)=>b.mission.startDate.localeCompare(a.mission.startDate));}
