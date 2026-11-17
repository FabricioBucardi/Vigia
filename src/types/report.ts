export type TipoCategoriaReporte = 'Segurança' | 'Insegurança';

export type SubcategoriaSeguranca =
  | 'PRESENCA_POLICIAL'
  | 'CAMERAS'
  | 'ILUMINACAO_BOA'
  | 'AREA_MOVIMENTADA'
  | 'COMERCIO_ATIVO';

export type SubcategoriaInseguranca =
  | 'ROUBO'
  | 'FURTO'
  | 'VANDALISMO'
  | 'ILUMINACAO_RUIM'
  | 'ACIDENTE';

export type TipoSubcategoriaReporte =
  | SubcategoriaSeguranca
  | SubcategoriaInseguranca;

export type Reporte = {
  idReporte: number;
  idUsuario: number;
  autorNome: string;
  titulo: string;
  descricao: string;
  latitude: number;
  longitude: number;
  tipoCategoria: TipoCategoriaReporte;
  tipoSubcategoria: TipoSubcategoriaReporte;
  dataReporte: string;
};

export type NovoReporteInput = {
  titulo: string;
  descricao: string;
  latitude: number;
  longitude: number;
  tipoCategoria: TipoCategoriaReporte;
  tipoSubcategoria: TipoSubcategoriaReporte;
};
