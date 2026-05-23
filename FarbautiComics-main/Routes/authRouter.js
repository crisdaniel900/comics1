import { Router } from 'express';
import { login, logout, register } from '../Controllers/authControllers.js';
import { validateLoginInput, validateRegisterInput } from '../Middleware/validationMiddleware.js';
import { fetchUser } from '../Middleware/authMiddleware.js';

const router = Router();

router.post('/register', validateRegisterInput, register);
router.post('/login', validateLoginInput, login);
router.get('/logout', logout);
router.get('/fetchUser', fetchUser)

export default router
