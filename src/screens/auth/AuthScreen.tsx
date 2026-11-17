import { useState, useEffect } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { COLORS } from '../../styles/colors';
import { FONT_SIZE, FONT_WEIGHT, LAYOUT, RADIUS, SPACING } from '../../styles/tokens';
import VigiaLogo from '../../components/VigiaLogo';
import CadastroWizard from './CadastroWizard';
import LoginForm from './LoginForm';

type ActiveTab = 'login' | 'register';

export default function AuthScreen() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('login');
  const [larguraTabs, setLarguraTabs] = useState(0);
  const [alturaLogin, setAlturaLogin] = useState(0);
  const [alturaCadastro, setAlturaCadastro] = useState(0);

  const progresso = useSharedValue(0);
  const alturaCartaoAnimada = useSharedValue(340);

  const larguraIndicador = Math.max(larguraTabs / 2 - 4, 0);

  const faceLoginStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: `${interpolate(progresso.value, [0, 1], [0, -110])}%` },
    ],
    opacity: interpolate(progresso.value, [0, 1], [1, 0]),
  }));
  const faceCadastroStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: `${interpolate(progresso.value, [0, 1], [110, 0])}%` },
    ],
    opacity: interpolate(progresso.value, [0, 1], [0, 1]),
  }));
  const indicadorStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(progresso.value, [0, 1], [0, larguraIndicador]) },
    ],
  }));
  const estiloAlturaCartao = useAnimatedStyle(() => ({
    height: alturaCartaoAnimada.value,
  }));

  useEffect(() => {
    const alturaAlvo = activeTab === 'login' ? alturaLogin : alturaCadastro;
    if (alturaAlvo > 0) {
      alturaCartaoAnimada.value = withTiming(alturaAlvo, {
        duration: 300,
        easing: Easing.out(Easing.cubic),
      });
    }
  }, [activeTab, alturaLogin, alturaCadastro]);

  function trocarAba(aba: ActiveTab) {
    setActiveTab(aba);
    progresso.value = withTiming(aba === 'login' ? 0 : 1, { duration: 350 });
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior="padding"
        keyboardVerticalOffset={0}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <VigiaLogo />

          <View
            style={styles.tabs}
            onLayout={(e) => setLarguraTabs(e.nativeEvent.layout.width)}
          >
            <Animated.View
              style={[styles.indicador, indicadorStyle, { width: larguraIndicador }]}
            />
            <Pressable style={styles.tab} onPress={() => trocarAba('login')}>
              <Text style={[styles.tabText, activeTab === 'login' && styles.tabTextAtiva]}>
                Entrar
              </Text>
            </Pressable>
            <Pressable style={styles.tab} onPress={() => trocarAba('register')}>
              <Text style={[styles.tabText, activeTab === 'register' && styles.tabTextAtiva]}>
                Cadastrar
              </Text>
            </Pressable>
          </View>

          <Animated.View style={[styles.cartao, estiloAlturaCartao]}>
            {/* Face frontal: Login */}
            <Animated.View
              style={[
                styles.face,
                activeTab === 'login' && styles.faceAtiva,
                faceLoginStyle,
              ]}
              pointerEvents={activeTab === 'login' ? 'auto' : 'none'}
              accessibilityElementsHidden={activeTab !== 'login'}
              importantForAccessibility={
                activeTab === 'login' ? 'auto' : 'no-hide-descendants'
              }
              onLayout={(e) => {
                const h = e.nativeEvent.layout.height;
                if (h > 0) setAlturaLogin(h);
              }}
            >
              <LoginForm />
            </Animated.View>

            {/* Face traseira: Cadastro */}
            <Animated.View
              style={[
                styles.face,
                activeTab === 'register' && styles.faceAtiva,
                faceCadastroStyle,
              ]}
              pointerEvents={activeTab === 'register' ? 'auto' : 'none'}
              accessibilityElementsHidden={activeTab !== 'register'}
              importantForAccessibility={
                activeTab === 'register' ? 'auto' : 'no-hide-descendants'
              }
              onLayout={(e) => {
                const h = e.nativeEvent.layout.height;
                if (h > 0) setAlturaCadastro(h);
              }}
            >
              <CadastroWizard />
            </Animated.View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: SPACING.xxl,
    paddingTop: Platform.OS === 'ios' ? SPACING.xxl : SPACING.huge,
  },
  tabs: {
    flexDirection: 'row',
    marginBottom: SPACING.xl,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
    position: 'relative',
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: LAYOUT.tabPaddingY,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
  },
  indicador: {
    position: 'absolute',
    top: SPACING.xs,
    bottom: SPACING.xs,
    left: SPACING.xs,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: FONT_SIZE.input,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textLight,
  },
  tabTextAtiva: {
    color: COLORS.surface,
  },
  cartao: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.none,
    borderWidth: 1,
    borderColor: COLORS.border,
    position: 'relative',
    overflow: 'hidden',
  },
  face: {
    position: 'absolute',
    top: SPACING.none,
    left: SPACING.none,
    right: SPACING.none,
    padding: SPACING.xxl,
  },
  faceAtiva: {
    zIndex: 2,
  },
});
