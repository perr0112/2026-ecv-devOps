import express from "express"
import mongoose from "mongoose"
import axios from "axios"

import { isAuthenticated } from "./isAuthenticated.js"

import { Commande } from "./Commande.js"

const app = express()

const PORT = process.env.PORT_ONE || 4001
const PRODUIT_SERVICE_URL = process.env.PRODUIT_SERVICE_URL || "http://localhost:4000"

app.use(express.json())

mongoose.set("strictQuery", true)

function prixTotal(produits) {
    return produits.reduce((total, produit) => total + produit.prix, 0)
}

async function getProduits(ids, token) {
    const url = `${PRODUIT_SERVICE_URL}/produit/acheter`

    const response = await axios.get(url, {
        params: { ids: ids.join(",") },
        headers: { Authorization: `Bearer ${token}` }
    })

    return response.data
}

/**
 * Routes - {POST}
 */

app.post("/commande/ajouter", isAuthenticated, async (req, res) => {
    const { ids, email_utilisateur } = req.body
    const token = req.headers["authorization"].split(" ")[1]

    try {
        const produits = await getProduits(ids, token)

        if (!produits || produits.length === 0) {
            return res.status(400).json({ error: "Aucun produit trouvé pour les ids fournis" })
        }

        const newCommande = new Commande({
            produits: ids,
            email_utilisateur,
            prix_total: prixTotal(produits),
        })

        const commande = await newCommande.save()
        res.status(201).json(commande)
    } catch (err) {
        console.error("Erreur :", err.message)
        res.status(500).json({ error: err.message })
    }
})


// Listener
mongoose.connect("mongodb://localhost/commande-service")
    .then(() => {
        console.log("Commande-Service DB Connected")
        app.listen(PORT, () => console.log(`Commande-Service at http://127.0.0.1:${PORT}`))
    })
    .catch((err) => {
        console.error("DB connection error:", err)
        process.exit(1)
    })