import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
} from "react-native";

export default function EstoqueScreen() {
  const [item, setItem] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [estoqueMinimo, setEstoqueMinimo] = useState("");
  const [itens, setItens] = useState([]);

  const adicionarItem = () => {
    if (!item || !quantidade || !estoqueMinimo) {
      alert("Preencha todos os campos!");
      return;
    }

    const novoItem = {
      id: Date.now().toString(),
      nome: item,
      qtd: parseInt(quantidade),
      minimo: parseInt(estoqueMinimo),
    };
    setItens([...itens, novoItem]);
    setItem("");
    setQuantidade("");
    setEstoqueMinimo("");
  };

  const renderItem = ({ item }) => {
    const alerta = item.qtd <= item.minimo;
    return (
      <View style={[styles.itemCard, alerta && styles.itemCardAlerta]}>
        <Text style={styles.itemNome}>{item.nome}</Text>
        <Text>Quantidade: {item.qtd}</Text>
        <Text>Estoque mínimo: {item.minimo}</Text>
        {alerta && <Text style={styles.alerta}>⚠ Estoque baixo!</Text>}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Controle de Estoque</Text>

      <TextInput
        style={styles.input}
        placeholder="Nome do item"
        value={item}
        onChangeText={setItem}
      />
      <TextInput
        style={styles.input}
        placeholder="Quantidade"
        keyboardType="numeric"
        value={quantidade}
        onChangeText={setQuantidade}
      />
      <TextInput
        style={styles.input}
        placeholder="Estoque mínimo"
        keyboardType="numeric"
        value={estoqueMinimo}
        onChangeText={setEstoqueMinimo}
      />

      <TouchableOpacity style={styles.button} onPress={adicionarItem}>
        <Text style={styles.buttonText}>Adicionar Item</Text>
      </TouchableOpacity>

      <FlatList
        data={itens}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        style={styles.lista}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0b5394",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#0b5394",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  itemCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  itemCardAlerta: {
    borderColor: "#ff4d4d",
    backgroundColor: "#ffeaea",
  },
  itemNome: {
    fontWeight: "bold",
    fontSize: 16,
  },
  alerta: {
    color: "#ff0000",
    fontWeight: "bold",
  },
  lista: {
    marginTop: 10,
  },
});
