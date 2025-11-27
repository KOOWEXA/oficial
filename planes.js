// planes.js - Gestión de planes KOOWEXA

class KOOWEXAPlans {
    constructor() {
        this.plansContent = document.getElementById('plansContent');
        this.init();
    }

    init() {
        this.loadPlansContent();
        this.setupPlanInteractions();
    }

    loadPlansContent() {
        if (this.plansContent) {
            this.plansContent.innerHTML = this.getPlansHTML();
        }
    }

    getPlansHTML() {
        return `
            <div class="plans-container">
                <div class="plan-card">
                    <div class="plan-header">
                        <div class="plan-badge">MUY POPULAR</div>
                        <h3 class="plan-title">TIENDA ONLINE</h3>
                        <p class="plan-description">Vende tus productos con una plataforma digital integrada</p>
                        <div class="plan-price">
                            <span class="price-amount">$2000-CUP</span>
                            <span class="price-period">/ mes</span>
                        </div>
                    </div>
                    
                    <div class="plan-content">
                        <ul class="feature-list">
                            <li>Nombre y logo de su negocio</li>
                            <li>Información breve del negocio</li>
                            <li>Interfaz optimizada y simplificada</li>
                            <li>Catálogo con hasta 50 productos (MAX)</li>
                            <li>Imágenes, títulos, descripciones, precios</li>
                        </ul>
                        
                        <div class="highlight">
                            <div class="highlight-title">Incluye</div>
                            <p>Actualizaciones de contenido semanales</p>
                        </div>
                        
                        <div class="price-tag">COMPRA UNICA</div>
                        
                        <button class="select-plan-btn" data-plan="tienda-online">
                            Seleccionar Plan
                        </button>
                    </div>
                </div>
                
                <div class="plan-card">
                    <div class="plan-header">
                        <div class="plan-badge">LO MAS SUGERIDO</div>
                        <h3 class="plan-title">SERVICIO LOCAL</h3>
                        <p class="plan-description">Aumenta tu visibilidad y capta clientes en tu zona</p>
                        <div class="plan-price">
                            <span class="price-amount">$2000-CUP</span>
                            <span class="price-period">/ mes</span>
                        </div>
                    </div>
                    
                    <div class="plan-content">
                        <ul class="feature-list">
                            <li>Nombre y logo de su negocio</li>
                            <li>Información para la presentación y objetivos</li>
                            <li>Plataforma con funciones optimizadas</li>
                            <li>Listado de ofertas y precios</li>
                            <li>Función para pedir reservación o cita</li>
                        </ul>
                        
                        <div class="highlight">
                            <div class="highlight-title">Incluye</div>
                            <p>Actualizaciones de contenido semanales</p>
                        </div>
                        
                        <div class="price-tag">COMPRA UNICA</div>
                        
                        <button class="select-plan-btn" data-plan="servicio-local">
                            Seleccionar Plan
                        </button>
                    </div>
                </div>
            </div>
            
            <style>
                .select-plan-btn {
                    width: 100%;
                    padding: 14px;
                    background: var(--accent-blue);
                    color: white;
                    border: none;
                    border-radius: 10px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    margin-top: 1rem;
                }
                
                .select-plan-btn:hover {
                    background: var(--secondary-blue);
                    transform: translateY(-2px);
                }
                
                .contact-cta {
                    text-align: center;
                    margin-top: 2rem;
                    padding-top: 2rem;
                    border-top: 1px solid rgba(255,255,255,0.1);
                }
            </style>
        `;
    }

    setupPlanInteractions() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('select-plan-btn')) {
                const plan = e.target.getAttribute('data-plan');
                this.selectPlan(plan);
            }
        });
    }

    selectPlan(planType) {
        const planNames = {
            'tienda-online': 'Tienda Online',
            'servicio-local': 'Servicio Local'
        };
        
        const planName = planNames[planType] || 'Plan Seleccionado';
        const subject = `Solicitud de ${planName} - KOOWEXA`;
        const body = `Hola, estoy interesado en el plan ${planName} de KOOWEXA. Por favor, envíenme más información.`;
        
        window.location.href = `mailto:koowexa@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        
        // Track conversion
        if (window.KOOWEXA_API && window.KOOWEXA_API.getAPI('analytics')) {
            window.KOOWEXA_API.getAPI('analytics').trackConversion('plan_selection', 2000);
        }
    }
}

// Inicializar planes
document.addEventListener('DOMContentLoaded', function() {
    new KOOWEXAPlans();
});