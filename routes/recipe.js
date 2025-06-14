import express from 'express';
import {
    createRecipe,
    getAllRecipes,
    getRecipeById,
    updateRecipe,
    deleteRecipe
} from '../controllers/recipe.js';
import { verifyToken } from '../middleware/auth.js';
import { upload } from '../middleware/multer.js';

const router = express.Router();

// Public routes
router.get('/', getAllRecipes);
router.get('/:id', getRecipeById);

// Protected routes
router.post('/', verifyToken, upload.any(), createRecipe);
router.put('/:id', verifyToken, upload.any(), updateRecipe);
router.delete('/:id', verifyToken, deleteRecipe);

export default router;
