import React, { useRef, useState } from 'react';
import { FileUp, FileText, Plus, Sparkles, CheckCircle2 } from 'lucide-react';
import { aeroAudio } from '../utils/audio';

interface DropZoneProps {
  onFilesAdded: (files: FileList | File[]) => void;
  soundEnabled: boolean;
  itemCount: number;
}

export const DropZone: React.FC<DropZoneProps> = ({
  onFilesAdded,
  soundEnabled,
  itemCount,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      aeroAudio.playBubblePop(soundEnabled);
      onFilesAdded(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      aeroAudio.playBubblePop(soundEnabled);
      onFilesAdded(e.target.files);
      // Reset input value so same files can be chosen again if needed
      e.target.value = '';
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative rounded-xl p-6 transition-all duration-300 border-2 border-dashed overflow-hidden ${
        isDragging
          ? 'bg-sky-200/70 border-sky-500 shadow-[0_0_25px_rgba(0,162,232,0.6)] scale-[1.01]'
          : 'bg-gradient-to-b from-white/70 to-sky-50/60 border-sky-300/80 hover:border-sky-400 hover:bg-white/90 shadow-sm'
      }`}
    >
      {/* Decorative Aero Gloss Shine */}
      <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/60 via-white/20 to-transparent pointer-events-none" />

      {/* Floating Bubbles Decor */}
      <div className="absolute -top-4 -left-4 w-16 h-16 rounded-full bg-cyan-300/20 blur-sm pointer-events-none animate-float-slow" />
      <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-sky-400/20 blur-md pointer-events-none animate-float-fast" />

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        multiple
        accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className="hidden"
      />

      <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-4">
        {/* Animated Icon Container */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-500 to-cyan-300 p-[2px] shadow-[0_6px_16px_rgba(0,100,200,0.3)]">
          <div className="w-full h-full rounded-[14px] bg-gradient-to-b from-white to-sky-100 flex items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1/2 bg-white/80 rounded-t-[14px]" />
            <FileUp className="w-8 h-8 text-sky-600 drop-shadow-[0_2px_4px_rgba(0,100,200,0.2)] z-10" />
          </div>
        </div>

        <div>
          <h2 className="text-base font-bold text-slate-800 drop-shadow-[0_1px_0_rgba(255,255,255,0.9)]">
            {isDragging
              ? 'Larga os ficheiros DOCX aqui!'
              : 'Arrasta e solta aqui um ou vários ficheiros .DOCX'}
          </h2>
          <p className="text-xs text-sky-900/70 font-medium mt-1">
            Suporta seleção múltipla de documentos Microsoft Word (.docx)
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
          <button
            type="button"
            onClick={() => {
              aeroAudio.playGlassClick(soundEnabled);
              fileInputRef.current?.click();
            }}
            className="aero-button px-5 py-2.5 rounded-xl text-white font-semibold text-sm flex items-center gap-2 shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Escolher Ficheiros DOCX</span>
          </button>
        </div>

        {itemCount > 0 && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/90 text-emerald-800 border border-emerald-300 text-xs font-semibold shadow-inner mt-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{itemCount} {itemCount === 1 ? 'ficheiro selecionado' : 'ficheiros selecionados'}</span>
          </div>
        )}
      </div>
    </div>
  );
};
