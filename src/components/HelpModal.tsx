import React from 'react';
import { X, CheckCircle, FileSpreadsheet, Sparkles, HardHat, Camera, Wrench, Shield } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const features = [
    {
      num: 1,
      title: 'Recopilación y Repositorio Cronológico',
      desc: 'Almacenamiento cronológico de cada informe de interventoría generado (uno debajo del otro). Consulta rápida, filtros por clima y exportación individual en formato Excel (.xlsx).',
    },
    {
      num: 2,
      title: 'Clima Automático y Seleccionable',
      desc: 'La IA analiza la iluminación, sombras y cielo de las fotos para inferir el estado del tiempo (Soleado, Nublado, Lluvioso). Presentado en la interfaz como un selector desplegable editable en 1 clic.',
    },
    {
      num: 3,
      title: 'Detección Automática y Frentes por Foto',
      desc: 'Cada foto subida asigna secuencialmente un Frente (Frente 1, Frente 2...). La IA detecta la Actividad concreta (prohibiendo cotas, espesores, números de planos o dimensiones exactas) y una descripción breve.',
    },
    {
      num: 4,
      title: 'Selección y Registro de Personal por Frente',
      desc: 'Contadores y campos numéricos editables por cada frente: Ing. Residente Interventoría, Ing. Contratista, SISO (SST), Obreros (Oficiales y Ayudantes) y Topógrafo.',
    },
    {
      num: 5,
      title: 'Maquinaria y Herramientas (Resumen General)',
      desc: 'En lugar de colocarlos por foto, la IA detecta los equipos de todas las imágenes y consolida una descripción general única para todo el informe diario.',
    },
    {
      num: 6,
      title: 'Columna de Novedades Manual',
      desc: 'Campo en blanco por defecto en cada Frente. 100% editable para reportar contingencias, lluvias, retrasos o toma de muestras.',
    },
    {
      num: 7,
      title: 'Exportación a Excel (.xlsx) de Dos Pestañas',
      desc: 'Pestaña 1 ("Actividades"): Encabezado general, tabla secuencial por Frentes, desglose de personal, columna de novedades en blanco y firmas. Pestaña 2 ("Registro Fotográfico"): Columnas estrictas [Frente] | [Actividad concreta] | [Evidencia fotográfica limpia sin texto inferior].',
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#0F2942] text-white px-6 py-4 flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-2.5">
            <Shield className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-base">Guía de Funcionalidades Maestras de Interventoría</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          <p className="text-slate-600 leading-relaxed text-sm">
            Este portal de gestión garantiza el cumplimiento de los 7 requerimientos maestros de supervisión técnica de
            obras civiles y generación de libros de control diario:
          </p>

          <div className="space-y-3">
            {features.map((f) => (
              <div key={f.num} className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-700 text-white font-bold flex items-center justify-center flex-shrink-0 text-xs">
                  {f.num}
                </span>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">{f.title}</h4>
                  <p className="text-slate-600 mt-0.5 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
