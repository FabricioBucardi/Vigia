import { useState } from 'react';
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
} from 'react-native-reanimated';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../styles/colors';
import FloatingTextInput from '../../components/FloatingTextInput';
import VigiaLogo from '../../components/VigiaLogo';
import PrimaryButton from '../../components/PrimaryButton';

type ActiveTab = 'login' | 'register';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SENHA_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

function aplicarMascaraData(texto: string): string {
  const digitos = texto.replace(/\D/g, '').slice(0, 8);
  const partes = [
    digitos.slice(0, 2),
    digitos.slice(2, 4),
    digitos.slice(4, 8),
  ].filter(Boolean);
  return partes.join('/');
}

type ErrosForm = {
  email?: string;
  senha?: string;
  nome?: string;
  emailCadastro?: string;
  dataNascimento?: string;
  senhaCadastro?: string;
  confirmarSenha?: string;
};

export default function AuthScreen() {
  const { signIn, signUp } = useAuth();

  const [activeTab, setActiveTab] = useState<ActiveTab>('login');
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [loadingCadastro, setLoadingCadastro] = useState(false);

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const [nome, setNome] = useState('');
  const [emailCadastro, setEmailCadastro] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [senhaCadastro, setSenhaCadastro] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  const [erros, setErros] = useState<ErrosForm>({});
  const [larguraTabs, setLarguraTabs] = useState(0);

  const progresso = useSharedValue(0);

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

  const larguraIndicador = Math.max(larguraTabs / 2 - 4, 0);
  const indicadorStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(progresso.value, [0, 1], [0, larguraIndicador]) },
    ],
  }));

  function trocarAba(aba: ActiveTab) {
    setActiveTab(aba);
    setErros({});
    progresso.value = withTiming(aba === 'login' ? 0 : 1, { duration: 350 });
  }

  function validarLogin(): boolean {
    const novos: ErrosForm = {};
    if (!email.trim()) novos.email = 'Informe seu e-mail.';
    else if (!EMAIL_REGEX.test(email)) novos.email = 'Informe um e-mail válido.';
    if (!senha) novos.senha = 'Informe sua senha.';
    setErros(novos);
    return Object.keys(novos).length === 0;
  }

  function validarCadastro(): boolean {
    const novos: ErrosForm = {};
    if (!nome.trim()) novos.nome = 'Informe seu nome completo.';
    if (!emailCadastro.trim()) novos.emailCadastro = 'Informe seu e-mail.';
    else if (!EMAIL_REGEX.test(emailCadastro)) novos.emailCadastro = 'Informe um e-mail válido.';
    if (!dataNascimento) novos.dataNascimento = 'Informe sua data de nascimento.';
    if (!senhaCadastro) novos.senhaCadastro = 'Crie uma senha.';
    else if (!SENHA_REGEX.test(senhaCadastro))
      novos.senhaCadastro =
        'Mínimo 8 caracteres, com maiúscula, minúscula, número e caractere especial.';
    if (!confirmarSenha) novos.confirmarSenha = 'Confirme sua senha.';
    else if (senhaCadastro !== confirmarSenha) novos.confirmarSenha = 'As senhas não conferem.';
    setErros(novos);
    return Object.keys(novos).length === 0;
  }

  async function handleLogin() {
    if (!validarLogin()) return;
    setLoadingLogin(true);
    try {
      await signIn(email, senha);
    } catch {
      setErros({ email: 'Não foi possível entrar. Tente novamente.' });
    } finally {
      setLoadingLogin(false);
    }
  }

  async function handleCadastro() {
    if (!validarCadastro()) return;
    setLoadingCadastro(true);
    try {
      await signUp({ nome, email: emailCadastro, senha: senhaCadastro });
    } catch {
      setErros({ emailCadastro: 'Não foi possível criar a conta. Tente novamente.' });
    } finally {
      setLoadingCadastro(false);
    }
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

          <View style={styles.cartao}>
            {/* Face frontal: Login */}
            <Animated.View
              style={[
                styles.face,
                faceLoginStyle,
                activeTab === 'login' && styles.faceAtiva,
              ]}
            >
              <FloatingTextInput
                label="E-mail"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                error={erros.email}
              />
              <FloatingTextInput
                label="Senha"
                value={senha}
                onChangeText={setSenha}
                secureTextEntry
                showPasswordToggle
                autoCapitalize="none"
                error={erros.senha}
              />
              <View style={styles.botaoWrapper}>
                <PrimaryButton title="Acessar" loading={loadingLogin} onPress={handleLogin} />
              </View>
            </Animated.View>

            {/* Face traseira: Cadastro */}
            <Animated.View
              style={[
                styles.face,
                faceCadastroStyle,
                activeTab === 'register' && styles.faceAtiva,
              ]}
            >
              <FloatingTextInput
                label="Nome Completo"
                value={nome}
                onChangeText={setNome}
                autoCapitalize="words"
                error={erros.nome}
              />
              <FloatingTextInput
                label="E-mail"
                value={emailCadastro}
                onChangeText={setEmailCadastro}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                error={erros.emailCadastro}
              />
              <FloatingTextInput
                label="Data de Nascimento"
                value={dataNascimento}
                onChangeText={(t) => setDataNascimento(aplicarMascaraData(t))}
                keyboardType="number-pad"
                maxLength={10}
                error={erros.dataNascimento}
              />
              <FloatingTextInput
                label="Senha"
                value={senhaCadastro}
                onChangeText={setSenhaCadastro}
                secureTextEntry
                showPasswordToggle
                autoCapitalize="none"
                error={erros.senhaCadastro}
              />
              <FloatingTextInput
                label="Confirmar Senha"
                value={confirmarSenha}
                onChangeText={setConfirmarSenha}
                secureTextEntry
                showPasswordToggle
                autoCapitalize="none"
                error={erros.confirmarSenha}
              />
              <View style={styles.botaoWrapper}>
                <PrimaryButton
                  title="Criar Conta"
                  loading={loadingCadastro}
                  onPress={handleCadastro}
                />
              </View>
            </Animated.View>
          </View>
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
    justifyContent: 'center',
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
    color: '#FFFFFF',
  },
  cartao: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    position: 'relative',
    overflow: 'hidden',
    minHeight: 440,
  },
  face: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
  },
  faceAtiva: {
    zIndex: 2,
  },
  botaoWrapper: {
    marginTop: 24,
  },
  botaoVoltarWrapper: {
    marginTop: 12,
  },
  botaoVoltar: {
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  botaoVoltarTexto: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: '600',
  },
});
