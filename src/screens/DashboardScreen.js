import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";

import styles from "../styles/dashboardStyle";

export default function DashboardScreen({ navigation }) {
  const [role, setRole] = useState("viewer");

  useEffect(() => {
    const loadRole = async () => {
      const userRole = await AsyncStorage.getItem("userRole");
      setRole(userRole || "viewer");
    };
    loadRole();
  }, []);

  const isViewer = role === "viewer";

  const handleNavigate = (screen) => {
    if (
      isViewer &&
      (screen === "MovimentacoesFerramentas" ||
        screen === "MovimentacoesEstoque")
    ) {
      Alert.alert(
        "Acesso restrito",
        "Visitantes não podem acessar movimentações."
      );
      return;
    }

    navigation.navigate(screen);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* ✅ HEADER */}
      <LinearGradient colors={["#0b5394", "#06437a"]} style={styles.header}>
        <Image
          source={require("../../assets/logo-masters.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.headerTitle}>Painel Masters/Honda</Text>
        <Text style={styles.subTitle}>
          {isViewer ? "Modo Visitante" : "Administrador"}
        </Text>
      </LinearGradient>

      {/* ✅ TÍTULO DA ÁREA */}
      <View style={styles.sectionTitleWrap}>
        <Text style={styles.sectionTitle}>Funções do Sistema</Text>
      </View>

      {/* ✅ GRID PRINCIPAL */}
      <View style={styles.grid}>
        {/* ESTOQUE */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => handleNavigate("Estoque")}
        >
          <View style={styles.iconCircle}>
            <Ionicons name="cube-outline" size={36} color="#0b5394" />
          </View>
          <Text style={styles.cardText}>Estoque</Text>
        </TouchableOpacity>

        {/* FERRAMENTAS */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => handleNavigate("Ferramentas")}
        >
          <View style={styles.iconCircle}>
            <Ionicons name="construct-outline" size={36} color="#0b5394" />
          </View>
          <Text style={styles.cardText}>Ferramentas</Text>
        </TouchableOpacity>

        {/* ✅ MOVIMENTAÇÕES DE FERRAMENTAS (SOMENTE ADMIN) */}
        {!isViewer && (
          <TouchableOpacity
            style={styles.card}
            onPress={() => handleNavigate("MovimentacoesFerramentas")}
          >
            <View style={styles.iconCircle}>
              <Ionicons
                name="swap-horizontal-outline"
                size={36}
                color="#0b5394"
              />
            </View>
            <Text style={styles.cardText}>
              Movimentações de Ferramentas
            </Text>
          </TouchableOpacity>
        )}

        {/* ✅ MOVIMENTAÇÕES DE ESTOQUE (SOMENTE ADMIN) */}
        {!isViewer && (
          <TouchableOpacity
            style={styles.card}
            onPress={() => handleNavigate("MovimentacoesEstoque")}
          >
            <View style={styles.iconCircle}>
              <Ionicons
                name="clipboard-outline"
                size={36}
                color="#0b5394"
              />
            </View>
            <Text style={styles.cardText}>
              Movimentações de Estoque
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ✅ LOGOUT */}
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
