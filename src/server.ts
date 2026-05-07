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

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000' }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/stats', statsRoutes);

app.use(errorHandler);

const PORT = parseInt(process.env.PORT || '5000', 10);
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
