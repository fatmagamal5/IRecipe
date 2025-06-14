import mongoose from "mongoose";

const { Schema, model, Types } = mongoose;

const RecipeSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Recipe title is required."],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    images: {
      type: String,
      default: "img/placeholder.jpg",
    },
    servings: {
      type: Number,
      required: [true, "Please specify the number of servings."],
      min: [1, "Servings must be at least 1."],
    },
    prepTime: {
      type: Number,
      required: [true, "Preparation time is required."],
      min: [0, "Preparation time cannot be negative."],
    },
    cookTime: {
      type: Number,
      required: [true, "Cooking time is required."],
      min: [0, "Cooking time cannot be negative."],
    },
    totalTime: {
      type: Number,
    },
    author: {
      type: Types.ObjectId,
      ref: "User",
      required: [true, "Recipe author is required."],
    },
    ingredients: [
      {
        name: {
          type: String,
          required: [true, "Ingredient name is required."],
        },
        quantity: {
          type: String,
          required: [true, "Ingredient quantity is required."],
        },
        notes: {
          type: String,
        },
      },
    ],
    instructions: [
      {
        step: {
          type: Number,
          required: [true, "Step number is required."],
          min: [1, "Step number must be at least 1."],
        },
        description: {
          type: String,
          required: [true, "Instruction description is required."],
        },
        image: {
          type: String,
        },
        timer: {
          type: Number,
          min: [0, "Timer must be a positive number."],
        },
      },
    ],
    nutrition: {
      calories: {
        type: Number,
        min: [0, "Calories must be a positive number."],
      },
      fat: { type: Number, min: [0, "Fat must be a positive number."] },
      protein: { type: Number, min: [0, "Protein must be a positive number."] },
      carbs: { type: Number, min: [0, "Carbs must be a positive number."] },
      fiber: { type: Number, min: [0, "Fiber must be a positive number."] },
      sugar: { type: Number, min: [0, "Sugar must be a positive number."] },
      sodium: { type: Number, min: [0, "Sodium must be a positive number."] },
      servingSize: { type: String },
    },
    categories: [
      {
        type: String,
        lowercase: true,
        trim: true,
        enum: {
          values: [
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
          ],
          message: "Category `{VALUE}` is not a valid option.",
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default model("Recipe", RecipeSchema);
