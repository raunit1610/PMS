import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables (only in local development, Vercel uses its own env vars)
if (!process.env.VERCEL) {
    dotenv.config();
}

const app = express();

// CORS configuration
const corsOptions = {
    origin: process.env.CORS_ORIGIN?.split(',') || '*',
    credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World');
});

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

