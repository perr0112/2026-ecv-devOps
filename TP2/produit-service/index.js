import express from "express"
import mongoose from "mongoose"
import { Produit } from "./Produits.js"

const app = express()

const PORT = process.env.PORT_ONE || 4000

app.use(express.json())

mongoose.set("strictQuery", true)

mongoose.connect("mongodb://localhost/produit-service")
  .then(() => console.log(`Produit-Service DB Connected`))
  .catch((err) => console.error("DB connection error:", err));

app.post("/produit/ajouter", (req, res, next) => {
    const { nom, description, prix } = req.body
    const newProduit = new Produit({
        nom,
        description,
        prix,
    })

    newProduit
        .save()
        .then((produit) => res.status(201).json(produit))
        .catch((error) => res.status(400).json({ error }))
})

app.get("/produit/acheter", async (req, res) => {
    const ids = req.query.ids

    if (!ids) {
        return res.status(400).json({ error: "Paramètre ids manquant" })
    }

    try {
        const idsArray = Array.isArray(ids) ? ids : ids.split(",")

        const produits = await Produit.find({ _id: { $in: idsArray } })

        res.status(200).json(produits)
    } catch (err) {
        console.error("❌ Erreur Mongoose :", err.message)
        res.status(400).json({ error: err.message })
    }
})


// Listener
app.listen(PORT, () => {
    console.log(`Product-Service at http://127.0.0.1:${PORT}`)
})
