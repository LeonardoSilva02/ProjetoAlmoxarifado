import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ButtonEffect from "./ButtonEffect";


export function VoltarDashboardBtn({ onPress, style }) {
  return (
    <ButtonEffect
      style={[
        {
          position: "absolute",
          top: 24,
          left: 18,
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "#fff",
          borderRadius: 18,
          paddingVertical: 8,
          paddingHorizontal: 16,
          elevation: 6,
          shadowColor: "#000",
          shadowOpacity: 0.12,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 2 },
          zIndex: 10,
        },
        style,
      ]}
      onPress={onPress}
    >
      <Ionicons name="arrow-back" size={20} color="#0b5394" style={{ marginRight: 6 }} />
      <Text style={{ color: "#0b5394", fontWeight: "bold", fontSize: 15 }}>Voltar ao Menu</Text>
    </ButtonEffect>
  );
}
