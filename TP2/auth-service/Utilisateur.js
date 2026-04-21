import mongoose from "mongoose"

const UtilisateurSchema = new mongoose.Schema({
    nom: String,
    email: String,
    mot_passe: String,
    created_at: {
        type: Date,
        default: Date.now,
    },
})

export const Utilisateur = mongoose.model("utilisateur", UtilisateurSchema)
