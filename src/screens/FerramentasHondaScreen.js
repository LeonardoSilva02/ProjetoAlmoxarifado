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
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";

export default function FerramentasHondaScreen() {
  const storageKey = "@honda_ferramentas";
  const [ferramentas, setFerramentas] = useState([]);
  const [busca, setBusca] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [nome, setNome] = useState("");
  const [marca, setMarca] = useState("");
  const [patrimonio, setPatrimonio] = useState("");
  const [estado, setEstado] = useState("Bom");
  const [dataEnvio, setDataEnvio] = useState("");

  useEffect(() => {
    carregar();
  }, []);

  useEffect(() => {
    salvar(ferramentas);
  }, [ferramentas]);

  const carregar = async () => {
    try {
      const raw = await AsyncStorage.getItem(storageKey);
      if (raw) setFerramentas(JSON.parse(raw));
    } catch (e) {
      console.log("Erro ao carregar ferramentas Honda:", e);
    }
  };

  const salvar = async (data) => {
    try {
      await AsyncStorage.setItem(storageKey, JSON.stringify(data));
    } catch (e) {
      console.log("Erro ao salvar ferramentas Honda:", e);
    }
  };

  const abrirModalNovo = () => {
    setEditingItem(null);
    setNome("");
    setMarca("");
    setPatrimonio("");
    setEstado("Bom");
    setDataEnvio("");
    setModalVisible(true);
  };

  const abrirModalEditar = (item) => {
    setEditingItem(item);
    setNome(item.nome);
    setMarca(item.marca);
    setPatrimonio(item.patrimonio);
    setEstado(item.estado);
    setDataEnvio(item.dataEnvio || "");
    setModalVisible(true);
  };

  const confirmarSalvar = () => {
    if (!nome.trim() || !marca.trim() || !patrimonio.trim()) {
      Alert.alert("Preencha todos os campos obrigatórios!");
      return;
    }

    const novaFerramenta = {
      id: editingItem ? editingItem.id : Date.now().toString(),
      nome: nome.trim(),
      marca: marca.trim(),
      patrimonio: patrimonio.trim(),
      estado,
      dataEnvio: estado === "Em manutenção" ? dataEnvio || new Date().toISOString() : "",
      criadaEm: editingItem ? editingItem.criadaEm : new Date().toISOString(),
    };

    if (editingItem) {
      setFerramentas((prev) =>
        prev.map((f) => (f.id === editingItem.id ? novaFerramenta : f))
      );
    } else {
      setFerramentas([novaFerramenta, ...ferramentas]);
    }

    setModalVisible(false);
  };

  const deletar = (item) => {
    Alert.alert("Excluir", `Excluir a ferramenta "${item.nome}"?`, [
      { text: "Cancelar", style: "cancel" },
      { text: "Excluir", style: "destructive", onPress: () => setFerramentas((prev) => prev.filter((f) => f.id !== item.id)) },
    ]);
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case "Bom":
        return "#4cd137";
      case "Com defeito":
        return "#e1b12c";
      case "Em manutenção":
        return "#e84118";
      default:
        return "#ccc";
    }
  };

  const ferramentasFiltradas = ferramentas.filter((f) =>
    f.nome.toLowerCase().includes(busca.toLowerCase())
  );

  const renderItem = ({ item }) => {
    const cor = getEstadoColor(item.estado);
    return (
      <View style={styles.card}>
        <View style={{ flex: 1 }}>
          <Text style={styles.itemNome}>{item.nome}</Text>
          <Text style={styles.itemInfo}>Marca: {item.marca}</Text>
          <Text style={styles.itemInfo}>Patrimônio: {item.patrimonio}</Text>
          <Text style={[styles.itemEstado, { color: cor }]}>Estado: {item.estado}</Text>
          {item.estado === "Em manutenção" && (
            <Text style={styles.itemInfo}>
              Enviado: {item.dataEnvio ? format(new Date(item.dataEnvio), "dd/MM/yyyy") : "—"}
            </Text>
          )}
        </View>
        <View style={styles.actions}>
          <TouchableOpacity onPress={() => abrirModalEditar(item)}>
            <Ionicons name="pencil" size={22} color="#0b5394" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => deletar(item)}>
            <Ionicons name="trash" size={22} color="#777" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="construct" size={22} color="#fff" style={{ marginRight: 6 }} />
        <Text style={styles.headerTitle}>Ferramentas Honda</Text>
      </View>

      <View style={styles.searchRow}>
        <Ionicons name="search" size={18} color="#666" />
        <TextInput
          placeholder="Buscar ferramenta..."
          placeholderTextColor="#999"
          style={styles.searchInput}
          value={busca}
          onChangeText={setBusca}
        />
      </View>

      {ferramentasFiltradas.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>Nenhuma ferramenta cadastrada.</Text>
        </View>
      ) : (
        <FlatList
          data={ferramentasFiltradas}
          keyExtractor={(i) => i.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 120 }}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={abrirModalNovo}>
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>

      {/* Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {editingItem ? "Editar Ferramenta" : "Nova Ferramenta"}
            </Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Nome"
              value={nome}
              onChangeText={setNome}
              placeholderTextColor="#999"
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Marca"
              value={marca}
              onChangeText={setMarca}
              placeholderTextColor="#999"
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Patrimônio"
              value={patrimonio}
              onChangeText={setPatrimonio}
              placeholderTextColor="#999"
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Estado (Bom, Com defeito, Em manutenção)"
              value={estado}
              onChangeText={setEstado}
              placeholderTextColor="#999"
            />
            {estado === "Em manutenção" && (
              <TextInput
                style={styles.modalInput}
                placeholder="Data de envio (opcional)"
                value={dataEnvio}
                onChangeText={setDataEnvio}
                placeholderTextColor="#999"
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
  container: { flex: 1, backgroundColor: "#f9f9f9" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0b5394",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    margin: 12,
    paddingHorizontal: 10,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 6,
    fontSize: 15,
    color: "#333",
  },
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    marginHorizontal: 12,
    marginVertical: 6,
    padding: 14,
    borderRadius: 12,
    elevation: 2,
  },
  itemNome: { fontWeight: "bold", fontSize: 16, marginBottom: 4 },
  itemInfo: { color: "#555", fontSize: 14 },
  itemEstado: { fontWeight: "bold", fontSize: 14, marginTop: 2 },
  actions: { justifyContent: "space-around", alignItems: "center" },
  emptyWrap: { alignItems: "center", marginTop: 40 },
  emptyText: { color: "#777" },
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#0b5394",
    width: 56,
    height: 56,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 20,
  },
  modalCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0b5394",
    marginBottom: 14,
    textAlign: "center",
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    fontSize: 15,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  modalBtn: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
});
