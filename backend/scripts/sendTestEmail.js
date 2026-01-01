require('dotenv').config();
const { sendMail, sendAdminApprovalEmail, sendUserActivationEmail } = require('/src/services/mailService');

(async () => {
  try {
    // 1️⃣ Correo genérico de prueba
    await sendMail({
      to: "200822@unsaac.edu.pe",
      subject: "Prueba SMTP",
      text: "Hola, este es un correo de prueba enviado desde el backend 🚀"
    });
    console.log("Correo genérico enviado exitosamente.");

    // 2️⃣ Correo de aprobación para admin
    await sendAdminApprovalEmail("200822@unsaac.edu.pe", "usuario123");
    console.log("Correo de aprobación para admin enviado exitosamente.");

    // 3️⃣ Correo de activación para usuario
    await sendUserActivationEmail("200822@unsaac.edu.pe", "usuario123");
    console.log("Correo de activación de usuario enviado exitosamente.");

  } catch (err) {
    console.error("Error enviando correo:", err);
  }
})();
