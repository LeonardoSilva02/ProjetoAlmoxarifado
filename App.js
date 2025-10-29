import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { StatusBar } from "expo-status-bar";

// Importando suas telas
import LoginScreen from "./src/screens/LoginScreen";
import DashboardADM from "./src/screens/DashboardADM"; // você pode criar essa depois

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false, // esconde o cabeçalho padrão
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="DashboardADM" component={DashboardADM} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
