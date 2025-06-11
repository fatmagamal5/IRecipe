import express from "express";
import {
  signup,
  signin,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  logout,
} from "../controllers/user.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.get("/logout", logout);
router.get("/", getUsers);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;
