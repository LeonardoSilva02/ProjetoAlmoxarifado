// App.js
import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ActivityIndicator, View, Text } from "react-native";
import { StatusBar } from "expo-status-bar";
import { LogBox } from "react-native";

// 🔹 Ignora alguns avisos não críticos do Expo/React Navigation
LogBox.ignoreLogs([
  "Non-serializable values were found in the navigation state",
]);

// 🔹 Telas / Navegações
import LoginScreen from "./src/screens/LoginScreen";
import DrawerNavigator from "./src/navigation/DrawerNavigator"; // ADM geral
import DrawerNavigatorHonda from "./src/navigation/DrawerNavigatorHonda"; // ADM Honda
import DrawerNavigatorView from "./src/navigation/DrawerNavigatorView"; // Visualização (Google)

const Stack = createStackNavigator();

export default function App() {
  const [initialRoute, setInitialRoute] = useState(null);

  // 🔹 Verifica login salvo
  const checkLogin = async () => {
    try {
      const userRole = await AsyncStorage.getItem("userRole");

      if (userRole === "admin") {
        setInitialRoute("DrawerNavigator");
      } else if (userRole === "adminHonda") {
        setInitialRoute("DrawerNavigatorHonda");
      } else if (userRole === "viewer") {
        setInitialRoute("DrawerNavigatorView");
      } else {
        setInitialRoute("Login");
      }
    } catch (error) {
      console.log("Erro ao carregar userRole:", error);
      setInitialRoute("Login");
    }
  };

  useEffect(() => {
    checkLogin();

    // 🔹 Adiciona listener global para quando o usuário logar ou sair
    const loginListener = async () => {
      await checkLogin();
    };

    // 🔹 Armazena função global pra forçar rechecagem após login/logout
    global.refreshLoginState = loginListener;
  }, []);

  // 🔹 Tela de carregamento enquanto verifica login
  if (!initialRoute) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#0b5394",
        }}
      >
        <ActivityIndicator size="large" color="#fff" />
        <Text style={{ color: "#fff", marginTop: 10 }}>Carregando...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="light" backgroundColor="#0b5394" />
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerShown: false,
          gestureEnabled: false,
        }}
      >
        {/* 🔹 Tela de login principal */}
        <Stack.Screen name="Login" component={LoginScreen} />

        {/* 🔹 Navegação ADM geral */}
        <Stack.Screen name="DrawerNavigator" component={DrawerNavigator} />

        {/* 🔹 Navegação ADM Honda */}
        <Stack.Screen
          name="DrawerNavigatorHonda"
          component={DrawerNavigatorHonda}
        />

        {/* 🔹 Navegação modo visualização (Google) */}
        <Stack.Screen
          name="DrawerNavigatorView"
          component={DrawerNavigatorView}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
