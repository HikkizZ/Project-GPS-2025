import nodemailer from 'nodemailer';

// Configuración del transporter (ajusta con tus credenciales reales)
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER || 'tucorreo@gmail.com',
        pass: process.env.SMTP_PASS || 'tu_contraseña',
    },
});

export async function sendCredentialsEmail({
    to,
    nombre,
    correoUsuario,
    passwordTemporal
}: {
    to: string;
    nombre: string;
    correoUsuario: string;
    passwordTemporal: string;
}) {
    const mailOptions = {
        from: 'S.G. Lamas <equipo.sglamas@gmail.com>',
        to,
        subject: 'Tus credenciales de acceso a S.G. Lamas',
        html: `
            <h2>¡Bienvenido/a a S.G. Lamas!</h2>
            <p>Hola <b>${nombre}</b>,</p>
            <p>Tu cuenta de acceso ha sido creada. Aquí tienes tus credenciales:</p>
            <ul>
                <li><b>Usuario:</b> ${correoUsuario}</li>
                <li><b>Contraseña temporal:</b> ${passwordTemporal}</li>
            </ul>
            <p>Por seguridad, te recomendamos cambiar tu contraseña después de iniciar sesión.</p>
            <br/>
            <p>Si tienes dudas, contacta a Recursos Humanos.</p>
            <hr/>
            <small>Este es un mensaje automático, por favor no respondas a este correo.</small>
        `
    };
    await transporter.sendMail(mailOptions);
} 