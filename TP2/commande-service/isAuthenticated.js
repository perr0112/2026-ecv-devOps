import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "secret"

export async function isAuthenticated(req, res, next) {
    const token = req.headers["authorization"]?.split(" ")[1]

    if (!token) {
        return res.status(401).json({ message: "Token manquant" })
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(401).json({ message: "Token invalide" })
        }
        req.user = user
        next()
    })
}