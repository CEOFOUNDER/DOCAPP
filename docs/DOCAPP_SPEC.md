# DOCAPP Specification

## Purpose

DOCAPP is the hosted Consulting Document Studio. It creates board-ready consulting DOCX documents from a structured form, using a secure Cloudflare backend for AI generation and a browser-side DOCX writer for downloads.

## Source Of Truth

- Repository: `CEOFOUNDER/DOCAPP`
- Production host: Cloudflare Pages
- Production URL: `https://docapp-ay1.pages.dev`
- Static fallback URL: `https://ceofounder.github.io/DOCAPP/`
- API endpoint: `/api/generate`

GitHub remains the source of truth for code and documentation. Cloudflare hosts the deployed copy and stores secrets.

## Runtime Architecture

```text
Browser app
  -> Cloudflare Pages Function at /api/generate
  -> OpenAI Responses API
  -> structured JSON document model
  -> browser-side DOCX writer
  -> .docx download
```

The browser must never contain the OpenAI API key. The key must be held only in Cloudflare as the `OPENAI_API_KEY` secret.

## Files And Responsibilities

- `index.html` - application shell and form fields.
- `styles.css` - application layout and visual styling.
- `app.js` - deployed browser loader that assembles the encoded application bundle and installs the Cloudflare AI generation hook.
- `app.bundle.*.b64` - encoded static application bundle used by `app.js`.
- `functions/api/generate.js` - Cloudflare Pages Function that calls OpenAI securely and returns the JSON document model.
- `.github/workflows/pages.yml` - GitHub Pages fallback deployment.
- `.nojekyll` - prevents GitHub Pages Jekyll processing.
- `README.md` - setup and file overview.
- `docs/DOCAPP_SPEC.md` - this specification.
- `docs/DOCAPP_GUARDRAILS_SKILL.md` - canonical update guardrails for `$docapp-guardrails`.

## AI Contract

The frontend sends normalized form input to `/api/generate`.

The backend must:

- read `env.OPENAI_API_KEY`;
- optionally read `env.OPENAI_MODEL`, defaulting to `gpt-5.2`;
- call `https://api.openai.com/v1/responses`;
- request strict JSON schema output;
- return `{ "document": ... }`;
- include CORS headers for POST and OPTIONS;
- avoid logging or returning secrets.

The document model must keep the fields consumed by the DOCX writer:

- `title`
- `subtitle`
- `executiveSummary`
- `context`
- `situation`
- `clientSpecificContext`
- `consultantPerspective`
- `objective`
- `scope`
- `approach`
- `styleNote`
- `sections`
- `tables`
- `recommendedActions`
- `risks`
- `assumptions`
- `workCarriedOut`
- `appendix`

The frontend must keep a local model fallback. If the AI call fails, the app should still generate a DOCX and show `AI unavailable; using local model`.

## Cloudflare Configuration

Cloudflare Pages project:

- Project name: `docapp`
- Repository: `CEOFOUNDER/DOCAPP`
- Production branch: `main`
- Framework preset: `None`
- Build command: empty
- Build output directory: `.`
- Secret: `OPENAI_API_KEY`
- Optional variable: `OPENAI_MODEL`

After changing secrets or environment variables, redeploy the project.

## Protected Decisions

- Do not restore the Windows `.exe` path as the primary app.
- Do not commit API keys, bearer tokens, Cloudflare tokens, or local launcher secrets.
- Do not move OpenAI calls into browser JavaScript.
- Keep GitHub as source of truth and Cloudflare as deployment/runtime host.
- Keep the Cloudflare Function path at `functions/api/generate.js` unless the frontend endpoint and docs are updated in the same change.
- Keep `/api/generate` as the default frontend endpoint unless all docs and tests are updated.
- Keep a non-AI local fallback document model.
- Keep DOCX generation browser-side unless there is a deliberate architecture update.
- Keep `README.md`, this specification, and `docs/DOCAPP_GUARDRAILS_SKILL.md` aligned with behaviour.

## Update Workflow

Use `$docapp-guardrails to update DOCAPP: [change]` for any future app update.

Every update must:

1. Fetch the current GitHub files before editing.
2. Identify affected parts: frontend, bundle loader, Cloudflare Function, schema, DOCX writer, deployment config, README, specification, guardrails, or secrets instructions.
3. Make the smallest coherent change.
4. Update docs when behaviour, setup, architecture, deployment, secrets, or protected decisions change.
5. Run the DOCAPP guardrail check before publishing.
6. Verify the live Cloudflare URL after deployment.

## Regression Checks

Before publishing, run the installed skill check script against the repo or local working folder:

```powershell
& "C:\Users\gille\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe" "C:\Users\gille\.codex\skills\docapp-guardrails\scripts\check_docapp.py" "<path-to-DOCAPP-folder>"
```

Required live checks after Cloudflare deploy:

- `https://docapp-ay1.pages.dev/` returns the app shell.
- `/api/generate` exists and returns a JSON error rather than a 404 when the method or body is invalid.
- A sample document can be generated and downloaded.
