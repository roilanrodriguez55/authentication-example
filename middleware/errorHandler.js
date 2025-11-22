/**
 * Middleware global para el manejo de errores
 * Debe ser el último middleware en la cadena
 */
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Error de validación
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      errors: err.errors || err.message,
    });
  }

  // Error de Prisma
  if (err.code === 'P2002') {
    return res.status(409).json({
      success: false,
      message: 'El registro ya existe',
      error: err.meta?.target,
    });
  }

  // Errores de JWT
  if (err.name === 'TokenExpiredError' || err.name === 'JsonWebTokenError' || err.name === 'TokenTypeError') {
    return res.status(err.statusCode || 401).json({
      success: false,
      message: err.message || 'Token inválido o expirado',
    });
  }

  // Error personalizado con status code
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message || 'Error en la solicitud',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
  }

  // Error por defecto
  res.status(500).json({
    success: false,
    message: err.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

