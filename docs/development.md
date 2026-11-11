# Homepage preview

Run `node scripts/preview.mjs`, then open http://127.0.0.1:4173. No dependencies, bundler, or Ruby are needed for the local preview. Stop the server with Ctrl+C. If npm is available, `npm run dev` is an equivalent shortcut.

The homepage is a static `index.html`, served unchanged by GitHub Pages. The existing Jekyll configuration provides the sitemap and legacy about-page redirects. Local preview does not run the full Jekyll plugin build. No deployment is performed by the preview script.

- Content and publication result panels: `index.html`
- Base layout: `assets/css/home.css`
- Restrained academic styling and themes: `assets/css/enhancements.css`
- Inline reconstruction examples and citation copying: `assets/js/home.js`
- Theme preference: `assets/js/enhancements.js`
- Optional quick navigation: `assets/js/playground.js` and `assets/css/playground.css`
- Published figure coordinates: `assets/js/research-data.js`
- Share-link parsing: `assets/js/research-utils.js`
- Result source attribution: `assets/research/README.md`

## Presentation and interactions

The page starts with a short introduction, news, and publications. Decorative hero text, the conceptual brain diagram, the standalone decoding room, quiz, focus overlay, and scroll animations have been removed. Each publication has a native “View results” disclosure, closed by default. It contains a sample selector and a compact original/reconstruction pair. VCFlow also has a manual slider for its six published frames. Results use unmodified published figure crops; there is no live inference or autoplay.

“Copy link” remembers the paper, sample, and video frame. Links use the current origin, so local links remain local until the site is deployed. Older viewer links still resolve to the matching inline result; their swipe setting is no longer displayed. Clipboard failure leaves a selectable URL. Paper citations retain the copy/select fallback.

The light/dark toggle stores only the chosen theme. Ctrl/⌘ K opens optional quick navigation for papers, sections, CV, email, and theme. Queries remain in the page. Arrow keys choose a result, Enter opens it, and Escape restores focus.

The current HKUST PhD status and Ant International internship (March–June 2026, agent self-evolution) were confirmed by the owner. Beyond Research remains icons only. The CV at `files/CV_Jingyu_Lu.pdf` is the supplied February 2026 document and is dated accordingly in the interface.

## Checks

`npm run check` runs JavaScript syntax checks and URL contract tests; without npm, run `node --test tests/research-utils.test.cjs` and `node --check` on the scripts. Browser checks cover default collapsed results, model/sample/frame selection, share-link restoration, quick navigation, themes, and narrow layouts. Publication remains the existing GitHub Pages commit/push workflow.
