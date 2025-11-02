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

  // ✅ Login Google
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: "1018177453189-6uciu7sqlaqkh2reil52ag08moj2avl4.apps.googleusercontent.com",
    webClientId: "1018177453189-cosma8rk2fo4m6ge2jsdk4g6mcucnkuh.apps.googleusercontent.com",
    scopes: ["profile", "email"],
  });

  useEffect(() => {
    const handleGoogleLogin = async () => {
      if (response?.type === "success") {
        const { authentication } = response;

        if (!authentication?.accessToken) {
          Alert.alert("Erro", "Não foi possível obter o token do Google. Tente novamente.");
          return;
        }

        try {
          const res = await fetch("https://www.googleapis.com/userinfo/v2/me", {
            headers: { Authorization: `Bearer ${authentication.accessToken}` },
          });

          const userInfo = await res.json();

          await AsyncStorage.setItem("userRole", "viewer");
          await AsyncStorage.setItem("loginType", "google");
          await AsyncStorage.setItem("userName", userInfo.name || "Usuário Google");

          Alert.alert("Sucesso", `Bem-vindo(a), ${userInfo.name || "usuário"}!`);

          navigation.reset({
            index: 0,
            routes: [{ name: "DrawerNavigatorView" }],
          });
        } catch (error) {
          console.error("Erro ao obter dados do Google:", error);
          Alert.alert("Erro", "Falha ao autenticar com o Google.");
        }
      }
    };

    handleGoogleLogin();
  }, [response]);

  // ✅ Login manual
  const handleLogin = async () => {
    try {
      if (username === "adm" && password === "123") {
        await AsyncStorage.setItem("userRole", "admin");
        await AsyncStorage.setItem("loginType", "manual");
        navigation.reset({
          index: 0,
          routes: [{ name: "DrawerNavigator" }],
        });
      } else if (username === "admHonda" && password === "123") {
        await AsyncStorage.setItem("userRole", "adminHonda");
        await AsyncStorage.setItem("loginType", "manual");
        navigation.reset({
          index: 0,
          routes: [{ name: "DrawerNavigatorHonda" }],
        });
      } else {
        Alert.alert("Erro", "Usuário ou senha incorretos ❌");
      }
    } catch (error) {
      console.log("Erro no login:", error);
    }
  };

  // ✅ Animações
  const fadeLogo = useRef(new Animated.Value(0)).current;
  const fadeContent = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const googleScale = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const gradientAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeLogo, { toValue: 1, duration: 1500, useNativeDriver: true }),
      Animated.timing(fadeContent, { toValue: 1, duration: 1000, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(gradientAnim, {
          toValue: 1,
          duration: 5000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(gradientAnim, {
          toValue: 0,
          duration: 5000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, []);

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.2, 0.6],
  });

  const bg1 = gradientAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#0b5394", "#1a73e8"],
  });
  const bg2 = gradientAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#042e5f", "#155db8"],
  });

  return (
    <Animated.View style={[styles.container, { backgroundColor: bg1 }]}>
      <StatusBar barStyle="light-content" backgroundColor="#0b5394" />
      <Animated.View style={[styles.animatedBackground, { backgroundColor: bg2 }]} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.inner}
      >
        {/* 🔹 Logo */}
        <Animated.View style={[styles.logoContainer, { opacity: fadeLogo }]}>
          <Animated.View style={[styles.glow, { opacity: glowOpacity }]} />
          <Image
            source={require("../../assets/logo-masters.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appName}>Sistema de Almoxarifado</Text>
        </Animated.View>

        {/* 🔹 Card de login */}
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

          {/* 🔹 Botão de login */}
          <Animated.View style={{ transform: [{ scale: buttonScale }], width: "100%" }}>
            <TouchableOpacity
              onPressIn={() =>
                Animated.spring(buttonScale, { toValue: 0.96, useNativeDriver: true }).start()
              }
              onPressOut={() =>
                Animated.spring(buttonScale, {
                  toValue: 1,
                  friction: 3,
                  tension: 80,
                  useNativeDriver: true,
                }).start()
              }
              onPress={handleLogin}
              activeOpacity={0.8}
            >
              <LinearGradient colors={["#1a73e8", "#0b5394"]} style={styles.buttonGradient}>
                <Ionicons name="log-in-outline" size={20} color="#fff" />
                <Text style={styles.buttonText}>Entrar</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* 🔹 Login com Google */}
          <Animated.View style={{ transform: [{ scale: googleScale }], width: "100%" }}>
            <TouchableOpacity
              onPressIn={() =>
                Animated.spring(googleScale, { toValue: 0.96, useNativeDriver: true }).start()
              }
              onPressOut={() =>
                Animated.spring(googleScale, {
                  toValue: 1,
                  friction: 3,
                  tension: 80,
                  useNativeDriver: true,
                }).start()
              }
              style={styles.googleButton}
              onPress={() => promptAsync()}
              disabled={!request}
              activeOpacity={0.8}
            >
              <Image
                source={{ uri: "https://developers.google.com/identity/images/g-logo.png" }}
                style={styles.googleIcon}
              />
              <Text style={styles.googleText}>Entrar com Google</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>

        {/* 🔹 Rodapé */}
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
  inner: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 25 },
  logoContainer: { alignItems: "center", marginBottom: 30, position: "relative" },
  glow: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "#ffffff40",
    shadowColor: "#fff",
    shadowOpacity: 0.8,
    shadowRadius: 25,
    elevation: 12,
  },
  logo: { width: 140, height: 90, borderRadius: 18, zIndex: 2 },
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
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
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
    elevation: 3,
  },
  googleIcon: { width: 24, height: 24, marginRight: 10 },
  googleText: { color: "#444", fontSize: 16, fontWeight: "600" },
  footerText: { color: "#dce6f5", fontSize: 12, marginTop: 25 },
});
