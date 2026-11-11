/* Published figures are displayed as unmodified image sprites.
 * Rectangles identify the original and method panels; see assets/research/README.md. */
window.RESEARCH_DATA = {
  zebra: {
    image: 'assets/research/zebra-results.png', width: 1002, height: 519,
    label: 'ZEBRA', source: 'https://arxiv.org/html/2510.27128v1#S4.F5',
    detail: 'fMRI → image · zero-shot cross-subject decoding',
    note: 'Published examples from ZEBRA, Figure 5. Precomputed reconstructions; no live inference. Semantics may be preserved even when appearance differs.',
    samples: [
      { name: 'Surfing', original: [1,32,113,113], reconstruction: [123,32,113,113] },
      { name: 'Snowboarding', original: [506,32,113,113], reconstruction: [629,32,113,113] },
      { name: 'Baseball', original: [1,157,113,113], reconstruction: [123,157,113,113] },
      { name: 'Airplane', original: [506,157,113,113], reconstruction: [629,157,113,113] },
      { name: 'Portrait', original: [1,281,113,113], reconstruction: [123,281,113,113] },
      { name: 'Dog', original: [506,281,113,113], reconstruction: [629,281,113,113] },
      { name: 'Clock', original: [1,404,113,113], reconstruction: [123,404,113,113] },
      { name: 'Bathroom', original: [506,404,113,113], reconstruction: [629,404,113,113] }
    ]
  },
  vcflow: {
    image: 'assets/research/vcflow-results.png', width: 1189, height: 622,
    label: 'VCFlow', source: 'https://arxiv.org/html/2511.02565v2#S4.F5',
    detail: 'fMRI → video · subject-agnostic decoding',
    note: 'Six published frames per example from VCFlow, Figure 5. Playback steps through these frames; it is not the original video or live inference.',
    samples: [
      { name: 'Beach', original: [30,2,92,94], reconstruction: [30,101,92,92], step: 94.4 },
      { name: 'Aircraft', original: [623,2,92,94], reconstruction: [623,101,92,92], step: 94.4 },
      { name: 'Conversation', original: [30,327,92,93], reconstruction: [30,426,92,93], step: 94.4 },
      { name: 'Pool', original: [623,327,92,93], reconstruction: [623,426,92,93], step: 94.4 }
    ]
  }
};
