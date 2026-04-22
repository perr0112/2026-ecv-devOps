import express from "express"
import path from "path"
import { fileURLToPath } from "url"

const app = express()
const PORT = process.env.PORT_ONE || 8080

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.use(express.json())

app.get("/", (req, res, next) => {
    res.sendFile(__dirname + "/index.html")
})

app.listen(PORT, () => {
    console.log(`frontend-Service at http://localhost:${PORT}`)
})
