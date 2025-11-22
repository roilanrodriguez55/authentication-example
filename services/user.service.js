import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import userRepository from '../repositories/user.repository.js';

dotenv.config();

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS) || 12;

/**
 * Servicio de usuarios
 * Contiene la lógica de negocio relacionada con usuarios
 */
class UserService {
  /**
   * Obtener todos los usuarios
   */
  async getAllUsers() {
    return userRepository.findAll();
  }

  /**
   * Obtener un usuario por ID
   */
  async getUserById(id) {
    const user = await userRepository.findById(id);
    
    if (!user) {
      const error = new Error('Usuario no encontrado');
      error.statusCode = 404;
      throw error;
    }

    return user;
  }

  /**
   * Crear un nuevo usuario
   * NOTA: Esta ruta está protegida y no debería usarse para registro público.
   * Para registro público, usar authService.register()
   * Esta función NO genera tokens, ideal para panel de administración
   * @param {Object} userData - Datos del usuario
   * @param {string} userData.email - Email del usuario
   * @param {string} userData.password - Contraseña en texto plano
   * @param {string} userData.name - Nombre del usuario (opcional)
   * @returns {Object} Usuario creado (sin password ni refreshToken)
   */
  async createUser(userData) {
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

    // Crear el usuario (sin generar tokens)
    const newUser = await userRepository.createPublic({
      email,
      password: hashedPassword,
      name: name || null
    });

    return newUser;
  }

  /**
   * Actualizar un usuario
   */
  async updateUser(id, userData) {
    // Verificar que el usuario existe
    await this.getUserById(id);

    return userRepository.update(id, userData);
  }

  /**
   * Eliminar un usuario
   */
  async deleteUser(id) {
    // Verificar que el usuario existe
    await this.getUserById(id);

    return userRepository.delete(id);
  }
}

export default new UserService();

