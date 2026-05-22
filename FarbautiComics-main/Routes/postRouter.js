import { Router } from 'express';
import {
    addPost,
    addComment,
    getAllComment,
    getAllPosts,
    getPost,
    votePost,
    downVotePost
} from '../Controllers/postControllers.js'
import { validateCommentInput, validatePostIdParam, validatePostInput } from '../Middleware/validationMiddleware.js';
import { authorizePermissions, authenticateUser} from '../Middleware/authMiddleware.js';
import upload from '../Middleware/multerMiddleware.js';
import { checkPostImageUpload } from '../Middleware/multerMiddleware.js';


const router = Router()

router.get('/allposts', getAllPosts);
router.get('/:id/allcomment', authenticateUser, getAllComment);
router.get('/:id', validatePostIdParam, authenticateUser, getPost);

router.post(
  '/addpost',
  authenticateUser,
  upload.single('image'),
  validatePostInput,
  checkPostImageUpload,
  addPost
);
router.post('/:id/addcomment',validateCommentInput, authenticateUser,   addComment);
router.post('/postvote/:id', authenticateUser, votePost)
router.post('/downvote/:id', authenticateUser, downVotePost)

export default router
