import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../styles/colors';

const CORES_PARA_EXIBIR = [
  { nome: 'Primary', hex: COLORS.primary },
  { nome: 'Secondary', hex: COLORS.secondary },
  { nome: 'Danger', hex: COLORS.danger },
  { nome: 'Success', hex: COLORS.success },
  { nome: 'Warning', hex: COLORS.warning },
  { nome: 'Background', hex: COLORS.background },
  { nome: 'Surface', hex: COLORS.surface },
  { nome: 'TextDark', hex: COLORS.textDark },
  { nome: 'TextLight', hex: COLORS.textLight },
  { nome: 'Border', hex: COLORS.border },
];

export default function MapaScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Mapa</Text>
      <Text style={styles.subtitle}>Mapa interativo (em construção)</Text>

      <View style={styles.paleta}>
        <Text style={styles.paletaTitulo}>Paleta em teste</Text>
        <View style={styles.quadrados}>
          {CORES_PARA_EXIBIR.map((cor) => (
            <View key={cor.nome} style={styles.item}>
              <View
                style={[
                  styles.quadrado,
                  { backgroundColor: cor.hex },
                  (cor.hex === COLORS.surface ||
                    cor.hex === COLORS.background ||
                    cor.hex === COLORS.border) &&
                    styles.quadradoComBorda,
                ]}
              />
              <Text style={styles.quadradoNome}>{cor.nome}</Text>
              <Text style={styles.quadradoHex}>{cor.hex}</Text>
            </View>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textLight,
    marginTop: 8,
  },
  paleta: {
    marginTop: 32,
    padding: 16,
    width: '88%',
    maxWidth: 420,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  paletaTitulo: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: 12,
    textAlign: 'center',
  },
  quadrados: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  item: {
    width: 80,
    alignItems: 'center',
  },
  quadrado: {
    width: 80,
    height: 80,
    borderRadius: 64,
    marginBottom: 6,
  },
  quadradoComBorda: {
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quadradoNome: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  quadradoHex: {
    fontSize: 10,
    color: COLORS.textLight,
    marginTop: 2,
  },
});
