import React, { useState } from 'react';
import { X, Layers, FileText, Check, Eye, Download, Info } from 'lucide-react';
import { ProcessedFileItem } from '../types';
import { aeroAudio } from '../utils/audio';

interface DocxPreviewModalProps {
  fileItem: ProcessedFileItem | null;
  transparencyPercent: number;
  overlayColor: string;
  onClose: () => void;
  onDownload: (item: ProcessedFileItem) => void;
  soundEnabled: boolean;
}

export const DocxPreviewModal: React.FC<DocxPreviewModalProps> = ({
  fileItem,
  transparencyPercent,
  overlayColor,
  onClose,
  onDownload,
  soundEnabled,
}) => {
  const [showOverlay, setShowOverlay] = useState(true);

  if (!fileItem) return null;

  // Calculate CSS opacity: transparency 80% -> fill opacity = 0.20
  const opacityRatio = Math.max(0, Math.min(1, (100 - transparencyPercent) / 100));

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="aero-glass rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl border border-white/90 overflow-hidden">
        {/* Titlebar */}
        <div className="aero-titlebar px-5 py-3 flex items-center justify-between border-b border-white/80 shrink-0">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-amber-400/90 border border-amber-200 flex items-center justify-center text-amber-950 font-bold shadow-xs">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">
                Pré-visualização da Página Modificada
              </h2>
              <p className="text-[11px] text-slate-600 truncate max-w-xs sm:max-w-md">
                {fileItem.name}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => {
                aeroAudio.playGlassClick(soundEnabled);
                onClose();
              }}
              className="w-7 h-7 rounded-full bg-rose-500/80 hover:bg-rose-600 text-white flex items-center justify-center border border-white/80 transition cursor-pointer shadow-xs"
              title="Fechar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="bg-sky-50/80 px-5 py-2.5 border-b border-sky-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                aeroAudio.playGlassClick(soundEnabled);
                setShowOverlay(!showOverlay);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition cursor-pointer ${
                showOverlay
                  ? 'bg-amber-300/90 text-amber-950 border-amber-400 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-300'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-amber-700" />
              <span>{showOverlay ? 'Com Retângulo Amarelo (Ativado)' : 'Sem Retângulo (Original)'}</span>
            </button>

            <span className="text-[11px] font-semibold text-slate-600 bg-white/80 px-2.5 py-1 rounded-md border border-slate-200">
              Transparência: <strong>{transparencyPercent}%</strong>
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              aeroAudio.playGlassClick(soundEnabled);
              onDownload(fileItem);
            }}
            className="aero-button px-3.5 py-1.5 rounded-lg text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Guardar DOCX Modificado</span>
          </button>
        </div>

        {/* Page Preview Body Container */}
        <div className="p-6 overflow-y-auto flex-1 bg-gradient-to-b from-slate-200/80 via-sky-100/50 to-slate-200/80 flex justify-center">
          {/* Simulated Paper Document (A4 portrait format) */}
          <div className="relative w-full max-w-[680px] min-h-[850px] bg-white rounded-sm shadow-[0_10px_30px_rgba(0,0,0,0.15)] border border-slate-300 p-10 font-sans text-slate-800 transition-all overflow-hidden">
            {/* The Full Page Overlay Yellow Rectangle */}
            {showOverlay && (
              <div
                className="absolute inset-0 pointer-events-none transition-all duration-300 z-20"
                style={{
                  backgroundColor: overlayColor,
                  opacity: opacityRatio,
                }}
              />
            )}

            {/* Document Header Line Decor */}
            <div className="border-b border-slate-200 pb-3 mb-6 flex justify-between items-center text-xs text-slate-400">
              <span>Documento Word (.docx)</span>
              <span>Página 1</span>
            </div>

            {/* Render HTML / Text extracted from docx */}
            {fileItem.previewHtml ? (
              <div
                className="prose prose-sm max-w-none text-slate-800 leading-relaxed space-y-4"
                dangerouslySetInnerHTML={{ __html: fileItem.previewHtml }}
              />
            ) : fileItem.previewText ? (
              <div className="text-sm leading-relaxed whitespace-pre-wrap text-slate-800">
                {fileItem.previewText}
              </div>
            ) : (
              <div className="py-20 text-center text-slate-500 space-y-3">
                <FileText className="w-12 h-12 mx-auto text-slate-300" />
                <p className="text-sm font-medium">Conteúdo do documento pronto para download.</p>
                <p className="text-xs text-slate-400">
                  O retângulo amarelo cobrirá 100% da extensão da página com {transparencyPercent}% de transparência.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Note */}
        <div className="bg-sky-100/80 px-5 py-2.5 border-t border-sky-200 text-xs text-sky-900/80 font-medium flex items-center gap-2 shrink-0">
          <Info className="w-4 h-4 text-sky-600 shrink-0" />
          <span>
            Esta pré-visualização simula fielmente a sobreposição retangular amarela com 80% de transparência aplicada na cópia OpenXML do ficheiro.
          </span>
        </div>
      </div>
    </div>
  );
};
