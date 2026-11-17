import { COLORS } from '../styles/colors';
import type { Bairro } from '../types/bairro';
import type { Reporte } from '../types/report';

const RAIO_TERRA_KM = 6371;

function emRadianos(graus: number): number {
  return (graus * Math.PI) / 180;
}

export function distanciaKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const deltaLat = emRadianos(lat2 - lat1);
  const deltaLon = emRadianos(lon2 - lon1);
  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(emRadianos(lat1)) *
      Math.cos(emRadianos(lat2)) *
      Math.sin(deltaLon / 2) ** 2;
  return 2 * RAIO_TERRA_KM * Math.asin(Math.sqrt(a));
}

export function obterBairroPorNome(
  nomeBairro: string,
  bairros: readonly Bairro[],
): Bairro | null {
  return bairros.find((bairro) => bairro.nome === nomeBairro) ?? null;
}

export function contarPorCategoria(reportes: readonly Reporte[]): {
  seguranca: number;
  inseguranca: number;
} {
  return reportes.reduce(
    (total, reporte) => {
      if (reporte.tipoCategoria === 'Segurança') {
        return { ...total, seguranca: total.seguranca + 1 };
      }
      return { ...total, inseguranca: total.inseguranca + 1 };
    },
    { seguranca: 0, inseguranca: 0 },
  );
}

export type FaixaClassificacao = 'segura' | 'atencao' | 'risco';

export function faixaClassificacao(nota: number): FaixaClassificacao {
  if (nota >= 4) return 'segura';
  if (nota >= 3) return 'atencao';
  return 'risco';
}

export function corClassificacao(nota: number): string {
  const faixa = faixaClassificacao(nota);
  if (faixa === 'segura') return COLORS.success;
  if (faixa === 'atencao') return COLORS.warning;
  return COLORS.danger;
}

export function rotuloClassificacao(nota: number): string {
  const faixa = faixaClassificacao(nota);
  if (faixa === 'segura') return 'Região Segura';
  if (faixa === 'atencao') return 'Atenção Necessária';
  return 'Área com Alta Ocorrência';
}
