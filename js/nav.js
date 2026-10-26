/**
 * nav.js
 * Universal responsive navigation bar with mobile hamburger menu,
 * PWA install prompt handler, service worker registration, and iOS guidance.
 */

let deferredInstallPrompt = null;

export function renderNav() {
  const navContainer = document.getElementById('site-nav');
  if (!navContainer) return;

  const currentPath = window.location.pathname;

  const isHome = currentPath.endsWith('index.html') || currentPath.endsWith('/') || currentPath === '' || currentPath.endsWith('/projectdefense');
  const isOnboarding = currentPath.endsWith('onboarding.html') || currentPath.endsWith('/onboarding');
  const isDashboard = currentPath.endsWith('dashboard.html') || currentPath.endsWith('/dashboard');
  const isDefense = currentPath.endsWith('defense.html') || currentPath.endsWith('/defense');
  const isCoding = currentPath.endsWith('coding.html') || currentPath.endsWith('/coding');
  const isResume = currentPath.endsWith('resume.html') || currentPath.endsWith('/resume');
  const isSprint = currentPath.endsWith('sprint.html') || currentPath.endsWith('/sprint');
  const isFeedback = currentPath.endsWith('feedback.html') || currentPath.endsWith('/feedback');

  navContainer.innerHTML = '';

  const header = document.createElement('header');
  header.className = 'sticky top-0 z-50 bg-[#0B0F17]/95 backdrop-blur-md border-b border-[#1F2937] pt-[env(safe-area-inset-top)]';

  const container = document.createElement('div');
  container.className = 'max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3';

  // Logo Link
  const logoLink = document.createElement('a');
  logoLink.href = 'index.html';
  logoLink.className = 'flex items-center gap-2 text-white font-semibold text-sm sm:text-base tracking-tight hover:text-blue-400 transition-smooth min-h-[44px] min-w-[44px]';
  logoLink.setAttribute('aria-label', 'ProjectDefense Home');

  const logoBadge = document.createElement('span');
  logoBadge.className = 'w-7 h-7 rounded bg-blue-600 text-white font-mono font-bold text-xs flex items-center justify-center';
  logoBadge.textContent = 'PD';

  const logoText = document.createElement('span');
  logoText.textContent = 'ProjectDefense';

  logoLink.appendChild(logoBadge);
  logoLink.appendChild(logoText);

  // Desktop Navigation (> 768px)
  const desktopNav = document.createElement('nav');
  desktopNav.setAttribute('aria-label', 'Main Desktop Navigation');
  desktopNav.className = 'hidden md:flex items-center space-x-1 text-xs';

  const links = [
    { label: 'Home', href: 'index.html', active: isHome },
    { label: 'Profile', href: 'onboarding.html', active: isOnboarding },
    { label: 'Dashboard', href: 'dashboard.html', active: isDashboard },
    { label: 'Defense', href: 'defense.html', active: isDefense },
    { label: 'Coding', href: 'coding.html', active: isCoding },
    { label: 'Resume', href: 'resume.html', active: isResume },
    { label: 'Sprint', href: 'sprint.html', active: isSprint },
    { label: 'Feedback', href: 'feedback.html', active: isFeedback }
  ];

  links.forEach((item) => {
    const a = document.createElement('a');
    a.href = item.href;
    a.textContent = item.label;
    if (item.active) {
      a.className = 'px-3 py-2 rounded-md text-white bg-[#1F2937] font-semibold whitespace-nowrap transition-smooth min-h-[44px] flex items-center';
      a.setAttribute('aria-current', 'page');
    } else {
      a.className = 'px-3 py-2 rounded-md text-slate-300 hover:text-white hover:bg-[#111827] whitespace-nowrap transition-smooth min-h-[44px] flex items-center';
    }
    desktopNav.appendChild(a);
  });

  // Action Area: Install Button & Hamburger Button
  const rightArea = document.createElement('div');
  rightArea.className = 'flex items-center gap-2';

  // PWA Install Button
  const installBtn = document.createElement('button');
  installBtn.id = 'pwa-install-btn';
  installBtn.type = 'button';
  installBtn.className = 'hidden px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-smooth items-center gap-1.5 min-h-[44px]';
  installBtn.innerHTML = '<span>📲</span><span>Install App</span>';
  installBtn.addEventListener('click', handleInstallClick);
  rightArea.appendChild(installBtn);

  // iOS Install Help Trigger (Only on iOS Safari non-standalone)
  const isIOS = typeof navigator !== 'undefined' && (/iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));
  const isStandalone = typeof window !== 'undefined' && (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone);

  if (isIOS && !isStandalone) {
    const iosHelp = document.createElement('button');
    iosHelp.type = 'button';
    iosHelp.className = 'text-[11px] text-blue-400 hover:underline px-2 py-1 min-h-[44px] flex items-center';
    iosHelp.textContent = 'Install Help';
    iosHelp.setAttribute('aria-label', 'iOS App Install Instructions');
    iosHelp.addEventListener('click', () => {
      alert('To install ProjectDefense on iPhone/iPad:\n1. Tap the Share button (box with arrow)\n2. Scroll down and tap "Add to Home Screen"');
    });
    rightArea.appendChild(iosHelp);
  }

  // Hamburger Toggle Button (< 768px)
  const menuBtn = document.createElement('button');
  menuBtn.id = 'mobile-menu-toggle';
  menuBtn.type = 'button';
  menuBtn.setAttribute('aria-expanded', 'false');
  menuBtn.setAttribute('aria-controls', 'mobile-nav-menu');
  menuBtn.setAttribute('aria-label', 'Open navigation menu');
  menuBtn.className = 'md:hidden p-2 rounded-lg bg-[#111827] border border-[#1F2937] text-slate-300 hover:text-white min-h-[44px] min-w-[44px] flex items-center justify-center';
  menuBtn.innerHTML = `
    <svg class="w-5 h-5 block" id="menu-icon-open" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
    <svg class="w-5 h-5 hidden" id="menu-icon-close" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
    </svg>
  `;

  rightArea.appendChild(menuBtn);

  container.appendChild(logoLink);
  container.appendChild(desktopNav);
  container.appendChild(rightArea);
  header.appendChild(container);

  // Mobile Dropdown Container (< 768px)
  const mobileNav = document.createElement('nav');
  mobileNav.id = 'mobile-nav-menu';
  mobileNav.setAttribute('aria-label', 'Mobile Navigation');
  mobileNav.className = 'hidden md:hidden border-t border-[#1F2937] bg-[#0B0F17] px-4 py-3 space-y-1.5';

  links.forEach((item, idx) => {
    const a = document.createElement('a');
    a.href = item.href;
    a.textContent = item.label;
    if (idx === 0) a.id = 'mobile-nav-first-link';
    if (item.active) {
      a.className = 'block px-3 py-2.5 rounded-lg text-white bg-[#1F2937] font-semibold text-sm min-h-[44px] flex items-center';
      a.setAttribute('aria-current', 'page');
    } else {
      a.className = 'block px-3 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-[#111827] text-sm min-h-[44px] flex items-center';
    }
    mobileNav.appendChild(a);
  });

  header.appendChild(mobileNav);
  navContainer.appendChild(header);

  // Wire up Menu Toggle interactions
  setupMobileMenuEvents(menuBtn, mobileNav);

  // Wire up deferred PWA install prompt if already captured
  if (deferredInstallPrompt) {
    showInstallButton();
  }
}

function setupMobileMenuEvents(menuBtn, mobileNav) {
  const iconOpen = document.getElementById('menu-icon-open');
  const iconClose = document.getElementById('menu-icon-close');

  const toggle = (forceClose = false) => {
    const isExpanded = menuBtn.getAttribute('aria-expanded') === 'true';
    const nextState = forceClose ? false : !isExpanded;

    menuBtn.setAttribute('aria-expanded', String(nextState));
    if (nextState) {
      mobileNav.classList.remove('hidden');
      if (iconOpen) iconOpen.classList.add('hidden');
      if (iconClose) iconClose.classList.remove('hidden');
      menuBtn.setAttribute('aria-label', 'Close navigation menu');
      const firstLink = document.getElementById('mobile-nav-first-link');
      if (firstLink) firstLink.focus();
    } else {
      mobileNav.classList.add('hidden');
      if (iconOpen) iconOpen.classList.remove('hidden');
      if (iconClose) iconClose.classList.add('hidden');
      menuBtn.setAttribute('aria-label', 'Open navigation menu');
      menuBtn.focus();
    }
  };

  menuBtn.addEventListener('click', () => toggle());

  // Escape key closes mobile menu and restores focus
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuBtn.getAttribute('aria-expanded') === 'true') {
      toggle(true);
    }
  });
}

function showInstallButton() {
  const btn = document.getElementById('pwa-install-btn');
  if (btn) {
    btn.classList.remove('hidden');
    btn.classList.add('flex');
  }
}

async function handleInstallClick() {
  if (!deferredInstallPrompt) return;
  deferredInstallPrompt.prompt();
  const choice = await deferredInstallPrompt.userChoice;
  if (choice.outcome === 'accepted') {
    const btn = document.getElementById('pwa-install-btn');
    if (btn) btn.classList.add('hidden');
  }
  deferredInstallPrompt = null;
}

// Capture beforeinstallprompt (non-iOS)
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    showInstallButton();
  });

  // Register service worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      try {
        navigator.serviceWorker.register('./sw.js').catch((err) => {
          console.warn('SW registration skipped:', err.message);
        });
      } catch (_) {}
    });
  }
}

// Automatically render when DOM is ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderNav);
  } else {
    renderNav();
  }
}
