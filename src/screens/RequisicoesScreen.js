import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Platform,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { listarRequisicoes, criarRequisicao, deletarRequisicao, editarRequisicao, toggleItemAtendido, healthCheck as health } from '../services/firebase-api';
import logger from '../utils/logger';
import { parseApiError } from '../utils/errorUtils';
import ErrorBanner from '../components/feedback/ErrorBanner';
import { useErrorContext } from '../context/ErrorContext';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import StatusBadge from '../components/ui/StatusBadge';
import { useToast } from '../components/ui/Toast';

export default function RequisicoesScreen({ route, navigation }) {
  const { pushError, markBackendOffline, markBackendOnline } = useErrorContext();
  const { showToast } = useToast();
  const [requisicoes, setRequisicoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
    centroCusto: '01044',
    cliente: '',
    aplicacaoServico: '',
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
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [requisicaoEditando, setRequisicaoEditando] = useState(null);

  useEffect(() => {
    const loadRole = async () => {
      try {
        const role = await AsyncStorage.getItem('userRole');
        setUserRole(role);
  } catch (_e) {
    logger.error('Erro ao carregar userRole:', _e);
      }
    };
    loadRole();
  }, []); // dependências intencionais omitidas para evitar múltiplas tentativas sobrepostas

  // filtro de exibição e busca (apenas Pendentes e Concluídas)
  const [filterStatus, setFilterStatus] = useState('pending'); // pending | completed
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Aguarda backend responder ao /api/health antes de buscar lista
    const ensureBackendReady = async (tentativa = 1, max = 8) => {
      try {
        const h = await health(() => markBackendOffline());
        if (h?.status === 'UP') {
          markBackendOnline();
          showToast('Backend disponível', 'success', 1500);
          carregarRequisicoes();
          return;
        }
        throw new Error('Health sem status UP');
      } catch (_e) {
        if (tentativa < max) {
          const delay = Math.min(400 * Math.pow(1.5, tentativa - 1), 3000);
          if (tentativa === 1) {
            showToast('Aguardando backend iniciar...', 'info', delay);
          } else {
            showToast(`Tentativa backend (${tentativa}/${max})...`, 'warning', delay);
          }
          setTimeout(() => ensureBackendReady(tentativa + 1, max), delay);
        } else {
          showToast('Backend não respondeu. Dados offline serão usados.', 'error', 6000);
          carregarRequisicoes(); // Vai tentar normalmente (com retries internos) e cair no cache
        }
      }
    };
    ensureBackendReady();
  }, []);

  const carregarRequisicoes = async () => {
    logger.debug('[carregarRequisicoes] Carregando requisições Firestore');
    setLoading(true);
    try {
      const lista = await listarRequisicoes();
      // Garante id nos itens (Firebase não armazena id por item no array)
      const listaMapeada = lista.map(req => ({
        ...req,
        itens: (req.itens || []).map((item, idx) => ({
          ...item,
          id: item.id || `${req.id}_item_${idx}`,
          received: item.atendido || item.received || false
        }))
      }));
      setRequisicoes(listaMapeada);
      await AsyncStorage.setItem('@requisicoes_data', JSON.stringify(listaMapeada));
    } catch (e) {
      logger.error('Erro Firestore listar requisições:', e);
      try {
        const data = await AsyncStorage.getItem('@requisicoes_data');
        if (data) {
          const cached = JSON.parse(data);
          setRequisicoes(cached);
          showToast('Usando cache local (offline)', 'info', 3000);
        }
      } catch {}
    } finally {
      setLoading(false);
    }
  };

  // Função auxiliar para atualizar requisições e sincronizar cache
  const atualizarRequisicoesComCache = async (novasRequisicoes) => {
    setRequisicoes(novasRequisicoes);
    try {
      await AsyncStorage.setItem('@requisicoes_data', JSON.stringify(novasRequisicoes));
    } catch (e) {
      console.error('Erro ao atualizar cache:', e);
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

  const salvarRequisicao = async () => {
    logger.debug('[salvarRequisicao] Iniciando validação...');
    logger.debug('[salvarRequisicao] Dados:', {
      codigoManual: novaRequisicao.codigoManual,
      solicitante: novaRequisicao.solicitante,
      setor: novaRequisicao.setor,
      itensCount: novaRequisicao.itens.length
    });

    // Validação detalhada
    if (!novaRequisicao.codigoManual?.trim()) {
      showToast('Código da Requisição é obrigatório', 'error', 3000);
      return;
    }
    if (!novaRequisicao.solicitante?.trim()) {
      showToast('Nome do Solicitante é obrigatório', 'error', 3000);
      return;
    }
    if (!novaRequisicao.setor?.trim()) {
      showToast('Setor é obrigatório', 'error', 3000);
      return;
    }
    if (novaRequisicao.itens.length === 0) {
      showToast('Adicione pelo menos um item à requisição', 'error', 3000);
      return;
    }

    logger.debug('[salvarRequisicao] Validação OK, chamando API...');
    setSaving(true);
    showToast('Salvando requisição...', 'info', 2000);

    try {
      const criada = await criarRequisicao(novaRequisicao, () => markBackendOffline());
    logger.debug('[salvarRequisicao] Requisição criada:', criada?.id);
      
      await atualizarRequisicoesComCache([criada, ...requisicoes]);
      markBackendOnline();
      setModalVisible(false);
      
      // Limpa formulário
      setNovaRequisicao({
        codigoManual: '',
        data: new Date().toLocaleDateString(),
        solicitante: '',
        setor: '',
        engenheiroResponsavel: '',
        centroCusto: '01044',
        cliente: '',
        aplicacaoServico: '',
        itens: [],
        status: 'Pendente',
        observacoes: '',
      });
      
      showToast('Requisição criada com sucesso!', 'success', 3000);
    } catch (e) {
    logger.error('[salvarRequisicao] Erro completo:', e);
    logger.debug('[salvarRequisicao] Stack:', e.stack);
      pushError('Falha ao criar requisição.');
      
      let mensagemErro = 'Falha ao criar requisição. ';
      if (e.message?.includes('fetch')) {
        mensagemErro += 'Backend não está respondendo. Certifique-se que o servidor está rodando.';
      } else {
        mensagemErro += e?.message || 'Erro desconhecido';
      }
      
      const dica = Platform.OS === 'android' ? '\nDica: se estiver no emulador Android use 10.0.2.2 no .env.' : '';
      showToast(mensagemErro + dica, 'error', 6000);
    } finally {
      setSaving(false);
    }
  };

  const atualizarStatus = async (id, novoStatus) => {
    try {
      const atualizado = await editarRequisicao(id, { status: novoStatus });
      await atualizarRequisicoesComCache(requisicoes.map(r => (r.id === id ? {
        ...r,
        status: atualizado.status
      } : r)));
      showToast(`Status atualizado para ${novoStatus}`, 'success');
    } catch (e) {
      logger.error('Erro Firestore atualizar status:', e);
      showToast('Falha ao atualizar status', 'error');
    }
  };

  const toggleItemReceived = async (requisicaoId, itemIdOrIndex) => {
    try {
      const req = requisicoes.find(r => r.id === requisicaoId);
      if (!req) return;
      const index = req.itens.findIndex(i => i.id === itemIdOrIndex);
      const idx = index >= 0 ? index : (typeof itemIdOrIndex === 'number' ? itemIdOrIndex : -1);
      if (idx < 0) return;
      const atualizado = await toggleItemAtendido(requisicaoId, idx);
      // Recalcula received baseado em atendido
      const normalizado = {
        ...atualizado,
        itens: (atualizado.itens || []).map((it, i) => ({
          ...it,
          id: it.id || `${atualizado.id}_item_${i}`,
          received: it.atendido || false
        }))
      };
      await atualizarRequisicoesComCache(requisicoes.map(r => r.id === requisicaoId ? normalizado : r));
      showToast(normalizado.itens[idx].received ? 'Item marcado como atendido' : 'Item desmarcado', 'success', 1800);
    } catch (e) {
      logger.error('Erro Firestore toggle item:', e);
      showToast('Falha ao atualizar item', 'error');
    }
  };

  const abrirEdicao = (req) => {
    // Garante que a data é carregada corretamente
    const dataFormatada = req.criadoEm 
      ? new Date(req.criadoEm).toLocaleDateString('pt-BR')
      : req.data || new Date().toLocaleDateString('pt-BR');
    
    setRequisicaoEditando({
      ...req,
      data: dataFormatada
    });
    setEditModalVisible(true);
  };

  const salvarEdicao = async () => {
    if (!requisicaoEditando?.id) { setEditModalVisible(false); return; }
    try {
      const atualizado = await editarRequisicaoAPI(requisicaoEditando.id, requisicaoEditando, () => markBackendOffline());
      await atualizarRequisicoesComCache(requisicoes.map(r => (r.id === atualizado.id ? atualizado : r)));
      setEditModalVisible(false);
      showToast('Requisição atualizada', 'success');
      markBackendOnline();
    } catch (e) {
      logger.error('Erro ao editar requisição:', e);
      showToast(parseApiError(e, 'Não foi possível salvar as alterações'), 'error');
      pushError('Falha ao editar requisição.');
    }
  };

  const deletarRequisicao = (id) => {
    logger.debug('deletarRequisicao called', { userRole, id, localListLen: requisicoes.length });

    // Permissão baseada em userRole salvo (viewer não pode excluir)
    if (userRole === 'viewer') {
      showToast('Usuário visitante não pode excluir requisições', 'warning');
      return;
    }

    // Confirmação compatível com Web (Alert com múltiplos botões é ignorado no RN Web)
    if (Platform.OS === 'web') {
      const confirmed = typeof window !== 'undefined' ? window.confirm('Deseja excluir esta requisição?') : true;
      if (!confirmed) return;
      (async () => {
        try {
          await deletarRequisicaoAPI(id, () => markBackendOffline());
          await atualizarRequisicoesComCache(requisicoes.filter(r => r.id !== id));
          showToast('Requisição excluída com sucesso', 'success');
          markBackendOnline();
        } catch (e) {
          logger.error('Erro ao excluir requisição:', e);
          showToast(`Não foi possível excluir: ${e?.message ?? String(e)}`, 'error');
          pushError('Falha ao excluir requisição.');
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
            await deletarRequisicao(id);
            await atualizarRequisicoesComCache(requisicoes.filter(r => r.id !== id));
            showToast('Requisição excluída com sucesso', 'success');
          } catch (e) {
            logger.error('Erro ao excluir requisição:', e);
            showToast(`Não foi possível excluir: ${e?.message ?? String(e)}`, 'error');
            pushError('Falha ao excluir requisição.');
          }
        } }
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={[styles.card, getStatusColor(item.status)]}>
      <View style={styles.cardHeader}>
        <Text style={styles.requisicaoNumero}>Requisição #{item.codigoManual}</Text>
  <Text style={styles.data}>{new Date(item.criadoEm || item.dataRegistro || Date.now()).toLocaleDateString()}</Text>
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
              <TouchableOpacity 
                onPress={() => toggleItemReceived(item.id, material.id)} 
                style={styles.itemCheckButton}
                activeOpacity={0.6}
              >
                <Ionicons 
                  name={material.received ? 'checkmark-circle' : 'ellipse-outline'} 
                  size={22} 
                  color={material.received ? '#4cd137' : '#999'} 
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      ))}

      <View style={styles.statusSection}>
        <StatusBadge status={item.status} />
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
          {userRole === 'adminHonda' && (
            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#17a2b8', minWidth: 48 }]}
              onPress={() => abrirEdicao(item)}
            >
              <Ionicons name="create" size={18} color="#fff" />
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

  // getStatusTextColor removido (não usado) - simplificação para passar lint

  return (
    <View style={styles.container}>
      <ErrorBanner />
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

      {loading ? (
        <LoadingSkeleton count={4} />
      ) : requisicoes.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Nenhuma requisição encontrada</Text>
          <TouchableOpacity
            style={[styles.button, styles.saveButton, { marginTop: 12, flexDirection: 'row', alignItems: 'center' }]}
            onPress={() => carregarRequisicoes(1, 3)}
          >
            <Ionicons name="reload" size={18} color="#fff" style={{ marginRight: 6 }} />
            <Text style={styles.buttonText}>Tentar Novamente</Text>
          </TouchableOpacity>
        </View>
      ) : (
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
          keyExtractor={(item) => String(item.id ?? item.codigoManual)}
          style={{ flex: 1 }}
          contentContainerStyle={[styles.list, { paddingBottom: 48 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator
          removeClippedSubviews={Platform.OS !== 'web'}
          initialNumToRender={10}
          windowSize={7}
        />
      )}

      {/* Modal Nova Requisição */}
      <Modal visible={modalVisible && !isVisitor} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {/* Cabeçalho com botão voltar */}
            <View style={styles.modalHeader}>
              <TouchableOpacity 
                onPress={() => {
                  logger.debug('[RequisicoesScreen] Fechando modal via X');
                  setModalVisible(false);
                }}
                style={styles.backButton}
              >
                <Ionicons name="arrow-back" size={24} color="#0b5394" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Nova Requisição</Text>
              <View style={{ width: 24 }} />
            </View>

            <ScrollView 
              style={{ flex: 1 }} 
              contentContainerStyle={{ paddingBottom: 20 }}
              showsVerticalScrollIndicator
              keyboardShouldPersistTaps="handled"
            >
              <TextInput
                style={styles.input}
                placeholder="Código da Requisição"
                value={novaRequisicao.codigoManual}
                onChangeText={(text) => setNovaRequisicao(prev => ({ ...prev, codigoManual: text }))}
              />

              <TextInput
                style={styles.input}
                placeholder="Data (DD/MM/AAAA)"
                value={novaRequisicao.data}
                onChangeText={(text) => setNovaRequisicao(prev => ({ ...prev, data: text }))}
              />

              <TextInput
                style={styles.input}
                placeholder="Nome do Solicitante"
                value={novaRequisicao.solicitante}
                onChangeText={(text) => setNovaRequisicao(prev => ({ ...prev, solicitante: text }))}
              />

              <TextInput
                style={styles.input}
                placeholder="Centro de Custo (ex: 01044)"
                value={novaRequisicao.centroCusto}
                onChangeText={(text) => setNovaRequisicao(prev => ({ ...prev, centroCusto: text }))}
              />

              <TextInput
                style={styles.input}
                placeholder="Cliente"
                value={novaRequisicao.cliente}
                onChangeText={(text) => setNovaRequisicao(prev => ({ ...prev, cliente: text }))}
              />

              <TextInput
                style={styles.input}
                placeholder="Aplicação do Serviço"
                value={novaRequisicao.aplicacaoServico}
                onChangeText={(text) => setNovaRequisicao(prev => ({ ...prev, aplicacaoServico: text }))}
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
                keyExtractor={(item, index) => String(item.id ?? index)}
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
                scrollEnabled={false}
                removeClippedSubviews={false}
              />

              <TextInput
                style={[styles.input, styles.observacoesInput]}
                placeholder="Observações (opcional)"
                multiline
                numberOfLines={3}
                value={novaRequisicao.observacoes}
                onChangeText={(text) => setNovaRequisicao(prev => ({ ...prev, observacoes: text }))}
              />
            </ScrollView>

            {/* Botões fixos no rodapé */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  logger.debug('[RequisicoesScreen] Fechando modal via Cancelar');
                  setSaving(false);
                  setModalVisible(false);
                }}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.saveButton, saving && styles.buttonDisabled]}
                onPress={salvarRequisicao}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.buttonText}>Salvar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Novo Item */}
      <Modal visible={modalItemVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {/* Cabeçalho com botão voltar */}
            <View style={styles.modalHeader}>
              <TouchableOpacity 
                onPress={() => setModalItemVisible(false)}
                style={styles.backButton}
              >
                <Ionicons name="arrow-back" size={24} color="#0b5394" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Adicionar Item</Text>
              <View style={{ width: 24 }} />
            </View>

            <ScrollView 
              style={{ flex: 1 }} 
              contentContainerStyle={{ paddingBottom: 20 }}
              showsVerticalScrollIndicator
              keyboardShouldPersistTaps="handled"
            >
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
            </ScrollView>

            {/* Botões fixos no rodapé */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  logger.debug('[RequisicoesScreen] Fechando modal Item via Cancelar');
                  setModalItemVisible(false);
                }}
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

      {/* Modal Editar Requisição (adminHonda) */}
      <Modal visible={editModalVisible && userRole === 'adminHonda'} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {/* Cabeçalho com botão voltar */}
            <View style={styles.modalHeader}>
              <TouchableOpacity 
                onPress={() => setEditModalVisible(false)}
                style={styles.backButton}
              >
                <Ionicons name="arrow-back" size={24} color="#0b5394" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Editar Requisição</Text>
              <View style={{ width: 24 }} />
            </View>

            <ScrollView 
              style={{ flex: 1 }} 
              contentContainerStyle={{ paddingBottom: 20 }}
              showsVerticalScrollIndicator
              keyboardShouldPersistTaps="handled"
            >
              <TextInput
                style={styles.input}
                placeholder="Código da Requisição"
                value={requisicaoEditando?.codigoManual ?? ''}
                onChangeText={(text) => setRequisicaoEditando(prev => ({ ...prev, codigoManual: text }))}
              />

              <TextInput
                style={styles.input}
                placeholder="Data (DD/MM/AAAA)"
                value={requisicaoEditando?.data ?? ''}
                onChangeText={(text) => setRequisicaoEditando(prev => ({ ...prev, data: text }))}
              />

              <TextInput
                style={styles.input}
                placeholder="Solicitante"
                value={requisicaoEditando?.solicitante ?? ''}
                onChangeText={(text) => setRequisicaoEditando(prev => ({ ...prev, solicitante: text }))}
              />

              <TextInput
                style={styles.input}
                placeholder="Engenheiro Responsável"
                value={requisicaoEditando?.engenheiroResponsavel ?? ''}
                onChangeText={(text) => setRequisicaoEditando(prev => ({ ...prev, engenheiroResponsavel: text }))}
              />

              <TextInput
                style={styles.input}
                placeholder="Setor"
                value={requisicaoEditando?.setor ?? ''}
                onChangeText={(text) => setRequisicaoEditando(prev => ({ ...prev, setor: text }))}
              />

              <TextInput
                style={styles.input}
                placeholder="Centro de Custo"
                value={requisicaoEditando?.centroCusto ?? ''}
                onChangeText={(text) => setRequisicaoEditando(prev => ({ ...prev, centroCusto: text }))}
              />

              <TextInput
                style={styles.input}
                placeholder="Cliente"
                value={requisicaoEditando?.cliente ?? ''}
                onChangeText={(text) => setRequisicaoEditando(prev => ({ ...prev, cliente: text }))}
              />

              <TextInput
                style={styles.input}
                placeholder="Aplicação do Serviço"
                value={requisicaoEditando?.aplicacaoServico ?? ''}
                onChangeText={(text) => setRequisicaoEditando(prev => ({ ...prev, aplicacaoServico: text }))}
              />

              <TextInput
                style={[styles.input, styles.observacoesInput]}
                placeholder="Observações"
                multiline
                numberOfLines={3}
                value={requisicaoEditando?.observacoes ?? ''}
                onChangeText={(text) => setRequisicaoEditando(prev => ({ ...prev, observacoes: text }))}
              />
            </ScrollView>

            {/* Botões fixos no rodapé */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  logger.debug('[RequisicoesScreen] Fechando modal Edição via Cancelar');
                  setEditModalVisible(false);
                }}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={salvarEdicao}
              >
                <Text style={styles.buttonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Styles extraídos para arquivo dedicado em styles/screens/RequisicoesScreen.styles.js
import styles from '../styles/screens/RequisicoesScreen.styles';