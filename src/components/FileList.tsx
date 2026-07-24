import React from 'react';
import { FileText, Eye, Download, Trash2, CheckCircle, AlertCircle, RefreshCw, Layers } from 'lucide-react';
import { ProcessedFileItem } from '../types';
import { aeroAudio } from '../utils/audio';

interface FileListProps {
  files: ProcessedFileItem[];
  onRemoveFile: (id: string) => void;
  onClearAll: () => void;
  onPreviewFile: (file: ProcessedFileItem) => void;
  onDownloadSingle: (file: ProcessedFileItem) => void;
  soundEnabled: boolean;
  transparencyPercent: number;
  overlayColor: string;
}

export const FileList: React.FC<FileListProps> = ({
  files,
  onRemoveFile,
  onClearAll,
  onPreviewFile,
  onDownloadSingle,
  soundEnabled,
  transparencyPercent,
  overlayColor,
}) => {
  if (files.length === 0) return null;

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="aero-card rounded-xl p-5 shadow-md border border-white/90 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-sky-200/60">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-800 border border-sky-300">
            <FileText className="w-4 h-4 text-sky-700" />
          </div>
          <h2 className="text-sm font-bold text-slate-800">
            Lista de Ficheiros Finais ({files.length})
          </h2>
        </div>

        <button
          type="button"
          onClick={() => {
            aeroAudio.playGlassClick(soundEnabled);
            onClearAll();
          }}
          className="text-xs text-rose-700 hover:text-rose-900 font-semibold px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 transition shadow-xs flex items-center gap-1 cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Limpar Lista</span>
        </button>
      </div>

      {/* Files Table / List */}
      <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
        {files.map((item) => (
          <div
            key={item.id}
            className="p-3.5 rounded-xl bg-gradient-to-r from-white via-sky-50/50 to-white border border-sky-200/80 shadow-xs hover:border-sky-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative overflow-hidden group"
          >
            {/* Glossy overlay effect */}
            <div className="absolute top-0 left-0 right-0 h-1/2 bg-white/40 pointer-events-none" />

            {/* Left: File Info & Status */}
            <div className="flex items-start gap-3 min-w-0 z-10">
              {/* File Icon Badge */}
              <div className="w-10 h-10 rounded-xl bg-gradient-to-b from-sky-100 to-sky-200 border border-sky-300 flex items-center justify-center shrink-0 shadow-inner relative">
                <FileText className="w-5 h-5 text-sky-700" />
                {item.status === 'completed' && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-amber-400 border border-white flex items-center justify-center text-[9px] font-bold text-amber-950 shadow-xs" title="Modificado com tom amarelo">
                    <Layers className="w-2.5 h-2.5" />
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <h3 className="text-xs font-bold text-slate-800 truncate" title={item.name}>
                  {item.name}
                </h3>
                <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 font-medium">
                  <span>Tamanho: {formatFileSize(item.size)}</span>
                  {item.processedSize && (
                    <span className="text-emerald-700 font-semibold">
                      → {formatFileSize(item.processedSize)}
                    </span>
                  )}
                </div>

                {/* Progress or Status Label */}
                <div className="mt-1.5 flex items-center gap-2">
                  {item.status === 'pending' && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      Pendente
                    </span>
                  )}

                  {item.status === 'processing' && (
                    <div className="w-36 h-2 rounded-full bg-sky-200 overflow-hidden border border-sky-300 relative">
                      <div className="h-full bg-sky-500 aero-progress-striped w-full rounded-full" />
                    </div>
                  )}

                  {item.status === 'completed' && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded border border-emerald-300 shadow-2xs">
                      <CheckCircle className="w-3 h-3 text-emerald-600" />
                      Cópia Pronta (+80% Amarelo)
                    </span>
                  )}

                  {item.status === 'error' && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded border border-rose-300" title={item.errorMessage}>
                      <AlertCircle className="w-3 h-3 text-rose-600" />
                      {item.errorMessage || 'Erro no processamento'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-1.5 shrink-0 z-10 self-end sm:self-center">
              {item.status === 'completed' && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      aeroAudio.playGlassClick(soundEnabled);
                      onPreviewFile(item);
                    }}
                    className="aero-button-secondary px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    title="Pré-visualizar Sobreposição Amarela"
                  >
                    <Eye className="w-3.5 h-3.5 text-sky-700" />
                    <span>Pré-visualizar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      aeroAudio.playGlassClick(soundEnabled);
                      onDownloadSingle(item);
                    }}
                    className="aero-button px-2.5 py-1.5 rounded-lg text-white font-semibold text-xs flex items-center gap-1 cursor-pointer"
                    title="Descarregar ficheiro modificado"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Guardar</span>
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={() => {
                  aeroAudio.playGlassClick(soundEnabled);
                  onRemoveFile(item.id);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition border border-transparent hover:border-rose-200 cursor-pointer"
                title="Remover ficheiro da lista"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
