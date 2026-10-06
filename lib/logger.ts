type Level = "info" | "warn" | "error";

function log(level: Level, message: string, meta?: Record<string, unknown>) {
  const line = JSON.stringify({ level, message, time: new Date().toISOString(), ...meta });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export const logger = {
  info: (m: string, meta?: Record<string, unknown>) => log("info", m, meta),
  warn: (m: string, meta?: Record<string, unknown>) => log("warn", m, meta),
  error: (m: string, error?: unknown, meta?: Record<string, unknown>) =>
    log("error", m, {
      ...meta,
      error: error instanceof Error ? { name: error.name, message: error.message } : error,
    }),
};
