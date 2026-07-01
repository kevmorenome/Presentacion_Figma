/* =========================================================
   LimpioYa — Interactividad
   ========================================================= */

/* ---------- Tema claro / oscuro ---------- */
/* Se ejecuta de inmediato (fuera de DOMContentLoaded) para aplicar
   el tema guardado lo antes posible y evitar parpadeos de color. */
(function initTheme() {
  const STORAGE_KEY = 'limpioya-theme';
  let saved = null;
  try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) { /* almacenamiento no disponible */ }

  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = saved || (prefersDark ? 'dark' : 'light');

  document.documentElement.setAttribute('data-theme', theme);
})();

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Botón de tema claro / oscuro ---------- */
  const STORAGE_KEY = 'limpioya-theme';
  const themeToggle = document.getElementById('themeToggle');

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    if (themeToggle) {
      themeToggle.setAttribute('aria-pressed', theme === 'dark');
    }
    try { localStorage.setItem(STORAGE_KEY, theme); } catch (e) { /* almacenamiento no disponible */ }
  }

  if (themeToggle) {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    themeToggle.setAttribute('aria-pressed', current === 'dark');

    themeToggle.addEventListener('click', () => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      applyTheme(isDark ? 'light' : 'dark');
    });
  }

  /* Si el usuario no ha elegido un tema manualmente, seguir el del sistema */
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      let saved = null;
      try { saved = localStorage.getItem(STORAGE_KEY); } catch (err) { /* no-op */ }
      if (!saved) {
        document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
      }
    });
  }

  /* ---------- Fecha dinámica ---------- */
  const now = new Date();
  const opciones = { year: 'numeric', month: 'long' };
  const fechaTexto = now.toLocaleDateString('es-CO', opciones);
  const fechaEl = document.getElementById('fechaActual');
  if (fechaEl) fechaEl.textContent = fechaTexto.charAt(0).toUpperCase() + fechaTexto.slice(1);

  const footerYear = document.getElementById('footerYear');
  if (footerYear) footerYear.textContent = now.getFullYear();

  /* ---------- Navbar: fondo al hacer scroll + barra de progreso ---------- */
  const navbar = document.getElementById('navbar');
  const scrollProgress = document.getElementById('scrollProgress');
  const sections = document.querySelectorAll('main > section, .hero');
  const navLinks = document.querySelectorAll('.nav-link');

  function updateActiveNavLink() {
    let currentId = '';
    const offset = 140;

    sections.forEach(section => {
      const top = section.offsetTop - offset;
      if (window.scrollY >= top) {
        currentId = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + currentId);
    });
  }

  function onScroll() {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    if (scrollProgress) scrollProgress.style.width = progress + '%';

    updateActiveNavLink();
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Menú móvil ---------- */
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('open');
      navMenu.classList.toggle('open');
      const expanded = navToggle.classList.contains('open');
      navToggle.setAttribute('aria-expanded', expanded);
    });

    navMenu.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navToggle.classList.remove('open');
        navMenu.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Scroll suave (fallback explícito para navegadores antiguos) ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId.length > 1) {
        const target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          const top = target.getBoundingClientRect().top + window.scrollY - (document.getElementById('navbar').offsetHeight - 1);
          window.scrollTo({ top, behavior: 'smooth' });
        }
      }
    });
  });

  /* ---------- Animaciones al hacer scroll (Intersection Observer) ---------- */
  const revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add('visible'), (i % 6) * 80);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    revealEls.forEach(el => observer.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('visible'));
  }

  /* ---------- Lightbox / Modal para diagramas ---------- */
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxClose = document.getElementById('lightboxClose');
  const diagramTriggers = document.querySelectorAll('[data-lightbox]');

  function openLightbox(imgSrc, title, desc) {
    lightboxImg.src = imgSrc;
    lightboxImg.alt = title;
    lightboxCaption.textContent = title + (desc ? ' — ' + desc : '');
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  diagramTriggers.forEach(figure => {
    const img = figure.querySelector('img');
    const title = figure.querySelector('h3') ? figure.querySelector('h3').textContent : '';
    const desc = figure.querySelector('figcaption p') ? figure.querySelector('figcaption p').textContent : '';

    figure.querySelector('.diagram-card__img').addEventListener('click', () => {
      openLightbox(img.src, title, desc);
    });
  });

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) closeLightbox();
  });

});
