// src/screens/DashboardADM.js
import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function DashboardADM({ navigation }) {
  const [isGoogleUser, setIsGoogleUser] = useState(false);

  useEffect(() => {
    // 🔹 Verifica se o login foi feito com Google
    const checkLoginType = async () => {
      const loginType = await AsyncStorage.getItem("loginType");
      if (loginType === "google") {
        setIsGoogleUser(true);
      }
    };
    checkLoginType();
  }, []);

  const handleRestrictedAction = () => {
    Alert.alert("Acesso restrito", "Você só pode visualizar as informações.");
  };

  const handleNavigation = (screen) => {
    if (isGoogleUser) {
      // ✅ Pode navegar, mas apenas visualizar
      navigation.navigate(screen, { readOnly: true });
    } else {
      // 🔧 ADM normal
      navigation.navigate(screen);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <LinearGradient colors={["#0b5394", "#06437a"]} style={styles.header}>
        <Text style={styles.headerTitle}>Painel Administrativo</Text>
        <Text style={styles.subText}>
          {isGoogleUser ? "Modo de visualização" : "Gerencie os setores da empresa"}
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

      {/* Botão de sair removido para visual mais limpo segundo solicitação */}
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
});
