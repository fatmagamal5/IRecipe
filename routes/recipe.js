import express from 'express';
import {
    createRecipe,
    getAllRecipes,
    getRecipeById,
    updateRecipe,
    deleteRecipe
} from '../controllers/recipe.js';
import upload from '../middlewares/multer.js';

const router = express.Router();

// Accept any field that starts with instructionImage (dynamic fields)
router.post('/', upload.any(), createRecipe);
router.get('/', getAllRecipes);
router.get('/:id', getRecipeById);
router.put('/:id', updateRecipe);
router.delete('/:id', deleteRecipe);

export default router;
