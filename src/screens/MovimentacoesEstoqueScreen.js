// src/screens/MovimentacoesHonda.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  FlatList,
} from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../services/supabase";

const Tab = createMaterialTopTabNavigator();

/* ============================================================
      COMPONENTE DE LISTA POR CATEGORIA (MELHORADO)
============================================================ */
function CategoriaTab({ categoriaKey, onSelectItem }) {
  const [busca, setBusca] = useState("");
  const [itens, setItens] = useState([]);

  const carregar = async () => {
    const { data, error } = await supabase
      .from("estoque_itens")
      .select("*")
      .eq("obra", "honda")
      .eq("categoria", categoriaKey)
      .order("nome");

    if (error) console.log("Erro ao carregar itens:", error);
    setItens(data || []);
  };

  useEffect(() => {
    carregar();
  }, []);

  const filtrados = itens.filter((it) =>
    it.nome.toLowerCase().includes(busca.toLowerCase())
  );

  const getColor = (qtd, minimo) => {
    if (qtd <= minimo) return "#ff4d4d";
    if (qtd <= minimo * 2) return "#f1c40f";
    return "#2ecc71";
  };

  return (
    <View style={{ flex: 1, padding: 10 }}>
      {/* CAMPO DE BUSCA */}
      <View style={styles.searchRow}>
        <Ionicons name="search" size={18} color="#666" />
        <TextInput
          placeholder="Buscar item..."
          value={busca}
          onChangeText={setBusca}
          style={styles.searchInput}
        />
      </View>

      {/* LISTA PROFISSIONAL */}
      <FlatList
        data={filtrados}
        keyExtractor={(i) => i.id.toString()}
        renderItem={({ item }) => {
          const corQtd = getColor(item.quantidade, item.minimo);

          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() => onSelectItem(item)}
            >
              <View style={styles.cardLeft}>
                <Ionicons
                  name="cube-outline"
                  size={28}
                  color="#0b5394"
                  style={{ marginRight: 10 }}
                />
                <View style={{ flexShrink: 1 }}>
                  <Text style={styles.itemName}>{item.nome}</Text>
                  <Text style={styles.itemCategoria}>
                    Categoria: {categoriaKey}
                  </Text>
                </View>
              </View>

              <Text style={[styles.itemQtd, { color: corQtd }]}>
                {item.quantidade} un.
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

/* ============================================================
      TELA PRINCIPAL
============================================================ */
export default function MovimentacoesHonda() {
  const [itemSelecionado, setItemSelecionado] = useState(null);

  const [tipo, setTipo] = useState("entrada");
  const [quantidade, setQuantidade] = useState("");
  const [colaborador, setColaborador] = useState("");
  const [observacao, setObservacao] = useState("");

  const obra = "honda";

  /* SALVAR MOVIMENTAÇÃO */
  const salvar = async () => {
    if (!itemSelecionado) return Alert.alert("Selecione um item");
    if (!quantidade || isNaN(quantidade))
      return Alert.alert("Quantidade inválida");
    if (!colaborador.trim())
      return Alert.alert("Nome do colaborador obrigatório");

    const qtd = parseInt(quantidade);

    if (tipo === "saida" && qtd > itemSelecionado.quantidade) {
      return Alert.alert(
        "Erro",
        `Estoque insuficiente. Atual: ${itemSelecionado.quantidade} un.`
      );
    }

    const novoEstoque =
      tipo === "entrada"
        ? itemSelecionado.quantidade + qtd
        : itemSelecionado.quantidade - qtd;

    await supabase
      .from("estoque_itens")
      .update({ quantidade: novoEstoque })
      .eq("id", itemSelecionado.id);

    await supabase.from("estoque_movimentos").insert({
      estoque_item_id: itemSelecionado.id,
      tipo,
      quantidade: qtd,
      colaborador,
      observacao,
      origem: obra,
    });

    Alert.alert("Sucesso", "Movimentação registrada!");
    setQuantidade("");
    setColaborador("");
    setObservacao("");
  };

  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.title}>Movimentações – Honda</Text>

      <View style={styles.selectedBox}>
        <Text style={styles.label}>Item selecionado:</Text>
        <Text style={styles.selectedItem}>
          {itemSelecionado ? itemSelecionado.nome : "Nenhum item selecionado"}
        </Text>
      </View>

      {/* TABS DE CATEGORIAS */}
      <View style={{ flex: 1, height: "55%" }}>
        <Tab.Navigator
          screenOptions={{
            tabBarStyle: { backgroundColor: "#0b5394" },
            tabBarActiveTintColor: "#fff",
            tabBarIndicatorStyle: { backgroundColor: "#fff" },
            tabBarLabelStyle: { fontSize: 12, fontWeight: "bold" },
          }}
        >
          <Tab.Screen name="Elétrica">
            {() => (
              <CategoriaTab
                categoriaKey="eletrica"
                onSelectItem={setItemSelecionado}
              />
            )}
          </Tab.Screen>

          <Tab.Screen name="Mecânica">
            {() => (
              <CategoriaTab
                categoriaKey="mecanica"
                onSelectItem={setItemSelecionado}
              />
            )}
          </Tab.Screen>

          <Tab.Screen name="Pintura">
            {() => (
              <CategoriaTab
                categoriaKey="pintura"
                onSelectItem={setItemSelecionado}
              />
            )}
          </Tab.Screen>

          <Tab.Screen name="Porcas/Arruelas">
            {() => (
              <CategoriaTab
                categoriaKey="porcas_arruelas"
                onSelectItem={setItemSelecionado}
              />
            )}
          </Tab.Screen>

          <Tab.Screen name="Outros">
            {() => (
              <CategoriaTab
                categoriaKey="outros"
                onSelectItem={setItemSelecionado}
              />
            )}
          </Tab.Screen>
        </Tab.Navigator>
      </View>

      {/* FORMULÁRIO */}
      <ScrollView style={styles.formBox}>
        <Text style={styles.label}>Tipo de movimentação</Text>
        <View style={styles.rowButtons}>
          <TouchableOpacity
            style={[styles.tipoBtn, tipo === "entrada" && styles.tipoSelected]}
            onPress={() => setTipo("entrada")}
          >
            <Text style={styles.tipoText}>Entrada</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tipoBtn, tipo === "saida" && styles.tipoSelected]}
            onPress={() => setTipo("saida")}
          >
            <Text style={styles.tipoText}>Saída</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Quantidade</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={quantidade}
          onChangeText={setQuantidade}
        />

        <Text style={styles.label}>Colaborador</Text>
        <TextInput
          style={styles.input}
          value={colaborador}
          onChangeText={setColaborador}
        />

        <Text style={styles.label}>Observação</Text>
        <TextInput
          style={styles.input}
          value={observacao}
          onChangeText={setObservacao}
        />

        <TouchableOpacity style={styles.saveBtn} onPress={salvar}>
          <Ionicons name="save-outline" size={20} color="#fff" />
          <Text style={styles.saveText}>Registrar Movimentação</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

/* ============================================================
      ESTILOS CORRIGIDOS (WEB + MOBILE)
============================================================ */
const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0b5394",
    textAlign: "center",
    paddingVertical: 10,
  },

  searchRow: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    height: 42,
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#dcdcdc",
    marginBottom: 12,
  },

  searchInput: {
    marginLeft: 8,
    flex: 1,
    height: 40,
  },

  card: {
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    padding: 16,
    marginBottom: 12,
    marginHorizontal: 6,

    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e6e6e6",

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },

  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
  },

  itemName: {
    fontWeight: "700",
    fontSize: 15,
    color: "#06437a",
  },

  itemCategoria: {
    fontSize: 12,
    color: "#777",
  },

  itemQtd: {
    fontWeight: "700",
    fontSize: 15,
  },

  selectedBox: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },

  selectedItem: {
    fontWeight: "700",
    fontSize: 15,
    color: "#000",
  },

  label: {
    fontWeight: "bold",
    color: "#0b5394",
    marginTop: 14,
  },

  rowButtons: {
    flexDirection: "row",
    marginTop: 8,
  },

  tipoBtn: {
    flex: 1,
    padding: 13,
    backgroundColor: "#e8ecf3",
    borderRadius: 10,
    marginHorizontal: 4,
    alignItems: "center",
  },

  tipoSelected: {
    backgroundColor: "#0b5394",
  },

  tipoText: {
    color: "#fff",
    fontWeight: "bold",
  },

  input: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
    marginTop: 6,
    borderWidth: 1,
    borderColor: "#ddd",
  },

  saveBtn: {
    backgroundColor: "#0b5394",
    padding: 14,
    borderRadius: 10,
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  saveText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 8,
  },

  formBox: {
    backgroundColor: "#f7f9fc",
    paddingHorizontal: 16,
    height: "45%",
  },
});
