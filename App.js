// App.js
import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ActivityIndicator, View, Text } from "react-native";
import { StatusBar } from "expo-status-bar";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import * as Application from "expo-application";

// 🔹 Telas / Navegações
import LoginScreen from "./src/screens/LoginScreen";
import DrawerNavigator from "./src/navigation/DrawerNavigator"; // ADM geral
import DrawerNavigatorHonda from "./src/navigation/DrawerNavigatorHonda"; // ADM Honda
import DrawerNavigatorView from "./src/navigation/DrawerNavigatorView"; // Visualização (Google)

WebBrowser.maybeCompleteAuthSession();

const Stack = createStackNavigator();

export default function App() {
  const [initialRoute, setInitialRoute] = useState(null);
  const [isReady, setIsReady] = useState(false);

  // 🔹 Configuração de Login Google (Android + iOS)
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId:
      "1018177453189-8bvk7i7cobb2ianfpqr4gumi8m7gkrt8.apps.googleusercontent.com",
    iosClientId:
      "1018177453189-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com", // substitua se tiver o do iOS
    webClientId:
      "1018177453189-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com", // web opcional
  });

  // 🔹 Monitora resposta do Google Login
  useEffect(() => {
    const handleGoogleLogin = async () => {
      if (response?.type === "success" && response.authentication) {
        try {
          // Salva dados básicos do login Google
          await AsyncStorage.setItem("isLoggedIn", "true");
          await AsyncStorage.setItem("userRole", "viewer");
          await AsyncStorage.setItem("loginType", "google");

          // Navega para o Drawer de visualização
          setInitialRoute("DrawerNavigatorView");
        } catch (e) {
          console.log("Erro ao salvar login Google:", e);
        }
      }
    };
    handleGoogleLogin();
  }, [response]);

  useEffect(() => {
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

    // Executa a verificação inicial
    checkLogin();

    // Observa mudanças no AsyncStorage (ex: logout/login)
    const interval = setInterval(checkLogin, 1500);
    return () => clearInterval(interval);
  }, []);

  // 🔹 Tela de carregamento enquanto verifica login
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
        {/* 🔹 Login padrão */}
        <Stack.Screen name="Login">
          {(props) => (
            <LoginScreen
              {...props}
              onGoogleLogin={() => promptAsync()} // 🔹 chama o login Google
              googleRequest={request}
            />
          )}
        </Stack.Screen>

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
