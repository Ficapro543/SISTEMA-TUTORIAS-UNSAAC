# Sistema de Gestión de Tutorías - EPISS UNSAAC

Sistema web integral para la gestión, seguimiento y control de tutorías académicas de la Escuela Profesional de Ingeniería Informática y de Sistemas (EPISS) de la Universidad Nacional de San Antonio Abad del Cusco (UNSAAC).

Desarrollado por el Grupo 1 del Curso de Metodologías de Desarrollo de Software - 2025-II.

Docente: Mg. Carlos Ramon Quispe Onofre
Integrantes:
- Cabeza Huillca, Flavio Antony (211265).
- Castro Pari, Rayneld Fidel (231865).
- Estacio Medrano, Amilcar (200822).
- Mamani Flores, Natan (230970).
- Merma Ccarhuarupay, Adel Alejandro (231446).
- Polo Chura, Marco Rosauro (141632).


## 📋 Descripción

El proyecto tiene como objetivo digitalizar y optimizar el proceso de tutorías académicas, permitiendo a docentes (tutores), estudiantes (tutorados) y administrativos gestionar sesiones, asignaciones, reportes y seguimiento de manera eficiente y centralizada.

## 🚀 Tecnologías

El sistema está construido utilizando una arquitectura moderna y robusta:

### Frontend
- **Framework**: React + Vite
- **Lenguaje**: JavaScript (ES6+)
- **Estilos**: CSS Modules (Diseño modular y responsivo, inspirado en Tailwind)
- **Componentes UI**: Componentes personalizados (Shadcn UI-like)
- **Gestión de Estado**: React Hooks (useState, useEffect, useContext)
- **Ruteo**: React Router DOM

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Base de Datos**: PostgreSQL
- **Autenticación**: JWT (JSON Web Tokens)
- **Manejo de Archivos**: Multer (Almacenamiento en DB como BYTEA)
- **Seguridad**: bcrypt, cors, helmet

## 🛠️ Módulos Principales

### 1. Autenticación y Seguridad
- **Login Unificado**: Acceso diferenciado por roles (Administrador, Tutor, Estudiante, Verificador).
- **Recuperación de Contraseña**: Sistema mediante tokens y correo electrónico.
- **Gestión de Perfil**: Actualización de datos personales y contraseña.
- **Google Auth**: Integración para inicio de sesión con correos institucionales.

### 2. Módulo Administrador
- **Gestión de Usuarios**: Validación y aprobación de registros nuevos.
- **Asignación de Tutorados**: Distribución de estudiantes a docentes tutores.
- **Cronogramas**: Creación y gestión de horarios de tutoría.
- **Reportes**: Visualización histórica y reportes de cumplimiento.
- **Seguridad y Respaldo**:
    - **Backup Completo**: Exportación de base de datos y archivos a ZIP.
    - **Restauración**: Recuperación total del sistema desde un backup.

### 3. Módulo Tutor
- **Panel de Control**: Vista rápida de tutorados asignados.
- **Registro de Sesiones**: Formulario para registrar tutorías realizadas con evidencia (PDF).
- **Historial**: Consulta de sesiones pasadas y seguimiento.

### 4. Módulo Estudiante
- **Consulta**: Visualización de tutor asignado y horarios.
- **Historial**: Acceso a sus registros de tutoría.

### 5. Módulo Verificador
- **Auditoría**: Revisión del cumplimiento de tutorías por parte de los docentes.

## 📦 Instalación y Despliegue

### Requisitos Previos
- Node.js (v16+)
- PostgreSQL (v13+)

### Base de Datos
1. Crear una base de datos en PostgreSQL.
2. Ejecutar el script `backend/sql/create_tables.sql` para generar la estructura.

### Backend
\`\`\`bash
cd backend
npm install
# Configurar .env con credenciales de BD y JWT_SECRET
npm run dev
\`\`\`

### Frontend
\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`

## 👥 Autores y Contribuyentes

Desarrollado por el equipo 1 de **Metodología de Desarrollo de Software - 2025-II**.
Escuela Profesional de Ingeniería Informática y de Sistemas - UNSAAC.
