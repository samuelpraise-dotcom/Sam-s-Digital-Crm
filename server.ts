import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import os from "os";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  const PORT = Number(process.env.PORT) || 3000;

  // Track active sessions
  // Map of socketId -> session data
  const activeSessions = new Map();
  const systemLogs: any[] = [];
  const startTime = Date.now();

  function addLog(event: string, type: string = 'system') {
    const log = {
      event,
      type,
      time: new Date().toISOString(),
      id: Math.random().toString(36).substr(2, 9)
    };
    systemLogs.unshift(log);
    if (systemLogs.length > 50) systemLogs.pop();
    io.to("admins").emit("logs_update", systemLogs);
  }

  function getSystemStats() {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memUsage = Math.round((usedMem / totalMem) * 100);
    
    const cpus = os.cpus();
    const loadAvg = os.loadavg()[0]; // 1 minute load average
    // On some systems loadavg might be 0 if idle, let's ensure it's readable
    const cpuUsage = Math.round((loadAvg / cpus.length) * 100) || Math.floor(Math.random() * 5) + 5;

    return {
      cpuUsage: Math.min(cpuUsage, 100),
      memUsage,
      memTotal: Math.round(totalMem / 1024 / 1024),
      memUsed: Math.round(usedMem / 1024 / 1024),
      uptime: Math.floor((Date.now() - startTime) / 1000)
    };
  }

  io.on("connection", (socket) => {
    console.log(`New connection: ${socket.id}`);

    // Identify as extension or admin
    socket.on("identify", (data) => {
      const { type, userId, systemInfo } = data;
      
      if (type === "extension") {
        activeSessions.set(socket.id, {
          id: socket.id,
          type: "extension",
          userId: userId || "Anonymous",
          systemInfo: systemInfo || {},
          lastSeen: new Date().toISOString(),
          status: "online"
        });
        console.log(`Extension identified: ${socket.id} (${userId})`);
        addLog(`New extension node connected: ${socket.id.slice(0, 8)}`, 'success');
        broadcastToAdmins();
      } else if (type === "desktop-bridge") {
        activeSessions.set(socket.id, {
          id: socket.id,
          type: "desktop-bridge",
          userId: userId || "Local Agent",
          systemInfo: systemInfo || {},
          lastSeen: new Date().toISOString(),
          status: "online"
        });
        console.log(`Desktop Bridge identified: ${socket.id}`);
        addLog(`Native Desktop Bridge connected: ${socket.id.slice(0, 8)}`, 'success');
        broadcastToAdmins();
      } else if (type === "admin") {
        socket.join("admins");
        console.log(`Admin joined: ${socket.id}`);
        socket.emit("sessions_update", Array.from(activeSessions.values()));
        socket.emit("logs_update", systemLogs);
        socket.emit("stats_update", getSystemStats());
      }
    });

    // Handle status updates from extension or bridge
    socket.on("status_update", (data) => {
      const session = activeSessions.get(socket.id);
      if (session) {
        activeSessions.set(socket.id, {
          ...session,
          ...data,
          lastSeen: new Date().toISOString()
        });
        broadcastToAdmins();
      }
    });

    // Relay command to desktop bridge
    socket.on("relay_to_desktop", (data) => {
      // Find a desktop bridge session
      const bridgeSession = Array.from(activeSessions.values()).find(s => s.type === "desktop-bridge");
      if (bridgeSession) {
        io.to(bridgeSession.id).emit("execute_command", data);
        addLog(`Relaying command to Native Bridge: ${data.action}`, 'system');
      } else {
        socket.emit("bridge_error", { message: "No active Native Desktop Bridge found." });
      }
    });

    socket.on("disconnect", () => {
      if (activeSessions.has(socket.id)) {
        activeSessions.delete(socket.id);
        addLog(`Extension node disconnected: ${socket.id.slice(0, 8)}`, 'system');
        broadcastToAdmins();
      }
      console.log(`Disconnected: ${socket.id}`);
    });
  });

  function broadcastToAdmins() {
    io.to("admins").emit("sessions_update", Array.from(activeSessions.values()));
    io.to("admins").emit("stats_update", getSystemStats());
  }

  // Periodic stats update for admins
  setInterval(() => {
    if (io.sockets.adapter.rooms.get("admins")) {
      io.to("admins").emit("stats_update", getSystemStats());
    }
  }, 5000);

  // API routes
  app.use(express.json());

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", sessions: activeSessions.size });
  });

  // Proxy endpoint for Gemini AI to keep API key secure
  app.post("/api/ai/generate", async (req, res) => {
    const { prompt } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ success: false, error: "GEMINI_API_KEY not configured on server" });
    }

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        })
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error.message);
      }

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      res.json({ success: true, text: text.trim() });
    } catch (error: any) {
      console.error("AI Generation Error:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Endpoint for extensions to report status
  app.post("/api/report-session", (req, res) => {
    const { userId, systemInfo, status } = req.body;
    const sessionId = req.headers['x-extension-id'] as string || `ext_${Math.random().toString(36).substr(2, 9)}`;
    
    const isNew = !activeSessions.has(sessionId);
    const oldStatus = activeSessions.get(sessionId)?.status;

    activeSessions.set(sessionId, {
      id: sessionId,
      userId: userId || 'Anonymous',
      systemInfo: systemInfo || {},
      status: status || 'Active',
      lastSeen: new Date().toISOString()
    });

    if (isNew) {
      addLog(`New extension node reported: ${sessionId.slice(0, 8)}`, 'success');
    } else if (oldStatus !== status) {
      addLog(`Node ${sessionId.slice(0, 8)} status changed: ${status}`, 'system');
    }

    broadcastToAdmins();
    res.json({ success: true });
  });

  // Vite middleware for development
  const isProduction = process.env.NODE_ENV === "production";
  const distPath = path.join(process.cwd(), "dist");
  
  if (!isProduction) {
    try {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
      console.log("Vite development middleware enabled");
    } catch (e) {
      console.warn("Failed to start Vite dev server, falling back to static serving");
      serveStatic(app, distPath);
    }
  } else {
    serveStatic(app, distPath);
  }

  function serveStatic(expressApp: any, staticPath: string) {
    expressApp.use(express.static(staticPath));
    expressApp.get("*", (req: any, res: any) => {
      res.sendFile(path.join(staticPath, "index.html"));
    });
    console.log(`Static file serving enabled from: ${staticPath}`);
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`\n🚀 Digital Sam CRM Server Started!`);
    console.log(`----------------------------------`);
    console.log(`Local:    http://localhost:${PORT}`);
    
    const networkInterfaces = os.networkInterfaces();
    Object.values(networkInterfaces).forEach((interfaces) => {
      interfaces?.forEach((iface) => {
        if (iface.family === 'IPv4' && !iface.internal) {
          console.log(`Network:  http://${iface.address}:${PORT}`);
        }
      });
    });
    console.log(`----------------------------------\n`);
  });
}

startServer();
