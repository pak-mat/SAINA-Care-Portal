
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import compression from "compression";
import { createClient } from "@supabase/supabase-js";
import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

// Initialize DOMPurify on the server
const window = new JSDOM('').window;
const purify = DOMPurify(window);

// Dynamically generate a cryptographically resilient secret if not provided in environment
const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' 
  ? (() => { throw new Error('FATAL: JWT_SECRET environment variable is missing but required in production'); })() 
  : crypto.randomBytes(32).toString('hex'));

// Middleware to verify JWT tokens
const authenticateToken = (req: any, res: any, next: any) => {
  let token = req.cookies?.auth_token;
  if (!token) {
    const authHeader = req.headers['authorization'];
    token = authHeader && authHeader.split(' ')[1];
  }
  
  if (!token) return res.status(401).json({ error: 'Unauthorized: No token provided' });

  jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] } as any, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: 'Forbidden: Invalid or expired token' });
    req.user = user;
    next();
  });
};

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // Trust the first proxy to enable correct IP detection from reverse proxies (like Cloud Run)
  app.set('trust proxy', 1);

  // Cookie parser
  app.use(cookieParser());

  // Compress all HTTP responses for performance
  app.use(compression());

  // 1. Strict Helmet Configuration for Defense in Depth
  app.use(helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production' ? {
      directives: {
        defaultSrc: ["'self'"],
        connectSrc: ["'self'", 'https://xzqqfydtjucpvpjwtfcp.supabase.co', 'wss://xzqqfydtjucpvpjwtfcp.supabase.co'],
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

  // 2. Strict CORS Configuration
  app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? false : true, // In production, don't allow cross-origin requests by default since it should be same-origin
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token'],
    credentials: true,
  }));

  // 3. Strict Rate Limiting (DDoS Protection)
  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 2000, // accommodate 5s polling intervals
    standardHeaders: true, 
    legacyHeaders: false,
    validate: false,
    keyGenerator: (req: any) => {
      return req.ip || req.headers['x-forwarded-for'] || req.headers['forwarded'] || 'unknown';
    },
    message: { error: "Too many requests from this IP, please try again after 15 minutes", status: 429 }
  });
  
  const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Max 10 failed logins per hour per IP
    standardHeaders: true,
    legacyHeaders: false,
    validate: false,
    keyGenerator: (req: any) => {
      return req.ip || req.headers['x-forwarded-for'] || req.headers['forwarded'] || 'unknown';
    },
    message: { error: "Too many authentication attempts, please try again after 1 hour", status: 429 }
  });
  
  // Apply general limiter globally
  app.use(generalLimiter);

  // 4. Strict Payload limits
  app.use(express.json({ limit: '2mb' })); // Reduced from 50mb to prevent payload exhaustion

  const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://xzqqfydtjucpvpjwtfcp.supabase.co';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_XVYbQ2yWVpf6aB6RarVVlQ_ao4ggdSH';
  const supabase = createClient(supabaseUrl, supabaseKey);

  app.get("/api/health", (req, res) => {
    res.json({ status: "Vanguard Core Security Online - Max Protection Active" });
  });

  // Secure endpoints to mask DB logic from client
  app.post("/api/auth/login", authLimiter, async (req, res) => {
    try {
      const { email, password } = req.body || {};
      const cleanEmail = purify.sanitize(typeof email === 'string' ? email.trim().toLowerCase() : String(email || '').trim().toLowerCase());
      const isDemo = ['adam@demo.com', 'nor@demo.com'].includes(cleanEmail);

      if (!isDemo && (!email || !password)) {
        return res.status(400).json({ error: 'Missing credentials' });
      }
      
      const { data, error } = await supabase.from('users').select('*').ilike('email', cleanEmail).limit(1);
      if (error || !data || data.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      const user = data[0];
      
      if (!isDemo) {
        if (user.password && user.password !== 'dummy') {
           const isMatch = await bcrypt.compare(password, user.password);
           if (!isMatch) {
             return res.status(401).json({ error: 'Invalid credentials' });
           }
        } else {
           return res.status(401).json({ error: 'Invalid credentials. Password migration required.' });
        }
      }
      
      const safeUser = { ...user, studentId: user.studentid || user.studentId };
      delete safeUser.password;
      
      // Issue JWT
      const accessToken = jwt.sign(
        { id: safeUser.id, role: safeUser.role, email: safeUser.email, name: safeUser.name }, 
        JWT_SECRET, 
        { expiresIn: '24h', algorithm: 'HS256' }
      );
      
      res.cookie('auth_token', accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });
      
      res.json({ user: safeUser, token: accessToken });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.post("/api/auth/register", authLimiter, async (req, res) => {
    try {
      const { id, name, email, studentId, password, role } = req.body || {};
      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Missing required registration fields' });
      }

      const cleanEmail = purify.sanitize(typeof email === 'string' ? email.trim().toLowerCase() : String(email).trim().toLowerCase());
      const sanitizedName = purify.sanitize(typeof name === 'string' ? name.trim() : String(name).trim());
      const sanitizedStudentId = studentId ? purify.sanitize(typeof studentId === 'string' ? studentId.trim() : String(studentId).trim()) : null;
      
      // Force 'student' role on guest registrations to prevent privilege escalation
      const finalRole = 'student';

      // 1. Strict duplicate check (Server-side defense)
      const { data: existing, error: checkErr } = await supabase.from('users').select('id').ilike('email', cleanEmail).limit(1);
      if (checkErr) return res.status(500).json({ error: 'Database verification failed' });
      if (existing && existing.length > 0) {
        return res.status(409).json({ error: 'Email is already registered. Please login.' });
      }

      const userId = id || crypto.randomUUID();

      // Hash the password securely on the backend
      const salt = await bcrypt.genSalt(10);
      const serverHashedPassword = await bcrypt.hash(password, salt);

      const newUserPayload = filterSchema({
        id: userId,
        name: sanitizedName,
        email: cleanEmail,
        role: finalRole,
        studentId: finalRole === 'student' ? sanitizedStudentId : null,
        studentid: finalRole === 'student' ? sanitizedStudentId : null,
        password: serverHashedPassword
      }, 'users');

      const { error: insertErr } = await supabase.from('users').insert([newUserPayload]);
      if (insertErr) {
        console.error("Registration insertion error:", insertErr);
        return res.status(500).json({ error: 'Registration failed', details: insertErr.message });
      }

      const safeUser = { id: userId, name: sanitizedName, email: cleanEmail, role: finalRole, studentId: finalRole === 'student' ? sanitizedStudentId : null };
      
      // Issue JWT
      const accessToken = jwt.sign(
        { id: safeUser.id, role: safeUser.role, email: safeUser.email, name: safeUser.name },
        JWT_SECRET,
        { expiresIn: '24h', algorithm: 'HS256' }
      );

      res.cookie('auth_token', accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });

      res.status(201).json({ user: safeUser, token: accessToken });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error during registration' });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie('auth_token', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });
    res.json({ success: true });
  });

  // Protect all API routes that access database state
  app.post("/api/sync", authenticateToken, async (req: any, res) => {
    // Rely strictly on verified token identity
    const userId = req.user.id;
    const role = req.user.role;
    
    try {
      let userQuery = supabase.from('users').select('*');
      let reqQuery = supabase.from('requests').select('*');
      let msgQuery = supabase.from('messages').select('*');
      let notifQuery = supabase.from('notifications').select('*');

      // Server-side database level filtering: maximum defense-in-depth security
      if (role === 'student') {
        userQuery = userQuery.or(`role.eq.counselor,id.eq.${userId}`);
        reqQuery = reqQuery.or(`studentid.eq.${userId}`);
        msgQuery = msgQuery.or(`studentid.eq.${userId}`);
        notifQuery = notifQuery.or(`userid.eq.${userId}`);
      }

      const [uRes, rRes, mRes, nRes] = await Promise.all([
        userQuery,
        reqQuery,
        msgQuery,
        notifQuery
      ]);

      if (uRes.error) console.error("users query sync error:", JSON.stringify(uRes.error));
      if (rRes.error) console.error("requests query sync error:", JSON.stringify(rRes.error));
      if (mRes.error) console.error("messages query sync error:", JSON.stringify(mRes.error));
      if (nRes.error) console.error("notifications query sync error:", JSON.stringify(nRes.error));

      const users = (uRes.data || []).map((u: any) => {
        delete u.password;
        return u;
      });

      const requests = (rRes.data || []).map((r: any) => {
        if (role === 'student') {
          delete r.privatecounselornotes;
        }
        return r;
      });

      res.json({ 
        users, 
        requests, 
        messages: mRes.data || [], 
        notifications: nRes.data || [] 
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Database synchronisation failed' });
    }
  });

  const schemaCache: Record<string, string[]> = {
    users: ['id', 'name', 'email', 'role', 'studentid', 'password', 'created_at', 'status', 'signature', 'preferences'],
    requests: ['id', 'studentid', 'studentname', 'status', 'submissiondate', 'type', 'choice1', 'reasoncategory', 'details', 'assignedto', 'claimedat', 'resolvedby', 'resolvedbyname', 'resolvedat', 'counselornotes', 'privatecounselornotes', 'targetschool', 'reason', 'transferformsfile', 'academicrecordsfile', 'iddocumentsfile', 'created_at'],
    messages: ['id', 'studentid', 'counselorid', 'senderid', 'text', 'imagebase64', 'timestamp'],
    notifications: ['id', 'userid', 'message', 'read', 'date']
  };

  const filterSchema = (obj: any, tableName: string) => {
    const allowed = schemaCache[tableName] || [];
    const filtered: any = {};
    const c1 = obj.choice1 || '';
    const c2 = obj.choice2 ? ` / ${obj.choice2}` : '';
    const c3 = obj.choice3 ? ` / ${obj.choice3}` : '';
    if (tableName === 'requests' && (obj.choice2 || obj.choice3)) {
      obj.choice1 = `${c1}${c2}${c3}`;
    }
    for (let k in obj) {
      const lowerKey = k.toLowerCase();
      if (allowed.includes(lowerKey)) {
        filtered[lowerKey] = obj[k];
      }
    }
    return filtered;
  };

  app.post("/api/db/insert", authenticateToken, async (req: any, res) => {
    try {
      const { table, payload } = req.body || {};
      if (!['requests', 'messages', 'notifications'].includes(table) || !payload || typeof payload !== 'object') {
        return res.status(400).json({ error: 'Invalid or restricted insertion target' });
      }
      
      const sanitizedPayload: any = {};
      const keyMap: Record<string, string> = {
        studentId: 'studentid',
        studentName: 'studentname',
        senderId: 'senderid',
        userId: 'userid',
        imageBase64: 'imagebase64',
        createdAt: 'created_at',
        updatedAt: 'updated_at'
      };

      for (const [k, v] of Object.entries(payload)) {
        const mappedKey = keyMap[k] || k.toLowerCase();
        if (typeof v === 'string') {
          if (k === 'imageBase64' || v.startsWith('data:image/')) {
             if (v.startsWith('data:image/svg')) {
                 sanitizedPayload[mappedKey] = ''; // Block malicious SVG images
             } else {
                 sanitizedPayload[mappedKey] = v;
             }
          } else {
             sanitizedPayload[mappedKey] = purify.sanitize(v);
          }
        } else if (typeof v === 'object' && v !== null) {
          // Prevent NoSQL injection or complex object bypass of sanitize
           sanitizedPayload[mappedKey] = typeof v === 'object' ? JSON.stringify(v) : purify.sanitize(String(v));
        } else {
          sanitizedPayload[mappedKey] = v;
        }
      }

      // Role-based Access Control and Spoofing Prevention on Insert
      if (req.user.role === 'student') {
        if (table === 'notifications') {
          return res.status(403).json({ error: 'Forbidden: Students cannot broadcast notifications' });
        }
        
        if (table === 'requests') {
          // Hard-bind request to their certified token ID
          sanitizedPayload.studentid = req.user.id;
          sanitizedPayload.studentname = req.user.name || sanitizedPayload.studentname;
        }
        
        if (table === 'messages') {
          // Hard-bind message sender and student scope to their token ID
          sanitizedPayload.studentid = req.user.id;
          sanitizedPayload.senderid = req.user.id;
        }
      } else if (req.user.role === 'counselor') {
        if (table === 'messages') {
          sanitizedPayload.senderid = req.user.id;
          sanitizedPayload.counselorid = req.user.id;
        }
      } else {
        return res.status(403).json({ error: 'Invalid credentials access' });
      }

      const finalPayload = filterSchema(sanitizedPayload, table);
      const dbRes = await supabase.from(table).insert([finalPayload]);
      if (dbRes.error) {
        console.error("Supabase insert error:", dbRes.error);
        return res.status(500).json({ error: 'Database write failed', details: dbRes.error });
      }
      res.json({ success: true, data: dbRes.data });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Insert action process failed' });
    }
  });

  app.post("/api/db/update", authenticateToken, async (req: any, res) => {
    try {
      const { table, updates, id } = req.body || {};
      if (!['users', 'requests', 'notifications'].includes(table) || !updates || typeof updates !== 'object') {
        return res.status(400).json({ error: 'Blocked update operation target' });
      }
      
      const sanitizedUpdates: any = {};
      const keyMap: Record<string, string> = {
        studentId: 'studentid',
        studentName: 'studentname',
        senderId: 'senderid',
        userId: 'userid',
        imageBase64: 'imagebase64',
        createdAt: 'created_at',
        updatedAt: 'updated_at'
      };

      for (const [k, v] of Object.entries(updates)) {
         const mappedKey = keyMap[k] || k.toLowerCase();
         if (typeof v === 'string') {
            if (k === 'imageBase64' || v.startsWith('data:image/')) {
               if (v.startsWith('data:image/svg')) {
                   sanitizedUpdates[mappedKey] = ''; // Block malicious SVGs
               } else {
                   sanitizedUpdates[mappedKey] = v;
               }
            } else {
               sanitizedUpdates[mappedKey] = purify.sanitize(v);
            }
         } else if (typeof v === 'object' && v !== null) {
            sanitizedUpdates[mappedKey] = JSON.stringify(v);
         } else {
            sanitizedUpdates[mappedKey] = v;
         }
      }

      const cleanId = purify.sanitize(typeof id === 'string' ? id : String(id || ''));
      const finalUpdates = filterSchema(sanitizedUpdates, table);
      
      // Secure client boundaries
      if (req.user.role === 'student') {
        if (table === 'notifications') {
          // BOLA / IDOR Verification: only allow marking OWN notifications as read
        } else if (table === 'users') {
          // Profile updates: must match their exact ID, and strictly lock structural fields
          if (cleanId !== req.user.id) {
            return res.status(403).json({ error: 'Unauthorized to update another user\'s profile' });
          }
          delete finalUpdates.role;
          delete finalUpdates.id;
          delete finalUpdates.password;
          delete finalUpdates.studentid;
          delete finalUpdates.status;
          delete finalUpdates.email;
        } else {
          return res.status(403).json({ error: 'Forbidden update target for student account' });
        }
      } else if (req.user.role === 'counselor') {
        if (table === 'users') {
          // BOLA / IDOR Verification: Counselors can only update their own profile
          if (cleanId !== req.user.id) {
             return res.status(403).json({ error: 'Unauthorized to update another user\'s profile' });
          }
          delete finalUpdates.role;
          delete finalUpdates.id;
          delete finalUpdates.password;
        }
      } else {
        return res.status(403).json({ error: 'Forbidden authentication role value' });
      }

      let query = supabase.from(table).update(finalUpdates).eq('id', cleanId);
      if (req.user.role === 'student' && table === 'notifications') {
        query = query.eq('userid', req.user.id);
      }

      const dbRes = await query;
      if (dbRes.error) {
        console.error("Supabase update error:", dbRes.error);
        return res.status(500).json({ error: 'Database update failed' });
      }
      res.json({ success: true, data: dbRes.data });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Update procedure faulted' });
    }
  });

  // Vite middleware for development
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
    console.log(`[VANGUARD] Maximum Security Server Running on http://localhost:${PORT}`);
  });
}

startServer().catch(console.error);
