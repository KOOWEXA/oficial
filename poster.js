// poster.js - Gestión del póster interactivo

class KOOWEXAPoster {
    constructor() {
        this.currentScale = 1;
        this.minScale = 0.5;
        this.maxScale = 3;
        this.scaleStep = 0.25;
        this.isDragging = false;
        this.startX = 0;
        this.startY = 0;
        this.translateX = 0;
        this.translateY = 0;
        
        this.init();
    }

    init() {
        this.imageElement = document.getElementById('posterImage');
        this.zoomInBtn = document.getElementById('zoomInBtn');
        this.zoomOutBtn = document.getElementById('zoomOutBtn');
        this.resetZoomBtn = document.getElementById('resetZoomBtn');
        this.downloadImageBtn = document.getElementById('downloadImageBtn');
        
        this.setupEventListeners();
        this.updateZoomButtons();
    }

    setupEventListeners() {
        if (this.imageElement) {
            this.imageElement.addEventListener('mousedown', this.startDrag.bind(this));
            this.imageElement.addEventListener('touchstart', this.startDrag.bind(this));
            
            document.addEventListener('mousemove', this.drag.bind(this));
            document.addEventListener('touchmove', this.drag.bind(this));
            
            document.addEventListener('mouseup', this.endDrag.bind(this));
            document.addEventListener('touchend', this.endDrag.bind(this));
            
            this.imageElement.addEventListener('wheel', this.handleWheel.bind(this));
        }

        if (this.zoomInBtn) this.zoomInBtn.addEventListener('click', this.zoomIn.bind(this));
        if (this.zoomOutBtn) this.zoomOutBtn.addEventListener('click', this.zoomOut.bind(this));
        if (this.resetZoomBtn) this.resetZoomBtn.addEventListener('click', this.resetZoom.bind(this));
        if (this.downloadImageBtn) this.downloadImageBtn.addEventListener('click', this.downloadImage.bind(this));

        // Reset zoom al cerrar el modal
        const posterClose = document.getElementById('posterClose');
        if (posterClose) {
            posterClose.addEventListener('click', this.resetZoom.bind(this));
        }
    }

    applyTransform() {
        if (this.imageElement) {
            this.imageElement.style.transform = `scale(${this.currentScale}) translate(${this.translateX}px, ${this.translateY}px)`;
        }
    }

    updateZoomButtons() {
        if (this.zoomInBtn) this.zoomInBtn.disabled = this.currentScale >= this.maxScale;
        if (this.zoomOutBtn) this.zoomOutBtn.disabled = this.currentScale <= this.minScale;
    }

    zoomIn() {
        if (this.currentScale < this.maxScale) {
            this.currentScale += this.scaleStep;
            this.applyTransform();
            this.updateZoomButtons();
        }
    }

    zoomOut() {
        if (this.currentScale > this.minScale) {
            this.currentScale -= this.scaleStep;
            this.applyTransform();
            this.updateZoomButtons();
        }
    }

    resetZoom() {
        this.currentScale = 1;
        this.translateX = 0;
        this.translateY = 0;
        this.applyTransform();
        this.updateZoomButtons();
    }

    startDrag(e) {
        if (this.currentScale <= 1) return;
        
        this.isDragging = true;
        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);
        
        this.startX = clientX - this.translateX;
        this.startY = clientY - this.translateY;
        
        if (this.imageElement) {
            this.imageElement.style.cursor = 'grabbing';
        }
    }

    drag(e) {
        if (!this.isDragging) return;
        
        e.preventDefault();
        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);
        
        this.translateX = clientX - this.startX;
        this.translateY = clientY - this.startY;
        
        this.applyTransform();
    }

    endDrag() {
        this.isDragging = false;
        if (this.imageElement) {
            this.imageElement.style.cursor = this.currentScale > 1 ? 'grab' : 'default';
        }
    }

    handleWheel(e) {
        e.preventDefault();
        
        if (e.deltaY < 0) {
            this.zoomIn();
        } else {
            this.zoomOut();
        }
    }

    downloadImage() {
        if (this.imageElement) {
            const link = document.createElement('a');
            link.href = this.imageElement.src;
            link.download = 'KOOWEXA-Poster.jpg';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Track download
            if (window.KOOWEXA_API && window.KOOWEXA_API.getAPI('analytics')) {
                window.KOOWEXA_API.getAPI('analytics').trackEvent('Download', 'Poster', 'KOOWEXA Poster');
            }
        }
    }
}

// Inicializar poster
document.addEventListener('DOMContentLoaded', function() {
    new KOOWEXAPoster();
});