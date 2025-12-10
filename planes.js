// planes.js - Gestión de planes KOOWEXA (Versión Compacta)

class KOOWEXAPlans {
    constructor() {
        this.plansContent = document.getElementById('plansContent');
        this.init();
    }

    init() {
        try {
            this.loadPlansContent();
            this.setupPlanInteractions();
        } catch (error) {
            console.error('Error inicializando planes:', error);
        }
    }

    loadPlansContent() {
        if (this.plansContent) {
            this.plansContent.innerHTML = this.getPlansHTML();
        }
    }

    getPlansHTML() {
        return `
            <div class="plans-container">
                <!-- PLAN GRATUITO -->
                <div class="plan-card free">
                    <div class="plan-header">
                        <div class="plan-badge free-badge">CON LIMITACIONES</div>
                        <h3>PLAN GRATUITO</h3>
                        <p>Presencia online esencial</p>
                        <div class="price free-price">$0-CUP/mes</div>
                    </div>
                    
                    <ul class="features">
                        <li>TITULO DEL NEGOCIO</li>
                        <li>LOGO DEL NEGOCIO</li>
                        <li>ESLOGAN DEL NEGOCIO</li>
                        <li>DISEÑO ECONÓMICO</li>
                        <li>PRODUCTOS (5) / SERVICIOS (3)</li>
                        <li>CONTACTO VÍA WHATSAPP</li>
                        <li>UBICACIÓN</li>
                        <li>HORARIOS</li>
                        <li>ANUNCIOS DE KOOWEXA EN LA PÁGINA</li>
                        <li>MARCA DE AGUA KOOWEXA</li>
                    </ul>
                    
                    <button class="plan-btn free-btn" data-plan="gratuito">
                        Comenzar Gratis
                    </button>
                </div>
                
                <!-- TIENDA ONLINE -->
                <div class="plan-card">
                    <div class="plan-header">
                        <div class="plan-badge">MUY EFECTIVO</div>
                        <h3>TIENDA ONLINE</h3>
                        <p>Plataforma de comercio</p>
                        <div class="price">$2000-CUP/mes</div>
                    </div>
                    
                    <ul class="features">
                        <li>TITULO DEL NEGOCIO</li>
                        <li>LOGO DEL NEGOCIO</li>
                        <li>ESLOGAN DEL NEGOCIO</li>
                        <li>DISEÑO MODERNO</li>
                        <li>PRODUCTOS CON LIMITE (MAX 50)</li>
                        <li>GESTION DE PRODUCTOS POR WHATSAPP</li>
                        <li>UBICACION</li>
                        <li>HORARIOS</li>
                    </ul>
                    
                    <button class="plan-btn" data-plan="tienda-online">
                        Seleccionar
                    </button>
                </div>
                
                <!-- SERVICIO LOCAL -->
                <div class="plan-card">
                    <div class="plan-header">
                        <div class="plan-badge">RECOMENDADO</div>
                        <h3>SERVICIO LOCAL</h3>
                        <p>Visibilidad en tu zona</p>
                        <div class="price">$2000-CUP/mes</div>
                    </div>
                    
                    <ul class="features">
                        <li>TITULO DEL NEGOCIO</li>
                        <li>LOGO DEL NEGOCIO</li>
                        <li>ESLOGAN DEL NEGOCIO</li>
                        <li>DISEÑO MODERNO</li>
                        <li>GESTION DE RESERVA POR WHATSAPP</li>
                        <li>UBICACION</li>
                        <li>HORARIOS</li>
                    </ul>
                    
                    <button class="plan-btn secondary" data-plan="servicio-local">
                        Seleccionar
                    </button>
                </div>
            </div>
            
            <style>
                .plans-container {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 1rem;
                    max-width: 900px;
                    margin: 0 auto;
                    padding: 0.5rem;
                }
                
                .plan-card {
                    background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
                    border-radius: 12px;
                    padding: 1.25rem;
                    border: 1px solid rgba(255,255,255,0.1);
                    transition: all 0.2s ease;
                    display: flex;
                    flex-direction: column;
                    height: fit-content;
                }
                
                .plan-card.free {
                    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
                    border: 1px solid rgba(59, 130, 246, 0.3);
                    position: relative;
                    overflow: hidden;
                }
                
                .plan-card.free::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 3px;
                    background: linear-gradient(90deg, #3b82f6, #60a5fa);
                }
                
                .plan-card:hover {
                    transform: translateY(-2px);
                    border-color: rgba(59, 130, 246, 0.3);
                }
                
                .plan-card.free:hover {
                    border-color: #3b82f6;
                    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
                }
                
                .plan-header {
                    text-align: center;
                    margin-bottom: 1rem;
                    position: relative;
                }
                
                .plan-badge {
                    position: absolute;
                    top: -8px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: #3b82f6;
                    color: white;
                    padding: 0.25rem 0.75rem;
                    border-radius: 12px;
                    font-size: 0.7rem;
                    font-weight: 600;
                }
                
                .plan-badge.free-badge {
                    background: linear-gradient(90deg, #10b981, #34d399);
                    color: #064e3b;
                }
                
                .plan-header h3 {
                    font-size: 1.1rem;
                    font-weight: 700;
                    margin: 0.5rem 0 0.25rem 0;
                    color: white;
                }
                
                .plan-header p {
                    color: #94a3b8;
                    font-size: 0.8rem;
                    margin: 0 0 0.75rem 0;
                    line-height: 1.2;
                }
                
                .price {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: white;
                }
                
                .free-price {
                    color: #34d399;
                    font-weight: 800;
                }
                
                .features {
                    list-style: none;
                    padding: 0;
                    margin: 0 0 1.5rem 0;
                    flex-grow: 1;
                }
                
                .features li {
                    padding: 0.4rem 0;
                    color: #e2e8f0;
                    font-size: 0.8rem;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                    text-align: center;
                    position: relative;
                }
                
                .plan-card.free .features li {
                    color: #cbd5e1;
                }
                
                .plan-card.free .features li:nth-child(9),
                .plan-card.free .features li:nth-child(10) {
                    color: #94a3b8;
                    font-style: italic;
                }
                
                .features li:last-child {
                    border-bottom: none;
                }
                
                .plan-btn {
                    width: 100%;
                    padding: 0.75rem 1rem;
                    border: none;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    font-size: 0.85rem;
                    background: #3b82f6;
                    color: white;
                }
                
                .plan-btn.free-btn {
                    background: linear-gradient(90deg, #10b981, #34d399);
                    color: white;
                    font-weight: 700;
                }
                
                .plan-btn.secondary {
                    background: rgba(255,255,255,0.1);
                    color: white;
                    border: 1px solid rgba(255,255,255,0.2);
                }
                
                .plan-btn:hover {
                    background: #2563eb;
                    transform: translateY(-1px);
                }
                
                .plan-btn.free-btn:hover {
                    background: linear-gradient(90deg, #0da271, #2bb884);
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
                }
                
                .plan-btn.secondary:hover {
                    background: rgba(255,255,255,0.15);
                }
                
                @media (max-width: 640px) {
                    .plans-container {
                        grid-template-columns: 1fr;
                        gap: 0.75rem;
                        padding: 0.25rem;
                    }
                    
                    .plan-card {
                        padding: 1rem;
                    }
                    
                    .plan-header h3 {
                        font-size: 1rem;
                    }
                    
                    .price {
                        font-size: 1.1rem;
                    }
                    
                    .features li {
                        font-size: 0.75rem;
                        padding: 0.3rem 0;
                    }
                    
                    .plan-btn {
                        padding: 0.6rem 0.8rem;
                        font-size: 0.8rem;
                    }
                }
                
                @media (max-width: 380px) {
                    .plans-container {
                        grid-template-columns: 1fr;
                    }
                    
                    .plan-card {
                        padding: 0.75rem;
                    }
                }
            </style>
        `;
    }

    setupPlanInteractions() {
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('.plan-btn');
            if (btn) {
                const plan = btn.getAttribute('data-plan');
                this.selectPlan(plan);
            }
        });
    }

    selectPlan(planType) {
        const planNames = {
            'gratuito': 'Presencia Básica (Gratuito)',
            'tienda-online': 'Tienda Online',
            'servicio-local': 'Servicio Local'
        };
        
        const planName = planNames[planType] || 'Plan Seleccionado';
        const email = 'koowexa@gmail.com';
        
        let subject, body;
        
        if (planType === 'gratuito') {
            subject = `Solicitud de Plan Gratuito - KOOWEXA`;
            body = `Hola, estoy interesado en comenzar con el Plan Gratuito (Presencia Básica) de KOOWEXA. Por favor contáctenme para activar mi perfil online.`;
        } else {
            subject = `Solicitud de ${planName} - KOOWEXA`;
            body = `Hola, estoy interesado en el plan ${planName} de KOOWEXA. Por favor contácteme lo antes posible.`;
        }
        
        const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.open(mailtoLink, '_blank');
        
        this.trackConversion(planType);
    }

    trackConversion(planType) {
        try {
            if (window.KOOWEXA_API?.getAPI('analytics')) {
                const price = planType === 'gratuito' ? 0 : 2000;
                window.KOOWEXA_API.getAPI('analytics').trackConversion('plan_selection', price, planType);
            }
        } catch (error) {
            console.log('Error en tracking:', error);
        }
    }
}

// Inicializar planes
document.addEventListener('DOMContentLoaded', function() {
    new KOOWEXAPlans();
});