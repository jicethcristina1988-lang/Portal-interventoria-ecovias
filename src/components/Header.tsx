import React from 'react';
import {
  FileSpreadsheet,
  Plus,
  Calendar,
  Layers,
  HelpCircle,
  HardHat,
  Database,
  DownloadCloud,
  Upload,
} from 'lucide-react';

interface HeaderProps {
  currentView: 'timeline' | 'editor';
  onNavigateTimeline: () => void;
  onNavigateNewReport: () => void;
  onOpenHelp: () => void;
  onExportBackup: () => void;
  onImportBackup: (event: React.ChangeEvent<HTMLInputElement>) => void;
  totalReports: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigateTimeline,
  onNavigateNewReport,
  onOpenHelp,
  onExportBackup,
  onImportBackup,
  totalReports,
}) => {
  return (
    <header className="bg-[#0F2942] text-white border-b border-slate-700 shadow-md">
      {/* Top microbar */}
      <div className="bg-[#081827] text-slate-400 px-4 sm:px-8 py-1.5 text-[11px] flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-semibold text-slate-300">
            SISTEMA INTEGRADO DE INTERVENTORÍA Y SUPERVISIÓN DE OBRA CIVIL
          </span>
          <span className="hidden md:inline text-slate-600">|</span>
          <span className="hidden md:inline text-slate-400">
            Conforme a Normas Técnicas y Estándares de Supervisión de Infraestructura
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onExportBackup}
            className="hover:text-white transition-colors cursor-pointer flex items-center gap-1"
            title="Descargar copia de seguridad JSON"
          >
            <DownloadCloud className="w-3 h-3" />
            <span className="hidden sm:inline">Copia de Seguridad</span>
          </button>

          <label className="hover:text-white transition-colors cursor-pointer flex items-center gap-1">
            <Upload className="w-3 h-3" />
            <span className="hidden sm:inline">Restaurar Copia</span>
            <input
              type="file"
              accept=".json"
              onChange={onImportBackup}
              className="sr-only"
            />
          </label>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Logo & System Title */}
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 bg-blue-600 rounded-xl shadow-inner text-white flex items-center justify-center">
              <HardHat className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-900 text-blue-200 border border-blue-700">
                  Portal Oficial
                </span>
                <span className="text-xs text-slate-400">Archivado en Tiempo Real</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-0.5">
                Repositorio e Historial de Informes Diarios de Interventoría
              </h1>
            </div>
          </div>

          {/* Primary View Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={onNavigateTimeline}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                currentView === 'timeline'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Historial ({totalReports})</span>
            </button>

            <button
              type="button"
              onClick={onNavigateNewReport}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                currentView === 'editor'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Informe Diario</span>
            </button>

            <button
              type="button"
              onClick={onOpenHelp}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Guía de Funcionalidades Maestras"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
