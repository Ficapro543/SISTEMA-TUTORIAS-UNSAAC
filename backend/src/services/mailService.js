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

async function sendAdminApprovalEmail(adminEmail, userName = 'Nuevo Usuario', userEmail) {
  const transporter = await createTransporter();
  const approvalLink = `${process.env.FRONTEND_URL}/dashboard`;
  
  // Colores según la paleta UNSAAC
  const primaryColor = '#1a365d'; // hsl(230 70% 20%)
  const secondaryColor = '#1e40af'; // hsl(220 60% 30%)
  const accentColor = '#d97706'; // hsl(45 70% 47%)
  const lightBg = '#f8fafc'; // hsl(210 20% 98%)

  const mailOptions = {
    from: process.env.MAIL_FROM || process.env.EMAIL_FROM || 'no-reply@unsaac.edu.pe',
    to: adminEmail,
    subject: '📋 Nueva solicitud de registro - Sistema de Tutorias UNSAAC',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background: ${lightBg};">
        <div style="text-align: center; margin-bottom: 20px; padding-bottom: 20px; border-bottom: 2px solid ${primaryColor};">
          <h2 style="color: ${primaryColor}; margin-bottom: 10px;">Nueva Solicitud de Registro</h2>
          <p style="color: ${secondaryColor}; font-size: 14px;">Sistema de Tutorias UNSAAC</p>
        </div>
        
        <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${accentColor};">
          <p style="margin: 5px 0; font-size: 14px;"><strong>Información del solicitante:</strong></p>
          <div style="margin: 15px 0; padding: 15px; background-color: #f1f5f9; border-radius: 6px;">
            <p style="margin: 5px 0; font-size: 14px;"><strong>Nombre:</strong> ${userName}</p>
            <p style="margin: 5px 0; font-size: 14px;"><strong>Email:</strong> ${userEmail}</p>
            <p style="margin: 5px 0; font-size: 14px;"><strong>Fecha de solicitud:</strong> ${new Date().toLocaleDateString('es-PE')}</p>
          </div>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <p style="margin-bottom: 15px; font-size: 14px; color: #4b5563;">
            El usuario ha solicitado acceso al sistema. Por favor, revisa la solicitud y asigna los roles correspondientes.
          </p>
          <a href="${approvalLink}" 
             style="display: inline-block; background-color: ${primaryColor}; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px;"
             target="_blank">
            Revisar en el Dashboard
          </a>
          <p style="margin-top: 10px; font-size: 12px; color: #6b7280;">
            O copia este enlace: ${approvalLink}
          </p>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="font-size: 12px; color: #6b7280; margin: 5px 0;">
            <strong>📌 Recordatorio:</strong>
          </p>
          <ul style="font-size: 12px; color: #6b7280; padding-left: 20px; margin: 10px 0;">
            <li>Verifica la información del solicitante antes de aprobar</li>
            <li>Asigna los roles apropiados según el perfil del usuario</li>
            <li>El usuario recibirá un correo de activación una vez aprobado</li>
          </ul>
        </div>
        
        <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #9ca3af; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p>© ${new Date().getFullYear()} Universidad Nacional de San Antonio Abad del Cusco. Todos los derechos reservados.</p>
          <p>Este es un correo automático del sistema, por favor no responder.</p>
        </div>
      </div>
    `,
    text: `NUEVA SOLICITUD DE REGISTRO - Sistema de Tutorias UNSAAC

Un usuario ha solicitado acceso al sistema:

Información del solicitante:
- Nombre: ${userName}
- Email: ${userEmail}
- Fecha de solicitud: ${new Date().toLocaleDateString('es-PE')}

Acción requerida:
Por favor, revisa la solicitud y asigna los roles correspondientes en el dashboard.

Enlace al dashboard: ${approvalLink}

Recordatorio:
- Verifica la información del solicitante antes de aprobar
- Asigna los roles apropiados según el perfil del usuario
- El usuario recibirá un correo de activación una vez aprobado

© ${new Date().getFullYear()} Universidad Nacional de San Antonio Abad del Cusco.
Este es un correo automático del sistema, por favor no responder.`
  };

  const info = transporter
    ? await transporter.sendMail(mailOptions)
    : await sendMailFallback(mailOptions);

  console.log('Admin approval email procesado:', info.messageId);
  return info;
}

async function sendUserActivationEmail(userEmail, token, userName = 'Usuario', approvedRoles = [], rejectedRoles = []) {
  const transporter = await createTransporter();
  const activationLink = `${process.env.FRONTEND_URL}/verificado/${token}`;
  
  // Colores según la paleta UNSAAC
  const primaryColor = '#1a365d'; // hsl(230 70% 20%)
  const secondaryColor = '#1e40af'; // hsl(220 60% 30%)
  const accentColor = '#d97706'; // hsl(45 70% 47%)
  const successColor = '#059669'; // Verde para éxito
  const warningColor = '#dc2626'; // Rojo para rechazados
  const lightBg = '#f8fafc'; // hsl(210 20% 98%)

  // Formatear roles aprobados
  const approvedRolesHTML = approvedRoles.length > 0 
    ? approvedRoles.map(role => `<li style="margin: 5px 0; padding: 8px 12px; background-color: #f0fdf4; border-radius: 4px; border-left: 3px solid ${successColor};"><span style="color: ${successColor};">✓</span> ${role}</li>`).join('')
    : '<li style="color: #6b7280; font-style: italic;">No se aprobaron roles</li>';

  // Formatear roles rechazados
  const rejectedRolesHTML = rejectedRoles.length > 0 
    ? rejectedRoles.map(role => `<li style="margin: 5px 0; padding: 8px 12px; background-color: #fef2f2; border-radius: 4px; border-left: 3px solid ${warningColor};"><span style="color: ${warningColor};">✗</span> ${role}</li>`).join('')
    : '<li style="color: #6b7280; font-style: italic;">No hay roles rechazados</li>';

  const mailOptions = {
    from: process.env.MAIL_FROM || process.env.EMAIL_FROM || 'no-reply@unsaac.edu.pe',
    to: userEmail,
    subject: '✅ Solicitud aprobada - Activa tu cuenta UNSAAC',
    html: 
    `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background: ${lightBg};">
        <div style="text-align: center; margin-bottom: 20px; padding-bottom: 20px; border-bottom: 2px solid ${successColor};">
          <h2 style="color: ${successColor}; margin-bottom: 10px;">¡Solicitud Aprobada!</h2>
          <p style="color: ${primaryColor}; font-size: 14px;">Universidad Nacional de San Antonio Abad del Cusco</p>
        </div>
        
        <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${successColor};">
          <p style="margin: 5px 0; font-size: 16px;"><strong>¡Hola ${userName}!</strong></p>
          <p style="margin: 10px 0; font-size: 14px; color: #4b5563;">
            Tu solicitud de acceso al sistema ha sido <strong>aprobada</strong> por el administrador.
          </p>
          
          <div style="margin: 20px 0; padding: 15px; background-color: #f0fdf4; border-radius: 6px;">
            <p style="margin: 0 0 10px 0; font-size: 14px; color: ${successColor};"><strong>✅ Roles aprobados:</strong></p>
            <ul style="margin: 0; padding-left: 20px; font-size: 14px;">
              ${approvedRolesHTML}
            </ul>
          </div>
          
          ${rejectedRoles.length > 0 ? `
          <div style="margin: 20px 0; padding: 15px; background-color: #fef2f2; border-radius: 6px;">
            <p style="margin: 0 0 10px 0; font-size: 14px; color: ${warningColor};"><strong>❌ Roles no aprobados:</strong></p>
            <ul style="margin: 0; padding-left: 20px; font-size: 14px;">
              ${rejectedRolesHTML}
            </ul>
            <p style="margin: 10px 0 0 0; font-size: 12px; color: #6b7280;">
              <em>Estos roles no estarán disponibles en tu cuenta.</em>
            </p>
          </div>
          ` : ''}
          
          <p style="margin: 15px 0; font-size: 14px; color: #4b5563;">
            Para completar el proceso, debes <strong>activar tu cuenta</strong> haciendo clic en el siguiente enlace:
          </p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${activationLink}" 
             style="display: inline-block; background-color: ${successColor}; color: white; padding: 14px 35px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 15px; margin-bottom: 15px;"
             target="_blank">
            🚀 Activar Mi Cuenta
          </a>
          <p style="margin-top: 10px; font-size: 12px; color: #6b7280;">
            Enlace de activación: ${activationLink}
          </p>
          <p style="margin-top: 5px; font-size: 11px; color: #9ca3af;">
            ⚠️ Este enlace expira en 72 horas
          </p>
        </div>
        
        <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 25px 0; border-left: 4px solid ${accentColor};">
          <p style="margin: 0; font-size: 14px; color: #92400e;">
            <strong>📝 Importante:</strong> Después de activar tu cuenta, podrás iniciar sesión con tu email y la contraseña que estableciste durante el registro.
          </p>
        </div>
        
        <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #9ca3af; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p>© ${new Date().getFullYear()} Universidad Nacional de San Antonio Abad del Cusco. Todos los derechos reservados.</p>
          <p>Este es un correo automático del sistema de gestión, por favor no responder.</p>
        </div>
      </div>
    `,
    text: `SOLICITUD APROBADA - ACTIVA TU CUENTA UNSAAC

    ¡Hola ${userName}!

    Tu solicitud de acceso al sistema ha sido APROBADA por el administrador.

    ✅ ROLES APROBADOS:
    ${approvedRoles.length > 0 ? approvedRoles.map(r => `• ✓ ${r}`).join('\n') : '• No se aprobaron roles'}

    ${rejectedRoles.length > 0 ? `
    ❌ ROLES NO APROBADOS:
    ${rejectedRoles.map(r => `• ✗ ${r}`).join('\n')}
    (Estos roles no estarán disponibles en tu cuenta)
    ` : ''}

    Para completar el proceso, debes ACTIVAR TU CUENTA haciendo clic en el siguiente enlace:

    ${activationLink}

    ⚠️ Este enlace expira en 72 horas

    📝 IMPORTANTE: Después de activar tu cuenta, podrás iniciar sesión con tu email y la contraseña que estableciste durante el registro.

    © ${new Date().getFullYear()} Universidad Nacional de San Antonio Abad del Cusco.
    Este es un correo automático del sistema de gestión, por favor no responder.  
    `
  };

  const info = transporter
    ? await transporter.sendMail(mailOptions)
    : await sendMailFallback(mailOptions);

  console.log('User activation email procesado:', info.messageId);
  return info;
}

async function sendUserRejectionEmail(userEmail, userName = 'Usuario') {
  const transporter = await createTransporter();
  
  // Colores según la paleta UNSAAC
  const primaryColor = '#1a365d'; // hsl(230 70% 20%)
  const secondaryColor = '#1e40af'; // hsl(220 60% 30%)
  const accentColor = '#d97706'; // hsl(45 70% 47%)
  const warningColor = '#dc2626'; // Rojo para rechazo
  const lightBg = '#f8fafc'; // hsl(210 20% 98%)

  const mailOptions = {
    from: process.env.MAIL_FROM || process.env.EMAIL_FROM || 'no-reply@unsaac.edu.pe',
    to: userEmail,
    subject: '❌ Solicitud de acceso no aprobada - Sistema de Tutorias UNSAAC',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background: ${lightBg};">
        <div style="text-align: center; margin-bottom: 20px; padding-bottom: 20px; border-bottom: 2px solid ${warningColor};">
          <h2 style="color: ${warningColor}; margin-bottom: 10px;">Solicitud No Aprobada</h2>
          <p style="color: ${primaryColor}; font-size: 14px;">Sistema de Tutorias UNSAAC</p>
        </div>
        
        <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${warningColor};">
          <p style="margin: 5px 0; font-size: 16px;"><strong>Hola ${userName},</strong></p>
          <p style="margin: 10px 0; font-size: 14px; color: #4b5563;">
            Lamentamos informarte que tu solicitud de acceso al <strong>Sistema de Tutorías UNSAAC</strong> <strong>no ha sido aprobada</strong>.
          </p>
          <p style="margin: 10px 0; font-size: 14px; color: #4b5563;">
            Después de revisar tu solicitud, el administrador ha determinado que no cumple con los criterios necesarios para acceder al sistema en este momento.
          </p>
        </div>
        
        <div style="background-color: #fef2f2; padding: 15px; border-radius: 8px; margin: 25px 0; border-left: 4px solid ${warningColor};">
          <div style="display: flex; align-items: center; margin-bottom: 10px;">
            <div style="background-color: ${warningColor}; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 10px;">
              !
            </div>
            <p style="margin: 0; font-size: 14px; color: ${warningColor};">
              <strong>Si crees que esto es un error</strong>
            </p>
          </div>
          <p style="margin: 10px 0 0 0; font-size: 13px; color: #991b1b;">
            Por favor contacta con el administrador del sistema para obtener más información o volver a solicitar acceso con información adicional.
          </p>
        </div>
        
        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="font-size: 12px; color: ${primaryColor}; margin: 5px 0; font-weight: bold;">
            📞 Contacto para consultas:
          </p>
          <ul style="font-size: 12px; color: #6b7280; padding-left: 20px; margin: 10px 0;">
            <li>Email: ${process.env.ADMIN_EMAIL || 'administracion.tutorias@unsaac.edu.pe'}</li>
            <li>Horario: Lunes a Viernes 8:00 AM - 4:00 PM</li>
            <li>Teléfono: (084) 123456</li>
          </ul>
        </div>
        
        <div style="margin-top: 25px; padding: 15px; background-color: #f3f4f6; border-radius: 8px;">
          <p style="margin: 0 0 10px 0; font-size: 13px; color: ${secondaryColor};">
            <strong>💡 Puedes solicitar acceso nuevamente si:</strong>
          </p>
          <ul style="font-size: 12px; color: #6b7280; padding-left: 20px; margin: 0;">
            <li>Tienes información adicional que respalde tu solicitud</li>
            <li>Tu situación ha cambiado</li>
            <li>Cuentas con la autorización correspondiente</li>
          </ul>
        </div>
        
        <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #9ca3af; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p>© ${new Date().getFullYear()} Universidad Nacional de San Antonio Abad del Cusco. Todos los derechos reservados.</p>
          <p>Este es un correo automático del sistema de tutorías, por favor no responder.</p>
        </div>
      </div>
    `,
    text: `SOLICITUD NO APROBADA - SISTEMA DE TUTORIAS UNSAAC

Hola ${userName},

Lamentamos informarte que tu solicitud de acceso al Sistema de Tutorías UNSAAC NO HA SIDO APROBADA.

Después de revisar tu solicitud, el administrador ha determinado que no cumple con los criterios necesarios para acceder al sistema en este momento.

⚠️ SI CREES QUE ESTO ES UN ERROR:
Por favor contacta con el administrador del sistema para obtener más información o volver a solicitar acceso con información adicional.

📞 CONTACTO PARA CONSULTAS:
• Email: ${process.env.ADMIN_EMAIL || 'administracion.tutorias@unsaac.edu.pe'}
• Horario: Lunes a Viernes 8:00 AM - 4:00 PM
• Teléfono: (084) 123456

💡 PUEDES SOLICITAR ACCESO NUEVAMENTE SI:
• Tienes información adicional que respalde tu solicitud
• Tu situación ha cambiado
• Cuentas con la autorización correspondiente

© ${new Date().getFullYear()} Universidad Nacional de San Antonio Abad del Cusco.
Este es un correo automático del sistema de tutorías, por favor no responder.`
  };

  const info = transporter
    ? await transporter.sendMail(mailOptions)
    : await sendMailFallback(mailOptions);

  console.log('User rejection email procesado:', info.messageId);
  return info;
}

/* Las funciones para recuperar contraseña se mantienen igual */
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
          <p>© ${new Date().getFullYear()} Sistema de Tutorias UNSAAC. Todos los derechos reservados.</p>
          <p>Este es un correo automático, por favor no responder.</p>
        </div>
      </div>
    `,
    // Versión de texto plano para clientes de email que no soportan HTML
    text: `CÓDIGO DE RECUPERACIÓN - Sistema de Tutorias UNSAAC

Hola ${userName},

Has solicitado restablecer tu contraseña. 
Tu código de verificación es: ${resetCode}

Este código es válido por 30 minutos.

⚠️ IMPORTANTE:
- No compartas este código con nadie
- Si no solicitaste este código, ignora este mensaje
- El código solo puede usarse una vez

© ${new Date().getFullYear()} Sistema de Tutorias UNSAAC. Todos los derechos reservados.
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
          <p>© ${new Date().getFullYear()} Sistema de Tutorias UNSAAC. Todos los derechos reservados.</p>
          <p>Este es un correo automático, por favor no responder.</p>
        </div>
      </div>
    `,
    text: `NUEVO CÓDIGO DE RECUPERACIÓN - Sistema de Tutorias UNSAAC

Hola ${userName},

Has solicitado un nuevo código de verificación. 
Tu nuevo código es: ${resetCode}

Este código es válido por 30 minutos.

📝 NOTA:
- El código anterior ya no es válido
- Este es tu código activo más reciente
- Si no reconoces esta actividad, contacta al administrador

© ${new Date().getFullYear()} Sistema de Tutorias UNSAAC. Todos los derechos reservados.
Este es un correo automático, por favor no responder.`
  });

  console.log(`Nuevo código de recuperación enviado a ${userEmail}:`, info.messageId);
  return info;
}

module.exports = {
  sendAdminApprovalEmail,
  sendUserActivationEmail,
  sendUserRejectionEmail,
  sendEmailResetCode,
  resendEmailResetCode
};