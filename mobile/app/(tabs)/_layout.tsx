import { Tabs } from "expo-router";
import { Image, StyleSheet, type ImageSourcePropType } from "react-native";
import { mobileNavigationAssets } from "../../assets/navigationAssets";
import { colors } from "../../theme/tokens";

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{
      headerShown:false,
      tabBarActiveTintColor:colors.tealDark,
      tabBarInactiveTintColor:colors.muted,
      tabBarStyle:{minHeight:68,paddingTop:6,paddingBottom:8,backgroundColor:colors.surface,borderTopColor:colors.border},
      tabBarLabelStyle:{fontSize:11,fontWeight:"700"}
    }}>
      <Tabs.Screen name="index" options={{title:"Jornada",tabBarIcon:()=> <TabArtwork source={mobileNavigationAssets.home} />}} />
      <Tabs.Screen name="bible" options={{title:"Bíblia",tabBarIcon:()=> <TabArtwork source={mobileNavigationAssets.bible} />}} />
      <Tabs.Screen name="study" options={{title:"Estudar",tabBarIcon:()=> <TabArtwork source={mobileNavigationAssets.study} />}} />
      <Tabs.Screen name="achievements" options={{title:"Conquistas",tabBarIcon:()=> <TabArtwork source={mobileNavigationAssets.achievements} />}} />
      <Tabs.Screen name="profile" options={{title:"Perfil",tabBarIcon:()=> <TabArtwork source={mobileNavigationAssets.profile} />}} />
      <Tabs.Screen name="tracks" options={{href:null}} />
      <Tabs.Screen name="review" options={{href:null}} />
    </Tabs>
  );
}
function TabArtwork({source}:{source:ImageSourcePropType}) {
  return <Image source={source} style={styles.artwork} resizeMode="contain" accessibilityIgnoresInvertColors />;
}
const styles=StyleSheet.create({artwork:{width:28,height:28}});
