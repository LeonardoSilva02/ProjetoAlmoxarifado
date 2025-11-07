// src/screens/DashboardHonda.js
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

export default function DashboardHonda({ navigation }) {
  return (
    <View style={styles.container}>
      <LinearGradient colors={["#0b5394", "#06437a"]} style={styles.header}>
        <Text style={styles.headerTitle}>Painel Honda</Text>
        <Text style={styles.subText}>Visualize e gerencie os estoques</Text>
      </LinearGradient>

      <View style={styles.contentContainer}>
        <View style={styles.mainContent}>
          <View style={styles.grid}>
            {/* 🔹 Estoque Masters — somente visualização */}
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate("EstoqueMasters", { readOnly: true })}
            >
              <Ionicons name="cube-outline" size={40} color="#0b5394" />
              <Text style={styles.cardText}>Estoque Masters</Text>
              <Text style={styles.subCardText}>(visualização)</Text>
            </TouchableOpacity>

            {/* 🔹 Ferramentas Masters — somente visualização */}
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate("FerramentasMasters", { readOnly: true })}
            >
              <Ionicons name="construct-outline" size={40} color="#0b5394" />
              <Text style={styles.cardText}>Ferramentas Masters</Text>
              <Text style={styles.subCardText}>(visualização)</Text>
            </TouchableOpacity>

            {/* 🔹 Estoque Honda — acesso completo */}
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate("EstoqueHonda")}
            >
              <Ionicons name="business-outline" size={40} color="#0b5394" />
              <Text style={styles.cardText}>Estoque Honda</Text>
            </TouchableOpacity>

            {/* 🔹 Ferramentas Honda — acesso completo */}
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate("FerramentasHonda")}
            >
              <Ionicons name="build-outline" size={40} color="#0b5394" />
              <Text style={styles.cardText}>Ferramentas Honda</Text>
            </TouchableOpacity>

            {/* 🔹 Requisições */}
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate("Requisicoes")}
            >
              <Ionicons name="document-text-outline" size={40} color="#0b5394" />
              <Text style={styles.cardText}>Requisições</Text>
              <Text style={styles.subCardText}>criar & gerenciar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f7fc",
  },
  contentContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    paddingBottom: 20,
  },
  mainContent: {
    flex: 1,
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: '#fff',
    width: '46%',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 22,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
  },
  cardText: {
    marginTop: 6,
    color: '#0b5394',
    fontWeight: '700',
    fontSize: 14,
    textAlign: 'center',
  },
  subCardText: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
});
