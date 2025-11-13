// src/screens/AlmoxarifadoHondaScreen.js

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
  TextInput,
  Alert,
  Platform,
} from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { supabase } from "../services/supabase";   // <<<<<< IMPORTANTÍSSIMO

const Tab = createMaterialTopTabNavigator();

/* =========================================================
      CATEGORIA TAB – versão 100% integrada ao SUPABASE
========================================================= */
function CategoriaTab({ categoriaKey, titulo }) {
  const [itens, setItens] = useState([]);
  const [busca, setBusca] = useState("");

  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [nome, setNome] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [minimo, setMinimo] = useState("");

  /* ----------------------------------------
      1) CARREGAR DADOS DO SUPABASE
  ---------------------------------------- */
  const carregar = async () => {
    const { data, error } = await supabase
      .from("estoque_itens")
      .select("*")
      .eq("categoria", categoriaKey)
      .eq("obra", "honda")
      .order("id", { ascending: false });

    if (error) {
      console.log("Erro ao carregar estoque:", error);
      return;
    }

    setItens(data || []);
  };

  useEffect(() => {
    carregar();
  }, []);

  /* ----------------------------------------
      2) ADICIONAR ITEM
  ---------------------------------------- */
  const adicionarItem = async () => {
    if (!nome.trim() || !quantidade || !minimo) {
      Alert.alert("Preencha todos os campos!");
      return;
    }

    const novo = {
      nome: nome.trim(),
      quantidade: Number(quantidade),
      minimo: Number(minimo),
      categoria: categoriaKey,
      obra: "honda",
      criado_em: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("estoque_itens")
      .insert([novo])
      .select();

    if (error) {
      console.log("Erro ao adicionar:", error);
      return;
    }

    setItens((prev) => [data[0], ...prev]);
    setModalVisible(false);
  };

  /* ----------------------------------------
      3) SALVAR EDIÇÃO
  ---------------------------------------- */
  const salvarEdicao = async () => {
    const { data, error } = await supabase
      .from("estoque_itens")
      .update({
        nome: nome.trim(),
        quantidade: Number(quantidade),
        minimo: Number(minimo),
      })
      .eq("id", editingItem.id)
      .select();

    if (error) {
      console.log("Erro ao editar:", error);
      return;
    }

    carregar();
    setModalVisible(false);
  };

  /* ----------------------------------------
      4) DELETAR ITEM
  ---------------------------------------- */
  const deletarItem = async (item) => {
    const confirmar =
      Platform.OS === "web"
        ? window.confirm(`Excluir "${item.nome}"?`)
        : await new Promise((resolve) => {
            Alert.alert("Excluir item", `Excluir "${item.nome}"?`, [
              { text: "Cancelar", style: "cancel", onPress: () => resolve(false) },
              {
                text: "Excluir",
                style: "destructive",
                onPress: () => resolve(true),
              },
            ]);
          });

    if (!confirmar) return;

    const { error } = await supabase
      .from("estoque_itens")
      .delete()
      .eq("id", item.id);

    if (error) {
      console.log("Erro ao excluir:", error);
      return;
    }

    setItens((prev) => prev.filter((i) => i.id !== item.id));
  };

  /* ----------------------------------------
      5) INCREMENTAR / DECREMENTAR
  ---------------------------------------- */
  const incrementar = async (item) => {
    const novoValor = item.quantidade + 1;

    const { error } = await supabase
      .from("estoque_itens")
      .update({ quantidade: novoValor })
      .eq("id", item.id);

    if (!error) {
      setItens((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, quantidade: novoValor } : i))
      );
    }
  };

  const decrementar = async (item) => {
    if (item.quantidade === 0) return;

    const novoValor = item.quantidade - 1;

    const { error } = await supabase
      .from("estoque_itens")
      .update({ quantidade: novoValor })
      .eq("id", item.id);

    if (!error) {
      setItens((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, quantidade: novoValor } : i))
      );
    }
  };

  /* ----------------------------------------
      6) FILTRO
  ---------------------------------------- */
  const itensFiltrados = itens.filter((it) =>
    it.nome.toLowerCase().includes(busca.toLowerCase())
  );

  /* ----------------------------------------
      7) RENDERIZAÇÃO DO ITEM
  ---------------------------------------- */
  const getCor = (it) => {
    if (it.quantidade <= it.minimo) return "#ff4d4d";
    if (it.quantidade <= it.minimo * 2) return "#fbc531";
    return "#4cd137";
  };

  const renderItem = ({ item }) => {
    const cor = getCor(item);

    return (
      <View style={[styles.card, item.quantidade <= item.minimo && styles.cardLow]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.itemName}>{item.nome}</Text>
          <Text style={styles.meta}>
            Qtd: <Text style={{ color: cor, fontWeight: "700" }}>{item.quantidade}</Text>{" "}
            • Min: {item.minimo}
          </Text>

          <Text style={styles.meta}>
            Criado: {item.criado_em ? format(new Date(item.criado_em), "dd/MM/yyyy HH:mm") : "-"}
          </Text>
        </View>

        {/* AÇÕES */}
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={[styles.iconBtn, styles.decrementBtn]}
            onPress={() => decrementar(item)}
            disabled={item.quantidade === 0}
          >
            <Ionicons name="remove" size={20} color="#ff6b35" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.iconBtn, styles.incrementBtn]}
            onPress={() => incrementar(item)}
          >
            <Ionicons name="add" size={20} color="#4cd137" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: "#e3f2fd" }]}
            onPress={() => {
              setEditingItem(item);
              setNome(item.nome);
              setQuantidade(String(item.quantidade));
              setMinimo(String(item.minimo));
              setModalVisible(true);
            }}
          >
            <Ionicons name="pencil" size={18} color="#0b5394" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: "#ffebee" }]}
            onPress={() => deletarItem(item)}
          >
            <Ionicons name="trash" size={18} color="#d32f2f" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  /* ----------------------------------------
      UI
  ---------------------------------------- */
  return (
    <View style={styles.tabWrap}>
      <View style={styles.topRow}>
        <Text style={styles.tabTitle}>{titulo}</Text>

        <View style={styles.searchRow}>
          <Ionicons name="search" size={18} color="#666" />
          <TextInput
            placeholder="Buscar..."
            placeholderTextColor="#999"
            value={busca}
            onChangeText={setBusca}
            style={styles.searchInput}
          />
        </View>
      </View>

      <FlatList
        data={itensFiltrados}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      {/* BOTÃO NOVO */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          setEditingItem(null);
          setNome("");
          setQuantidade("");
          setMinimo("");
          setModalVisible(true);
        }}
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>

      {/* MODAL */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {editingItem ? "Editar Item" : "Novo Item"}
            </Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Nome"
              value={nome}
              onChangeText={setNome}
            />

            <TextInput
              style={styles.modalInput}
              placeholder="Quantidade"
              keyboardType="numeric"
              value={quantidade}
              onChangeText={setQuantidade}
            />

            <TextInput
              style={styles.modalInput}
              placeholder="Estoque mínimo"
              keyboardType="numeric"
              value={minimo}
              onChangeText={setMinimo}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#ccc" }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={{ color: "#333" }}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#0b5394" }]}
                onPress={editingItem ? salvarEdicao : adicionarItem}
              >
                <Text style={{ color: "#fff", fontWeight: "700" }}>
                  {editingItem ? "Salvar" : "Adicionar"}
                </Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>
    </View>
  );
}

/* =========================================================
      TELA PRINCIPAL COM TODAS AS ABAS (SEM ALTERAÇÕES)
========================================================= */
export default function AlmoxarifadoHondaScreen() {
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <Ionicons name="business" size={22} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.headerTitle}>Almoxarifado Honda</Text>
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

/* =========================================================
      ESTILOS (SEU ORIGINAL, NÃO MEXI EM NADA)
========================================================= */
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
  cardActions: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 12,
    zIndex: 10,
  },
  iconBtn: {
    marginLeft: 8,
    padding: 6,
    minWidth: 32,
    minHeight: 32,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 6,
  },
  decrementBtn: {
    backgroundColor: "#fff2f0",
    borderWidth: 1,
    borderColor: "#ff6b35",
  },
  incrementBtn: {
    backgroundColor: "#f0fff4",
    borderWidth: 1,
    borderColor: "#4cd137",
  },
  fab: {
    position: "absolute",
    right: 18,
    bottom: 22,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#0b5394",
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    width: "88%",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 18,
    elevation: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0b5394",
    marginBottom: 12,
  },
  modalInput: {
    backgroundColor: "#f3f6ff",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e6eaf5",
    color: "#333",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  modalBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 6,
  },
});
