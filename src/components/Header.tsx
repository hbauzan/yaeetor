import { Music2, Key, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  onOpenCookieSettings?: () => void;
  cookiesConfigured?: boolean;
}

export function Header({ onOpenCookieSettings, cookiesConfigured }: HeaderProps) {
  return (
    <header id="app-header" className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 px-1">
      <div className="flex items-center gap-3.5">
        <div className="w-11 h-11 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/25 border border-indigo-400/30">
          <Music2 className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 id="app-title" className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <span>Extractor de Audio pal etor</span>
            <span className="text-indigo-400 font-black text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 tracking-wider uppercase">YouTube</span>
          </h1>
          <p id="app-subtitle" className="text-xs text-zinc-400 mt-0.5">
            Convierte enlaces de YouTube en pistas <strong className="text-zinc-200 font-medium">MP3 320kbps</strong> o <strong className="text-zinc-200 font-medium">WAV Lossless</strong> al instante.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 self-end sm:self-center flex-wrap">
        <button
          type="button"
          onClick={onOpenCookieSettings}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-300 hover:text-white shadow-xs transition-colors cursor-pointer"
          title="Configuración de autenticación y cookies de YouTube"
        >
          {cookiesConfigured ? (
            <>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-zinc-200 font-medium">Cookies Activas</span>
            </>
          ) : (
            <>
              <Key className="w-3.5 h-3.5 text-zinc-400" />
              <span>Cookies (Opcional)</span>
            </>
          )}
        </button>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 shadow-xs">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-medium text-zinc-300">Motor Activo</span>
          <span className="text-zinc-600">•</span>
          <span className="text-zinc-400 text-[11px] font-mono">FFmpeg</span>
        </div>
      </div>
    </header>
  );
}

