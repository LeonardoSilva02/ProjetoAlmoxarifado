// src/screens/FerramentasView.js
import React, { useEffect, useState } from "react";
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { exportarFerramentasParaExcel } from '../utils/exportUtils';

export default function FerramentasView() {
  const [ferramentas, setFerramentas] = useState([]);
  const [busca, setBusca] = useState("");
  const STORAGE_KEY = "@ferramentas_data";
  const STORAGE_KEY_HONDA = "@ferramentas_honda_data";

  const exportarPlanilha = async () => {
    try {
      // Carregar dados das ferramentas Honda
      const rawHonda = await AsyncStorage.getItem(STORAGE_KEY_HONDA);
      const ferramentasHonda = rawHonda ? JSON.parse(rawHonda) : [];
      
      // Exportar
      await exportarFerramentasParaExcel(ferramentas, ferramentasHonda);
      Alert.alert("Sucesso", "Planilha exportada com sucesso!");
    } catch (error) {
      console.error("Erro ao exportar planilha:", error);
      if (Platform.OS !== 'web') {
        Alert.alert(
          "Exportação não disponível",
          "Para exportar a planilha, por favor acesse o sistema pela versão web."
        );
      } else {
        Alert.alert("Erro", "Não foi possível exportar a planilha. Tente novamente.");
      }
    }
  };

  useEffect(() => {
    const carregar = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setFerramentas(JSON.parse(raw));
      } catch (e) {
        console.log("Erro ao carregar ferramentas:", e);
      }
    };
    carregar();
  }, []);

  const itensFiltrados = ferramentas.filter((i) =>
    i.nome?.toLowerCase().includes(busca.toLowerCase())
  );

  const getColor = (status) => {
    switch (status) {
      case "Funcionando": return "#4cd137";
      case "Com defeito": return "#fbc531";
      case "Em manutenção": return "#ff4d4d";
      default: return "#777";
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="construct-outline" size={22} color="#fff" />
        <Text style={styles.headerTitle}>Ferramentas</Text>
        <TouchableOpacity onPress={exportarPlanilha} style={styles.exportButton}>
          <Ionicons name="download-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchRow}>
        <Ionicons name="search" size={18} color="#666" />
        <TextInput
          placeholder="Buscar ferramenta..."
          placeholderTextColor="#999"
          value={busca}
          onChangeText={setBusca}
          style={styles.searchInput}
        />
      </View>

      <FlatList
        data={itensFiltrados}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <View style={[styles.card, { borderLeftColor: getColor(item.situacao), borderLeftWidth: 5 }]}>
            <Text style={styles.nome}>{item.nome}</Text>
            <Text style={styles.meta}>Patrimônio: {item.patrimonio}</Text>
            <Text style={styles.meta}>Local: {item.local}</Text>
            <Text style={[styles.meta, { color: getColor(item.situacao), fontWeight: "bold" }]}>
              {item.situacao}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Nenhuma ferramenta encontrada.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f7fb", padding: 12 },
  exportButton: {
    marginLeft: 'auto',
    padding: 8,
  },
  header: {
    backgroundColor: "#0b5394",
    paddingTop: Platform.OS === "ios" ? 50 : 25,
    paddingBottom: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    elevation: 6,
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
