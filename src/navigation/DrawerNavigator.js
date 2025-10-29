import React from "react";
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";
import { View, Text, StyleSheet } from "react-native";

import DashboardADM from "../screens/DashboardADM";
import EstoqueScreen from "../screens/EstoqueScreen";

const Drawer = createDrawerNavigator();

// 🔹 Conteúdo customizado do menu (com botão de logout)
function CustomDrawerContent(props) {
  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.drawerHeader}>
        <Ionicons name="person-circle-outline" size={70} color="#fff" />
        <Text style={styles.drawerTitle}>Administrador</Text>
      </View>

      <DrawerItemList {...props} />

      <DrawerItem
        label="Logout"
        labelStyle={{ color: "#fff", fontWeight: "bold" }}
        style={{ backgroundColor: "#ff4d4d", borderRadius: 8, marginTop: 15 }}
        icon={({ size }) => <Ionicons name="exit-outline" color="#fff" size={size} />}
        onPress={() => props.navigation.navigate("Login")}
      />
    </DrawerContentScrollView>
  );
}

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator
      initialRouteName="DashboardADM"
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: "#0b5394" },
        headerTintColor: "#fff",
        drawerActiveBackgroundColor: "#0b5394",
        drawerActiveTintColor: "#fff",
        drawerInactiveTintColor: "#333",
        drawerLabelStyle: { fontSize: 16 },
      }}
    >
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
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  drawerHeader: {
    backgroundColor: "#0b5394",
    padding: 20,
    alignItems: "center",
  },
  drawerTitle: {
    color: "#fff",
    fontSize: 18,
    marginTop: 10,
    fontWeight: "bold",
  },
});
