import { StyleSheet, Text, View } from "react-native";
import { deepenActivityIds, deepenGenesisUnit } from "../../../src/content/deepen/catalog";
import { ActivityHub } from "../../components/ActivityHub";
import { Screen } from "../../components/Screen";
import { colors } from "../../theme/tokens";
export default function DeepenHubScreen(){
 const groups=[{id:deepenGenesisUnit.id,title:deepenGenesisUnit.title,subtitle:deepenGenesisUnit.subtitle,activities:[
  ...deepenGenesisUnit.lessons.map(lesson=>({id:lesson.id,title:lesson.title,subtitle:`${lesson.estimatedMinutes} min`})),
  {id:deepenGenesisUnit.checkpoint.id,title:deepenGenesisUnit.checkpoint.title,subtitle:"Checkpoint avançado",checkpoint:true}
 ]}];
 return <Screen><View><Text style={styles.eyebrow}>ESTUDO AVANÇADO</Text><Text style={styles.title}>Aprofundar</Text>
 <Text style={styles.subtitle}>Exegese progressiva, fontes rastreáveis, limites interpretativos e aplicação responsável.</Text></View>
 <ActivityHub kind="deepen" groups={groups} orderedIds={deepenActivityIds}/></Screen>;
}
const styles=StyleSheet.create({eyebrow:{color:colors.tealDark,fontSize:12,fontWeight:"900",letterSpacing:1.2},title:{color:colors.navy,fontSize:30,fontWeight:"900"},
 subtitle:{color:colors.muted,fontSize:16,lineHeight:24}});
