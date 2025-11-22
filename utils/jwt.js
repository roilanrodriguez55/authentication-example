import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_ACCESS_TOKEN_EXPIRES_IN = process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || '15m';
const JWT_REFRESH_TOKEN_EXPIRES_IN = process.env.JWT_REFRESH_TOKEN_EXPIRES_IN || '7d';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET no está definido en las variables de entorno');
}

/**
 * Genera un access token JWT
 * @param {Object} payload - Datos a incluir en el token
 * @param {string} payload.userId - ID del usuario
 * @param {string} payload.email - Email del usuario
 * @returns {string} Access token
 */
export const generateAccessToken = (payload) => {
  return jwt.sign(
    {
      userId: payload.userId,
      email: payload.email,
      type: 'access'
    },
    JWT_SECRET,
    {
      expiresIn: JWT_ACCESS_TOKEN_EXPIRES_IN,
      issuer: 'authentication-api',
      audience: 'authentication-client'
    }
  );
};

/**
 * Genera un refresh token JWT
 * @param {Object} payload - Datos a incluir en el token
 * @param {string} payload.userId - ID del usuario
 * @param {string} payload.email - Email del usuario
 * @returns {string} Refresh token
 */
export const generateRefreshToken = (payload) => {
  return jwt.sign(
    {
      userId: payload.userId,
      email: payload.email,
      type: 'refresh'
    },
    JWT_SECRET,
    {
      expiresIn: JWT_REFRESH_TOKEN_EXPIRES_IN,
      issuer: 'authentication-api',
      audience: 'authentication-client'
    }
  );
};

/**
 * Verifica y decodifica un token JWT
 * @param {string} token - Token a verificar
 * @param {string} expectedType - Tipo de token esperado ('access' o 'refresh')
 * @returns {Object} Payload decodificado
 * @throws {Error} Si el token es inválido o expirado
 */
export const verifyToken = (token, expectedType = 'access') => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'authentication-api',
      audience: 'authentication-client'
    });

    // Verificar que el tipo de token coincide
    if (decoded.type !== expectedType) {
      const error = new Error(`Token type mismatch. Expected: ${expectedType}, Got: ${decoded.type}`);
      error.name = 'TokenTypeError';
      throw error;
    }

    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      const expiredError = new Error('Token expirado');
      expiredError.name = 'TokenExpiredError';
      expiredError.statusCode = 401;
      throw expiredError;
    } else if (error.name === 'JsonWebTokenError') {
      const invalidError = new Error('Token inválido');
      invalidError.name = 'JsonWebTokenError';
      invalidError.statusCode = 401;
      throw invalidError;
    }
    throw error;
  }
};

/**
 * Decodifica un token sin verificar (útil para debug)
 * @param {string} token - Token a decodificar
 * @returns {Object} Payload decodificado
 */
export const decodeToken = (token) => {
  return jwt.decode(token);
};

