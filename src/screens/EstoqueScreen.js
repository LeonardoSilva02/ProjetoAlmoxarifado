// src/screens/EstoqueScreen.js
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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";

const Tab = createMaterialTopTabNavigator();

/* -------------------------
   CategoriaTab (com AsyncStorage)
   props: categoriaKey (string), titulo (string)
   ------------------------- */
function CategoriaTab({ categoriaKey, titulo }) {
  const storageKey = `@estoque_${categoriaKey}`;
  const [itens, setItens] = useState([]);
  const [busca, setBusca] = useState("");

  // Modal / edição
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // null = novo, object = editar
  const [nome, setNome] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [minimo, setMinimo] = useState("");

  // carregar ao montar
  useEffect(() => {
    carregar();
  }, []);

  // salva sempre que itens mudam
  useEffect(() => {
    salvar(itens);
  }, [itens]);

  const carregar = async () => {
    try {
      const raw = await AsyncStorage.getItem(storageKey);
      if (raw) setItens(JSON.parse(raw));
    } catch (e) {
      console.log("Erro carregar estoque", e);
    }
  };

  const salvar = async (data) => {
    try {
      await AsyncStorage.setItem(storageKey, JSON.stringify(data));
    } catch (e) {
      console.log("Erro salvar estoque", e);
    }
  };

  const abrirModalNovo = () => {
    setEditingItem(null);
    setNome("");
    setQuantidade("");
    setMinimo("");
    setModalVisible(true);
  };

  const abrirModalEditar = (item) => {
    setEditingItem(item);
    setNome(item.nome);
    setQuantidade(String(item.quantidade));
    setMinimo(String(item.minimo));
    setModalVisible(true);
  };

  const confirmarSalvar = () => {
    if (!nome.trim() || !quantidade || !minimo) {
      Alert.alert("Preencha todos os campos");
      return;
    }
    if (editingItem) {
      // editar
      const novo = itens.map((it) =>
        it.id === editingItem.id
          ? {
              ...it,
              nome: nome.trim(),
              quantidade: parseInt(quantidade),
              minimo: parseInt(minimo),
            }
          : it
      );
      setItens(novo);
    } else {
      // novo
      const now = new Date();
      const novo = {
        id: Date.now().toString(),
        nome: nome.trim(),
        quantidade: parseInt(quantidade),
        minimo: parseInt(minimo),
        criadoEm: now.toISOString(),
      };
      setItens([novo, ...itens]);
    }
    setModalVisible(false);
  };

  const deletar = (item) => {
    Alert.alert("Excluir item", `Excluir "${item.nome}"?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: () => {
          setItens((prev) => prev.filter((i) => i.id !== item.id));
        },
      },
    ]);
  };

  const alterarQuantidade = (item, delta) => {
    setItens((prev) =>
      prev.map((it) =>
        it.id === item.id
          ? { ...it, quantidade: Math.max(0, it.quantidade + delta) }
          : it
      )
    );
  };

  const getEstoqueColor = (it) => {
    if (it.quantidade <= it.minimo) return "#ff4d4d"; // vermelho
    if (it.quantidade <= it.minimo * 2) return "#fbc531"; // amarelo
    return "#4cd137"; // verde
  };

  const itensFiltrados = itens.filter((it) =>
    it.nome.toLowerCase().includes(busca.toLowerCase())
  );

  const renderItem = ({ item }) => {
    const cor = getEstoqueColor(item);
    const criado = item.criadoEm ? format(new Date(item.criadoEm), "dd/MM/yyyy HH:mm") : "-";
    return (
      <View style={[styles.card, item.quantidade <= item.minimo && styles.cardLow]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.itemName}>{item.nome}</Text>
          <Text style={styles.meta}>Qtd: <Text style={{ color: cor, fontWeight: "700" }}>{item.quantidade}</Text>  •  Mínimo: {item.minimo}</Text>
          <Text style={styles.meta}>Criado: {criado}</Text>
          {item.quantidade <= item.minimo && <Text style={styles.warning}>⚠ Abaixo do mínimo</Text>}
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => alterarQuantidade(item, 1)}>
            <Ionicons name="add-circle" size={28} color="#0b5394" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconBtn} onPress={() => alterarQuantidade(item, -1)}>
            <Ionicons name="remove-circle" size={28} color="#ff4d4d" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconBtn} onPress={() => abrirModalEditar(item)}>
            <Ionicons name="pencil" size={22} color="#0b5394" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconBtn} onPress={() => deletar(item)}>
            <Ionicons name="trash" size={22} color="#777" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.tabWrap}>
      {/* header pequeno */}
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

      {/* lista */}
      {itensFiltrados.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>{busca ? "Nenhum item encontrado." : "Nenhum item cadastrado ainda."}</Text>
        </View>
      ) : (
        <FlatList
          data={itensFiltrados}
          keyExtractor={(i) => i.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 120 }}
        />
      )}

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={abrirModalNovo}>
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>

      {/* Modal adicionar/editar */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{editingItem ? "Editar Item" : "Novo Item"}</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Nome do item"
              placeholderTextColor="#999"
              value={nome}
              onChangeText={setNome}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Quantidade inicial"
              placeholderTextColor="#999"
              keyboardType="numeric"
              value={quantidade}
              onChangeText={setQuantidade}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Estoque mínimo"
              placeholderTextColor="#999"
              keyboardType="numeric"
              value={minimo}
              onChangeText={setMinimo}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: "#ccc" }]} onPress={() => setModalVisible(false)}>
                <Text style={{ color: "#333", fontWeight: "700" }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: "#0b5394" }]} onPress={confirmarSalvar}>
                <Text style={{ color: "#fff", fontWeight: "700" }}>{editingItem ? "Salvar" : "Adicionar"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* -------------------------
   Tela principal com abas
   ------------------------- */
export default function EstoqueScreen() {
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <Ionicons name="layers" size={22} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.headerTitle}>Controle de Estoque</Text>
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
          {() => <CategoriaTab categoriaKey="eletrica" titulo="Materiais - Elétrica" />}
        </Tab.Screen>
        <Tab.Screen name="Mecânica">
          {() => <CategoriaTab categoriaKey="mecanica" titulo="Materiais - Mecânica" />}
        </Tab.Screen>
        <Tab.Screen name="Pintura">
          {() => <CategoriaTab categoriaKey="pintura" titulo="Materiais - Pintura" />}
        </Tab.Screen>
      </Tab.Navigator>
    </View>
  );
}

/* -------------------------
   Estilos
   ------------------------- */
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
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  tabTitle: { fontSize: 16, fontWeight: "700", color: "#0b5394" },

  searchRow: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", paddingHorizontal: 10, borderRadius: 10, borderWidth: 1, borderColor: "#e6eaf5" },
  searchInput: { marginLeft: 8, minWidth: 160, height: 40, color: "#333" },

  emptyWrap: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { color: "#777" },

  card: { flexDirection: "row", padding: 14, backgroundColor: "#fff", borderRadius: 12, marginBottom: 10, elevation: 3, alignItems: "center" },
  cardLow: { borderWidth: 1.5, borderColor: "#ff4d4d", backgroundColor: "#fff4f4" },
  itemName: { fontSize: 16, fontWeight: "700", color: "#222", marginBottom: 6 },
  meta: { color: "#666", fontSize: 13 },
  warning: { color: "#ff4d4d", marginTop: 6, fontWeight: "700" },

  cardActions: { flexDirection: "row", alignItems: "center", marginLeft: 12 },
  iconBtn: { marginLeft: 8 },

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

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "center", alignItems: "center" },
  modalCard: { width: "88%", backgroundColor: "#fff", borderRadius: 14, padding: 18, elevation: 12 },
  modalTitle: { fontSize: 18, fontWeight: "800", color: "#0b5394", marginBottom: 12 },
  modalInput: { backgroundColor: "#f3f6ff", padding: 10, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: "#e6eaf5", color: "#333" },
  modalActions: { flexDirection: "row", justifyContent: "space-between", marginTop: 6 },
  modalBtn: { flex: 1, padding: 12, borderRadius: 10, alignItems: "center", marginHorizontal: 6 },

});
