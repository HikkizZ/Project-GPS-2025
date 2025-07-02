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

export async function sendLicenciaPermisoApprovedEmail({
    to,
    nombre,
    tipoSolicitud,
    fechaInicio,
    fechaFin,
    motivoRespuesta
}: {
    to: string;
    nombre: string;
    tipoSolicitud: string;
    fechaInicio: string;
    fechaFin: string;
    motivoRespuesta?: string;
}) {
    const fechaInicioFormateada = new Date(fechaInicio).toLocaleDateString('es-CL');
    const fechaFinFormateada = new Date(fechaFin).toLocaleDateString('es-CL');
    
    const mailOptions = {
        from: 'S.G. Lamas <equipo.sglamas@gmail.com>',
        to,
        subject: `Tu solicitud de ${tipoSolicitud.toLowerCase()} ha sido APROBADA`,
        html: `
            <h2>¡Buenas noticias!</h2>
            <p>Hola <b>${nombre}</b>,</p>
            <p>Te informamos que tu solicitud de <b>${tipoSolicitud.toLowerCase()}</b> ha sido <span style="color: #28a745; font-weight: bold;">APROBADA</span>.</p>
            
            <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #28a745; margin: 15px 0;">
                <h4 style="color: #28a745; margin-top: 0;">Detalles de tu solicitud:</h4>
                <ul style="margin-bottom: 0;">
                    <li><b>Tipo:</b> ${tipoSolicitud}</li>
                    <li><b>Fecha de inicio:</b> ${fechaInicioFormateada}</li>
                    <li><b>Fecha de fin:</b> ${fechaFinFormateada}</li>
                    ${motivoRespuesta ? `<li><b>Observaciones:</b> ${motivoRespuesta}</li>` : ''}
                </ul>
            </div>
            
            <p>Tu solicitud ya está activa en el sistema. Puedes revisar el estado de todas tus solicitudes iniciando sesión en la plataforma.</p>
            <br/>
            <p>Si tienes dudas, contacta a Recursos Humanos.</p>
            <hr/>
            <small>Este es un mensaje automático, por favor no respondas a este correo.</small>
        `
    };
    await transporter.sendMail(mailOptions);
}

export async function sendLicenciaPermisoRejectedEmail({
    to,
    nombre,
    tipoSolicitud,
    fechaInicio,
    fechaFin,
    motivoRechazo
}: {
    to: string;
    nombre: string;
    tipoSolicitud: string;
    fechaInicio: string;
    fechaFin: string;
    motivoRechazo: string;
}) {
    const fechaInicioFormateada = new Date(fechaInicio).toLocaleDateString('es-CL');
    const fechaFinFormateada = new Date(fechaFin).toLocaleDateString('es-CL');
    
    const mailOptions = {
        from: 'S.G. Lamas <equipo.sglamas@gmail.com>',
        to,
        subject: `Tu solicitud de ${tipoSolicitud.toLowerCase()} ha sido RECHAZADA`,
        html: `
            <h2>Información sobre tu solicitud</h2>
            <p>Hola <b>${nombre}</b>,</p>
            <p>Te informamos que tu solicitud de <b>${tipoSolicitud.toLowerCase()}</b> ha sido <span style="color: #dc3545; font-weight: bold;">RECHAZADA</span>.</p>
            
            <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #dc3545; margin: 15px 0;">
                <h4 style="color: #dc3545; margin-top: 0;">Detalles de la solicitud:</h4>
                <ul>
                    <li><b>Tipo:</b> ${tipoSolicitud}</li>
                    <li><b>Fecha de inicio solicitada:</b> ${fechaInicioFormateada}</li>
                    <li><b>Fecha de fin solicitada:</b> ${fechaFinFormateada}</li>
                </ul>
                <div style="background-color: #fff3cd; padding: 10px; border-radius: 4px; margin-top: 10px;">
                    <p style="margin: 0;"><b>Motivo del rechazo:</b></p>
                    <p style="margin: 5px 0 0 0;">${motivoRechazo}</p>
                </div>
            </div>
            
            <p>Si tienes dudas sobre esta decisión o necesitas más información, te recomendamos contactar directamente a Recursos Humanos.</p>
            <br/>
            <p>Puedes revisar el estado de todas tus solicitudes iniciando sesión en la plataforma.</p>
            <hr/>
            <small>Este es un mensaje automático, por favor no respondas a este correo.</small>
        `
    };
    await transporter.sendMail(mailOptions);
} 