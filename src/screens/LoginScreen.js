// src/screens/LoginScreen.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState, useEffect, useRef } from "react";
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
  Animated,
  Easing,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const currentYear = new Date().getFullYear();

  // ✅ Configuração do Google Login
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId:
      "1018177453189-cosma8rk2fo4m6ge2jsdk4g6mcucnkuh.apps.googleusercontent.com",
    iosClientId:
      "1018177453189-cosma8rk2fo4m6ge2jsdk4g6mcucnkuh.apps.googleusercontent.com",
    webClientId:
      "1018177453189-cosma8rk2fo4m6ge2jsdk4g6mcucnkuh.apps.googleusercontent.com",
  });

  // ✅ Quando login via Google for bem-sucedido
  useEffect(() => {
    if (response?.type === "success") {
      const { authentication } = response;
      if (authentication?.accessToken) {
        (async () => {
          await AsyncStorage.setItem("userRole", "viewer");
          await AsyncStorage.setItem("loginType", "google");
          navigation.replace("DashboardView", { readOnly: true });
        })();
      }
    }
  }, [response]);

  // ✅ Login manual
  const handleLogin = async () => {
    if (username === "adm" && password === "123") {
      await AsyncStorage.setItem("userRole", "admin");
      await AsyncStorage.setItem("loginType", "manual");
      navigation.replace("DrawerNavigator");
    } else if (username === "admHonda" && password === "123") {
      await AsyncStorage.setItem("userRole", "admin");
      await AsyncStorage.setItem("loginType", "manual");
      navigation.replace("DrawerNavigatorHonda");
    } else {
      Alert.alert("Erro", "Usuário ou senha incorretos ❌");
    }
  };

  // ✅ Animações
  const fadeLogo = useRef(new Animated.Value(0)).current;
  const fadeContent = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const googleScale = useRef(new Animated.Value(1)).current;
  const gradientAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeLogo, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.timing(fadeContent, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(gradientAnim, {
          toValue: 1,
          duration: 6000,
          easing: Easing.linear,
          useNativeDriver: false,
        }),
        Animated.timing(gradientAnim, {
          toValue: 0,
          duration: 6000,
          easing: Easing.linear,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, []);

  // ✅ Animação dos botões
  const handlePressIn = () => {
    Animated.spring(buttonScale, { toValue: 0.96, useNativeDriver: true }).start();
  };
  const handlePressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      friction: 3,
      tension: 80,
      useNativeDriver: true,
    }).start();
  };

  const handleGooglePressIn = () => {
    Animated.spring(googleScale, { toValue: 0.96, useNativeDriver: true }).start();
  };
  const handleGooglePressOut = () => {
    Animated.spring(googleScale, {
      toValue: 1,
      friction: 3,
      tension: 80,
      useNativeDriver: true,
    }).start();
  };

  const bg1 = gradientAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#0b5394", "#1a73e8"],
  });
  const bg2 = gradientAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#042e5f", "#166ec9"],
  });

  return (
    <Animated.View style={[styles.container, { backgroundColor: bg1 }]}>
      <StatusBar barStyle="light-content" backgroundColor="#0b5394" />
      <Animated.View style={[styles.animatedBackground, { backgroundColor: bg2 }]} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.inner}
      >
        <Animated.View style={[styles.logoContainer, { opacity: fadeLogo }]}>
          <View style={styles.logoWrapper}>
            <Image
              source={require("../../assets/logo-masters.jpg")}
              style={styles.logo}
              resizeMode="contain"
            />
            <View style={styles.logoGlow} />
          </View>
          <Text style={styles.appName}>Sistema de Almoxarifado</Text>
        </Animated.View>

        <Animated.View style={[styles.card, { opacity: fadeContent }]}>
          <Text style={styles.title}>Bem-vindo 👋</Text>
          <Text style={styles.subtitle}>Acesse com suas credenciais</Text>

          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={22} color="#0b5394" />
            <TextInput
              style={styles.input}
              placeholder="Usuário"
              placeholderTextColor="#999"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={22} color="#0b5394" />
            <TextInput
              style={styles.input}
              placeholder="Senha"
              placeholderTextColor="#999"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          {/* 🔹 Botão principal */}
          <Animated.View style={{ transform: [{ scale: buttonScale }], width: "100%" }}>
            <TouchableOpacity
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              onPress={handleLogin}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#1a73e8", "#0b5394"]}
                style={styles.buttonGradient}
              >
                <Ionicons name="log-in-outline" size={20} color="#fff" />
                <Text style={styles.buttonText}>Entrar</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* 🔹 Botão Google */}
          <Animated.View style={{ transform: [{ scale: googleScale }], width: "100%" }}>
            <TouchableOpacity
              onPressIn={handleGooglePressIn}
              onPressOut={handleGooglePressOut}
              style={styles.googleButton}
              onPress={() => promptAsync()}
              disabled={!request}
              activeOpacity={0.8}
            >
              <Image
                source={{
                  uri: "https://developers.google.com/identity/images/g-logo.png",
                }}
                style={styles.googleIcon}
              />
              <Text style={styles.googleText}>Entrar com Google</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>

        <Animated.Text style={[styles.footerText, { opacity: fadeContent }]}>
          © {currentYear} Masters Engenharia
        </Animated.Text>
      </KeyboardAvoidingView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  animatedBackground: { ...StyleSheet.absoluteFillObject, opacity: 0.5 },
  inner: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 25,
  },
  logoContainer: { alignItems: "center", marginBottom: 30 },
  logoWrapper: { position: "relative", alignItems: "center" },
  logo: {
    width: 130,
    height: 80,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#ffffffaa",
    shadowColor: "#fff",
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 6,
  },
  logoGlow: {
    position: "absolute",
    width: 140,
    height: 90,
    borderRadius: 20,
    backgroundColor: "#ffffff20",
  },
  appName: {
    fontSize: 17,
    color: "#fff",
    fontWeight: "600",
    marginTop: 10,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.97)",
    width: "100%",
    maxWidth: 400,
    borderRadius: 25,
    padding: 30,
    alignItems: "center",
    elevation: 10,
  },
  title: { fontSize: 25, fontWeight: "800", color: "#0b5394", marginBottom: 4 },
  subtitle: { fontSize: 14, color: "#777", marginBottom: 25 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    backgroundColor: "#f7f9fc",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#dde3f0",
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  input: { flex: 1, height: 50, color: "#333", fontSize: 16, marginLeft: 8 },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 5,
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold", marginLeft: 8 },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 18,
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  googleIcon: { width: 24, height: 24, marginRight: 10 },
  googleText: { color: "#444", fontSize: 16, fontWeight: "600" },
  footerText: { color: "#dce6f5", fontSize: 12, marginTop: 25 },
});
