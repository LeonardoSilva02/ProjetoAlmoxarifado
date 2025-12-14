import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  Alert,
  ActivityIndicator,
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

function norm(str) {
  return (str || "").toString().trim().toLowerCase();
}

function escapeHtml(str) {
  return (str || "")
    .toString()
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
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

function colorSituacao(situacao) {
  if (situacao === "Funcionando") return "#2ecc71";
  if (situacao === "Em uso") return "#fbc531";
  if (situacao === "Com defeito") return "#e84118";
  if (situacao === "Em manutenção") return "#8e44ad";
  return "#333";
}

function labelSituacao(s) {
  // mantém os nomes do seu sistema
  return s || "-";
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
                    { color: colorSituacao(item.situacao) },
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
                    ABA RELATÓRIO (PRO)
   - Carrega TODAS as ferramentas da obra (sem filtro errado)
   - Separa por SITUAÇÃO + agrupa por NOME (alfabético)
   - Mostra totais geral, por situação e por tipo (ex: Furadeira)
   - PDF bem “apresentável” (sem assinatura)
====================================================== */
function AbaRelatorio({ obra }) {
  const [dados, setDados] = useState([]);
  const [carregando, setCarregando] = useState(false);

  const carregarRelatorio = async () => {
    try {
      setCarregando(true);

      // ✅ AQUI É O PRINCIPAL: pegar TODAS da obra (sem aquele .or() bugado)
      const { data, error } = await supabase
        .from("ferramentas")
        .select("*")
        .eq("obra", obra)
        .order("nome", { ascending: true });

      if (error) {
        console.log("Erro ao carregar relatório:", error);
        Alert.alert("Erro", "Não foi possível carregar o relatório.");
        setDados([]);
        return;
      }

      const lista = data || [];

      // ✅ Enriquecer “Em uso” com colaborador e data retirada (igual na AbaFerramentas)
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
          } else {
            f.colaboradorAtual = "";
            f.dataRetiradaAtual = "";
          }
        }
      }

      setDados(lista);
    } catch (e) {
      console.log("Erro geral relatório:", e);
      Alert.alert("Erro", "Falha ao gerar relatório.");
      setDados([]);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarRelatorio();

    // Atualiza em tempo real quando mexer na tabela ferramentas
    const channel = supabase
      .channel("ferramentas-relatorio-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "ferramentas" },
        () => carregarRelatorio()
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [obra]);

  // ✅ separação por situação (ordem bonita)
  const ordemSituacoes = ["Funcionando", "Em uso", "Com defeito", "Em manutenção"];

  const totaisPorSituacao = ordemSituacoes.reduce((acc, s) => {
    acc[s] = 0;
    return acc;
  }, {});

  const totaisPorTipo = {}; // ex: "Furadeira" => 10
  dados.forEach((f) => {
    const s = f.situacao || "Outros";
    if (totaisPorSituacao[s] === undefined) totaisPorSituacao[s] = 0;
    totaisPorSituacao[s] += 1;

    const nomeKey = (f.nome || "Sem nome").trim();
    totaisPorTipo[nomeKey] = (totaisPorTipo[nomeKey] || 0) + 1;
  });

  const tiposOrdenados = Object.entries(totaisPorTipo).sort((a, b) =>
    a[0].toLowerCase().localeCompare(b[0].toLowerCase())
  );

  // ✅ montar lista exibida na tela do app: Status > Nome (grupo) > itens
  function montarListaUI() {
    const lista = [];

    ordemSituacoes.forEach((sit) => {
      const itensStatus = dados
        .filter((f) => f.situacao === sit)
        .slice()
        .sort((a, b) => norm(a.nome).localeCompare(norm(b.nome)));

      // se não tiver, ainda mostra o título (fica “profissa”)
      lista.push({ tipo: "statusHeader", titulo: sit, total: itensStatus.length });

      // agrupar por nome dentro da situação
      const mapNome = {};
      itensStatus.forEach((f) => {
        const key = norm(f.nome);
        if (!mapNome[key]) mapNome[key] = { titulo: f.nome, itens: [] };
        mapNome[key].itens.push(f);
      });

      const gruposNome = Object.values(mapNome).sort((a, b) =>
        norm(a.titulo).localeCompare(norm(b.titulo))
      );

      gruposNome.forEach((g) => {
        // ordena por patrimônio
        g.itens.sort((a, b) =>
          norm(a.patrimonio).localeCompare(norm(b.patrimonio))
        );

        lista.push({ tipo: "nomeHeader", titulo: g.titulo, total: g.itens.length });

        g.itens.forEach((f) => lista.push({ tipo: "item", ...f }));
      });
    });

    // se existir alguma situação diferente, joga no final
    const extras = dados
      .filter((f) => !ordemSituacoes.includes(f.situacao))
      .slice()
      .sort((a, b) => norm(a.nome).localeCompare(norm(b.nome)));

    if (extras.length > 0) {
      lista.push({ tipo: "statusHeader", titulo: "Outros", total: extras.length });
      const agrupada = agruparFerramentas(extras);
      // reaproveita seu agrupador (mantém padrão)
      agrupada.forEach((x) => lista.push(x));
    }

    return lista;
  }

  const listaUI = montarListaUI();

  const gerarPDF = async () => {
    const dataAtual = new Date().toLocaleDateString("pt-BR");
    const horaAtual = new Date().toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const totalGeral = dados.length;

    const cardsResumo = ordemSituacoes
      .map((s) => {
        const qtd = totaisPorSituacao[s] || 0;
        const cor = colorSituacao(s);
        return `
          <div class="chip" style="border-left: 8px solid ${cor};">
            <div class="chipTitle">${escapeHtml(labelSituacao(s))}</div>
            <div class="chipValue">${qtd}</div>
          </div>
        `;
      })
      .join("");

    const tabelaTipos = tiposOrdenados
      .map(([nome, qtd]) => {
        return `
          <tr>
            <td>${escapeHtml(nome)}</td>
            <td style="text-align:right;"><b>${qtd}</b></td>
          </tr>
        `;
      })
      .join("");

    function tabelaPorSituacao(situacao) {
      const itens = dados
        .filter((f) => f.situacao === situacao)
        .slice()
        .sort((a, b) => {
          const c = norm(a.nome).localeCompare(norm(b.nome));
          if (c !== 0) return c;
          return norm(a.patrimonio).localeCompare(norm(b.patrimonio));
        });

      // agrupar por nome (para ficar “profissa”)
      const map = {};
      itens.forEach((f) => {
        const k = norm(f.nome);
        if (!map[k]) map[k] = { titulo: f.nome, itens: [] };
        map[k].itens.push(f);
      });

      const grupos = Object.values(map).sort((a, b) =>
        norm(a.titulo).localeCompare(norm(b.titulo))
      );

      const cor = colorSituacao(situacao);
      const total = itens.length;

      if (total === 0) {
        return `
          <div class="section">
            <div class="sectionTitle" style="border-left: 10px solid ${cor};">
              ${escapeHtml(labelSituacao(situacao))} <span class="muted">(0)</span>
            </div>
            <div class="empty">Nenhum item nesta categoria.</div>
          </div>
        `;
      }

      const blocos = grupos
        .map((g) => {
          const linhas = g.itens
            .map((f) => {
              const manut = f.data_manutencao ? parseISOToBrDate(f.data_manutencao) : "-";
              const colab =
                f.situacao === "Em uso" ? (f.colaboradorAtual || "-") : "-";
              const retirada =
                f.situacao === "Em uso" ? (f.dataRetiradaAtual || "-") : "-";

              return `
                <tr>
                  <td>${escapeHtml(f.nome)}</td>
                  <td>${escapeHtml(f.patrimonio || "-")}</td>
                  <td>${escapeHtml(f.situacao || "-")}</td>
                  <td>${escapeHtml(colab)}</td>
                  <td>${escapeHtml(retirada)}</td>
                  <td>${escapeHtml(manut)}</td>
                </tr>
              `;
            })
            .join("");

          return `
            <div class="subTitle">${escapeHtml(g.titulo)} <span class="muted">(${g.itens.length})</span></div>
            <table class="table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Patrimônio</th>
                  <th>Situação</th>
                  <th>Colaborador</th>
                  <th>Retirada</th>
                  <th>Manutenção</th>
                </tr>
              </thead>
              <tbody>
                ${linhas}
              </tbody>
            </table>
          `;
        })
        .join("");

      return `
        <div class="section">
          <div class="sectionTitle" style="border-left: 10px solid ${cor};">
            ${escapeHtml(labelSituacao(situacao))} <span class="muted">(${total})</span>
          </div>
          ${blocos}
        </div>
      `;
    }

    const secoes = ordemSituacoes.map((s) => tabelaPorSituacao(s)).join("");

    const html = `
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            body { font-family: Arial, sans-serif; padding: 22px; color:#1f2937; }
            .topbar {
              background: linear-gradient(90deg, #0b5394, #1a73e8);
              color: #fff;
              padding: 18px 18px;
              border-radius: 14px;
              margin-bottom: 18px;
            }
            .title { font-size: 22px; font-weight: 800; margin:0; }
            .subtitle { margin:6px 0 0 0; opacity:.95; font-size: 13px; }
            .metaLine { margin-top: 10px; font-size: 12px; opacity:.95; }
            .grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 12px;
              margin: 16px 0 18px 0;
            }
            .card {
              border: 1px solid #e5e7eb;
              border-radius: 14px;
              padding: 14px;
              background: #fff;
            }
            .cardTitle { font-weight: 800; color:#0b5394; margin-bottom: 8px; }
            .chips { display:flex; gap:10px; flex-wrap: wrap; }
            .chip {
              min-width: 160px;
              border: 1px solid #e5e7eb;
              border-radius: 14px;
              padding: 10px 12px;
              background: #f8fafc;
            }
            .chipTitle { font-size: 12px; color:#475569; font-weight: 700; }
            .chipValue { font-size: 20px; font-weight: 900; margin-top: 2px; color:#0f172a; }
            .kpi { font-size: 28px; font-weight: 900; color:#0f172a; }
            .muted { color:#64748b; font-size: 12px; }
            .table { width: 100%; border-collapse: collapse; margin-top: 8px; margin-bottom: 12px; }
            .table th {
              text-align:left;
              background:#0b5394;
              color:#fff;
              padding: 8px;
              font-size: 12px;
            }
            .table td {
              border-bottom: 1px solid #e5e7eb;
              padding: 7px 8px;
              font-size: 12px;
              vertical-align: top;
            }
            .section { margin-top: 18px; }
            .sectionTitle {
              font-size: 16px;
              font-weight: 900;
              padding: 10px 12px;
              background: #f1f5f9;
              border-radius: 12px;
              margin-bottom: 10px;
            }
            .subTitle {
              font-size: 13px;
              font-weight: 900;
              color:#0b5394;
              margin: 10px 0 0 0;
            }
            .empty {
              padding: 10px 12px;
              border: 1px dashed #cbd5e1;
              border-radius: 12px;
              background: #f8fafc;
              color:#475569;
              font-size: 12px;
            }
            .typesWrap { max-height: 420px; overflow: hidden; }
          </style>
        </head>
        <body>
          <div class="topbar">
            <p class="title">Relatório de Ferramentas</p>
            <p class="subtitle">Obra: <b>${escapeHtml((obra || "").toUpperCase())}</b></p>
            <div class="metaLine">Gerado em: ${escapeHtml(dataAtual)} às ${escapeHtml(
              horaAtual
            )}</div>
          </div>

          <div class="grid">
            <div class="card">
              <div class="cardTitle">Resumo Geral</div>
              <div class="kpi">${totalGeral}</div>
              <div class="muted">Total de ferramentas cadastradas</div>
            </div>

            <div class="card">
              <div class="cardTitle">Distribuição por Situação</div>
              <div class="chips">
                ${cardsResumo}
              </div>
            </div>
          </div>

          <div class="card">
            <div class="cardTitle">Quantidades por Tipo (ordem alfabética)</div>
            <div class="typesWrap">
              <table class="table">
                <thead>
                  <tr>
                    <th>Tipo (Nome)</th>
                    <th style="text-align:right;">Quantidade</th>
                  </tr>
                </thead>
                <tbody>
                  ${tabelaTipos || `<tr><td colspan="2">Sem dados</td></tr>`}
                </tbody>
              </table>
            </div>
            <div class="muted">*Contagem baseada no campo <b>nome</b> da ferramenta.</div>
          </div>

          ${secoes}

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

      {/* ✅ mini painel resumo (sem mexer nos seus styles) */}
      <View style={{ paddingHorizontal: 12, paddingTop: 10, paddingBottom: 6 }}>
        <View
          style={{
            backgroundColor: "#ffffff",
            borderRadius: 14,
            padding: 12,
            borderLeftWidth: 6,
            borderLeftColor: "#0b5394",
          }}
        >
          <Text style={[styles.nome, { marginBottom: 2 }]}>
            Resumo do Almoxarifado
          </Text>
          <Text style={styles.meta}>Total geral: {dados.length}</Text>
          <Text style={styles.meta}>
            Funcionando: {totaisPorSituacao["Funcionando"] || 0} | Em uso:{" "}
            {totaisPorSituacao["Em uso"] || 0}
          </Text>
          <Text style={styles.meta}>
            Com defeito: {totaisPorSituacao["Com defeito"] || 0} | Em manutenção:{" "}
            {totaisPorSituacao["Em manutenção"] || 0}
          </Text>
        </View>
      </View>

      {carregando ? (
        <View style={{ paddingTop: 20 }}>
          <ActivityIndicator size="large" color="#0b5394" />
          <Text style={[styles.meta, { textAlign: "center", marginTop: 10 }]}>
            Carregando relatório...
          </Text>
        </View>
      ) : (
        <FlatList
          data={listaUI}
          keyExtractor={(item, index) => {
            if (item.tipo === "statusHeader") return `s-${item.titulo}-${index}`;
            if (item.tipo === "nomeHeader") return `n-${item.titulo}-${index}`;
            if (item.tipo === "header") return `h-${item.titulo}-${index}`;
            return `i-${item.id || item.patrimonio || index}`;
          }}
          renderItem={({ item }) => {
            if (item.tipo === "statusHeader") {
              return (
                <View style={{ paddingHorizontal: 12, paddingTop: 14 }}>
                  <Text style={styles.headerGrupo}>
                    {item.titulo} ({item.total})
                  </Text>
                </View>
              );
            }

            if (item.tipo === "nomeHeader" || item.tipo === "header") {
              return (
                <View style={{ paddingHorizontal: 12, paddingTop: 6 }}>
                  <Text style={[styles.headerGrupo, { fontSize: 14 }]}>
                    {item.titulo}{" "}
                    {"total" in item ? `(${item.total})` : ""}
                  </Text>
                </View>
              );
            }

            // item ferramenta
            return (
              <View style={styles.cardRelatorio}>
                <Text style={styles.nome}>{item.nome}</Text>
                <Text style={styles.meta}>Patrimônio: {item.patrimonio}</Text>

                <Text style={styles.meta}>
                  Situação:{" "}
                  <Text style={{ fontWeight: "800", color: colorSituacao(item.situacao) }}>
                    {item.situacao}
                  </Text>
                </Text>

                {item.situacao === "Em uso" && item.colaboradorAtual ? (
                  <>
                    <Text style={styles.meta}>
                      Colaborador: {item.colaboradorAtual}
                    </Text>
                    <Text style={styles.meta}>
                      Retirada: {item.dataRetiradaAtual || "-"}
                    </Text>
                  </>
                ) : null}

                {item.situacao === "Em manutenção" && item.data_manutencao ? (
                  <Text style={styles.meta}>
                    Manutenção: {parseISOToBrDate(item.data_manutencao)}
                  </Text>
                ) : null}
              </View>
            );
          }}
        />
      )}
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
            style={[styles.tabText, aba === "relatorio" && styles.tabTextActive]}
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
