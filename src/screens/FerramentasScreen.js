// src/screens/FerramentasScreen.js

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

/* =================== HELPERS DE DATA (BR <-> ISO) =================== */
function parseBrToISODate(brDate) {
  if (!brDate) return null;
  const parts = brDate.split("/");
  if (parts.length !== 3) return null;
  const [dia, mes, ano] = parts;
  if (!dia || !mes || !ano) return null;
  const d = dia.padStart(2, "0");
  const m = mes.padStart(2, "0");
  return `${ano}-${m}-${d}`;
}

function formatISOToBr(isoDate) {
  if (!isoDate) return "";
  const d = new Date(isoDate);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("pt-BR");
}

/* =================== LISTA DE FERRAMENTAS MASTERS (SUPABASE) =================== */
function ListaFerramentasTab() {
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
    const { data, error } = await supabase
      .from("ferramentas")
      .select("*")
      .eq("obra", "masters")
      .order("nome", { ascending: true });

    if (error) {
      console.log("Erro ao carregar ferramentas Masters:", error);
      Alert.alert("Erro", "Não foi possível carregar as ferramentas Masters.");
      return;
    }

    const lista = (data || []).map((f) => ({
      id: f.id,
      nome: f.nome,
      patrimonio: f.patrimonio,
      situacao: f.situacao,
      local: f.local || "",
      dataManutencao: formatISOToBr(f.data_manutencao),
    }));

    setFerramentas(lista);
  };

  useEffect(() => {
    carregar();
  }, []);

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
    setLocal(item.local);
    setModalVisible(true);
  };

  const confirmarSalvar = async () => {
    if (!nome.trim() || !patrimonio.trim() || !situacao || !local.trim()) {
      Alert.alert("Preencha todos os campos obrigatórios");
      return;
    }

    if (situacao === "Em manutenção" && !dataManutencao.trim()) {
      Alert.alert("Informe a data de envio para manutenção");
      return;
    }

    const isoDate =
      situacao === "Em manutenção"
        ? parseBrToISODate(dataManutencao.trim())
        : null;

    if (!editingItem) {
      const { data, error } = await supabase
        .from("ferramentas")
        .insert([
          {
            nome: nome.trim(),
            patrimonio: patrimonio.trim(),
            situacao,
            local: local.trim(),
            data_manutencao: isoDate,
            obra: "masters",
          },
        ])
        .select();

      if (error) {
        console.log("Erro ao cadastrar ferramenta Masters:", error);
        Alert.alert("Erro", "Não foi possível salvar a ferramenta.");
        return;
      }

      const inserida = data[0];
      const nova = {
        id: inserida.id,
        nome: inserida.nome,
        patrimonio: inserida.patrimonio,
        situacao: inserida.situacao,
        local: inserida.local || "",
        dataManutencao: formatISOToBr(inserida.data_manutencao),
      };

      setFerramentas((prev) => [nova, ...prev].sort((a, b) => a.nome.localeCompare(b.nome)));
    } else {
      const { error } = await supabase
        .from("ferramentas")
        .update({
          nome: nome.trim(),
          patrimonio: patrimonio.trim(),
          situacao,
          local: local.trim(),
          data_manutencao: isoDate,
        })
        .eq("id", editingItem.id);

      if (error) {
        console.log("Erro ao editar ferramenta Masters:", error);
        Alert.alert("Erro", "Não foi possível salvar as alterações.");
        return;
      }

      carregar();
    }

    setModalVisible(false);
  };

  const deletar = async (item) => {
    const confirmar =
      Platform.OS === "web"
        ? window.confirm(`Deseja excluir "${item.nome}"?`)
        : await new Promise((resolve) => {
            Alert.alert("Excluir ferramenta", `Deseja excluir "${item.nome}"?`, [
              { text: "Cancelar", style: "cancel", onPress: () => resolve(false) },
              { text: "Excluir", style: "destructive", onPress: () => resolve(true) },
            ]);
          });

    if (!confirmar) return;

    const { error } = await supabase
      .from("ferramentas")
      .delete()
      .eq("id", item.id);

    if (error) {
      console.log("Erro ao excluir ferramenta:", error);
      Alert.alert("Erro", "Não foi possível excluir a ferramenta.");
      return;
    }

    setFerramentas((prev) => prev.filter((f) => f.id !== item.id));
  };

  const itensFiltrados = ferramentas.filter((it) =>
    it.nome.toLowerCase().includes(busca.toLowerCase())
  );

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
            <Ionicons name="create-outline" size={22} color="#0b5394" />
          </TouchableOpacity>

          <TouchableOpacity style={{ marginLeft: 12 }} onPress={() => deletar(item)}>
            <Ionicons name="trash-outline" size={22} color="#e74c3c" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
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
          keyExtractor={(i) => i.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={abrirModalNovo}>
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {editingItem ? "Editar Ferramenta" : "Nova Ferramenta"}
            </Text>

            <TextInput
              placeholder="Nome da ferramenta"
              placeholderTextColor="#999"
              value={nome}
              onChangeText={setNome}
              style={styles.modalInput}
            />

            <TextInput
              placeholder="Número do patrimônio"
              placeholderTextColor="#999"
              value={patrimonio}
              onChangeText={setPatrimonio}
              style={styles.modalInput}
            />

            <TextInput
              placeholder="Local de armazenamento"
              placeholderTextColor="#999"
              value={local}
              onChangeText={setLocal}
              style={styles.modalInput}
            />

            <View style={styles.pickerWrap}>
              <Text style={styles.label}>Situação:</Text>
              <Picker
                selectedValue={situacao}
                onValueChange={(val) => setSituacao(val)}
                style={{ flex: 1 }}
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

/* =================== RELATÓRIO =================== */
function RelatorioTab() {
  const [ferramentas, setFerramentas] = useState([]);

  const carregar = async () => {
    const { data, error } = await supabase
      .from("ferramentas")
      .select("*")
      .eq("obra", "masters")
      .order("nome", { ascending: true });

    if (error) {
      console.log("Erro ao carregar ferramentas", error);
      return;
    }

    setFerramentas(data || []);
  };

  useEffect(() => {
    carregar();
    const interval = setInterval(carregar, 2000);
    return () => clearInterval(interval);
  }, []);

  const funcionando = ferramentas.filter((f) => f.situacao === "Funcionando");
  const comDefeito = ferramentas.filter((f) => f.situacao === "Com defeito");
  const emManutencao = ferramentas.filter((f) => f.situacao === "Em manutenção");

  const gerarPDF = () => {
    const dataAtual = new Date().toLocaleDateString("pt-BR");

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Relatório de Ferramentas Masters</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          h1 { color: #0b5394; text-align: center; }
          .info { text-align: center; margin-bottom: 30px; color: #666; }
          .summary { display: flex; justify-content: space-around; margin: 30px 0; }
          .summary-card { border: 2px solid #ddd; border-radius: 8px; padding: 20px; text-align: center; min-width: 150px; }
          .summary-card.funcionando { border-color: #4cd137; background: #e8f5e9; }
          .summary-card.defeito { border-color: #fbc531; background: #fff3e0; }
          .summary-card.manutencao { border-color: #ff4d4d; background: #ffebee; }
          .summary-card.total { border-color: #0b5394; background: #e3f2fd; }
          .summary-card h2 { margin: 10px 0; font-size: 36px; }
          .summary-card p { margin: 0; color: #666; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #0b5394; color: white; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          .section-title { color: #0b5394; margin-top: 30px; border-bottom: 2px solid #0b5394; padding-bottom: 5px; }
          .status-funcionando { color: #4cd137; font-weight: bold; }
          .status-defeito { color: #fbc531; font-weight: bold; }
          .status-manutencao { color: #ff4d4d; font-weight: bold; }
        </style>
      </head>
      <body>
        <h1>Relatório de Ferramentas Masters</h1>
        <div class="info">Gerado em ${dataAtual}</div>
        
        <div class="summary">
          <div class="summary-card funcionando">
            <p>Funcionando</p>
            <h2>${funcionando.length}</h2>
          </div>
          <div class="summary-card defeito">
            <p>Com Defeito</p>
            <h2>${comDefeito.length}</h2>
          </div>
          <div class="summary-card manutencao">
            <p>Em Manutenção</p>
            <h2>${emManutencao.length}</h2>
          </div>
          <div class="summary-card total">
            <p>Total</p>
            <h2>${ferramentas.length}</h2>
          </div>
        </div>

        <h2 class="section-title">📋 Todas as Ferramentas</h2>
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Patrimônio</th>
              <th>Local</th>
              <th>Situação</th>
            </tr>
          </thead>
          <tbody>
            ${ferramentas
              .map(
                (f) => `
              <tr>
                <td>${f.nome}</td>
                <td>${f.patrimonio || "N/A"}</td>
                <td>${f.local || "N/A"}</td>
                <td class="status-${
                  f.situacao === "Funcionando"
                    ? "funcionando"
                    : f.situacao === "Com defeito"
                    ? "defeito"
                    : "manutencao"
                }">${f.situacao}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>

        <h2 class="section-title">✅ Funcionando (${funcionando.length})</h2>
        ${
          funcionando.length > 0
            ? `
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Patrimônio</th>
              <th>Local</th>
              <th>Situação</th>
            </tr>
          </thead>
          <tbody>
            ${funcionando
              .map(
                (f) => `
              <tr>
                <td>${f.nome}</td>
                <td>${f.patrimonio || "N/A"}</td>
                <td>${f.local || "N/A"}</td>
                <td class="status-funcionando">${f.situacao}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
        `
            : "<p>Nenhuma ferramenta funcionando</p>"
        }

        <h2 class="section-title">⚠️ Com Defeito (${comDefeito.length})</h2>
        ${
          comDefeito.length > 0
            ? `
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Patrimônio</th>
              <th>Local</th>
              <th>Situação</th>
            </tr>
          </thead>
          <tbody>
            ${comDefeito
              .map(
                (f) => `
              <tr>
                <td>${f.nome}</td>
                <td>${f.patrimonio || "N/A"}</td>
                <td>${f.local || "N/A"}</td>
                <td class="status-defeito">${f.situacao}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
        `
            : "<p>Nenhuma ferramenta com defeito</p>"
        }

        <h2 class="section-title">🔧 Em Manutenção (${emManutencao.length})</h2>
        ${
          emManutencao.length > 0
            ? `
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Patrimônio</th>
              <th>Local</th>
              <th>Situação</th>
              <th>Data Envio</th>
            </tr>
          </thead>
          <tbody>
            ${emManutencao
              .map(
                (f) => `
              <tr>
                <td>${f.nome}</td>
                <td>${f.patrimonio || "N/A"}</td>
                <td>${f.local || "N/A"}</td>
                <td class="status-manutencao">${f.situacao}</td>
                <td>${formatISOToBr(f.data_manutencao) || "N/A"}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
        `
            : "<p>Nenhuma ferramenta em manutenção</p>"
        }
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio-ferramentas-masters-${dataAtual.replace(/\//g, "-")}.html`;
    a.click();
    URL.revokeObjectURL(url);

    alert("Arquivo HTML gerado! Abra o arquivo e use Ctrl+P para salvar como PDF.");
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.relatorioHeader}>
        <Ionicons name="stats-chart" size={32} color="#0b5394" />
        <Text style={styles.relatorioTitle}>Relatório de Ferramentas Masters</Text>
        <TouchableOpacity style={styles.btnExportar} onPress={gerarPDF}>
          <Ionicons name="download" size={20} color="#fff" />
          <Text style={styles.btnExportarText}>Exportar PDF</Text>
        </TouchableOpacity>
      </View>

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

      <View style={[styles.statCard, { backgroundColor: "#e3f2fd", marginTop: 10 }]}>
        <Ionicons name="apps" size={32} color="#0b5394" />
        <Text style={styles.statNumber}>{ferramentas.length}</Text>
        <Text style={styles.statLabel}>Total de Ferramentas</Text>
      </View>

      <View style={styles.listaStatus}>
        <Text style={[styles.listaTitle, { color: "#0b5394" }]}>
          📋 Todas as Ferramentas ({ferramentas.length})
        </Text>
        {ferramentas.map((item) => {
          const corStatus =
            item.situacao === "Funcionando"
              ? "#4cd137"
              : item.situacao === "Com defeito"
              ? "#fbc531"
              : "#ff4d4d";

          return (
            <View key={item.id} style={[styles.miniCard, { borderLeftColor: corStatus }]}>
              <Text style={styles.miniNome}>{item.nome}</Text>
              <Text style={styles.miniMeta}>Patrimônio: {item.patrimonio || "N/A"}</Text>
              <Text style={styles.miniMeta}>Local: {item.local || "N/A"}</Text>
              <Text style={[styles.miniMeta, { color: corStatus, fontWeight: "bold" }]}>
                Situação: {item.situacao}
              </Text>
            </View>
          );
        })}
      </View>

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
              <Text style={styles.miniMeta}>
                Enviado: {formatISOToBr(item.data_manutencao) || "N/A"}
              </Text>
            </View>
          ))}
        </View>
      )}

      {funcionando.length > 0 && (
        <View style={styles.listaStatus}>
          <Text style={[styles.listaTitle, { color: "#4cd137" }]}>
            ✅ Funcionando ({funcionando.length})
          </Text>
          {funcionando.map((item) => (
            <View key={item.id} style={[styles.miniCard, { borderLeftColor: "#4cd137" }]}>
              <Text style={styles.miniNome}>{item.nome}</Text>
              <Text style={styles.miniMeta}>Patrimônio: {item.patrimonio}</Text>
              <Text style={styles.miniMeta}>Local: {item.local}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

/* =================== TELA PRINCIPAL =================== */
export default function FerramentasScreen() {
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <Ionicons name="construct" size={22} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.headerTitle}>Ferramentas Masters</Text>
      </View>

      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: "#0b5394",
          tabBarInactiveTintColor: "#666",
          tabBarLabelStyle: { fontSize: 13, fontWeight: "bold" },
          tabBarStyle: { backgroundColor: "#f5f5f5" },
          tabBarIndicatorStyle: { backgroundColor: "#0b5394", height: 3 },
        }}
      >
        <Tab.Screen name="Lista" component={ListaFerramentasTab} />
        <Tab.Screen name="Relatório" component={RelatorioTab} />
      </Tab.Navigator>
    </View>
  );
}

/* =================== ESTILOS =================== */
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

  // Estilos do Relatório
  relatorioHeader: {
    alignItems: "center",
    paddingVertical: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
  },
  relatorioTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0b5394",
    marginTop: 8,
  },
  btnExportar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0b5394",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 15,
    elevation: 3,
  },
  btnExportarText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 8,
    fontSize: 16,
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
    fontSize: 28,
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
    marginTop: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    elevation: 2,
  },
  listaTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
  },
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
    marginBottom: 4,
  },
  miniMeta: {
    fontSize: 12,
    color: "#666",
  },
});
