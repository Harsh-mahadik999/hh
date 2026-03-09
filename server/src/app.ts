import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import authRoutes from './routes/authRoutes';
import candidateRoutes from './routes/candidateRoutes';
import voteRoutes from './routes/voteRoutes';
import adminRoutes from './routes/adminRoutes';
import { seedData } from './seed';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Resolve client folder: works both in dev (ts-node: __dirname = src/) and prod (dist/)
const clientDir = path.resolve(__dirname, '../../client');

// Serve static client files
app.use(express.static(clientDir));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/votes', voteRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'College Voting System API is running!' });
});

// Serve frontend for all non-API routes
app.get('*', (_req, res) => {
  res.sendFile(path.join(clientDir, 'index.html'));
});

const startServer = async () => {
  try {
    // Try real MongoDB first; fall back to in-memory
    let mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/college-voting';
    try {
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 3000 });
      console.log('✅ Connected to MongoDB');
    } catch {
      console.log('⚠️  MongoDB not found — starting in-memory database...');
      const mongod = await MongoMemoryServer.create();
      mongoUri = mongod.getUri();
      await mongoose.connect(mongoUri);
      console.log('✅ In-memory MongoDB started');
    }

    // Auto-seed on first run
    await seedData();

    app.listen(PORT, () => {
      console.log('');
      console.log('🚀 ─────────────────────────────────────────');
      console.log(`   Server:    http://localhost:${PORT}`);
      console.log(`   Student:   http://localhost:${PORT}/index.html`);
      console.log(`   Admin:     http://localhost:${PORT}/admin-dashboard.html`);
      console.log(`   Results:   http://localhost:${PORT}/results.html`);
      console.log('   ─────────────────────────────────────────');
      console.log('   🔑 Admin login:   admin / admin123');
      console.log('   👤 Student login: AIML001 / pass1234');
      console.log('🚀 ─────────────────────────────────────────');
      console.log('');
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
};

startServer();

export default app;

