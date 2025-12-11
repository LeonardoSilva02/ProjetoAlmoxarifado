import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
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
import styles from "../styles/loginStyles"; // ✅ STYLE SEPARADO

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isChecking, setIsChecking] = useState(true);
  const currentYear = new Date().getFullYear();

  // ✅ VERIFICAR SESSÃO AUTOMÁTICA
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

  // ✅ LOGIN SUPABASE
  const handleLogin = async () => {
    try {
      if (!username.trim() || !password.trim()) {
        Alert.alert("Erro", "Preencha todos os campos.");
        return;
      }

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

      // ✅ SEMPRE NAVEGA PARA O MESMO DRAWER
      navigation.reset({
        index: 0,
        routes: [{ name: "DrawerNavigator" }],
      });
    } catch (err) {
      console.log("Erro no login:", err);
      Alert.alert("Erro", "Falha no login.");
    }
  };

  // ✅ ANIMAÇÕES
  const fadeLogo = useRef(new Animated.Value(0)).current;
  const fadeContent = useRef(new Animated.Value(0)).current;
  const gradientAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isChecking) {
      Animated.sequence([
        Animated.timing(fadeLogo, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeContent, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
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

  // ✅ TELA DE VERIFICAÇÃO
  if (isChecking) {
    return (
      <View
        style={[
          styles.container,
          {
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#0b5394",
          },
        ]}
      >
        <StatusBar barStyle="light-content" backgroundColor="#0b5394" />
        <Image
          source={require("../../assets/logo-masters.png")}
          style={[styles.logo, { marginBottom: 20 }]}
          resizeMode="contain"
        />
        <Text style={{ color: "#fff", fontSize: 16 }}>
          Verificando sessão...
        </Text>
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
      <Animated.View
        style={[styles.animatedBackground, { backgroundColor: bg2 }]}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.inner}
      >
        <Animated.View style={[styles.logoContainer, { opacity: fadeLogo }]}>
          <Image
            source={require("../../assets/logo-masters.png")}
            style={styles.logo}
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

          <TouchableOpacity onPress={handleLogin}>
            <LinearGradient
              colors={["#1a73e8", "#0b5394"]}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Entrar</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* ✅ VISITANTE */}
          <TouchableOpacity
            style={styles.googleButton}
            onPress={async () => {
              await AsyncStorage.multiSet([
                ["userRole", "viewer"],
                ["loginType", "guest"],
              ]);

              navigation.reset({
                index: 0,
                routes: [{ name: "DrawerNavigator" }],
              });
            }}
          >
            <Text style={styles.googleText}>Entrar como visitante</Text>
          </TouchableOpacity>
        </Animated.View>

        <Text style={styles.footerText}>
          © {currentYear} Masters Engenharia
        </Text>
      </KeyboardAvoidingView>
    </Animated.View>
  );
}
