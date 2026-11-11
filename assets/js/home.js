(() => {
  'use strict';
  const data = window.RESEARCH_DATA;
  const utils = window.RESEARCH_UTILS;
  const $ = id => document.getElementById(id);
  const galleries = new Map();
  let toastTimer;

  function crop(element, rect, label, current) {
    const [x, y, w, h] = rect;
    element.style.backgroundImage = 'url("' + current.image + '")';
    element.style.backgroundSize = (current.width / w * 100) + '% ' + (current.height / h * 100) + '%';
    element.style.backgroundPosition = (x / (current.width - w) * 100) + '% ' + (y / (current.height - h) * 100) + '%';
    element.style.aspectRatio = w + ' / ' + h;
    element.setAttribute('aria-label', label);
  }
  for (const [model, current] of Object.entries(data)) {
    const select = $('sample-' + model);
    const state = { model, sampleIndex: 0, frame: 0 };
    current.samples.forEach((sample, index) => {
      const option = document.createElement('option');
      option.value = index; option.textContent = sample.name; select.append(option);
    });
    function paint() {
      const sample = current.samples[state.sampleIndex];
      const frameRect = rect => [Math.round(rect[0] + (sample.step || 0) * state.frame), ...rect.slice(1)];
      const suffix = model === 'vcflow' ? ', published frame ' + (state.frame + 1) : '';
      crop($('original-' + model), frameRect(sample.original), sample.name + ': original stimulus' + suffix, current);
      crop($('reconstruction-' + model), frameRect(sample.reconstruction), sample.name + ': ' + current.label + ' reconstruction' + suffix, current);
      select.value = state.sampleIndex;
      if (model === 'vcflow') {
        $('frame-vcflow').value = state.frame;
        $('frame-vcflow').setAttribute('aria-valuetext', 'Published frame ' + (state.frame + 1) + ' of 6');
        $('frame-label-vcflow').textContent = (state.frame + 1) + ' / 6';
      }
      $('share-' + model).hidden = true;
    }
    select.addEventListener('change', () => { state.sampleIndex = Number(select.value); state.frame = 0; paint(); });
    if (model === 'vcflow') $('frame-vcflow').addEventListener('input', event => { state.frame = Number(event.target.value); paint(); });
    galleries.set(model, { state, paint });
    paint();
    select.closest('.paper-results').hidden = false;
  }
  function openGallery(model, sampleIndex = 0, frame = 0, focus = true) {
    const gallery = galleries.get(model);
    if (!gallery) return;
    gallery.state.sampleIndex = Number.isInteger(sampleIndex) && data[model].samples[sampleIndex] ? sampleIndex : 0;
    gallery.state.frame = model === 'vcflow' && Number.isInteger(frame) && frame >= 0 && frame < 6 ? frame : 0;
    gallery.paint();
    $('results-' + model).open = true;
    if (focus) {
      $('results-' + model).scrollIntoView({ behavior: 'instant', block: 'start' });
      $('sample-' + model).focus({ preventScroll: true });
    }
  }
  document.addEventListener('research:navigate', event => {
    if (event.detail) openGallery(event.detail.model, event.detail.sampleIndex);
  });
  document.querySelectorAll('[data-copy-view]').forEach(button => button.addEventListener('click', async () => {
    const model = button.dataset.copyView;
    const input = $('link-' + model);
    input.value = utils.makeViewURL(location.href, galleries.get(model).state, data);
    $('share-' + model).hidden = false;
    try {
      await navigator.clipboard.writeText(input.value);
      $('share-status-' + model).textContent = 'Link copied.';
    } catch {
      input.focus(); input.select();
      $('share-status-' + model).textContent = 'Press Ctrl+C / ⌘C to copy the selected link.';
    }
  }));
  function toast(message) {
    clearTimeout(toastTimer);
    $('toast').textContent = message; $('toast').classList.add('visible');
    toastTimer = setTimeout(() => $('toast').classList.remove('visible'), 2500);
  }
  document.querySelectorAll('[data-citation]').forEach(button => button.addEventListener('click', async () => {
    const pre = $('citation-' + button.dataset.citation);
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
        if (link.hash === '#' + entry.target.id) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      }); });
    }, { rootMargin: '-15% 0px -65% 0px' });
    links.forEach(link => { const target = document.querySelector(link.hash); if (target) observer.observe(target); });
  }
  if (new URL(location.href).searchParams.has('model')) {
    const view = utils.readView(location.href, data);
    openGallery(view.model, view.sampleIndex, view.frame, false);
    if (location.hash === '#explorer' || location.hash === '#results-' + view.model) {
      requestAnimationFrame(() => $('results-' + view.model).scrollIntoView({ behavior: 'instant', block: 'start' }));
    }
  }
})();
