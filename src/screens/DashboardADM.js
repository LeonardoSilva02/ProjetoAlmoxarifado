import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function DashboardADM() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Painel Principal</Text>
      <Text style={styles.subtitle}>Bem-vindo ao sistema do Almoxarifado!</Text>
      <Text style={styles.info}>Use o menu lateral para navegar.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#0b5394",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: "#333",
  },
  info: {
    marginTop: 10,
    fontSize: 14,
    color: "#777",
  },
});
