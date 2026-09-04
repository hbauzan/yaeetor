export type AudioFormat = 'mp3' | 'wav';

export interface VideoInfo {
  id: string;
  title: string;
  uploader: string;
  duration: number;
  durationFormatted: string;
  thumbnail: string;
  url: string;
}

export interface ExtractionResult {
  fileId: string;
  format: AudioFormat;
  size: number;
  sizeFormatted: string;
  downloadUrl: string;
  streamUrl: string;
  title: string;
}

export interface HistoryItem {
  id: string;
  fileId: string;
  title: string;
  uploader: string;
  thumbnail: string;
  format: AudioFormat;
  sizeFormatted: string;
  downloadUrl: string;
  streamUrl: string;
  createdAt: string;
}
