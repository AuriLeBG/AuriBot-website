# AuriBot-modern

Backend **Spring Boot** + frontend **React (Vite + TS)**.

## Démarrage (Docker - PROD-like)

Build + Nginx pour le frontend.

```bash
docker compose up -d --build db backend frontend
```

- Frontend (nginx): http://localhost/
- Backend: http://localhost:8080
- Health: http://localhost:8080/health

## Démarrage (Docker - DEV avec Hot Reload)

Aucun `npm run dev` en local : c'est le container `frontend-dev` qui fait le HMR.

```bash
docker compose up -d --build db backend frontend-dev
```

- Frontend DEV (Vite): http://localhost/  (sert le dev server Vite sur le port 80)
- Backend: http://localhost:8080

Notes:
- `frontend-dev` monte `./frontend` en volume, donc tes modifications sont visibles immédiatement.
- `node_modules` est stocké dans un volume Docker (`auribot-frontend-node_modules`) pour éviter de réinstaller à chaque run.
