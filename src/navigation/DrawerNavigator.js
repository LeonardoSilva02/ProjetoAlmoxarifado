import React, { useEffect, useState } from "react";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";
import { View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";

import styles from "../styles/drawerStyles";

// ✅ TELAS
import DashboardScreen from "../screens/DashboardScreen";
import EstoqueScreen from "../screens/EstoqueScreen";
import FerramentasScreen from "../screens/FerramentasScreen";
import MovimentacoesFerramentas from "../screens/MovimentacoesFerramentas";
import MovimentacoesEstoque from "../screens/MovimentacoesEstoque";

const Drawer = createDrawerNavigator();

/* ============================================================
   🔹 Drawer personalizado (usuário + logout)
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

        <View style={[styles.logoutButton, { flexDirection: 'row', alignItems: 'center' }]}> 
          <Ionicons name="exit-outline" color="#fff" size={28} style={{ marginRight: 8 }} />
          <Text style={styles.logoutLabel}>Sair</Text>
          <View style={{ flex: 1 }} />
          <DrawerItem
            label=""
            style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0 }}
            onPress={async () => {
              await AsyncStorage.clear();
              props.navigation.reset({
                index: 0,
                routes: [{ name: "Login" }],
              });
            }}
            pressColor="#ffb3b3"
          />
        </View>

        <Text style={styles.versionText}>Versão 1.0.0</Text>
      </View>
    </DrawerContentScrollView>
  );
}

/* ============================================================
   🔹 Drawer ÚNICO PARA TODOS OS LOGINS (COM CONTROLE DE PERFIL)
============================================================ */
export default function DrawerNavigator() {
  const [role, setRole] = useState("viewer");

  useEffect(() => {
    const loadRole = async () => {
      const r = await AsyncStorage.getItem("userRole");
      setRole(r || "viewer");
    };

    loadRole();
  }, []);

  const isViewer = role === "viewer";

  return (
    <Drawer.Navigator
      initialRouteName="Dashboard"
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
      {/* ✅ DASHBOARD */}
      <Drawer.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: "Painel Principal",
          drawerIcon: ({ color }) => (
            <Ionicons name="speedometer-outline" color={color} size={20} />
          ),
        }}
      />

      {/* ✅ ESTOQUE */}
      <Drawer.Screen
        name="Estoque"
        component={EstoqueScreen}
        options={{
          title: "Estoque",
          drawerIcon: ({ color }) => (
            <Ionicons name="cube-outline" color={color} size={20} />
          ),
        }}
      />

      {/* ✅ FERRAMENTAS */}
      <Drawer.Screen
        name="Ferramentas"
        component={FerramentasScreen}
        options={{
          title: "Ferramentas",
          drawerIcon: ({ color }) => (
            <Ionicons name="construct-outline" color={color} size={20} />
          ),
        }}
      />

      {/* ✅ MOVIMENTAÇÕES DE FERRAMENTAS (SÓ ADMIN) */}
      {!isViewer && (
        <Drawer.Screen
          name="MovimentacoesFerramentas"
          component={MovimentacoesFerramentas}
          options={{
            title: "Movimentações de Ferramentas",
            drawerIcon: ({ color }) => (
              <Ionicons
                name="swap-horizontal-outline"
                color={color}
                size={20}
              />
            ),
          }}
        />
      )}

      {/* ✅ MOVIMENTAÇÕES DE ESTOQUE (SÓ ADMIN) */}
      {!isViewer && (
        <Drawer.Screen
          name="MovimentacoesEstoque"
          component={MovimentacoesEstoque}
          options={{
            title: "Movimentações de Estoque",
            drawerIcon: ({ color }) => (
              <Ionicons
                name="clipboard-outline"
                color={color}
                size={20}
              />
            ),
          }}
        />
      )}
    </Drawer.Navigator>
  );
}
