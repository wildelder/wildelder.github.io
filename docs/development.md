# Homepage preview

Run `npm run dev` (Node.js, no dependencies), then open http://127.0.0.1:4173. Stop the server with Ctrl+C. `npm run check` checks JavaScript syntax.

The homepage is a plain `index.html`, served unchanged by GitHub Pages. The existing Jekyll configuration remains for the sitemap and `/about/` and `/about.html` redirects. No bundler or Ruby is required for the local homepage preview; the preview server also implements those redirects. Local preview does not run the full Jekyll plugin build.

- Content: `index.html`
- Layout and responsive styles: `assets/css/home.css`
- Interaction behavior: `assets/js/home.js`
- Published result panels and coordinates: `assets/js/research-data.js`
- Attribution and sample limitations: `assets/research/README.md`
- CV: `files/CV_Jingyu_Lu.pdf` is the supplied February 2026 document, explicitly dated in the UI. It has not been rewritten to include later experience.

The current HKUST PhD status and Ant International internship (March–June 2026, agent self-evolution) were confirmed by the owner. The exact PhD start date and TA end date are not assumed. The Google Scholar placeholder was removed until a real profile URL is available.

No deployment is performed by the preview script. Publication is the existing GitHub Pages flow after committing and pushing reviewed changes.
