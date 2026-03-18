"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const cors_1 = __importDefault(require("cors"));
const zod_1 = require("zod");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const prisma = new client_1.PrismaClient();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Validation Schema
const orderSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(1, "First name is mandatory"),
    lastName: zod_1.z.string().min(1, "Last name is mandatory"),
    email: zod_1.z.string().email("Invalid email"),
    phone: zod_1.z.string().min(1, "Phone is mandatory"),
    street: zod_1.z.string().min(1, "Street is mandatory"),
    city: zod_1.z.string().min(1, "City is mandatory"),
    state: zod_1.z.string().min(1, "State is mandatory"),
    postalCode: zod_1.z.string().min(1, "Postal code is mandatory"),
    country: zod_1.z.enum(["USA", "Canada", "UK", "Germany", "India"]), // Dropdown values
    product: zod_1.z.enum(["Laptop", "Phone", "Tablet", "Monitor", "Keyboard"]), // Dropdown values
    quantity: zod_1.z.number().int().positive("Quantity must be a positive integer"),
    unitPrice: zod_1.z.number().nonnegative("Unit price must be non-negative"),
    status: zod_1.z.enum(["Pending", "Shipped", "Delivered", "Cancelled"]), // Dropdown values
    createdBy: zod_1.z.string().min(1, "Created by is mandatory"),
});
// GET /orders - List all orders
app.get('/orders', async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            orderBy: { createdAt: 'desc' },
        });
        res.json(orders);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch orders" });
    }
});
// POST /orders - Create order
app.post('/orders', async (req, res) => {
    try {
        const validatedData = orderSchema.parse(req.body);
        // Business Logic: Auto-calculate total amount
        const totalAmount = validatedData.quantity * validatedData.unitPrice;
        const order = await prisma.order.create({
            data: {
                firstName: validatedData.firstName,
                lastName: validatedData.lastName,
                email: validatedData.email,
                phone: validatedData.phone,
                street: validatedData.street,
                city: validatedData.city,
                state: validatedData.state,
                postalCode: validatedData.postalCode,
                country: validatedData.country,
                product: validatedData.product,
                quantity: validatedData.quantity,
                unitPrice: validatedData.unitPrice,
                status: validatedData.status,
                createdBy: validatedData.createdBy,
                totalAmount,
            },
        });
        res.status(201).json(order);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ errors: error.issues });
        }
        res.status(500).json({ error: "Failed to create order" });
    }
});
// PUT /orders/:id - Update order
app.put('/orders/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const validatedData = orderSchema.parse(req.body);
        const totalAmount = validatedData.quantity * validatedData.unitPrice;
        const order = await prisma.order.update({
            where: { id: parseInt(id) },
            data: {
                firstName: validatedData.firstName,
                lastName: validatedData.lastName,
                email: validatedData.email,
                phone: validatedData.phone,
                street: validatedData.street,
                city: validatedData.city,
                state: validatedData.state,
                postalCode: validatedData.postalCode,
                country: validatedData.country,
                product: validatedData.product,
                quantity: validatedData.quantity,
                unitPrice: validatedData.unitPrice,
                status: validatedData.status,
                createdBy: validatedData.createdBy,
                totalAmount,
            },
        });
        res.json(order);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ errors: error.issues });
        }
        res.status(500).json({ error: "Failed to update order" });
    }
});
// DELETE /orders/:id - Delete order
app.delete('/orders/:id', async (req, res) => {
    const id = req.params.id;
    try {
        await prisma.order.delete({
            where: { id: parseInt(id) },
        });
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ error: "Failed to delete order" });
    }
});
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
