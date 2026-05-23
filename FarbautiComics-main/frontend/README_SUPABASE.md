Recuperación de contraseña con flujo propio

1) Variables de entorno del frontend (Vite):

VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

2) Variables de entorno del backend:

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_correo@gmail.com
SMTP_PASS=tu_app_password_de_gmail
SMTP_FROM=Farbauti Comics <tu_correo@gmail.com>
FRONTEND_URL=http://localhost:5175

3) En el dashboard de Supabase > Authentication > URL Configuration agrega:

http://localhost:5175/reset-password

4) Probar flujo:
- Ir a `/forgot-password`, ingresar email.
- Revisar correo enviado por el backend.
- Abrir enlace y cambiar contraseña en `/reset-password`.
- La nueva contraseña se guarda en la tabla `users` de Supabase.

Notas:
- No se usa Supabase Auth para este proceso.
- El formulario es de tu página.
- El correo solo manda el enlace.
- La contraseña se actualiza en tu base actual.
