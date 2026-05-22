import express from 'express';
import * as dotenv from 'dotenv';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import 'express-async-errors';
import { dirname } from "path";
import { fileURLToPath } from "url";
import path from "path";

import productRouter from './Routes/productRouter.js';
import authRouter from './Routes/authRouter.js';
import userRouter from './Routes/userRouter.js';
import postRouter from './Routes/postRouter.js';
import orderRouter from './Routes/orderRouter.js';
import errorHandlerMiddleware from './Middleware/errorHandlerMiddleware.js';
import { authenticateUser } from './Middleware/authMiddleware.js';

dotenv.config();
const app = express();

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const __dirname = dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.resolve(__dirname, "./public/uploads")));

// Rutas
app.use('/api/v1/products', productRouter);
app.use('/api/v1/users', authenticateUser, userRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/post', postRouter);
app.use('/api/v1/orders', authenticateUser, orderRouter);

app.use('*', (req, res) => {
  res.status(404).json({ msg: 'not found' });
});

app.use(errorHandlerMiddleware);

// ✅ Escucha DESPUÉS de que todo esté registrado
const port = process.env.PORT || 5100;

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment variables');
  process.exit(1);
}

app.listen(port, () => {
  console.log(`server running on PORT ${port}...`);
});
