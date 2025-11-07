// Design tokens centralizados
// Facilita manutenção de cores, tipografia e espaçamentos.

export const colors = {
  primary: '#0b5394',
  primaryDark: '#06437a',
  primaryAlt: '#1a73e8',
  danger: '#ff4d4d',
  warning: '#fbc531',
  success: '#4cd137',
  bgApp: '#f4f7fc',
  bgSurface: '#fff',
  bgSurfaceAlt: '#f5f7fb',
  textPrimary: '#222',
  textSecondary: '#666',
  textMuted: '#dce6f5',
  border: '#e4e7ec',
  borderAlt: '#eef1f5',
  tableHeader: '#e9f1fb',
};

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 22,
};

export const typography = {
  fontSizes: {
    xs: 11,
    sm: 12,
    base: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
  },
  weights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
};

export const shadows = {
  card: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
  },
};

export const tokens = { colors, spacing, radius, typography, shadows };

export default tokens;
