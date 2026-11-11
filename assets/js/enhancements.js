(() => {
  'use strict';
  const root = document.documentElement;
  const button = document.getElementById('theme-toggle');
  function setTheme(theme) {
    root.dataset.theme = theme;
    const dark = theme === 'dark';
    button.setAttribute('aria-label', 'Switch to ' + (dark ? 'light' : 'dark') + ' theme');
    button.title = (dark ? 'Light' : 'Dark') + ' theme';
    button.querySelector('use').setAttribute('href', dark ? '#i-sun' : '#i-moon');
    document.querySelector('meta[name="theme-color"]').content = dark ? '#17201f' : '#ffffff';
    try { localStorage.setItem('jingyu-theme', theme); } catch { /* Theme works without storage. */ }
  }
  setTheme(root.dataset.theme || 'light');
  button.hidden = false;
  button.addEventListener('click', () => setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark'));
})();
