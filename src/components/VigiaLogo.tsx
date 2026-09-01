import { Image, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../styles/colors';

export default function VigiaLogo() {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/login/vigia.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      {/* <Text style={styles.titulo}>VIGIA</Text> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logo: {
    width: 140,
    height: 140,
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
    letterSpacing: 4,
    marginTop: 4,
  },
});
