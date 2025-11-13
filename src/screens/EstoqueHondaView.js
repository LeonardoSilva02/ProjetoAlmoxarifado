// src/screens/EstoqueHondaView.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Platform,
} from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../services/supabase";

const Tab = createMaterialTopTabNavigator();

/* ============================================
      CategoriaTab – SOMENTE VISUALIZAÇÃO
      (Agora usando Supabase)
============================================ */
function CategoriaTab({ categoriaKey, titulo }) {
  const [itens, setItens] = useState([]);
  const [busca, setBusca] = useState("");

  // Carregar do Supabase
  const carregar = async () => {
    const { data, error } = await supabase
      .from("estoque_itens")
      .select("*")
      .eq("categoria", categoriaKey)
      .eq("obra", "honda")
      .order("id", { ascending: false });

    if (error) {
      console.log("Erro ao carregar estoque (view):", error);
      return;
    }

    setItens(data || []);
  };

  useEffect(() => {
    carregar();

    // Atualizar a cada 3 segundos para sincronizar
    const interval = setInterval(carregar, 3000);
    return () => clearInterval(interval);
  }, []);

  // Filtro de busca
  const itensFiltrados = itens.filter((it) =>
    it.nome?.toLowerCase().includes(busca.toLowerCase())
  );

  const getEstoqueColor = (it) => {
    if (it.quantidade <= it.minimo) return "#ff4d4d";
    if (it.quantidade <= it.minimo * 2) return "#fbc531";
    return "#4cd137";
  };

  const renderItem = ({ item }) => {
    const cor = getEstoqueColor(item);
    const criado = item.criado_em
      ? new Date(item.criado_em).toLocaleString("pt-BR")
      : "-";

    return (
      <View style={[styles.card, item.quantidade <= item.minimo && styles.cardLow]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.itemName}>{item.nome}</Text>

          <Text style={styles.meta}>
            Qtd:{" "}
            <Text style={{ color: cor, fontWeight: "700" }}>{item.quantidade}</Text>{" "}
            • Mínimo: {item.minimo}
          </Text>

          <Text style={styles.meta}>Criado: {criado}</Text>

          {item.quantidade <= item.minimo && (
            <Text style={styles.warning}>⚠ Abaixo do mínimo</Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.tabWrap}>
      <View style={styles.topRow}>
        <Text style={styles.tabTitle}>{titulo}</Text>

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
      </View>

      {itensFiltrados.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>
            {busca
              ? "Nenhum item encontrado."
              : "Nenhum item cadastrado ainda."}
          </Text>
        </View>
      ) : (
        <FlatList
          data={itensFiltrados}
          keyExtractor={(i) => i.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 120 }}
        />
      )}
    </View>
  );
}

/* ============================================
      TELA PRINCIPAL (sem alterações)
============================================ */
export default function EstoqueHondaView() {
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <Ionicons name="business" size={22} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.headerTitle}>Honda - Estoque (Visualização)</Text>
      </View>

      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: "#fff",
          tabBarStyle: { backgroundColor: "#0b5394" },
          tabBarIndicatorStyle: { backgroundColor: "#fff" },
          tabBarLabelStyle: { fontSize: 13, fontWeight: "700" },
        }}
      >
        <Tab.Screen name="Elétrica">
          {() => <CategoriaTab categoriaKey="eletrica" titulo="Honda - Elétrica" />}
        </Tab.Screen>

        <Tab.Screen name="Mecânica">
          {() => <CategoriaTab categoriaKey="mecanica" titulo="Honda - Mecânica" />}
        </Tab.Screen>

        <Tab.Screen name="Pintura">
          {() => <CategoriaTab categoriaKey="pintura" titulo="Honda - Pintura" />}
        </Tab.Screen>

        <Tab.Screen name="Porcas e Arruelas">
          {() => (
            <CategoriaTab
              categoriaKey="porcas_arruelas"
              titulo="Honda - Porcas, Arruelas e Parafusos"
            />
          )}
        </Tab.Screen>

        <Tab.Screen name="Outros">
          {() => <CategoriaTab categoriaKey="outros" titulo="Honda - Outros" />}
        </Tab.Screen>
      </Tab.Navigator>
    </View>
  );
}

/* ============================================
      ESTILOS (iguais ao seu original)
============================================ */
const styles = StyleSheet.create({
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
  tabWrap: { flex: 1, backgroundColor: "#f5f7fb", padding: 12 },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  tabTitle: { fontSize: 16, fontWeight: "700", color: "#0b5394" },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e6eaf5",
  },
  searchInput: { marginLeft: 8, minWidth: 160, height: 40, color: "#333" },
  emptyWrap: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { color: "#777" },
  card: {
    flexDirection: "row",
    padding: 14,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 10,
    elevation: 3,
    alignItems: "center",
  },
  cardLow: { borderWidth: 1.5, borderColor: "#ff4d4d", backgroundColor: "#fff4f4" },
  itemName: { fontSize: 16, fontWeight: "700", color: "#222", marginBottom: 6 },
  meta: { color: "#666", fontSize: 13 },
  warning: { color: "#ff4d4d", marginTop: 6, fontWeight: "700" },
});
