import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export type AuthUser = {
  id: string;
  email: string;
  role: "USER" | "ADMIN" | "OWNER";
};

export function requireAuth(request: Request, response: Response, next: NextFunction) {
  const header = request.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;

  if (!token) {
    response.status(401).json({ error: "Missing bearer token" });
    return;
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "dev-secret") as AuthUser;
    response.locals.user = payload;
    next();
  } catch {
    response.status(401).json({ error: "Invalid token" });
  }
}

export function requireAdmin(request: Request, response: Response, next: NextFunction) {
  requireAuth(request, response, () => {
    const user = response.locals.user as AuthUser;
    if (user.role !== "ADMIN" && user.role !== "OWNER") {
      response.status(403).json({ error: "Admin role required" });
      return;
    }
    next();
  });
}
