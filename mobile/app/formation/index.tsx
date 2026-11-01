import { useMemo, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { formationActivityTitle, formationContent, orderedFormationActivityIds } from "../../../src/content/formation/catalog";
import { ActivityHub } from "../../components/ActivityHub";
import { PrimaryButton } from "../../components/PrimaryButton";
import { Screen } from "../../components/Screen";
import { colors, radius, spacing } from "../../theme/tokens";
let formationGranted=false;
export default function FormationHubScreen(){
 const [granted,setGranted]=useState(formationGranted); const [code,setCode]=useState(""); const [error,setError]=useState("");
 const groups=useMemo(()=>{
  const items=formationContent.subjects.map(subject=>({id:subject.id,title:subject.title,subtitle:subject.description,activities:[
   ...subject.lessonIds.map(id=>({id,title:formationActivityTitle(id)})),
   {id:subject.examId,title:formationActivityTitle(subject.examId),subtitle:"Prova da matéria",checkpoint:true}
  ]}));
  items.push({id:"final",title:"Simulado final",subtitle:"30 questões da formação",activities:[{id:formationContent.finalExam.id,title:formationContent.finalExam.title,subtitle:"Avaliação final",checkpoint:true}]});
  return items;
 },[]);
 if(!granted)return <Screen contentStyle={styles.center}><Text style={styles.eyebrow}>ACESSO DE SESSÃO</Text><Text style={styles.title}>Formação Pastoral Nazarena</Text>
  <Text style={styles.subtitle}>Digite o código fornecido. Esta senha fixa protege apenas a navegação da interface; não é autenticação para conteúdo confidencial.</Text>
  <TextInput value={code} onChangeText={setCode} secureTextEntry keyboardType="number-pad" placeholder="Código de acesso" style={styles.input}/>
  {error?<Text style={styles.error}>{error}</Text>:null}
  <PrimaryButton onPress={()=>{if(code==="12345"){formationGranted=true;setGranted(true);setError("");}else setError("Código inválido.");}}>Entrar na formação</PrimaryButton>
 </Screen>;
 return <Screen><View><Text style={styles.eyebrow}>FORMAÇÃO PASTORAL</Text><Text style={styles.title}>{formationContent.title}</Text>
 <Text style={styles.subtitle}>{formationContent.disclaimer}</Text></View><ActivityHub kind="formation" groups={groups} orderedIds={orderedFormationActivityIds}/></Screen>;
}
const styles=StyleSheet.create({center:{justifyContent:"center"},eyebrow:{color:colors.tealDark,fontSize:12,fontWeight:"900",letterSpacing:1.2},
 title:{color:colors.navy,fontSize:30,fontWeight:"900"},subtitle:{color:colors.muted,fontSize:16,lineHeight:24},input:{minHeight:52,borderRadius:radius.md,borderWidth:1,
 borderColor:colors.border,backgroundColor:colors.surface,paddingHorizontal:spacing.lg,fontSize:18,color:colors.navy},error:{color:colors.error,fontWeight:"700"}});
