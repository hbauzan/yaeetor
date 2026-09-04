import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import {
  Shield,
  Key,
  Check,
  Trash2,
  Upload,
  ExternalLink,
  X,
  AlertTriangle,
  RefreshCw,
  HelpCircle,
  Lightbulb,
  CheckCircle2,
  FileCode,
  Globe,
  Lock,
  Search
} from 'lucide-react';

interface CookieSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCookiesUpdated?: () => void;
  initialTab?: 'guide' | 'upload' | 'faq';
}

export function CookieSettingsModal({
  isOpen,
  onClose,
  onCookiesUpdated,
  initialTab = 'guide',
}: CookieSettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'guide' | 'upload' | 'faq'>(initialTab);
  const [isConfigured, setIsConfigured] = useState(false);
  const [cookieSize, setCookieSize] = useState(0);
  const [cookieText, setCookieText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/cookies/status');
      if (res.ok) {
        const data = await res.json();
        setIsConfigured(Boolean(data.configured));
        setCookieSize(data.size || 0);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
      setFeedback(null);
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setCookieText(content);
        setFeedback({
          type: 'success',
          message: `Archivo "${file.name}" cargado (${(file.size / 1024).toFixed(1)} KB). Haz clic en "Guardar Cookies".`,
        });
      }
    };
    reader.onerror = () => {
      setFeedback({ type: 'error', message: 'No se pudo leer el archivo seleccionado.' });
    };
    reader.readAsText(file);
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!cookieText.trim() || cookieText.trim().length < 10) {
      setFeedback({ type: 'error', message: 'Por favor pega el texto de las cookies o sube tu archivo cookies.txt.' });
      return;
    }

    setIsSaving(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/cookies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cookies: cookieText.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Error al guardar las cookies.');
      }

      setFeedback({ type: 'success', message: '¡Cookies de YouTube guardadas y activadas con éxito! Ahora puedes extraer el audio.' });
      setCookieText('');
      await fetchStatus();
      if (onCookiesUpdated) onCookiesUpdated();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Error al guardar las cookies.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que deseas eliminar las cookies configuradas?')) return;
    setIsDeleting(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/cookies', { method: 'DELETE' });
      if (res.ok) {
        setFeedback({ type: 'success', message: 'Cookies eliminadas del servidor.' });
        setIsConfigured(false);
        setCookieSize(0);
        if (onCookiesUpdated) onCookiesUpdated();
      }
    } catch {
      setFeedback({ type: 'error', message: 'Error al eliminar las cookies.' });
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs">
      <div
        id="cookie-settings-modal"
        className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-hidden shadow-2xl flex flex-col"
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/95 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white leading-tight">
                Verificación y Cookies de YouTube
              </h3>
              <p className="text-xs text-zinc-400">
                Solución para el mensaje "Sign in to confirm you’re not a bot"
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-zinc-800 bg-zinc-950/60 px-5 sm:px-6 pt-2 gap-2 shrink-0 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('guide')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'guide'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            1. ¿Qué debo hacer? (Guía)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'upload'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span>2. Subir Cookies</span>
            {isConfigured && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('faq')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'faq'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            3. ¿Por qué no un botón "No soy un robot"?
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6 flex-1 text-zinc-300">
          {/* Status Header pill */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-800/60 border border-zinc-700/60">
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full shrink-0 ${
                  isConfigured ? 'bg-emerald-400 shadow-xs shadow-emerald-400/50' : 'bg-amber-400'
                }`}
              />
              <div>
                <p className="text-xs sm:text-sm font-semibold text-white">
                  {isConfigured ? 'Cookies activas en el servidor' : 'Sin cookies personalizadas (Modo estándar)'}
                </p>
                <p className="text-[11px] text-zinc-400">
                  {isConfigured
                    ? `Archivo cookies.txt cargado (${(cookieSize / 1024).toFixed(1)} KB)`
                    : 'La mayoría de videos públicos descargan sin cookies. Las pistas oficiales o protegidas requieren cookies.'}
                </p>
              </div>
            </div>

            {isConfigured && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl transition-colors cursor-pointer shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Borrando...' : 'Quitar'}</span>
              </button>
            )}
          </div>

          {feedback && (
            <div
              className={`p-3.5 rounded-2xl text-xs font-medium flex items-start gap-2.5 ${
                feedback.type === 'success'
                  ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
                  : 'bg-red-500/10 border border-red-500/20 text-red-300'
              }`}
            >
              {feedback.type === 'success' ? (
                <Check className="w-4 h-4 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* TAB 1: Step-by-step guide */}
          {activeTab === 'guide' && (
            <div className="space-y-6">
              <div className="bg-indigo-950/20 border border-indigo-500/20 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs sm:text-sm">
                  <Lightbulb className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>¿Qué es una cookie y para qué sirve aquí?</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Una <strong>cookie</strong> es un pequeño ticket que tu navegador guarda cuando inicias sesión en YouTube. Al copiarlo aquí, le prestas ese "pase" al extractor para que YouTube vea que quien pide el audio es un usuario registrado normal y no un robot automático.
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Pasos para obtener tus cookies (Solo toma 1 minuto):
                </h4>

                <div className="space-y-3">
                  {/* Step 1 */}
                  <div className="p-4 rounded-2xl bg-zinc-800/40 border border-zinc-700/60 flex items-start gap-3.5">
                    <div className="w-7 h-7 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 font-bold text-xs flex items-center justify-center shrink-0">
                      1
                    </div>
                    <div className="space-y-1.5 flex-1">
                      <p className="text-xs font-semibold text-white">
                        Instala una extensión gratuita para exportar cookies
                      </p>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        Usa una extensión segura de código abierto para tu navegador habitual:
                      </p>
                      <div className="flex flex-wrap gap-2 pt-1">
                        <a
                          href="https://chromewebstore.google.com/detail/get-cookiestxt-locally/cclelndahbckbenkjhflpdbgdldlbecc"
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs font-medium text-indigo-300 transition-colors"
                        >
                          <Globe className="w-3.5 h-3.5" />
                          <span>Chrome / Brave / Edge Store</span>
                          <ExternalLink className="w-3 h-3 ml-0.5 opacity-60" />
                        </a>
                        <a
                          href="https://addons.mozilla.org/es/firefox/addon/cookies-txt/"
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs font-medium text-indigo-300 transition-colors"
                        >
                          <Globe className="w-3.5 h-3.5" />
                          <span>Firefox Add-ons</span>
                          <ExternalLink className="w-3 h-3 ml-0.5 opacity-60" />
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="p-4 rounded-2xl bg-zinc-800/40 border border-zinc-700/60 flex items-start gap-3.5">
                    <div className="w-7 h-7 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 font-bold text-xs flex items-center justify-center shrink-0">
                      2
                    </div>
                    <div className="space-y-1 flex-1">
                      <p className="text-xs font-semibold text-white">
                        Abre youtube.com y exporta
                      </p>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        Entra a <strong>youtube.com</strong> con tu cuenta habitual. Haz clic en el icono de la extensión arriba a la derecha y presiona <strong>"Export"</strong> o copia el texto generado.
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="p-4 rounded-2xl bg-zinc-800/40 border border-zinc-700/60 flex items-start gap-3.5">
                    <div className="w-7 h-7 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 font-bold text-xs flex items-center justify-center shrink-0">
                      3
                    </div>
                    <div className="space-y-2 flex-1">
                      <p className="text-xs font-semibold text-white">
                        Sube o pega el archivo aquí
                      </p>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        Pasa a la pestaña "Subir Cookies" de este modal y guarda los datos. ¡A partir de ese momento podrás descargar cualquier video protegido!
                      </p>
                      <button
                        type="button"
                        onClick={() => setActiveTab('upload')}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Ir a subir cookies ahora</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Upload / Paste Cookies */}
          {activeTab === 'upload' && (
            <form onSubmit={handleSave} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center justify-between">
                  <span>Selecciona tu archivo cookies.txt o pega su texto</span>
                  <span className="text-[11px] text-zinc-400 font-normal">Formato Netscape</span>
                </label>

                {/* Drag and Drop / File Input Box */}
                <label className="flex flex-col items-center justify-center p-6 rounded-2xl bg-zinc-800/60 border-2 border-dashed border-zinc-700 hover:border-indigo-400 hover:bg-zinc-800/80 transition-all cursor-pointer text-center group">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 group-hover:bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-2 transition-colors">
                    <Upload className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold text-zinc-200">
                    Haz clic para seleccionar tu archivo <code className="text-indigo-300 font-mono">cookies.txt</code>
                  </span>
                  <span className="text-[11px] text-zinc-400 mt-0.5">
                    O arrastra el archivo directamente a esta caja
                  </span>
                  <input
                    type="file"
                    accept=".txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                <div className="pt-2">
                  <span className="text-xs text-zinc-400 font-medium block mb-1">
                    O pega el texto copiado aquí:
                  </span>
                  <textarea
                    value={cookieText}
                    onChange={(e) => setCookieText(e.target.value)}
                    placeholder="# Netscape HTTP Cookie File&#10;.youtube.com	TRUE	/	TRUE	...	SID	..."
                    rows={6}
                    className="w-full bg-zinc-800/80 border border-zinc-700 rounded-2xl p-3.5 text-xs text-zinc-200 font-mono placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('guide')}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                >
                  ← Ver cómo conseguir este archivo
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
                  >
                    Cerrar
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving || (!cookieText.trim() && !isConfigured)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isSaving ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Guardando...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Guardar y Activar Cookies</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* TAB 3: Why no captcha / "No soy un robot" explanation */}
          {activeTab === 'faq' && (
            <div className="space-y-5 text-xs leading-relaxed text-zinc-300">
              <div className="p-4 rounded-2xl bg-zinc-800/60 border border-zinc-700/60 space-y-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-indigo-400" />
                  ¿Por qué no se puede poner un botón de "No soy un robot" o CAPTCHA en pantalla?
                </h4>
                <p className="text-zinc-300">
                  Es una excelente pregunta. La razón es cómo funciona la descarga:
                </p>
                <ul className="list-disc list-inside space-y-1.5 text-zinc-400 pl-1">
                  <li>
                    Un botón de CAPTCHA (como los semáforos o checkbox de Google) en esta página web solo le demostraría a <em>nuestro servidor</em> que eres humano, pero <strong>no le demuestra nada a YouTube</strong>.
                  </li>
                  <li>
                    Quien se conecta a YouTube para descargar el audio es el <strong>servidor en la nube</strong> (un equipo remoto que no tiene pantalla, ratón ni navegador interactivo).
                  </li>
                  <li>
                    YouTube no ofrece una pantalla de CAPTCHA pública para desbloquear descargas de servidores. YouTube únicamente comprueba si la petición viene con una <strong>sesión de usuario activa (cookies)</strong>.
                  </li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 space-y-2">
                <h4 className="text-sm font-bold text-emerald-300 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-emerald-400" />
                  ¿Cómo descargar sin tener que configurar cookies? (Alternativa rápida)
                </h4>
                <p className="text-zinc-300">
                  El 90% de las veces que sale el bloqueo antibot es porque se usó un enlace de <strong>canción automática ("- Topic" / YouTube Music)</strong>, que tienen restricciones muy agresivas de discográficas.
                </p>
                <p className="text-zinc-400">
                  <strong>Solución sin cookies:</strong> Busca la misma canción en YouTube pero copia el enlace del <strong>Videoclip Oficial</strong>, la versión con <strong>Letra (Lyrics)</strong> o subida por un canal de música. Esos videos no tienen la restricción antibot y descargan al instante sin cookies.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-800/40 border border-zinc-700/50 space-y-2">
                <h5 className="font-semibold text-white flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-zinc-400" />
                  ¿Es seguro subir cookies?
                </h5>
                <p className="text-zinc-400">
                  Las cookies se guardan localmente en el entorno de este contenedor y solo se utilizan para pasar el parámetro <code className="text-indigo-300">--cookies</code> al motor yt-dlp al procesar tu solicitud. Puedes borrarlas en cualquier momento con el botón "Quitar".
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
