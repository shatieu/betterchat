# Deployment Guide

> For the Enhanced AI Chat Frontend (LobeChat fork)

---

## Table of Contents

1. [Deployment Options Overview](#deployment-options-overview)
2. [Option A: Vercel (Recommended for Quick Start)](#option-a-vercel)
3. [Option B: Docker Compose (Recommended for Self-Hosted)](#option-b-docker-compose)
4. [Option C: Docker (Single Container)](#option-c-docker)
5. [Option D: Netlify](#option-d-netlify)
6. [Option E: Bare Metal / VPS](#option-e-bare-metal)
7. [Environment Variables Reference](#environment-variables-reference)
8. [Database Setup](#database-setup)
9. [S3 Storage Setup](#s3-storage-setup)
10. [Authentication Setup](#authentication-setup)
11. [Post-Deployment Checklist](#post-deployment-checklist)

---

## Deployment Options Overview

| Platform | Best For | Database | Multi-User | Cost | Complexity |
|----------|----------|----------|------------|------|------------|
| **Vercel** | Quick start, solo use | Optional (Neon/Supabase) | With DB | Free tier available | Low |
| **Docker Compose** | Self-hosted, full control | Included (PostgreSQL) | Yes | VPS cost ($5-20/mo) | Medium |
| **Docker** | Existing infra | External required | Yes | Varies | Medium |
| **Netlify** | Static-ish deploy | External required | With DB | Free tier available | Low |
| **Bare Metal** | Maximum control | Self-managed | Yes | VPS cost | High |

### Choosing a Platform

- **Just want to try it?** → Vercel, client-side mode (no database, API keys in browser)
- **Personal daily driver?** → Docker Compose on a VPS (Hetzner, DigitalOcean, etc.)
- **Team/multi-user?** → Docker Compose with auth + PostgreSQL + S3
- **Already have k8s?** → Docker image + your own PostgreSQL/Redis/S3

---

## Option A: Vercel

### Prerequisites
- GitHub account
- Vercel account (free tier works)
- (Optional) PostgreSQL database URL (Neon, Supabase, or Vercel Postgres)

### Steps

**1. Fork or push to GitHub**
```bash
git remote add origin https://github.com/YOUR_USER/betterchat.git
git push -u origin main
```

**2. Import to Vercel**
- Go to [vercel.com/new](https://vercel.com/new)
- Import your GitHub repository
- Framework: Next.js (auto-detected)
- Build command is preconfigured in `vercel.json`: `bun run build:vercel`
- Install command: `npx pnpm@10.26.2 install`

**3. Set environment variables**

Minimum for client-side mode (no database):
```
# No env vars needed — users enter API keys in the UI
```

For server-side mode with database:
```
DATABASE_URL=postgresql://user:pass@host:5432/dbname
KEY_VAULTS_SECRET=<random-32-char-string>
AUTH_SECRET=<random-32-char-string>
APP_URL=https://your-app.vercel.app
```

**4. Deploy**
- Click "Deploy" — Vercel handles the rest
- Database migrations run automatically via `postbuild` script

### Vercel Limitations
- Serverless function timeout (10s free, 60s pro)
- No persistent Redis (use Upstash)
- No local filesystem (use S3 for file uploads)
- Cold starts on free tier

---

## Option B: Docker Compose (Recommended for Self-Hosted)

### Prerequisites
- VPS with 2GB+ RAM (4GB recommended)
- Docker and Docker Compose installed
- Domain name (optional but recommended)

### Steps

**1. Clone the repository**
```bash
git clone https://github.com/YOUR_USER/betterchat.git
cd betterchat
```

**2. Configure environment**
```bash
cp docker-compose/deploy/.env.example docker-compose/deploy/.env
```

Edit `.env` with your values:
```env
# Required
LOBE_PORT=3210
POSTGRES_PASSWORD=<strong-password>
LOBE_DB_NAME=lobechat
KEY_VAULTS_SECRET=<random-32-char-string>
AUTH_SECRET=<random-32-char-string>

# S3 Storage (RustFS included in compose)
RUSTFS_PORT=9000
RUSTFS_ACCESS_KEY=<access-key>
RUSTFS_SECRET_KEY=<secret-key>
RUSTFS_LOBE_BUCKET=lobe

# AI Provider Keys (add the ones you use)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
```

**3. Launch the stack**
```bash
cd docker-compose/deploy
docker compose up -d
```

This starts:
- **LobeChat** app on port 3210
- **PostgreSQL** (ParadeDB with pg_search) on port 5432
- **Redis** on port 6379
- **RustFS** (S3-compatible storage) on port 9000
- **SearXNG** (search engine) internally

**4. Access the app**
```
http://your-server-ip:3210
```

**5. (Optional) Reverse proxy with NGINX**
```nginx
server {
    listen 443 ssl;
    server_name chat.yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://127.0.0.1:3210;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # SSE support for streaming
        proxy_buffering off;
        proxy_cache off;
        proxy_set_header Connection '';
        proxy_http_version 1.1;
        chunked_transfer_encoding off;
    }
}
```

### Docker Compose Architecture

```
┌─────────────────────────────────────────────┐
│                 Host Machine                 │
│                                             │
│  ┌─────────┐  ┌──────────┐  ┌───────────┐  │
│  │ LobeChat │  │PostgreSQL│  │   Redis   │  │
│  │  :3210   │  │  :5432   │  │   :6379   │  │
│  └────┬─────┘  └─────┬────┘  └─────┬─────┘  │
│       │              │              │        │
│  ┌────┴──────────────┴──────────────┴─────┐  │
│  │           lobe-network (bridge)        │  │
│  └────┬──────────────┬────────────────────┘  │
│       │              │                       │
│  ┌────┴─────┐  ┌─────┴─────┐                │
│  │  RustFS  │  │  SearXNG  │                │
│  │  :9000   │  │ (internal)│                │
│  └──────────┘  └───────────┘                │
└─────────────────────────────────────────────┘
```

---

## Option C: Docker (Single Container)

For when you already have PostgreSQL, Redis, and S3 externally.

### Build the image
```bash
docker build -t betterchat:latest .
```

### Run
```bash
docker run -d \
  --name betterchat \
  -p 3210:3210 \
  -e DATABASE_URL="postgresql://user:pass@db-host:5432/lobechat" \
  -e REDIS_URL="redis://redis-host:6379" \
  -e KEY_VAULTS_SECRET="your-secret" \
  -e AUTH_SECRET="your-auth-secret" \
  -e S3_ACCESS_KEY_ID="your-s3-key" \
  -e S3_SECRET_ACCESS_KEY="your-s3-secret" \
  -e S3_BUCKET="lobechat" \
  -e S3_ENDPOINT="https://s3.your-provider.com" \
  betterchat:latest
```

### Multi-architecture support
The Dockerfile supports both `linux/amd64` and `linux/arm64`:
```bash
docker buildx build --platform linux/amd64,linux/arm64 -t betterchat:latest .
```

---

## Option D: Netlify

### Configuration
The repo includes `netlify.toml`:
```toml
[build]
command = "rm -rf .next node_modules/.cache && pnpm run build"
publish = ".next"

[build.environment]
NODE_OPTIONS = "--max-old-space-size=4096"
```

### Steps
1. Connect your GitHub repo to Netlify
2. Set environment variables in Netlify dashboard
3. Deploy

### Netlify Limitations
- 10-second function timeout on free tier
- Limited serverless capabilities compared to Vercel
- May require Netlify Functions adapter for API routes
- Not the primary deployment target — less tested than Vercel/Docker

---

## Option E: Bare Metal / VPS

### Prerequisites
- Node.js 24+ (or use nvm/fnm)
- pnpm 10.x
- PostgreSQL 17 with pgvector extension
- Redis 7+
- S3-compatible storage (or RustFS)

### Steps

**1. Install dependencies**
```bash
pnpm install
```

**2. Build**
```bash
NODE_OPTIONS=--max-old-space-size=8192 pnpm build
```

**3. Run database migrations**
```bash
pnpm db:migrate
```

**4. Start production server**
```bash
pnpm start
# Runs on port 3210 by default
```

**5. Process manager (recommended)**
```bash
# Using PM2
pm2 start npm --name "betterchat" -- start
pm2 save
pm2 startup
```

---

## Environment Variables Reference

### Critical (Required for Server Mode)

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/lobechat` |
| `KEY_VAULTS_SECRET` | Encryption key for API key storage | Random 32+ char string |
| `AUTH_SECRET` | Authentication secret | Random 32+ char string |
| `APP_URL` | Public URL of your deployment | `https://chat.example.com` |

### AI Providers (Add the Ones You Use)

| Variable | Provider |
|----------|----------|
| `OPENAI_API_KEY` | OpenAI |
| `ANTHROPIC_API_KEY` | Anthropic (Claude) |
| `GOOGLE_API_KEY` | Google AI (Gemini) |
| `AWS_ACCESS_KEY_ID` + `AWS_SECRET_ACCESS_KEY` | AWS Bedrock |
| `OLLAMA_PROXY_URL` | Ollama (local models) |

40+ providers are supported. See `.env.example` for the full list.

### Storage (S3-Compatible)

| Variable | Description |
|----------|-------------|
| `S3_ACCESS_KEY_ID` | S3 access key |
| `S3_SECRET_ACCESS_KEY` | S3 secret key |
| `S3_BUCKET` | Bucket name |
| `S3_ENDPOINT` | S3 endpoint URL |
| `S3_REGION` | S3 region |
| `S3_ENABLE_PATH_STYLE` | Set to `1` for RustFS/MinIO |
| `S3_SET_ACL` | Set to `0` for RustFS |

### Redis

| Variable | Description |
|----------|-------------|
| `REDIS_URL` | Redis connection string |
| `REDIS_PREFIX` | Key prefix (default: `lobechat`) |
| `REDIS_TLS` | Set to `1` for TLS connections |

### Authentication (OAuth)

| Variable | Provider |
|----------|----------|
| `AUTH_GOOGLE_ID` + `AUTH_GOOGLE_SECRET` | Google OAuth |
| `AUTH_GITHUB_ID` + `AUTH_GITHUB_SECRET` | GitHub OAuth |
| `AUTH_MICROSOFT_ENTRA_ID_*` | Microsoft Entra ID |
| `AUTH_SSO_PROVIDERS` | Comma-separated list of enabled SSO providers |

---

## Database Setup

### Option 1: ParadeDB (Recommended)
ParadeDB is PostgreSQL with built-in full-text search extensions. Used in the Docker Compose setup.

```bash
docker run -d \
  --name lobechat-db \
  -e POSTGRES_PASSWORD=your-password \
  -e POSTGRES_DB=lobechat \
  -p 5432:5432 \
  paradedb/paradedb:latest-pg17
```

### Option 2: pgvector
Standard PostgreSQL with vector extension (used in dev setup).

```bash
docker run -d \
  --name lobechat-db \
  -e POSTGRES_PASSWORD=your-password \
  -e POSTGRES_DB=lobechat \
  -p 5432:5432 \
  pgvector/pgvector:pg17
```

### Option 3: Managed Database
- **Neon** (serverless, free tier) — good for Vercel deployments
- **Supabase** (managed Postgres, free tier)
- **Vercel Postgres** — tight Vercel integration
- **AWS RDS** — production scale

Ensure `pgvector` extension is available on your managed provider.

### Running Migrations
```bash
# Automatic (runs during build)
pnpm postbuild

# Manual
MIGRATION_DB=1 tsx ./scripts/migrateServerDB/index.ts
```

---

## S3 Storage Setup

File uploads require S3-compatible storage. Options:

| Provider | Self-Hosted | Notes |
|----------|-------------|-------|
| **RustFS** | Yes | Included in Docker Compose, MinIO-compatible |
| **MinIO** | Yes | Well-known S3-compatible storage |
| **Cloudflare R2** | No | Free egress, good pricing |
| **AWS S3** | No | Standard, reliable |
| **Backblaze B2** | No | Cheap storage |

For Docker Compose, RustFS is preconfigured. For other deployments, configure the `S3_*` environment variables.

---

## Authentication Setup

### Client-Side Mode (No Auth)
Users enter their own API keys in the browser. Keys stored in localStorage. No database needed. Good for personal use.

### Server-Side Mode (With Auth)
Requires `DATABASE_URL`, `AUTH_SECRET`, and at least one OAuth provider or email auth.

**Enable OAuth providers:**
```env
AUTH_SSO_PROVIDERS=google,github
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret
AUTH_GITHUB_ID=your-github-client-id
AUTH_GITHUB_SECRET=your-github-client-secret
```

**Enable email auth:**
```env
SMTP_HOST=smtp.resend.com
SMTP_PORT=465
SMTP_USERNAME=resend
SMTP_PASSWORD=re_...
SMTP_FROM=noreply@yourdomain.com
```

---

## Post-Deployment Checklist

- [ ] App loads at your URL
- [ ] Can create a new conversation
- [ ] Can enter API key (client mode) or sign in (server mode)
- [ ] Can send a message and receive a streamed response
- [ ] File uploads work (if S3 configured)
- [ ] Database migrations ran without errors (check logs)
- [ ] HTTPS is configured (if public-facing)
- [ ] Reverse proxy handles SSE/streaming correctly (no buffering)
- [ ] Redis connected (check app logs for connection errors)
- [ ] Search works (if SearXNG configured)

---

## Updating

### Docker Compose
```bash
cd docker-compose/deploy
docker compose pull
docker compose up -d
# Migrations run automatically on startup
```

### Vercel
Push to your main branch. Vercel auto-deploys.

### Manual
```bash
git pull origin main
pnpm install
pnpm build
pnpm db:migrate
# Restart your process manager
```

---

## Troubleshooting

### Build fails with OOM
Increase Node memory: `NODE_OPTIONS=--max-old-space-size=8192`

### Streaming responses cut off
Ensure your reverse proxy has buffering disabled:
```nginx
proxy_buffering off;
proxy_cache off;
```

### Database migration errors
Check that your PostgreSQL version is 17+ and has pgvector installed:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### File uploads fail
Verify S3 configuration. For RustFS/MinIO, ensure `S3_ENABLE_PATH_STYLE=1` and `S3_SET_ACL=0`.
