import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BairroOSM } from '../services/bairroService';
import { COLORS } from '../styles/colors';
import {
  FONT_SIZE,
  FONT_WEIGHT,
  ICON_SIZE,
  LAYOUT,
  RADIUS,
  SHADOWS,
  SPACING,
} from '../styles/tokens';
import { corClassificacao, rotuloClassificacao } from '../utils/bairroUtils';

type CartaoBairroProps = {
  bairro: BairroOSM | null;
  nota: number | null;
  seguranca: number;
  inseguranca: number;
  onFechar: () => void;
};

const DISTANCIA_OCULTA = -300;
const DURACAO_MS = 300;

export default function CartaoBairro({
  bairro,
  nota,
  seguranca,
  inseguranca,
  onFechar,
}: CartaoBairroProps) {
  const insets = useSafeAreaInsets();
  const [bairroExibido, setBairroExibido] = useState<BairroOSM | null>(bairro);
  const translateY = useSharedValue(DISTANCIA_OCULTA);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (bairro) setBairroExibido(bairro);
  }, [bairro]);

  useEffect(() => {
    const configuracao = {
      duration: DURACAO_MS,
      easing: Easing.out(Easing.cubic),
    };
    translateY.value = withTiming(bairro ? 0 : DISTANCIA_OCULTA, configuracao);
    opacity.value = withTiming(bairro ? 1 : 0, configuracao);
  }, [bairro, translateY, opacity]);

  const estiloAnimado = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.cartao,
        { top: insets.top + LAYOUT.overlayTopOffset },
        estiloAnimado,
      ]}
      pointerEvents={bairro ? 'auto' : 'none'}
    >
      {bairroExibido ? (
        <>
          <View style={styles.header}>
            <Pressable
              onPress={onFechar}
              hitSlop={{
                top: SPACING.sm,
                bottom: SPACING.sm,
                left: SPACING.sm,
                right: SPACING.sm,
              }}
              accessibilityRole="button"
              accessibilityLabel="Voltar para a visão geral do mapa"
            >
              <MaterialCommunityIcons
                name="arrow-left"
                size={ICON_SIZE.lg}
                color={COLORS.primary}
              />
            </Pressable>
            <View style={styles.headerTexto}>
              <Text style={styles.titulo} numberOfLines={1}>
                Bairro {bairroExibido.nome}
              </Text>
              <Text style={styles.subtitulo} numberOfLines={1}>
                São Caetano do Sul
              </Text>
            </View>
          </View>

          <View style={styles.resumo}>
            <View style={styles.resumoNota}>
              <Text
                style={[
                  styles.notaValor,
                  { color: nota == null ? COLORS.textLight : corClassificacao(nota) },
                ]}
              >
                {nota == null ? '—' : nota.toFixed(1)}
              </Text>
              <Text style={styles.notaLegenda}>
                {nota == null
                  ? 'sem nota'
                  : `/ 5,0 · ${rotuloClassificacao(nota)}`}
              </Text>
            </View>

            <View style={styles.divisor} />

            <View style={styles.stat}>
              <MaterialCommunityIcons
                name="shield-check"
                size={ICON_SIZE.md}
                color={COLORS.success}
              />
              <Text style={styles.statNumero}>{seguranca}</Text>
              <Text style={styles.statRotulo}>Segurança</Text>
            </View>

            <View style={styles.divisor} />

            <View style={styles.stat}>
              <MaterialCommunityIcons
                name="alert"
                size={ICON_SIZE.md}
                color={COLORS.danger}
              />
              <Text style={styles.statNumero}>{inseguranca}</Text>
              <Text style={styles.statRotulo}>Insegurança</Text>
            </View>
          </View>
        </>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cartao: {
    position: 'absolute',
    left: LAYOUT.screenPaddingX,
    right: LAYOUT.screenPaddingX,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    gap: SPACING.md,
    ...SHADOWS.lg,
    zIndex: 15,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  headerTexto: {
    flex: 1,
    gap: SPACING.hairline,
  },
  titulo: {
    fontSize: FONT_SIZE.title,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textDark,
  },
  subtitulo: {
    fontSize: FONT_SIZE.caption,
    color: COLORS.textLight,
  },
  resumo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  resumoNota: {
    flex: 1,
    gap: SPACING.hairline,
  },
  notaValor: {
    fontSize: FONT_SIZE.display,
    fontWeight: FONT_WEIGHT.bold,
  },
  notaLegenda: {
    fontSize: FONT_SIZE.micro,
    color: COLORS.textLight,
  },
  divisor: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: COLORS.border,
  },
  stat: {
    alignItems: 'center',
    gap: SPACING.hairline,
    minWidth: LAYOUT.touchTarget,
  },
  statNumero: {
    fontSize: FONT_SIZE.bodyLg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textDark,
  },
  statRotulo: {
    fontSize: FONT_SIZE.micro,
    color: COLORS.textLight,
  },
});
