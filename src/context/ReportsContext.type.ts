import type { Reporte } from '../types/report';

export type FiltroTipoReporte = 'Todos' | 'Segurança' | 'Insegurança';

export type NovoReporteInput = Omit<Reporte, 'idReporte' | 'dataReporte'>;

export type ReportsContextData = {
  reports: Reporte[];
  filteredReports: Reporte[];
  filtroAtivo: FiltroTipoReporte;
  setFiltroAtivo: (filtro: FiltroTipoReporte) => void;
  selectedReport: Reporte | null;
  setSelectedReport: (report: Reporte | null) => void;
  adicionarReporte: (dados: NovoReporteInput) => Reporte;
};
