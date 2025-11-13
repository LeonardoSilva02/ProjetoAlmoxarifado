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
  ScrollView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { supabase } from "../services/supabase";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";

const Tab = createMaterialTopTabNavigator();
const TABELA = "ferramentas";
const OBRA = "masters";

/* =========================================================
   LISTA DE FERRAMENTAS
========================================================= */
function ListaFerramentasTab({ readOnly }) {
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
      .from(TABELA)
      .select("*")
      .eq("obra", OBRA)
      .order("id", { ascending: false });

    if (error) {
      console.log("Erro ao carregar ferramentas:", error);
      return;
    }

    setFerramentas(data || []);
  };

  useEffect(() => {
    carregar();
  }, []);

  // Listener do FAB
  useEffect(() => {
    const listener = () => abrirModalNovo();
    // @ts-ignore
    global.addEventListener("abrirNovoMasters", listener);

    return () => {
      // @ts-ignore
      global.removeEventListener("abrirNovoMasters", listener);
    };
  }, []);

  const abrirModalNovo = () => {
    if (readOnly) {
      Alert.alert("Acesso somente leitura", "Você não tem permissão.");
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

  const confirmarSalvar = async () => {
    if (!nome.trim() || !patrimonio.trim() || !situacao || !local.trim()) {
      Alert.alert("Preencha todos os campos.");
      return;
    }

    if (situacao === "Em manutenção" && !dataManutencao.trim()) {
      Alert.alert("Informe a data de manutenção.");
      return;
    }

    const payload = {
      nome: nome.trim(),
      patrimonio: patrimonio.trim(),
      situacao,
      data_manutencao:
        situacao === "Em manutenção" && dataManutencao.trim() !== ""
          ? dataManutencao.trim()
          : null,
      local: local.trim(),
      obra: OBRA,
    };

    const { error } = editingItem
      ? await supabase.from(TABELA).update(payload).eq("id", editingItem.id)
      : await supabase.from(TABELA).insert([payload]).select();

    if (error) {
      console.log("Erro ao salvar:", error);
      return;
    }

    carregar();
    setModalVisible(false);
  };

  const itensFiltrados = ferramentas.filter((it) =>
    it.nome.toLowerCase().includes(busca.toLowerCase())
  );

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

      {/* ========= LISTA ========= */}
      <FlatList
        data={itensFiltrados}
        keyExtractor={(i) => i.id.toString()}
        renderItem={({ item }) => (
          <View
            style={[
              styles.card,
              { borderLeftColor: "#0b5394", borderLeftWidth: 5 },
            ]}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.nome}>{item.nome}</Text>
              <Text style={styles.meta}>Patrimônio: {item.patrimonio}</Text>
              <Text style={styles.meta}>Local: {item.local}</Text>
              <Text style={styles.meta}>{item.situacao}</Text>
            </View>

            {/* ========= BOTÃO EDITAR ========= */}
            {!readOnly && (
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => {
                  setEditingItem(item);
                  setNome(item.nome);
                  setPatrimonio(item.patrimonio);
                  setSituacao(item.situacao);
                  setDataManutencao(item.data_manutencao || "");
                  setLocal(item.local || "");
                  setModalVisible(true);
                }}
              >
                <Ionicons name="create-outline" size={22} color="#0b5394" />
              </TouchableOpacity>
            )}
          </View>
        )}
      />

      {/* ========= MODAL ========= */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {editingItem ? "Editar Ferramenta" : "Nova Ferramenta"}
            </Text>

            <TextInput
              style={styles.modalInput}
              value={nome}
              onChangeText={setNome}
              placeholder="Nome"
            />
            <TextInput
              style={styles.modalInput}
              value={patrimonio}
              onChangeText={setPatrimonio}
              placeholder="Patrimônio"
            />
            <TextInput
              style={styles.modalInput}
              value={local}
              onChangeText={setLocal}
              placeholder="Local"
            />

            <View style={styles.pickerWrap}>
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
                value={dataManutencao}
                onChangeText={setDataManutencao}
                placeholder="Data de envio"
              />
            )}

            <TouchableOpacity style={styles.saveBtn} onPress={confirmarSalvar}>
              <Text style={{ color: "#fff", fontWeight: "700" }}>Salvar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setModalVisible(false)}
            >
              <Text style={{ color: "#333" }}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* =========================================================
   RELATÓRIO — Modelo igual ao da imagem + PDF + Excel
========================================================= */
function RelatorioTab() {
  const [ferramentas, setFerramentas] = useState([]);
  const [periodo, setPeriodo] = useState("all"); // all | 30d | mes

  const carregar = async () => {
    const { data, error } = await supabase
      .from(TABELA)
      .select("*")
      .eq("obra", OBRA)
      .order("nome", { ascending: true });

    if (error) {
      console.log("Erro ao carregar relatório:", error);
      return;
    }

    setFerramentas(data || []);
  };

  useEffect(() => {
    carregar();
  }, []);

  const filtrarPorPeriodo = (lista) => {
    if (periodo === "all") return lista;

    const agora = new Date();

    if (periodo === "30d") {
      const limite = new Date();
      limite.setDate(agora.getDate() - 30);
      return lista.filter((f) => {
        if (!f.created_at) return false;
        const d = new Date(f.created_at);
        return d >= limite;
      });
    }

    if (periodo === "mes") {
      const ano = agora.getFullYear();
      const mes = agora.getMonth();
      const inicio = new Date(ano, mes, 1);
      const fim = new Date(ano, mes + 1, 1);
      return lista.filter((f) => {
        if (!f.created_at) return false;
        const d = new Date(f.created_at);
        return d >= inicio && d < fim;
      });
    }

    return lista;
  };

  const listaFiltrada = filtrarPorPeriodo(ferramentas);

  const funcionando = listaFiltrada.filter(
    (f) => f.situacao === "Funcionando"
  );
  const defeito = listaFiltrada.filter((f) => f.situacao === "Com defeito");
  const manutencao = listaFiltrada.filter(
    (f) => f.situacao === "Em manutenção"
  );
  const total = listaFiltrada.length;

  const pct = (qtd) => (total ? Math.round((qtd * 100) / total) : 0);

  /* ===== Gerar PDF (HTML) ===== */
  const gerarPdf = async () => {
    const dataGeracaoLinha = new Date().toLocaleString("pt-BR");
    const dataGeracao = new Date().toLocaleDateString("pt-BR");

    const linhaFerramenta = (f, comSituacaoColorida = false) => {
      const status =
        f.situacao === "Funcionando"
          ? `<span class="status-ok">${f.situacao}</span>`
          : f.situacao === "Com defeito"
          ? `<span class="status-defeito">${f.situacao}</span>`
          : f.situacao === "Em manutenção"
          ? `<span class="status-manutencao">${f.situacao}</span>`
          : f.situacao || "-";

      return `
        <tr>
          <td>${f.nome || ""}</td>
          <td>${f.patrimonio || ""}</td>
          <td>${f.local || ""}</td>
          <td>${comSituacaoColorida ? status : f.situacao || ""}</td>
        </tr>
      `;
    };

    const tabelaTodas =
      total > 0
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
          ${listaFiltrada
            .map((f) => linhaFerramenta(f, true))
            .join("")}
        </tbody>
      </table>
    `
        : `<p class="nenhum">Nenhuma ferramenta cadastrada.</p>`;

    const tabelaPorStatus = (titulo, lista, tipo) => {
      if (!lista.length) {
        return `
          <h3 class="subsection">${titulo}</h3>
          <p class="nenhum">Nenhuma ferramenta ${tipo}.</p>
        `;
      }

      return `
        <h3 class="subsection">${titulo}</h3>
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
            ${lista.map((f) => linhaFerramenta(f, true)).join("")}
          </tbody>
        </table>
      `;
    };

    const html = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8" />
        <title>Relatório de Ferramentas Masters</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; color: #333; }
          h1 { text-align: center; color: #0b5394; margin: 4px 0 2px 0; }
          .top-line { font-size: 10px; text-align: right; color: #777; }
          .sub { text-align: center; font-size: 11px; color: #666; margin-bottom: 16px; }
          .cards { display: flex; gap: 8px; margin-bottom: 18px; }
          .card { flex: 1; border-radius: 6px; border: 1px solid #ddd; padding: 8px 10px; font-size: 11px; }
          .card-title { font-size: 11px; color: #555; margin-bottom: 4px; text-align: center; }
          .card-number { font-size: 20px; font-weight: bold; text-align: center; margin-top: 6px; }
          .card-ok { border-top: 4px solid #2ecc71; }
          .card-defeito { border-top: 4px solid #f1c40f; }
          .card-manutencao { border-top: 4px solid #e74c3c; }
          .card-total { border-top: 4px solid #34495e; }

          table { width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 8px; }
          th, td { border: 1px solid #ddd; padding: 4px 6px; }
          th { background: #f2f5ff; text-align: left; }

          .section { margin-top: 18px; }
          .section-title { font-size: 13px; font-weight: bold; color: #0b5394; border-bottom: 1px solid #0b5394; padding-bottom: 4px; }
          .subsection { font-size: 12px; color: #0b5394; margin-top: 18px; margin-bottom: 4px; }
          .nenhum { font-size: 11px; color: #777; margin-top: 4px; }

          .status-ok { color: #2ecc71; font-weight: bold; }
          .status-defeito { color: #e67e22; font-weight: bold; }
          .status-manutencao { color: #e74c3c; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="top-line">${dataGeracaoLinha}</div>
        <h1>Relatório de Ferramentas Masters</h1>
        <div class="sub">Gerado em ${dataGeracao}</div>

        <div class="cards">
          <div class="card card-ok">
            <div class="card-title">Funcionando</div>
            <div class="card-number">${funcionando.length}</div>
          </div>
          <div class="card card-defeito">
            <div class="card-title">Com Defeito</div>
            <div class="card-number">${defeito.length}</div>
          </div>
          <div class="card card-manutencao">
            <div class="card-title">Em Manutenção</div>
            <div class="card-number">${manutencao.length}</div>
          </div>
          <div class="card card-total">
            <div class="card-title">Total</div>
            <div class="card-number">${total}</div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">📋 Todas as Ferramentas</div>
          ${tabelaTodas}
        </div>

        <div class="section">
          ${tabelaPorStatus("✅ Funcionando (" + funcionando.length + ")", funcionando, "funcionando")}
          ${tabelaPorStatus("⚠️ Com Defeito (" + defeito.length + ")", defeito, "com defeito")}
          ${tabelaPorStatus("🛠 Em Manutenção (" + manutencao.length + ")", manutencao, "em manutenção")}
        </div>
      </body>
      </html>
    `;

    try {
      if (Platform.OS === "web") {
        const blob = new Blob([html], { type: "text/html;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "relatorio-ferramentas-masters.html";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        const { uri } = await Print.printToFileAsync({ html });
        await Sharing.shareAsync(uri, {
          dialogTitle: "Relatório de Ferramentas Masters",
        });
      }
    } catch (e) {
      console.log("Erro ao gerar PDF:", e);
      Alert.alert("Erro", "Não foi possível gerar o relatório.");
    }
  };

  /* ===== Exportar CSV (Excel) ===== */
  const exportarCsv = async () => {
    const sep = ";";

    const header = [
      "Nome",
      "Patrimonio",
      "Local",
      "Situacao",
      "DataManutencao",
      "CriadoEm",
    ].join(sep);

    const sanitize = (v) =>
      (v ?? "").toString().replace(/(\r\n|\n|\r)/g, " ").replace(/;/g, ",");

    const rows = listaFiltrada.map((f) =>
      [
        sanitize(f.nome),
        sanitize(f.patrimonio),
        sanitize(f.local),
        sanitize(f.situacao),
        sanitize(f.data_manutencao || ""),
        sanitize(f.created_at || ""),
      ].join(sep)
    );

    const csv = [header, ...rows].join("\n");

    try {
      if (Platform.OS === "web") {
        const blob = new Blob([csv], {
          type: "text/csv;charset=utf-8;",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "relatorio-ferramentas-masters.csv";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        const fileUri =
          FileSystem.documentDirectory + "relatorio-ferramentas-masters.csv";
        await FileSystem.writeAsStringAsync(fileUri, csv, {
          encoding: FileSystem.EncodingType.UTF8,
        });
        await Sharing.shareAsync(fileUri, {
          dialogTitle: "Planilha de Ferramentas (CSV)",
        });
      }
    } catch (e) {
      console.log("Erro ao exportar CSV:", e);
      Alert.alert("Erro", "Não foi possível exportar o arquivo.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.tituloRelatorio}>Relatório de Ferramentas (Masters)</Text>

      {/* Filtro de período */}
      <View style={styles.filterRow}>
        <Text style={styles.filterLabel}>Período:</Text>

        <TouchableOpacity
          style={[
            styles.filterPill,
            periodo === "all" && styles.filterPillAtivo,
          ]}
          onPress={() => setPeriodo("all")}
        >
          <Text
            style={[
              styles.filterPillText,
              periodo === "all" && styles.filterPillTextAtivo,
            ]}
          >
            Tudo
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterPill,
            periodo === "30d" && styles.filterPillAtivo,
          ]}
          onPress={() => setPeriodo("30d")}
        >
          <Text
            style={[
              styles.filterPillText,
              periodo === "30d" && styles.filterPillTextAtivo,
            ]}
          >
            Últimos 30 dias
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterPill,
            periodo === "mes" && styles.filterPillAtivo,
          ]}
          onPress={() => setPeriodo("mes")}
        >
          <Text
            style={[
              styles.filterPillText,
              periodo === "mes" && styles.filterPillTextAtivo,
            ]}
          >
            Mês atual
          </Text>
        </TouchableOpacity>
      </View>

      {/* Cards de totais */}
      <View style={styles.cardsRow}>
        <View style={[styles.infoCard, { borderTopColor: "#2ecc71" }]}>
          <Text style={styles.infoCardLabel}>Funcionando</Text>
          <Text style={styles.infoCardNumber}>{funcionando.length}</Text>
        </View>
        <View style={[styles.infoCard, { borderTopColor: "#f1c40f" }]}>
          <Text style={styles.infoCardLabel}>Com defeito</Text>
          <Text style={styles.infoCardNumber}>{defeito.length}</Text>
        </View>
        <View style={[styles.infoCard, { borderTopColor: "#e74c3c" }]}>
          <Text style={styles.infoCardLabel}>Em manutenção</Text>
          <Text style={styles.infoCardNumber}>{manutencao.length}</Text>
        </View>
        <View style={[styles.infoCard, { borderTopColor: "#34495e" }]}>
          <Text style={styles.infoCardLabel}>Total</Text>
          <Text style={styles.infoCardNumber}>{total}</Text>
        </View>
      </View>

      {/* “Gráfico” simples de barras */}
      <View style={styles.graphContainer}>
        <Text style={styles.graphTitle}>Distribuição por status (%)</Text>

        <View style={styles.graphRow}>
          <Text style={styles.graphLabel}>Funcionando ({pct(funcionando.length)}%)</Text>
          <View style={styles.graphBarBg}>
            <View
              style={[
                styles.graphBarFill,
                { width: `${pct(funcionando.length)}%`, backgroundColor: "#2ecc71" },
              ]}
            />
          </View>
        </View>

        <View style={styles.graphRow}>
          <Text style={styles.graphLabel}>Com defeito ({pct(defeito.length)}%)</Text>
          <View style={styles.graphBarBg}>
            <View
              style={[
                styles.graphBarFill,
                { width: `${pct(defeito.length)}%`, backgroundColor: "#f1c40f" },
              ]}
            />
          </View>
        </View>

        <View style={styles.graphRow}>
          <Text style={styles.graphLabel}>Em manutenção ({pct(manutencao.length)}%)</Text>
          <View style={styles.graphBarBg}>
            <View
              style={[
                styles.graphBarFill,
                { width: `${pct(manutencao.length)}%`, backgroundColor: "#e74c3c" },
              ]}
            />
          </View>
        </View>
      </View>

      {/* Botões de exportação */}
      <View style={styles.exportRow}>
        <TouchableOpacity style={styles.pdfBtn} onPress={gerarPdf}>
          <Ionicons name="document-text-outline" size={20} color="#fff" />
          <Text style={styles.pdfBtnText}>Gerar Relatório (PDF)</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.excelBtn}
          onPress={exportarCsv}
        >
          <Ionicons name="download-outline" size={20} color="#fff" />
          <Text style={styles.excelBtnText}>Exportar Excel (CSV)</Text>
        </TouchableOpacity>
      </View>

      {/* Seções de lista (como no PDF) */}
      <Text style={styles.sectionTitle}>📋 Todas as Ferramentas</Text>
      {total === 0 ? (
        <Text style={styles.semItens}>Nenhuma ferramenta cadastrada.</Text>
      ) : (
        listaFiltrada.map((f) => (
          <View key={f.id} style={styles.relatorioItem}>
            <Text style={styles.itemNome}>{f.nome}</Text>
            <Text style={styles.itemInfo}>Patrimônio: {f.patrimonio}</Text>
            <Text style={styles.itemInfo}>Local: {f.local}</Text>
            <Text style={styles.itemInfo}>Situação: {f.situacao}</Text>
          </View>
        ))
      )}

      <Text style={styles.sectionTitle}>
        ✅ Funcionando ({funcionando.length})
      </Text>
      {funcionando.length === 0 ? (
        <Text style={styles.semItens}>Nenhuma ferramenta funcionando.</Text>
      ) : (
        funcionando.map((f) => (
          <View key={f.id} style={styles.relatorioItem}>
            <Text style={styles.itemNome}>{f.nome}</Text>
            <Text style={styles.itemInfo}>Patrimônio: {f.patrimonio}</Text>
            <Text style={styles.itemInfo}>Local: {f.local}</Text>
          </View>
        ))
      )}

      <Text style={styles.sectionTitle}>
        ⚠️ Com Defeito ({defeito.length})
      </Text>
      {defeito.length === 0 ? (
        <Text style={styles.semItens}>Nenhuma ferramenta com defeito.</Text>
      ) : (
        defeito.map((f) => (
          <View key={f.id} style={styles.relatorioItem}>
            <Text style={styles.itemNome}>{f.nome}</Text>
            <Text style={styles.itemInfo}>Patrimônio: {f.patrimonio}</Text>
            <Text style={styles.itemInfo}>Local: {f.local}</Text>
          </View>
        ))
      )}

      <Text style={styles.sectionTitle}>
        🛠 Em Manutenção ({manutencao.length})
      </Text>
      {manutencao.length === 0 ? (
        <Text style={styles.semItens}>Nenhuma ferramenta em manutenção.</Text>
      ) : (
        manutencao.map((f) => (
          <View key={f.id} style={styles.relatorioItem}>
            <Text style={styles.itemNome}>{f.nome}</Text>
            <Text style={styles.itemInfo}>Patrimônio: {f.patrimonio}</Text>
            <Text style={styles.itemInfo}>Local: {f.local}</Text>
            <Text style={styles.itemInfo}>
              Enviado: {f.data_manutencao || "-"}
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

/* =========================================================
   TELA PRINCIPAL (SEM ABA PATRIMÔNIO)
========================================================= */
export default function FerramentasScreen({ route }) {
  const readOnly = route?.params?.readOnly ?? false;

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <Ionicons name="construct" size={22} color="#fff" />
        <Text style={styles.headerTitle}>Ferramentas - Masters</Text>
      </View>

      <Tab.Navigator
        screenOptions={{
          tabBarStyle: { backgroundColor: "#0b5394" },
          tabBarActiveTintColor: "#fff",
          tabBarIndicatorStyle: { backgroundColor: "#fff" },
        }}
      >
        <Tab.Screen name="Lista">
          {(props) => <ListaFerramentasTab {...props} readOnly={readOnly} />}
        </Tab.Screen>

        <Tab.Screen name="Relatório" component={RelatorioTab} />
      </Tab.Navigator>

      {!readOnly && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => {
            // @ts-ignore
            global.dispatchEvent(new Event("abrirNovoMasters"));
          }}
        >
          <Ionicons name="add" size={30} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
}

/* =========================================================
   ESTILOS
========================================================= */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f7fb", padding: 12 },

  header: {
    backgroundColor: "#0b5394",
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  headerTitle: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },

  searchRow: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 10,
  },

  searchInput: { flex: 1, marginLeft: 8, color: "#333" },

  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: "row",
  },

  nome: { fontSize: 16, fontWeight: "700" },
  meta: { color: "#666", fontSize: 13 },

  editBtn: {
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
  },

  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    backgroundColor: "#0b5394",
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    elevation: 10,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalCard: {
    width: "85%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#0b5394",
  },

  modalInput: {
    backgroundColor: "#f3f6ff",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 10,
  },

  pickerWrap: {
    backgroundColor: "#f3f6ff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 10,
  },

  saveBtn: {
    backgroundColor: "#0b5394",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },

  cancelBtn: {
    backgroundColor: "#ddd",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },

  /* ======== RELATÓRIO ======== */
  tituloRelatorio: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#0b5394",
  },

  sectionTitle: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: "700",
    color: "#0b5394",
  },

  relatorioItem: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#0b5394",
  },

  itemNome: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
  },

  itemInfo: {
    fontSize: 13,
    color: "#555",
  },

  semItens: {
    fontSize: 13,
    color: "#777",
    marginTop: 6,
  },

  pdfBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0b5394",
    padding: 12,
    borderRadius: 10,
  },

  pdfBtnText: {
    color: "#fff",
    fontWeight: "700",
    marginLeft: 8,
  },

  excelBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#27ae60",
    padding: 12,
    borderRadius: 10,
    marginLeft: 8,
  },

  excelBtnText: {
    color: "#fff",
    fontWeight: "700",
    marginLeft: 8,
  },

  exportRow: {
    flexDirection: "row",
    marginTop: 10,
    marginBottom: 16,
  },

  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: 12,
    gap: 6,
  },

  filterLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginRight: 4,
    color: "#333",
  },

  filterPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#0b5394",
  },

  filterPillAtivo: {
    backgroundColor: "#0b5394",
  },

  filterPillText: {
    fontSize: 12,
    color: "#0b5394",
  },

  filterPillTextAtivo: {
    color: "#fff",
    fontWeight: "700",
  },

  cardsRow: {
    flexDirection: "row",
    marginBottom: 12,
    gap: 8,
  },

  infoCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: "#ddd",
  },

  infoCardLabel: {
    fontSize: 11,
    textAlign: "center",
    color: "#555",
  },

  infoCardNumber: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 4,
    color: "#222",
  },

  graphContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e1e4f0",
  },

  graphTitle: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8,
    color: "#0b5394",
  },

  graphRow: {
    marginTop: 4,
  },

  graphLabel: {
    fontSize: 11,
    marginBottom: 2,
    color: "#444",
  },

  graphBarBg: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ecf0f1",
    overflow: "hidden",
  },

  graphBarFill: {
    height: 8,
    borderRadius: 4,
  },
});
