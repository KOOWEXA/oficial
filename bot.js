// bot.js - Chatbot optimizado para KOOWEXA

class KOOWEXAChatbot {
    constructor() {
        this.isOpen = false;
        this.chatHistory = [];
        this.isLoading = false;
        this.API_TIMEOUT = 15000; // 15 segundos
        
        // Configuración API (en producción, esto debería venir de un backend)
        this.API_CONFIG = {
            url: 'https://api.deepseek.com/v1/chat/completions',
            // La API key debería manejarse desde el backend en producción
            key: 'sk-a07e2e1476bd4378a6120c5a3ee97fc4'
        };
        
        this.init();
    }

    init() {
        this.loadChatHistory();
        this.createChatbotHTML();
        this.bindEvents();
        this.setupErrorHandling();
    }

    setupErrorHandling() {
        window.addEventListener('error', (e) => {
            console.error('Global error:', e.error);
        });
        
        window.addEventListener('unhandledrejection', (e) => {
            console.error('Unhandled promise rejection:', e.reason);
        });
    }

    createChatbotHTML() {
        // Verificar si ya existe para evitar duplicados
        if (document.getElementById('koowexaChatbot')) {
            return;
        }

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
                                   placeholder="Escribe tu pregunta..." 
                                   maxlength="500"
                                   aria-label="Escribe tu mensaje para el asistente">
                            <button id="chatbotSend" aria-label="Enviar mensaje">
                                <i class="fas fa-paper-plane"></i>
                            </button>
                        </div>
                        <div class="char-counter" id="charCounter">0/500</div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', chatbotHTML);
    }

    bindEvents() {
        const toggle = document.getElementById('chatbotToggle');
        const close = document.getElementById('chatbotClose');
        const send = document.getElementById('chatbotSend');
        const input = document.getElementById('chatbotInput');
        const quickQuestions = document.getElementById('quickQuestions');

        // Eventos principales
        toggle.addEventListener('click', () => this.toggleChat());
        close.addEventListener('click', () => this.closeChat());
        send.addEventListener('click', () => this.sendMessage());
        
        // Eventos de entrada
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !this.isLoading) {
                this.sendMessage();
            }
        });

        input.addEventListener('input', (e) => {
            this.updateCharCounter(e.target.value.length);
        });

        // Preguntas rápidas
        quickQuestions.addEventListener('click', (e) => {
            if (e.target.classList.contains('quick-question')) {
                const question = e.target.getAttribute('data-question');
                input.value = question;
                this.updateCharCounter(question.length);
                this.sendMessage();
            }
        });

        // Cerrar chatbot al hacer clic fuera
        document.addEventListener('click', (e) => {
            const chatbot = document.getElementById('koowexaChatbot');
            if (this.isOpen && chatbot && !chatbot.contains(e.target)) {
                this.closeChat();
            }
        });

        // Limpiar recursos cuando se cierra la página
        window.addEventListener('beforeunload', () => {
            this.cleanup();
        });
    }

    updateCharCounter(length) {
        const counter = document.getElementById('charCounter');
        if (counter) {
            counter.textContent = `${length}/500`;
            counter.style.color = length > 450 ? '#e53e3e' : '#718096';
        }
    }

    async sendMessage() {
        const input = document.getElementById('chatbotInput');
        const message = this.sanitizeInput(input.value.trim());

        if (!message || this.isLoading) return;

        // Validación adicional
        if (message.length < 2) {
            this.showTempMessage('Por favor, escribe un mensaje más largo.', 'warning');
            return;
        }

        if (message.length > 500) {
            this.showTempMessage('El mensaje es demasiado largo. Máximo 500 caracteres.', 'warning');
            return;
        }

        // Agregar mensaje del usuario
        this.addMessage(message, 'user');
        input.value = '';
        this.updateCharCounter(0);
        
        // Mostrar estado de carga
        this.showLoading();

        try {
            const response = await this.getAIResponse(message);
            this.addMessage(response, 'bot');
        } catch (error) {
            this.handleError(error);
        } finally {
            this.hideLoading();
        }
    }

    sanitizeInput(input) {
        return input
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+=/gi, '')
            .substring(0, 500)
            .trim();
    }

    async getAIResponse(userMessage) {
        const PLATFORM_CONTEXT = this.getPlatformContext();

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.API_TIMEOUT);

        try {
            const response = await fetch(this.API_CONFIG.url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.API_CONFIG.key}`
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
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`API error: ${response.status} - ${response.statusText}`);
            }

            const data = await response.json();
            
            if (!data.choices || !data.choices[0]) {
                throw new Error('Respuesta de API inválida');
            }

            const aiResponse = data.choices[0].message.content;

            // Actualizar historial de chat
            this.updateChatHistory(userMessage, aiResponse);

            return aiResponse;

        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }

    getPlatformContext() {
        return `Eres un asistente especializado en KOOWEXA y KOOPAGES. Responde de manera amable, profesional y detallada, enfocándote en las necesidades específicas del usuario cubano.

**INFORMACIÓN ACTUALIZADA DE KOOWEXA:**

**¿Qué es KOOWEXA?**
KOOWEXA es una plataforma digital profesional diseñada específicamente para negocios cubanos y emprendedores que desean establecer su presencia en internet con herramientas optimizadas para el contexto cubano.

**Servicios Principales:**
• Herramientas Digitales Optimizadas: Tiendas online y servicios simplificados que funcionan eficientemente incluso con conexiones lentas
• Hospedaje Web Especializado: Servidores disponibles para tu negocio online en KOOPAGES
• Soluciones Personalizadas: Adaptamos cada proyecto a las necesidades específicas de tu negocio

**Ventajas Competitivas:**
• Optimización para Cuba: Soluciones diseñadas considerando las particularidades de la conectividad en Cuba
• Precios Accesibles: Servicios de calidad a precios adaptados a la realidad económica cubana
• Soporte Local: Entendemos las necesidades específicas de los negocios cubanos

**PLANES Y PRECIOS ACTUALES:**

**Tienda Online - $2000 CUP/mes**
• Nombre y logo de su negocio
• Información breve del negocio
• Interfaz optimizada y simplificada
• Catálogo con hasta 50 productos (MAX)
• Imágenes, títulos, descripciones, precios
• Actualizaciones de contenido semanales

**Servicio Local - $2000 CUP/mes**
• Nombre y logo de su negocio
• Información para la presentación y objetivos
• Plataforma con funciones optimizadas
• Listado de ofertas y precios
• Función para pedir reservación o cita
• Actualizaciones de contenido semanales

**INVERSIÓN INICIAL:**
• Desarrollo de herramienta digital: $2000 CUP
• Plazo de entrega: 48 horas
• Para nuevos clientes: 3 meses de disponibilidad incluidos

**MANTENIMIENTO MENSUAL:**
• Posterior a los 3 meses: Entre 600 y 1000 CUP según complejidad

**GARANTÍA:**
• Período de prueba de 1 mes
• Posibilidad de reembolso del 50% si decides no continuar

**KOOPAGES - Hospedaje Web:**
• Servidores optimizados para conexiones en Cuba
• Precios en CUP accesibles
• Soporte técnico especializado
• Integración con herramientas KOOWEXA

**CONTACTO:**
• Email: koowexa@gmail.com
• Redes sociales: Twitter, YouTube, Facebook
• Aplicación disponible para descarga

Proporciona información clara sobre precios, servicios y beneficios. Sé específico y ayuda al usuario a tomar la mejor decisión para su negocio.`;
    }

    updateChatHistory(userMessage, aiResponse) {
        this.chatHistory.push(
            { role: 'user', content: userMessage },
            { role: 'assistant', content: aiResponse }
        );

        // Mantener solo los últimos 8 mensajes (4 intercambios)
        if (this.chatHistory.length > 8) {
            this.chatHistory = this.chatHistory.slice(-8);
        }

        // Guardar en localStorage
        this.saveChatHistory();
    }

    addMessage(content, sender) {
        const messagesContainer = document.getElementById('chatbotMessages');
        if (!messagesContainer) return;

        const messageHTML = `
            <div class="message ${sender}-message" aria-live="${sender === 'bot' ? 'polite' : 'off'}">
                <div class="message-content">${this.formatMessage(content)}</div>
                <div class="message-time">${this.getCurrentTime()}</div>
            </div>
        `;

        messagesContainer.insertAdjacentHTML('beforeend', messageHTML);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    formatMessage(content) {
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\* (.*?)(?=\n|$)/g, '• $1')
            .replace(/(\d+\.) (.*?)(?=\n|$)/g, '$1 $2')
            .replace(/\n{2,}/g, '</p><p>')
            .replace(/\n/g, '<br>')
            .replace(/^(.*)$/gm, '<p>$1</p>')
            .replace(/<p><\/p>/g, '');
    }

    showLoading() {
        this.isLoading = true;
        const messagesContainer = document.getElementById('chatbotMessages');
        const sendButton = document.getElementById('chatbotSend');
        
        if (sendButton) sendButton.disabled = true;
        
        const loadingHTML = `
            <div class="message bot-message">
                <div class="message-content">
                    <div class="loading-dots" aria-label="El asistente está escribiendo">
                        <div></div>
                        <div></div>
                        <div></div>
                    </div>
                </div>
            </div>
        `;

        if (messagesContainer) {
            messagesContainer.insertAdjacentHTML('beforeend', loadingHTML);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }

    hideLoading() {
        this.isLoading = false;
        const messagesContainer = document.getElementById('chatbotMessages');
        const sendButton = document.getElementById('chatbotSend');
        
        if (sendButton) sendButton.disabled = false;
        
        // Remover el mensaje de carga
        if (messagesContainer) {
            const loadingMessage = messagesContainer.lastElementChild;
            if (loadingMessage && loadingMessage.querySelector('.loading-dots')) {
                loadingMessage.remove();
            }
        }
    }

    handleError(error) {
        console.error('Chatbot Error:', error);

        let errorMessage = 'Lo siento, ha ocurrido un error. ';

        if (error.name === 'AbortError') {
            errorMessage += 'La solicitud tardó demasiado tiempo. Por favor, intenta nuevamente.';
        } else if (error.message.includes('API error')) {
            errorMessage += 'El servicio está temporalmente no disponible. Intenta más tarde.';
        } else if (error.message.includes('network') || !navigator.onLine) {
            errorMessage += 'Problema de conexión a internet. Verifica tu conexión.';
        } else {
            errorMessage += 'Por favor, contacta a koowexa@gmail.com para asistencia directa.';
        }

        this.addMessage(errorMessage, 'bot');
    }

    showTempMessage(message, type = 'info') {
        const tempMessage = document.createElement('div');
        tempMessage.className = `temp-message temp-${type}`;
        tempMessage.textContent = message;
        tempMessage.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            background: ${type === 'warning' ? '#fed7d7' : '#bee3f8'};
            color: ${type === 'warning' ? '#c53030' : '#2b6cb0'};
            border-radius: 8px;
            z-index: 10001;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            border: 1px solid ${type === 'warning' ? '#feb2b2' : '#90cdf4'};
        `;

        document.body.appendChild(tempMessage);

        setTimeout(() => {
            if (tempMessage.parentNode) {
                tempMessage.parentNode.removeChild(tempMessage);
            }
        }, 3000);
    }

    toggleChat() {
        const container = document.getElementById('chatbotContainer');
        if (!container) return;
        
        this.isOpen = !this.isOpen;
        
        if (this.isOpen) {
            container.classList.add('active');
            const input = document.getElementById('chatbotInput');
            if (input) input.focus();
        } else {
            container.classList.remove('active');
        }
    }

    closeChat() {
        const container = document.getElementById('chatbotContainer');
        if (container) {
            container.classList.remove('active');
        }
        this.isOpen = false;
    }

    loadChatHistory() {
        try {
            const saved = localStorage.getItem('koowexa_chat_history');
            if (saved) {
                this.chatHistory = JSON.parse(saved);
            }
        } catch (error) {
            console.warn('No se pudo cargar el historial del chat:', error);
            this.chatHistory = [];
        }
    }

    saveChatHistory() {
        try {
            localStorage.setItem('koowexa_chat_history', JSON.stringify(this.chatHistory));
        } catch (error) {
            console.warn('No se pudo guardar el historial del chat:', error);
        }
    }

    getCurrentTime() {
        return new Date().toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }

    cleanup() {
        // Limpiar event listeners y recursos si es necesario
        this.isLoading = false;
    }
}

// CSS optimizado (debería estar en archivo separado en producción)
const chatbotStyles = `
<style>
.chatbot-widget {
    position: fixed;
    bottom: 100px;
    right: 30px;
    z-index: 10000;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.chatbot-toggle {
    width: 60px;
    height: 60px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border: 2px solid white;
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0% { box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4); }
    50% { box-shadow: 0 6px 30px rgba(102, 126, 234, 0.6); }
    100% { box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4); }
}

.chatbot-toggle:hover {
    transform: scale(1.1) rotate(5deg);
    box-shadow: 0 8px 35px rgba(102, 126, 234, 0.5);
}

.chatbot-container {
    position: absolute;
    bottom: 80px;
    right: 0;
    width: 380px;
    height: 520px;
    background: white;
    border-radius: 20px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.15);
    display: none;
    flex-direction: column;
    border: 1px solid #e2e8f0;
    overflow: hidden;
    backdrop-filter: blur(10px);
}

.chatbot-container.active {
    display: flex;
    animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.chatbot-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 1.2rem 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.chatbot-header h3 {
    margin: 0;
    font-size: 1.2rem;
    font-weight: 700;
    letter-spacing: -0.02em;
}

.chatbot-close {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: white;
    font-size: 1.1rem;
    cursor: pointer;
    padding: 8px;
    border-radius: 50%;
    transition: all 0.3s ease;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.chatbot-close:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: rotate(90deg);
}

.chatbot-messages {
    flex: 1;
    padding: 1.2rem;
    overflow-y: auto;
    background: #f8fafc;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    scroll-behavior: smooth;
}

.chatbot-messages::-webkit-scrollbar {
    width: 6px;
}

.chatbot-messages::-webkit-scrollbar-track {
    background: #f1f5f9;
}

.chatbot-messages::-webkit-scrollbar-thumb {
    background: #cbd5e0;
    border-radius: 3px;
}

.chatbot-messages::-webkit-scrollbar-thumb:hover {
    background: #a0aec0;
}

.message {
    max-width: 85%;
    padding: 0.875rem 1rem;
    border-radius: 18px;
    line-height: 1.5;
    position: relative;
    animation: messageSlide 0.3s ease-out;
}

@keyframes messageSlide {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.user-message {
    align-self: flex-end;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-bottom-right-radius: 6px;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.bot-message {
    align-self: flex-start;
    background: white;
    color: #2d3748;
    border: 1px solid #e2e8f0;
    border-bottom-left-radius: 6px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.message-content {
    margin-bottom: 0.375rem;
    word-wrap: break-word;
}

.message-content p {
    margin: 0.5rem 0;
}

.message-content p:first-child {
    margin-top: 0;
}

.message-content p:last-child {
    margin-bottom: 0;
}

.message-time {
    font-size: 0.75rem;
    opacity: 0.7;
    text-align: right;
}

.chatbot-input-container {
    padding: 1.2rem;
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
    background: rgba(102, 126, 234, 0.08);
    color: #667eea;
    border: 1px solid rgba(102, 126, 234, 0.2);
    border-radius: 20px;
    padding: 0.6rem 1rem;
    font-size: 0.8rem;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 500;
    backdrop-filter: blur(10px);
}

.quick-question:hover {
    background: #667eea;
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.input-group {
    display: flex;
    gap: 0.5rem;
    align-items: center;
}

#chatbotInput {
    flex: 1;
    padding: 0.875rem 1.2rem;
    border: 1.5px solid #e2e8f0;
    border-radius: 25px;
    outline: none;
    font-size: 0.9rem;
    transition: all 0.3s ease;
    background: #f8fafc;
}

#chatbotInput:focus {
    border-color: #667eea;
    background: white;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

#chatbotSend {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 50%;
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

#chatbotSend:hover:not(:disabled) {
    transform: scale(1.05) rotate(5deg);
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

#chatbotSend:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
}

.char-counter {
    font-size: 0.75rem;
    color: #718096;
    text-align: right;
    margin-top: 0.5rem;
    font-weight: 500;
}

.loading-dots {
    display: inline-flex;
    gap: 4px;
    padding: 8px 0;
}

.loading-dots div {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #667eea;
    animation: bounce 1.4s infinite ease-in-out both;
}

.loading-dots div:nth-child(1) { animation-delay: -0.32s; }
.loading-dots div:nth-child(2) { animation-delay: -0.16s; }

@keyframes bounce {
    0%, 80%, 100% { 
        transform: scale(0.8);
        opacity: 0.5;
    }
    40% { 
        transform: scale(1);
        opacity: 1;
    }
}

@keyframes slideUp {
    from {
        opacity: 0;
        transform: translateY(20px) scale(0.95);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

@media (max-width: 480px) {
    .chatbot-widget {
        bottom: 80px;
        right: 20px;
    }

    .chatbot-container {
        width: calc(100vw - 40px);
        height: 70vh;
        right: -10px;
    }

    .chatbot-toggle {
        width: 55px;
        height: 55px;
        font-size: 1.3rem;
    }
}

/* Mejoras de accesibilidad */
@media (prefers-reduced-motion: reduce) {
    .chatbot-toggle,
    .chatbot-close,
    .quick-question,
    #chatbotSend,
    .message {
        transition: none;
        animation: none;
    }
}

/* Modo oscuro opcional */
@media (prefers-color-scheme: dark) {
    .chatbot-container {
        background: #2d3748;
        border-color: #4a5568;
    }
    
    .chatbot-messages {
        background: #1a202c;
    }
    
    .bot-message {
        background: #4a5568;
        color: #e2e8f0;
        border-color: #718096;
    }
    
    #chatbotInput {
        background: #4a5568;
        border-color: #718096;
        color: #e2e8f0;
    }
    
    #chatbotInput:focus {
        border-color: #667eea;
        background: #2d3748;
    }
}
</style>
`;

// Inyectar estilos
document.head.insertAdjacentHTML('beforeend', chatbotStyles);

// Inicializar el chatbot cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    // Pequeño delay para asegurar que la página esté completamente cargada
    setTimeout(() => {
        new KOOWEXAChatbot();
    }, 1000);
});

// Exportar para uso modular (si es necesario)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = KOOWEXAChatbot;
}