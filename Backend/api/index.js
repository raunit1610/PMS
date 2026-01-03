import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables (only in local development, Vercel uses its own env vars)
if (!process.env.VERCEL) {
    dotenv.config();
}

//MongoDB Connection
import ConnectionDB from '../assets/connectionDB.js';

const MONGODB_URI = process.env.prm_db_MONGODB_URI || process.env.MONGODB_URI;

ConnectionDB(MONGODB_URI).then(() =>
    console.log("MongoDB Connected")
);

//Setting Up Server
const app = express();

// CORS configuration
const corsOptions = {
    origin: process.env.CORS_ORIGIN?.split(',') || '*',
    credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

import AuthRouter from '../assets/routes/AuthRouter.js';
import MoneyRouter from '../assets/routes/MoneyRouter.js';

app.use("/auth", AuthRouter);
app.use("/feature", MoneyRouter);

// Export handler for Vercel serverless functions
export default async (req, res) => {
    return app(req, res);
};

// Start server locally when not on Vercel
// Vercel uses the exported handler, so this only runs in local development
if (!process.env.VERCEL) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

