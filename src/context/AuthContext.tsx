import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { AppUser, AuthContextData, CadastroInput } from './AuthContext.type';
import { definirToken } from '../services/api';
import { cadastrar, login, UsuarioApi } from '../services/authService';
import {
  carregarSessao,
  limparSessao,
  salvarSessao,
} from '../services/sessionStorage';

type AuthProviderProps = {
  children: React.ReactNode;
};

const AuthContext = createContext<AuthContextData | undefined>(undefined);

function mapearUsuario(usuario: UsuarioApi): AppUser {
  return {
    idUsuario: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    telefone: usuario.telefone,
    dataNascimento: usuario.dataNascimento,
    avatar: usuario.avatar,
  };
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let ativo = true;

    async function restaurarSessao() {
      try {
        const sessao = await carregarSessao();
        if (!ativo || !sessao) return;
        definirToken(sessao.token);
        setUser(sessao.usuario);
      } catch {
        definirToken(null);
      } finally {
        if (ativo) setIsLoading(false);
      }
    }

    restaurarSessao();

    return () => {
      ativo = false;
    };
  }, []);

  const signIn = useCallback(async (email: string, senha: string) => {
    const { token, usuario } = await login(email, senha);
    const usuarioApp = mapearUsuario(usuario);
    definirToken(token);
    setUser(usuarioApp);
    try {
      await salvarSessao({ token, usuario: usuarioApp });
    } catch {}
  }, []);

  const signUp = useCallback(
    async (dados: CadastroInput) => {
      await cadastrar(dados);
      await signIn(dados.email, dados.senha);
    },
    [signIn],
  );

  const signOut = useCallback(async () => {
    definirToken(null);
    setUser(null);
    try {
      await limparSessao();
    } catch {}
  }, []);

  const value = useMemo(
    () => ({ user, isLoading, signIn, signUp, signOut }),
    [user, isLoading, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextData {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
