const db = require("../db/pool");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { sendEmailResetCode, resendEmailResetCode } = require('../services/mailService');

//Funcion para generar codigo de 6 digitos
const generateCode = () => {
    return crypto.randomInt(100000, 999999).toString();
};

//Enviamos codigo de recuperación:
const sendResetCode = async(req, res) =>{
    const {email} = req.body;

    try{
        //Verificar si el usuario existe
        const userQuery = await db.query(
            'SELECT id, first_name, email FROM users WHERE email = $1',
            [email]
        );

        if(userQuery.rows.length === 0){
            //Por seguridad, no revelamos si el usuario existe o no
            return res.status(200).json({
                message: 'Si el correo está registrado, recibirás un código en breve.'
            });
        }

        const user = userQuery.rows[0];

        //Generamos codigo
        const resetCode = generateCode();

        //Expiración de 30 minutos
        const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

        //Eliminamos codigos anteriores del mismo usuario
        await db.query(
            'DELETE FROM password_reset_tokens WHERE user_id = $1',
            [user.id]
        );

        //Guardamos codigo en la bdd
        await db.query(
            'INSERT INTO password_reset_tokens (user_id, code, expires_at) VALUES ($1, $2, $3)',
            [user.id, resetCode, expiresAt]
        );

        //Enviamos correo
        await sendEmailResetCode(email, resetCode, `${user.first_name} + ${user.last_name}`);

        res.status(200).json({
            message: 'Si el correo está registrado, recibirás un código en breve.',
            email: email
        });

    }catch(error){
        console.error('Error en sendResetCode:',error);
        res.status(500).json({message: 'Error Interno del servidor'});
    }
};

//Verificar codigo
const verifyResetCode = async(req, res) =>{
    const {email, code} = req.body;

    try{
        //Buscamos usuario
        const userQuery = await db.query(
            'SELECT id FROM users WHERE email = $1',
            [email]
        );
        if(userQuery.rows.length === 0){
            return res.status(400).json({message: 'Código Inválido'});
        }

        const user = userQuery.rows[0];

        //Buscar codigo valido
        const tokenQuery = await db.query(
            `SELECT * FROM password_reset_tokens 
            WHERE user_id = $1 AND code = $2 AND used = false 
            AND expires_at > NOW()`,
            [user.id, code]
        );

        if(tokenQuery.rows.length === 0){
            return res.status(400).json({message: "Codigo inválido o expirado"});
        }

        //Marcar código cómo usado
        await db.query(
            'UPDATE password_reset_tokens SET used = true, used_at = NOW() WHERE id = $1',
            [tokenQuery.rows[0].id]
        );

        res.status(200).json({
            message: 'Código verificado correctamente',
            valid: true
        });
    
    }catch(error){
        console.error('Error en VerifyResetCode: ',error);
        res.status(500).json({message: 'Error interno del servidor'});
    }
};

//Reenviar Codigo
const resendResetCode = async(req, res) =>{
    const {email} = req.body;

    try{
        //Verificar si el usuario existe
        const userQuery = await db.query(
            'SELECT id, first_name FROM users WHERE email = $1',
            [email]
        );

        if(userQuery.rows.length === 0){
            return res.status(200).json({
                message: 'Si el correo está registrado, recibirás un nuevo código.'
            });
        }

        const user = userQuery.rows[0];
        
        // Generar nuevo Codigo
        const resetCode = generateCode();
        const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

        // Actualizamos o insertamos nuevo codigo
        await db.query(
            `UPDATE password_reset_tokens
            SET code = $1, expires_at = $2, used = false, used_at = NULL
            WHERE user_id = $3`,
            [resetCode, expiresAt, user.id]
        );

        // Enviar correo
        await resendEmailResetCode(email, resetCode, `${user.first_name} + ${user.last_name}`);

        res.status(200).json({
            message: 'Se ha enviado un nuevo código',
            email: email
        });
    
    }catch(error){
        console.error('Error en resendResetCode: ',error);
        res.status(500).json({message: 'Error interno del servidor'});
    }
};

//Reestabler la contraseña
const resetPassword = async(req, res) => {
    const {email, password } = req.body;

    try{
        //Verificar si el usuario existe
        const userQuery = await db.query(
            'SELECT id FROM users WHERE email = $1',
            [email]
        );

        if (userQuery.rows.length === 0){
            return res.status(400).json({message: 'Usuario no encontrado'});
        }

        const user = userQuery.rows[0];

        //Hashear nueva contraseña
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        //Actualizamos contraseña del usuario
        await db.query(
            'UPDATE users SET password_hash = $1 WHERE id = $2',
            [hashedPassword, user.id]
        );

        //Invalidar todos los tokens de recuperación del usuario
        await db.query(
            'DELETE FROM password_reset_tokens WHERE user_id = $1',
            [user.id]
        );

        res.status(200).json({
            message: 'Contraseña actualizada correctamente'
        });
    
    }catch(error){
        console.error('Error en resetPassword: ', error);
        res.status(500).json({message: 'Error interno del servidor'});
    }
};

module.exports = {
    sendResetCode,
    verifyResetCode,
    resendResetCode,
    resetPassword
}