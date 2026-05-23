import { StatusCodes } from 'http-status-codes';
import { UnauthenticatedError } from '../Errors/customErrors.js';
import { supabase } from '../Utils/supabaseClient.js';
import { hashPassword, comparePassword } from '../Utils/passwordUtils.js';
import crypto from 'crypto';

const getUserIdFromRequest = async (req, email) => {
  if (req.user?.userId) return req.user.userId;

  if (!email) return null;

  const { data: user, error } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  if (error || !user) return null;

  return user.id;
};

// Cambiar contraseña desde perfil (usuario logueado)
export const changePasswordLocally = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      return res.status(StatusCodes.BAD_REQUEST).json({ msg: 'Las contraseñas no coinciden' });
    }

    if (newPassword.length < 8) {
      return res.status(StatusCodes.BAD_REQUEST).json({ msg: 'La contraseña debe tener al menos 8 caracteres' });
    }

    // Obtener usuario actual
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('password')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      throw new UnauthenticatedError('Usuario no encontrado');
    }

    // Validar contraseña actual
    const isCurrentPasswordCorrect = await comparePassword(currentPassword, user.password);
    if (!isCurrentPasswordCorrect) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ msg: 'Contraseña actual incorrecta' });
    }

    // Hashear nueva contraseña
    const hashedPassword = await hashPassword(newPassword);

    // Actualizar contraseña
    const { error: updateError } = await supabase
      .from('users')
      .update({ password: hashedPassword })
      .eq('id', userId);

    if (updateError) throw updateError;

    res.status(StatusCodes.OK).json({ msg: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: error?.message || 'Error al cambiar la contraseña',
    });
  }
};

// Obtener preguntas de seguridad
export const getSecurityQuestions = async (req, res) => {
  try {
    const { data: questions, error } = await supabase
      .from('security_questions')
      .select('id, question')
      .order('id');

    if (error) throw error;

    res.status(StatusCodes.OK).json({ questions });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: 'Error al obtener preguntas de seguridad',
    });
  }
};

// Guardar respuestas de seguridad (en registro)
export const saveSecurityAnswers = async (req, res) => {
  try {
    const { answers, email } = req.body; // { questionId: answer, etc }
    const userId = await getUserIdFromRequest(req, email);

    if (!userId) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ msg: 'authentication invalid' });
    }

    // Borrar respuestas anteriores
    await supabase
      .from('user_security_answers')
      .delete()
      .eq('user_id', userId);

    // Guardar nuevas respuestas (hasheadas)
    const answersToInsert = Object.entries(answers).map(([questionId, answer]) => ({
      user_id: userId,
      question_id: parseInt(questionId),
      answer_hash: crypto.createHash('sha256').update(answer.toLowerCase().trim()).digest('hex'),
    }));

    const { error } = await supabase
      .from('user_security_answers')
      .insert(answersToInsert);

    if (error) throw error;

    res.status(StatusCodes.OK).json({ msg: 'Respuestas de seguridad guardadas' });
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: 'Error al guardar respuestas de seguridad',
    });
  }
};

// Validar respuestas de seguridad y cambiar contraseña
export const resetPasswordWithSecurityAnswers = async (req, res) => {
  try {
    const { email, answers, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      return res.status(StatusCodes.BAD_REQUEST).json({ msg: 'Las contraseñas no coinciden' });
    }

    // Obtener usuario
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (userError || !user) {
      return res.status(StatusCodes.OK).json({ msg: 'Si el correo existe, podrás cambiar tu contraseña' });
    }

    // Validar respuestas contra el hash guardado
    const { data: savedAnswers, error: answersError } = await supabase
      .from('user_security_answers')
      .select('question_id, answer_hash')
      .eq('user_id', user.id);

    if (answersError || !savedAnswers || savedAnswers.length === 0) {
      return res.status(StatusCodes.OK).json({ msg: 'No se pueden validar las respuestas' });
    }

    if (savedAnswers.length < 3) {
      return res.status(StatusCodes.BAD_REQUEST).json({ msg: 'No hay suficientes preguntas configuradas' });
    }

    // Validar cada respuesta
    for (const saved of savedAnswers) {
      const userAnswer = answers?.[saved.question_id];

      if (!userAnswer || !userAnswer.trim()) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ msg: 'Debes responder las 3 preguntas' });
      }

      const userAnswerHash = crypto.createHash('sha256').update(userAnswer.toLowerCase().trim()).digest('hex');
      if (userAnswerHash !== saved.answer_hash) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ msg: 'Una o más respuestas son incorrectas' });
      }
    }

    // Actualizar contraseña
    const hashedPassword = await hashPassword(newPassword);
    const { error: updateError } = await supabase
      .from('users')
      .update({ password: hashedPassword })
      .eq('id', user.id);

    if (updateError) throw updateError;

    res.status(StatusCodes.OK).json({ msg: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: 'Error al cambiar la contraseña',
    });
  }
};

// Generar códigos de recuperación
export const generateRecoveryCodes = async (req, res) => {
  try {
    const { email } = req.body;
    const userId = await getUserIdFromRequest(req, email);

    if (!userId) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ msg: 'authentication invalid' });
    }

    // Borrar códigos anteriores
    await supabase
      .from('recovery_codes')
      .delete()
      .eq('user_id', userId);

    // Generar 5 códigos
    const codes = Array.from({ length: 5 }, () => {
      return crypto.randomBytes(4).toString('hex').toUpperCase();
    });

    const codesToInsert = codes.map(code => ({
      user_id: userId,
      code,
    }));

    const { error } = await supabase
      .from('recovery_codes')
      .insert(codesToInsert);

    if (error) throw error;

    res.status(StatusCodes.OK).json({
      msg: 'Códigos de recuperación generados',
      codes, // Mostrar solo en este momento
    });
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: 'Error al generar códigos de recuperación',
    });
  }
};

// Validar código de recuperación y cambiar contraseña
export const resetPasswordWithRecoveryCode = async (req, res) => {
  try {
    const { email, code, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      return res.status(StatusCodes.BAD_REQUEST).json({ msg: 'Las contraseñas no coinciden' });
    }

    // Obtener usuario
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (userError || !user) {
      return res.status(StatusCodes.OK).json({ msg: 'Si el correo existe, podrás cambiar tu contraseña' });
    }

    // Validar código
    const { data: recoveryCode, error: codeError } = await supabase
      .from('recovery_codes')
      .select('id')
      .eq('user_id', user.id)
      .eq('code', code.toUpperCase())
      .eq('used', false)
      .single();

    if (codeError || !recoveryCode) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ msg: 'Código de recuperación inválido o ya utilizado' });
    }

    // Marcar código como usado
    await supabase
      .from('recovery_codes')
      .update({ used: true, used_at: new Date().toISOString() })
      .eq('id', recoveryCode.id);

    // Actualizar contraseña
    const hashedPassword = await hashPassword(newPassword);
    const { error: updateError } = await supabase
      .from('users')
      .update({ password: hashedPassword })
      .eq('id', user.id);

    if (updateError) throw updateError;

    res.status(StatusCodes.OK).json({ msg: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: 'Error al cambiar la contraseña',
    });
  }
};
