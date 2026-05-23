import express from 'express';
import {
  changePasswordLocally,
  getSecurityQuestions,
  saveSecurityAnswers,
  resetPasswordWithSecurityAnswers,
  generateRecoveryCodes,
  resetPasswordWithRecoveryCode,
} from '../Controllers/securityController.js';
import { authenticateUser } from '../Middleware/authMiddleware.js';

const router = express.Router();

// Cambiar contraseña desde perfil (requiere autenticación)
router.post('/change-password', authenticateUser, changePasswordLocally);

// Obtener preguntas de seguridad (necesarias en registro)
router.get('/security-questions', getSecurityQuestions);

// Guardar respuestas de seguridad (durante registro)
router.post('/setup-security-answers', saveSecurityAnswers);

// Recuperar contraseña con preguntas de seguridad
router.post('/reset-password-security', resetPasswordWithSecurityAnswers);

// Generar códigos de recuperación (durante registro)
router.post('/generate-recovery-codes', generateRecoveryCodes);

// Recuperar contraseña con código de recuperación
router.post('/reset-password-recovery-code', resetPasswordWithRecoveryCode);

export default router;
