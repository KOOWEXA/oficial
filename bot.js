// bot.js - Chatbot optimizado para KOOWEXA (Versión Mejorada)

class KOOWEXAChatbot {
    constructor() {
        this.isOpen = false;
        this.chatHistory = [];
        this.isLoading = false;
        this.API_TIMEOUT = 20000; // 20 segundos para conexiones lentas
        this.MAX_HISTORY_TURNS = 5; // Limitar el historial a las últimas 5 interacciones (usuario + bot)
        
        // =================================================================================================
        // !!! ADVERTENCIA DE SEGURIDAD CRÍTICA !!!
        // La clave API NUNCA debe estar en el código JavaScript del lado del cliente.
        // Debe ser manejada por un servidor proxy seguro (backend) para evitar su exposición.
        // Si se usa DeepSeek u otro servicio de IA, la clave expuesta puede ser robada y usada.
        // Por favor, reemplace 'YOUR_SECURE_API_KEY' con una clave de acceso temporal o,
        // preferiblemente, configure un endpoint de backend seguro.
        // =================================================================================================
        this.API_CONFIG = {
            url: 'https://api.deepseek.com/v1/chat/completions',
            key: 'YOUR_SECURE_API_KEY' // Reemplazar con la clave o usar un proxy seguro
        };
        
        this.init();
    }

    init() {
        // Asegurar que el DOM esté listo antes de crear el HTML
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this._initAfterDOM());
        } else {
            this._initAfterDOM();
        }
    }

    _initAfterDOM() {
        this.loadChatHistory();
        this.createChatbotHTML();
        this.bindEvents();
        this.setupErrorHandling();
        this.injectStyles();
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
                        <button class="chatbot-close" id="chatbotClose" aria-label="Cerrar chat">
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
                            <button class="quick-question" data-question="¿Cómo funciona la optimización para Cuba?">Optimización</button>
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

    injectStyles() {
        const chatbotStyles = `
            <style>
            /* Estilos CSS para el Chatbot KOOWEXA */
            @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');
            
            .chatbot-widget * {
                box-sizing: border-box;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            }
            
            .chatbot-widget {
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 10000;
                user-select: none;
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
                    bottom: 10px;
                    right: 10px;
                }
            
                .chatbot-container {
                    width: calc(100vw - 20px);
                    height: 85vh;
                    right: 0;
                    bottom: 70px;
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
                    transition: none !important;
                    animation: none !important;
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
        document.head.insertAdjacentHTML('beforeend', chatbotStyles);
    }

    bindEvents() {
        const toggle = document.getElementById('chatbotToggle');
        const close = document.getElementById('chatbotClose');
        const send = document.getElementById('chatbotSend');
        const input = document.getElementById('chatbotInput');
        const quickQuestions = document.getElementById('quickQuestions');

        if (!toggle || !close || !send || !input || !quickQuestions) {
            console.error('Error: No se encontraron todos los elementos del DOM. Asegúrese de que el HTML se haya creado correctamente.');
            return;
        }

        // Eventos principales
        toggle.addEventListener('click', () => this.toggleChat());
        close.addEventListener('click', () => this.closeChat());
        send.addEventListener('click', () => this.sendMessage());
        
        // Eventos de entrada
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !this.isLoading) {
                e.preventDefault(); // Prevenir el salto de línea en algunos casos
                this.sendMessage();
            }
        });

        input.addEventListener('input', (e) => {
            this.updateCharCounter(e.target.value.length);
        });

        // Preguntas rápidas
        quickQuestions.addEventListener('click', (e) => {
            const target = e.target.closest('.quick-question');
            if (target) {
                const question = target.getAttribute('data-question');
                input.value = question;
                this.updateCharCounter(question.length);
                this.sendMessage();
            }
        });

        // Cerrar chatbot al hacer clic fuera (mejorado para evitar cerrar al hacer clic en el toggle)
        document.addEventListener('click', (e) => {
            const chatbot = document.getElementById('koowexaChatbot');
            const isToggle = e.target.closest('#chatbotToggle');
            if (this.isOpen && chatbot && !chatbot.contains(e.target) && !isToggle) {
                this.closeChat();
            }
        });

        window.addEventListener('beforeunload', () => {
            this.cleanup();
        });
    }

    toggleChat() {
        const container = document.getElementById('chatbotContainer');
        if (container) {
            this.isOpen = !this.isOpen;
            container.classList.toggle('active', this.isOpen);
            if (this.isOpen) {
                this.scrollToBottom();
                document.getElementById('chatbotInput').focus();
            }
        }
    }

    closeChat() {
        const container = document.getElementById('chatbotContainer');
        if (container) {
            this.isOpen = false;
            container.classList.remove('active');
        }
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

        if (message.length < 2) {
            this.showTempMessage('Por favor, escribe un mensaje más largo.', 'warning');
            return;
        }

        if (message.length > 500) {
            this.showTempMessage('El mensaje es demasiado largo. Máximo 500 caracteres.', 'warning');
            return;
        }

        // Deshabilitar entrada y botón de envío
        this.setLoadingState(true);

        // Agregar mensaje del usuario
        this.addMessage(message, 'user');
        input.value = '';
        this.updateCharCounter(0);
        
        try {
            const response = await this.getAIResponse(message);
            this.addMessage(response, 'bot');
        } catch (error) {
            this.handleError(error);
        } finally {
            this.setLoadingState(false);
        }
    }

    sanitizeInput(input) {
        // Mejorar la sanitización para XSS
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+=/gi, '')
            .substring(0, 500)
            .trim();
    }

    getTrimmedHistory() {
        // Limitar el historial para evitar exceder el límite de tokens
        // Cada turno son 2 mensajes (usuario y bot). Mantenemos los últimos N turnos.
        const historyToKeep = this.chatHistory.slice(-this.MAX_HISTORY_TURNS * 2);
        return historyToKeep;
    }

    async getAIResponse(userMessage) {
        const PLATFORM_CONTEXT = this.getPlatformContext();
        const trimmedHistory = this.getTrimmedHistory();

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
                        ...trimmedHistory, // Usar historial limitado
                        {
                            role: 'user',
                            content: userMessage
                        }
                    ],
                    max_tokens: 1500, // Aumentar un poco el límite de respuesta
                    temperature: 0.7
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (response.status === 401) {
                throw new Error('API_AUTH_ERROR');
            }
            if (response.status === 429) {
                throw new Error('API_RATE_LIMIT');
            }
            if (!response.ok) {
                throw new Error(`API_HTTP_ERROR: ${response.status} - ${response.statusText}`);
            }

            const data = await response.json();
            
            if (!data.choices || !data.choices[0] || !data.choices[0].message) {
                throw new Error('API_INVALID_RESPONSE');
            }

            const aiResponse = data.choices[0].message.content;

            // Actualizar historial de chat (el historial completo)
            this.updateChatHistory(userMessage, aiResponse);

            return aiResponse;

        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                throw new Error('API_TIMEOUT');
            }
            throw error;
        }
    }

    getPlatformContext() {
        // Contexto de la plataforma (mantenido del original)
        return `Eres un asistente especializado en KOOWEXA y KOOPAGES. Responde de manera amable, profesional y detallada, enfocándote en las necesidades específicas del usuario cubano.

**INFORMACIÓN ACTUALIZADA DE KOOWEXA:**

**¿Qué es KOOWEXA?**
KOOWEXA es una plataforma digital profesional diseñada específicamente para negocios cubanos y emprendedores que desean establecer su presencia en internet con herramientas optimizadas para el contexto cubano.

**Servicios Principales:**
• Herramientas Digitales Optimizadas: Tiendas online y servicios simplificados que funcionan eficientemente incluso con conexiones lentas
• Hospedaje Web Especializado: Servidores disponibles para tu negocio online en KOOPAGES
• Soluciones Personalizadas: Adaptamos cada proyecto a las necesidades específicas de tu negocio

**Ventajas Competitivas:**
• Optimización para Cuba: Soluciones diseñadas considerando las particularidades de la conectividad en Cuba. Esto incluye diseño ligero, carga diferida de recursos y uso eficiente de datos.
• Precios Accesibles: Servicios de calidad a precios adaptados a la realidad económica cubana
• Soporte Local: Entendemos las necesidades específicas de los negocios cubanos

**PLANES Y PRECIOS ACTUALES:**

**Tienda Online - $2000 CUP/mes**
• Nombre y logo de su negocio
• Información breve del negocio
• Interfaz optimizada y simplificada
• Catálogo con hasta 50 productos (MAX)
• Soporte técnico
• Dominio KOOPAGES (ej: tunegocio.koopages.com)

**Página Web Profesional - $1500 CUP/mes**
• Diseño web moderno y responsivo
• Hasta 5 secciones informativas (Inicio, Servicios, Nosotros, Contacto, etc.)
• Formulario de contacto funcional
• Dominio KOOPAGES

**Página de Aterrizaje (Landing Page) - $1000 CUP/mes**
• Diseño enfocado en la conversión
• Una sola sección con información clave
• Formulario de captación de leads
• Dominio KOOPAGES

**Servicios Adicionales (Costo Único):**
• Diseño de Logo: $500 CUP
• Creación de Contenido (5 artículos): $1000 CUP
• Configuración de Pasarela de Pago (Nacional): $800 CUP

**KOOPAGES:**
KOOPAGES es el servicio de hospedaje web de KOOWEXA, optimizado para garantizar la máxima velocidad y disponibilidad para los negocios cubanos. Es la base tecnológica donde residen todas las tiendas y páginas web creadas con KOOWEXA.

**Contacto:**
• Correo Electrónico: info@koowexa.com
• Teléfono (WhatsApp/Telegram): +53 5 1234567 (Ejemplo)
• Redes Sociales: @KoowexaCuba (Facebook, Instagram, Telegram)

**Preguntas Frecuentes (FAQ):**
1. ¿Puedo usar mi propio dominio? Sí, podemos ayudarte a configurar tu propio dominio (.com, .net, etc.) con un costo adicional de configuración.
2. ¿Qué métodos de pago aceptan? Aceptamos pagos en CUP (transferencia bancaria, EnZona, Transfermóvil) y otras divisas (a través de remesas o plataformas específicas).
3. ¿Cuánto tiempo tarda en estar lista mi web? Una tienda online o página profesional tarda entre 7 y 14 días hábiles, dependiendo de la complejidad y la entrega de contenido por parte del cliente.
4. ¿Ofrecen soporte después de la entrega? Sí, todos los planes incluyen soporte técnico continuo para asegurar el correcto funcionamiento de la plataforma.
5. ¿Qué pasa si necesito más de 50 productos en mi tienda? Ofrecemos planes personalizados para catálogos más grandes. Contacta a nuestro equipo de ventas para una cotización.
`;
    }

    updateChatHistory(userMessage, aiResponse) {
        this.chatHistory.push({ role: 'user', content: userMessage });
        this.chatHistory.push({ role: 'assistant', content: aiResponse });
        this.saveChatHistory();
    }

    loadChatHistory() {
        try {
            const history = localStorage.getItem('koowexaChatHistory');
            if (history) {
                this.chatHistory = JSON.parse(history);
                // Reconstruir los mensajes en el DOM al cargar
                this.chatHistory.forEach(msg => {
                    if (msg.role !== 'system') {
                        this.addMessage(msg.content, msg.role, false); // No guardar de nuevo
                    }
                });
                this.scrollToBottom();
            }
        } catch (e) {
            console.error('Error al cargar el historial de chat:', e);
            localStorage.removeItem('koowexaChatHistory');
        }
    }

    saveChatHistory() {
        try {
            // Guardar solo el historial limitado para no saturar localStorage
            const historyToSave = this.chatHistory.slice(-20); // Guardar los últimos 10 turnos
            localStorage.setItem('koowexaChatHistory', JSON.stringify(historyToSave));
        } catch (e) {
            console.error('Error al guardar el historial de chat:', e);
        }
    }

    addMessage(text, sender, save = true) {
        const messagesContainer = document.getElementById('chatbotMessages');
        if (!messagesContainer) return;

        // Crear el elemento del mensaje
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', `${sender}-message`);

        // Convertir Markdown a HTML básico (solo para saltos de línea y negritas)
        const formattedText = this.formatMarkdown(text);

        messageElement.innerHTML = `
            <div class="message-content">${formattedText}</div>
            <div class="message-time">${this.getCurrentTime()}</div>
        `;

        // Si es un mensaje del bot, eliminar el indicador de carga si existe
        if (sender === 'bot') {
            const loadingMessage = document.getElementById('loadingMessage');
            if (loadingMessage) {
                messagesContainer.removeChild(loadingMessage);
            }
        }

        messagesContainer.appendChild(messageElement);
        this.scrollToBottom();

        if (save && sender !== 'bot') {
            // El historial se actualiza en getAIResponse para incluir la respuesta del bot
            // Si es un mensaje inicial del bot o cargado, no se guarda.
        }
    }

    formatMarkdown(text) {
        // Simple Markdown a HTML: Negritas y saltos de línea
        let html = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\n/g, '<br>');
        return html;
    }

    getCurrentTime() {
        const now = new Date();
        return now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    }

    scrollToBottom() {
        const messagesContainer = document.getElementById('chatbotMessages');
        if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }

    setLoadingState(isLoading) {
        this.isLoading = isLoading;
        const input = document.getElementById('chatbotInput');
        const sendButton = document.getElementById('chatbotSend');
        
        if (input) input.disabled = isLoading;
        if (sendButton) sendButton.disabled = isLoading;

        if (isLoading) {
            this.showLoading();
        } else {
            this.hideLoading();
        }
    }

    showLoading() {
        const messagesContainer = document.getElementById('chatbotMessages');
        if (!messagesContainer) return;

        // Evitar duplicados
        if (document.getElementById('loadingMessage')) return;

        const loadingElement = document.createElement('div');
        loadingElement.id = 'loadingMessage';
        loadingElement.classList.add('message', 'bot-message');
        loadingElement.innerHTML = `
            <div class="message-content">
                <div class="loading-dots">
                    <div></div>
                    <div></div>
                    <div></div>
                </div>
            </div>
        `;
        messagesContainer.appendChild(loadingElement);
        this.scrollToBottom();
    }

    hideLoading() {
        const loadingMessage = document.getElementById('loadingMessage');
        if (loadingMessage) {
            loadingMessage.remove();
        }
    }

    showTempMessage(text, type = 'info') {
        const messagesContainer = document.getElementById('chatbotMessages');
        if (!messagesContainer) return;

        const tempMessage = document.createElement('div');
        tempMessage.classList.add('message', 'bot-message', 'temp-message', type);
        tempMessage.style.cssText = 'background: #fefcbf; color: #92400e; border-color: #f6e05e;';
        if (type === 'warning') {
            tempMessage.style.cssText = 'background: #fed7d7; color: #c53030; border-color: #feb2b2;';
        }
        tempMessage.innerHTML = `<div class="message-content">${text}</div>`;
        messagesContainer.appendChild(tempMessage);
        this.scrollToBottom();

        setTimeout(() => {
            tempMessage.remove();
        }, 3000);
    }

    handleError(error) {
        console.error('Error del Chatbot:', error);
        let userMessage = 'Lo siento, ha ocurrido un error inesperado. Por favor, inténtalo de nuevo.';

        if (error.message === 'API_TIMEOUT') {
            userMessage = 'La solicitud ha tardado demasiado. Por favor, revisa tu conexión o intenta con una pregunta más corta.';
        } else if (error.message === 'API_AUTH_ERROR') {
            userMessage = 'Error de autenticación (401). La clave API es inválida o ha expirado. Por favor, contacta al administrador.';
        } else if (error.message === 'API_RATE_LIMIT') {
            userMessage = 'Hemos excedido el límite de solicitudes (429). Por favor, espera un momento e inténtalo de nuevo.';
        } else if (error.message.startsWith('API_HTTP_ERROR')) {
            userMessage = `Error de conexión con la API: ${error.message.split(': ')[1]}.`;
        } else if (error.message === 'API_INVALID_RESPONSE') {
            userMessage = 'La respuesta de la IA fue inválida. Intenta reformular tu pregunta.';
        }

        this.addMessage(userMessage, 'bot');
    }

    cleanup() {
        // Limpieza de eventos si fuera necesario, aunque en este caso no es crítico
        // ya que el chatbot vive durante toda la sesión de la página.
    }
}

// Inicializar el chatbot
new KOOWEXAChatbot();

// Exportar para uso modular (si es necesario)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = KOOWEXAChatbot;
}
