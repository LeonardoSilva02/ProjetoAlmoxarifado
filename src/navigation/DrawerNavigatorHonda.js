// src/navigation/DrawerNavigatorHonda.js
import React from "react";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";
import { View, Text, StyleSheet, Platform } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from "expo-linear-gradient";

// 🔹 Telas
import DashboardHonda from "../screens/DashboardHonda";
import EstoqueScreen from "../screens/EstoqueScreen"; // ✅ Estoque Masters (visualização)
import FerramentasScreen from "../screens/FerramentasScreen"; // ✅ Ferramentas Masters (visualização)
import EstoqueHondaScreen from "../screens/EstoqueHondaScreen"; // ✅ Estoque Honda (acesso completo)
import FerramentasHondaScreen from "../screens/FerramentasHondaScreen"; // ✅ Ferramentas Honda (acesso completo)
import RequisicoesScreen from "../screens/RequisicoesScreen"; // ✅ Requisições de Material
import RequisicaoForm from "../screens/RequisicaoForm";

const Drawer = createDrawerNavigator();

function CustomDrawerContent(props) {
  return (
    <View style={{ flex: 1, backgroundColor: '#f8faff' }}>
      <DrawerContentScrollView {...props} contentContainerStyle={{ padding: 0 }}>
        <LinearGradient colors={["#0b5394", "#06437a"]} style={styles.header}>
          <View style={styles.profileCircle}>
            <Ionicons name="person-circle-outline" size={70} color="#fff" />
          </View>
          <Text style={styles.userName}>ADM Honda</Text>
          <Text style={styles.userEmail}>adm.honda@empresa.com</Text>
        </LinearGradient>

        <View style={styles.drawerItems}>
          <DrawerItemList {...props} />
        </View>
      </DrawerContentScrollView>

      {/* Footer fixo fora da área rolável - evita sobreposição em listas longas */}
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
            // Limpa sessão antes de voltar ao Login
            try {
              await AsyncStorage.removeItem('userRole');
              await AsyncStorage.removeItem('loginType');
              await AsyncStorage.removeItem('isLoggedIn');
              await AsyncStorage.removeItem('userEmail');
            } catch (e) {
              console.log('Erro ao limpar sessão:', e);
            }
            props.navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
          }}
        />
        <Text style={styles.versionText}>Versão 1.0.0</Text>
      </View>
    </View>
  );
}

export default function DrawerNavigatorHonda() {
  return (
    <Drawer.Navigator
      initialRouteName="DashboardHonda"
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: "#0b5394" },
        headerTintColor: "#fff",
        headerTitleAlign: "center",
  drawerType: Platform.OS === 'web' ? 'front' : 'back',
        drawerActiveBackgroundColor: "#0b5394",
        drawerActiveTintColor: "#fff",
        drawerInactiveTintColor: "#444",
        drawerLabelStyle: {
          fontSize: 13,
          fontWeight: "500",
          marginLeft: 4,
          lineHeight: 16,
        },
        drawerItemStyle: {
          marginVertical: 2,
          borderRadius: 8,
          paddingVertical: 8,
          marginHorizontal: 8,
          height: 44,
          justifyContent: 'flex-start',
        },
        drawerContentStyle: {
          paddingLeft: 6,
        },
        sceneContainerStyle: { backgroundColor: "#f4f7fc" },
      }}
    >
      {/* Painel Honda */}
      <Drawer.Screen
        name="DashboardHonda"
        component={DashboardHonda}
        options={{
          title: "Painel Honda",
          drawerIcon: ({ color }) => (
            <Ionicons name="speedometer-outline" color={color} size={20} />
          ),
        }}
      />
      {/* Estoque Masters - Somente visualização */}
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

      {/* Ferramentas Masters - Somente visualização */}
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

      {/* Estoque Honda - acesso completo */}
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

      {/* Ferramentas Honda - acesso completo */}
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

      {/* Requisições de Material */}
      <Drawer.Screen
        name="Requisicoes"
        component={RequisicoesScreen}
        options={{
          title: "Requisições",
          drawerIcon: ({ color }) => (
            <Ionicons name="document-text-outline" color={color} size={20} />
          ),
        }}
      />
      <Drawer.Screen
        name="RequisicaoForm"
        component={RequisicaoForm}
        options={{
          title: "Formulário de Requisição",
          drawerItemStyle: { height: 0 },
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
    paddingVertical: 12,
    paddingHorizontal: 4,
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
