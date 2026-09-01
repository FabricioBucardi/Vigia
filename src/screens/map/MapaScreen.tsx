import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../styles/colors';

export default function MapaScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Mapa</Text>
      <Text style={styles.subtitle}>Mapa interativo (em construção)</Text>
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
});
