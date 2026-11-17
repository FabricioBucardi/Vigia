import type { ViewStyle } from 'react-native';

export const SPACING = {
  none: 0,
  hairline: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
} as const;

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
} as const;

export const FONT_SIZE = {
  micro: 11,
  caption: 12,
  label: 13,
  body: 14,
  bodyLg: 15,
  input: 16,
  title: 18,
  display: 28,
} as const;

export const FONT_WEIGHT = {
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

export const ICON_SIZE = {
  sm: 18,
  md: 20,
  lg: 24,
  xl: 28,
} as const;

export const LAYOUT = {
  screenPaddingX: 20,
  screenPaddingXWide: 24,
  overlayTopOffset: 56,
  headerPaddingX: 16,
  headerPaddingY: 14,
  cardPadding: 16,
  cardPaddingCompact: 14,
  fieldHeight: 56,
  fieldPadding: 14,
  buttonPaddingY: 14,
  chipPaddingX: 16,
  chipPaddingY: 8,
  badgePaddingX: 10,
  badgePaddingY: 4,
  checklistGap: 6,
  titleGap: 6,
  infoGap: 10,
  tabPaddingY: 10,
  bannerPaddingY: 10,
  logoGap: 28,
  touchTarget: 48,
  iconButton: 40,
  fab: 56,
  logo: 140,
  contentMaxWidth: 320,
  textAreaMinHeight: 100,
  sugestoesMaxHeight: 240,
} as const;

export const SHADOWS: Record<'sm' | 'md' | 'mdStrong' | 'lg' | 'fab', ViewStyle> = {
  sm: {
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  md: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  mdStrong: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  lg: {
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  fab: {
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
};
