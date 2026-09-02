import { useEffect, useState } from 'react';
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
  Easing,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useAuth } from '../../context/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
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

type RequisitosSenha = {
  minimo8: boolean;
  maiuscula: boolean;
  minuscula: boolean;
  numero: boolean;
  especial: boolean;
};

function checarRequisitosSenha(senha: string): RequisitosSenha {
  return {
    minimo8: senha.length >= 8,
    maiuscula: /[A-Z]/.test(senha),
    minuscula: /[a-z]/.test(senha),
    numero: /\d/.test(senha),
    especial: /[^A-Za-z0-9]/.test(senha),
  };
}

type RegraSenha = { chave: keyof RequisitosSenha; rotulo: string };

const REGRAS_SENHA: RegraSenha[] = [
  { chave: 'minimo8', rotulo: 'Mínimo de 8 caracteres' },
  { chave: 'maiuscula', rotulo: 'Pelo menos 1 letra maiúscula' },
  { chave: 'minuscula', rotulo: 'Pelo menos 1 letra minúscula' },
  { chave: 'numero', rotulo: 'Pelo menos 1 número' },
  { chave: 'especial', rotulo: 'Pelo menos 1 caractere especial' },
];

function ItemRegra({ texto, atendida }: { texto: string; atendida: boolean }) {
  const progresso = useSharedValue(atendida ? 1 : 0);

  useEffect(() => {
    progresso.value = withTiming(atendida ? 1 : 0, {
      duration: 300,
      easing: Easing.out(Easing.cubic),
    });
  }, [atendida, progresso]);

  const estiloBolinha = useAnimatedStyle(() => ({
    opacity: 1 - progresso.value,
    transform: [{ scale: 1 - progresso.value * 0.25 }],
  }));
  const estiloCheck = useAnimatedStyle(() => ({
    opacity: progresso.value,
    transform: [{ scale: 0.4 + progresso.value * 0.6 }],
  }));
  const estiloTexto = useAnimatedStyle(() => ({
    color: interpolateColor(
      progresso.value,
      [0, 1],
      [COLORS.textLight, COLORS.success]
    ),
  }));

  return (
    <View style={styles.regra}>
      <View style={styles.icone}>
        <Animated.View style={[StyleSheet.absoluteFill, estiloBolinha]}>
          <MaterialCommunityIcons
            name="circle-outline"
            size={18}
            color={COLORS.textLight}
          />
        </Animated.View>
        <Animated.View style={[StyleSheet.absoluteFill, estiloCheck]}>
          <MaterialCommunityIcons
            name="check-circle"
            size={18}
            color={COLORS.success}
          />
        </Animated.View>
      </View>
      <Animated.Text style={[styles.regraTexto, estiloTexto]}>{texto}</Animated.Text>
    </View>
  );
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
  const [senhaFocada, setSenhaFocada] = useState(false);

  const [erros, setErros] = useState<ErrosForm>({});
  const [larguraTabs, setLarguraTabs] = useState(0);
  const [alturaLogin, setAlturaLogin] = useState(0);
  const [alturaCadastro, setAlturaCadastro] = useState(0);

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
  const alturaCartao = Math.max(alturaLogin, alturaCadastro);
  const checagens = checarRequisitosSenha(senhaCadastro);
  const senhaValida = REGRAS_SENHA.every((regra) => checagens[regra.chave]);
  const mostrarChecklistSenha = senhaFocada || senhaCadastro.length > 0;
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

  function limparErro(campo: keyof ErrosForm) {
    setErros((prev) => {
      if (!prev[campo]) return prev;
      const copia = { ...prev };
      delete copia[campo];
      return copia;
    });
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

          <View
            style={[
              styles.cartao,
              alturaCartao > 0 && { height: alturaCartao + 40 },
            ]}
          >
            {/* Face frontal: Login */}
            <Animated.View
              style={[
                styles.face,
                faceLoginStyle,
                activeTab === 'login' && styles.faceAtiva,
              ]}
              onLayout={(e) => setAlturaLogin(e.nativeEvent.layout.height)}
            >
              <FloatingTextInput
                label="E-mail"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                error={erros.email}
                onClearError={() => limparErro('email')}
              />
              <FloatingTextInput
                label="Senha"
                value={senha}
                onChangeText={setSenha}
                secureTextEntry
                showPasswordToggle
                autoCapitalize="none"
                error={erros.senha}
                onClearError={() => limparErro('senha')}
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
              onLayout={(e) => setAlturaCadastro(e.nativeEvent.layout.height)}
            >
              <FloatingTextInput
                label="Nome Completo"
                value={nome}
                onChangeText={setNome}
                autoCapitalize="words"
                error={erros.nome}
                onClearError={() => limparErro('nome')}
              />
              <FloatingTextInput
                label="E-mail"
                value={emailCadastro}
                onChangeText={setEmailCadastro}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                error={erros.emailCadastro}
                onClearError={() => limparErro('emailCadastro')}
              />
              <FloatingTextInput
                label="Data de Nascimento"
                value={dataNascimento}
                onChangeText={(t) => setDataNascimento(aplicarMascaraData(t))}
                keyboardType="number-pad"
                maxLength={10}
                placeholder="DD/MM/AAAA"
                error={erros.dataNascimento}
                onClearError={() => limparErro('dataNascimento')}
              />
              <FloatingTextInput
                label="Senha"
                value={senhaCadastro}
                onChangeText={setSenhaCadastro}
                secureTextEntry
                showPasswordToggle
                autoCapitalize="none"
                onFocus={() => setSenhaFocada(true)}
                onBlur={() => setSenhaFocada(false)}
                error={erros.senhaCadastro}
                onClearError={() => limparErro('senhaCadastro')}
              />
              {mostrarChecklistSenha && (
                <View style={styles.checklist}>
                  {REGRAS_SENHA.map(({ chave, rotulo }) => (
                    <ItemRegra
                      key={chave}
                      texto={rotulo}
                      atendida={checagens[chave]}
                    />
                  ))}
                </View>
              )}
              <FloatingTextInput
                label="Confirmar Senha"
                value={confirmarSenha}
                onChangeText={setConfirmarSenha}
                secureTextEntry
                showPasswordToggle
                autoCapitalize="none"
                error={erros.confirmarSenha}
                onClearError={() => limparErro('confirmarSenha')}
              />
              <View style={styles.botaoWrapper}>
                <PrimaryButton
                  title="Criar Conta"
                  loading={loadingCadastro}
                  disabled={!senhaValida}
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
  checklist: {
    marginTop: 8,
    gap: 6,
  },
  regra: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  icone: {
    width: 18,
    height: 18,
  },
  regraTexto: {
    fontSize: 13,
    fontWeight: '500',
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
