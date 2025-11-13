// src/screens/DashboardADM.js
import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function DashboardADM({ navigation }) {
  const [role, setRole] = useState("viewer");

  useEffect(() => {
    const loadRole = async () => {
      const userRole = await AsyncStorage.getItem("userRole");
      setRole(userRole || "viewer");
    };
    loadRole();
  }, []);

  const isViewer = role === "viewer";

  const handleNavigation = (screen) => {
    if (isViewer) {
      Alert.alert("Acesso restrito", "Seu acesso é somente para visualização.");
      return;
    }
    navigation.navigate(screen);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <LinearGradient colors={["#0b5394", "#06437a"]} style={styles.header}>
        <Text style={styles.headerTitle}>Painel Administrativo</Text>

        <Text style={styles.subText}>
          {role === "viewer"
            ? "Modo de visualização (visitante)"
            : role === "adminHonda"
            ? "Acesso: Honda"
            : "Acesso: Masters"}
        </Text>
      </LinearGradient>

      <View style={styles.grid}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => handleNavigation("Estoque")}
        >
          <Ionicons name="cube-outline" size={40} color="#0b5394" />
          <Text style={styles.cardText}>Controle de Estoque</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => handleNavigation("Ferramentas")}
        >
          <Ionicons name="construct-outline" size={40} color="#0b5394" />
          <Text style={styles.cardText}>Ferramentas e Equipamentos</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => handleNavigation("EstoqueHonda")}
        >
          <Ionicons name="business-outline" size={40} color="#0b5394" />
          <Text style={styles.cardText}>Estoque Honda</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => handleNavigation("FerramentasHonda")}
        >
          <Ionicons name="build-outline" size={40} color="#0b5394" />
          <Text style={styles.cardText}>Ferramentas Honda</Text>
        </TouchableOpacity>
      </View>

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
    fontWeight: "600",
    textAlign: "center",
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
