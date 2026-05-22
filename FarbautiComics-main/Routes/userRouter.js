import { Router } from "express";
import { 
    getApplicationStats, 
    getCurrentUser, 
    updateUser,
    addFavorites,
    getFavorites,
    removeFavorites,
    addCart,
    getCart,
    removeCart,
    addRead,
    getRead,
    removeRead,
    addWishlist,
    getWishlist,
    removeWishlist,
    getRecommendedComics,
    userView,
    getAllUsers,
    getUserById,
    updateUserById,
    deleteUserById
} from "../Controllers/userController.js";
import { validateUpdateUserInput } from '../Middleware/validationMiddleware.js';
import { authorizePermissions } from '../Middleware/authMiddleware.js';

const router = Router()

router.get('/profile', getCurrentUser);
router.get('/admin/app-stats', authorizePermissions('admin'), getApplicationStats);
router.patch('/edit-profile', validateUpdateUserInput, updateUser);

router.post('/addtofavorites/:id', addFavorites);
router.get('/getfavorites', getFavorites);
router.post('/removefromfavorites/:id', removeFavorites);

router.post('/markasread/:id', addRead);
router.get('/getreadhistory', getRead);
router.post('/removefromread/:id', removeRead);

router.post('/addtowishlist/:id', addWishlist);
router.get('/getwishlist', getWishlist);
router.post('/removefromwishlist/:id', removeWishlist);

router.post('/addtocart', addCart);
router.get('/getcart', getCart);
router.delete('/removecart', removeCart);
router.post('/addview/:id', userView);
router.post('/recommend-products', getRecommendedComics)

// ── Admin Rutas para gestionar usuarios ────────────────────────────────
router.get('/', authorizePermissions('admin'), getAllUsers);
router.get('/:id', authorizePermissions('admin'), getUserById);
router.patch('/:id', authorizePermissions('admin'), updateUserById);
router.delete('/:id', authorizePermissions('admin'), deleteUserById);

export default router




