function collectErrorText(error: unknown): string {
  const parts: string[] = [];
  const seen = new Set<unknown>();
  let current: unknown = error;

  while (current && !seen.has(current)) {
    seen.add(current);
    if (typeof current === "string") {
      parts.push(current);
      break;
    }
    if (current instanceof Error) {
      parts.push(current.message);
      current = current.cause;
      continue;
    }
    if (typeof current === "object") {
      const obj = current as Record<string, unknown>;
      if (typeof obj.message === "string") parts.push(obj.message);
      if (typeof obj.cause === "string") parts.push(obj.cause);
      current = obj.cause ?? obj.originalMessage;
      continue;
    }
    parts.push(String(current));
    break;
  }

  return parts.join("\n");
}

export function jsonFromDatabaseError(error: unknown) {
  const message = collectErrorText(error);
  const clientHost = message.match(/@'([^']+)'/)?.[1];
  const accessDenied = /access denied|p1000|authentication failed/i.test(message);

  if (accessDenied) {
    const ipHint = clientHost ? ` ${clientHost}` : " tamaru public IP";
    return {
      status: 503 as const,
      error: `Hostinger Remote MySQL band che. hPanel → Databases → Remote MySQL → Access Host ma${ipHint} add karo. Local WiFi IP (192.168.x.x) nahi — public IP j. "%" (any host) fastest che.`,
    };
  }

  return {
    status: 503 as const,
    error: "Database temporarily unavailable. Hostinger DB connection check karo.",
  };
}
