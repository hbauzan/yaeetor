import { HistoryItem } from '../types';
import { Clock, Download, Play, Trash2, FileAudio } from 'lucide-react';

interface ExtractionHistoryProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
}

export function ExtractionHistory({ history, onSelect, onClear }: ExtractionHistoryProps) {
  if (history.length === 0) return null;

  return (
    <div id="session-history-container" className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-2xl flex flex-col justify-between">
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-zinc-800 border border-zinc-700/60 flex items-center justify-center text-indigo-400">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Historial de Conversión</h3>
            <p className="text-[11px] text-zinc-500">Pistas procesadas durante esta sesión</p>
          </div>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 font-mono font-bold ml-1">
            {history.length}
          </span>
        </div>

        <button
          type="button"
          id="clear-history-button"
          onClick={onClear}
          title="Borrar historial"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 px-3 py-1.5 rounded-xl border border-transparent hover:border-zinc-700 transition-colors cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5 text-zinc-500" />
          <span>Limpiar</span>
        </button>
      </div>

      <div className="space-y-3">
        {history.map((item) => (
          <div
            key={item.id}
            id={`history-item-${item.id}`}
            className="p-3.5 bg-zinc-800/40 hover:bg-zinc-800/70 border border-zinc-800/80 hover:border-zinc-700/80 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 transition-all group"
          >
            <div className="flex items-center gap-3.5 min-w-0 flex-1">
              {item.thumbnail ? (
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-14 h-10 object-cover rounded-xl bg-zinc-950 border border-zinc-800 shrink-0"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-14 h-10 rounded-xl bg-zinc-800 text-indigo-400 border border-zinc-700/50 flex items-center justify-center shrink-0">
                  <FileAudio className="w-5 h-5" />
                </div>
              )}

              <div className="min-w-0 flex-1 space-y-0.5">
                <p className="text-sm font-semibold text-zinc-200 group-hover:text-white truncate" title={item.title}>
                  {item.title}
                </p>
                <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                  <span className="font-mono font-bold uppercase text-[10px] px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                    {item.format}
                  </span>
                  <span className="font-mono text-zinc-400">{item.sizeFormatted}</span>
                  {item.uploader && <span className="text-zinc-500 truncate max-w-[140px]">• {item.uploader}</span>}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <button
                type="button"
                id={`play-history-btn-${item.id}`}
                onClick={() => onSelect(item)}
                className="inline-flex items-center gap-1.5 text-xs px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold border border-zinc-700/60 transition-colors cursor-pointer active:scale-95"
              >
                <Play className="w-3.5 h-3.5 text-indigo-400" />
                <span>Cargar</span>
              </button>

              <a
                id={`download-history-link-${item.id}`}
                href={`${item.downloadUrl}?name=${encodeURIComponent(item.title)}`}
                download
                className="inline-flex items-center gap-1.5 text-xs px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-md shadow-indigo-600/25 transition-all cursor-pointer active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

