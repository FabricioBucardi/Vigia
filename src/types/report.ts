export type TipoCategoriaReporte = 'Segurança' | 'Insegurança';

export type SubcategoriaSeguranca =
  | 'Presença Policial'
  | 'Boa Iluminação'
  | 'Câmeras de Segurança'
  | 'Área Segura';

export type SubcategoriaInseguranca =
  | 'Assalto/Roubo'
  | 'Iluminação Ruim'
  | 'Ponto de Drogas'
  | 'Ausência de Policiamento'
  | 'Atividade Suspeita';

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
