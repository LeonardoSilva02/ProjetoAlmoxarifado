import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { View, Text, Platform } from "react-native";
import { StatusBar } from "expo-status-bar";
import { LogBox } from "react-native";

// TELAS
import LoginScreen from "./src/screens/LoginScreen";
import DrawerNavigator from "./src/navigation/DrawerNavigator";

// Ignorar avisos
LogBox.ignoreLogs(["Non-serializable values were found in the navigation state"]);

const Stack = createStackNavigator();

/* ============================================================
   ERROR BOUNDARY
============================================================ */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("Erro capturado:", error, info);
    this.setState({ info });
  }

  render() {
    if (this.state.hasError) {
      return (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: "700",
              color: "#b00020",
              marginBottom: 12,
            }}
          >
            Ocorreu um erro
          </Text>

          <Text style={{ color: "#333", marginBottom: 8 }}>
            {String(this.state.error)}
          </Text>

          <Text style={{ color: "#666", fontSize: 12 }}>
            Confira o console para mais detalhes.
          </Text>
        </View>
      );
    }
    return this.props.children;
  }
}

/* ============================================================
   🔗 DEEP LINKING (IMPORTANTE PARA F5 MANTER NA MESMA PÁGINA)
============================================================ */
const prefixes = [
  Platform.OS === "web" &&
  typeof window !== "undefined" &&
  window.location?.origin
    ? window.location.origin
    : "",
];

const linking = {
  prefixes,
  config: {
    screens: {
      Login: "login",
      DrawerNavigator: {
        path: "painel",
        screens: {
          Dashboard: "dashboard",
          EstoqueMasters: "estoque-masters",
          FerramentasMasters: "ferramentas-masters",
          EstoqueHonda: "estoque-honda",
          FerramentasHonda: "ferramentas-honda",
          MovimentacoesFerramentas: "movimentacoes-ferramentas",
          MovimentacoesEstoque: "movimentacoes-estoque",
        },
      },
    },
  },

  // 🔥 ESSA LINHA FAZ O NAVEGADOR NÃO RESETAR AO DAR F5
  getStateFromPath: (path, config) => {
    try {
      return require("@react-navigation/native").getStateFromPath(path, config);
    } catch {
      return undefined;
    }
  },
};

/* ============================================================
   APP PRINCIPAL
============================================================ */
export default function App() {
  return (
    <ErrorBoundary>
      {/* 🚀 ESSA PROP "independent" GARANTE QUE O NAVEGADOR
            NÃO REINICIE O ESTADO AO DAR F5 NA WEB */}
      <NavigationContainer linking={linking} independent={true}>
        <StatusBar style="light" backgroundColor="#0b5394" />

        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{
            headerShown: false,
            gestureEnabled: false,
          }}
        >
          {/* LOGIN */}
          <Stack.Screen name="Login" component={LoginScreen} />

          {/* DRAWER PARA TODOS OS USUÁRIOS */}
          <Stack.Screen
            name="DrawerNavigator"
            component={DrawerNavigator}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </ErrorBoundary>
  );
}
