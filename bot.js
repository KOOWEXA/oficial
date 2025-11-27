// bot.js - Chatbot mejorado para KOOWEXA

class KOOWEXAChatbot {
    constructor() {
        this.isOpen = false;
        this.chatHistory = [];
        this.isLoading = false;
        this.DEEPSEEK_API_KEY = 'sk-85cca7e8b98941c58094c08210dfbf7b';
        this.DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
        this.init();
    }

    init() {
        this.createChatbotHTML();
        this.bindEvents();
    }

    createChatbotHTML() {
        const chatbotHTML = `
            <div class="chatbot-widget" id="koowexaChatbot">
                <div class="chatbot-toggle" id="chatbotToggle">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="chatbot-container" id="chatbotContainer">
                    <div class="chatbot-header">
                        <h3>Asistente KOOWEXA</h3>
                        <button class="chatbot-close" id="chatbotClose">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="chatbot-messages" id="chatbotMessages">
                        <div class="message bot-message">
                            <div class="message-content">
                                ¡Hola! Soy tu asistente de KOOWEXA. ¿En qué puedo ayudarte hoy? Puedo informarte sobre nuestros servicios, precios, planes y todo lo relacionado con nuestra plataforma digital para emprendedores cubanos.
                            </div>
                            <div class="message-time">${this.getCurrentTime()}</div>
                        </div>
                    </div>
                    <div class="chatbot-input-container">
                        <div class="quick-questions" id="quickQuestions">
                            <button class="quick-question" data-question="¿Qué servicios ofrece KOOWEXA?">Servicios</button>
                            <button class="quick-question" data-question="¿Cuáles son los precios de los planes?">Precios</button>
                            <button class="quick-question" data-question="¿Qué es KOOPAGES?">KOOPAGES</button>
                            <button class="quick-question" data-question="¿Cómo puedo contactarlos?">Contacto</button>
                        </div>
                        <div class="input-group">
                            <input type="text" 
                                   id="chatbotInput" 
                                   placeholder="Escribe..." 
                                   maxlength="500">
                            <button id="chatbotSend">
                                <i class="fas fa-paper-plane"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', chatbotHTML);
        this.addChatbotStyles();
    }

    addChatbotStyles() {
        const styles = `
            <style>
            .chatbot-widget {
                position: fixed;
                bottom: 100px;
                right: 30px;
                z-index: 10000;
                font-family: 'Inter', sans-serif;
            }

            .chatbot-toggle {
                width: 60px;
                height: 60px;
                background: var(--gradient-secondary);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 1.5rem;
                cursor: pointer;
                box-shadow: var(--shadow);
                transition: all 0.3s ease;
                border: 2px solid white;
            }

            .chatbot-toggle:hover {
                transform: scale(1.1);
                box-shadow: 0 8px 25px rgba(37, 99, 235, 0.4);
            }

            .chatbot-container {
                position: absolute;
                bottom: 80px;
                right: 0;
                width: 350px;
                height: 500px;
                background: white;
                border-radius: 16px;
                box-shadow: var(--shadow);
                display: none;
                flex-direction: column;
                border: 1px solid #e2e8f0;
                overflow: hidden;
            }

            .chatbot-container.active {
                display: flex;
                animation: slideUp 0.3s ease;
            }

            .chatbot-header {
                background: var(--gradient-primary);
                color: white;
                padding: 1rem 1.5rem;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .chatbot-header h3 {
                margin: 0;
                font-size: 1.1rem;
                font-weight: 700;
            }

            .chatbot-close {
                background: none;
                border: none;
                color: white;
                font-size: 1.2rem;
                cursor: pointer;
                padding: 5px;
                border-radius: 50%;
                transition: background 0.3s ease;
            }

            .chatbot-close:hover {
                background: rgba(255, 255, 255, 0.2);
            }

            .chatbot-messages {
                flex: 1;
                padding: 1rem;
                overflow-y: auto;
                background: #f8fafc;
                display: flex;
                flex-direction: column;
                gap: 1rem;
            }

            .message {
                max-width: 85%;
                padding: 0.75rem 1rem;
                border-radius: 12px;
                line-height: 1.4;
                position: relative;
            }

            .user-message {
                align-self: flex-end;
                background: var(--accent-blue);
                color: white;
                border-bottom-right-radius: 4px;
            }

            .bot-message {
                align-self: flex-start;
                background: white;
                color: #334155;
                border: 1px solid #e2e8f0;
                border-bottom-left-radius: 4px;
            }

            .message-content {
                margin-bottom: 0.25rem;
            }

            .message-time {
                font-size: 0.7rem;
                opacity: 0.7;
                text-align: right;
            }

            .chatbot-input-container {
                padding: 1rem;
                border-top: 1px solid #e2e8f0;
                background: white;
            }

            .quick-questions {
                display: flex;
                flex-wrap: wrap;
                gap: 0.5rem;
                margin-bottom: 1rem;
            }

            .quick-question {
                background: rgba(37, 99, 235, 0.1);
                color: var(--accent-blue);
                border: 1px solid rgba(37, 99, 235, 0.2);
                border-radius: 20px;
                padding: 0.5rem 1rem;
                font-size: 0.8rem;
                cursor: pointer;
                transition: all 0.3s ease;
                font-weight: 500;
            }

            .quick-question:hover {
                background: var(--accent-blue);
                color: white;
                transform: translateY(-2px);
            }

            .input-group {
                display: flex;
                gap: 0.5rem;
            }

            #chatbotInput {
                flex: 1;
                padding: 0.75rem 1rem;
                border: 1px solid #e2e8f0;
                border-radius: 25px;
                outline: none;
                font-size: 0.9rem;
                transition: border-color 0.3s ease;
            }

            #chatbotInput:focus {
                border-color: var(--accent-blue);
            }

            #chatbotSend {
                background: var(--accent-blue);
                color: white;
                border: none;
                border-radius: 50%;
                width: 45px;
                height: 45px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.3s ease;
            }

            #chatbotSend:hover {
                background: var(--secondary-blue);
                transform: scale(1.05);
            }

            #chatbotSend:disabled {
                opacity: 0.6;
                cursor: not-allowed;
                transform: none;
            }

            .loading-dots {
                display: inline-flex;
                gap: 4px;
            }

            .loading-dots div {
                width: 6px;
                height: 6px;
                border-radius: 50%;
                background: var(--accent-blue);
                animation: bounce 1.4s infinite ease-in-out both;
            }

            .loading-dots div:nth-child(1) { animation-delay: -0.32s; }
            .loading-dots div:nth-child(2) { animation-delay: -0.16s; }

            @keyframes bounce {
                0%, 80%, 100% { transform: scale(0); }
                40% { transform: scale(1); }
            }

            @keyframes slideUp {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            @media (max-width: 480px) {
                .chatbot-widget {
                    bottom: 80px;
                    right: 20px;
                }

                .chatbot-container {
                    width: 300px;
                    height: 450px;
                }

                .chatbot-toggle {
                    width: 55px;
                    height: 55px;
                    font-size: 1.3rem;
                }
            }
            </style>
        `;

        document.head.insertAdjacentHTML('beforeend', styles);
    }

    bindEvents() {
        const toggle = document.getElementById('chatbotToggle');
        const close = document.getElementById('chatbotClose');
        const send = document.getElementById('chatbotSend');
        const input = document.getElementById('chatbotInput');
        const quickQuestions = document.getElementById('quickQuestions');

        toggle.addEventListener('click', () => this.toggleChat());
        close.addEventListener('click', () => this.closeChat());
        send.addEventListener('click', () => this.sendMessage());
        
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !this.isLoading) {
                this.sendMessage();
            }
        });

        quickQuestions.addEventListener('click', (e) => {
            if (e.target.classList.contains('quick-question')) {
                const question = e.target.getAttribute('data-question');
                input.value = question;
                this.sendMessage();
            }
        });

        // Cerrar chatbot al hacer clic fuera
        document.addEventListener('click', (e) => {
            const chatbot = document.getElementById('koowexaChatbot');
            if (this.isOpen && !chatbot.contains(e.target)) {
                this.closeChat();
            }
        });
    }

    toggleChat() {
        const container = document.getElementById('chatbotContainer');
        this.isOpen = !this.isOpen;
        
        if (this.isOpen) {
            container.classList.add('active');
            document.getElementById('chatbotInput').focus();
        } else {
            container.classList.remove('active');
        }
    }

    closeChat() {
        const container = document.getElementById('chatbotContainer');
        container.classList.remove('active');
        this.isOpen = false;
    }

    async sendMessage() {
        const input = document.getElementById('chatbotInput');
        const message = input.value.trim();

        if (!message || this.isLoading) return;

        // Agregar mensaje del usuario
        this.addMessage(message, 'user');
        input.value = '';
        
        // Mostrar estado de carga
        this.showLoading();

        try {
            const response = await this.getAIResponse(message);
            this.addMessage(response, 'bot');
        } catch (error) {
            console.error('Error:', error);
            this.addMessage('Lo siento, ha ocurrido un error. Por favor, intenta nuevamente o contacta a koowexa@gmail.com directamente.', 'bot');
        } finally {
            this.hideLoading();
        }
    }

    async getAIResponse(userMessage) {
        const PLATFORM_CONTEXT = `
Eres un asistente especializado en KOOWEXA y KOOPAGES. Aquí tienes información detallada:

**KOOWEXA - Plataforma Digital para Emprendedores Cubanos**

**¿Qué es KOOWEXA?**
KOOWEXA es una plataforma digital profesional diseñada específicamente para negocios cubanos y emprendedores que desean establecer su presencia en internet con herramientas optimizadas para el contexto cubano.

**Servicios Principales:**
1. **Herramientas Digitales Optimizadas**: Desarrollamos tiendas online y servicios simplificados que funcionan eficientemente incluso con conexiones lentas.
2. **Hospedaje Web Especializado**: Servidores disponibles para tu negocio online en KOOPAGES, garantizando disponibilidad y visión.
3. **Soluciones Personalizadas**: Adaptamos cada proyecto a las necesidades específicas de tu negocio.

**Ventajas Competitivas:**
- Optimización para Cuba: Soluciones diseñadas considerando las particularidades de la conectividad en Cuba.
- Precios Accesibles: Servicios de calidad a precios adaptados a la realidad económica cubana.
- Soporte Local: Entendemos las necesidades específicas de los negocios cubanos.

**Planes y Precios:**
- **Tienda Online**: $2000 CUP/mes
  - Nombre y logo de su negocio
  - Información breve del negocio
  - Interfaz optimizada y simplificada
  - Catálogo con hasta 50 productos (MAX)
  - Imágenes, títulos, descripciones, precios
  - Actualizaciones de contenido semanales

- **Servicio Local**: $2000 CUP/mes
  - Nombre y logo de su negocio
  - Información para la presentación y objetivos
  - Plataforma con funciones optimizadas
  - Listado de ofertas y precios
  - Función para pedir reservación o cita
  - Actualizaciones de contenido semanales

**Inversión y Tiempos:**
- Desarrollo de herramienta digital: $2000 CUP con plazo de entrega 48 horas.
- Para nuevos clientes: 3 meses de disponibilidad de su negocio en la web.
- Mantenimiento mensual posterior: Entre 600 y 1000 CUP según complejidad.

**Garantía y Condiciones:**
Período de prueba de 1 mes con posibilidad de reembolso del 50% si decides no continuar con el servicio.

**KOOPAGES - Plataforma de Hospedaje Web**

**¿Qué es KOOPAGES?**
KOOPAGES es la solución de hospedaje web de KOOWEXA, diseñada específicamente para el mercado cubano, ofreciendo servidores optimizados y accesibles.

**Características:**
- Servidores optimizados para conexiones en Cuba
- Precios en CUP accesibles
- Soporte técnico especializado
- Integración con herramientas KOOWEXA

**Contacto:**
- Email: koowexa@gmail.com
- Redes sociales: Twitter, YouTube, Facebook
- Aplicación disponible para descarga

Responde siempre de manera amable, profesional y detallada, enfocándote en las necesidades específicas del usuario cubano. Proporciona información clara sobre precios, servicios y beneficios.
`;

        const response = await fetch(this.DEEPSEEK_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [
                    {
                        role: 'system',
                        content: PLATFORM_CONTEXT
                    },
                    ...this.chatHistory,
                    {
                        role: 'user',
                        content: userMessage
                    }
                ],
                max_tokens: 1000,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        const aiResponse = data.choices[0].message.content;

        // Actualizar historial de chat
        this.chatHistory.push(
            { role: 'user', content: userMessage },
            { role: 'assistant', content: aiResponse }
        );

        // Mantener solo los últimos 10 mensajes para evitar tokens excesivos
        if (this.chatHistory.length > 10) {
            this.chatHistory = this.chatHistory.slice(-10);
        }

        return aiResponse;
    }

    addMessage(content, sender) {
        const messagesContainer = document.getElementById('chatbotMessages');
        const messageHTML = `
            <div class="message ${sender}-message">
                <div class="message-content">${this.formatMessage(content)}</div>
                <div class="message-time">${this.getCurrentTime()}</div>
            </div>
        `;

        messagesContainer.insertAdjacentHTML('beforeend', messageHTML);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    formatMessage(content) {
        // Formatear mensajes con saltos de línea y listas
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br>')
            .replace(/- (.*?)(?=\n|$)/g, '• $1<br>');
    }

    showLoading() {
        this.isLoading = true;
        const messagesContainer = document.getElementById('chatbotMessages');
        const sendButton = document.getElementById('chatbotSend');
        
        sendButton.disabled = true;
        
        const loadingHTML = `
            <div class="message bot-message">
                <div class="message-content">
                    <div class="loading-dots">
                        <div></div>
                        <div></div>
                        <div></div>
                    </div>
                </div>
            </div>
        `;

        messagesContainer.insertAdjacentHTML('beforeend', loadingHTML);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    hideLoading() {
        this.isLoading = false;
        const messagesContainer = document.getElementById('chatbotMessages');
        const sendButton = document.getElementById('chatbotSend');
        
        sendButton.disabled = false;
        
        // Remover el mensaje de carga
        const loadingMessage = messagesContainer.lastElementChild;
        if (loadingMessage && loadingMessage.querySelector('.loading-dots')) {
            loadingMessage.remove();
        }
    }

    getCurrentTime() {
        const now = new Date();
        return now.toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }
}

// Inicializar el chatbot cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    new KOOWEXAChatbot();
});