import { verifyToken } from '../utils/jwt.js';

/**
 * Middleware de autenticación JWT
 * Verifica que el request tenga un access token válido
 */
export const authenticateToken = async (req, res, next) => {
  try {
    // Obtener el token del header Authorization
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Formato: "Bearer TOKEN"

    if (!token) {
      const error = new Error('Token de acceso no proporcionado');
      error.statusCode = 401;
      return next(error);
    }

    // Verificar el token
    const decoded = verifyToken(token, 'access');

    // Agregar información del usuario al request
    req.user = {
      userId: decoded.userId,
      email: decoded.email
    };

    next();
  } catch (error) {
    // Si el error ya tiene statusCode, lo pasamos
    if (error.statusCode) {
      return next(error);
    }

    // Si no, lo marcamos como error 401
    error.statusCode = 401;
    error.message = error.message || 'Token inválido o expirado';
    next(error);
  }
};

/**
 * Middleware opcional de autenticación
 * Verifica el token si existe, pero no falla si no está presente
 * Útil para rutas que tienen comportamiento diferente si el usuario está autenticado
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      try {
        const decoded = verifyToken(token, 'access');
        req.user = {
          userId: decoded.userId,
          email: decoded.email
        };
      } catch (error) {
        // Si el token es inválido, simplemente no agregamos req.user
        // pero continuamos con la request
      }
    }

    next();
  } catch (error) {
    // En optional auth, cualquier error se ignora
    next();
  }
};

