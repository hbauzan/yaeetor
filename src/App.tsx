import { useState, useEffect, FormEvent } from 'react';
import { Header } from './components/Header';
import { UrlInputCard } from './components/UrlInputCard';
import { AudioResultCard } from './components/AudioResultCard';
import { ExtractionHistory } from './components/ExtractionHistory';
import { CookieSettingsModal } from './components/CookieSettingsModal';
import { AudioFormat, VideoInfo, ExtractionResult, HistoryItem } from './types';
import { Zap, Headphones, ShieldCheck } from 'lucide-react';

const STORAGE_KEY = 'yt_audio_extractor_history_v1';
const SAMPLE_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

export default function App() {
  const [url, setUrl] = useState('');
  const [format, setFormat] = useState<AudioFormat>('mp3');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isCookieModalOpen, setIsCookieModalOpen] = useState(false);
  const [cookieModalTab, setCookieModalTab] = useState<'guide' | 'upload' | 'faq'>('guide');
  const [cookiesConfigured, setCookiesConfigured] = useState(false);

  const handleOpenCookieModal = (tab: 'guide' | 'upload' | 'faq' = 'guide') => {
    setCookieModalTab(tab);
    setIsCookieModalOpen(true);
  };

  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [extractionResult, setExtractionResult] = useState<ExtractionResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const checkCookiesStatus = async () => {
    try {
      const res = await fetch('/api/cookies/status');
      if (res.ok) {
        const data = await res.json();
        setCookiesConfigured(Boolean(data.configured));
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    checkCookiesStatus();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
      console.error('Failed to persist history to localStorage', e);
    }
  }, [history]);

  const handleSelectSample = () => {
    setUrl(SAMPLE_URL);
  };

  const executeExtraction = async (targetUrl: string, targetFormat: AudioFormat) => {
    setError(null);
    setIsLoading(true);
    setStatusMessage('Analizando enlace de YouTube y obteniendo información...');

    try {
      // Step 1: Fetch Video Info to get metadata and preview
      const infoRes = await fetch('/api/info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl.trim() }),
      });

      let infoData: any;
      try {
        infoData = await infoRes.json();
      } catch {
        throw new Error('El servidor no devolvió una respuesta válida al consultar el video.');
      }

      if (!infoRes.ok || !infoData?.success) {
        throw new Error(infoData?.error || 'No se pudo obtener información del enlace.');
      }

      setVideoInfo(infoData.data);
      setStatusMessage(`Descargando y convirtiendo audio a formato ${targetFormat.toUpperCase()}...`);

      // Step 2: Extract audio in chosen format
      const extractRes = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: targetUrl.trim(),
          format: targetFormat,
          title: infoData.data.title,
        }),
      });

      let extractData: any;
      try {
        extractData = await extractRes.json();
      } catch {
        throw new Error('El servidor no devolvió una respuesta válida durante la extracción de audio.');
      }

      if (!extractRes.ok || !extractData?.success) {
        throw new Error(extractData?.error || 'No se pudo procesar la extracción de audio.');
      }

      const result: ExtractionResult = {
        fileId: extractData.fileId,
        format: extractData.format,
        size: extractData.size,
        sizeFormatted: extractData.sizeFormatted,
        downloadUrl: extractData.downloadUrl,
        streamUrl: extractData.streamUrl,
        title: infoData.data.title,
      };

      setExtractionResult(result);

      // Add to session history
      const historyItem: HistoryItem = {
        id: `${extractData.fileId}_${Date.now()}`,
        fileId: extractData.fileId,
        title: infoData.data.title,
        uploader: infoData.data.uploader,
        thumbnail: infoData.data.thumbnail,
        format: targetFormat,
        sizeFormatted: extractData.sizeFormatted,
        downloadUrl: extractData.downloadUrl,
        streamUrl: extractData.streamUrl,
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setHistory((prev) => [historyItem, ...prev.filter((i) => i.fileId !== extractData.fileId)]);
    } catch (err: any) {
      console.error('Extraction error:', err);
      setError(err.message || 'Ocurrió un error inesperado al extraer el audio.');
    } finally {
      setIsLoading(false);
      setStatusMessage('');
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    executeExtraction(url, format);
  };

  const handleExtractOtherFormat = (newFmt: AudioFormat) => {
    setFormat(newFmt);
    if (videoInfo?.url) {
      executeExtraction(videoInfo.url, newFmt);
    } else if (url) {
      executeExtraction(url, newFmt);
    }
  };

  const handleSelectHistoryItem = (item: HistoryItem) => {
    setVideoInfo({
      id: item.id,
      title: item.title,
      uploader: item.uploader,
      duration: 0,
      durationFormatted: '',
      thumbnail: item.thumbnail,
      url: '',
    });
    setExtractionResult({
      fileId: item.fileId,
      format: item.format,
      size: 0,
      sizeFormatted: item.sizeFormatted,
      downloadUrl: item.downloadUrl,
      streamUrl: item.streamUrl,
      title: item.title,
    });
    setFormat(item.format);
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 py-8 sm:py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-indigo-500 selection:text-white">
      <div className="max-w-5xl mx-auto space-y-6">
        <Header
          onOpenCookieSettings={() => handleOpenCookieModal('guide')}
          cookiesConfigured={cookiesConfigured}
        />

        <main id="app-main-content" className="space-y-6">
          <UrlInputCard
            url={url}
            setUrl={setUrl}
            format={format}
            setFormat={setFormat}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            onSelectSample={handleSelectSample}
          />

          <AudioResultCard
            videoInfo={videoInfo}
            extractionResult={extractionResult}
            isLoading={isLoading}
            statusMessage={statusMessage}
            error={error}
            onRetry={() => executeExtraction(url, format)}
            onExtractOtherFormat={handleExtractOtherFormat}
            onOpenCookieSettings={handleOpenCookieModal}
            onSelectSample={handleSelectSample}
          />

          {/* Bento Grid Row for History & System Pipeline */}
          {history.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8">
                <ExtractionHistory
                  history={history}
                  onSelect={handleSelectHistoryItem}
                  onClear={handleClearHistory}
                />
              </div>

              {/* Bento Companion: Native Audio Engine Card */}
              <div className="lg:col-span-4 bg-indigo-600 rounded-3xl p-6 sm:p-7 text-white flex flex-col justify-between shadow-2xl shadow-indigo-950/40 relative overflow-hidden">
                <div className="space-y-3 relative z-10">
                  <div className="flex justify-between items-start">
                    <span className="font-bold uppercase text-xs tracking-widest text-indigo-200">Pipeline Nativo</span>
                    <span className="p-2 bg-indigo-500/50 rounded-xl border border-indigo-400/30">
                      <Zap className="w-4 h-4 text-white" />
                    </span>
                  </div>
                  <h4 className="text-xl font-bold tracking-tight">Procesamiento Sin Pérdidas</h4>
                  <p className="text-xs text-indigo-100/90 leading-relaxed">
                    Extracción directa del flujo de audio original en servidor con códec FFmpeg nativo y tasa de muestreo de hasta 48kHz.
                  </p>
                </div>

                {/* Animated Audio Equalizer Bars */}
                <div className="py-6 flex items-end gap-1.5 h-16 relative z-10">
                  <span className="w-2 bg-white/40 rounded-full animate-pulse h-6" />
                  <span className="w-2 bg-white/70 rounded-full animate-pulse h-10 [animation-delay:150ms]" />
                  <span className="w-2 bg-white rounded-full animate-pulse h-14 [animation-delay:300ms]" />
                  <span className="w-2 bg-white/80 rounded-full animate-pulse h-8 [animation-delay:75ms]" />
                  <span className="w-2 bg-white/60 rounded-full animate-pulse h-12 [animation-delay:225ms]" />
                  <span className="w-2 bg-white rounded-full animate-pulse h-16 [animation-delay:375ms]" />
                  <span className="w-2 bg-white/50 rounded-full animate-pulse h-7 [animation-delay:120ms]" />
                </div>

                <div className="pt-4 border-t border-indigo-500/50 flex items-center justify-between text-xs font-mono relative z-10">
                  <span className="text-indigo-200">yt-dlp + FFmpeg</span>
                  <span className="bg-indigo-700/80 px-2 py-0.5 rounded-md font-bold text-white">48kHz PCM</span>
                </div>
              </div>
            </div>
          ) : (
            <ExtractionHistory
              history={history}
              onSelect={handleSelectHistoryItem}
              onClear={handleClearHistory}
            />
          )}

          {/* Bento Feature Highlights */}
          <section id="features-highlights" className="pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-start gap-3.5 p-5 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-xl transition-all hover:border-zinc-700">
                <div className="w-9 h-9 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Extracción Inmediata</h4>
                  <p className="text-xs text-zinc-400 mt-1">Sin colas lentas, popups ni anuncios de terceros.</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-5 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-xl transition-all hover:border-zinc-700">
                <div className="w-9 h-9 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                  <Headphones className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Fidelidad Dual</h4>
                  <p className="text-xs text-zinc-400 mt-1">WAV sin compresión a 48kHz o MP3 ligero a 320 kbps.</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-5 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-xl transition-all hover:border-zinc-700">
                <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Reproductor Integrado</h4>
                  <p className="text-xs text-zinc-400 mt-1">Escucha antes de descargar con reproductor nativo HTML5.</p>
                </div>
              </div>
            </div>
          </section>
        </main>

        <footer id="app-footer" className="mt-12 pt-6 border-t border-zinc-900 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-zinc-500">
          <p>Extractor de Audio • Diseñado en cuadrícula Bento con alta fidelidad</p>
          <div className="flex items-center gap-2 text-zinc-500 font-mono text-[11px]">
            <span>FFmpeg Core</span>
            <span>•</span>
            <span>yt-dlp Engine</span>
          </div>
        </footer>
      </div>

      <CookieSettingsModal
        isOpen={isCookieModalOpen}
        onClose={() => setIsCookieModalOpen(false)}
        onCookiesUpdated={checkCookiesStatus}
        initialTab={cookieModalTab}
      />
    </div>
  );
}
