import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cors from "cors";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database("store.db");

console.log("Initializing database...");
// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    full_name TEXT,
    email TEXT
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    name TEXT,
    purchase_price REAL,
    purchase_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    quantity INTEGER,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    product_id INTEGER,
    quantity INTEGER,
    sale_price REAL,
    purchase_price REAL,
    total_price REAL,
    sale_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(product_id) REFERENCES products(id)
  );
`);

const app = express();
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

const JWT_SECRET = "your-secret-key"; // In a real app, use process.env.JWT_SECRET

// Ping endpoint
app.get("/api/ping", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Auth Middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Auth Routes
app.post("/api/register", async (req, res) => {
  try {
    let { username, password, full_name, email } = req.body;
    
    // 1. Sanitization & Validation
    username = username?.toString().trim();
    password = password?.toString();
    full_name = full_name?.toString().trim();
    email = email?.toString().trim();

    if (!username || !password) {
      return res.status(400).json({ error: "اسم المستخدم وكلمة المرور مطلوبان" });
    }

    if (username.length < 3) {
      return res.status(400).json({ error: "اسم المستخدم يجب أن يكون 3 أحرف على الأقل" });
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return res.status(400).json({ error: "اسم المستخدم يجب أن يحتوي على أحرف وأرقام فقط" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 2. Database Operation
    const info = db.prepare("INSERT INTO users (username, password, full_name, email) VALUES (?, ?, ?, ?)").run(username, hashedPassword, full_name || null, email || null);
    
    console.log(`User registered successfully: ${username} (ID: ${info.lastInsertRowid})`);
    return res.status(201).json({ 
      success: true, 
      message: "تم التسجيل بنجاح",
      id: info.lastInsertRowid 
    });

  } catch (e: any) {
    console.error("Registration error details:", e);
    
    if (e.message && e.message.includes("UNIQUE constraint failed")) {
      return res.status(400).json({ error: "اسم المستخدم هذا محجوز بالفعل، اختر اسماً آخر" });
    }
    
    return res.status(500).json({ 
      error: "حدث خطأ داخلي أثناء معالجة طلبك. يرجى المحاولة لاحقاً." 
    });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    console.log("Login request received:", req.body.username);
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "اسم المستخدم وكلمة المرور مطلوبان" });
    }

    const user: any = db.prepare("SELECT * FROM users WHERE username = ?").get(username);
    if (user && await bcrypt.compare(password, user.password)) {
      const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET);
      console.log("Login successful:", username);
      res.json({ token, username: user.username });
    } else {
      console.log("Login failed: Invalid credentials for", username);
      res.status(401).json({ error: "اسم المستخدم أو كلمة المرور غير صحيحة" });
    }
  } catch (e: any) {
    console.error("Login error:", e.message);
    res.status(500).json({ error: "حدث خطأ في الخادم أثناء تسجيل الدخول" });
  }
});

// Profile Routes
app.get("/api/profile", authenticateToken, (req: any, res) => {
  const user: any = db.prepare("SELECT id, username, full_name, email FROM users WHERE id = ?").get(req.user.id);
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ error: "المستخدم غير موجود" });
  }
});

app.put("/api/profile", authenticateToken, (req: any, res) => {
  const { full_name, email } = req.body;
  db.prepare("UPDATE users SET full_name = ?, email = ? WHERE id = ?").run(full_name, email, req.user.id);
  res.json({ success: true, message: "تم تحديث الملف الشخصي بنجاح" });
});

// Product Routes
app.get("/api/products", authenticateToken, (req: any, res) => {
  const products = db.prepare("SELECT * FROM products WHERE user_id = ?").all(req.user.id);
  res.json(products);
});

app.post("/api/products", authenticateToken, (req: any, res) => {
  const { name, purchase_price, quantity, purchase_date } = req.body;
  const info = db.prepare("INSERT INTO products (user_id, name, purchase_price, quantity, purchase_date) VALUES (?, ?, ?, ?, ?)").run(req.user.id, name, purchase_price, quantity, purchase_date || new Date().toISOString());
  res.status(201).json({ id: info.lastInsertRowid });
});

app.delete("/api/products/:id", authenticateToken, (req: any, res) => {
  db.prepare("DELETE FROM products WHERE id = ? AND user_id = ?").run(req.params.id, req.user.id);
  res.sendStatus(204);
});

// Sales Routes
app.get("/api/sales", authenticateToken, (req: any, res) => {
  const sales = db.prepare(`
    SELECT sales.*, products.name as product_name 
    FROM sales 
    JOIN products ON sales.product_id = products.id 
    WHERE sales.user_id = ?
    ORDER BY sale_date DESC
  `).all(req.user.id);
  res.json(sales);
});

app.post("/api/sales", authenticateToken, (req: any, res) => {
  const { product_id, quantity, sale_price, sale_date } = req.body;
  const product: any = db.prepare("SELECT * FROM products WHERE id = ? AND user_id = ?").get(product_id, req.user.id);
  
  if (!product || product.quantity < quantity) {
    return res.status(400).json({ error: "Insufficient quantity" });
  }

  const total_price = sale_price * quantity;
  const purchase_price = product.purchase_price;
  
  const transaction = db.transaction(() => {
    db.prepare("UPDATE products SET quantity = quantity - ? WHERE id = ?").run(quantity, product_id);
    db.prepare("INSERT INTO sales (user_id, product_id, quantity, sale_price, purchase_price, total_price, sale_date) VALUES (?, ?, ?, ?, ?, ?, ?)").run(req.user.id, product_id, quantity, sale_price, purchase_price, total_price, sale_date || new Date().toISOString());
  });

  transaction();
  res.status(201).json({ success: true });
});

// Vite middleware for development
if (process.env.NODE_ENV !== "production") {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.join(__dirname, "dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
  });
}

const PORT = 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
