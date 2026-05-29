const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
  tooltipTriggerList.forEach((tooltipTriggerEl) => {
    new bootstrap.Tooltip(tooltipTriggerEl);
  });

const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]');
  popoverTriggerList.forEach((popoverTriggerEl) => {
    new bootstrap.Popover(popoverTriggerEl);
});
function updateNavbarOnScroll() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  if (window.scrollY > 24) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}

function setHref(id, value) {
  const element = document.getElementById(id);
  if (element) element.href = value;
}

function updateWhatsAppLinks() {
  const fichaUrl = window.location.href;
  const phone = '50232465215';

  const contactMessage = 'Hola Brenda, quisiera agendar una visita para conocer la casa en renta ' +
    'en Los Franciscanos Club Residencial. Vi la ficha aqui: ' + fichaUrl;
  const navMessage = 'Hola Brenda, quisiera recibir informacion sobre propiedades de Tierra Viva.';
  const shareMessage = 'Le comparto esta propiedad de Tierra Viva: ' + fichaUrl;

  const contactUrl = 'https://wa.me/' + phone + '?text=' + encodeURIComponent(contactMessage);
  const navUrl = 'https://wa.me/' + phone + '?text=' + encodeURIComponent(navMessage);
  const shareUrl = 'https://wa.me/?text=' + encodeURIComponent(shareMessage);

  setHref('navWhatsapp', navUrl);
  setHref('whatsappButton', contactUrl);
  setHref('whatsappButtonFooter', contactUrl);
  setHref('shareWhatsappButton', shareUrl);
  setHref('shareWhatsappButtonFooter', shareUrl);
}

function initStoryCards() {
  const canHoverVideo = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (!canHoverVideo) return;

  document.querySelectorAll('.story-property-card').forEach((card) => {
    const video = card.querySelector('.story-video');
    if (!video) return;

    card.addEventListener('mouseenter', () => {
      document.documentElement.classList.add('story-cards-active');
      document.body.classList.add('story-cards-active');
      video.play().catch(() => {});
    });

    card.addEventListener('mouseleave', () => {
      document.documentElement.classList.remove('story-cards-active');
      document.body.classList.remove('story-cards-active');
      video.pause();
      video.currentTime = 0;
    });
  });
}

let themeScrollInitialized = false;

function initTheme() {
  updateNavbarOnScroll();
  updateWhatsAppLinks();
  initStoryCards();

  if (!themeScrollInitialized) {
    window.addEventListener('scroll', updateNavbarOnScroll, { passive: true });
    themeScrollInitialized = true;
  }
}

document.addEventListener('DOMContentLoaded', initTheme);
document.addEventListener('tv:components-loaded', initTheme);
