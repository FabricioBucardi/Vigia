import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../styles/colors';

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

export default function AuthScreen() {
  const { signIn, signUp } = useAuth();

  const [activeTab, setActiveTab] = useState<ActiveTab>('login');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const [nome, setNome] = useState('');
  const [emailCadastro, setEmailCadastro] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [senhaCadastro, setSenhaCadastro] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [mostrarSenhaCadastro, setMostrarSenhaCadastro] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);

  function trocarAba(aba: ActiveTab) {
    setActiveTab(aba);
    setErro(null);
  }

  function validarLogin(): boolean {
    if (!email.trim() || !senha) {
      setErro('Preencha e-mail e senha para acessar.');
      return false;
    }
    if (!EMAIL_REGEX.test(email)) {
      setErro('Informe um e-mail válido.');
      return false;
    }
    return true;
  }

  function validarCadastro(): boolean {
    if (!nome.trim() || !emailCadastro.trim() || !dataNascimento || !senhaCadastro || !confirmarSenha) {
      setErro('Preencha todos os campos para criar a conta.');
      return false;
    }
    if (!EMAIL_REGEX.test(emailCadastro)) {
      setErro('Informe um e-mail válido.');
      return false;
    }
    if (!SENHA_REGEX.test(senhaCadastro)) {
      setErro(
        'A senha deve ter ao menos 8 caracteres, com letra maiúscula, letra minúscula, número e caractere especial.'
      );
      return false;
    }
    if (senhaCadastro !== confirmarSenha) {
      setErro('As senhas não conferem.');
      return false;
    }
    return true;
  }

  async function handleLogin() {
    if (!validarLogin()) return;
    setLoading(true);
    setErro(null);
    try {
      await signIn(email, senha);
    } catch {
      setErro('Não foi possível entrar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  async function handleCadastro() {
    if (!validarCadastro()) return;
    setLoading(true);
    setErro(null);
    try {
      await signUp({ nome, email: emailCadastro, senha: senhaCadastro });
    } catch {
      setErro('Não foi possível criar a conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <MaterialCommunityIcons name="shield-home" size={72} color={COLORS.primary} />
            <Text style={styles.title}>VIGIA</Text>
          </View>

          <View style={styles.tabs}>
            <Pressable
              style={[styles.tab, activeTab === 'login' && styles.tabAtiva]}
              onPress={() => trocarAba('login')}
            >
              <Text style={[styles.tabText, activeTab === 'login' && styles.tabTextAtiva]}>
                Entrar
              </Text>
            </Pressable>
            <Pressable
              style={[styles.tab, activeTab === 'register' && styles.tabAtiva]}
              onPress={() => trocarAba('register')}
            >
              <Text style={[styles.tabText, activeTab === 'register' && styles.tabTextAtiva]}>
                Cadastrar
              </Text>
            </Pressable>
          </View>

          {erro && (
            <View style={styles.erroBox}>
              <Text style={styles.erroText}>{erro}</Text>
            </View>
          )}

          <View style={styles.card}>
            {activeTab === 'login' ? (
              <>
                <Text style={styles.label}>E-mail</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="seu@email.com"
                  placeholderTextColor={COLORS.textLight}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <Text style={styles.label}>Senha</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.inputComIcone}
                    value={senha}
                    onChangeText={setSenha}
                    placeholder="Sua senha"
                    placeholderTextColor={COLORS.textLight}
                    secureTextEntry={!mostrarSenha}
                    autoCapitalize="none"
                  />
                  <Pressable onPress={() => setMostrarSenha((v) => !v)} style={styles.olho}>
                    <MaterialCommunityIcons
                      name={mostrarSenha ? 'eye-off' : 'eye'}
                      size={24}
                      color={COLORS.textLight}
                    />
                  </Pressable>
                </View>

                <Pressable
                  style={[styles.botaoPrimario, loading && styles.botaoDesabilitado]}
                  onPress={handleLogin}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.botaoTexto}>Acessar</Text>
                  )}
                </Pressable>
              </>
            ) : (
              <>
                <Text style={styles.label}>Nome Completo</Text>
                <TextInput
                  style={styles.input}
                  value={nome}
                  onChangeText={setNome}
                  placeholder="Seu nome completo"
                  placeholderTextColor={COLORS.textLight}
                  autoCapitalize="words"
                />
                <Text style={styles.label}>E-mail</Text>
                <TextInput
                  style={styles.input}
                  value={emailCadastro}
                  onChangeText={setEmailCadastro}
                  placeholder="seu@email.com"
                  placeholderTextColor={COLORS.textLight}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <Text style={styles.label}>Data de Nascimento</Text>
                <TextInput
                  style={styles.input}
                  value={dataNascimento}
                  onChangeText={(t) => setDataNascimento(aplicarMascaraData(t))}
                  placeholder="DD/MM/AAAA"
                  placeholderTextColor={COLORS.textLight}
                  keyboardType="number-pad"
                  maxLength={10}
                />
                <Text style={styles.label}>Senha</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.inputComIcone}
                    value={senhaCadastro}
                    onChangeText={setSenhaCadastro}
                    placeholder="Crie uma senha forte"
                    placeholderTextColor={COLORS.textLight}
                    secureTextEntry={!mostrarSenhaCadastro}
                    autoCapitalize="none"
                  />
                  <Pressable
                    onPress={() => setMostrarSenhaCadastro((v) => !v)}
                    style={styles.olho}
                  >
                    <MaterialCommunityIcons
                      name={mostrarSenhaCadastro ? 'eye-off' : 'eye'}
                      size={24}
                      color={COLORS.textLight}
                    />
                  </Pressable>
                </View>
                <Text style={styles.label}>Confirmar Senha</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.inputComIcone}
                    value={confirmarSenha}
                    onChangeText={setConfirmarSenha}
                    placeholder="Repita a senha"
                    placeholderTextColor={COLORS.textLight}
                    secureTextEntry={!mostrarConfirmarSenha}
                    autoCapitalize="none"
                  />
                  <Pressable
                    onPress={() => setMostrarConfirmarSenha((v) => !v)}
                    style={styles.olho}
                  >
                    <MaterialCommunityIcons
                      name={mostrarConfirmarSenha ? 'eye-off' : 'eye'}
                      size={24}
                      color={COLORS.textLight}
                    />
                  </Pressable>
                </View>

                <Pressable
                  style={[styles.botaoPrimario, loading && styles.botaoDesabilitado]}
                  onPress={handleCadastro}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.botaoTexto}>Criar Conta</Text>
                  )}
                </Pressable>
              </>
            )}
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
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.primary,
    letterSpacing: 4,
    marginTop: 8,
  },
  tabs: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabAtiva: {
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
  erroBox: {
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  erroText: {
    color: COLORS.danger,
    textAlign: 'center',
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.textDark,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
  },
  inputComIcone: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.textDark,
  },
  olho: {
    paddingHorizontal: 12,
  },
  botaoPrimario: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  botaoDesabilitado: {
    opacity: 0.7,
  },
  botaoTexto: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
