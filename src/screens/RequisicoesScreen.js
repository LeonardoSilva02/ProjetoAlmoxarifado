import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Platform,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@requisicoes_data';

export default function RequisicoesScreen({ route, navigation }) {
  const [requisicoes, setRequisicoes] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const isVisitorParam = route?.params?.isVisitor;
  const isVisitor = (isVisitorParam === true) || (userRole === 'viewer');
  const [novaRequisicao, setNovaRequisicao] = useState({
    codigoManual: '',
    data: new Date().toLocaleDateString(),
    solicitante: '',
    setor: '',
    engenheiroResponsavel: '',
    itens: [],
    status: 'Pendente', // Pendente, Em Processo, Concluída
    observacoes: '',
  });
  const [itemTemp, setItemTemp] = useState({
    descricao: '',
    unidade: '',
    quantidade: '',
  });
  const [modalItemVisible, setModalItemVisible] = useState(false);

  useEffect(() => {
    const loadRole = async () => {
      try {
        const role = await AsyncStorage.getItem('userRole');
        setUserRole(role);
      } catch (e) {
        console.log('Erro ao carregar userRole:', e);
      }
    };
    loadRole();
  }, []);

  // filtro de exibição e busca (apenas Pendentes e Concluídas)
  const [filterStatus, setFilterStatus] = useState('pending'); // pending | completed
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    carregarRequisicoes();
  }, []);

  const carregarRequisicoes = async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) setRequisicoes(JSON.parse(data));
    } catch (error) {
      console.error('Erro ao carregar requisições:', error);
    }
  };

  const salvarRequisicoes = async (novaLista) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(novaLista));
      setRequisicoes(novaLista);
    } catch (error) {
      console.error('Erro ao salvar requisições:', error);
    }
  };

  const adicionarItem = () => {
    if (!itemTemp.descricao || !itemTemp.quantidade) {
      Alert.alert('Erro', 'Preencha a descrição e quantidade do item');
      return;
    }

    setNovaRequisicao(prev => ({
      ...prev,
      itens: [...prev.itens, { ...itemTemp, id: Date.now().toString(), received: false }]
    }));
    setItemTemp({ descricao: '', unidade: '', quantidade: '' });
    setModalItemVisible(false);
  };

  const removerItem = (id) => {
    setNovaRequisicao(prev => ({
      ...prev,
      itens: prev.itens.filter(item => item.id !== id)
    }));
  };

  const salvarRequisicao = () => {
    if (!novaRequisicao.codigoManual || !novaRequisicao.solicitante || !novaRequisicao.setor || novaRequisicao.itens.length === 0) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios, incluindo o código da requisição');
      return;
    }

    // Verifica se já existe uma requisição com o mesmo código
    const codigoExistente = requisicoes.find(req => req.codigoManual === novaRequisicao.codigoManual);
    if (codigoExistente) {
      Alert.alert('Erro', 'Já existe uma requisição com este código. Por favor, use um código diferente.');
      return;
    }

    const requisicaoCompleta = {
      ...novaRequisicao,
      id: Date.now().toString(),
      dataRegistro: new Date().toISOString(),
      // garante que itens tenham campo received
      itens: novaRequisicao.itens.map(it => ({ ...it, received: !!it.received })),
    };

    salvarRequisicoes([requisicaoCompleta, ...requisicoes]);
    setModalVisible(false);
    setNovaRequisicao({
      codigoManual: '',
      data: new Date().toLocaleDateString(),
      solicitante: '',
      setor: '',
      engenheiroResponsavel: '',
      itens: [],
      status: 'Pendente',
      observacoes: '',
    });
    Alert.alert('Sucesso', 'Requisição salva com sucesso');
  };

  const atualizarStatus = (id, novoStatus) => {
    const novaLista = requisicoes.map(req => {
      if (req.id === id) {
        return { ...req, status: novoStatus };
      }
      return req;
    });
    salvarRequisicoes(novaLista);
  };

  const toggleItemReceived = (requisicaoId, itemId) => {
    const novaLista = requisicoes.map(req => {
      if (req.id !== requisicaoId) return req;
      return {
        ...req,
        itens: req.itens.map(it => (it.id === itemId ? { ...it, received: !it.received } : it)),
      };
    });
    salvarRequisicoes(novaLista);
  };

  const deletarRequisicao = (id) => {
    console.log('deletarRequisicao called', { userRole, id, localListLen: requisicoes.length });

    // Permissão baseada em userRole salvo (viewer não pode excluir)
    if (userRole === 'viewer') {
      Alert.alert('Sem permissão', 'Usuário visitante não pode excluir requisições.');
      return;
    }

    // Confirmação compatível com Web (Alert com múltiplos botões é ignorado no RN Web)
    if (Platform.OS === 'web') {
      const confirmed = typeof window !== 'undefined' ? window.confirm('Deseja excluir esta requisição?') : true;
      if (!confirmed) return;
      (async () => {
        try {
          const atual = await AsyncStorage.getItem(STORAGE_KEY);
          const listaAtual = atual ? JSON.parse(atual) : requisicoes;
          const novaLista = listaAtual.filter(r => r.id !== id);
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(novaLista));
          setRequisicoes(novaLista);
          Alert.alert('Excluído', 'Requisição excluída com sucesso');
        } catch (e) {
          console.log('Erro ao excluir requisição:', e);
          Alert.alert('Erro', `Não foi possível excluir. Detalhe: ${e?.message ?? String(e)}`);
        }
      })();
      return;
    }

    // Mobile / Desktop nativo: usa Alert com botões
    Alert.alert(
      'Confirmar exclusão',
      'Deseja excluir esta requisição?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: async () => {
          try {
            const atual = await AsyncStorage.getItem(STORAGE_KEY);
            const listaAtual = atual ? JSON.parse(atual) : requisicoes;
            const novaLista = listaAtual.filter(r => r.id !== id);
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(novaLista));
            setRequisicoes(novaLista);
            Alert.alert('Excluído', 'Requisição excluída com sucesso');
          } catch (e) {
            console.log('Erro ao excluir requisição:', e);
            Alert.alert('Erro', `Não foi possível excluir. Detalhe: ${e?.message ?? String(e)}`);
          }
        } }
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={[styles.card, getStatusColor(item.status)]}>
      <View style={styles.cardHeader}>
        <Text style={styles.requisicaoNumero}>Requisição #{item.codigoManual}</Text>
        <Text style={styles.data}>{new Date(item.dataRegistro).toLocaleDateString()}</Text>
      </View>

      <Text style={styles.info}>Solicitante: {item.solicitante}</Text>
      <Text style={styles.info}>Setor: {item.setor}</Text>
      
      <Text style={styles.subtitle}>Itens:</Text>
      {item.itens.map((material, index) => (
        <View key={material.id || index} style={styles.itemRow}>
          <Text style={[styles.itemText, material.received ? styles.itemReceived : null]}>• {material.descricao}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={[styles.itemText, { textAlign: 'right', marginRight: 8 }]}>
              {material.quantidade} {material.unidade}
            </Text>
            {!isVisitor && (
              <TouchableOpacity onPress={() => toggleItemReceived(item.id, material.id)} style={{ padding: 6 }}>
                <Ionicons name={material.received ? 'checkmark-circle' : 'ellipse-outline'} size={20} color={material.received ? '#4cd137' : '#999'} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      ))}

      <View style={styles.statusSection}>
        <Text style={[styles.status, { color: getStatusTextColor(item.status) }]}>
          Status: {item.status}
        </Text>
        {!isVisitor && (
          <View style={styles.statusButtons}>
            <TouchableOpacity
              style={[styles.statusButton, { backgroundColor: '#4cd137' }]}
              onPress={() => atualizarStatus(item.id, 'Concluída')}
            >
              <Ionicons name="checkmark-circle" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.statusButton, { backgroundColor: '#fbc531' }]}
              onPress={() => atualizarStatus(item.id, 'Em Processo')}
            >
              <Ionicons name="time" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {item.observacoes ? (
        <Text style={styles.observacoes}>Obs: {item.observacoes}</Text>
      ) : null}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
        <View style={{ flexDirection: 'row' }}>
          {!isVisitor && (
            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#ff4d4d', minWidth: 48, marginRight: 8 }]}
              onPress={() => deletarRequisicao(item.id)}
            >
              <Ionicons name="trash" size={18} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#0b5394', minWidth: 120 }]}
          onPress={() => navigation.navigate('RequisicaoForm', { item })}
        >
          <Text style={styles.buttonText}>Abrir Formulário</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'Concluída':
        return { borderLeftColor: '#4cd137' };
      case 'Em Processo':
        return { borderLeftColor: '#fbc531' };
      default:
        return { borderLeftColor: '#ff4d4d' };
    }
  };

  const getStatusTextColor = (status) => {
    switch (status) {
      case 'Concluída':
        return '#4cd137';
      case 'Em Processo':
        return '#fbc531';
      default:
        return '#ff4d4d';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image 
            source={require('../../assets/logo-masters.png')} 
            style={styles.headerLogo}
            resizeMode="contain"
          />
          <Text style={styles.headerTitle}>Requisições de Material</Text>
        </View>
        {/* Oculta botão de criar para visitantes */}
        {!isVisitor && (
          <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addButton}>
            <Ionicons name="add" size={22} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filtros e busca */}
      <View style={styles.filtersRow}>
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tabButton, filterStatus === 'pending' ? styles.tabActive : null]}
            onPress={() => setFilterStatus('pending')}
          >
            <Text style={[styles.tabText, filterStatus === 'pending' ? styles.tabTextActive : null]}>Pendentes</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, filterStatus === 'completed' ? styles.tabActive : null]}
            onPress={() => setFilterStatus('completed')}
          >
            <Text style={[styles.tabText, filterStatus === 'completed' ? styles.tabTextActive : null]}>Concluídas</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.searchInput}
          placeholder="Pesquisar por código"
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
        />
      </View>

      <FlatList
        data={requisicoes.filter(r => {
          // filtro por status
          if (filterStatus === 'pending' && r.status === 'Concluída') return false;
          if (filterStatus === 'completed' && r.status !== 'Concluída') return false;
          // filtro por busca (codigoManual)
          if (searchQuery && !String(r.codigoManual).toLowerCase().includes(searchQuery.toLowerCase())) return false;
          return true;
        })}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        style={{ flex: 1 }}
        contentContainerStyle={[styles.list, { paddingBottom: 48 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator
      />

      {/* Modal Nova Requisição */}
  <Modal visible={modalVisible && !isVisitor} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Nova Requisição</Text>

            <TextInput
              style={styles.input}
              placeholder="Código da Requisição"
              value={novaRequisicao.codigoManual}
              onChangeText={(text) => setNovaRequisicao(prev => ({ ...prev, codigoManual: text }))}
            />

            <TextInput
              style={styles.input}
              placeholder="Nome do Solicitante"
              value={novaRequisicao.solicitante}
              onChangeText={(text) => setNovaRequisicao(prev => ({ ...prev, solicitante: text }))}
            />

            <TextInput
              style={styles.input}
              placeholder="Engenheiro Responsável (opcional)"
              value={novaRequisicao.engenheiroResponsavel}
              onChangeText={(text) => setNovaRequisicao(prev => ({ ...prev, engenheiroResponsavel: text }))}
            />

            <TextInput
              style={styles.input}
              placeholder="Setor"
              value={novaRequisicao.setor}
              onChangeText={(text) => setNovaRequisicao(prev => ({ ...prev, setor: text }))}
            />

            <View style={styles.itensHeader}>
              <Text style={styles.subtitle}>Itens da Requisição:</Text>
              <TouchableOpacity 
                style={styles.addItemButton}
                onPress={() => setModalItemVisible(true)}
              >
                <Ionicons name="add-circle" size={24} color="#0b5394" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={novaRequisicao.itens}
              renderItem={({ item }) => (
                <View style={styles.itemRow}>
                  <Text style={styles.itemText}>
                    {item.descricao} - {item.quantidade} {item.unidade}
                  </Text>
                  <TouchableOpacity onPress={() => removerItem(item.id)}>
                    <Ionicons name="close-circle" size={20} color="#ff4d4d" />
                  </TouchableOpacity>
                </View>
              )}
              keyExtractor={(item) => item.id}
            />

            <TextInput
              style={[styles.input, styles.observacoesInput]}
              placeholder="Observações (opcional)"
              multiline
              numberOfLines={3}
              value={novaRequisicao.observacoes}
              onChangeText={(text) => setNovaRequisicao(prev => ({ ...prev, observacoes: text }))}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={salvarRequisicao}
              >
                <Text style={styles.buttonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Novo Item */}
      <Modal visible={modalItemVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Adicionar Item</Text>

            <TextInput
              style={styles.input}
              placeholder="Descrição do Item"
              value={itemTemp.descricao}
              onChangeText={(text) => setItemTemp(prev => ({ ...prev, descricao: text }))}
            />

            <TextInput
              style={styles.input}
              placeholder="Unidade (ex: pç, m, kg)"
              value={itemTemp.unidade}
              onChangeText={(text) => setItemTemp(prev => ({ ...prev, unidade: text }))}
            />

            <TextInput
              style={styles.input}
              placeholder="Quantidade"
              keyboardType="numeric"
              value={itemTemp.quantidade}
              onChangeText={(text) => setItemTemp(prev => ({ ...prev, quantidade: text }))}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setModalItemVisible(false)}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={adicionarItem}
              >
                <Text style={styles.buttonText}>Adicionar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fb',
    // Garante altura suficiente para rolagem no web
    minHeight: Platform.OS === 'web' ? '100vh' : undefined,
  },
  header: {
    backgroundColor: '#0b5394',
    paddingTop: Platform.OS === 'ios' ? 50 : 25,
    paddingBottom: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerLogo: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  addButton: {
    padding: 8,
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 5,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  requisicaoNumero: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0b5394',
  },
  data: {
    color: '#666',
  },
  info: {
    fontSize: 14,
    color: '#444',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0b5394',
    marginTop: 8,
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  itemText: {
    color: '#444',
    flex: 1,
  },
  statusSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  status: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusButtons: {
    flexDirection: 'row',
  },
  statusButton: {
    padding: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  observacoes: {
    marginTop: 8,
    color: '#666',
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0b5394',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  observacoesInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  itensHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addItemButton: {
    padding: 4,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  button: {
    padding: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: '#6c757d',
  },
  saveButton: {
    backgroundColor: '#0b5394',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  filtersRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tabs: { flexDirection: 'row' },
  tabButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: '#f1f5f9',
  },
  tabActive: {
    backgroundColor: '#0b5394',
  },
  tabText: {
    color: '#0b5394',
    fontWeight: '700',
  },
  tabTextActive: {
    color: '#fff',
  },
  searchInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    width: 180,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
});