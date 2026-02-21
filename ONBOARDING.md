# Developer Onboarding Guide

> Getting started with the Enhanced AI Chat Frontend (LobeChat fork)

---

## Quick Start (5 Commands)

```bash
git clone https://github.com/YOUR_ORG/betterchat.git
cd betterchat
pnpm install
cp .env.example .env   # Edit with your API keys
bun run dev             # Opens at http://localhost:3010
```

---

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 24+ | `fnm install 24` or [nodejs.org](https://nodejs.org) |
| pnpm | 10.x | `npm install -g pnpm@10` |
| bun | Latest | `curl -fsSL https://bun.sh/install \| bash` |
| Docker | Latest | For database/services in dev |

**Why both pnpm and bun?**
- `pnpm` manages dependencies (install, workspace resolution)
- `bun` runs scripts (faster than npm/node for script execution)
- `bunx` replaces `npx` for running executables

---

## Project Architecture

### Monorepo Layout

```
betterchat/
├── src/                        # Main Next.js application
│   ├── app/                    # Next.js App Router (pages, API routes)
│   ├── components/             # 90+ React components
│   ├── features/               # 80+ feature modules
│   ├── store/                  # Zustand state stores (20+ stores)
│   ├── services/               # Client-side service layer
│   ├── server/                 # Server-side services, tRPC routers
│   ├── locales/                # Default i18n translations (source of truth)
│   ├── libs/                   # Library integrations (auth, redis, mcp, etc.)
│   ├── hooks/                  # Custom React hooks
│   ├── tools/                  # AI tool implementations
│   └── types/                  # Shared TypeScript types
├── packages/                   # Shared npm packages (~40 packages)
│   ├── agent-runtime/          # Agent execution runtime
│   ├── model-runtime/          # LLM provider integrations
│   ├── database/               # Drizzle ORM schemas, models, repositories
│   ├── builtin-tool-*/         # Built-in tool packages
│   ├── builtin-agents/         # Built-in agent definitions
│   ├── prompts/                # Prompt templates and chains
│   └── ...
├── locales/                    # i18n translations (18 languages)
├── apps/desktop/               # Electron desktop app
├── e2e/                        # End-to-end tests (Cucumber + Playwright)
├── docker-compose/             # Docker configurations
└── scripts/                    # Build and utility scripts
```

### Key Technologies

| Layer | Technology | Where |
|-------|-----------|-------|
| Framework | Next.js 16 (App Router) | `src/app/` |
| UI | React 19 + @lobehub/ui + Ant Design | `src/components/`, `src/features/` |
| Styling | antd-style (CSS-in-JS) | Throughout components |
| State | Zustand | `src/store/` |
| Routing | react-router-dom (SPA inside Next.js) | `src/app/[variants]/router/` |
| Data Fetching | SWR + tRPC | `src/services/`, `src/server/routers/` |
| Database | Drizzle ORM + PostgreSQL | `packages/database/` |
| i18n | react-i18next | `src/locales/`, `locales/` |
| Testing | Vitest | `**/__tests__/` |
| AI Runtime | Custom agent runtime | `packages/agent-runtime/` |

### How Routing Works

This project uses an unusual pattern: **react-router-dom inside Next.js**. Next.js handles the server-side rendering and API routes, but client-side navigation is managed by react-router-dom as an SPA. The entry point is `src/app/[variants]/` which captures all routes and delegates to the SPA router.

### How State Management Works

Zustand stores in `src/store/` follow a consistent pattern:
- Each store has **slices** (sub-stores for different concerns)
- Slices define **actions** (methods that modify state)
- Actions are separated into files: `action.ts`, `reducer.ts`, `selectors.ts`
- Stores are composed in an `index.ts` that combines slices

Example: `src/store/chat/` has slices for messages, topics, sharing, etc.

### How AI Tools Work

The tool system follows this flow:
1. Tool definitions in `packages/builtin-tool-*/` define what the AI can call
2. Tool schemas are sent with the API request to the LLM
3. LLM responds with tool calls
4. Frontend renders matching widget components from `src/tools/`
5. User interaction flows back as tool results

This is the same pattern Claude.ai uses internally. Every interactive widget is backed by a tool.

---

## Development Workflow

### Running the Dev Server

```bash
# Start the Next.js dev server (port 3010)
bun run dev
```

For database-dependent features, start the infrastructure first:
```bash
# Start PostgreSQL, Redis, RustFS, SearXNG via Docker
bun run dev:docker

# Then start the dev server
bun run dev
```

### Running Tests

```bash
# Run a specific test file (NEVER run `bun run test` — it takes ~10 minutes)
bunx vitest run --silent='passed-only' src/store/chat/__tests__/someTest.test.ts

# Run tests for a package
cd packages/database && bunx vitest run --silent='passed-only' src/some.test.ts

# Type checking
bun run type-check
```

### Database Operations

```bash
# Run migrations
bun run db:migrate

# Generate new migration after schema changes
bun run db:generate

# Open Drizzle Studio (database GUI)
bun run db:studio
```

### Linting

```bash
# Full lint (TypeScript + style + circular deps)
bun run lint

# Individual checks
bun run lint:ts        # ESLint
bun run lint:style     # Stylelint
bun run type-check     # TypeScript compiler
bun run lint:circular  # Circular dependency detection
```

### i18n

- Add new translation keys to `src/locales/default/<namespace>.ts`
- For dev preview, translate into `locales/zh-CN/` and `locales/en-US/`
- Do NOT run `pnpm i18n` locally — CI handles full translation sync

---

## Common Tasks

### Adding a New Feature

1. Create feature module in `src/features/YourFeature/`
2. Add state to appropriate Zustand store in `src/store/`
3. Add service layer in `src/services/` if API calls needed
4. Add server route in `src/server/routers/` if backend logic needed
5. Wire up in the router at `src/app/[variants]/router/`
6. Add i18n keys to `src/locales/default/`

### Adding a New AI Tool

1. Create package in `packages/builtin-tool-your-tool/`
2. Define tool schema and system role
3. Add frontend renderer in `src/tools/your-tool/`
4. Register in the tool registry

### Modifying Database Schema

1. Edit schema in `packages/database/src/schemas/`
2. Run `bun run db:generate` to create migration
3. Run `bun run db:migrate` to apply
4. Update repository/model code in `packages/database/src/repositories/`

---

## Environment Setup

### Minimal (.env for client-side mode)

```env
# No env vars needed for basic client-side mode
# Users enter API keys in the UI
```

### Full (.env for server-side mode)

```env
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/lobechat

# Security
KEY_VAULTS_SECRET=your-32-char-secret
AUTH_SECRET=your-auth-secret
APP_URL=http://localhost:3010

# AI Providers (add what you use)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Redis (for caching/queues)
REDIS_URL=redis://localhost:6379

# S3 Storage (for file uploads)
S3_ACCESS_KEY_ID=your-key
S3_SECRET_ACCESS_KEY=your-secret
S3_BUCKET=lobe
S3_ENDPOINT=http://localhost:9000
S3_ENABLE_PATH_STYLE=1
```

---

## Git Conventions

### Commit Messages
Use gitmoji prefixes:
```
✨ feat: Add response option chips
🐛 fix: Resolve streaming cutoff on long messages
♻️ refactor: Extract paste handler to hook
🧪 test: Add tests for file browser component
📝 docs: Update deployment guide
```

### Branch Naming
```
feat/inline-image-references
fix/streaming-timeout
refactor/paste-handler
```

### Pull Requests
- PR titles with `✨ feat/` or `🐛 fix` trigger releases via semantic-release
- Keep PRs focused — one feature or fix per PR

---

## Key Files to Know

| File | Purpose |
|------|---------|
| `next.config.ts` | Next.js configuration, webpack overrides |
| `src/app/[variants]/` | Main SPA entry point |
| `src/store/chat/` | Core chat state management |
| `src/features/Conversation/` | Main conversation UI |
| `src/features/ChatInput/` | Chat input component |
| `packages/agent-runtime/` | AI model interaction layer |
| `packages/database/` | All database schemas and queries |
| `src/server/routers/` | tRPC API routes |
| `src/locales/default/` | English translation source files |
| `Dockerfile` | Production Docker image |
| `.env.example` | All available environment variables |

---

## Getting Help

- Check existing issues on the repository
- Review the original LobeChat documentation at [lobehub.com/docs](https://lobehub.com/docs)
- Run `bun run db:studio` to inspect database state
- Check Docker logs: `docker compose -f docker-compose/dev/docker-compose.yml logs -f`
