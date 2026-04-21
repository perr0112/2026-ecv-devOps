import express from "express"
import mongoose from "mongoose"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import { Utilisateur } from "./Utilisateur.js"

const app = express()
const PORT = process.env.PORT_ONE || 4002
const JWT_SECRET = process.env.JWT_SECRET || "secret"

app.use(express.json())

mongoose.set("strictQuery", true)

/**
 * Routes - {POST}
 */

// Créer un nouvel utilisateur
app.post("/auth/register", async (req, res) => {
    const { nom, email, mot_passe } = req.body

    try {
        const userExists = await Utilisateur.findOne({ email })

        if (userExists) {
            return res.status(400).json({ message: "Cet utilisateur existe déjà" })
        }

        const hash = await bcrypt.hash(mot_passe, 10)

        const newUtilisateur = new Utilisateur({
            nom,
            email,
            mot_passe: hash,
        })

        const user = await newUtilisateur.save()
        res.status(201).json(user)
    } catch (err) {
        console.error("Erreur :", err.message)
        res.status(500).json({ error: err.message })
    }
})

// Connecter un utilisateur et retourner un token JWT
app.post("/auth/login", async (req, res) => {
    const { email, mot_passe } = req.body

    try {
        const utilisateur = await Utilisateur.findOne({ email })

        if (!utilisateur) {
            return res.status(404).json({ message: "Utilisateur introuvable" })
        }

        const motPasseValide = await bcrypt.compare(mot_passe, utilisateur.mot_passe)

        if (!motPasseValide) {
            return res.status(401).json({ message: "Mot de passe incorrect" })
        }

        const payload = { email, nom: utilisateur.nom }
        const token = jwt.sign(payload, JWT_SECRET)

        res.status(200).json({ token })
    } catch (err) {
        console.error("Erreur :", err.message)
        res.status(500).json({ error: err.message })
    }
})


// Listener
mongoose.connect("mongodb://localhost/auth-service")
    .then(() => {
        console.log("Auth-Service DB Connected")
        app.listen(PORT, () => console.log(`Auth-Service at http://127.0.0.1:${PORT}`))
    })
    .catch((err) => {
        console.error("DB connection error:", err)
        process.exit(1)
    })