import { useState, FormEvent, MouseEvent } from 'react';
import { Youtube, Music, Disc3, ArrowRight, Clipboard, X, Sparkles, Loader2, Sliders, Check } from 'lucide-react';
import { AudioFormat } from '../types';

interface UrlInputCardProps {
  url: string;
  setUrl: (url: string) => void;
  format: AudioFormat;
  setFormat: (fmt: AudioFormat) => void;
  onSubmit: (e: FormEvent) => void;
  isLoading: boolean;
  onSelectSample: () => void;
}

export function UrlInputCard({
  url,
  setUrl,
  format,
  setFormat,
  onSubmit,
  isLoading,
  onSelectSample,
}: UrlInputCardProps) {
  const [pasteError, setPasteError] = useState<string | null>(null);

  const handlePaste = async (e: MouseEvent) => {
    e.preventDefault();
    try {
      setPasteError(null);
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text.trim());
      }
    } catch {
      setPasteError('No se pudo acceder al portapapeles. Pega el enlace manualmente con Ctrl+V.');
      setTimeout(() => setPasteError(null), 4000);
    }
  };

  const handleClear = (e: MouseEvent) => {
    e.preventDefault();
    setUrl('');
  };

  return (
    <form onSubmit={onSubmit} id="url-input-container" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Bento Cell 1: Main Extraction Box (8 cols on desktop) */}
      <div className="lg:col-span-8 bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between gap-6 shadow-2xl relative overflow-hidden">
        {/* Subtle accent glow */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">Entrada Directa</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Extraer audio de alta fidelidad
          </h2>
          <p className="text-sm text-zinc-400 max-w-lg">
            Pega tu enlace de YouTube para extraer la pista en calidad original sin pérdida innecesaria.
          </p>
        </div>

        <div className="space-y-3 relative z-10">
          <div className="relative flex items-center">
            <div className="absolute left-4 text-zinc-500 pointer-events-none flex items-center">
              <Youtube className="w-5 h-5 text-red-500" />
            </div>

            <input
              id="youtube-url-input"
              type="text"
              inputMode="url"
              placeholder="https://www.youtube.com/watch?v=... o https://youtu.be/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isLoading}
              className="w-full bg-zinc-800/90 border border-zinc-700/80 rounded-2xl py-4 sm:py-5 pl-12 pr-32 sm:pr-40 text-sm sm:text-base text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all disabled:opacity-50"
              required
            />

            <div className="absolute right-2 flex items-center gap-1.5">
              {url ? (
                <button
                  type="button"
                  id="clear-link-button"
                  onClick={handleClear}
                  title="Borrar enlace"
                  className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-700/60 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  id="paste-link-button"
                  onClick={handlePaste}
                  title="Pegar enlace"
                  className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 text-zinc-300 bg-zinc-700/70 hover:bg-zinc-700 rounded-lg transition-colors cursor-pointer"
                >
                  <Clipboard className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Pegar</span>
                </button>
              )}

              <button
                type="submit"
                id="submit-extract-button"
                disabled={isLoading || !url.trim()}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-95"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Extrayendo...</span>
                  </>
                ) : (
                  <>
                    <span>Convertir</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>

          {pasteError && (
            <p className="text-xs text-amber-400">{pasteError}</p>
          )}
        </div>

        {/* Status Indicators & Sample Trigger */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-500 pt-2 border-t border-zinc-800/80 relative z-10">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
              <span>Servidor: Óptimo</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
              <span>Formato activo: {format.toUpperCase()}</span>
            </span>
          </div>

          <button
            type="button"
            id="sample-link-button"
            onClick={onSelectSample}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors py-1 px-2 rounded-lg hover:bg-zinc-800 cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Probar con video de ejemplo</span>
          </button>
        </div>
      </div>

      {/* Bento Cell 2: Extraction Profile (4 cols on desktop) */}
      <div className="lg:col-span-4 bg-zinc-900 border border-zinc-800 rounded-3xl p-6 flex flex-col justify-between gap-4 shadow-2xl relative">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-bold uppercase text-xs tracking-widest text-indigo-400 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5" />
            <span>Perfil de Extracción</span>
          </h3>
          <span className="text-[10px] font-mono text-zinc-500 uppercase">Configuración</span>
        </div>

        <div className="space-y-3 flex-1">
          {/* WAV Option */}
          <button
            type="button"
            id="format-wav-button"
            onClick={() => setFormat('wav')}
            className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
              format === 'wav'
                ? 'bg-zinc-800/90 border-indigo-500/60 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500/40'
                : 'bg-zinc-800/30 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/50 opacity-70 hover:opacity-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${format === 'wav' ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-400'}`}>
                <Disc3 className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-sm text-white flex items-center gap-1.5">
                  <span>WAV Master</span>
                  {format === 'wav' && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                </p>
                <p className="text-xs text-zinc-400">Audio PCM sin pérdidas</p>
              </div>
            </div>
            <div className="bg-indigo-600 text-[10px] px-2 py-1 rounded-full font-black uppercase text-white tracking-wider">
              Lossless
            </div>
          </button>

          {/* MP3 Option */}
          <button
            type="button"
            id="format-mp3-button"
            onClick={() => setFormat('mp3')}
            className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
              format === 'mp3'
                ? 'bg-zinc-800/90 border-indigo-500/60 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500/40'
                : 'bg-zinc-800/30 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/50 opacity-70 hover:opacity-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${format === 'mp3' ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-400'}`}>
                <Music className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-sm text-white flex items-center gap-1.5">
                  <span>MP3 Archive</span>
                  {format === 'mp3' && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                </p>
                <p className="text-xs text-zinc-400">Estándar universal ligero</p>
              </div>
            </div>
            <div className="bg-zinc-700/80 text-[10px] px-2 py-1 rounded-full font-bold uppercase text-zinc-300 tracking-wider">
              320 kbps
            </div>
          </button>
        </div>

        {/* Audio Quality Metre */}
        <div className="pt-3 border-t border-zinc-800 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-zinc-400">Fidelidad de Audio</span>
            <span className="font-mono text-indigo-300 font-semibold">
              {format === 'wav' ? '48kHz / 24-bit Lossless' : '320 kbps High Bitrate'}
            </span>
          </div>
          <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-300"
              style={{ width: format === 'wav' ? '100%' : '85%' }}
            />
          </div>
        </div>
      </div>
    </form>
  );
}

