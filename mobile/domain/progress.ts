import { CONTENT_VERSION, GAMIFICATION } from "../../src/config/gamification";
import { calculateLessonXp } from "../../src/domain/gamification";
import { updateStreak, toLocalDateKey } from "../../src/domain/streak";
import { initialState } from "../../src/state/initialState";
import type { QuestionAttempt } from "../../src/types/progress";
import type { ActiveLessonSession, CompletionResult, MobileProgress } from "../types/progress";

export function createInitialProgress():MobileProgress{return {
 schemaVersion:1,xp:0,hearts:GAMIFICATION.hearts.initial,streak:0,bestStreak:0,completedLessonIds:[],completedCheckpointIds:[],
 perfectLessonIds:[],incorrectQuestionIds:[],reviewItems:[],profile:{...initialState.profile,onboarded:true},settings:{...initialState.settings},
 attempts:[],earnedAchievementIds:[],activity:{},promptsGenerated:{},bibleAnnotations:{},learnedGreekLexemeIds:[],greekSkills:{},ignoredRecommendationIds:[],recentRecommendationIds:[],personalGoals:[],planEnrollments:[],planCompletionEvents:[],planChangeEvents:[],missionAssignments:[],missionEvents:[],storageRevision:0
};}
function appendUnique(values:string[],value:string){return values.includes(value)?values:[...values,value];}
export function createLessonSession(activityId:string):ActiveLessonSession{return {activityId,stepIndex:0,correct:0,incorrect:0,answeredQuestionIds:[],answers:{},startedAt:new Date().toISOString()};}
export function recordAnswer(session:ActiveLessonSession,questionId:string,correct:boolean):ActiveLessonSession{
 if(session.answeredQuestionIds.includes(questionId))return session;return {...session,correct:session.correct+(correct?1:0),incorrect:session.incorrect+(correct?0:1),
 answeredQuestionIds:[...session.answeredQuestionIds,questionId],answers:{...session.answers,[questionId]:correct}};
}
export function recordProgressAnswer(current:MobileProgress,input:{questionId:string;correct:boolean;lessonId:string;conceptId?:string;difficulty?:"easy"|"medium"|"hard";
 mode:"lesson"|"checkpoint"|"review"|"formation"|"deepen"|"greek";now?:Date}):MobileProgress{
 const now=input.now??new Date();const already=input.mode!=="review"&&current.activeLesson?.answeredQuestionIds.includes(input.questionId);
 if(already)return current;const date=toLocalDateKey(now);const day=current.activity[date]??{date,xp:0,seconds:0,lessons:0};
 const reward=input.mode==="review"?(input.correct?GAMIFICATION.xp.reviewCorrect:0):GAMIFICATION.xp.exercise;
 const streak=updateStreak(current.lastStudyDate,current.streak,current.bestStreak,now);
 const attempt:QuestionAttempt={id:`${input.questionId}-${now.getTime()}`,questionId:input.questionId,lessonId:input.lessonId,conceptId:input.conceptId,
 correct:input.correct,difficulty:input.difficulty??"medium",answeredAt:now.toISOString(),mode:input.mode};
 const heartsLost=!input.correct&&input.mode!=="review"&&input.mode!=="formation"&&current.settings.heartsEnabled?1:0;
 const heartsRecovered=input.correct&&input.mode==="review"?GAMIFICATION.hearts.recoveredPerReview:0;
 const greekSkills=input.mode==="greek"&&input.conceptId?{...current.greekSkills,[input.conceptId]:{correct:(current.greekSkills[input.conceptId]?.correct??0)+(input.correct?1:0),
 incorrect:(current.greekSkills[input.conceptId]?.incorrect??0)+(input.correct?0:1),lastPracticedAt:now.toISOString()}}:current.greekSkills;
 return {...current,...streak,xp:current.xp+reward,hearts:Math.min(current.settings.maxHearts,Math.max(0,current.hearts-heartsLost+heartsRecovered)),
 activeLesson:current.activeLesson&&input.mode!=="review"?recordAnswer(current.activeLesson,input.questionId,input.correct):current.activeLesson,
 attempts:[...current.attempts,attempt],greekSkills,incorrectQuestionIds:input.correct?current.incorrectQuestionIds:appendUnique(current.incorrectQuestionIds,input.questionId),
 activity:{...current.activity,[date]:{...day,xp:day.xp+reward}},storageRevision:current.storageRevision+1};
}
export function finishActivity(current:MobileProgress,activityId:string,total:number,correct:number,checkpoint:boolean,passAccuracy=.8,now=new Date()):CompletionResult{
 const safeTotal=Math.max(1,total),accuracy=correct/safeTotal,perfect=correct===total,passed=!checkpoint||accuracy>=passAccuracy;
 const xpEarned=passed?calculateLessonXp(total,perfect,checkpoint):total*GAMIFICATION.xp.exercise;
 const alreadyCompleted=(checkpoint?current.completedCheckpointIds:current.completedLessonIds).includes(activityId);
 const fullBonus=passed?(checkpoint?GAMIFICATION.xp.checkpoint:GAMIFICATION.xp.lesson+(perfect?GAMIFICATION.xp.perfectLesson:0)):0;
 const bonus=alreadyCompleted?0:fullBonus;const streak=updateStreak(current.lastStudyDate,current.streak,current.bestStreak,now);const date=toLocalDateKey(now);
 const day=current.activity[date]??{date,xp:0,seconds:0,lessons:0};const duration=Math.max(0,Math.round((now.getTime()-new Date(current.activeLesson?.startedAt??now).getTime())/1000));
 return {xpEarned:alreadyCompleted?0:xpEarned,accuracy,passed,progress:{...current,...streak,xp:current.xp+bonus,
 completedLessonIds:!checkpoint&&passed?appendUnique(current.completedLessonIds,activityId):current.completedLessonIds,
 completedCheckpointIds:checkpoint&&passed?appendUnique(current.completedCheckpointIds,activityId):current.completedCheckpointIds,
 perfectLessonIds:!checkpoint&&perfect?appendUnique(current.perfectLessonIds,activityId):current.perfectLessonIds,activeLesson:undefined,
 activity:{...current.activity,[date]:{...day,xp:day.xp+bonus,seconds:day.seconds+duration,lessons:day.lessons+(passed&&!alreadyCompleted?1:0)}},storageRevision:current.storageRevision+1}};
}
