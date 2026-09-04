# 🎵 Extractor de Audio de YouTube pal etor

<div align="center">

![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![NodeJS](https://img.shields.io/badge/Node.js-22-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.21-000000?style=for-the-badge&logo=express&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![yt--dlp](https://img.shields.io/badge/yt--dlp-Latest-FF0000?style=for-the-badge&logo=youtube&logoColor=white)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg?style=for-the-badge)](./LICENSE)

<p align="center">
  <b>Una suite moderna, rápida y estilizada para extraer pistas de audio de YouTube en formato MP3 (320kbps) y WAV sin pérdida.</b>
</p>

<p align="center">
  <a href="https://github.com/topics/youtube-to-mp3"><img src="https://img.shields.io/badge/topic-youtube--to--mp3-0969da?style=flat-square" alt="youtube-to-mp3" /></a>
  <a href="https://github.com/topics/youtube-audio-extractor"><img src="https://img.shields.io/badge/topic-youtube--audio--extractor-0969da?style=flat-square" alt="youtube-audio-extractor" /></a>
  <a href="https://github.com/topics/yt-dlp"><img src="https://img.shields.io/badge/topic-yt--dlp-0969da?style=flat-square" alt="yt-dlp" /></a>
  <a href="https://github.com/topics/youtube-downloader"><img src="https://img.shields.io/badge/topic-youtube--downloader-0969da?style=flat-square" alt="youtube-downloader" /></a>
  <a href="https://github.com/topics/audio-extractor"><img src="https://img.shields.io/badge/topic-audio--extractor-0969da?style=flat-square" alt="audio-extractor" /></a>
  <a href="https://github.com/topics/mp3-converter"><img src="https://img.shields.io/badge/topic-mp3--converter-0969da?style=flat-square" alt="mp3-converter" /></a>
  <a href="https://github.com/topics/ffmpeg"><img src="https://img.shields.io/badge/topic-ffmpeg-0969da?style=flat-square" alt="ffmpeg" /></a>
  <a href="https://github.com/topics/react19"><img src="https://img.shields.io/badge/topic-react19-0969da?style=flat-square" alt="react19" /></a>
  <a href="https://github.com/topics/typescript"><img src="https://img.shields.io/badge/topic-typescript-0969da?style=flat-square" alt="typescript" /></a>
  <a href="https://github.com/topics/cloud-run"><img src="https://img.shields.io/badge/topic-cloud--run-0969da?style=flat-square" alt="cloud-run" /></a>
</p>

> 🌐 **¿Te embola descargarlo e instalarlo en tu compu?**  
> Podés probarlo directamente online desde el navegador sin instalar nada:  
> 🚀 **[Abrir Extractor Online en Google AI Studio](https://ai.studio/apps/6606579f-724b-4b3b-805f-02c64089f1e2?fullscreenApplet=true)**  
>  
> 📩 *Si por alguna razón no anda o encontrás un error, por favor avisame a [hbauzan@gmail.com](mailto:hbauzan@gmail.com).*

[Demo Online](#-demo-online) • [Características](#-características-principales) • [Tecnologías](#-stack-tecnológico) • [Puesta en Marcha](#-puesta-en-marcha-e-instalación) • [Uso](#-guía-de-uso) • [Etiquetas GitHub](#-configuración-recomendada-para-el-about-de-github) • [Licencia](#-licencia) • [Contacto](#-soporte-y-contacto)

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

## 🚀 Puesta en Marcha e Instalación

### Requisitos Previos

- **Node.js**: v20 o v22+
- **Python 3**: Para ejecutar el motor `yt-dlp`
- **ffmpeg**: Conversor de medios para MP3/WAV (el script `setup.sh` intentará asistirte en su instalación)

---

### ⚡ Opción A: Automatizada con `setup.sh` (RECOMENDADA)

La forma más rápida y confiable de levantar el proyecto en **Linux** y **macOS** (compatible tanto con procesadores Apple Silicon M1/M2/M3 como con Intel).

El script realiza de forma autónoma:
1. Detecta tu sistema operativo (Linux / macOS).
2. Valida la presencia de **Node.js**, **npm** y **Python 3**.
3. Comprueba **ffmpeg** e intenta instalarlo automáticamente con Homebrew en macOS o te indica el comando para tu distro Linux.
4. Verifica los permisos de ejecución del motor `yt-dlp` en `./bin/yt-dlp`.
5. Ejecuta `npm install` optimizado.
6. Levanta el servidor en `http://localhost:3000` y abre automáticamente la aplicación en tu navegador predeterminado.

```bash
# 1. Dar permisos de ejecución al script (solo la primera vez)
chmod +x setup.sh

# 2. Iniciar el aplicativo
./setup.sh
```

---

### 🛠️ Opción B: Instalación Estándar (Manual con npm)

Si prefieres el flujo manual tradicional:

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/tu-usuario/extractor-audio-youtube-pal-etor.git
   cd extractor-audio-youtube-pal-etor
   ```

2. **Asegurar permisos en el motor yt-dlp:**
   ```bash
   chmod +x bin/yt-dlp
   ```

3. **Instalar dependencias:**
   ```bash
   npm install
   ```

4. **Iniciar en modo desarrollo:**
   ```bash
   npm run dev
   ```
   Luego abre [http://localhost:3000](http://localhost:3000) en tu navegador web.

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

## 📄 Licencia

Este proyecto está liberado bajo los términos de la **[Licencia Apache 2.0](./LICENSE)**.

Eres libre de usar, estudiar, modificar, compilar y distribuir este software, tanto con fines personales como comerciales, con la correspondiente atribución de autoría descrita en el archivo [LICENSE](./LICENSE).

---

## 📩 Soporte y Contacto

¿Tenés alguna duda, sugerencia o encontraste algún error al extraer un audio?

- 💬 Escribime directamente a: **[hbauzan@gmail.com](mailto:hbauzan@gmail.com)**
- 🌐 Probá la app en vivo en: **[Google AI Studio Live App](https://ai.studio/apps/6606579f-724b-4b3b-805f-02c64089f1e2?fullscreenApplet=true)**

---

<div align="center">

Hecho por eletor con tiempo libre, thc y buena musica. 🎧

</div>
