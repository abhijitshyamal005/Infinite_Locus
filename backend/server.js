import express from 'express';
import { Server } from 'socket.io';
import { socketCtrl } from './controllers/socket.controller.js';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import userRouter from './routes/user.routes.js';
import documentRouter from './routes/document.routes.js';
import dbConnect from './utils/dbConnect.js';
import cors from 'cors';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

dotenv.config();

app.use(express.json());

const corsOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: corsOrigins,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  })
);

app.use('/api/v1/users', userRouter);
app.use('/api/v1/documents', documentRouter);

// Serve the Vite build in production (single deploy)
if (process.env.NODE_ENV === 'production') {
  const clientDistPath = path.resolve(__dirname, '../frontend/dist');
  app.use(express.static(clientDistPath));

  app.get('/*', (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

const server = app.listen(PORT, async () => {
  await dbConnect();
  console.log(`Server is running on http://localhost:${PORT}`);
});

const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: corsOrigins,
    methods: ['GET', 'POST'],
  },
});

socketCtrl(io);
