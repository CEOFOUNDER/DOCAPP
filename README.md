# Consulting Document Studio

Static build of the Consulting Document Studio with optional Cloudflare-hosted AI generation.

The static app can run at:

```text
https://ceofounder.github.io/DOCAPP/
```

For full AI document generation, deploy this repository to Cloudflare Pages. Cloudflare Pages will serve the frontend and the secure API function at `/api/generate`.

## Cloudflare setup

1. In Cloudflare, go to **Workers & Pages**.
2. Create a **Pages** project connected to `CEOFOUNDER/DOCAPP`.
3. Use branch `main` or `gh-pages`.
4. Use no build command.
5. Set the build output directory to `/` or the repository root.
6. In the Pages project settings, add environment variables:
   - `OPENAI_API_KEY` - your real OpenAI API key
   - `OPENAI_MODEL` - optional, defaults to `gpt-5.2`
7. Redeploy the Pages project.

Do not store `OPENAI_API_KEY` in this repository. The browser calls `/api/generate`; Cloudflare injects the secret only into the server-side function.

## Files

- `index.html` - app shell
- `styles.css` - application styling
- `app.js` - browser loader for the static app bundle, with an AI endpoint hook
- `app.bundle.*.b64` - encoded static application bundle
- `functions/api/generate.js` - Cloudflare Pages Function that calls OpenAI securely
- `.github/workflows/pages.yml` - GitHub Pages deployment workflow
- `.nojekyll` - keeps GitHub Pages from applying Jekyll processing
