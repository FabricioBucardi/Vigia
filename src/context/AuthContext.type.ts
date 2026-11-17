export type AppUser = {
  idUsuario: number;
  nome: string;
  email: string;
  telefone?: string;
  dataNascimento?: string;
  avatar?: string | null;
};

export type CadastroInput = {
  nome: string;
  email: string;
  telefone: string;
  dataNascimento: string;
  senha: string;
};

export type AuthContextData = {
  user: AppUser | null;
  isLoading: boolean;
  signIn: (email: string, senha: string) => Promise<void>;
  signUp: (dados: CadastroInput) => Promise<void>;
  signOut: () => Promise<void>;
};
