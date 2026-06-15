# DOCAPP Guardrails Skill

## Command

Use this canonical rule set whenever Gilles says:

- `$docapp-guardrails to update DOCAPP: [change]`
- `use DOCAPP guardrails`
- `update the document maker app safely`
- `change Consulting Document Studio`
- `update the Cloudflare DOCAPP app`

## Repository

- Source repository: `CEOFOUNDER/DOCAPP`
- Production URL: `https://docapp-ay1.pages.dev`
- Static fallback URL: `https://ceofounder.github.io/DOCAPP/`
- Cloudflare API endpoint: `/api/generate`

## Non-Negotiable Workflow

1. Treat the request as a change to the complete DOCAPP system, not only a visible frontend edit.
2. Fetch current GitHub files before editing or publishing.
3. Read `README.md`, `docs/DOCAPP_SPEC.md`, and this file before meaningful changes.
4. Identify all affected surfaces: app shell, styles, loader, encoded bundle, Cloudflare Function, OpenAI schema, DOCX writer, GitHub Pages fallback, Cloudflare setup, README, spec, and guardrail rules.
5. Do not put `OPENAI_API_KEY`, OpenAI bearer tokens, Cloudflare tokens, or other secrets in the repository.
6. Preserve the architecture: GitHub source, Cloudflare Pages host, Cloudflare Function backend, OpenAI key in Cloudflare secret.
7. Preserve the local DOCX fallback if AI generation fails.
8. Keep `README.md`, `docs/DOCAPP_SPEC.md`, and this file in sync with any behavioural or deployment change.
9. Run `scripts/check_docapp.py` from the installed skill before publishing when local files are available.
10. After publishing, verify the Cloudflare Pages URL and report the public URL and commit SHA.

## Protected Regression Rules

- `functions/api/generate.js` must use `env.OPENAI_API_KEY`.
- The backend must call the OpenAI Responses API, not expose the key to the browser.
- The frontend default endpoint must remain `/api/generate` unless all references are changed together.
- The frontend must catch AI failure and fall back to local document generation.
- `Benchmarking report` must stay available as a document type.
- Benchmarking reports must force OpenAI `web_search` in the Cloudflare Function and include trusted public-source references in the report.
- The deployed app must include `index.html`, `styles.css`, `app.js`, `app.bundle.*.b64`, and `functions/api/generate.js`.
- When the encoded bundle is not regenerated, small compatibility additions may live in the loader patch in `app.js`; document those additions clearly in the spec and guardrails.
- Cloudflare Pages build settings must remain: production branch `main`, no build command, output directory `.`.
- Documentation must explain that GitHub stores source code and Cloudflare stores the secret.
- The app must not depend on the old Windows `.exe`, launcher, or local Node server.

## Editing Guidance

Use `rg` to find related references before editing:

```powershell
rg -n "OPENAI_API_KEY|OPENAI_MODEL|/api/generate|docapp-ay1.pages.dev|github.io/DOCAPP|functions/api/generate|app.bundle|Cloudflare|Responses API" .
```

For manual file edits, use `apply_patch`. Keep changes scoped and avoid rewriting encoded bundle files unless the application source has genuinely changed and the bundle is regenerated consistently.

## Check Script

Run:

```powershell
& "C:\Users\gille\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe" "C:\Users\gille\.codex\skills\docapp-guardrails\scripts\check_docapp.py" "<path-to-DOCAPP-folder>"
```

The check should pass before publishing. If it fails, fix the regression before updating GitHub or Cloudflare.

## Final Response Requirements

In the final response, state:

- files changed;
- whether README, app spec, and guardrails were updated or did not need changes;
- checks run and result;
- public URL tested;
- GitHub commit SHA or clear publication blocker.
