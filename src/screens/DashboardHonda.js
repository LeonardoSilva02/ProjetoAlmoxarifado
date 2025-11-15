// src/screens/DashboardHonda.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
} from "react-native";
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

      {/* HEADER MODERNO */}
      <LinearGradient colors={["#0b5394", "#06437a"]} style={styles.header}>
        <Image
          source={require("../../assets/logo-masters.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.headerTitle}>Painel Masters/Honda</Text>
      </LinearGradient>

      {/* GRID DE CARDS */}
      <View style={styles.grid}>

        {/* ESTOQUE MASTERS */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => handleMastersViewOnly("EstoqueMasters")}
        >
          <View style={styles.iconCircle}>
            <Ionicons name="cube-outline" size={36} color="#0b5394" />
          </View>
          <Text style={styles.cardText}>Estoque Masters</Text>
        </TouchableOpacity>

        {/* FERRAMENTAS MASTERS */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => handleMastersViewOnly("FerramentasMasters")}
        >
          <View style={styles.iconCircle}>
            <Ionicons name="construct-outline" size={36} color="#0b5394" />
          </View>
          <Text style={styles.cardText}>Ferramentas Elétricas Masters</Text>
        </TouchableOpacity>

        {/* ESTOQUE MASTERS/HONDA */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => handleHondaFullAccess("EstoqueHonda")}
        >
          <View style={styles.iconCircle}>
            <Ionicons name="business-outline" size={36} color="#0b5394" />
          </View>
          <Text style={styles.cardText}>Estoque Masters/Honda</Text>
        </TouchableOpacity>

        {/* FERRAMENTAS MASTERS/HONDA */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => handleHondaFullAccess("FerramentasHonda")}
        >
          <View style={styles.iconCircle}>
            <Ionicons name="build-outline" size={36} color="#0b5394" />
          </View>
          <Text style={styles.cardText}>Ferramentas Elétricas Masters/Honda</Text>
        </TouchableOpacity>
      </View>

      {/* BOTÃO DE SAIR */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={async () => {
          await AsyncStorage.clear();
          navigation.reset({ index: 0, routes: [{ name: "Login" }] });
        }}
      >
        <Ionicons name="exit-outline" size={24} color="#fff" />
        <Text style={styles.logoutText}>Sair</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

/* =====================
        ESTILOS
===================== */
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#f4f7fc",
    paddingBottom: 35,
  },

  /* HEADER */
  header: {
    paddingVertical: 45,
    alignItems: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 10,
    shadowColor: "#000",
  },
  logo: {
    width: 180,
    height: 80,
    marginBottom: 8,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
  },

  /* GRID */
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    paddingHorizontal: 14,
    marginTop: 10,
  },

  /* CARD MODERNO */
  card: {
    width: "44%",
    backgroundColor: "#fff",
    borderRadius: 18,
    paddingVertical: 26,
    marginVertical: 12,
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },

  /* CÍRCULO DO ÍCONE */
  iconCircle: {
    width: 65,
    height: 65,
    borderRadius: 40,
    backgroundColor: "#e7eef9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },

  cardText: {
    textAlign: "center",
    color: "#0b5394",
    fontSize: 14.5,
    fontWeight: "700",
    paddingHorizontal: 4,
  },

  /* LOGOUT */
  logoutButton: {
    flexDirection: "row",
    backgroundColor: "#ff4d4d",
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 50,
    marginTop: 18,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },
  logoutText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 8,
    fontSize: 15,
  },
});
