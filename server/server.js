import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/database.js';
import authRoutes from './routes/auth.js';
import residentRoutes from './routes/resident.js';
import collectorRoutes from './routes/collector.js';
import supervisorRoutes from './routes/supervisor.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/resident', residentRoutes);
app.use('/api/collector', collectorRoutes);
app.use('/api/supervisor', supervisorRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

async function start() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Smart Waste Management System running on port ${PORT}`);
  });
}

start().catch((error) => {
  console.error('Failed to start server:', error.message);
  process.exit(1);
});
