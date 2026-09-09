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
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 16}
      >
        <ScrollView
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
    padding: 24,
    paddingTop: Platform.OS === 'ios' ? 24 : 40,
  },
  tabs: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    position: 'relative',
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  indicador: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    left: 4,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  tabTextAtiva: {
    color: COLORS.surface,
  },
  cartao: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 0,
    borderWidth: 1,
    borderColor: COLORS.border,
    position: 'relative',
    overflow: 'hidden',
  },
  face: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: 24,
  },
  faceAtiva: {
    zIndex: 2,
  },
});
