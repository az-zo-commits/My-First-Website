const navigation = document.querySelector('#navigation');
const toggle = document.querySelector('.nav-toggle');

function closeNavigation() {
  navigation.classList.remove('open');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'Открыть меню');
}

toggle.addEventListener('click', () => {
  const isOpen = navigation.classList.toggle('open');
  toggle.setAttribute('aria-expanded', String(isOpen));
  toggle.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню');
});

navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeNavigation));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && navigation.classList.contains('open')) {
    closeNavigation();
    toggle.focus();
  }
});

const filters = document.querySelectorAll('[data-filter]');
const cards = document.querySelectorAll('[data-category]');
filters.forEach(button => {
  button.addEventListener('click', () => {
    filters.forEach(filter => {
      const selected = filter === button;
      filter.classList.toggle('active', selected);
      filter.setAttribute('aria-pressed', String(selected));
    });
    cards.forEach(card => {
      card.hidden = button.dataset.filter !== 'all' && card.dataset.category !== button.dataset.filter;
    });
  });
});

document.querySelector('#year').textContent = new Date().getFullYear();

// Persist the choice when storage is available; the switch also works without it.
const themeToggle = document.querySelector('.theme-toggle');
const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
let explicitTheme = null;
try { explicitTheme = localStorage.getItem('coffee-theme'); } catch (_) {}

function applyTheme(theme) {
  const dark = theme === 'dark';
  document.documentElement.dataset.theme = theme;
  themeToggle.setAttribute('aria-pressed', String(dark));
  themeToggle.setAttribute('aria-label', 'Тёмная тема');
  themeToggle.title = dark ? 'Включить светлую тему' : 'Включить тёмную тему';
  document.querySelector('meta[name="theme-color"]').content = dark ? '#211c18' : '#f6f1e9';
}
applyTheme(explicitTheme === 'dark' || explicitTheme === 'light' ? explicitTheme : systemTheme.matches ? 'dark' : 'light');
themeToggle.addEventListener('click', () => {
  explicitTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  applyTheme(explicitTheme);
  try { localStorage.setItem('coffee-theme', explicitTheme); } catch (_) {}
});
systemTheme.addEventListener('change', event => {
  if (explicitTheme !== 'light' && explicitTheme !== 'dark') applyTheme(event.matches ? 'dark' : 'light');
});

// Content remains visible without JS, observer support, or with reduced motion.
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
if ('IntersectionObserver' in window && !reducedMotion.matches) {
  const revealElements = document.querySelectorAll('.hero-copy, .hero-photo, .section-heading, .menu-card, .about-image, .about-copy, .contacts > div');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.remove('reveal-pending');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  revealElements.forEach(element => {
    element.classList.add('reveal', 'reveal-pending');
    if (element.matches('.menu-card')) {
      element.style.setProperty('--reveal-delay', `${Array.from(cards).indexOf(element) % 2 * 70}ms`);
    }
    observer.observe(element);
  });
  reducedMotion.addEventListener('change', event => {
    if (event.matches) {
      observer.disconnect();
      revealElements.forEach(element => element.classList.remove('reveal-pending'));
    }
  });
}
