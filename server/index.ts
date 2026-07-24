import "dotenv/config";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import multer from "multer";
import path from "path";
import fs from "fs";
import { apiLimiter } from "./middleware/rateLimit";
import { adminRouter } from "./routes/admin";
import { analyticsRouter } from "./routes/analytics";
import { authRouter } from "./routes/auth";
import { commerceRouter } from "./routes/commerce";
import { nfcRouter } from "./routes/nfc";
import { profileRouter } from "./routes/profiles";
import { qrRouter } from "./routes/qr";
import { aiRouter } from "./routes/ai";

const app = express();
app.disable("etag");
const port = Number(process.env.PORT || 4000);

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer disk storage setup
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, "uploads/");
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (_req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp|svg/;
    const isMimetypeOk = allowedTypes.test(file.mimetype);
    const isExtnameOk = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    if (isMimetypeOk && isExtnameOk) {
      return cb(null, true);
    }
    cb(new Error("Only images (.jpeg, .jpg, .png, .webp, .svg) are allowed"));
  }
});

// Configure Helmet with CORS-friendly policies
app.use(helmet({
  crossOriginResourcePolicy: false
}));

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  process.env.APP_URL
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:")) {
      return callback(null, true);
    }
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true
}));
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));
app.use(apiLimiter);

// Serve uploads statically
app.use("/uploads", express.static("uploads"));

app.get("/health", (_request, response) => {
  response.json({ ok: true, name: "tapyfi-api" });
});

import { StorageService } from "./services/storage";

// Image upload API endpoint
app.post("/api/upload", upload.single("image"), async (request, response) => {
  if (!request.file) {
    return response.status(400).json({ error: "No file uploaded" });
  }
  try {
    const result = await StorageService.saveFile(request.file);
    response.json({ url: result.url });
  } catch (error: any) {
    console.error("Storage upload failed:", error);
    response.status(500).json({ error: "File storage failed" });
  }
});

app.use("/api/auth", authRouter);
app.use("/api/profiles", profileRouter);
app.use("/api/nfc", nfcRouter);
app.use("/api/qr", qrRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/commerce", commerceRouter);
app.use("/api/admin", adminRouter);
app.use("/api/ai", aiRouter);

// Global Error Handler (for multer file filter errors, etc.)
app.use((err: any, _req: any, res: any, _next: any) => {
  if (err instanceof Error) {
    res.status(400).json({ error: err.message });
  } else {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(port, "0.0.0.0", () => {
  console.log(`tapyfi API listening on http://0.0.0.0:${port}`);
});
