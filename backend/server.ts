import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

dotenv.config();
const app = express();
const PORT = process.env.PORT 


app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
   allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

// Debug middleware (remove this in production)







// Middleware
app.use(cookieParser());
app.use(express.json({ 
  limit: '50mb',           // Increase JSON payload limit
  verify: (req, res, buf) => {
    // Optional: Log payload size for debugging
    console.log(`Request payload size: ${(buf.length / 1024 / 1024).toFixed(2)}MB`);
  }
}));

app.use(express.urlencoded({ 
  limit: '50mb',           // Increase URL-encoded payload limit
  extended: true,
  parameterLimit: 50000    // Increase parameter limit
}));

app.use((req, res, next) => {
  console.log('Request Origin:', req.headers.origin);
  console.log('Request Method:', req.method);
  console.log('Request Headers:', req.headers);
  next();
});

// Routes

import authRoutes from './routes/auth.routes';
import reportRoutes from './routes/report.routes';


//Routes in use
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/reports', reportRoutes);







app.get('/health', (req: Request, res: Response) => {
  res.json({ message : 'API is healthy'});
});
app.get('/', (req: Request, res: Response) => {
  res.json({ status: 'Server is running!', timestamp: new Date().toISOString() });
});






// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});