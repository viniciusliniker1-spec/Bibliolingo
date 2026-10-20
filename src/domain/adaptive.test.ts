import { describe, expect, it } from "vitest";
import { buildAdaptiveProfile, recommendAdaptiveNext, type AdaptiveActivity } from "./adaptive";
import type { QuestionAttempt, ReviewItem } from "../types/progress";

const NOW = new Date("2026-10-18T12:00:00.000Z");
const activities: AdaptiveActivity[] = [
  { id: "romans-1", kind: "bible", title: "Romanos", estimatedMinutes: 8, checkpoint: false, accessible: true, completed: false, order: 1,
    concepts: [{ id: "romans-authorship", title: "Autoria de Romanos" }] },
  { id: "greek-1", kind: "greek", title: "Alfabeto", estimatedMinutes: 6, checkpoint: false, accessible: true, completed: false, order: 2,
    concepts: [{ id: "greek-alphabet", title: "Alfabeto grego" }] }
];
const attempt = (id:string, conceptId:string, correct:boolean, day:number, questionId=id, mode:QuestionAttempt["mode"]="lesson"):QuestionAttempt => ({
  id, conceptId, questionId, lessonId:"lesson", correct, difficulty:"medium",
  answeredAt:`2026-10-${String(day).padStart(2,"0")}T12:00:00.000Z`, mode
});
const review = (conceptId:string, dueDate:string):ReviewItem => ({
  conceptId, questionId:"review-q", dueDate, intervalIndex:1, lapses:0, lastResult:"correct",
  lastReviewedAt:"2026-10-10T12:00:00.000Z", state:"review", stabilityDays:4,
  difficultyScore:5, retrievability:.8, repetitions:2, attempts:2, scheduledDays:4
});

describe("motor adaptativo", () => {
  it("mantém aluno sem histórico como evidências insuficientes", () => {
    const profile=buildAdaptiveProfile([],[],activities,NOW);
    expect(profile.insufficientEvidence).toBe(true);
    expect(profile.concepts).toEqual([]);
  });

  it("não apresenta primeiro contato como domínio", () => {
    const state=buildAdaptiveProfile([attempt("a","romans-authorship",true,17)],[],activities,NOW).concepts[0];
    expect(state.stage).toBe("first-contact");
    expect(state.evidenceLabel).toBe("Evidências insuficientes");
  });

  it("reconhece domínio somente com questões e dias independentes", () => {
    const attempts=[attempt("a","romans-authorship",true,10,"q1"),attempt("b","romans-authorship",true,12,"q2","review"),
      attempt("c","romans-authorship",true,15,"q3","checkpoint"),attempt("d","romans-authorship",true,17,"q4")];
    const state=buildAdaptiveProfile(attempts,[],activities,NOW).concepts[0];
    expect(state.stage).toBe("demonstrated");
    expect(state.masteryEstimate).toBeGreaterThanOrEqual(80);
  });

  it("identifica dificuldade recorrente sem confundir áreas", () => {
    const profile=buildAdaptiveProfile([
      attempt("a","romans-authorship",false,10,"q1"),attempt("b","romans-authorship",false,12,"q2"),
      attempt("c","greek-alphabet",true,10,"g1"),attempt("d","greek-alphabet",true,12,"g2")
    ],[],activities,NOW);
    expect(profile.difficulties.map(x=>x.conceptId)).toContain("romans-authorship");
    expect(profile.difficulties.map(x=>x.conceptId)).not.toContain("greek-alphabet");
  });

  it("prioriza revisão vencida e não antecipa revisão futura", () => {
    const result=recommendAdaptiveNext({attempts:[],reviewItems:[review("romans-authorship","2026-10-17"),review("greek-alphabet","2026-10-20")],
      activities,goal:"daily-habit",declaredLevel:"intermediate",now:NOW});
    expect(result.recommendations[0].id).toBe("review:romans-authorship");
    expect(result.recommendations.some(x=>x.id==="review:greek-alphabet")).toBe(false);
  });

  it("deduplica perguntas equivalentes e tentativas repetidas no mesmo dia", () => {
    const profile=buildAdaptiveProfile([
      attempt("a","romans-authorship",false,10,"same"),attempt("b","romans-authorship",true,10,"same"),
      attempt("c","romans-authorship",true,10,"equivalent")
    ],[],activities,NOW);
    const state=profile.concepts[0];
    expect(state.evidenceCount).toBe(2);
    expect(state.independentDays).toBe(1);
    expect(state.stage).not.toBe("demonstrated");
  });

  it("mantém conceitos relacionados porém distintos separados", () => {
    const profile=buildAdaptiveProfile([attempt("a","faith",true,10),attempt("b","grace",false,11)],[],[
      {...activities[0],concepts:[{id:"faith",title:"Fé"},{id:"grace",title:"Graça"}]}
    ],NOW);
    expect(profile.concepts.map(x=>x.conceptId).sort()).toEqual(["faith","grace"]);
  });

  it("orienta pré-requisito explícito sem bloquear exploração", () => {
    const custom:AdaptiveActivity[]=[
      {id:"advanced",kind:"greek",title:"Morfologia",estimatedMinutes:8,checkpoint:false,accessible:true,completed:false,order:1,concepts:[{id:"morphology",title:"Morfologia"}]},
      {id:"intro",kind:"greek",title:"Alfabeto",estimatedMinutes:5,checkpoint:false,accessible:true,completed:false,order:2,concepts:[{id:"alphabet",title:"Alfabeto"}]}
    ];
    const result=recommendAdaptiveNext({attempts:[],reviewItems:[],activities:custom,prerequisites:{morphology:["alphabet"]},
      goal:"daily-habit",declaredLevel:"beginner",now:NOW});
    expect(result.recommendations.some(x=>x.kind==="prerequisite"&&x.activityId==="intro")).toBe(true);
    expect(result.recommendations.some(x=>x.activityId==="advanced")).toBe(true);
  });

  it("não recomenda recurso removido, respeita ignorar e reduz repetição recente", () => {
    const result=recommendAdaptiveNext({attempts:[attempt("a","missing",false,10),attempt("b","missing",false,11)],reviewItems:[],
      activities,goal:"daily-habit",declaredLevel:"intermediate",ignoredRecommendationIds:["continue:bible:romans-1"],
      recentRecommendationIds:["continue:greek:greek-1"],now:NOW});
    expect(result.recommendations.some(x=>x.conceptId==="missing")).toBe(false);
    expect(result.recommendations.some(x=>x.id==="continue:bible:romans-1")).toBe(false);
  });

  it("usa retenção da Fase 3.1 sem depender do Professor Noah", () => {
    const state=buildAdaptiveProfile([attempt("a","romans-authorship",true,10)],[
      {...review("romans-authorship","2026-10-18"),retrievability:.25,lastResult:"incorrect",lapses:2}
    ],activities,NOW).concepts[0];
    expect(state.stage).toBe("review-needed");
    expect(state.retentionEstimate).toBeDefined();
  });
});
