import React, { useEffect, useState, useCallback } from "react";
import { useNavigation } from "@react-navigation/native";
import {
  View,
  Text,
  FlatList,
  Modal,
  TextInput,
  Alert,
  Image,
  TouchableOpacity,
} from "react-native";
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import ButtonEffect from "../components/ui/ButtonEffect";
import { VoltarDashboardBtn } from "../components/ui/VoltarDashboardBtn";
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


// =========================
//   ABA DE CATEGORIA
// =========================
function CategoriaTab({ categoriaKey, obra, podeEditar }) {
    // ...imagem removida...
  const [itens, setItens] = useState([]);
  const [busca, setBusca] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [nome, setNome] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [minimo, setMinimo] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const [modalExcluir, setModalExcluir] = useState({ visivel: false, item: null, carregando: false });
  // const [foto, setFoto] = useState(null); // imagem removida

  // Carregar do Supabase (só por obra)
  const carregar = async () => {
    const { data, error } = await supabase
      .from("estoque_itens")
      .select("*")
      .eq("obra", obra)
      .order("nome");

    if (error) {
      Alert.alert("Erro ao carregar itens", error.message);
      return;
    }

    const listaObra = data || [];

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

    setItens(porCategoria);
  };

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [obra, categoriaKey])
  );


  // Função para abrir modal de edição
  function abrirModalEditar(item) {
    setEditingItem(item);
    setNome(item.nome);
    setQuantidade(String(item.quantidade));
    setMinimo(String(item.minimo));
    setModalVisible(true);
  }

  // Função para confirmar salvar (edição ou novo)
 async function confirmarSalvar() {
  try {
    console.log('Início confirmarSalvar');
    if (!nome.trim() || !quantidade.trim() || !minimo.trim()) {
      Alert.alert("Preencha todos os campos!");
      return;
    }

    // Imagem removida: não há mais upload nem campo foto_url

    const payload = {
      nome: nome.trim(),
      quantidade: Number(quantidade),
      minimo: Number(minimo),
      categoria: categoriaKey,
      obra,
    };
    console.log('Payload pronto', payload);

    let result;
    if (editingItem) {
      result = await supabase
        .from("estoque_itens")
        .update(payload)
        .eq("id", editingItem.id);
    } else {
      result = await supabase.from("estoque_itens").insert([payload]);
    }
    console.log('Resultado do insert/update', result);

    if (result.error) {
      Alert.alert("Erro ao salvar", result.error.message);
      return;
    }

    setModalVisible(false);
    setEditingItem(null);
    setNome("");
    setQuantidade("");
    setMinimo("");
    carregar();
  } catch (err) {
    console.log('Erro inesperado em confirmarSalvar', err);
    Alert.alert('Erro inesperado ao salvar', err?.message || String(err));
  }
}

  // Função para abrir modal de novo item
  function abrirModalNovo() {
    setEditingItem(null);
    setNome("");
    setQuantidade("");
    setMinimo("");
    setModalVisible(true);
  }

  // Função para excluir item
  async function confirmarExcluir() {
    if (!modalExcluir.item) return;
    setModalExcluir({ ...modalExcluir, carregando: true });
    const { error } = await supabase
      .from('estoque_itens')
      .delete()
      .eq('id', modalExcluir.item.id);
    if (error) {
      Alert.alert('Erro ao excluir', error.message);
      setModalExcluir({ visivel: false, item: null, carregando: false });
      return;
    }
    setModalExcluir({ visivel: false, item: null, carregando: false });
    carregar();
  }

  // Exibir lista de itens
  return (
    <View style={{ flex: 1, backgroundColor: '#f6f8fa' }}>
      {podeEditar && (
        <ButtonEffect
          style={{
            margin: 16,
            marginBottom: 0,
            backgroundColor: '#2563eb',
            borderRadius: 10,
            flexDirection: 'row',
            alignItems: 'center',
            alignSelf: 'flex-end',
            paddingVertical: 8,
            paddingHorizontal: 16,
            gap: 6,
          }}
          onPress={abrirModalNovo}
        >
          <Ionicons name="add-circle-outline" size={22} color="#fff" />
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Adicionar</Text>
        </ButtonEffect>
      )}
      <FlatList
        data={itens}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 32, color: '#888', fontSize: 18, fontWeight: '600', fontFamily: 'System' }}>Nenhum item encontrado.</Text>}
        renderItem={({ item }) => {
          const estoqueBaixo = item.quantidade <= item.minimo;
          return (
            <View
              style={{
                backgroundColor: estoqueBaixo ? '#fff7ed' : '#fff',
                borderWidth: estoqueBaixo ? 2 : 0,
                borderColor: estoqueBaixo ? '#f87171' : 'transparent',
                marginHorizontal: 16,
                marginVertical: 7,
                borderRadius: 14,
                padding: 18,
                elevation: 2,
                shadowColor: '#000',
                shadowOpacity: 0.07,
                shadowRadius: 6,
                shadowOffset: { width: 0, height: 2 },
                flexDirection: 'row',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: 12,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: 'bold', fontSize: 19, color: '#0b5394', marginBottom: 2, fontFamily: 'System' }}>{item.nome}</Text>
                <Text style={{ color: estoqueBaixo ? '#b91c1c' : '#334155', fontSize: 16, fontWeight: '700', fontFamily: 'System' }}>
                  Qtd: <Text style={{ color: estoqueBaixo ? '#b91c1c' : '#0b5394', fontWeight: 'bold' }}>{item.quantidade}</Text>
                  {'  '}|{'  '}Mín: <Text style={{ color: '#eab308', fontWeight: 'bold' }}>{item.minimo}</Text>
                  {estoqueBaixo && (
                    <Text style={{ color: '#b91c1c', fontWeight: 'bold', fontSize: 15 }}>  •  ESTOQUE BAIXO!</Text>
                  )}
                </Text>
                <Text style={{ color: '#64748b', fontSize: 14, marginTop: 2, fontWeight: '500', fontFamily: 'System' }}>Categoria: {item.categoria || '-'}</Text>
              </View>
              {podeEditar && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingLeft: 8 }}>
                  <ButtonEffect
                    style={{ padding: 7, borderRadius: 10, backgroundColor: '#e0e7ef' }}
                    onPress={() => abrirModalEditar(item)}
                    accessibilityLabel="Editar"
                  >
                    <Ionicons name="create-outline" size={20} color="#0b5394" />
                  </ButtonEffect>
                  <ButtonEffect
                    style={{ padding: 7, borderRadius: 10, backgroundColor: '#fee2e2' }}
                    onPress={() => setModalExcluir({ visivel: true, item, carregando: false })}
                    accessibilityLabel="Excluir"
                  >
                    <Ionicons name="trash-outline" size={20} color="#b91c1c" />
                  </ButtonEffect>
                </View>
              )}
            </View>
          );
        }}
      />

      {/* Modal de Adicionar/Editar */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.18)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 24, width: '88%' }}>
            <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 16, color: '#0b5394' }}>{editingItem ? 'Editar Item' : 'Novo Item'}</Text>
            <TextInput
              placeholder="Nome do item"
              value={nome}
              onChangeText={setNome}
              style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 10, marginBottom: 12, fontSize: 16 }}
            />
            <TextInput
              placeholder="Quantidade"
              value={quantidade}
              onChangeText={setQuantidade}
              keyboardType="numeric"
              style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 10, marginBottom: 12, fontSize: 16 }}
            />
            <TextInput
              placeholder="Mínimo"
              value={minimo}
              onChangeText={setMinimo}
              keyboardType="numeric"
              style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 10, marginBottom: 18, fontSize: 16 }}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12 }}>
              <ButtonEffect
                style={{ backgroundColor: '#e5e7eb', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 18 }}
                onPress={() => setModalVisible(false)}
              >
                <Text style={{ color: '#222', fontWeight: 'bold' }}>Cancelar</Text>
              </ButtonEffect>
              <ButtonEffect
                style={{ backgroundColor: '#2563eb', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 18 }}
                onPress={confirmarSalvar}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>{editingItem ? 'Salvar' : 'Adicionar'}</Text>
              </ButtonEffect>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Exclusão */}
      <Modal
        visible={modalExcluir.visivel}
        animationType="fade"
        transparent
        onRequestClose={() => setModalExcluir({ visivel: false, item: null, carregando: false })}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.18)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 24, width: '85%' }}>
            <Text style={{ fontWeight: 'bold', fontSize: 17, marginBottom: 18, color: '#b91c1c' }}>Confirmar exclusão?</Text>
            <Text style={{ fontSize: 16, marginBottom: 18 }}>Tem certeza que deseja excluir o item <Text style={{ fontWeight: 'bold' }}>{modalExcluir.item?.nome}</Text>?</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12 }}>
              <ButtonEffect
                style={{ backgroundColor: '#e5e7eb', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 18 }}
                onPress={() => setModalExcluir({ visivel: false, item: null, carregando: false })}
                disabled={modalExcluir.carregando}
              >
                <Text style={{ color: '#222', fontWeight: 'bold' }}>Cancelar</Text>
              </ButtonEffect>
              <ButtonEffect
                style={{ backgroundColor: '#b91c1c', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 18 }}
                onPress={confirmarExcluir}
                disabled={modalExcluir.carregando}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>{modalExcluir.carregando ? 'Excluindo...' : 'Excluir'}</Text>
              </ButtonEffect>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* =========================
   ✅ TELA PRINCIPAL
========================= */
export default function EstoqueScreen() {
  const [podeEditar, setPodeEditar] = useState(false);
  const [obraSelecionada, setObraSelecionada] = useState(null);
  const navigation = useNavigation();

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
          <Text style={styles.selectBtnText}>Masters</Text>
        </ButtonEffect>

        <ButtonEffect
          style={styles.selectBtn}
          onPress={() => setObraSelecionada("honda")}
        >
          <Ionicons name="business-outline" size={22} color="#fff" style={{ marginBottom: 4 }} />
          <Text style={styles.selectBtnText}>Honda</Text>
        </ButtonEffect>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <ButtonEffect onPress={() => setObraSelecionada(null)}>
          <Ionicons name="arrow-back-outline" size={24} color="#fff" />
        </ButtonEffect>

        <Text style={styles.headerTitle}>
          Estoque - {obraSelecionada.toUpperCase()}
        </Text>
      </View>

      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, focused }) => {
            let iconName;
            let iconColor = focused ? '#2563eb' : '#b0b0b0';
            let iconSize = 22;
            if (route.name === 'Elétrica') {
              iconName = 'flash-outline';
            } else if (route.name === 'Mecânica') {
              iconName = 'construct-outline';
            } else if (route.name === 'Pintura') {
              iconName = 'color-palette-outline';
            } else if (route.name === 'Outros') {
              iconName = 'apps-outline';
            }
            return <Ionicons name={iconName} size={iconSize} color={iconColor} style={{ marginBottom: -2 }} />;
          },
          tabBarLabelStyle: {
            fontWeight: 'bold',
            fontSize: 15,
            fontFamily: 'System',
            marginTop: 2,
          },
          tabBarActiveTintColor: '#2563eb',
          tabBarInactiveTintColor: '#b0b0b0',
          tabBarShowIcon: true,
          tabBarIndicatorStyle: {
            backgroundColor: '#2563eb',
            height: 4,
            borderRadius: 2,
          },
          tabBarStyle: {
            backgroundColor: '#fff',
            borderBottomWidth: 0.5,
            borderColor: '#e5e7eb',
            elevation: 0,
          },
        })}
      >
        <Tab.Screen
          name="Elétrica"
          options={{ tabBarLabel: 'Elétrica' }}
        >
          {() => (
            <CategoriaTab
              categoriaKey="eletrica"
              obra={obraSelecionada}
              podeEditar={podeEditar}
            />
          )}
        </Tab.Screen>
        <Tab.Screen
          name="Mecânica"
          options={{ tabBarLabel: 'Mecânica' }}
        >
          {() => (
            <CategoriaTab
              categoriaKey="mecanica"
              obra={obraSelecionada}
              podeEditar={podeEditar}
            />
          )}
        </Tab.Screen>
        <Tab.Screen
          name="Pintura"
          options={{ tabBarLabel: 'Pintura' }}
        >
          {() => (
            <CategoriaTab
              categoriaKey="pintura"
              obra={obraSelecionada}
              podeEditar={podeEditar}
            />
          )}
        </Tab.Screen>
        <Tab.Screen
          name="Outros"
          options={{ tabBarLabel: 'Outros' }}
        >
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
 