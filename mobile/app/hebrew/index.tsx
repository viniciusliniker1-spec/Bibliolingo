import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { hebrewActivityIds, hebrewUnits } from "../../../src/content/hebrew/catalog";
import { ActivityHub } from "../../components/ActivityHub";
import { PrimaryButton } from "../../components/PrimaryButton";
import { Screen } from "../../components/Screen";
import { colors } from "../../theme/tokens";
export default function HebrewScreen(){
 const router=useRouter();
 const groups=hebrewUnits.map(unit=>({id:unit.id,title:unit.title,subtitle:unit.subtitle,activities:[...unit.lessons.map(lesson=>({id:lesson.id,title:lesson.title,subtitle:`${lesson.estimatedMinutes} min`})),{id:unit.checkpoint.id,title:unit.checkpoint.title,subtitle:"Checkpoint",checkpoint:true}]}));
 return <Screen><View><Text style={styles.eyebrow}>LÍNGUAS DO ANTIGO TESTAMENTO</Text><Text style={styles.title}>Hebraico e Aramaico Bíblico</Text><Text style={styles.subtitle}>8 unidades, 32 lições e leitura guiada com o texto original incluído no aplicativo.</Text></View>
 <PrimaryButton variant="secondary" onPress={()=>router.push("/hebrew/dictionary")}>Abrir dicionário hebraico/aramaico</PrimaryButton>
 <ActivityHub kind="hebrew" groups={groups} orderedIds={hebrewActivityIds}/>
 </Screen>;
}
const styles=StyleSheet.create({eyebrow:{color:colors.tealDark,fontSize:12,fontWeight:"900",letterSpacing:1.2},title:{color:colors.navy,fontSize:28,fontWeight:"900"},subtitle:{color:colors.muted,fontSize:16,lineHeight:24}});
