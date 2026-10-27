import React, { useState } from 'react';
import { X, Download, FileSpreadsheet, Image as ImageIcon, CheckCircle, ShieldAlert } from 'lucide-react';
import { DailyReport } from '../types';
import { exportDailyReportToExcel } from '../utils/excelExport';

interface ExcelPreviewModalProps {
  report: DailyReport | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ExcelPreviewModal: React.FC<ExcelPreviewModalProps> = ({
  report,
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'actividades' | 'fotografico'>('actividades');
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen || !report) return null;

  const handleDownloadExcel = async () => {
    try {
      setIsExporting(true);
      await exportDailyReportToExcel(report);
    } catch (err) {
      console.error('Error al generar Excel:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // Personnel totals
  const totalInterv = report.frentes.reduce((acc, f) => acc + (f.personnel.residenteInterventoria || 0), 0);
  const totalContr = report.frentes.reduce((acc, f) => acc + (f.personnel.residenteContratista || 0), 0);
  const totalSiso = report.frentes.reduce((acc, f) => acc + (f.personnel.siso || 0), 0);
  const totalObreros = report.frentes.reduce((acc, f) => acc + (f.personnel.obreros || 0), 0);
  const totalTopografo = report.frentes.reduce((acc, f) => acc + (f.personnel.topografo || 0), 0);
  const grandTotal = totalInterv + totalContr + totalSiso + totalObreros + totalTopografo;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 md:p-6"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-[#0F2942] text-white px-6 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 rounded-lg">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-900 text-blue-200 border border-blue-700">
                  Libro Excel .xlsx (2 Pestañas)
                </span>
                <span className="text-xs text-slate-300">
                  ID-{report.reportNumber.toString().padStart(3, '0')} • {report.date}
                </span>
              </div>
              <h2 className="text-lg font-bold tracking-tight text-white mt-0.5">
                Vista Previa del Archivo Excel de Interventoría
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadExcel}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium text-sm shadow-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {isExporting ? 'Generando Excel...' : 'Descargar Excel (.xlsx)'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Selector replicating Excel Bottom/Top Tabs */}
        <div className="bg-slate-100 px-6 border-b border-slate-200 flex gap-2 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('actividades')}
            className={`flex items-center gap-2 px-5 py-2.5 font-medium text-sm rounded-t-lg transition-colors cursor-pointer ${
              activeTab === 'actividades'
                ? 'bg-white text-[#0F2942] border-t-2 border-t-blue-700 border-x border-slate-200 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            Pestaña 1: "Actividades"
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('fotografico')}
            className={`flex items-center gap-2 px-5 py-2.5 font-medium text-sm rounded-t-lg transition-colors cursor-pointer ${
              activeTab === 'fotografico'
                ? 'bg-white text-[#0F2942] border-t-2 border-t-blue-700 border-x border-slate-200 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
          >
            <ImageIcon className="w-4 h-4 text-blue-600" />
            Pestaña 2: "Registro Fotográfico"
            <span className="text-xs px-2 py-0.2 rounded-full bg-blue-100 text-blue-800 font-bold">
              {report.frentes.length} Fotos
            </span>
          </button>
        </div>

        {/* Sheet Content Preview */}
        <div className="flex-1 overflow-auto p-6 bg-slate-50">
          {activeTab === 'actividades' ? (
            <div className="bg-white border border-slate-300 rounded-lg shadow-sm p-6 max-w-5xl mx-auto font-sans">
              {/* Sheet Banner */}
              <div className="bg-[#0F2942] text-white text-center py-3 px-4 font-bold text-base uppercase tracking-wider rounded-t">
                Informe Diario de Interventoría y Control de Obra
              </div>

              {/* Metadata Table */}
              <div className="grid grid-cols-2 text-xs border-x border-b border-slate-300">
                <div className="p-2.5 border-b border-r border-slate-200 flex">
                  <span className="font-bold text-slate-700 w-44">PROYECTO / CONTRATO:</span>
                  <span className="text-slate-900 font-extrabold">
                    {report.projectContractName ||
                      (report.contractNumber ? `${report.projectName} / ${report.contractNumber}` : report.projectName)}
                  </span>
                </div>
                <div className="p-2.5 border-b border-slate-200 flex">
                  <span className="font-bold text-slate-700 w-44">FECHA DEL INFORME:</span>
                  <span className="text-slate-900 font-semibold">{report.date}</span>
                </div>
                <div className="p-2.5 border-b border-r border-slate-200 flex">
                  <span className="font-bold text-slate-700 w-44">ELABORADO POR / INTERVENTOR:</span>
                  <span className="text-slate-900 font-bold">
                    {report.elaboratedBy || report.interventorSigner?.name || 'Ing. Carlos Fernando Restrepo'}
                  </span>
                </div>
                <div className="p-2.5 border-b border-slate-200 flex">
                  <span className="font-bold text-slate-700 w-44">INFORME DIARIO No.:</span>
                  <span className="text-blue-800 font-bold">ID-{report.reportNumber.toString().padStart(3, '0')}</span>
                </div>
                <div className="p-2.5 border-b border-r border-slate-200 flex">
                  <span className="font-bold text-slate-700 w-44">EMPRESA INTERVENTORÍA:</span>
                  <span className="text-slate-900">{report.supervisorEntity}</span>
                </div>
                <div className="p-2.5 border-b border-slate-200 flex items-center">
                  <span className="font-bold text-slate-700 w-44">ESTADO DEL CLIMA:</span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                      report.weather === 'Soleado'
                        ? 'bg-amber-100 text-amber-800'
                        : report.weather === 'Lluvioso'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-slate-200 text-slate-800'
                    }`}
                  >
                    {report.weather.toUpperCase()}
                  </span>
                </div>
                <div className="p-2.5 border-r border-slate-200 flex">
                  <span className="font-bold text-slate-700 w-44">CONTRATISTA DE OBRA:</span>
                  <span className="text-slate-900">{report.contractorEntity}</span>
                </div>
                <div className="p-2.5 flex">
                  <span className="font-bold text-slate-700 w-44">FRENTES ACTIVOS:</span>
                  <span className="text-slate-900 font-bold">{report.frentes.length} Frentes de Obra</span>
                </div>
              </div>

              {/* Machinery & Tools General Summary Box */}
              <div className="mt-4 border border-slate-300 rounded overflow-hidden">
                <div className="bg-[#1E3A8A] text-white px-3 py-1.5 text-xs font-bold uppercase tracking-wider">
                  Resumen General Consolidado de Maquinaria, Equipos y Herramientas Menores:
                </div>
                <div className="bg-slate-50 p-3 text-xs text-slate-800 italic leading-relaxed">
                  {report.generalEquipmentAndTools || 'Sin reporte de maquinaria en la jornada.'}
                </div>
              </div>

              {/* Sequential Frentes Table */}
              <div className="mt-5 overflow-x-auto border border-slate-300 rounded">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#0F2942] text-white text-center font-semibold border-b border-slate-300">
                      <th className="p-2 border-r border-slate-600 w-24">Frente</th>
                      <th className="p-2 border-r border-slate-600 min-w-[180px]">Actividad Realizada (Concreta)</th>
                      <th className="p-2 border-r border-slate-600 min-w-[220px]">Descripción Breve de la Labor</th>
                      <th className="p-2 border-r border-slate-600 w-16" title="Ingeniero Residente Interventoría">Ing. Int.</th>
                      <th className="p-2 border-r border-slate-600 w-16" title="Ingeniero Contratista">Ing. Cont.</th>
                      <th className="p-2 border-r border-slate-600 w-14" title="SISO">SISO</th>
                      <th className="p-2 border-r border-slate-600 w-16" title="Obreros y Ayudantes">Obreros</th>
                      <th className="p-2 border-r border-slate-600 w-16" title="Topógrafo">Topóg.</th>
                      <th className="p-2 border-r border-slate-600 w-16 bg-blue-900">Total</th>
                      <th className="p-2 min-w-[160px]">Novedades (Manual)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.frentes.map((f, idx) => {
                      const fTotal =
                        (f.personnel.residenteInterventoria || 0) +
                        (f.personnel.residenteContratista || 0) +
                        (f.personnel.siso || 0) +
                        (f.personnel.obreros || 0) +
                        (f.personnel.topografo || 0);

                      return (
                        <tr
                          key={f.id}
                          className={`border-b border-slate-200 ${
                            idx % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'
                          }`}
                        >
                          <td className="p-2.5 text-center font-bold text-slate-800 border-r border-slate-200">
                            Frente {f.frenteNumber}
                          </td>
                          <td className="p-2.5 font-semibold text-slate-900 border-r border-slate-200">
                            {f.activity}
                          </td>
                          <td className="p-2.5 text-slate-700 border-r border-slate-200 leading-snug">
                            {f.description}
                          </td>
                          <td className="p-2.5 text-center border-r border-slate-200">
                            {f.personnel.residenteInterventoria}
                          </td>
                          <td className="p-2.5 text-center border-r border-slate-200">
                            {f.personnel.residenteContratista}
                          </td>
                          <td className="p-2.5 text-center border-r border-slate-200">
                            {f.personnel.siso}
                          </td>
                          <td className="p-2.5 text-center border-r border-slate-200 font-medium">
                            {f.personnel.obreros}
                          </td>
                          <td className="p-2.5 text-center border-r border-slate-200">
                            {f.personnel.topografo}
                          </td>
                          <td className="p-2.5 text-center font-bold text-blue-900 bg-blue-50/50 border-r border-slate-200">
                            {fTotal}
                          </td>
                          <td className="p-2.5 text-slate-600 italic">
                            {f.novedades || <span className="text-slate-300">-- Sin novedades --</span>}
                          </td>
                        </tr>
                      );
                    })}

                    {/* Totals Row */}
                    <tr className="bg-slate-200 font-bold text-slate-900 border-t-2 border-slate-400">
                      <td className="p-2.5 text-center border-r border-slate-300">TOTALES:</td>
                      <td colSpan={2} className="p-2.5 border-r border-slate-300 text-slate-700">
                        {report.frentes.length} Frentes de obra ejecutados
                      </td>
                      <td className="p-2.5 text-center border-r border-slate-300">{totalInterv}</td>
                      <td className="p-2.5 text-center border-r border-slate-300">{totalContr}</td>
                      <td className="p-2.5 text-center border-r border-slate-300">{totalSiso}</td>
                      <td className="p-2.5 text-center border-r border-slate-300">{totalObreros}</td>
                      <td className="p-2.5 text-center border-r border-slate-300">{totalTopografo}</td>
                      <td className="p-2.5 text-center text-blue-950 font-black bg-slate-300 border-r border-slate-300">
                        {grandTotal}
                      </td>
                      <td className="p-2.5"></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Signature Lines */}
              <div className="mt-12 grid grid-cols-2 gap-8 text-center text-xs">
                <div className="flex flex-col items-center">
                  <div className="w-64 border-b border-slate-800 mb-2"></div>
                  <p className="font-bold text-slate-900 uppercase">{report.interventorSigner.name}</p>
                  <p className="text-slate-600">Mat. Prof.: {report.interventorSigner.license}</p>
                  <p className="text-slate-500 font-medium">{report.interventorSigner.entity}</p>
                  <p className="text-slate-700 font-semibold mt-1">{report.interventorSigner.role}</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-64 border-b border-slate-800 mb-2"></div>
                  <p className="font-bold text-slate-900 uppercase">{report.contractorSigner.name}</p>
                  <p className="text-slate-600">Mat. Prof.: {report.contractorSigner.license}</p>
                  <p className="text-slate-500 font-medium">{report.contractorSigner.entity}</p>
                  <p className="text-slate-700 font-semibold mt-1">{report.contractorSigner.role}</p>
                </div>
              </div>
            </div>
          ) : (
            /* PESTAÑA 2: "Registro Fotográfico" */
            <div className="bg-white border border-slate-300 rounded-lg shadow-sm p-6 max-w-5xl mx-auto font-sans">
              <div className="bg-[#0F2942] text-white text-center py-3 px-4 font-bold text-base uppercase tracking-wider rounded-t">
                Registro Fotográfico de Obra - Informe No. ID-{report.reportNumber.toString().padStart(3, '0')} ({report.date})
              </div>

              <div className="bg-blue-50 border-x border-b border-blue-200 p-3 text-xs text-blue-900 flex items-center justify-between">
                <span>
                  <strong>Estructura oficial de 3 columnas:</strong> Columna 1 (Frente de obra) • Columna 2 (Actividad concreta) • Columna 3 (Evidencia fotográfica limpia sin textos inferiores).
                </span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Fotos integradas limpias en celda
                </span>
              </div>

              <div className="mt-4 border border-slate-300 rounded overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#1E3A8A] text-white font-semibold border-b border-slate-300 text-center">
                      <th className="p-3 border-r border-slate-600 w-32">
                        Columna 1<br />
                        <span className="text-slate-200 font-normal">Frente de obra</span>
                      </th>
                      <th className="p-3 border-r border-slate-600 w-80">
                        Columna 2<br />
                        <span className="text-slate-200 font-normal">Actividad realizada de manera concreta</span>
                      </th>
                      <th className="p-3 min-w-[280px]">
                        Columna 3<br />
                        <span className="text-slate-200 font-normal">Evidencia (Fotografía limpia)</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.frentes.map((frente, idx) => (
                      <tr
                        key={frente.id}
                        className={`border-b border-slate-200 ${
                          idx % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'
                        }`}
                      >
                        {/* Columna 1 */}
                        <td className="p-4 text-center align-middle font-bold text-base text-[#0F2942] border-r border-slate-200 bg-slate-100/40">
                          Frente {frente.frenteNumber}
                        </td>

                        {/* Columna 2 */}
                        <td className="p-4 align-middle font-bold text-sm text-slate-800 border-r border-slate-200">
                          <p className="text-slate-900 font-semibold">{frente.activity}</p>
                          <span className="inline-block mt-1 text-[11px] text-slate-500 font-normal">
                            Labor supervisada en sitio
                          </span>
                        </td>

                        {/* Columna 3: Clean photo only, without text underneath */}
                        <td className="p-3 align-middle text-center">
                          {frente.photoUrl ? (
                            <div className="inline-block border border-slate-300 rounded shadow-xs overflow-hidden bg-white">
                              <img
                                src={frente.photoUrl}
                                alt={`Evidencia Frente ${frente.frenteNumber}`}
                                className="w-64 h-48 object-cover mx-auto"
                              />
                            </div>
                          ) : (
                            <div className="w-64 h-40 border-2 border-dashed border-slate-300 rounded flex items-center justify-center text-slate-400 mx-auto">
                              Sin fotografía cargada
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">Formato:</span>
            <span>Microsoft Excel OpenXML (.xlsx) con motor binario nativo de imágenes ExcelJS</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 hover:bg-slate-200 rounded-lg text-slate-700 font-medium transition-colors cursor-pointer"
            >
              Cerrar Vista Previa
            </button>
            <button
              type="button"
              onClick={handleDownloadExcel}
              disabled={isExporting}
              className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold text-sm shadow-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {isExporting ? 'Descargando...' : 'Descargar Archivo .xlsx Oficial'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
