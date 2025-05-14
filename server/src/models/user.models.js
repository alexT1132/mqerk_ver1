import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  correo: {
    type: String,
    required: true,
  },
  contraseña: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
});

export default mongoose.model("User", userSchema);