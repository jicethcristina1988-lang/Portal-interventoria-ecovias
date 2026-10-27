import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Calendar,
  Sun,
  Cloud,
  CloudRain,
  Eye,
  Edit3,
  Copy,
  Trash2,
  Search,
  Users,
  HardHat,
  Wrench,
  Download,
  Plus,
  ArrowUpDown,
  Filter,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';
import { DailyReport, WeatherType } from '../types';
import { exportDailyReportToExcel } from '../utils/excelExport';
import { PhotoLightbox } from './PhotoLightbox';

interface RepositoryTimelineProps {
  reports: DailyReport[];
  onSelectReportToEdit: (report: DailyReport) => void;
  onPreviewExcel: (report: DailyReport) => void;
  onCreateNewReport: () => void;
  onDuplicateReport: (report: DailyReport) => void;
  onDeleteReport: (id: string) => void;
  onClearAllReports?: () => void;
}

export const RepositoryTimeline: React.FC<RepositoryTimelineProps> = ({
  reports,
  onSelectReportToEdit,
  onPreviewExcel,
  onCreateNewReport,
  onDuplicateReport,
  onDeleteReport,
  onClearAllReports,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [weatherFilter, setWeatherFilter] = useState<'ALL' | WeatherType>('ALL');
  const [sortAscending, setSortAscending] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string; subtitle?: string } | null>(null);

  // Format date nicely to Spanish
  const formatDateSpanish = (dateString: string) => {
    try {
      const parts = dateString.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        return d.toLocaleDateString('es-ES', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      }
      return dateString;
    } catch {
      return dateString;
    }
  };

  // Filter & Search logic
  const filteredReports = reports
    .filter((rep) => {
      // Weather filter
      if (weatherFilter !== 'ALL' && rep.weather !== weatherFilter) return false;

      // Search term
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();

      const inMeta =
        (rep.projectContractName && rep.projectContractName.toLowerCase().includes(term)) ||
        (rep.elaboratedBy && rep.elaboratedBy.toLowerCase().includes(term)) ||
        rep.projectName.toLowerCase().includes(term) ||
        rep.contractNumber.toLowerCase().includes(term) ||
        rep.date.includes(term) ||
        `id-${rep.reportNumber}`.includes(term) ||
        rep.generalEquipmentAndTools.toLowerCase().includes(term);

      if (inMeta) return true;

      // Check frentes activities
      return rep.frentes.some(
        (f) =>
          f.activity.toLowerCase().includes(term) ||
          f.description.toLowerCase().includes(term) ||
          f.novedades?.toLowerCase().includes(term)
      );
    })
    .sort((a, b) => {
      const timeA = new Date(a.date).getTime();
      const timeB = new Date(b.date).getTime();
      return sortAscending ? timeA - timeB : timeB - timeA;
    });

  // Handle instant 1-click Excel download
  const handleDownloadExcel = async (report: DailyReport) => {
    try {
      setDownloadingId(report.id);
      await exportDailyReportToExcel(report);
    } catch (err) {
      console.error('Error al exportar Excel:', err);
    } finally {
      setDownloadingId(null);
    }
  };

  // Metrics for repository summary
  const totalReportsCount = reports.length;
  const totalFrentesCount = reports.reduce((acc, r) => acc + r.frentes.length, 0);
  const sunnyCount = reports.filter((r) => r.weather === 'Soleado').length;
  const rainyCount = reports.filter((r) => r.weather === 'Lluvioso').length;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* Lightbox for Zoom */}
      {lightboxImage && (
        <PhotoLightbox
          isOpen={!!lightboxImage}
          onClose={() => setLightboxImage(null)}
          imageUrl={lightboxImage.url}
          title={lightboxImage.title}
          subtitle={lightboxImage.subtitle}
        />
      )}

      {/* Top Controls & Metrics Banner */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-700" />
              <span>Historial Cronológico de Informes Diarios</span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                {reports.length} Informes en Archivo
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Registro ordenado por fecha (uno debajo del otro) conforme a los requerimientos maestros de interventoría.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onCreateNewReport}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Informe Diario</span>
            </button>
            {reports.length > 0 && onClearAllReports && (
              <button
                type="button"
                onClick={onClearAllReports}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 rounded-lg transition-colors cursor-pointer"
                title="Vaciar todos los informes del repositorio"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Vaciar Historial</span>
              </button>
            )}
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="mt-5 pt-4 border-t border-slate-200 flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por actividad, frente, fecha, contrato..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Weather Filter & Sort buttons */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-between md:justify-end">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setWeatherFilter('ALL')}
                className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                  weatherFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Todos
              </button>
              <button
                type="button"
                onClick={() => setWeatherFilter('Soleado')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  weatherFilter === 'Soleado'
                    ? 'bg-amber-100 text-amber-900 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                Soleado ({sunnyCount})
              </button>
              <button
                type="button"
                onClick={() => setWeatherFilter('Nublado')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  weatherFilter === 'Nublado'
                    ? 'bg-slate-200 text-slate-900 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Cloud className="w-3.5 h-3.5 text-slate-500" />
                Nublado
              </button>
              <button
                type="button"
                onClick={() => setWeatherFilter('Lluvioso')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  weatherFilter === 'Lluvioso'
                    ? 'bg-blue-100 text-blue-900 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CloudRain className="w-3.5 h-3.5 text-blue-500" />
                Lluvioso ({rainyCount})
              </button>
            </div>

            <button
              type="button"
              onClick={() => setSortAscending(!sortAscending)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
              title="Cambiar orden cronológico"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
              <span>{sortAscending ? 'Más antiguos primero' : 'Más recientes primero'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Chronological List of Reports: One below another (Requerimiento Maestro 1) */}
      {reports.length === 0 ? (
        <div className="bg-white rounded-xl border-2 border-dashed border-slate-300 p-12 text-center shadow-xs">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">Repositorio en blanco y listo para operar</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-6 leading-relaxed">
            No hay informes de prueba precargados. Puedes iniciar la supervisión técnica creando un nuevo informe y subiendo las fotografías de obra para que la IA asigne los frentes de trabajo automáticamente.
          </p>
          <button
            type="button"
            onClick={onCreateNewReport}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Primer Informe Diario</span>
          </button>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs">
          <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No se encontraron informes con ese filtro</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
            Intenta limpiar el término de búsqueda o selecciona "Todos" en el filtro de clima.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              setWeatherFilter('ALL');
            }}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
          >
            Limpiar Filtros
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredReports.map((report) => {
            // Totals for this report
            const totalInterv = report.frentes.reduce((acc, f) => acc + (f.personnel.residenteInterventoria || 0), 0);
            const totalContr = report.frentes.reduce((acc, f) => acc + (f.personnel.residenteContratista || 0), 0);
            const totalSiso = report.frentes.reduce((acc, f) => acc + (f.personnel.siso || 0), 0);
            const totalObreros = report.frentes.reduce((acc, f) => acc + (f.personnel.obreros || 0), 0);
            const totalTopografo = report.frentes.reduce((acc, f) => acc + (f.personnel.topografo || 0), 0);
            const grandTotalWorkers = totalInterv + totalContr + totalSiso + totalObreros + totalTopografo;

            return (
              <div
                key={report.id}
                className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
              >
                {/* Institutional Header Banner */}
                <div className="bg-[#0F2942] text-white px-6 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-700">
                  <div className="flex items-start sm:items-center gap-3">
                    <span className="px-3 py-1 rounded bg-blue-600 font-mono font-bold text-xs tracking-wider flex-shrink-0 mt-0.5 sm:mt-0">
                      ID-{report.reportNumber.toString().padStart(3, '0')}
                    </span>
                    <div>
                      <div className="text-xs text-blue-200 font-bold uppercase tracking-wider line-clamp-1">
                        {report.projectContractName || (report.contractNumber ? `${report.projectName} / ${report.contractNumber}` : report.projectName)}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5 text-xs">
                        <span className="font-bold text-white capitalize text-sm">
                          {formatDateSpanish(report.date)}
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-300 font-medium flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-blue-300 inline" />
                          Elaborado por: <strong className="text-white">{report.elaboratedBy || report.interventorSigner?.name}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Weather and Export Actions */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Weather Badge */}
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                        report.weather === 'Soleado'
                          ? 'bg-amber-400 text-amber-950'
                          : report.weather === 'Lluvioso'
                          ? 'bg-blue-400 text-blue-950'
                          : 'bg-slate-300 text-slate-900'
                      }`}
                    >
                      {report.weather === 'Soleado' && <Sun className="w-3.5 h-3.5" />}
                      {report.weather === 'Nublado' && <Cloud className="w-3.5 h-3.5" />}
                      {report.weather === 'Lluvioso' && <CloudRain className="w-3.5 h-3.5" />}
                      {report.weather}
                    </span>

                    {/* Direct 1-Click Excel Export Button (Requerimiento Maestro 1 & 7) */}
                    <button
                      type="button"
                      onClick={() => handleDownloadExcel(report)}
                      disabled={downloadingId === report.id}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                      title="Exportar este informe a archivo Excel .xlsx oficial (2 pestañas)"
                    >
                      <Download className="w-3.5 h-3.5" />
                      {downloadingId === report.id ? 'Descargando...' : 'Exportar Excel (.xlsx)'}
                    </button>
                  </div>
                </div>

                {/* Report Body Card */}
                <div className="p-6 space-y-5">
                  {/* Primary Project & Responsible Reference Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pb-4 border-b border-slate-100 text-xs">
                    <div className="md:col-span-6 bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <span className="text-slate-400 font-bold block uppercase tracking-wider text-[10px]">
                        Nombre del Proyecto / Contrato (Referencia Oficial)
                      </span>
                      <p className="font-extrabold text-slate-900 text-sm mt-0.5 leading-snug">
                        {report.projectContractName || (report.contractNumber ? `${report.projectName} / ${report.contractNumber}` : report.projectName)}
                      </p>
                      <span className="text-[11px] text-slate-500 mt-1 block">
                        Interventoría: {report.supervisorEntity}
                      </span>
                    </div>

                    <div className="md:col-span-3 bg-blue-50/50 p-3 rounded-lg border border-blue-100 flex flex-col justify-between">
                      <div>
                        <span className="text-blue-900/60 font-bold block uppercase tracking-wider text-[10px]">
                          Elaborado por / Interventor
                        </span>
                        <p className="font-bold text-blue-950 text-sm mt-0.5">
                          {report.elaboratedBy || report.interventorSigner?.name}
                        </p>
                      </div>
                      <span className="text-[11px] text-blue-700/80 font-medium">
                        {report.interventorSigner?.role || 'Ingeniero de Interventoría'}
                      </span>
                    </div>

                    <div className="md:col-span-3 bg-slate-50 p-3 rounded-lg border border-slate-200 flex flex-col justify-between text-right">
                      <div>
                        <span className="text-slate-400 font-bold block uppercase tracking-wider text-[10px]">
                          Fecha del Informe
                        </span>
                        <p className="font-bold text-slate-800 text-sm mt-0.5">{report.date}</p>
                      </div>
                      <div className="mt-1">
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 font-black text-xs">
                          {grandTotalWorkers} personas en obra
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Machinery & Minor Tools General Summary Preview (Requerimiento Maestro 5) */}
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-slate-700 mb-1">
                      <Wrench className="w-3.5 h-3.5 text-blue-700" />
                      <span>Resumen General de Maquinaria, Equipos y Herramientas Menores:</span>
                    </div>
                    <p className="text-slate-700 italic leading-relaxed">
                      {report.generalEquipmentAndTools || 'Sin reporte de maquinaria en la jornada.'}
                    </p>
                  </div>

                  {/* Frentes Preview Grid (Requerimiento Maestro 3) */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                        <HardHat className="w-3.5 h-3.5 text-slate-700" />
                        Frentes de Obra Registrados ({report.frentes.length})
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Pestaña 2 del Excel contiene cada foto limpia al frente de la actividad
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {report.frentes.map((frente) => (
                        <div
                          key={frente.id}
                          className="border border-slate-200 rounded-lg p-3 bg-white hover:border-slate-300 transition-colors flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="px-2 py-0.5 rounded bg-[#0F2942] text-white font-bold text-[11px]">
                                Frente {frente.frenteNumber}
                              </span>
                              <span className="text-[10px] font-semibold text-slate-500">
                                {frente.personnel.obreros} Obreros • {frente.personnel.siso} SISO
                              </span>
                            </div>

                            {/* Photo Thumbnail */}
                            {frente.photoUrl ? (
                              <div
                                onClick={() =>
                                  setLightboxImage({
                                    url: frente.photoUrl,
                                    title: `Frente ${frente.frenteNumber}: ${frente.activity}`,
                                    subtitle: frente.description,
                                  })
                                }
                                className="relative rounded overflow-hidden aspect-16/10 bg-slate-900 mb-2 cursor-pointer group"
                              >
                                <img
                                  src={frente.photoUrl}
                                  alt={`Frente ${frente.frenteNumber}`}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                />
                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[11px] font-semibold">
                                  Ver Foto
                                </div>
                              </div>
                            ) : null}

                            {/* Concrete Activity */}
                            <h4 className="font-bold text-xs text-slate-900 leading-snug">
                              {frente.activity}
                            </h4>

                            {/* Brief Description */}
                            <p className="text-[11px] text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                              {frente.description}
                            </p>
                          </div>

                          {/* Novedades indicator if present */}
                          {frente.novedades && (
                            <div className="mt-2.5 pt-2 border-t border-amber-100 text-[10px] text-amber-900 bg-amber-50/70 p-1.5 rounded">
                              <strong>Novedad:</strong> {frente.novedades}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Card Actions Bottom Toolbar */}
                  <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <span>Responsable Interventoría:</span>
                      <strong className="text-slate-800">{report.interventorSigner.name}</strong>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onPreviewExcel(report)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                        title="Ver cómo queda el Excel de 2 pestañas"
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-700" />
                        <span>Ver Vista Previa Excel</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onSelectReportToEdit(report)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer"
                        title="Editar frentes, personal o novedades"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Editar Informe</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onDuplicateReport(report)}
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="Duplicar como base para nueva jornada"
                      >
                        <Copy className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`¿Estás seguro de que deseas eliminar permanentemente el informe del ${report.date} (ID-${report.reportNumber.toString().padStart(3, '0')})?`)) {
                            onDeleteReport(report.id);
                          }
                        }}
                        className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:text-white hover:bg-red-600 bg-red-50 border border-red-200 rounded-lg transition-all cursor-pointer"
                        title="Eliminar este informe del repositorio"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Eliminar</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
