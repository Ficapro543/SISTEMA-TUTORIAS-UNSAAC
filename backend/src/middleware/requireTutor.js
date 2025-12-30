const authenticateToken = require('./authMiddleware');

function requireTutor(req, res, next) {
    authenticateToken(req, res, (err) => {
        if (err) return next(err);
        if (!req.user || !req.user.roles || !req.user.roles.includes('tutor')) {
            return res.status(403).json({ message: 'Acceso denegado: Se requiere rol de Tutor' });
        }
        next();
    });
}

module.exports = requireTutor;
