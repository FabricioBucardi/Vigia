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

export type AvaliacaoGravidade = 1 | 2 | 3 | 4 | 5;

export type Reporte = {
  idReporte: number;
  idUsuario: number;
  autorNome: string;
  titulo: string;
  descricao: string;
  latitude: number;
  longitude: number;
  endereco: string;
  tipoCategoria: TipoCategoriaReporte;
  tipoSubcategoria: TipoSubcategoriaReporte;
  avaliacaoGravidade: AvaliacaoGravidade;
  bairroNome: string;
  dataReporte: string;
};
