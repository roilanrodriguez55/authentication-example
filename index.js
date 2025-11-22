import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import corsMiddleware from './config/cors.js';
import routes from './routes/index.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { errorHandler } from './middleware/errorHandler.js';

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware globales
app.use(corsMiddleware);
app.use(cookieParser()); // Para manejar cookies (refresh tokens)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api', routes);

// Handler para rutas no encontradas (404)
app.use(notFoundHandler);

// Handler global de errores (debe ser el último middleware)
app.use(errorHandler);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});

export default app;

