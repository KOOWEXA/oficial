// servicios.js - Gestión de servicios KOOWEXA

class KOOWEXAServices {
    constructor() {
        this.servicesContent = document.getElementById('servicesContent');
        this.init();
    }

    init() {
        this.loadServicesContent();
    }

    loadServicesContent() {
        if (this.servicesContent) {
            this.servicesContent.innerHTML = this.getServicesHTML();
        }
    }

    getServicesHTML() {
        return `
            <h3>¿Qué es KOOWEXA?</h3>
            <p>KOOWEXA es una plataforma digital profesional, diseñada específicamente para negocios cubanos y emprendedores que desean establecer su presencia en internet con herramientas optimizadas para ti.</p>
            
            <h3>Nuestros Servicios</h3>
            <ul>
                <li><strong>Herramientas Digitales Optimizadas:</strong> Desarrollamos tiendas online y servicios simplificados que funcionan eficientemente incluso con conexiones lentas.</li>
                <li><strong>Hospedaje Web Especializado:</strong> Servidores disponibles para tu negocio online este en KOOPAGES, garantizando disponibilidad y vision.</li>
                <li><strong>Soluciones Personalizadas:</strong> Adaptamos cada proyecto a las necesidades específicas de tu negocio.</li>
            </ul>
            
            <h3>Ventajas Competitivas</h3>
            <ol>
                <li><strong>Optimización para Cuba:</strong> Nuestras soluciones están diseñadas considerando las particularidades de la conectividad en Cuba.</li>
                <li><strong>Precios Accesibles:</strong> Ofrecemos servicios de calidad a precios adaptados a la realidad económica cubana.</li>
                <li><strong>Soporte Local:</strong> Entendemos las necesidades específicas de los negocios cubanos.</li>
            </ol>
            
            <h3>Inversión y Tiempos</h3>
            <ul>
                <li>Desarrollo de herramienta digital: $2000 CUP con plazo de entrega 48 horas.</li>
                <li>Para nuevos clientes: 3 meses de disponibilidad de su negocio en la web.</li>
                <li>Mantenimiento mensual posterior: Entre 600 y 1000 CUP según complejidad.</li>
            </ul>
            
            <h3>Garantía y Condiciones</h3>
            <p>Ofrecemos un período de prueba de 1 mes con posibilidad de reembolso del 50% si decides no continuar con el servicio. Nuestro compromiso es tu satisfacción con el resultado del trabajo final.</p>
            
            <div class="contact-cta">
                <p><strong>¿Interesado en nuestros servicios?</strong></p>
                <a href="mailto:koowexa@gmail.com?subject=Solicitud de Servicios KOOWEXA&body=Hola, me interesa conocer más sobre sus servicios digitales." class="email-btn">
                    <i class="fas fa-envelope"></i> Contáctanos
                </a>
            </div>
        `;
    }
}

// Inicializar servicios
document.addEventListener('DOMContentLoaded', function() {
    new KOOWEXAServices();
});