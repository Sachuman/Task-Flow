import { Tabs } from "expo-router";
import { FontAwesome } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';

export default function Layout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="home"
        options={{
          tabBarLabel: "Home",
          tabBarLabelStyle: { color: "#7CB9E8" },
          headerShown:false,
          tabBarIcon:({focused}) => 
          focused? (
            <AntDesign name="home" size={24} color="red" />
          ) : (
            <AntDesign name="home" size={24} color="black" />
          )
        }}
      />
       
       <Tabs.Screen
        name="stats"
        options={{
          tabBarLabel: "Statistics",
          tabBarLabelStyle: { color: "#7CB9E8" },
          headerShown:false,
          tabBarIcon:({focused}) => 
          focused? (
            <Ionicons name="stats-chart" size={24} color="red" />
          ) : (
            <Ionicons name="stats-chart" size={24} color="black" />
          )
        }}
      />

      <Tabs.Screen
        name="focus-session"
        options={{
          tabBarLabel: "Focus Session",
          tabBarLabelStyle: { color: "#7CB9E8" },
          headerShown:false,
          tabBarIcon:({focused}) => 
          focused? (
            <MaterialCommunityIcons name="brain" size={24} color="red" />
          ) : (
            <MaterialCommunityIcons name="brain" size={24} color="black" />
          )
        }}
      />

    </Tabs>
  );
}