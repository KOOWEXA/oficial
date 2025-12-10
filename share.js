// share.js - Gestión de compartir contenido

class KOOWEXAShare {
  constructor() {
    this.shareContent = document.getElementById("shareContent");
    this.init();
  }

  init() {
    this.loadShareContent();
    this.setupShareButtons();
  }

  loadShareContent() {
    if (this.shareContent) {
      this.shareContent.innerHTML = this.getShareHTML();
    }
  }

  getShareHTML() {
    return `
            <p>¡Ayúdanos a difundir KOOWEXA! Comparte nuestra plataforma con emprendedores y negocios cubanos que buscan soluciones digitales profesionales y accesibles.</p>
            
            <div class="share-options">
                <a href="#" class="share-btn" id="shareWhatsapp">
                    <i class="fab fa-whatsapp"></i> WhatsApp
                </a>
                <a href="#" class="share-btn" id="shareTelegram">
                    <i class="fab fa-telegram"></i> Telegram
                </a>
                <a href="#" class="share-btn" id="shareFacebook">
                    <i class="fab fa-facebook"></i> Facebook
                </a>
                <a href="#" class="share-btn" id="shareTwitter">
                    <i class="fab fa-twitter"></i> Twitter
                </a>
                <a href="#" class="share-btn" id="shareEmail">
                    <i class="fas fa-envelope"></i> Email
                </a>
                <button class="share-btn" id="copyLink">
                    <i class="fas fa-link"></i> Copiar enlace
                </button>
            </div>
            
            <div class="share-stats">
                <p><strong>¡Juntos podemos llegar a más emprendedores cubanos!</strong></p>
            </div>
        `;
  }

  setupShareButtons() {
    document.addEventListener("click", (e) => {
      if (
        e.target.id === "shareWhatsapp" ||
        e.target.closest("#shareWhatsapp")
      ) {
        e.preventDefault();
        this.share("whatsapp");
      } else if (
        e.target.id === "shareTelegram" ||
        e.target.closest("#shareTelegram")
      ) {
        e.preventDefault();
        this.share("telegram");
      } else if (
        e.target.id === "shareFacebook" ||
        e.target.closest("#shareFacebook")
      ) {
        e.preventDefault();
        this.share("facebook");
      } else if (
        e.target.id === "shareTwitter" ||
        e.target.closest("#shareTwitter")
      ) {
        e.preventDefault();
        this.share("twitter");
      } else if (
        e.target.id === "shareEmail" ||
        e.target.closest("#shareEmail")
      ) {
        e.preventDefault();
        this.share("email");
      } else if (e.target.id === "copyLink" || e.target.closest("#copyLink")) {
        e.preventDefault();
        this.copyToClipboard();
      }
    });
  }

  getShareMessage() {
    return `¡Descubre KOOWEXA! La plataforma digital profesional para emprendedores cubanos. Soluciones optimizadas para conexiones lentas: tiendas online, hospedaje web y herramientas digitales. ${window.location.href}`;
  }

  share(platform) {
    const message = encodeURIComponent(this.getShareMessage());
    const url = encodeURIComponent(window.location.href);

    let shareUrl = "";

    switch (platform) {
      case "whatsapp":
        shareUrl = `https://api.whatsapp.com/send?text=${message}`;
        break;
      case "telegram":
        shareUrl = `https://t.me/share/url?url=${url}&text=${message}`;
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${message}`;
        break;
      case "email":
        shareUrl = `mailto:?subject=KOOWEXA - Plataforma Digital para Emprendedores Cubanos&body=${message}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank", "width=600,height=400");

      // Track share event
      if (window.KOOWEXA_API && window.KOOWEXA_API.getAPI("analytics")) {
        window.KOOWEXA_API.getAPI("analytics").trackEvent(
          "Share",
          platform,
          "Platform Share",
        );
      }
    }
  }

  copyToClipboard() {
    const text = this.getShareMessage();

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          this.showNotification("Enlace copiado al portapapeles", "success");
        })
        .catch((err) => {
          this.fallbackCopyToClipboard(text);
        });
    } else {
      this.fallbackCopyToClipboard(text);
    }
  }

  fallbackCopyToClipboard(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand("copy");
      if (successful) {
        this.showNotification("Enlace copiado al portapapeles", "success");
      } else {
        this.showNotification("Error al copiar el enlace", "warning");
      }
    } catch (err) {
      this.showNotification("Error al copiar el enlace", "warning");
    }

    document.body.removeChild(textArea);
  }

  showNotification(message, type = "info") {
    if (window.koowexaCore && window.koowexaCore.showNotification) {
      window.koowexaCore.showNotification(message, type);
    } else {
      // Fallback simple
      alert(message);
    }
  }
}

// Inicializar compartir
document.addEventListener("DOMContentLoaded", function () {
  new KOOWEXAShare();
});
