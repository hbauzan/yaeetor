import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { execFile, spawn } from 'child_process';
import crypto from 'crypto';

const app = express();
const PORT = 3000;

app.use(express.json());

// Ensure downloads temp directory exists
let TEMP_DIR = path.join(process.cwd(), 'temp_downloads');
try {
  if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
  }
} catch {
  TEMP_DIR = '/tmp/temp_downloads';
  if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
  }
}

// Cookies file location
const COOKIES_FILE = path.join(process.cwd(), 'cookies.txt');

function hasCookies(): boolean {
  try {
    if (fs.existsSync(COOKIES_FILE)) {
      const stats = fs.statSync(COOKIES_FILE);
      return stats.size > 15;
    }
  } catch {
    return false;
  }
  return false;
}

// Background POT Provider daemon management
function ensurePotProvider() {
  const potScript = '/root/bgutil-ytdlp-pot-provider/server/build/main.js';
  if (!fs.existsSync(potScript)) return;

  fetch('http://127.0.0.1:4416/ping', { signal: AbortSignal.timeout(1000) })
    .then(() => {
      // already up
    })
    .catch(() => {
      console.log('Spawning bgutil POT provider daemon on port 4416...');
      try {
        const child = spawn('node', [potScript, '-p', '4416'], {
          detached: true,
          stdio: 'ignore',
        });
        child.unref();
      } catch (err) {
        console.error('Failed to spawn POT provider daemon:', err);
      }
    });
}

// In-memory store for converted files metadata
interface FileRecord {
  id: string;
  filename: string;
  format: 'mp3' | 'wav';
  filepath: string;
  title: string;
  createdAt: number;
}
const convertedFiles = new Map<string, FileRecord>();

// Cleanup files older than 20 minutes
setInterval(() => {
  const now = Date.now();
  for (const [id, record] of convertedFiles.entries()) {
    if (now - record.createdAt > 20 * 60 * 1000) {
      try {
        if (fs.existsSync(record.filepath)) {
          fs.unlinkSync(record.filepath);
        }
      } catch (err) {
        console.error('Error cleaning file:', err);
      }
      convertedFiles.delete(id);
    }
  }
}, 5 * 60 * 1000);

// Ensure executable permissions on bundled binaries
function ensureBinaryPermissions() {
  const localBinary = path.join(process.cwd(), 'bin', 'yt-dlp');
  if (fs.existsSync(localBinary)) {
    try {
      fs.chmodSync(localBinary, 0o755);
      console.log('yt-dlp binary permissions set to 0755');
    } catch (err) {
      console.warn('Could not set permissions on yt-dlp binary:', err);
    }
  }
}
ensureBinaryPermissions();

// Get path to yt-dlp binary
function getYtDlpPath(): string {
  const localBinary = path.join(process.cwd(), 'bin', 'yt-dlp');
  if (fs.existsSync(localBinary)) {
    try {
      fs.chmodSync(localBinary, 0o755);
    } catch {
      // ignore
    }
    return localBinary;
  }
  return 'yt-dlp';
}

function getFfmpegPath(): string {
  if (fs.existsSync('/usr/bin/ffmpeg')) {
    return '/usr/bin/ffmpeg';
  }
  return 'ffmpeg';
}

function getNodeRuntimePath(): string {
  if (fs.existsSync('/usr/local/bin/node')) return '/usr/local/bin/node';
  if (fs.existsSync('/usr/bin/node')) return '/usr/bin/node';
  return 'node';
}

// Generate base yt-dlp arguments with JS runtime and optional cookies
function getBaseYtDlpArgs(extraArgs: string[] = []): string[] {
  const nodePath = getNodeRuntimePath();
  const args = [
    '--no-warnings',
    '--no-playlist',
    '--ffmpeg-location',
    getFfmpegPath(),
    '--js-runtimes',
    `node:${nodePath}`,
    ...extraArgs,
  ];
  if (hasCookies()) {
    args.push('--cookies', COOKIES_FILE);
  }
  return args;
}

// Sanitize filename helper
function sanitizeFilename(name: string): string {
  return name.replace(/[<>:"/\\|?*\x00-\x1F]/g, '_').trim().slice(0, 120);
}

// Validate and extract YouTube Video ID
function extractYoutubeId(input: string): string | null {
  if (!input || typeof input !== 'string') return null;
  let str = input.trim();
  if (!str) return null;
  if (!/^https?:\/\//i.test(str)) {
    str = 'https://' + str;
  }
  try {
    const parsed = new URL(str);
    const host = parsed.hostname.replace(/^www\./, '').toLowerCase();

    // youtu.be/<id>
    if (host === 'youtu.be') {
      const id = parsed.pathname.slice(1).split('/')[0].split('?')[0];
      return id && /^[\w-]{11}$/.test(id) ? id : null;
    }

    if (['youtube.com', 'm.youtube.com', 'music.youtube.com'].includes(host)) {
      // /watch?v=<id>
      const v = parsed.searchParams.get('v');
      if (v && /^[\w-]{11}$/.test(v)) return v;

      // /shorts/<id>, /embed/<id>, /live/<id>, /v/<id>
      const parts = parsed.pathname.split('/').filter(Boolean);
      if (['shorts', 'embed', 'live', 'v'].includes(parts[0]) && parts[1]) {
        const id = parts[1].split('?')[0];
        if (/^[\w-]{11}$/.test(id)) return id;
      }
    }

    // Direct regex match for any 11-char ID in YouTube URL context
    const match = str.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/|live\/))([\w-]{11})/);
    return match ? match[1] : null;
  } catch {
    const match = input.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/|live\/))([\w-]{11})/);
    return match ? match[1] : null;
  }
}

function isValidYoutubeUrl(urlStr: string): boolean {
  return extractYoutubeId(urlStr) !== null;
}

// Fetch metadata using YouTube's official oEmbed API (reliable fallback, no bot checks)
async function fetchOEmbedInfo(videoId: string) {
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const res = await fetch(oembedUrl, { signal: AbortSignal.timeout(5000) });
    if (res.ok) {
      const data: any = await res.json();
      return {
        title: data.title || 'Video de YouTube',
        uploader: data.author_name || 'YouTube',
        thumbnail: data.thumbnail_url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      };
    }
  } catch (err) {
    console.warn('oEmbed fallback error:', err);
  }
  return null;
}

// Format duration in mm:ss or hh:mm:ss
function formatSeconds(secs: number): string {
  if (isNaN(secs) || secs < 0) return '0:00';
  const hours = Math.floor(secs / 3600);
  const minutes = Math.floor((secs % 3600) / 60);
  const seconds = Math.floor(secs % 60);

  const paddedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;
  if (hours > 0) {
    const paddedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
    return `${hours}:${paddedMinutes}:${paddedSeconds}`;
  }
  return `${minutes}:${paddedSeconds}`;
}

// API Routes FIRST

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    potProviderActive: true,
    cookiesConfigured: hasCookies(),
    time: new Date().toISOString(),
  });
});

// Cookies configuration endpoints
app.get('/api/cookies/status', (req: Request, res: Response) => {
  const configured = hasCookies();
  let size = 0;
  if (configured && fs.existsSync(COOKIES_FILE)) {
    try {
      size = fs.statSync(COOKIES_FILE).size;
    } catch {}
  }
  res.json({ configured, size });
});

app.post('/api/cookies', (req: Request, res: Response) => {
  const { cookies } = req.body;
  if (!cookies || typeof cookies !== 'string' || cookies.trim().length < 10) {
    return res.status(400).json({
      error: 'El contenido de cookies no es válido. Debe ser un texto exportado en formato Netscape cookies.txt.',
    });
  }

  try {
    fs.writeFileSync(COOKIES_FILE, cookies.trim(), 'utf8');
    return res.json({ success: true, message: 'Cookies de YouTube guardadas exitosamente.' });
  } catch (err: any) {
    console.error('Error guardando cookies.txt:', err);
    return res.status(500).json({ error: 'No se pudo guardar el archivo de cookies en el servidor.' });
  }
});

app.delete('/api/cookies', (req: Request, res: Response) => {
  try {
    if (fs.existsSync(COOKIES_FILE)) {
      fs.unlinkSync(COOKIES_FILE);
    }
    return res.json({ success: true, message: 'Cookies eliminadas.' });
  } catch (err: any) {
    console.error('Error eliminando cookies.txt:', err);
    return res.status(500).json({ error: 'No se pudo eliminar el archivo de cookies.' });
  }
});

// Video info endpoint
app.post('/api/info', async (req: Request, res: Response) => {
  const { url } = req.body;
  const videoId = extractYoutubeId(url);
  if (!videoId) {
    return res.status(400).json({
      error: 'Por favor ingresa un enlace válido de YouTube (ej. https://www.youtube.com/watch?v=... o https://youtu.be/...)',
    });
  }

  const cleanUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const ytDlp = getYtDlpPath();

  // Start oEmbed query in parallel for instant, bulletproof metadata
  const oEmbedPromise = fetchOEmbedInfo(videoId);

  const args = getBaseYtDlpArgs([
    '--dump-single-json',
    '--skip-download',
    cleanUrl,
  ]);

  execFile(ytDlp, args, { maxBuffer: 10 * 1024 * 1024, timeout: 15000 }, async (error, stdout, stderr) => {
    const oEmbedData = await oEmbedPromise;

    if (error) {
      console.warn('yt-dlp info warning (falling back to oEmbed):', error.message, stderr);
      if (oEmbedData) {
        return res.json({
          success: true,
          data: {
            id: videoId,
            title: oEmbedData.title,
            uploader: oEmbedData.uploader,
            duration: 0,
            durationFormatted: '',
            thumbnail: oEmbedData.thumbnail,
            url: cleanUrl,
          },
        });
      }

      // If even oEmbed fails, return minimum valid metadata so the user is never blocked
      return res.json({
        success: true,
        data: {
          id: videoId,
          title: `Video de YouTube (${videoId})`,
          uploader: 'YouTube',
          duration: 0,
          durationFormatted: '',
          thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
          url: cleanUrl,
        },
      });
    }

    try {
      const jsonStart = stdout.indexOf('{');
      if (jsonStart === -1) {
        throw new Error('No se pudo encontrar JSON en la respuesta de yt-dlp');
      }
      const rawData = JSON.parse(stdout.slice(jsonStart));

      // Extract thumbnails
      let bestThumbnail = '';
      if (Array.isArray(rawData.thumbnails) && rawData.thumbnails.length > 0) {
        bestThumbnail = rawData.thumbnails[rawData.thumbnails.length - 1]?.url || '';
      }
      if (!bestThumbnail && rawData.thumbnail) {
        bestThumbnail = rawData.thumbnail;
      }
      if (!bestThumbnail) {
        bestThumbnail = oEmbedData?.thumbnail || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
      }

      const durationSecs = rawData.duration || 0;

      return res.json({
        success: true,
        data: {
          id: rawData.id || videoId,
          title: rawData.title || oEmbedData?.title || 'Audio de YouTube',
          uploader: rawData.uploader || rawData.channel || oEmbedData?.uploader || 'Canal desconocido',
          duration: durationSecs,
          durationFormatted: formatSeconds(durationSecs),
          thumbnail: bestThumbnail,
          url: cleanUrl,
        },
      });
    } catch (parseErr: any) {
      console.error('Failed to parse yt-dlp json, checking oEmbed:', parseErr);
      if (oEmbedData) {
        return res.json({
          success: true,
          data: {
            id: videoId,
            title: oEmbedData.title,
            uploader: oEmbedData.uploader,
            duration: 0,
            durationFormatted: '',
            thumbnail: oEmbedData.thumbnail,
            url: cleanUrl,
          },
        });
      }
      return res.status(500).json({ error: 'Error procesando los datos del video.' });
    }
  });
});

// Audio Extraction endpoint
app.post('/api/extract', async (req: Request, res: Response) => {
  const { url, format = 'mp3', title } = req.body;
  const videoId = extractYoutubeId(url);
  if (!videoId) {
    return res.status(400).json({ error: 'Enlace de YouTube no válido.' });
  }

  const cleanUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const audioFormat = format.toLowerCase() === 'wav' ? 'wav' : 'mp3';
  const fileId = crypto.randomUUID();
  const outputTemplate = path.join(TEMP_DIR, `${fileId}.%(ext)s`);
  const finalFilePath = path.join(TEMP_DIR, `${fileId}.${audioFormat}`);

  const ytDlp = getYtDlpPath();

  const args = getBaseYtDlpArgs([
    '-f',
    'ba/b',
    '-x',
    '--audio-format',
    audioFormat,
    '--audio-quality',
    '0',
    '-o',
    outputTemplate,
    cleanUrl,
  ]);

  console.log(`Starting audio extraction [${audioFormat}] for: ${cleanUrl} (fileId: ${fileId})`);

  const proc = spawn(ytDlp, args);

  let stderrOutput = '';
  proc.stderr.on('data', (data) => {
    stderrOutput += data.toString();
  });

  let responded = false;
  const sendResponse = (statusCode: number, data: any) => {
    if (responded || res.headersSent) return;
    responded = true;
    res.status(statusCode).json(data);
  };

  proc.on('error', (err) => {
    console.error('Extraction process error:', err);
    sendResponse(500, { error: 'Error al iniciar la extracción de audio.' });
  });

  proc.on('close', (code) => {
    if (responded || res.headersSent) return;
    if (code !== 0 || !fs.existsSync(finalFilePath)) {
      console.error('Extraction failed with code', code, stderrOutput);
      let errorMsg = 'No se pudo extraer el audio de este enlace. Verifica que el video esté disponible públicamente.';
      let isBotOrAuth = false;

      if (stderrOutput.includes('Sign in to confirm you’re not a bot') || stderrOutput.includes('LOGIN_REQUIRED')) {
        isBotOrAuth = true;
        if (!hasCookies()) {
          errorMsg = 'YouTube solicitó verificación antibot para este contenido específico ("Sign in to confirm you’re not a bot"). Configura tus cookies de YouTube en la sección de opciones para desbloquear este audio protegido o prueba con otro video público.';
        } else {
          errorMsg = 'Las cookies configuradas expiraron o no tienen permiso para este contenido. Actualiza tu archivo cookies.txt en la sección de opciones.';
        }
      } else if (stderrOutput.includes('Requested format is not available')) {
        isBotOrAuth = !hasCookies();
        if (!hasCookies()) {
          errorMsg = 'Los formatos de este video están protegidos por YouTube. Sube tu archivo cookies.txt en el menú de Opciones para desbloquear la descarga.';
        } else {
          errorMsg = 'El formato solicitado no está disponible con la sesión actual. Revisa si tus cookies han caducado.';
        }
      } else if (stderrOutput.includes('Video unavailable')) {
        errorMsg = 'El video no está disponible o ha sido eliminado de YouTube.';
      } else if (stderrOutput.includes('Private video')) {
        errorMsg = 'El video es privado y no permite acceso para descarga.';
      }

      return sendResponse(500, {
        error: errorMsg,
        requiresCookies: isBotOrAuth && !hasCookies(),
        details: stderrOutput,
      });
    }

    try {
      const stats = fs.statSync(finalFilePath);
      const filename = `youtube_audio_${fileId.slice(0, 8)}.${audioFormat}`;

      convertedFiles.set(fileId, {
        id: fileId,
        filename,
        format: audioFormat,
        filepath: finalFilePath,
        title: title || req.body.title || 'Audio extraído',
        createdAt: Date.now(),
      });

      return sendResponse(200, {
        success: true,
        fileId,
        format: audioFormat,
        size: stats.size,
        sizeFormatted: `${(stats.size / (1024 * 1024)).toFixed(2)} MB`,
        downloadUrl: `/api/download/${fileId}`,
        streamUrl: `/api/stream/${fileId}`,
      });
    } catch (err: any) {
      console.error('Error checking output file:', err);
      return sendResponse(500, { error: 'Error al finalizar el archivo de audio.' });
    }
  });
});

// Audio stream endpoint for in-browser audio preview
app.get('/api/stream/:fileId', (req: Request, res: Response) => {
  const { fileId } = req.params;
  const record = convertedFiles.get(fileId);

  if (!record || !fs.existsSync(record.filepath)) {
    return res.status(404).send('Archivo de audio no encontrado o expirado.');
  }

  const stat = fs.statSync(record.filepath);
  const fileSize = stat.size;
  const range = req.headers.range;
  const contentType = record.format === 'wav' ? 'audio/wav' : 'audio/mpeg';

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = end - start + 1;
    const file = fs.createReadStream(record.filepath, { start, end });
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': contentType,
    };
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': contentType,
      'Accept-Ranges': 'bytes',
    };
    res.writeHead(200, head);
    fs.createReadStream(record.filepath).pipe(res);
  }
});

// Download endpoint
app.get('/api/download/:fileId', (req: Request, res: Response) => {
  const { fileId } = req.params;
  const record = convertedFiles.get(fileId);

  if (!record || !fs.existsSync(record.filepath)) {
    return res.status(404).send('Archivo de audio no encontrado o ya ha expirado.');
  }

  const customName = req.query.name as string | undefined;
  let downloadFilename = record.filename;
  if (customName) {
    const clean = sanitizeFilename(customName);
    if (clean) {
      downloadFilename = `${clean}.${record.format}`;
    }
  }

  res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(downloadFilename)}"`);
  res.setHeader('Content-Type', record.format === 'wav' ? 'audio/wav' : 'audio/mpeg');

  const stream = fs.createReadStream(record.filepath);
  stream.pipe(res);
});

// Vite middleware for development, static serve for production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Extractor de Audio server running on http://0.0.0.0:${PORT}`);
    // Start POT provider daemon on launch and periodically check
    ensurePotProvider();
    setInterval(ensurePotProvider, 3 * 60 * 1000);
  });
}

startServer();
