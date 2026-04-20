import express from 'express'
import { MongoClient } from 'mongodb'

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

async function getNextId(collectionName) {
    const [lastDoc] = await db
        .collection(collectionName)
        .find({ id: { $type: 'number' } })
        .sort({ id: -1 })
        .limit(1)
        .toArray()

    return lastDoc ? lastDoc.id + 1 : 1
}

/**
 * Middleware
 */
app.use(express.json())






/**
 * Routes - {GET}
 */
app.get('/equipes', async (req, res) => {
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
        const equipe = await db.collection('equipes').findOne({ id })

        if (!equipe) {
            return res.status(404).json({ error: 'Équipe non trouvée' })
        }

        res.status(200).json(equipe)
    } catch (err) {
        console.error('Erreur MongoDB :', err)
        res.status(500).json({ error: err.message })
    }
})

app.get('/equipes/:id/joueurs', async (req, res) => {
    const idEquipe = parseInt(req.params.id)

    try {
        const equipe = await db.collection('equipes').findOne({ id: idEquipe })

        if (!equipe) {
            return res.status(404).json({ error: 'Équipe non trouvée' })
        }

        const joueursEquipe = await db.collection('joueurs').find({ idEquipe }).toArray()
        res.status(200).json(joueursEquipe)
    } catch (err) {
        console.error('Erreur MongoDB :', err)
        res.status(500).json({ error: err.message })
    }
})

app.get('/joueurs', async (req, res) => {
    try {
        const docs = await db.collection('joueurs').find({}).toArray()
        res.status(200).json(docs)
    } catch (err) {
        console.error('Erreur MongoDB :', err)
        res.status(500).json({ error: err.message })
    }
})

app.get('/joueurs/:id/equipe', async (req, res) => {
    const id = parseInt(req.params.id)

    try {
        const joueur = await db.collection('joueurs').findOne({ id })

        if (!joueur) {
            return res.status(404).json({ error: 'Joueur non trouvé' })
        }

        const equipe = await db.collection('equipes').findOne({ id: joueur.idEquipe })

        if (!equipe) {
            return res.status(404).json({ error: 'Équipe non trouvée' })
        }

        res.status(200).json(equipe)
    } catch (err) {
        console.error('Erreur MongoDB :', err)
        res.status(500).json({ error: err.message })
    }
})

app.get('/joueurs/:id', async (req, res) => {
    const id = parseInt(req.params.id)

    try {
        const joueur = await db.collection('joueurs').findOne({ id })

        if (!joueur) {
            return res.status(404).json({ error: 'Joueur non trouvé' })
        }

        res.status(200).json(joueur)
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
        const newEquipe = {
            id: await getNextId('equipes'),
            ...req.body
        }

        const result = await db.collection('equipes').insertOne(newEquipe)
        res.status(201).json({ ...newEquipe, _id: result.insertedId })
    } catch (err) {
        console.error('Erreur MongoDB :', err)
        res.status(500).json({ error: err.message })
    }
})

app.post('/joueurs', async (req, res) => {
    const { idEquipe, nom, numero, poste } = req.body

    try {
        const idEquipeValue = Number(idEquipe)
        const equipe = await db.collection('equipes').findOne({ id: idEquipeValue })

        if (!equipe) {
            return res.status(400).json({ error: 'Équipe invalide' })
        }

        const newJoueur = {
            id: await getNextId('joueurs'),
            idEquipe: idEquipeValue,
            nom,
            numero,
            poste
        }

        const result = await db.collection('joueurs').insertOne(newJoueur)
        res.status(201).json({ ...newJoueur, _id: result.insertedId })
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
        const result = await db.collection('equipes').findOneAndUpdate(
            { id },
            { $set: { name, country } },
            { returnDocument: 'after' }
        )

        if (!result) {
            return res.status(404).json({ error: 'Équipe non trouvée' })
        }

        res.status(200).json(result)
    } catch (err) {
        console.error('Erreur MongoDB :', err)
        res.status(500).json({ error: err.message })
    }
})

app.put('/joueurs/:id', async (req, res) => {
    const id = parseInt(req.params.id)
    const { idEquipe, nom, numero, poste } = req.body

    try {
        const updates = {}

        if (idEquipe !== undefined) {
            const idEquipeValue = Number(idEquipe)
            const equipe = await db.collection('equipes').findOne({ id: idEquipeValue })

            if (!equipe) {
                return res.status(400).json({ error: 'Équipe invalide' })
            }

            updates.idEquipe = idEquipeValue
        }

        if (nom !== undefined) updates.nom = nom
        if (numero !== undefined) updates.numero = numero
        if (poste !== undefined) updates.poste = poste

        const result = await db.collection('joueurs').findOneAndUpdate(
            { id },
            { $set: updates },
            { returnDocument: 'after' }
        )

        if (!result) {
            return res.status(404).json({ error: 'Joueur non trouvé' })
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
        const result = await db.collection('equipes').findOneAndDelete({ id })

        if (!result) {
            return res.status(404).json({ error: 'Équipe non trouvée' })
        }

        res.status(200).json(result)
    } catch (err) {
        console.error('Erreur MongoDB :', err)
        res.status(500).json({ error: err.message })
    }
})

app.delete('/joueurs/:id', async (req, res) => {
    const id = parseInt(req.params.id)

    try {
        const result = await db.collection('joueurs').findOneAndDelete({ id })

        if (!result) {
            return res.status(404).json({ error: 'Joueur non trouvé' })
        }

        res.status(200).json(result)
    } catch (err) {
        console.error('Erreur MongoDB :', err)
        res.status(500).json({ error: err.message })
    }
})





// Listener
async function startServer() {
    try {
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
