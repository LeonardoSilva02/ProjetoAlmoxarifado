// App.js
import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ActivityIndicator, View, Text } from "react-native";
import { StatusBar } from "expo-status-bar";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { LogBox } from "react-native";

// 🔹 Ignora alguns avisos não críticos
LogBox.ignoreLogs(["Non-serializable values were found in the navigation state"]);

// 🔹 Telas e Navegações
import LoginScreen from "./src/screens/LoginScreen";
import DrawerNavigator from "./src/navigation/DrawerNavigator"; // ADM geral
import DrawerNavigatorHonda from "./src/navigation/DrawerNavigatorHonda"; // ADM Honda
import DrawerNavigatorView from "./src/navigation/DrawerNavigatorView"; // Visualização (Google)

// Necessário para completar sessão do Google
WebBrowser.maybeCompleteAuthSession();

const Stack = createStackNavigator();

export default function App() {
  const [initialRoute, setInitialRoute] = useState(null);
  const [isReady, setIsReady] = useState(false);

  // 🔹 Configuração de autenticação com Google
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: "1018177453189-6uciu7sqlaqkh2reil52ag08moj2avl4.apps.googleusercontent.com",
    iosClientId: "1018177453189-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com", // substitua quando tiver o do iOS
    webClientId: "1018177453189-cosma8rk2fo4m6ge2jsdk4g6mcucnkuh.apps.googleusercontent.com",
    scopes: ["profile", "email"],
  });

  // 🔹 Monitora resposta do Google Login
  useEffect(() => {
    const handleGoogleLogin = async () => {
      if (response?.type === "success" && response.authentication) {
        try {
          await AsyncStorage.setItem("isLoggedIn", "true");
          await AsyncStorage.setItem("userRole", "viewer");
          await AsyncStorage.setItem("loginType", "google");
          setInitialRoute("DrawerNavigatorView");
        } catch (e) {
          console.log("Erro ao salvar login Google:", e);
        }
      }
    };
    handleGoogleLogin();
  }, [response]);

  // 🔹 Verifica se há login salvo
  const checkLogin = async () => {
    try {
      const userRole = await AsyncStorage.getItem("userRole");
      const isLoggedIn = await AsyncStorage.getItem("isLoggedIn");

      if (!isLoggedIn || isLoggedIn !== "true") {
        setInitialRoute("Login");
      } else if (userRole === "admin") {
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
    } finally {
      setIsReady(true);
    }
  };

  useEffect(() => {
    checkLogin();

    // 🔁 Atualiza rota quando houver mudanças de login/logout
    const interval = setInterval(checkLogin, 1500);
    return () => clearInterval(interval);
  }, []);

  // 🔹 Tela de carregamento
  if (!isReady || !initialRoute) {
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
        {/* 🔹 Tela de login */}
        <Stack.Screen name="Login">
          {(props) => (
            <LoginScreen
              {...props}
              onGoogleLogin={() => promptAsync()} // chama login Google
              googleRequest={request}
            />
          )}
        </Stack.Screen>

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
