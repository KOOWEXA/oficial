// main-actions.js - Conecta los botones de la sección principal con el menú y bot

document.addEventListener("DOMContentLoaded", function () {
  // Botón del menú principal
  const mainMenuBtn = document.getElementById("mainMenuBtn");
  if (mainMenuBtn) {
    mainMenuBtn.addEventListener("click", function () {
      const menuToggle = document.getElementById("menuToggle");
      const menuItems = document.getElementById("menuItems");

      if (menuToggle && menuItems) {
        // Simular clic en el botón de menú flotante
        menuToggle.click();

        // Scroll suave hacia el menú
        setTimeout(() => {
          menuToggle.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 300);
      }
    });
  }

  // Botón del bot principal
  const mainBotBtn = document.getElementById("mainBotBtn");
  if (mainBotBtn) {
    mainBotBtn.addEventListener("click", function () {
      // Verificar si el bot está disponible
      if (
        window.KOOWEXA_BOT &&
        typeof window.KOOWEXA_BOT.openChat === "function"
      ) {
        window.KOOWEXA_BOT.openChat();
      } else if (
        window.botManager &&
        typeof window.botManager.openChat === "function"
      ) {
        window.botManager.openChat();
      } else {
        // Fallback: abrir modal de contacto
        const contactEmail = document.querySelector(".email-btn");
        if (contactEmail) {
          contactEmail.click();
        }
      }
    });
  }

  // Mejorar accesibilidad: permitir navegación con Tab
  const actionBtns = document.querySelectorAll(".action-btn");
  actionBtns.forEach((btn) => {
    btn.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        this.click();
      }
    });
  });
});
