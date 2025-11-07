import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform, Alert } from 'react-native';
import { colors, spacing, radius, typography, shadows } from '../theme/tokens';
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
  container: { backgroundColor: colors.bgSurfaceAlt },
  page: { padding: spacing.md, alignItems: 'center' },
  topBar: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm, width: '100%', maxWidth: 900 },
  title: { fontSize: typography.fontSizes.xl, color: colors.primary, fontWeight: '800', marginLeft: spacing.xs },
  actions: { marginLeft: 'auto', flexDirection: 'row', alignItems: 'center' },
  actionButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bgSurface, borderWidth: 1, borderColor: '#d5d9de', paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.md },
  actionText: { marginLeft: spacing.xs, color: colors.primary, fontWeight: '600', fontSize: 13 },
  headerCard: {
    width: '100%',
    maxWidth: 900,
    backgroundColor: colors.bgSurface,
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadows.card,
  },
  headerLeft: { paddingRight: spacing.sm },
  logo: { width: 72, height: 72 },
  headerRight: { flex: 1 },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  fieldLabel: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
    marginRight: spacing.sm,
  },
  fieldValue: {
    fontSize: typography.fontSizes.base,
    color: colors.textPrimary,
    fontWeight: '700',
    minWidth: 100,
    textAlign: 'right',
  },
  table: {
    width: '100%',
    maxWidth: 900,
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    overflow: 'hidden',
    elevation: 1,
  },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.borderAlt, minHeight: 36, alignItems: 'center' },
  tableHeader: { backgroundColor: colors.tableHeader },
  headerCell: { fontWeight: '700', color: '#0b5394' },
  zebraA: { backgroundColor: colors.bgSurface },
  zebraB: { backgroundColor: '#fafcff' },
  cell: { paddingHorizontal: spacing.sm, paddingVertical: 10, fontSize: typography.fontSizes.sm, color: colors.textPrimary },
  cellIndex: { width: 36, textAlign: 'center', borderRightWidth: 1, borderRightColor: colors.borderAlt },
  cellDesc: { flex: 1, borderRightWidth: 1, borderRightColor: colors.borderAlt },
  cellUnd: { width: 64, textAlign: 'center', borderRightWidth: 1, borderRightColor: colors.borderAlt },
  cellQtd: { width: 90, textAlign: 'center', borderRightWidth: 1, borderRightColor: colors.borderAlt },
  cellObs: { width: 80, textAlign: 'center' },

  statusContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginVertical: spacing.md,
    width: '100%',
    maxWidth: 900,
  },
  statusLabel: { 
    fontSize: typography.fontSizes.base, 
    color: '#444', 
    marginRight: spacing.xs 
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: radius.sm,
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

  observacoesContainer: { width: '100%', maxWidth: 900, marginBottom: spacing.md },
  observacoesLabel: {
    fontSize: typography.fontSizes.base,
    color: '#444',
    marginBottom: spacing.xs,
  },
  observacoesBox: {
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.sm,
    minHeight: 70,
  },
  observacoesText: {
    fontSize: typography.fontSizes.sm,
    color: '#444',
    lineHeight: 18,
  },

  signatureArea: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginTop: spacing.md,
    width: '100%',
    maxWidth: 900,
  },
  signatureBox: { 
    flex: 1, 
    alignItems: 'center', 
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.sm,
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    marginHorizontal: 4,
  },
  sigLabel: { 
    fontSize: typography.fontSizes.sm, 
    color: '#444', 
    marginBottom: spacing.sm,
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