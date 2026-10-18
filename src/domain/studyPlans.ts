import { bibleBooks, bibleBookByOsis } from "../content/bible/catalog";
import { BIBLE_TRANSLATION } from "../services/bible";

export type PlanCategory = "reading" | "book" | "thematic" | "faith" | "theology" | "formation" | "greek" | "review";
export type PlanStatus = "not-started" | "active" | "paused" | "completed" | "archived";
export type PlanActivityKind = "bible-reading" | "bible" | "formation" | "greek" | "deepen" | "review";
export type GoalMetric = "minutes" | "lessons" | "reviews" | "checkpoints" | "chapters" | "concepts" | "units";

export interface PersonalGoal {
  id: string;
  title: string;
  metric: GoalMetric;
  cadence: "daily" | "weekly";
  target: number;
  scope?: "all" | "reading" | "formation" | "greek" | "theology";
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReadingChapter { bookOsis: string; chapter: number; }

export interface StudyPlanStep {
  id: string;
  order: number;
  title: string;
  activityKind: PlanActivityKind;
  estimatedMinutes: number;
  chapters?: ReadingChapter[];
  activityId?: string;
}

export interface StudyPlanDefinition {
  id: string;
  version: number;
  title: string;
  description: string;
  category: PlanCategory;
  objective: string;
  suggestedLevel: "beginner" | "intermediate" | "advanced" | "all";
  estimatedDays: number;
  prerequisites: string[];
  published: boolean;
  customizable: boolean;
  steps: StudyPlanStep[];
}

export interface PlanEnrollment {
  id: string;
  planId: string;
  planVersion: number;
  title: string;
  status: PlanStatus;
  startedOn: string;
  targetEndDate: string;
  studyWeekdays: number[];
  translationId: string;
  stepsSnapshot: StudyPlanStep[];
  createdAt: string;
  updatedAt: string;
  scheduleRevision: number;
  scheduleOverrides?: Record<string,string>;
}

export interface PlanCompletionEvent {
  id: string;
  enrollmentId: string;
  stepId: string;
  completed: boolean;
  occurredAt: string;
  localDate: string;
  timezone: string;
}

export interface PlanChangeEvent {
  id: string;
  enrollmentId: string;
  kind: "created" | "paused" | "resumed" | "archived" | "rescheduled" | "completed";
  occurredAt: string;
  details?: string;
}

export interface ScheduledPlanStep {
  enrollmentId: string;
  step: StudyPlanStep;
  scheduledDate: string;
  completed: boolean;
  completedAt?: string;
  overdue: boolean;
}

const DAY_MS=86_400_000;
const pad=(value:number)=>String(value).padStart(2,"0");
export const localDateKey=(date:Date)=>`${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}`;
export function localDateFromKey(key:string){if(!/^\d{4}-\d{2}-\d{2}$/.test(key))throw new Error("Data civil inválida.");const [y,m,d]=key.split("-").map(Number);const date=new Date(y,m-1,d,12);if(date.getFullYear()!==y||date.getMonth()!==m-1||date.getDate()!==d)throw new Error("Data civil inválida.");return date;}
export function addLocalDays(key:string,days:number){const date=localDateFromKey(key);date.setDate(date.getDate()+days);return localDateKey(date);}
export function daysBetween(start:string,end:string){return Math.round((localDateFromKey(end).getTime()-localDateFromKey(start).getTime())/DAY_MS);}

function chapterSequence(filter:(book:(typeof bibleBooks)[number])=>boolean):ReadingChapter[]{
  return bibleBooks.filter(filter).flatMap(book=>Array.from({length:book.chapters},(_,index)=>({bookOsis:book.osis,chapter:index+1})));
}
function readingTitle(chapters:ReadingChapter[]){
  const first=chapters[0],last=chapters.at(-1)!;
  const firstBook=bibleBookByOsis.get(first.bookOsis)?.name??first.bookOsis;
  const lastBook=bibleBookByOsis.get(last.bookOsis)?.name??last.bookOsis;
  if(first.bookOsis===last.bookOsis)return first.chapter===last.chapter?`${firstBook} ${first.chapter}`:`${firstBook} ${first.chapter}–${last.chapter}`;
  return `${firstBook} ${first.chapter} – ${lastBook} ${last.chapter}`;
}
function readingPlan(id:string,title:string,description:string,days:number,chapters:ReadingChapter[]):StudyPlanDefinition{
  const steps=Array.from({length:Math.min(days,chapters.length)},(_,index)=>{
    const start=Math.floor(index*chapters.length/Math.min(days,chapters.length));
    const end=Math.floor((index+1)*chapters.length/Math.min(days,chapters.length));
    const group=chapters.slice(start,end);
    return {id:`${id}-d${index+1}`,order:index,title:readingTitle(group),activityKind:"bible-reading" as const,
      estimatedMinutes:Math.max(5,group.length*4),chapters:group};
  });
  return {id,version:1,title,description,category:"reading",objective:"Ler integralmente a seleção bíblica na ordem canônica.",
    suggestedLevel:"all",estimatedDays:days,prerequisites:[],published:true,customizable:true,steps};
}

const allChapters=chapterSequence(()=>true);
const newTestament=chapterSequence(book=>book.testament==="new");
const gospels=chapterSequence(book=>["Matt","Mark","Luke","John"].includes(book.osis));
const psalms=chapterSequence(book=>book.osis==="Ps");
const proverbs=chapterSequence(book=>book.osis==="Prov");

export const STUDY_PLAN_CATALOG:StudyPlanDefinition[]=[
  readingPlan("bible-canonical-365","Bíblia em 365 dias","Leitura integral em ordem canônica, distribuída de forma equilibrada.",365,allChapters),
  readingPlan("new-testament-90","Novo Testamento em 90 dias","Todos os 260 capítulos do Novo Testamento em ordem canônica.",90,newTestament),
  readingPlan("gospels-30","Evangelhos em 30 dias","Mateus, Marcos, Lucas e João em ordem canônica.",30,gospels),
  readingPlan("psalms-30","Salmos em 30 dias","Os 150 salmos distribuídos ao longo de 30 dias.",30,psalms),
  readingPlan("proverbs-31","Provérbios em 31 dias","Um capítulo de Provérbios por etapa.",31,proverbs)
];

export interface CatalogValidation { valid:boolean; duplicateChapters:string[]; missingChapters:string[]; invalidChapters:string[]; }
export function validateReadingPlan(plan:StudyPlanDefinition,expected:ReadingChapter[]):CatalogValidation{
  const actual=plan.steps.flatMap(step=>step.chapters??[]);
  const keys=actual.map(ch=>`${ch.bookOsis}:${ch.chapter}`);
  const expectedKeys=new Set(expected.map(ch=>`${ch.bookOsis}:${ch.chapter}`));
  const counts=new Map<string,number>();keys.forEach(key=>counts.set(key,(counts.get(key)??0)+1));
  const invalidChapters=keys.filter(key=>{const [osis,chapter]=key.split(":");const book=bibleBookByOsis.get(osis);return !book||Number(chapter)<1||Number(chapter)>book.chapters;});
  return {valid:invalidChapters.length===0&&[...counts.values()].every(count=>count===1)&&expectedKeys.size===keys.length,
    duplicateChapters:[...counts].filter(([,count])=>count>1).map(([key])=>key),
    missingChapters:[...expectedKeys].filter(key=>!counts.has(key)),invalidChapters:[...new Set(invalidChapters)]};
}
export function expectedChaptersForPlan(planId:string){
  if(planId==="bible-canonical-365")return allChapters;
  if(planId==="new-testament-90")return newTestament;
  if(planId==="gospels-30")return gospels;
  if(planId==="psalms-30")return psalms;
  if(planId==="proverbs-31")return proverbs;
  return [];
}

export function createActivityPlanDefinition(input:{
  id:string;title:string;description:string;category:Exclude<PlanCategory,"reading"|"book">;
  objective:string;suggestedLevel:StudyPlanDefinition["suggestedLevel"];estimatedDays:number;
  activities:Array<{id:string;title:string;kind:Exclude<PlanActivityKind,"bible-reading">;estimatedMinutes:number}>;
}):StudyPlanDefinition{
  if(!input.activities.length)throw new Error("Não há atividades existentes para este plano.");
  if(!Number.isInteger(input.estimatedDays)||input.estimatedDays<1||input.estimatedDays>730)throw new Error("Duração inválida.");
  return {id:input.id,version:1,title:input.title,description:input.description,category:input.category,objective:input.objective,
    suggestedLevel:input.suggestedLevel,estimatedDays:input.estimatedDays,prerequisites:[],published:true,customizable:true,
    steps:input.activities.map((activity,order)=>({id:`${input.id}-s${order+1}`,order,title:activity.title,activityKind:activity.kind,
      activityId:activity.id,estimatedMinutes:activity.estimatedMinutes}))};
}

export function createBookReadingPlan(bookOsis:string,durationDays:number,title?:string):StudyPlanDefinition{
  const book=bibleBookByOsis.get(bookOsis);if(!book)throw new Error("Livro bíblico inexistente.");
  if(!Number.isInteger(durationDays)||durationDays<1||durationDays>730)throw new Error("A duração deve ficar entre 1 e 730 dias.");
  const plan=readingPlan(`custom-book-${book.id}`,title?.trim()||`Ler ${book.name}`,`Plano personalizado para ler ${book.name}.`,
    Math.min(durationDays,book.chapters),chapterSequence(candidate=>candidate.osis===bookOsis));
  return {...plan,published:false,category:"book"};
}

export function createEnrollment(plan:StudyPlanDefinition,input:{id:string;startDate:string;studyWeekdays:number[];targetEndDate?:string;now?:Date}):PlanEnrollment{
  if(!plan.steps.length)throw new Error("O plano não possui atividades válidas.");
  const weekdays=[...new Set(input.studyWeekdays)].sort();
  if(!weekdays.length||weekdays.some(day=>!Number.isInteger(day)||day<0||day>6))throw new Error("Selecione pelo menos um dia válido.");
  localDateFromKey(input.startDate);
  const minimumEnd=scheduleDates(input.startDate,weekdays,plan.steps.length).at(-1)!;
  const target=input.targetEndDate&&input.targetEndDate>=minimumEnd?input.targetEndDate:minimumEnd;
  const now=(input.now??new Date()).toISOString();
  return {id:input.id,planId:plan.id,planVersion:plan.version,title:plan.title,status:"active",startedOn:input.startDate,
    targetEndDate:target,studyWeekdays:weekdays,translationId:BIBLE_TRANSLATION.id,stepsSnapshot:plan.steps.map(step=>({...step,chapters:step.chapters?.map(ch=>({...ch}))})),
    createdAt:now,updatedAt:now,scheduleRevision:1,scheduleOverrides:{}};
}
export function scheduleDates(startDate:string,weekdays:number[],count:number){
  if(!weekdays.length)throw new Error("Dias de estudo ausentes.");
  const dates:string[]=[];let cursor=startDate;let guard=0;
  while(dates.length<count&&guard<count*14+14){const date=localDateFromKey(cursor);if(weekdays.includes(date.getDay()))dates.push(cursor);cursor=addLocalDays(cursor,1);guard++;}
  if(dates.length!==count)throw new Error("Não foi possível gerar o cronograma.");
  return dates;
}
export function latestCompletionMap(events:readonly PlanCompletionEvent[]){
  const map=new Map<string,PlanCompletionEvent>();
  [...events].sort((a,b)=>a.occurredAt.localeCompare(b.occurredAt)).forEach(event=>map.set(event.enrollmentId+":"+event.stepId,event));
  return map;
}
export function scheduledSteps(enrollment:PlanEnrollment,events:readonly PlanCompletionEvent[],today=localDateKey(new Date())):ScheduledPlanStep[]{
  const dates=scheduleDates(enrollment.startedOn,enrollment.studyWeekdays,enrollment.stepsSnapshot.length);
  const latest=latestCompletionMap(events);
  return enrollment.stepsSnapshot.map((step,index)=>{const event=latest.get(enrollment.id+":"+step.id);const completed=event?.completed??false;
    const scheduledDate=enrollment.scheduleOverrides?.[step.id]??dates[index];
    return {enrollmentId:enrollment.id,step,scheduledDate,completed,completedAt:completed?event?.occurredAt:undefined,overdue:!completed&&scheduledDate<today};});
}
export function planProgress(enrollment:PlanEnrollment,events:readonly PlanCompletionEvent[]){
  const items=scheduledSteps(enrollment,events);
  const completed=items.filter(item=>item.completed).length;
  return {completed,total:items.length,remaining:items.length-completed,percent:items.length?Math.round(completed/items.length*100):0,
    next:items.find(item=>!item.completed),complete:items.length>0&&completed===items.length};
}
export function updateEnrollmentStatus(enrollment:PlanEnrollment,status:PlanStatus,now=new Date()):PlanEnrollment{
  return {...enrollment,status,updatedAt:now.toISOString()};
}
export function reorganizeEnrollment(enrollment:PlanEnrollment,input:{strategy:"extend"|"from-today"|"reduce";today:string;pendingStepIds?:string[];studyWeekdays?:number[];now?:Date}):PlanEnrollment{
  const weekdays=input.studyWeekdays?.length?[...new Set(input.studyWeekdays)].sort():enrollment.studyWeekdays;
  const effectiveWeekdays=input.strategy==="reduce"&&weekdays.length>1?weekdays.filter((_,index)=>index%2===0):weekdays;
  const pending=input.pendingStepIds?.length?input.pendingStepIds:enrollment.stepsSnapshot.map(step=>step.id);
  const anchor=input.strategy==="extend"?addLocalDays(input.today,1):input.today;
  const dates=scheduleDates(anchor,effectiveWeekdays,pending.length);
  const scheduleOverrides={...(enrollment.scheduleOverrides??{})};pending.forEach((stepId,index)=>{scheduleOverrides[stepId]=dates[index];});
  return {...enrollment,targetEndDate:dates.at(-1)??enrollment.targetEndDate,studyWeekdays:effectiveWeekdays,scheduleOverrides,
    updatedAt:(input.now??new Date()).toISOString(),scheduleRevision:enrollment.scheduleRevision+1};
}
export function readingRoute(step:StudyPlanStep,returnPath="/plans"){
  const chapter=step.chapters?.[0];if(!chapter)return undefined;
  return `/bible?book=${encodeURIComponent(chapter.bookOsis)}&chapter=${chapter.chapter}&return=${encodeURIComponent(returnPath)}`;
}
