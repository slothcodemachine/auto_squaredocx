import React from 'react';
import { Download, FolderArchive, FolderCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { ProcessedFileItem, AppConfig } from '../types';
import { aeroAudio } from '../utils/audio';

interface SummaryFooterProps {
  files: ProcessedFileItem[];
  config: AppConfig;
  onDownloadAllZip: () => void;
  onSaveToDirectory: () => void;
  isProcessing: boolean;
}

export const SummaryFooter: React.FC<SummaryFooterProps> = ({
  files,
  config,
  onDownloadAllZip,
  onSaveToDirectory,
  isProcessing,
}) => {
  if (files.length === 0) return null;

  const completedCount = files.filter((f) => f.status === 'completed').length;
  const isAllCompleted = completedCount > 0 && completedCount === files.length;

  return (
    <div className="aero-card rounded-xl p-5 shadow-lg border border-white/90 space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Left: Summary Status */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-emerald-400 p-[2px] shadow-sm">
            <div className="w-full h-full rounded-[10px] bg-white flex items-center justify-center">
              <FolderCheck className="w-5 h-5 text-sky-700" />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <span>Resumo do Processamento</span>
              {isAllCompleted && (
                <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Concluído com Sucesso!
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Subpasta de destino: <strong className="text-sky-900 font-bold">{config.subfolderName}</strong> ({completedCount} de {files.length} ficheiros prontos)
            </p>
          </div>
        </div>

        {/* Right: Export Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {config.saveMode === 'directory' && (
            <button
              type="button"
              disabled={completedCount === 0 || isProcessing}
              onClick={() => {
                aeroAudio.playGlassClick(config.soundEnabled);
                onSaveToDirectory();
              }}
              className="aero-button px-5 py-2.5 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
            >
              <FolderCheck className="w-4 h-4 text-emerald-300" />
              <span>Salvar na Pasta de Destino ({config.subfolderName})</span>
            </button>
          )}

          <button
            type="button"
            disabled={completedCount === 0 || isProcessing}
            onClick={() => {
              aeroAudio.playGlassClick(config.soundEnabled);
              onDownloadAllZip();
            }}
            className="aero-button px-5 py-2.5 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
          >
            <FolderArchive className="w-4 h-4 text-yellow-300" />
            <span>Descarregar Todos em Pasta ZIP</span>
          </button>
        </div>
      </div>
    </div>
  );
};
