require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');

const app = express();

//Log
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser());

// ✅ Ruta de prueba
app.get("/api/ping", (req, res) => {
  res.json({ message: "Backend funcionando correctamente 🚀" });
});

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// Error handler:
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Si es un error de JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Token inválido' });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Token expirado' });
  }

  res.status(err.status || 500).json({ 
    message: err.message || 'Error interno del servidor',
    // Solo mostrar stack en desarrollo
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Backend corriendo en http://localhost:${PORT}`));

