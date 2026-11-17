import { apiFetch } from './api';
import type {
  NovoReporteInput,
  Reporte,
  TipoCategoriaReporte,
  TipoSubcategoriaReporte,
} from '../types/report';

type CategoriaApi = 'SEGURANCA' | 'INSEGURANCA';

type ReporteApi = {
  id: number;
  titulo: string;
  descricao: string;
  latitude: number;
  longitude: number;
  dataReporte: string;
  categoria: CategoriaApi;
  subcategoria: TipoSubcategoriaReporte;
  autorId: number;
  autorNome: string;
};

type CriarReporteApiInput = {
  titulo: string;
  descricao: string;
  latitude: number;
  longitude: number;
  categoria: CategoriaApi;
  subcategoria: TipoSubcategoriaReporte;
};

const CATEGORIA_PARA_API: Record<TipoCategoriaReporte, CategoriaApi> = {
  Segurança: 'SEGURANCA',
  Insegurança: 'INSEGURANCA',
};

const CATEGORIA_DA_API: Record<CategoriaApi, TipoCategoriaReporte> = {
  SEGURANCA: 'Segurança',
  INSEGURANCA: 'Insegurança',
};

function mapearReporte(reporte: ReporteApi): Reporte {
  return {
    idReporte: reporte.id,
    idUsuario: reporte.autorId,
    autorNome: reporte.autorNome,
    titulo: reporte.titulo,
    descricao: reporte.descricao,
    latitude: reporte.latitude,
    longitude: reporte.longitude,
    tipoCategoria: CATEGORIA_DA_API[reporte.categoria],
    tipoSubcategoria: reporte.subcategoria,
    dataReporte: reporte.dataReporte,
  };
}

export async function listarReportes(): Promise<Reporte[]> {
  const lista = await apiFetch<ReporteApi[]>('/reportes');
  return lista
    .map(mapearReporte)
    .sort(
      (a, b) =>
        new Date(b.dataReporte).getTime() - new Date(a.dataReporte).getTime(),
    );
}

export async function criarReporte(dados: NovoReporteInput): Promise<Reporte> {
  const body: CriarReporteApiInput = {
    titulo: dados.titulo,
    descricao: dados.descricao,
    latitude: dados.latitude,
    longitude: dados.longitude,
    categoria: CATEGORIA_PARA_API[dados.tipoCategoria],
    subcategoria: dados.tipoSubcategoria,
  };

  const criado = await apiFetch<ReporteApi>('/reportes', {
    method: 'POST',
    body,
  });

  return mapearReporte(criado);
}
