type IntegrationValidationResult = {
  normalizedConfig: string;
  status: "active" | "inactive";
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function validateIntegrationConfig(configInput: string): IntegrationValidationResult {
  let parsed: unknown;

  try {
    parsed = JSON.parse(configInput);
  } catch {
    throw new Error("Integration config must be valid JSON.");
  }

  if (!isRecord(parsed)) {
    throw new Error("Integration config must be a JSON object.");
  }

  const status = parsed.enabled === false ? "inactive" : "active";

  if (parsed.type === "local") {
    if (!Array.isArray(parsed.command) || parsed.command.some((item) => typeof item !== "string" || item.length === 0)) {
      throw new Error("Local MCP integrations require a string array `command` field.");
    }

    if (parsed.environment !== undefined && !isRecord(parsed.environment)) {
      throw new Error("Local MCP integration `environment` must be an object when provided.");
    }
  } else if (parsed.type === "remote") {
    if (typeof parsed.url !== "string" || !/^https?:\/\//.test(parsed.url)) {
      throw new Error("Remote MCP integrations require an absolute `url`.");
    }

    if (parsed.headers !== undefined && !isRecord(parsed.headers)) {
      throw new Error("Remote MCP integration `headers` must be an object when provided.");
    }
  } else {
    throw new Error("Integration config must declare `type` as `local` or `remote`.");
  }

  return {
    normalizedConfig: JSON.stringify(parsed, null, 2),
    status,
  };
}
