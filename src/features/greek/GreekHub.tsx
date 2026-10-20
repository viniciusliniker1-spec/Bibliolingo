import { Link, useNavigate } from "react-router-dom";
import { greekActivityIds, greekUnits } from "../../content/greek/catalog";
import { useApp } from "../../state/AppContext";

function complete(state: ReturnType<typeof useApp>["state"], id: string) {
  return state.completedLessonIds.includes(id) || state.completedCheckpointIds.includes(id);
}
function unlocked(state: ReturnType<typeof useApp>["state"], id: string) {
  const index=greekActivityIds.indexOf(id);
  return index===0 || complete(state,greekActivityIds[index-1]);
}

export function GreekHub(){
  const {state}=useApp();
  const navigate=useNavigate();
  const done=greekActivityIds.filter((id)=>complete(state,id)).length;
  const next=greekActivityIds.find((id)=>unlocked(state,id)&&!complete(state,id));
  const attempts=state.attempts.filter((attempt)=>attempt.mode==="greek");
  const accuracy=attempts.length?Math.round(attempts.filter((item)=>item.correct).length/attempts.length*100):0;
  return <main className="greek-page">
    <header className="greek-hero"><button className="icon-button" aria-label="Voltar" onClick={()=>navigate("/")}>←</button><div><p className="eyebrow">Curso progressivo</p><h1><span lang="el">Ἑλληνική</span> · Grego Bíblico</h1><p>Aprenda a ler o Novo Testamento com método, contexto e humildade interpretativa.</p></div></header>
    <section className="greek-progress-card"><div><strong>{done}/{greekActivityIds.length}</strong><span>etapas concluídas</span></div><div><strong>{accuracy}%</strong><span>precisão</span></div><div><strong>8</strong><span>unidades</span></div></section>
    <div className="greek-actions">{next&&<Link className="primary-button" to={"/greek/activity/"+next}>Continuar curso</Link>}<Link className="secondary-button" to="/greek/dictionary">Dicionário Grego</Link></div>
    <section className="greek-curriculum" aria-label="Unidades do curso">
      {greekUnits.map((unit,unitIndex)=>{
        const first=unit.lessons[0].id; const open=unlocked(state,first); const unitDone=state.completedCheckpointIds.includes(unit.checkpoint.id);
        return <article className={"greek-unit "+(open?"":"locked")} key={unit.id}>
          <div className="greek-unit-number">{unitDone?"✓":unitIndex+1}</div>
          <div><p className="eyebrow">{unitDone?"Unidade concluída":open?"Disponível":"Bloqueada"}</p><h2>{unit.title}</h2><p>{unit.subtitle}</p>
            <div className="greek-lesson-list">{unit.lessons.map((lesson)=>{
              const canOpen=unlocked(state,lesson.id); const isDone=complete(state,lesson.id);
              return canOpen?<Link to={"/greek/activity/"+lesson.id} key={lesson.id}><span>{isDone?"✓":"○"}</span>{lesson.title}</Link>:<span key={lesson.id}><span>🔒</span>{lesson.title}</span>;
            })}
            {unlocked(state,unit.checkpoint.id)?<Link to={"/greek/activity/"+unit.checkpoint.id}><span>{unitDone?"✓":"★"}</span>Avaliação da unidade</Link>:<span><span>🔒</span>Avaliação da unidade</span>}</div>
          </div>
        </article>;
      })}
    </section>
    <p className="greek-source-note">Dados lexicais: STEP Bible Data/TBESG, CC BY 4.0. O curso distingue glosa, tradução contextual e interpretação.</p>
  </main>;
}
