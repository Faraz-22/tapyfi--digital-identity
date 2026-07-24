import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../prisma";

export const authRouter = Router();

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const SALT_ROUNDS = 10;

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(1, "Name is required")
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

// POST /api/auth/register — Create a new user with hashed password
authRouter.post("/register", async (request, response) => {
  try {
    const body = registerSchema.parse(request.body);

    // Check if email is already registered
    const existing = await prisma.user.findUnique({
      where: { email: body.email }
    });
    if (existing) {
      return response.status(409).json({ error: "An account with this email already exists." });
    }

    // Hash password with bcrypt
    const passwordHash = await bcrypt.hash(body.password, SALT_ROUNDS);

    // Create user record
    const user = await prisma.user.create({
      data: {
        email: body.email,
        name: body.name,
        passwordHash,
        role: "USER"
      }
    });

    // Issue JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    response.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return response.status(400).json({ error: "Validation failed", details: error.errors });
    }
    console.error("Registration error:", error);
    response.status(500).json({ error: "Registration failed" });
  }
});

// POST /api/auth/login — Authenticate with email + password
authRouter.post("/login", async (request, response) => {
  try {
    const body = loginSchema.parse(request.body);

    // Look up user by email
    const user = await prisma.user.findUnique({
      where: { email: body.email }
    });

    if (!user || !user.passwordHash) {
      return response.status(401).json({ error: "Invalid email or password." });
    }

    // Compare password with stored bcrypt hash
    const isValid = await bcrypt.compare(body.password, user.passwordHash);
    if (!isValid) {
      return response.status(401).json({ error: "Invalid email or password." });
    }

    // Issue JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    response.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return response.status(400).json({ error: "Validation failed", details: error.errors });
    }
    console.error("Login error:", error);
    response.status(500).json({ error: "Login failed" });
  }
});

// POST /api/auth/google — Verify Google ID Token & register or login user
authRouter.post("/google", async (request, response) => {
  try {
    const { credential } = z.object({ credential: z.string() }).parse(request.body);

    // Call Google TokenInfo API to safely decode and verify the ID token signature
    const verificationUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`;
    const res = await fetch(verificationUrl);
    
    if (!res.ok) {
      return response.status(401).json({ error: "Google verification token invalid or expired." });
    }

    const payload = await res.json() as {
      email: string;
      name: string;
      picture?: string;
      sub: string;
      email_verified?: string | boolean;
    };

    if (!payload.email) {
      return response.status(400).json({ error: "Google account does not expose a valid email address." });
    }

    // Verify if user already exists
    let user = await prisma.user.findUnique({
      where: { email: payload.email }
    });

    if (!user) {
      // Auto-signup: Register user directly
      user = await prisma.user.create({
        data: {
          email: payload.email,
          name: payload.name || payload.email.split("@")[0],
          role: "USER"
        }
      });

      // Seed a default profile for this new user
      const slug = user.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "profile";
      let finalSlug = slug;
      const existingProfile = await prisma.profile.findUnique({ where: { slug: finalSlug } });
      if (existingProfile) {
        finalSlug = `${finalSlug}-${Math.floor(1000 + Math.random() * 9000)}`;
      }

      await prisma.profile.create({
        data: {
          name: user.name,
          slug: finalSlug,
          userId: user.id,
          avatarUrl: payload.picture || "",
          title: "Professional Profile",
          bio: "Welcome to my digital identity card.",
          accent: "#6fffe9",
          secondaryAccent: "#f8c66d",
          theme: "MIDNIGHT",
          layout: "HALO"
        }
      });
    }

    // Issue session JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    response.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return response.status(400).json({ error: "Validation failed", details: error.errors });
    }
    console.error("Google authentication error:", error);
    response.status(500).json({ error: "Google authentication failed" });
  }
});
