import { useEffect,useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { nextJourneyActivityId } from "../../domain/unlocks";
import { orderedActivityIds } from "../../content/catalog";
import { generateMissions,missionHistory,reconcileMissionEvents,type MissionEvidence } from "../../domain/missions";
import { useApp } from "../../state/AppContext";
import { getReviewQueue } from "../../domain/review";
import { buildAdaptiveActivityCatalog,adaptiveWebPath } from "../../domain/adaptiveCatalog";
import { recommendAdaptiveNext } from "../../domain/adaptive";
import { CURATED_PREREQUISITES } from "../../domain/prerequisites";
import { webVisualAssets } from "../../assets/visualAssets";
const tz=()=>Intl.DateTimeFormat().resolvedOptions().timeZone||"UTC";
export function Missions(){
 const {state,dispatch}=useApp(),navigate=useNavigate();const evidence:MissionEvidence=useMemo(()=>({attempts:state.attempts,reviewItems:state.reviewItems,activity:state.activity,completedLessonIds:state.completedLessonIds,completedCheckpointIds:state.completedCheckpointIds,planEnrollments:state.planEnrollments,planCompletionEvents:state.planCompletionEvents}),[state]);
 const dailyMinutes=state.personalGoals.find(g=>g.active&&g.metric==="minutes"&&g.cadence==="daily")?.target??Math.max(5,Math.min(30,Math.round(state.profile.dailyGoal/10)));
 const next=nextJourneyActivityId(orderedActivityIds,state.completedLessonIds,state.completedCheckpointIds);
 const activities=useMemo(()=>buildAdaptiveActivityCatalog({completedLessonIds:state.completedLessonIds,completedCheckpointIds:state.completedCheckpointIds}),[state.completedLessonIds,state.completedCheckpointIds]);
 const adaptive=useMemo(()=>recommendAdaptiveNext({attempts:state.attempts,reviewItems:state.reviewItems,activities,prerequisites:CURATED_PREREQUISITES,goal:state.profile.goal,declaredLevel:state.profile.knowledgeLevel,ignoredRecommendationIds:state.ignoredRecommendationIds,recentRecommendationIds:state.recentRecommendationIds,limit:1}),[state.attempts,state.reviewItems,activities,state.profile.goal,state.profile.knowledgeLevel,state.ignoredRecommendationIds,state.recentRecommendationIds]);
 const recommendation=adaptive.recommendations.find(item=>item.kind!=="review"&&item.activityId&&item.activityKind);
 const generated=useMemo(()=>generateMissions({...evidence,existing:state.missionAssignments,timezone:tz(),dailyMinutes,nextLessonId:next,now:new Date(),recommendation:recommendation?{id:recommendation.id,title:recommendation.title,reason:recommendation.reason,activityId:recommendation.activityId,activityKind:recommendation.activityKind,conceptId:recommendation.conceptId,route:adaptiveWebPath(recommendation.activityKind!,recommendation.activityId!)}:undefined}),[evidence,state.missionAssignments,dailyMinutes,next,recommendation]);
 useEffect(()=>{generated.forEach(mission=>dispatch({type:"UPSERT_MISSION_ASSIGNMENT",mission}));},[dispatch,generated]);
 const assignments=useMemo(()=>[...state.missionAssignments,...generated.filter(g=>!state.missionAssignments.some(m=>m.id===g.id))],[state.missionAssignments,generated]);
 const lifecycle=useMemo(()=>reconcileMissionEvents(assignments,state.missionEvents,evidence,new Date()),[assignments,state.missionEvents,evidence]);
 useEffect(()=>{lifecycle.forEach(event=>dispatch({type:"RECORD_MISSION_EVENT",event}));},[dispatch,lifecycle]);
 const history=missionHistory(assignments,[...state.missionEvents,...lifecycle],evidence,new Date());const active=history.filter(x=>x.progress.status==="available"||x.progress.status==="in-progress");const completed=history.filter(x=>x.progress.status==="completed");const expired=history.filter(x=>x.progress.status==="expired");
 const section=(title:string,items:typeof history)=><section className="alternative-paths"><div className="section-title"><div><h2>{title}</h2></div></div>{items.length?items.map(({mission,progress})=><article className="context-card" key={mission.id}><small>{mission.cadence==="daily"?"Hoje":mission.cadence==="weekly"?"Esta semana":"Desafio temático"}{mission.endDate?" · até "+mission.endDate:""}</small><strong>{mission.title}</strong><p>{mission.description}</p><p><b>{progress.current} de {progress.target}</b> · {progress.percent}%</p><progress max={progress.target} value={Math.min(progress.current,progress.target)} aria-label={"Progresso de "+mission.title}/><small>{mission.reason}</small>{progress.status!=="expired"&&progress.status!=="completed"?<button className="small-button" onClick={()=>navigate(mission.reference.route)}>Iniciar ou continuar</button>:null}</article>):<div className="context-card"><p>Nenhuma missão nesta categoria.</p></div>}</section>;
 return <main className="page"><header className="home-header visual-hero compact" style={{backgroundImage:`linear-gradient(90deg, rgba(247,249,248,.98), rgba(247,249,248,.84)), url("${webVisualAssets.scenes.journey}")`}}><div className="visual-hero-copy"><p className="eyebrow">DESAFIOS EDUCACIONAIS</p><h1>Minhas Missões</h1><p>Objetivos opcionais, sem punições. O progresso vem das atividades reais do Bibliolingo.</p></div><img className="lumi-hero-art" src={webVisualAssets.lumi.adventurous} alt="Lumi pronta para acompanhar suas missões" /></header>
 {getReviewQueue(state.reviewItems,new Date()).length>0&&<p className="context-card">As revisões vencidas podem aparecer como reforço, sem modificar a agenda de memória.</p>}
 {section("Missões em andamento",active)}{section("Concluídas",completed)}{section("Histórico de expiradas",expired)}</main>;
}
