// App.js
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { StatusBar } from "expo-status-bar";

// 🔹 Telas / Navegações
import LoginScreen from "./src/screens/LoginScreen";
import DrawerNavigator from "./src/navigation/DrawerNavigator"; // ADM geral
import DrawerNavigatorHonda from "./src/navigation/DrawerNavigatorHonda"; // ADM Honda

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" backgroundColor="#0b5394" />

      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
          gestureEnabled: false,
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="DrawerNavigator" component={DrawerNavigator} />
        <Stack.Screen
          name="DrawerNavigatorHonda"
          component={DrawerNavigatorHonda}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
