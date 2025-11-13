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
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { supabase } from "../services/supabase";

const Tab = createMaterialTopTabNavigator();

/* -------------------------
   CategoriaTab (SUPABASE)
------------------------- */
function CategoriaTab({ categoriaKey, titulo, readOnly }) {
  const [itens, setItens] = useState([]);
  const [busca, setBusca] = useState("");

  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [nome, setNome] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [minimo, setMinimo] = useState("");

  // Carregar do Supabase
  const carregar = async () => {
    const { data, error } = await supabase
      .from("estoque_itens")
      .select("*")
      .eq("categoria", categoriaKey)
      .eq("obra", "masters")
      .order("id", { ascending: false });

    if (error) {
      console.log("Erro carregar estoque (masters):", error);
      return;
    }

    setItens(data || []);
  };

  useEffect(() => {
    carregar();
  }, []);

  const abrirModalNovo = () => {
    if (readOnly) {
      Alert.alert(
        "Acesso somente leitura",
        "Você não tem permissão para adicionar itens aqui."
      );
      return;
    }
    setEditingItem(null);
    setNome("");
    setQuantidade("");
    setMinimo("");
    setModalVisible(true);
  };

  const abrirModalEditar = (item) => {
    if (readOnly) {
      Alert.alert(
        "Acesso somente leitura",
        "Você não tem permissão para editar aqui."
      );
      return;
    }
    setEditingItem(item);
    setNome(item.nome);
    setQuantidade(String(item.quantidade));
    setMinimo(String(item.minimo));
    setModalVisible(true);
  };

  const confirmarSalvar = async () => {
    if (!nome.trim() || !quantidade || !minimo) {
      Alert.alert("Preencha todos os campos");
      return;
    }

    const qtdNum = parseInt(quantidade, 10);
    const minNum = parseInt(minimo, 10);

    if (Number.isNaN(qtdNum) || Number.isNaN(minNum)) {
      Alert.alert("Quantidade e mínimo devem ser números válidos");
      return;
    }

    // Editar
    if (editingItem) {
      const { data, error } = await supabase
        .from("estoque_itens")
        .update({
          nome: nome.trim(),
          quantidade: qtdNum,
          minimo: minNum,
        })
        .eq("id", editingItem.id)
        .select();

      if (error) {
        console.log("Erro ao atualizar item:", error);
        Alert.alert("Erro", "Não foi possível salvar as alterações.");
        return;
      }

      // Atualiza local
      setItens((prev) =>
        prev.map((it) =>
          it.id === editingItem.id
            ? { ...it, nome: nome.trim(), quantidade: qtdNum, minimo: minNum }
            : it
        )
      );
    } else {
      // Novo
      const novo = {
        nome: nome.trim(),
        quantidade: qtdNum,
        minimo: minNum,
        categoria: categoriaKey,
        obra: "masters",
        criado_em: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("estoque_itens")
        .insert([novo])
        .select();

      if (error) {
        console.log("Erro ao adicionar item:", error);
        Alert.alert("Erro", "Não foi possível adicionar o item.");
        return;
      }

      if (data && data[0]) {
        setItens((prev) => [data[0], ...prev]);
      }
    }

    setModalVisible(false);
  };

  const deletar = async (item) => {
    if (readOnly) {
      Alert.alert(
        "Acesso somente leitura",
        "Você não tem permissão para excluir aqui."
      );
      return;
    }

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
      console.log("Erro ao excluir item:", error);
      Alert.alert("Erro", "Não foi possível excluir o item.");
      return;
    }

    setItens((prev) => prev.filter((i) => i.id !== item.id));
  };

  const alterarQuantidade = async (item, delta) => {
    if (readOnly) {
      Alert.alert(
        "Acesso somente leitura",
        "Você não pode alterar quantidades aqui."
      );
      return;
    }

    const novoValor = Math.max(0, (item.quantidade || 0) + delta);

    const { error } = await supabase
      .from("estoque_itens")
      .update({ quantidade: novoValor })
      .eq("id", item.id);

    if (error) {
      console.log("Erro ao alterar quantidade:", error);
      Alert.alert("Erro", "Não foi possível alterar a quantidade.");
      return;
    }

    setItens((prev) =>
      prev.map((it) =>
        it.id === item.id ? { ...it, quantidade: novoValor } : it
      )
    );
  };

  const getEstoqueColor = (it) => {
    if (it.quantidade <= it.minimo) return "#ff4d4d";
    if (it.quantidade <= it.minimo * 2) return "#fbc531";
    return "#4cd137";
  };

  const itensFiltrados = itens.filter((it) =>
    it.nome?.toLowerCase().includes(busca.toLowerCase())
  );

  const renderItem = ({ item }) => {
    const cor = getEstoqueColor(item);
    const criado = item.criado_em
      ? format(new Date(item.criado_em), "dd/MM/yyyy HH:mm")
      : "-";

    return (
      <View style={[styles.card, item.quantidade <= item.minimo && styles.cardLow]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.itemName}>{item.nome}</Text>
          <Text style={styles.meta}>
            Qtd:{" "}
            <Text style={{ color: cor, fontWeight: "700" }}>
              {item.quantidade}
            </Text>{" "}
            • Mínimo: {item.minimo}
          </Text>
          <Text style={styles.meta}>Criado: {criado}</Text>
          {item.quantidade <= item.minimo && (
            <Text style={styles.warning}>⚠ Abaixo do mínimo</Text>
          )}
        </View>

        {/* Botões aparecem só para ADM */}
        {!readOnly && (
          <View style={styles.cardActions}>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => alterarQuantidade(item, 1)}
            >
              <Ionicons name="add-circle" size={28} color="#0b5394" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => alterarQuantidade(item, -1)}
            >
              <Ionicons name="remove-circle" size={28} color="#ff4d4d" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => abrirModalEditar(item)}
            >
              <Ionicons name="pencil" size={22} color="#0b5394" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.iconBtn,
                {
                  backgroundColor: "#ff0000",
                  padding: 8,
                  borderRadius: 6,
                  minWidth: 40,
                  minHeight: 40,
                  justifyContent: "center",
                  alignItems: "center",
                },
              ]}
              onPress={() => {
                console.log("=== CLIQUE DELETAR ESTOQUE MASTERS ===");
                console.log("Item para deletar:", item.nome, "ID:", item.id);
                deletar(item);
              }}
            >
              <Ionicons name="trash" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
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
            {busca ? "Nenhum item encontrado." : "Nenhum item cadastrado ainda."}
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

      {/* FAB escondido em readOnly */}
      {!readOnly && (
        <TouchableOpacity style={styles.fab} onPress={abrirModalNovo}>
          <Ionicons name="add" size={30} color="#fff" />
        </TouchableOpacity>
      )}

      {/* Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {editingItem ? "Editar Item" : "Novo Item"}
            </Text>

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
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#ccc" }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={{ color: "#333", fontWeight: "700" }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#0b5394" }]}
                onPress={confirmarSalvar}
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

/* -------------------------
   Tela principal
------------------------- */
export default function EstoqueScreen({ route }) {
  const readOnly = route?.params?.readOnly ?? false;

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <Ionicons name="layers" size={22} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.headerTitle}>Controle de Estoque</Text>
        {readOnly && (
          <Text style={{ color: "#fff", marginLeft: 12, fontWeight: "700" }}>
            (Somente visualização)
          </Text>
        )}
      </View>

      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: "#fff",
          tabBarStyle: { backgroundColor: "#0b5394" },
          tabBarIndicatorStyle: { backgroundColor: "#fff" },
          tabBarLabelStyle: { fontSize: 13, fontWeight: "700" },
          swipeEnabled: true,
        }}
      >
        <Tab.Screen
          name="Elétrica"
          options={{
            tabBarIcon: ({ color }) => (
              <Ionicons name="flash" size={20} color={color} />
            ),
          }}
        >
          {() => (
            <CategoriaTab
              categoriaKey="eletrica"
              titulo="Materiais - Elétrica"
              readOnly={readOnly}
            />
          )}
        </Tab.Screen>

        <Tab.Screen
          name="Mecânica"
          options={{
            tabBarIcon: ({ color }) => (
              <Ionicons name="cog" size={20} color={color} />
            ),
          }}
        >
          {() => (
            <CategoriaTab
              categoriaKey="mecanica"
              titulo="Materiais - Mecânica"
              readOnly={readOnly}
            />
          )}
        </Tab.Screen>

        <Tab.Screen
          name="Pintura"
          options={{
            tabBarIcon: ({ color }) => (
              <Ionicons name="color-palette" size={20} color={color} />
            ),
          }}
        >
          {() => (
            <CategoriaTab
              categoriaKey="pintura"
              titulo="Materiais - Pintura"
              readOnly={readOnly}
            />
          )}
        </Tab.Screen>

        <Tab.Screen
          name="Porcas e Arruelas"
          options={{
            tabBarIcon: ({ color }) => (
              <Ionicons name="hardware-chip" size={20} color={color} />
            ),
          }}
        >
          {() => (
            <CategoriaTab
              categoriaKey="porcas_arruelas"
              titulo="Materiais - Porcas, Arruelas e Parafusos"
              readOnly={readOnly}
            />
          )}
        </Tab.Screen>

        <Tab.Screen
          name="Outros"
          options={{
            tabBarIcon: ({ color }) => (
              <Ionicons name="apps" size={20} color={color} />
            ),
          }}
        >
          {() => (
            <CategoriaTab
              categoriaKey="outros"
              titulo="Materiais - Outros"
              readOnly={readOnly}
            />
          )}
        </Tab.Screen>
      </Tab.Navigator>
    </View>
  );
}

/* ------------------------- ESTILOS ------------------------- */
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
  modalActions: { flexDirection: "row", justifyContent: "space-between", marginTop: 6 },
  modalBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 6,
  },
});
