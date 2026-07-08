import 'dotenv/config';
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import compression from "compression";

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Trust the first proxy to enable correct IP detection from reverse proxies
  app.set('trust proxy', 1);

  app.use(cookieParser());
  app.use(compression());

  // Strict Helmet Configuration for Defense in Depth
  app.use(helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production' ? {
      directives: {
        defaultSrc: ["'self'"],
        connectSrc: ["'self'", process.env.VITE_SUPABASE_URL || '', (process.env.VITE_SUPABASE_URL || '').replace('https://', 'wss://')],
        fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
        imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        frameAncestors: ["'self'", "https://*.google.com", "https://*.run.app"],
      },
    } : false, // Permissive in dev mode to prevent Vite script blocking
    frameguard: false, // Disabled to allow iframe container rendering
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" }
  }));

  // Strict CORS Configuration
  app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? false : true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token'],
    credentials: true,
  }));

  // Strict Rate Limiting (DDoS Protection)
  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 2000, 
    standardHeaders: true, 
    legacyHeaders: false,
    validate: false,
    keyGenerator: (req: any) => {
      return req.ip || req.headers['x-forwarded-for'] || req.headers['forwarded'] || 'unknown';
    },
    message: { error: "Too many requests from this IP, please try again after 15 minutes", status: 429 }
  });
  app.use(generalLimiter);

  // Strict Payload limits
  app.use(express.json({ limit: '2mb' })); 

  app.get("/api/health", (req, res) => {
    res.json({ status: "Vanguard Core Security Online - Production Mode Ready" });
  });

  // Vite middleware for development or Static serve for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    // Set static max-age for 1 year to insanely boost caching performance
    app.use(express.static(distPath, { maxAge: '1y', etag: false }));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[VANGUARD] Server Running on http://localhost:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
}

startServer().catch(console.error);
