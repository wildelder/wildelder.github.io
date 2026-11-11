(() => {
  'use strict';
  const data = window.RESEARCH_DATA;
  const $ = id => document.getElementById(id);
  let model = 'zebra', sampleIndex = 0, frame = 0, timer = null;
  let toastTimer;

  function crop(element, rect, label, current = data[model]) {
    const [x, y, w, h] = rect;
    element.style.backgroundImage = `url("${current.image}")`;
    element.style.backgroundSize = `${current.width / w * 100}% ${current.height / h * 100}%`;
    element.style.backgroundPosition = `${x / (current.width - w) * 100}% ${y / (current.height - h) * 100}%`;
    if (label) element.setAttribute('aria-label', label);
  }
  function frameRect(rect, sample) {
    return [Math.round(rect[0] + (sample.step || 0) * frame), ...rect.slice(1)];
  }
  function paintResult(announce = false) {
    const current = data[model], sample = current.samples[sampleIndex];
    const original = frameRect(sample.original, sample);
    const reconstruction = frameRect(sample.reconstruction, sample);
    const suffix = model === 'vcflow' ? `, published frame ${frame + 1}` : '';
    crop($('stimulus-image'), original, `${sample.name}: original stimulus${suffix}`);
    crop($('reconstruction-image'), reconstruction, `${sample.name}: ${current.label} reconstruction${suffix}`);
    crop($('swipe-original'), original, `${sample.name}: original stimulus${suffix}`);
    crop($('swipe-reconstruction'), reconstruction, `${sample.name}: ${current.label} reconstruction${suffix}`);
    $('sample-name').textContent = sample.name;
    $('sample-counter').textContent = `${String(sampleIndex + 1).padStart(2, '0')} / ${String(current.samples.length).padStart(2, '0')}`;
    $('reconstruction-label').textContent = `${current.label} reconstruction`;
    $('frame-input').value = frame;
    $('frame-input').setAttribute('aria-valuetext', `Published frame ${frame + 1} of 6`);
    $('frame-counter').textContent = `Frame ${frame + 1} / 6`;
    $('sample-picker').querySelectorAll('button').forEach((button, i) => button.setAttribute('aria-pressed', String(i === sampleIndex)));
    if (announce) $('result-status').textContent = `${current.label}: ${sample.name}${suffix}`;
  }
  function stopPlayback() {
    clearInterval(timer); timer = null;
    $('play-frames').setAttribute('aria-label', 'Play published frames');
    $('play-frames').setAttribute('aria-pressed', 'false');
    $('play-frames').querySelector('use').setAttribute('href', '#i-play');
  }
  function selectModel(next, announce = false) {
    stopPlayback(); model = next; sampleIndex = 0; frame = 0;
    const current = data[model];
    document.querySelectorAll('[data-model]').forEach(button => {
      const selected = button.dataset.model === model;
      button.setAttribute('aria-selected', String(selected));
      button.tabIndex = selected ? 0 : -1;
    });
    $('result-panel').setAttribute('aria-labelledby', `tab-${model}`);
    $('frame-controls').hidden = model !== 'vcflow';
    $('sample-instruction').textContent = `${current.samples.length} published examples`;
    $('result-note').textContent = current.note;
    $('task-detail').textContent = current.detail;
    $('figure-source').href = current.source;
    const picker = $('sample-picker');
    picker.replaceChildren();
    picker.classList.toggle('is-video', model === 'vcflow');
    current.samples.forEach((sample, i) => {
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'sample-button';
      button.setAttribute('aria-label', `Show ${sample.name.toLowerCase()} example`);
      const image = document.createElement('span'); image.className = 'image-crop';
      image.style.display = 'block'; image.setAttribute('aria-hidden', 'true');
      crop(image, sample.original, null, current);
      const label = document.createElement('span'); label.className = 'sample-label'; label.textContent = sample.name;
      button.append(image, label);
      button.addEventListener('click', () => { stopPlayback(); sampleIndex = i; frame = 0; paintResult(true); });
      picker.append(button);
    });
    paintResult(announce);
  }
  document.querySelectorAll('[data-model]').forEach(button => {
    button.addEventListener('click', () => selectModel(button.dataset.model, true));
    button.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 'zebra' : event.key === 'End' ? 'vcflow' : model === 'zebra' ? 'vcflow' : 'zebra';
      selectModel(next, true); $(`tab-${next}`).focus();
    });
  });
  $('view-toggle').addEventListener('click', () => {
    const swipe = $('view-toggle').getAttribute('aria-pressed') !== 'true';
    $('view-toggle').setAttribute('aria-pressed', String(swipe));
    $('view-toggle').textContent = swipe ? 'Side by side' : 'Swipe compare';
    $('comparison-pair').hidden = swipe;
    $('swipe-view').hidden = !swipe;
  });
  $('swipe-input').addEventListener('input', event => {
    event.target.closest('.swipe-stage').style.setProperty('--split', `${event.target.value}%`);
    event.target.setAttribute('aria-valuetext', `${event.target.value}% original stimulus`);
  });
  $('frame-input').addEventListener('input', event => { stopPlayback(); frame = Number(event.target.value); paintResult(); });
  $('play-frames').addEventListener('click', () => {
    if (timer) { stopPlayback(); return; }
    $('play-frames').setAttribute('aria-label', 'Pause published frames');
    $('play-frames').setAttribute('aria-pressed', 'true');
    $('play-frames').querySelector('use').setAttribute('href', '#i-pause');
    timer = setInterval(() => { frame = (frame + 1) % 6; paintResult(); }, 650);
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stopPlayback(); });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => { if (!entries[0].isIntersecting) stopPlayback(); }).observe($('explorer'));
  }
  document.querySelectorAll('[data-show-model]').forEach(button => button.addEventListener('click', () => {
    selectModel(button.dataset.showModel, true);
    $('explorer').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
    $(`tab-${model}`).focus({ preventScroll: true });
  }));
  function toast(message) {
    clearTimeout(toastTimer);
    $('toast').textContent = message; $('toast').classList.add('visible');
    toastTimer = setTimeout(() => $('toast').classList.remove('visible'), 2500);
  }
  document.querySelectorAll('[data-citation]').forEach(button => button.addEventListener('click', async () => {
    const pre = $(`citation-${button.dataset.citation}`);
    try { await navigator.clipboard.writeText(pre.textContent); toast('BibTeX copied'); }
    catch {
      const range = document.createRange(); range.selectNodeContents(pre);
      const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range);
      toast('Citation selected. Press Ctrl+C / ⌘C to copy.');
    }
  }));
  if ('IntersectionObserver' in window) {
    const links = [...document.querySelectorAll('nav a[href^="#"]')];
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) links.forEach(link => {
        if (link.hash === `#${entry.target.id}`) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      }); });
    }, { rootMargin: '-15% 0px -65% 0px' });
    links.forEach(link => { const target = document.querySelector(link.hash); if (target) observer.observe(target); });
  }
  selectModel('zebra');
  document.querySelector('.interactive-ui').hidden = false;
})();
