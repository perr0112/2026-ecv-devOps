import express from "express"
import mongoose from "mongoose"

import amqp from "amqplib"

const AMQP_URL = process.env.AMQP_URL || "amqp://localhost:5672"

async function connectAmqp() {
    const connection = await amqp.connect(AMQP_URL)
    const channel = await connection.createChannel()

    await channel.assertQueue("produit_commande")

    console.log("Produit-Service en attente de messages RabbitMQ...")

    channel.consume("produit_commande", async (msg) => {
        if (msg !== null) {
            const { ids, correlationId } = JSON.parse(msg.content.toString())
            console.log("Message reçu ------ ids :", ids)

            const produits = await Produit.find({ _id: { $in: ids } })
            console.log("Produits trouvés -------", produits)

            channel.sendToQueue(
                "produit_commande_reponse",
                Buffer.from(JSON.stringify({ correlationId, produits }))
            )

            channel.ack(msg)
        }
    })
}

import { isAuthenticated } from "./isAuthenticated.js"

import { Produit } from "./Produits.js"

const app = express()

const PORT = process.env.PORT_ONE || 4000

app.use(express.json())

mongoose.set("strictQuery", true)

// mongoose.connect("mongodb://localhost/produit-service")
//   .then(() => console.log(`Produit-Service DB Connected`))
//   .catch((err) => console.error("DB connection error:", err));

app.post("/produit/ajouter", isAuthenticated, async (req, res, next) => {
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

app.get("/produit/acheter", isAuthenticated, async (req, res) => {
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
// app.listen(PORT, () => {
//     console.log(`Product-Service at http://127.0.0.1:${PORT}`)
// })
mongoose.connect("mongodb://localhost/produit-service")
    .then(() => {
        console.log("Produit-Service DB Connected")
        connectAmqp()
        app.listen(PORT, () => console.log(`Product-Service at http://127.0.0.1:${PORT}`))
    })
    .catch((err) => {
        console.error("DB connection error:", err)
        process.exit(1)
    })
