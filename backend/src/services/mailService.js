// src/services/mailService.js
const nodemailer = require('nodemailer');

let transporter;

async function createTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT),
      secure: process.env.MAIL_SECURE === 'true',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
      }
    });

    try {
      await transporter.verify();
      console.log('Mail transporter listo');
    } catch (err) {
      console.error('Error verificando transporter:', err);
    }
  }
  return transporter;
}

async function sendAdminApprovalEmail(adminEmail, pendingUserId) {
  const transporter = await createTransporter();
  const approvalLink = `${process.env.FRONTEND_URL}/solicitudes_registro/${pendingUserId}`;

  const info = await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: adminEmail,
    subject: 'Nueva solicitud de registro',
    html: `
      <p>Un usuario ha solicitado acceso al sistema.</p>
      <p>ID de solicitud: <strong>${pendingUserId}</strong></p>
      <p>Revisar y aprobar: 
        <a href="${approvalLink}" target="_blank">${approvalLink}</a>
      </p>`
  });

  console.log('Admin email enviado:', info.messageId);
  return info;
}

async function sendUserActivationEmail(userEmail, token) {
  const transporter = await createTransporter();
  const activationLink = `${process.env.FRONTEND_URL}/verificado/${token}`;

  const info = await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: userEmail,
    subject: 'Activación de cuenta',
    html: `
      <p>Tu cuenta ha sido aprobada por un administrador.</p>
      <p>Activa tu cuenta aquí:
        <a href="${activationLink}" target="_blank">${activationLink}</a>
      </p>`
  });

  console.log('User activation email enviado:', info.messageId);
  return info;
}

module.exports = {
  sendAdminApprovalEmail,
  sendUserActivationEmail
};
