// src/navigation/DrawerNavigator.js
import React from "react";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

// 🔹 Telas
import DashboardADM from "../screens/DashboardADM";
import EstoqueScreen from "../screens/EstoqueScreen";
import FerramentasScreen from "../screens/FerramentasScreen";
import EstoqueHondaScreen from "../screens/EstoqueHondaScreen"; // ✅ renomeado corretamente
import FerramentasHondaScreen from "../screens/FerramentasHondaScreen";

const Drawer = createDrawerNavigator();

/* ============================================================
   🔹 Drawer personalizado estilizado
============================================================ */
function CustomDrawerContent(props) {
  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={{ flex: 1, backgroundColor: "#f8faff" }}
    >
      {/* 🔹 Cabeçalho com gradiente */}
      <LinearGradient colors={["#0b5394", "#06437a"]} style={styles.header}>
        <View style={styles.profileCircle}>
          <Ionicons name="person-circle-outline" size={70} color="#fff" />
        </View>
        <Text style={styles.userName}>Administrador</Text>
        <Text style={styles.userEmail}>adm@empresa.com</Text>
      </LinearGradient>

      {/* Itens do Drawer */}
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
          onPress={() => props.navigation.navigate("Login")}
        />
        <Text style={styles.versionText}>Versão 1.0.0</Text>
      </View>
    </DrawerContentScrollView>
  );
}

/* ============================================================
   🔹 Navegação principal
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

      {/* 🔹 Corrigido: agora a rota se chama “EstoqueHonda” */}
      <Drawer.Screen
        name="EstoqueHonda"
        component={EstoqueHondaScreen}
        options={{
          title: "Estoque Honda",
          drawerIcon: ({ color }) => (
            <Ionicons name="business-outline" color={color} size={20} />
          ),
        }}
      />

      <Drawer.Screen
        name="FerramentasHonda"
        component={FerramentasHondaScreen}
        options={{
          title: "Ferramentas Honda",
          drawerIcon: ({ color }) => (
            <Ionicons name="build-outline" color={color} size={20} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
}

/* ============================================================
   🎨 Estilos aprimorados
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
