import { Image, StyleSheet, View } from 'react-native';

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
    marginBottom: 28,
  },
  logo: {
    width: 140,
    height: 140,
  },
});
