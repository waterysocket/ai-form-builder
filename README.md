# FormCraft — AI-Powered Survey Builder

🎉 **Live Deployment**: [https://ai-form-builder-web-theta.vercel.app/](https://ai-form-builder-web-theta.vercel.app/)

A full-stack AI-powered web application that allows users to create surveys, customize their visual branding with AI-generated styles, share public links, and view advanced analytics on responses. It features an in-builder AI assistant powered by **NVIDIA NIM free inference endpoints**.

---

## ✨ Features

- **AI Question Generator** — Describe your survey topic and the AI instantly generates relevant questions
- **AI Style Generator** — Describe a vibe (e.g. "blue green", "dark corporate") and the AI applies a matching color theme
- **AI Vision Support** — Upload an image and the AI uses it as context to style or generate questions
- **OAuth Login** — Sign in with Google or GitHub
- **Magic Link Auth** — Passwordless email-based authentication
- **Form Builder** — Drag-and-drop style question editor with 9 question types
- **Public Survey Links** — Share a `/s/:id` link for anyone to fill out
- **Analytics Dashboard** — Response charts, completion rates, and per-question breakdowns
- **Custom Branding** — Colors, fonts, card styles, background images, and presets

---

## 🤖 AI Agents & NVIDIA NIM Endpoints

This project uses **NVIDIA NIM free inference endpoints** (`https://integrate.api.nvidia.com/v1`) to power two distinct AI agents inside the form builder.

### Agent 1 — Survey Builder Chat Assistant
**Model:** `meta/llama-3.1-70b-instruct` (text) / `meta/llama-3.2-11b-vision-instruct` (vision)

**Purpose:** An in-editor conversational assistant that understands natural language requests from the user and responds with either structured JSON actions or plain text explanations.

**Capabilities:**
| User Request | AI Action |
|---|---|
| "Generate 5 questions for a customer feedback survey" | Returns `add_questions` JSON to bulk-insert questions |
| "Generate a visual style. Vibe: blue green" | Returns `apply_style` JSON to update the survey theme |
| Upload image + "Use this as background" | Sets the image as the survey background |
| General question about the form | Returns a plain text conversational reply |

**How it works:** The frontend sends the full conversation history to `/api/ai/chat`. The backend forwards it to the NVIDIA NIM endpoint with a strict system prompt. The frontend parses the response for a `\`\`\`json` block containing an `action` field and executes it automatically.

---

### Agent 2 — Style Configuration Generator
**Model:** `meta/codellama-70b`

**Purpose:** A dedicated code-generation agent that converts a free-text style description into a precise JSON color configuration object used to style the survey.

**Endpoint:** `POST /api/ai/style`

**How it works:** The user describes a style vibe (e.g. "dark professional blue"). The backend sends this to CodeLlama with a strict system prompt requiring it to return only a valid JSON object matching the `SurveyStyle` TypeScript interface — no markdown, no extra text.

**Output format:**
```json
{
  "primaryColor": "#1E3A5F",
  "backgroundColor": "#0D1117",
  "cardColor": "#161B22",
  "textColor": "#E6EDF3",
  "fontFamily": "Inter",
  "questionSize": "M"
}
```

---

### NVIDIA NIM Integration

All AI calls are routed through the backend Cloudflare Worker at `/api/ai/*` (requires authentication). The worker uses the `NVIDIA_NIM_KEY` environment secret to authenticate with NVIDIA's free inference API.

```
Frontend → POST /api/ai/chat or /api/ai/style
         → Cloudflare Worker (auth check)
         → NVIDIA NIM API (https://integrate.api.nvidia.com/v1/chat/completions)
         → Response streamed back to frontend
```

NVIDIA NIM provides **free access** to state-of-the-art open-source models (Llama 3.1, Llama 3.2 Vision, CodeLlama) via an OpenAI-compatible API, making it easy to swap models without changing code.

---

## 🗂️ Project Structure

```
ai-form-builder/
├── api/                          # Cloudflare Worker backend (Hono framework)
│   ├── src/
│   │   ├── index.ts              # Entry point, mounts all routers
│   │   ├── middleware/
│   │   │   └── auth.ts           # Session cookie auth middleware
│   │   └── routes/
│   │       ├── ai.ts             # /api/ai — NVIDIA NIM AI endpoints (chat + style)
│   │       ├── auth.ts           # /api/auth — Magic link login, verify, logout, /me
│   │       ├── oauth.ts          # /api/auth/oauth — Google & GitHub OAuth 2.0 flow
│   │       ├── surveys.ts        # /api/surveys — CRUD for surveys & questions (auth required)
│   │       ├── responses.ts      # /api/responses — Submit & fetch survey responses
│   │       ├── dashboard.ts      # /api/dashboard — Aggregated stats for dashboard
│   │       ├── public.ts         # /api/public — Public survey view & response submission
│   │       └── upload.ts         # /api/upload & /api/assets — Image upload via KV store
│   ├── schema.sql                # D1 SQLite database schema
│   ├── wrangler.jsonc            # Cloudflare Worker configuration & bindings
│   └── .dev.vars                 # Local environment secrets (not committed)
│
├── web/                          # React frontend (Vite + TanStack Router)
│   ├── src/
│   │   ├── routes/
│   │   │   ├── index.tsx         # Landing / home page
│   │   │   ├── auth.tsx          # Sign in / Sign up page with OAuth buttons
│   │   │   ├── builder.tsx       # Builder layout wrapper
│   │   │   ├── builder.dashboard.tsx  # Survey dashboard (list, create, delete)
│   │   │   ├── builder.$surveyId.tsx  # Main form builder with AI assistant chat
│   │   │   ├── analytics.$surveyId.tsx # Response analytics & charts
│   │   │   └── s.$publicId.tsx   # Public survey fill-out page
│   │   ├── components/
│   │   │   ├── Logo.tsx          # Brand logo component
│   │   │   ├── ProfileSettingsModal.tsx
│   │   │   └── ui/               # shadcn/ui component library
│   │   ├── lib/
│   │   │   ├── store.ts          # Zustand global state (surveys + auth)
│   │   │   └── api-client.ts     # Typed API client helpers
│   │   ├── hooks/                # Custom React hooks
│   │   └── styles.css            # Global CSS design tokens & styles
│   ├── vite.config.ts            # Vite config with /api proxy to worker
│   └── vercel.json               # Vercel deployment config with API rewrites
│
├── package.json                  # Root workspace config
└── pnpm-workspace.yaml           # pnpm monorepo workspace definition
```

---

## ☁️ Cloudflare Infrastructure

| Binding | Type | Purpose |
|---|---|---|
| `DB` | D1 (SQLite) | Stores `users`, `surveys`, `questions`, `responses`, `answers` |
| `AUTH_KV` | KV Namespace | Stores magic link tokens (15min TTL) and session tokens (7 day TTL) |
| `ASSETS_KV` | KV Namespace | Stores uploaded images (used as a free alternative to R2) |

---

## 🔐 Authentication

Three login methods are supported:

1. **Magic Link** — User enters email → backend generates a token → token is auto-verified and session cookie is set
2. **Google OAuth** — Redirects to Google consent screen → exchanges code for token → fetches profile → creates session
3. **GitHub OAuth** — Redirects to GitHub authorization → exchanges code for token → fetches profile + verified email → creates session

All methods create a session stored in `AUTH_KV` and set an `httpOnly` session cookie, validated on every protected API route.

---

## 🛠️ Local Setup & Cloning

### 1. Clone the repository
```bash
git clone https://github.com/waterysocket/ai-form-builder.git
cd ai-form-builder
```

### 2. Install dependencies
```bash
pnpm install
```

### 3. Configure environment secrets
Create `api/.dev.vars` with the following:
```env
NVIDIA_NIM_KEY=your-nvidia-nim-api-key
FRONTEND_URL=http://localhost:5173

# Google OAuth — https://console.cloud.google.com/apis/credentials
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# GitHub OAuth — https://github.com/settings/developers
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

> Get a free NVIDIA NIM API key at [https://build.nvidia.com](https://build.nvidia.com)

### 4. Set up the local database
```bash
cd api
npx wrangler d1 execute ai-form-builder-db --file=schema.sql --local
cd ..
```

### 5. Start the development servers
```bash
pnpm dev
```

### 6. Open the app
Navigate to `http://localhost:5173`

---

## 🚀 Deployment

- **Frontend** is deployed on **Vercel** — pushes to `main` auto-deploy
- **Backend** is deployed as a **Cloudflare Worker** — deploy manually with:
  ```bash
  cd api
  npx wrangler deploy
  ```
- Add OAuth secrets to Cloudflare with:
  ```bash
  npx wrangler secret put GOOGLE_CLIENT_ID
  npx wrangler secret put GOOGLE_CLIENT_SECRET
  npx wrangler secret put GITHUB_CLIENT_ID
  npx wrangler secret put GITHUB_CLIENT_SECRET
  ```
