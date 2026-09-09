import React, { createContext, useContext, useCallback, useMemo, useState } from 'react';
import { AppUser, AuthContextData } from './AuthContext.type';

type AuthProviderProps = {
  children: React.ReactNode;
};

const AuthContext = createContext<AuthContextData | undefined>(undefined);

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AppUser | null>(null);

  const signIn = useCallback(
    async (email: string, _senha: string) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setUser({ idUsuario: 101, nome: 'Fernando Domingues', email });
    },
    [],
  );

  const signUp = useCallback(
    async (dados: { nome: string; email: string; senha: string }) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setUser({ idUsuario: 101, nome: dados.nome, email: dados.email });
    },
    [],
  );

  const signOut = useCallback(() => {
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, signIn, signUp, signOut }),
    [user, signIn, signUp, signOut],
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
