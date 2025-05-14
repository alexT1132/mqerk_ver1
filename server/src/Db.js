import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        await mongoose.connect("mongodb://localhost/mqerk");
        console.log(">>> DB is conected");
    } catch (error) {
        console.log(error);
    }
}