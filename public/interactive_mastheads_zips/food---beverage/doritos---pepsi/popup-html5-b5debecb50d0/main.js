document.addEventListener('DOMContentLoaded', function() {
  const wheelWrapper = document.getElementById('wheel-svg-wrapper');
  let spinning = false;
  let currentAngle = 0;
  const cipsImages = [
    'images/cipsler/flaminhot.png',
    'images/cipsler/Taco.png',
    'images/cipsler/Nacho.png',
    'images/cipsler/Extreme.png',
    'images/cipsler/Turca.png',
    'images/cipsler/Hotcorn.png'
  ];
  const masthead = document.querySelector('.masthead');
  const initialMastheadHTML = masthead.innerHTML;
  function spinWheel() {
    if (spinning) return;
    spinning = true;
    const wheelMessage = document.querySelector('.wheel-message');
    if (wheelMessage) wheelMessage.style.display = 'none';
    const sliceCount = 6;
    const sliceAngle = 360 / sliceCount;
    const randomSlice = Math.floor(Math.random() * sliceCount);
    const extraTurns = 5;
    const randomOffset = (Math.random() - 0.5) * (sliceAngle * 0.8);
    const spinAngle = 360 * extraTurns + (360 - randomSlice * sliceAngle - sliceAngle / 2 + randomOffset);
    currentAngle += spinAngle;
    wheelWrapper.style.transform = `rotate(${currentAngle}deg)`;
    
    // Okun ucunun gösterdiği dilimi bul
    setTimeout(() => {
      // Okun gösterdiği açıya göre seçilen dilimi bul
      const arrowOffset = -1.5 * sliceAngle; // Okun ucunun gösterdiği dilim ile seçilen dilim arasında 2 dilim kayma var
      const normalizedAngle = (currentAngle % 360 + 360) % 360;
      let selectedSlice = Math.floor(((360 - normalizedAngle + arrowOffset) % 360) / sliceAngle);
      if (selectedSlice < 0) selectedSlice += sliceCount;
      // Seçilen cipsi kullan
      // 1. Çarkın içindeki cips SVG görsellerini hemen flulaştır
      const svg = document.getElementById('wheel-svg');
      if (svg) {
        const images = svg.querySelectorAll('image');
        images.forEach(img => img.classList.add('blur-cips-svg'));
      }
      // 2. Çarkın ortasına büyük cips görseli ekle
      let centerCips = document.getElementById('center-cips-img');
      if (!centerCips) {
        centerCips = document.createElement('img');
        centerCips.id = 'center-cips-img';
        centerCips.style.position = 'absolute';
        centerCips.style.left = '50%';
        centerCips.style.top = '50%';
        centerCips.style.transform = 'translate(-50%, -50%) scale(0)';
        centerCips.style.transition = 'transform 0.7s cubic-bezier(0.33,1,0.68,1)';
        centerCips.style.zIndex = '1000';
        centerCips.style.width = '120px';
        centerCips.style.height = '120px';
        centerCips.style.pointerEvents = 'none';
        document.querySelector('.wheel-container').appendChild(centerCips);
      }
      centerCips.src = cipsImages[selectedSlice];
      // --- Pepsi şişesinin animasyon öncesi konumunu kaydet ---
      const pepsiSise = document.querySelector('.pepsi-sise-logo');
      let pepsiRectStart;
      if (pepsiSise) {
        pepsiRectStart = pepsiSise.getBoundingClientRect();
      }
      setTimeout(() => {
        centerCips.style.transform = 'translate(-50%, -50%) scale(1)';
        // --- Slide animasyonu gecikmeli başlasın ---
        centerCips.addEventListener('transitionend', handleGrow, { once: true });
        function handleGrow(e) {
          try {
            const currentCips = document.getElementById('center-cips-img');
            if (!currentCips || e.propertyName !== 'transform') return;
            // Çarkın merkezini bul
            const wheelContainer = document.querySelector('.wheel-container');
            let wheelRect, wheelCenterX, wheelCenterY;
            if (wheelContainer) {
              wheelRect = wheelContainer.getBoundingClientRect();
              wheelCenterX = wheelRect.left + wheelRect.width / 2;
              wheelCenterY = wheelRect.top + wheelRect.height / 2;
            } else {
              wheelRect = { left: 0, top: 0, width: 0, height: 0 };
              wheelCenterX = 0;
              wheelCenterY = 0;
            }
            // Cipsi soldan 595. pikselden, üstten 108 pikselden başlat
            const cipsRect = currentCips.getBoundingClientRect();
            currentCips.style.position = 'fixed';
            currentCips.style.left = '788px';
            currentCips.style.top = '148px';
            currentCips.style.width = cipsRect.width + 'px';
            currentCips.style.height = cipsRect.height + 'px';
            currentCips.style.zIndex = '3000';
            // --- Pepsi slide için hazırlık ---
            let pepsiRect;
            if (pepsiSise) {
              pepsiRectStart = pepsiSise.getBoundingClientRect();
              pepsiSise.style.position = 'fixed';
              pepsiSise.style.left = (pepsiRectStart.left - 60) + 'px';
              pepsiSise.style.top = (pepsiRectStart.top + 10) + 'px';
              pepsiSise.style.width = pepsiRectStart.width + 'px';
              pepsiSise.style.height = pepsiRectStart.height + 'px';
              pepsiSise.style.zIndex = '9999';
              document.body.appendChild(pepsiSise);
              pepsiSise.style.position = 'fixed';
              pepsiSise.style.left = (pepsiRectStart.left - 60) + 'px';
              pepsiSise.style.top = (pepsiRectStart.top + 10) + 'px';
              pepsiSise.style.width = pepsiRectStart.width + 'px';
              pepsiSise.style.height = pepsiRectStart.height + 'px';
              pepsiSise.style.transform = 'none';
              setTimeout(() => {
                pepsiSise.style.transition = 'transform 2.5s cubic-bezier(0.33,1,0.68,1)';
                pepsiSise.style.transform = `translate(191px, 50px) scale(1.05)`;
              }, 50);
            } else {
              pepsiRect = { left: 0, top: 0, width: 0, height: 0 };
            }
            // --- Birlikte-logo slide için hazırlık ---
            const logo = document.querySelector('.birlikte-logo');
            let logoRect;
            if (logo) {
              logoRect = logo.getBoundingClientRect();
              logo.style.position = 'fixed';
              logo.style.left = logoRect.left + 'px';
              logo.style.top = logoRect.top + 'px';
              logo.style.width = logoRect.width + 'px';
              logo.style.height = logoRect.height + 'px';
              logo.style.zIndex = '10000';
            } else {
              logoRect = { left: 0, top: 0, width: 0, height: 0 };
            }
            // --- Cips slide animasyonu (çark ortasından ok ucuna) ---
            setTimeout(() => {
              currentCips.style.transition = 'transform 2.5s cubic-bezier(0.33,1,0.68,1)';
              currentCips.style.transform = `translate(-235px, 1px) scale(1.18)`;
            }, 100);
            // --- Logo slide ---
            const leftPanel = document.querySelector('.left-panel');
            const leftPanelRect = leftPanel.getBoundingClientRect();
            const logoTargetY = leftPanelRect.top + (leftPanelRect.height - logoRect.height) / 2;
            logo.style.transition = 'top 1s cubic-bezier(0.33,1,0.68,1)';
            logo.style.top = logoTargetY + 'px';
            spinning = false;
            setTimeout(() => {
        document.body.addEventListener('click', resetToWheel, { once: true });
            }, 200);
          } catch (err) {
            return;
          }
        }
      }, 50);
    }, 4200);
  }
  document.getElementById('spin-btn').addEventListener('click', spinWheel);
  document.querySelector('.wheel-container').addEventListener('click', spinWheel);
  function resetToWheel() {
    // 1. Flulaşan cipsleri eski haline getir
    const svg = document.getElementById('wheel-svg');
    if (svg) {
      const images = svg.querySelectorAll('image');
      images.forEach(img => img.classList.remove('blur-cips-svg'));
    }
    // 2. Ortadaki büyük cipsi kaldır
    const centerCips = document.getElementById('center-cips-img');
    if (centerCips && centerCips.parentNode) {
      centerCips.parentNode.removeChild(centerCips);
    }
    // 3. Pepsi şişesini eski yerine döndür
    const pepsiSise = document.querySelector('.pepsi-sise-logo');
    if (pepsiSise) {
      pepsiSise.style.position = '';
      pepsiSise.style.left = '';
      pepsiSise.style.top = '';
      pepsiSise.style.width = '';
      pepsiSise.style.height = '';
      pepsiSise.style.zIndex = '';
      pepsiSise.style.transition = '';
      pepsiSise.style.transform = '';
    }
    // 4. Birlikte-logo eski konumuna dönsün
    const logo = document.querySelector('.birlikte-logo');
    if (logo) {
      logo.style.position = '';
      logo.style.left = '';
      logo.style.top = '';
      logo.style.width = '';
      logo.style.height = '';
      logo.style.zIndex = '';
      logo.style.transition = '';
      logo.style.transform = '';
    }
    // 5. Standart sıfırlama işlemleri
    masthead.innerHTML = initialMastheadHTML;
    const newWheelWrapper = document.getElementById('wheel-svg-wrapper');
    if (newWheelWrapper) newWheelWrapper.style.transform = `rotate(${currentAngle}deg)`;
    document.getElementById('spin-btn').addEventListener('click', spinWheel);
    document.querySelector('.wheel-container').addEventListener('click', spinWheel);
    document.body.removeEventListener('click', resetToWheel, { once: true });
  }
}); 