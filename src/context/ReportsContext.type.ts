import type { NovoReporteInput, Reporte } from '../types/report';

export type FiltroTipoReporte = 'Todos' | 'Segurança' | 'Insegurança';

export type ReportsContextData = {
  reports: Reporte[];
  filteredReports: Reporte[];
  filtroAtivo: FiltroTipoReporte;
  setFiltroAtivo: (filtro: FiltroTipoReporte) => void;
  selectedReport: Reporte | null;
  setSelectedReport: (report: Reporte | null) => void;
  isLoading: boolean;
  erro: string | null;
  recarregarReportes: () => Promise<void>;
  adicionarReporte: (dados: NovoReporteInput) => Promise<Reporte>;
};
