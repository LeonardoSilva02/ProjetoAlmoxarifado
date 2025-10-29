import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (username === "adm" && password === "123") {
      navigation.navigate("DashboardADM");
    } else {
      alert("Usuário ou senha incorretos");
    }
  };

  const handleGoogleLogin = () => {
    alert("Login com Google em breve 🚀");
  };

  return (
    <LinearGradient
      colors={["#e3ecff", "#c0d3ff", "#a1c4fd"]}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#e3ecff" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.inner}
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/logo-masters.jpg")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appName}>Sistema de Almoxarifado</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.title}>Acesso Restrito</Text>
          <Text style={styles.subtitle}>Entre com suas credenciais</Text>

          <TextInput
            style={styles.input}
            placeholder="Usuário"
            value={username}
            onChangeText={setUsername}
            placeholderTextColor="#999"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Senha"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor="#999"
          />

          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <LinearGradient
              colors={["#0b5394", "#166ec9"]}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Entrar</Text>
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.orText}>ou</Text>

          {/* Botão de login com Google */}
          <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
            <Ionicons name="logo-google" size={22} color="#DB4437" style={styles.googleIcon} />
            <Text style={styles.googleText}>Entrar com Google</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 25,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 25,
  },
  logo: {
    width: 110,
    height: 65,
    borderRadius: 15,
  },
  appName: {
    fontSize: 16,
    color: "#0b5394",
    fontWeight: "600",
    marginTop: 6,
    letterSpacing: 0.3,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.95)",
    width: "100%",
    maxWidth: 400,
    borderRadius: 25,
    padding: 30,
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#0b5394",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: "#777",
    marginBottom: 25,
  },
  input: {
    width: "100%",
    height: 52,
    backgroundColor: "#f7f9fc",
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#dde3f0",
    color: "#333",
    fontSize: 16,
  },
  button: {
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 10,
  },
  buttonGradient: {
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  orText: {
    color: "#999",
    marginVertical: 18,
    fontSize: 14,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    width: "100%",
    justifyContent: "center",
    elevation: 3,
  },
  googleIcon: {
    marginRight: 8,
  },
  googleText: {
    fontSize: 16,
    color: "#444",
    fontWeight: "500",
  },
});
