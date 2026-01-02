const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../.env');
// Password provided by user: lumbreraRUN&&777
// We need to encode the password if it has special characters, but pg library usually handles it if it's in the connection string correctly.
// However, && might be interpreted by shell if not careful, but here it is a JS string.
// URI encoding the password is safer for connection strings.
const password = encodeURIComponent('lumbreraRUN&&777');
const newDbUrl = `DATABASE_URL=postgresql://postgres:${password}@localhost:5432/sistema_tutorias`;

try {
    let content = '';
    if (fs.existsSync(envPath)) {
        content = fs.readFileSync(envPath, 'utf8');
        // Replace existing DATABASE_URL line or add it
        if (content.match(/^DATABASE_URL=.*/m)) {
            content = content.replace(/^DATABASE_URL=.*/m, newDbUrl);
        } else {
            content = newDbUrl + '\n' + content;
        }
    } else {
        content = `${newDbUrl}
JWT_SECRET=tu_secreto_super_seguro_cambiar_en_produccion
JWT_REFRESH_SECRET=tu_secreto_refresh_super_seguro
PORT=4000
FRONTEND_URL=http://localhost:5173
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_contraseña_aplicacion
`;
    }

    fs.writeFileSync(envPath, content, 'utf8');
    console.log('✅ .env updated successfully with new credentials');
} catch (err) {
    console.error('❌ Error updating .env:', err);
}
