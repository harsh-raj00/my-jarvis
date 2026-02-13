
# 🚀 J.A.R.V.I.S. Deployment

## Live Links

| Service | URL | Note |
|:--|:--|:--|
| **Frontend** | https://jarvis-frontend-uj30.onrender.com | Main Interface (Wait for backend!) |
| **Backend** | https://jarvis-backend-cybf.onrender.com | API Root |
| **Docs** | https://jarvis-backend-cybf.onrender.com/docs | Swagger UI |

> ⏳ **Note:** Render Free Tier spins down after 15 minutes of inactivity. The first request may take ~30-50 seconds to wake up the backend.

## Environment Variables (Render)

### Backend (`jarvis-backend`)
- `GEMINI_API_KEY`: [Your Key]
- `ENVIRONMENT`: `production`
- `ALLOWED_ORIGINS`: `https://jarvis-frontend-uj30.onrender.com,http://localhost:3000,http://localhost:5173`

### Frontend (`jarvis-frontend`)
- `VITE_API_URL`: `https://jarvis-backend-cybf.onrender.com`

---

## Deployment Steps
1. Push changes to GitHub: `git push`
2. Render auto-deploys backend.
3. For frontend changes involving env vars: **Manual Deploy** -> **Clear build cache & deploy**.
