// 📁 App.js
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { StatusBar } from "expo-status-bar";

// 🔹 Telas
import LoginScreen from "./src/screens/LoginScreen";
import DrawerNavigator from "./src/navigation/DrawerNavigator";

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      {/* Barra de status padrão azul */}
      <StatusBar style="light" backgroundColor="#0b5394" />

      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
          gestureEnabled: false, // evita voltar pro login com swipe
        }}
      >
        {/* 🔹 Tela de Login */}
        <Stack.Screen name="Login" component={LoginScreen} />

        {/* 🔹 Navegação principal (Drawer) */}
        <Stack.Screen
          name="DashboardADM"
          component={DrawerNavigator}
          options={{
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
