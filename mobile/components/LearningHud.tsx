import { StyleSheet, Text, View } from "react-native";
import { ProgressBar } from "./ProgressBar";
import { colors, radius, spacing } from "../theme/tokens";

export function LearningHud({streak,xp,hearts,maxHearts,progress,label}:{streak:number;xp:number;hearts:number;maxHearts:number;progress?:number;label?:string}){
 return <View style={styles.root}>
  <View style={styles.row}>
   <HudItem symbol="🔥" value={String(streak)} label="sequência"/>
   <View style={styles.divider}/><HudItem symbol="⚡" value={String(xp)} label="XP"/>
   <View style={styles.divider}/><HudItem symbol="♥" value={hearts+"/"+maxHearts} label="corações"/>
  </View>
  {typeof progress==="number"?<View style={styles.progress}><View style={styles.progressHeader}><Text style={styles.progressLabel}>{label??"Progresso"}</Text><Text style={styles.progressValue}>{Math.round(Math.max(0,Math.min(1,progress))*100)}%</Text></View><ProgressBar value={progress}/></View>:null}
 </View>;
}
function HudItem({symbol,value,label}:{symbol:string;value:string;label:string}){return <View style={styles.item}><Text style={styles.symbol}>{symbol}</Text><View><Text style={styles.value}>{value}</Text><Text style={styles.label}>{label}</Text></View></View>;}
const styles=StyleSheet.create({root:{borderRadius:radius.lg,backgroundColor:"#10272b",borderWidth:1,borderColor:"#28484b",overflow:"hidden"},row:{minHeight:58,flexDirection:"row",alignItems:"center",justifyContent:"space-around",paddingHorizontal:spacing.sm},item:{flexDirection:"row",alignItems:"center",gap:6},symbol:{fontSize:16},value:{color:"#effaf4",fontSize:13,fontWeight:"900"},label:{color:"#9eb4b1",fontSize:9,fontWeight:"700"},divider:{width:1,height:28,backgroundColor:"#28484b"},progress:{gap:6,paddingHorizontal:spacing.md,paddingBottom:spacing.md},progressHeader:{flexDirection:"row",justifyContent:"space-between"},progressLabel:{color:"#cfe3df",fontSize:10,fontWeight:"800"},progressValue:{color:"#82e96e",fontSize:10,fontWeight:"900"}});
