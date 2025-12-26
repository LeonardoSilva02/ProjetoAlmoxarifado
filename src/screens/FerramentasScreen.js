import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigation } from "@react-navigation/native";
import {
  TouchableOpacity,
  View,
  Text,
  TextInput,
  FlatList,
  Modal,
  Alert,
  ActivityIndicator,
  Pressable,
  Platform,
  ScrollView,
} from "react-native";
import ButtonEffect from "../components/ui/ButtonEffect";
import { VoltarDashboardBtn } from "../components/ui/VoltarDashboardBtn";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as ImagePicker from "expo-image-picker";

import { supabase } from "../services/supabase";
import styles from "../styles/ferramentasStyles";

/* =================== HELPERS =================== */
function parseBrToISODate(brDate) {
  if (!brDate) return null;
  const [dia, mes, ano] = brDate.split("/");
  if (!dia || !mes || !ano) return null;
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

/* ========== AGRUPA FERRAMENTAS (com key estável) ========== */
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
      (a.patrimonio || "").toLowerCase().localeCompare((b.patrimonio || "").toLowerCase())
    );
  });

  const listaFinal = [];
  gruposOrdenados.forEach((grupo) => {
    listaFinal.push({
      tipo: "header",
      titulo: grupo.titulo,
      _key: `h-${norm(grupo.titulo)}`,
    });

    grupo.itens.forEach((item) =>
      listaFinal.push({
        tipo: "item",
        ...item,
        _key: `i-${item.id ?? item.patrimonio ?? `${norm(item.nome)}-${norm(item.patrimonio)}`}`,
      })
    );
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
  return s || "-";
}

/* =================== ABA FERRAMENTAS =================== */
function AbaFerramentas({ obra, podeEditar }) {

  const LIMITE_POR_PAGINA = 20;

  const [ferramentas, setFerramentas] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [carregandoMais, setCarregandoMais] = useState(false);
  const [temMais, setTemMais] = useState(true);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [nome, setNome] = useState("");
  const [patrimonio, setPatrimonio] = useState("");
  const [situacao, setSituacao] = useState("Funcionando");
  const [dataManutencao, setDataManutencao] = useState("");

  const [modalExcluir, setModalExcluir] = useState({
    visivel: false,
    item: null,
    carregando: false,
  });

  /* ========= CARREGAR ========= */
  const carregar = useCallback(
    async (paginaNova = 1, concat = false) => {
      setCarregando(true);
      const from = (paginaNova - 1) * LIMITE_POR_PAGINA;
      const to = from + LIMITE_POR_PAGINA - 1;

      const { data, error } = await supabase
        .from("ferramentas")
        .select("*")
        .eq("obra", obra)
        .order("nome", { ascending: true })
        .range(from, to);

      if (error) {
        if (!concat) setFerramentas([]);
        setTemMais(false);
        setCarregando(false);
        return;
      }

      const lista = data || [];

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

      setFerramentas((prev) => (concat ? [...prev, ...lista] : lista));
      setTemMais(lista.length === LIMITE_POR_PAGINA);
      setCarregando(false);
    },
    [obra]
  );

  useEffect(() => {
    setPagina(1);
    carregar(1, false);

    const channel = supabase
      .channel(`ferramentas-${obra}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "ferramentas" },
        () => carregar(1, false)
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [obra, carregar]);

  /* ========= PAGINAÇÃO ========= */
  const carregarMais = useCallback(async () => {
    if (carregandoMais || !temMais) return;
    setCarregandoMais(true);
    const proxima = pagina + 1;
    await carregar(proxima, true);
    setPagina(proxima);
    setCarregandoMais(false);
  }, [carregandoMais, temMais, pagina, carregar]);

  /* ========= FILTRO ========= */
  const filtradas = useMemo(() => {
    const b = busca.toLowerCase();
    return ferramentas.filter((item) =>
      `${item.nome} ${item.patrimonio}`.toLowerCase().includes(b)
    );
  }, [ferramentas, busca]);

  const listaAgrupada = useMemo(
    () => agruparFerramentas(filtradas),
    [filtradas]
  );

  /* ========= EXCLUIR ========= */
  const abrirModalExcluir = (item) => {
    setModalExcluir({ visivel: true, item, carregando: false });
  };

  const confirmarExcluir = async () => {
    if (!modalExcluir.item?.id) return;

    setModalExcluir((p) => ({ ...p, carregando: true }));
    const { error } = await supabase
      .from("ferramentas")
      .delete()
      .eq("id", modalExcluir.item.id);

    if (error) {
      Alert.alert("Erro", "Não foi possível excluir.");
    } else {
      Alert.alert("Sucesso", "Ferramenta excluída.");
      carregar(1, false);
    }

    setModalExcluir({ visivel: false, item: null, carregando: false });
  };

  /* ========= SALVAR ========= */
  const confirmarSalvar = async () => {
    if (!nome || !patrimonio) {
      Alert.alert("Atenção", "Preencha nome e patrimônio.");
      return;
    }

    const payload = {
      nome,
      patrimonio,
      situacao,
      obra,
      data_manutencao:
        situacao === "Em manutenção"
          ? parseBrToISODate(dataManutencao)
          : null,
    };

    const query = editingItem
      ? supabase.from("ferramentas").update(payload).eq("id", editingItem.id)
      : supabase.from("ferramentas").insert(payload);

    const { error } = await query;

    if (error) {
      Alert.alert("Erro", "Falha ao salvar.");
      return;
    }

    setModalVisible(false);
    setEditingItem(null);
    setNome("");
    setPatrimonio("");
    setSituacao("Funcionando");
    setDataManutencao("");
    carregar(1, false);
  };



  /* =================== RENDER =================== */
  if (carregando) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', flex: 1 }]}> 
        <ActivityIndicator size="large" color="#0b5394" />
        <Text style={[styles.meta, { marginTop: 12 }]}>Carregando ferramentas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* BUSCA */}
      <View style={styles.searchRow}>
        <Ionicons name="search" size={20} color="#666" />
        <TextInput
          placeholder="Buscar ferramenta..."
          style={styles.searchInput}
          value={busca}
          onChangeText={setBusca}
        />
      </View>

      {/* LISTA */}
      <FlatList
        data={listaAgrupada}
        keyExtractor={(item) => item._key}
        onEndReached={carregarMais}
        onEndReachedThreshold={0.2}
        ListFooterComponent={
          carregandoMais ? (
            <ActivityIndicator style={{ margin: 16 }} />
          ) : null
        }
        renderItem={({ item }) => {
          if (item.tipo === "header") {
            return <Text style={styles.headerGrupo}>{item.titulo}</Text>;
          }

          return (
            <View style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.nome}>{item.nome}</Text>
                <Text style={styles.meta}>Patrimônio: {item.patrimonio}</Text>
                <Text
                  style={[
                    styles.situacao,
                    { color: colorSituacao(item.situacao) },
                  ]}
                >
                  {item.situacao}
                </Text>
              </View>

              {podeEditar && (
                <View style={styles.actionsRow}>
                  <ButtonEffect
                    style={styles.iconBtn}
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
                  </ButtonEffect>

                  <ButtonEffect
                    style={styles.iconBtn}
                    onPress={() => abrirModalExcluir(item)}
                  >
                    <Ionicons name="trash" size={22} color="#e84118" />
                  </ButtonEffect>
                </View>
              )}
            </View>
          );
        }}
      />

      {/* FAB */}
      {podeEditar && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={30} color="#fff" />
        </TouchableOpacity>
      )}

      {/* MODAL CADASTRO */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
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

            <View style={styles.pickerWrap}>
              <Picker selectedValue={situacao} onValueChange={setSituacao}>
                <Picker.Item label="Funcionando" value="Funcionando" />
                <Picker.Item label="Em uso" value="Em uso" />
                <Picker.Item label="Com defeito" value="Com defeito" />
                <Picker.Item label="Em manutenção" value="Em manutenção" />
              </Picker>
            </View>

            {situacao === "Em manutenção" && (
              <TextInput
                placeholder="Data manutenção (dd/mm/aaaa)"
                style={styles.modalInput}
                value={dataManutencao}
                onChangeText={setDataManutencao}
              />
            )}

            <TouchableOpacity
              style={styles.modalBtn}
              onPress={confirmarSalvar}
            >
              <Text style={styles.modalBtnText}>Salvar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL EXCLUIR */}
      <Modal visible={modalExcluir.visivel} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Excluir ferramenta?</Text>
            <Text style={styles.meta}>
              {modalExcluir.item?.nome} — {modalExcluir.item?.patrimonio}
            </Text>

            <View style={{ flexDirection: "row", marginTop: 16 }}>
              <ButtonEffect
                style={{ flex: 1, marginRight: 8 }}
                onPress={() =>
                  setModalExcluir({ visivel: false, item: null, carregando: false })
                }
              >
                <Text>Cancelar</Text>
              </ButtonEffect>

              <ButtonEffect
                style={{ flex: 1, backgroundColor: "#e84118" }}
                onPress={confirmarExcluir}
              >
                <Text style={{ color: "#fff" }}>Excluir</Text>
              </ButtonEffect>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}



/* ======================================================
                    ABA RELATÓRIO (PRO)
====================================================== */
function AbaRelatorio({ obra }) {
  const [dados, setDados] = useState([]);
  const [carregando, setCarregando] = useState(false);

  const carregarRelatorio = useCallback(async () => {
    try {
      setCarregando(true);

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
  }, [obra]);

  useEffect(() => {
    carregarRelatorio();

    const channel = supabase
      .channel(`ferramentas-relatorio-realtime-${obra}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "ferramentas" },
        () => carregarRelatorio()
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [obra, carregarRelatorio]);

  const ordemSituacoes = ["Funcionando", "Em uso", "Com defeito", "Em manutenção"];

  const totaisPorSituacao = ordemSituacoes.reduce((acc, s) => {
    acc[s] = 0;
    return acc;
  }, {});

  const totaisPorTipo = {};
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

  function montarListaUI() {
    const lista = [];

    ordemSituacoes.forEach((sit) => {
      const itensStatus = dados
        .filter((f) => f.situacao === sit)
        .slice()
        .sort((a, b) => norm(a.nome).localeCompare(norm(b.nome)));

      lista.push({
        tipo: "statusHeader",
        titulo: sit,
        total: itensStatus.length,
        _key: `s-${norm(sit)}`,
      });

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
        g.itens.sort((a, b) => norm(a.patrimonio).localeCompare(norm(b.patrimonio)));

        lista.push({
          tipo: "nomeHeader",
          titulo: g.titulo,
          total: g.itens.length,
          _key: `n-${norm(sit)}-${norm(g.titulo)}`,
        });

        g.itens.forEach((f) =>
          lista.push({
            tipo: "item",
            ...f,
            _key: `r-${f.id ?? f.patrimonio ?? `${norm(f.nome)}-${norm(f.patrimonio)}`}`,
          })
        );
      });
    });

    const extras = dados
      .filter((f) => !ordemSituacoes.includes(f.situacao))
      .slice()
      .sort((a, b) => norm(a.nome).localeCompare(norm(b.nome)));

    if (extras.length > 0) {
      lista.push({
        tipo: "statusHeader",
        titulo: "Outros",
        total: extras.length,
        _key: "s-outros",
      });

      const agrupada = agruparFerramentas(extras);
      agrupada.forEach((x) => {
        lista.push({
          ...x,
          _key: `x-${x._key}`,
        });
      });
    }

    return lista;
  }

  const listaUI = useMemo(() => montarListaUI(), [dados]);

  const gerarPDF = async () => {
    const dataAtual = new Date().toLocaleDateString("pt-BR");
    const horaAtual = new Date().toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const totalGeral = dados.length;

    // Legenda de cores
    const legendaCores = `
      <div class="legendWrap">
        <span class="legendItem"><span class="legendColor" style="background:#2ecc71"></span>Funcionando</span>
        <span class="legendItem"><span class="legendColor" style="background:#fbc531"></span>Em uso</span>
        <span class="legendItem"><span class="legendColor" style="background:#e84118"></span>Com defeito</span>
        <span class="legendItem"><span class="legendColor" style="background:#8e44ad"></span>Em manutenção</span>
      </div>
    `;

    // Resumo executivo
    const resumoExecutivo = `
      <div class="executiveSummary">
        <h2>Resumo Executivo</h2>
        <p>Este relatório apresenta o status atual das ferramentas do almoxarifado <b>${escapeHtml((obra || "").toUpperCase())}</b>, incluindo totais, distribuição por situação, tipos e detalhes individuais. O objetivo é facilitar o acompanhamento, controle e tomada de decisão sobre o patrimônio.</p>
      </div>
    `;


    // Resumo por ferramenta (topo)
    const resumoPorFerramenta = (() => {
      // Agrupa por nome
      const map = {};
      dados.forEach((f) => {
        const nome = (f.nome || "Sem nome").trim();
        if (!map[nome]) {
          map[nome] = {
            total: 0,
            funcionando: 0,
            defeito: 0,
            manutencao: 0,
          };
        }
        map[nome].total++;
        if (f.situacao === "Funcionando") map[nome].funcionando++;
        if (f.situacao === "Com defeito") map[nome].defeito++;
        if (f.situacao === "Em manutenção") map[nome].manutencao++;
      });
      const nomesOrdenados = Object.keys(map).sort((a, b) => a.localeCompare(b));
      return `
        <div class="toolSummaryWrap">
          <h2 style="margin-bottom:10px;color:#0b5394;">Resumo por Ferramenta</h2>
          <table class="table">
            <thead>
              <tr>
                <th>Ferramenta</th>
                <th>Total</th>
                <th>Funcionando</th>
                <th>Com defeito</th>
                <th>Em manutenção</th>
              </tr>
            </thead>
            <tbody>
              ${nomesOrdenados.map(nome => {
                const r = map[nome];
                return `
                  <tr>
                    <td>${escapeHtml(nome)}</td>
                    <td style="text-align:right;"><b>${r.total}</b></td>
                    <td style="text-align:right;color:#2ecc71;"><b>${r.funcionando}</b></td>
                    <td style="text-align:right;color:#e84118;"><b>${r.defeito}</b></td>
                    <td style="text-align:right;color:#8e44ad;"><b>${r.manutencao}</b></td>
                  </tr>
                `;
              }).join("")}
            </tbody>
          </table>
        </div>
      `;
    })();

    // Cards de resumo
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

    // Tabela de tipos
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

    // Função para cada situação
    function tabelaPorSituacao(situacao) {
      const itens = dados
        .filter((f) => f.situacao === situacao)
        .slice()
        .sort((a, b) => {
          const c = norm(a.nome).localeCompare(norm(b.nome));
          if (c !== 0) return c;
          return norm(a.patrimonio).localeCompare(norm(b.patrimonio));
        });

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
              const colab = f.situacao === "Em uso" ? (f.colaboradorAtual || "-") : "-";
              const retirada = f.situacao === "Em uso" ? (f.dataRetiradaAtual || "-") : "-";

              return `
                <tr>
                  <td>${escapeHtml(f.nome)}</td>
                  <td>${escapeHtml(f.patrimonio || "-")}</td>
                  <td><span style="color:${colorSituacao(f.situacao)};font-weight:700;">${escapeHtml(f.situacao || "-")}</span></td>
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

    // Rodapé
    const rodape = `
      <footer class="footer">
        <div>Relatório gerado em ${escapeHtml(dataAtual)} às ${escapeHtml(horaAtual)} | Responsável: Sistema Projeto Almoxarifado</div>
        <div>Página 1</div>
      </footer>
    `;

    // Cabeçalho profissional
    const cabecalho = `
      <header class="headerProf">
        <div class="logoWrap">
          <img src="https://i.imgur.com/0b5394.png" alt="Logo" class="logo" />
          <div class="companyInfo">
            <h1>Projeto Almoxarifado</h1>
            <span>Relatório de Ferramentas</span>
            <span>Contato: contato@empresa.com.br</span>
          </div>
        </div>
      </header>
    `;

    const html = `
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            body { font-family: Arial, sans-serif; padding: 22px; color:#1f2937; }
            .headerProf { display:flex; align-items:center; margin-bottom:18px; }
            .logoWrap { display:flex; align-items:center; }
            .logo { width:60px; height:60px; margin-right:18px; border-radius:12px; }
            .companyInfo h1 { font-size: 24px; margin:0; color:#0b5394; }
            .companyInfo span { display:block; font-size:13px; color:#475569; }
            .executiveSummary { background:#f8fafc; border-radius:12px; padding:14px; margin-bottom:18px; }
            .executiveSummary h2 { margin:0 0 8px 0; font-size:18px; color:#0b5394; }
            .legendWrap { margin-bottom:18px; }
            .legendItem { display:inline-flex; align-items:center; margin-right:18px; font-size:13px; }
            .legendColor { display:inline-block; width:18px; height:18px; border-radius:4px; margin-right:6px; border:1px solid #e5e7eb; }
            .toolSummaryWrap { margin-bottom:24px; }
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
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 16px 0 18px 0; }
            .card { border: 1px solid #e5e7eb; border-radius: 14px; padding: 14px; background: #fff; }
            .cardTitle { font-weight: 800; color:#0b5394; margin-bottom: 8px; }
            .chips { display:flex; gap:10px; flex-wrap: wrap; }
            .chip { min-width: 160px; border: 1px solid #e5e7eb; border-radius: 14px; padding: 10px 12px; background: #f8fafc; }
            .chipTitle { font-size: 12px; color:#475569; font-weight: 700; }
            .chipValue { font-size: 20px; font-weight: 900; margin-top: 2px; color:#0f172a; }
            .kpi { font-size: 28px; font-weight: 900; color:#0f172a; }
            .muted { color:#64748b; font-size: 12px; }
            .table { width: 100%; border-collapse: collapse; margin-top: 8px; margin-bottom: 12px; }
            .table th { text-align:left; background:#0b5394; color:#fff; padding: 8px; font-size: 12px; }
            .table td { border-bottom: 1px solid #e5e7eb; padding: 7px 8px; font-size: 12px; vertical-align: top; }
            .section { margin-top: 18px; }
            .sectionTitle { font-size: 16px; font-weight: 900; padding: 10px 12px; background: #f1f5f9; border-radius: 12px; margin-bottom: 10px; }
            .subTitle { font-size: 13px; font-weight: 900; color:#0b5394; margin: 10px 0 0 0; }
            .empty { padding: 10px 12px; border: 1px dashed #cbd5e1; border-radius: 12px; background: #f8fafc; color:#475569; font-size: 12px; }
            .typesWrap { max-height: 420px; overflow: hidden; }
            .footer { margin-top:32px; padding-top:12px; border-top:1px solid #e5e7eb; color:#475569; font-size:12px; text-align:center; }
          </style>
        </head>
        <body>
          ${cabecalho}
          ${resumoExecutivo}
          ${legendaCores}
          ${resumoPorFerramenta}
          <div class="topbar">
            <p class="title">Relatório de Ferramentas</p>
            <p class="subtitle">Obra: <b>${escapeHtml((obra || "").toUpperCase())}</b></p>
            <div class="metaLine">Gerado em: ${escapeHtml(dataAtual)} às ${escapeHtml(horaAtual)}</div>
          </div>
          <div class="grid">
            <div class="card">
              <div class="cardTitle">Resumo Geral</div>
              <div class="kpi">${totalGeral}</div>
              <div class="muted">Total de ferramentas cadastradas</div>
            </div>
            <div class="card">
              <div class="cardTitle">Distribuição por Situação</div>
              <div class="chips">${cardsResumo}</div>
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
          ${rodape}
        </body>
      </html>
    `;

    const file = await Print.printToFileAsync({ html });
    await Sharing.shareAsync(file.uri);
  };

  // Resumo por ferramenta para exibir no topo da página
  const resumoPorFerramenta = (() => {
    const map = {};
    dados.forEach((f) => {
      const nome = (f.nome || "Sem nome").trim();
      if (!map[nome]) {
        map[nome] = {
          total: 0,
          funcionando: 0,
          defeito: 0,
          manutencao: 0,
        };
      }
      map[nome].total++;
      // Funcionando inclui "Funcionando" e "Em uso"
      if (f.situacao === "Funcionando" || f.situacao === "Em uso") map[nome].funcionando++;
      if (f.situacao === "Com defeito") map[nome].defeito++;
      if (f.situacao === "Em manutenção") map[nome].manutencao++;
    });
    const nomesOrdenados = Object.keys(map).sort((a, b) => a.localeCompare(b));
    // Detecta se está rodando no web
    const isWeb = typeof window !== 'undefined' && typeof document !== 'undefined';
    return (
      <View style={[styles.resumoFerramentaWrap, { marginBottom: 16 }]}> 
        <Text style={{ fontWeight: 'bold', fontSize: 20, color: '#0b5394', marginBottom: 8 }}>Resumo por Ferramenta</Text>
        {isWeb ? (
          <View
            style={{
              marginBottom: 8,
              overflowX: 'auto',
              display: 'flex',
              flexDirection: 'row',
              gap: 12,
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'thin',
              paddingBottom: 4,
            }}
          >
            {nomesOrdenados.map(nome => (
              <View key={nome} style={{ minWidth: 220, backgroundColor: '#fff', borderRadius: 12, padding: 12, marginRight: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.07)', borderWidth: 1, borderColor: '#e5e7eb', display: 'flex' }}>
                <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#0b5394', marginBottom: 4 }}>{nome}</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                  <Text style={{ color: '#475569', fontWeight: 'bold' }}>Total</Text>
                  <Text style={{ color: '#0f172a', fontWeight: 'bold' }}>{map[nome].total}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                  <Text style={{ color: '#2ecc71', fontWeight: 'bold' }}>Funcionando</Text>
                  <Text style={{ color: '#2ecc71', fontWeight: 'bold' }}>{map[nome].funcionando}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                  <Text style={{ color: '#e84118', fontWeight: 'bold' }}>Defeito</Text>
                  <Text style={{ color: '#e84118', fontWeight: 'bold' }}>{map[nome].defeito}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ color: '#8e44ad', fontWeight: 'bold' }}>Manutenção</Text>
                  <Text style={{ color: '#8e44ad', fontWeight: 'bold' }}>{map[nome].manutencao}</Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              {nomesOrdenados.map(nome => (
                <View key={nome} style={{ minWidth: 220, backgroundColor: '#fff', borderRadius: 12, padding: 12, marginRight: 8, shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 4, elevation: 2, borderWidth: 1, borderColor: '#e5e7eb' }}>
                  <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#0b5394', marginBottom: 4 }}>{nome}</Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                    <Text style={{ color: '#475569', fontWeight: 'bold' }}>Total</Text>
                    <Text style={{ color: '#0f172a', fontWeight: 'bold' }}>{map[nome].total}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                    <Text style={{ color: '#2ecc71', fontWeight: 'bold' }}>Funcionando</Text>
                    <Text style={{ color: '#2ecc71', fontWeight: 'bold' }}>{map[nome].funcionando}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                    <Text style={{ color: '#e84118', fontWeight: 'bold' }}>Defeito</Text>
                    <Text style={{ color: '#e84118', fontWeight: 'bold' }}>{map[nome].defeito}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ color: '#8e44ad', fontWeight: 'bold' }}>Manutenção</Text>
                    <Text style={{ color: '#8e44ad', fontWeight: 'bold' }}>{map[nome].manutencao}</Text>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        )}
      </View>
    );
  })();

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.btnPdf} onPress={gerarPDF} activeOpacity={0.9}>
        <Ionicons name="document-text" size={20} color="#fff" />
        <Text style={styles.btnPdfText}>Gerar Relatório PDF</Text>
      </TouchableOpacity>


      {/* Resumo por ferramenta no topo */}
      {resumoPorFerramenta}

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
          keyExtractor={(item) => item._key}
          contentContainerStyle={{ paddingBottom: 40 }}
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
                    {item.titulo} {"total" in item ? `(${item.total})` : ""}
                  </Text>
                </View>
              );
            }

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
                    <Text style={styles.meta}>Colaborador: {item.colaboradorAtual}</Text>
                    <Text style={styles.meta}>Retirada: {item.dataRetiradaAtual || "-"}</Text>
                  </>
                ) : null}

                {item.situacao === "Em manutenção" && item.data_manutencao ? (
                  <Text style={styles.meta}>Manutenção: {parseISOToBrDate(item.data_manutencao)}</Text>
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
  const navigation = useNavigation();

  useEffect(() => {
    AsyncStorage.getItem("userRole").then((role) =>
      setPodeEditar(role === "admin" || role === "adminHonda")
    );
  }, []);

  if (!obraSelecionada) {
    return (
      <View style={styles.selectWrap}>
        <VoltarDashboardBtn
          onPress={() => {
            navigation.reset({ index: 0, routes: [{ name: 'DrawerNavigator', params: { screen: 'Dashboard' } }] });
          }}
        />
        <Text style={[styles.selectTitle, { marginTop: 60 }]}>Selecione o Almoxarifado</Text>
        <ButtonEffect
          style={[styles.selectCard, { marginBottom: 28 }]}
          onPress={() => setObraSelecionada("masters")}
        >
          <Ionicons name="business-outline" size={22} color="#fff" style={{ marginBottom: 4 }} />
          <Text style={styles.selectCardText}>Almoxarifado Masters</Text>
        </ButtonEffect>
        <ButtonEffect
          style={styles.selectCard}
          onPress={() => setObraSelecionada("honda")}
        >
          <Ionicons name="business-outline" size={22} color="#fff" style={{ marginBottom: 4 }} />
          <Text style={styles.selectCardText}>Almoxarifado Honda</Text>
        </ButtonEffect>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setObraSelecionada(null)} activeOpacity={0.85}>
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
          activeOpacity={0.85}
        >
          <Text style={[styles.tabText, aba === "ferramentas" && styles.tabTextActive]}>
            Ferramentas
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, aba === "relatorio" && styles.tabActive]}
          onPress={() => setAba("relatorio")}
          activeOpacity={0.85}
        >
          <Text style={[styles.tabText, aba === "relatorio" && styles.tabTextActive]}>
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
