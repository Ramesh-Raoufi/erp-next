import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/http";
import { verifyToken } from "../services/auth.service";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return next(new ApiError(401, "Unauthorized"));
  }

  const token = header.slice("Bearer ".length).trim();
  if (!token) {
    return next(new ApiError(401, "Unauthorized"));
  }

  const payload = verifyToken(token);
  res.locals.userId = payload.sub;
  return next();
}
