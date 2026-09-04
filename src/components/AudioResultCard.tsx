import { useState, useRef, useEffect, ChangeEvent } from 'react';
import {
  Download,
  Play,
  Pause,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  RotateCw,
  FileAudio,
  Volume2,
  VolumeX,
  Search,
  ExternalLink,
  HelpCircle,
} from 'lucide-react';
import { VideoInfo, ExtractionResult, AudioFormat } from '../types';

interface AudioResultCardProps {
  videoInfo: VideoInfo | null;
  extractionResult: ExtractionResult | null;
  isLoading: boolean;
  statusMessage: string;
  error: string | null;
  onRetry: () => void;
  onExtractOtherFormat: (fmt: AudioFormat) => void;
  onOpenCookieSettings?: (tab?: 'guide' | 'upload' | 'faq') => void;
  onSelectSample?: () => void;
}

export function AudioResultCard({
  videoInfo,
  extractionResult,
  isLoading,
  statusMessage,
  error,
  onRetry,
  onExtractOtherFormat,
  onOpenCookieSettings,
  onSelectSample,
}: AudioResultCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Reset player state when extraction result changes
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, [extractionResult]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch((e) => console.error(e));
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      if (!isNaN(audioRef.current.duration)) {
        setDuration(audioRef.current.duration);
      }
    }
  };

  const handleSeek = (e: ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (!isLoading && !error && !extractionResult && !videoInfo) {
    return null;
  }

  return (
    <div id="audio-result-card" className="mt-6 bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden transition-all">
      {/* Loading state */}
      {isLoading && (
        <div id="loading-state-container" className="p-8 sm:p-12 text-center space-y-5">
          <div className="inline-flex p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 animate-pulse">
            <FileAudio className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-bold text-white tracking-tight">Extrayendo flujo de audio</h3>
            <p className="text-xs sm:text-sm text-zinc-400 font-mono max-w-md mx-auto">{statusMessage || 'Procesando con yt-dlp y FFmpeg...'}</p>
          </div>
          <div className="w-full max-w-md mx-auto bg-zinc-800 rounded-full h-2 overflow-hidden border border-zinc-700/50">
            <div className="bg-indigo-500 h-full rounded-full animate-indeterminate" />
          </div>
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div id="error-state-container" className="p-6 bg-red-950/30 border border-red-900/60 rounded-3xl m-4 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-red-300">Ocurrió un inconveniente</h4>
                <p className="text-xs text-red-400/90 mt-0.5 leading-relaxed">{error}</p>
              </div>
            </div>
            <button
              type="button"
              id="retry-extraction-button"
              onClick={onRetry}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl transition-colors shrink-0 shadow-lg shadow-red-600/30 cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Reintentar</span>
            </button>
          </div>

          {(error.includes('antibot') || error.includes('bot') || error.includes('cookies') || error.includes('Sign in')) && (
            <div className="pt-3 border-t border-red-900/40 space-y-3">
              <p className="text-xs font-semibold text-zinc-200">
                ¿Qué puedes hacer para descargar el audio? Elige una de las dos opciones:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Option 1: Fast alternative without cookies */}
                <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex flex-col justify-between space-y-2.5">
                  <div>
                    <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold text-[10px] uppercase mb-1">
                      Opción A • Rápida y sin cookies
                    </span>
                    <h5 className="text-xs font-bold text-white">Buscar videoclip oficial o letra</h5>
                    <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                      El bloqueo suele ocurrir en audios automáticos ("- Topic"). Los videoclips oficiales o con letra descargan al instante sin necesidad de cookies.
                    </p>
                  </div>
                  {videoInfo?.title ? (
                    <a
                      href={`https://www.youtube.com/results?search_query=${encodeURIComponent(videoInfo.title.replace(/- Topic/gi, '') + ' official video')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md"
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>Buscar versión alternativa</span>
                      <ExternalLink className="w-3 h-3 opacity-60" />
                    </a>
                  ) : (
                    onSelectSample && (
                      <button
                        type="button"
                        onClick={onSelectSample}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 transition-colors cursor-pointer"
                      >
                        <span>Probar video público de muestra</span>
                      </button>
                    )
                  )}
                </div>

                {/* Option 2: Full unlock with cookies */}
                <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex flex-col justify-between space-y-2.5">
                  <div>
                    <span className="inline-block px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-bold text-[10px] uppercase mb-1">
                      Opción B • Desbloqueo total
                    </span>
                    <h5 className="text-xs font-bold text-white">Subir Cookies de YouTube</h5>
                    <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                      Permite descargar este video exacto y cualquier otro video protegido. Te explicamos paso a paso cómo hacerlo en 1 minuto.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {onOpenCookieSettings && (
                      <button
                        type="button"
                        onClick={() => onOpenCookieSettings('guide')}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                      >
                        <span>Ver guía de Cookies (1 min)</span>
                      </button>
                    )}
                    {onOpenCookieSettings && (
                      <button
                        type="button"
                        onClick={() => onOpenCookieSettings('faq')}
                        className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                        title="¿Por qué no un botón 'No soy un robot'?"
                      >
                        <HelpCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Video metadata & Ready state */}
      {!isLoading && !error && (videoInfo || extractionResult) && (
        <div className="p-6 sm:p-8 space-y-6">
          {/* Top Video preview banner */}
          <div className="flex flex-col sm:flex-row gap-5 items-start pb-6 border-b border-zinc-800">
            {videoInfo?.thumbnail && (
              <div className="relative rounded-2xl overflow-hidden bg-zinc-950 shrink-0 w-full sm:w-48 aspect-video shadow-md border border-zinc-800">
                <img
                  src={videoInfo.thumbnail}
                  alt={videoInfo.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                {videoInfo.durationFormatted && (
                  <div className="absolute bottom-2 right-2 bg-zinc-950/85 backdrop-blur-xs text-white text-[10px] font-mono font-medium px-2 py-0.5 rounded-md flex items-center gap-1 border border-zinc-800">
                    <Clock className="w-3 h-3 text-indigo-400" />
                    <span>{videoInfo.durationFormatted}</span>
                  </div>
                )}
              </div>
            )}

            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Audio extraído</span>
                </span>
                {extractionResult && (
                  <span className="text-[10px] font-bold font-mono uppercase px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700/60">
                    {extractionResult.format.toUpperCase()} • {extractionResult.sizeFormatted}
                  </span>
                )}
              </div>

              <h2 id="video-result-title" className="text-lg sm:text-xl font-bold text-white leading-snug line-clamp-2">
                {videoInfo?.title || extractionResult?.title}
              </h2>

              {videoInfo?.uploader && (
                <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                  <User className="w-3.5 h-3.5 text-zinc-500" />
                  <span>{videoInfo.uploader}</span>
                </div>
              )}
            </div>
          </div>

          {/* Extracted Audio Player & Download Controls */}
          {extractionResult && (
            <div className="space-y-6">
              {/* HTML5 Audio Player in Bento Style */}
              <div id="audio-player-container" className="p-5 bg-zinc-800/80 rounded-2xl border border-zinc-700/60 space-y-3">
                <audio
                  ref={audioRef}
                  src={extractionResult.streamUrl}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleTimeUpdate}
                  onEnded={() => setIsPlaying(false)}
                />

                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    id="audio-play-pause-btn"
                    onClick={togglePlay}
                    className="w-11 h-11 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-indigo-600/30 transition-all active:scale-95 cursor-pointer"
                    title={isPlaying ? 'Pausar' : 'Reproducir'}
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                  </button>

                  <div className="flex-1">
                    <input
                      id="audio-seek-slider"
                      type="range"
                      min={0}
                      max={duration || 100}
                      value={currentTime}
                      onChange={handleSeek}
                      className="w-full accent-indigo-500 cursor-pointer h-2 bg-zinc-700 rounded-lg appearance-none"
                    />
                    <div className="flex justify-between text-[11px] text-zinc-400 mt-1.5 font-mono">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    id="audio-mute-btn"
                    onClick={toggleMute}
                    className="p-2.5 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-700/60 transition-colors cursor-pointer"
                    title={isMuted ? 'Activar sonido' : 'Silenciar'}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <a
                  id="direct-download-audio-link"
                  href={`${extractionResult.downloadUrl}?name=${encodeURIComponent(
                    videoInfo?.title || extractionResult.title
                  )}`}
                  download
                  className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-2xl shadow-xl shadow-emerald-950/40 transition-all cursor-pointer active:scale-98"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar {extractionResult.format.toUpperCase()} ({extractionResult.sizeFormatted})</span>
                </a>

                {/* Convert to alternate format */}
                <div className="flex items-center justify-end gap-2 text-xs">
                  <span className="text-zinc-500 hidden sm:inline">¿Necesitas otro formato?</span>
                  {extractionResult.format === 'mp3' ? (
                    <button
                      type="button"
                      id="convert-also-wav-button"
                      onClick={() => onExtractOtherFormat('wav')}
                      className="px-4 py-3 rounded-xl border border-zinc-700 hover:border-zinc-600 bg-zinc-800 text-zinc-200 font-bold transition-all hover:bg-zinc-700 cursor-pointer"
                    >
                      Extraer también en WAV
                    </button>
                  ) : (
                    <button
                      type="button"
                      id="convert-also-mp3-button"
                      onClick={() => onExtractOtherFormat('mp3')}
                      className="px-4 py-3 rounded-xl border border-zinc-700 hover:border-zinc-600 bg-zinc-800 text-zinc-200 font-bold transition-all hover:bg-zinc-700 cursor-pointer"
                    >
                      Extraer también en MP3
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
