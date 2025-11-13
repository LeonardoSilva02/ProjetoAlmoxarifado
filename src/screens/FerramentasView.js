// src/screens/FerramentasView.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { supabase } from "../services/supabase"; // <<<<<< IMPORTANTÍSSIMO

const Tab = createMaterialTopTabNavigator();

/* ===========================================================
      LISTA (VISUALIZAÇÃO — OBRA MASTERS)
=========================================================== */
function ListaFerramentasTab() {
  const [ferramentas, setFerramentas] = useState([]);
  const [busca, setBusca] = useState("");

  /* -----------------------------------------
        CARREGAR DO SUPABASE
  ----------------------------------------- */
  const carregar = async () => {
    const { data, error } = await supabase
      .from("ferramentas")
      .select("*")
      .eq("obra", "masters")
      .order("id", { ascending: false });

    if (error) {
      console.log("Erro ao carregar ferramentas Masters:", error);
      return;
    }

    setFerramentas(data || []);
  };

  /* -----------------------------------------
        REAL-TIME (ATUALIZA AUTOMATICAMENTE)
  ----------------------------------------- */
  useEffect(() => {
    carregar();

    const canal = supabase
      .channel("ferramentas_masters_view")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "ferramentas" },
        () => carregar()
      )
      .subscribe();

    return () => supabase.removeChannel(canal);
  }, []);

  /* -----------------------------------------
        CORES POR SITUAÇÃO
  ----------------------------------------- */
  const getColor = (status) => {
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
    it.nome?.toLowerCase().includes(busca.toLowerCase())
  );

  const renderItem = ({ item }) => {
    const color = getColor(item.situacao);

    return (
      <View style={[styles.card, { borderLeftColor: color, borderLeftWidth: 5 }]}>
        <Text style={styles.nome}>{item.nome}</Text>
        <Text style={styles.meta}>Patrimônio: {item.patrimonio || "N/A"}</Text>
        <Text style={styles.meta}>Local: {item.local || "N/A"}</Text>

        <Text style={[styles.meta, { color, fontWeight: "bold" }]}>
          {item.situacao}
        </Text>

        {item.situacao === "Em manutenção" && (
          <Text style={styles.meta}>
            🧰 Enviado: {item.data_manutencao || "-"}
          </Text>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Barra de busca */}
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

      {/* Lista */}
      <FlatList
        data={itensFiltrados}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {busca ? "Nenhuma ferramenta encontrada." : "Nenhuma ferramenta cadastrada."}
          </Text>
        }
      />
    </View>
  );
}

/* ===========================================================
      RELATÓRIO (VISUALIZAÇÃO — OBRA MASTERS)
=========================================================== */
function RelatorioTab() {
  const [ferramentas, setFerramentas] = useState([]);

  const carregar = async () => {
    const { data, error } = await supabase
      .from("ferramentas")
      .select("*")
      .eq("obra", "masters")
      .order("id", { ascending: false });

    if (!error) setFerramentas(data || []);
  };

  useEffect(() => {
    carregar();

    const canal = supabase
      .channel("ferramentas_masters_report")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "ferramentas" },
        () => carregar()
      )
      .subscribe();

    return () => supabase.removeChannel(canal);
  }, []);

  const funcionando = ferramentas.filter(f => f.situacao === "Funcionando");
  const comDefeito = ferramentas.filter(f => f.situacao === "Com defeito");
  const emManutencao = ferramentas.filter(f => f.situacao === "Em manutenção");

  /* -----------------------------------------
        EXPORTAR (HTML → PDF via navegador)
  ----------------------------------------- */
  const gerarPDF = () => {
    const dataAtual = new Date().toLocaleDateString("pt-BR");

    const htmlContent = `
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Relatório Ferramentas Masters</title>
        <style>
          body { font-family: Arial; margin: 40px; }
          h1 { text-align: center; color: #0b5394; }
          .sec { margin-top: 25px; }
          .titulo { color: #0b5394; font-weight: bold; border-bottom: 2px solid #0b5394; padding-bottom: 5px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { padding: 10px; border: 1px solid #ccc; }
          th { background: #0b5394; color: white; }
        </style>
      </head>
      <body>
        <h1>Relatório - Ferramentas Masters</h1>
        <p>Gerado em ${dataAtual}</p>

        <h2 class="titulo">Funcionando (${funcionando.length})</h2>
        ${funcionando.length ? montarTabela(funcionando) : "<p>Nenhuma</p>"}

        <h2 class="titulo">Com Defeito (${comDefeito.length})</h2>
        ${comDefeito.length ? montarTabela(comDefeito) : "<p>Nenhuma</p>"}

        <h2 class="titulo">Em Manutenção (${emManutencao.length})</h2>
        ${emManutencao.length ? montarTabela(emManutencao) : "<p>Nenhuma</p>"}
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio-ferramentas-masters-${dataAtual}.html`;
    a.click();
  };

  const montarTabela = (lista) => `
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Patrimônio</th>
            <th>Local</th>
            <th>Situação</th>
          </tr>
        </thead>
        <tbody>
          ${lista
            .map(
              (f) => `
              <tr>
                <td>${f.nome}</td>
                <td>${f.patrimonio || "-"}</td>
                <td>${f.local || "-"}</td>
                <td>${f.situacao}</td>
              </tr>`
            )
            .join("")}
        </tbody>
      </table>
  `;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.relatorioHeader}>
        <Ionicons name="stats-chart" size={28} color="#0b5394" />
        <Text style={styles.relatorioTitle}>Relatório — Ferramentas Masters</Text>

        <TouchableOpacity style={styles.btnExportar} onPress={gerarPDF}>
          <Ionicons name="download" size={20} color="#fff" />
          <Text style={styles.btnExportarText}>Exportar PDF</Text>
        </TouchableOpacity>
      </View>

      {/* CARDS DE RESUMO */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: "#e8f5e9" }]}>
          <Text style={styles.statNumber}>{funcionando.length}</Text>
          <Text style={styles.statLabel}>Funcionando</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: "#fff3e0" }]}>
          <Text style={styles.statNumber}>{comDefeito.length}</Text>
          <Text style={styles.statLabel}>Com defeito</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: "#ffebee" }]}>
          <Text style={styles.statNumber}>{emManutencao.length}</Text>
          <Text style={styles.statLabel}>Em manutenção</Text>
        </View>
      </View>

      {/* LISTA COMPLETA */}
      <View style={styles.listaStatus}>
        <Text style={styles.listaTitle}>Todas as Ferramentas ({ferramentas.length})</Text>

        {ferramentas.map((item) => {
          const cor =
            item.situacao === "Funcionando"
              ? "#4cd137"
              : item.situacao === "Com defeito"
              ? "#fbc531"
              : "#ff4d4d";

          return (
            <View key={item.id} style={[styles.miniCard, { borderLeftColor: cor }]}>
              <Text style={styles.miniNome}>{item.nome}</Text>
              <Text style={styles.miniMeta}>Patrimônio: {item.patrimonio}</Text>
              <Text style={styles.miniMeta}>Local: {item.local}</Text>
              <Text style={[styles.miniMeta, { color: cor, fontWeight: "bold" }]}>
                {item.situacao}
              </Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

/* ===========================================================
      TELA PRINCIPAL
=========================================================== */
export default function FerramentasView() {
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <Ionicons name="construct-outline" size={22} color="#fff" />
        <Text style={styles.headerTitle}>Ferramentas Masters (Visualização)</Text>
      </View>

      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: "#0b5394",
          tabBarInactiveTintColor: "#666",
          tabBarLabelStyle: { fontSize: 13, fontWeight: "bold" },
          tabBarStyle: { backgroundColor: "#f5f5f5" },
          tabBarIndicatorStyle: { backgroundColor: "#0b5394", height: 3 },
        }}
      >
        <Tab.Screen name="Lista" component={ListaFerramentasTab} />
        <Tab.Screen name="Relatório" component={RelatorioTab} />
      </Tab.Navigator>
    </View>
  );
}

/* ===========================================================
      ESTILOS
=========================================================== */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f7fb", padding: 12 },
  header: {
    backgroundColor: "#0b5394",
    paddingTop: Platform.OS === "ios" ? 50 : 25,
    paddingBottom: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    elevation: 4,
  },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "bold", marginLeft: 8 },
  searchRow: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  searchInput: { flex: 1, marginLeft: 10, height: 40 },

  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 10,
    elevation: 2,
    marginBottom: 10,
  },

  nome: { fontWeight: "bold", color: "#0b5394", fontSize: 16 },
  meta: { color: "#555" },
  emptyText: { textAlign: "center", color: "#777", marginTop: 40 },

  /* RELATÓRIO */
  relatorioHeader: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    elevation: 2,
    marginBottom: 16,
  },
  relatorioTitle: { fontSize: 20, fontWeight: "bold", color: "#0b5394", marginTop: 8 },
  btnExportar: {
    flexDirection: "row",
    marginTop: 12,
    backgroundColor: "#0b5394",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  btnExportarText: { color: "#fff", marginLeft: 8, fontWeight: "bold" },

  statsRow: { flexDirection: "row", justifyContent: "space-between" },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    elevation: 2,
  },
  statNumber: { fontSize: 26, fontWeight: "bold" },
  statLabel: { fontSize: 12, color: "#666" },

  listaStatus: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    elevation: 2,
    marginTop: 16,
  },
  listaTitle: { fontWeight: "bold", fontSize: 16, marginBottom: 12 },
  miniCard: {
    backgroundColor: "#f5f7fb",
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    marginBottom: 10,
  },
  miniNome: { fontWeight: "bold", marginBottom: 4 },
  miniMeta: { fontSize: 12, color: "#555" },
});
