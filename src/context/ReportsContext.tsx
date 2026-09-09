import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { reportes as dadosIniciais } from '../data';
import type { Reporte } from '../types/report';
import type {
  FiltroTipoReporte,
  NovoReporteInput,
  ReportsContextData,
} from './ReportsContext.type';

type ReportsProviderProps = {
  children: React.ReactNode;
};

const ReportsContext = createContext<ReportsContextData | undefined>(undefined);

export function ReportsProvider({ children }: ReportsProviderProps) {
  const [reports, setReports] = useState<Reporte[]>(dadosIniciais);
  const [filtroAtivo, setFiltroAtivo] = useState<FiltroTipoReporte>('Todos');
  const [selectedReport, setSelectedReport] = useState<Reporte | null>(null);

  const filteredReports = useMemo(() => {
    if (filtroAtivo === 'Todos') return reports;
    return reports.filter((r) => r.tipoCategoria === filtroAtivo);
  }, [reports, filtroAtivo]);

  const adicionarReporte = useCallback(
    (dados: NovoReporteInput): Reporte => {
      const novoId =
        reports.length > 0 ? Math.max(...reports.map((r) => r.idReporte)) + 1 : 1;
      const novoReporte: Reporte = {
        ...dados,
        idReporte: novoId,
        dataReporte: new Date().toISOString(),
      };
      setReports((prev) => [novoReporte, ...prev]);
      return novoReporte;
    },
    [reports],
  );

  const value = useMemo(
    () => ({
      reports,
      filteredReports,
      filtroAtivo,
      setFiltroAtivo,
      selectedReport,
      setSelectedReport,
      adicionarReporte,
    }),
    [
      reports,
      filteredReports,
      filtroAtivo,
      setFiltroAtivo,
      selectedReport,
      setSelectedReport,
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
