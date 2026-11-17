import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../styles/colors';
import { FONT_SIZE, FONT_WEIGHT, ICON_SIZE, LAYOUT, RADIUS, SHADOWS, SPACING } from '../styles/tokens';
import { rotuloSubcategoria } from '../data';
import type { Reporte } from '../types/report';

type ReportDetailCardProps = {
  report: Reporte | null;
  onClose: () => void;
};

function formatarData(dataISO: string): string {
  const d = new Date(dataISO);
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ReportDetailCard({
  report,
  onClose,
}: ReportDetailCardProps) {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(300);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (report) {
      translateY.value = withTiming(0, {
        duration: 250,
        easing: Easing.out(Easing.cubic),
      });
      opacity.value = withTiming(1, {
        duration: 250,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      translateY.value = 300;
      opacity.value = 0;
    }
  }, [report, translateY, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!report) return null;

  const isSeguranca = report.tipoCategoria === 'Segurança';
  const corCategoria = isSeguranca ? COLORS.success : COLORS.danger;

  return (
    <Animated.View style={[styles.card, animatedStyle, { bottom: Math.max(insets.bottom, SPACING.lg) }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View
            style={[styles.badge, { backgroundColor: corCategoria }]}
          >
            <Text style={styles.badgeTexto}>{report.tipoCategoria}</Text>
          </View>
          <Text style={styles.subcategoria}>{rotuloSubcategoria(report.tipoSubcategoria)}</Text>
        </View>
        <Pressable
          onPress={onClose}
          hitSlop={{ top: SPACING.md, bottom: SPACING.md, left: SPACING.md, right: SPACING.md }}
        >
          <MaterialCommunityIcons
            name="close"
            size={ICON_SIZE.lg}
            color={COLORS.textLight}
          />
        </Pressable>
      </View>

      <Text style={styles.titulo}>{report.titulo}</Text>

      <Text style={styles.descricao}>{report.descricao}</Text>

      <View style={styles.footer}>
        <Text style={styles.footerAutor}>Reportado por: {report.autorNome}</Text>
        <Text style={styles.footerData}>{formatarData(report.dataReporte)}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    bottom: SPACING.lg,
    left: SPACING.lg,
    right: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: LAYOUT.cardPadding,
    ...SHADOWS.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: LAYOUT.infoGap,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  badge: {
    paddingHorizontal: LAYOUT.badgePaddingX,
    paddingVertical: LAYOUT.badgePaddingY,
    borderRadius: RADIUS.md,
  },
  badgeTexto: {
    color: COLORS.surface,
    fontSize: FONT_SIZE.micro,
    fontWeight: FONT_WEIGHT.bold,
  },
  subcategoria: {
    fontSize: FONT_SIZE.label,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textDark,
  },
  titulo: {
    fontSize: FONT_SIZE.title,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textDark,
    marginBottom: LAYOUT.titleGap,
  },
  descricao: {
    fontSize: FONT_SIZE.body,
    color: COLORS.textDark,
    lineHeight: SPACING.xl,
    marginBottom: SPACING.md,
  },
  footer: {
    flexDirection: 'column',
    gap: SPACING.hairline,
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  footerAutor: {
    fontSize: FONT_SIZE.caption,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.textLight,
  },
  footerData: {
    fontSize: FONT_SIZE.micro,
    color: COLORS.textLight,
  },
});
