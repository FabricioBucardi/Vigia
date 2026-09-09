import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import CheckboxTermos from '../../components/CheckboxTermos';
import FloatingTextInput from '../../components/FloatingTextInput';
import PrimaryButton from '../../components/PrimaryButton';
import RequisitoSenha, {
  REGRAS_SENHA,
  checarRequisitosSenha,
} from '../../components/RequisitoSenha';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../styles/colors';
import { aplicarMascaraData, dataCoerente } from '../../utils/dateUtils';
import { EMAIL_REGEX } from '../../utils/validators';
import useCampoVisita from './useCampoVisita';

export default function CadastroWizard() {
  const { signUp } = useAuth();

  const [nome, setNome] = useState('');
  const [emailCadastro, setEmailCadastro] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [senhaCadastro, setSenhaCadastro] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [termosAceitos, setTermosAceitos] = useState(false);
  const [erroEnvio, setErroEnvio] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [passo, setPasso] = useState<'dados' | 'senha'>('dados');

  const campoVisita = useCampoVisita();
  const passoSenha = useSharedValue(0);

  const subDadosStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: `${interpolate(passoSenha.value, [0, 1], [0, -110])}%` },
    ],
    opacity: interpolate(passoSenha.value, [0, 1], [1, 0]),
  }));
  const subSenhaStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: `${interpolate(passoSenha.value, [0, 1], [110, 0])}%` },
    ],
    opacity: interpolate(passoSenha.value, [0, 1], [0, 1]),
  }));

  const partesNome = nome.trim().split(/\s+/);
  const isNomeValido =
    partesNome.length >= 2 && partesNome.every((p) => p.length >= 2);
  const isEmailValido = EMAIL_REGEX.test(emailCadastro.trim());
  const isDataValida = dataCoerente(dataNascimento);
  const checagens = checarRequisitosSenha(senhaCadastro);
  const isSenhaValida = REGRAS_SENHA.every((regra) => checagens[regra.chave]);
  const isConfirmacaoValida =
    confirmarSenha.length > 0 && confirmarSenha === senhaCadastro;

  const erroConfirmacao =
    confirmarSenha.length > 0 && confirmarSenha !== senhaCadastro
      ? 'As senhas devem ser iguais'
      : null;
  const isFormularioValido =
    isNomeValido &&
    isEmailValido &&
    isDataValida &&
    isSenhaValida &&
    isConfirmacaoValida &&
    termosAceitos;

  const erroNome =
    campoVisita.tocado('nome') && !campoVisita.focado('nome') && !isNomeValido
      ? 'Informe nome e sobrenome.'
      : undefined;
  const erroEmailCadastro =
    campoVisita.tocado('email') && !campoVisita.focado('email') && !isEmailValido
      ? 'Informe um e-mail válido.'
      : undefined;
  const erroData =
    campoVisita.tocado('data') && !campoVisita.focado('data') && !isDataValida
      ? 'Data inválida. Use o formato DD/MM/AAAA.'
      : undefined;

  function irParaSenha() {
    setPasso('senha');
    setErroEnvio(null);
    passoSenha.value = withTiming(1, { duration: 350 });
  }

  function voltarParaDados() {
    setPasso('dados');
    passoSenha.value = withTiming(0, { duration: 350 });
  }

  async function handleCadastro() {
    setLoading(true);
    setErroEnvio(null);
    try {
      await signUp({ nome, email: emailCadastro, senha: senhaCadastro });
    } catch {
      setErroEnvio('Não foi possível criar a conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View>
      {/* Passo 1: Dados */}
      <Animated.View
        style={[styles.subFace, passo === 'dados' && styles.subFaceAtiva, subDadosStyle]}
        pointerEvents={passo === 'dados' ? 'auto' : 'none'}
      >
        <FloatingTextInput
          label="Nome Completo"
          value={nome}
          onChangeText={setNome}
          autoCapitalize="words"
          onFocus={() => campoVisita.onFocus('nome')}
          onBlur={() => campoVisita.onBlur('nome')}
          error={erroNome}
        />
        <FloatingTextInput
          label="E-mail"
          value={emailCadastro}
          onChangeText={setEmailCadastro}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          onFocus={() => campoVisita.onFocus('email')}
          onBlur={() => campoVisita.onBlur('email')}
          error={erroEmailCadastro}
        />
        <FloatingTextInput
          label="Data de Nascimento"
          value={dataNascimento}
          onChangeText={(t) => setDataNascimento(aplicarMascaraData(t))}
          keyboardType="number-pad"
          maxLength={10}
          placeholder="DD/MM/AAAA"
          onFocus={() => campoVisita.onFocus('data')}
          onBlur={() => campoVisita.onBlur('data')}
          error={erroData}
        />
        <View style={styles.botaoWrapper}>
          <PrimaryButton
            title="Próximo"
            disabled={!isNomeValido || !isEmailValido || !isDataValida}
            onPress={irParaSenha}
          />
        </View>
      </Animated.View>

      {/* Passo 2: Senha */}
      <Animated.View
        style={[styles.subFace, passo === 'senha' && styles.subFaceAtiva, subSenhaStyle]}
        pointerEvents={passo === 'senha' ? 'auto' : 'none'}
      >
        <FloatingTextInput
          label="Senha"
          value={senhaCadastro}
          onChangeText={setSenhaCadastro}
          secureTextEntry
          showPasswordToggle
          autoCapitalize="none"
        />
        <View style={styles.checklist}>
          {REGRAS_SENHA.map(({ chave, rotulo }) => (
            <RequisitoSenha key={chave} texto={rotulo} atendida={checagens[chave]} />
          ))}
        </View>
        <FloatingTextInput
          label="Confirmar Senha"
          value={confirmarSenha}
          onChangeText={setConfirmarSenha}
          secureTextEntry
          showPasswordToggle
          autoCapitalize="none"
          error={erroConfirmacao}
          disableShake
          onFocus={() => campoVisita.onFocus('confirmar')}
          onBlur={() => campoVisita.onBlur('confirmar')}
        />
        <CheckboxTermos
          aceito={termosAceitos}
          onChange={() => setTermosAceitos((prev) => !prev)}
        />
        {erroEnvio ? <Text style={styles.erroEnvio}>{erroEnvio}</Text> : null}
        <View style={styles.botaoWrapper}>
          <PrimaryButton
            title="Criar Conta"
            loading={loading}
            disabled={!isFormularioValido}
            onPress={handleCadastro}
          />
        </View>
        <View style={styles.botaoVoltarWrapper}>
          <Pressable style={styles.botaoVoltar} onPress={voltarParaDados}>
            <Text style={styles.botaoVoltarTexto}>Voltar</Text>
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  subFace: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  subFaceAtiva: {
    zIndex: 2,
    position: 'relative',
  },
  botaoWrapper: {
    marginTop: 24,
  },
  checklist: {
    marginTop: 8,
    gap: 6,
    marginBottom: 16,
  },
  erroEnvio: {
    color: COLORS.danger,
    fontSize: 13,
    fontWeight: '500',
    marginTop: 12,
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
