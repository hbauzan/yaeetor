# 🎵 Extractor de Audio de YouTube pal etor

<div align="center">

![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![NodeJS](https://img.shields.io/badge/Node.js-22-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.21-000000?style=for-the-badge&logo=express&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![yt--dlp](https://img.shields.io/badge/yt--dlp-Latest-FF0000?style=for-the-badge&logo=youtube&logoColor=white)

<p align="center">
  <b>Una suite moderna, rápida y estilizada para extraer pistas de audio de YouTube en formato MP3 (320kbps) y WAV sin pérdida.</b>
</p>

[Características](#-características-principales) • [Tecnologías](#-stack-tecnológico) • [Instalación](#-instalación-rápida) • [Uso](#-guía-de-uso) • [Despliegue](#-despliegue-en-producción)

</div>

---

## ✨ Características Principales

- 🎧 **Doble Formato de Alta Calidad**:
  - **MP3 (320 kbps)**: Máxima fidelidad con compresión inteligente para dispositivos móviles y reproductores portátiles.
  - **WAV (Lossless)**: Calidad de estudio sin pérdida de datos, idóneo para edición de sonido y producción musical.
- ⚡ **Extracción Ultrarrápida**: Motor backend optimizado con ejecución paralela mediante `yt-dlp` y `ffmpeg`.
- 🛡️ **Evasión Antibot Integrada**:
  - Servicio de tokens de prueba de origen (POT provider).
  - Gestor visual para importar y validar archivos `cookies.txt` de YouTube para videos restringidos o protegidos.
- 🔊 **Preescucha en Tiempo Real**: Reproductor de audio integrado con visualizador interactivo, control de volumen y seek bar por streaming HTTP con soporte para rangos (`206 Partial Content`).
- 🏷️ **Renombrado Personalizado**: Edita el título del archivo antes de la descarga con un solo clic.
- 🕒 **Historial Local Inteligente**: Registro de descargas recientes persistente en el navegador para re-descargar o escuchar pistas procesadas.
- 🎨 **Interfaz de Alta Gama**: Diseño oscuro con acentos violeta y esmeralda, animaciones fluidas con `motion` y retroalimentación táctil responsiva.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnologías |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite 6, Tailwind CSS v4, Motion, Lucide Icons |
| **Backend** | Express 4, Node.js 22, ESM/CJS esbuild bundler |
| **Motor de Audio** | `yt-dlp` binario nativo, `ffmpeg`, HTTP Audio Streaming |
| **Despliegue** | Google Cloud Run, Contenedores Docker, AI Studio Build |

---

## 🚀 Instalación Rápida

### Requisitos Previos

- **Node.js**: v20 o v22+
- **ffmpeg** instalado en el sistema (`apt-get install ffmpeg` o `brew install ffmpeg`)
- **yt-dlp** (el repositorio ya incluye binario optimizado en `/bin/yt-dlp` o usa el del sistema)

### Pasos

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/tu-usuario/extractor-audio-youtube-pal-etor.git
   cd extractor-audio-youtube-pal-etor
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Iniciar en modo desarrollo:**
   ```bash
   npm run dev
   ```
   Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 📋 Scripts Disponibles

- `npm run dev`: Inicia el servidor full-stack de desarrollo con Vite integrado.
- `npm run build`: Compila los assets de frontend en `dist/` y genera el servidor de producción empaquetado `dist/server.cjs`.
- `npm start`: Inicia el servidor de producción compilado listo para recibir tráfico en puerto 3000.
- `npm run lint`: Ejecuta la verificación estricta de tipos de TypeScript con `tsc --noEmit`.

---

## 🎯 Guía de Uso

1. **Pega la URL**: Ingresa cualquier enlace estándar de YouTube (`watch?v=...`, `youtu.be/...`, shorts o listas).
2. **Inspección Automática**: La aplicación obtiene al instante la carátula, duración y autor del video.
3. **Elige tu Formato**:
   - Pulsa **MP3 320k** para un archivo liviano de alta fidelidad.
   - Pulsa **WAV Lossless** para obtener la pista sin comprimir.
4. **Preescucha y Descarga**: Reproduce la canción directamente en el navegador o descárgala a tu disco con el nombre que prefieras.

---

## ☁️ Despliegue en Producción (Cloud Run / Docker)

Este proyecto está configurado para ejecutarse en contenedores en **Google Cloud Run**:

```bash
# Compilar frontend y bundle del servidor
npm run build

# Iniciar servidor Node
npm start
```

El servidor escucha en `0.0.0.0:3000` y gestiona tanto la API REST como los archivos estáticos de la aplicación web de forma autónoma.

---

<div align="center">

Hecho con precisión y buen sonido 🎧

</div>
