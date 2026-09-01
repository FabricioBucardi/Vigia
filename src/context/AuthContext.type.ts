export type AppUser = {
  idUsuario: number;
  nome: string;
  email: string;
};

export type AuthContextData = {
  user: AppUser | null;
  signIn: (email: string, senha: string) => Promise<void>;
  signUp: (dados: {
    nome: string;
    email: string;
    senha: string;
  }) => Promise<void>;
  signOut: () => void;
};
