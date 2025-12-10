// download.js - Gestión de descargas

class KOOWEXADownload {
  constructor() {
    this.init();
  }

  init() {
    this.setupDownloadTracking();
    this.setupAppDownload();
  }

  setupDownloadTracking() {
    // Trackear descargas de la app
    const downloadLinks = document.querySelectorAll(
      'a[download], a[href*=".apk"], a[href*=".exe"], a[href*=".zip"]',
    );

    downloadLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        const fileName =
          link.getAttribute("download") || link.href.split("/").pop();
        this.trackDownload(fileName, link.href);
      });
    });
  }

  setupAppDownload() {
    // Configurar descarga de la app KOOWEXA
    const appDownloadBtn = document.querySelector('a[href*="KOO.apk"]');
    if (appDownloadBtn) {
      appDownloadBtn.addEventListener("click", (e) => {
        this.trackDownload("KOOWEXA-App", appDownloadBtn.href);

        // Mostrar instrucciones de instalación para Android
        if (this.isMobileDevice()) {
          this.showInstallInstructions();
        }
      });
    }
  }

  trackDownload(fileName, fileUrl) {
    if (window.KOOWEXA_API && window.KOOWEXA_API.getAPI("analytics")) {
      window.KOOWEXA_API.getAPI("analytics").trackEvent(
        "Download",
        fileName,
        fileUrl,
      );
    }

    console.log(`Descarga iniciada: ${fileName}`);
  }

  isMobileDevice() {
    return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    );
  }

  showInstallInstructions() {
    const instructions = `
            <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 10000; display: flex; align-items: center; justify-content: center;">
                <div style="background: white; padding: 2rem; border-radius: 12px; max-width: 400px; text-align: center;">
                    <h3 style="color: #1a365d; margin-bottom: 1rem;">Instalación de KOOWEXA App</h3>
                    <p style="color: #475569; margin-bottom: 1.5rem;">Después de descargar el archivo .apk, necesitarás permitir la instalación de aplicaciones de fuentes desconocidas en tu dispositivo Android.</p>
                    <ol style="text-align: left; color: #475569; margin-bottom: 1.5rem;">
                        <li>Ve a Configuración → Seguridad</li>
                        <li>Activa "Fuentes desconocidas"</li>
                        <li>Encuentra el archivo descargado en tu administrador de archivos</li>
                        <li>Toca el archivo .apk para instalar</li>
                    </ol>
                    <button onclick="this.parentElement.parentElement.remove()" style="background: #2563eb; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer;">
                        Entendido
                    </button>
                </div>
            </div>
        `;

    document.body.insertAdjacentHTML("beforeend", instructions);
  }

  // Método para forzar descarga de archivos
  forceDownload(url, fileName) {
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.trackDownload(fileName, url);
  }
}

// Inicializar descargas
document.addEventListener("DOMContentLoaded", function () {
  new KOOWEXADownload();
});
