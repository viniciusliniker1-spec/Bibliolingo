import type {
  ActivityDay,
  BibleAnnotation,
  BibleLocation,
  GreekSkillProgress,
  QuestionAttempt,
  ReviewItem,
  UserProfile,
  UserSettings
} from "../../src/types/progress";
export interface ActiveLessonSession {activityId:string;journeyMode?:"canonical"|"individual";journeyBookId?:string;stepIndex:number;correct:number;incorrect:number;answeredQuestionIds:string[];answers:Record<string,boolean>;startedAt:string;}
export interface MobileProgress {
 schemaVersion:1;xp:number;hearts:number;streak:number;bestStreak:number;lastStudyDate?:string;
 completedLessonIds:string[];completedCheckpointIds:string[];perfectLessonIds:string[];incorrectQuestionIds:string[];
 reviewItems:ReviewItem[];activeLesson?:ActiveLessonSession;profile:UserProfile;settings:UserSettings;attempts:QuestionAttempt[];
 earnedAchievementIds:string[];activity:Record<string,ActivityDay>;promptsGenerated:Record<string,number>;bibleLocation?:BibleLocation;
 bibleAnnotations:Record<string,BibleAnnotation>;learnedGreekLexemeIds:string[];greekSkills:Record<string,GreekSkillProgress>;
 ignoredRecommendationIds:string[];recentRecommendationIds:string[];personalGoals:import("../../src/domain/studyPlans").PersonalGoal[];
 planEnrollments:import("../../src/domain/studyPlans").PlanEnrollment[];planCompletionEvents:import("../../src/domain/studyPlans").PlanCompletionEvent[];
 planChangeEvents:import("../../src/domain/studyPlans").PlanChangeEvent[];storageRevision:number;
}
export interface CompletionResult {progress:MobileProgress;xpEarned:number;accuracy:number;passed:boolean;}
