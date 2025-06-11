import userModel from "../models/user.js";
import bcrypt from "bcryptjs";
import JsonWebToken from "jsonwebtoken";

export const getUsers = async (req, res) => {
  try {
    const users = await userModel.find();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await userModel.findById(id);
    if (user == null) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateUser = async (req, res) => {};

export const deleteUser = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await userModel.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const signup = async (req, res) => {
  try {
    const { name, email, password, role = "user" } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ error: "All fields are required" });

    const user = await userModel.findOne({ email });
    if (user) return res.status(400).json({ error: "Email is taken" });

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    const newUser = await userModel.create({
      name,
      email,
      password: hash,
      role,
    });
    newUser.save();
    return res.status(201).json({ message: "User signup successfully" });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

export const signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: "All fields are required" });

    const user = await userModel.findOne({ email });
    if (!user)
      return res.status(400).json({ error: "Wrong email or password" });

    if (!(await bcrypt.compareSync(password, user.password)))
      return res.status(400).json({ error: "Wrong email or password" });

    // jwt
    const token = JsonWebToken.sign(
      { id: user._id, role: user.role },

      process.env.JWT_SECRET,

      { expiresIn: "1d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "strict",
    });

    return res.status(200).json({ msg: "User signin successfully" , user });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("token");
    return res.redirect("/");
  } catch (e) {
    console.log(e);
    return res.status(500).json({ error: "Something went wrong" });
  }
};
