import express from 'express'

const app = express()
const PORT = 80

app.listen(PORT, () => {
    console.log(`Application lancée sur le port ${PORT}`)
})
