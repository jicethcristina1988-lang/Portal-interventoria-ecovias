import React from 'react';
import { X, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';

interface PhotoLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title: string;
  subtitle?: string;
}

export const PhotoLightbox: React.FC<PhotoLightboxProps> = ({
  isOpen,
  onClose,
  imageUrl,
  title,
  subtitle,
}) => {
  const [zoom, setZoom] = React.useState(1);
  const [rotation, setRotation] = React.useState(0);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 transition-all"
      onClick={onClose}
    >
      <div
        className="relative max-w-5xl w-full max-h-[90vh] bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-slate-950 text-white">
          <div>
            <h3 className="font-semibold text-base text-slate-100">{title}</h3>
            {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(z + 0.25, 2.5))}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Acercar"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(z - 0.25, 0.75))}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Alejar"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setRotation((r) => (r + 90) % 360)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Rotar"
            >
              <RotateCw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-950 hover:text-red-300 text-slate-300 transition-colors ml-2"
              title="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Image Display */}
        <div className="flex-1 overflow-auto p-6 flex items-center justify-center bg-slate-950/70 min-h-[400px]">
          <img
            src={imageUrl}
            alt={title}
            className="max-h-[72vh] max-w-full object-contain rounded shadow-lg transition-transform duration-200"
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
            }}
          />
        </div>

        {/* Footer info */}
        <div className="px-5 py-2.5 bg-slate-950 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
          <span>Evidencia fotográfica oficial para la Pestaña 2 del Excel</span>
          <span>Zoom: {Math.round(zoom * 100)}%</span>
        </div>
      </div>
    </div>
  );
};
