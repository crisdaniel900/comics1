import nodemailer from 'nodemailer';

const resendApiKey = process.env.RESEND_API_KEY;
const resendFrom = process.env.RESEND_FROM;

const smtpHost = process.env.SMTP_HOST;
const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const smtpFrom = process.env.SMTP_FROM || smtpUser;

const smtpTransporter = smtpHost && smtpUser && smtpPass
  ? nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    })
  : null;

export const sendPasswordResetEmail = async ({ to, name, resetUrl }) => {
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111;">
      <h2>Hola ${name || ''}</h2>
      <p>Recibimos una solicitud para restablecer tu contraseña.</p>
      <p><a href="${resetUrl}" target="_blank" rel="noreferrer">Haz clic aquí para crear una nueva contraseña</a></p>
      <p>Este enlace expira en 1 hora.</p>
    </div>
  `;

  if (resendApiKey) {
    if (!resendFrom) {
      throw new Error('Falta RESEND_FROM en .env');
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: resendFrom,
        to: [to],
        subject: 'Recuperar contraseña - Farbauti Comics',
        html,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Resend error: ${response.status} ${errorText}`);
    }

    return;
  }

  if (!smtpTransporter) {
    throw new Error('Correo no configurado. Define RESEND_API_KEY/RESEND_FROM o SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS.');
  }

  await smtpTransporter.sendMail({
    from: smtpFrom,
    to,
    subject: 'Recuperar contraseña - Farbauti Comics',
    html,
  });
};