import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ExerciseView } from "../../components/ExerciseView";
import { ProgressBar } from "../../components/ProgressBar";
import { greekActivityById, greekActivityIds, greekUnitByActivityId } from "../../content/greek/catalog";
import { checkpointPassed } from "../../domain/checkpoint";
import { useApp } from "../../state/AppContext";
import type { Checkpoint, Exercise, LearningStep, Lesson } from "../../types/content";
import { NoahTutor } from "../noah/NoahTutor";

export function GreekPlayer(){
 const {activityId}=useParams(); const navigate=useNavigate(); const {state,dispatch}=useApp();
 const activity=activityId?greekActivityById.get(activityId):undefined; const unit=activityId?greekUnitByActivityId.get(activityId):undefined;
 const isCheckpoint=Boolean(activity&&"exercises" in activity); const steps=useMemo(()=>!activity?[]:isCheckpoint?(activity as Checkpoint).exercises:(activity as Lesson).steps,[activity,isCheckpoint]);
 const [index,setIndex]=useState(0); const [finished,setFinished]=useState(false);
 useEffect(()=>{if(!activityId||!activity)return;dispatch({type:"START_SESSION",lessonId:activityId});setIndex(state.activeSession?.lessonId===activityId?state.activeSession.stepIndex:0);},[activityId,activity]);
 if(!activity||!activityId)return <main className="center-state"><h1>Atividade não encontrada</h1><button className="primary-button" onClick={()=>navigate("/greek")}>Voltar ao curso</button></main>;
 const title=activity.title; const current=steps[index]; const answers=state.activeSession?.answers??{};
 const finish=()=>{const values=Object.values(answers);const total=steps.filter((step)=>step.type!=="learn").length;const correct=values.filter(Boolean).length;const accuracy=total?correct/total:1;const passed=!isCheckpoint||checkpointPassed(correct,total,(activity as Checkpoint).passAccuracy);dispatch({type:"FINISH",lessonId:activityId,checkpoint:isCheckpoint,perfect:correct===total,passed,durationSeconds:Math.max(1,Math.round((Date.now()-new Date(state.activeSession?.startedAt??Date.now()).getTime())/1000))});setFinished(true);};
 const next=()=>{if(index>=steps.length-1)finish();else{const n=index+1;setIndex(n);dispatch({type:"SET_STEP",stepIndex:n});window.scrollTo({top:0,behavior:"smooth"});}};
 if(finished){const pos=greekActivityIds.indexOf(activityId);const nextId=greekActivityIds[pos+1];return <main className="completion-page"><section className="completion-card"><div className="completion-badge">🇬🇷</div><p className="eyebrow">Etapa concluída</p><h1>{title}</h1><p>Seu progresso, XP e sequência diária foram atualizados.</p><button className="primary-button" onClick={()=>nextId?navigate("/greek/activity/"+nextId):navigate("/greek")}>{nextId?"Começar próximo passo":"Ver minha evolução"}</button><button className="secondary-button" onClick={()=>navigate("/greek")}>Voltar ao curso</button></section></main>;}
 const reference=current?.reference;
 return <main className="lesson-page greek-player-page">
  <header className="lesson-topbar"><button className="icon-button" aria-label="Sair" onClick={()=>navigate("/greek")}>×</button><ProgressBar value={index+1} max={steps.length} label="Progresso da lição de grego"/><div className="heart-counter">⚡ {state.xp}</div></header>
  <div className="lesson-context"><span>Grego Bíblico · {unit?.title}</span><strong>{title}</strong></div>
  {current?.type==="learn"?<section className="learn-card greek-learn-card"><div className="layer-badge history">Língua grega</div><h1 lang="el">{current.title}</h1><p>{current.body}</p>{current.keyPoints&&<ul>{current.keyPoints.map((point)=><li key={point}>{point}</li>)}</ul>}<p className="reference">{reference?.label}</p><button className="primary-button sticky-action" onClick={next}>Continuar</button></section>:current?<ExerciseView exercise={current as Exercise} result={answers[(current as Exercise).id]} onAnswer={(correct)=>dispatch({type:"ANSWER",questionId:(current as Exercise).id,lessonId:activityId,conceptId:(current as Exercise).conceptId,difficulty:(current as Exercise).difficulty,correct,mode:"greek"})} onContinue={next} continueLabel={index===steps.length-1?"Ver resultado":"Continuar"} soundEnabled={state.settings.soundEnabled} hapticsEnabled={state.settings.hapticsEnabled} failureNote="Conceito de grego adicionado à revisão"/>:null}
  <NoahTutor label="Praticar com Noah" context={{area:"greek",title,objective:current&&current.type!=="learn"?current.objective:undefined,reference:reference?.label,content:current?.type==="learn"?current.body:current?.explanation,currentQuestion:current&&current.type!=="learn"?current.prompt:undefined}}/>
 </main>;
}
