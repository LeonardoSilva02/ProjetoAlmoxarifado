import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Alert,
  Image,
  Platform,
} from "react-native";
import ButtonEffect from "../components/ui/ButtonEffect";
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

  // Efeito visual de toque/hover nos cards (web)
  const [hovered, setHovered] = useState(null);
  const cardStyle = (key) => [
    styles.card,
    Platform.OS === 'web' && hovered === key
      ? { transform: [{ scale: 1.04 }], boxShadow: '0 6px 24px #0b539422' }
      : {},
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* HEADER */}
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

      {/* TÍTULO DA ÁREA */}
      <View style={styles.sectionTitleWrap}>
        <Text style={styles.sectionTitle}>Funções do Sistema</Text>
      </View>

      {/* GRID PRINCIPAL */}
      <View style={styles.grid}>
        {/* ESTOQUE */}
        <ButtonEffect
          style={cardStyle('estoque')}
          onPress={() => handleNavigate("Estoque")}
          onMouseEnter={() => setHovered('estoque')}
          onMouseLeave={() => setHovered(null)}
        >
          <View style={styles.iconCircle}>
            <Ionicons name="cube-outline" size={36} color="#0b5394" />
          </View>
          <Text style={styles.cardText}>Estoque</Text>
        </ButtonEffect>

        {/* FERRAMENTAS */}
        <ButtonEffect
          style={cardStyle('ferramentas')}
          onPress={() => handleNavigate("Ferramentas")}
          onMouseEnter={() => setHovered('ferramentas')}
          onMouseLeave={() => setHovered(null)}
        >
          <View style={styles.iconCircle}>
            <Ionicons name="construct-outline" size={36} color="#0b5394" />
          </View>
          <Text style={styles.cardText}>Ferramentas</Text>
        </ButtonEffect>

        {/* MOVIMENTAÇÕES DE FERRAMENTAS (SOMENTE ADMIN) */}
        {!isViewer && (
          <ButtonEffect
            style={cardStyle('movferramentas')}
            onPress={() => handleNavigate("MovimentacoesFerramentas")}
            onMouseEnter={() => setHovered('movferramentas')}
            onMouseLeave={() => setHovered(null)}
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
          </ButtonEffect>
        )}

        {/* MOVIMENTAÇÕES DE ESTOQUE (SOMENTE ADMIN) */}
        {!isViewer && (
          <ButtonEffect
            style={cardStyle('movestoque')}
            onPress={() => handleNavigate("MovimentacoesEstoque")}
            onMouseEnter={() => setHovered('movestoque')}
            onMouseLeave={() => setHovered(null)}
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
          </ButtonEffect>
        )}
      </View>

      {/* LOGOUT */}
      <ButtonEffect
        style={styles.logoutButton}
        onPress={async () => {
          await AsyncStorage.clear();
          navigation.reset({ index: 0, routes: [{ name: "Login" }] });
        }}
      >
        <Ionicons name="exit-outline" size={28} color="#fff" />
        <Text style={styles.logoutText}>Sair</Text>
      </ButtonEffect>
    </ScrollView>
  );
}
