import { Image, StyleSheet, View } from 'react-native';
import { LAYOUT } from '../styles/tokens';

export default function VigiaLogo() {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/login/vigia.png')}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: LAYOUT.logoGap,
  },
  logo: {
    width: LAYOUT.logo,
    height: LAYOUT.logo,
  },
});
