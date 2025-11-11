import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function RequisicaoForm({ route, navigation }) {
  const item = route?.params?.item;

  // Função auxiliar para formatar data com segurança
  const formatarData = (requisicao) => {
    if (!requisicao) return '—';
    
    // Tenta diversos campos de data
    const dataString = requisicao.data || requisicao.criadoEm || requisicao.dataRegistro;
    
    if (!dataString) return new Date().toLocaleDateString('pt-BR');
    
    // Se já vier formatado (DD/MM/AAAA), retorna direto
    if (typeof dataString === 'string' && dataString.includes('/')) {
      return dataString;
    }
    
    // Tenta converter timestamp/ISO
    try {
      const data = new Date(dataString);
      if (!isNaN(data.getTime())) {
        return data.toLocaleDateString('pt-BR');
      }
    } catch (e) {
      console.error('Erro ao formatar data:', e);
    }
    
    return new Date().toLocaleDateString('pt-BR');
  };

  // Preencher linhas vazias até 16
  const linhas = Array.from({ length: 16 }).map((_, i) => item?.itens[i] || { descricao: '', quantidade: '', unidade: '' });

  const handlePrint = () => {
    if (Platform.OS === 'web') {
      const printStyle = document.createElement('style');
      // Oculta elementos não pertencentes (top bar, botões) e evita título no cabeçalho
      printStyle.innerHTML = `
        @media print {
          body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          /* Ocultar barra superior e botões */
          [data-hide-on-print="true"] { display: none !important; }
          /* Garantir imagens visíveis */
          img { display: block !important; opacity: 1 !important; }
          /* Remover sombras para impressão limpa */
          * { box-shadow: none !important; }
          /* Evitar quebras esquisitas */
          .avoid-break { break-inside: avoid; page-break-inside: avoid; }
        }
      `;
      const prevTitle = document.title;
      // Título vazio para não imprimir "RequisicaoForm" no cabeçalho do navegador
      document.title = '';
      document.head.appendChild(printStyle);
      window.print();
      setTimeout(() => {
        document.head.removeChild(printStyle);
        document.title = prevTitle;
      }, 100);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.page}>
  {/* Top bar (ocultada na impressão) */}
  <View style={styles.topBar} data-hide-on-print="true">
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

      {/* Header aprimorado */}
      <View style={styles.headerCard}>
        <View style={styles.logoSection}>
          <Image
            source={require('../../assets/logo-masters.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.companyName}>Masters Engenharia</Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.infoSection}>
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>Requisição Nº</Text>
            <Text style={styles.infoValue}>{item?.codigoManual ?? '—'}</Text>
          </View>
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>Data</Text>
            <Text style={styles.infoValue}>{formatarData(item)}</Text>
          </View>
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>Eng. Responsável</Text>
            <Text style={styles.infoValue}>{item?.engenheiroResponsavel ?? '—'}</Text>
          </View>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.infoSection}>
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>Solicitante</Text>
            <Text style={styles.infoValue}>{item?.solicitante ?? '—'}</Text>
          </View>
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>Centro de Custo</Text>
            <Text style={styles.infoValue}>{item?.centroCusto ?? '—'}</Text>
          </View>
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>Cliente</Text>
            <Text style={styles.infoValue}>{item?.cliente ?? '—'}</Text>
          </View>
        </View>

        <View style={styles.infoSection}>
          <View style={[styles.infoBlock, { minWidth: '100%' }]}>
            <Text style={styles.infoLabel}>Aplicação do Serviço</Text>
            <Text style={styles.infoValue}>{item?.aplicacaoServico ?? '—'}</Text>
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

import styles from '../styles/screens/RequisicaoForm.styles';