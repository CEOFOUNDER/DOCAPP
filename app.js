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

  try {
    const chunks = await Promise.all(bundleFiles.map(async (file) => {
      const response = await fetch(file, { cache: "no-store" });
      if (!response.ok) throw new Error(`Unable to load ${file}`);
      return response.text();
    }));
    const source = atob(chunks.join("").replace(/\s/g, ""));
    (0, eval)(`${source}\n//# sourceURL=app.bundle.js`);
  } catch (error) {
    console.error(error);
    if (status) status.textContent = "Load failed";
    const preview = document.querySelector("#previewContent");
    if (preview) {
      preview.innerHTML = '<p class="status">The app bundle could not be loaded. Refresh the page and try again.</p>';
    }
  }
}());
