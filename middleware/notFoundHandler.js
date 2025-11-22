/**
 * Middleware para manejar endpoints no definidos (404)
 * Debe colocarse después de todas las rutas
 */
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
  });
};

