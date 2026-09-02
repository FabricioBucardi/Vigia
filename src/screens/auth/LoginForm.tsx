import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import FloatingTextInput from '../../components/FloatingTextInput';
import PrimaryButton from '../../components/PrimaryButton';
import { useAuth } from '../../context/AuthContext';
import { EMAIL_REGEX } from '../../utils/validators';

type ErrosForm = {
  email?: string;
  senha?: string;
};

export default function LoginForm() {
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erros, setErros] = useState<ErrosForm>({});
  const [loading, setLoading] = useState(false);

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

  async function handleLogin() {
    if (!validarLogin()) return;
    setLoading(true);
    try {
      await signIn(email, senha);
    } catch {
      setErros({ email: 'Não foi possível entrar. Tente novamente.' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <View>
      <View style={styles.grupoCampos}>
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
      </View>
      <View style={styles.botaoWrapper}>
        <PrimaryButton title="Acessar" loading={loading} onPress={handleLogin} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grupoCampos: {
    gap: 16,
  },
  botaoWrapper: {
    marginTop: 24,
  },
});
