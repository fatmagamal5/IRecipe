import User from "../models/user.js";
import Recipe from "../models/recipe.js";

export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalRecipes = await Recipe.countDocuments();

    // Get today's date range
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const newRecipesToday = await Recipe.countDocuments({
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    });

    const stats = {
      totalUsers,
      totalRecipes,
      activeSessions: newRecipesToday,
    };

    res.render("admin/dashboard", { stats });

  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).send("Internal Server Error");
  }
};
