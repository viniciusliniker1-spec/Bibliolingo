import { Tabs } from "expo-router";
import { Image, StyleSheet, Text, type ColorValue, type ImageSourcePropType } from "react-native";
import { mobileVisualAssets } from "../../assets/visualAssets";
import { colors } from "../../theme/tokens";

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{
      headerShown:false,tabBarActiveTintColor:colors.tealDark,tabBarInactiveTintColor:colors.muted,
      tabBarStyle:{minHeight:68,paddingTop:6,paddingBottom:8,backgroundColor:colors.surface,borderTopColor:colors.border},
      tabBarLabelStyle:{fontSize:11,fontWeight:"700"}
    }}>
      <Tabs.Screen name="index" options={{title:"Jornada",tabBarIcon:({color})=><TabGlyph color={color} glyph="⌁" />}} />
      <Tabs.Screen name="bible" options={{title:"Bíblia",tabBarIcon:({color})=><TabGlyph color={color} glyph="▤" />}} />
      <Tabs.Screen name="study" options={{title:"Estudar",tabBarIcon:()=> <TabArtwork source={mobileVisualAssets.navigation.study} />}} />
      <Tabs.Screen name="achievements" options={{title:"Conquistas",tabBarIcon:()=> <TabArtwork source={mobileVisualAssets.navigation.achievements} />}} />
      <Tabs.Screen name="profile" options={{title:"Perfil",tabBarIcon:({color})=><TabGlyph color={color} glyph="●" />}} />
      <Tabs.Screen name="tracks" options={{href:null}} />
      <Tabs.Screen name="review" options={{href:null}} />
    </Tabs>
  );
}
function TabGlyph({color,glyph}:{color:ColorValue;glyph:string}){return <Text style={[styles.icon,{color}]} aria-hidden>{glyph}</Text>;}
function TabArtwork({source}:{source:ImageSourcePropType}){return <Image source={source} style={styles.artwork} resizeMode="contain" accessibilityIgnoresInvertColors />;}
const styles=StyleSheet.create({icon:{fontSize:22,fontWeight:"800"},artwork:{width:26,height:26}});
