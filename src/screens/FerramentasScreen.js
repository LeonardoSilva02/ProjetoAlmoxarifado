import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

import { supabase } from "../services/supabase";
import styles from "../styles/ferramentasStyles";

/* =================== HELPERS =================== */
function parseBrToISODate(brDate) {
  if (!brDate) return null;
  const [dia, mes, ano] = brDate.split("/");
  return `${ano}-${mes}-${dia}`;
}

function parseISOToBrDate(isoDate) {
  if (!isoDate) return "";
  const dt = new Date(isoDate);
  return dt.toLocaleDateString("pt-BR");
}

/* ========== AGRUPA FERRAMENTAS ========== */
function agruparFerramentas(lista) {
  const grupos = {};

  lista.forEach((item) => {
    const nomeNormalizado = (item.nome || "").trim().toLowerCase();

    if (!grupos[nomeNormalizado]) {
      grupos[nomeNormalizado] = {
        titulo: item.nome,
        itens: [],
      };
    }
    grupos[nomeNormalizado].itens.push(item);
  });

  const gruposOrdenados = Object.values(grupos).sort((a, b) =>
    a.titulo.toLowerCase().localeCompare(b.titulo.toLowerCase())
  );

  gruposOrdenados.forEach((grupo) => {
    grupo.itens.sort((a, b) =>
      (a.patrimonio || "").toLowerCase().localeCompare(
        (b.patrimonio || "").toLowerCase()
      )
    );
  });

  const listaFinal = [];
  gruposOrdenados.forEach((grupo) => {
    listaFinal.push({ tipo: "header", titulo: grupo.titulo });
    grupo.itens.forEach((item) => listaFinal.push({ tipo: "item", ...item }));
  });

  return listaFinal;
}

/* =================== ABA FERRAMENTAS =================== */
function AbaFerramentas({ obra, podeEditar }) {
  const [ferramentas, setFerramentas] = useState([]);
  const [busca, setBusca] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  const [editingItem, setEditingItem] = useState(null);
  const [nome, setNome] = useState("");
  const [patrimonio, setPatrimonio] = useState("");
  const [situacao, setSituacao] = useState("Funcionando");
  const [dataManutencao, setDataManutencao] = useState("");

  /* ========= CARREGAR ========= */
  const carregar = async () => {
    const { data } = await supabase
      .from("ferramentas")
      .select("*")
      .eq("obra", obra);

    const lista = data || [];

    // 🔥 Buscar movimentação ativa
    for (let f of lista) {
      if (f.situacao === "Em uso") {
        const { data: mov } = await supabase
          .from("movimentacoes")
          .select("colaborador, data_retirada")
          .eq("patrimonio", f.patrimonio)
          .eq("obra", obra)
          .is("data_devolucao", null)
          .order("id", { ascending: false })
          .limit(1);

        if (mov && mov.length > 0) {
          f.colaboradorAtual = mov[0].colaborador;
          f.dataRetiradaAtual = parseISOToBrDate(mov[0].data_retirada);
        }
      }
    }

    setFerramentas(lista);
  };

  useEffect(() => {
    carregar();

    const channel = supabase
      .channel("ferramentas-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "ferramentas" },
        () => carregar()
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [obra]);

  /* ========= SALVAR ========= */
  const confirmarSalvar = async () => {
    if (!nome || !patrimonio)
      return Alert.alert("Preencha todos os campos!");

    const isoDate =
      situacao === "Em manutenção" ? parseBrToISODate(dataManutencao) : null;

    if (situacao === "Em manutenção" && !isoDate)
      return Alert.alert("Informe a data da manutenção!");

    if (editingItem) {
      await supabase
        .from("ferramentas")
        .update({
          nome,
          patrimonio,
          situacao,
          data_manutencao: isoDate,
        })
        .eq("id", editingItem.id);
    } else {
      await supabase.from("ferramentas").insert([
        {
          nome,
          patrimonio,
          situacao,
          data_manutencao: isoDate,
          obra,
        },
      ]);
    }

    setModalVisible(false);
    setEditingItem(null);
    setNome("");
    setPatrimonio("");
    setSituacao("Funcionando");
    setDataManutencao("");
  };

  /* ========= FILTRO ========= */
  const filtradas = ferramentas.filter((item) =>
    `${item.nome} ${item.patrimonio}`.toLowerCase().includes(busca.toLowerCase())
  );

  const listaAgrupada = agruparFerramentas(filtradas);

  return (
    <View style={styles.container}>
      {/* Barra de busca */}
      <View style={styles.searchRow}>
        <Ionicons name="search" size={20} color="#666" />
        <TextInput
          placeholder="Buscar ferramenta..."
          style={styles.searchInput}
          value={busca}
          onChangeText={setBusca}
        />
      </View>

      {/* Lista */}
      <FlatList
        data={listaAgrupada}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => {
          if (item.tipo === "header")
            return <Text style={styles.headerGrupo}>{item.titulo}</Text>;

          return (
            <View style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.nome}>{item.nome}</Text>
                <Text style={styles.meta}>Patrimônio: {item.patrimonio}</Text>

                {/* SITUAÇÃO */}
                <Text
                  style={[
                    styles.situacao,
                    {
                      color:
                        item.situacao === "Em uso"
                          ? "#fbc531"
                          : item.situacao === "Funcionando"
                          ? "#2ecc71"
                          : "#e84118",
                    },
                  ]}
                >
                  {item.situacao}
                </Text>

                {/* 🔥 COLABORADOR + DATA RETIRADA */}
                {item.situacao === "Em uso" && item.colaboradorAtual && (
                  <View style={{ marginTop: 6 }}>
                    <Text style={styles.meta}>
                      <Text style={{ fontWeight: "bold" }}>Colaborador:</Text>{" "}
                      {item.colaboradorAtual}
                    </Text>

                    <Text style={styles.meta}>
                      <Text style={{ fontWeight: "bold" }}>Data retirada:</Text>{" "}
                      {item.dataRetiradaAtual}
                    </Text>
                  </View>
                )}
              </View>

              {podeEditar && (
                <TouchableOpacity
                  onPress={() => {
                    setEditingItem(item);
                    setNome(item.nome);
                    setPatrimonio(item.patrimonio);
                    setSituacao(item.situacao);
                    setDataManutencao(
                      item.data_manutencao
                        ? parseISOToBrDate(item.data_manutencao)
                        : ""
                    );
                    setModalVisible(true);
                  }}
                >
                  <Ionicons name="pencil" size={22} color="#0b5394" />
                </TouchableOpacity>
              )}
            </View>
          );
        }}
      />

      {/* botão flutuante */}
      {podeEditar && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={30} color="#fff" />
        </TouchableOpacity>
      )}

      {/* ================= MODAL ================= */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <TouchableOpacity
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                padding: 6,
                zIndex: 20,
              }}
              onPress={() => setModalVisible(false)}
            >
              <Ionicons name="close" size={28} color="#333" />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>
              {editingItem ? "Editar Ferramenta" : "Nova Ferramenta"}
            </Text>

            <TextInput
              placeholder="Nome"
              style={styles.modalInput}
              value={nome}
              onChangeText={setNome}
            />
            <TextInput
              placeholder="Patrimônio"
              style={styles.modalInput}
              value={patrimonio}
              onChangeText={setPatrimonio}
            />

            <Picker selectedValue={situacao} onValueChange={setSituacao}>
              <Picker.Item label="Funcionando" value="Funcionando" />
              <Picker.Item label="Em uso" value="Em uso" />
              <Picker.Item label="Com defeito" value="Com defeito" />
              <Picker.Item label="Em manutenção" value="Em manutenção" />
            </Picker>

            <TouchableOpacity style={styles.modalBtn} onPress={confirmarSalvar}>
              <Text style={{ color: "#fff", fontWeight: "700" }}>Salvar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* ======================================================
                    ABA RELATÓRIO
====================================================== */
function AbaRelatorio({ obra }) {
  const [dados, setDados] = useState([]);

  useEffect(() => {
    supabase
      .from("ferramentas")
      .select("*")
      .eq("obra", obra)
      .or("situacao.eq.Com defeito,situacao.eq.Em manutencao")
      .then(({ data }) => setDados(data || []));
  }, [obra]);

  const gerarPDF = async () => {
    const dataAtual = new Date().toLocaleDateString("pt-BR");

    let linhas = "";
    dados.forEach((item) => {
      linhas += `
        <tr>
          <td>${item.nome}</td>
          <td>${item.patrimonio}</td>
          <td>${item.situacao}</td>
        </tr>`;
    });

    const html = `
      <html>
      <body style="font-family: Arial; padding: 20px;">
        <h1 style="text-align:center; color:#0b5394;">Relatório de Ferramentas</h1>
        <h3 style="text-align:center; color:#444;">Obra: ${obra.toUpperCase()}</h3>
        <p style="text-align:center; margin-bottom: 30px;">Data: ${dataAtual}</p>

        <table style="width:100%; border-collapse: collapse;">
          <tr style="background:#0b5394; color:#fff;">
            <th style="padding:8px;">Nome</th>
            <th style="padding:8px;">Patrimônio</th>
            <th style="padding:8px;">Situação</th>
          </tr>
          ${linhas}
        </table>
      </body>
      </html>
    `;

    const file = await Print.printToFileAsync({ html });
    await Sharing.shareAsync(file.uri);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.btnPdf} onPress={gerarPDF}>
        <Ionicons name="document-text" size={20} color="#fff" />
        <Text style={styles.btnPdfText}>Gerar Relatório PDF</Text>
      </TouchableOpacity>

      <FlatList
        data={dados}
        keyExtractor={(i) => i.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.cardRelatorio}>
            <Text style={styles.nome}>{item.nome}</Text>
            <Text style={styles.meta}>Situação: {item.situacao}</Text>
          </View>
        )}
      />
    </View>
  );
}

/* =================== TELA PRINCIPAL =================== */
export default function FerramentasScreen() {
  const [obraSelecionada, setObraSelecionada] = useState(null);
  const [aba, setAba] = useState("ferramentas");
  const [podeEditar, setPodeEditar] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem("userRole").then((role) =>
      setPodeEditar(role === "admin" || role === "adminHonda")
    );
  }, []);

  if (!obraSelecionada) {
    return (
      <View style={styles.selectWrap}>
        <Text style={styles.selectTitle}>Selecione o Almoxarifado</Text>

        <TouchableOpacity
          style={styles.selectCard}
          onPress={() => setObraSelecionada("masters")}
        >
          <Text style={styles.selectCardText}>Masters</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.selectCard}
          onPress={() => setObraSelecionada("honda")}
        >
          <Text style={styles.selectCardText}>Honda</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setObraSelecionada(null)}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Ferramentas - {obraSelecionada.toUpperCase()}
        </Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tabBtn, aba === "ferramentas" && styles.tabActive]}
          onPress={() => setAba("ferramentas")}
        >
          <Text
            style={[
              styles.tabText,
              aba === "ferramentas" && styles.tabTextActive,
            ]}
          >
            Ferramentas
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, aba === "relatorio" && styles.tabActive]}
          onPress={() => setAba("relatorio")}
        >
          <Text
            style={[
              styles.tabText,
              aba === "relatorio" && styles.tabTextActive,
            ]}
          >
            Relatório
          </Text>
        </TouchableOpacity>
      </View>

      {aba === "ferramentas" ? (
        <AbaFerramentas obra={obraSelecionada} podeEditar={podeEditar} />
      ) : (
        <AbaRelatorio obra={obraSelecionada} />
      )}
    </View>
  );
}
