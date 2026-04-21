import mongoose from "mongoose"

const CommandeSchema = new mongoose.Schema({
    produits: { type: [String] },
    email_utilisateur: String,
    prix_total: Number,
    created_at: {
        type: Date,
        default: Date.now,
    },
})

export const Commande = mongoose.model("commande", CommandeSchema)
