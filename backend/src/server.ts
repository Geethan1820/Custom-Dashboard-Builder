import express, { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';
import { z } from 'zod';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

dotenv.config();

const prisma = new PrismaClient();
const app = express();
const port = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-this';

app.use(cors());
app.use(express.json());

// Auth Middleware
const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.sendStatus(403);
      (req as any).user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

// Validation Schemas
const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

const orderSchema = z.object({
  firstName: z.string().min(1, "First name is mandatory"),
  lastName: z.string().min(1, "Last name is mandatory"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(1, "Phone is mandatory"),
  street: z.string().min(1, "Street is mandatory"),
  city: z.string().min(1, "City is mandatory"),
  state: z.string().min(1, "State is mandatory"),
  postalCode: z.string().min(1, "Postal code is mandatory"),
  country: z.enum(["USA", "Canada", "UK", "Germany", "India"]),
  product: z.enum(["Laptop", "Phone", "Tablet", "Monitor", "Keyboard"]),
  quantity: z.number().int().positive("Quantity must be a positive integer"),
  unitPrice: z.number().nonnegative("Unit price must be non-negative"),
  status: z.enum(["Pending", "Shipped", "Delivered", "Cancelled"]),
  createdBy: z.string().min(1, "Created by is mandatory"),
});

// --- AUTH ENDPOINTS ---

app.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = registerSchema.parse(req.body);
    
    const existing = await (prisma as any).user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await (prisma as any).user.create({
      data: { name, email, password: hashedPassword }
    });

    res.status(201).json({ message: "User registered successfully", userId: user.id });
  } catch (error: any) {
    if (error instanceof z.ZodError) return res.status(400).json({ errors: error.issues });
    res.status(500).json({ error: "Registration failed" });
  }
});

app.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await (prisma as any).user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (error: any) {
    if (error instanceof z.ZodError) return res.status(400).json({ errors: error.issues });
    res.status(500).json({ error: "Login failed" });
  }
});

// --- PROTECTED DATA ENDPOINTS ---

app.get('/orders', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

app.post('/orders', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const validatedData = orderSchema.parse(req.body);
    const totalAmount = validatedData.quantity * validatedData.unitPrice;

    const order = await prisma.order.create({
      data: { ...validatedData, totalAmount },
    });
    res.status(201).json(order);
  } catch (error: any) {
    if (error instanceof z.ZodError) return res.status(400).json({ errors: error.issues });
    res.status(500).json({ error: "Failed to create order" });
  }
});

app.put('/orders/:id', authenticateJWT, async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const validatedData = orderSchema.parse(req.body);
    const totalAmount = validatedData.quantity * validatedData.unitPrice;

    const order = await prisma.order.update({
      where: { id: parseInt(id as string) },
      data: { ...validatedData, totalAmount },
    });
    res.json(order);
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ errors: error.issues });
    res.status(500).json({ error: "Failed to update order" });
  }
});

app.delete('/orders/:id', authenticateJWT, async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.order.delete({ where: { id: parseInt(id as string) } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete order" });
  }
});

app.get('/dashboard', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const dashboard = await prisma.dashboard.findFirst({ where: { name: 'default' } });
    if (!dashboard) {
      const newDash = await prisma.dashboard.create({ data: { name: 'default', layout: '[]', widgets: '[]' } });
      return res.json({ id: newDash.id, layout: [], widgets: [] });
    }
    res.json({
      id: dashboard.id,
      layout: JSON.parse(dashboard.layout),
      widgets: JSON.parse(dashboard.widgets),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
});

app.post('/dashboard', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const { layout, widgets } = req.body;
    const dashboard = await prisma.dashboard.upsert({
      where: { id: 1 },
      update: {
        layout: JSON.stringify(layout ?? []),
        widgets: JSON.stringify(widgets ?? []),
      },
      create: {
        name: 'default',
        layout: JSON.stringify(layout ?? []),
        widgets: JSON.stringify(widgets ?? []),
      },
    });
    res.json({
      id: dashboard.id,
      layout: JSON.parse(dashboard.layout),
      widgets: JSON.parse(dashboard.widgets),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save dashboard' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
