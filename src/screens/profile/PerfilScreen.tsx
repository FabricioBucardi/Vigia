import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import PrimaryButton from '../../components/PrimaryButton';
import { COLORS } from '../../styles/colors';
import { FONT_SIZE, FONT_WEIGHT, LAYOUT, SPACING } from '../../styles/tokens';

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
        <PrimaryButton
          title="Sair da Conta"
          onPress={() => {
            void signOut();
          }}
        />
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
    padding: LAYOUT.screenPaddingXWide,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZE.display,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
  },
  userInfo: {
    fontSize: FONT_SIZE.bodyLg,
    color: COLORS.textDark,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONT_SIZE.bodyLg,
    color: COLORS.textLight,
    marginTop: SPACING.sm,
  },
  logoutWrapper: {
    marginTop: SPACING.xxxl,
    width: '100%',
    maxWidth: LAYOUT.contentMaxWidth,
  },
});
