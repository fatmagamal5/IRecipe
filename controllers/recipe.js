import path from "path";
import Recipe from "../models/recipe.js";
import jwt from "jsonwebtoken";
import { logActivity } from '../utils/activityLogger.js';

export const createRecipe = async (req, res) => {
  try {
    // Parse JSON fields from multipart/form-data
    const body = req.body;
    const title = body.title;
    const servings = Number(body.servings);
    const prepTime = Number(body.prepTime);
    const cookTime = Number(body.cookTime);
    const ingredients = JSON.parse(body.ingredients || "[]");
    const instructions = JSON.parse(body.instructions || "[]");
    const categories = JSON.parse(body.categories || "[]");
    const nutrition = JSON.parse(body.nutrition || "{}");

    // Handle main recipe image (with upload.any())
    let imagePath = null;
    if (req.files) {
      const mainImage = req.files.find((f) => f.fieldname === "image");
      if (mainImage) {
        imagePath = "/img/recipes/" + mainImage.filename;
      }
    }

    // Handle instruction images (with upload.any())
    const instructionImages = {};
    if (req.files) {
      req.files.forEach((file) => {
        if (/^instructionImage\d+$/.test(file.fieldname)) {
          instructionImages[file.fieldname] = "/img/recipes/" + file.filename;
        }
      });
    }
    // Attach image path to each instruction if present
    instructions.forEach((inst, idx) => {
      const imgKey = `instructionImage${idx}`;
      if (inst.image === imgKey && instructionImages[imgKey]) {
        inst.image = instructionImages[imgKey];
      } else {
        inst.image = null;
      }
      inst.step = idx + 1;
      if (inst.timer) inst.timer = Number(inst.timer);
    });

    if (!title || title.trim().length === 0) {
      return res
        .status(400)
        .json({
          error: "Recipe title is required and must be a non-empty string.",
        });
    }

    if (!servings || servings < 1) {
      return res
        .status(400)
        .json({
          error:
            "Servings must be a positive number and cannot be less than 1.",
        });
    }

    if (!prepTime || prepTime < 0) {
      return res
        .status(400)
        .json({ error: "Preparation time must be a non-negative number." });
    }

    if (cookTime == null || cookTime === undefined || cookTime < 0) {
      return res
        .status(400)
        .json({ error: "Cooking time must be a non-negative number." });
    }

    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      return res
        .status(400)
        .json({ error: "Ingredients array is required and cannot be empty." });
    }

    for (let i = 0; i < ingredients.length; i++) {
      const ingredient = ingredients[i];
      if (!ingredient.name || !ingredient.quantity) {
        return res
          .status(400)
          .json({
            error: `Ingredient at index ${i} must have a valid name and quantity.`,
          });
      }
    }

    if (!Array.isArray(instructions) || instructions.length === 0) {
      return res
        .status(400)
        .json({ error: "Instructions array is required and cannot be empty." });
    }

    for (let i = 0; i < instructions.length; i++) {
      const instruction = instructions[i];

      if (typeof instruction.step !== "number" || instruction.step < 1) {
        return res
          .status(400)
          .json({
            error: `Instruction step at index ${i} must be a positive number.`,
          });
      }

      if (
        !instruction.description ||
        typeof instruction.description !== "string"
      ) {
        return res
          .status(400)
          .json({
            error: `Instruction description at index ${i} must be a valid string.`,
          });
      }
    }

    if (categories && !Array.isArray(categories)) {
      return res.status(400).json({ error: "Categories must be an array." });
    }

    const validCategories = [
      "breakfast",
      "lunch",
      "dinner",
      "snack",
      "dessert",
      "beverage",
      "soup",
      "salad",
      "appetizer",
      "main course",
      "side dish",
      "vegan",
      "vegetarian",
      "gluten-free",
    ];

    if (categories?.length) {
      const invalidCategory = categories.find(
        (category) => !validCategories.includes(category.toLowerCase())
      );

      if (invalidCategory) {
        return res
          .status(400)
          .json({ error: `Category '${invalidCategory}' is invalid.` });
      }
    }

    if (nutrition) {
      for (const field of [
        "calories",
        "fat",
        "protein",
        "carbs",
        "fiber",
        "sugar",
        "sodium",
      ]) {
        if (nutrition[field] < 0) {
          return res
            .status(400)
            .json({ error: `${field} must be a positive number.` });
        }
      }
    }

    // Get author from token (set by auth middleware)
    // let author = null;
    // if (req.cookies && req.cookies.token) {
    //     try {
    //         const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
    //         author = decoded.id || decoded._id;
    //     } catch (e) {
    //         // ignore, already handled by auth middleware
    //     }
    // }

    const totalTime = prepTime + cookTime;

    const recipe = new Recipe({
      title,
      description: body.description,
      images: imagePath,
      servings,
      prepTime,
      cookTime,
      totalTime,
      ingredients,
      instructions,
      categories,
      nutrition,
      author: req.user._id,
    });

    await recipe.save();

    // Log the activity
    await logActivity(
      'recipe_created',
      `New recipe "${recipe.title}" was created`,
      recipe.author,
      recipe._id
    );

    res.status(201).json(recipe);
  } catch (error) {
    console.error("Error creating recipe:", error);
    res.status(500).json({ error: "Failed to create recipe" });
  }
};

export const getAllRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.find().populate('author', 'name');
    res.status(200).json(recipes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getRecipeById = async (req, res) => {
  try {
    const id = req.params.id;
    const recipe = await Recipe.findById(id).populate('author', 'name');
    if (recipe == null) {
      return res.status(404).json({ error: "Recipe not found" });
    }
    res.status(200).json(recipe);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!recipe) {
      return res.status(404).json({ error: "Recipe not found" });
    }

    // Log the activity
    await logActivity(
      'recipe_updated',
      `Recipe "${recipe.title}" was updated`,
      recipe.author,
      recipe._id
    );

    res.json(recipe);
  } catch (error) {
    console.error("Error updating recipe:", error);
    res.status(500).json({ error: "Failed to update recipe" });
  }
};

export const deleteRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    
    if (!recipe) {
      return res.status(404).json({ error: "Recipe not found" });
    }

    // Log the activity before deleting
    await logActivity(
      'recipe_deleted',
      `Recipe "${recipe.title}" was deleted`,
      recipe.author,
      recipe._id
    );

    await Recipe.findByIdAndDelete(req.params.id);
    res.json({ message: "Recipe deleted successfully" });
  } catch (error) {
    console.error("Error deleting recipe:", error);
    res.status(500).json({ error: "Failed to delete recipe" });
  }
};
