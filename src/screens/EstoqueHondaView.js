// src/screens/EstoqueHondaView.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { Ionicons } from "@expo/vector-icons";

const Tab = createMaterialTopTabNavigator();

/* -------------------------
   CategoriaTab (com AsyncStorage)
------------------------- */
function CategoriaTab({ categoriaKey, titulo }) {
  const storageKey = `@honda_${categoriaKey}`;
  const [itens, setItens] = useState([]);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    carregar();
  }, []);

  const carregar = async () => {
    try {
      const raw = await AsyncStorage.getItem(storageKey);
      if (raw) setItens(JSON.parse(raw));
    } catch (e) {
      console.log("Erro carregar estoque", e);
    }
  };

  const getEstoqueColor = (it) => {
    if (it.quantidade <= it.minimo) return "#ff4d4d";
    if (it.quantidade <= it.minimo * 2) return "#fbc531";
    return "#4cd137";
  };

  const itensFiltrados = itens.filter((it) =>
    it.nome.toLowerCase().includes(busca.toLowerCase())
  );

  const renderItem = ({ item }) => {
    const cor = getEstoqueColor(item);
    const criado = item.criadoEm ? new Date(item.criadoEm).toLocaleString() : "-";
    return (
      <View style={[styles.card, item.quantidade <= item.minimo && styles.cardLow]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.itemName}>{item.nome}</Text>
          <Text style={styles.meta}>
            Qtd: <Text style={{ color: cor, fontWeight: "700" }}>{item.quantidade}</Text> • Mínimo: {item.minimo}
          </Text>
          <Text style={styles.meta}>Criado: {criado}</Text>
          {item.quantidade <= item.minimo && <Text style={styles.warning}>⚠ Abaixo do mínimo</Text>}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.tabWrap}>
      <View style={styles.topRow}>
        <Text style={styles.tabTitle}>{titulo}</Text>
        <View style={styles.searchRow}>
          <Ionicons name="search" size={18} color="#666" />
          <TextInput
            placeholder="Buscar item..."
            placeholderTextColor="#999"
            value={busca}
            onChangeText={setBusca}
            style={styles.searchInput}
          />
        </View>
      </View>

      {itensFiltrados.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>
            {busca ? "Nenhum item encontrado." : "Nenhum item cadastrado ainda."}
          </Text>
        </View>
      ) : (
        <FlatList
          data={itensFiltrados}
          keyExtractor={(i) => i.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 120 }}
        />
      )}
    </View>
  );
}

/* -------------------------
   Tela principal
------------------------- */
export default function EstoqueHondaView() {
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <Ionicons name="business" size={22} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.headerTitle}>Almoxarifado Honda (Visualização)</Text>
      </View>

      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: "#fff",
          tabBarStyle: { backgroundColor: "#0b5394" },
          tabBarIndicatorStyle: { backgroundColor: "#fff" },
          tabBarLabelStyle: { fontSize: 13, fontWeight: "700" },
          swipeEnabled: true,
        }}
      >
        <Tab.Screen 
          name="Elétrica"
          options={{
            tabBarIcon: ({ color }) => (
              <Ionicons name="flash" size={20} color={color} />
            ),
          }}
        >
          {() => <CategoriaTab categoriaKey="eletrica" titulo="Honda - Elétrica" />}
        </Tab.Screen>
        <Tab.Screen 
          name="Mecânica"
          options={{
            tabBarIcon: ({ color }) => (
              <Ionicons name="cog" size={20} color={color} />
            ),
          }}
        >
          {() => <CategoriaTab categoriaKey="mecanica" titulo="Honda - Mecânica" />}
        </Tab.Screen>
        <Tab.Screen 
          name="Pintura"
          options={{
            tabBarIcon: ({ color }) => (
              <Ionicons name="color-palette" size={20} color={color} />
            ),
          }}
        >
          {() => <CategoriaTab categoriaKey="pintura" titulo="Honda - Pintura" />}
        </Tab.Screen>
        <Tab.Screen 
          name="Porcas e Arruelas"
          options={{
            tabBarIcon: ({ color }) => (
              <Ionicons name="hardware-chip" size={20} color={color} />
            ),
          }}
        >
          {() => (
            <CategoriaTab
              categoriaKey="porcas_arruelas"
              titulo="Honda - Porcas, Arruelas e Parafusos"
            />
          )}
        </Tab.Screen>
        <Tab.Screen 
          name="Outros"
          options={{
            tabBarIcon: ({ color }) => (
              <Ionicons name="apps" size={20} color={color} />
            ),
          }}
        >
          {() => <CategoriaTab categoriaKey="outros" titulo="Honda - Outros" />}
        </Tab.Screen>
      </Tab.Navigator>
    </View>
  );
}

/* -------------------------
   Estilos
------------------------- */
const styles = StyleSheet.create({
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
  tabWrap: { flex: 1, backgroundColor: "#f5f7fb", padding: 12 },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  tabTitle: { fontSize: 16, fontWeight: "700", color: "#0b5394" },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e6eaf5",
  },
  searchInput: { marginLeft: 8, minWidth: 160, height: 40, color: "#333" },
  emptyWrap: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { color: "#777" },
  card: {
    flexDirection: "row",
    padding: 14,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 10,
    elevation: 3,
    alignItems: "center",
  },
  cardLow: { borderWidth: 1.5, borderColor: "#ff4d4d", backgroundColor: "#fff4f4" },
  itemName: { fontSize: 16, fontWeight: "700", color: "#222", marginBottom: 6 },
  meta: { color: "#666", fontSize: 13 },
  warning: { color: "#ff4d4d", marginTop: 6, fontWeight: "700" },
});