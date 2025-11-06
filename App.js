// App.js
import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ActivityIndicator, View, Text, Platform } from "react-native";
import { StatusBar } from "expo-status-bar";
// Google auth removed from App-level (login via visitante/manual handled in LoginScreen)
import { LogBox } from "react-native";

// 🔹 Ignora alguns avisos não críticos
LogBox.ignoreLogs(["Non-serializable values were found in the navigation state"]);

// Error boundary para capturar erros em tempo de execução (útil para web onde a tela fica branca)
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("Unhandled error caught by ErrorBoundary:", error, info);
    this.setState({ info });
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: "700", color: "#b00020", marginBottom: 12 }}>Ocorreu um erro</Text>
          <Text style={{ color: "#333", marginBottom: 8 }}>{String(this.state.error)}</Text>
          <Text style={{ color: "#666", fontSize: 12 }}>Verifique o console do navegador para o stack trace completo.</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

// 🔹 Telas e Navegações
import LoginScreen from "./src/screens/LoginScreen";
import DrawerNavigator from "./src/navigation/DrawerNavigator"; // ADM geral
import DrawerNavigatorHonda from "./src/navigation/DrawerNavigatorHonda"; // ADM Honda 
import DrawerNavigatorView from "./src/navigation/DrawerNavigatorView"; // Visualização 


const Stack = createStackNavigator();

export default function App() {
  // Sempre inicia na tela de Login; a própria `LoginScreen` fará redirecionamento
  // automático se já houver sessão válida.
  const initialRoute = "Login";

  // Linking config para web: mapeia rotas para URLs, assim o F5 mantém a rota atual
  // Apenas use window.location.origin quando rodando no web; em Android/iOS
  // `window.location` pode ser undefined e causar `Cannot read property 'origin' of undefined`.
  const prefixes = [Platform.OS === "web" && typeof window !== "undefined" && window.location && window.location.origin ? window.location.origin : ""];
  const linking = {
    prefixes,
    config: {
      screens: {
        Login: "login",
        DrawerNavigator: {
          path: "admin",
          screens: {
            DashboardADM: "dashboard",
            Estoque: {
              path: "estoque",
              screens: {
                "Elétrica": "eletrica",
                "Mecânica": "mecanica",
                "Pintura": "pintura",
                "Porcas e Arruelas": "porcas-arruelas",
                "Outros": "outros",
              },
            },
            Ferramentas: "ferramentas",
            EstoqueHonda: {
              path: "estoque-honda",
              screens: {
                "Elétrica": "eletrica",
                "Mecânica": "mecanica",
                "Pintura": "pintura",
                "Porcas e Arruelas": "porcas-arruelas",
                "Outros": "outros",
              },
            },
            FerramentasHonda: "ferramentas-honda",
          },
        },
        DrawerNavigatorHonda: {
          path: "honda",
          screens: {
            DashboardHonda: "dashboard",
            EstoqueHonda: {
              path: "estoque-honda",
              screens: {
                "Elétrica": "eletrica",
                "Mecânica": "mecanica",
                "Pintura": "pintura",
                "Porcas e Arruelas": "porcas-arruelas",
                "Outros": "outros",
              },
            },
            FerramentasHonda: "ferramentas-honda",
          },
        },
        DrawerNavigatorView: {
          path: "view",
          screens: {
            DashboardView: "dashboard",
            EstoqueMasters: {
              path: "estoque",
              screens: {
                "Elétrica": "eletrica",
                "Mecânica": "mecanica",
                "Pintura": "pintura",
                "Porcas e Arruelas": "porcas-arruelas",
                "Outros": "outros",
              },
            },
            FerramentasMasters: "ferramentas",
            EstoqueHonda: {
              path: "estoque-honda",
              screens: {
                "Elétrica": "eletrica",
                "Mecânica": "mecanica",
                "Pintura": "pintura",
                "Porcas e Arruelas": "porcas-arruelas",
                "Outros": "outros",
              },
            },
            FerramentasHonda: "ferramentas-honda",
          },
        },
      },
    },
  };

  return (
    <ErrorBoundary>
      <NavigationContainer linking={linking}>
        <StatusBar style="light" backgroundColor="#0b5394" />
        <Stack.Navigator
          initialRouteName={initialRoute}
          screenOptions={{
            headerShown: false,
            gestureEnabled: false,
          }}
        >
        {/* 🔹 Tela de login */}
        <Stack.Screen name="Login" component={LoginScreen} />

        {/* 🔹 Navegação ADM geral */}
        <Stack.Screen name="DrawerNavigator" component={DrawerNavigator} />

        {/* 🔹 Navegação ADM Honda (versão completa) */}
        <Stack.Screen
          name="DrawerNavigatorHonda"
          component={DrawerNavigatorHonda}
        />

        {/* 🔹 (DrawerNavigatorHondaView removido - não é necessário) */}

        {/* 🔹 Navegação modo visualização  */}
        <Stack.Screen
          name="DrawerNavigatorView"
          component={DrawerNavigatorView}
        />
      </Stack.Navigator>
      </NavigationContainer>
    </ErrorBoundary>
  );
}
