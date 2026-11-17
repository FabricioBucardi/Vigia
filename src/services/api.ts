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

const CAMPOS_SENSIVEIS = new Set([
  'senha',
  'password',
  'token',
  'accesstoken',
  'authorization',
]);

function sanitizar(dados: unknown): unknown {
  if (Array.isArray(dados)) return dados.map(sanitizar);
  if (dados && typeof dados === 'object') {
    const resultado: Record<string, unknown> = {};
    for (const [chave, valor] of Object.entries(dados as Record<string, unknown>)) {
      resultado[chave] = CAMPOS_SENSIVEIS.has(chave.toLowerCase())
        ? '***'
        : sanitizar(valor);
    }
    return resultado;
  }
  return dados;
}

export async function apiFetch<T>(
  caminho: string,
  opcoes: ApiOptions = {},
): Promise<T> {
  const tokenEfetivo = opcoes.token === undefined ? tokenAtual : opcoes.token;
  const metodo = opcoes.method ?? 'GET';
  const url = montarUrl(caminho);

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (opcoes.body !== undefined) headers['Content-Type'] = 'application/json';
  if (tokenEfetivo) headers.Authorization = `Bearer ${tokenEfetivo}`;

  if (__DEV__) {
    console.log(
      '[api] →',
      metodo,
      url,
      opcoes.body !== undefined ? sanitizar(opcoes.body) : '',
    );
  }

  let resposta: Response;
  try {
    resposta = await fetch(url, {
      method: metodo,
      headers,
      body:
        opcoes.body === undefined || typeof opcoes.body === 'string'
          ? opcoes.body
          : JSON.stringify(opcoes.body),
    });
  } catch {
    if (__DEV__) console.log('[api] x', metodo, url, 'falha de rede');
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

  if (__DEV__) {
    console.log('[api] ←', resposta.status, metodo, url, sanitizar(dados));
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
