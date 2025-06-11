import mongoose from "mongoose";
import "dotenv/config";

const connectDb = async () => {
    mongoose
        .connect(process.env.DB_URL)
        .then(() => {
            console.log("DB connected");
        })
        .catch(() => {
            console.log("DB not connected");
        });

}

export default connectDb;