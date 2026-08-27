const header = document.querySelector('.site-header');
const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('nav');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

function setHeaderState() {
  header.classList.toggle('scrolled', window.scrollY > 40);
}

function setMenu(open) {
  toggle.setAttribute('aria-expanded', String(open));
  nav.classList.toggle('open', open);
  document.body.classList.toggle('menu-open', open);
}

function enhanceRevealTargets() {
  const groups = [
    ['.section-head,.gallery-title,.reserve-title,.menu-list', 'reveal'],
    ['.philosophy-copy,.chef-copy,.visit>div', 'reveal-left'],
    ['.philosophy-image,.chef-portrait,form', 'reveal-right'],
    ['.image-frame,.menu-visual,.gallery figure,.experience-copy', 'reveal']
  ];

  groups.forEach(([selector, className]) => {
    document.querySelectorAll(selector).forEach((el, index) => {
      el.classList.add('reveal', className);
      el.style.transitionDelay = `${Math.min(index % 5, 4) * 90}ms`;
    });
  });

  document.querySelectorAll('.section-head h2 span').forEach((span, index) => {
    span.classList.add('line-reveal');
    span.style.transitionDelay = `${index * 90}ms`;
    span.innerHTML = `<span>${span.textContent}</span>`;
  });
}

function initReveals() {
  enhanceRevealTargets();

  if (reduceMotion || !('IntersectionObserver' in window)) {
    document.querySelectorAll('.reveal,.line-reveal').forEach(el => el.classList.add('in-view'));
    return;
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });

  document.querySelectorAll('.reveal,.line-reveal').forEach(el => observer.observe(el));
}

function initParallax() {
  if (reduceMotion) return;

  const hero = document.querySelector('.hero');
  const moving = document.querySelectorAll('.parallax');
  let ticking = false;

  function update() {
    const heroShift = Math.min(window.scrollY, window.innerHeight) * -0.12;
    hero?.style.setProperty('--hero-scroll', `${heroShift}px`);

    moving.forEach(el => {
      const rect = el.getBoundingClientRect();
      const progress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
      el.style.setProperty('--shift', `${(progress - 0.5) * 26}px`);
    });

    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });

  update();
}

function initHeroDepth() {
  const hero = document.querySelector('.hero');
  if (!hero || reduceMotion || !canHover) return;

  hero.addEventListener('pointermove', event => {
    const rect = hero.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    hero.style.setProperty('--hero-x', `${x * 18}px`);
    hero.style.setProperty('--hero-y', `${y * 14}px`);
  });

  hero.addEventListener('pointerleave', () => {
    hero.style.setProperty('--hero-x', '0px');
    hero.style.setProperty('--hero-y', '0px');
  });
}

function initImageDepth() {
  if (reduceMotion || !canHover) return;

  document.querySelectorAll('.image-frame,.menu-visual,.gallery figure').forEach(frame => {
    frame.addEventListener('pointermove', event => {
      const rect = frame.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      frame.style.setProperty('--cursor-x', `${x * 12}px`);
      frame.style.setProperty('--cursor-y', `${y * 10}px`);
    });

    frame.addEventListener('pointerleave', () => {
      frame.style.setProperty('--cursor-x', '0px');
      frame.style.setProperty('--cursor-y', '0px');
    });
  });
}

function initReservationForm() {
  const form = document.querySelector('#reservation-form');
  const message = document.querySelector('.form-message');
  if (!form || !message) return;

  form.addEventListener('submit', event => {
    event.preventDefault();

    if (!form.checkValidity()) {
      message.textContent = 'Por favor complete todos los campos para preparar su visita.';
      form.reportValidity();
      return;
    }

    const guestName = new FormData(form).get('name');
    message.textContent = `Gracias, ${guestName}. Esta es una demo de portafolio: la solicitud de mesa no fue enviada.`;
    form.reset();
  });
}

toggle.addEventListener('click', () => {
  setMenu(toggle.getAttribute('aria-expanded') !== 'true');
});

nav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => setMenu(false));
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') setMenu(false);
});

window.addEventListener('scroll', setHeaderState, { passive: true });

setHeaderState();
initReveals();
initParallax();
initHeroDepth();
initImageDepth();
initReservationForm();
