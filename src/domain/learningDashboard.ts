import { journeyBooks } from "../content/catalog";
import type { ActivityDay, QuestionAttempt, ReviewItem } from "../types/progress";
import { buildAdaptiveProfile, type AdaptiveActivity, type ConceptLearningState, type LearningStage } from "./adaptive";
import { missionStatus, type MissionAssignment, type MissionEvent, type MissionEvidence } from "./missions";
import { summarizeReviewQueue } from "./review";
import {
  addLocalDays,
  latestCompletionMap,
  localDateKey,
  personalGoalProgress,
  planProgress,
  scheduledSteps,
  type PersonalGoal,
  type PlanCompletionEvent,
  type PlanEnrollment
} from "./studyPlans";

export type DashboardPeriod=7|30|90|"all";
export type DashboardArea="bible"|"formation"|"greek"|"deepen";
export interface DashboardInput extends MissionEvidence {
  xp:number;
  personalGoals:PersonalGoal[];
  missionAssignments:MissionAssignment[];
  missionEvents:MissionEvent[];
}
export interface DashboardDomainItem extends ConceptLearningState {area:DashboardArea;}
export interface DashboardTimelinePoint {
  date:string;lessons:number;reviews:number;questions:number;minutes:number;chapters:number;missions:number;
}
export interface LearningDashboardSnapshot {
  generatedAt:string;
  empty:boolean;
  totals:{
    lessonsCompleted:number;checkpointsCompleted:number;unitsCompleted:number;unitsInProgress:number;
    tracksCompleted:number;tracksInProgress:number;reviewsDue:number;reviewsOverdue:number;reviewsScheduled:number;
    reviewsCompleted:number;goalsReached:number;missionsCompleted:number;missionsActive:number;
    plansActive:number;plansCompleted:number;overduePlanActivities:number;chaptersRead:number;
    effectiveStudyMinutes:number;xp:number;
  };
  domains:Record<DashboardArea,DashboardDomainItem[]>;
  timeline:DashboardTimelinePoint[];
}

const AREAS:DashboardArea[]=["bible","formation","greek","deepen"];
const unique=<T>(values:T[])=>[...new Set(values)];
function safeLocalKey(iso:string){
  const date=new Date(iso);
  return Number.isFinite(date.getTime())?localDateKey(date):undefined;
}
function stageRank(stage:LearningStage){
  return {"review-needed":0,"initial-learning":1,"first-contact":2,"consolidating":3,"demonstrated":4,"insufficient-evidence":5}[stage];
}
function conceptAreas(activities:AdaptiveActivity[]){
  const map=new Map<string,DashboardArea>();
  for(const activity of activities)for(const concept of activity.concepts)if(!map.has(concept.id))map.set(concept.id,activity.kind);
  return map;
}
function completionEventsByDate(input:DashboardInput){
  const latest=latestCompletionMap(input.planCompletionEvents);
  const result=new Map<string,{chapters:Set<string>}>();
  for(const event of latest.values()){
    if(!event.completed)continue;
    const enrollment=input.planEnrollments.find(item=>item.id===event.enrollmentId);
    const step=enrollment?.stepsSnapshot.find(item=>item.id===event.stepId);
    if(step?.activityKind!=="bible-reading")continue;
    const entry=result.get(event.localDate)??{chapters:new Set<string>()};
    for(const chapter of step.chapters??[])entry.chapters.add(chapter.bookOsis+":"+chapter.chapter);
    result.set(event.localDate,entry);
  }
  return result;
}
function timelineStart(input:DashboardInput,period:DashboardPeriod,today:string){
  if(period!=="all")return addLocalDays(today,-period+1);
  const dates=[
    ...Object.keys(input.activity),
    ...input.attempts.map(item=>safeLocalKey(item.answeredAt)).filter((item):item is string=>Boolean(item)),
    ...input.planCompletionEvents.map(item=>item.localDate),
    ...input.missionEvents.map(item=>safeLocalKey(item.occurredAt)).filter((item):item is string=>Boolean(item))
  ].sort();
  return dates[0]??today;
}
export function buildLearningDashboard(input:DashboardInput,activities:AdaptiveActivity[],period:DashboardPeriod=30,now=new Date()):LearningDashboardSnapshot{
  const today=localDateKey(now);
  const completed=new Set([...input.completedLessonIds,...input.completedCheckpointIds]);
  let unitsCompleted=0,unitsInProgress=0,tracksCompleted=0,tracksInProgress=0;
  for(const book of journeyBooks){
    let bookDone=0;
    for(const unit of book.units){
      const ids=[...unit.lessons.map(item=>item.id),unit.checkpoint.id];
      const done=ids.filter(id=>completed.has(id)).length;
      if(done===ids.length&&ids.length){unitsCompleted++;bookDone+=ids.length;}
      else if(done>0){unitsInProgress++;bookDone+=done;}
    }
    const total=book.units.reduce((sum,unit)=>sum+unit.lessons.length+1,0);
    if(total&&bookDone===total)tracksCompleted++;
    else if(bookDone>0)tracksInProgress++;
  }
  const review=summarizeReviewQueue(input.reviewItems,now);
  const profile=buildAdaptiveProfile(input.attempts,input.reviewItems,activities,now);
  const areas=conceptAreas(activities);
  const domains=Object.fromEntries(AREAS.map(area=>[area,[]])) as Record<DashboardArea,DashboardDomainItem[]>;
  for(const concept of profile.concepts){
    const area=areas.get(concept.conceptId)??"bible";
    domains[area].push({...concept,area});
  }
  for(const area of AREAS)domains[area].sort((a,b)=>stageRank(a.stage)-stageRank(b.stage)||a.title.localeCompare(b.title));
  const goalsReached=input.personalGoals.filter(goal=>goal.active&&personalGoalProgress(goal,{
    activity:input.activity,attempts:input.attempts,completionEvents:input.planCompletionEvents,enrollments:input.planEnrollments,now
  }).completed).length;
  const missionEvidence:MissionEvidence=input;
  const missionStates=input.missionAssignments.map(mission=>missionStatus(mission,input.missionEvents,missionEvidence,now));
  const completedMissionIds=new Set(input.missionEvents.filter(event=>event.kind==="mission_completed").map(event=>event.missionId));
  input.missionAssignments.forEach((mission,index)=>{if(missionStates[index].status==="completed")completedMissionIds.add(mission.id);});
  const activeStatuses=new Set(["available","in-progress"]);
  const plansActive=input.planEnrollments.filter(item=>item.status==="active").length;
  const plansCompleted=input.planEnrollments.filter(item=>item.status==="completed"||planProgress(item,input.planCompletionEvents).complete).length;
  const overduePlanActivities=input.planEnrollments.filter(item=>item.status==="active")
    .flatMap(item=>scheduledSteps(item,input.planCompletionEvents,today)).filter(item=>item.overdue).length;
  const readingByDate=completionEventsByDate(input);
  const chapterKeys=new Set<string>();for(const value of readingByDate.values())for(const chapter of value.chapters)chapterKeys.add(chapter);
  const start=timelineStart(input,period,today);
  const byDate=new Map<string,DashboardTimelinePoint>();
  for(let cursor=start;cursor<=today;cursor=addLocalDays(cursor,1))byDate.set(cursor,{date:cursor,lessons:0,reviews:0,questions:0,minutes:0,chapters:0,missions:0});
  for(const [date,day] of Object.entries(input.activity)){const point=byDate.get(date);if(point){point.lessons+=day.lessons;point.minutes+=Math.floor(day.seconds/60);}}
  const attemptIds=new Set<string>();
  for(const attempt of input.attempts){if(attemptIds.has(attempt.id))continue;attemptIds.add(attempt.id);const key=safeLocalKey(attempt.answeredAt);const point=key?byDate.get(key):undefined;if(point){point.questions++;if(attempt.mode==="review")point.reviews++;}}
  for(const [date,value] of readingByDate){const point=byDate.get(date);if(point)point.chapters=value.chapters.size;}
  const missionIds=new Set<string>();
  for(const event of input.missionEvents){if(event.kind!=="mission_completed"||missionIds.has(event.missionId))continue;missionIds.add(event.missionId);const key=safeLocalKey(event.occurredAt);const point=key?byDate.get(key):undefined;if(point)point.missions++;}
  const effectiveStudyMinutes=Math.floor(Object.values(input.activity).reduce((sum,day)=>sum+day.seconds,0)/60);
  const empty=completed.size===0&&input.attempts.length===0&&input.planCompletionEvents.length===0&&input.missionEvents.length===0&&effectiveStudyMinutes===0;
  return {generatedAt:now.toISOString(),empty,totals:{
    lessonsCompleted:unique(input.completedLessonIds).length,checkpointsCompleted:unique(input.completedCheckpointIds).length,
    unitsCompleted,unitsInProgress,tracksCompleted,tracksInProgress,reviewsDue:review.availableToday,reviewsOverdue:review.overdue,
    reviewsScheduled:input.reviewItems.filter(item=>item.dueDate>today).length,
    reviewsCompleted:new Set(input.attempts.filter(item=>item.mode==="review").map(item=>item.id)).size,
    goalsReached,missionsCompleted:completedMissionIds.size,missionsActive:missionStates.filter(item=>activeStatuses.has(item.status)).length,
    plansActive,plansCompleted,overduePlanActivities,chaptersRead:chapterKeys.size,effectiveStudyMinutes,xp:input.xp
  },domains,timeline:[...byDate.values()]};
}
