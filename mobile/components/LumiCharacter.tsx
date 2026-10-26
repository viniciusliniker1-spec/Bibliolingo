import { useEffect, useRef } from "react";
import { AccessibilityInfo, Animated, Easing, Image, Text, View, type ImageStyle, type StyleProp, StyleSheet } from "react-native";
import { mobileFeedbackAssets } from "../assets/feedbackAssets";
import { useMobileLumi } from "../providers/MobileLumiProvider";
import { useMobileProgress } from "../providers/MobileProgressProvider";
import type { LumiCategory } from "../../src/domain/lumi";

export type LumiMood=keyof typeof mobileFeedbackAssets;
type LumiMotion="calm"|"thinking"|"encouraging"|"celebrating";
interface LumiCharacterProps{mood:LumiMood;motion?:LumiMotion;accessibilityLabel:string;style?:StyleProp<ImageStyle>}

const symbols:Record<LumiCategory,string>={head:"◒",glasses:"◎",outfit:"◆",backpack:"▣",special:"✦",celebration:"★"};
const positions:Record<LumiCategory,{top?:string;bottom?:string;left?:string;right?:string}>={
 head:{top:"2%",left:"40%"},glasses:{top:"28%",left:"42%"},outfit:{bottom:"12%",left:"42%"},
 backpack:{top:"48%",right:"2%"},special:{top:"8%",right:"3%"},celebration:{bottom:"2%",right:"8%"}
};

export function LumiCharacter({mood,motion="calm",accessibilityLabel,style}:LumiCharacterProps){
 const entrance=useRef(new Animated.Value(0)).current;const loop=useRef(new Animated.Value(0)).current;const {progress}=useMobileProgress();const lumi=useMobileLumi();const userReduced=Boolean(progress.settings.reduceMotionEnabled);
 useEffect(()=>{let active=true;const enter=Animated.timing(entrance,{toValue:1,duration:320,easing:Easing.out(Easing.cubic),useNativeDriver:true});const repeat=Animated.loop(Animated.sequence([Animated.timing(loop,{toValue:1,duration:motion==="celebrating"?460:1500,easing:Easing.inOut(Easing.sin),useNativeDriver:true}),Animated.timing(loop,{toValue:0,duration:motion==="celebrating"?460:1500,easing:Easing.inOut(Easing.sin),useNativeDriver:true})]));entrance.setValue(0);loop.setValue(0);
  void AccessibilityInfo.isReduceMotionEnabled().then(systemReduced=>{if(!active)return;if(userReduced||systemReduced){entrance.setValue(1);loop.setValue(0);return;}enter.start();repeat.start();});
  return()=>{active=false;enter.stop();repeat.stop();};
 },[entrance,loop,mood,motion,userReduced]);
 const lift=motion==="celebrating"?-10:motion==="encouraging"?-5:motion==="thinking"?-3:-4;const scale=motion==="celebrating"?1.06:motion==="encouraging"?1.025:1.015;
 const equipped=lumi.state.equipment.map(entry=>({entry,item:lumi.state.items.find(item=>item.id===entry.itemId)})).filter(value=>Boolean(value.item));
 return <Animated.View pointerEvents="none" style={[styles.wrapper,{opacity:entrance,transform:[{translateY:Animated.add(entrance.interpolate({inputRange:[0,1],outputRange:[14,0]}),loop.interpolate({inputRange:[0,1],outputRange:[0,lift]}))},{scale:loop.interpolate({inputRange:[0,1],outputRange:[1,scale]})}]}]}>
  <Image source={mobileFeedbackAssets[mood]} style={style} resizeMode="contain" accessibilityLabel={accessibilityLabel} accessibilityIgnoresInvertColors/>
  {equipped.map(({entry,item})=><View key={entry.category} accessibilityElementsHidden style={[styles.layer,positions[entry.category],item?.assetStatus==="pending"&&styles.pending]}><Text style={styles.layerText}>{symbols[entry.category]}</Text></View>)}
 </Animated.View>;
}
const styles=StyleSheet.create({
 wrapper:{alignSelf:"center",position:"relative"},
 layer:{position:"absolute",width:24,height:24,borderRadius:12,alignItems:"center",justifyContent:"center",backgroundColor:"#f2c766",borderWidth:2,borderColor:"#10272b"},
 pending:{borderStyle:"dashed",opacity:.9},
 layerText:{color:"#10272b",fontSize:13,fontWeight:"900"}
});
