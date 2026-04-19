import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { ApiError } from "../utils/http";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof ApiError) {
    return res.status(err.status).json({ error: err.message });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({ error: "Validation error", detail: err.issues });
  }

  if (err instanceof Error) {
    // eslint-disable-next-line no-console
    console.error(err);
    const msg = err.message ?? "";

    if (msg.includes("Error validating datasource `db`") && msg.includes("the URL must start with")) {
      return res.status(500).json({
        error: "Database configuration error",
        detail:
          msg +
          "\n\nFix: check your .env DATABASE_URL protocol matches prisma/schema.prisma provider. " +
          "Examples: SQLite -> DATABASE_URL=file:./dev.db ; PostgreSQL -> DATABASE_URL=postgresql://user:pass@host:5432/db?schema=public. " +
          "Then run: npm run prisma:generate (and restart the API)."
      });
    }
    if (msg.includes("Can't reach database server") || msg.includes("P1001")) {
      return res
        .status(503)
        .json({ error: "Database unavailable", detail: msg });
    }

    return res.status(500).json({ error: "Internal server error", detail: msg });
  }

  return res.status(500).json({ error: "Internal server error" });
}
