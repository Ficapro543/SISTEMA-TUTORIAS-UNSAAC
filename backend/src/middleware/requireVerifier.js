const authenticateToken = require('./authMiddleware');

function requireVerifier(req, res, next) {
    authenticateToken(req, res, () => {
        // This callback is called when auth is successful
        if (req.user && req.user.roles && req.user.roles.includes('verificador')) {
            next();
        } else {
            res.status(403).json({ message: 'Acceso denegado. Se requieren permisos de verificador' });
        }
    });
}

module.exports = requireVerifier;
