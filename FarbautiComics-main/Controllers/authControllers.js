import { StatusCodes } from "http-status-codes";
import { hashPassword, comparePassword } from '../Utils/passwordUtils.js'
import { UnauthenticatedError } from '../Errors/customErrors.js'
import { createJWT } from '../Utils/tokenUtils.js'
import { supabase } from '../Utils/supabaseClient.js';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '../Utils/mailUtils.js';

export const register = async (req, res) => {

    try {

        const { data: existingUser, error: existingUserError } = await supabase
            .from('users')
            .select('id')
            .eq('email', req.body.email)
            .maybeSingle();

        if (existingUserError) throw existingUserError;

        if(existingUser){
            return res.status(StatusCodes.BAD_REQUEST).json({msg: 'Correo ya registrado'})
        }

        const { count, error: countError } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true });

        if (countError) throw countError;

        const isFirstAccount = (count || 0) === 0;
        req.body.role = isFirstAccount ? 'admin' : 'user';

        const hashedPassword = await hashPassword(req.body.password);
        req.body.password = hashedPassword;

        const { data: lastUserSnake, error: lastUserSnakeError } = await supabase
            .from('users')
            .select('usermodel_id')
            .order('usermodel_id', { ascending: false })
            .limit(1)
            .maybeSingle();

        let newId = 1;

        if (!lastUserSnakeError && lastUserSnake?.usermodel_id) {
            newId = lastUserSnake.usermodel_id + 1;
        } else {
            const { data: lastUserLegacy, error: lastUserLegacyError } = await supabase
                .from('users')
                .select('user_model_id')
                .order('user_model_id', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (!lastUserLegacyError && lastUserLegacy?.user_model_id) {
                newId = lastUserLegacy.user_model_id + 1;
            } else if (lastUserSnakeError && lastUserSnakeError.code !== 'PGRST204' && lastUserSnakeError.code !== '42703') {
                throw lastUserSnakeError;
            } else if (lastUserLegacyError && lastUserLegacyError.code !== 'PGRST204' && lastUserLegacyError.code !== '42703') {
                throw lastUserLegacyError;
            }
        }

        const baseUserPayload = {
            name: req.body.name,
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
            address: req.body.address,
            role: req.body.role,
        };

        const userPayloadCandidates = [
            { ...baseUserPayload, usermodel_id: newId, last_name: req.body.lastName },
            { ...baseUserPayload, user_model_id: newId, last_name: req.body.lastName },
            { ...baseUserPayload, usermodel_id: newId },
            { ...baseUserPayload, user_model_id: newId },
            { ...baseUserPayload },
        ];

        let user = null;
        let createError = null;

        for (const payload of userPayloadCandidates) {
            const result = await supabase
                .from('users')
                .insert(payload)
                .select('*')
                .single();

            if (!result.error) {
                user = result.data;
                createError = null;
                break;
            }

            createError = result.error;

            const errorMessage = result.error?.message || '';
            const missingColumn = result.error?.code === 'PGRST204' || /does not exist|could not find/i.test(errorMessage);
            const schemaCacheIssue = result.error?.code === '42703';

            if (!missingColumn && !schemaCacheIssue) {
                break;
            }
        }

        if (!user) {
            throw createError;
        }

        const userModelId = user.usermodel_id ?? user.user_model_id ?? newId;

        res.status(StatusCodes.CREATED).json({
            msg: 'Usuario registrado correctamente',
            userModel_id: userModelId
        });
        
    } catch (error) {

        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: 'Error al registrar el usuario'});
        console.log(error)
        
    }


}

export const login = async (req, res) => {
    const { data: user, error } = await supabase
        .from('users')
        .select('id, role, password')
        .eq('email', req.body.email)
        .maybeSingle();

    if (error) throw error;

    if(!user) throw new UnauthenticatedError('invalid credentials')

    const isPasswordCorrect = await comparePassword(req.body.password, user.password);
    if(!isPasswordCorrect) throw new UnauthenticatedError('invalid credentials');

    const token = createJWT({userId:user.id, role:user.role});
    const oneDay = 1000 *60*60*24;

    res.cookie('token', token,{
        httpOnly:true,
        expires: new Date(Date.now() + oneDay),
        secure:process.env.NODE_ENV === 'production',
    })

    res.status(StatusCodes.OK).json({ msg: 'user logged in' })

}

export const logout = async (req, res) => {
    res.cookie('token', 'logout', {
        httpOnly:true,
        expires: new Date(Date.now())
    });

    res.status(StatusCodes.OK).json({ msg: 'user logged out'})
}

export const requestPasswordReset = async (req, res) => {
    try {
        const { data: user, error } = await supabase
            .from('users')
            .select('id, email, name')
            .eq('email', req.body.email)
            .maybeSingle();

        if (error) throw error;

        if (!user) {
            return res.status(StatusCodes.OK).json({ msg: 'Si el correo existe, recibirás un enlace para restablecer tu contraseña' });
        }

        // Intentar primero con Supabase Auth Admin (genera el enlace/magic link)
        try {
            const supabaseUrl = process.env.SUPABASE_URL;
            const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
            if (supabaseUrl && serviceKey) {
                const adminUrl = `${supabaseUrl.replace(/\/$/, '')}/auth/v1/admin/generate_link`;
                const resp = await fetch(adminUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        apikey: serviceKey,
                        Authorization: `Bearer ${serviceKey}`,
                    },
                    body: JSON.stringify({ email: user.email, type: 'recovery' }),
                });

                if (resp.ok) {
                    const body = await resp.json();
                    const link = body?.action_link || body?.link || body?.url || body?.actionUrl || body?.access_token;
                    if (link) {
                        await sendPasswordResetEmail({ to: user.email, name: user.name, resetUrl: link });
                        return res.status(StatusCodes.OK).json({ msg: 'Si el correo existe, recibirás un enlace para restablecer tu contraseña' });
                    }
                }
            }
        } catch (err) {
            console.log('Supabase admin generate_link failed:', err?.message || err);
            // continuar al flujo interno si falla
        }

        // Fallback: usar tabla interna y enviar por Resend/SMTP (ya implementado)
        const token = crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
        const expiresAt = new Date(Date.now() + 1000 * 60 * 60);

        const { error: deleteError } = await supabase
            .from('password_reset_tokens')
            .delete()
            .eq('user_id', user.id)
            .eq('used', false);

        if (deleteError) throw deleteError;

        const { error: tokenError } = await supabase
            .from('password_reset_tokens')
            .insert({
                user_id: user.id,
                token_hash: tokenHash,
                expires_at: expiresAt.toISOString(),
            });

        if (tokenError) throw tokenError;

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const resetUrl = `${frontendUrl}/reset-password?token=${token}&email=${encodeURIComponent(user.email)}`;

        await sendPasswordResetEmail({
            to: user.email,
            name: user.name,
            resetUrl,
        });

        res.status(StatusCodes.OK).json({ msg: 'Si el correo existe, recibirás un enlace para restablecer tu contraseña' });
    } catch (error) {
        console.log(error);

        if (error?.code === 'PGRST205') {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                msg: 'Falta crear la tabla password_reset_tokens en Supabase. Ejecuta supabase/schema.sql en tu base de datos.',
            });
        }

        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            msg: error?.message || 'No se pudo iniciar la recuperación de contraseña',
        });
    }
}

export const resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

        const { data: resetToken, error: tokenError } = await supabase
            .from('password_reset_tokens')
            .select('id, user_id, expires_at, used')
            .eq('token_hash', tokenHash)
            .maybeSingle();

        if (tokenError) throw tokenError;

        if (!resetToken || resetToken.used || new Date(resetToken.expires_at) < new Date()) {
            throw new UnauthenticatedError('token inválido o expirado');
        }

        const hashedPassword = await hashPassword(password);

        const { error: updateError } = await supabase
            .from('users')
            .update({ password: hashedPassword })
            .eq('id', resetToken.user_id);

        if (updateError) throw updateError;

        const { error: usedError } = await supabase
            .from('password_reset_tokens')
            .update({ used: true })
            .eq('id', resetToken.id);

        if (usedError) throw usedError;

        res.status(StatusCodes.OK).json({ msg: 'Contraseña actualizada correctamente' });
    } catch (error) {
        console.log(error);

        if (error?.code === 'PGRST205') {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                msg: 'Falta crear la tabla password_reset_tokens en Supabase. Ejecuta supabase/schema.sql en tu base de datos.',
            });
        }

        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            msg: error?.message || 'No se pudo cambiar la contraseña',
        });
    }
}