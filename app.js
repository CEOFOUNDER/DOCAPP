(async function () {
  const bundleFiles = [
    "app.bundle.0.b64",
    "app.bundle.1.b64",
    "app.bundle.2.b64",
    "app.bundle.3.b64",
    "app.bundle.4.b64",
    "app.bundle.5.b64",
    "app.bundle.6.b64",
    "app.bundle.7.0.b64",
    "app.bundle.7.1.b64",
    "app.bundle.7.2.b64",
    "app.bundle.7.3.b64",
    "app.bundle.8.b64"
  ];
  const status = document.querySelector("#statusText");

  const cloudflareAiPatch = `
(function () {
  const aiEndpoint = window.DOCAPP_API_URL || "/api/generate";

  async function fetchAiDocumentModel(input) {
    const response = await fetch(aiEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input })
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload.error || "AI generation service is unavailable.");
    }
    return payload.document || payload;
  }

  async function generateAiDocx(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
    try {
      generateButton.disabled = true;
      statusText.textContent = "Generating with AI";
      const input = normaliseInput(formPayload());
      let documentModel;
      try {
        documentModel = await fetchAiDocumentModel(input);
      } catch (error) {
        console.warn(error);
        statusText.textContent = "AI unavailable; using local model";
        documentModel = localDocumentModel(input);
      }
      const blob = createDocxBlob(input, documentModel);
      const filename = \`\${safeFileName(input.clientName)}-\${safeFileName(input.documentType)}.docx\`;
      downloadBlob(blob, filename);
      statusText.textContent = "Downloaded";
    } catch (error) {
      statusText.textContent = "Generation failed";
      previewContent.innerHTML = \`<p class="status">\${escapeHtml(error.message || "Document generation failed.")}</p>\`;
    } finally {
      generateButton.disabled = false;
    }
  }

  generateButton.addEventListener("click", generateAiDocx, true);
}());
`;

  try {
    const chunks = await Promise.all(bundleFiles.map(async (file) => {
      const response = await fetch(file, { cache: "no-store" });
      if (!response.ok) throw new Error(`Unable to load ${file}`);
      return response.text();
    }));
    const source = atob(chunks.join("").replace(/\s/g, ""));
    (0, eval)(`${source}\n${cloudflareAiPatch}\n//# sourceURL=app.bundle.js`);
  } catch (error) {
    console.error(error);
    if (status) status.textContent = "Load failed";
    const preview = document.querySelector("#previewContent");
    if (preview) {
      preview.innerHTML = '<p class="status">The app bundle could not be loaded. Refresh the page and try again.</p>';
    }
  }
}());
