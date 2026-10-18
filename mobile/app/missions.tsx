import { useEffect,useMemo } from "react";
import { Pressable,StyleSheet,Text,View } from "react-native";
import { useRouter } from "expo-router";
import { orderedActivityIds } from "../../src/content/catalog";
import { nextJourneyActivityId } from "../../src/domain/unlocks";
import { buildAdaptiveActivityCatalog } from "../../src/domain/adaptiveCatalog";
import { recommendAdaptiveNext } from "../../src/domain/adaptive";
import { CURATED_PREREQUISITES } from "../../src/domain/prerequisites";
import { generateMissions,missionHistory,reconcileMissionEvents,type MissionEvidence } from "../../src/domain/missions";
import { Screen } from "../components/Screen";
import { useMobileProgress } from "../providers/MobileProgressProvider";
import { colors,radius,spacing } from "../theme/tokens";
const tz=()=>Intl.DateTimeFormat().resolvedOptions().timeZone||"UTC";
export default function MissionsScreen(){
 const router=useRouter();const {progress,saveMissionAssignment,recordMissionEvent}=useMobileProgress();
 const evidence:MissionEvidence=useMemo(()=>({attempts:progress.attempts,reviewItems:progress.reviewItems,activity:progress.activity,completedLessonIds:progress.completedLessonIds,completedCheckpointIds:progress.completedCheckpointIds,planEnrollments:progress.planEnrollments,planCompletionEvents:progress.planCompletionEvents}),[progress]);
 const minutes=progress.personalGoals.find(g=>g.active&&g.metric==="minutes"&&g.cadence==="daily")?.target??Math.max(5,Math.min(30,Math.round(progress.profile.dailyGoal/10)));
 const next=nextJourneyActivityId(orderedActivityIds,progress.completedLessonIds,progress.completedCheckpointIds);
 const activities=useMemo(()=>buildAdaptiveActivityCatalog({completedLessonIds:progress.completedLessonIds,completedCheckpointIds:progress.completedCheckpointIds}),[progress.completedLessonIds,progress.completedCheckpointIds]);
 const adaptive=useMemo(()=>recommendAdaptiveNext({attempts:progress.attempts,reviewItems:progress.reviewItems,activities,prerequisites:CURATED_PREREQUISITES,goal:progress.profile.goal,declaredLevel:progress.profile.knowledgeLevel,ignoredRecommendationIds:progress.ignoredRecommendationIds,recentRecommendationIds:progress.recentRecommendationIds,limit:1}),[progress.attempts,progress.reviewItems,activities,progress.profile.goal,progress.profile.knowledgeLevel,progress.ignoredRecommendationIds,progress.recentRecommendationIds]);
 const recommendation=adaptive.recommendations.find(item=>item.kind!=="review"&&item.activityId&&item.activityKind);
 const generated=useMemo(()=>generateMissions({...evidence,existing:progress.missionAssignments,timezone:tz(),dailyMinutes:minutes,nextLessonId:next,now:new Date(),recommendation:recommendation?{id:recommendation.id,title:recommendation.title,reason:recommendation.reason,activityId:recommendation.activityId,activityKind:recommendation.activityKind,conceptId:recommendation.conceptId,route:"/activity/"+recommendation.activityKind+"/"+recommendation.activityId}:undefined}),[evidence,progress.missionAssignments,minutes,next,recommendation]);
 useEffect(()=>generated.forEach(saveMissionAssignment),[generated,saveMissionAssignment]);
 const assignments=useMemo(()=>[...progress.missionAssignments,...generated.filter(g=>!progress.missionAssignments.some(m=>m.id===g.id))],[progress.missionAssignments,generated]);
 const lifecycle=useMemo(()=>reconcileMissionEvents(assignments,progress.missionEvents,evidence,new Date()),[assignments,progress.missionEvents,evidence]);useEffect(()=>lifecycle.forEach(recordMissionEvent),[lifecycle,recordMissionEvent]);
 const items=missionHistory(assignments,[...progress.missionEvents,...lifecycle],evidence,new Date());
 const open=(route:string)=>{if(route==="/study"){router.push("/(tabs)/review");return;}if(route==="/plans"){router.push("/plans");return;}const match=route.match(/^\/lesson\/(.+)$/);if(match){router.push({pathname:"/lesson/[activityId]",params:{activityId:match[1]}});return;}const activity=route.match(/^\/activity\/([^/]+)\/(.+)$/);if(activity){router.push({pathname:"/activity/[kind]/[activityId]",params:{kind:activity[1],activityId:activity[2]}});return;}router.push("/(tabs)");};
 return <Screen><View><Text style={s.eyebrow}>DESAFIOS EDUCACIONAIS</Text><Text style={s.title}>Minhas Missões</Text><Text style={s.muted}>Missões opcionais baseadas em atividades reais, sem punição por atraso.</Text></View>
 {items.map(({mission,progress})=><View style={s.card} key={mission.id}><Text style={s.small}>{progress.status==="expired"?"Expirada":progress.status==="completed"?"Concluída":mission.cadence==="daily"?"Hoje":"Esta semana"}{mission.endDate?" · até "+mission.endDate:""}</Text><Text style={s.heading}>{mission.title}</Text><Text style={s.muted}>{mission.description}</Text><Text style={s.progress}>{progress.current} de {progress.target} · {progress.percent}%</Text><View accessibilityRole="progressbar" accessibilityValue={{min:0,max:progress.target,now:Math.min(progress.current,progress.target)}} style={s.track}><View style={[s.fill,{width:(progress.percent+"%") as `${number}%`}]}/></View><Text style={s.small}>{mission.reason}</Text>{progress.status==="available"||progress.status==="in-progress"?<Pressable style={s.button} onPress={()=>open(mission.reference.route)}><Text style={s.buttonText}>Iniciar ou continuar</Text></Pressable>:null}</View>)}
 </Screen>;
}
const s=StyleSheet.create({eyebrow:{color:colors.tealDark,fontSize:11,fontWeight:"900",letterSpacing:1.2},title:{color:colors.navy,fontSize:30,fontWeight:"900"},heading:{color:colors.navy,fontSize:17,fontWeight:"900"},muted:{color:colors.muted,lineHeight:20},small:{color:colors.muted,fontSize:11},progress:{color:colors.tealDark,fontWeight:"900"},card:{gap:spacing.sm,padding:spacing.lg,borderRadius:radius.lg,borderWidth:1,borderColor:colors.border,backgroundColor:colors.surface},track:{height:8,borderRadius:4,overflow:"hidden",backgroundColor:colors.border},fill:{height:8,backgroundColor:colors.teal},button:{minHeight:46,alignItems:"center",justifyContent:"center",borderRadius:radius.md,backgroundColor:colors.teal},buttonText:{color:colors.navy,fontWeight:"900"}});
