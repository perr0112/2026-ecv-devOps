import express from "express"
import mongoose from "mongoose"
import axios from "axios"

import { isAuthenticated } from "./isAuthenticated.js"

import { Commande } from "./Commande.js"

import amqp from "amqplib"

const AMQP_URL = process.env.AMQP_URL || "amqp://localhost:5672"
let channel

const app = express()

const PORT = process.env.PORT_ONE || 4001
const PRODUIT_SERVICE_URL = process.env.PRODUIT_SERVICE_URL || "http://localhost:4000"

app.use(express.json())

mongoose.set("strictQuery", true)

async function connectAmqp() {
    const connection = await amqp.connect(AMQP_URL)
    channel = await connection.createChannel()
    await channel.assertQueue("produit_commande")
    await channel.assertQueue("produit_commande_reponse")
    console.log("Commande-Service connecté à RabbitMQ")
}

function prixTotal(produits) {
    return produits.reduce((total, produit) => total + produit.prix, 0)
}

async function getProduits(ids) {
    return new Promise((resolve) => {
        const correlationId = Date.now().toString()

        channel.consume("produit_commande_reponse", (msg) => {
            const { correlationId: id, produits } = JSON.parse(msg.content.toString())

            if (id === correlationId) {
                console.log("Produits reçus via RabbitMQ --------", produits)
                channel.ack(msg)
                resolve(produits)
            }
        })

        channel.sendToQueue(
            "produit_commande",
            Buffer.from(JSON.stringify({ ids, correlationId }))
        )

        console.log("Msg publié dans RabbitMQ -------- :", ids)
    })
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
mongoose.connect("mongodb://db/commande-service")
    .then(async () => {
        console.log("Commande-Service DB Connected")
        await connectAmqp()
        app.listen(PORT, () => console.log(`Commande-Service at http://127.0.0.1:${PORT}`))
    })
    .catch((err) => {
        console.error("DB connection error:", err)
        process.exit(1)
    })