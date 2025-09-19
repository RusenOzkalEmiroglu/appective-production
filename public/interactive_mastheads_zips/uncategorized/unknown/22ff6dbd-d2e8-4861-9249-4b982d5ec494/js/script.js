// Slider
let currentSlide = 0;
const slides = document.querySelectorAll('.slide');
setInterval(() => {
  slides[currentSlide].classList.remove('active');
  currentSlide = (currentSlide + 1) % slides.length;
  slides[currentSlide].classList.add('active');
}, 2500);

// Canvas: Kirli tabak ve silme efekti
const canvas = document.getElementById('kirli-canvas');
const ctx = canvas.getContext('2d');
const temizTabak = document.getElementById('temiz-tabak');
const sunger = document.getElementById('sunger');
const sungerEfekt = document.querySelector('.sunger-efekt');

// Kirli tabak görselini yükle
const kirliTabakImg = new Image();
kirliTabakImg.src = 'images/kirli_tabak.png';

// Maske için ayrı bir canvas
const maskCanvas = document.createElement('canvas');
maskCanvas.width = canvas.width;
maskCanvas.height = canvas.height;
const maskCtx = maskCanvas.getContext('2d');

function resetMask() {
  maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
  maskCtx.globalAlpha = 1;
  maskCtx.fillStyle = '#fff';
  maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
}

function renderKirliTabak() {
  // Maskeyi uygula: sadece maskede opak kalan yerlerde kirli tabak görseli çiz
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  ctx.drawImage(maskCanvas, 0, 0);
  ctx.globalCompositeOperation = 'source-in';
  ctx.drawImage(kirliTabakImg, 0, 0, canvas.width, canvas.height);
  ctx.restore();
}

kirliTabakImg.onload = () => {
  resetMask();
  renderKirliTabak();
};

// Sünger drag
let dragging = false;
let offsetX = 0, offsetY = 0;
let efektGizlendi = false;

sunger.addEventListener('mousedown', (e) => {
  dragging = true;
  sunger.classList.add('dragging', 'drag-off');
  if (sungerEfekt) sungerEfekt.classList.add('drag-off');
  const rect = sunger.getBoundingClientRect();
  offsetX = e.clientX - rect.left;
  offsetY = e.clientY - rect.top;
  sunger.classList.add('bounce');
  if (sungerEfekt) sungerEfekt.classList.add('blink');
});
document.addEventListener('mousemove', (e) => {
  if (!dragging) return;
  const tabakRect = canvas.getBoundingClientRect();
  let x = e.clientX - tabakRect.left - offsetX;
  let y = e.clientY - tabakRect.top - offsetY;
  x = Math.max(-10, Math.min(x, tabakRect.width - sunger.width + 10));
  y = Math.max(-10, Math.min(y, tabakRect.height - sunger.height + 10));
  sunger.style.left = x + 'px';
  sunger.style.top = y + 'px';
  const spongeCenterX = x + sunger.width/2;
  const spongeCenterY = y + sunger.height/2;
  if (
    spongeCenterX > 0 && spongeCenterX < tabakRect.width &&
    spongeCenterY > 0 && spongeCenterY < tabakRect.height
  ) {
    // Maskede silme (transparan yap)
    maskCtx.save();
    maskCtx.globalCompositeOperation = 'destination-out';
    maskCtx.beginPath();
    maskCtx.arc(spongeCenterX, spongeCenterY, 28, 0, 2 * Math.PI);
    maskCtx.fill();
    maskCtx.restore();
    renderKirliTabak();
    // İlk kez silme yapılıyorsa yazı ve sünger efektlerini kaldır
    if (!efektGizlendi && sungerEfekt) {
      sungerEfekt.classList.remove('blink');
      sungerEfekt.style.display = 'none';
      efektGizlendi = true;
      if (sunger) sunger.classList.remove('bounce');
    }
    // %50 temizlenince açıklama yazısını göster
    if (!aciklamaGosterildi && isTabakYarisiTemiz()) {
      const aciklama = document.querySelector('.aciklama-mesaj');
      if (aciklama) aciklama.classList.add('goster');
      aciklamaGosterildi = true;
    }
  }
});
document.addEventListener('mouseup', () => {
  dragging = false;
  sunger.classList.remove('dragging', 'drag-off');
  if (sungerEfekt) sungerEfekt.classList.remove('drag-off');
  if (isTabakTemiz()) {
    pariltiAnimasyonu();
  }
});
// Touch desteği
document.addEventListener('touchstart', (e) => {
  if (e.target === sunger) {
    dragging = true;
    sunger.classList.add('dragging', 'drag-off');
    if (sungerEfekt) sungerEfekt.classList.add('drag-off');
    const touch = e.touches[0];
    const rect = sunger.getBoundingClientRect();
    offsetX = touch.clientX - rect.left;
    offsetY = touch.clientY - rect.top;
  }
});
document.addEventListener('touchmove', (e) => {
  if (!dragging) return;
  const touch = e.touches[0];
  const tabakRect = canvas.getBoundingClientRect();
  let x = touch.clientX - tabakRect.left - offsetX;
  let y = touch.clientY - tabakRect.top - offsetY;
  x = Math.max(-10, Math.min(x, tabakRect.width - sunger.width + 10));
  y = Math.max(-10, Math.min(y, tabakRect.height - sunger.height + 10));
  sunger.style.left = x + 'px';
  sunger.style.top = y + 'px';
  const spongeCenterX = x + sunger.width/2;
  const spongeCenterY = y + sunger.height/2;
  if (
    spongeCenterX > 0 && spongeCenterX < tabakRect.width &&
    spongeCenterY > 0 && spongeCenterY < tabakRect.height
  ) {
    maskCtx.save();
    maskCtx.globalCompositeOperation = 'destination-out';
    maskCtx.beginPath();
    maskCtx.arc(spongeCenterX, spongeCenterY, 28, 0, 2 * Math.PI);
    maskCtx.fill();
    maskCtx.restore();
    renderKirliTabak();
    if (!efektGizlendi && sungerEfekt) {
      sungerEfekt.classList.remove('blink');
      sungerEfekt.style.display = 'none';
      efektGizlendi = true;
      if (sunger) sunger.classList.remove('bounce');
    }
    // %50 temizlenince açıklama yazısını göster
    if (!aciklamaGosterildi && isTabakYarisiTemiz()) {
      const aciklama = document.querySelector('.aciklama-mesaj');
      if (aciklama) aciklama.classList.add('goster');
      aciklamaGosterildi = true;
    }
  }
});
document.addEventListener('touchend', () => {
  dragging = false;
  sunger.classList.remove('dragging', 'drag-off');
  if (sungerEfekt) sungerEfekt.classList.remove('drag-off');
  if (isTabakTemiz()) {
    pariltiAnimasyonu();
  }
});

// === Tabak Temizleme ve Sünger ===
// const dirtyPlate = document.getElementById('dirty-plate');
// const cleanPlate = document.getElementById('clean-plate');
// const maskCanvas = document.getElementById('mask-canvas');
// const maskCtx = maskCanvas.getContext('2d');
// const sponge = document.getElementById('sponge');
// const plateWrapper = document.querySelector('.plate-wrapper');
//
// Maskeyi başta tamamen opak yap (kirli tabak görünür)
// function resetMask() {
//   maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
//   maskCtx.fillStyle = '#000';
//   maskCtx.globalAlpha = 1;
//   maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
//   maskCtx.globalAlpha = 1;
// }
// resetMask();
//
// Maskeyi dirtyPlate'e uygula
// function renderPlate() {
//   dirtyPlate.style.opacity = 1;
//   cleanPlate.style.opacity = 0;
//   // Maskeyi dirtyPlate'e uygula
//   dirtyPlate.style.webkitMaskImage = dirtyPlate.style.maskImage = `url(${maskCanvas.toDataURL()})`;
//   dirtyPlate.style.webkitMaskRepeat = dirtyPlate.style.maskRepeat = 'no-repeat';
//   dirtyPlate.style.webkitMaskSize = dirtyPlate.style.maskSize = '300px 200px';
// }
// renderPlate();
//
// Sünger ilk konumunu sağ alt köşeye ayarla
// function setSpongeToDefault() {
//   sponge.style.right = '10px';
//   sponge.style.bottom = '10px';
//   sponge.style.left = 'auto';
//   sponge.style.top = 'auto';
// }
// setSpongeToDefault();

// Mouse ile silme
let isCleaning = false;
canvas.addEventListener('mousedown', (e) => { isCleaning = true; });
canvas.addEventListener('mouseup', (e) => { isCleaning = false; });
canvas.addEventListener('mouseleave', (e) => { isCleaning = false; });
canvas.addEventListener('mousemove', (e) => {
  if (!isCleaning) return;
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  // Silgi efekti
  dirtyCtx.save();
  dirtyCtx.globalCompositeOperation = 'destination-out';
  dirtyCtx.beginPath();
  dirtyCtx.arc(x, y, 18, 0, 2 * Math.PI);
  dirtyCtx.fill();
  dirtyCtx.restore();
  // Yeniden çiz
  drawPlate();
  ctx.drawImage(dirtyLayer, 0, 0);
});

// Temizleme sonrası tamamen temizlenirse kutlama
function isClean() {
  const imgData = dirtyCtx.getImageData(0, 0, dirtyLayer.width, dirtyLayer.height);
  let dirtyPixels = 0;
  for (let i = 0; i < imgData.data.length; i += 4) {
    if (imgData.data[i+3] > 30) dirtyPixels++;
  }
  return dirtyPixels < 500;
}

// Temizlik kontrolü ve parıltı animasyonu
function isTabakTemiz() {
  const imgData = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
  let temizPixel = 0;
  for (let i = 0; i < imgData.data.length; i += 4) {
    if (imgData.data[i+3] < 10) temizPixel++;
  }
  // %90'dan fazlası temizse
  return temizPixel > (maskCanvas.width * maskCanvas.height * 0.9);
}

function isTabakYarisiTemiz() {
  const imgData = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
  let temizPixel = 0;
  for (let i = 0; i < imgData.data.length; i += 4) {
    if (imgData.data[i+3] < 10) temizPixel++;
  }
  // %30'dan fazlası temizse
  return temizPixel > (maskCanvas.width * maskCanvas.height * 0.3);
}

function pariltiAnimasyonu() {
  if (sunger) sunger.classList.remove('bounce');
  // Açıklama mesajını göster
  const aciklama = document.querySelector('.aciklama-mesaj');
  if (aciklama) aciklama.classList.add('goster');
}

canvas.addEventListener('mouseup', () => {
  if (isClean()) {
    setTimeout(() => {
      alert('Tebrikler! Tabak tertemiz oldu!');
    }, 200);
  }
});

// Sabunlara tıklayınca video aç
const sabunlar = document.querySelectorAll('.sabun');
const videoAlani = document.querySelector('.video-alani');
const youtubeVideo = document.getElementById('youtube-video');
const videoKapat = document.querySelector('.video-kapat');

sabunlar.forEach(sabun => {
  sabun.onclick = (e) => {
    e.preventDefault(); // Olası link davranışını engelle
    videoAlani.style.display = 'flex';
    youtubeVideo.src = 'https://www.youtube.com/embed/jA49VWoX1no?autoplay=1';
  };
});
videoKapat.addEventListener('click', () => {
  videoAlani.style.display = 'none';
  youtubeVideo.src = '';
});

// Fairy logosuna tıklayınca instagram'a git
const fairyLogo = document.getElementById('fairy-logo');
if (fairyLogo) {
  fairyLogo.style.cursor = 'pointer';
  fairyLogo.addEventListener('click', () => {
    window.open('https://www.instagram.com/fairytr/', '_blank');
  });
}

// Sayfa açılır açılmaz animasyon class'larını ekle
if (sunger) sunger.classList.add('bounce');
if (sungerEfekt) sungerEfekt.classList.add('blink');

let aciklamaGosterildi = false; 