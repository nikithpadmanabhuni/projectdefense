/**
 * nav.js
 * Shared header navigation renderer for ProjectDefense.
 * Injects a semantic, accessible sticky nav across all pages with responsive wrapping.
 */

export function renderNav() {
  const navContainer = document.getElementById('site-nav');
  if (!navContainer) return;

  const currentPath = window.location.pathname;

  // Determine active states cleanly
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
  header.className = 'sticky top-0 z-50 bg-[#0B0F17]/95 backdrop-blur-md border-b border-[#1F2937]';

  const container = document.createElement('div');
  container.className = 'max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3';

  // Logo / Brand
  const logoLink = document.createElement('a');
  logoLink.href = 'index.html';
  logoLink.className = 'flex items-center gap-2 text-white font-semibold text-sm sm:text-base tracking-tight hover:text-blue-400 transition-smooth focus:outline-none';

  const logoBadge = document.createElement('span');
  logoBadge.className = 'w-7 h-7 rounded bg-blue-600 text-white font-mono font-bold text-xs flex items-center justify-center';
  logoBadge.textContent = 'PD';

  const logoText = document.createElement('span');
  logoText.textContent = 'ProjectDefense';

  logoLink.appendChild(logoBadge);
  logoLink.appendChild(logoText);

  // Nav links container (horizontal scroll / flex wrap on mobile)
  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'Main Navigation');
  nav.className = 'flex items-center space-x-1 sm:space-x-1.5 text-xs overflow-x-auto max-w-full pb-1 sm:pb-0';

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
      a.className = 'px-2.5 py-1 rounded-md text-white bg-[#1F2937] font-semibold whitespace-nowrap transition-smooth';
      a.setAttribute('aria-current', 'page');
    } else {
      a.className = 'px-2.5 py-1 rounded-md text-slate-300 hover:text-white hover:bg-[#111827] whitespace-nowrap transition-smooth';
    }

    nav.appendChild(a);
  });

  container.appendChild(logoLink);
  container.appendChild(nav);
  header.appendChild(container);
  navContainer.appendChild(header);
}

// Automatically render when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderNav);
} else {
  renderNav();
}
