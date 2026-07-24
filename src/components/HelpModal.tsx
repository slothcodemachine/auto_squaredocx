import React from 'react';
import { X, CheckCircle, FolderPlus, Layers, FileUp, Sparkles } from 'lucide-react';
import { aeroAudio } from '../utils/audio';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  soundEnabled: boolean;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose, soundEnabled }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="aero-glass rounded-2xl w-full max-w-lg shadow-2xl border border-white/90 overflow-hidden">
        {/* Titlebar */}
        <div className="aero-titlebar px-5 py-3 flex items-center justify-between border-b border-white/80">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-300 flex items-center justify-center text-sky-800 font-bold">
              <Sparkles className="w-4 h-4 text-sky-600" />
            </div>
            <h2 className="text-sm font-bold text-slate-800">
              Instruções de Utilização
            </h2>
          </div>

          <button
            type="button"
            onClick={() => {
              aeroAudio.playGlassClick(soundEnabled);
              onClose();
            }}
            className="w-7 h-7 rounded-full bg-rose-500/80 hover:bg-rose-600 text-white flex items-center justify-center border border-white/80 transition cursor-pointer shadow-xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs text-slate-700 leading-relaxed">
          <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 space-y-1">
            <h3 className="font-bold text-sky-900 text-xs flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-amber-600" />
              Objetivo da Aplicação
            </h3>
            <p className="text-sky-900/80">
              Criar uma cópia dos ficheiros DOCX selecionados e aplicar em cada um um retângulo amarelo com 80% de transparência que sobrepõe todo o conteúdo em cada página do documento.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-sky-500 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
                1
              </div>
              <div>
                <h4 className="font-bold text-slate-800">Escolher um ou vários ficheiros DOCX</h4>
                <p className="text-slate-600 mt-0.5">
                  Arrasta os ficheiros .docx para a área de envio ou clica em "Escolher Ficheiros DOCX".
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-sky-500 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
                2
              </div>
              <div>
                <h4 className="font-bold text-slate-800">Configurar subpasta e destino</h4>
                <p className="text-slate-600 mt-0.5">
                  Define o nome da subpasta de resultados (por omissão: <code>Resultados_Amarelo</code>) ou escolhe uma pasta local do sistema.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-sky-500 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
                3
              </div>
              <div>
                <h4 className="font-bold text-slate-800">Processamento & Guardar</h4>
                <p className="text-slate-600 mt-0.5">
                  Clica em "Processar & Criar Cópias Amarelas". Podes pré-visualizar o resultado de cada documento e descarregar individualmente ou tudo num ficheiro ZIP organizado.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-sky-50 px-5 py-3 border-t border-sky-200 flex justify-end">
          <button
            type="button"
            onClick={() => {
              aeroAudio.playGlassClick(soundEnabled);
              onClose();
            }}
            className="aero-button px-4 py-2 rounded-xl text-white font-bold text-xs cursor-pointer shadow-sm"
          >
            Compreendi
          </button>
        </div>
      </div>
    </div>
  );
};
