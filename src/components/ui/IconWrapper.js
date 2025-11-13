import React from 'react';
import { Platform, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Componente wrapper para ícones que funciona melhor na web
const IconWrapper = ({ name, size = 24, color = '#000', style, fallback, ...props }) => {
  // Fallback para web se o ícone não carregar
  const renderFallback = () => {
    if (fallback) return fallback;
    
    // Ícones de fallback em emoji para web
    const iconFallbacks = {
      'person-outline': '👤',
      'lock-closed-outline': '🔒',
      'log-in-outline': '🚪',
      'eye-outline': '👁️',
      'menu-outline': '☰',
      'home-outline': '🏠',
      'storefront-outline': '🏪',
      'construct-outline': '🔧',
      'business-outline': '🏢',
      'search-outline': '🔍',
      'add-outline': '➕',
      'remove-outline': '➖',
      'create-outline': '✏️',
      'trash-outline': '🗑️',
      'download-outline': '⬇️',
      'refresh-outline': '🔄',
      'checkmark-outline': '✅',
      'close-outline': '❌',
      'arrow-back-outline': '◀️',
      'arrow-forward-outline': '▶️',
      'chevron-down-outline': '⬇️',
      'chevron-up-outline': '⬆️'
    };
    
    return (
      <Text style={[
        {
          fontSize: size * 0.8,
          color: color,
          textAlign: 'center',
          lineHeight: size
        },
        style
      ]}>
        {iconFallbacks[name] || '❓'}
      </Text>
    );
  };

  if (Platform.OS === 'web') {
    // Na web, tenta carregar o ícone com fallback
    return (
      <View style={[{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }, style]}>
        <Ionicons 
          name={name} 
          size={size} 
          color={color} 
          {...props}
          onError={() => {
            // Se o ícone falhar ao carregar, mostra o fallback
            console.warn(`Ícone ${name} falhou ao carregar, usando fallback`);
          }}
          style={[
            { 
              fontFamily: 'Ionicons',
              // Força o carregamento da fonte
              fontDisplay: 'swap'
            }
          ]}
        />
      </View>
    );
  }

  // Para mobile, usa normalmente
  return <Ionicons name={name} size={size} color={color} style={style} {...props} />;
};

export default IconWrapper;