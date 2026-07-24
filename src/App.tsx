import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { saveAs } from 'file-saver';
import { HeaderWindow } from './components/HeaderWindow';
import { DropZone } from './components/DropZone';
import { ConfigPanel } from './components/ConfigPanel';
import { FileList } from './components/FileList';
import { DocxPreviewModal } from './components/DocxPreviewModal';
import { SummaryFooter } from './components/SummaryFooter';
import { HelpModal } from './components/HelpModal';
import { ProcessedFileItem, AppConfig } from './types';
import { processDocxFile, createResultsZip } from './utils/docxProcessor';
import { aeroAudio } from './utils/audio';

export default function App() {
  const [files, setFiles] = useState<ProcessedFileItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPreview, setSelectedPreview] = useState<ProcessedFileItem | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const [config, setConfig] = useState<AppConfig>({
    subfolderName: 'Resultados_Amarelo',
    transparencyPercent: 80, // Default 80% transparent as requested by user
    overlayColor: '#FFFF00', // Yellow
    soundEnabled: true,
    autoOpenPreview: false,
    saveMode: 'zip',
  });

  const handleUpdateConfig = (newCfg: Partial<AppConfig>) => {
    setConfig((prev) => ({ ...prev, ...newCfg }));
  };

  // Handle adding new DOCX files
  const handleFilesAdded = (addedFiles: FileList | File[]) => {
    const fileArray = Array.from(addedFiles);
    const validDocxFiles = fileArray.filter((file) =>
      file.name.toLowerCase().endsWith('.docx')
    );

    if (validDocxFiles.length === 0) {
      alert('Por favor seleciona ficheiros válidos com extensão .docx');
      return;
    }

    const newItems: ProcessedFileItem[] = validDocxFiles.map((file) => ({
      id: Math.random().toString(36).substring(2, 9) + '-' + Date.now(),
      file,
      name: file.name,
      size: file.size,
      status: 'pending',
    }));

    setFiles((prev) => [...prev, ...newItems]);
  };

  const handleRemoveFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleClearAll = () => {
    setFiles([]);
  };

  // Pick local directory using File System Access API
  const handlePickDirectory = async () => {
    if (typeof window !== 'undefined' && 'showDirectoryPicker' in window) {
      try {
        const handle = await (window as unknown as { showDirectoryPicker: () => Promise<unknown> }).showDirectoryPicker();
        handleUpdateConfig({
          directoryHandle: handle,
          saveMode: 'directory',
        });
        aeroAudio.playGlassClick(config.soundEnabled);
      } catch (err: unknown) {
        if ((err as Error).name !== 'AbortError') {
          console.warn('Erro ao selecionar diretório:', err);
        }
      }
    } else {
      alert(
        'O seu navegador não suporta a seleção direta de pastas no disco. Os ficheiros serão organizados na subpasta dentro de um ficheiro ZIP ao descarregar.'
      );
    }
  };

  // Batch process all files
  const handleProcessAll = async () => {
    if (files.length === 0 || isProcessing) return;

    setIsProcessing(true);

    for (let i = 0; i < files.length; i++) {
      const item = files[i];

      // Set item to processing state
      setFiles((prev) =>
        prev.map((f) => (f.id === item.id ? { ...f, status: 'processing' } : f))
      );

      try {
        const result = await processDocxFile(
          item.file,
          config.overlayColor,
          config.transparencyPercent
        );

        const resultFileName = item.name.replace(/\.docx$/i, '') + '_amarelo.docx';

        setFiles((prev) =>
          prev.map((f) =>
            f.id === item.id
              ? {
                  ...f,
                  status: 'completed',
                  resultBlob: result.blob,
                  resultFileName,
                  processedSize: result.blob.size,
                  previewHtml: result.previewHtml,
                  previewText: result.previewText,
                }
              : f
          )
        );
      } catch (error: unknown) {
        console.error('Error processing docx:', error);
        setFiles((prev) =>
          prev.map((f) =>
            f.id === item.id
              ? {
                  ...f,
                  status: 'error',
                  errorMessage: (error as Error)?.message || 'Erro ao modificar o ficheiro',
                }
              : f
          )
        );
      }
    }

    setIsProcessing(false);
    aeroAudio.playSuccessChime(config.soundEnabled);

    // Trigger Frutiger Aero completion confetti!
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#00a2e8', '#7cd7ff', '#ffeb3b', '#ffffff'],
    });
  };

  // Download individual modified DOCX
  const handleDownloadSingle = (item: ProcessedFileItem) => {
    if (item.resultBlob) {
      const fileName = item.resultFileName || item.name.replace(/\.docx$/i, '') + '_amarelo.docx';
      saveAs(item.resultBlob, fileName);
    }
  };

  // Download all files in a ZIP archive containing the subfolder
  const handleDownloadAllZip = async () => {
    const completedFiles = files.filter(
      (f) => f.status === 'completed' && f.resultBlob
    );

    if (completedFiles.length === 0) return;

    const filesToZip = completedFiles.map((f) => ({
      name: f.resultFileName || f.name.replace(/\.docx$/i, '') + '_amarelo.docx',
      blob: f.resultBlob!,
    }));

    const zipBlob = await createResultsZip(filesToZip, config.subfolderName);
    const zipName = `${config.subfolderName}.zip`;
    saveAs(zipBlob, zipName);
  };

  // Save directly to selected directory handle if available
  const handleSaveToDirectory = async () => {
    const completedFiles = files.filter(
      (f) => f.status === 'completed' && f.resultBlob
    );

    if (completedFiles.length === 0) return;

    try {
      let dirHandle = config.directoryHandle;
      if (!dirHandle && 'showDirectoryPicker' in window) {
        dirHandle = await (window as unknown as { showDirectoryPicker: () => Promise<unknown> }).showDirectoryPicker();
      }

      if (!dirHandle) {
        handleDownloadAllZip();
        return;
      }

      // Create or get subfolder inside target directory
      const subFolderHandle = await dirHandle.getDirectoryHandle(config.subfolderName, {
        create: true,
      });

      for (const item of completedFiles) {
        const fileName = item.resultFileName || item.name.replace(/\.docx$/i, '') + '_amarelo.docx';
        const fileHandle = await subFolderHandle.getFileHandle(fileName, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(item.resultBlob!);
        await writable.close();
      }

      alert(`Ficheiros guardados com sucesso na subpasta "${config.subfolderName}"!`);
      aeroAudio.playSuccessChime(config.soundEnabled);
    } catch (err: unknown) {
      console.error('Save to directory error:', err);
      if ((err as Error).name !== 'AbortError') {
        alert('Ocorreu um erro ao guardar na pasta. A descarregar em ZIP...');
        handleDownloadAllZip();
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#012b69] via-[#005ba1] via-[#00a2e8] to-[#88d8f8] py-6 px-3 sm:px-6 flex flex-col justify-between relative overflow-x-hidden font-sans selection:bg-sky-200 selection:text-sky-900">
      {/* Frutiger Aero Floating Background Spheres/Bubbles */}
      <div className="fixed top-10 left-10 w-64 h-64 rounded-full bg-cyan-300/15 blur-2xl pointer-events-none animate-float-slow" />
      <div className="fixed bottom-12 right-12 w-96 h-96 rounded-full bg-sky-200/20 blur-3xl pointer-events-none animate-float-fast" />
      <div className="fixed top-1/2 right-1/4 w-48 h-48 rounded-full bg-blue-300/15 blur-xl pointer-events-none animate-float-slow" />

      {/* Main Container Window */}
      <div className="w-full max-w-5xl mx-auto aero-glass rounded-2xl shadow-2xl overflow-hidden border border-white/90 relative z-10 my-auto">
        {/* Header Window Bar */}
        <HeaderWindow
          soundEnabled={config.soundEnabled}
          onToggleSound={() => handleUpdateConfig({ soundEnabled: !config.soundEnabled })}
          onOpenHelp={() => setIsHelpOpen(true)}
        />

        {/* App Content Body */}
        <div className="p-4 sm:p-6 space-y-6">
          {/* Dropzone for DOCX files */}
          <DropZone
            onFilesAdded={handleFilesAdded}
            soundEnabled={config.soundEnabled}
            itemCount={files.length}
          />

          {/* Configuration Panel */}
          <ConfigPanel
            config={config}
            onChangeConfig={handleUpdateConfig}
            onPickDirectory={handlePickDirectory}
            onProcessAll={handleProcessAll}
            isProcessing={isProcessing}
            hasFiles={files.length > 0}
          />

          {/* List of Files & Status */}
          <FileList
            files={files}
            onRemoveFile={handleRemoveFile}
            onClearAll={handleClearAll}
            onPreviewFile={(item) => setSelectedPreview(item)}
            onDownloadSingle={handleDownloadSingle}
            soundEnabled={config.soundEnabled}
            transparencyPercent={config.transparencyPercent}
            overlayColor={config.overlayColor}
          />

          {/* Summary & Batch Download Actions */}
          <SummaryFooter
            files={files}
            config={config}
            onDownloadAllZip={handleDownloadAllZip}
            onSaveToDirectory={handleSaveToDirectory}
            isProcessing={isProcessing}
          />
        </div>
      </div>

      {/* Application Footer Label */}
      <div className="text-center text-xs text-white/80 font-medium pt-6 pb-2 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] z-10">
        Docx Yellow Tint Overlay • Visual Frutiger Aero (Tons de Azul e Vidro Glossy)
      </div>

      {/* Preview Modal */}
      <DocxPreviewModal
        fileItem={selectedPreview}
        transparencyPercent={config.transparencyPercent}
        overlayColor={config.overlayColor}
        onClose={() => setSelectedPreview(null)}
        onDownload={handleDownloadSingle}
        soundEnabled={config.soundEnabled}
      />

      {/* Help Modal */}
      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        soundEnabled={config.soundEnabled}
      />
    </div>
  );
}
