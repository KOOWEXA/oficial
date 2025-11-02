// Knowledge Base for OWE Assistant
const knowledgeBase = {
  saludos: [
    "¡Hola! Soy OWE, tu asistente de KOOWEXA. ¿En qué puedo ayudarte hoy?",
    "¡Bienvenido! Estoy aquí para guiarte en tu primer paso hacia tu presencia digital."
  ],
  servicio: [
    "Ofrecemos una herramienta completa y simple para que usted tenga su propia tienda online o catálogo de servicios."
  ],
  buscar: [
    "Puedes encontrarnos fácilmente en Google buscando 'KOOWEXA OFICIAL'. También visita nuestro perfil oficial."
  ],
  precios: [
    "El costo único es de **2000 CUP**. Incluye configuración, dominio temporal y hospedaje GRATIS por 3 meses.",
    "Es una inversión mínima con un retorno máximo: tendrás tu negocio visible 24/7 en internet."
  ],
  descuento: [
    "¡Sí! Si es tu primera vez solicitando el servicio, obtienes un bono especial de bienvenida. Menciona que vienes del sitio web al contactar por SMS.",
    "El descuento se aplica automáticamente a nuevos clientes que mencionen 'OWE' en su primer mensaje."
  ],
  redes: [
    "Puedes encontrarnos en WhatsApp, Telegram, Facebook y Twitter. Pero para una respuesta más rápida, envía un SMS al +53 50369270 o visita nuestro perfil oficial."
  ],
  koowexa: [
    "KOOWEXA es una iniciativa 100% cubana que busca democratizar la presencia digital. Creamos herramientas simples, rápidas y optimizadas para funcionar en las condiciones reales de internet en Cuba."
  ],
  tienda: [
    "Sí, ofrecemos una tienda online básica pero funcional: con catálogo de productos, fotos, precios y método de contacto. Ideal para vender desde Cuba sin necesidad de pasarelas de pago complejas."
  ],
  hospedaje: [
    "Incluimos 3 meses de hospedaje GRATIS en servidores estables. Pasado ese tiempo, puedes renovar por un costo minimo."
  ],
  tecnologia: [
    "Se utiliza codificacion optimizada para cargar rápido incluso en 2G o redes compartidas."
  ],
  premium: [
    "La versión Premium Deluxe ofrece diseño exclusivo, rendimiento mejorado, seguridad avanzada y funciones inteligentes. ¡Actívala ahora para experimentar la máxima calidad!"
  ],
  despedida: [
    "¡Gracias por confiar en KOOWEXA! No olvides enviar un SMS al +53 50369270 para comenzar."
  ],
  default: [
    "¿Quieres tu propia tienda o catálogo digital? Envía un SMS al +53 50369270 o visita mi perfil oficial para más información.",
    "No tengo información específica sobre eso, pero puedo ayudarte con cualquier duda sobre KOOWEXA y nuestros servicios."
  ]
};

// Quick replies for the chat
const quickReplies = [
  "¿Qué servicios ofrecen?",
  "¿Cuánto cuesta?",
  "¿Tienen descuento?",
  "¿Cómo los contacto?",
  "¿Qué es KOOWEXA?",
  "¿Ofrecen tienda online?",
  "¿Qué incluye el hospedaje?",
  "¿Qué tecnología usan?",
  "¿Qué es Premium Deluxe?",
  "Gracias, ya entendí"
];

// DOM Elements
const helpButton = document.getElementById('helpButton');
const chatModal = document.getElementById('chatModal');
const closeChat = document.getElementById('closeChat');
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const sendMessage = document.getElementById('sendMessage');
const quickRepliesContainer = document.getElementById('quickReplies');
const appPrompt = document.getElementById('appPrompt');
const closeAppPrompt = document.getElementById('closeAppPrompt');
const downloadLink = document.getElementById('downloadLink');
const notification = document.getElementById('notification');
const notificationText = document.getElementById('notificationText');
const closeNotification = document.getElementById('closeNotification');
const startNowBtn = document.getElementById('startNowBtn');
const learnMoreBtn = document.getElementById('learnMoreBtn');
const premiumBtn = document.getElementById('premiumBtn');

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
});

function initializeApp() {
  // Set up event listeners
  helpButton.addEventListener('click', openChat);
  closeChat.addEventListener('click', closeChatModal);
  sendMessage.addEventListener('click', sendUserMessage);
  chatInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      sendUserMessage();
    }
  });
  closeAppPrompt.addEventListener('click', closeAppPromptModal);
  closeNotification.addEventListener('click', closeNotificationModal);
  startNowBtn.addEventListener('click', () => showNotification('¡Excelente! Envía un SMS al +53 50369270 para comenzar.'));
  learnMoreBtn.addEventListener('click', () => openChat());
  premiumBtn.addEventListener('click', togglePremiumMode);
  
  // Load quick replies
  loadQuickReplies();
  
  // Show app prompt after delay
  setTimeout(showAppPrompt, 10000);
  
  // Check if premium mode was previously activated
  if (localStorage.getItem('premiumMode') === 'active') {
    document.body.classList.add('premium-active');
    premiumBtn.innerHTML = '<i class="fas fa-check"></i> Premium Activado';
    premiumBtn.disabled = true;
  }
}

// Chat functionality
function openChat() {
  chatModal.style.display = 'flex';
  chatInput.focus();
  showNotification('Asistente OWE activado. ¿En qué puedo ayudarte?');
}

function closeChatModal() {
  chatModal.style.display = 'none';
  showNotification('Asistente OWE cerrado. ¡Vuelve cuando quieras!');
}

function sendUserMessage() {
  const message = chatInput.value.trim();
  if (message === '') return;
  
  addMessage(message, 'user');
  chatInput.value = '';
  
  // Show typing indicator
  const typingIndicator = document.createElement('div');
  typingIndicator.className = 'msg typing';
  typingIndicator.innerHTML = `
    OWE está escribiendo
    <div class="typing-dots">
      <span></span>
      <span></span>
      <span></span>
    </div>
  `;
  chatMessages.appendChild(typingIndicator);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  
  // Simulate response delay
  setTimeout(() => {
    chatMessages.removeChild(typingIndicator);
    const response = getResponse(message);
    addMessage(response, 'bot');
  }, 1500);
}

function addMessage(text, sender) {
  const messageElement = document.createElement('div');
  messageElement.className = `msg ${sender}`;
  messageElement.textContent = text;
  chatMessages.appendChild(messageElement);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function getResponse(userMessage) {
  const message = userMessage.toLowerCase();
  
  // Check for keywords in the knowledge base
  for (const [key, responses] of Object.entries(knowledgeBase)) {
    if (message.includes(key)) {
      return responses[Math.floor(Math.random() * responses.length)];
    }
  }
  
  // Check for specific keywords not in the knowledge base
  if (message.includes('hola') || message.includes('buenas') || message.includes('saludos')) {
    return knowledgeBase.saludos[Math.floor(Math.random() * knowledgeBase.saludos.length)];
  }
  
  if (message.includes('precio') || message.includes('cuesta') || message.includes('costo')) {
    return knowledgeBase.precios[Math.floor(Math.random() * knowledgeBase.precios.length)];
  }
  
  if (message.includes('descuento') || message.includes('oferta') || message.includes('promoción')) {
    return knowledgeBase.descuento[Math.floor(Math.random() * knowledgeBase.descuento.length)];
  }
  
  if (message.includes('contacto') || message.includes('teléfono') || message.includes('número')) {
    return knowledgeBase.redes[Math.floor(Math.random() * knowledgeBase.redes.length)];
  }
  
  if (message.includes('gracias') || message.includes('adiós') || message.includes('chao')) {
    return knowledgeBase.despedida[Math.floor(Math.random() * knowledgeBase.despedida.length)];
  }
  
  // Default response
  return knowledgeBase.default[Math.floor(Math.random() * knowledgeBase.default.length)];
}

function loadQuickReplies() {
  quickReplies.forEach(reply => {
    const button = document.createElement('button');
    button.textContent = reply;
    button.addEventListener('click', () => {
      chatInput.value = reply;
      sendUserMessage();
    });
    quickRepliesContainer.appendChild(button);
  });
}

// App prompt functionality
function showAppPrompt() {
  if (localStorage.getItem('appPromptShown') !== 'true') {
    appPrompt.style.display = 'block';
    localStorage.setItem('appPromptShown', 'true');
  }
}

function closeAppPromptModal() {
  appPrompt.style.display = 'none';
}

// Notification functionality
function showNotification(message) {
  notificationText.textContent = message;
  notification.style.display = 'block';
  
  // Auto hide after 5 seconds
  setTimeout(() => {
    if (notification.style.display === 'block') {
      closeNotificationModal();
    }
  }, 5000);
}

function closeNotificationModal() {
  notification.style.display = 'none';
}

// Premium mode functionality
function togglePremiumMode() {
  if (document.body.classList.contains('premium-active')) {
    document.body.classList.remove('premium-active');
    localStorage.setItem('premiumMode', 'inactive');
    premiumBtn.innerHTML = '<i class="fas fa-gem"></i> Activar Premium Deluxe';
    premiumBtn.disabled = false;
    showNotification('Modo Premium desactivado');
  } else {
    document.body.classList.add('premium-active');
    localStorage.setItem('premiumMode', 'active');
    premiumBtn.innerHTML = '<i class="fas fa-check"></i> Premium Activado';
    premiumBtn.disabled = true;
    showNotification('¡Modo Premium Deluxe activado! Disfruta de la experiencia mejorada.');
    
    // Add premium effects
    addPremiumEffects();
  }
}

function addPremiumEffects() {
  // Add confetti effect
  const confettiCount = 100;
  const confettiContainer = document.createElement('div');
  confettiContainer.style.position = 'fixed';
  confettiContainer.style.top = '0';
  confettiContainer.style.left = '0';
  confettiContainer.style.width = '100%';
  confettiContainer.style.height = '100%';
  confettiContainer.style.pointerEvents = 'none';
  confettiContainer.style.zIndex = '1002';
  document.body.appendChild(confettiContainer);
  
  for (let i = 0; i < confettiCount; i++) {
    const confetti = document.createElement('div');
    confetti.style.position = 'absolute';
    confetti.style.width = '10px';
    confetti.style.height = '10px';
    confetti.style.backgroundColor = getRandomColor();
    confetti.style.borderRadius = '50%';
    confetti.style.top = '0';
    confetti.style.left = Math.random() * 100 + 'vw';
    confetti.style.animation = `fall ${Math.random() * 3 + 2}s linear forwards`;
    confettiContainer.appendChild(confetti);
  }
  
  // Remove confetti after animation
  setTimeout(() => {
    document.body.removeChild(confettiContainer);
  }, 5000);
}

function getRandomColor() {
  const colors = ['#FFD700', '#FFEC8B', '#FFA500', '#FF8C00', '#FF4500'];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Add fall animation for confetti
const style = document.createElement('style');
style.textContent = `
  @keyframes fall {
    to {
      transform: translateY(100vh) rotate(360deg);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// Close modal when clicking outside
window.addEventListener('click', function(event) {
  if (event.target === chatModal) {
    closeChatModal();
  }
});