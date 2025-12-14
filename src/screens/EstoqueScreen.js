import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { Ionicons } from "@expo/vector-icons";
import { format, isValid } from "date-fns";
import { supabase } from "../services/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import styles from "../styles/estoqueStyle";

const Tab = createMaterialTopTabNavigator();

/* =========================
   NORMALIZADOR
========================= */
function normalizar(texto) {
  if (!texto) return "";
  return texto
    .toString()
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/* =========================
   DATA SEGURA
========================= */
function formatarDataSegura(data) {
  if (!data) return "--";
  const d = new Date(data);
  return isValid(d) ? format(d, "dd/MM/yyyy HH:mm") : "--";
}

/* =========================
   ✅ ABA DE CATEGORIA
========================= */
function CategoriaTab({ categoriaKey, obra, podeEditar }) {
  const [itens, setItens] = useState([]);
  const [busca, setBusca] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [nome, setNome] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [minimo, setMinimo] = useState("");

  /* ✅ CARREGAR DO SUPABASE (SÓ POR OBRA) */
  const carregar = async () => {
    console.log("🔄 Carregando estoque:", { obra, categoriaKey });

    const { data, error } = await supabase
      .from("estoque_itens")
      .select("*")
      .eq("obra", obra) // já filtra pela OBRA no banco
      .order("nome");

    if (error) {
      console.log("❌ ERRO SUPABASE:", error.message);
      Alert.alert("Erro ao carregar itens", error.message);
      return;
    }

    const listaObra = data || [];

    // 🔹 Filtra categoria EM MEMÓRIA
    let porCategoria = [];
    if (categoriaKey === "outros") {
      porCategoria = listaObra.filter(
        (i) =>
          !["eletrica", "mecanica", "pintura"].includes(
            normalizar(i.categoria)
          )
      );
    } else {
      porCategoria = listaObra.filter(
        (i) => normalizar(i.categoria) === normalizar(categoriaKey)
      );
    }

    porCategoria.sort((a, b) =>
      normalizar(a.nome).localeCompare(normalizar(b.nome))
    );

    console.log(
      `✅ Itens carregados para ${obra}/${categoriaKey}:`,
      porCategoria.length
    );

    setItens(porCategoria);
  };

  // Recarrega sempre que entrar na aba ou mudar de obra
  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [obra, categoriaKey])
  );

  /* ✅ SALVAR ITEM NOVO */
  const confirmarSalvar = async () => {
    if (!nome || !quantidade || !minimo) {
      Alert.alert("Erro", "Preencha todos os campos!");
      return;
    }

    const agora = new Date().toISOString();

    const { error } = await supabase.from("estoque_itens").insert([
      {
        nome: nome.trim(),
        quantidade: Number(quantidade),
        minimo: Number(minimo),
        categoria: categoriaKey,
        obra: obra,
        criado_em: agora,
        updated_at: agora,
      },
    ]);

    if (error) {
      Alert.alert("Erro ao salvar", error.message);
      return;
    }

    setModalVisible(false);
    setNome("");
    setQuantidade("");
    setMinimo("");

    // Recarrega a lista incluindo o novo
    carregar();
  };

  /* ✅ ALTERAR QUANTIDADE */
  const alterarQuantidade = async (item, delta) => {
    const novo = Math.max(0, item.quantidade + delta);

    const { error } = await supabase
      .from("estoque_itens")
      .update({
        quantidade: novo,
        updated_at: new Date().toISOString(),
      })
      .eq("id", item.id);

    if (error) {
      Alert.alert("Erro ao atualizar", error.message);
      return;
    }

    // Atualiza localmente
    const novaLista = itens.map((i) =>
      i.id === item.id ? { ...i, quantidade: novo } : i
    );
    setItens(novaLista);
  };

  /* ✅ FILTRO DE BUSCA (NÃO AFETA CARREGAMENTO) */
  const itensFiltrados =
    busca.trim() === ""
      ? itens
      : itens.filter((item) =>
          normalizar(item.nome).includes(normalizar(busca))
        );

  /* ✅ PDF */
/* ✅ PDF */
const gerarPDF = async () => {
  try {
    const { data, error } = await supabase
      .from("estoque_itens")
      .select("*")
      .eq("obra", obra)
      .order("categoria")
      .order("nome");

    if (error) {
      Alert.alert("Erro ao gerar PDF", error.message);
      return;
    }

    if (!data || data.length === 0) {
      Alert.alert("Aviso", "Nenhum item encontrado no estoque.");
      return;
    }

    // 🔹 Agrupar por categoria
    const categorias = {};
    data.forEach((item) => {
      const cat = item.categoria || "outros";
      if (!categorias[cat]) categorias[cat] = [];
      categorias[cat].push(item);
    });

    let html = `
      <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body {
            font-family: Arial;
            padding: 20px;
          }

          h1, h2, h3 {
            text-align: center;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            page-break-inside: auto;
          }

          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }

          th, td {
            border: 1px solid #000;
            padding: 6px;
            font-size: 12px;
          }

          th {
            background: #f1f5f9;
          }

          .alerta {
            background: #fee2e2;
          }

          .categoria {
            page-break-before: always;
          }

          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 11px;
            color: #555;
          }
        </style>
      </head>

      <body>
        <h1>Relatório Geral de Estoque</h1>
        <h3>Almoxarifado: ${obra.toUpperCase()}</h3>
        <p style="text-align:center;">
          Data de geração: ${formatarDataSegura(new Date())}
        </p>
        <hr/>
    `;

    Object.keys(categorias).forEach((cat, index) => {
      html += `
        <div class="${index > 0 ? "categoria" : ""}">
          <h2>Categoria: ${cat.toUpperCase()}</h2>

          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th width="70">Qtd</th>
                <th width="70">Mín</th>
                <th width="140">Atualizado</th>
              </tr>
            </thead>
            <tbody>
      `;

      categorias[cat].forEach((i) => {
        const alerta = i.quantidade < i.minimo ? "alerta" : "";

        html += `
          <tr class="${alerta}">
            <td>${i.nome}</td>
            <td align="center">${i.quantidade}</td>
            <td align="center">${i.minimo}</td>
            <td align="center">${formatarDataSegura(i.updated_at)}</td>
          </tr>
        `;
      });

      html += `
            </tbody>
          </table>
        </div>
      `;
    });

    html += `
        <div class="footer">
          Sistema de Almoxarifado • Relatório automático
        </div>
      </body>
      </html>
    `;

    const file = await Print.printToFileAsync({ html });
    await Sharing.shareAsync(file.uri);

  } catch (err) {
    Alert.alert("Erro", "Falha ao gerar PDF");
    console.log(err);
  }
};


    itensFiltrados.forEach((i) => {
      html += `
        <tr>
          <td>${i.nome}</td>
          <td>${i.quantidade}</td>
          <td>${i.minimo}</td>
          <td>${formatarDataSegura(i.updated_at)}</td>
        </tr>
      `;
    });

    html += `</table></body></html>`;

    const file = await Print.printToFileAsync({ html });
    await Sharing.shareAsync(file.uri);
  };

  return (
    <View style={styles.tabWrap}>
      {/* Busca */}
      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={20} color="#999" />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar item..."
          value={busca}
          onChangeText={setBusca}
        />
      </View>

      {/* Botão PDF */}
      <TouchableOpacity style={styles.modalBtn} onPress={gerarPDF}>
        <Text style={{ color: "#fff", fontWeight: "bold" }}>
          Gerar Relatório em PDF
        </Text>
      </TouchableOpacity>

      {/* Lista de Itens */}
      <FlatList
        data={itensFiltrados}
        keyExtractor={(i) => String(i.id)}
        extraData={itensFiltrados.length}
        renderItem={({ item }) => {
          const alerta = item.quantidade < item.minimo;

          return (
            <View
              style={[
                styles.card,
                alerta && { borderColor: "red", borderWidth: 2 },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>{item.nome}</Text>
                <Text style={styles.meta}>Qtd: {item.quantidade}</Text>
                <Text style={styles.meta}>Mín: {item.minimo}</Text>
                <Text style={styles.update}>
                  Atualizado: {formatarDataSegura(item.updated_at)}
                </Text>
              </View>

              {podeEditar && (
                <View style={styles.cardActions}>
                  <TouchableOpacity onPress={() => alterarQuantidade(item, 1)}>
                    <Ionicons name="add-circle" size={26} color="#0b5394" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => alterarQuantidade(item, -1)}
                  >
                    <Ionicons name="remove-circle" size={26} color="#dc2626" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={{ padding: 20 }}>
            <Text style={{ textAlign: "center", color: "#64748b" }}>
              Nenhum item encontrado para essa categoria/almoxarifado.
            </Text>
          </View>
        }
      />

      {/* FAB + MODAL NOVO ITEM */}
      {podeEditar && (
        <>
          <TouchableOpacity
            style={styles.fab}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="add" size={26} color="#fff" />
          </TouchableOpacity>

          <Modal visible={modalVisible} transparent animationType="slide">
            <View style={styles.modalOverlay}>
              <View style={styles.modalCard}>
                <Text style={styles.modalTitle}>Novo Item</Text>

                <TextInput
                  style={styles.modalInput}
                  placeholder="Nome"
                  value={nome}
                  onChangeText={setNome}
                />
                <TextInput
                  style={styles.modalInput}
                  placeholder="Quantidade"
                  keyboardType="numeric"
                  value={quantidade}
                  onChangeText={setQuantidade}
                />
                <TextInput
                  style={styles.modalInput}
                  placeholder="Mínimo"
                  keyboardType="numeric"
                  value={minimo}
                  onChangeText={setMinimo}
                />

                <TouchableOpacity
                  style={styles.modalBtn}
                  onPress={confirmarSalvar}
                >
                  <Text style={{ color: "#fff", fontWeight: "bold" }}>
                    Salvar
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </>
      )}
    </View>
  );
}

/* =========================
   ✅ TELA PRINCIPAL
========================= */
export default function EstoqueScreen() {
  const [podeEditar, setPodeEditar] = useState(false);
  const [obraSelecionada, setObraSelecionada] = useState(null);

  useEffect(() => {
    const loadRole = async () => {
      const role = await AsyncStorage.getItem("userRole");
      setPodeEditar(role === "admin" || role === "adminHonda");
    };
    loadRole();
  }, []);

  if (!obraSelecionada) {
    return (
      <View style={styles.selectWrap}>
        <Text style={styles.selectTitle}>Selecione o Almoxarifado</Text>

        <TouchableOpacity
          style={styles.selectBtn}
          onPress={() => setObraSelecionada("masters")}
        >
          <Text style={styles.selectBtnText}>Masters</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.selectBtn}
          onPress={() => setObraSelecionada("honda")}
        >
          <Text style={styles.selectBtnText}>Honda</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setObraSelecionada(null)}>
          <Ionicons name="arrow-back-outline" size={24} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Estoque - {obraSelecionada.toUpperCase()}
        </Text>
      </View>

      <Tab.Navigator>
        <Tab.Screen name="Elétrica">
          {() => (
            <CategoriaTab
              categoriaKey="eletrica"
              obra={obraSelecionada}
              podeEditar={podeEditar}
            />
          )}
        </Tab.Screen>

        <Tab.Screen name="Mecânica">
          {() => (
            <CategoriaTab
              categoriaKey="mecanica"
              obra={obraSelecionada}
              podeEditar={podeEditar}
            />
          )}
        </Tab.Screen>

        <Tab.Screen name="Pintura">
          {() => (
            <CategoriaTab
              categoriaKey="pintura"
              obra={obraSelecionada}
              podeEditar={podeEditar}
            />
          )}
        </Tab.Screen>

        <Tab.Screen name="Outros">
          {() => (
            <CategoriaTab
              categoriaKey="outros"
              obra={obraSelecionada}
              podeEditar={podeEditar}
            />
          )}
        </Tab.Screen>
      </Tab.Navigator>
    </View>
  );
}
