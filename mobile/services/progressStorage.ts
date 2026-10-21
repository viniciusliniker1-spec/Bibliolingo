import AsyncStorage from "@react-native-async-storage/async-storage";
import { createInitialProgress } from "../domain/progress";
import type { ActiveLessonSession, MobileProgress } from "../types/progress";
import { LatestWriteQueue } from "../domain/latestWriteQueue";
const STORAGE_KEY="@bibliolingo/mobile-progress/v1";
const progressWrites=new LatestWriteQueue<MobileProgress>((progress)=>AsyncStorage.setItem(STORAGE_KEY,JSON.stringify(progress)));
const strings=(value:unknown):value is string[]=>Array.isArray(value)&&value.every(item=>typeof item==="string");
function active(value:unknown):ActiveLessonSession|undefined{if(!value||typeof value!=="object")return;const s=value as Partial<ActiveLessonSession>;
 if(typeof s.activityId!=="string"||typeof s.stepIndex!=="number"||typeof s.correct!=="number"||typeof s.incorrect!=="number"||!strings(s.answeredQuestionIds)||typeof s.startedAt!=="string")return;
 const answers=s.answers&&typeof s.answers==="object"?Object.fromEntries(Object.entries(s.answers).filter((e):e is [string,boolean]=>typeof e[1]==="boolean")):{};return {...s,answers} as ActiveLessonSession;}
export function normalizeProgress(value:unknown):MobileProgress{const fallback=createInitialProgress();if(!value||typeof value!=="object")return fallback;const c=value as Partial<MobileProgress>;
 if(c.schemaVersion!==1||typeof c.xp!=="number"||typeof c.streak!=="number"||typeof c.bestStreak!=="number"||!strings(c.completedLessonIds)||!strings(c.completedCheckpointIds)||!strings(c.perfectLessonIds)||!strings(c.incorrectQuestionIds))return fallback;
 return {...fallback,...c,profile:{...fallback.profile,...c.profile},settings:{...fallback.settings,...c.settings},hearts:typeof c.hearts==="number"?c.hearts:fallback.hearts,
 attempts:Array.isArray(c.attempts)?c.attempts:[],earnedAchievementIds:strings(c.earnedAchievementIds)?c.earnedAchievementIds:[],activity:c.activity&&typeof c.activity==="object"?c.activity:{},
 promptsGenerated:c.promptsGenerated&&typeof c.promptsGenerated==="object"?c.promptsGenerated:{},bibleAnnotations:c.bibleAnnotations&&typeof c.bibleAnnotations==="object"?c.bibleAnnotations:{},
 learnedGreekLexemeIds:strings(c.learnedGreekLexemeIds)?c.learnedGreekLexemeIds:[],greekSkills:c.greekSkills&&typeof c.greekSkills==="object"?c.greekSkills:{},
 ignoredRecommendationIds:strings(c.ignoredRecommendationIds)?c.ignoredRecommendationIds.slice(-100):[],recentRecommendationIds:strings(c.recentRecommendationIds)?c.recentRecommendationIds.slice(-20):[],
 personalGoals:Array.isArray(c.personalGoals)?c.personalGoals:[],planEnrollments:Array.isArray(c.planEnrollments)?c.planEnrollments:[],
 planCompletionEvents:Array.isArray(c.planCompletionEvents)?c.planCompletionEvents:[],planChangeEvents:Array.isArray(c.planChangeEvents)?c.planChangeEvents:[],
 missionAssignments:Array.isArray(c.missionAssignments)?c.missionAssignments:[],missionEvents:Array.isArray(c.missionEvents)?c.missionEvents:[],
 reviewItems:Array.isArray(c.reviewItems)?c.reviewItems.filter(item=>item&&typeof item.questionId==="string"):[],activeLesson:active(c.activeLesson)};
}
export async function loadProgress(){try{const raw=await AsyncStorage.getItem(STORAGE_KEY);return raw?normalizeProgress(JSON.parse(raw)):createInitialProgress();}catch{return createInitialProgress();}}
export function scheduleProgressSave(progress:MobileProgress){progressWrites.schedule(progress);}
export function flushProgressSave(){return progressWrites.flush();}
export async function saveProgress(progress:MobileProgress){await progressWrites.writeNow(progress);}
export async function replaceProgress(progress:MobileProgress){await saveProgress(normalizeProgress(progress));}
