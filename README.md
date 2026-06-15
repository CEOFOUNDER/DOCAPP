# Consulting Document Studio

Static build of the Consulting Document Studio with optional Cloudflare-hosted AI generation.

Production app:

```text
https://docapp-ay1.pages.dev/
```

Static fallback:

```text
https://ceofounder.github.io/DOCAPP/
```

For full AI document generation, deploy this repository to Cloudflare Pages. Cloudflare Pages serves the frontend and the secure API function at `/api/generate`.

The **Benchmarking report** document type uses publicly available information by default. The Cloudflare Function forces OpenAI web search for that type and asks for trusted public-source references, source URLs and comparability limitations in the report.

## Cloudflare setup

1. In Cloudflare, go to **Workers & Pages**.
2. Create a **Pages** project connected to `CEOFOUNDER/DOCAPP`.
3. Use branch `main`.
4. Use no build command.
5. Set the build output directory to `.`.
6. In the Pages project settings, add environment variables:
   - `OPENAI_API_KEY` - your real OpenAI API key, stored as a secret
   - `OPENAI_MODEL` - optional, defaults to `gpt-5.2`
7. Redeploy the Pages project after changing secrets or environment variables.

Do not store `OPENAI_API_KEY` in this repository. The browser calls `/api/generate`; Cloudflare injects the secret only into the server-side function.

## Files

- `index.html` - app shell
- `styles.css` - application styling
- `.nojekyll` - keeps GitHub Pages from applying Jekyll processing
- `app.js` - browser loader for the static app bundle, with an AI endpoint hook
- `app.bundle.*.b64` - encoded static application bundle
- `functions/api/generate.js` - Cloudflare Pages Function that calls OpenAI securely
- `.github/workflows/pages.yml` - GitHub Pages deployment workflow
- `docs/DOCAPP_SPEC.md` - canonical app specification
- `docs/DOCAPP_GUARDRAILS_SKILL.md` - canonical guardrails for `$docapp-guardrails`

## Guardrail command

Use this command style for future protected updates:

```text
$docapp-guardrails to update DOCAPP: [your change]
```

The installed Codex skill reads `docs/DOCAPP_GUARDRAILS_SKILL.md` and keeps the app, Cloudflare backend, checks, README, and specification aligned.
