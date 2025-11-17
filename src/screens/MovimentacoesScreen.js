import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  StyleSheet,
  Alert,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../services/supabase";

export default function MovimentacoesScreen() {
  const [movs, setMovs] = useState([]);
  const [colaboradores, setColaboradores] = useState([]);
  const [ferramentas, setFerramentas] = useState([]);

  const [searchColab, setSearchColab] = useState(""); // <-- AGORA OBRIGATÓRIO
  const [searchFerramenta, setSearchFerramenta] = useState("");

  const [modal, setModal] = useState(false);

  const [colaboradorSel, setColaboradorSel] = useState(null);
  const [ferramentaSel, setFerramentaSel] = useState(null);
  const [obra, setObra] = useState("");
  const [dataPrevista, setDataPrevista] = useState("");

  const [mostrarAtrasadas, setMostrarAtrasadas] = useState(false);

  /* ================== CARREGAR MOVS ================== */
  const carregarMovs = async () => {
    const { data, error } = await supabase
      .from("movimentacoes")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.log("Erro:", error);
      return;
    }

    setMovs(data || []);
  };

  /* ================== CARREGAR COLABORADORES ================== */
  const carregarColab = async () => {
    const { data } = await supabase.from("colaboradores").select("*");
    setColaboradores(data || []);
  };

  /* ================== CARREGAR FERRAMENTAS ================== */
  const carregarFerramentas = async () => {
    const { data } = await supabase
      .from("ferramentas")
      .select("*")
      .eq("obra", "honda");

    setFerramentas(data || []);
  };

  useEffect(() => {
    carregarMovs();
    carregarColab();
    carregarFerramentas();
  }, []);

  /* ================== ALERTA DE ATRASO AUTOMÁTICO ================== */
  useEffect(() => {
    const hoje = new Date();

    const atrasadas = movs.filter((m) => {
      if (!m.data_prevista) return false;
      if (m.data_devolucao) return false;

      return new Date(m.data_prevista) < hoje;
    });

    if (atrasadas.length > 0) {
      let lista = atrasadas
        .map((a) => `• ${a.ferramenta} (${a.patrimonio}) - ${a.colaborador}`)
        .join("\n");

      Alert.alert(
        "⚠ Ferramentas atrasadas!",
        `As seguintes ferramentas não foram devolvidas:\n\n${lista}`
      );
    }
  }, [movs]);

  /* ================== FILTRAGENS ================== */
  const colabsFiltrados = colaboradores.filter((c) =>
    c.nome.toLowerCase().includes(searchColab.toLowerCase())
  );

  const ferramentasFiltradas = ferramentas.filter((f) => {
    const texto = `${f.nome} ${f.patrimonio}`.toLowerCase();
    return texto.includes(searchFerramenta.toLowerCase());
  });

  /* ================== STATUS ================== */
  const getStatus = (mov) => {
    if (mov.data_devolucao) return "Devolvida";

    if (mov.data_prevista) {
      const prazo = new Date(mov.data_prevista);
      const agora = new Date();
      if (agora > prazo) return "Atrasada";
    }

    return "Em aberto";
  };

  const getColor = (status) => {
    switch (status) {
      case "Devolvida":
        return "#4cd137";
      case "Atrasada":
        return "#e84118";
      case "Em aberto":
        return "#fbc531";
      default:
        return "#999";
    }
  };

  /* ================== REGISTRAR RETIRADA ================== */
  const registrarRetirada = async () => {
    // 🔥 AGORA OBRIGATÓRIO DIGITAR O NOME
    if (!searchColab.trim()) {
      Alert.alert("Atenção", "Digite o nome do colaborador.");
      return;
    }

    if (!ferramentaSel) {
      Alert.alert("Atenção", "Selecione uma ferramenta.");
      return;
    }

    if (!obra.trim()) {
      Alert.alert("Atenção", "Informe o local / obra.");
      return;
    }

    const retiradaAgora = new Date().toISOString();

    const novo = {
      colaborador: searchColab.trim(), // <-- USA O TEXTO DIGITADO
      ferramenta: ferramentaSel.nome,
      patrimonio: ferramentaSel.patrimonio,
      obra,
      data_retirada: retiradaAgora,
      data_prevista: dataPrevista || null,
      data_devolucao: null,
      status: "Em aberto",
    };

    const { error } = await supabase.from("movimentacoes").insert([novo]);

    if (error) {
      console.log("Erro ao registrar:", error);
      Alert.alert("Erro", "Não foi possível registrar.");
      return;
    }

    setModal(false);
    setSearchColab("");
    setColaboradorSel(null);
    setFerramentaSel(null);
    setObra("");
    setDataPrevista("");

    carregarMovs();
  };

  /* ================== REGISTRAR DEVOLUÇÃO ================== */
  const registrarDevolucao = async (mov) => {
    const devolucaoAgora = new Date().toISOString();

    const { error } = await supabase
      .from("movimentacoes")
      .update({
        data_devolucao: devolucaoAgora,
        status: "Devolvida",
      })
      .eq("id", mov.id);

    if (error) {
      Alert.alert("Erro", "Não foi possível registrar a devolução.");
      return;
    }

    carregarMovs();
  };

  /* ================== FILTRO VISUAL ================== */
  const movsExibidos = mostrarAtrasadas
    ? movs.filter((m) => getStatus(m) === "Atrasada")
    : movs;

  /* ================== RENDER ITEM ================== */
  const renderMov = ({ item }) => {
    const status = getStatus(item);
    const cor = getColor(status);

    return (
      <View style={[styles.card, { borderLeftColor: cor }]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.nome}>{item.ferramenta}</Text>
          <Text style={styles.meta}>Patrimônio: {item.patrimonio}</Text>
          <Text style={styles.meta}>Colaborador: {item.colaborador}</Text>
          <Text style={styles.meta}>Obra: {item.obra}</Text>
          <Text style={[styles.meta, { color: cor, fontWeight: "bold" }]}>
            Status: {status}
          </Text>

          <Text style={styles.meta}>
            Retirada: {new Date(item.data_retirada).toLocaleString("pt-BR")}
          </Text>

          {item.data_prevista && (
            <Text style={styles.meta}>
              Prev. Devolução:{" "}
              {new Date(item.data_prevista).toLocaleString("pt-BR")}
            </Text>
          )}

          {item.data_devolucao && (
            <Text style={styles.meta}>
              Devolução:{" "}
              {new Date(item.data_devolucao).toLocaleString("pt-BR")}
            </Text>
          )}
        </View>

        {!item.data_devolucao && (
          <TouchableOpacity
            onPress={() => registrarDevolucao(item)}
            style={styles.btnDevolver}
          >
            <Ionicons name="checkmark-circle" size={26} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  /* ================== TELA PRINCIPAL ================== */
  return (
    <View style={{ flex: 1 }}>
      {/* HEADER */}
      <View style={styles.header}>
        <Ionicons name="repeat" size={22} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.headerTitle}>Movimentações</Text>

        {/* BOTÃO FILTRAR ATRASADAS */}
        <TouchableOpacity
          style={styles.filterBtn}
          onPress={() => setMostrarAtrasadas(!mostrarAtrasadas)}
        >
          <Ionicons
            name={mostrarAtrasadas ? "alert-circle" : "time-outline"}
            size={20}
            color="#fff"
          />
        </TouchableOpacity>
      </View>

      {/* LISTA */}
      <View style={{ padding: 12, flex: 1 }}>
        {movsExibidos.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>
              Nenhuma movimentação encontrada.
            </Text>
          </View>
        ) : (
          <FlatList
            data={movsExibidos}
            renderItem={renderMov}
            keyExtractor={(i) => i.id.toString()}
            contentContainerStyle={{ paddingBottom: 100 }}
          />
        )}

        {/* BOTÃO ADICIONAR */}
        <TouchableOpacity style={styles.fab} onPress={() => setModal(true)}>
          <Ionicons name="add" size={30} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* ================== MODAL ================== */}
      <Modal visible={modal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Registrar Retirada</Text>

            {/* COLABORADOR */}
            <Text style={styles.label}>Colaborador *</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite ou selecione..."
              placeholderTextColor="#aaa"
              value={searchColab}
              onChangeText={setSearchColab}
            />

            <View style={styles.selectList}>
              <FlatList
                data={colabsFiltrados}
                keyExtractor={(i) => i.id.toString()}
                style={{ maxHeight: 100 }}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.selectItem}
                    onPress={() => setSearchColab(item.nome)}  // <-- novo
                  >
                    <Text style={styles.selectText}>{item.nome}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>

            {/* FERRAMENTA */}
            <Text style={styles.label}>Ferramenta *</Text>
            <TextInput
              style={styles.input}
              placeholder="Buscar ferramenta..."
              placeholderTextColor="#aaa"
              value={searchFerramenta}
              onChangeText={setSearchFerramenta}
            />

            <View style={styles.selectList}>
              <FlatList
                data={ferramentasFiltradas}
                keyExtractor={(i) => i.id.toString()}
                style={{ maxHeight: 100 }}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.selectItem}
                    onPress={() => setFerramentaSel(item)}
                  >
                    <Text style={styles.selectText}>
                      {item.nome} – {item.patrimonio}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>

            {ferramentaSel && (
              <View style={styles.selectedBox}>
                <Text style={styles.selectedFerramenta}>{ferramentaSel.nome}</Text>
                <Text style={styles.selectedPatri}>
                  Patrimônio: {ferramentaSel.patrimonio}
                </Text>
                <Text style={styles.selectedObra}>
                  Obra original: {ferramentaSel.obra || "Honda"}
                </Text>
              </View>
            )}

            {/* DATA RETIRADA */}
            <Text style={styles.label}>Data da Retirada</Text>
            <TextInput
              style={[styles.input, { backgroundColor: "#e9edf7" }]}
              value={new Date().toLocaleString("pt-BR")}
              editable={false}
            />

            {/* OBRA */}
            <Text style={styles.label}>Local / Obra *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Honda, BIC, Masters..."
              placeholderTextColor="#aaa"
              value={obra}
              onChangeText={setObra}
            />

            {/* DATA PREVISTA */}
            <Text style={styles.label}>Previsão de devolução (opcional)</Text>
            <TextInput
              style={styles.input}
              placeholder="2025-12-05"
              placeholderTextColor="#aaa"
              value={dataPrevista}
              onChangeText={setDataPrevista}
            />

            {/* BOTÕES */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#ccc" }]}
                onPress={() => setModal(false)}
              >
                <Text style={{ color: "#333", fontWeight: "bold" }}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#0b5394" }]}
                onPress={registrarRetirada}
              >
                <Text style={{ color: "#fff", fontWeight: "bold" }}>
                  Salvar
                </Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>
    </View>
  );
}

/* ================== ESTILOS ================== */
const styles = StyleSheet.create({
  /* HEADER */
  header: {
    backgroundColor: "#0b5394",
    paddingTop: Platform.OS === "ios" ? 50 : 25,
    paddingBottom: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 6,
  },

  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },

  filterBtn: {
    padding: 6,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 6,
  },

  /* LISTA */
  card: {
    backgroundColor: "#fff",
    marginBottom: 12,
    padding: 14,
    borderRadius: 12,
    borderLeftWidth: 6,
    elevation: 2,
    flexDirection: "row",
  },

  nome: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#222",
  },

  meta: {
    color: "#555",
    fontSize: 13,
    marginTop: 1,
  },

  /* BOTÃO DEVOLVER */
  btnDevolver: {
    backgroundColor: "#4cd137",
    height: 42,
    width: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
    marginTop: 10,
    elevation: 4,
  },

  /* FAB */
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
    elevation: 10,
  },

  /* SEM REGISTROS */
  emptyWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
  },

  emptyText: {
    color: "#777",
    fontSize: 14,
  },

  /* MODAL */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalCard: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 14,
    width: "90%",
    elevation: 10,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0b5394",
    marginBottom: 10,
  },

  input: {
    backgroundColor: "#f3f6ff",
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#e6eaf5",
    marginBottom: 10,
    color: "#333",
  },

  label: {
    color: "#0b5394",
    fontWeight: "bold",
    marginBottom: 4,
    marginTop: 8,
  },

  /* LISTAS DE SELEÇÃO */
  selectList: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 10,
  },

  selectItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },

  selectText: {
    color: "#333",
    fontSize: 14,
  },

  /* SELEÇÃO VISUAL */
  selectedBox: {
    backgroundColor: "#eaf1ff",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#0b5394",
  },

  selectedFerramenta: {
    color: "#0b5394",
    fontWeight: "bold",
    fontSize: 15,
  },

  selectedPatri: {
    color: "#333",
    fontSize: 13,
    marginTop: 2,
  },

  selectedObra: {
    color: "#666",
    fontSize: 12,
    marginTop: 2,
  },

  /* BOTÕES DO MODAL */
  modalActions: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  modalBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 4,
  },
});
