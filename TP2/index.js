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

app.get("/produit/acheter", (req, res, next) => {
    const { ids } = req.body
    Produit.find({ _id: { $in: ids } })
        .then((produits) => res.status(201).json(produits))
        .catch((error) => res.status(400).json({ error }))
})


// Listener
app.listen(PORT, () => {
    console.log(`Product-Service at 127.0.0.1:${PORT}`)
})
