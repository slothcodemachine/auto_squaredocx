export interface ProcessedFileItem {
  id: string;
  file: File;
  name: string;
  size: number;
  status: 'pending' | 'processing' | 'completed' | 'error';
  errorMessage?: string;
  resultBlob?: Blob;
  resultFileName?: string;
  processedSize?: number;
  previewHtml?: string;
  previewText?: string;
}

export interface AppConfig {
  subfolderName: string;
  transparencyPercent: number; // e.g. 80 means 80% transparent / 20% fill
  overlayColor: string; // e.g. "#FFFF00"
  soundEnabled: boolean;
  autoOpenPreview: boolean;
  saveMode: 'zip' | 'directory';
  directoryHandle?: any;
}
