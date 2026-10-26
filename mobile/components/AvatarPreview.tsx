import { StyleSheet, Text, View } from "react-native";
import { avatarEyeColors,avatarHairColors,avatarOutfits,avatarSkinTones,normalizeAvatar,type AvatarSelection } from "../domain/avatar";
interface Props{selection?:AvatarSelection;size?:number;accessibilityLabel?:string}
const value=(items:readonly {id:string;color:string}[],id:string,fallback:string)=>items.find(item=>item.id===id)?.color??fallback;
export function AvatarPreview({selection,size=220,accessibilityLabel="Prévia do avatar"}:Props){
 const avatar=normalizeAvatar(selection);const skin=value(avatarSkinTones,avatar.skinToneId,"#c98b62");const hair=value(avatarHairColors,avatar.hairColorId,"#5a3828");
 const eyes=value(avatarEyeColors,avatar.eyeColorId,"#4e342e");const outfit=avatarOutfits.find(item=>item.id===avatar.outfitId)??avatarOutfits[0];
 const styleIndex=Math.max(0,Number(avatar.hairStyleId.slice(-2))-1);const hairWidths=["70%","75%","80%","85%"] as const;const hairHeights=["18%","23%","28%"] as const;const longHair=avatar.presentation==="feminino"||[3,6,8].includes(styleIndex);
 return <View accessible accessibilityRole="image" accessibilityLabel={accessibilityLabel} style={[styles.canvas,{width:size,height:size,borderRadius:size*.16}]}>
  <View style={[styles.backpack,{opacity:avatar.accessoryId==="backpack"?1:0,backgroundColor:"#8b5b3d"}]}/>
  {longHair?<View style={[styles.hairBack,{backgroundColor:hair,height:styleIndex%3===0?"58%":"50%",width:styleIndex%2===0?"58%":"52%"}]}/>:null}
  <View style={[styles.body,{backgroundColor:skin}]}/>
  <View style={[styles.ear,styles.earLeft,{backgroundColor:skin}]}/><View style={[styles.ear,styles.earRight,{backgroundColor:skin}]}/>
  <View style={[styles.face,{backgroundColor:skin}]}>
   <View style={[styles.eye,styles.eyeLeft,{backgroundColor:eyes}]}/><View style={[styles.eye,styles.eyeRight,{backgroundColor:eyes}]}/>
   <View style={styles.nose}/><View style={styles.smile}/>
  </View>
  <View style={[styles.outfit,{backgroundColor:outfit.color}]}><View style={[styles.outfitAccent,{backgroundColor:outfit.accent}]}/></View>
  <View style={[styles.hairFront,{backgroundColor:hair,width:hairWidths[styleIndex%4],height:hairHeights[styleIndex%3],borderBottomLeftRadius:styleIndex%2?40:14,borderBottomRightRadius:styleIndex%3?24:48}]}/>
  {avatar.accessoryId==="cap"?<><View style={[styles.cap,{backgroundColor:outfit.color}]}/><View style={[styles.capBrim,{backgroundColor:outfit.color}]}/></>:null}
  {avatar.accessoryId==="glasses"?<View style={styles.glasses}><View style={styles.lens}/><View style={styles.bridge}/><View style={styles.lens}/></View>:null}
  {avatar.accessoryId==="chain"?<Text style={styles.chain}>⌣</Text>:null}
  <View style={styles.finish}/>
 </View>;
}
const styles=StyleSheet.create({canvas:{alignSelf:"center",overflow:"hidden",backgroundColor:"#dcefe9",borderWidth:1,borderColor:"#b6d9d0",position:"relative"},
 backpack:{position:"absolute",zIndex:0,left:"13%",right:"13%",bottom:"4%",height:"40%",borderRadius:34},
 hairBack:{position:"absolute",zIndex:1,top:"14%",alignSelf:"center",borderTopLeftRadius:70,borderTopRightRadius:70,borderBottomLeftRadius:36,borderBottomRightRadius:36},
 body:{position:"absolute",zIndex:2,width:"25%",height:"24%",borderRadius:40,alignSelf:"center",bottom:"25%"},
 ear:{position:"absolute",zIndex:2,top:"38%",width:"10%",height:"13%",borderRadius:30},earLeft:{left:"22%"},earRight:{right:"22%"},
 face:{position:"absolute",zIndex:3,top:"21%",alignSelf:"center",width:"54%",height:"47%",borderRadius:100,borderWidth:1,borderColor:"rgba(70,35,20,.12)"},
 eye:{position:"absolute",top:"45%",width:"7%",height:"10%",borderRadius:20},eyeLeft:{left:"25%"},eyeRight:{right:"25%"},
 nose:{position:"absolute",top:"57%",left:"48%",width:"4%",height:"7%",borderRadius:10,backgroundColor:"rgba(100,50,30,.16)"},
 smile:{position:"absolute",bottom:"18%",left:"38%",width:"24%",height:"10%",borderBottomWidth:3,borderBottomColor:"#8a463e",borderRadius:30},
 outfit:{position:"absolute",zIndex:4,bottom:"-8%",alignSelf:"center",width:"72%",height:"38%",borderTopLeftRadius:60,borderTopRightRadius:60},
 outfitAccent:{position:"absolute",top:0,alignSelf:"center",width:"28%",height:"10%",borderBottomLeftRadius:20,borderBottomRightRadius:20},
 hairFront:{position:"absolute",zIndex:5,top:"17%",alignSelf:"center",borderTopLeftRadius:70,borderTopRightRadius:70},
 cap:{position:"absolute",zIndex:6,top:"11%",alignSelf:"center",width:"56%",height:"19%",borderTopLeftRadius:70,borderTopRightRadius:70},
 capBrim:{position:"absolute",zIndex:6,top:"27%",right:"18%",width:"30%",height:"5%",borderRadius:20},
 glasses:{position:"absolute",zIndex:6,top:"40%",left:"25%",right:"25%",height:"12%",flexDirection:"row",alignItems:"center"},
 lens:{flex:1,height:"100%",borderRadius:18,borderWidth:3,borderColor:"#26333d",backgroundColor:"rgba(255,255,255,.15)"},bridge:{width:"12%",height:3,backgroundColor:"#26333d"},
 chain:{position:"absolute",zIndex:6,bottom:"18%",alignSelf:"center",fontSize:42,color:"#e4b54a",fontWeight:"900"},
 finish:{position:"absolute",zIndex:7,left:"7%",top:"6%",width:"18%",height:"8%",borderRadius:30,backgroundColor:"rgba(255,255,255,.28)",transform:[{rotate:"-25deg"}]}});