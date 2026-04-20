import express from 'express'
import { MongoClient } from 'mongodb'

import equipes from "../data/equipes.json" with { type: "json" }

const app = express()
const PORT = 82
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017'
const MONGO_DB_NAME = process.env.MONGO_DB_NAME || 'tp1'

let mongoClient
let db

async function connectMongo() {
    mongoClient = new MongoClient(MONGO_URI)
    await mongoClient.connect()
    db = mongoClient.db(MONGO_DB_NAME)
    await db.command({ ping: 1 })

    console.log(`MongoDB connecté (${MONGO_DB_NAME})`)
}

/**
 * Middleware
 */
app.use(express.json())






/**
 * Routes - {GET}
 */
app.get('/equipes', async (req, res) => {
    // res.send('Liste des équipes')
    // res.send(equipes)

    try {
        const docs = await db.collection('equipes').find({}).toArray()
        res.status(200).json(docs)
    } catch (err) {
        console.error('Erreur MongoDB :', err)
        res.status(500).json({ error: err.message })
    }
})

app.get('/equipes/:id', async (req, res) => {
    const id = parseInt(req.params.id)

    try {
        const equipe = await db.collection('equipes').findOne({ id: id })

        if (!equipe) {
            return res.status(404).json({ error: 'Équipe non trouvée' })
        }

        res.status(200).json(equipe)
    } catch (err) {
        console.error('Erreur MongoDB :', err)
        res.status(500).json({ error: err.message })
    }
})

/**
 * Routes - {POST}
 */
app.post('/equipes', async (req, res) => {
    try {
        const result = await db.collection('equipes').insertOne(req.body)
        res.status(201).json(result)
    } catch (err) {
        console.error('Erreur MongoDB :', err)
        res.status(500).json({ error: err.message })
    }
})

/**
 * Routes - {PUT}
 */
app.put('/equipes/:id', async (req, res) => {
    const { name, country } = req.body
    const id = parseInt(req.params.id)

    try {
        const result = await db.collection('equipes').updateOne(
            { id: id },
            { $set: { name, country } }
        )

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'Équipe non trouvée' })
        }

        res.status(200).json(result)
    } catch (err) {
        console.error('Erreur MongoDB :', err)
        res.status(500).json({ error: err.message })
    }
})

/**
 * Routes - {DELETE}
 */
app.delete('/equipes/:id', async (req, res) => {
    const id = parseInt(req.params.id)

    try {
        const result = await db.collection('equipes').deleteOne({ id: id })

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Équipe non trouvée' })
        }

        res.status(200).json(result)
    } catch (err) {
        console.error('Erreur MongoDB :', err)
        res.status(500).json({ error: err.message })
    }
})





// Listener
async function startServer() {
    console.log("[startServer] Tentative de connexion en cours")
    try {
        console.log("[try] Tentative de connexion en cours")
        await connectMongo()

        app.listen(PORT, () => {
            console.log(`Application lancée sur le port ${PORT}`)
            console.log(`http://127.0.0.1:${PORT}`)
        })
    } catch (error) {
        console.error('Impossible de se connecter à MongoDB :', error.message)
        process.exit(1)
    }
}

startServer()
