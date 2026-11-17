import mockBairros from './mockBairros.json';
import type { Bairro } from '../types/bairro';
import type { SubcategoriaSeguranca, SubcategoriaInseguranca, TipoSubcategoriaReporte } from '../types/report';

export const bairros: Bairro[] = mockBairros as Bairro[];

export const SUBCATEGORIAS_SEGURANCA: readonly SubcategoriaSeguranca[] = [
  'PRESENCA_POLICIAL',
  'CAMERAS',
  'ILUMINACAO_BOA',
  'AREA_MOVIMENTADA',
  'COMERCIO_ATIVO',
] as const;

export const SUBCATEGORIAS_INSEGURANCA: readonly SubcategoriaInseguranca[] = [
  'ROUBO',
  'FURTO',
  'VANDALISMO',
  'ILUMINACAO_RUIM',
  'ACIDENTE',
] as const;

export const SUBCATEGORIA_LABELS: Record<TipoSubcategoriaReporte, string> = {
  PRESENCA_POLICIAL: 'Presença Policial',
  CAMERAS: 'Câmeras de Segurança',
  ILUMINACAO_BOA: 'Boa Iluminação',
  AREA_MOVIMENTADA: 'Área Movimentada',
  COMERCIO_ATIVO: 'Comércio Ativo',
  ROUBO: 'Roubo',
  FURTO: 'Furto',
  VANDALISMO: 'Vandalismo',
  ILUMINACAO_RUIM: 'Iluminação Ruim',
  ACIDENTE: 'Acidente',
};

export function rotuloSubcategoria(subcategoria: TipoSubcategoriaReporte): string {
  return SUBCATEGORIA_LABELS[subcategoria];
}
