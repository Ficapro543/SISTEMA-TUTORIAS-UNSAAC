// src/middleware/authMiddleware.js
const { verifyAccessToken } = require('../utils/tokens');

function authenticateToken(req, res, next) {
  // 1. Intentar obtener el token de los headers Authorization
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Formato: "Bearer TOKEN"

  // 2. Si no está en los headers, intentar obtener de las cookies
  if (!token) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  try {
    // 3. Verificar el token
    const decoded = verifyAccessToken(token);
    
    // 4. Adjuntar los datos del usuario al request
    req.user = decoded;
    
    // 5. Continuar
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expirado' });
    }
    return res.status(403).json({ message: 'Token inválido' });
  }
}

module.exports = authenticateToken;