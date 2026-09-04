#!/usr/bin/env bash

# ==============================================================================
# 🎵 Extractor de Audio de YouTube pal etor - Setup Script
# Compatible con: Linux (Ubuntu/Debian/Fedora/Arch) y macOS (Apple Silicon / Intel)
# ==============================================================================

set -e

# Colores para la terminal
BOLD='\033[1m'
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # Sin color

print_step() {
  echo -e "\n${BOLD}${CYAN}==>${NC} ${BOLD}$1${NC}"
}

print_success() {
  echo -e "${GREEN}✔ $1${NC}"
}

print_warning() {
  echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
  echo -e "${RED}✖ $1${NC}"
}

echo -e "${BOLD}${CYAN}"
echo "  ╔══════════════════════════════════════════════════════════════╗"
echo "  ║      🎵 Extractor de Audio de YouTube pal etor 🎵             ║"
echo "  ║        Script de Configuración y Puesta en Marcha            ║"
echo "  ╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# 1. Detección de Sistema Operativo
OS_TYPE="$(uname -s)"
case "${OS_TYPE}" in
  Darwin*)
    OS_NAME="macOS"
    ;;
  Linux*)
    OS_NAME="Linux"
    ;;
  *)
    OS_NAME="Desconocido (${OS_TYPE})"
    ;;
esac
print_success "Sistema operativo detectado: ${BOLD}${OS_NAME}${NC}"

# 2. Verificar Node.js y npm
print_step "Comprobando entorno Node.js..."

if ! command -v node >/dev/null 2>&1; then
  print_error "Node.js no está instalado."
  if [ "$OS_NAME" = "macOS" ]; then
    echo -e "En macOS puedes instalarlo fácilmente con Homebrew:\n  ${BOLD}brew install node${NC}"
  else
    echo -e "En Linux puedes instalarlo con tu gestor de paquetes o mediante nvm:\n  ${BOLD}curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt-get install -y nodejs${NC}"
  fi
  exit 1
fi

NODE_VERSION="$(node -v)"
print_success "Node.js encontrado: ${BOLD}${NODE_VERSION}${NC}"

if ! command -v npm >/dev/null 2>&1; then
  print_error "npm no está instalado. Por favor instala npm junto con Node.js."
  exit 1
fi
print_success "npm encontrado: ${BOLD}$(npm -v)${NC}"

# 3. Verificar Python 3 (Requerido por yt-dlp)
print_step "Comprobando Python 3..."
if command -v python3 >/dev/null 2>&1; then
  print_success "Python 3 disponible: ${BOLD}$(python3 --version)${NC}"
else
  print_warning "Python 3 no fue detectado en PATH. yt-dlp podría requerir python3 para ejecutarse."
fi

# 4. Verificar ffmpeg (Requerido para convertir a MP3 / WAV)
print_step "Comprobando ffmpeg (conversor multimedia)..."
if command -v ffmpeg >/dev/null 2>&1; then
  print_success "ffmpeg encontrado: ${BOLD}$(ffmpeg -version 2>&1 | head -n 1 | cut -d ' ' -f 1-3)${NC}"
else
  print_warning "ffmpeg NO está instalado en el sistema."
  if [ "$OS_NAME" = "macOS" ]; then
    if command -v brew >/dev/null 2>&1; then
      echo -e "${CYAN}Instalando ffmpeg automáticamente con Homebrew...${NC}"
      brew install ffmpeg || print_warning "No se pudo instalar ffmpeg automáticamente. Por favor ejecuta 'brew install ffmpeg'."
    else
      echo -e "Te recomendamos instalar Homebrew y luego ejecutar:\n  ${BOLD}brew install ffmpeg${NC}"
    fi
  elif [ "$OS_NAME" = "Linux" ]; then
    if command -v apt-get >/dev/null 2>&1; then
      echo -e "Puedes instalar ffmpeg ejecutando:\n  ${BOLD}sudo apt-get update && sudo apt-get install -y ffmpeg${NC}"
    elif command -v dnf >/dev/null 2>&1; then
      echo -e "Puedes instalar ffmpeg ejecutando:\n  ${BOLD}sudo dnf install -y ffmpeg${NC}"
    elif command -v pacman >/dev/null 2>&1; then
      echo -e "Puedes instalar ffmpeg ejecutando:\n  ${BOLD}sudo pacman -S --noconfirm ffmpeg${NC}"
    fi
  fi
fi

# 5. Asegurar binario de yt-dlp y permisos
print_step "Configurando motor de extracción (yt-dlp)..."
mkdir -p bin
mkdir -p temp_downloads

if [ -f "./bin/yt-dlp" ]; then
  chmod +x ./bin/yt-dlp 2>/dev/null || true
  print_success "Binario local yt-dlp verificado con permisos de ejecución."
elif command -v yt-dlp >/dev/null 2>&1; then
  print_success "yt-dlp global detectado en el sistema: $(command -v yt-dlp)"
else
  print_warning "Descargando binario yt-dlp standalone oficial..."
  curl -fsSL https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o ./bin/yt-dlp
  chmod +x ./bin/yt-dlp
  print_success "yt-dlp descargado y configurado exitosamente en ./bin/yt-dlp."
fi

# 6. Instalar dependencias de Node
print_step "Instalando dependencias de Node.js..."
if [ ! -d "node_modules" ]; then
  echo -e "${CYAN}Ejecutando npm install...${NC}"
  npm install
else
  echo -e "Las dependencias ya existen. Actualizando si es necesario..."
  npm install --prefer-offline --no-audit
fi
print_success "Dependencias listas."

# 7. Crear cookies.txt si no existe
if [ ! -f "cookies.txt" ]; then
  touch cookies.txt
fi

# 8. Lanzar la aplicación
print_step "Iniciando Extractor de Audio pal etor en http://localhost:3000..."
echo -e "\n${BOLD}${GREEN}✔ Todo listo. Abriendo la aplicación en tu navegador...${NC}\n"

# Abrir el navegador en segundo plano tras 2 segundos si es una sesión gráfica
(
  sleep 2
  if [ "$OS_NAME" = "macOS" ]; then
    open "http://localhost:3000" >/dev/null 2>&1 || true
  elif [ "$OS_NAME" = "Linux" ]; then
    xdg-open "http://localhost:3000" >/dev/null 2>&1 || true
  fi
) &

# Arrancar el servidor de desarrollo
exec npm run dev
