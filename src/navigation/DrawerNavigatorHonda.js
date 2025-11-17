// src/navigation/DrawerNavigatorHonda.js
import React, { useEffect, useState } from "react";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Telas
import DashboardHonda from "../screens/DashboardHonda";
import EstoqueScreen from "../screens/EstoqueScreen";
import FerramentasScreen from "../screens/FerramentasScreen";
import EstoqueHondaScreen from "../screens/EstoqueHondaScreen";
import FerramentasHondaScreen from "../screens/FerramentasHondaScreen";
import MovimentacoesScreen from "../screens/MovimentacoesScreen"; 
import MovimentacoesEstoqueScreen from "../screens/MovimentacoesEstoqueScreen"; // <-- NOVA

const Drawer = createDrawerNavigator();

/* ============================================================
   🔹 Drawer personalizado
============================================================ */
function CustomDrawerContent(props) {
  const [nome, setNome] = useState("Carregando...");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      const n = await AsyncStorage.getItem("userName");
      const e = await AsyncStorage.getItem("userEmail");
      const r = await AsyncStorage.getItem("userRole");

      if (n) setNome(n);
      if (e) setEmail(e);
      if (r) setRole(r);
    };

    loadUser();
  }, []);

  const roleText =
    role === "adminHonda"
      ? "Administrador Honda"
      : role === "admin"
      ? "Administrador Masters"
      : "Visitante";

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={{ flex: 1, backgroundColor: "#f8faff" }}
    >
      <LinearGradient colors={["#0b5394", "#06437a"]} style={styles.header}>
        <View style={styles.profileCircle}>
          <Ionicons name="person-circle-outline" size={70} color="#fff" />
        </View>

        <Text style={styles.userName}>{nome}</Text>
        <Text style={styles.userEmail}>{email}</Text>
        <Text style={styles.userRole}>{roleText}</Text>
      </LinearGradient>

      <View style={styles.drawerItems}>
        <DrawerItemList {...props} />
      </View>

      <View style={styles.footer}>
        <View style={styles.separator} />

        <DrawerItem
          label="Sair"
          labelStyle={styles.logoutLabel}
          style={styles.logoutButton}
          icon={({ size }) => (
            <Ionicons name="exit-outline" color="#fff" size={size} />
          )}
          onPress={async () => {
            await AsyncStorage.clear();
            props.navigation.reset({
              index: 0,
              routes: [{ name: "Login" }],
            });
          }}
        />

        <Text style={styles.versionText}>Versão 1.0.0</Text>
      </View>
    </DrawerContentScrollView>
  );
}

/* ============================================================
   🔹 Drawer principal HONDA
============================================================ */
export default function DrawerNavigatorHonda() {
  return (
    <Drawer.Navigator
      initialRouteName="DashboardHonda"
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: "#0b5394" },
        headerTintColor: "#fff",
        headerTitleAlign: "center",
        drawerActiveBackgroundColor: "#0b5394",
        drawerActiveTintColor: "#fff",
        drawerInactiveTintColor: "#444",
        drawerLabelStyle: {
          fontSize: 14,
          fontWeight: "600",
          marginLeft: -10,
        },
        sceneContainerStyle: { backgroundColor: "#f4f7fc" },
      }}
    >
      {/* Dashboard */}
      <Drawer.Screen
        name="DashboardHonda"
        component={DashboardHonda}
        options={{
          title: "Painel Masters/Honda",
          drawerIcon: ({ color }) => (
            <Ionicons name="speedometer-outline" color={color} size={20} />
          ),
        }}
      />

      {/* Estoque Masters (somente visualização) */}
      <Drawer.Screen
        name="EstoqueMasters"
        component={EstoqueScreen}
        initialParams={{ readOnly: true }}
        options={{
          title: "Estoque Masters",
          drawerIcon: ({ color }) => (
            <Ionicons name="cube-outline" color={color} size={20} />
          ),
        }}
      />

      {/* Ferramentas Masters (somente visualização) */}
      <Drawer.Screen
        name="FerramentasMasters"
        component={FerramentasScreen}
        initialParams={{ readOnly: true }}
        options={{
          title: "Ferramentas Masters",
          drawerIcon: ({ color }) => (
            <Ionicons name="construct-outline" color={color} size={20} />
          ),
        }}
      />

      {/* Estoque Honda */}
      <Drawer.Screen
        name="EstoqueHonda"
        component={EstoqueHondaScreen}
        options={{
          title: "Estoque Masters/Honda",
          drawerIcon: ({ color }) => (
            <Ionicons name="business-outline" color={color} size={20} />
          ),
        }}
      />

      {/* Ferramentas Honda */}
      <Drawer.Screen
        name="FerramentasHonda"
        component={FerramentasHondaScreen}
        options={{
          title: "Ferramentas Elétricas Honda",
          drawerIcon: ({ color }) => (
            <Ionicons name="build-outline" color={color} size={20} />
          ),
        }}
      />

      {/* Movimentações de Ferramentas */}
      <Drawer.Screen
        name="MovimentacoesScreen"
        component={MovimentacoesScreen}
        options={{
          title: "Movimentações de Ferramentas",
          drawerIcon: ({ color }) => (
            <Ionicons name="swap-horizontal-outline" color={color} size={20} />
          ),
        }}
      />

      {/* 🔵 Movimentações de Estoque Honda — NOVO */}
      <Drawer.Screen
        name="MovimentacoesEstoqueScreen"
        component={MovimentacoesEstoqueScreen}
        options={{
          title: "Movimentações de Estoque Honda",
          drawerIcon: ({ color }) => (
            <Ionicons name="clipboard-outline" color={color} size={20} />
          ),
        }}
      />

    </Drawer.Navigator>
  );
}

/* ============================================================
   🎨 Estilos
============================================================ */
const styles = StyleSheet.create({
  header: {
    paddingVertical: 40,
    alignItems: "center",
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  profileCircle: {
    width: 85,
    height: 85,
    borderRadius: 42.5,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.4)",
    marginBottom: 8,
  },
  userName: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  userEmail: {
    color: "#e0e0e0",
    fontSize: 12,
  },
  userRole: {
    color: "#c7d7f5",
    fontSize: 12,
    marginTop: 5,
  },
  drawerItems: {
    flex: 1,
    paddingHorizontal: 8,
  },
  separator: {
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    marginVertical: 8,
  },
  footer: {
    paddingHorizontal: 10,
    paddingBottom: 15,
  },
  logoutButton: {
    backgroundColor: "#ff4d4d",
    borderRadius: 10,
    height: 42,
    justifyContent: "center",
  },
  logoutLabel: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  versionText: {
    textAlign: "center",
    fontSize: 11,
    color: "#999",
    marginTop: 6,
  },
});
