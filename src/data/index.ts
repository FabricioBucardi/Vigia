import mockReports from './mockReports.json';
import mockBairros from './mockBairros.json';
import type { Reporte } from '../types/report';
import type { Bairro } from '../types/bairro';
import type { SubcategoriaSeguranca, SubcategoriaInseguranca } from '../types/report';

export const reportes: Reporte[] = mockReports as Reporte[];
export const bairros: Bairro[] = mockBairros as Bairro[];

export const SUBCATEGORIAS_SEGURANCA: readonly SubcategoriaSeguranca[] = [
  'Presença Policial',
  'Boa Iluminação',
  'Câmeras de Segurança',
  'Área Segura',
] as const;

export const SUBCATEGORIAS_INSEGURANCA: readonly SubcategoriaInseguranca[] = [
  'Assalto/Roubo',
  'Iluminação Ruim',
  'Ponto de Drogas',
  'Ausência de Policiamento',
  'Atividade Suspeita',
] as const;
