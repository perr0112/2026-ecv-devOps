import express from 'express'

const app = express()
const PORT = 82

/**
 * Routes
 */
app.get('/equipes', (req, res) => {
    res.send('Liste des équipes')
})

app.listen(PORT, () => {
    console.log(`Application lancée sur le port ${PORT}`)
    console.log(`http://127.0.0.1:${PORT}`)
})
