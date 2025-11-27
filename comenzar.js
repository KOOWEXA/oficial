// comenzar.js - Gestión del inicio de proyectos

class KOOWEXAStart {
    constructor() {
        this.init();
    }

    init() {
        this.setupStartButton();
    }

    setupStartButton() {
        const startBtn = document.getElementById('startBtn');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                this.startProject();
            });
        }
    }

    startProject() {
        // Mostrar formulario de inicio o redirigir a email
        const subject = 'Quiero comenzar con KOOWEXA';
        const body = `Hola equipo KOOWEXA,

Estoy interesado en comenzar un proyecto con ustedes. 

Información sobre mi negocio:
- Tipo de negocio: 
- Servicio que necesito: 
- Presupuesto aproximado: 
- Tiempo estimado: 

Por favor, contáctenme para coordinar una reunión.

Saludos`;

        window.location.href = `mailto:koowexa@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        
        // Track conversion
        if (window.KOOWEXA_API && window.KOOWEXA_API.getAPI('analytics')) {
            window.KOOWEXA_API.getAPI('analytics').trackConversion('project_start', 0);
        }
    }
}

// Inicializar inicio de proyectos
document.addEventListener('DOMContentLoaded', function() {
    new KOOWEXAStart();
});