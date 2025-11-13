// src/navigation/DrawerNavigator.js
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

// 🔹 Telas
import DashboardADM from "../screens/DashboardADM";
import EstoqueScreen from "../screens/EstoqueScreen";
import FerramentasScreen from "../screens/FerramentasScreen";
import EstoqueHondaView from "../screens/EstoqueHondaView";
import FerramentasHondaView from "../screens/FerramentasHondaView";

const Drawer = createDrawerNavigator();

/* ============================================================
   🔹 Drawer personalizado (agora usando dados do Supabase)
============================================================ */
function CustomDrawerContent(props) {
  const [nome, setNome] = useState("Usuário");
  const [email, setEmail] = useState("carregando...");
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
    role === "admin"
      ? "Administrador (Masters)"
      : role === "adminHonda"
      ? "Administrador Honda"
      : "Visitante";

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={{ flex: 1, backgroundColor: "#f8faff" }}
    >
      {/* 🔹 Cabeçalho com dados reais */}
      <LinearGradient colors={["#0b5394", "#06437a"]} style={styles.header}>
        <View style={styles.profileCircle}>
          <Ionicons name="person-circle-outline" size={70} color="#fff" />
        </View>

        <Text style={styles.userName}>{nome}</Text>
        <Text style={styles.userEmail}>{email}</Text>
        <Text style={styles.userRole}>{roleText}</Text>
      </LinearGradient>

      {/* 🔹 Itens */}
      <View style={styles.drawerItems}>
        <DrawerItemList {...props} />
      </View>

      {/* 🔹 Rodapé */}
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
   🔹 Drawer principal (ADM)
============================================================ */
export default function DrawerNavigator() {
  return (
    <Drawer.Navigator
      initialRouteName="DashboardADM"
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: "#0b5394" },
        headerTintColor: "#fff",
        headerTitleAlign: "center",
        drawerType: "front",
        drawerActiveBackgroundColor: "#0b5394",
        drawerActiveTintColor: "#fff",
        drawerInactiveTintColor: "#444",
        drawerLabelStyle: {
          fontSize: 14,
          fontWeight: "600",
          marginLeft: -10,
        },
        drawerItemStyle: {
          marginVertical: 0,
          borderRadius: 8,
          paddingVertical: 0,
        },
        sceneContainerStyle: { backgroundColor: "#f4f7fc" },
      }}
    >
      <Drawer.Screen
        name="DashboardADM"
        component={DashboardADM}
        options={{
          title: "Painel Principal",
          drawerIcon: ({ color }) => (
            <Ionicons name="home-outline" color={color} size={20} />
          ),
        }}
      />

      <Drawer.Screen
        name="Estoque"
        component={EstoqueScreen}
        options={{
          title: "Controle de Estoque",
          drawerIcon: ({ color }) => (
            <Ionicons name="cube-outline" color={color} size={20} />
          ),
        }}
      />

      <Drawer.Screen
        name="Ferramentas"
        component={FerramentasScreen}
        options={{
          title: "Ferramentas e Equipamentos",
          drawerIcon: ({ color }) => (
            <Ionicons name="construct-outline" color={color} size={20} />
          ),
        }}
      />

      <Drawer.Screen
        name="EstoqueHonda"
        component={EstoqueHondaView}
        options={{
          title: "Estoque Honda (Visualização)",
          drawerIcon: ({ color }) => (
            <Ionicons name="business-outline" color={color} size={20} />
          ),
        }}
      />

      <Drawer.Screen
        name="FerramentasHonda"
        component={FerramentasHondaView}
        options={{
          title: "Ferramentas Honda (Visualização)",
          drawerIcon: ({ color }) => (
            <Ionicons name="build-outline" color={color} size={20} />
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
    elevation: 5,
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
    marginTop: 4,
    fontSize: 12,
  },
  drawerItems: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  separator: {
    borderTopWidth: 1,
    borderTopColor: "#ddd",
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
    marginTop: 8,
  },
});
