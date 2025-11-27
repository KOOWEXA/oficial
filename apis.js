// apis-integration.js - VERSIÓN COMPLETA OPTIMIZADA

class KOOWEXAAPIs {
    constructor() {
        this.config = {
            baseURLs: {
                payment: 'https://api.pagos.cu/v1',
                email: 'https://api.emailservice.cu/send',
                sms: 'https://api.sms.cu/send',
                whatsapp: 'https://api.whatsapp.cu/send',
                analytics: 'https://analytics.koowexa.cu/track',
                storage: 'https://api.cloudstorage.cu/upload',
                support: 'https://support.koowexa.cu/api',
                realtime: 'wss://realtime.koowexa.cu/ws'
            },
            defaults: {
                currency: 'CUP',
                maxFileSize: 500000, // 500KB
                timeout: 10000,
                maxRetries: 3
            }
        };

        this.state = {
            online: navigator.onLine,
            lastSync: null,
            retryCount: 0
        };

        this.apis = this.initializeAPIs();
        this.setupEventListeners();
    }

    // Sistema de logging estructurado
    logger = {
        info: (message, data = {}) => console.log(`[KOOWEXA-INFO] ${message}`, data),
        error: (message, error = null) => console.error(`[KOOWEXA-ERROR] ${message}`, error),
        warn: (message, data = {}) => console.warn(`[KOOWEXA-WARN] ${message}`, data),
        debug: (message, data = {}) => console.debug(`[KOOWEXA-DEBUG] ${message}`, data)
    };

    // Utilidades compartidas
    utils = {
        generateId: (prefix = '') => `${prefix}${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        
        sanitizeInput: (input) => {
            if (typeof input !== 'string') return input;
            const div = document.createElement('div');
            div.textContent = input;
            return div.innerHTML;
        },

        formatCurrency: (amount, currency = 'CUP') => {
            return new Intl.NumberFormat('es-CU', {
                style: 'currency',
                currency: currency
            }).format(amount);
        },

        debounce: (func, wait) => {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },

        validateURL: (url) => {
            try {
                new URL(url);
                return true;
            } catch {
                return false;
            }
        },

        getAuthToken: (type = 'payment') => {
            return localStorage.getItem(`koowexa_${type}_token`) || 'demo_token';
        },

        queueData: (key, data) => {
            const queue = JSON.parse(localStorage.getItem(key) || '[]');
            queue.push({
                ...data,
                timestamp: Date.now(),
                attempts: 0
            });
            localStorage.setItem(key, JSON.stringify(queue));
            return queue.length;
        },

        getQueuedData: (key) => {
            return JSON.parse(localStorage.getItem(key) || '[]');
        },

        clearQueuedData: (key) => {
            localStorage.removeItem(key);
        }
    };

    initializeAPIs() {
        return {
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

    setupEventListeners() {
        // Monitorear estado de conexión
        window.addEventListener('online', () => {
            this.state.online = true;
            this.logger.info('Conexión restaurada - sincronizando datos...');
            this.syncQueuedData();
        });

        window.addEventListener('offline', () => {
            this.state.online = false;
            this.logger.warn('Conexión perdida - modo offline activado');
        });

        // Prevenir pérdida de datos al cerrar pestaña
        window.addEventListener('beforeunload', (event) => {
            const hasQueuedData = 
                this.utils.getQueuedData('koowexa_queued_tickets').length > 0 ||
                this.utils.getQueuedData('notification_queue').length > 0;
            
            if (hasQueuedData && !this.state.online) {
                event.preventDefault();
                event.returnValue = 'Tienes datos pendientes de sincronizar. ¿Estás seguro de que quieres salir?';
            }
        });
    }

    // 1. API de Pagos Cubana Optimizada
    initPaymentAPI() {
        const { baseURLs, defaults } = this.config;
        const { generateId, getAuthToken } = this.utils;

        const endpoints = {
            createPayment: '/payments/create',
            verifyPayment: '/payments/verify',
            getBalance: '/wallet/balance',
            transferCUP: '/transfer/cup'
        };

        const createPayment = async (orderData) => {
            const payload = {
                amount: orderData.amount,
                currency: defaults.currency,
                description: orderData.description,
                merchant_id: `KOOWEXA_${generateId()}`,
                callback_url: `${window.location.origin}/payment-callback`,
                customer_email: orderData.email,
                metadata: {
                    service_type: orderData.serviceType,
                    plan_name: orderData.planName,
                    user_id: orderData.userId,
                    order_id: generateId('ORDER_')
                }
            };

            try {
                const response = await fetch(`${baseURLs.payment}${endpoints.createPayment}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${getAuthToken('payment')}`
                    },
                    body: JSON.stringify(payload),
                    signal: AbortSignal.timeout(defaults.timeout)
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();
                
                // Trackear evento de pago creado
                this.apis.analytics.trackEvent('Payment', 'Created', orderData.serviceType, orderData.amount);

                return {
                    success: true,
                    paymentId: data.payment_id,
                    qrCode: data.qr_code,
                    paymentUrl: data.payment_url,
                    expiresAt: data.expires_at,
                    merchantId: payload.merchant_id
                };
            } catch (error) {
                this.logger.error('Error en creación de pago', error);
                return {
                    success: false,
                    error: 'No se pudo procesar el pago. Intente nuevamente.',
                    details: error.message
                };
            }
        };

        const verifyPayment = async (paymentId) => {
            try {
                const response = await fetch(`${baseURLs.payment}${endpoints.verifyPayment}/${paymentId}`, {
                    headers: {
                        'Authorization': `Bearer ${getAuthToken('payment')}`
                    },
                    signal: AbortSignal.timeout(defaults.timeout)
                });

                const data = await response.json();
                
                if (data.status === 'completed') {
                    this.apis.analytics.trackConversion('payment', data.amount);
                }

                return {
                    status: data.status,
                    paid: data.status === 'completed',
                    amount: data.amount,
                    paidAt: data.paid_at,
                    currency: data.currency || defaults.currency
                };
            } catch (error) {
                this.logger.error('Error en verificación de pago', error);
                return { 
                    status: 'error', 
                    paid: false,
                    error: error.message 
                };
            }
        };

        const getWalletBalance = async () => {
            try {
                const response = await fetch(`${baseURLs.payment}${endpoints.getBalance}`, {
                    headers: {
                        'Authorization': `Bearer ${getAuthToken('payment')}`
                    }
                });
                return await response.json();
            } catch (error) {
                this.logger.error('Error obteniendo balance', error);
                return { balance: 0, currency: defaults.currency };
            }
        };

        return {
            name: 'PaymentAPI',
            endpoints,
            createPayment,
            verifyPayment,
            getWalletBalance
        };
    }

    // 2. API de Notificaciones Optimizada
    initNotificationAPI() {
        const { baseURLs } = this.config;
        const { queueData, getQueuedData, clearQueuedData } = this.utils;

        const methods = {
            EMAIL: 'email',
            SMS: 'sms',
            PUSH: 'push',
            WHATSAPP: 'whatsapp'
        };

        const sendEmail = async (notification) => {
            const emailData = {
                to: notification.to,
                subject: notification.subject,
                template: notification.template || 'default',
                data: notification.data,
                from: 'notificaciones@koowexa.cu',
                reply_to: 'soporte@koowexa.cu'
            };

            try {
                const response = await fetch(baseURLs.email, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-API-Key': this.utils.getAuthToken('email')
                    },
                    body: JSON.stringify(emailData)
                });

                const result = await response.json();
                this.logger.info('Email enviado exitosamente', { to: notification.to });
                return result;
            } catch (error) {
                this.logger.warn('Fallback a email nativo', { error: error.message });
                window.location.href = `mailto:${notification.to}?subject=${encodeURIComponent(notification.subject)}&body=${encodeURIComponent(notification.data.message)}`;
                return { 
                    success: true, 
                    method: 'fallback',
                    queued: !this.state.online
                };
            }
        };

        const sendSMS = async (notification) => {
            const smsData = {
                number: notification.to,
                message: notification.data.message,
                sender: 'KOOWEXA',
                type: notification.priority || 'transactional'
            };

            try {
                const response = await fetch(baseURLs.sms, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.utils.getAuthToken('sms')}`
                    },
                    body: JSON.stringify(smsData)
                });

                return await response.json();
            } catch (error) {
                this.logger.warn('SMS en cola para envío posterior', { error: error.message });
                queueData('notification_queue', { ...notification, type: 'sms' });
                return { 
                    success: true, 
                    queued: true,
                    queuePosition: this.utils.getQueuedData('notification_queue').length
                };
            }
        };

        const sendWhatsApp = async (notification) => {
            const whatsappData = {
                phone: notification.to,
                message: notification.data.message,
                template: notification.template || 'general',
                language: 'es',
                components: notification.components || []
            };

            try {
                const response = await fetch(baseURLs.whatsapp, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.utils.getAuthToken('whatsapp')}`
                    },
                    body: JSON.stringify(whatsappData)
                });

                return await response.json();
            } catch (error) {
                this.logger.warn('Fallback a enlace directo de WhatsApp');
                const whatsappUrl = `https://wa.me/${notification.to.replace('+', '')}?text=${encodeURIComponent(notification.data.message)}`;
                window.open(whatsappUrl, '_blank');
                return { 
                    success: true, 
                    method: 'direct_link' 
                };
            }
        };

        const sendPush = async (notification) => {
            if ('serviceWorker' in navigator && 'PushManager' in window) {
                try {
                    const registration = await navigator.serviceWorker.ready;
                    await registration.showNotification(notification.title, {
                        body: notification.data.message,
                        icon: '/icons/icon-192x192.png',
                        badge: '/icons/badge-72x72.png',
                        data: { 
                            url: notification.data.url,
                            type: notification.type || 'general'
                        },
                        actions: notification.actions || [
                            { action: 'view', title: 'Ver' },
                            { action: 'dismiss', title: 'Cerrar' }
                        ]
                    });
                    return { success: true };
                } catch (error) {
                    this.logger.error('Error enviando notificación push', error);
                }
            }
            return { success: false, error: 'Push notifications no disponibles' };
        };

        const send = async (notification) => {
            const methodHandlers = {
                [methods.EMAIL]: sendEmail,
                [methods.SMS]: sendSMS,
                [methods.WHATSAPP]: sendWhatsApp,
                [methods.PUSH]: sendPush
            };

            const handler = methodHandlers[notification.method];
            if (!handler) {
                return { 
                    success: false, 
                    error: `Método no soportado: ${notification.method}` 
                };
            }

            // Validación básica
            if (!notification.to) {
                return { 
                    success: false, 
                    error: 'Destinatario requerido' 
                };
            }

            try {
                const result = await handler(notification);
                
                // Trackear envío de notificación
                this.apis.analytics.trackEvent('Notification', 'Sent', notification.method, 1);
                
                return result;
            } catch (error) {
                this.logger.error('Error enviando notificación', error);
                return { 
                    success: false, 
                    error: 'Error interno del sistema',
                    details: error.message 
                };
            }
        };

        const processQueuedNotifications = async () => {
            if (!this.state.online) return;

            const queued = getQueuedData('notification_queue');
            if (queued.length === 0) return;

            this.logger.info(`Procesando ${queued.length} notificaciones en cola`);

            for (const notification of queued) {
                if (notification.attempts < this.config.defaults.maxRetries) {
                    const result = await send(notification);
                    if (result.success) {
                        // Remover de la cola
                        const updatedQueue = queued.filter(n => n.timestamp !== notification.timestamp);
                        localStorage.setItem('notification_queue', JSON.stringify(updatedQueue));
                    } else {
                        // Incrementar intentos
                        notification.attempts += 1;
                        const updatedQueue = queued.map(n => 
                            n.timestamp === notification.timestamp ? notification : n
                        );
                        localStorage.setItem('notification_queue', JSON.stringify(updatedQueue));
                    }
                }
            }
        };

        return {
            name: 'NotificationAPI',
            methods,
            send,
            processQueuedNotifications
        };
    }

    // 3. API de Analytics y Métricas Optimizada
    initAnalyticsAPI() {
        const { baseURLs } = this.config;
        const { generateId, queueData, getQueuedData } = this.utils;

        let sessionId = this.getSessionId();

        const getSessionId = () => {
            if (!sessionId) {
                sessionId = generateId('session_');
                sessionStorage.setItem('koowexa_session_id', sessionId);
            }
            return sessionId;
        };

        const getPlatform = () => {
            const ua = navigator.userAgent;
            if (/mobile/i.test(ua)) return 'mobile';
            if (/tablet/i.test(ua)) return 'tablet';
            return 'desktop';
        };

        const getUserLocation = () => {
            return {
                country: 'CU',
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                language: navigator.language,
                region: this.detectRegion()
            };
        };

        const detectRegion = () => {
            // Detectar provincia basada en timezone o IP
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            if (timezone.includes('Havana')) return 'La Habana';
            if (timezone.includes('Holguin')) return 'Holguín';
            return 'Cuba';
        };

        const trackEvent = (category, action, label = null, value = null) => {
            const eventData = {
                category,
                action,
                label,
                value,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                platform: getPlatform(),
                location: getUserLocation(),
                sessionId: getSessionId(),
                page: window.location.pathname,
                referrer: document.referrer
            };

            // Enviar inmediatamente si está online
            if (this.state.online) {
                sendToAnalyticsServer(eventData);
            } else {
                // Guardar localmente
                storeLocally(eventData);
            }

            // También guardar en sessionStorage para analytics en tiempo real
            storeInSession(eventData);
        };

        const trackPageView = (page) => {
            trackEvent('Navigation', 'Page View', page);
        };

        const trackConversion = (type, value, product = null) => {
            const eventData = {
                category: 'Conversion',
                action: type,
                label: product,
                value: value,
                timestamp: new Date().toISOString(),
                sessionId: getSessionId()
            };
            
            trackEvent('Conversion', type, product, value);
            
            // Conversiones son críticas, intentar enviar inmediatamente
            sendToAnalyticsServer(eventData, true);
        };

        const trackError = (error, context, severity = 'medium') => {
            trackEvent('Error', error.message, context, 1);
            
            const errorData = {
                type: 'error',
                message: error.message,
                stack: error.stack,
                context,
                severity,
                timestamp: new Date().toISOString(),
                url: window.location.href,
                userAgent: navigator.userAgent
            };
            
            // Los errores son importantes, enviar inmediatamente
            sendToAnalyticsServer(errorData, true);
        };

        const sendToAnalyticsServer = async (eventData, isCritical = false) => {
            if (!this.state.online && !isCritical) {
                storeLocally(eventData);
                return;
            }

            try {
                await fetch(`${baseURLs.analytics}/track`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Session-ID': getSessionId()
                    },
                    body: JSON.stringify(eventData)
                });
            } catch (error) {
                if (isCritical) {
                    queueData('critical_analytics', eventData);
                } else {
                    storeLocally(eventData);
                }
            }
        };

        const storeLocally = (eventData) => {
            const analyticsData = getQueuedData('koowexa_analytics');
            analyticsData.push(eventData);
            
            // Mantener solo últimos 200 eventos
            if (analyticsData.length > 200) {
                analyticsData.splice(0, analyticsData.length - 200);
            }
            
            localStorage.setItem('koowexa_analytics', JSON.stringify(analyticsData));
        };

        const storeInSession = (eventData) => {
            const sessionEvents = JSON.parse(sessionStorage.getItem('koowexa_session_events') || '[]');
            sessionEvents.push(eventData);
            sessionStorage.setItem('koowexa_session_events', JSON.stringify(sessionEvents));
        };

        const syncOfflineData = async () => {
            if (!this.state.online) return;

            const offlineData = getQueuedData('koowexa_analytics');
            const criticalData = getQueuedData('critical_analytics');

            if (offlineData.length === 0 && criticalData.length === 0) return;

            this.logger.info(`Sincronizando ${offlineData.length + criticalData.length} eventos de analytics`);

            // Enviar datos críticos primero
            for (const event of criticalData) {
                await sendToAnalyticsServer(event, true);
            }

            // Enviar datos regulares en lotes
            const batchSize = 10;
            for (let i = 0; i < offlineData.length; i += batchSize) {
                const batch = offlineData.slice(i, i + batchSize);
                try {
                    await fetch(`${baseURLs.analytics}/batch`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ events: batch })
                    });
                } catch (error) {
                    this.logger.error('Error sincronizando batch de analytics', error);
                    break;
                }
            }

            // Limpiar datos sincronizados
            this.utils.clearQueuedData('koowexa_analytics');
            this.utils.clearQueuedData('critical_analytics');
        };

        const getReports = () => {
            const sessionEvents = JSON.parse(sessionStorage.getItem('koowexa_session_events') || '[]');
            const localData = getQueuedData('koowexa_analytics');
            const allEvents = [...sessionEvents, ...localData];

            return {
                totalEvents: allEvents.length,
                pageViews: allEvents.filter(e => e.action === 'Page View').length,
                conversions: allEvents.filter(e => e.category === 'Conversion').length,
                errors: allEvents.filter(e => e.category === 'Error').length,
                platformBreakdown: getPlatformBreakdown(allEvents),
                popularPages: getPopularPages(allEvents),
                conversionRate: calculateConversionRate(allEvents),
                sessionDuration: calculateSessionDuration(sessionEvents)
            };
        };

        const getPlatformBreakdown = (events) => {
            const platforms = {};
            events.forEach(event => {
                const platform = event.platform;
                platforms[platform] = (platforms[platform] || 0) + 1;
            });
            return platforms;
        };

        const getPopularPages = (events) => {
            const pages = {};
            events
                .filter(e => e.action === 'Page View')
                .forEach(event => {
                    const page = event.label;
                    pages[page] = (pages[page] || 0) + 1;
                });
            return Object.entries(pages)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10);
        };

        const calculateConversionRate = (events) => {
            const pageViews = events.filter(e => e.action === 'Page View').length;
            const conversions = events.filter(e => e.category === 'Conversion').length;
            return pageViews > 0 ? (conversions / pageViews) * 100 : 0;
        };

        const calculateSessionDuration = (sessionEvents) => {
            if (sessionEvents.length < 2) return 0;
            
            const timestamps = sessionEvents.map(e => new Date(e.timestamp).getTime());
            const minTime = Math.min(...timestamps);
            const maxTime = Math.max(...timestamps);
            
            return Math.round((maxTime - minTime) / 1000); // en segundos
        };

        return {
            name: 'AnalyticsAPI',
            trackEvent,
            trackPageView,
            trackConversion,
            trackError,
            syncOfflineData,
            getReports,
            getSessionId
        };
    }

    // 4. API de Almacenamiento en la Nube Optimizada
    initStorageAPI() {
        const { baseURLs, defaults } = this.config;
        const { generateId } = this.utils;

        const providers = {
            LOCAL: 'local',
            CLOUD: 'cloud',
            IPFS: 'ipfs'
        };

        const compressImage = (file, quality = 0.7, maxWidth = 1024) => {
            return new Promise((resolve) => {
                if (!file.type.startsWith('image/')) {
                    resolve(file);
                    return;
                }

                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const img = new Image();

                img.onload = () => {
                    // Calcular nuevas dimensiones manteniendo aspect ratio
                    let { width, height } = img;
                    
                    if (width > maxWidth) {
                        height = (height * maxWidth) / width;
                        width = maxWidth;
                    }

                    canvas.width = width;
                    canvas.height = height;

                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob((blob) => {
                        const compressedFile = new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now()
                        });
                        
                        this.logger.info('Imagen comprimida', {
                            original: this.formatFileSize(file.size),
                            compressed: this.formatFileSize(blob.size),
                            reduction: `${Math.round((1 - blob.size / file.size) * 100)}%`
                        });
                        
                        resolve(compressedFile);
                    }, 'image/jpeg', quality);
                };

                img.src = URL.createObjectURL(file);
            });
        };

        const formatFileSize = (bytes) => {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        };

        const uploadToLocal = (file) => {
            return new Promise((resolve) => {
                if (file.size > defaults.maxFileSize) {
                    resolve({
                        success: false,
                        error: `Archivo demasiado grande. Máximo: ${formatFileSize(defaults.maxFileSize)}`
                    });
                    return;
                }

                const reader = new FileReader();
                reader.onload = (e) => {
                    const fileData = {
                        id: generateId('local_'),
                        name: file.name,
                        type: file.type,
                        size: file.size,
                        data: e.target.result,
                        uploadedAt: new Date().toISOString(),
                        compressed: file.compressed || false
                    };

                    // Guardar en localStorage para archivos pequeños
                    const storedFiles = this.utils.getQueuedData('koowexa_files');
                    storedFiles.push(fileData);
                    localStorage.setItem('koowexa_files', JSON.stringify(storedFiles));

                    resolve({
                        success: true,
                        fileId: fileData.id,
                        url: fileData.data,
                        storage: 'local',
                        size: fileData.size
                    });
                };
                reader.readAsDataURL(file);
            });
        };

        const uploadToCloud = async (file) => {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', 'koowexa_uploads');
            formData.append('folder', 'koowexa/stores');
            formData.append('public_id', generateId('img_'));

            try {
                const response = await fetch(baseURLs.storage, {
                    method: 'POST',
                    body: formData,
                    signal: AbortSignal.timeout(defaults.timeout)
                });

                if (!response.ok) throw new Error('Error en upload a cloud');

                const data = await response.json();
                
                this.apis.analytics.trackEvent('Storage', 'Upload', 'cloud', file.size);

                return {
                    success: true,
                    fileId: data.public_id,
                    url: data.secure_url,
                    storage: 'cloud',
                    format: data.format,
                    bytes: data.bytes
                };
            } catch (error) {
                this.logger.error('Error subiendo a cloud, fallback a local', error);
                return await uploadToLocal(file);
            }
        };

        const uploadToIPFS = async (file) => {
            try {
                const formData = new FormData();
                formData.append('file', file);

                const response = await fetch('https://ipfs.infura.io:5001/api/v0/add', {
                    method: 'POST',
                    body: formData,
                    signal: AbortSignal.timeout(defaults.timeout)
                });

                const data = await response.json();
                
                this.apis.analytics.trackEvent('Storage', 'Upload', 'ipfs', file.size);

                return {
                    success: true,
                    fileId: data.Hash,
                    url: `https://ipfs.io/ipfs/${data.Hash}`,
                    storage: 'ipfs',
                    size: data.Size
                };
            } catch (error) {
                this.logger.error('Error subiendo a IPFS, fallback a cloud', error);
                return await uploadToCloud(file);
            }
        };

        const uploadFile = async (file, options = {}) => {
            const { 
                provider = providers.CLOUD, 
                compress = true, 
                maxWidth = 1024,
                quality = 0.7
            } = options;

            // Validaciones
            if (!file) {
                return { success: false, error: 'Archivo requerido' };
            }

            if (file.size > 50 * 1024 * 1024) { // 50MB
                return { success: false, error: 'Archivo demasiado grande. Máximo: 50MB' };
            }

            let processedFile = file;

            // Comprimir imagen si es necesario
            if (compress && file.type.startsWith('image/')) {
                try {
                    processedFile = await compressImage(file, quality, maxWidth);
                    processedFile.compressed = true;
                } catch (error) {
                    this.logger.error('Error comprimiendo imagen', error);
                }
            }

            const uploadMethods = {
                [providers.LOCAL]: uploadToLocal,
                [providers.CLOUD]: uploadToCloud,
                [providers.IPFS]: uploadToIPFS
            };

            const uploadMethod = uploadMethods[provider];
            if (!uploadMethod) {
                return { 
                    success: false, 
                    error: `Proveedor no soportado: ${provider}` 
                };
            }

            try {
                const result = await uploadMethod(processedFile);
                return result;
            } catch (error) {
                this.logger.error('Error en uploadFile', error);
                return { 
                    success: false, 
                    error: 'Error subiendo archivo',
                    details: error.message 
                };
            }
        };

        const getFile = (fileId) => {
            const storedFiles = this.utils.getQueuedData('koowexa_files');
            return storedFiles.find(file => file.id === fileId);
        };

        const deleteFile = (fileId) => {
            const storedFiles = this.utils.getQueuedData('koowexa_files');
            const updatedFiles = storedFiles.filter(file => file.id !== fileId);
            localStorage.setItem('koowexa_files', JSON.stringify(updatedFiles));
            
            this.apis.analytics.trackEvent('Storage', 'Delete', 'local', 1);
            
            return { success: true };
        };

        const getStorageUsage = () => {
            const storedFiles = this.utils.getQueuedData('koowexa_files');
            const totalSize = storedFiles.reduce((sum, file) => sum + file.size, 0);
            
            return {
                fileCount: storedFiles.length,
                totalSize,
                formattedSize: formatFileSize(totalSize),
                maxLocalSize: formatFileSize(defaults.maxFileSize * 10) // Estimación
            };
        };

        return {
            name: 'StorageAPI',
            providers,
            uploadFile,
            getFile,
            deleteFile,
            getStorageUsage,
            formatFileSize
        };
    }

    // 5. API de Comunicación en Tiempo Real Optimizada
    initCommunicationAPI() {
        const { baseURLs } = this.config;
        const { generateId } = this.utils;

        let socket = null;
        const listeners = {};
        let reconnectAttempts = 0;
        const maxReconnectAttempts = 5;
        let heartbeatInterval = null;

        const connect = () => {
            try {
                socket = new WebSocket(baseURLs.realtime);
                
                socket.onopen = () => {
                    this.logger.info('Conexión WebSocket establecida');
                    reconnectAttempts = 0;
                    emit('connected');
                    startHeartbeat();
                };

                socket.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        
                        // Manejar heartbeat
                        if (data.type === 'heartbeat') {
                            socket.send(JSON.stringify({ type: 'heartbeat_ack' }));
                            return;
                        }
                        
                        emit(data.type, data.payload);
                    } catch (error) {
                        this.logger.error('Error procesando mensaje WebSocket', error);
                    }
                };

                socket.onclose = (event) => {
                    this.logger.warn('Conexión WebSocket cerrada', {
                        code: event.code,
                        reason: event.reason
                    });
                    
                    stopHeartbeat();
                    
                    if (reconnectAttempts < maxReconnectAttempts) {
                        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
                        this.logger.info(`Reconectando en ${delay}ms...`);
                        setTimeout(() => {
                            reconnectAttempts++;
                            connect();
                        }, delay);
                    } else {
                        this.logger.error('Máximo de reconexiones alcanzado, usando polling');
                        startPolling();
                    }
                };

                socket.onerror = (error) => {
                    this.logger.error('Error WebSocket', error);
                };

            } catch (error) {
                this.logger.error('Error inicializando WebSocket, usando polling', error);
                startPolling();
            }
        };

        const startHeartbeat = () => {
            heartbeatInterval = setInterval(() => {
                if (socket && socket.readyState === WebSocket.OPEN) {
                    socket.send(JSON.stringify({ type: 'heartbeat' }));
                }
            }, 30000); // Cada 30 segundos
        };

        const stopHeartbeat = () => {
            if (heartbeatInterval) {
                clearInterval(heartbeatInterval);
                heartbeatInterval = null;
            }
        };

        const startPolling = () => {
            this.logger.info('Iniciando polling para mensajes');
            setInterval(() => {
                checkMessages();
            }, 10000); // Poll cada 10 segundos
        };

        const checkMessages = async () => {
            if (!this.state.online) return;

            try {
                const response = await fetch('https://api.koowexa.cu/messages/poll', {
                    headers: {
                        'X-Session-ID': this.apis.analytics.getSessionId()
                    }
                });
                
                if (response.ok) {
                    const messages = await response.json();
                    messages.forEach(message => {
                        emit('message', message);
                    });
                }
            } catch (error) {
                this.logger.debug('Polling failed, probablemente offline', error);
            }
        };

        const on = (event, callback) => {
            if (!listeners[event]) {
                listeners[event] = [];
            }
            listeners[event].push(callback);
        };

        const off = (event, callback) => {
            if (listeners[event]) {
                listeners[event] = listeners[event].filter(cb => cb !== callback);
            }
        };

        const emit = (event, data) => {
            if (listeners[event]) {
                listeners[event].forEach(callback => {
                    try {
                        callback(data);
                    } catch (error) {
                        this.logger.error(`Error en listener del evento ${event}`, error);
                    }
                });
            }
        };

        const sendMessage = (type, payload) => {
            if (socket && socket.readyState === WebSocket.OPEN) {
                const message = {
                    type,
                    payload,
                    timestamp: Date.now(),
                    messageId: generateId('msg_')
                };
                socket.send(JSON.stringify(message));
            } else {
                // Fallback a HTTP
                fetch('https://api.koowexa.cu/messages/send', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Session-ID': this.apis.analytics.getSessionId()
                    },
                    body: JSON.stringify({ type, payload })
                }).catch(error => {
                    this.logger.error('Error enviando mensaje por HTTP', error);
                });
            }
        };

        const startSupportChat = (userId) => {
            sendMessage('support_join', { 
                userId,
                sessionId: this.apis.analytics.getSessionId(),
                userAgent: navigator.userAgent
            });
        };

        const sendSupportMessage = (message) => {
            sendMessage('support_message', {
                text: this.utils.sanitizeInput(message),
                timestamp: Date.now(),
                messageId: generateId('support_')
            });
        };

        const disconnect = () => {
            if (socket) {
                socket.close(1000, 'Disconnect requested');
            }
            stopHeartbeat();
        };

        const getConnectionStatus = () => {
            if (!socket) return 'disconnected';
            
            switch (socket.readyState) {
                case WebSocket.CONNECTING: return 'connecting';
                case WebSocket.OPEN: return 'connected';
                case WebSocket.CLOSING: return 'closing';
                case WebSocket.CLOSED: return 'disconnected';
                default: return 'unknown';
            }
        };

        return {
            name: 'CommunicationAPI',
            connect,
            disconnect,
            on,
            off,
            sendMessage,
            startSupportChat,
            sendSupportMessage,
            getConnectionStatus
        };
    }

    // 6. API de Geoubicación y Mapas Optimizada
    initLocationAPI() {
        const { generateId } = this.utils;

        const getCurrentLocation = () => {
            return new Promise((resolve) => {
                if (!navigator.geolocation) {
                    resolve(getLocationByIP());
                    return;
                }

                const options = {
                    enableHighAccuracy: false,
                    timeout: 10000,
                    maximumAge: 600000 // 10 minutos
                };

                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const location = {
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude,
                            accuracy: position.coords.accuracy,
                            altitude: position.coords.altitude,
                            altitudeAccuracy: position.coords.altitudeAccuracy,
                            heading: position.coords.heading,
                            speed: position.coords.speed,
                            source: 'gps',
                            timestamp: new Date(position.timestamp)
                        };
                        
                        // Guardar ubicación en sessionStorage
                        sessionStorage.setItem('last_known_location', JSON.stringify(location));
                        
                        resolve(location);
                    },
                    (error) => {
                        this.logger.warn('GPS falló, usando IP o ubicación guardada', error);
                        resolve(getFallbackLocation());
                    },
                    options
                );
            });
        };

        const getFallbackLocation = async () => {
            // Primero intentar ubicación guardada
            const lastLocation = sessionStorage.getItem('last_known_location');
            if (lastLocation) {
                const location = JSON.parse(lastLocation);
                location.source = 'cached';
                return location;
            }

            // Luego intentar por IP
            return await getLocationByIP();
        };

        const getLocationByIP = async () => {
            try {
                const response = await fetch('https://ipapi.co/json/');
                const data = await response.json();
                
                return {
                    latitude: data.latitude,
                    longitude: data.longitude,
                    city: data.city,
                    region: data.region,
                    country: data.country_name,
                    country_code: data.country_code,
                    postal: data.postal,
                    source: 'ip'
                };
            } catch (error) {
                this.logger.error('Error obteniendo ubicación por IP', error);
                // Fallback a ubicación por defecto (Holguín, Cuba)
                return {
                    latitude: 20.8875,
                    longitude: -76.2575,
                    city: 'Holguín',
                    region: 'Holguín',
                    country: 'Cuba',
                    country_code: 'CU',
                    source: 'default'
                };
            }
        };

        const getProvinces = () => {
            return [
                { id: '01', name: 'Pinar del Río', capital: 'Pinar del Río' },
                { id: '02', name: 'Artemisa', capital: 'Artemisa' },
                { id: '03', name: 'La Habana', capital: 'La Habana' },
                { id: '04', name: 'Mayabeque', capital: 'San José de las Lajas' },
                { id: '05', name: 'Matanzas', capital: 'Matanzas' },
                { id: '06', name: 'Cienfuegos', capital: 'Cienfuegos' },
                { id: '07', name: 'Villa Clara', capital: 'Santa Clara' },
                { id: '08', name: 'Sancti Spíritus', capital: 'Sancti Spíritus' },
                { id: '09', name: 'Ciego de Ávila', capital: 'Ciego de Ávila' },
                { id: '10', name: 'Camagüey', capital: 'Camagüey' },
                { id: '11', name: 'Las Tunas', capital: 'Las Tunas' },
                { id: '12', name: 'Holguín', capital: 'Holguín' },
                { id: '13', name: 'Granma', capital: 'Bayamo' },
                { id: '14', name: 'Santiago de Cuba', capital: 'Santiago de Cuba' },
                { id: '15', name: 'Guantánamo', capital: 'Guantánamo' },
                { id: '16', name: 'Isla de la Juventud', capital: 'Nueva Gerona' }
            ];
        };

        const getMunicipalities = (provinceId) => {
            // Datos de ejemplo - en producción esto vendría de una API
            const municipalities = {
                '12': [ // Holguín
                    { id: '1201', name: 'Holguín' },
                    { id: '1202', name: 'Báguanos' },
                    { id: '1203', name: 'Calixto García' },
                    { id: '1204', name: 'Cueto' },
                    { id: '1205', name: 'Frank País' },
                    { id: '1206', name: 'Gibara' },
                    { id: '1207', name: 'Mayarí' },
                    { id: '1208', name: 'Moa' },
                    { id: '1209', name: 'Rafael Freyre' },
                    { id: '1210', name: 'Sagua de Tánamo' },
                    { id: '1211', name: 'Urbano Noris' },
                    { id: '1212', name: 'Banes' },
                    { id: '1213', name: 'Antilla' },
                    { id: '1214', name: 'Cacocum' }
                ]
                // ... otros municipios
            };
            
            return municipalities[provinceId] || [];
        };

        const calculateDistance = (lat1, lon1, lat2, lon2, unit = 'km') => {
            // Fórmula de Haversine
            const R = unit === 'km' ? 6371 : 3959; // Radio en km o millas
            const dLat = toRad(lat2 - lat1);
            const dLon = toRad(lon2 - lon1);
            
            const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                     Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
                     Math.sin(dLon/2) * Math.sin(dLon/2);
            
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            return R * c;
        };

        const toRad = (degrees) => {
            return degrees * (Math.PI/180);
        };

        const getNearbyStores = async (location, radiusKm = 10, filters = {}) => {
            const stores = await getStores();
            
            return stores
                .filter(store => {
                    // Filtrar por distancia
                    const distance = calculateDistance(
                        location.latitude, location.longitude,
                        store.latitude, store.longitude
                    );
                    
                    if (distance > radiusKm) return false;
                    
                    // Aplicar filtros adicionales
                    if (filters.category && store.category !== filters.category) return false;
                    if (filters.openNow && !store.isOpen) return false;
                    if (filters.rating && store.rating < filters.rating) return false;
                    
                    return true;
                })
                .map(store => ({
                    ...store,
                    distance: calculateDistance(
                        location.latitude, location.longitude,
                        store.latitude, store.longitude
                    )
                }))
                .sort((a, b) => a.distance - b.distance);
        };

        const getStores = async () => {
            // En producción, esto vendría de una API
            return [
                {
                    id: 1,
                    name: 'Tienda KOOWEXA Holguín Centro',
                    latitude: 20.8875,
                    longitude: -76.2575,
                    address: 'Calle Libertad #123, Holguín',
                    category: 'tecnologia',
                    rating: 4.5,
                    isOpen: true,
                    hours: '8:00-20:00',
                    phone: '+5351234567'
                },
                {
                    id: 2,
                    name: 'KOOWEXA La Habana Vedado',
                    latitude: 23.1136,
                    longitude: -82.3666,
                    address: 'Av. 23 #456, Vedado, La Habana',
                    category: 'tecnologia',
                    rating: 4.8,
                    isOpen: true,
                    hours: '9:00-18:00',
                    phone: '+5357654321'
                },
                {
                    id: 3,
                    name: 'KOOWEXA Santiago de Cuba',
                    latitude: 20.0217,
                    longitude: -75.8294,
                    address: 'Calle Aguilera #789, Santiago de Cuba',
                    category: 'tecnologia',
                    rating: 4.3,
                    isOpen: false,
                    hours: '8:30-17:30',
                    phone: '+5355555555'
                }
            ];
        };

        const geocodeAddress = async (address) => {
            try {
                // Servicio de geocodificación para Cuba
                const response = await fetch('https://api.geocoding.cu/search', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ address })
                });
                
                const data = await response.json();
                return data.results[0] || null;
            } catch (error) {
                this.logger.error('Error en geocodificación', error);
                return null;
            }
        };

        return {
            name: 'LocationAPI',
            getCurrentLocation,
            getProvinces,
            getMunicipalities,
            calculateDistance,
            getNearbyStores,
            geocodeAddress
        };
    }

    // 7. API de Validación de Datos Optimizada
    initValidationAPI() {
        const { sanitizeInput, formatCurrency } = this.utils;

        const validateEmail = (email) => {
            const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return regex.test(email);
        };

        const validatePhone = (phone) => {
            // Formato de teléfono cubano: +53 5xx xxxxx o 05xx xxxxx
            const regex = /^(\+53\s?)?5\d{7}$|^05\d{7}$/;
            return regex.test(phone.replace(/\s/g, ''));
        };

        const validateCUPAmount = (amount) => {
            const numAmount = parseFloat(amount);
            return !isNaN(numAmount) && numAmount > 0 && numAmount <= 1000000; // Máximo 1,000,000 CUP
        };

        const validateProductData = (product) => {
            const errors = [];

            if (!product.name || product.name.trim().length < 2) {
                errors.push('El nombre del producto debe tener al menos 2 caracteres');
            }

            if (!product.price || !validateCUPAmount(product.price)) {
                errors.push('El precio debe ser un valor válido en CUP entre 1 y 1,000,000');
            }

            if (product.description && product.description.length > 1000) {
                errors.push('La descripción no puede exceder 1000 caracteres');
            }

            if (product.category && !['tecnologia', 'hogar', 'ropa', 'alimentos', 'otros'].includes(product.category)) {
                errors.push('Categoría no válida');
            }

            if (product.stock !== undefined && (!Number.isInteger(product.stock) || product.stock < 0)) {
                errors.push('El stock debe ser un número entero no negativo');
            }

            return {
                isValid: errors.length === 0,
                errors
            };
        };

        const validateStoreData = (store) => {
            const errors = [];

            if (!store.name || store.name.trim().length < 3) {
                errors.push('El nombre del negocio debe tener al menos 3 caracteres');
            }

            if (!store.category) {
                errors.push('Se debe seleccionar una categoría');
            }

            if (!store.contact_email || !validateEmail(store.contact_email)) {
                errors.push('Email de contacto inválido');
            }

            if (store.contact_phone && !validatePhone(store.contact_phone)) {
                errors.push('Teléfono de contacto inválido. Formato: +53 5xx xxxxx');
            }

            if (store.address && store.address.length < 10) {
                errors.push('La dirección debe ser más específica');
            }

            if (store.description && store.description.length > 500) {
                errors.push('La descripción del negocio no puede exceder 500 caracteres');
            }

            return {
                isValid: errors.length === 0,
                errors
            };
        };

        const validateUserData = (user) => {
            const errors = [];

            if (!user.name || user.name.trim().length < 2) {
                errors.push('El nombre debe tener al menos 2 caracteres');
            }

            if (!user.email || !validateEmail(user.email)) {
                errors.push('Email inválido');
            }

            if (user.phone && !validatePhone(user.phone)) {
                errors.push('Teléfono inválido');
            }

            if (user.password) {
                if (user.password.length < 8) {
                    errors.push('La contraseña debe tener al menos 8 caracteres');
                }
                if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(user.password)) {
                    errors.push('La contraseña debe contener mayúsculas, minúsculas y números');
                }
            }

            return {
                isValid: errors.length === 0,
                errors
            };
        };

        const sanitizeProductData = (product) => {
            return {
                ...product,
                name: sanitizeInput(product.name),
                description: product.description ? sanitizeInput(product.description) : '',
                category: sanitizeInput(product.category),
                tags: product.tags ? product.tags.map(tag => sanitizeInput(tag)) : []
            };
        };

        const formatPhone = (phone) => {
            const cleaned = phone.replace(/\D/g, '');
            
            if (cleaned.length === 8) {
                return `+53${cleaned}`;
            } else if (cleaned.startsWith('53') && cleaned.length === 10) {
                return `+${cleaned}`;
            }
            
            return cleaned;
        };

        const validateImageFile = (file) => {
            const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
            const maxSize = 10 * 1024 * 1024; // 10MB

            if (!allowedTypes.includes(file.type)) {
                return { 
                    isValid: false, 
                    error: 'Tipo de archivo no permitido. Use JPEG, PNG, WebP o GIF' 
                };
            }

            if (file.size > maxSize) {
                return { 
                    isValid: false, 
                    error: 'Archivo demasiado grande. Máximo 10MB' 
                };
            }

            return { isValid: true };
        };

        return {
            name: 'ValidationAPI',
            validateEmail,
            validatePhone,
            validateCUPAmount,
            validateProductData,
            validateStoreData,
            validateUserData,
            validateImageFile,
            sanitizeProductData,
            formatPhone,
            formatCurrency
        };
    }

    // 8. API de Soporte Técnico Optimizada
    initSupportAPI() {
        const { baseURLs } = this.config;
        const { generateId, queueData, getQueuedData, clearQueuedData } = this.utils;

        const createTicket = async (ticketData) => {
            const ticket = {
                id: generateId('T'),
                subject: ticketData.subject,
                description: ticketData.description,
                category: ticketData.category || 'general',
                priority: ticketData.priority || 'medium',
                status: 'open',
                created_at: new Date().toISOString(),
                user: {
                    email: ticketData.email,
                    name: ticketData.name,
                    phone: ticketData.phone,
                    userId: ticketData.userId
                },
                attachments: ticketData.attachments || [],
                metadata: {
                    userAgent: navigator.userAgent,
                    url: window.location.href,
                    sessionId: this.apis.analytics.getSessionId()
                }
            };

            try {
                const response = await fetch(`${baseURLs.support}/tickets`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-User-Email': ticketData.email
                    },
                    body: JSON.stringify(ticket)
                });

                if (!response.ok) throw new Error('Error creando ticket');

                const result = await response.json();
                
                // Notificar al usuario
                this.apis.notification.send({
                    method: 'email',
                    to: ticketData.email,
                    subject: `Ticket de soporte creado: ${result.ticket_id}`,
                    data: {
                        message: `Hemos recibido tu solicitud de soporte. Número de ticket: ${result.ticket_id}. Te contactaremos pronto.`,
                        ticket_id: result.ticket_id,
                        subject: ticketData.subject
                    }
                });

                // Trackear creación de ticket
                this.apis.analytics.trackEvent('Support', 'Ticket Created', ticketData.category, 1);

                return {
                    success: true,
                    ticket_id: result.ticket_id,
                    message: 'Ticket creado exitosamente'
                };
            } catch (error) {
                this.logger.error('Error creando ticket, guardando en cola', error);
                queueData('koowexa_queued_tickets', ticket);
                
                return {
                    success: true,
                    ticket_id: ticket.id,
                    queued: true,
                    message: 'Ticket guardado para envío cuando haya conexión'
                };
            }
        };

        const getKnowledgeBase = async (category = null) => {
            const articles = [
                {
                    id: 1,
                    title: 'Cómo crear tu tienda online en KOOWEXA',
                    category: 'tienda',
                    content: 'Guía paso a paso para configurar tu tienda online con KOOWEXA. Desde el registro hasta la publicación de productos.',
                    tags: ['tienda', 'configuración', 'inicio', 'guía'],
                    difficulty: 'beginner',
                    readTime: 5
                },
                {
                    id: 2,
                    title: 'Gestión de productos y inventario',
                    category: 'tienda',
                    content: 'Aprende a agregar, editar y administrar productos en tu tienda. Control de inventario y variantes.',
                    tags: ['productos', 'inventario', 'gestión', 'categorías'],
                    difficulty: 'beginner',
                    readTime: 8
                },
                {
                    id: 3,
                    title: 'Configuración de métodos de pago',
                    category: 'pagos',
                    content: 'Cómo configurar y gestionar los diferentes métodos de pago disponibles para tu tienda.',
                    tags: ['pagos', 'configuración', 'transferencias', 'cup'],
                    difficulty: 'intermediate',
                    readTime: 6
                },
                {
                    id: 4,
                    title: 'Problemas comunes de conexión',
                    category: 'tecnico',
                    content: 'Soluciones para problemas comunes de conectividad y acceso a la plataforma.',
                    tags: ['conexión', 'tecnico', 'solución', 'acceso'],
                    difficulty: 'beginner',
                    readTime: 4
                },
                {
                    id: 5,
                    title: 'Optimización de imágenes para productos',
                    category: 'tienda',
                    content: 'Mejores prácticas para optimizar imágenes de productos y mejorar el rendimiento.',
                    tags: ['imágenes', 'optimización', 'productos', 'rendimiento'],
                    difficulty: 'intermediate',
                    readTime: 7
                }
            ];

            if (category) {
                return articles.filter(article => article.category === category);
            }

            return articles;
        };

        const searchKnowledgeBase = async (query, filters = {}) => {
            const articles = await getKnowledgeBase();
            const searchTerm = query.toLowerCase().trim();
            
            if (!searchTerm) return articles;

            return articles.filter(article => {
                const matchesSearch = 
                    article.title.toLowerCase().includes(searchTerm) ||
                    article.content.toLowerCase().includes(searchTerm) ||
                    article.tags.some(tag => tag.toLowerCase().includes(searchTerm));

                if (!matchesSearch) return false;

                // Aplicar filtros
                if (filters.category && article.category !== filters.category) return false;
                if (filters.difficulty && article.difficulty !== filters.difficulty) return false;
                if (filters.maxReadTime && article.readTime > filters.maxReadTime) return false;

                return true;
            }).sort((a, b) => {
                // Ordenar por relevancia
                const aScore = calculateRelevanceScore(a, searchTerm);
                const bScore = calculateRelevanceScore(b, searchTerm);
                return bScore - aScore;
            });
        };

        const calculateRelevanceScore = (article, searchTerm) => {
            let score = 0;
            
            if (article.title.toLowerCase().includes(searchTerm)) score += 3;
            if (article.content.toLowerCase().includes(searchTerm)) score += 1;
            if (article.tags.some(tag => tag.toLowerCase().includes(searchTerm))) score += 2;
            
            return score;
        };

        const getSystemStatus = async () => {
            try {
                const response = await fetch(`${baseURLs.support}/status`);
                return await response.json();
            } catch (error) {
                // Estado por defecto si no se puede conectar
                return {
                    platform: 'operational',
                    payments: 'operational',
                    storage: 'operational',
                    api: 'operational',
                    last_updated: new Date().toISOString(),
                    source: 'cache'
                };
            }
        };

        const getTicketStatus = async (ticketId) => {
            try {
                const response = await fetch(`${baseURLs.support}/tickets/${ticketId}`);
                return await response.json();
            } catch (error) {
                // Buscar en tickets en cola
                const queuedTickets = getQueuedData('koowexa_queued_tickets');
                const ticket = queuedTickets.find(t => t.id === ticketId);
                return ticket ? { ...ticket, status: 'queued' } : null;
            }
        };

        const getFaqs = async () => {
            return [
                {
                    question: '¿Cómo creo mi tienda online?',
                    answer: 'Regístrate en KOOWEXA, completa tu perfil de negocio y comienza a agregar productos. Nuestro equipo te guiará en el proceso.',
                    category: 'tienda'
                },
                {
                    question: '¿Qué métodos de pago aceptan?',
                    answer: 'Aceptamos transferencias en CUP, tarjetas nacionales y estamos integrando más opciones de pago para Cuba.',
                    category: 'pagos'
                },
                {
                    question: '¿Cómo contacto con soporte?',
                    answer: 'Puedes crear un ticket de soporte desde tu panel de control o escribirnos a soporte@koowexa.cu',
                    category: 'soporte'
                }
            ];
        };

        return {
            name: 'SupportAPI',
            createTicket,
            getKnowledgeBase,
            searchKnowledgeBase,
            getSystemStatus,
            getTicketStatus,
            getFaqs
        };
    }

    // Métodos de utilidad globales optimizados
    async initialize() {
        this.logger.info('Inicializando APIs de KOOWEXA...');
        
        try {
            // Inicializar APIs que necesitan conexión
            if (this.apis.communication.connect) {
                this.apis.communication.connect();
            }

            // Sincronizar datos pendientes
            await this.syncQueuedData();
            
            // Inicializar analytics
            this.apis.analytics.trackEvent('System', 'Initialized', 'APIs Loaded');
            
            this.logger.info('APIs de KOOWEXA inicializadas exitosamente', {
                online: this.state.online,
                apis: Object.keys(this.apis)
            });
            
        } catch (error) {
            this.logger.error('Error inicializando APIs', error);
        }
    }

    async syncQueuedData() {
        if (!this.state.online) {
            this.logger.debug('Modo offline, posponiendo sincronización');
            return;
        }

        this.logger.info('Iniciando sincronización de datos en cola...');

        try {
            // Sincronizar tickets en cola
            const queuedTickets = this.utils.getQueuedData('koowexa_queued_tickets');
            if (queuedTickets.length > 0) {
                this.logger.info(`Sincronizando ${queuedTickets.length} tickets`);
                
                for (const ticket of queuedTickets) {
                    await this.apis.support.createTicket(ticket);
                }
                
                this.utils.clearQueuedData('koowexa_queued_tickets');
            }

            // Sincronizar analytics offline
            if (this.apis.analytics.syncOfflineData) {
                await this.apis.analytics.syncOfflineData();
            }

            // Procesar notificaciones en cola
            if (this.apis.notification.processQueuedNotifications) {
                await this.apis.notification.processQueuedNotifications();
            }

            this.state.lastSync = new Date().toISOString();
            this.logger.info('Sincronización completada exitosamente');

        } catch (error) {
            this.logger.error('Error en sincronización', error);
        }
    }

    // Método para obtener una API específica
    getAPI(apiName) {
        const api = this.apis[apiName];
        if (!api) {
            this.logger.warn(`API no encontrada: ${apiName}`);
        }
        return api;
    }

    // Método para verificar el estado de todas las APIs
    getStatus() {
        const status = {};
        
        Object.keys(this.apis).forEach(apiName => {
            const api = this.apis[apiName];
            status[apiName] = {
                name: api.name,
                status: 'active',
                online: this.state.online,
                lastSync: this.state.lastSync
            };
            
            // Estado específico de comunicación
            if (apiName === 'communication' && api.getConnectionStatus) {
                status[apiName].connectionStatus = api.getConnectionStatus();
            }
        });
        
        return status;
    }

    // Método para limpiar datos temporales
    cleanup() {
        const keysToKeep = [
            'koowexa_payment_token',
            'koowexa_email_token',
            'koowexa_session_id',
            'last_known_location'
        ];
        
        const allKeys = Object.keys(localStorage);
        allKeys.forEach(key => {
            if (key.startsWith('koowexa_') && !keysToKeep.includes(key)) {
                localStorage.removeItem(key);
            }
        });
        
        this.logger.info('Limpieza de datos temporales completada');
    }

    // Método para obtener métricas del sistema
    getSystemMetrics() {
        const analyticsReports = this.apis.analytics.getReports();
        const storageUsage = this.apis.storage.getStorageUsage();
        const status = this.getStatus();
        
        return {
            analytics: analyticsReports,
            storage: storageUsage,
            apis: status,
            system: {
                online: this.state.online,
                userAgent: navigator.userAgent,
                language: navigator.language,
                platform: navigator.platform,
                cookiesEnabled: navigator.cookieEnabled,
                javaEnabled: navigator.javaEnabled(),
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
            }
        };
    }
}

// Instancia global de las APIs
window.KOOWEXA_API = new KOOWEXAAPIs();

// Inicializar cuando se carga la página
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.KOOWEXA_API.initialize();
    });
} else {
    window.KOOWEXA_API.initialize();
}

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = KOOWEXAAPIs;
}

// Ejemplos de uso actualizados:
/*
// 1. Procesar un pago
const paymentResult = await KOOWEXA_API.getAPI('payment').createPayment({
    amount: 2000,
    description: 'Plan Tienda Online Básico',
    email: 'cliente@ejemplo.com',
    serviceType: 'tienda_online',
    planName: 'Básico',
    userId: 'user_123'
});

// 2. Enviar notificación multi-método
await KOOWEXA_API.getAPI('notification').send({
    method: 'whatsapp',
    to: '+5351234567',
    subject: 'Bienvenido a KOOWEXA',
    data: {
        message: '¡Tu tienda online está lista para usar! Accede ahora para personalizarla.',
        url: 'https://tienda.koowexa.cu/dashboard'
    },
    priority: 'high'
});

// 3. Analytics avanzado
KOOWEXA_API.getAPI('analytics').trackConversion('premium_plan', 5000, 'Plan Premium Annual');
KOOWEXA_API.getAPI('analytics').trackPageView('/checkout/success');

// 4. Subir imagen optimizada
const uploadResult = await KOOWEXA_API.getAPI('storage').uploadFile(file, {
    provider: 'cloud',
    compress: true,
    maxWidth: 800,
    quality: 0.8
});

// 5. Validación completa de tienda
const storeValidation = KOOWEXA_API.getAPI('validation').validateStoreData(storeData);
if (storeValidation.isValid) {
    const sanitizedData = KOOWEXA_API.getAPI('validation').sanitizeProductData(storeData);
    // Proceder con el guardado
}

// 6. Soporte con knowledge base
const articles = await KOOWEXA_API.getAPI('support').searchKnowledgeBase('pagos', {
    category: 'pagos',
    maxReadTime: 10
});

// 7. Obtener métricas del sistema
const metrics = KOOWEXA_API.getSystemMetrics();
console.log('Estado del sistema:', metrics);
*/