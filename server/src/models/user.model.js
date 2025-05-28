import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    correo: {
        type: String,
        required: true,
        unique: true
    },
    contraseña: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true,
    }
}, {
    timestamps: true
});

export default mongoose.model("User", userSchema);