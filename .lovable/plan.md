## AI Workplace Productivity Assistant

A SaaS-style dashboard with 5 AI-powered tools (Email Generator, Meeting Summarizer, Task Planner, Research Assistant, Chatbot), built on TanStack Start + Lovable AI Gateway. No login — single-user, browser-local.

### Stack & setup
- Enable Lovable AI Gateway (model: `google/gemini-3-flash-preview`)
- No auth, no database — all state in `localStorage`
- shadcn/ui, Tailwind, Inter font, design tokens from spec (#2563EB primary, #0F172A secondary, #38BDF8 accent, #F8FAFC bg)

### Routes (all public)
- `/` — Dashboard (KPI cards + Quick Actions)
- `/email` — Smart Email Generator
- `/summarize` — Meeting Notes Summarizer
- `/planner` — AI Task Planner
- `/research` — Research Assistant
- `/chat` — Redirects to active/new thread
- `/chat/$threadId` — Threaded chat
- `/settings` — Preferences (theme, clear data)

### Storage (localStorage)
- `wpa:generations` — array of `{ id, type: email|summary|plan|research, input, output, createdAt }` powers KPI counters and recent history
- `wpa:chat:threads` — `[{ id, title, updatedAt }]`
- `wpa:chat:messages:<threadId>` — AI SDK `UIMessage[]` per thread
- Idempotent bootstrap on first render (guarded against StrictMode double-mount)

### AI server functions (`src/lib/ai.functions.ts`)
Each uses `createServerFn`, calls Lovable AI Gateway with the structured prompts from the spec, returns text. Client persists results to localStorage and bumps KPI counts.
- `generateEmail({ recipient, subject, purpose, tone })`
- `summarizeNotes({ notes })`
- `planTasks({ tasks, hours, priority })`
- `researchTopic({ topic })`

### Chat
- Threaded, localStorage-persisted per browser
- Real route `/chat/$threadId`, thread sidebar with new/delete (no nested buttons)
- Streaming via `/api/chat` server route + `useChat` (AI SDK)
- Install AI Elements: `conversation message prompt-input shimmer`
- Suggested prompts on empty state; textarea autofocuses

### Shared UI
- `AppSidebar` (shadcn sidebar, collapsible) with nav items + logo
- `KpiCard`, `QuickActionCard` for dashboard
- `EditableAIOutput`: editable textarea + Copy / Save (download .txt) / Regenerate
- `ResponsibleAINotice` shown under every AI result
- Header with `SidebarTrigger`

### Design
- Inter via Google Fonts
- Tailwind tokens in `src/styles.css` updated to spec palette (oklch equivalents)
- Rounded cards, soft shadows, generous spacing
- Responsive: sidebar collapses on tablet, off-canvas on mobile

### Out of scope (v1)
- Drag-and-drop task editing (render schedule as styled list with priority badges)
- Calendar/PDF export (download as plain text)
- File upload for meeting notes (textarea paste only)

### Build order
1. Enable AI Gateway, update design tokens + Inter font, install AI Elements
2. AppSidebar shell, root layout, dashboard skeleton
3. AI server functions + shared `EditableAIOutput` + `ResponsibleAINotice` + localStorage helpers
4. Email, Summarizer, Planner, Research pages
5. Chat: `/api/chat` route, threads list, `/chat/$threadId`
6. Dashboard KPI wiring from localStorage
7. Settings (clear data) + responsive polish