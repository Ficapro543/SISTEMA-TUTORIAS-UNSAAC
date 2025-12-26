const authenticateToken = require('./authMiddleware');

function requireAdmin(req, res, next) {
  // Primero autenticar el token
  authenticateToken(req, res, (err) => {
    if (err) return next(err);
    
    // Luego verificar si es admin
    if (!req.user.roles.includes('administrador')) {
      return res.status(403).json({ message: 'Acceso denegado. Se requieren permisos de administrador' });
    }
    
    next();
  });
}

module.exports = requireAdmin;