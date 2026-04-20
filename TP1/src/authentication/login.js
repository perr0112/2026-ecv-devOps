import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

export const login = (req, res, next) => {
    User.findOne({ email: req.body.email })
        .then((user) => {
            if (!user) {
                return res.status(401).json({ error: "Utilisateur non trouvé !" });
            }
            bcrypt.compare(req.body.password, user.password)
                .then((valid) => {
            if (!valid) {
                return res.status(401).json({ error: "Mot de passe incorrect !" });
            }
            res.status(200).json({
                userId: user._id,
                token: jwt.sign({ userId: user._id }, "RANDOM_TOKEN_SECRET", {
                expiresIn: "24h",
                }),
            });
            })
            .catch((error) => res.status(500).json({ error }));
        })
    .catch((error) => res.status(500).json({ error }));
};
