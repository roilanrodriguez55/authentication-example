import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import userRepository from '../repositories/user.repository.js';
import { generateAccessToken, generateRefreshToken, verifyToken } from '../utils/jwt.js';

dotenv.config();

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS) || 12;

/**
 * Servicio de autenticación
 * Maneja la lógica de negocio relacionada con autenticación y autorización
 */
class AuthService {
  /**
   * Registra un nuevo usuario
   * @param {Object} userData - Datos del usuario
   * @param {string} userData.email - Email del usuario
   * @param {string} userData.password - Contraseña en texto plano
   * @param {string} userData.name - Nombre del usuario (opcional)
   * @returns {Object} Usuario creado (sin password) y tokens
   */
  async register(userData) {
    const { email, password, name } = userData;

    // Validar campos requeridos
    if (!email || !password) {
      const error = new Error('Email y contraseña son requeridos');
      error.statusCode = 400;
      throw error;
    }

    // Validar formato de email básico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      const error = new Error('Formato de email inválido');
      error.statusCode = 400;
      throw error;
    }

    // Validar longitud mínima de contraseña
    if (password.length < 8) {
      const error = new Error('La contraseña debe tener al menos 8 caracteres');
      error.statusCode = 400;
      throw error;
    }

    // Verificar que el usuario no existe
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      const error = new Error('El email ya está en uso');
      error.statusCode = 409;
      throw error;
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

    // Crear el usuario
    const newUser = await userRepository.create({
      email,
      password: hashedPassword,
      name: name || null
    });

    // Generar tokens
    const accessToken = generateAccessToken({
      userId: newUser.id,
      email: newUser.email
    });

    const refreshToken = generateRefreshToken({
      userId: newUser.id,
      email: newUser.email
    });

    // Guardar refresh token en la base de datos (usar método interno)
    await userRepository.updateInternal(newUser.id, {
      refreshToken
    });

    // Retornar usuario (sin password) y tokens
    const { password: _, refreshToken: __, ...userWithoutSensitiveData } = newUser;

    return {
      user: userWithoutSensitiveData,
      accessToken,
      refreshToken
    };
  }

  /**
   * Inicia sesión con email y contraseña
   * @param {string} email - Email del usuario
   * @param {string} password - Contraseña en texto plano
   * @returns {Object} Usuario y tokens
   */
  async login(email, password) {
    // Validar campos requeridos
    if (!email || !password) {
      const error = new Error('Email y contraseña son requeridos');
      error.statusCode = 400;
      throw error;
    }

    // Buscar usuario por email
    const user = await userRepository.findByEmail(email);
    if (!user) {
      const error = new Error('Credenciales inválidas');
      error.statusCode = 401;
      throw error;
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      const error = new Error('Credenciales inválidas');
      error.statusCode = 401;
      throw error;
    }

    // Generar tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email
    });

    // Guardar refresh token en la base de datos (usar método interno)
    await userRepository.updateInternal(user.id, {
      refreshToken
    });

    // Retornar usuario (sin password) y tokens
    const { password: _, refreshToken: __, ...userWithoutSensitiveData } = user;

    return {
      user: userWithoutSensitiveData,
      accessToken,
      refreshToken
    };
  }

  /**
   * Refresca un access token usando un refresh token
   * @param {string} refreshToken - Refresh token
   * @returns {Object} Nuevo access token y opcionalmente un nuevo refresh token
   */
  async refreshAccessToken(refreshToken) {
    if (!refreshToken) {
      const error = new Error('Refresh token es requerido');
      error.statusCode = 400;
      throw error;
    }

    // Verificar el refresh token
    let decoded;
    try {
      decoded = verifyToken(refreshToken, 'refresh');
    } catch (error) {
      error.statusCode = 401;
      throw error;
    }

    // Buscar usuario con datos sensibles (incluyendo refreshToken)
    const user = await userRepository.findByIdWithSensitive(decoded.userId);
    if (!user) {
      const error = new Error('Usuario no encontrado');
      error.statusCode = 401;
      throw error;
    }

    // Verificar que el refresh token guardado coincide
    if (user.refreshToken !== refreshToken) {
      const error = new Error('Refresh token inválido');
      error.statusCode = 401;
      throw error;
    }

    // Generar nuevo access token
    const newAccessToken = generateAccessToken({
      userId: user.id,
      email: user.email
    });

    return {
      accessToken: newAccessToken
    };
  }

  /**
   * Cierra sesión invalidando el refresh token
   * @param {number} userId - ID del usuario
   */
  async logout(userId) {
    await userRepository.updateInternal(userId, {
      refreshToken: null
    });
  }

  /**
   * Obtiene el perfil del usuario autenticado
   * @param {number} userId - ID del usuario
   * @returns {Object} Usuario (sin datos sensibles)
   */
  async getProfile(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      const error = new Error('Usuario no encontrado');
      error.statusCode = 404;
      throw error;
    }

    return user;
  }
}

export default new AuthService();

