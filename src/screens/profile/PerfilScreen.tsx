import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import PrimaryButton from '../../components/PrimaryButton';
import { COLORS } from '../../styles/colors';

export default function PerfilScreen() {
  const { user, signOut } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Perfil</Text>
        {user ? (
          <Text style={styles.userInfo}>
            {user.nome}
            {'\n'}({user.email})
          </Text>
        ) : null}
      </View>
      <Text style={styles.subtitle}>Perfil do cidadão (em construção)</Text>
      <View style={styles.logoutWrapper}>
        <PrimaryButton title="Sair da Conta" onPress={signOut} />
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
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  userInfo: {
    fontSize: 15,
    color: COLORS.textDark,
    marginTop: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textLight,
    marginTop: 8,
  },
  logoutWrapper: {
    marginTop: 32,
    width: '100%',
    maxWidth: 320,
  },
});
