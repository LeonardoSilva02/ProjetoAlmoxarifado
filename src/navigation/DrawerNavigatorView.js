// src/navigation/DrawerNavigatorView.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
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

// Telas (corrigido)
import DashboardView from "../screens/DashboardView"; // Painel (Google)
import EstoqueScreen from "../screens/EstoqueScreen"; // Masters
import FerramentasScreen from "../screens/FerramentasScreen"; // Masters
import EstoqueHondaScreen from "../screens/EstoqueHondaScreen"; // ✅ Nome corrigido
import FerramentasHondaScreen from "../screens/FerramentasHondaScreen"; // Honda

const Drawer = createDrawerNavigator();

function CustomDrawerContent(props) {
  const [email, setEmail] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const em = await AsyncStorage.getItem("userEmail");
        if (em) setEmail(em);
      } catch (e) {}
    };
    load();
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("userRole");
      await AsyncStorage.removeItem("userEmail");
    } catch (e) {}
    props.navigation.navigate("Login");
  };

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={{ flex: 1, backgroundColor: "#f8faff" }}
    >
      <LinearGradient colors={["#06437a", "#0b5394"]} style={styles.header}>
        <View style={styles.profileCircle}>
          <Ionicons name="person-circle-outline" size={70} color="#fff" />
        </View>
        <Text style={styles.userName}>Visualizador (Google)</Text>
        <Text style={styles.userEmail}>{email ?? "Conta Google"}</Text>
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
          onPress={() =>
            Alert.alert("Sair", "Deseja sair da conta?", [
              { text: "Cancelar", style: "cancel" },
              { text: "Sair", style: "destructive", onPress: handleLogout },
            ])
          }
        />
        <Text style={styles.versionText}>Versão 1.0.0</Text>
      </View>
    </DrawerContentScrollView>
  );
}

export default function DrawerNavigatorView() {
  return (
    <Drawer.Navigator
      initialRouteName="DashboardView"
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
      {/* Painel de visualização */}
      <Drawer.Screen
        name="DashboardView"
        component={DashboardView}
        options={{
          title: "Painel (Visualização)",
          drawerIcon: ({ color }) => (
            <Ionicons name="speedometer-outline" color={color} size={20} />
          ),
        }}
      />

      {/* Masters - somente visualização */}
      <Drawer.Screen
        name="EstoqueMasters"
        component={EstoqueScreen}
        initialParams={{ readOnly: true }}
        options={{
          title: "Estoque Masters (visualizar)",
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
          title: "Ferramentas Masters (visualizar)",
          drawerIcon: ({ color }) => (
            <Ionicons name="construct-outline" color={color} size={20} />
          ),
        }}
      />

      {/* Honda - somente visualização */}
      <Drawer.Screen
        name="EstoqueHonda"
        component={EstoqueHondaScreen}
        initialParams={{ readOnly: true }}
        options={{
          title: "Estoque Honda (visualizar)",
          drawerIcon: ({ color }) => (
            <Ionicons name="business-outline" color={color} size={20} />
          ),
        }}
      />

      <Drawer.Screen
        name="FerramentasHonda"
        component={FerramentasHondaScreen}
        initialParams={{ readOnly: true }}
        options={{
          title: "Ferramentas Honda (visualizar)",
          drawerIcon: ({ color }) => (
            <Ionicons name="build-outline" color={color} size={20} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
}

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
