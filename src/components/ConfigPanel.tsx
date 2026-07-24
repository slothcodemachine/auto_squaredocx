import React from 'react';
import { Folder, FolderPlus, Sliders, Palette, Zap, Sparkles, Check } from 'lucide-react';
import { AppConfig } from '../types';
import { aeroAudio } from '../utils/audio';

interface ConfigPanelProps {
  config: AppConfig;
  onChangeConfig: (newConfig: Partial<AppConfig>) => void;
  onPickDirectory: () => void;
  onProcessAll: () => void;
  isProcessing: boolean;
  hasFiles: boolean;
}

export const ConfigPanel: React.FC<ConfigPanelProps> = ({
  config,
  onChangeConfig,
  onPickDirectory,
  onProcessAll,
  isProcessing,
  hasFiles,
}) => {
  const isDirectorySupported = typeof window !== 'undefined' && 'showDirectoryPicker' in window;

  return (
    <div className="aero-card rounded-xl p-5 shadow-md border border-white/90">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-sky-200/60">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-800 border border-sky-300">
            <Sliders className="w-4 h-4 text-sky-700" />
          </div>
          <h2 className="text-sm font-bold text-slate-800">Definições da Cópia & Sobreposição</h2>
        </div>
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          80% Transparência (Amarelo)
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Destination & Subfolder Options */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <FolderPlus className="w-3.5 h-3.5 text-sky-600" />
                Nome da Subpasta de Resultados:
              </span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={config.subfolderName}
                onChange={(e) => onChangeConfig({ subfolderName: e.target.value })}
                placeholder="ex: Resultados_Amarelo"
                className="aero-input w-full px-3 py-2 rounded-lg text-xs font-semibold text-slate-800"
              />
            </div>
            <p className="text-[11px] text-slate-600 mt-1">
              Os ficheiros modificados serão guardados dentro desta subpasta.
            </p>
          </div>

          {/* Directory Picker Button */}
          <div className="pt-1">
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Folder className="w-3.5 h-3.5 text-sky-600" />
              Pasta Local de Destino:
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  aeroAudio.playGlassClick(config.soundEnabled);
                  onPickDirectory();
                }}
                className="aero-button-secondary px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 cursor-pointer transition shadow-sm w-full"
              >
                <Folder className="w-4 h-4 text-sky-700" />
                <span className="truncate">
                  {config.saveMode === 'directory'
                    ? 'Pasta Local Selecionada ✓'
                    : 'Escolher Pasta Local no Computador...'}
                </span>
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {isDirectorySupported
                ? 'Permite guardar diretamente numa pasta real do sistema.'
                : 'Poderá descarregar todos os ficheiros organizados num ficheiro ZIP.'}
            </p>
          </div>
        </div>

        {/* Yellow Overlay Customization */}
        <div className="space-y-3 bg-sky-50/50 p-3.5 rounded-lg border border-sky-200/80">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-amber-600" />
              Nível de Transparência:
            </label>
            <span className="text-xs font-extrabold text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded border border-amber-300">
              {config.transparencyPercent}% Transparente
            </span>
          </div>

          <input
            type="range"
            min="10"
            max="95"
            step="5"
            value={config.transparencyPercent}
            onChange={(e) => onChangeConfig({ transparencyPercent: Number(e.target.value) })}
            className="w-full accent-amber-500 cursor-pointer h-2 bg-sky-200 rounded-lg appearance-none"
          />

          <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span>Opaco (10%)</span>
            <span className="text-amber-800 font-bold">Padrão: 80%</span>
            <span>Transparente (95%)</span>
          </div>

          {/* Color preview swatch */}
          <div className="flex items-center justify-between pt-1 border-t border-sky-200/60">
            <span className="text-xs font-semibold text-slate-700">Tom de Cor da Sobreposição:</span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={config.overlayColor}
                onChange={(e) => onChangeConfig({ overlayColor: e.target.value })}
                className="w-7 h-7 rounded border border-sky-300 cursor-pointer p-0.5 bg-white shadow-sm"
              />
              <span className="text-xs font-mono font-bold text-slate-700">
                {config.overlayColor.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Process Execution Button */}
      <div className="mt-5 pt-4 border-t border-sky-200/60 flex items-center justify-between">
        <div className="text-xs text-slate-600 hidden sm:block">
          {hasFiles
            ? 'Pronto para aplicar retângulo amarelo de 80% transparência.'
            : 'Adiciona pelo menos um ficheiro .docx para começar.'}
        </div>

        <button
          type="button"
          disabled={!hasFiles || isProcessing}
          onClick={() => {
            aeroAudio.playGlassClick(config.soundEnabled);
            onProcessAll();
          }}
          className={`aero-button px-6 py-3 rounded-xl text-white font-bold text-sm flex items-center gap-2 shadow-lg transition-all ${
            !hasFiles || isProcessing ? 'opacity-50 cursor-not-allowed filter grayscale' : 'cursor-pointer hover:scale-[1.02]'
          }`}
        >
          {isProcessing ? (
            <>
              <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              <span>A Processar Ficheiros...</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 text-yellow-300 fill-yellow-300" />
              <span>Processar & Criar Cópias Amarelas</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
