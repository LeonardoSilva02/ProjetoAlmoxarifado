// src/screens/FerramentasView.js
// VISUALIZAÇÃO — MODELO HONDA + EXPORTAR PDF

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  ScrollView,
  Platform,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { supabase } from "../services/supabase";

const Tab = createMaterialTopTabNavigator();

/* ===========================================================
      LISTA — MASTERS
=========================================================== */
function ListaFerramentasTab() {
  const [ferramentas, setFerramentas] = useState([]);
  const [busca, setBusca] = useState("");

  const carregar = async () => {
    const { data } = await supabase
      .from("ferramentas")
      .select("*")
      .eq("obra", "masters")
      .order("id", { ascending: false });

    setFerramentas(data || []);
  };

  useEffect(() => {
    carregar();

    const canal = supabase
      .channel("masters_view")
      .on(
        "postgres_changes",
        { event: "*", table: "ferramentas" },
        () => carregar()
      )
      .subscribe();

    return () => supabase.removeChannel(canal);
  }, []);

  const getColor = (s) =>
    s === "Funcionando"
      ? "#28a745"
      : s === "Com defeito"
      ? "#e1a300"
      : "#c62828";

  const filtrados = ferramentas.filter((f) =>
    f.nome?.toLowerCase().includes(busca.toLowerCase())
  );

  const renderItem = ({ item }) => {
    const cor = getColor(item.situacao);
    return (
      <View style={[styles.itemCard, { borderLeftColor: cor }]}>
        <Text style={styles.itemNome}>{item.nome}</Text>

        <Text style={styles.itemLinha}>
          Patrimônio: <Text style={styles.itemDestaque}>{item.patrimonio}</Text>
        </Text>

        <Text style={styles.itemLinha}>
          Local: <Text style={styles.itemDestaque}>{item.local}</Text>
        </Text>

        <Text style={[styles.itemLinha, { color: cor, fontWeight: "bold" }]}>
          Situação: {item.situacao}
        </Text>

        {item.situacao === "Em manutenção" && (
          <Text style={styles.itemLinha}>
            Data Envio: {item.data_manutencao || "N/A"}
          </Text>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <Ionicons name="construct" size={22} color="#fff" />
        <Text style={styles.headerTitle}>Ferramentas Masters</Text>
      </View>

      {/* Busca */}
      <View style={styles.searchRow}>
        <Ionicons name="search" size={18} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar ferramenta..."
          placeholderTextColor="#999"
          value={busca}
          onChangeText={setBusca}
        />
      </View>

      <FlatList
        data={filtrados}
        keyExtractor={(i) => i.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </View>
  );
}

/* ===========================================================
      RELATÓRIO — MASTERS + BOTÃO PDF
=========================================================== */
function RelatorioTab() {
  const [ferramentas, setFerramentas] = useState([]);

  const carregar = async () => {
    const { data } = await supabase
      .from("ferramentas")
      .select("*")
      .eq("obra", "masters")
      .order("nome");

    setFerramentas(data || []);
  };

  useEffect(() => {
    carregar();

    const canal = supabase
      .channel("masters_report")
      .on(
        "postgres_changes",
        { event: "*", table: "ferramentas" },
        () => carregar()
      )
      .subscribe();

    return () => supabase.removeChannel(canal);
  }, []);

  const funcionando = ferramentas.filter((f) => f.situacao === "Funcionando");
  const comDefeito = ferramentas.filter((f) => f.situacao === "Com defeito");
  const emManutencao = ferramentas.filter((f) => f.situacao === "Em manutenção");

  const exportarPDF = () => {
    alert("Exportar PDF — Implementação futura.");
  };

  return (
    <ScrollView style={styles.container}>

      {/* HEADER RELATÓRIO FIXO E CORRIGIDO */}
      <View style={styles.relatorioHeader}>
        <Ionicons name="stats-chart" size={28} color="#0b5394" />

        <Text style={styles.relatorioTitulo}>Relatório de Ferramentas</Text>

        <TouchableOpacity style={styles.exportButton} onPress={exportarPDF}>
          <Ionicons name="download-outline" size={18} color="#fff" />
          <Text style={styles.exportText}>PDF</Text>
        </TouchableOpacity>
      </View>

      {/* CARDS RESUMO */}
      <View style={styles.rowResumo}>
        <View style={[styles.resumoCard, { backgroundColor: "#e8f5e9" }]}>
          <Text style={styles.resumoNumero}>{funcionando.length}</Text>
          <Text style={styles.resumoLabel}>Funcionando</Text>
        </View>

        <View style={[styles.resumoCard, { backgroundColor: "#fff3e0" }]}>
          <Text style={styles.resumoNumero}>{comDefeito.length}</Text>
          <Text style={styles.resumoLabel}>Com Defeito</Text>
        </View>

        <View style={[styles.resumoCard, { backgroundColor: "#ffebee" }]}>
          <Text style={styles.resumoNumero}>{emManutencao.length}</Text>
          <Text style={styles.resumoLabel}>Em Manutenção</Text>
        </View>
      </View>

      {/* TOTAL */}
      <View style={styles.totalCard}>
        <Text style={styles.resumoNumero}>{ferramentas.length}</Text>
        <Text style={styles.totalLabel}>Total de Ferramentas</Text>
      </View>

      {/* LISTA COMPLETA */}
      <View style={styles.listaBox}>
        <Text style={styles.listaTitulo}>
          📋 Todas as Ferramentas ({ferramentas.length})
        </Text>

        {ferramentas.map((item) => {
          const cor =
            item.situacao === "Funcionando"
              ? "#28a745"
              : item.situacao === "Com defeito"
              ? "#e1a300"
              : "#c62828";

          return (
            <View key={item.id} style={[styles.itemFull, { borderLeftColor: cor }]}>
              <Text style={styles.itemFullNome}>{item.nome}</Text>
              <Text style={styles.itemFullLinha}>
                Patrimônio: <Text style={styles.itemFullDest}>{item.patrimonio}</Text>
              </Text>
              <Text style={styles.itemFullLinha}>
                Local: <Text style={styles.itemFullDest}>{item.local}</Text>
              </Text>
              <Text style={[styles.itemFullLinha, { color: cor, fontWeight: "bold" }]}>
                Situação: {item.situacao}
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
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: "#fff",
          tabBarInactiveTintColor: "#c6d4e1",
          tabBarStyle: { backgroundColor: "#0b5394" },
          tabBarIndicatorStyle: { backgroundColor: "#fff" },
          tabBarLabelStyle: { fontSize: 13, fontWeight: "bold" },
        }}
      >
        <Tab.Screen name="Lista" component={ListaFerramentasTab} />
        <Tab.Screen name="Relatório" component={RelatorioTab} />
      </Tab.Navigator>
    </View>
  );
}

/* ===========================================================
      ESTILOS — VISUAL HONDA
=========================================================== */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f2f5", padding: 12 },

  header: {
    backgroundColor: "#0b5394",
    paddingTop: Platform.OS === "ios" ? 50 : 25,
    paddingBottom: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "bold", marginLeft: 8 },

  /* Busca */
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d8dfe7",
    paddingHorizontal: 10,
    marginTop: 10,
    marginBottom: 10,
  },
  searchInput: { flex: 1, height: 40 },

  /* Lista */
  itemCard: {
    backgroundColor: "#fff",
    marginTop: 10,
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 5,
  },
  itemNome: { fontSize: 15, fontWeight: "bold", color: "#222" },
  itemLinha: { fontSize: 13, marginTop: 2, color: "#444" },
  itemDestaque: { fontWeight: "bold" },

  /* Relatório */
  relatorioHeader: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  relatorioTitulo: { fontSize: 16, color: "#0b5394", fontWeight: "bold" },

  exportButton: {
    backgroundColor: "#0b5394",
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    alignItems: "center",
  },
  exportText: {
    color: "#fff",
    marginLeft: 4,
    fontWeight: "bold",
  },

  /* Resumo */
  rowResumo: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  resumoCard: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 4,
  },
  resumoNumero: { fontSize: 26, fontWeight: "bold", color: "#222" },
  resumoLabel: { fontSize: 12, color: "#666" },

  totalCard: {
    marginTop: 12,
    backgroundColor: "#e1efff",
    paddingVertical: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  totalLabel: { marginTop: 5, color: "#003366", fontWeight: "bold" },

  /* Lista completa */
  listaBox: {
    marginTop: 18,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
  },
  listaTitulo: {
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#0b5394",
  },

  itemFull: {
    backgroundColor: "#f7f9fc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 5,
  },
  itemFullNome: { fontSize: 15, fontWeight: "bold" },
  itemFullLinha: { fontSize: 13, marginTop: 2 },
  itemFullDest: { fontWeight: "bold" },
});

