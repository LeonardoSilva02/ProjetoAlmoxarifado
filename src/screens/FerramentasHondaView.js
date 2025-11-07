// src/screens/FerramentasHondaView.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { exportarFerramentasParaExcel } from '../utils/exportUtils';

export default function FerramentasHondaView() {
  const [ferramentas, setFerramentas] = useState([]);
  const [busca, setBusca] = useState("");

  const STORAGE_KEY = "@ferramentas_honda_data";
  const STORAGE_KEY_GERAL = "@ferramentas_data";

  const exportarPlanilha = async () => {
    try {
      // Carregar dados das ferramentas gerais
      const rawGeral = await AsyncStorage.getItem(STORAGE_KEY_GERAL);
      const ferramentasGerais = rawGeral ? JSON.parse(rawGeral) : [];
      
      // Exportar
      await exportarFerramentasParaExcel(ferramentasGerais, ferramentas);
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
    carregar();
  }, []);

  const carregar = async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) setFerramentas(JSON.parse(raw));
    } catch (e) {
      console.log("Erro ao carregar ferramentas Honda:", e);
    }
  };

  const getColorByStatus = (status) => {
    switch (status) {
      case "Funcionando":
        return "#4cd137";
      case "Com defeito":
        return "#fbc531";
      case "Em manutenção":
        return "#ff4d4d";
      default:
        return "#777";
    }
  };

  const itensFiltrados = ferramentas.filter((it) =>
    it.nome.toLowerCase().includes(busca.toLowerCase())
  );

  const renderItem = ({ item }) => {
    const color = getColorByStatus(item.situacao);
    return (
      <View style={[styles.card, { borderLeftColor: color, borderLeftWidth: 5 }]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.nome}>{item.nome}</Text>
          <Text style={styles.meta}>Patrimônio: {item.patrimonio}</Text>
          <Text style={styles.meta}>Local: {item.local}</Text>
          <Text style={[styles.situacao, { color }]}>{item.situacao}</Text>
          {item.situacao === "Em manutenção" && (
            <Text style={styles.meta}>
              🧰 Enviado em: {item.dataManutencao || "-"}
            </Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="construct" size={22} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.headerTitle}>Ferramentas Honda</Text>
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

      {itensFiltrados.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>
            {busca ? "Nenhum item encontrado." : "Nenhuma ferramenta cadastrada."}
          </Text>
        </View>
      ) : (
        <FlatList
          data={itensFiltrados}
          keyExtractor={(i) => i.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}
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
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e6eaf5",
    marginTop: 12,
    marginBottom: 8,
  },
  searchInput: { marginLeft: 8, flex: 1, height: 40, color: "#333" },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    elevation: 3,
  },
  nome: { fontSize: 16, fontWeight: "700", color: "#222", marginBottom: 4 },
  meta: { color: "#555", fontSize: 13 },
  situacao: { fontWeight: "bold", marginTop: 4 },
  emptyWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyText: { color: "#777" },
});
