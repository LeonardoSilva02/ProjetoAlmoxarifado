import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

export default function DashboardView({ navigation }) {
  // 🔹 Função de logout segura
  const handleLogout = () => {
    // Se estiver usando AsyncStorage para salvar login:
    // await AsyncStorage.removeItem("userData");

    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* 🔹 Cabeçalho */}
      <LinearGradient colors={["#06437a", "#0b5394"]} style={styles.header}>
        <Text style={styles.headerTitle}>Painel de Visualização</Text>
        <Text style={styles.subText}>Modo somente leitura (Google)</Text>
      </LinearGradient>

      {/* 🔹 Cards de navegação */}
      <View style={styles.grid}>
        {/* Masters */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate("EstoqueMasters", { readOnly: true })}
        >
          <Ionicons name="cube-outline" size={40} color="#0b5394" />
          <Text style={styles.cardText}>Estoque Masters</Text>
          <Text style={styles.subCardText}>(visualização)</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate("FerramentasMasters", { readOnly: true })}
        >
          <Ionicons name="construct-outline" size={40} color="#0b5394" />
          <Text style={styles.cardText}>Ferramentas Masters</Text>
          <Text style={styles.subCardText}>(visualização)</Text>
        </TouchableOpacity>

        {/* Honda */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate("EstoqueHonda", { readOnly: true })}
        >
          <Ionicons name="business-outline" size={40} color="#0b5394" />
          <Text style={styles.cardText}>Estoque Honda</Text>
          <Text style={styles.subCardText}>(visualização)</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate("FerramentasHonda", { readOnly: true })}
        >
          <Ionicons name="build-outline" size={40} color="#0b5394" />
          <Text style={styles.cardText}>Ferramentas Honda</Text>
          <Text style={styles.subCardText}>(visualização)</Text>
        </TouchableOpacity>
      </View>

      {/* 🔹 Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
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
