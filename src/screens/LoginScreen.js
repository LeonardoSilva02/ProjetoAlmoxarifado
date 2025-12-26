import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Animated,
  Easing,
  Alert,
} from "react-native";
import ButtonEffect from "../components/ui/ButtonEffect";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../services/supabase";
import styles from "../styles/loginStyles";

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isChecking, setIsChecking] = useState(true);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const verificarSessao = async () => {
      try {
        const session = await AsyncStorage.multiGet(["userRole"]);
        const userRole = session[0][1];

        if (userRole) {
          navigation.reset({
            index: 0,
            routes: [{ name: "DrawerNavigator" }],
          });
        } else setIsChecking(false);
      } catch {
        setIsChecking(false);
      }
    };
    verificarSessao();
  }, []);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert("Erro", "Preencha todos os campos.");
      return;
    }

    const { data, error } = await supabase
      .from("usuarios")
      .select("id, senha_hash, role")
      .eq("email", username.trim())
      .single();

    if (error || !data) return Alert.alert("Erro", "Usuário não encontrado ❌");
    if (password.trim() !== data.senha_hash)
      return Alert.alert("Erro", "Senha incorreta ❌");

    await AsyncStorage.multiSet([
      ["userRole", data.role],
      ["loginType", "supabase"],
      ["userId", String(data.id)],
    ]);

    navigation.reset({ index: 0, routes: [{ name: "DrawerNavigator" }] });
  };

  const fadeLogo = useRef(new Animated.Value(0)).current;
  const fadeContent = useRef(new Animated.Value(0)).current;
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
        Animated.timing(gradientAnim, { toValue: 1, duration: 4500, useNativeDriver: false }),
        Animated.timing(gradientAnim, { toValue: 0, duration: 4500, useNativeDriver: false }),
      ])
    ).start();
  }, [isChecking]);

  if (isChecking) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <Image source={require("../../assets/logo-masters.png")} style={styles.logo} />
        <Text style={{ color: "#fff" }}>Verificando sessão...</Text>
      </View>
    );
  }

  return (
    <Animated.View style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.inner}>
        <Animated.View style={[styles.logoContainer, { opacity: fadeLogo }]}>
          <Image source={require("../../assets/logo-masters.png")} style={styles.logo} />
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
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <View style={styles.buttonArea}>
            <ButtonEffect onPress={handleLogin} style={styles.buttonBase}>
              <LinearGradient colors={["#1a73e8", "#0b5394"]} style={styles.buttonPrimary}>
                <Ionicons name="log-in-outline" size={26} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.buttonText}>Entrar no Sistema</Text>
              </LinearGradient>
            </ButtonEffect>

            <ButtonEffect
              style={[styles.buttonBase, styles.buttonSecondary]}
              onPress={async () => {
                await AsyncStorage.multiSet([
                  ["userRole", "viewer"],
                  ["loginType", "guest"],
                ]);
                navigation.reset({ index: 0, routes: [{ name: "DrawerNavigator" }] });
              }}
            >
              <Ionicons name="eye-outline" size={24} color="#0b5394" style={{ marginRight: 8 }} />
              <Text style={styles.secondaryText}>Entrar como Visitante</Text>
            </ButtonEffect>
          </View>
        </Animated.View>

        <Text style={styles.footerText}>© {currentYear} Masters Engenharia</Text>
      </KeyboardAvoidingView>
    </Animated.View>
  );
}
