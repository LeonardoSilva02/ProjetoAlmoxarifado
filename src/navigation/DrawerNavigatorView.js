// src/navigation/DrawerNavigatorView.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Telas
import DashboardView from '../screens/DashboardView';
import EstoqueScreen from '../screens/EstoqueScreen';
import FerramentasScreen from '../screens/FerramentasScreen';
import EstoqueHondaView from '../screens/EstoqueHondaView';
import FerramentasHondaView from '../screens/FerramentasHondaView';
import RequisicoesScreen from '../screens/RequisicoesScreen';
import RequisicaoForm from '../screens/RequisicaoForm';

const Drawer = createDrawerNavigator();

function CustomDrawerContent(props) {
  const [email, setEmail] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const em = await AsyncStorage.getItem('userEmail');
        if (em) setEmail(em);
      } catch (e) {
        console.log('Erro ao carregar email:', e);
      }
    };
    load();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: '#f8faff' }}>
      <DrawerContentScrollView {...props} contentContainerStyle={{ padding: 0 }}>
        <LinearGradient colors={["#06437a", "#0b5394"]} style={styles.header}>
          <View style={styles.profileCircle}>
            <Ionicons name="person-circle-outline" size={70} color="#fff" />
          </View>
          <Text style={styles.userName}>Visitante</Text>
          <Text style={styles.userEmail}>{email ?? 'Visitante'}</Text>
        </LinearGradient>

        <View style={styles.drawerItems}>
          <DrawerItemList {...props} />
        </View>
      </DrawerContentScrollView>

      {/* Footer fixo fora da área rolável - evita sobreposição em listas longas */}
      <View style={styles.footer}>
        <DrawerItem
          label="Entrar / Login"
          labelStyle={styles.loginLabel}
          style={styles.loginButton}
          icon={({ size }) => <Ionicons name="log-in-outline" color="#0b5394" size={size} />}
          onPress={() => props.navigation.navigate('Login')}
        />
        <Text style={styles.versionText}>Versão 1.0.0</Text>
      </View>
    </View>
  );
}

export default function DrawerNavigatorView() {
  return (
    <Drawer.Navigator
      initialRouteName="DashboardView"
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: '#0b5394' },
        headerTintColor: '#fff',
        headerTitleAlign: 'center',
        drawerType: Platform.OS === 'web' ? 'front' : 'back',
        drawerActiveBackgroundColor: '#0b5394',
        drawerActiveTintColor: '#fff',
        drawerInactiveTintColor: '#444',
          drawerLabelStyle: { 
            fontSize: 13,
            fontWeight: "500",
            marginLeft: 4,
            lineHeight: 16,
          },
          drawerItemStyle: { 
            borderRadius: 8,
            paddingVertical: 8,
            marginHorizontal: 8,
            marginVertical: 2,
            height: 44,
            justifyContent: 'flex-start',
          },
          drawerContentStyle: {
            paddingLeft: 6,
          },
        sceneContainerStyle: { backgroundColor: '#f4f7fc' },
      }}
    >
      <Drawer.Screen
        name="DashboardView"
        component={DashboardView}
        options={{
          title: 'Painel',
          drawerIcon: ({ color }) => <Ionicons name="speedometer-outline" color={color} size={20} />,
        }}
      />

      <Drawer.Screen
        name="EstoqueMasters"
        component={EstoqueScreen}
        initialParams={{ readOnly: true }}
        options={{
          title: 'Estoque Masters',
          drawerIcon: ({ color }) => <Ionicons name="cube-outline" color={color} size={20} />,
        }}
      />

      <Drawer.Screen
        name="FerramentasMasters"
        component={FerramentasScreen}
        initialParams={{ readOnly: true }}
        options={{
          title: 'Ferramentas Masters',
          drawerIcon: ({ color }) => <Ionicons name="construct-outline" color={color} size={20} />,
        }}
      />

      <Drawer.Screen
        name="EstoqueHonda"
        component={EstoqueHondaView}
        options={{
          title: 'Estoque Honda',
          drawerIcon: ({ color }) => <Ionicons name="business-outline" color={color} size={20} />,
        }}
      />

      <Drawer.Screen
        name="FerramentasHonda"
        component={FerramentasHondaView}
        options={{
          title: 'Ferramentas Honda',
          drawerIcon: ({ color }) => <Ionicons name="build-outline" color={color} size={20} />,
        }}
      />

      <Drawer.Screen
        name="Requisicoes"
        component={RequisicoesScreen}
        initialParams={{ isVisitor: true }}
        options={{
          title: 'Requisições',
          // Ocultar do Drawer, mantendo a rota ativa para navegação via cards/botões
          drawerItemStyle: { height: 0 },
        }}
      />

      <Drawer.Screen
        name="RequisicaoForm"
        component={RequisicaoForm}
        options={{ drawerItemStyle: { height: 0 } }}
      />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingVertical: 40,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    elevation: 5,
    marginBottom: 8
  },
  profileCircle: {
    width: 85,
    height: 85,
    borderRadius: 42.5,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
    marginBottom: 12
  },
  userName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4
  },
  userEmail: {
    color: '#e0e0e0',
    fontSize: 12
  },
  drawerContent: {
    flex: 1,
    justifyContent: 'space-between'
  },
  drawerItems: {
    flex: 1,
    paddingTop: 8
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0'
  },
  loginButton: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 12
  },
  loginLabel: {
    color: '#0b5394',
    fontWeight: '700'
  },
  versionText: {
    textAlign: 'center',
    fontSize: 11,
    color: '#999'
  }
});
