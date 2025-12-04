// src/services/mailService.js
const nodemailer = require('nodemailer');

let transporter;

async function createTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT), //|| 587,
      secure: process.env.MAIL_SECURE === 'true', // true only for 465
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
      }
    });
    // opcional: verificar conexión
    try {
      await transporter.verify();
      console.log('Mail transporter listo');
    } catch (err) {
      console.error('Error verificando transporter:', err);
    }
  }
  return transporter;
}


async function sendMail({ to, subject, text, html }) {
  const transporterInstance = await createTransporter();
  return transporter.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject,
    text,
    html,
  });
}

async function sendAdminApprovalEmail(adminEmail, pendingUserId) {
  const transporter = await createTransporter();
  const approvalLink = `${process.env.FRONTEND_URL}/aprobarRegistro/${pendingUserId}`;
  const info = await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: adminEmail,
    subject: 'Nueva solicitud de registro',
    html: `<p>Un usuario ha solicitado acceso al sistema:</p>
           <p>Nombre: <strong>${pendingUserId}</strong></p>
           <p>Haga click para aprobar: <a href="${approvalLink}">${approvalLink}</a></p>`
  });
  console.log('Admin email enviado:', info.messageId);
  return info;
}

async function sendUserActivationEmail(userEmail, userId) {
  const transporter = await createTransporter();
  const activationLink = `${process.env.FRONTEND_URL}/activarCuenta/${userId}`;
  const info = await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: userEmail,
    subject: 'Activación de cuenta',
    html: `<p>Tu cuenta ha sido aprobada por el administrador.</p>
           <p>Haz click aquí para activarla: <a href="${activationLink}">${activationLink}</a></p>`
  });
  console.log('User activation email enviado:', info.messageId);
  return info;
}

module.exports = {sendMail, sendAdminApprovalEmail, sendUserActivationEmail };
