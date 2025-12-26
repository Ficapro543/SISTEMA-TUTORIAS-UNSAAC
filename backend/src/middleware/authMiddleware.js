// src/middleware/authMiddleware.js
const { verifyAccessToken } = require('../utils/tokens');

function authenticateToken(req, res, next) {
  // 1. Intentar obtener el token de los headers Authorization
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Formato: "Bearer TOKEN"
  
  console.log('🔐 Middleware - Token recibido:', token ? 'SÍ' : 'NO');

  // 2. Si no está en los headers, intentar obtener de las cookies
  if (!token) {
    console.log('❌ Middleware - Token no proporcionado');
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  try {
    console.log('🔍 Middleware - Verificando token...');
    // 3. Verificar el token
    const decoded = verifyAccessToken(token);
    console.log('✅ Middleware - Token válido. Usuario:', decoded.email);
    
    // 4. Adjuntar los datos del usuario al request
    req.user = decoded;
    
    // 5. Continuar
    next();

  } catch (error) {
    console.log(`❌ Middleware - Error: ${error.name} - ${error.message}`);

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expirado' });
    }
    // CORRECCIÓN: Para JsonWebTokenError también devolver 401
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token inválido' }); // 401, no 403
    }

    return res.status(403).json({ message: 'Acceso Denegado' });
  }
}

module.exports = authenticateToken;