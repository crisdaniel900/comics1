import { body, param, validationResult } from 'express-validator'
import { BadRequestError, NotFoundError, UnauthorizedError } from '../Errors/customErrors.js'
import { PRODUCT_CATEGORY, POST_CATEGORY, POST_TYPE } from '../Utils/Constants.js'
import { supabase } from '../Utils/supabaseClient.js';

const withValidationErrors = (validateValues) =>{
    return [validateValues, (req, res, next) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            const errorMessages = errors.array().map((error) => error.msg);
            if(errorMessages[0].startsWith('no product')){
                throw new NotFoundError(errorMessages)
            }
            if(errorMessages[0].startsWith('not authorized')){
                throw new UnauthorizedError('not authorized to access this route')
            }
            throw new BadRequestError(errorMessages);
        }
        next();
    }]
}

export const validateProductInput = withValidationErrors([
    body('title').notEmpty().withMessage('title is required')
    .isLength({max: 30}).withMessage('Maximo de caracteres alcanzado'),
    body('price').notEmpty().withMessage('price is required'),
    body('stock').notEmpty().withMessage('stock is required')
    .isInt({ min: 0 }).withMessage('stock must be a non-negative integer'),
    body('image').notEmpty().withMessage('image is required'),
    body('category').isIn(Object.values(PRODUCT_CATEGORY)).withMessage('invalid category value'),
    body('artistWriter').notEmpty().withMessage('artist/writer is required'),
    body('coverArtist').notEmpty().withMessage('cover artist is required'),
    body('publisher').notEmpty().withMessage('publisher is required'),
    body('countryManufacture').notEmpty().withMessage('country manufacture is required'),
    body('language').notEmpty().withMessage('language is required'),
    body('style').notEmpty().withMessage('style is required'),
    body('genre').notEmpty().withMessage('genre is required'),
    body('description').notEmpty().withMessage('description is required'),
    body('format').notEmpty().withMessage('format is required'),
    body('type').notEmpty().withMessage('type is required'),
]);

export const validateProductUpdateInput = withValidationErrors([
    body('title').notEmpty().withMessage('title is required')
    .isLength({max: 30}).withMessage('Maximo de caracteres alcanzado'),
    body('price').notEmpty().withMessage('price is required'),
    body('stock').notEmpty().withMessage('stock is required')
    .isInt({ min: 0 }).withMessage('stock must be a non-negative integer'),
    body('image').optional().notEmpty().withMessage('image cannot be empty if provided'),
    body('category').isIn(Object.values(PRODUCT_CATEGORY)).withMessage('invalid category value'),
    body('artistWriter').notEmpty().withMessage('artist/writer is required'),
    body('coverArtist').notEmpty().withMessage('cover artist is required'),
    body('publisher').notEmpty().withMessage('publisher is required'),
    body('countryManufacture').notEmpty().withMessage('country manufacture is required'),
    body('language').notEmpty().withMessage('language is required'),
    body('style').notEmpty().withMessage('style is required'),
    body('genre').notEmpty().withMessage('genre is required'),
    body('description').notEmpty().withMessage('description is required'),
    body('format').notEmpty().withMessage('format is required'),
    body('type').notEmpty().withMessage('type is required'),
]);

export const validatePostInput = withValidationErrors([
  body('title').notEmpty().withMessage('Titulo requerido')
  .isLength({max: 100}).withMessage('Maximo de caracteres alcanzado'),
  body('content').notEmpty().withMessage('Cuerpo requerido'),
  body('type').isIn(Object.values(POST_TYPE)).withMessage('invalid post value'),
  body('category').isIn(Object.values(POST_CATEGORY)).withMessage('invalid category value'),
]);



export const validateCommentInput = withValidationErrors([
  
  body('content').notEmpty().withMessage('Cuerpo requerido')
]);

export const validateIdParam = withValidationErrors([
    param('id').custom(async (value, { req }) => {
      if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) {
        throw new BadRequestError('invalid product id');
      }

      const { data: product, error } = await supabase
        .from('products')
        .select('id')
        .eq('id', value)
        .maybeSingle();

      if (error) throw error;
  
      if(!product) throw new NotFoundError(`no product with id ${value}`)
      
    })
  ])

  export const validatePostIdParam = withValidationErrors([
    param('id').custom(async (value, { req }) => {
      if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) {
        throw new BadRequestError('invalid post id');
      }

      const { data: post, error } = await supabase
        .from('posts')
        .select('id')
        .eq('id', value)
        .maybeSingle();

      if (error) throw error;
  
      if(!post) throw new NotFoundError(`no product with id ${value}`)
      
    })
  ])

  export const validateRegisterInput = withValidationErrors([

    body('name').notEmpty().withMessage('name is required'),
    body('username').notEmpty().withMessage('username is required'),
    body('email').notEmpty().withMessage('email is required').isEmail()
    .withMessage('invalid email format').custom(async(email) => {
      const { data: user, error } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (error) throw error;

      if(user){
        throw new BadRequestError('email already exists')
      }
  
    }),
    body('password').notEmpty().withMessage('password is required')
    .isLength({min:8}).withMessage('password must be at least 8 characters long '),
    body('address').notEmpty().withMessage('address is required'),
    body('lastName').notEmpty().withMessage('last name is required')
  ])

  export const validateLoginInput = withValidationErrors([

    body('email').notEmpty().withMessage('email is required').isEmail()
    .withMessage('invalid email format'),
    body('password').notEmpty().withMessage('password is required')
  ])

  export const validateUpdateUserInput = withValidationErrors([
    body('name').notEmpty().withMessage('name is required'),
    body('email').notEmpty().withMessage('email is required').isEmail()
    .withMessage('invalid email format').custom(async(email, { req }) => {
      const { data: user, error } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (error) throw error;

      if(user && user.id !== req.user.userId){
        throw new BadRequestError('email already exists')
      }
  
    }),
   
    body('location').notEmpty().withMessage('location is required'),
    body('lastName').notEmpty().withMessage('last name is required')
  ])
  

