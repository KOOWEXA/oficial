// servicios.js - Gestión de servicios KOOWEXA (Versión Optimizada)

class KOOWEXAServices {
    constructor(containerId = 'servicesContent') {
        this.containerId = containerId;
        this.servicesContent = document.getElementById(containerId);
        this._cachedHTML = null;
        this.servicesData = this.getServicesData();
        this.init();
    }

    init() {
        try {
            if (!this.servicesContent) {
                throw new Error(`Elemento con ID "${this.containerId}" no encontrado en el DOM`);
            }
            this.loadServicesContent();
        } catch (error) {
            console.error('Error inicializando KOOWEXAServices:', error);
            this.handleInitError(error);
        }
    }

    getServicesData() {
        return {
            description: {
                title: "¿Qué es KOOWEXA?",
                content: "KOOWEXA es una plataforma digital profesional, diseñada específicamente para negocios cubanos y emprendedores que desean establecer su presencia en internet con herramientas optimizadas para ti."
            },
            services: {
                title: "Nuestros Servicios",
                items: [
                    {
                        title: "Herramientas Digitales Optimizadas",
                        description: "Desarrollamos tiendas online y servicios simplificados que funcionan eficientemente incluso con conexiones lentas."
                    },
                    {
                        title: "Hospedaje Web Especializado",
                        description: "Servidores disponibles para tu negocio online en KOOPAGES, garantizando disponibilidad y visibilidad."
                    },
                    {
                        title: "Soluciones Personalizadas",
                        description: "Adaptamos cada proyecto a las necesidades específicas de tu negocio."
                    }
                ]
            },
            advantages: {
                title: "Ventajas Competitivas",
                items: [
                    "Optimización para Cuba: Nuestras soluciones están diseñadas considerando las particularidades de la conectividad en Cuba.",
                    "Precios Accesibles: Ofrecemos servicios de calidad a precios adaptados a la realidad económica cubana.",
                    "Soporte Local: Entendemos las necesidades específicas de los negocios cubanos."
                ]
            },
            investment: {
                title: "Inversión y Tiempos",
                items: [
                    "Desarrollo de herramienta digital: $2000 CUP con plazo de entrega de los resultados en 48 horas aproximadamente.",
                    "Para nuevos clientes: se le ofrece 3 meses de disponibilidad de su negocio en internet, (la oferta en virgente en 12 horas habiles desde el primer contacto).",
                    "Mantenimiento y actualizaciones despues del periodo acordado: el costo varia entre 600 y 1200 CUP según complejidad y cantidad de cambios."
                ]
            },
            warranty: {
                title: "Garantía y Condiciones",
                content: "Ofrecemos un período de prueba de 1 mes con posibilidad de reembolso del 50% si decides no continuar con el servicio prestado, el compromiso es tu satisfacción con el resultado del trabajo final."
            },
            contact: {
                title: "¿Interesado en nuestros servicios?",
                email: "koowexa@gmail.com",
                subject: "Solicitud de Servicios KOOWEXA",
                body: "Hola, me interesa conocer más sobre sus prestaciones."
            }
        };
    }

    loadServicesContent() {
        this.servicesContent.innerHTML = this.getServicesHTML();
        this.bindEvents();
    }

    getServicesHTML() {
        if (!this._cachedHTML) {
            this._cachedHTML = this.generateServicesHTML();
        }
        return this._cachedHTML;
    }

    generateServicesHTML() {
        const data = this.servicesData;
        
        return `
            <section class="service-section" aria-labelledby="koowexa-desc">
                <h3 id="koowexa-desc">${this.escapeHTML(data.description.title)}</h3>
                <p>${this.escapeHTML(data.description.content)}</p>
            </section>

            <section class="service-section" aria-labelledby="our-services">
                <h3 id="our-services">${this.escapeHTML(data.services.title)}</h3>
                <ul class="services-list">
                    ${data.services.items.map(service => `
                        <li class="service-item">
                            <strong>${this.escapeHTML(service.title)}:</strong> 
                            ${this.escapeHTML(service.description)}
                        </li>
                    `).join('')}
                </ul>
            </section>

            <section class="service-section" aria-labelledby="competitive-advantages">
                <h3 id="competitive-advantages">${this.escapeHTML(data.advantages.title)}</h3>
                <ol class="advantages-list">
                    ${data.advantages.items.map(advantage => `
                        <li class="advantage-item">
                            <strong>${this.escapeHTML(advantage.split(':')[0])}:</strong>
                            ${this.escapeHTML(advantage.split(':').slice(1).join(':'))}
                        </li>
                    `).join('')}
                </ol>
            </section>

            <section class="service-section" aria-labelledby="investment-info">
                <h3 id="investment-info">${this.escapeHTML(data.investment.title)}</h3>
                <ul class="investment-list">
                    ${data.investment.items.map(item => `
                        <li class="investment-item">${this.escapeHTML(item)}</li>
                    `).join('')}
                </ul>
            </section>

            <section class="service-section" aria-labelledby="warranty-info">
                <h3 id="warranty-info">${this.escapeHTML(data.warranty.title)}</h3>
                <p>${this.escapeHTML(data.warranty.content)}</p>
            </section>

            <section class="service-section contact-cta-section" aria-labelledby="contact-cta">
                <div class="contact-cta" role="complementary">
                    <p id="contact-cta"><strong>${this.escapeHTML(data.contact.title)}</strong></p>
                    <a href="${this.generateMailToLink()}" class="email-btn" aria-label="Contactar por email">
                        <i class="fas fa-envelope" aria-hidden="true"></i> 
                        Contáctanos
                    </a>
                </div>
            </section>
        `;
    }

    generateMailToLink() {
        const { email, subject, body } = this.servicesData.contact;
        return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }

    escapeHTML(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    bindEvents() {
        const emailBtn = this.servicesContent.querySelector('.email-btn');
        if (emailBtn) {
            emailBtn.addEventListener('click', this.handleEmailClick.bind(this));
        }
    }

    handleEmailClick(event) {
        // Analytics tracking o lógica adicional aquí
        console.log('Botón de contacto clickeado');
    }

    handleInitError(error) {
        // Podría mostrar un mensaje amigable al usuario
        const fallbackElement = document.createElement('div');
        fallbackElement.className = 'services-error';
        fallbackElement.innerHTML = `
            <p>No se pudieron cargar los servicios en este momento.</p>
            <button onclick="location.reload()">Reintentar</button>
        `;
        
        if (this.servicesContent) {
            this.servicesContent.appendChild(fallbackElement);
        } else {
            document.body.appendChild(fallbackElement);
        }
    }

    // Método para actualizar datos dinámicamente
    updateServicesData(newData) {
        this.servicesData = { ...this.servicesData, ...newData };
        this._cachedHTML = null; // Invalidar cache
        this.loadServicesContent();
    }

    // Método para destruir instancia y limpiar eventos
    destroy() {
        this._cachedHTML = null;
        this.servicesContent.innerHTML = '';
    }
}

// Factory function para múltiples instancias
const KOOWEXAServicesManager = {
    instances: new Map(),

    create(containerId = 'servicesContent') {
        if (this.instances.has(containerId)) {
            console.warn(`Instancia para ${containerId} ya existe`);
            return this.instances.get(containerId);
        }

        const instance = new KOOWEXAServices(containerId);
        this.instances.set(containerId, instance);
        return instance;
    },

    destroy(containerId) {
        const instance = this.instances.get(containerId);
        if (instance) {
            instance.destroy();
            this.instances.delete(containerId);
        }
    },

    destroyAll() {
        this.instances.forEach(instance => instance.destroy());
        this.instances.clear();
    }
};

// Inicialización optimizada con verificación de dependencias
const initializeKOOWEXAServices = () => {
    if (typeof document === 'undefined') {
        console.warn('KOOWEXAServices: Entorno DOM no disponible');
        return;
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            KOOWEXAServicesManager.create();
        });
    } else {
        KOOWEXAServicesManager.create();
    }
};

// Auto-inicialización cuando el script es cargado
initializeKOOWEXAServices();

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { KOOWEXAServices, KOOWEXAServicesManager };
} else if (typeof window !== 'undefined') {
    window.KOOWEXAServices = KOOWEXAServices;
    window.KOOWEXAServicesManager = KOOWEXAServicesManager;
}