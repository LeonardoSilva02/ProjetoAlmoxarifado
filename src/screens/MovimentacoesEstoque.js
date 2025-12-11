import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  FlatList,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../services/supabase";
import { styles } from "../styles/MovimentacoesEstoqueStyle";

export default function MovimentacoesEstoque() {
  const [obraSelecionada, setObraSelecionada] = useState(null);
  const [tipo, setTipo] = useState("entrada");
  const [categoria, setCategoria] = useState("eletrica");

  const [modalVisible, setModalVisible] = useState(false);
  const [busca, setBusca] = useState("");
  const [itens, setItens] = useState([]);

  const [itemSelecionado, setItemSelecionado] = useState(null);
  const [quantidade, setQuantidade] = useState("");
  const [observacao, setObservacao] = useState("");

  /* ================= CARREGAR ITENS ================= */
  const carregarItens = async () => {
    const { data, error } = await supabase
      .from("estoque_itens")
      .select("*")
      .eq("obra", obraSelecionada)
      .eq("categoria", categoria)
      .order("nome");

    if (error) {
      console.log("❌ ERRO AO CARREGAR ITENS:", error.message);
      return;
    }

    setItens(data || []);
  };

  useEffect(() => {
    if (obraSelecionada) carregarItens();
  }, [obraSelecionada, categoria]);

  const filtrados = itens.filter((i) =>
    i.nome.toLowerCase().includes(busca.toLowerCase())
  );

  /* ================= ✅ SALVAR MOVIMENTAÇÃO ================= */
  const salvar = async () => {
    try {
      if (!itemSelecionado) {
        return Alert.alert("Erro", "Selecione um material");
      }

      if (!quantidade || isNaN(quantidade)) {
        return Alert.alert("Erro", "Quantidade inválida");
      }

      const qtd = parseInt(quantidade);

      if (tipo === "saida" && qtd > itemSelecionado.quantidade) {
        return Alert.alert("Erro", "Quantidade maior que o estoque!");
      }

      const { data: sessionData } = await supabase.auth.getSession();
      const usuarioId = sessionData?.session?.user?.id || null;

      const { error } = await supabase.from("estoque_movimentos").insert([
        {
          estoque_item_id: itemSelecionado.id,
          tipo,
          quantidade: qtd,
          usuario_id: usuarioId,
          origem: obraSelecionada,
          observacao,
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        console.log("❌ ERRO SUPABASE:", error.message);
        Alert.alert("Erro", error.message);
        return;
      }

      Alert.alert("✅ Sucesso", "Movimentação registrada com sucesso!");

      setItemSelecionado(null);
      setQuantidade("");
      setObservacao("");

      carregarItens();
    } catch (err) {
      console.log("❌ ERRO GERAL:", err.message);
      Alert.alert("Erro inesperado", err.message);
    }
  };

  /* ================= SELETOR DE OBRA ================= */
  if (!obraSelecionada) {
    return (
      <View style={styles.selectWrap}>
        <Text style={styles.selectTitle}>Selecione o Almoxarifado</Text>

        <TouchableOpacity
          style={styles.selectBtn}
          onPress={() => setObraSelecionada("masters")}
        >
          <Text style={styles.selectBtnText}>Masters</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.selectBtn}
          onPress={() => setObraSelecionada("honda")}
        >
          <Text style={styles.selectBtnText}>Honda</Text>
        </TouchableOpacity>
      </View>
    );
  }

  /* ================= TELA PRINCIPAL ================= */
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setObraSelecionada(null)}>
          <Ionicons name="arrow-back-outline" size={24} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Movimentações - {obraSelecionada.toUpperCase()}
        </Text>
      </View>

      <ScrollView style={styles.formBox}>
        {/* TIPO */}
        <View style={styles.typeRow}>
          {["entrada", "saida"].map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.typeBtn, tipo === t && styles.typeBtnActive]}
              onPress={() => setTipo(t)}
            >
              <Text style={styles.typeText}>{t.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* CATEGORIA */}
        <View style={styles.typeRow}>
          {["eletrica", "mecanica", "pintura", "outros"].map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.typeBtn,
                categoria === cat && styles.typeBtnActive,
              ]}
              onPress={() => setCategoria(cat)}
            >
              <Text style={styles.typeText}>{cat.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* MATERIAL */}
        <TouchableOpacity
          style={styles.selectedItem}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.selectedItemText}>
            {itemSelecionado
              ? `✅ ${itemSelecionado.nome}`
              : "Selecionar material"}
          </Text>
        </TouchableOpacity>

        <Text style={styles.label}>Quantidade</Text>
        <TextInput
          style={styles.input}
          value={quantidade}
          onChangeText={setQuantidade}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Observação</Text>
        <TextInput
          style={styles.input}
          value={observacao}
          onChangeText={setObservacao}
        />

        <TouchableOpacity style={styles.saveBtn} onPress={salvar}>
          <Ionicons name="save-outline" size={20} color="#fff" />
          <Text style={styles.saveText}>Registrar</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* MODAL DE ITENS */}
      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.tabContainer}>
          <View style={styles.searchRow}>
            <Ionicons name="search" size={18} color="#666" />
            <TextInput
              placeholder="Buscar material..."
              value={busca}
              onChangeText={setBusca}
              style={styles.searchInput}
            />
          </View>

          <FlatList
            data={filtrados}
            keyExtractor={(i) => i.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.card}
                onPress={() => {
                  setItemSelecionado(item);
                  setModalVisible(false);
                }}
              >
                <Text style={styles.itemName}>{item.nome}</Text>
                <Text style={styles.itemQtd}>{item.quantidade} un.</Text>
              </TouchableOpacity>
            )}
          />

          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: "#999" }]}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.saveText}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}
