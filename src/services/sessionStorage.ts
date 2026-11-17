import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import type { AppUser } from '../context/AuthContext.type';

const CHAVE_TOKEN = 'vigia.token';
const CHAVE_USUARIO = 'vigia.usuario';

export type Sessao = {
  token: string;
  usuario: AppUser;
};

function webStorage(): Storage | null {
  if (typeof localStorage === 'undefined') return null;
  return localStorage;
}

async function gravar(chave: string, valor: string): Promise<void> {
  if (Platform.OS === 'web') {
    webStorage()?.setItem(chave, valor);
    return;
  }
  await SecureStore.setItemAsync(chave, valor);
}

async function ler(chave: string): Promise<string | null> {
  if (Platform.OS === 'web') return webStorage()?.getItem(chave) ?? null;
  return SecureStore.getItemAsync(chave);
}

async function remover(chave: string): Promise<void> {
  if (Platform.OS === 'web') {
    webStorage()?.removeItem(chave);
    return;
  }
  await SecureStore.deleteItemAsync(chave);
}

export async function salvarSessao(sessao: Sessao): Promise<void> {
  await Promise.all([
    gravar(CHAVE_TOKEN, sessao.token),
    gravar(CHAVE_USUARIO, JSON.stringify(sessao.usuario)),
  ]);
}

export async function carregarSessao(): Promise<Sessao | null> {
  const [token, usuarioJson] = await Promise.all([
    ler(CHAVE_TOKEN),
    ler(CHAVE_USUARIO),
  ]);
  if (!token || !usuarioJson) return null;

  try {
    const usuario = JSON.parse(usuarioJson) as Partial<AppUser>;
    if (
      typeof usuario.idUsuario !== 'number' ||
      typeof usuario.nome !== 'string' ||
      typeof usuario.email !== 'string'
    ) {
      return null;
    }
    return { token, usuario: usuario as AppUser };
  } catch {
    return null;
  }
}

export async function limparSessao(): Promise<void> {
  await Promise.all([remover(CHAVE_TOKEN), remover(CHAVE_USUARIO)]);
}
