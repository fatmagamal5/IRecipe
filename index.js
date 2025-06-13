import express from "express";
import cookieParser from "cookie-parser";
import "dotenv/config";
import connectDb from "./config/db.js";
import userRouter from "./routes/user.js";
import recipeRouter from "./routes/recipe.js";
import frontendRouter from "./routes/frontend.js";
import adminRouter from "./routes/admin.js"; 

const app = express();
const port = 3000;

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));
app.set("view engine", "ejs");

// API routes
app.use("/api/user", userRouter);
app.use("/api/recipe", recipeRouter);

// Admin routes
app.use("/admin", adminRouter);

// Frontend routes (should be last to catch all other routes)
app.use("/", frontendRouter);

connectDb();

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
