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

  function installBenchmarkingReport() {
    if (!options.documentTypes.includes("Benchmarking report")) {
      const targetIndex = options.documentTypes.indexOf("Target operating model");
      options.documentTypes.splice(targetIndex >= 0 ? targetIndex : options.documentTypes.length, 0, "Benchmarking report");
    }

    documentPlaybooks["Benchmarking report"] = {
      purpose: "compare the client situation with trusted public benchmarks, peer evidence and source-backed external reference points",
      sections: ["Benchmark Scope", "Trusted Public Sources", "Peer And Sector Comparison", "Performance Implications", "Source-Backed Recommendations"]
    };

    documentBlueprints["Benchmarking report"] = {
      decisionSupported: "decide where the client appears above, in line with or behind public external benchmarks, and which gaps deserve management action",
      chapters: [
        "Benchmarking question and decision required",
        "Public source strategy",
        "Peer set and comparability rules",
        "External benchmark baseline",
        "Client comparison and interpretation",
        "Performance gaps and opportunity areas",
        "Source-backed recommendations",
        "Limitations and evidence to validate"
      ],
      analyses: [
        "Public-source benchmark scan",
        "Peer-set and comparator logic",
        "Metric definition and comparability review",
        "External performance range analysis",
        "Source freshness and reliability assessment"
      ],
      tables: [
        "Public sources and benchmark relevance",
        "Benchmark comparison table",
        "Peer evidence and interpretation",
        "Source limitations and validation needs"
      ],
      appendixWork: [
        "Public source search and screening",
        "Trusted-source extraction",
        "Comparator and metric definition",
        "Source freshness review",
        "Benchmark interpretation and caveat review"
      ]
    };

    const originalRelevantReferences = relevantReferences;
    relevantReferences = function patchedRelevantReferences(input) {
      const refs = new Set(originalRelevantReferences(input));
      if (input.documentType === "Benchmarking report") {
        [
          "OECD Data - https://data.oecd.org/",
          "World Bank Data - https://data.worldbank.org/",
          "UK Office for National Statistics - https://www.ons.gov.uk/",
          "GOV.UK official statistics - https://www.gov.uk/search/research-and-statistics",
          "Companies House - https://find-and-update.company-information.service.gov.uk/",
          "Public annual reports, regulator publications and recognised industry-body research"
        ].forEach((item) => refs.add(item));
      }
      return Array.from(refs);
    };

    const originalBuildNarrative = buildNarrative;
    buildNarrative = function patchedBuildNarrative(input) {
      const narrative = originalBuildNarrative(input);
      if (input.documentType === "Benchmarking report") {
        narrative.context = (input.clientName || "The client") + " is considering how its " + input.process.toLowerCase() + " performance compares with publicly available benchmarks and peer evidence in " + input.industry.toLowerCase() + ". The document must distinguish sourced external evidence from assumptions.";
        narrative.objective = "The objective is to compare the client situation with trusted public benchmarks, peer evidence and source-backed external reference points, then convert the findings into specific management actions.";
        narrative.approach = "The work uses a public-source benchmarking method: define the benchmark question, identify trusted official or high-credibility sources, state comparator limits, extract source-backed ranges, compare the client situation, and reference every external claim in the report.";
        narrative.styleNote = narrative.styleNote + " Benchmark claims should name the public source, date where available, URL and any comparability limitation.";
      }
      return narrative;
    };

    const originalMakeBlueprintTable = makeBlueprintTable;
    makeBlueprintTable = function patchedMakeBlueprintTable(input, tableName) {
      if (input.documentType === "Benchmarking report" && tableName.toLowerCase().includes("public sources")) {
        return {
          title: tableName,
          headers: ["Source type", "Examples to check", "Benchmark use", "Required citation"],
          rows: [
            ["Official statistics", "OECD, World Bank, ONS, GOV.UK", "Sector or economy-level ranges", "Source name, page or dataset, year and URL"],
            ["Public company evidence", "Annual reports, filings, investor presentations", "Peer operational or financial indicators", "Company, document title, reporting period and URL"],
            ["Regulators and industry bodies", "Regulator reports, central banks, trade bodies", "Standards, adoption levels and compliance signals", "Publisher, publication date and URL"]
          ]
        };
      }
      if (input.documentType === "Benchmarking report" && tableName.toLowerCase().includes("benchmark comparison")) {
        return {
          title: tableName,
          headers: ["Metric", "Client view", "Public benchmark", "Source", "Implication"],
          rows: [
            [input.process, "To be confirmed with client data", "Use a published external range or peer value", "Trusted public source URL required", "Shows whether the gap is material"],
            [input.functionName, functionLens(input.functionName), "Use a sector or peer comparator", "Official, regulator or industry-body source required", "Keeps the recommendation evidence-backed"],
            [input.industry, "Client context to be validated", "Use sector-level public data", "Publication title, year and URL required", "Prevents unsourced benchmark claims"]
          ]
        };
      }
      return originalMakeBlueprintTable(input, tableName);
    };

    loadOptions();
  }

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

  installBenchmarkingReport();
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
