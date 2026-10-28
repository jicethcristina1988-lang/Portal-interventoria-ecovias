import React, { useState } from 'react';
import {
  Save,
  Download,
  UploadCloud,
  Sparkles,
  Plus,
  Trash2,
  Sun,
  Cloud,
  CloudRain,
  HardHat,
  Users,
  Wrench,
  AlertCircle,
  FileSpreadsheet,
  ArrowLeft,
  Eye,
  Check,
  RotateCcw,
  Camera,
} from 'lucide-react';
import { DailyReport, FrenteItem, WeatherType } from '../types';
import { exportDailyReportToExcel } from '../utils/excelExport';
import { PhotoLightbox } from './PhotoLightbox';

interface ReportEditorProps {
  initialReport?: DailyReport | null;
  onSave: (report: DailyReport) => void;
  onCancel: () => void;
  onPreviewExcel: (report: DailyReport) => void;
}

export const ReportEditor: React.FC<ReportEditorProps> = ({
  initialReport,
  onSave,
  onCancel,
  onPreviewExcel,
}) => {
  // Today's date string YYYY-MM-DD
  const todayStr = new Date().toISOString().split('T')[0];

  const defaultReport: DailyReport = {
    id: 'rep-' + Date.now(),
    reportNumber: 1,
    date: todayStr,
    projectContractName: '',
    elaboratedBy: '',
    projectName: '',
    contractNumber: '',
    supervisorEntity: '',
    contractorEntity: '',
    weather: 'Soleado',
    generalEquipmentAndTools: '',
    frentes: [],
    interventorSigner: {
      name: '',
      license: '',
      entity: '',
      role: 'Ingeniero Residente de Interventoría',
    },
    contractorSigner: {
      name: '',
      license: '',
      entity: '',
      role: 'Ingeniero Residente de Obra',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const initialNormalized: DailyReport = initialReport
    ? {
        ...initialReport,
        projectContractName:
          initialReport.projectContractName ||
          (initialReport.contractNumber
            ? `${initialReport.projectName} / ${initialReport.contractNumber}`
            : initialReport.projectName || ''),
        elaboratedBy: initialReport.elaboratedBy || initialReport.interventorSigner?.name || '',
      }
    : defaultReport;

  const [formData, setFormData] = useState<DailyReport>(initialNormalized);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiStatusMessage, setAiStatusMessage] = useState<string>('');
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string; subtitle?: string } | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'info' | 'error'; message: string } | null>(null);

  // Re-number frentes sequentially (Frente 1, Frente 2, Frente 3...)
  const renumberFrentes = (items: FrenteItem[]): FrenteItem[] => {
    return items.map((item, idx) => ({
      ...item,
      frenteNumber: idx + 1,
    }));
  };

  // Weather change handler
  const handleWeatherChange = (newWeather: WeatherType) => {
    setFormData((prev) => ({ ...prev, weather: newWeather }));
  };

  // Multiple Photo Upload & Processing via Gemini AI
  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    await processUploadedFiles(fileList);
  };

  const processUploadedFiles = async (fileList: File[]) => {
    setIsAnalyzing(true);
    setAiStatusMessage(`Iniciando evaluación independiente para ${fileList.length} fotografía(s) de obra...`);

    try {
      const startingFrenteNumber = formData.frentes.length;
      const accumulatedFrentes: FrenteItem[] = [];
      const detectedEquipments: string[] = [];
      let detectedWeather: WeatherType = formData.weather;

      // Iteración individual e independiente por fotografía (bucle secuencial estricto)
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        const frenteNum = startingFrenteNumber + i + 1;

        setAiStatusMessage(
          `Analizando fotografía ${i + 1} de ${fileList.length} (Frente ${frenteNum}: "${file.name}"). Evaluando elementos visuales diferenciadores y verificando regla de no duplicidad...`
        );

        // Convert this single file to base64
        const base64 = await readFileAsBase64(file);
        const imagePayload = {
          id: `img-${Date.now()}-${i}`,
          base64,
          mimeType: file.type || 'image/jpeg',
          name: file.name,
        };

        // Prepare context of previously analyzed frentes to enforce N-1 non-duplication
        const previousSummaries = [
          ...formData.frentes.map((f) => ({ frenteNumber: f.frenteNumber, activity: f.activity, description: f.description })),
          ...accumulatedFrentes.map((f) => ({ frenteNumber: f.frenteNumber, activity: f.activity, description: f.description })),
        ];

        // Call individual photo analysis endpoint
        const response = await fetch('/api/analyze-single-photo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: imagePayload,
            index: startingFrenteNumber + i,
            totalImages: startingFrenteNumber + fileList.length,
            previousFrentes: previousSummaries,
          }),
        });

        if (!response.ok) {
          throw new Error(`Error en el servidor al analizar fotografía ${i + 1}.`);
        }

        const analysis = await response.json();

        // Enforce weather priority (Lluvioso > Nublado > Soleado)
        if (analysis.weather === 'Lluvioso') {
          detectedWeather = 'Lluvioso';
        } else if (analysis.weather === 'Nublado' && detectedWeather !== 'Lluvioso') {
          detectedWeather = 'Nublado';
        }

        // Collect detected equipment
        if (Array.isArray(analysis.detectedEquipment)) {
          analysis.detectedEquipment.forEach((eq: string) => {
            if (eq && eq.trim() && !detectedEquipments.includes(eq.trim())) {
              detectedEquipments.push(eq.trim());
            }
          });
        }

        // Create this unique Frente
        const newFrente: FrenteItem = {
          id: `frente-${Date.now()}-${i}`,
          frenteNumber: frenteNum,
          activity: analysis.activity || `Labor técnica en Frente ${frenteNum}`,
          description: analysis.description || `Supervisión de actividades constructivas en el frente ${frenteNum}.`,
          photoUrl: base64,
          photoFileName: file.name || `frente_${frenteNum}.jpg`,
          personnel: {
            residenteInterventoria: analysis.suggestedPersonnel?.residenteInterventoria ?? 1,
            residenteContratista: analysis.suggestedPersonnel?.residenteContratista ?? 1,
            siso: analysis.suggestedPersonnel?.siso ?? 1,
            obreros: analysis.suggestedPersonnel?.obreros ?? 4,
            topografo: analysis.suggestedPersonnel?.topografo ?? 0,
          },
          novedades: '', // Blank by default
        };

        accumulatedFrentes.push(newFrente);

        // Update state progressively so the user sees each Frente appear live!
        setFormData((prev) => ({
          ...prev,
          weather: detectedWeather,
          frentes: renumberFrentes([...prev.frentes, newFrente]),
        }));
      }

      // Consolidate General Equipment across all photos
      if (detectedEquipments.length > 0) {
        setFormData((prev) => {
          const current = prev.generalEquipmentAndTools ? prev.generalEquipmentAndTools.trim() : '';
          const newItems = detectedEquipments.join(', ');
          const combined = current ? `${current}\n${newItems}.` : `${newItems}.`;
          return {
            ...prev,
            generalEquipmentAndTools: combined,
          };
        });
      }
setIsAnalyzing(false);
      setNotification({
        type: 'success',
        message: `¡Análisis individual completado con éxito! Se procesaron ${accumulatedFrentes.length} fotografía(s) de forma independiente con actividades diferenciadas y sin repetición de texto.`,
      });
    } catch (err: any) {
      console.error('Error in photo analysis:', err);
      setIsAnalyzing(false);
      setNotification({
        type: 'error',
        message: 'Ocurrió un inconveniente durante el análisis independiente de fotografías. Puedes ingresar o editar los datos manualmente.',
      });
    } finally {
      setIsAnalyzing(false);
      setAiStatusMessage('');
    }
  };

  // Helper to read file as Base64 Data URL
  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Manual Frente addition
  const handleAddManualFrente = () => {
    const nextNum = formData.frentes.length + 1;
    const newFrente: FrenteItem = {
      id: `frente-${Date.now()}`,
      frenteNumber: nextNum,
      activity: 'Actividad de obra civil',
      description: 'Supervisión de actividades de construcción en el frente de obra.',
      photoUrl: '',
      photoFileName: '',
      personnel: {
        residenteInterventoria: 1,
        residenteContratista: 1,
        siso: 1,
        obreros: 3,
        topografo: 0,
      },
      novedades: '', // Blank by default
    };

    setFormData((prev) => ({
      ...prev,
      frentes: [...prev.frentes, newFrente],
    }));
  };

  // Remove Frente with immediate sequential renumbering
  const handleRemoveFrente = (index: number) => {
    const targetFrente = formData.frentes[index];
    const updated = formData.frentes.filter((_, idx) => idx !== index);
    const resequenced = renumberFrentes(updated);
    setFormData((prev) => ({
      ...prev,
      frentes: resequenced,
    }));
    setNotification({
      type: 'info',
      message: `Frente ${targetFrente ? targetFrente.frenteNumber : index + 1} eliminado. Los frentes restantes han sido reorganizados secuencialmente (${resequenced.length} frentes activos).`,
    });
  };

  // Update Frente property
  const handleUpdateFrente = (index: number, field: keyof FrenteItem, value: any) => {
    const updated = [...formData.frentes];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setFormData((prev) => ({ ...prev, frentes: updated }));
  };

  // Update Frente Personnel count
  const handleUpdatePersonnel = (
    index: number,
    role: keyof FrenteItem['personnel'],
    deltaOrValue: number,
    isAbsolute = false
  ) => {
    const updated = [...formData.frentes];
    const currentCount = updated[index].personnel[role] || 0;
    const newCount = isAbsolute ? Math.max(0, deltaOrValue) : Math.max(0, currentCount + deltaOrValue);

    updated[index] = {
      ...updated[index],
      personnel: {
        ...updated[index].personnel,
        [role]: newCount,
      },
    };
    setFormData((prev) => ({ ...prev, frentes: updated }));
  };

  // Save handler
  const handleSaveReport = () => {
    if (formData.frentes.length === 0) {
      setNotification({
        type: 'error',
        message: 'Debes incluir al menos un Frente de obra (sube fotografías de obra o añade un frente con "+ Agregar Frente Manual").',
      });
      return;
    }

    onSave(formData);
  };

  // Direct Excel Export handler
  const handleDirectExcelExport = async () => {
    if (formData.frentes.length === 0) {
      setNotification({
        type: 'error',
        message: 'No puedes exportar un informe sin frentes de obra registrados.',
      });
      return;
    }

    try {
      setIsExporting(true);
      await exportDailyReportToExcel(formData);
      setNotification({
        type: 'success',
        message: 'Archivo Excel (.xlsx) de 2 pestañas generado y descargado correctamente.',
      });
    } catch (e) {
      console.error(e);
      setNotification({
        type: 'error',
        message: 'Error al exportar archivo Excel.',
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Append machinery tag helper
  const addEquipmentTag = (tag: string) => {
    setFormData((prev) => {
      const current = prev.generalEquipmentAndTools.trim();
      const separator = current ? (current.endsWith('.') ? ' ' : ', ') : '';
      return {
        ...prev,
        generalEquipmentAndTools: `${current}${separator}${tag}`,
      };
    });
  };

  // Consolidated Daily Personnel Calculation
  const totalDailyInterv = formData.frentes.reduce((acc, f) => acc + (f.personnel.residenteInterventoria || 0), 0);
  const totalDailyContr = formData.frentes.reduce((acc, f) => acc + (f.personnel.residenteContratista || 0), 0);
  const totalDailySiso = formData.frentes.reduce((acc, f) => acc + (f.personnel.siso || 0), 0);
  const totalDailyObreros = formData.frentes.reduce((acc, f) => acc + (f.personnel.obreros || 0), 0);
  const totalDailyTopografo = formData.frentes.reduce((acc, f) => acc + (f.personnel.topografo || 0), 0);
  const totalDailyWorkers = totalDailyInterv + totalDailyContr + totalDailySiso + totalDailyObreros + totalDailyTopografo;

  return (
    <div className="max-w-6xl mx-auto pb-16">
      {/* Lightbox for zooming photos */}
      {lightboxImage && (
        <PhotoLightbox
          isOpen={!!lightboxImage}
          onClose={() => setLightboxImage(null)}
          imageUrl={lightboxImage.url}
          title={lightboxImage.title}
          subtitle={lightboxImage.subtitle}
        />
      )}

      {/* Notifications banner */}
      {notification && (
        <div
          className={`mb-6 p-4 rounded-xl border flex items-start justify-between gap-3 shadow-xs transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : notification.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-900'
              : 'bg-blue-50 border-blue-200 text-blue-900'
          }`}
        >
          <div className="flex items-center gap-2 text-sm font-medium">
            {notification.type === 'success' && <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />}
            {notification.type === 'error' && <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />}
            {notification.type === 'info' && <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0" />}
            <span>{notification.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-xs font-semibold underline hover:opacity-75 cursor-pointer ml-3"
          >
            Entendido
          </button>
        </div>
      )}

      {/* Top Action Bar */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 mb-6 flex flex-wrap items-center justify-between gap-4 sticky top-4 z-20 backdrop-blur-md bg-white/95">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al Historial
          </button>
          <div className="h-5 w-px bg-slate-200"></div>
          <div>
            <h1 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>{initialReport ? 'Editar Informe Diario' : 'Nuevo Informe Diario de Interventoría'}</span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                ID-{formData.reportNumber.toString().padStart(3, '0')}
              </span>
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onPreviewExcel(formData)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            title="Previsualizar las 2 pestañas oficiales"
          >
            <Eye className="w-4 h-4 text-blue-700" />
            Vista Previa Excel
          </button>

          <button
            type="button"
            onClick={handleDirectExcelExport}
            disabled={isExporting || formData.frentes.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            title="Descargar archivo Excel con 2 pestañas e imágenes insertadas"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            {isExporting ? 'Exportando...' : 'Exportar Excel (.xlsx)'}
          </button>

          <button
            type="button"
            onClick={handleSaveReport}
            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Guardar en Repositorio
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* ========================================================= */}
        {/* SECTION 1: Datos Generales del Informe (Encabezado) */}
        {/* ========================================================= */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              1. Datos Generales del Informe
            </h2>
            <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md font-medium">
              Encabezado Oficial del Reporte y Archivo Excel
            </span>
          </div>

          <div className="space-y-4">
            {/* Primary Header Row 1: Nombre del Proyecto / Contrato */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-800">
                  Nombre del Proyecto / Contrato <span className="text-red-500">*</span>
                </label>
                <span className="text-[11px] text-slate-400 font-medium">
                  Se reflejará en la parte superior del Excel y en el Historial
                </span>
              </div>
              <input
                type="text"
                value={formData.projectContractName}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData({
                    ...formData,
                    projectContractName: val,
                    projectName: val, // keep synchronized
                  });
                }}
                placeholder="Ejemplo: Consorcio Malecón León Caridi - Unidades Funcionales 3 y 4 / Contrato EDU-423-2017"
                className="w-full px-3.5 py-2.5 text-sm font-semibold border-2 border-slate-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none text-slate-900 bg-slate-50/50"
              />
            </div>

            {/* Primary Header Row 2: Elaborado por / Interventor & Fecha del Informe */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-6">
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Elaborado por / Interventor <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.elaboratedBy}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData({
                      ...formData,
                      elaboratedBy: val,
                      interventorSigner: {
                        ...formData.interventorSigner,
                        name: val,
                      },
                    });
                  }}
                  placeholder="Nombre de la persona que elabora el reporte diario (ej. Ing. Carlos Fernando Restrepo)"
                  className="w-full px-3.5 py-2 text-sm font-medium border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-900"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Fecha del Informe <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm font-medium border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-800 cursor-pointer"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-bold text-slate-800 mb-1">Informe Diario No.</label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-slate-300 bg-slate-100 text-slate-600 text-xs font-mono font-bold">
                    ID-
                  </span>
                  <input
                    type="number"
                    value={formData.reportNumber}
                    onChange={(e) => setFormData({ ...formData, reportNumber: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold text-blue-900"
                  />
                </div>
              </div>
            </div>

            {/* Secondary Metadata Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Empresa o Consorcio Interventor
                </label>
                <input
                  type="text"
                  value={formData.supervisorEntity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      supervisorEntity: e.target.value,
                      interventorSigner: { ...formData.interventorSigner, entity: e.target.value },
                    })
                  }
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Empresa Contratista de Obra
                </label>
                <input
                  type="text"
                  value={formData.contractorEntity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      contractorEntity: e.target.value,
                      contractorSigner: { ...formData.contractorSigner, entity: e.target.value },
                    })
                  }
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* SECTION 2: Clima Automático y Seleccionable */}
        {/* ========================================================= */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              2. Clima de la Jornada (Inferido por IA y Seleccionable Manualmente)
            </h2>
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
              Requerimiento Maestro 2
            </span>
          </div>

          <p className="text-xs text-slate-600 mb-4">
            La IA infiere automáticamente las condiciones meteorológicas (Soleado, Nublado, Lluvioso) al analizar las
            fotografías de obra. Puedes cambiar la opción manualmente en cualquier momento desde el selector desplegable.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            {/* Native Dropdown Selector */}
            <div className="w-full sm:w-72">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Selector Desplegable de Clima:
              </label>
              <div className="relative">
                <select
                  value={formData.weather}
                  onChange={(e) => handleWeatherChange(e.target.value as WeatherType)}
                  className="w-full appearance-none px-4 py-2.5 bg-white border-2 border-slate-300 rounded-lg font-bold text-slate-800 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none cursor-pointer pr-10"
                >
                  <option value="Soleado">☀️ Soleado</option>
                  <option value="Nublado">⛅ Nublado</option>
                  <option value="Lluvioso">🌧️ Lluvioso</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Visual Pills for 1-Click Fast Toggle */}
            <div className="flex items-center gap-2 pt-5">
              <button
                type="button"
                onClick={() => handleWeatherChange('Soleado')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                  formData.weather === 'Soleado'
                    ? 'bg-amber-50 border-amber-400 text-amber-900 ring-2 ring-amber-300'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Sun className={`w-4 h-4 ${formData.weather === 'Soleado' ? 'text-amber-500' : 'text-slate-400'}`} />
                Soleado
              </button>

              <button
                type="button"
                onClick={() => handleWeatherChange('Nublado')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                  formData.weather === 'Nublado'
                    ? 'bg-slate-100 border-slate-400 text-slate-900 ring-2 ring-slate-300'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Cloud className={`w-4 h-4 ${formData.weather === 'Nublado' ? 'text-slate-600' : 'text-slate-400'}`} />
                Nublado
              </button>

              <button
                type="button"
                onClick={() => handleWeatherChange('Lluvioso')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                  formData.weather === 'Lluvioso'
                    ? 'bg-blue-50 border-blue-400 text-blue-900 ring-2 ring-blue-300'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <CloudRain className={`w-4 h-4 ${formData.weather === 'Lluvioso' ? 'text-blue-500' : 'text-slate-400'}`} />
                Lluvioso
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* SECTION 3: Subida y Detección Automática de Frentes por Foto */}
        {/* ========================================================= */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              3. Carga de Fotografías y Detección Automática por IA (Gemini 3.8 Flash)
            </h2>
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
              Requerimiento Maestro 3
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-5">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-3 bg-blue-100 text-blue-700 rounded-xl mt-1">
                  <Camera className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Sube una o varias fotografías de obra para generar los frentes secuencialmente
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                    Cada foto creará automáticamente un Frente de obra (Frente 1, Frente 2...). La IA detectará la
                    <strong> Actividad Concreta</strong> (estrictamente sin cotas, espesores ni dimensiones exactas) y
                    una <strong>Descripción breve</strong> de la labor.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <label className="relative cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-sm font-bold rounded-lg shadow-sm transition-colors">
                  <UploadCloud className="w-4 h-4" />
                  <span>Subir Fotografías de Obra</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    disabled={isAnalyzing}
                    className="sr-only"
                  />
                </label>
              </div>
            </div>

            {/* Analysis Loading Progress Bar */}
            {isAnalyzing && (
              <div className="mt-4 pt-4 border-t border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs font-semibold text-blue-900 animate-pulse">{aiStatusMessage}</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Notice about strict concrete activity formatting */}
          <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg text-xs text-blue-900 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-blue-700 flex-shrink-0" />
              <strong>Estándar de Interventoría Activo:</strong> Se prohíbe expresamente incluir cotas, espesores,
              números de planos o dimensiones exactas en el nombre de la actividad.
            </span>
            <span className="text-slate-500 font-mono text-[11px]">Frentes Registrados: {formData.frentes.length}</span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* SECTION 4: Maquinaria, Equipos y Herramientas Menores */}
        {/* ========================================================= */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              4. Maquinaria, Equipos y Herramientas Menores (Resumen General Consolidado)
            </h2>
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
              Requerimiento Maestro 5
            </span>
          </div>

          <p className="text-xs text-slate-600 mb-3 leading-relaxed">
            La IA detecta automáticamente los equipos de todas las fotos y, <strong>en lugar de colocarlos por foto</strong>,
            los consolida en esta descripción general única para todo el informe del día. Es 100% editable.
          </p>

          <textarea
            rows={3}
            value={formData.generalEquipmentAndTools}
            onChange={(e) => setFormData({ ...formData, generalEquipmentAndTools: e.target.value })}
            placeholder="Ejemplo: 1 Retroexcavadora sobre orugas Caterpillar 320D, 1 Camión mixer de 8m³, 1 Vibrador pendular para concreto a gasolina, 1 Estación total topográfica con trípode, Herramientas menores (palas, picas, carretillas buggi, boquilleras de aluminio, niveles de burbuja y cizallas)..."
            className="w-full px-4 py-3 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none leading-relaxed text-slate-800"
          ></textarea>

          {/* Quick Helper Chips */}
          <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-medium mr-1">Insertar equipo rápido:</span>
            {[
              '1 Retroexcavadora CAT 320',
              '1 Camión mixer de concreto 8m³',
              '1 Vibrador pendular para concreto',
              '1 Estación total con trípode y jalón',
              '1 Motobomba de achique de 3"',
              '1 Volqueta doble troque 14m³',
              'Herramientas menores de albañilería (palas, carretillas, boquilleras, niveles)',
            ].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => addEquipmentTag(tag)}
                className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 border border-slate-200 rounded-md transition-colors cursor-pointer text-[11px]"
              >
                + {tag.split(' ')[1] || tag}
              </button>
            ))}
          </div>
        </div>

        {/* ========================================================= */}
        {/* SECTION 5: Detalle Secuencial por Frentes de Obra */}
        {/* ========================================================= */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                5. Frentes de Obra Registrados ({formData.frentes.length})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Cada foto crea un Frente secuencial con su actividad técnica, desglose de personal y botón para eliminar.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {formData.frentes.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('¿Estás seguro de que deseas eliminar TODOS los frentes de este informe?')) {
                      setFormData((prev) => ({ ...prev, frentes: [] }));
                      setNotification({
                        type: 'info',
                        message: 'Se han eliminado todos los frentes. La tabla temporal ha quedado vacía.',
                      });
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Borrar Todos</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleAddManualFrente}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar Frente Manual</span>
              </button>
            </div>
          </div>

          {formData.frentes.length === 0 ? (
            <div className="bg-white rounded-xl border-2 border-dashed border-slate-300 p-12 text-center">
              <Camera className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-700">Aún no hay frentes de obra registrados</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-5 leading-relaxed">
                El informe se encuentra en blanco y listo para registrar. Sube las fotografías tomadas hoy en obra para que la IA cree cada frente o agrega uno de forma manual.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <label className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow-xs transition-colors">
                  <UploadCloud className="w-4 h-4" />
                  <span>Subir Fotografías de Obra</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    disabled={isAnalyzing}
                    className="sr-only"
                  />
                </label>
                <button
                  type="button"
                  onClick={handleAddManualFrente}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  + Agregar Frente Manual
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {formData.frentes.map((frente, index) => {
                const frenteTotalPersonnel =
                  (frente.personnel.residenteInterventoria || 0) +
                  (frente.personnel.residenteContratista || 0) +
                  (frente.personnel.siso || 0) +
                  (frente.personnel.obreros || 0) +
                  (frente.personnel.topografo || 0);

                return (
                  <div
                    key={frente.id}
                    className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden transition-all hover:border-slate-300"
                  >
                    {/* Frente Card Header with Prominent Delete Button */}
                    <div className="bg-[#0F2942] text-white px-5 py-3 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-blue-600 font-black text-xs tracking-wider rounded uppercase">
                          Frente {frente.frenteNumber}
                        </span>
                        <span className="text-xs font-medium text-slate-200">
                          {frente.photoFileName || `Evidencia fotográfica Frente ${frente.frenteNumber}`}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-900/80 text-blue-200 border border-blue-700 font-semibold">
                          Total: {frenteTotalPersonnel} personas
                        </span>
                        {/* Prominent Trash / Eliminar Button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveFrente(index)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
                          title={`Eliminar Frente ${frente.frenteNumber}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Eliminar Frente {frente.frenteNumber}</span>
                        </button>
                      </div>
                    </div>

                    <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-5">
                      {/* Photo Thumbnail / Lightbox preview (Col 1-4) */}
                      <div className="lg:col-span-4 flex flex-col justify-between">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-2">
                            Evidencia Fotográfica (Pestaña 2 Excel)
                          </label>
                          {frente.photoUrl ? (
                            <div className="relative group rounded-lg overflow-hidden border border-slate-300 bg-slate-900 aspect-4/3 flex items-center justify-center">
                              <img
                                src={frente.photoUrl}
                                alt={`Frente ${frente.frenteNumber}`}
                                className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-200"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setLightboxImage({
                                      url: frente.photoUrl,
                                      title: `Frente ${frente.frenteNumber}: ${frente.activity}`,
                                      subtitle: frente.description,
                                    })
                                  }
                                  className="px-3 py-1.5 bg-white text-slate-900 rounded-md font-semibold text-xs shadow-md flex items-center gap-1.5 cursor-pointer hover:bg-slate-100"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  Ver Ampliada
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="aspect-4/3 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                              <Camera className="w-8 h-8 mb-1 text-slate-300" />
                              <span className="text-xs">Sin fotografía asignada</span>
                            </div>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-400 italic mt-2">
                          Se insertará limpia en la Columna 3 de la Pestaña "Registro Fotográfico".
                        </p>
                      </div>

                      {/* Technical Activities & Descriptions (Col 5-12) */}
                      <div className="lg:col-span-8 space-y-4">
                        {/* Actividad Concreta */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-xs font-bold text-slate-800">
                              Actividad realizada de manera concreta (Técnica y clara):
                            </label>
                            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              Sin cotas, espesores ni planos
                            </span>
                          </div>
                          <input
                            type="text"
                            value={frente.activity}
                            onChange={(e) => handleUpdateFrente(index, 'activity', e.target.value)}
                            placeholder="Ejemplo: Excavación con retroexcavadora / Fundida de concreto en vía peatonal"
                            className="w-full px-3.5 py-2 text-sm font-semibold border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-900"
                          />
                        </div>

                        {/* Descripción Breve */}
                        <div>
                          <label className="block text-xs font-bold text-slate-800 mb-1">
                            Descripción breve y puntual de la labor realizada:
                          </label>
                          <textarea
                            rows={2}
                            value={frente.description}
                            onChange={(e) => handleUpdateFrente(index, 'description', e.target.value)}
                            placeholder="Descripción concisa de la labor desarrollada en el frente durante la jornada..."
                            className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-700"
                          ></textarea>
                        </div>

                        {/* DESGLOSE DE PERSONAL POR FRENTE */}
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                              <Users className="w-3.5 h-3.5 text-blue-700" />
                              Desglose y Selección de Personal en este Frente:
                            </span>
                            <span className="text-xs font-bold text-blue-800">
                              Subtotal: {frenteTotalPersonnel} personas
                            </span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                            {/* 1. Ing Residente Interventoría */}
                            <div className="bg-white p-2 border border-slate-200 rounded-md">
                              <label className="block text-[11px] font-semibold text-slate-700 truncate" title="Ingeniero Residente de Interventoría">
                                Ing. Interventoría
                              </label>
                              <div className="flex items-center mt-1">
                                <button
                                  type="button"
                                  onClick={() => handleUpdatePersonnel(index, 'residenteInterventoria', -1)}
                                  className="w-6 h-6 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded text-slate-700 text-xs font-bold cursor-pointer"
                                >
                                  -
                                </button>
                                <input
                                  type="number"
                                  min="0"
                                  value={frente.personnel.residenteInterventoria}
                                  onChange={(e) =>
                                    handleUpdatePersonnel(index, 'residenteInterventoria', parseInt(e.target.value) || 0, true)
                                  }
                                  className="w-full text-center text-xs font-bold text-slate-800 focus:outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleUpdatePersonnel(index, 'residenteInterventoria', 1)}
                                  className="w-6 h-6 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded text-slate-700 text-xs font-bold cursor-pointer"
                                >
                                  +
                                </button>
                              </div>
                            </div>

                            {/* 2. Ing Contratista */}
                            <div className="bg-white p-2 border border-slate-200 rounded-md">
                              <label className="block text-[11px] font-semibold text-slate-700 truncate" title="Ingeniero del Contratista">
                                Ing. Contratista
                              </label>
                              <div className="flex items-center mt-1">
                                <button
                                  type="button"
                                  onClick={() => handleUpdatePersonnel(index, 'residenteContratista', -1)}
                                  className="w-6 h-6 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded text-slate-700 text-xs font-bold cursor-pointer"
                                >
                                  -
                                </button>
                                <input
                                  type="number"
                                  min="0"
                                  value={frente.personnel.residenteContratista}
                                  onChange={(e) =>
                                    handleUpdatePersonnel(index, 'residenteContratista', parseInt(e.target.value) || 0, true)
                                  }
                                  className="w-full text-center text-xs font-bold text-slate-800 focus:outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleUpdatePersonnel(index, 'residenteContratista', 1)}
                                  className="w-6 h-6 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded text-slate-700 text-xs font-bold cursor-pointer"
                                >
                                  +
                                </button>
                              </div>
                            </div>

                            {/* 3. SISO */}
                            <div className="bg-white p-2 border border-slate-200 rounded-md">
                              <label className="block text-[11px] font-semibold text-slate-700 truncate" title="SISO (Seguridad y Salud en el Trabajo)">
                                SISO (SST)
                              </label>
                              <div className="flex items-center mt-1">
                                <button
                                  type="button"
                                  onClick={() => handleUpdatePersonnel(index, 'siso', -1)}
                                  className="w-6 h-6 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded text-slate-700 text-xs font-bold cursor-pointer"
                                >
                                  -
                                </button>
                                <input
                                  type="number"
                                  min="0"
                                  value={frente.personnel.siso}
                                  onChange={(e) => handleUpdatePersonnel(index, 'siso', parseInt(e.target.value) || 0, true)}
                                  className="w-full text-center text-xs font-bold text-slate-800 focus:outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleUpdatePersonnel(index, 'siso', 1)}
                                  className="w-6 h-6 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded text-slate-700 text-xs font-bold cursor-pointer"
                                >
                                  +
                                </button>
                              </div>
                            </div>

                            {/* 4. Obreros (Oficiales y Ayudantes) */}
                            <div className="bg-white p-2 border border-blue-200 rounded-md bg-blue-50/20">
                              <label className="block text-[11px] font-bold text-blue-900 truncate" title="Obreros (Oficiales y Ayudantes)">
                                Obreros (Ofic/Ayud)
                              </label>
                              <div className="flex items-center mt-1">
                                <button
                                  type="button"
                                  onClick={() => handleUpdatePersonnel(index, 'obreros', -1)}
                                  className="w-6 h-6 flex items-center justify-center bg-blue-100 hover:bg-blue-200 rounded text-blue-900 text-xs font-bold cursor-pointer"
                                >
                                  -
                                </button>
                                <input
                                  type="number"
                                  min="0"
                                  value={frente.personnel.obreros}
                                  onChange={(e) =>
                                    handleUpdatePersonnel(index, 'obreros', parseInt(e.target.value) || 0, true)
                                  }
                                  className="w-full text-center text-xs font-bold text-blue-950 focus:outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleUpdatePersonnel(index, 'obreros', 1)}
                                  className="w-6 h-6 flex items-center justify-center bg-blue-100 hover:bg-blue-200 rounded text-blue-900 text-xs font-bold cursor-pointer"
                                >
                                  +
                                </button>
                              </div>
                            </div>

                            {/* 5. Topógrafo */}
                            <div className="bg-white p-2 border border-slate-200 rounded-md">
                              <label className="block text-[11px] font-semibold text-slate-700 truncate" title="Topógrafo">
                                Topógrafo
                              </label>
                              <div className="flex items-center mt-1">
                                <button
                                  type="button"
                                  onClick={() => handleUpdatePersonnel(index, 'topografo', -1)}
                                  className="w-6 h-6 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded text-slate-700 text-xs font-bold cursor-pointer"
                                >
                                  -
                                </button>
                                <input
                                  type="number"
                                  min="0"
                                  value={frente.personnel.topografo}
                                  onChange={(e) =>
                                    handleUpdatePersonnel(index, 'topografo', parseInt(e.target.value) || 0, true)
                                  }
                                  className="w-full text-center text-xs font-bold text-slate-800 focus:outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleUpdatePersonnel(index, 'topografo', 1)}
                                  className="w-6 h-6 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded text-slate-700 text-xs font-bold cursor-pointer"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* COLUMNA DE NOVEDADES MANUAL */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                              <span>Columna de Novedades (Opcional - Manual):</span>
                            </label>
                            <span className="text-[11px] text-slate-400 italic">
                              En blanco por defecto. Diligenciar solo si hubo eventualidades.
                            </span>
                          </div>
                          <input
                            type="text"
                            value={frente.novedades}
                            onChange={(e) => handleUpdateFrente(index, 'novedades', e.target.value)}
                            placeholder="En blanco por defecto. Ejemplo: Se detuvo labor 40 min por lluvia torrencial / Toma de 4 cilindros de prueba..."
                            className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-700 bg-slate-50/50"
                          />
                        </div>

                        {/* Bottom Secondary Delete Button */}
                        <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                          <span className="text-[11px] text-slate-500 font-medium">
                            Frente {frente.frenteNumber} de {formData.frentes.length} frentes activos
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveFrente(index)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 hover:text-white hover:bg-red-600 border border-red-200 hover:border-red-600 rounded-lg transition-all cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Eliminar Frente {frente.frenteNumber}</span>
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

        {/* ========================================================= */}
        {/* SECTION 6: Consolidado de Personal del Día y Firmas */}
        {/* ========================================================= */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-slate-700"></span>
            6. Consolidado Total del Día y Responsables Técnicos de Firma
          </h2>

          {/* Totals Summary Banner */}
          <div className="bg-slate-100 border border-slate-200 rounded-lg p-4 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-medium">
              <div>
                <span className="text-slate-500">Total Frentes Activos:</span>
                <span className="text-slate-900 font-bold ml-1.5 text-sm">{formData.frentes.length}</span>
              </div>
              <div>
                <span className="text-slate-500">Ing. Interventoría:</span>
                <span className="text-slate-900 font-bold ml-1.5">{totalDailyInterv}</span>
              </div>
              <div>
                <span className="text-slate-500">Ing. Contratista:</span>
                <span className="text-slate-900 font-bold ml-1.5">{totalDailyContr}</span>
              </div>
              <div>
                <span className="text-slate-500">SISO (SST):</span>
                <span className="text-slate-900 font-bold ml-1.5">{totalDailySiso}</span>
              </div>
              <div>
                <span className="text-slate-500">Obreros / Ayudantes:</span>
                <span className="text-slate-900 font-bold ml-1.5">{totalDailyObreros}</span>
              </div>
              <div>
                <span className="text-slate-500">Topógrafo:</span>
                <span className="text-slate-900 font-bold ml-1.5">{totalDailyTopografo}</span>
              </div>
              <div className="bg-blue-700 text-white px-3 py-1.5 rounded-md font-bold text-xs">
                Total Personal en Obra: {totalDailyWorkers}
              </div>
            </div>
          </div>

          {/* Signers inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                Responsable por la Interventoría:
              </h3>
              <div className="space-y-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Nombre Completo</label>
                  <input
                    type="text"
                    value={formData.interventorSigner.name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        interventorSigner: { ...formData.interventorSigner, name: e.target.value },
                      })
                    }
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Matrícula Profesional</label>
                  <input
                    type="text"
                    value={formData.interventorSigner.license}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        interventorSigner: { ...formData.interventorSigner, license: e.target.value },
                      })
                    }
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Cargo / Función</label>
                  <input
                    type="text"
                    value={formData.interventorSigner.role}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        interventorSigner: { ...formData.interventorSigner, role: e.target.value },
                      })
                    }
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                Responsable por el Contratista de Obra:
              </h3>
              <div className="space-y-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Nombre Completo</label>
                  <input
                    type="text"
                    value={formData.contractorSigner.name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contractorSigner: { ...formData.contractorSigner, name: e.target.value },
                      })
                    }
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Matrícula Profesional</label>
                  <input
                    type="text"
                    value={formData.contractorSigner.license}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contractorSigner: { ...formData.contractorSigner, license: e.target.value },
                      })
                    }
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Cargo / Función</label>
                  <input
                    type="text"
                    value={formData.contractorSigner.role}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contractorSigner: { ...formData.contractorSigner, role: e.target.value },
                      })
                    }
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded bg-white"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Save Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Cancelar
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleDirectExcelExport}
              disabled={isExporting || formData.frentes.length === 0}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              {isExporting ? 'Generando...' : 'Exportar a Excel (.xlsx)'}
            </button>

            <button
              type="button"
              onClick={handleSaveReport}
              className="flex items-center gap-2 px-6 py-2 text-sm font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Guardar Informe en el Repositorio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
