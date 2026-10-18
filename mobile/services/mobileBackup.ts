import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { CONTENT_VERSION } from "../../src/config/gamification";
import { parseBackup, serializeBackup } from "../../src/storage/backup";
import type { AppState } from "../../src/types/progress";
import type { MobileProgress } from "../types/progress";

function appState(progress:MobileProgress):AppState{return {
 schemaVersion:7,contentVersion:CONTENT_VERSION,profile:progress.profile,settings:progress.settings,xp:progress.xp,hearts:progress.hearts,
 streak:progress.streak,bestStreak:progress.bestStreak,lastStudyDate:progress.lastStudyDate,completedLessonIds:progress.completedLessonIds,
 completedCheckpointIds:progress.completedCheckpointIds,perfectLessonIds:progress.perfectLessonIds,attempts:progress.attempts,reviewItems:progress.reviewItems,
 earnedAchievementIds:progress.earnedAchievementIds,activity:progress.activity,activeSession:progress.activeLesson?{lessonId:progress.activeLesson.activityId,
 stepIndex:progress.activeLesson.stepIndex,startedAt:progress.activeLesson.startedAt,answers:progress.activeLesson.answers}:undefined,
 promptsGenerated:progress.promptsGenerated,bibleLocation:progress.bibleLocation,bibleAnnotations:progress.bibleAnnotations,
 learnedGreekLexemeIds:progress.learnedGreekLexemeIds,greekSkills:progress.greekSkills,ignoredRecommendationIds:progress.ignoredRecommendationIds,
 recentRecommendationIds:progress.recentRecommendationIds,storageRevision:progress.storageRevision
};}
function mobile(state:AppState,current:MobileProgress):MobileProgress{return {...current,profile:state.profile,settings:state.settings,xp:state.xp,hearts:state.hearts,
 streak:state.streak,bestStreak:state.bestStreak,lastStudyDate:state.lastStudyDate,completedLessonIds:state.completedLessonIds,
 completedCheckpointIds:state.completedCheckpointIds,perfectLessonIds:state.perfectLessonIds,attempts:state.attempts,reviewItems:state.reviewItems,
 earnedAchievementIds:state.earnedAchievementIds,activity:state.activity,promptsGenerated:state.promptsGenerated,bibleLocation:state.bibleLocation,
 bibleAnnotations:state.bibleAnnotations,learnedGreekLexemeIds:state.learnedGreekLexemeIds,greekSkills:state.greekSkills,
 ignoredRecommendationIds:state.ignoredRecommendationIds,recentRecommendationIds:state.recentRecommendationIds,storageRevision:state.storageRevision+1,
 incorrectQuestionIds:[...new Set(state.attempts.filter(item=>!item.correct).map(item=>item.questionId))],
 activeLesson:state.activeSession?{activityId:state.activeSession.lessonId,stepIndex:state.activeSession.stepIndex,startedAt:state.activeSession.startedAt,
 answers:state.activeSession.answers,answeredQuestionIds:Object.keys(state.activeSession.answers),correct:Object.values(state.activeSession.answers).filter(Boolean).length,
 incorrect:Object.values(state.activeSession.answers).filter(value=>!value).length}:undefined};}
export async function exportMobileBackup(progress:MobileProgress){
 const directory=FileSystem.cacheDirectory;if(!directory)throw new Error("Armazenamento temporário indisponível.");
 const uri=directory+`bibliolingo-backup-${new Date().toISOString().slice(0,10)}.json`;
 await FileSystem.writeAsStringAsync(uri,serializeBackup(appState(progress)));
 if(!(await Sharing.isAvailableAsync()))throw new Error("Compartilhamento de arquivos indisponível.");
 await Sharing.shareAsync(uri,{mimeType:"application/json",dialogTitle:"Exportar progresso do Bibliolingo"});
}
export async function importMobileBackup(current:MobileProgress){
 const result=await DocumentPicker.getDocumentAsync({type:"application/json",copyToCacheDirectory:true});if(result.canceled)return;
 const raw=await FileSystem.readAsStringAsync(result.assets[0].uri);return mobile(parseBackup(raw),current);
}
