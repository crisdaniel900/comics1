import { Router } from 'express';
import {
    getAllProducts,
    getProduct,
    getTrendingProducts,
    getRelatedProducts,
    getNewProducts,
    addProduct,
    updateProduct,
    deleteProduct
} from '../Controllers/productController.js'
import { validateProductInput, validateIdParam, validateProductUpdateInput } from '../Middleware/validationMiddleware.js';
import { authorizePermissions, authenticateUser} from '../Middleware/authMiddleware.js';
import upload from '../Middleware/multerMiddleware.js';
import { checkImageUpload, checkImageUploadOptional } from '../Middleware/multerMiddleware.js';


const router = Router()

router.get('/allproducts', getAllProducts);
router.get('/trending', getTrendingProducts);
router.get('/related', getRelatedProducts);
router.get('/newproducts', getNewProducts);

router.post('/addproduct', upload.single('image'), checkImageUpload, validateProductInput, authenticateUser, authorizePermissions('admin'), addProduct);
router
    .route('/:id')
    .get(validateIdParam, getProduct)
    .patch(upload.single('image'), checkImageUploadOptional, validateProductUpdateInput, validateIdParam, authenticateUser, authorizePermissions('admin'), updateProduct)
    .delete(validateIdParam, authenticateUser, authorizePermissions('admin'), deleteProduct)


export default router
