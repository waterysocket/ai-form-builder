# FormCraft — Branded Survey Builder

🎉 **Live Deployment**: [https://ai-form-builder-web-theta.vercel.app/](https://ai-form-builder-web-theta.vercel.app/)

A full-stack web application that allows users to create surveys, customize their visual branding (colors, backgrounds, fonts), share public links, and view advanced analytics of the responses.

## Cloudflare Infrastructure

This project leverages Cloudflare Workers for the backend API and utilizes the following databases:
- **Cloudflare D1** (`DB`): A serverless SQL database used to store relational data, including `surveys`, `questions`, `responses`, and `answers`.
- **Cloudflare KV** (`AUTH_KV`): A globally distributed key-value store used to manage user authentication tokens and sessions securely.
- **Cloudflare KV** (`ASSETS_KV`): A second key-value store utilized as a free alternative to R2 for storing and serving user-uploaded image assets (like custom survey backgrounds and logos).

## Local Setup & Cloning

To run this project locally on your machine, follow these steps:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/waterysocket/ai-form-builder.git
   cd ai-form-builder
   ```

2. **Install dependencies:**
   This project uses `pnpm` workspaces. Install everything at the root:
   ```bash
   pnpm install
   ```

3. **Set up the local database:**
   The API requires a local D1 database. Apply the schema using wrangler:
   ```bash
   cd api
   npx wrangler d1 execute ai-form-builder-db --file=schema.sql --local
   cd ..
   ```

4. **Start the development servers:**
   Run both the API and the Web frontend concurrently:
   ```bash
   pnpm dev
   ```

5. **View the app:**
   Open your browser and navigate to `http://localhost:5173`.
