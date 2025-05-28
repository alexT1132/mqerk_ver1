import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        await mongoose.connect('mongodb://localhost/mqerk-db');
        console.log("Database connected successfully");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
}