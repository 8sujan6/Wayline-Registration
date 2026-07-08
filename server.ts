import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse json payloads
  app.use(express.json());

  const DATA_FILE = path.join(process.cwd(), "registrations.json");

  // Load existing registrations or initialize
  function readRegistrations(): any[] {
    if (fs.existsSync(DATA_FILE)) {
      try {
        return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
      } catch (e) {
        console.error("Error reading registrations file", e);
        return [];
      }
    }
    return [];
  }

  function writeRegistrations(data: any[]) {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
    } catch (e) {
      console.error("Error writing registrations file", e);
    }
  }

  // API: Get all registrations
  app.get("/api/registrations", (req, res) => {
    const list = readRegistrations();
    res.json({ success: true, registrations: list });
  });

  // API: Save student registration
  app.post("/api/register", (req, res) => {
    const { name, usn, phone, email, boardingPoint, route } = req.body;

    // Simple validation
    if (!name || !usn || !phone || !email || !boardingPoint || !route) {
      return res.status(400).json({ success: false, error: "Please fill out all fields." });
    }

    const currentList = readRegistrations();
    const newRecord = {
      id: "REG_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
      name: String(name).trim(),
      usn: String(usn).trim().toUpperCase(),
      phone: String(phone).trim(),
      email: String(email).trim(),
      boardingPoint: String(boardingPoint).trim(),
      route: String(route).trim(),
      createdAt: new Date().toISOString()
    };

    currentList.push(newRecord);
    writeRegistrations(currentList);

    return res.json({
      success: true,
      message: "we will contact the user abt the further steps via email shortly."
    });
  });

  // API: Delete registration record (optional utility for UI cleanup)
  app.delete("/api/registrations/:id", (req, res) => {
    const { id } = req.params;
    const currentList = readRegistrations();
    const filtered = currentList.filter(r => r.id !== id);
    writeRegistrations(filtered);
    res.json({ success: true });
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
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
