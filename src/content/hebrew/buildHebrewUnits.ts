import type { BibleReference, Exercise, Lesson, MultipleChoiceExercise, Unit } from "../../types/content";

export interface HebrewLessonSeed {
 title:string; subtitle:string; concept:[string,string]; reference:BibleReference;
 teaching:string; practice:string;
 question:[string,string,string,string,string,string];
 fill:[string,string,string,string,string,string,string];
}
export interface HebrewUnitSeed {id:string;title:string;subtitle:string;objectives:string[];lessons:HebrewLessonSeed[]}
const options=(id:string,values:string[])=>values.map((text,index)=>({id:id+"-a"+(index+1),text}));
export function buildHebrewUnits(seeds:HebrewUnitSeed[]):Unit[]{
 return seeds.map((unitSeed,unitIndex)=>{
  const difficulty:Exercise["difficulty"]=unitIndex<2?"easy":unitIndex<6?"medium":"hard";
  const lessons:Lesson[]=unitSeed.lessons.map((seed,lessonIndex)=>{
   const id=unitSeed.id+"-l"+String(lessonIndex+1).padStart(2,"0"),qid=id+"-q01";
   const [prompt,correct,d1,d2,d3,explanation]=seed.question;
   const first:MultipleChoiceExercise={id:qid,type:"multiple-choice",prompt,options:options(qid,[correct,d1,d2,d3]),correctOptionId:qid+"-a1",objective:"Reconhecer "+seed.concept[1].toLocaleLowerCase("pt-BR"),explanation,reference:seed.reference,conceptId:seed.concept[0],difficulty};
   const secondId=id+"-q02";const [before,fillCorrect,after,fd1,fd2,fd3,fillExplanation]=seed.fill;
   const second:Exercise={id:secondId,type:"fill-choice",prompt:"Complete a análise",sentenceBefore:before,sentenceAfter:after,options:options(secondId,[fillCorrect,fd1,fd2,fd3]),correctOptionId:secondId+"-a1",objective:"Aplicar "+seed.concept[1].toLocaleLowerCase("pt-BR"),explanation:fillExplanation,reference:seed.reference,conceptId:seed.concept[0],difficulty};
   return {id,contentVersion:1,title:seed.title,subtitle:seed.subtitle,estimatedMinutes:10,references:[seed.reference],conceptIds:[seed.concept[0]],steps:[
    {id:id+"-s01",type:"learn",title:seed.title,body:seed.teaching,layer:"history",keyPoints:[seed.concept[1],seed.subtitle],reference:seed.reference},
    first,
    {id:id+"-s02",type:"learn",title:"Prática guiada",body:seed.practice,layer:"application",keyPoints:["Observe a forma antes de traduzir","Confirme a análise pelo contexto"],reference:seed.reference},
    second
   ]};
  });
  const checkpoint=lessons.map((lesson,index)=>{const source=lesson.steps.find((step):step is MultipleChoiceExercise=>step.type==="multiple-choice")!;const id=unitSeed.id+"-checkpoint-q"+String(index+1).padStart(2,"0");return {...source,id,options:source.options.map((item,i)=>({id:id+"-a"+(i+1),text:item.text})),correctOptionId:id+"-a1",difficulty:"hard" as const};});
  return {id:unitSeed.id,contentVersion:1,title:unitSeed.title,subtitle:unitSeed.subtitle,bookId:"hebrew-aramaic",chapters:[unitIndex+1],concepts:unitSeed.lessons.map(lesson=>({id:lesson.concept[0],title:lesson.concept[1],importance:3 as const})),lessons,checkpoint:{id:unitSeed.id+"-checkpoint",contentVersion:1,title:"Avaliação: "+unitSeed.title,subtitle:"Aprovação com 80% e revisão dos conceitos frágeis.",passAccuracy:.8,exercises:checkpoint},sources:[{id:"openscriptures-oshb",title:"Open Scriptures Hebrew Bible",institution:"Open Scriptures",url:"https://github.com/openscriptures/morphhb",license:"WLC em domínio público; lema e morfologia CC BY 4.0",language:"Hebrew / Aramaic",coverageRead:"Texto, lemas e morfologia do Antigo Testamento",limitations:["Glosas portuguesas são sínteses pedagógicas; o contexto determina a tradução"],applicableUnitIds:[unitSeed.id],status:"catalogued"}]};
 });
}
