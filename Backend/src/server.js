import express from 'express';
import noteRoutes from './Routes/noteRoutes.js';
import authRoutes from './Routes/authRoutes.js';
import { ConnectMongoDB } from './Config/db.js';
import dotenv from 'dotenv';
import rateLimiter from './Middleware/rateLimiter.js';
import cors from "cors";
dotenv.config();
//const express = require('express');
const Port = process.env.PORT || 5004;
const app = express();

app.use(cors({
    origin: 'http://localhost:5173',
}));
app.use(express.json());
app.use(rateLimiter); 

app.use("/api/first", noteRoutes);

const startServer = () => {
    app.listen(Port, () => {
        console.log("Server is running on port:", Port);
    });
};

// Mount routes under both /api/first and /api/notes for compatibility with frontend
app.use('/api/notes', noteRoutes);
// auth routes (signup/login)
app.use('/api/auth', authRoutes);

if (process.env.MONGO) {
    // Only attempt to connect to MongoDB if MONGO is provided. This avoids failing to start
    // the backend in development environments where Mongo isn't available.
    ConnectMongoDB()
        .then(() => startServer())
        .catch((err) => {
            // If DB connection fails, log and still start the server for local dev/test purposes.
            console.error('MongoDB connection failed, starting server without DB:', err);
            startServer();
        });
} else {
    console.warn('No MONGO config found. Starting server without connecting to MongoDB.');
    startServer();
}
