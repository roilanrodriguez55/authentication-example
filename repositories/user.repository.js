import prisma from '../config/database.js';

/**
 * Repositorio para interactuar con la base de datos de usuarios
 * Contiene todas las operaciones CRUD relacionadas con User
 */
class UserRepository {
  /**
   * Buscar todos los usuarios
   */
  async findAll() {
    return prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true
      }
    });
  }

  /**
   * Buscar un usuario por ID
   */
  async findById(id) {
    return prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true
      }
    });
  }

  /**
   * Buscar un usuario por ID incluyendo datos sensibles (para autenticación)
   * Solo debe usarse internamente en servicios de autenticación
   */
  async findByIdWithSensitive(id) {
    return prisma.user.findUnique({
      where: { id: parseInt(id) }
    });
  }

  /**
   * Buscar un usuario por email
   */
  async findByEmail(email) {
    return prisma.user.findUnique({
      where: { email }
    });
  }

  /**
   * Crear un nuevo usuario
   */
  async create(data) {
    return prisma.user.create({
      data
    });
  }

  /**
   * Crear un nuevo usuario (solo campos públicos)
   */
  async createPublic(data) {
    return prisma.user.create({
      data,
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true
      }
    });
  }

  /**
   * Actualizar un usuario (solo campos públicos en la respuesta)
   */
  async update(id, data) {
    return prisma.user.update({
      where: { id: parseInt(id) },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true
      }
    });
  }

  /**
   * Actualizar un usuario (versión interna con todos los campos)
   * Solo debe usarse internamente en servicios que necesitan acceso completo
   */
  async updateInternal(id, data) {
    return prisma.user.update({
      where: { id: parseInt(id) },
      data
    });
  }

  /**
   * Eliminar un usuario
   */
  async delete(id) {
    return prisma.user.delete({
      where: { id: parseInt(id) },
    });
  }
}

export default new UserRepository();

