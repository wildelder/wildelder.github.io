/* Pure helpers shared by the browser and the Node contract tests. */
((root) => {
  'use strict';
  const slug = name => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  function bounded(value, minimum, maximum, fallback) {
    if (value === null || value === undefined || String(value).trim() === '') return fallback;
    const number = Number(value);
    return Number.isFinite(number) ? Math.max(minimum, Math.min(maximum, Math.round(number))) : fallback;
  }
  function readView(url, data) {
    const params = new URL(url).searchParams;
    const model = Object.hasOwn(data, params.get('model')) ? params.get('model') : 'zebra';
    const current = data[model];
    const index = current.samples.findIndex(sample => slug(sample.name) === params.get('sample'));
    return {
      model, sampleIndex: index < 0 ? 0 : index,
      frame: model === 'vcflow' ? bounded(params.get('frame'), 1, 6, 1) - 1 : 0,
      view: params.get('view') === 'swipe' ? 'swipe' : 'pair',
      split: bounded(params.get('split'), 0, 100, 50)
    };
  }
  function makeViewURL(base, view, data) {
    const url = new URL(base);
    // Share only the viewer state, not unrelated query parameters or credentials.
    url.search = ''; url.username = ''; url.password = ''; url.hash = 'explorer';
    const model = Object.hasOwn(data, view.model) ? view.model : 'zebra';
    const index = bounded(view.sampleIndex, 0, data[model].samples.length - 1, 0);
    url.searchParams.set('model', model);
    url.searchParams.set('sample', slug(data[model].samples[index].name));
    if (model === 'vcflow') url.searchParams.set('frame', bounded(view.frame, 0, 5, 0) + 1);
    if (view.view === 'swipe') {
      url.searchParams.set('view', 'swipe');
      url.searchParams.set('split', bounded(view.split, 0, 100, 50));
    }
    return url.href;
  }
  root.RESEARCH_UTILS = Object.freeze({ readView, makeViewURL });
})(globalThis);
