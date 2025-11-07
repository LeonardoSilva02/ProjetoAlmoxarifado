import { Platform, Share, PermissionsAndroid } from 'react-native';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

const formatarData = (data) => {
  if (!data) return '';
  const match = data.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (match) {
    const [_, dia, mes, ano] = match;
    return `${dia.padStart(2, '0')}/${mes.padStart(2, '0')}/${ano}`;
  }
  return data;
};

const converterParaCSV = (ferramentas) => {
  // Cabeçalhos com formatação profissional
  const headers = [
    'Nome da Ferramenta',
    'Nº do Patrimônio',
    'Local',
    'Status',
    'Data de Manutenção',
    'Departamento'
  ];
  
  // Ordenar ferramentas por departamento e nome
  const ferramentasOrdenadas = [...ferramentas].sort((a, b) => {
    if (a.origem !== b.origem) return a.origem.localeCompare(b.origem);
    return a.nome.localeCompare(b.nome);
  });

  // Criar string CSV com BOM para caracteres especiais
  let csv = '\ufeff';
  
  // Adicionar cabeçalho bonito
  csv += '"INVENTÁRIO DE FERRAMENTAS - ALMOXARIFADO"\n';
  csv += `"Data do Relatório: ${new Date().toLocaleDateString('pt-BR')}"\n\n`;

  // Adicionar cabeçalhos da tabela
  csv += headers.map(h => `"${h}"`).join(';') + '\n';

  // Adicionar linhas com formatação melhorada
  ferramentasOrdenadas.forEach(item => {
    const row = [
      item.nome?.trim() || 'Não informado',
      item.patrimonio?.trim() || 'Não cadastrado',
      item.local?.trim() || 'Local não especificado',
      item.situacao || 'Status não definido',
      formatarData(item.dataManutencao),
      item.origem === 'Geral' ? 'Almoxarifado Geral' : 'Almoxarifado Honda'
    ].map(field => `"${String(field).replace(/"/g, '""')}"`);
    
    csv += row.join(';') + '\n';
  });

  // Adicionar linha em branco antes do resumo
  csv += '\n';

  // Calcular totais simples
  const totais = ferramentasOrdenadas.reduce((acc, item) => {
    acc.total++;
    acc[item.origem]++;
    acc[item.situacao]++;
    return acc;
  }, {
    total: 0,
    Geral: 0,
    Honda: 0,
    'Funcionando': 0,
    'Com defeito': 0,
    'Em manutenção': 0
  });

  // Adicionar resumo simples e bonito
  csv += '"RESUMO DO INVENTÁRIO"\n';
  csv += `"Total de Ferramentas;${totais.total}"\n`;
  csv += `"Ferramentas Funcionando;${totais.Funcionando}"\n`;
  csv += `"Ferramentas com Defeito;${totais['Com defeito']}"\n`;
  csv += `"Ferramentas em Manutenção;${totais['Em manutenção']}"\n\n`;

  // Adicionar distribuição por departamento
  csv += '"DISTRIBUIÇÃO POR DEPARTAMENTO"\n';
  csv += `"Almoxarifado Geral;${totais.Geral}"\n`;
  csv += `"Almoxarifado Honda;${totais.Honda}"\n\n`;

  // Adicionar rodapé simples
  csv += `"Relatório gerado automaticamente pelo Sistema de Gestão de Almoxarifado"\n`;

  return csv;
};

export const exportarFerramentasParaExcel = async (ferramentasGerais, ferramentasHonda) => {
  try {
    // Verificar se há dados para exportar
    if ((!ferramentasGerais || ferramentasGerais.length === 0) && 
        (!ferramentasHonda || ferramentasHonda.length === 0)) {
      throw new Error('Não há ferramentas cadastradas para exportar.');
    }

    // Preparar os dados
    const dadosFerramentasGerais = (ferramentasGerais || []).map(item => ({
      nome: item.nome,
      patrimonio: item.patrimonio,
      local: item.local,
      situacao: item.situacao,
      dataManutencao: item.dataManutencao || '',
      origem: 'Geral'
    }));

    const dadosFerramentasHonda = (ferramentasHonda || []).map(item => ({
      nome: item.nome,
      patrimonio: item.patrimonio,
      local: item.local,
      situacao: item.situacao,
      dataManutencao: item.dataManutencao || '',
      origem: 'Honda'
    }));

    // Combinar todos os dados
    const todasFerramentas = [...dadosFerramentasGerais, ...dadosFerramentasHonda];

    // Converter para CSV
    const csv = converterParaCSV(todasFerramentas);
    const timestamp = new Date().getTime();
    const fileName = `ferramentas_${timestamp}.csv`;
    
    if (Platform.OS === 'web') {
      try {
        // No ambiente web, usar download direto
        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Erro ao fazer download:', error);
        throw new Error('Não foi possível fazer o download da planilha.');
      }
    } else {
      try {
        // Verificar se o compartilhamento está disponível
        const isAvailable = await Sharing.isAvailableAsync();
        if (!isAvailable && Platform.OS === 'android') {
          throw new Error('Compartilhamento não está disponível neste dispositivo.');
        }

        // Criar arquivo temporário
        const tempPath = `${FileSystem.cacheDirectory}${fileName}`;
        
        // Salvar CSV no arquivo temporário
        await FileSystem.writeAsStringAsync(tempPath, '\ufeff' + csv, {
          encoding: FileSystem.EncodingType.UTF8
        });

        if (Platform.OS === 'ios') {
          // No iOS, usar Sharing do Expo
          await Sharing.shareAsync(tempPath, {
            UTI: 'public.comma-separated-values-text', // UTI específico para CSV no iOS
            mimeType: 'text/csv',
            dialogTitle: 'Exportar Planilha de Ferramentas'
          });
        } else {
          // No Android, usar Share API nativa
          const contentUri = await FileSystem.getContentUriAsync(tempPath);
          await Share.share({
            title: 'Planilha de Ferramentas',
            url: contentUri
          });
        }

        // Limpar arquivo temporário
        try {
          await FileSystem.deleteAsync(tempPath);
        } catch (cleanupError) {
          console.warn('Erro ao limpar arquivo temporário:', cleanupError);
        }

        return true;
      } catch (error) {
        if (error.message.includes('canceled') || error.code === 'ERR_CANCELED') {
          return false; // Usuário cancelou o compartilhamento
        }
        console.error('Erro no compartilhamento:', error);
        throw error;
      }
    }

    return true;
  } catch (error) {
    console.error('Erro ao exportar planilha:', error);
    throw error;
  }
};