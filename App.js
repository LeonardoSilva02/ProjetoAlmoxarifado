// App.js
import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ActivityIndicator, View, Text } from "react-native";
import { StatusBar } from "expo-status-bar";

// 🔹 Telas / Navegações
import LoginScreen from "./src/screens/LoginScreen";
import DrawerNavigator from "./src/navigation/DrawerNavigator"; // ADM geral
import DrawerNavigatorHonda from "./src/navigation/DrawerNavigatorHonda"; // ADM Honda
import DrawerNavigatorView from "./src/navigation/DrawerNavigatorView"; // Visualização (Google)

const Stack = createStackNavigator();

export default function App() {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    const checkLogin = async () => {
      try {
        // Lê o tipo de usuário salvo no AsyncStorage
        const userRole = await AsyncStorage.getItem("userRole");

        if (userRole === "admin") {
          // 🔹 ADM geral
          setInitialRoute("DrawerNavigator");
        } else if (userRole === "adminHonda") {
          // 🔹 ADM Honda
          setInitialRoute("DrawerNavigatorHonda");
        } else if (userRole === "viewer") {
          // 🔹 Login com Google (modo visualização)
          setInitialRoute("DrawerNavigatorView");
        } else {
          // 🔹 Padrão: sem login
          setInitialRoute("Login");
        }
      } catch (error) {
        console.log("Erro ao carregar userRole:", error);
        setInitialRoute("Login");
      }
    };

    checkLogin();
  }, []);

  // 🔹 Enquanto verifica o tipo de login, mostra tela de carregamento
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
        {/* 🔹 Login padrão */}
        <Stack.Screen name="Login" component={LoginScreen} />

        {/* 🔹 Navegação do ADM geral */}
        <Stack.Screen name="DrawerNavigator" component={DrawerNavigator} />

        {/* 🔹 Navegação do ADM Honda */}
        <Stack.Screen
          name="DrawerNavigatorHonda"
          component={DrawerNavigatorHonda}
        />

        {/* 🔹 Navegação apenas visualização (Google) */}
        <Stack.Screen
          name="DrawerNavigatorView"
          component={DrawerNavigatorView}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
