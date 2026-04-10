# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Initial setup (install deps, generate Prisma client, run migrations)
npm run setup

# Development server (Turbopack)
npm run dev

# Build for production
npm run build

# Run all tests
npm test

# Run a single test file
npx vitest run src/lib/__tests__/file-system.test.ts

# Lint
npm run lint

# Reset database
npm run db:reset

# Regenerate Prisma client after schema changes
npx prisma generate

# Run new migrations
npx prisma migrate dev
```

The dev server requires `NODE_OPTIONS=--require ./node-compat.cjs` (already set in npm scripts) due to Node.js compatibility shims for Next.js 15 on Windows.

## Architecture

UIGen is a Next.js 15 App Router application that lets users describe React components in a chat, which Claude then generates and renders live in a browser preview — all without writing any files to disk.

### Virtual File System

The central abstraction is `VirtualFileSystem` (`src/lib/file-system.ts`). It's an in-memory tree of `FileNode` objects. All generated code lives here. It serializes to/from plain JSON (`serialize()`/`deserializeFromNodes()`) for persistence and API transport. The AI model mutates this FS via two tools: `str_replace_editor` and `file_manager` (defined in `src/lib/tools/`).

### Live Preview Pipeline

`src/lib/transform/jsx-transformer.ts` converts the virtual FS into a running app:
1. Each `.jsx`/`.tsx` file is transformed via `@babel/standalone` (browser-side Babel).
2. Transformed modules are turned into `blob:` URLs.
3. An import map is built mapping `@/` aliases and bare specifiers (resolved to `esm.sh`) to blob URLs.
4. `createPreviewHTML()` produces a full HTML document with the import map and a `<script type="module">` that dynamically imports `/App.jsx` and mounts it into `#root`.

Third-party packages not in the VFS are automatically mapped to `https://esm.sh/<package>`.

### AI Integration

- `src/app/api/chat/route.ts` — the streaming POST endpoint. It uses Vercel AI SDK's `streamText`, passes the current VFS state and conversation history to the model, and runs up to 40 agentic steps.
- `src/lib/provider.ts` — `getLanguageModel()` returns `anthropic("claude-haiku-4-5")` when `ANTHROPIC_API_KEY` is set, or a `MockLanguageModel` otherwise. The mock produces hardcoded Counter/Form/Card components for dev without an API key.
- `src/lib/prompts/generation.tsx` — system prompt instructing the model to always create `/App.jsx` as the entry point and use `@/` imports.

### React Contexts (Client State)

- `FileSystemProvider` (`src/lib/contexts/file-system-context.tsx`) — wraps the VirtualFileSystem instance, exposes CRUD helpers, and handles `handleToolCall` which applies `str_replace_editor` and `file_manager` tool calls to the VFS.
- `ChatProvider` (`src/lib/contexts/chat-context.tsx`) — wraps Vercel AI SDK's `useChat`, sends the serialized VFS with every request, and calls `handleToolCall` on each streaming tool call so file changes appear live.

### Auth & Persistence

- JWT-based auth via `jose`, stored in an httpOnly cookie (`src/lib/auth.ts`).
- Prisma + SQLite (`prisma/schema.prisma`): two models — `User` and `Project`. A `Project` stores messages (JSON string) and VFS data (JSON string).
- Authenticated users get redirected to their most recent project at `/<projectId>`. Anonymous users work on an ephemeral session stored in `sessionStorage` via `src/lib/anon-work-tracker.ts`.
- Middleware (`src/middleware.ts`) protects `/api/projects` and `/api/filesystem`.

### UI Layout

`src/app/main-content.tsx` is the root client component: a resizable two-panel layout (Chat left, Preview/Code right). The right panel toggles between `PreviewFrame` and a resizable editor split (FileTree + CodeEditor using Monaco).

Generated Prisma client is output to `src/generated/prisma/`.

### Database

Schema is defined in `prisma/schema.prisma`. Always refer to it when reasoning about stored data, model relationships, or field types.

### Key Conventions

- All generated component files use `.jsx`/`.tsx` (not `.js`/`.ts`).
- The entry point for the preview is always `/App.jsx`.
- Internal imports use the `@/` alias (maps to the VFS root `/`).
- Tests use Vitest with jsdom environment; test files live in `__tests__/` subdirectories next to the code they test.
