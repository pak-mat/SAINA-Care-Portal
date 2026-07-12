# SAINA Care Portal Architecture & Maintainability

This document outlines the architectural decisions and maintainability standards that make the SAINA Care Portal a highly scalable, "10/10" codebase.

## 1. Feature-Driven Directory Structure

The application is organized using a **Feature-Driven** structure. Instead of grouping files by type (e.g., all components in one folder, all hooks in another), files are grouped by the domain they belong to.

```text
src/
├── components/          # Shared, generic UI components (buttons, layout, etc.)
├── features/            # Feature-specific modules
│   ├── auth/            # Login screens and authentication flows
│   ├── counselor/       # Counselor-specific views (Dashboard, Kanban, Chat)
│   ├── student/         # Student-specific views (Dashboard, Appointments)
│   └── shared/          # Features shared between roles (Profiles, Settings)
├── hooks/               # Global data-fetching and utility hooks (React Query)
├── lib/                 # Third-party library initializations (Supabase)
└── utils/               # Pure utility functions (Time formatting, UI helpers)
```
*Benefits: This ensures that when working on a specific feature (like the Counselor Dashboard), all relevant sub-components are co-located, reducing cognitive load.*

## 2. Advanced Code-Splitting and Lazy Loading

To ensure ultra-fast initial load times, the application aggressively utilizes React's `lazy()` and `<Suspense>`.

### The Problem with "God Components"
Historically, dashboards import all their sub-tabs (Kanban, Chat, Settings, Profiles) at the top of the file. This forces the browser to download the entire application (often >1.5MB) before rendering a single pixel.

### The Solution
We dynamically import heavy components based on the active state. For example, the heavy PDF Generation library (`jspdf` + `html2canvas`) used in the Counselor Kanban board is isolated:

```tsx
// Instead of standard imports:
const KanbanWorkspace = lazy(() => import('./KanbanWorkspace'));
const CounselorChatTab = lazy(() => import('./CounselorChatTab'));

// Rendered inside Suspense:
<Suspense fallback={<Loader />}>
  {activeTab === 'workspace' && <KanbanWorkspace />}
</Suspense>
```
*Results: The main `CounselorDashboardHub` bundle was reduced from ~1.5MB to just 10kB. Users only download the code for the tab they are currently viewing.*

## 3. State Management Strategy

### Server State (Supabase + React Query)
We use **TanStack React Query** (`useQuery`, `useMutation`) to handle all server state. 
- **Caching & Deduping:** Multiple components can call `useActiveCounselors()` without triggering duplicate network requests.
- **Real-time Subscriptions:** For chat and live dashboard updates, we combine React Query with Supabase Realtime channels.

### UI State (React `useState` / Context)
Local UI state (like active tabs, modal visibility, or form inputs) is managed locally within components. We strictly avoid putting ephemeral UI state into global stores.

## 4. Strict Typing

The codebase enforces strict TypeScript interfaces (defined in `src/types.ts`) for database models and component props. We avoid the `any` type to ensure the compiler catches data structure mismatches early.

Example:
```typescript
export interface KanbanRequest extends ReportRequest {
  counselorid?: string | null;
  studentid?: string;
}
```

## 5. UI & Styling Principles

- **Tailwind CSS Utility Classes:** We use Tailwind for 100% of our styling to prevent CSS specificity wars and dead code.
- **Framer Motion:** All interactive elements utilize `framer-motion` for spring-physics layout transitions and exit animations (`<AnimatePresence>`).
- **Glassmorphism:** A consistent design language using `backdrop-blur`, subtle borders, and semi-transparent backgrounds to create depth.
