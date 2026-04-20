# TP1 - Création d'API Rest simples en node.js et express.js

## Code d'erreurs

| Code d'erreur | Signification |
| --- | --- |
| 200 | Requête réussie |
| 400 | Requête mal formée |
| 401 | Non autorisé |
| 404 | Ressource non trouvée |
| 500 | Erreur interne du serveur |

## Connexion MongoDB

- URI par défaut: `mongodb://127.0.0.1:27017`
- Base par défaut: `tp1`

Variables d'environnement à définir:
- `MONGO_URI`
- `MONGO_DB_NAME`

```bash
docker run -d --name mongodb -p 27017:27017 mongo:latest
```
