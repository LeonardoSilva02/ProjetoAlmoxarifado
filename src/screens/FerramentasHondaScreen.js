// src/screens/FerramentasHondaScreen.js
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
import { exportarFerramentasParaExcel } from '../utils/exportUtils';

export default function FerramentasHondaScreen() {
  const [ferramentas, setFerramentas] = useState([]);
  const [busca, setBusca] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  const [editingItem, setEditingItem] = useState(null);
  const [nome, setNome] = useState("");
  const [patrimonio, setPatrimonio] = useState("");
  const [situacao, setSituacao] = useState("Funcionando");
  const [dataManutencao, setDataManutencao] = useState("");
  const [local, setLocal] = useState("");

  const STORAGE_KEY = "@ferramentas_honda_data";
  const STORAGE_KEY_GERAL = "@ferramentas_data";

  const exportarPlanilha = async () => {
    try {
      // Carregar dados das ferramentas gerais
      const rawGeral = await AsyncStorage.getItem(STORAGE_KEY_GERAL);
      const ferramentasGerais = rawGeral ? JSON.parse(rawGeral) : [];
      
      // Exportar
      const resultado = await exportarFerramentasParaExcel(ferramentasGerais, ferramentas);
      
      if (resultado) {
        if (Platform.OS === 'web') {
          Alert.alert("Sucesso", "Planilha exportada com sucesso!");
        } else {
          // No mobile, a mensagem de sucesso só aparece se o usuário realmente compartilhou
          Alert.alert("Sucesso", "Planilha compartilhada com sucesso!");
        }
      }
    } catch (error) {
      console.error("Erro ao exportar planilha:", error);
      
      // Mensagens de erro específicas
      if (error.message === 'Não há ferramentas cadastradas para exportar.') {
        Alert.alert("Aviso", "Não há ferramentas cadastradas para exportar.");
      } else if (Platform.OS === 'web') {
        Alert.alert("Erro", "Não foi possível exportar a planilha. Tente novamente.");
      } else {
        Alert.alert(
          "Erro ao Compartilhar",
          "Não foi possível compartilhar a planilha. Verifique as permissões do aplicativo e tente novamente."
        );
      }
    }
  };

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
      console.log("Erro ao carregar ferramentas Honda:", e);
    }
  };

  const salvar = async (data) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.log("Erro ao salvar ferramentas Honda:", e);
    }
  };

  const abrirModalNovo = () => {
    setEditingItem(null);
    setNome("");
    setPatrimonio("");
    setSituacao("Funcionando");
    setDataManutencao("");
    setLocal("");
    setModalVisible(true);
  };

  const abrirModalEditar = (item) => {
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
      setFerramentas((prev) =>
        prev.map((i) => (i.id === editingItem.id ? novoItem : i))
      );
    } else {
      setFerramentas([novoItem, ...ferramentas]);
    }

    setModalVisible(false);
  };

  const deletar = (item) => {
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
            <Text style={styles.meta}>
              🧰 Enviado em: {item.dataManutencao || "-"}
            </Text>
          )}
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity onPress={() => abrirModalEditar(item)}>
            <Ionicons name="pencil" size={22} color="#0b5394" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => deletar(item)}>
            <Ionicons
              name="trash-outline"
              size={22}
              color="#777"
              style={{ marginLeft: 10 }}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="construct" size={22} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.headerTitle}>Ferramentas Honda</Text>
        <TouchableOpacity onPress={exportarPlanilha} style={styles.exportButton}>
          <Ionicons name="download-outline" size={22} color="#fff" />
        </TouchableOpacity>
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

      <TouchableOpacity style={styles.fab} onPress={abrirModalNovo}>
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>

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
              placeholder="Local (Ex: Honda, BIC, Masters...)"
              placeholderTextColor="#999"
              value={local}
              onChangeText={setLocal}
            />

            <View style={styles.pickerWrap}>
              <Text style={styles.label}>Situação:</Text>
              <Picker
                selectedValue={situacao}
                style={{ flex: 1 }}
                onValueChange={(val) => setSituacao(val)}
              >
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f7fb", padding: 12 },
  exportButton: {
    marginLeft: 'auto',
    padding: 8,
  },
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
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.30,
        shadowRadius: 4.65,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }
    }),
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
