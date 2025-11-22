import authService from '../services/auth.service.js';

/**
 * Controlador de autenticación
 * Maneja las peticiones HTTP relacionadas con autenticación
 */
class AuthController {
  /**
   * POST /auth/register - Registra un nuevo usuario
   */
  async register(req, res, next) {
    try {
      const result = await authService.register(req.body);

      // Enviar refresh token como httpOnly cookie para mayor seguridad
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
      });

      res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        data: {
          user: result.user,
          accessToken: result.accessToken
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /auth/login - Inicia sesión
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);

      // Enviar refresh token como httpOnly cookie para mayor seguridad
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
      });

      res.json({
        success: true,
        message: 'Inicio de sesión exitoso',
        data: {
          user: result.user,
          accessToken: result.accessToken
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /auth/refresh - Refresca el access token
   */
  async refresh(req, res, next) {
    try {
      // Intentar obtener el refresh token del cookie o del body
      const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;

      if (!refreshToken) {
        const error = new Error('Refresh token no proporcionado');
        error.statusCode = 400;
        throw error;
      }

      const result = await authService.refreshAccessToken(refreshToken);

      res.json({
        success: true,
        data: {
          accessToken: result.accessToken
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /auth/logout - Cierra sesión
   */
  async logout(req, res, next) {
    try {
      const userId = req.user?.userId;
      
      if (userId) {
        await authService.logout(userId);
      }

      // Eliminar cookie de refresh token
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });

      res.json({
        success: true,
        message: 'Sesión cerrada exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /auth/profile - Obtiene el perfil del usuario autenticado
   */
  async getProfile(req, res, next) {
    try {
      const userId = req.user.userId;
      const user = await authService.getProfile(userId);

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();

