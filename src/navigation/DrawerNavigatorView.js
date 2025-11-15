// src/navigation/DrawerNavigatorView.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
} from "react-native";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Telas
import DashboardView from "../screens/DashboardView";
import EstoqueScreen from "../screens/EstoqueScreen";
import FerramentasScreen from "../screens/FerramentasScreen";
import EstoqueHondaView from "../screens/EstoqueHondaView";
import FerramentasHondaView from "../screens/FerramentasHondaView";

const Drawer = createDrawerNavigator();

/* ============================================================
   🔹 Drawer Personalizado — Visitante
============================================================ */
function CustomDrawerContent(props) {
  const [userName, setUserName] = useState("Visitante");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const n = await AsyncStorage.getItem("userName");
        const e = await AsyncStorage.getItem("userEmail");
        const r = await AsyncStorage.getItem("userRole");

        if (n) setUserName(n);
        if (e) setEmail(e);
        if (r) setRole(r);
      } catch (e) {
        console.log("Erro ao carregar dados do visitante:", e);
      }
    };
    load();
  }, []);

  const roleText =
    role === "viewer"
      ? "Modo Visitante"
      : "Visualização";

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={{ flex: 1, backgroundColor: "#f8faff" }}
    >
      <LinearGradient colors={["#06437a", "#0b5394"]} style={styles.header}>
        <View style={styles.profileCircle}>
          <Ionicons name="person-circle-outline" size={70} color="#fff" />
        </View>

        <Text style={styles.userName}>{userName}</Text>
        <Text style={styles.userEmail}>{email || "Sem e-mail (visitante)"}</Text>
        <Text style={styles.roleText}>{roleText}</Text>
      </LinearGradient>

      <View style={styles.drawerItems}>
        <DrawerItemList {...props} />
      </View>

      <View style={styles.footer}>
        <DrawerItem
          label="Entrar / Login"
          labelStyle={{ color: "#0b5394", fontWeight: "700" }}
          icon={({ size }) => (
            <Ionicons name="log-in-outline" color="#0b5394" size={size} />
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
   🔹 Navegação (Somente Visualização)
============================================================ */
export default function DrawerNavigatorView() {
  return (
    <Drawer.Navigator
      initialRouteName="DashboardView"
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: "#0b5394" },
        headerTintColor: "#fff",
        headerTitleAlign: "center",
        drawerType: Platform.OS === "web" ? "front" : "back",
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

      {/* Painel principal */}
      <Drawer.Screen
        name="DashboardView"
        component={DashboardView}
        options={{
          title: "Painel Masters/Honda",
          drawerIcon: ({ color }) => (
            <Ionicons name="speedometer-outline" color={color} size={20} />
          ),
        }}
      />

      {/* Masters */}
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

      {/* Honda */}
      <Drawer.Screen
        name="EstoqueHonda"
        component={EstoqueHondaView}
        options={{
          title: "Estoque Masters/Honda",
          drawerIcon: ({ color }) => (
            <Ionicons name="business-outline" color={color} size={20} />
          ),
        }}
      />

      <Drawer.Screen
        name="FerramentasHonda"
        component={FerramentasHondaView}
        options={{
          title: "Ferramentas Masters/Honda",
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
    color: "#dce6f5",
    fontSize: 12,
    marginTop: 2,
  },
  roleText: {
    color: "#cfe0fb",
    fontSize: 12,
    marginTop: 4,
  },
  drawerItems: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  footer: {
    paddingHorizontal: 10,
    paddingBottom: 15,
  },
  versionText: {
    textAlign: "center",
    fontSize: 11,
    color: "#999",
    marginTop: 8,
  },
});
