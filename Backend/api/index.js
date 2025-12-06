import express from 'express';
import cors from 'cors';
// import dotenv from 'dotenv';

// dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World');
});

// Export the Express app as a serverless function for Vercel
export default app;

// Start server locally when not on Vercel
// Vercel uses the exported app, so this only runs in local development
if (!process.env.VERCEL) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

