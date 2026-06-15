const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json; charset=utf-8"
};

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function onRequestPost({ request, env }) {
  try {
    if (!env.OPENAI_API_KEY) {
      return json({ error: "OPENAI_API_KEY is not configured in Cloudflare." }, 500);
    }

    const body = await request.json();
    const input = normaliseInput(body.input || body);
    const requestBody = buildOpenAIRequest(input, env);
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${env.OPENAI_API_KEY}`
      },
      body: JSON.stringify(requestBody)
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = payload.error && payload.error.message ? payload.error.message : `OpenAI request failed (${response.status}).`;
      return json({ error: message }, response.status);
    }

    const output = extractResponseText(payload);
    if (!output) return json({ error: "OpenAI returned an empty document." }, 502);

    const document = JSON.parse(output);
    return json({ document });
  } catch (error) {
    return json({ error: error.message || "Document generation failed." }, 500);
  }
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: CORS_HEADERS });
}

function normaliseInput(raw = {}) {
  const clean = {};
  for (const [key, value] of Object.entries(raw)) {
    clean[key] = typeof value === "string" ? value.trim() : value;
  }
  return {
    clientName: clean.clientName || "Client",
    documentType: clean.documentType || "Recommendation memo",
    buyer: clean.buyer || "CFO",
    industry: clean.industry || "Financial and insurance activities",
    functionName: clean.functionName || "Finance",
    process: clean.process || "Record-to-report",
    style: clean.style || "Peter Drucker - clear management judgement",
    tone: clean.tone || "Board-ready",
    customTitle: clean.customTitle || "",
    situation: clean.situation || "",
    clientFacts: clean.clientFacts || "",
    consultantJudgement: clean.consultantJudgement || "",
    desiredOutcome: clean.desiredOutcome || "",
    scope: clean.scope || ""
  };
}

function isBenchmarkingReport(input) {
  return input.documentType === "Benchmarking report";
}

function buildOpenAIRequest(input, env) {
  const benchmarking = isBenchmarkingReport(input);
  const request = {
    model: env.OPENAI_MODEL || "gpt-5.2",
    instructions: buildInstructions(input).join(" "),
    input: [
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: JSON.stringify(buildBrief(input), null, 2)
          }
        ]
      }
    ],
    text: {
      format: {
        type: "json_schema",
        name: "consulting_document",
        strict: true,
        schema: documentSchema()
      },
      verbosity: "high"
    }
  };

  if (benchmarking) {
    request.tools = [{ type: "web_search" }];
    request.tool_choice = "required";
  }

  return request;
}

function buildInstructions(input) {
  const instructions = [
    "You are a senior management consultant writing final client-ready Word document content in British English.",
    "Return only JSON matching the supplied schema. Do not include markdown, explanations, prompts, internal notes or model commentary.",
    "Write at a level suitable for a paying executive client: specific, structured, commercially grounded and complete.",
    "Use only facts provided by the user. Do not fabricate names, meetings, dates, quotes, figures or insider knowledge.",
    "Where evidence is missing, state the assumption or evidence required in a client-ready way.",
    "Make the recommendation clear early, then support it with practical analysis, tables, risks, actions and assumptions."
  ];

  if (isBenchmarkingReport(input)) {
    instructions.push(
      "This is a Benchmarking report. Use web search by default and base external benchmark claims only on publicly available trusted sources.",
      "Prioritise official statistics, government data, regulators, central banks, recognised industry bodies, public company annual reports, public filings and reputable research that is publicly accessible.",
      "Do not invent benchmark values, source names, dates, URLs or peer facts. If a reliable public benchmark cannot be found, state the evidence gap and the source that should be obtained.",
      "Include source names, publication titles or dataset names, publication years where available, and URLs in appendix.references.",
      "Include at least one table that links each benchmark or comparator to its source and states any comparability limitations."
    );
  }

  return instructions;
}

function buildBrief(input) {
  const benchmarking = isBenchmarkingReport(input);
  const brief = {
    task: "Create a client-ready consulting document model for a DOCX generator.",
    client: input.clientName,
    documentType: input.documentType,
    audience: input.buyer,
    industry: input.industry,
    function: input.functionName,
    process: input.process,
    writingStyle: input.style,
    tone: input.tone,
    requestedTitle: input.customTitle,
    situationNotes: input.situation,
    clientSpecificFacts: input.clientFacts,
    consultantJudgement: input.consultantJudgement,
    desiredOutcome: input.desiredOutcome,
    scope: input.scope,
    requiredShape: "The JSON must contain all fields required by the schema. Use empty strings only where a source field is genuinely absent.",
    contentGuidance: [
      "Include 7 to 10 substantive sections.",
      "Include 2 to 4 useful tables.",
      "Executive summary should state the recommendation, rationale and immediate actions.",
      "Recommended actions should be sequenced and practical.",
      "Risks and assumptions should be specific to the selected process, function, buyer and sector.",
      "Appendix methodology should explain how the work was done, not list generic buzzwords."
    ]
  };

  if (benchmarking) {
    brief.publicSourcePolicy = {
      defaultResearchMode: "Use public web search for this document type.",
      trustedSources: [
        "Official statistics and government datasets",
        "OECD, World Bank, IMF, ONS, GOV.UK and comparable national statistical offices",
        "Regulators, central banks and recognised industry bodies",
        "Public annual reports, public filings and investor presentations",
        "Reputable public research reports where methodology and publication date are visible"
      ],
      citationRequirement: "Every external benchmark claim must be traceable to a named public source and URL in appendix.references and, where useful, a source table.",
      limitationsRequirement: "State metric definitions, peer-set limits, publication date, geography and comparability caveats."
    };
    brief.contentGuidance.push(
      "For Benchmarking report, include a public-source strategy section.",
      "For Benchmarking report, include a benchmark comparison table with metric, client view, public benchmark, source URL and implication.",
      "For Benchmarking report, include explicit source limitations and validation needs."
    );
  }

  return brief;
}

function documentSchema() {
  return {
    type: "object",
    additionalProperties: false,
    required: [
      "title", "subtitle", "executiveSummary", "context", "situation", "clientSpecificContext",
      "consultantPerspective", "objective", "scope", "approach", "styleNote", "sections",
      "tables", "recommendedActions", "risks", "assumptions", "workCarriedOut", "appendix"
    ],
    properties: {
      title: { type: "string" },
      subtitle: { type: "string" },
      executiveSummary: { type: "array", items: { type: "string" } },
      context: { type: "string" },
      situation: { type: "string" },
      clientSpecificContext: { type: "string" },
      consultantPerspective: { type: "string" },
      objective: { type: "string" },
      scope: { type: "string" },
      approach: { type: "string" },
      styleNote: { type: "string" },
      sections: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["heading", "paragraphs", "bullets"],
          properties: {
            heading: { type: "string" },
            paragraphs: { type: "array", items: { type: "string" } },
            bullets: { type: "array", items: { type: "string" } }
          }
        }
      },
      tables: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["title", "headers", "rows"],
          properties: {
            title: { type: "string" },
            headers: { type: "array", items: { type: "string" } },
            rows: { type: "array", items: { type: "array", items: { type: "string" } } }
          }
        }
      },
      recommendedActions: { type: "array", items: { type: "string" } },
      risks: { type: "array", items: { type: "string" } },
      assumptions: { type: "array", items: { type: "string" } },
      workCarriedOut: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["workstream", "purpose", "outputs"],
          properties: {
            workstream: { type: "string" },
            purpose: { type: "string" },
            outputs: { type: "array", items: { type: "string" } }
          }
        }
      },
      appendix: {
        type: "object",
        additionalProperties: false,
        required: ["methodology", "references", "qualityChecks", "workCarriedOut"],
        properties: {
          methodology: { type: "array", items: { type: "string" } },
          references: { type: "array", items: { type: "string" } },
          qualityChecks: { type: "array", items: { type: "string" } },
          workCarriedOut: { type: "array", items: { type: "string" } }
        }
      }
    }
  };
}

function extractResponseText(response) {
  if (response.output_text) return response.output_text;
  const parts = [];
  for (const item of response.output || []) {
    for (const content of item.content || []) {
      if (content.type === "output_text" && content.text) parts.push(content.text);
      if (content.type === "text" && content.text) parts.push(content.text);
    }
  }
  return parts.join("\n");
}
