import React, { useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Modal,
  Alert,
  Image,
} from "react-native";
import ButtonEffect from "../components/ui/ButtonEffect";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../services/supabase";
import { styles } from "../styles/MovimentacoesFerramentasStyle";

export default function MovimentacoesFerramentas() {
  const [movs, setMovs] = useState([]);
  const [ferramentas, setFerramentas] = useState([]);

  const [aba, setAba] = useState("ativos"); // 🔥 NOVA ABA
  const [searchFerramenta, setSearchFerramenta] = useState("");
  const [modal, setModal] = useState(false);

  const [ferramentaSel, setFerramentaSel] = useState(null);
  const [colaborador, setColaborador] = useState("");
  const [dataPrevista, setDataPrevista] = useState("");

  const [readOnly, setReadOnly] = useState(true);
  const [obraSelecionada, setObraSelecionada] = useState(null);

  /* =================== PERFIL =================== */
  useEffect(() => {
    const carregarPerfil = async () => {
      const role = await AsyncStorage.getItem("userRole");
      setReadOnly(!(role === "admin" || role === "adminHonda"));
    };
    carregarPerfil();
  }, []);

  /* =================== CARREGAR MOVIMENTAÇÕES =================== */
  const carregarMovs = async () => {
    if (!obraSelecionada) return;

    const { data, error } = await supabase
      .from("movimentacoes")
      .select("*")
      .eq("obra", obraSelecionada)
      .order("id", { ascending: false });

    if (error) console.log("ERRO MOVIMENTAÇÕES:", error.message);
    setMovs(data || []);
  };

  /* =================== CARREGAR FERRAMENTAS =================== */
  const carregarFerramentas = async () => {
    if (!obraSelecionada) return;

    const { data, error } = await supabase
      .from("ferramentas")
      .select("*")
      .eq("obra", obraSelecionada);

    if (error) console.log("ERRO FERRAMENTAS:", error.message);
    setFerramentas(data || []);
  };

  useEffect(() => {
    carregarMovs();
    carregarFerramentas();
  }, [obraSelecionada]);

  /* =================== FORMATAR DATA =================== */
  const formatarData = (iso) => {
    if (!iso) return "";
    const dt = new Date(iso);
    return dt.toLocaleDateString("pt-BR") + " " + dt.toLocaleTimeString("pt-BR");
  };

  /* =================== STATUS =================== */
  const getStatus = (mov) => {
    if (mov.data_devolucao) return "Devolvida";
    if (mov.data_prevista && new Date(mov.data_prevista) < new Date())
      return "Atrasada";
    return "Em aberto";
  };

  const getColor = (status) => {
    if (status === "Devolvida") return "#4cd137";
    if (status === "Atrasada") return "#e84118";
    return "#fbc531";
  };

  /* =================== REGISTRAR RETIRADA =================== */
  const registrarRetirada = async () => {
    if (readOnly) return Alert.alert("Acesso restrito!");
    if (!colaborador || !ferramentaSel)
      return Alert.alert("Erro", "Preencha todos os campos!");

    const novo = {
      colaborador,
      ferramenta: ferramentaSel.nome,
      patrimonio: ferramentaSel.patrimonio,
      obra: obraSelecionada,
      data_retirada: new Date().toISOString(),
      data_prevista: dataPrevista || null,
      data_devolucao: null,
      status: "Em aberto",
    };

    const { error } = await supabase.from("movimentacoes").insert([novo]);
    if (error) return Alert.alert("Erro", error.message);

    await supabase
      .from("ferramentas")
      .update({ situacao: "Em uso" })
      .eq("id", ferramentaSel.id);

    setModal(false);
    setColaborador("");
    setFerramentaSel(null);
    setDataPrevista("");
    setSearchFerramenta("");

    carregarMovs();
    carregarFerramentas();
  };

  /* =================== REGISTRAR DEVOLUÇÃO =================== */
  const registrarDevolucao = async (mov) => {
    if (readOnly) return;

    await supabase
      .from("movimentacoes")
      .update({
        data_devolucao: new Date().toISOString(),
        status: "Devolvida",
      })
      .eq("id", mov.id);

    await supabase
      .from("ferramentas")
      .update({ situacao: "Funcionando" })
      .eq("patrimonio", mov.patrimonio);

    carregarMovs();
    carregarFerramentas();
  };

  /* =================== FILTRO DE LISTAGEM =================== */
  const movsAtivos = movs.filter((m) => !m.data_devolucao);
  const movsHistorico = movs.filter((m) => m.data_devolucao);

  const navigation = useNavigation();

  /* =================== SELEÇÃO DE ALMOX =================== */
  if (!obraSelecionada) {
    return (
      <View style={styles.selectWrap}>
        {/* Botão voltar ao menu */}
        <ButtonEffect
          style={{
            position: 'absolute',
            top: 32,
            left: 24,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#fff',
            borderRadius: 18,
            paddingVertical: 8,
            paddingHorizontal: 16,
            elevation: 6,
            shadowColor: '#000',
            shadowOpacity: 0.12,
            shadowRadius: 6,
            shadowOffset: { width: 0, height: 2 },
            zIndex: 10,
          }}
          onPress={() => {
            navigation.reset({ index: 0, routes: [{ name: 'DrawerNavigator', params: { screen: 'Dashboard' } }] });
          }}
        >
          <Ionicons name="arrow-back" size={20} color="#0b5394" style={{ marginRight: 6 }} />
          <Text style={{ color: '#0b5394', fontWeight: 'bold', fontSize: 15 }}>Voltar ao Menu</Text>
        </ButtonEffect>

        <Text style={[styles.selectTitle, { marginTop: 60 }]}>Selecione o Almoxarifado</Text>

        <ButtonEffect
          style={[styles.selectBtn, { marginBottom: 28 }]}
          onPress={() => setObraSelecionada("masters")}
        >
          <Ionicons name="business-outline" size={22} color="#fff" style={{ marginBottom: 4 }} />
          <Text style={styles.selectBtnText}>Almoxarifado Masters</Text>
        </ButtonEffect>

        <ButtonEffect
          style={styles.selectBtn}
          onPress={() => setObraSelecionada("honda")}
        >
          <Ionicons name="business-outline" size={22} color="#fff" style={{ marginBottom: 4 }} />
          <Text style={styles.selectBtnText}>Almoxarifado Honda</Text>
        </ButtonEffect>
      </View>
    );
  }

  /* =================== CARD DE MOVIMENTAÇÃO =================== */
  const renderMov = ({ item }) => {
    const status = getStatus(item);
    const cor = getColor(status);

    return (
      <View style={[styles.card, { borderLeftColor: cor }]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.nome}>{item.ferramenta}</Text>

          <Text style={styles.meta}>Patrimônio: {item.patrimonio}</Text>
          <Text style={styles.meta}>Colaborador: {item.colaborador}</Text>

          {/* 🔥 DATA DA RETIRADA MOSTRADA AQUI */}
          <Text style={styles.meta}>
            Retirada: {formatarData(item.data_retirada)}
          </Text>

          {item.data_prevista && (
            <Text style={styles.meta}>
              Prevista: {formatarData(item.data_prevista)}
            </Text>
          )}

          {item.data_devolucao && (
            <Text style={styles.meta}>
              Devolução: {formatarData(item.data_devolucao)}
            </Text>
          )}

          <Text style={[styles.meta, { color: cor, fontWeight: "bold" }]}>
            Status: {status}
          </Text>
        </View>

        {(() => {
          // Imagem removida conforme solicitado
          // ...nada será exibido aqui...
        })()}

        {!item.data_devolucao && !readOnly && (
          <ButtonEffect
            onPress={() => registrarDevolucao(item)}
            style={styles.btnDevolver}
          >
            <Ionicons name="checkmark-circle" size={26} color="#fff" />
          </ButtonEffect>
        )}
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {/* 🔥 ABAS */}
      <View style={styles.tabs}>
        <ButtonEffect
          style={[styles.tab, aba === "ativos" && styles.tabActive]}
          onPress={() => setAba("ativos")}
        >
          <Text style={styles.tabText}>Retiradas</Text>
        </ButtonEffect>

        <ButtonEffect
          style={[styles.tab, aba === "historico" && styles.tabActive]}
          onPress={() => setAba("historico")}
        >
          <Text style={styles.tabText}>Histórico</Text>
        </ButtonEffect>
      </View>

      <FlatList
        data={aba === "ativos" ? movsAtivos : movsHistorico}
        renderItem={renderMov}
        keyExtractor={(i) => i.id.toString()}
        contentContainerStyle={{ paddingBottom: 120 }}
      />

      {!readOnly && (
        <ButtonEffect style={styles.fab} onPress={() => setModal(true)}>
          <Ionicons name="add" size={30} color="#fff" />
        </ButtonEffect>
      )}

      {/* ================= MODAL ================= */}
      <Modal visible={modal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Registrar Retirada</Text>

            <TextInput
              style={styles.input}
              placeholder="Colaborador"
              value={colaborador}
              onChangeText={setColaborador}
            />

            <TextInput
              style={styles.input}
              placeholder="Buscar ferramenta..."
              value={searchFerramenta}
              onChangeText={setSearchFerramenta}
            />

            <FlatList
              data={ferramentas.filter((f) =>
                `${f.nome} ${f.patrimonio}`
                  .toLowerCase()
                  .includes(searchFerramenta.toLowerCase())
              )}
              keyExtractor={(i) => i.id.toString()}
              style={{ maxHeight: 180 }}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <ButtonEffect
                  style={[
                    styles.selectItem,
                    ferramentaSel?.id === item.id && {
                      backgroundColor: "#dbe9ff",
                      borderColor: "#0b5394",
                      borderWidth: 1,
                    },
                  ]}
                  onPress={() => {
                    setFerramentaSel(item);
                    setSearchFerramenta(`${item.nome} - ${item.patrimonio}`);
                  }}
                >
                  <Text>
                    {item.nome} – {item.patrimonio}
                  </Text>
                </ButtonEffect>
              )}
            />

            <TextInput
              style={styles.input}
              placeholder="Data prevista (opcional)"
              value={dataPrevista}
              onChangeText={setDataPrevista}
            />

            <View style={styles.modalActions}>
              <ButtonEffect
                style={[styles.modalBtn, { backgroundColor: "#ccc" }]}
                onPress={() => setModal(false)}
              >
                <Text>Cancelar</Text>
              </ButtonEffect>

              <ButtonEffect
                style={[styles.modalBtn, { backgroundColor: "#0b5394" }]}
                onPress={registrarRetirada}
              >
                <Text style={{ color: "#fff" }}>Salvar</Text>
              </ButtonEffect>

            </View>
          </View>

        </View>
      </Modal>
    </View>
  );
}
