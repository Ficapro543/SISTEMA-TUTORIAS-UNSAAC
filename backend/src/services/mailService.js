// src/services/mailService.js
const nodemailer = require('nodemailer');

let transporter;

async function createTransporter() {
  if (!transporter) {
    const host = (process.env.MAIL_HOST || process.env.EMAIL_HOST || '').trim();
    const user = (process.env.MAIL_USER || process.env.EMAIL_USER || '').trim();
    const pass = (process.env.MAIL_PASS || '').replace(/\s/g, '');
    const port = Number(process.env.MAIL_PORT || process.env.EMAIL_PORT);
    const secure = (process.env.MAIL_SECURE || process.env.EMAIL_SECURE) === 'true';

    transporter = nodemailer.createTransport({
      host: host,
      port: port,
      secure: secure,
      auth: {
        user: user,
        pass: pass
      }
    });

    try {
      if (host && host !== 'localhost') {
        await transporter.verify();
        console.log('✅ Mail transporter listo');
      } else {
        console.log('ℹ️ SMTP no configurado. Los correos se imprimirán en consola.');
        transporter = null;
      }
    } catch (err) {
      console.warn('⚠️ No se pudo conectar al SMTP. Verifica tus datos en el .env.', err.message);
      transporter = null;
    }
  }
  return transporter;
}

async function sendMailFallback(options) {
  console.log('--- ENVIANDO CORREO (Simulación/Fallback) ---');
  console.log(`De: ${options.from}`);
  console.log(`Para: ${options.to}`);
  console.log(`Asunto: ${options.subject}`);
  console.log(`Contenido:\n${options.html}`);
  console.log('---------------------------------------------');
  return { messageId: 'simulated-' + Date.now() };
}

async function sendAdminApprovalEmail(adminEmail, pendingUserId) {
  const transporter = await createTransporter();
  const approvalLink = `${process.env.FRONTEND_URL}/admin`; // Enlace directo al dashboard para el admin

  const mailOptions = {
    from: process.env.MAIL_FROM || process.env.EMAIL_FROM || 'no-reply@unsaac.edu.pe',
    to: adminEmail,
    subject: 'Nueva solicitud de registro',
    html: `
      <p>Un usuario ha solicitado acceso al sistema.</p>
      <p>ID de solicitud: <strong>${pendingUserId}</strong></p>
      <p>Revisar y aprobar en el dashboard: 
        <a href="${approvalLink}" target="_blank">${approvalLink}</a>
      </p>`
  };

  const info = transporter
    ? await transporter.sendMail(mailOptions)
    : await sendMailFallback(mailOptions);

  console.log('Admin email procesado:', info.messageId);
  return info;
}

async function sendUserActivationEmail(userEmail, token) {
  const transporter = await createTransporter();
  const activationLink = `${process.env.FRONTEND_URL}/login`; // Directo a login ya que se activará automáticamente

  const mailOptions = {
    from: process.env.MAIL_FROM || process.env.EMAIL_FROM || 'no-reply@unsaac.edu.pe',
    to: userEmail,
    subject: 'Cuenta activada - Acceso concedido',
    html: `
      <p>Tu cuenta ha sido aprobada por un administrador y ya está activa.</p>
      <p>Puedes iniciar sesión aquí:
        <a href="${activationLink}" target="_blank">${activationLink}</a>
      </p>`
  };

  const info = transporter
    ? await transporter.sendMail(mailOptions)
    : await sendMailFallback(mailOptions);

  console.log('User activation email procesado:', info.messageId);
  return info;
}

/* Funciones para recuperar contraseña*/
async function sendEmailResetCode(userEmail, resetCode, userName = 'Usuario') {
  const transporter = await createTransporter();
  
  const info = await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: userEmail,
    subject: '🔐 Código de recuperación de contraseña',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #2563eb; margin-bottom: 10px;">Recuperación de Contraseña</h2>
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="font-size: 14px; color: #4b5563; margin-bottom: 10px;">Tu código de verificación es:</p>
            <div style="font-size: 32px; font-weight: bold; letter-spacing: 10px; color: #2563eb; padding: 15px; background-color: white; border-radius: 8px; display: inline-block;">
              ${resetCode}
            </div>
          </div>
        </div>
        
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 5px 0; font-size: 14px;"><strong>Hola ${userName},</strong></p>
          <p style="margin: 10px 0; font-size: 14px; color: #4b5563;">
            Has solicitado restablecer tu contraseña. Usa el código de arriba para verificar tu identidad.
          </p>
          <p style="margin: 10px 0; font-size: 14px; color: #4b5563;">
            Este código es válido por <strong>30 minutos</strong>.
          </p>
        </div>
        
        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="font-size: 12px; color: #6b7280; margin: 5px 0;">
            <strong>⚠️ Importante:</strong>
          </p>
          <ul style="font-size: 12px; color: #6b7280; padding-left: 20px; margin: 10px 0;">
            <li>No compartas este código con nadie</li>
            <li>Si no solicitaste este código, ignora este mensaje</li>
            <li>El código solo puede usarse una vez</li>
          </ul>
        </div>
        
        <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #9ca3af;">
          <p>© ${new Date().getFullYear()} Sistema UNSAAC. Todos los derechos reservados.</p>
          <p>Este es un correo automático, por favor no responder.</p>
        </div>
      </div>
    `,
    // Versión de texto plano para clientes de email que no soportan HTML
    text: `CÓDIGO DE RECUPERACIÓN - SISTEMA UNSAAC

Hola ${userName},

Has solicitado restablecer tu contraseña. 
Tu código de verificación es: ${resetCode}

Este código es válido por 30 minutos.

⚠️ IMPORTANTE:
- No compartas este código con nadie
- Si no solicitaste este código, ignora este mensaje
- El código solo puede usarse una vez

© ${new Date().getFullYear()} Sistema UNSAAC. Todos los derechos reservados.
Este es un correo automático, por favor no responder.`
  });

  console.log(`Código de recuperación enviado a ${userEmail}:`, info.messageId);
  return info;
}

async function resendEmailResetCode(userEmail, resetCode, userName = 'Usuario') {
  const transporter = await createTransporter();
  
  const info = await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: userEmail,
    subject: '🔄 Nuevo código de recuperación',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #059669; margin-bottom: 10px;">Nuevo Código de Verificación</h2>
          <p style="color: #4b5563; margin-bottom: 20px;">Se ha generado un nuevo código a tu solicitud</p>
          
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="font-size: 14px; color: #4b5563; margin-bottom: 10px;">Tu nuevo código es:</p>
            <div style="font-size: 32px; font-weight: bold; letter-spacing: 10px; color: #059669; padding: 15px; background-color: white; border-radius: 8px; display: inline-block;">
              ${resetCode}
            </div>
          </div>
        </div>
        
        <div style="background-color: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 5px 0; font-size: 14px;"><strong>Hola ${userName},</strong></p>
          <p style="margin: 10px 0; font-size: 14px; color: #4b5563;">
            Has solicitado un nuevo código de verificación. Usa el código de arriba para continuar con el proceso de recuperación.
          </p>
          <p style="margin: 10px 0; font-size: 14px; color: #4b5563;">
            ⏰ Este código es válido por <strong>30 minutos</strong>.
          </p>
        </div>
        
        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="font-size: 12px; color: #6b7280; margin: 5px 0;">
            <strong>📝 Nota:</strong>
          </p>
          <ul style="font-size: 12px; color: #6b7280; padding-left: 20px; margin: 10px 0;">
            <li>El código anterior ya no es válido</li>
            <li>Este es tu código activo más reciente</li>
            <li>Si no reconoces esta actividad, contacta al administrador</li>
          </ul>
        </div>
        
        <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #9ca3af;">
          <p>© ${new Date().getFullYear()} Sistema UNSAAC. Todos los derechos reservados.</p>
          <p>Este es un correo automático, por favor no responder.</p>
        </div>
      </div>
    `,
    text: `NUEVO CÓDIGO DE RECUPERACIÓN - SISTEMA UNSAAC

Hola ${userName},

Has solicitado un nuevo código de verificación. 
Tu nuevo código es: ${resetCode}

Este código es válido por 30 minutos.

📝 NOTA:
- El código anterior ya no es válido
- Este es tu código activo más reciente
- Si no reconoces esta actividad, contacta al administrador

© ${new Date().getFullYear()} Sistema UNSAAC. Todos los derechos reservados.
Este es un correo automático, por favor no responder.`
  });

  console.log(`Nuevo código de recuperación enviado a ${userEmail}:`, info.messageId);
  return info;
}

module.exports = {
  sendAdminApprovalEmail,
  sendUserActivationEmail,
  sendEmailResetCode,
  resendEmailResetCode
};
