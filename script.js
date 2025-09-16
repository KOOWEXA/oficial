const knowledgeBase = {
  "saludos": [
    "¡Hola! Soy OWE, tu asistente personal de KOOWEXA. ¿En qué puedo ayudarte hoy?",
    "¡Bienvenido! Estoy aquí para guiarte en tu primer paso hacia tu presencia digital."
  ],
  "servicio": [
    "Sí, puedes obtener una herramienta completa para tu negocio: tienda o servicios, con subdominio incluido durante 3 meses, sin costo adicional. Solo necesitas iniciar tu presencia virtual."
  ],
  "buscar": [
    "Claro, puedes encontrar KOOWEXA fácilmente en Google buscando 'KOOWEXA - OFICIAL'."
  ],
  "precios": [
    "La herramienta tiene un costo único de $2000 CUP, pero ¡espera! Durante los primeros 3 meses, el hospedaje es totalmente (GRATIS). Es decir: tú pagas solo la configuración inicial, Una inversión mínima por un retorno máximo."
  ],
  "descuento": [
    "Claramente, si es primera vez que solicitas el servicio obtienes un bono de descuento."
  ],
  "redes": [
    "KOOWEXA está presente en WhatsApp, Telegram, Facebook y Twitter y otros mas."
  ],
  "koowexa": [
    "KOOWEXA es una iniciativa cubana diseñada para que emprendedores y pequeños negocios tengan una presencia digital simple y SIN complicaciones. Ofrecemos herramientas simples, rápidas y optimizadas para conexiones lentas perfectas para Cuba. Ya sea una tienda online o un catálogo de servicios, lo hacemos accesible, económico y efectivo."
  ],
  "despedida": [
    "Hasta luego"
  ],
  "default": [
    "¿Quieres saber cómo obtener tu herramienta sin costo? Escribe por WhatsApp al número: +53 50369270 para que sepas cómo será el plan gratis."
  ]
};

function findBestResponse(userMessage) {
  userMessage = userMessage.toLowerCase();
  
  if (userMessage.includes('hola') || userMessage.includes('hi') || userMessage.includes('buenas')) {
    return getRandomResponse(knowledgeBase.saludos);
  } else if (userMessage.includes('servicio') || userMessage.includes('qué ofrecen') || userMessage.includes('qué hacen') || userMessage.includes('qué es') || userMessage.includes('ofrecen')) {
    return getRandomResponse(knowledgeBase.servicio);
  } else if (userMessage.includes('buscar') || userMessage.includes('google') || userMessage.includes('encontrar') || userMessage.includes('dónde está')) {
    return getRandomResponse(knowledgeBase.buscar);
  } else if (userMessage.includes('precio') || userMessage.includes('cuesta') || userMessage.includes('coste') || userMessage.includes('cuánto') || userMessage.includes('costo')) {
    return getRandomResponse(knowledgeBase.precios);
  } else if (userMessage.includes('descuento') || userMessage.includes('oferta') || userMessage.includes('barato') || userMessage.includes('promo')) {
    return getRandomResponse(knowledgeBase.descuento);
  } else if (userMessage.includes('redes') || userMessage.includes('facebook') || userMessage.includes('telegram') || userMessage.includes('instagram') || userMessage.includes('twitter')) {
    return getRandomResponse(knowledgeBase.redes);
  } else if (userMessage.includes('koowexa') || userMessage.includes('qué es') || userMessage.includes('quienes son') || userMessage.includes('de qué trata')) {
    return getRandomResponse(knowledgeBase.koowexa);
  } else if (userMessage.includes('adiós') || userMessage.includes('chao') || userMessage.includes('hasta luego') || userMessage.includes('gracias') || userMessage.includes('thank you')) {
    return getRandomResponse(knowledgeBase.despedida);
  } else {
    return getRandomResponse(knowledgeBase.default);
  }
}

function getRandomResponse(responses) {
  return responses[Math.floor(Math.random() * responses.length)];
}

const introBanner = document.getElementById('introBanner');
const helpButton = document.getElementById('helpButton');
const chatModal = document.getElementById('chatModal');
const closeChat = document.getElementById('closeChat');
const chatMessages = document.getElementById('chatMessages');
const quickReplies = document.getElementById('quickReplies');

setTimeout(() => {
  introBanner.classList.add('hiding');
  setTimeout(() => {
    introBanner.style.display = 'none';
  }, 800);
}, 5000);

helpButton.addEventListener('click', () => {
  chatModal.style.display = 'flex';
  setTimeout(() => {
    chatModal.classList.add('active');
  }, 10);
});

closeChat.addEventListener('click', () => {
  chatModal.classList.remove('active');
  setTimeout(() => {
    chatModal.style.display = 'none';
  }, 300);
});

chatModal.addEventListener('click', (e) => {
  if (e.target === chatModal) {
    chatModal.classList.remove('active');
    setTimeout(() => {
      chatModal.style.display = 'none';
    }, 300);
  }
});

quickReplies.innerHTML = `
  <button data-question="¿Puedo obtener un plan gratuito?">Plan Gratis</button>
  <button data-question="¿Puedo buscar esta página en Google?">Buscar en Google</button>
  <button data-question="¿Cuánto cuesta tener esta herramienta?">Costo</button>
  <button data-question="¿Puedo obtener un descuento?">Descuento</button>
  <button data-question="¿En qué redes sociales se encuentra KOOWEXA?">Redes Sociales</button>
  <button data-question="¿Qué objetivos tiene y de qué trata KOOWEXA?">Sobre KOOWEXA</button>
`;

quickReplies.addEventListener('click', (e) => {
  if (e.target.tagName === 'BUTTON') {
    const question = e.target.getAttribute('data-question');
    addMessage(question, 'user');
    setTimeout(() => {
      respondToMessage(question);
    }, 600);
  }
});

function addMessage(text, sender) {
  const messageElement = document.createElement('div');
  messageElement.classList.add('message', sender);
  messageElement.textContent = text;
  chatMessages.appendChild(messageElement);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showTypingIndicator() {
  const typingElement = document.createElement('div');
  typingElement.classList.add('typing-indicator');
  typingElement.id = 'typingIndicator';
  typingElement.innerHTML = '<span></span><span></span><span></span>';
  chatMessages.appendChild(typingElement);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function hideTypingIndicator() {
  const typingElement = document.getElementById('typingIndicator');
  if (typingElement) {
    typingElement.remove();
  }
}

function respondToMessage(userMessage) {
  showTypingIndicator();
  setTimeout(() => {
    hideTypingIndicator();
    const response = findBestResponse(userMessage);
    addMessage(response, 'bot');
  }, 1200);
}