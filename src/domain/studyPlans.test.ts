import { describe, expect, it } from "vitest";
import {
  STUDY_PLAN_CATALOG, addLocalDays, createBookReadingPlan, createEnrollment, latestCompletionMap,
  localDateFromKey, personalGoalProgress, planProgress, reorganizeEnrollment, scheduledSteps, updateEnrollmentStatus,
  validateReadingPlan, expectedChaptersForPlan, type PlanCompletionEvent
} from "./studyPlans";

const event=(id:string,enrollmentId:string,stepId:string,completed:boolean,day="2026-10-18"):PlanCompletionEvent=>({
  id,enrollmentId,stepId,completed,occurredAt:day+"T12:00:00.000Z",localDate:day,timezone:"America/Sao_Paulo"
});

describe("metas, planos e calendário",()=>{
  it("valida cobertura integral e sem duplicações dos planos publicados",()=>{
    for(const plan of STUDY_PLAN_CATALOG){
      const result=validateReadingPlan(plan,expectedChaptersForPlan(plan.id));
      expect(result.valid,plan.id).toBe(true);
      expect(result.duplicateChapters).toEqual([]);
      expect(result.missingChapters).toEqual([]);
    }
  });

  it("cria plano personalizado somente para livro existente e prazo válido",()=>{
    const plan=createBookReadingPlan("Rom",30);
    expect(plan.steps.flatMap(step=>step.chapters??[])).toHaveLength(16);
    expect(()=>createBookReadingPlan("Missing",30)).toThrow("inexistente");
    expect(()=>createBookReadingPlan("Rom",0)).toThrow("duração");
  });

  it("inicia plano com snapshot versionado e cronograma independente",()=>{
    const plan=createBookReadingPlan("Phlm",1);
    const enrollment=createEnrollment(plan,{id:"e1",startDate:"2026-10-18",studyWeekdays:[0,2]});
    expect(enrollment.planVersion).toBe(plan.version);
    expect(enrollment.stepsSnapshot).not.toBe(plan.steps);
    expect(enrollment.translationId).toBe("almeida-1819");
  });

  it("distribui um livro pelo período solicitado sem inventar etapas",()=>{
    const plan=createBookReadingPlan("Rom",30);
    const enrollment=createEnrollment(plan,{id:"romans",startDate:"2026-10-01",studyWeekdays:[0,1,2,3,4,5,6]});
    const dates=scheduledSteps(enrollment,[]).map(item=>item.scheduledDate);
    expect(dates).toHaveLength(16);
    expect(dates.at(-1)).toBe("2026-10-30");
    expect(enrollment.targetEndDate).toBe("2026-10-30");
  });

  it("trata ano bissexto, virada de mês e datas civis inválidas",()=>{
    expect(addLocalDays("2028-02-28",1)).toBe("2028-02-29");
    expect(addLocalDays("2028-02-29",1)).toBe("2028-03-01");
    expect(()=>localDateFromKey("2027-02-29")).toThrow();
  });

  it("respeita dias de estudo sem depender de UTC",()=>{
    const plan=createBookReadingPlan("Ruth",4);
    const enrollment=createEnrollment(plan,{id:"e1",startDate:"2026-10-18",studyWeekdays:[1,3]});
    expect(scheduledSteps(enrollment,[]).map(item=>item.scheduledDate)).toEqual(["2026-10-19","2026-10-21","2026-10-26","2026-10-28"]);
  });

  it("conclui e desmarca uma etapa sem duplicar o estado atual",()=>{
    const enrollment=createEnrollment(createBookReadingPlan("Phlm",1),{id:"e1",startDate:"2026-10-18",studyWeekdays:[0]});
    const step=enrollment.stepsSnapshot[0];
    const events=[event("a","e1",step.id,true),event("b","e1",step.id,false,"2026-10-19")];
    expect(latestCompletionMap(events).get("e1:"+step.id)?.completed).toBe(false);
    expect(planProgress(enrollment,events).completed).toBe(0);
  });

  it("mantém progresso independente em múltiplos planos",()=>{
    const first=createEnrollment(createBookReadingPlan("Phlm",1),{id:"a",startDate:"2026-10-18",studyWeekdays:[0]});
    const second=createEnrollment(createBookReadingPlan("Obad",1),{id:"b",startDate:"2026-10-18",studyWeekdays:[0]});
    const events=[event("x","a",first.stepsSnapshot[0].id,true)];
    expect(planProgress(first,events).complete).toBe(true);
    expect(planProgress(second,events).complete).toBe(false);
  });

  it("pausa, retoma e arquiva sem apagar histórico",()=>{
    const enrollment=createEnrollment(createBookReadingPlan("Phlm",1),{id:"e",startDate:"2026-10-18",studyWeekdays:[0]});
    expect(updateEnrollmentStatus(enrollment,"paused").status).toBe("paused");
    expect(updateEnrollmentStatus(enrollment,"active").stepsSnapshot).toEqual(enrollment.stepsSnapshot);
    expect(updateEnrollmentStatus(enrollment,"archived").status).toBe("archived");
  });

  it("reorganiza apenas etapas pendentes e preserva conclusão",()=>{
    const enrollment=createEnrollment(createBookReadingPlan("Ruth",4),{id:"e",startDate:"2026-10-01",studyWeekdays:[1,2,3,4,5]});
    const completed=enrollment.stepsSnapshot[0],pending=enrollment.stepsSnapshot.slice(1);
    const events=[event("x","e",completed.id,true,"2026-10-01")];
    const before=scheduledSteps(enrollment,events,"2026-10-18")[0].scheduledDate;
    const changed=reorganizeEnrollment(enrollment,{strategy:"from-today",today:"2026-10-18",pendingStepIds:pending.map(step=>step.id)});
    expect(scheduledSteps(changed,events,"2026-10-18")[0].scheduledDate).toBe(before);
    expect(planProgress(changed,events).completed).toBe(1);
    expect(changed.scheduleRevision).toBe(2);
  });

  it("não marca capítulo apenas por abrir e preserva releitura por plano",()=>{
    const plan=createBookReadingPlan("Phlm",1);
    const a=createEnrollment(plan,{id:"a",startDate:"2026-10-18",studyWeekdays:[0]});
    const b=createEnrollment(plan,{id:"b",startDate:"2026-10-18",studyWeekdays:[0]});
    expect(planProgress(a,[]).completed).toBe(0);
    const events=[event("x","a",a.stepsSnapshot[0].id,true)];
    expect(planProgress(b,events).completed).toBe(0);
  });

  it("preserva snapshot após futura atualização do catálogo",()=>{
    const plan=createBookReadingPlan("Phlm",1);
    const enrollment=createEnrollment(plan,{id:"e",startDate:"2026-10-18",studyWeekdays:[0]});
    plan.steps[0].title="Título editorial novo";
    expect(enrollment.stepsSnapshot[0].title).not.toBe(plan.steps[0].title);
  });
  it("calcula metas diárias e semanais somente com atividade real",()=>{
    const goal={id:"g",title:"15 minutos",metric:"minutes" as const,cadence:"daily" as const,target:15,active:true,createdAt:"",updatedAt:""};
    const daily=personalGoalProgress(goal,{activity:{"2026-10-18":{seconds:900,lessons:1}},attempts:[],completionEvents:[],enrollments:[],now:new Date(2026,9,18,12)});
    expect(daily.completed).toBe(true);
    const weekly=personalGoalProgress({...goal,cadence:"weekly",target:30},{activity:{"2026-10-13":{seconds:900,lessons:1},"2026-10-18":{seconds:900,lessons:1}},attempts:[],completionEvents:[],enrollments:[],now:new Date(2026,9,18,12)});
    expect(weekly.value).toBe(30);
  });

  it("contabiliza leitura confirmada, sem confundir simples abertura",()=>{
    const enrollment=createEnrollment(createBookReadingPlan("Phlm",1),{id:"e",startDate:"2026-10-18",studyWeekdays:[0]});
    const goal={id:"g",title:"capítulo",metric:"chapters" as const,cadence:"daily" as const,target:1,active:true,createdAt:"",updatedAt:""};
    const input={activity:{},attempts:[],enrollments:[enrollment],now:new Date(2026,9,18,12)};
    expect(personalGoalProgress(goal,{...input,completionEvents:[]}).value).toBe(0);
    expect(personalGoalProgress(goal,{...input,completionEvents:[event("x","e",enrollment.stepsSnapshot[0].id,true)]}).value).toBe(1);
  });

});
