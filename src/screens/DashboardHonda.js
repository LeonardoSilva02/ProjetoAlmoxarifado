// src/screens/DashboardHonda.js
import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function DashboardHonda({ navigation }) {
  const [role, setRole] = useState("viewer");

  useEffect(() => {
    const loadRole = async () => {
      const userRole = await AsyncStorage.getItem("userRole");
      setRole(userRole || "viewer");
    };
    loadRole();
  }, []);

  const isViewer = role === "viewer";
  const isHonda = role === "adminHonda";
  const isAdmin = role === "admin";

  const handleMastersViewOnly = (screen) => {
    if (isViewer) {
      Alert.alert("Acesso restrito", "Visitantes só podem visualizar.");
      return;
    }
    navigation.navigate(screen, { readOnly: true });
  };

  const handleHondaFullAccess = (screen) => {
    if (isViewer) {
      Alert.alert("Acesso restrito", "Visitantes só podem visualizar.");
      return;
    }
    navigation.navigate(screen);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <LinearGradient colors={["#0b5394", "#06437a"]} style={styles.header}>
        <Text style={styles.headerTitle}>Painel Honda</Text>

        <Text style={styles.subText}>
          {role === "viewer"
            ? "Modo visitante (visualização)"
            : role === "adminHonda"
            ? "Acesso total — Honda"
            : "Administrador (Masters + Honda)"}
        </Text>
      </LinearGradient>

      <View style={styles.grid}>
        {/* 🔹 Estoque Masters — somente visualização */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => handleMastersViewOnly("EstoqueMasters")}
        >
          <Ionicons name="cube-outline" size={40} color="#0b5394" />
          <Text style={styles.cardText}>Estoque Masters</Text>
          <Text style={styles.subCardText}>(visualização)</Text>
        </TouchableOpacity>

        {/* 🔹 Ferramentas Masters — somente visualização */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => handleMastersViewOnly("FerramentasMasters")}
        >
          <Ionicons name="construct-outline" size={40} color="#0b5394" />
          <Text style={styles.cardText}>Ferramentas Masters</Text>
          <Text style={styles.subCardText}>(visualização)</Text>
        </TouchableOpacity>

        {/* 🔹 Estoque Honda — acesso completo */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => handleHondaFullAccess("EstoqueHonda")}
        >
          <Ionicons name="business-outline" size={40} color="#0b5394" />
          <Text style={styles.cardText}>Estoque Honda</Text>
        </TouchableOpacity>

        {/* 🔹 Ferramentas Honda — acesso completo */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => handleHondaFullAccess("FerramentasHonda")}
        >
          <Ionicons name="build-outline" size={40} color="#0b5394" />
          <Text style={styles.cardText}>Ferramentas Honda</Text>
        </TouchableOpacity>
      </View>

      {/* 🔻 Logout */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={async () => {
          await AsyncStorage.clear();
          navigation.reset({ index: 0, routes: [{ name: "Login" }] });
        }}
      >
        <Ionicons name="exit-outline" size={22} color="#fff" />
        <Text style={styles.logoutText}>Sair</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#f4f7fc",
    paddingBottom: 20,
  },
  header: {
    paddingVertical: 50,
    alignItems: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
  },
  subText: {
    color: "#dce6f5",
    fontSize: 14,
    marginTop: 5,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    paddingHorizontal: 10,
  },
  card: {
    backgroundColor: "#fff",
    width: "42%",
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 30,
    marginVertical: 10,
    elevation: 3,
  },
  cardText: {
    marginTop: 8,
    color: "#0b5394",
    fontWeight: "700",
    textAlign: "center",
  },
  subCardText: {
    fontSize: 12,
    color: "#666",
  },
  logoutButton: {
    flexDirection: "row",
    backgroundColor: "#ff4d4d",
    borderRadius: 10,
    padding: 12,
    marginHorizontal: 40,
    marginTop: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  logoutText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 8,
  },
});
