// src/screens/EstoqueView.js
import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, TextInput } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

export default function EstoqueView() {
  const [itens, setItens] = useState([]);
  const [busca, setBusca] = useState("");
  const STORAGE_KEY = "@estoque_data";

  useEffect(() => {
    const carregar = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setItens(JSON.parse(raw));
      } catch (e) {
        console.log("Erro ao carregar estoque:", e);
      }
    };
    carregar();
  }, []);

  const itensFiltrados = itens.filter((i) =>
    i.nome?.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <Ionicons name="hardware-outline" size={22} color="#fff" />
        <Text style={styles.headerTitle}>Estoque (Visualização)</Text>
      </View>

      {/* Barra de busca */}
      <View style={styles.searchRow}>
        <Ionicons name="search" size={18} color="#666" />
        <TextInput
          placeholder="Buscar item..."
          placeholderTextColor="#999"
          value={busca}
          onChangeText={setBusca}
          style={styles.searchInput}
        />
      </View>

      {/* Lista de itens */}
      <FlatList
        data={itensFiltrados}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.nome}>{item.nome}</Text>
            <Text style={styles.meta}>Quantidade: {item.quantidade}</Text>
            <Text style={styles.meta}>Categoria: {item.categoria}</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Nenhum item encontrado.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f7fb", padding: 12 },
  header: {
    backgroundColor: "#0b5394",
    paddingTop: 40,
    paddingBottom: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "bold", marginLeft: 8 },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    borderRadius: 10,
    marginVertical: 10,
  },
  searchInput: { marginLeft: 8, flex: 1, height: 40, color: "#333" },
  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  nome: { fontWeight: "bold", color: "#0b5394", fontSize: 16 },
  meta: { color: "#555" },
  emptyText: { textAlign: "center", color: "#777", marginTop: 40 },
});
