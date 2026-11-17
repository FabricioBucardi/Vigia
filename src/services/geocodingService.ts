import { Platform } from 'react-native';
import * as Location from 'expo-location';
import type { Coordenada } from '../types/coordenada';

const TEMPO_LIMITE_GEOCODIFICACAO = 10000;
const TEMPO_LIMITE_GEOCODIFICACAO_NATIVA = 5000;
const TEMPO_LIMITE_BUSCA_ENDERECO = 8000;
const URL_NOMINATIM = 'https://nominatim.openstreetmap.org/reverse';
const URL_BUSCA_PHOTON = 'https://photon.komoot.io/api';
const USER_AGENT_NOMINATIM = 'VigiaApp/1.0';
const LIMITE_SUGESTOES = 6;
export const TAMANHO_MINIMO_BUSCA = 2;

const CENTRO_SCS = {
  latitude: -23.6182,
  longitude: -46.5645,
} as const;

const LIMITES_SCS = {
  latitudeMin: -23.6505777,
  latitudeMax: -23.5994926,
  longitudeMin: -46.5849914,
  longitudeMax: -46.5447131,
} as const;

const MARGEM_BUSCA_SCS = 0.005;
const NOME_SCS = 'sao caetano do sul';

export type SugestaoEndereco = {
  descricao: string;
  coordenada: Coordenada;
};

function comLimiteDeTempo<T>(promessa: Promise<T>, milissegundos: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const temporizador = setTimeout(
      () => reject(new Error('TEMPO_LIMITE_GEOCODIFICACAO')),
      milissegundos,
    );

    promessa.then(
      (valor) => {
        clearTimeout(temporizador);
        resolve(valor);
      },
      (erro) => {
        clearTimeout(temporizador);
        reject(erro);
      },
    );
  });
}

type EnderecoNominatim = {
  road?: string;
  pedestrian?: string;
  footway?: string;
  path?: string;
  neighbourhood?: string;
  suburb?: string;
  city_district?: string;
  city?: string;
  town?: string;
  municipality?: string;
  village?: string;
};

type RespostaNominatim = {
  display_name?: string;
  address?: EnderecoNominatim;
};

type PropriedadesPhoton = {
  name?: string;
  street?: string;
  housenumber?: string;
  district?: string;
  locality?: string;
  city?: string;
  town?: string;
  municipality?: string;
  village?: string;
};

type FeaturePhoton = {
  geometry?: { coordinates?: number[] };
  properties?: PropriedadesPhoton;
};

type RespostaPhoton = {
  features?: FeaturePhoton[];
};

function cabecalhosGeocodificacao(): Record<string, string> {
  const cabecalhos: Record<string, string> = { Accept: 'application/json' };
  if (Platform.OS !== 'web') {
    cabecalhos['User-Agent'] = USER_AGENT_NOMINATIM;
  }
  return cabecalhos;
}

function dentroDeSCS(latitude: number, longitude: number): boolean {
  return (
    latitude >= LIMITES_SCS.latitudeMin - MARGEM_BUSCA_SCS &&
    latitude <= LIMITES_SCS.latitudeMax + MARGEM_BUSCA_SCS &&
    longitude >= LIMITES_SCS.longitudeMin - MARGEM_BUSCA_SCS &&
    longitude <= LIMITES_SCS.longitudeMax + MARGEM_BUSCA_SCS
  );
}

function cidadeEhSCS(endereco: PropriedadesPhoton | undefined): boolean {
  const cidade =
    endereco?.city ??
    endereco?.town ??
    endereco?.municipality ??
    endereco?.village;
  if (!cidade) return true;
  return cidade.trim().toLowerCase().replace(/ã/g, 'a') === NOME_SCS;
}

function juntarPartes(partes: Array<string | null | undefined>): string | null {
  const filtradas = partes
    .map((parte) => parte?.trim())
    .filter((parte): parte is string => Boolean(parte));

  return filtradas.length > 0 ? filtradas.join(', ') : null;
}

function formatarEnderecoNativo(
  endereco: Location.LocationGeocodedAddress | undefined,
): string | null {
  if (!endereco) return null;

  const formatado = juntarPartes([
    endereco.street ?? endereco.name,
    endereco.district ?? endereco.subregion,
    endereco.city ?? endereco.region,
  ]);

  return formatado ?? endereco.formattedAddress ?? null;
}

function formatarEnderecoNominatim(
  resposta: RespostaNominatim,
): string | null {
  const endereco = resposta.address;
  if (!endereco) return resposta.display_name ?? null;

  const formatado = juntarPartes([
    endereco.road ??
      endereco.pedestrian ??
      endereco.footway ??
      endereco.path,
    endereco.neighbourhood ?? endereco.suburb ?? endereco.city_district,
    endereco.city ??
      endereco.town ??
      endereco.municipality ??
      endereco.village,
  ]);

  return formatado ?? resposta.display_name ?? null;
}

function formatarSugestaoPhoton(
  propriedades: PropriedadesPhoton,
): string | null {
  const nome = propriedades.name?.trim();
  const via = propriedades.street?.trim();
  const numero = propriedades.housenumber?.trim();
  const logradouro = via && numero ? `${via}, ${numero}` : nome ?? via ?? null;

  return juntarPartes([
    logradouro,
    propriedades.district ?? propriedades.locality,
    propriedades.city ??
      propriedades.town ??
      propriedades.municipality ??
      propriedades.village,
  ]);
}

export async function buscarEnderecos(
  termo: string,
  signal?: AbortSignal,
): Promise<SugestaoEndereco[]> {
  const termoLimpo = termo.trim();
  if (termoLimpo.length < TAMANHO_MINIMO_BUSCA) return [];

  const url =
    `${URL_BUSCA_PHOTON}?q=${encodeURIComponent(termoLimpo)}` +
    `&bbox=${LIMITES_SCS.longitudeMin},${LIMITES_SCS.latitudeMin},` +
    `${LIMITES_SCS.longitudeMax},${LIMITES_SCS.latitudeMax}` +
    `&lat=${CENTRO_SCS.latitude}&lon=${CENTRO_SCS.longitude}` +
    `&limit=${LIMITE_SUGESTOES}&dedupe=1`;

  const controlador = new AbortController();
  const temporizador = setTimeout(
    () => controlador.abort(),
    TEMPO_LIMITE_BUSCA_ENDERECO,
  );
  const abortarExternamente = () => controlador.abort();

  if (signal) {
    if (signal.aborted) controlador.abort();
    else signal.addEventListener('abort', abortarExternamente, { once: true });
  }

  try {
    const resposta = await fetch(url, {
      headers: cabecalhosGeocodificacao(),
      signal: controlador.signal,
    });

    if (!resposta.ok) return [];

    const dados = (await resposta.json()) as RespostaPhoton;

    const resultados = (dados.features ?? [])
      .map((feature) => {
        const coordenadas = feature.geometry?.coordinates;
        const longitude = coordenadas?.[0];
        const latitude = coordenadas?.[1];
        const descricao = feature.properties
          ? formatarSugestaoPhoton(feature.properties)
          : null;

        if (
          typeof latitude !== 'number' ||
          typeof longitude !== 'number' ||
          !descricao ||
          !dentroDeSCS(latitude, longitude) ||
          !cidadeEhSCS(feature.properties)
        ) {
          return null;
        }

        return { descricao, coordenada: { latitude, longitude } };
      })
      .filter((sugestao): sugestao is SugestaoEndereco => sugestao !== null);

    const descricoesVistas = new Set<string>();
    return resultados.filter((sugestao) => {
      if (descricoesVistas.has(sugestao.descricao)) return false;
      descricoesVistas.add(sugestao.descricao);
      return true;
    });
  } finally {
    clearTimeout(temporizador);
    signal?.removeEventListener('abort', abortarExternamente);
  }
}

async function geocodificarNativo(
  coordenada: Coordenada,
): Promise<string | null> {
  try {
    const resultados = await comLimiteDeTempo(
      Location.reverseGeocodeAsync(coordenada),
      TEMPO_LIMITE_GEOCODIFICACAO_NATIVA,
    );
    return formatarEnderecoNativo(resultados[0]);
  } catch {
    return null;
  }
}

async function geocodificarNominatim(
  coordenada: Coordenada,
): Promise<string | null> {
  const url =
    `${URL_NOMINATIM}?format=jsonv2&addressdetails=1&accept-language=pt-BR` +
    `&lat=${coordenada.latitude}&lon=${coordenada.longitude}`;

  const controlador = new AbortController();
  const temporizador = setTimeout(
    () => controlador.abort(),
    TEMPO_LIMITE_GEOCODIFICACAO,
  );

  try {
    const resposta = await fetch(url, {
      headers: cabecalhosGeocodificacao(),
      signal: controlador.signal,
    });

    if (!resposta.ok) return null;

    const dados = (await resposta.json()) as RespostaNominatim;
    return formatarEnderecoNominatim(dados);
  } catch {
    return null;
  } finally {
    clearTimeout(temporizador);
  }
}

export async function obterEndereco(
  coordenada: Coordenada,
): Promise<string | null> {
  if (Platform.OS !== 'web') {
    const enderecoNativo = await geocodificarNativo(coordenada);
    if (enderecoNativo) return enderecoNativo;
  }

  return geocodificarNominatim(coordenada);
}
