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
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { supabase } from "../services/supabase";
import { format } from "date-fns";

const Tab = createMaterialTopTabNavigator();

/* =============================
      LISTA DE FERRAMENTAS
============================= */
function ListaFerramentasTab() {
  const [ferramentas, setFerramentas] = useState([]);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    carregar();

    // 🔥 Realtime Supabase (escuta alterações)
    const channel = supabase
      .channel("ferramentas_honda_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "ferramentas",
        },
        () => carregar()
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const carregar = async () => {
    const { data, error } = await supabase
      .from("ferramentas")
      .select("*")
      .eq("obra", "honda")
      .order("nome", { ascending: true });

    if (!error && data) setFerramentas(data);
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
    const dataManutencao = item.data_manutencao
      ? format(new Date(item.data_manutencao), "dd/MM/yyyy")
      : "-";

    return (
      <View style={[styles.card, { borderLeftColor: color, borderLeftWidth: 5 }]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.nome}>{item.nome}</Text>
          <Text style={styles.meta}>Patrimônio: {item.patrimonio}</Text>
          <Text style={styles.meta}>Local: {item.local || "Não informado"}</Text>
          <Text style={[styles.situacao, { color }]}>{item.situacao}</Text>

          {item.situacao === "Em manutenção" && (
            <Text style={styles.meta}>🧰 Enviado em: {dataManutencao}</Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
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
        keyExtractor={(i) => i.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Nenhuma ferramenta encontrada.</Text>
        }
      />
    </View>
  );
}

/* =============================
            RELATÓRIO
============================= */
function RelatorioTab() {
  const [ferramentas, setFerramentas] = useState([]);

  useEffect(() => {
    carregar();
    const interval = setInterval(carregar, 2500);
    return () => clearInterval(interval);
  }, []);

  const carregar = async () => {
    const { data } = await supabase
      .from("ferramentas")
      .select("*")
      .eq("obra", "honda");

    setFerramentas(data || []);
  };

  const funcionando = ferramentas.filter((f) => f.situacao === "Funcionando");
  const comDefeito = ferramentas.filter((f) => f.situacao === "Com defeito");
  const emManutencao = ferramentas.filter((f) => f.situacao === "Em manutenção");

  const gerarPDF = () => {
    const dataAtual = new Date().toLocaleDateString("pt-BR");

    const html = `
      <html>
      <head>
      <meta charset="utf-8"/>
      <title>Relatório Honda</title>
      </head>
      <body>
      <h1>Relatório de Ferramentas Honda</h1>
      <p>Gerado em ${dataAtual}</p>
      <h2>Total: ${ferramentas.length}</h2>
      </body>
      </html>
    `;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio-honda-${dataAtual}.html`;
    a.click();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.relatorioHeader}>
        <Ionicons name="stats-chart" size={32} color="#0b5394" />
        <Text style={styles.relatorioTitle}>Relatório de Ferramentas</Text>

        <TouchableOpacity style={styles.btnExportar} onPress={gerarPDF}>
          <Ionicons name="download" size={20} color="#fff" />
          <Text style={styles.btnExportarText}>Exportar</Text>
        </TouchableOpacity>
      </View>

      {/* Cards */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: "#e8f5e9" }]}>
          <Text style={styles.statNumber}>{funcionando.length}</Text>
          <Text>Funcionando</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: "#fff3e0" }]}>
          <Text style={styles.statNumber}>{comDefeito.length}</Text>
          <Text>Com Defeito</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: "#ffebee" }]}>
          <Text style={styles.statNumber}>{emManutencao.length}</Text>
          <Text>Em Manutenção</Text>
        </View>
      </View>
    </ScrollView>
  );
}

/* =============================
      TELA PRINCIPAL (VIEW)
============================= */
export default function FerramentasHondaView() {
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <Ionicons name="construct" size={22} color="#fff" />
        <Text style={styles.headerTitle}>Ferramentas Honda (Visualização)</Text>
      </View>

      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: "#0b5394",
          tabBarIndicatorStyle: { backgroundColor: "#0b5394" },
        }}
      >
        <Tab.Screen name="Lista" component={ListaFerramentasTab} />
        <Tab.Screen name="Relatório" component={RelatorioTab} />
      </Tab.Navigator>
    </View>
  );
}

/* =============================
            ESTILOS
============================= */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f7fb", padding: 12 },

  header: {
    backgroundColor: "#0b5394",
    paddingTop: Platform.OS === "ios" ? 50 : 25,
    paddingBottom: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
  },

  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "bold", marginLeft: 8 },

  searchRow: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 15,
    alignItems: "center",
  },

  searchInput: {
    marginLeft: 8,
    flex: 1,
    height: 40,
  },

  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },

  nome: { fontSize: 16, fontWeight: "bold" },
  meta: { color: "#555" },
  situacao: { fontWeight: "bold", marginTop: 4 },

  emptyText: { textAlign: "center", marginTop: 40, color: "#777" },

  relatorioHeader: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
  },

  relatorioTitle: { fontSize: 20, fontWeight: "bold", color: "#0b5394" },

  btnExportar: {
    flexDirection: "row",
    backgroundColor: "#0b5394",
    padding: 10,
    borderRadius: 10,
    marginTop: 12,
  },
  btnExportarText: { color: "#fff", marginLeft: 6, fontWeight: "bold" },

  statsRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 20 },

  statCard: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: "#eee",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },

  statNumber: { fontSize: 28, fontWeight: "bold" },
});
