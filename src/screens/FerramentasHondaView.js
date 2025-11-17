// VISUALIZAÇÃO — MODELO EXATO DO RELATÓRIO HONDA + MOVIMENTAÇÕES + EXPORTAR PDF

import React, { useState, useEffect } from "react";
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
   🔵 FUNÇÃO AUXILIAR — DATA BR
=========================================================== */
function formatDateBR(dateISO) {
  if (!dateISO) return "-";
  const d = new Date(dateISO);
  return d.toLocaleDateString("pt-BR");
}

/* ===========================================================
   LISTA — VISUAL HONDA + MOVIMENTAÇÕES
=========================================================== */
function ListaFerramentasTab() {
  const [ferramentas, setFerramentas] = useState([]);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    carregarFerramentas();

    const canal = supabase
      .channel("honda_view")
      .on(
        "postgres_changes",
        { event: "*", table: "ferramentas" },
        () => carregarFerramentas()
      )
      .subscribe();

    return () => supabase.removeChannel(canal);
  }, []);

  /* ============================================
      🔥 AGORA CADA FERRAMENTA PUXA MOVIMENTAÇÃO
  ============================================ */
  const carregarFerramentas = async () => {
    const { data: listaFerr } = await supabase
      .from("ferramentas")
      .select("*")
      .eq("obra", "honda")
      .order("nome");

    if (!listaFerr) return setFerramentas([]);

    const listaComMov = await Promise.all(
      listaFerr.map(async (f) => {
        const { data: mov } = await supabase
          .from("movimentacoes")
          .select("*")
          .eq("patrimonio", f.patrimonio)
          .order("id", { ascending: false })
          .limit(1);

        return {
          ...f,
          movimentacao: mov && mov.length > 0 ? mov[0] : null,
        };
      })
    );

    setFerramentas(listaComMov);
  };

  const getColor = (status) =>
    status === "Funcionando"
      ? "#4cd137"
      : status === "Com defeito"
      ? "#fbc531"
      : "#ff4d4d";

  const filtrados = ferramentas.filter((f) =>
    f.nome.toLowerCase().includes(busca.toLowerCase())
  );

  const renderItem = ({ item }) => {
    const color = getColor(item.situacao);
    const mov = item.movimentacao;
    const emUso = mov && !mov.data_devolucao;

    return (
      <View style={[styles.itemFull, { borderLeftColor: color }]}>

        <Text style={styles.itemFullNome}>{item.nome}</Text>
        <Text style={styles.itemFullLinha}>
          Patrimônio: <Text style={styles.itemFullDest}>{item.patrimonio}</Text>
        </Text>

        {/* 🔥 SE ESTÁ EM MOVIMENTAÇÃO (RETIRADA EM ABERTO) */}
        {emUso ? (
          <>
            <Text style={[styles.itemFullLinha, { color: "#0b5394", fontWeight: "bold" }]}>
              🚨 Em uso por: {mov.colaborador}
            </Text>

            <Text style={styles.itemFullLinha}>
              Obra: <Text style={styles.itemFullDest}>{mov.obra}</Text>
            </Text>

            <Text style={styles.itemFullLinha}>
              Retirada: {formatDateBR(mov.data_retirada)}
            </Text>

            {mov.data_prevista && (
              <Text style={styles.itemFullLinha}>
                Prev. devolução: {formatDateBR(mov.data_prevista)}
              </Text>
            )}

            <Text style={[styles.itemFullLinha, { color: "#c0392b", fontWeight: "bold" }]}>
              Status: {mov.status}
            </Text>
          </>
        ) : (
          <>
            {/* 🔵 SEM MOV — MOSTRA LOCAL NORMAL */}
            <Text style={styles.itemFullLinha}>
              Local: <Text style={styles.itemFullDest}>{item.local}</Text>
            </Text>

            <Text
              style={[
                styles.itemFullLinha,
                { color, fontWeight: "bold" },
              ]}
            >
              Situação: {item.situacao}
            </Text>
          </>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Barra de Busca */}
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
        data={filtrados}
        keyExtractor={(i) => i.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 60 }}
      />
    </View>
  );
}

/* ===========================================================
   RELATÓRIO — (sem alterações)
=========================================================== */
function RelatorioTab() {
  const [ferramentas, setFerramentas] = useState([]);

  useEffect(() => {
    carregar();
    const canal = supabase
      .channel("honda_report")
      .on(
        "postgres_changes",
        { event: "*", table: "ferramentas" },
        () => carregar()
      )
      .subscribe();

    return () => supabase.removeChannel(canal);
  }, []);

  const carregar = async () => {
    const { data } = await supabase
      .from("ferramentas")
      .select("*")
      .eq("obra", "honda")
      .order("nome");

    setFerramentas(data || []);
  };

  const funcionando = ferramentas.filter((f) => f.situacao === "Funcionando");
  const comDefeito = ferramentas.filter((f) => f.situacao === "Com defeito");
  const emManutencao = ferramentas.filter((f) => f.situacao === "Em manutenção");

  const exportarPDF = () => {
    alert("Exportar PDF — Em desenvolvimento");
  };

  return (
    <ScrollView style={styles.container}>

      <View style={styles.relatorioHeader}>
        <Ionicons name="stats-chart" size={32} color="#0b5394" />
        <Text style={styles.relatorioTitulo}>Relatório de Ferramentas</Text>

        <TouchableOpacity style={styles.exportButton} onPress={exportarPDF}>
          <Ionicons name="download-outline" size={20} color="#fff" />
          <Text style={styles.exportText}>Exportar PDF</Text>
        </TouchableOpacity>
      </View>

      {/* Cards Resumo */}
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
              ? "#4cd137"
              : item.situacao === "Com defeito"
              ? "#fbc531"
              : "#ff4d4d";

          return (
            <View key={item.id} style={[styles.itemFull, { borderLeftColor: cor }]}>
              <Text style={styles.itemFullNome}>{item.nome}</Text>
              <Text style={styles.itemFullLinha}>
                Patrimônio: <Text style={styles.itemFullDest}>{item.patrimonio}</Text>
              </Text>
              <Text style={styles.itemFullLinha}>
                Local: <Text style={styles.itemFullDest}>{item.local}</Text>
              </Text>
              <Text
                style={[
                  styles.itemFullLinha,
                  { color: cor, fontWeight: "bold" },
                ]}
              >
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
export default function FerramentasHondaView() {
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <Ionicons name="construct" size={22} color="#fff" />
        <Text style={styles.headerTitle}>Ferramentas Honda (Visualização)</Text>
      </View>

      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: "#fff",
          tabBarInactiveTintColor: "#d3d3d3",
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
   ESTILOS
=========================================================== */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f2f5",
    padding: 12,
  },

  header: {
    backgroundColor: "#0b5394",
    paddingTop: Platform.OS === "ios" ? 50 : 25,
    paddingBottom: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
  },

  searchRow: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d8dfe7",
    paddingHorizontal: 10,
    marginTop: 10,
    marginBottom: 10,
    alignItems: "center",
  },
  searchInput: { flex: 1, height: 40 },

  itemFull: {
    backgroundColor: "#f7f9fc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 6,
  },
  itemFullNome: { fontSize: 16, fontWeight: "bold", color: "#222" },
  itemFullLinha: { fontSize: 13, marginTop: 3, color: "#444" },
  itemFullDest: { fontWeight: "bold", color: "#222" },

  /* Relatório */
  relatorioHeader: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 14,
  },
  relatorioTitulo: {
    fontSize: 18,
    color: "#0b5394",
    fontWeight: "bold",
    marginTop: 6,
  },

  exportButton: {
    marginTop: 12,
    backgroundColor: "#0b5394",
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  exportText: {
    color: "#fff",
    marginLeft: 6,
    fontWeight: "bold",
  },

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
    backgroundColor: "#e3f2fd",
    paddingVertical: 18,
    borderRadius: 8,
    alignItems: "center",
  },
  totalLabel: {
    marginTop: 5,
    color: "#003366",
    fontWeight: "bold",
  },

  listaBox: {
    marginTop: 18,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
  },
  listaTitulo: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0b5394",
    marginBottom: 14,
  },
});
