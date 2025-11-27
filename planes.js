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
                <div class="plan-card">
                    <div class="plan-header">
                        <div class="plan-badge">POPULAR</div>
                        <h3>TIENDA ONLINE</h3>
                        <p>Plataforma digital integrada</p>
                        <div class="price">$2000-CUP/mes</div>
                    </div>
                    
                    <ul class="features">
                        <li>Nombre y logo</li>
                        <li>Info del negocio</li>
                        <li>Interfaz optimizada</li>
                        <li>50 productos max</li>
                        <li>Gestión de contenido</li>
                    </ul>
                    
                    <button class="plan-btn" data-plan="tienda-online">
                        Seleccionar
                    </button>
                </div>
                
                <div class="plan-card">
                    <div class="plan-header">
                        <div class="plan-badge">SUGERIDO</div>
                        <h3>SERVICIO LOCAL</h3>
                        <p>Visibilidad en tu zona</p>
                        <div class="price">$2000-CUP/mes</div>
                    </div>
                    
                    <ul class="features">
                        <li>Nombre y logo</li>
                        <li>Presentación</li>
                        <li>Plataforma optimizada</li>
                        <li>Ofertas y precios</li>
                        <li>Reservas y citas</li>
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
                    max-width: 700px;
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
                
                .plan-card:hover {
                    transform: translateY(-2px);
                    border-color: rgba(59, 130, 246, 0.3);
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
                
                .plan-btn.secondary {
                    background: rgba(255,255,255,0.1);
                    color: white;
                    border: 1px solid rgba(255,255,255,0.2);
                }
                
                .plan-btn:hover {
                    background: #2563eb;
                    transform: translateY(-1px);
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
            'tienda-online': 'Tienda Online',
            'servicio-local': 'Servicio Local'
        };
        
        const planName = planNames[planType] || 'Plan Seleccionado';
        const email = 'koowexa@gmail.com';
        const subject = `Solicitud de ${planName} - KOOWEXA`;
        const body = `Hola, estoy interesado en el plan ${planName} de KOOWEXA. Por favor contacte conmigo lo antes posible.`;
        
        const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.open(mailtoLink, '_blank');
        
        this.trackConversion(planType);
    }

    trackConversion(planType) {
        try {
            if (window.KOOWEXA_API?.getAPI('analytics')) {
                window.KOOWEXA_API.getAPI('analytics').trackConversion('plan_selection', 2000, planType);
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