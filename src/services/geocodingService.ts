import { Platform } from 'react-native';
import * as Location from 'expo-location';
import type { Coordenada } from '../types/coordenada';

const TEMPO_LIMITE_GEOCODIFICACAO = 10000;
const TEMPO_LIMITE_GEOCODIFICACAO_NATIVA = 5000;
const URL_NOMINATIM = 'https://nominatim.openstreetmap.org/reverse';

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
      headers: { Accept: 'application/json' },
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
