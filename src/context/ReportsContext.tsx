import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { ApiError } from '../services/api';
import { criarReporte, listarReportes } from '../services/reportService';
import type { NovoReporteInput, Reporte } from '../types/report';
import type {
  FiltroTipoReporte,
  ReportsContextData,
} from './ReportsContext.type';

type ReportsProviderProps = {
  children: React.ReactNode;
};

const ReportsContext = createContext<ReportsContextData | undefined>(undefined);

export function ReportsProvider({ children }: ReportsProviderProps) {
  const [reports, setReports] = useState<Reporte[]>([]);
  const [filtroAtivo, setFiltroAtivo] = useState<FiltroTipoReporte>('Todos');
  const [selectedReport, setSelectedReport] = useState<Reporte | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const filteredReports = useMemo(() => {
    if (filtroAtivo === 'Todos') return reports;
    return reports.filter((r) => r.tipoCategoria === filtroAtivo);
  }, [reports, filtroAtivo]);

  const recarregarReportes = useCallback(async () => {
    setIsLoading(true);
    setErro(null);

    try {
      const lista = await listarReportes();
      setReports(lista);
    } catch (e) {
      setErro(
        e instanceof ApiError
          ? e.message
          : 'Não foi possível carregar os reportes.',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void recarregarReportes();
  }, [recarregarReportes]);

  const adicionarReporte = useCallback(
    async (dados: NovoReporteInput): Promise<Reporte> => {
      const criado = await criarReporte(dados);
      setReports((prev) => [criado, ...prev]);
      return criado;
    },
    [],
  );

  const value = useMemo(
    () => ({
      reports,
      filteredReports,
      filtroAtivo,
      setFiltroAtivo,
      selectedReport,
      setSelectedReport,
      isLoading,
      erro,
      recarregarReportes,
      adicionarReporte,
    }),
    [
      reports,
      filteredReports,
      filtroAtivo,
      selectedReport,
      isLoading,
      erro,
      recarregarReportes,
      adicionarReporte,
    ],
  );

  return (
    <ReportsContext.Provider value={value}>{children}</ReportsContext.Provider>
  );
}

export function useReports(): ReportsContextData {
  const context = useContext(ReportsContext);
  if (context === undefined) {
    throw new Error('useReports deve ser usado dentro de um ReportsProvider');
  }
  return context;
}
