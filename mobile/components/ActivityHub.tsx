import { memo, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import type { MobileActivityKind } from "../domain/activityCatalog";
import { mobileActivityRoute } from "../domain/activityCatalog";
import { useMobileProgress } from "../providers/MobileProgressProvider";
import { colors, radius, spacing } from "../theme/tokens";

export interface HubActivity { id:string; title:string; subtitle?:string; checkpoint?:boolean }
export interface HubGroup { id:string; title:string; subtitle?:string; activities:HubActivity[] }

export const ActivityHub = memo(function ActivityHub({kind,groups,orderedIds}:{kind:MobileActivityKind;groups:HubGroup[];orderedIds:string[]}){
 const router=useRouter(); const {progress}=useMobileProgress();
 const completed=useMemo(()=>new Set([...progress.completedLessonIds,...progress.completedCheckpointIds]),[progress.completedLessonIds,progress.completedCheckpointIds]);
 const order=useMemo(()=>new Map(orderedIds.map((id,index)=>[id,index])),[orderedIds]);
 return <View style={styles.groups}>{groups.map((group,index)=>{
  const done=group.activities.reduce((count,item)=>count+(completed.has(item.id)?1:0),0);
  return <View key={group.id} style={styles.group}>
   <View style={styles.header}><View style={styles.number}><Text style={styles.numberText}>{index+1}</Text></View>
   <View style={styles.flex}><Text style={styles.groupTitle}>{group.title}</Text>{group.subtitle?<Text style={styles.groupSubtitle}>{group.subtitle}</Text>:null}</View>
   <Text style={styles.progress}>{done}/{group.activities.length}</Text></View>
   <View style={styles.items}>{group.activities.map(item=>{
    const itemIndex=order.get(item.id)??-1; const unlocked=itemIndex<=0||completed.has(orderedIds[itemIndex-1]); const isCompleted=completed.has(item.id);
    return <Pressable key={item.id} disabled={!unlocked} accessibilityRole="button" accessibilityState={{disabled:!unlocked}}
      onPress={()=>router.push(mobileActivityRoute(kind,item.id))}
      style={({pressed})=>[styles.item,isCompleted&&styles.completed,!unlocked&&styles.locked,pressed&&unlocked&&styles.pressed]}>
      <View style={[styles.node,item.checkpoint&&styles.checkpoint,isCompleted&&styles.completedNode]}>
       <Text style={styles.nodeText}>{isCompleted?"✓":item.checkpoint?"★":"•"}</Text></View>
      <View style={styles.flex}><Text style={styles.itemTitle}>{item.title}</Text><Text style={styles.itemSubtitle}>{item.subtitle??(item.checkpoint?"Checkpoint":"Lição")}</Text></View>
      <Text style={styles.state}>{isCompleted?"Feita":unlocked?"Começar":"Bloqueada"}</Text>
    </Pressable>;
   })}</View>
  </View>;
 })}</View>;
});
const styles=StyleSheet.create({
 groups:{gap:spacing.lg},group:{backgroundColor:colors.surface,borderRadius:radius.lg,borderWidth:1,borderColor:colors.border,overflow:"hidden"},
 header:{flexDirection:"row",alignItems:"center",gap:spacing.md,padding:spacing.lg,backgroundColor:colors.navy},number:{width:34,height:34,borderRadius:17,
 alignItems:"center",justifyContent:"center",backgroundColor:colors.teal},numberText:{color:colors.navy,fontWeight:"900"},flex:{flex:1},
 groupTitle:{color:colors.surface,fontSize:17,fontWeight:"900"},groupSubtitle:{color:"#cddbe4",fontSize:13,marginTop:2},progress:{color:colors.gold,fontWeight:"900"},
 items:{padding:spacing.md,gap:spacing.sm},item:{minHeight:70,flexDirection:"row",alignItems:"center",gap:spacing.md,borderRadius:radius.md,padding:spacing.sm},
 completed:{backgroundColor:"#fff7df"},locked:{opacity:.5},pressed:{backgroundColor:"#e5f7f4"},node:{width:48,height:48,borderRadius:24,alignItems:"center",
 justifyContent:"center",backgroundColor:colors.teal},checkpoint:{backgroundColor:colors.gold},completedNode:{backgroundColor:colors.gold},nodeText:{color:colors.navy,fontSize:18,fontWeight:"900"},
 itemTitle:{color:colors.navy,fontSize:15,fontWeight:"800"},itemSubtitle:{color:colors.muted,fontSize:12,marginTop:3},state:{color:colors.tealDark,fontSize:12,fontWeight:"800"}
});
