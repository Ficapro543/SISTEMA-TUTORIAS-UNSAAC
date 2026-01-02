require('dotenv').config();
const {sendAdminApprovalEmail, 
  sendUserActivationEmail, 
  sendEmailResetCode, 
  resendEmailResetCode 
} = require('../src/services/mailService');

(async () => {
  try {

    // // 2️⃣ Correo de aprobación para admin
    // await sendAdminApprovalEmail("200822@unsaac.edu.pe", "usuario123","200822@unsaac.edu.pe");
    // console.log("Correo de aprobación para admin enviado exitosamente.");

    // // 3️⃣ Correo de activación para usuario
    // await sendUserActivationEmail("200822@unsaac.edu.pe", "sjkasdjsdw.sf213","usuario123",["administrador","tutor","verificador"]);
    // console.log("Correo de activación de usuario enviado exitosamente.");

    // // 4️⃣ Correo de codigo recuperacion contraseña
    await sendEmailResetCode("200822@unsaac.edu.pe","sjkasdjsdw.sf213", "usuario123");
    console.log("Correo de codigo para recuperacion contraseña enviado correctamente.");
   
    // 5️⃣ Correo de codigo recuperacion contraseña
    await resendEmailResetCode("200822@unsaac.edu.pe","xdddddddd", "usuario123");
    console.log("Correo de reenvio de codigo para recuperacion contraseña enviado correctamente.");
   
  } catch (err) {
    console.error("Error enviando correo:", err);
  }
})();
