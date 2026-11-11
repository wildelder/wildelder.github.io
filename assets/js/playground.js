(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  // A local command palette. It searches this page's content; it sends no query anywhere.
  const dialog = $('command-dialog'), input = $('command-input'), results = $('command-results');
  let matching = [], active = 0, opener = null, pendingAction = null;
  let statusTimer;
  function message(text) {
    clearTimeout(statusTimer);
    $('toast').textContent = text; $('toast').classList.add('visible');
    statusTimer = setTimeout(() => $('toast').classList.remove('visible'), 2800);
  }
  function jump(id) {
    const target = $(id);
    target.setAttribute('tabindex', '-1');
    target.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
    target.focus({ preventScroll: true });
  }
  const commands = [
    { title: 'About Jingyu', description: 'Background and research interests', category: 'Section', terms: 'about introduction 简介 关于', run: () => jump('about-me') },
    { title: 'Selected research', description: 'Papers and published reconstruction examples', category: 'Interactive', terms: 'brain neuroscience fmri 脑 解码 研究', run: () => jump('research') },
    { title: 'VCFlow results', description: 'View published video frames', category: 'Interactive', terms: 'iclr video 2026 视频 重建', run: () => document.dispatchEvent(new CustomEvent('research:navigate', { detail: { model: 'vcflow' } })) },
    { title: 'ZEBRA results', description: 'View published image reconstructions', category: 'Interactive', terms: 'neurips image 2025 图像 重建', run: () => document.dispatchEvent(new CustomEvent('research:navigate', { detail: { model: 'zebra' } })) },
    { title: 'VCFlow paper', description: 'ICLR 2026 · cognitive process-inspired brain decoding', category: 'Publication', terms: 'publication citation bibtex video 论文 引用', run: () => jump('paper-vcflow') },
    { title: 'ZEBRA paper', description: 'NeurIPS 2025 · zero-shot cross-subject generalization', category: 'Publication', terms: 'publication citation bibtex image 论文 引用', run: () => jump('paper-zebra') },
    { title: 'Research experience', description: 'Ant International, medical AI, and AgiBot', category: 'Section', terms: 'intern agent self evolution miccai vlm3d ant agibot embodied robotics 蚂蚁 智元 实习 经历', run: () => jump('experience') },
    { title: 'Education & honors', description: 'HKUST, Peking University, and selected awards', category: 'Section', terms: 'pku zhi scholarship phd awards 教育 荣誉 北大 港科大', run: () => jump('education') },
    { title: 'Open curriculum vitae', description: 'The supplied CV · February 2026', category: 'Document', terms: 'cv resume pdf download 简历 下载', run: () => { window.open('files/CV_Jingyu_Lu.pdf', '_blank', 'noopener'); } },
    { title: 'Copy email address', description: 'lu2629346363@stu.pku.edu.cn', category: 'Action', terms: 'contact email 邮件 邮箱 联系', run: async () => {
      try { await navigator.clipboard.writeText('lu2629346363@stu.pku.edu.cn'); message('Email address copied'); }
      catch { message('Email: lu2629346363@stu.pku.edu.cn'); }
    } },
    { title: 'Toggle light / dark theme', description: 'Change the appearance of this homepage', category: 'Action', terms: 'theme night day dark light 主题 深色 浅色', run: () => $('theme-toggle').click() }
  ];
  function setActive(index) {
    active = matching.length ? (index + matching.length) % matching.length : 0;
    [...results.children].forEach((item, i) => item.setAttribute('aria-selected', String(i === active)));
    if (matching.length) {
      input.setAttribute('aria-activedescendant', `command-option-${active}`);
      results.children[active].scrollIntoView({ block: 'nearest' });
    } else input.removeAttribute('aria-activedescendant');
  }
  function choose(index) {
    if (!matching[index]) return;
    pendingAction = matching[index].run; dialog.close();
  }
  function search() {
    const terms = input.value.toLowerCase().trim().split(/\s+/).filter(Boolean);
    matching = commands.filter(command => terms.every(term => `${command.title} ${command.description} ${command.category} ${command.terms}`.toLowerCase().includes(term)));
    results.replaceChildren();
    matching.forEach((command, i) => {
      const item = document.createElement('button'); item.type = 'button'; item.id = `command-option-${i}`;
      item.setAttribute('role', 'option'); item.tabIndex = -1;
      const label = document.createElement('span');
      const title = document.createElement('strong'); title.textContent = command.title;
      const description = document.createElement('small'); description.textContent = command.description;
      label.append(title, description);
      const category = document.createElement('span'); category.className = 'command-category'; category.textContent = command.category;
      item.append(label, category);
      item.addEventListener('click', () => choose(i));
      results.append(item);
    });
    $('command-empty').hidden = matching.length > 0;
    $('command-status').textContent = `${matching.length} results`;
    setActive(0);
  }
  function openCommands() {
    if (dialog.open) { dialog.close(); return; }
    if (document.querySelector('dialog[open]')) return;
    opener = document.activeElement; pendingAction = null;
    input.value = ''; search();
    document.documentElement.classList.add('command-open');
    dialog.showModal(); input.focus();
  }
  if (typeof dialog.showModal === 'function') {
    $('search-toggle').hidden = false;
    $('search-toggle').addEventListener('click', openCommands);
    document.addEventListener('keydown', event => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k' && !event.altKey) {
        if (!dialog.open && document.querySelector('dialog[open]')) return;
        event.preventDefault(); openCommands();
      }
    });
  }
  input.addEventListener('input', search);
  input.addEventListener('keydown', event => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); setActive(active + (event.key === 'ArrowDown' ? 1 : -1)); }
    if (event.key === 'Enter') { event.preventDefault(); choose(active); }
  });
  $('command-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    document.documentElement.classList.remove('command-open');
    const action = pendingAction; pendingAction = null;
    if (action) action(); else if (opener?.isConnected) opener.focus({ preventScroll: true });
  });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
})();
