require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const assignmentRoutes = require('./routes/assignments');
const tutoriasRoutes = require('./routes/tutorias');
const verificadorRoutes = require('./routes/verificador');
const cronogramasRoutes = require('./routes/cronogramas');

const app = express();

//Log
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  }
  next();
});

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3001',
  process.env.FRONTEND_URL, // Deployed Frontend URL from ENV
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('Origin blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.get("/api/ping", (req, res) => {
  res.json({ message: "Backend funcionando correctamente 🚀" });
});

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/assignments', assignmentRoutes); //-- TODO: Integrarlo dentro cronogramas xd
app.use('/api/tutorias', tutoriasRoutes);
app.use('/api/verificador', verificadorRoutes);
app.use('/api/cronogramas', cronogramasRoutes); //-- TODO: Integrarlo dentro de admin 

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

