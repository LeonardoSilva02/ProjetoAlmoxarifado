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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";

export default function FerramentasScreen({ route }) {
  const readOnly = route?.params?.readOnly ?? false;

  const [ferramentas, setFerramentas] = useState([]);
  const [busca, setBusca] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  const [editingItem, setEditingItem] = useState(null);
  const [nome, setNome] = useState("");
  const [patrimonio, setPatrimonio] = useState("");
  const [situacao, setSituacao] = useState("Funcionando");
  const [dataManutencao, setDataManutencao] = useState("");
  const [local, setLocal] = useState(""); // Novo campo

  const STORAGE_KEY = "@ferramentas_data";

  useEffect(() => {
    carregar();
  }, []);

  useEffect(() => {
    salvar(ferramentas);
  }, [ferramentas]);

  const carregar = async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) setFerramentas(JSON.parse(raw));
    } catch (e) {
      console.log("Erro ao carregar ferramentas", e);
    }
  };

  const salvar = async (data) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.log("Erro ao salvar ferramentas", e);
    }
  };

  const abrirModalNovo = () => {
    if (readOnly) {
      Alert.alert("Acesso somente leitura", "Você não tem permissão para adicionar aqui.");
      return;
    }
    setEditingItem(null);
    setNome("");
    setPatrimonio("");
    setSituacao("Funcionando");
    setDataManutencao("");
    setLocal("");
    setModalVisible(true);
  };

  const abrirModalEditar = (item) => {
    if (readOnly) {
      Alert.alert("Acesso somente leitura", "Você não tem permissão para editar aqui.");
      return;
    }
    setEditingItem(item);
    setNome(item.nome);
    setPatrimonio(item.patrimonio);
    setSituacao(item.situacao);
    setDataManutencao(item.dataManutencao || "");
    setLocal(item.local || "");
    setModalVisible(true);
  };

  const confirmarSalvar = () => {
    if (!nome.trim() || !patrimonio.trim() || !situacao || !local.trim()) {
      Alert.alert("Preencha todos os campos obrigatórios");
      return;
    }

    if (situacao === "Em manutenção" && !dataManutencao.trim()) {
      Alert.alert("Informe a data de envio para manutenção");
      return;
    }

    const novoItem = {
      id: editingItem ? editingItem.id : Date.now().toString(),
      nome: nome.trim(),
      patrimonio: patrimonio.trim(),
      situacao,
      dataManutencao: situacao === "Em manutenção" ? dataManutencao.trim() : "",
      local: local.trim(),
    };

    if (editingItem) {
      setFerramentas((prev) => prev.map((i) => (i.id === editingItem.id ? novoItem : i)));
    } else {
      setFerramentas([novoItem, ...ferramentas]);
    }

    setModalVisible(false);
  };

  const deletar = (item) => {
    if (readOnly) {
      Alert.alert("Acesso somente leitura", "Você não tem permissão para excluir aqui.");
      return;
    }
    Alert.alert("Excluir ferramenta", `Excluir "${item.nome}"?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: () => {
          setFerramentas((prev) => prev.filter((i) => i.id !== item.id));
        },
      },
    ]);
  };

  const getColorByStatus = (status) => {
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
    it.nome.toLowerCase().includes(busca.toLowerCase())
  );

  const renderItem = ({ item }) => {
    const color = getColorByStatus(item.situacao);
    return (
      <View style={[styles.card, { borderLeftColor: color, borderLeftWidth: 5 }]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.nome}>{item.nome}</Text>
          <Text style={styles.meta}>Patrimônio: {item.patrimonio}</Text>
          <Text style={styles.meta}>Local: {item.local}</Text>
          <Text style={[styles.situacao, { color }]}>{item.situacao}</Text>
          {item.situacao === "Em manutenção" && (
            <Text style={styles.meta}>🧰 Enviado em: {item.dataManutencao || "-"}</Text>
          )}
        </View>

        <View style={styles.cardActions}>
          {/* editar / excluir: escondidos em readOnly */}
          {!readOnly && (
            <>
              <TouchableOpacity onPress={() => abrirModalEditar(item)}>
                <Ionicons name="pencil" size={22} color="#0b5394" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deletar(item)} style={{ marginLeft: 10 }}>
                <Ionicons name="trash-outline" size={22} color="#777" />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="construct" size={22} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.headerTitle}>Ferramentas e Equipamentos</Text>
        {readOnly && <Text style={{ color: "#fff", marginLeft: 10, fontWeight: "700" }}>(Somente visualização)</Text>}
      </View>

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

      {itensFiltrados.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>
            {busca ? "Nenhum item encontrado." : "Nenhuma ferramenta cadastrada."}
          </Text>
        </View>
      ) : (
        <FlatList
          data={itensFiltrados}
          keyExtractor={(i) => i.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}

      {/* FAB escondido em readOnly */}
      {!readOnly && (
        <TouchableOpacity style={styles.fab} onPress={abrirModalNovo}>
          <Ionicons name="add" size={30} color="#fff" />
        </TouchableOpacity>
      )}

      {/* MODAL */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {editingItem ? "Editar Ferramenta" : "Nova Ferramenta"}
            </Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Nome da ferramenta"
              placeholderTextColor="#999"
              value={nome}
              onChangeText={setNome}
            />

            <TextInput
              style={styles.modalInput}
              placeholder="Número de patrimônio"
              placeholderTextColor="#999"
              value={patrimonio}
              onChangeText={setPatrimonio}
            />

            <TextInput
              style={styles.modalInput}
              placeholder="Local onde se encontra (Ex: Honda, BIC, Masters...)"
              placeholderTextColor="#999"
              value={local}
              onChangeText={setLocal}
            />

            <View style={styles.pickerWrap}>
              <Text style={styles.label}>Situação:</Text>
              <Picker selectedValue={situacao} style={{ flex: 1 }} onValueChange={(val) => setSituacao(val)}>
                <Picker.Item label="Funcionando" value="Funcionando" />
                <Picker.Item label="Com defeito" value="Com defeito" />
                <Picker.Item label="Em manutenção" value="Em manutenção" />
              </Picker>
            </View>

            {situacao === "Em manutenção" && (
              <TextInput
                style={styles.modalInput}
                placeholder="Data de envio (ex: 29/10/2025)"
                placeholderTextColor="#999"
                value={dataManutencao}
                onChangeText={setDataManutencao}
              />
            )}

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

/* =================== estilos (mantive os seus) =================== */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f7fb", padding: 12 },
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
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e6eaf5",
    marginTop: 12,
    marginBottom: 8,
  },
  searchInput: { marginLeft: 8, flex: 1, height: 40, color: "#333" },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    elevation: 3,
  },
  nome: { fontSize: 16, fontWeight: "700", color: "#222", marginBottom: 4 },
  meta: { color: "#555", fontSize: 13 },
  situacao: { fontWeight: "bold", marginTop: 4 },
  cardActions: { flexDirection: "row", alignItems: "center", marginLeft: 12 },
  emptyWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyText: { color: "#777" },
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
  modalTitle: { fontSize: 18, fontWeight: "800", color: "#0b5394", marginBottom: 12 },
  modalInput: {
    backgroundColor: "#f3f6ff",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e6eaf5",
    color: "#333",
  },
  pickerWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f6ff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e6eaf5",
    paddingHorizontal: 8,
    marginBottom: 10,
  },
  label: { color: "#333", fontWeight: "700", marginRight: 8 },
  modalActions: { flexDirection: "row", justifyContent: "space-between", marginTop: 6 },
  modalBtn: { flex: 1, padding: 12, borderRadius: 10, alignItems: "center", marginHorizontal: 6 },
});
