document.addEventListener('DOMContentLoaded', function() {
  const menuToggle = document.getElementById('menuToggle');
  const menuItems = document.getElementById('menuItems');
  const startBtn = document.getElementById('startBtn');
  const docsBtn = document.getElementById('docsBtn');
  const posterBtn = document.getElementById('posterBtn');
  const shareBtn = document.getElementById('shareBtn');
  const docsModal = document.getElementById('docsModal');
  const posterModal = document.getElementById('posterModal');
  const shareModal = document.getElementById('shareModal');
  const docsClose = document.getElementById('docsClose');
  const posterClose = document.getElementById('posterClose');
  const shareClose = document.getElementById('shareClose');
  
  let isMenuOpen = false;
  
  menuToggle.addEventListener('click', function() {
    if (isMenuOpen) {
      menuItems.classList.remove('active');
      menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
      menuToggle.setAttribute('aria-label', 'Abrir menú');
    } else {
      menuItems.classList.add('active');
      menuToggle.innerHTML = '<i class="fas fa-times"></i>';
      menuToggle.setAttribute('aria-label', 'Cerrar menú');
    }
    isMenuOpen = !isMenuOpen;
  });
  
  document.addEventListener('click', function(e) {
    if (isMenuOpen && !menuToggle.contains(e.target) && !menuItems.contains(e.target)) {
      menuItems.classList.remove('active');
      menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
      menuToggle.setAttribute('aria-label', 'Abrir menú');
      isMenuOpen = false;
    }
  });
  
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && isMenuOpen) {
      menuItems.classList.remove('active');
      menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
      menuToggle.setAttribute('aria-label', 'Abrir menú');
      isMenuOpen = false;
    }
  });
  
  startBtn.addEventListener('click', function() {
    window.location.href = 'mailto:koowexa@gmail.com?subject=Quiero comenzar con KOOWEXA&body=Hola, estoy interesado en sus servicios digitales para emprendedores.';
  });
  
  docsBtn.addEventListener('click', function() {
    docsModal.style.display = 'block';
    docsClose.focus();
  });
  
  docsClose.addEventListener('click', function() {
    docsModal.style.display = 'none';
  });
  
  posterBtn.addEventListener('click', function() {
    posterModal.style.display = 'block';
    posterClose.focus();
  });
  
  posterClose.addEventListener('click', function() {
    posterModal.style.display = 'none';
  });
  
  shareBtn.addEventListener('click', function() {
    shareModal.style.display = 'block';
    shareClose.focus();
  });
  
  shareClose.addEventListener('click', function() {
    shareModal.style.display = 'none';
  });
  
  [docsModal, posterModal, shareModal].forEach(modal => {
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });
  });
  
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      if (docsModal.style.display === 'block') {
        docsModal.style.display = 'none';
      } else if (posterModal.style.display === 'block') {
        posterModal.style.display = 'none';
      } else if (shareModal.style.display === 'block') {
        shareModal.style.display = 'none';
      }
    }
  });
  
  const buttons = document.querySelectorAll('button, .menu-btn, .social-link, .email-btn');
  buttons.forEach(button => {
    button.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.click();
      }
    });
  });
  
  function getShareMessage() {
    return `¡Descubre KOOWEXA! La plataforma digital profesional para emprendedores cubanos. Soluciones optimizadas para conexiones lentas: tiendas online, hospedaje web y herramientas digitales. ${window.location.href}`;
  }
  
  function share(platform) {
    const message = encodeURIComponent(getShareMessage());
    const url = encodeURIComponent(window.location.href);
    
    let shareUrl = '';
    
    switch(platform) {
      case 'whatsapp':
        shareUrl = `https://api.whatsapp.com/send?text=${message}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${url}&text=${message}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${message}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=KOOWEXA - Plataforma Digital para Emprendedores Cubanos&body=${message}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  }
  
  function copyToClipboard() {
    const text = getShareMessage();
    
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => {
        showNotification('Enlace copiado al portapapeles', 'success');
      }).catch(err => {
        fallbackCopyToClipboard(text);
      });
    } else {
      fallbackCopyToClipboard(text);
    }
  }
  
  function fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      const successful = document.execCommand('copy');
      if (successful) {
        showNotification('Enlace copiado al portapapeles', 'success');
      } else {
        showNotification('Error al copiar el enlace', 'warning');
      }
    } catch (err) {
      showNotification('Error al copiar el enlace', 'warning');
    }
    
    document.body.removeChild(textArea);
  }
  
  function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      border-radius: 6px;
      color: white;
      z-index: 10000;
      font-weight: 600;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      transition: all 0.3s ease;
      max-width: 300px;
    `;
    
    if (type === 'success') {
      notification.style.background = 'var(--success)';
    } else if (type === 'warning') {
      notification.style.background = '#d97706';
    } else {
      notification.style.background = 'var(--accent-blue)';
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 4000);
  }
  
  document.getElementById('shareWhatsapp').addEventListener('click', function(e) {
    e.preventDefault();
    share('whatsapp');
  });
  
  document.getElementById('shareTelegram').addEventListener('click', function(e) {
    e.preventDefault();
    share('telegram');
  });
  
  document.getElementById('shareFacebook').addEventListener('click', function(e) {
    e.preventDefault();
    share('facebook');
  });
  
  document.getElementById('shareTwitter').addEventListener('click', function(e) {
    e.preventDefault();
    share('twitter');
  });
  
  document.getElementById('shareEmail').addEventListener('click', function(e) {
    e.preventDefault();
    share('email');
  });
  
  document.getElementById('copyLink').addEventListener('click', function() {
    copyToClipboard();
  });
  
  let currentScale = 1;
  const minScale = 0.5;
  const maxScale = 3;
  const scaleStep = 0.25;
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let translateX = 0;
  let translateY = 0;
  const imageElement = document.getElementById('posterImage');
  const zoomInBtn = document.getElementById('zoomInBtn');
  const zoomOutBtn = document.getElementById('zoomOutBtn');
  const resetZoomBtn = document.getElementById('resetZoomBtn');
  const downloadImageBtn = document.getElementById('downloadImageBtn');
  
  function applyTransform() {
    imageElement.style.transform = `scale(${currentScale}) translate(${translateX}px, ${translateY}px)`;
  }
  
  function updateZoomButtons() {
    zoomInBtn.disabled = currentScale >= maxScale;
    zoomOutBtn.disabled = currentScale <= minScale;
  }
  
  function zoomIn() {
    if (currentScale < maxScale) {
      currentScale += scaleStep;
      applyTransform();
      updateZoomButtons();
    }
  }
  
  function zoomOut() {
    if (currentScale > minScale) {
      currentScale -= scaleStep;
      applyTransform();
      updateZoomButtons();
    }
  }
  
  function resetZoom() {
    currentScale = 1;
    translateX = 0;
    translateY = 0;
    applyTransform();
    updateZoomButtons();
  }
  
  function startDrag(e) {
    if (currentScale <= 1) return;
    
    isDragging = true;
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    
    startX = clientX - translateX;
    startY = clientY - translateY;
    
    imageElement.style.cursor = 'grabbing';
  }
  
  function drag(e) {
    if (!isDragging) return;
    
    e.preventDefault();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    
    translateX = clientX - startX;
    translateY = clientY - startY;
    
    applyTransform();
  }
  
  function endDrag() {
    isDragging = false;
    imageElement.style.cursor = currentScale > 1 ? 'grab' : 'default';
  }
  
  function handleWheel(e) {
    e.preventDefault();
    
    if (e.deltaY < 0) {
      zoomIn();
    } else {
      zoomOut();
    }
  }
  
  function downloadImage() {
    const link = document.createElement('a');
    link.href = imageElement.src;
    link.download = 'KOOWEXA-Poster.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  
  if (imageElement) {
    imageElement.addEventListener('mousedown', startDrag);
    imageElement.addEventListener('touchstart', startDrag);
    
    document.addEventListener('mousemove', drag);
    document.addEventListener('touchmove', drag);
    
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchend', endDrag);
    
    imageElement.addEventListener('wheel', handleWheel);
    
    posterClose.addEventListener('click', resetZoom);
  }
  
  if (zoomInBtn) zoomInBtn.addEventListener('click', zoomIn);
  if (zoomOutBtn) zoomOutBtn.addEventListener('click', zoomOut);
  if (resetZoomBtn) resetZoomBtn.addEventListener('click', resetZoom);
  if (downloadImageBtn) downloadImageBtn.addEventListener('click', downloadImage);
});