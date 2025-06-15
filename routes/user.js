import express from "express";
import {
  signup,
  signin,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  logout,
  getFavorites,
  addFavorite,
  removeFavorite,
  verifyUser,
  changePassword,
} from "../controllers/user.js";

const router = express.Router();

// Auth routes
router.post("/signup", signup);
router.post("/signin", signin);
router.get("/logout", logout);

// Public user routes
router.get("/", getUsers);
router.get("/:id", getUserById);

// Protected user routes
router.put("/:id", verifyUser, updateUser);
router.delete("/:id", verifyUser, deleteUser);
router.put('/update', verifyUser, updateUser);
router.delete('/delete', verifyUser, deleteUser);
router.post('/change-password', verifyUser, changePassword);

// Favorite routes (protected)
router.get("/favorites/all", verifyUser, getFavorites);
router.post("/favorites/:recipeId", verifyUser, addFavorite);
router.delete("/favorites/:recipeId", verifyUser, removeFavorite);

export default router;
