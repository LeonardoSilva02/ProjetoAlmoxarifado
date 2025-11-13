import React from 'react';
import { Platform, Text } from 'react-native';

// Componente de ícone que sempre funciona
const SafeIcon = ({ name, size = 24, color = '#000', style }) => {
  // Mapeamento de ícones para emojis (sempre funcionam)
  const iconMap = {
    // Login e autenticação
    'person-outline': '👤',
    'lock-closed-outline': '🔒',
    'log-in-outline': '🚪',
    'eye-outline': '👁️',
    'eye-off-outline': '🙈',
    
    // Navegação
    'menu-outline': '☰',
    'home-outline': '🏠',
    'arrow-back-outline': '←',
    'arrow-forward-outline': '→',
    'chevron-down-outline': '⬇',
    'chevron-up-outline': '⬆',
    'chevron-back-outline': '‹',
    'chevron-forward-outline': '›',
    
    // Funcionalidades
    'storefront-outline': '🏪',
    'construct-outline': '🔧',
    'business-outline': '🏢',
    'search-outline': '🔍',
    'add-outline': '➕',
    'remove-outline': '➖',
    'create-outline': '✏️',
    'pencil-outline': '✏️',
    'trash-outline': '🗑️',
    'download-outline': '⬇️',
    'save-outline': '💾',
    'refresh-outline': '🔄',
    'sync-outline': '🔄',
    
    // Status
    'checkmark-outline': '✅',
    'checkmark-circle-outline': '✅',
    'close-outline': '❌',
    'close-circle-outline': '❌',
    'alert-circle-outline': '⚠️',
    'information-circle-outline': 'ℹ️',
    
    // Documentos e dados
    'document-outline': '📄',
    'folder-outline': '📁',
    'list-outline': '📋',
    'clipboard-outline': '📋',
    'calendar-outline': '📅',
    
    // Configurações
    'settings-outline': '⚙️',
    'cog-outline': '⚙️',
    'options-outline': '⋯',
    'ellipsis-vertical-outline': '⋮',
    'ellipsis-horizontal-outline': '⋯',
    
    // Comunicação
    'notifications-outline': '🔔',
    'mail-outline': '📧',
    'call-outline': '📞',
    
    // Diversos
    'filter-outline': '🔍',
    'funnel-outline': '🔽',
    'swap-horizontal-outline': '↔️',
    'repeat-outline': '🔁',
    'heart-outline': '♡',
    'star-outline': '☆',
    'bookmark-outline': '🔖'
  };

  const emoji = iconMap[name] || '📦'; // Fallback padrão

  return (
    <Text
      style={[
        {
          fontSize: size * 0.9,
          color: color,
          textAlign: 'center',
          lineHeight: size,
          fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
          includeFontPadding: false,
        },
        style,
      ]}
    >
      {emoji}
    </Text>
  );
};

export default SafeIcon;