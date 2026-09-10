'use strict';

// Small helper for selecting one DOM element.
const $ = (selector) => document.querySelector(selector);
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');

// The single source of truth for interactive UI state.
const state = {
  theme: 'light',
  projects: [],
  projectStatus: 'loading',
  filter: 'All',
  errors: {}
};
let savedTheme;
try {
  savedTheme = localStorage.getItem('portfolio-theme');
} catch {
  // Storage may be disabled.
}

state.theme = ['light', 'dark'].includes(savedTheme)
  ? savedTheme
  : systemTheme.matches
    ? 'dark'
    : 'light';

// Apply the current theme state to the document and theme button.
const renderTheme = () => {
  document.documentElement.dataset.theme = state.theme;
  $('.theme-toggle').setAttribute('aria-pressed', String(state.theme === 'dark'));
  $('.theme-toggle').setAttribute('aria-label', `Switch to ${state.theme === 'dark' ? 'light' : 'dark'} mode`);
};
renderTheme();

// Toggle the theme and persist the user's preference when possible.
$('.theme-toggle').addEventListener('click', () => {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  savedTheme = state.theme;
  try {
    localStorage.setItem('portfolio-theme', state.theme);
  } catch {
    // Keep the theme usable without storage.
  }
  renderTheme();
});
systemTheme.addEventListener('change', () => {
  if (!savedTheme) {
    state.theme = systemTheme.matches ? 'dark' : 'light';
    renderTheme();
  }
});

// Open and close the mobile navigation menu.
const closeMenu = () => {
  $('#navigation').classList.remove('active');
  $('.menu-toggle').setAttribute('aria-expanded', 'false');
  $('.menu-toggle').setAttribute('aria-label', 'Open navigation');
};
$('.menu-toggle').addEventListener('click', () => {
  const open = $('#navigation').classList.toggle('active');
  $('.menu-toggle').setAttribute('aria-expanded', String(open));
  $('.menu-toggle').setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
});

// Close the mobile menu after navigation and when Escape is pressed.
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', closeMenu);
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && $('#navigation').classList.contains('active')) {
    closeMenu();
    $('.menu-toggle').focus();
  }
});
window.matchMedia('(min-width: 768px)').addEventListener('change', closeMenu);

// Update the sticky header and back-to-top button at scroll thresholds.
const renderScroll = () => {
  $('.site-header').classList.toggle('scrolled', window.scrollY >= 60);
  $('#back-to-top').hidden = window.scrollY < 300;
};
window.addEventListener('scroll', renderScroll, { passive: true });
renderScroll();
$('#back-to-top').addEventListener('click', () => {
  window.scrollTo({
    top: 0,
    behavior: reducedMotion.matches ? 'instant' : 'smooth'
  });
  $('.logo').focus({ preventScroll: true });
});

// Reveal sections as they enter the viewport.
if ('IntersectionObserver' in window && !reducedMotion.matches) {
  const observer = new IntersectionObserver(
    (entries) => entries.forEach(({ isIntersecting, target }) => {
      if (isIntersecting) {
        target.classList.add('visible');
        observer.unobserve(target);
      }
    }),
    { threshold: 0.2 }
  );

  document.querySelectorAll('.reveal').forEach((section) => {
    section.classList.add('ready');
    observer.observe(section);
  });
}

// Escape API values before inserting them into HTML.
const escapeHTML = (value) => String(value ?? '').replace(
  /[&<>"']/g,
  (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[character])
);

const githubURL = (value) => {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname === 'github.com'
      ? escapeHTML(url.href)
      : 'https://github.com/Deviskido';
  } catch {
    return 'https://github.com/Deviskido';
  }
};

// Render loading, error, empty, filtered, and successful project states.
const renderProjects = () => {
  const messages = {
    loading: 'Loading projects / 로딩 중…',
    error: '프로젝트를 불러올 수 없습니다. Please try again.',
    success: ''
  };

  $('#project-status').textContent = messages[state.projectStatus];
  $('#project-grid').setAttribute('aria-busy', String(state.projectStatus === 'loading'));
  $('#retry').hidden = state.projectStatus !== 'error';
  $('#project-filters').innerHTML = '';
  $('#project-grid').innerHTML = '';
  if (state.projectStatus !== 'success') return;

  const languages = ['All', ...new Set(state.projects.map(({ language }) => language || 'Other'))];

  $('#project-filters').innerHTML = languages
    .map((language) => `<button class="filter" type="button" data-language="${escapeHTML(language)}" aria-pressed="${state.filter === language}">${escapeHTML(language)}</button>`)
    .join('');

  const visible = state.projects.filter(
    ({ language }) => state.filter === 'All' || (language || 'Other') === state.filter
  );

  if (!visible.length) {
    $('#project-status').textContent = '표시할 프로젝트가 없습니다. No projects to show yet.';
  }

  $('#project-grid').innerHTML = visible
    .map(({ name, description, html_url: url, language, stargazers_count: stars }, index) => `
      <article class="project-card">
        <div class="project-card-top">
          <span>PROJECT ${String(index + 1).padStart(2, '0')}</span>
          <span aria-hidden="true">↗</span>
        </div>
        <h3>
          <a href="${githubURL(url)}" target="_blank" rel="noopener noreferrer">
            ${escapeHTML(name)}
          </a>
        </h3>
        <p>${escapeHTML(description || 'An experiment in learning and building. Explore the repository to see what’s inside.')}</p>
        <div class="project-meta">
          <span>● ${escapeHTML(language || 'Other')}</span>
          <span aria-label="${escapeHTML(stars || 0)} stars">☆ ${escapeHTML(stars || 0)}</span>
        </div>
      </article>
    `)
    .join('');
};

// Fetch repositories from GitHub and update the project state.
const loadProjects = async () => {
  state.projectStatus = 'loading';
  renderProjects();

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch(
      'https://api.github.com/users/Deviskido/repos?sort=updated&per_page=100',
      { signal: controller.signal }
    );

    if (!response.ok) throw new Error(`GitHub returned ${response.status}`);
    const projects = await response.json();
    if (!Array.isArray(projects)) throw new Error('Unexpected response');

    state.projects = projects;
    state.filter = 'All';
    state.projectStatus = 'success';
  } catch {
    state.projects = [];
    state.projectStatus = 'error';
  } finally {
    window.clearTimeout(timeout);
    renderProjects();
  }
};
$('#retry').addEventListener('click', loadProjects);
$('#project-filters').addEventListener('click', (event) => {
  const button = event.target.closest('button[data-language]');

  if (button) {
    state.filter = button.dataset.language;
    renderProjects();

    document.querySelectorAll('.filter').forEach((filter) => {
      if (filter.dataset.language === state.filter) filter.focus();
    });
  }
});
loadProjects();

// Validate contact form fields and show errors beside each field.
const fields = ['name', 'email', 'message'];
const validate = (field) => {
  const value = $(`#${field}`).value.trim();

  state.errors[field] = !value
    ? 'Please fill in this field.'
    : field === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
      ? 'Please enter a valid email address.'
      : '';

  $(`#${field}-error`).textContent = state.errors[field];
  $(`#${field}`).setAttribute('aria-invalid', String(Boolean(state.errors[field])));
};
fields.forEach((field) => {
  $(`#${field}`).addEventListener('input', () => {
    validate(field);
    $('#form-status').textContent = '';
  });
});
$('#contact-form').addEventListener('submit', (event) => {
  event.preventDefault();
  fields.forEach(validate);

  const invalid = fields.find((field) => state.errors[field]);

  if (invalid) {
    $('#form-status').textContent = 'Please check the highlighted fields and try again.';
    $(`#${invalid}`).focus();
    return;
  }

  $('#form-status').textContent = 'Success! Your note is valid. This demo has not sent a message.';
});
$('#year').textContent = new Date().getFullYear();
const phrase = 'thoughtful interfaces.';
if (reducedMotion.matches) $('#typing').textContent = phrase;
else {
  let position = 0;
  $('#typing').textContent = '';

  const timer = window.setInterval(() => {
    position += 1;
    $('#typing').textContent = phrase.slice(0, position);

    if (position >= phrase.length) {
      window.clearInterval(timer);
    }
  }, 85);
}
