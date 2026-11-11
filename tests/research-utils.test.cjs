const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const vm = require('node:vm');

const context = vm.createContext({ URL });
context.window = context;
for (const file of ['research-data.js', 'research-utils.js']) {
  vm.runInContext(readFileSync(join(__dirname, '../assets/js', file), 'utf8'), context);
}
const data = context.RESEARCH_DATA;
const { readView, makeViewURL } = context.RESEARCH_UTILS;
const plain = value => JSON.parse(JSON.stringify(value));

test('unknown and prototype names safely fall back to a real model and sample', () => {
  for (const model of ['missing', '__proto__', 'constructor', 'toString']) {
    assert.deepEqual(plain(readView(`https://example.org/?model=${model}&sample=unknown&frame=9&view=invalid`, data)), {
      model: 'zebra', sampleIndex: 0, frame: 0, view: 'pair', split: 50
    });
  }
});

test('external frame and split values are finite, bounded, and correctly indexed', () => {
  const cases = [
    ['', '', 0, 50], ['0', '-30', 0, 0], ['999', '101', 5, 100],
    ['Infinity', 'NaN', 0, 50], ['3.4', '64.3', 2, 64], ['6', '0', 5, 0]
  ];
  for (const [frame, split, expectedFrame, expectedSplit] of cases) {
    const view = readView(`https://example.org/?model=vcflow&sample=pool&frame=${frame}&split=${split}&view=swipe`, data);
    assert.equal(view.sampleIndex, 3);
    assert.equal(view.frame, expectedFrame);
    assert.equal(view.split, expectedSplit);
    assert.equal(view.view, 'swipe');
  }
});

test('shared views omit unrelated queries, credentials, and prior fragments', () => {
  const url = makeViewURL('https://user:secret@example.org/portfolio/?token=private#experience', {
    model: 'vcflow', sampleIndex: 3, frame: 5, view: 'swipe', split: 70
  }, data);
  assert.equal(url, 'https://example.org/portfolio/?model=vcflow&sample=pool&frame=6&view=swipe&split=70#explorer');
});

test('every published sample and frame survives sharing on localhost and a subpath', () => {
  for (const base of ['http://127.0.0.1:4173/', 'https://example.org/portfolio/']) {
    for (const [model, current] of Object.entries(data)) {
      current.samples.forEach((_, sampleIndex) => {
        for (let frame = 0; frame < (model === 'vcflow' ? 6 : 1); frame++) {
          for (const split of [0, 50, 100]) {
            const view = { model, sampleIndex, frame, view: 'swipe', split };
            assert.deepEqual(plain(readView(makeViewURL(base, view, data), data)), view);
          }
          const pair = { model, sampleIndex, frame, view: 'pair', split: 50 };
          assert.deepEqual(plain(readView(makeViewURL(base, pair, data), data)), pair);
        }
      });
    }
  }
});
