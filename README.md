# Consulting Document Studio

Static GitHub Pages build of the Consulting Document Studio.

This version runs entirely in the browser at:

```text
https://ceofounder.github.io/DOCAPP/
```

It preserves the form, live preview and DOCX generation flow from the local app, but removes the Windows launcher, local Node server and server-side OpenAI API call. The hosted version uses the local consulting document model and a browser-side DOCX writer so no API key is stored in GitHub.

## Files

- `index.html` - app shell
- `styles.css` - application styling
- `app.js` - browser loader for the static app bundle
- `app.bundle.*.b64` - encoded static application bundle used by GitHub Pages
- `.github/workflows/pages.yml` - GitHub Pages deployment workflow
- `.nojekyll` - keeps GitHub Pages from applying Jekyll processing
