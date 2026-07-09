import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { db } from "./firebaseAdmin";
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
  app.get("/api/registrations", async (req, res) => {
    try {
      const snapshot = await db.collection("registrations").get();

      const registrations = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      res.json({
        success: true,
        registrations
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        error: "Failed to fetch registrations."
      });
    }
  });

  // API: Save student registration
  app.post("/api/register", async (req, res) => {
    try {
      const { name, usn, phone, email, boardingPoint, route } = req.body;

      if (!name || !usn || !phone || !email || !boardingPoint || !route) {
        return res.status(400).json({
          success: false,
          error: "Please fill out all fields."
        });
      }

      await db.collection("registrations").add({
        studentName: String(name).trim(),
        usn: String(usn).trim().toUpperCase(),
        phone: String(phone).trim(),
        email: String(email).trim(),
        boardingPoint: String(boardingPoint).trim(),
        routeNo: String(route).trim(),
        status: "Pending",
        submittedAt: new Date()
      });

      return res.json({
        success: true,
        message: "Registration submitted successfully."
      });

    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        error: "Internal Server Error"
      });
    }
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
