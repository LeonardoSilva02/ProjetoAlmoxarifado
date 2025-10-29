// 📁 src/navigation/DrawerNavigator.js
import React from "react";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";
import { View, Text, StyleSheet } from "react-native";

// 🔹 Telas
import DashboardADM from "../screens/DashboardADM";
import EstoqueScreen from "../screens/EstoqueScreen";
import FerramentasScreen from "../screens/FerramentasScreen";

const Drawer = createDrawerNavigator();

/* ============================================================
   🔹 Drawer personalizado
============================================================ */
function CustomDrawerContent(props) {
  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={{ flex: 1, backgroundColor: "#f8faff" }}
    >
      {/* Cabeçalho */}
      <View style={styles.header}>
        <View style={styles.profileCircle}>
          <Ionicons name="person-circle-outline" size={70} color="#fff" />
        </View>
        <Text style={styles.userName}>Administrador</Text>
        <Text style={styles.userEmail}>adm@empresa.com</Text>
      </View>

      {/* Itens do Drawer */}
      <View style={styles.drawerItems}>
        <DrawerItemList {...props} />
      </View>

      {/* Rodapé */}
      <View style={styles.footer}>
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
   🔹 Navegação principal (Drawer)
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
        drawerActiveBackgroundColor: "#0b5394",
        drawerActiveTintColor: "#fff",
        drawerInactiveTintColor: "#333",
        drawerLabelStyle: { fontSize: 15, marginLeft: -10 },
        sceneContainerStyle: { backgroundColor: "#f4f7fc" },
      }}
    >
      {/* 🏠 Painel Principal */}
      <Drawer.Screen
        name="DashboardADM"
        component={DashboardADM}
        options={{
          title: "Painel Principal",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="home-outline" color={color} size={size} />
          ),
        }}
      />

      {/* 📦 Controle de Estoque */}
      <Drawer.Screen
        name="Estoque"
        component={EstoqueScreen}
        options={{
          title: "Controle de Estoque",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="cube-outline" color={color} size={size} />
          ),
        }}
      />

      {/* 🔧 Ferramentas e Equipamentos */}
      <Drawer.Screen
        name="Ferramentas"
        component={FerramentasScreen}
        options={{
          title: "Ferramentas e Equipamentos",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="construct-outline" color={color} size={size} />
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
    backgroundColor: "#0b5394",
    paddingVertical: 40,
    alignItems: "center",
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    elevation: 6,
  },
  profileCircle: {
    width: 85,
    height: 85,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  userName: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  userEmail: {
    color: "#e0e0e0",
    fontSize: 13,
  },
  drawerItems: {
    flex: 1,
    paddingTop: 10,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    padding: 10,
    marginBottom: 10,
  },
  logoutButton: {
    backgroundColor: "#ff4d4d",
    borderRadius: 10,
  },
  logoutLabel: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: -10,
  },
  versionText: {
    textAlign: "center",
    fontSize: 12,
    color: "#999",
    marginTop: 8,
  },
});
