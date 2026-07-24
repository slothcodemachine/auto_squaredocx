import React from 'react';
import { Volume2, VolumeX, Sparkles, FolderArchive, Layers, Info } from 'lucide-react';
import { aeroAudio } from '../utils/audio';

interface HeaderWindowProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenHelp: () => void;
}

export const HeaderWindow: React.FC<HeaderWindowProps> = ({
  soundEnabled,
  onToggleSound,
  onOpenHelp,
}) => {
  return (
    <div className="aero-titlebar rounded-t-2xl px-5 py-3 flex items-center justify-between select-none border-b border-white/70 shadow-sm">
      {/* App Branding & Icon */}
      <div className="flex items-center space-x-3">
        {/* Glossy Icon Sphere */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-600 via-sky-400 to-white flex items-center justify-center p-[2px] shadow-[inset_0_2px_4px_rgba(255,255,255,0.9),0_4px_10px_rgba(0,120,220,0.4)] border border-white">
          <div className="w-full h-full rounded-full bg-gradient-to-b from-sky-400 to-blue-700 flex items-center justify-center text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/70 to-transparent rounded-t-full" />
            <Layers className="w-5 h-5 text-yellow-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] z-10" />
          </div>
        </div>

        <div>
          <h1 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2 drop-shadow-[0_1px_0_rgba(255,255,255,0.8)]">
            <span>Docx Yellow Tint Overlay</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-900 border border-sky-300/60 shadow-inner">
              Frutiger Aero Edition
            </span>
          </h1>
          <p className="text-xs text-sky-900/80 font-medium">
            Processamento de ficheiros DOCX com subpasta de resultados
          </p>
        </div>
      </div>

      {/* Window Controls & Toggles */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => {
            onToggleSound();
            aeroAudio.playGlassClick(!soundEnabled);
          }}
          title={soundEnabled ? 'Sons ativados' : 'Sons desativados'}
          className="p-2 rounded-lg bg-white/50 hover:bg-white/80 border border-white/80 text-sky-800 transition shadow-sm flex items-center gap-1 text-xs font-semibold"
        >
          {soundEnabled ? (
            <>
              <Volume2 className="w-4 h-4 text-sky-600" />
              <span className="hidden sm:inline">Som</span>
            </>
          ) : (
            <>
              <VolumeX className="w-4 h-4 text-slate-400" />
              <span className="hidden sm:inline text-slate-500">Mudo</span>
            </>
          )}
        </button>

        <button
          onClick={() => {
            aeroAudio.playGlassClick(soundEnabled);
            onOpenHelp();
          }}
          className="p-2 rounded-lg bg-white/50 hover:bg-white/80 border border-white/80 text-sky-800 transition shadow-sm flex items-center gap-1 text-xs font-semibold"
          title="Instruções"
        >
          <Info className="w-4 h-4 text-sky-600" />
          <span className="hidden sm:inline">Ajuda</span>
        </button>

        {/* Windows Aero Decorative Buttons */}
        <div className="flex items-center space-x-1 pl-2 border-l border-sky-300/40">
          <div className="w-3.5 h-3.5 rounded-full bg-yellow-400/80 border border-yellow-200 shadow-inner cursor-pointer hover:brightness-110" title="Minimizar" />
          <div className="w-3.5 h-3.5 rounded-full bg-emerald-400/80 border border-emerald-200 shadow-inner cursor-pointer hover:brightness-110" title="Maximizar" />
          <div className="w-3.5 h-3.5 rounded-full bg-rose-400/80 border border-rose-200 shadow-inner cursor-pointer hover:brightness-110" title="Aero" />
        </div>
      </div>
    </div>
  );
};
