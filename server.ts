import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cors());

  // --- API Routes (As per Backend Doc) ---

  // Mock Authentication Middleware (In production, replace with real JWT verification)
  const authenticate = (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
       // Allow for now to keep the demo working, but log it
       console.log('UNAUTHENTICATED ACCESS:', req.path);
       return next();
    }
    // Real logic would be: supabase.auth.getUser(token)
    next();
  };

  // Profiles
  app.get("/api/profiles/me", authenticate, (req, res) => {
    res.json({ id: '1', full_name: 'Aman Sharma', matric_number: 'STU/2024/001', xp: 5420, level: 12 });
  });

  // News (Public)
  app.get("/api/news", (req, res) => {
    res.json([
      { id: '1', title: 'Campus WiFi Expansion', category: 'Tech', date: '2 hours ago', excerpt: 'New routers installed in Hall A...' },
      { id: '2', title: 'Finals Prep Workshop', category: 'Academic', date: '5 hours ago', excerpt: 'Join us for a session on active recall...' }
    ]);
  });

  // Stats & Leaderboard
  app.get("/api/stats/leaderboard", (req, res) => {
    res.json([
      { id: '1', name: 'Aman Sharma', xp: 15420, level: 45, rank: 1 },
      { id: '2', name: 'John Doe', xp: 12100, level: 38, rank: 2 },
      { id: '3', name: 'Jane Smith', xp: 11500, level: 35, rank: 3 }
    ]);
  });

  app.get("/api/stats/me", authenticate, (req, res) => {
     res.json({ xp: 5420, level: 12, studyTime: 120, streaks: 5 });
  });

  // PDFs & Course Materials
  app.get("/api/pdfs", authenticate, (req, res) => {
    res.json([
      { id: '1', name: 'Advanced Calculus.pdf', category: 'Math', uploadedAt: '2 days ago', size: '2.4 MB' },
      { id: '2', name: 'Quantum Mechanics.pdf', category: 'Physics', uploadedAt: '5 days ago', size: '4.1 MB' }
    ]);
  });

  // GPA
  app.get("/api/gpa", authenticate, (req, res) => {
    res.json([]);
  });

  // Research
  app.get("/api/research", authenticate, (req, res) => {
    res.json([]);
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // --- Vite / Static Assets Handling ---

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
