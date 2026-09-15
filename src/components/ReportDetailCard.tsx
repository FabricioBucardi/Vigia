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
    <Animated.View style={[styles.card, animatedStyle, { bottom: Math.max(insets.bottom, 16) }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View
            style={[styles.badge, { backgroundColor: corCategoria }]}
          >
            <Text style={styles.badgeTexto}>{report.tipoCategoria}</Text>
          </View>
          <Text style={styles.subcategoria}>{report.tipoSubcategoria}</Text>
        </View>
        <Pressable
          onPress={onClose}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <MaterialCommunityIcons
            name="close"
            size={22}
            color={COLORS.textLight}
          />
        </Pressable>
      </View>

      <Text style={styles.titulo}>{report.titulo}</Text>

      <View style={styles.linhaEndereco}>
        <MaterialCommunityIcons
          name="map-marker-outline"
          size={13}
          color={COLORS.textLight}
        />
        <Text style={styles.endereco}>{report.endereco}</Text>
      </View>

      <View style={styles.linhaEstrelas}>
        <Text style={styles.rotuloEstrelas}>
          {isSeguranca ? 'Nível de Proteção' : 'Nível de Gravidade'}
        </Text>
        <View style={styles.estrelasGrupo}>
          {[1, 2, 3, 4, 5].map((i) => (
            <MaterialCommunityIcons
              key={i}
              name={i <= report.avaliacaoGravidade ? 'star' : 'star-outline'}
              size={18}
              color={
                i <= report.avaliacaoGravidade ? corCategoria : COLORS.border
              }
            />
          ))}
          <Text style={styles.notaNumerica}>
            {'(' + report.avaliacaoGravidade + '/5)'}
          </Text>
        </View>
      </View>

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
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeTexto: {
    color: COLORS.surface,
    fontSize: 11,
    fontWeight: '700',
  },
  subcategoria: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  titulo: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 6,
  },
  linhaEndereco: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  endereco: {
    fontSize: 13,
    color: COLORS.textLight,
  },
  linhaEstrelas: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  rotuloEstrelas: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  estrelasGrupo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  notaNumerica: {
    fontSize: 12,
    color: COLORS.textLight,
    marginLeft: 4,
  },
  descricao: {
    fontSize: 14,
    color: COLORS.textDark,
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'column',
    gap: 2,
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  footerAutor: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textLight,
  },
  footerData: {
    fontSize: 11,
    color: COLORS.textLight,
  },
});
