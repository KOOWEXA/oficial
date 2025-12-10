// comenzar.js - Gestión optimizada del inicio de proyectos

class KOOWEXAStart {
  constructor() {
    this.config = {
      email: "koowexa@gmail.com",
      defaultSubject: "🚀 Solicitud de Proyecto - KOOWEXA",
      trackingEvent: "project_start",
      buttonSelectors: [
        "#startBtn",
        ".start-project-btn",
        '[data-action="start-project"]',
      ],
    };

    this.state = {
      isProcessing: false,
      buttonOriginalText: "",
    };

    this.init();
  }

  init() {
    this.setupStartButtons();
    this.setupAnalytics();
  }

  setupStartButtons() {
    this.config.buttonSelectors.forEach((selector) => {
      const buttons = document.querySelectorAll(selector);
      buttons.forEach((button) => {
        this.initializeButton(button);
      });
    });
  }

  initializeButton(button) {
    button.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (!this.state.isProcessing) {
        this.startProject(button);
      }
    });

    // Mejorar accesibilidad
    button.setAttribute("role", "button");
    button.setAttribute("aria-label", "Iniciar nuevo proyecto con KOOWEXA");
  }

  startProject(button) {
    if (this.state.isProcessing) return;

    this.state.isProcessing = true;
    this.state.buttonOriginalText = button.textContent;

    this.showLoadingState(button);

    // Pequeño delay para mejor UX
    setTimeout(() => {
      try {
        this.openEmailClient();
        this.trackConversion();
        this.showSuccessState(button);
      } catch (error) {
        console.error("Error en proceso de inicio:", error);
        this.showErrorState(button);
      } finally {
        setTimeout(() => {
          this.resetButtonState(button);
        }, 3000);
      }
    }, 800);
  }

  openEmailClient() {
    const { email, defaultSubject } = this.config;

    const emailTemplate = this.generateEmailTemplate();
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(defaultSubject)}&body=${encodeURIComponent(emailTemplate)}`;

    // Abrir en nueva pestaña/popup para mejor UX
    const newWindow = window.open(mailtoUrl, "_blank", "width=800,height=600");

    if (!newWindow) {
      // Fallback a redirección directa
      window.location.href = mailtoUrl;
    }
  }

  generateEmailTemplate() {
    return `Hola equipo KOOWEXA,

Me com contacto con ustedes porque estoy interesado en desarrollar un proyecto y me encantaría contar con su experiencia.

📋 INFORMACIÓN DEL PROYECTO:

• Tipo de negocio/industria: [Por favor especifique: E-commerce, SaaS, Startup, Empresa establecida, etc.]
• Servicios requeridos: [Desarrollo web, App móvil, Consultoría técnica, Otro]
• Presupuesto estimado: [Rango aproximado o por definir]
• Timeline deseado: [Fecha límite o flexibilidad]

🎯 OBJETIVOS PRINCIPALES:

• [Qué problema busco resolver]
• [Resultados esperados]
• [Público objetivo]

💡 INFORMACIÓN ADICIONAL:

• ¿Tiene ya algún diseño o especificación técnica?
• ¿Prefiere alguna tecnología en particular?
• ¿Tiene equipo técnico interno?

📞 INFORMACIÓN DE CONTACTO:

• Nombre completo: 
• Empresa/organización: 
• Teléfono: 
• Mejor horario para contactar: 

Estoy disponible para una reunión inicial donde podamos discutir los detalles y expectativas.

Quedo atento a su respuesta.

Saludos cordiales`;
  }

  showLoadingState(button) {
    button.style.opacity = "0.7";
    button.style.cursor = "wait";
    button.textContent = "Preparando formulario...";
    button.disabled = true;

    // Agregar spinner visual
    button.innerHTML =
      '<span class="loading-spinner">⏳</span> Preparando formulario...';
  }

  showSuccessState(button) {
    button.style.backgroundColor = "#4CAF50";
    button.textContent = "✅ ¡Formulario listo!";
    button.innerHTML = "<span>✅</span> ¡Formulario listo!";
  }

  showErrorState(button) {
    button.style.backgroundColor = "#f44336";
    button.textContent = "❌ Error - Intentar nuevamente";
    button.innerHTML = "<span>❌</span> Error - Intentar nuevamente";
  }

  resetButtonState(button) {
    button.style.opacity = "1";
    button.style.cursor = "pointer";
    button.style.backgroundColor = "";
    button.disabled = false;
    button.textContent = this.state.buttonOriginalText;
    button.innerHTML = this.state.buttonOriginalText;
    this.state.isProcessing = false;
  }

  setupAnalytics() {
    // Pre-cargar analytics si es necesario
    if (window.KOOWEXA_API) {
      console.log("KOOWEXA Analytics API disponible");
    }
  }

  trackConversion() {
    try {
      if (window.KOOWEXA_API && window.KOOWEXA_API.getAPI("analytics")) {
        window.KOOWEXA_API.getAPI("analytics").trackConversion(
          this.config.trackingEvent,
          0, // Valor de conversión
          {
            source: "start_project_button",
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
          },
        );
      }

      // Tracking adicional para Google Analytics (si existe)
      if (typeof gtag !== "undefined") {
        gtag("event", "generate_lead", {
          event_category: "project_start",
          event_label: "email_form_opened",
        });
      }
    } catch (error) {
      console.warn("Error en tracking:", error);
    }
  }

  // Método para re-inicializar si se agregan botones dinámicamente
  refresh() {
    this.setupStartButtons();
  }
}

// Estilos CSS inline para mejoras visuales
const injectStyles = () => {
  const styles = `
        .loading-spinner {
            display: inline-block;
            animation: spin 1s linear infinite;
            margin-right: 8px;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        [data-action="start-project"]:hover {
            transform: translateY(-2px);
            transition: transform 0.2s ease;
        }
    `;

  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
};

// Inicialización optimizada con manejo de errores
document.addEventListener("DOMContentLoaded", function () {
  try {
    // Inyectar estilos
    injectStyles();

    // Inicializar funcionalidad
    window.KOOWEXAStart = new KOOWEXAStart();

    console.log("✅ KOOWEXAStart inicializado correctamente");
  } catch (error) {
    console.error("❌ Error al inicializar KOOWEXAStart:", error);

    // Fallback básico
    const buttons = document.querySelectorAll("#startBtn, .start-project-btn");
    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        window.location.href =
          "mailto:koowexa@gmail.com?subject=🚀 Solicitud de Proyecto - KOOWEXA";
      });
    });
  }
});

// Exportar para uso modular (si es necesario)
if (typeof module !== "undefined" && module.exports) {
  module.exports = KOOWEXAStart;
}
