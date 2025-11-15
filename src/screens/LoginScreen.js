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
import { supabase } from "../services/supabase";

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isChecking, setIsChecking] = useState(true);
  const currentYear = new Date().getFullYear();

  // ==========================
  // 🔐 VERIFICAR SESSÃO — AGORA TURBINADO
  // ==========================
  useEffect(() => {
    const verificarSessao = async () => {
      try {
        // MultiGet → MUITO MAIS RÁPIDO QUE getItem
        const session = await AsyncStorage.multiGet(["userRole"]);

        const userRole = session[0][1];

        if (userRole) {
          if (userRole === "admin") {
            navigation.reset({ index: 0, routes: [{ name: "DrawerNavigator" }] });
          } else if (userRole === "adminHonda") {
            navigation.reset({ index: 0, routes: [{ name: "DrawerNavigatorHonda" }] });
          } else {
            navigation.reset({ index: 0, routes: [{ name: "DrawerNavigatorView" }] });
          }
        } else {
          setIsChecking(false);
        }
      } catch (error) {
        console.log("Erro ao verificar sessão:", error);
        setIsChecking(false);
      }
    };

    verificarSessao();
  }, []);

  // ==========================
  // 🚀 LOGIN VIA SUPABASE — OTIMIZADO
  // ==========================
  const handleLogin = async () => {
    try {
      if (!username.trim() || !password.trim()) {
        Alert.alert("Erro", "Preencha todos os campos.");
        return;
      }

      // Agora pegamos somente o necessário → MUITO mais rápido
      const { data, error } = await supabase
        .from("usuarios")
        .select("id, senha_hash, role")
        .eq("email", username.trim())
        .single();

      if (error || !data) {
        Alert.alert("Erro", "Usuário não encontrado ❌");
        return;
      }

      if (password.trim() !== data.senha_hash) {
        Alert.alert("Erro", "Senha incorreta ❌");
        return;
      }

      await AsyncStorage.multiSet([
        ["userRole", data.role],
        ["loginType", "supabase"],
        ["userId", String(data.id)],
      ]);

      if (data.role === "admin") {
        navigation.reset({ index: 0, routes: [{ name: "DrawerNavigator" }] });
      } else if (data.role === "adminHonda") {
        navigation.reset({ index: 0, routes: [{ name: "DrawerNavigatorHonda" }] });
      } else {
        navigation.reset({ index: 0, routes: [{ name: "DrawerNavigatorView" }] });
      }
    } catch (err) {
      console.log("Erro no login:", err);
      Alert.alert("Erro", "Falha no login.");
    }
  };

  // ==========================
  // 🎨 Animações (mantidas)
  // ==========================
  const fadeLogo = useRef(new Animated.Value(0)).current;
  const fadeContent = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const googleScale = useRef(new Animated.Value(1)).current;
  const gradientAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isChecking) {
      Animated.sequence([
        Animated.timing(fadeLogo, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(fadeContent, { toValue: 1, duration: 900, useNativeDriver: true }),
      ]).start();
    }

    Animated.loop(
      Animated.sequence([
        Animated.timing(gradientAnim, {
          toValue: 1,
          duration: 4500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(gradientAnim, {
          toValue: 0,
          duration: 4500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, [isChecking]);

  if (isChecking) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center", backgroundColor: "#0b5394" }]}>
        <StatusBar barStyle="light-content" backgroundColor="#0b5394" />
        <Image
          source={require("../../assets/logo-masters.png")}
          style={[styles.logo, { marginBottom: 20 }]}
          resizeMode="contain"
        />
        <Text style={{ color: "#fff", fontSize: 16, marginBottom: 10 }}>Verificando sessão...</Text>
      </View>
    );
  }

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
        <Animated.View style={[styles.logoContainer, { opacity: fadeLogo }]}>
          <Image
            source={require("../../assets/logo-masters.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appName}>Sistema de Almoxarifado</Text>
        </Animated.View>

        <Animated.View style={[styles.card, { opacity: fadeContent }]}>
          <Text style={styles.title}>Bem-vindo 👋</Text>
          <Text style={styles.subtitle}>Acesse com suas credenciais</Text>

          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={22} color="#0b5394" />
            <TextInput
              style={styles.input}
              placeholder="Email"
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
              onPress={async () => {
                await AsyncStorage.multiSet([
                  ["userRole", "viewer"],
                  ["loginType", "guest"],
                ]);
                navigation.reset({ index: 0, routes: [{ name: "DrawerNavigatorView" }] });
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="eye-outline" size={20} color="#444" style={{ marginRight: 8 }} />
              <Text style={styles.googleText}>Entrar como visitante</Text>
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
  inner: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 25 },
  logoContainer: { alignItems: "center", marginBottom: 30 },
  logo: { width: 140, height: 90, borderRadius: 18 },
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
  googleText: { color: "#444", fontSize: 16, fontWeight: "600" },
  footerText: { color: "#dce6f5", fontSize: 12, marginTop: 25 },
});
