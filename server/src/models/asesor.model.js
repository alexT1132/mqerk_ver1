import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    direccion: {
        type: String,
        required: true,
    },
    municipio: {
        type: String,
        required: true,
    },
    nacimiento: {
        type: Date,
        required: true,
    },
    nacionalidad: {
        type: String,
        required: true,
    },
    genero: {
        type: String,
        required: true,
    },
    rfc: {
        type: String,
        required: true,
    },
}, {
    timestamps: true
});

export default mongoose.model("User", userSchema);