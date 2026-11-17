import { apiFetch } from './api';

export type UsuarioApi = {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  dataNascimento: string;
  avatar: string | null;
};

export type LoginApiResponse = {
  token: string;
  usuario: UsuarioApi;
};

export type CadastroApiInput = {
  nome: string;
  email: string;
  telefone: string;
  dataNascimento: string;
  senha: string;
};

export function login(
  email: string,
  senha: string,
): Promise<LoginApiResponse> {
  return apiFetch<LoginApiResponse>('/auth/login', {
    method: 'POST',
    body: { email, senha },
    token: null,
  });
}

export function cadastrar(dados: CadastroApiInput): Promise<UsuarioApi> {
  return apiFetch<UsuarioApi>('/auth/cadastro', {
    method: 'POST',
    body: dados,
    token: null,
  });
}
