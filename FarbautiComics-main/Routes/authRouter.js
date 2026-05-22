import { Router } from 'express';
import { login, logout, register, requestPasswordReset, resetPassword } from '../Controllers/authControllers.js';
import { validateLoginInput, validatePasswordResetInput, validatePasswordResetRequestInput, validateRegisterInput } from '../Middleware/validationMiddleware.js';
import { fetchUser } from '../Middleware/authMiddleware.js';

const router = Router();

router.post('/register', validateRegisterInput, register);
router.post('/login', validateLoginInput, login);
router.post('/request-password-reset', validatePasswordResetRequestInput, requestPasswordReset);
router.post('/reset-password', validatePasswordResetInput, resetPassword);
router.get('/logout', logout);
router.get('/fetchUser', fetchUser)

export default router
