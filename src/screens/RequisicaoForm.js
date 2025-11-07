import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function RequisicaoForm({ route, navigation }) {
  const item = route?.params?.item;

  // Preencher linhas vazias até 16
  const linhas = Array.from({ length: 16 }).map((_, i) => item?.itens[i] || { descricao: '', quantidade: '', unidade: '' });

  const handlePrint = () => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.print) window.print();
      return;
    }
    Alert.alert('Imprimir', 'A impressão está disponível no navegador (Web).');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.page}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 6 }}>
          <Ionicons name="arrow-back" size={22} color="#0b5394" />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>Requisição de Material</Text>
        <View style={styles.actions}>
          {Platform.OS === 'web' && (
            <TouchableOpacity onPress={handlePrint} style={styles.actionButton}>
              <Ionicons name="print-outline" size={18} color="#0b5394" />
              <Text style={styles.actionText}>Imprimir</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Header em card */}
      <View style={styles.headerCard}>
        <View style={styles.headerLeft}>
          <Image
            source={require('../../assets/logo-masters.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <View style={styles.headerRight}>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Requisição Nº</Text>
            <Text style={styles.fieldValue}>{item?.codigoManual ?? '—'}</Text>
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Data</Text>
            <Text style={styles.fieldValue}>{item ? new Date(item.dataRegistro).toLocaleDateString() : '—'}</Text>
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Eng. Responsável</Text>
            <Text style={styles.fieldValue}>{item?.engenheiroResponsavel ?? '—'}</Text>
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Solicitante</Text>
            <Text style={styles.fieldValue}>{item?.solicitante ?? '—'}</Text>
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Setor</Text>
            <Text style={styles.fieldValue}>{item?.setor ?? '—'}</Text>
          </View>
        </View>
      </View>

      {/* Tabela de itens */}
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={[styles.cell, styles.cellIndex, styles.headerCell]}>Nº</Text>
          <Text style={[styles.cell, styles.cellDesc, styles.headerCell]}>Descrição</Text>
          <Text style={[styles.cell, styles.cellUnd, styles.headerCell]}>UND</Text>
          <Text style={[styles.cell, styles.cellQtd, styles.headerCell]}>Quantidade</Text>
          <Text style={[styles.cell, styles.cellObs, styles.headerCell]}>Atendido</Text>
        </View>

        {linhas.map((l, idx) => (
          <View
            style={[
              styles.tableRow,
              idx % 2 === 0 ? styles.zebraA : styles.zebraB
            ]}
            key={idx}
          >
            <Text style={[styles.cell, styles.cellIndex]}>{String(idx + 1).padStart(2, '0')}</Text>
            <Text style={[styles.cell, styles.cellDesc, l.received ? styles.receivedRow : null]} numberOfLines={1}>
              {l.descricao}
            </Text>
            <Text style={[styles.cell, styles.cellUnd]}>{l.unidade}</Text>
            <Text style={[styles.cell, styles.cellQtd]}>{l.quantidade}</Text>
            <View style={[styles.cell, styles.cellObs, { alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }]}>
              {l.received ? (
                <Ionicons name="checkmark-circle" size={16} color="#2e7d32" />
              ) : null}
            </View>
          </View>
        ))}
      </View>

      <View style={styles.statusContainer}>
        <Text style={styles.statusLabel}>Status:</Text>
        <View style={[styles.statusBadge, 
          item?.status === 'Aprovada' ? styles.statusApproved :
          item?.status === 'Rejeitada' ? styles.statusRejected :
          styles.statusPending
        ]}>
          <Text style={styles.statusText}>
            {item?.status || 'Pendente'}
          </Text>
        </View>
      </View>

      <View style={styles.observacoesContainer}>
        <Text style={styles.observacoesLabel}>Observações:</Text>
        <View style={styles.observacoesBox}>
          <Text style={styles.observacoesText}>{item?.observacoes || '—'}</Text>
        </View>
      </View>

      <View style={styles.signatureArea}>
        <View style={styles.signatureBox}>
          <Text style={styles.sigLabel}>Engenheiro</Text>
          <View style={styles.sigLine}></View>
          <Text style={styles.sigDate}>{item?.dataAprovacaoEng ? new Date(item.dataAprovacaoEng).toLocaleDateString() : '—'}</Text>
        </View>

        <View style={styles.signatureBox}>
          <Text style={styles.sigLabel}>Aprovação da Diretoria</Text>
          <View style={styles.sigLine}></View>
          <Text style={styles.sigDate}>{item?.dataAprovacaoDir ? new Date(item.dataAprovacaoDir).toLocaleDateString() : '—'}</Text>
        </View>

        <View style={styles.signatureBox}>
          <Text style={styles.sigLabel}>Almoxarife</Text>
          <View style={styles.sigLine}></View>
          <Text style={styles.sigDate}>{item?.dataRecebimento ? new Date(item.dataRecebimento).toLocaleDateString() : '—'}</Text>
        </View>
      </View>

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#f5f7fb' },
  page: { padding: 16, alignItems: 'center' },
  topBar: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, width: '100%', maxWidth: 900 },
  title: { fontSize: 20, color: '#0b5394', fontWeight: '800', marginLeft: 8 },
  actions: { marginLeft: 'auto', flexDirection: 'row', alignItems: 'center' },
  actionButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: '#d5d9de', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  actionText: { marginLeft: 6, color: '#0b5394', fontWeight: '600', fontSize: 13 },
  headerCard: {
    width: '100%',
    maxWidth: 900,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  headerLeft: { paddingRight: 12 },
  logo: { width: 72, height: 72 },
  headerRight: { flex: 1 },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  fieldLabel: {
    fontSize: 12,
    color: '#666',
    marginRight: 12,
  },
  fieldValue: {
    fontSize: 14,
    color: '#222',
    fontWeight: '700',
    minWidth: 100,
    textAlign: 'right',
  },
  table: {
    width: '100%',
    maxWidth: 900,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e4e7ec',
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 1,
  },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#eef1f5', minHeight: 36, alignItems: 'center' },
  tableHeader: { backgroundColor: '#e9f1fb' },
  headerCell: { fontWeight: '700', color: '#0b5394' },
  zebraA: { backgroundColor: '#fff' },
  zebraB: { backgroundColor: '#fafcff' },
  cell: { paddingHorizontal: 8, paddingVertical: 10, fontSize: 12, color: '#222' },
  cellIndex: { width: 36, textAlign: 'center', borderRightWidth: 1, borderRightColor: '#eef1f5' },
  cellDesc: { flex: 1, borderRightWidth: 1, borderRightColor: '#eef1f5' },
  cellUnd: { width: 64, textAlign: 'center', borderRightWidth: 1, borderRightColor: '#eef1f5' },
  cellQtd: { width: 90, textAlign: 'center', borderRightWidth: 1, borderRightColor: '#eef1f5' },
  cellObs: { width: 80, textAlign: 'center' },

  statusContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginVertical: 16,
    width: '100%',
    maxWidth: 900,
  },
  statusLabel: { 
    fontSize: 14, 
    color: '#444', 
    marginRight: 8 
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusPending: {
    backgroundColor: '#fff3cd',
  },
  statusApproved: {
    backgroundColor: '#d4edda',
  },
  statusRejected: {
    backgroundColor: '#f8d7da',
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },

  observacoesContainer: { width: '100%', maxWidth: 900, marginBottom: 16 },
  observacoesLabel: {
    fontSize: 14,
    color: '#444',
    marginBottom: 8,
  },
  observacoesBox: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e4e7ec',
    borderRadius: 10,
    padding: 14,
    minHeight: 70,
  },
  observacoesText: {
    fontSize: 13,
    color: '#444',
    lineHeight: 18,
  },

  signatureArea: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginTop: 16,
    width: '100%',
    maxWidth: 900,
  },
  signatureBox: { 
    flex: 1, 
    alignItems: 'center', 
    paddingHorizontal: 8,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e4e7ec',
    borderRadius: 10,
    marginHorizontal: 4,
  },
  sigLabel: { 
    fontSize: 12, 
    color: '#444', 
    marginBottom: 10,
    fontWeight: '600',
  },
  sigLine: { 
    height: 1.2, 
    backgroundColor: '#222', 
    width: '90%' 
  },
  sigDate: {
    fontSize: 11,
    color: '#666',
    marginTop: 6,
  },
});