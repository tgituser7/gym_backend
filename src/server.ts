import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';
import errorHandler from './middleware/errorHandler';
import authRoutes from './routes/auth';
import branchRoutes from './routes/branches';
import memberRoutes from './routes/members';
import staffRoutes from './routes/staff';
import serviceRoutes from './routes/services';
import feeRoutes from './routes/fees';
import statsRoutes from './routes/stats';

dotenv.config();
connectDB();

const app = express();

const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((o) => o.trim())
  : true; // allow all origins when CLIENT_URL is not set
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

app.get('/ping', (_, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/stats', statsRoutes);

app.use(errorHandler);

const PORT = parseInt(process.env.PORT || '5000', 10);
app.listen(PORT);

// Keep Render free-tier alive — ping self every 5 minutes
if (process.env.RENDER_EXTERNAL_URL) {
  const url = `${process.env.RENDER_EXTERNAL_URL}/ping`;
  setInterval(() => { fetch(url).catch(() => {}); }, 5 * 60 * 1000);
}
