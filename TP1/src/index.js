import express from 'express'

import equipes from "../data/equipes.json" with { type: "json" }

const app = express()
const PORT = 82

/**
 * Routes
 */
app.get('/equipes', (req, res) => {
    // res.send('Liste des équipes')
    res.send(equipes)
})

app.get('/equipes/:id', (req, res) => {
    const id = parseInt(req.params.id)
    const equipe = equipes.find(equipe => equipe.id === id)

    res.status(200).json(equipe)
})

app.listen(PORT, () => {
    console.log(`Application lancée sur le port ${PORT}`)
    console.log(`http://127.0.0.1:${PORT}`)
})
