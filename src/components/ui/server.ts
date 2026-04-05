import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- API Routes ---
  
  // Mock Data Store (In-memory for now, can be persisted to JSON)
  let products = [
    {
      id: "1",
      name: "Midnight Silk Panjabi",
      price: 4500,
      category: "Premium",
      images: ["https://images.unsplash.com/photo-1597933534024-164966679524?q=80&w=1000&auto=format&fit=crop"],
      stock: 15,
      description: "Handcrafted midnight black silk panjabi with intricate embroidery."
    },
    {
      id: "2",
      name: "Ivory Heritage Sherwani",
      price: 12000,
      category: "Luxury",
      images: ["https://images.unsplash.com/photo-1610130383669-95917c70ca20?q=80&w=1000&auto=format&fit=crop"],
      stock: 5,
      description: "A timeless ivory sherwani for the modern groom."
    }
  ];

  app.get("/api/products", (req, res) => {
    res.json(products);
  });

  app.post("/api/products", (req, res) => {
    const newProduct = { ...req.body, id: Date.now().toString() };
    products.push(newProduct);
    res.status(201).json(newProduct);
  });

  // --- Vite Middleware ---
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
    console.log(`Peak Point Server running at http://localhost:${PORT}`);
  });
}

startServer();
