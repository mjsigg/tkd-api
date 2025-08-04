import express from 'express';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import { requireAuth, AuthRequest } from './middleware/authMiddleware.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

app.get('/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ 
      status: 'healthy', 
      database: 'connected',
      timestamp: result.rows[0].now 
    });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ 
      status: 'error', 
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Mount auth routes
app.use('/auth', authRoutes);

// Test protected route
app.get('/protected', requireAuth, (req: AuthRequest, res) => {
  res.json({ message: `Hello ${req.user?.email}! You are logged in as ${req.user?.role}` });
});

app.listen(port, () => {
  console.log(`TKD Backend running on port ${port}`);
});