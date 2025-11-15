// src/screens/FerramentasMastersScreen.js

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
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { supabase } from "../services/supabase";

const Tab = createMaterialTopTabNavigator();

/* =================== HELPERS =================== */
function parseBrToISODate(brDate) {
  if (!brDate) return null;
  const p = brDate.split("/");
  if (p.length !== 3) return null;
  return `${p[2]}-${p[1]}-${p[0]}`;
}

function formatISOToBr(isoDate) {
  if (!isoDate) return "";
  const d = new Date(isoDate);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("pt-BR");
}

/* =================== LISTA — MASTERS =================== */
function ListaFerramentasMastersTab() {
  const [ferramentas, setFerramentas] = useState([]);
  const [busca, setBusca] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  const [editingItem, setEditingItem] = useState(null);
  const [nome, setNome] = useState("");
  const [patrimonio, setPatrimonio] = useState("");
  const [situacao, setSituacao] = useState("Funcionando");
  const [dataManutencao, setDataManutencao] = useState("");
  const [local, setLocal] = useState("");

  const carregar = async () => {
    const { data } = await supabase
      .from("ferramentas")
      .select("*")
      .eq("obra", "masters")
      .order("id", { ascending: false });

    if (data) {
      const lista = data.map((f) => ({
        id: f.id,
        nome: f.nome,
        patrimonio: f.patrimonio,
        situacao: f.situacao,
        local: f.local || "",
        dataManutencao: formatISOToBr(f.data_manutencao),
      }));
      setFerramentas(lista);
    }
  };

  useEffect(() => {
    carregar();
  }, []);

  const salvar = async () => {
    if (!nome.trim() || !patrimonio.trim() || !local.trim()) {
      Alert.alert("Preencha todos os campos obrigatórios.");
      return;
    }

    const iso = situacao === "Em manutenção" ? parseBrToISODate(dataManutencao) : null;

    if (!editingItem) {
      await supabase.from("ferramentas").insert([
        {
          nome,
          patrimonio,
          situacao,
          local,
          data_manutencao: iso,
          obra: "masters",
        },
      ]);
    } else {
      await supabase
        .from("ferramentas")
        .update({
          nome,
          patrimonio,
          situacao,
          local,
          data_manutencao: iso,
        })
        .eq("id", editingItem.id);
    }

    setModalVisible(false);
    carregar();
  };

  const deletar = async (item) => {
    const confirmar =
      Platform.OS === "web"
        ? window.confirm(`Excluir "${item.nome}"?`)
        : await new Promise((resolve) =>
            Alert.alert("Excluir", `Excluir "${item.nome}"?`, [
              { text: "Cancelar", style: "cancel", onPress: () => resolve(false) },
              { text: "Excluir", style: "destructive", onPress: () => resolve(true) },
            ])
          );

    if (!confirmar) return;

    await supabase.from("ferramentas").delete().eq("id", item.id).eq("obra", "masters");

    carregar();
  };

  const getColor = (s) =>
    s === "Funcionando"
      ? "#4cd137"
      : s === "Com defeito"
      ? "#fbc531"
      : "#ff4d4d";

  const renderItem = ({ item }) => {
    const cor = getColor(item.situacao);
    return (
      <View style={[styles.card, { borderLeftColor: cor }]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.nome}>{item.nome}</Text>
          <Text style={styles.meta}>Patrimônio: {item.patrimonio}</Text>
          <Text style={styles.meta}>Local: {item.local}</Text>
          <Text style={[styles.situacao, { color: cor }]}>{item.situacao}</Text>

          {item.situacao === "Em manutenção" && (
            <Text style={styles.meta}>🧰 Enviado: {item.dataManutencao || "-"}</Text>
          )}
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity
            onPress={() => {
              setEditingItem(item);
              setNome(item.nome);
              setPatrimonio(item.patrimonio);
              setSituacao(item.situacao);
              setLocal(item.local);
              setDataManutencao(item.dataManutencao);
              setModalVisible(true);
            }}
          >
            <Ionicons name="pencil" size={22} color="#0b5394" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => deletar(item)} style={{ marginLeft: 10 }}>
            <Ionicons name="trash-outline" size={22} color="#777" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const filtrados = ferramentas.filter((f) =>
    f.nome.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <View style={styles.container}>

      {/* Buscar */}
      <View style={styles.searchRow}>
        <Ionicons name="search" size={18} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar ferramenta..."
          placeholderTextColor="#999"
          value={busca}
          onChangeText={setBusca}
        />
      </View>

      {/* Lista */}
      <FlatList
        data={filtrados}
        keyExtractor={(i) => i.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      {/* FAB Novo */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          setEditingItem(null);
          setNome("");
          setPatrimonio("");
          setSituacao("Funcionando");
          setLocal("");
          setDataManutencao("");
          setModalVisible(true);
        }}
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>

      {/* MODAL */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {editingItem ? "Editar Ferramenta" : "Nova Ferramenta"}
            </Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Nome da ferramenta"
              value={nome}
              onChangeText={setNome}
            />

            <TextInput
              style={styles.modalInput}
              placeholder="Patrimônio"
              value={patrimonio}
              onChangeText={setPatrimonio}
            />

            <TextInput
              style={styles.modalInput}
              placeholder="Local"
              value={local}
              onChangeText={setLocal}
            />

            <View style={styles.pickerWrap}>
              <Text style={styles.label}>Situação:</Text>
              <Picker
                selectedValue={situacao}
                style={{ flex: 1 }}
                onValueChange={setSituacao}
              >
                <Picker.Item label="Funcionando" value="Funcionando" />
                <Picker.Item label="Com defeito" value="Com defeito" />
                <Picker.Item label="Em manutenção" value="Em manutenção" />
              </Picker>
            </View>

            {situacao === "Em manutenção" && (
              <TextInput
                style={styles.modalInput}
                placeholder="Data (DD/MM/AAAA)"
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
                onPress={salvar}
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

/* =================== RELATÓRIO — VISUAL 100% IGUAL AO HONDA =================== */
function RelatorioMastersTab() {
  const [ferramentas, setFerramentas] = useState([]);

  const carregar = async () => {
    const { data } = await supabase
      .from("ferramentas")
      .select("*")
      .eq("obra", "masters")
      .order("nome");

    if (data) setFerramentas(data);
  };

  useEffect(() => {
    carregar();
    const interval = setInterval(carregar, 3000);
    return () => clearInterval(interval);
  }, []);

  const funcionando = ferramentas.filter((f) => f.situacao === "Funcionando");
  const comDefeito = ferramentas.filter((f) => f.situacao === "Com defeito");
  const emManutencao = ferramentas.filter((f) => f.situacao === "Em manutenção");

  return (
    <ScrollView style={styles.container}>

      {/* HEADER DO RELATÓRIO */}
      <View style={styles.relatorioHeader}>
        <Ionicons name="stats-chart" size={32} color="#0b5394" />
        <Text style={styles.relatorioTitle}>Relatório de Ferramentas Masters</Text>
      </View>

      {/* CARDS DE STATUS */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: "#e8f5e9" }]}>
          <Ionicons name="checkmark-circle" size={32} color="#4cd137" />
          <Text style={styles.statNumber}>{funcionando.length}</Text>
          <Text style={styles.statLabel}>Funcionando</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: "#fff3e0" }]}>
          <Ionicons name="warning" size={32} color="#fbc531" />
          <Text style={styles.statNumber}>{comDefeito.length}</Text>
          <Text style={styles.statLabel}>Com Defeito</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: "#ffebee" }]}>
          <Ionicons name="construct" size={32} color="#ff4d4d" />
          <Text style={styles.statNumber}>{emManutencao.length}</Text>
          <Text style={styles.statLabel}>Em Manutenção</Text>
        </View>
      </View>

      {/* CARD TOTAL */}
      <View style={[styles.statCard, { backgroundColor: "#e3f2fd", marginTop: 10 }]}>
        <Ionicons name="apps" size={32} color="#0b5394" />
        <Text style={styles.statNumber}>{ferramentas.length}</Text>
        <Text style={styles.statLabel}>Total de Ferramentas</Text>
      </View>

      {/* LISTA COMPLETA */}
      <View style={styles.listaStatus}>
        <Text style={styles.listaTitleSec}>📋 Todas as Ferramentas</Text>

        {ferramentas.map((item) => {
          const cor =
            item.situacao === "Funcionando"
              ? "#4cd137"
              : item.situacao === "Com defeito"
              ? "#fbc531"
              : "#ff4d4d";

          return (
            <View key={item.id} style={[styles.cardFerramenta, { borderLeftColor: cor }]}>
              <Text style={styles.cardFerramentaNome}>{item.nome}</Text>

              <Text style={styles.cardFerramentaTexto}>
                Patrimônio: <Text style={styles.destaque}>{item.patrimonio}</Text>
              </Text>

              <Text style={styles.cardFerramentaTexto}>
                Local: <Text style={styles.destaque}>{item.local}</Text>
              </Text>

              <Text style={[styles.cardFerramentaTexto, { color: cor, fontWeight: "bold" }]}>
                {item.situacao}
              </Text>

              {item.data_manutencao && (
                <Text style={styles.cardFerramentaTexto}>
                  Enviado: {formatISOToBr(item.data_manutencao)}
                </Text>
              )}
            </View>
          );
        })}
      </View>

      {/* COM DEFEITO */}
      {comDefeito.length > 0 && (
        <View style={styles.listaStatus}>
          <Text style={[styles.listaTitle, { color: "#fbc531" }]}>
            ⚠️ Com Defeito ({comDefeito.length})
          </Text>
          {comDefeito.map((item) => (
            <View key={item.id} style={[styles.miniCard, { borderLeftColor: "#fbc531" }]}>
              <Text style={styles.miniNome}>{item.nome}</Text>
              <Text style={styles.miniMeta}>Patrimônio: {item.patrimonio}</Text>
              <Text style={styles.miniMeta}>Local: {item.local}</Text>
            </View>
          ))}
        </View>
      )}

      {/* EM MANUTENÇÃO */}
      {emManutencao.length > 0 && (
        <View style={styles.listaStatus}>
          <Text style={[styles.listaTitle, { color: "#ff4d4d" }]}>
            🔧 Em Manutenção ({emManutencao.length})
          </Text>
          {emManutencao.map((item) => (
            <View key={item.id} style={[styles.miniCard, { borderLeftColor: "#ff4d4d" }]}>
              <Text style={styles.miniNome}>{item.nome}</Text>
              <Text style={styles.miniMeta}>Patrimônio: {item.patrimonio}</Text>
              <Text style={styles.miniMeta}>Local: {item.local}</Text>
              {item.data_manutencao && (
                <Text style={styles.miniMeta}>
                  Enviado em: {formatISOToBr(item.data_manutencao)}
                </Text>
              )}
            </View>
          ))}
        </View>
      )}

    </ScrollView>
  );
}

/* =================== TELA PRINCIPAL =================== */
export default function FerramentasMastersScreen() {
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <Ionicons name="construct" size={22} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.headerTitle}>Ferramentas Elétricas Masters</Text>
      </View>

      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: "#fff",
          tabBarStyle: { backgroundColor: "#0b5394" },
          tabBarIndicatorStyle: { backgroundColor: "#fff" },
          tabBarLabelStyle: { fontSize: 12, fontWeight: "700" },
        }}
      >
        <Tab.Screen name="Lista" component={ListaFerramentasMastersTab} />
        <Tab.Screen name="Relatório" component={RelatorioMastersTab} />
      </Tab.Navigator>
    </View>
  );
}

/* =================== ESTILOS — IDÊNTICOS AO HONDA =================== */
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
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },

  /* Buscador */
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

  /* Lista */
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    elevation: 3,
    borderLeftWidth: 5,
  },
  nome: { fontSize: 16, fontWeight: "700", color: "#222" },
  meta: { fontSize: 13, color: "#555", marginTop: 2 },
  situacao: { marginTop: 4, fontWeight: "bold" },
  cardActions: { flexDirection: "row", alignItems: "center", marginLeft: 12 },

  /* Botão flutuante */
  fab: {
    position: "absolute",
    right: 18,
    bottom: 22,
    width: 58,
    height: 58,
    backgroundColor: "#0b5394",
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
  },

  /* Modal */
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
    borderWidth: 1,
    borderColor: "#e6eaf5",
    marginBottom: 10,
    color: "#333",
  },
  pickerWrap: {
    backgroundColor: "#f3f6ff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e6eaf5",
    paddingHorizontal: 8,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  label: { color: "#333", fontWeight: "bold", marginRight: 10 },

  modalActions: {
    flexDirection: "row",
    marginTop: 10,
  },
  modalBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 6,
  },

  /* RELATÓRIO */
  relatorioHeader: {
    backgroundColor: "#fff",
    paddingVertical: 20,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16,
    elevation: 2,
  },
  relatorioTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0b5394",
    marginTop: 8,
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#222",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
    textAlign: "center",
  },

  listaStatus: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginTop: 20,
    elevation: 2,
  },
  listaTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
  },
  listaTitleSec: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0b5394",
    marginBottom: 15,
    textAlign: "center",
  },

  cardFerramenta: {
    backgroundColor: "#fff",
    borderLeftWidth: 5,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    elevation: 2,
  },
  cardFerramentaNome: { fontSize: 16, fontWeight: "bold", color: "#222" },
  cardFerramentaTexto: { fontSize: 13, marginTop: 4, color: "#555" },
  destaque: { fontWeight: "bold", color: "#333" },

  miniCard: {
    backgroundColor: "#f5f7fb",
    borderLeftWidth: 4,
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  miniNome: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#222",
  },
  miniMeta: {
    fontSize: 12,
    color: "#555",
  },
});
