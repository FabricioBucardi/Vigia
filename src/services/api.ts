const API_URL = (
  process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080/api'
).replace(/\/+$/, '');

let tokenAtual: string | null = null;

export function definirToken(token: string | null) {
  tokenAtual = token;
}

export class ApiError extends Error {
  readonly status: number;
  readonly dados: unknown;

  constructor(status: number, mensagem: string, dados?: unknown) {
    super(mensagem);
    this.name = 'ApiError';
    this.status = status;
    this.dados = dados;
  }
}

type ApiOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  token?: string | null;
};

function montarUrl(caminho: string): string {
  if (/^https?:\/\//i.test(caminho)) return caminho;
  return `${API_URL}${caminho.startsWith('/') ? caminho : `/${caminho}`}`;
}

export async function apiFetch<T>(
  caminho: string,
  opcoes: ApiOptions = {},
): Promise<T> {
  const tokenEfetivo = opcoes.token === undefined ? tokenAtual : opcoes.token;

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (opcoes.body !== undefined) headers['Content-Type'] = 'application/json';
  if (tokenEfetivo) headers.Authorization = `Bearer ${tokenEfetivo}`;

  let resposta: Response;
  try {
    resposta = await fetch(montarUrl(caminho), {
      method: opcoes.method ?? 'GET',
      headers,
      body:
        opcoes.body === undefined || typeof opcoes.body === 'string'
          ? opcoes.body
          : JSON.stringify(opcoes.body),
    });
  } catch {
    throw new ApiError(
      0,
      'Não foi possível conectar ao servidor. Verifique sua conexão.',
    );
  }

  const texto = await resposta.text();
  let dados: unknown = null;
  if (texto) {
    try {
      dados = JSON.parse(texto);
    } catch {
      dados = texto;
    }
  }

  if (!resposta.ok) {
    const corpo = dados as { mensagem?: string; erro?: string } | null;
    const mensagem =
      corpo?.mensagem ??
      corpo?.erro ??
      (resposta.status === 401
        ? 'Sessão expirada. Faça login novamente.'
        : `Erro ${resposta.status} ao acessar o servidor.`);
    throw new ApiError(resposta.status, mensagem, dados);
  }

  return dados as T;
}
