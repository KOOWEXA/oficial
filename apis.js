// apis-integration.js

class KOOWEXAAPIs {
    constructor() {
        this.apis = {
            payment: this.initPaymentAPI(),
            notification: this.initNotificationAPI(),
            analytics: this.initAnalyticsAPI(),
            storage: this.initStorageAPI(),
            communication: this.initCommunicationAPI(),
            location: this.initLocationAPI(),
            validation: this.initValidationAPI(),
            support: this.initSupportAPI()
        };
    }

    // 1. API de Pagos Cubana
    initPaymentAPI() {
        return {
            name: 'PaymentAPI',
            baseURL: 'https://api.pagos.cu/v1',
            endpoints: {
                createPayment: '/payments/create',
                verifyPayment: '/payments/verify',
                getBalance: '/wallet/balance',
                transferCUP: '/transfer/cup'
            },
            
            async createPayment(orderData) {
                const payload = {
                    amount: orderData.amount,
                    currency: 'CUP',
                    description: orderData.description,
                    merchant_id: 'KOOWEXA_' + Date.now(),
                    callback_url: `${window.location.origin}/payment-callback`,
                    customer_email: orderData.email,
                    metadata: {
                        service_type: orderData.serviceType,
                        plan_name: orderData.planName,
                        user_id: orderData.userId
                    }
                };

                try {
                    const response = await fetch(`${this.baseURL}${this.endpoints.createPayment}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${this.getAuthToken()}`
                        },
                        body: JSON.stringify(payload)
                    });

                    if (!response.ok) throw new Error('Error en pago');
                    
                    const data = await response.json();
                    return {
                        success: true,
                        paymentId: data.payment_id,
                        qrCode: data.qr_code,
                        paymentUrl: data.payment_url,
                        expiresAt: data.expires_at
                    };
                } catch (error) {
                    console.error('Payment API Error:', error);
                    return {
                        success: false,
                        error: 'No se pudo procesar el pago. Intente nuevamente.'
                    };
                }
            },

            async verifyPayment(paymentId) {
                try {
                    const response = await fetch(`${this.baseURL}${this.endpoints.verifyPayment}/${paymentId}`, {
                        headers: {
                            'Authorization': `Bearer ${this.getAuthToken()}`
                        }
                    });

                    const data = await response.json();
                    return {
                        status: data.status,
                        paid: data.status === 'completed',
                        amount: data.amount,
                        paidAt: data.paid_at
                    };
                } catch (error) {
                    console.error('Payment Verification Error:', error);
                    return { status: 'error', paid: false };
                }
            },

            getAuthToken() {
                return localStorage.getItem('koowexa_payment_token') || 'demo_token';
            }
        };
    }

    // 2. API de Notificaciones
    initNotificationAPI() {
        return {
            name: 'NotificationAPI',
            methods: {
                EMAIL: 'email',
                SMS: 'sms',
                PUSH: 'push',
                WHATSAPP: 'whatsapp'
            },

            async send(notification) {
                const methods = {
                    email: this.sendEmail.bind(this),
                    sms: this.sendSMS.bind(this),
                    push: this.sendPush.bind(this),
                    whatsapp: this.sendWhatsApp.bind(this)
                };

                const method = methods[notification.method];
                if (method) {
                    return await method(notification);
                }

                return { success: false, error: 'Método no soportado' };
            },

            async sendEmail(notification) {
                // Integración con servicio de email para Cuba
                const emailData = {
                    to: notification.to,
                    subject: notification.subject,
                    template: notification.template || 'default',
                    data: notification.data,
                    from: 'notificaciones@koowexa.cu'
                };

                try {
                    // Usar servicio como SendGrid alternativo para Cuba
                    const response = await fetch('https://api.emailservice.cu/send', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-API-Key': this.getEmailAPIKey()
                        },
                        body: JSON.stringify(emailData)
                    });

                    return await response.json();
                } catch (error) {
                    // Fallback a email directo
                    window.location.href = `mailto:${notification.to}?subject=${encodeURIComponent(notification.subject)}&body=${encodeURIComponent(notification.data.message)}`;
                    return { success: true, method: 'fallback' };
                }
            },

            async sendSMS(notification) {
                // Integración con servicios SMS cubanos
                const smsData = {
                    number: notification.to,
                    message: notification.data.message,
                    sender: 'KOOWEXA'
                };

                try {
                    const response = await fetch('https://api.sms.cu/send', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(smsData)
                    });

                    return await response.json();
                } catch (error) {
                    console.log('SMS no disponible, guardando para envío posterior');
                    this.queueNotification(notification);
                    return { success: true, queued: true };
                }
            },

            async sendWhatsApp(notification) {
                // Integración con API de WhatsApp
                const whatsappData = {
                    phone: notification.to,
                    message: notification.data.message,
                    template: notification.template
                };

                try {
                    const response = await fetch('https://api.whatsapp.cu/send', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(whatsappData)
                    });

                    return await response.json();
                } catch (error) {
                    // Fallback a enlace directo de WhatsApp
                    const whatsappUrl = `https://wa.me/${notification.to}?text=${encodeURIComponent(notification.data.message)}`;
                    window.open(whatsappUrl, '_blank');
                    return { success: true, method: 'direct_link' };
                }
            },

            sendPush(notification) {
                // Notificaciones push para la app
                if ('serviceWorker' in navigator && 'PushManager' in window) {
                    navigator.serviceWorker.ready.then(registration => {
                        registration.showNotification(notification.title, {
                            body: notification.data.message,
                            icon: '/icons/icon-192x192.png',
                            badge: '/icons/badge-72x72.png',
                            data: { url: notification.data.url }
                        });
                    });
                }
                return { success: true };
            },

            queueNotification(notification) {
                const queue = JSON.parse(localStorage.getItem('notification_queue') || '[]');
                queue.push({
                    ...notification,
                    timestamp: Date.now(),
                    attempts: 0
                });
                localStorage.setItem('notification_queue', JSON.stringify(queue));
            },

            getEmailAPIKey() {
                return 'koowexa_email_key_' + btoa('koowexa@gmail.com');
            }
        };
    }

    // 3. API de Analytics y Métricas
    initAnalyticsAPI() {
        return {
            name: 'AnalyticsAPI',
            trackEvent(category, action, label, value) {
                const eventData = {
                    category,
                    action,
                    label,
                    value,
                    timestamp: new Date().toISOString(),
                    userAgent: navigator.userAgent,
                    platform: this.getPlatform(),
                    location: this.getUserLocation(),
                    sessionId: this.getSessionId()
                };

                // Enviar a servidor de analytics
                this.sendToAnalyticsServer(eventData);
                
                // Guardar localmente para offline
                this.storeLocally(eventData);
            },

            trackPageView(page) {
                this.trackEvent('Navigation', 'Page View', page);
            },

            trackConversion(type, value) {
                this.trackEvent('Conversion', type, 'Plan Purchase', value);
            },

            trackError(error, context) {
                this.trackEvent('Error', error.message, context, 1);
            },

            async sendToAnalyticsServer(eventData) {
                try {
                    await fetch('https://analytics.koowexa.cu/track', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(eventData)
                    });
                } catch (error) {
                    console.log('Analytics offline, storing locally');
                }
            },

            storeLocally(eventData) {
                const analyticsData = JSON.parse(localStorage.getItem('koowexa_analytics') || '[]');
                analyticsData.push(eventData);
                
                // Mantener solo últimos 100 eventos
                if (analyticsData.length > 100) {
                    analyticsData.splice(0, analyticsData.length - 100);
                }
                
                localStorage.setItem('koowexa_analytics', JSON.stringify(analyticsData));
            },

            getPlatform() {
                const ua = navigator.userAgent;
                if (/mobile/i.test(ua)) return 'mobile';
                if (/tablet/i.test(ua)) return 'tablet';
                return 'desktop';
            },

            getUserLocation() {
                // Estimación basada en IP o datos del navegador
                return {
                    country: 'CU',
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    language: navigator.language
                };
            },

            getSessionId() {
                let sessionId = sessionStorage.getItem('koowexa_session_id');
                if (!sessionId) {
                    sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                    sessionStorage.setItem('koowexa_session_id', sessionId);
                }
                return sessionId;
            },

            getReports() {
                const localData = JSON.parse(localStorage.getItem('koowexa_analytics') || '[]');
                return {
                    totalEvents: localData.length,
                    pageViews: localData.filter(e => e.action === 'Page View').length,
                    conversions: localData.filter(e => e.category === 'Conversion').length,
                    errors: localData.filter(e => e.category === 'Error').length,
                    platformBreakdown: this.getPlatformBreakdown(localData)
                };
            },

            getPlatformBreakdown(events) {
                const platforms = {};
                events.forEach(event => {
                    const platform = event.platform;
                    platforms[platform] = (platforms[platform] || 0) + 1;
                });
                return platforms;
            }
        };
    }

    // 4. API de Almacenamiento en la Nube
    initStorageAPI() {
        return {
            name: 'StorageAPI',
            providers: {
                LOCAL: 'local',
                CLOUD: 'cloud',
                IPFS: 'ipfs'
            },

            async uploadFile(file, options = {}) {
                const { provider = 'cloud', compress = true } = options;
                
                if (compress) {
                    file = await this.compressImage(file);
                }

                const methods = {
                    local: this.uploadToLocal.bind(this),
                    cloud: this.uploadToCloud.bind(this),
                    ipfs: this.uploadToIPFS.bind(this)
                };

                return await methods[provider](file);
            },

            async uploadToLocal(file) {
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const fileData = {
                            id: 'local_' + Date.now(),
                            name: file.name,
                            type: file.type,
                            size: file.size,
                            data: e.target.result,
                            uploadedAt: new Date().toISOString()
                        };

                        // Guardar en localStorage (para datos pequeños)
                        if (file.size < 500000) { // 500KB
                            const storedFiles = JSON.parse(localStorage.getItem('koowexa_files') || '[]');
                            storedFiles.push(fileData);
                            localStorage.setItem('koowexa_files', JSON.stringify(storedFiles));
                        }

                        resolve({
                            success: true,
                            fileId: fileData.id,
                            url: fileData.data,
                            storage: 'local'
                        });
                    };
                    reader.readAsDataURL(file);
                });
            },

            async uploadToCloud(file) {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('upload_preset', 'koowexa_uploads');
                formData.append('folder', 'koowexa/stores');

                try {
                    const response = await fetch('https://api.cloudstorage.cu/upload', {
                        method: 'POST',
                        body: formData
                    });

                    const data = await response.json();
                    return {
                        success: true,
                        fileId: data.public_id,
                        url: data.secure_url,
                        storage: 'cloud'
                    };
                } catch (error) {
                    // Fallback to local storage
                    return await this.uploadToLocal(file);
                }
            },

            async uploadToIPFS(file) {
                try {
                    const formData = new FormData();
                    formData.append('file', file);

                    const response = await fetch('https://ipfs.infura.io:5001/api/v0/add', {
                        method: 'POST',
                        body: formData
                    });

                    const data = await response.json();
                    return {
                        success: true,
                        fileId: data.Hash,
                        url: `https://ipfs.io/ipfs/${data.Hash}`,
                        storage: 'ipfs'
                    };
                } catch (error) {
                    console.error('IPFS upload failed:', error);
                    return await this.uploadToLocal(file);
                }
            },

            async compressImage(file, quality = 0.7) {
                return new Promise((resolve) => {
                    if (!file.type.startsWith('image/')) {
                        resolve(file);
                        return;
                    }

                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    const img = new Image();

                    img.onload = () => {
                        canvas.width = img.width;
                        canvas.height = img.height;
                        ctx.drawImage(img, 0, 0);

                        canvas.toBlob((blob) => {
                            resolve(new File([blob], file.name, {
                                type: 'image/jpeg',
                                lastModified: Date.now()
                            }));
                        }, 'image/jpeg', quality);
                    };

                    img.src = URL.createObjectURL(file);
                });
            },

            getFile(fileId) {
                const storedFiles = JSON.parse(localStorage.getItem('koowexa_files') || '[]');
                return storedFiles.find(file => file.id === fileId);
            },

            deleteFile(fileId) {
                const storedFiles = JSON.parse(localStorage.getItem('koowexa_files') || '[]');
                const updatedFiles = storedFiles.filter(file => file.id !== fileId);
                localStorage.setItem('koowexa_files', JSON.stringify(updatedFiles));
                return { success: true };
            }
        };
    }

    // 5. API de Comunicación en Tiempo Real
    initCommunicationAPI() {
        return {
            name: 'CommunicationAPI',
            socket: null,
            listeners: {},

            connect() {
                // WebSocket para chat en tiempo real
                try {
                    this.socket = new WebSocket('wss://realtime.koowexa.cu/ws');
                    
                    this.socket.onopen = () => {
                        console.log('Conexión WebSocket establecida');
                        this.emit('connected');
                    };

                    this.socket.onmessage = (event) => {
                        const data = JSON.parse(event.data);
                        this.emit(data.type, data.payload);
                    };

                    this.socket.onclose = () => {
                        console.log('Conexión WebSocket cerrada');
                        setTimeout(() => this.connect(), 5000); // Reconectar
                    };

                } catch (error) {
                    console.log('WebSocket no disponible, usando polling');
                    this.startPolling();
                }
            },

            startPolling() {
                setInterval(() => {
                    this.checkMessages();
                }, 10000); // Poll cada 10 segundos
            },

            async checkMessages() {
                try {
                    const response = await fetch('https://api.koowexa.cu/messages/poll');
                    const messages = await response.json();
                    
                    messages.forEach(message => {
                        this.emit('message', message);
                    });
                } catch (error) {
                    console.log('Polling failed:', error);
                }
            },

            on(event, callback) {
                if (!this.listeners[event]) {
                    this.listeners[event] = [];
                }
                this.listeners[event].push(callback);
            },

            emit(event, data) {
                if (this.listeners[event]) {
                    this.listeners[event].forEach(callback => callback(data));
                }
            },

            sendMessage(type, payload) {
                if (this.socket && this.socket.readyState === WebSocket.OPEN) {
                    this.socket.send(JSON.stringify({ type, payload }));
                } else {
                    // Fallback a HTTP
                    fetch('https://api.koowexa.cu/messages/send', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ type, payload })
                    });
                }
            },

            // Chat de soporte
            startSupportChat(userId) {
                this.sendMessage('support_join', { userId });
            },

            sendSupportMessage(message) {
                this.sendMessage('support_message', {
                    text: message,
                    timestamp: Date.now()
                });
            }
        };
    }

    // 6. API de Geoubicación y Mapas
    initLocationAPI() {
        return {
            name: 'LocationAPI',

            async getCurrentLocation() {
                return new Promise((resolve, reject) => {
                    if (!navigator.geolocation) {
                        resolve(this.getLocationByIP());
                        return;
                    }

                    navigator.geolocation.getCurrentPosition(
                        (position) => {
                            resolve({
                                latitude: position.coords.latitude,
                                longitude: position.coords.longitude,
                                accuracy: position.coords.accuracy,
                                source: 'gps'
                            });
                        },
                        (error) => {
                            console.log('GPS failed:', error);
                            resolve(this.getLocationByIP());
                        },
                        {
                            enableHighAccuracy: false,
                            timeout: 10000,
                            maximumAge: 600000
                        }
                    );
                });
            },

            async getLocationByIP() {
                try {
                    const response = await fetch('https://ipapi.co/json/');
                    const data = await response.json();
                    
                    return {
                        latitude: data.latitude,
                        longitude: data.longitude,
                        city: data.city,
                        region: data.region,
                        country: data.country_name,
                        source: 'ip'
                    };
                } catch (error) {
                    // Fallback a ubicación por defecto (Cuba)
                    return {
                        latitude: 21.521757,
                        longitude: -77.781166,
                        city: 'Holguín',
                        region: 'Holguín',
                        country: 'Cuba',
                        source: 'default'
                    };
                }
            },

            async getProvinces() {
                // Provincias de Cuba
                return [
                    { id: '01', name: 'Pinar del Río' },
                    { id: '02', name: 'La Habana' },
                    { id: '03', name: 'Ciudad de La Habana' },
                    { id: '04', name: 'Matanzas' },
                    { id: '05', name: 'Villa Clara' },
                    { id: '06', name: 'Cienfuegos' },
                    { id: '07', name: 'Sancti Spíritus' },
                    { id: '08', name: 'Ciego de Ávila' },
                    { id: '09', name: 'Camagüey' },
                    { id: '10', name: 'Las Tunas' },
                    { id: '11', name: 'Holguín' },
                    { id: '12', name: 'Granma' },
                    { id: '13', name: 'Santiago de Cuba' },
                    { id: '14', name: 'Guantánamo' },
                    { id: '15', name: 'Isla de la Juventud' },
                    { id: '16', name: 'Artemisa' },
                    { id: '17', name: 'Mayabeque' }
                ];
            },

            calculateDistance(lat1, lon1, lat2, lon2) {
                // Fórmula de Haversine
                const R = 6371; // Radio de la Tierra en km
                const dLat = this.toRad(lat2 - lat1);
                const dLon = this.toRad(lon2 - lon1);
                
                const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                         Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
                         Math.sin(dLon/2) * Math.sin(dLon/2);
                
                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
                return R * c;
            },

            toRad(degrees) {
                return degrees * (Math.PI/180);
            },

            async getNearbyStores(location, radiusKm = 10) {
                const stores = await this.getStores();
                return stores.filter(store => {
                    const distance = this.calculateDistance(
                        location.latitude, location.longitude,
                        store.latitude, store.longitude
                    );
                    return distance <= radiusKm;
                });
            },

            async getStores() {
                // Datos de ejemplo de tiendas KOOWEXA
                return [
                    {
                        id: 1,
                        name: 'Tienda KOOWEXA Holguín',
                        latitude: 20.8875,
                        longitude: -76.2575,
                        address: 'Calle Libertad #123, Holguín'
                    },
                    {
                        id: 2,
                        name: 'KOOWEXA La Habana',
                        latitude: 23.1136,
                        longitude: -82.3666,
                        address: 'Av. 23 #456, Vedado, La Habana'
                    }
                ];
            }
        };
    }

    // 7. API de Validación de Datos
    initValidationAPI() {
        return {
            name: 'ValidationAPI',

            validateEmail(email) {
                const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return regex.test(email);
            },

            validatePhone(phone) {
                // Formato de teléfono cubano
                const regex = /^(\+53)?5\d{7}$/;
                return regex.test(phone.replace(/\s/g, ''));
            },

            validateCUPAmount(amount) {
                return !isNaN(amount) && amount > 0 && amount <= 1000000; // Máximo 1,000,000 CUP
            },

            validateProductData(product) {
                const errors = [];

                if (!product.name || product.name.length < 2) {
                    errors.push('El nombre del producto debe tener al menos 2 caracteres');
                }

                if (!product.price || !this.validateCUPAmount(product.price)) {
                    errors.push('El precio debe ser un valor válido en CUP');
                }

                if (product.description && product.description.length > 500) {
                    errors.push('La descripción no puede exceder 500 caracteres');
                }

                return {
                    isValid: errors.length === 0,
                    errors
                };
            },

            validateStoreData(store) {
                const errors = [];

                if (!store.name || store.name.length < 3) {
                    errors.push('El nombre del negocio debe tener al menos 3 caracteres');
                }

                if (!store.category) {
                    errors.push('Se debe seleccionar una categoría');
                }

                if (!store.contact_email || !this.validateEmail(store.contact_email)) {
                    errors.push('Email de contacto inválido');
                }

                if (store.contact_phone && !this.validatePhone(store.contact_phone)) {
                    errors.push('Teléfono de contacto inválido');
                }

                return {
                    isValid: errors.length === 0,
                    errors
                };
            },

            sanitizeInput(input) {
                if (typeof input !== 'string') return input;
                
                return input
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&#x27;')
                    .replace(/\//g, '&#x2F;')
                    .trim();
            },

            formatPhone(phone) {
                const cleaned = phone.replace(/\D/g, '');
                if (cleaned.length === 8) {
                    return `+53${cleaned}`;
                }
                return cleaned;
            },

            formatPrice(amount) {
                return new Intl.NumberFormat('es-CU', {
                    style: 'currency',
                    currency: 'CUP'
                }).format(amount);
            }
        };
    }

    // 8. API de Soporte Técnico
    initSupportAPI() {
        return {
            name: 'SupportAPI',
            baseURL: 'https://support.koowexa.cu/api',

            async createTicket(ticketData) {
                const ticket = {
                    id: 'T' + Date.now(),
                    subject: ticketData.subject,
                    description: ticketData.description,
                    category: ticketData.category || 'general',
                    priority: ticketData.priority || 'medium',
                    status: 'open',
                    created_at: new Date().toISOString(),
                    user: {
                        email: ticketData.email,
                        name: ticketData.name,
                        phone: ticketData.phone
                    },
                    attachments: ticketData.attachments || []
                };

                try {
                    const response = await fetch(`${this.baseURL}/tickets`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(ticket)
                    });

                    const result = await response.json();
                    
                    // Notificar al usuario
                    this.apis.notification.send({
                        method: 'email',
                        to: ticketData.email,
                        subject: `Ticket de soporte creado: ${result.ticket_id}`,
                        data: {
                            message: `Hemos recibido tu solicitud de soporte. Número de ticket: ${result.ticket_id}`
                        }
                    });

                    return result;
                } catch (error) {
                    // Guardar localmente para enviar después
                    this.queueTicket(ticket);
                    return {
                        success: true,
                        ticket_id: ticket.id,
                        queued: true,
                        message: 'Ticket guardado para envío posterior'
                    };
                }
            },

            queueTicket(ticket) {
                const queuedTickets = JSON.parse(localStorage.getItem('koowexa_queued_tickets') || '[]');
                queuedTickets.push(ticket);
                localStorage.setItem('koowexa_queued_tickets', JSON.stringify(queuedTickets));
            },

            async getKnowledgeBase() {
                const articles = [
                    {
                        id: 1,
                        title: 'Cómo crear tu tienda online',
                        category: 'tienda',
                        content: 'Guía paso a paso para configurar tu tienda online con KOOWEXA...',
                        tags: ['tienda', 'configuración', 'inicio']
                    },
                    {
                        id: 2,
                        title: 'Gestión de productos',
                        category: 'tienda',
                        content: 'Aprende a agregar y administrar productos en tu tienda...',
                        tags: ['productos', 'inventario', 'gestión']
                    },
                    {
                        id: 3,
                        title: 'Problemas de conexión',
                        category: 'tecnico',
                        content: 'Soluciones para problemas comunes de conectividad...',
                        tags: ['conexión', 'tecnico', 'solución']
                    }
                ];

                return articles;
            },

            async searchKnowledgeBase(query) {
                const articles = await this.getKnowledgeBase();
                const searchTerm = query.toLowerCase();
                
                return articles.filter(article => 
                    article.title.toLowerCase().includes(searchTerm) ||
                    article.content.toLowerCase().includes(searchTerm) ||
                    article.tags.some(tag => tag.toLowerCase().includes(searchTerm))
                );
            },

            getSystemStatus() {
                return {
                    platform: 'operational',
                    payments: 'operational',
                    storage: 'operational',
                    api: 'operational',
                    last_updated: new Date().toISOString()
                };
            },

            async getTicketStatus(ticketId) {
                try {
                    const response = await fetch(`${this.baseURL}/tickets/${ticketId}`);
                    return await response.json();
                } catch (error) {
                    const queuedTickets = JSON.parse(localStorage.getItem('koowexa_queued_tickets') || '[]');
                    const ticket = queuedTickets.find(t => t.id === ticketId);
                    return ticket ? { ...ticket, status: 'queued' } : null;
                }
            }
        };
    }

    // Métodos de utilidad globales
    initialize() {
        // Inicializar todas las APIs
        Object.values(this.apis).forEach(api => {
            if (api.connect) {
                api.connect();
            }
        });

        // Sincronizar datos en cola
        this.syncQueuedData();
        
        console.log('APIs de KOOWEXA inicializadas');
    }

    async syncQueuedData() {
        // Sincronizar tickets en cola
        const queuedTickets = JSON.parse(localStorage.getItem('koowexa_queued_tickets') || '[]');
        for (const ticket of queuedTickets) {
            await this.apis.support.createTicket(ticket);
        }
        localStorage.removeItem('koowexa_queued_tickets');

        // Sincronizar analytics offline
        const analyticsData = JSON.parse(localStorage.getItem('koowexa_analytics') || '[]');
        if (analyticsData.length > 0) {
            await this.apis.analytics.syncOfflineData(analyticsData);
            localStorage.removeItem('koowexa_analytics');
        }
    }

    // Método para obtener una API específica
    getAPI(apiName) {
        return this.apis[apiName];
    }

    // Método para verificar el estado de todas las APIs
    getStatus() {
        const status = {};
        Object.keys(this.apis).forEach(apiName => {
            status[apiName] = 'active';
        });
        return status;
    }
}

// Instancia global de las APIs
window.KOOWEXA_API = new KOOWEXAAPIs();

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    KOOWEXA_API.initialize();
});

// Ejemplos de uso:
/*
// 1. Procesar un pago
const paymentResult = await KOOWEXA_API.getAPI('payment').createPayment({
    amount: 2000,
    description: 'Plan Tienda Online Básico',
    email: 'cliente@ejemplo.com',
    serviceType: 'tienda_online',
    planName: 'Básico'
});

// 2. Enviar notificación
await KOOWEXA_API.getAPI('notification').send({
    method: 'whatsapp',
    to: '+5351234567',
    data: {
        message: 'Tu tienda online está lista para usar!'
    }
});

// 3. Trackear evento
KOOWEXA_API.getAPI('analytics').trackEvent('Purchase', 'Completed', 'Plan Básico', 2000);

// 4. Subir imagen de producto
const uploadResult = await KOOWEXA_API.getAPI('storage').uploadFile(file, {
    provider: 'cloud',
    compress: true
});

// 5. Validar datos de tienda
const validation = KOOWEXA_API.getAPI('validation').validateStoreData(storeData);

// 6. Crear ticket de soporte
const ticket = await KOOWEXA_API.getAPI('support').createTicket({
    subject: 'Problema con mi tienda',
    description: 'No puedo acceder al panel de control...',
    email: 'usuario@ejemplo.com',
    category: 'tecnico'
});
*/