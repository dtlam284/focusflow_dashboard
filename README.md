# FocusFlow Dashboard

A modern productivity dashboard for managing **tasks**, **notes**, and **useful links** in one place.

---

## Project Overview

FocusFlow Dashboard helps users manage three core workflows:

- **Tasks** — create, edit, delete, search, filter, and track completion
- **Notes** — create notes, pin important ones, and organize content visually
- **Links** — save useful resources, categorize them, and open them safely

---

## Tech Stack

### Core
- React
- TypeScript
- Vite

### State Management
- Redux Toolkit
- React Redux

### Routing
- React Router

### Forms and Validation
- React Hook Form
- Zod
- `@hookform/resolvers`

### Styling and UI
- Tailwind CSS
- reusable UI primitives and shared components

### Persistence and Preferences
- localStorage
- persisted feature data and user preferences

### Testing
- Vitest
- React Testing Library
- `@testing-library/user-event`
- jsdom

### Tooling
- ESLint
- Prettier

---

## Main Features

### 1. Task Management
- Create, edit, delete, and toggle task status
- Filter by status and priority
- Search by title and description
- Derived task metrics such as total, completed, pending, and unfinished
- Empty states and validation feedback

### 2. Notes Management
- Create, edit, delete, pin, and unpin notes
- Pinned notes are prioritized in the UI
- Search by title and content
- Empty states and validation feedback

### 3. Links Management
- Add and delete useful links
- Filter by category
- Search by title, category, and URL
- Safe open in new tab
- URL validation and compact card/list UI

### 4. Dashboard Summary
- Total tasks
- Completed tasks
- Pending tasks
- Unfinished tasks
- Pinned notes count
- Saved links count

### 5. Theme Toggle
- Light mode
- Dark mode
- Persisted theme preference
- Global theme provider

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### 1. Clone the repository

```bash
git clone https://github.com/dtlam284/focusflow_dashboard.git
cd focusflow_dashboard
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the development server

```bash
npm run dev
```

Expected result:
- Vite dev server starts successfully
- the app is available on the local URL shown in the terminal

---

## Available Scripts

```bash
npm run dev
npm run build
npm run lint
npm run typecheck
npm run test
npm run test:run
npm run format
npm run format:check
```

### Script Summary
- `npm run dev` — start the development server
- `npm run build` — build the project for production
- `npm run lint` — run ESLint
- `npm run typecheck` — run TypeScript checks
- `npm run test` — run Vitest in watch mode
- `npm run test:run` — run Vitest once
- `npm run format` — format files with Prettier
- `npm run format:check` — verify formatting without changing files

---

## Architecture Overview

The project follows a **feature-first structure** for business domains and keeps app-wide infrastructure separate.

### High-Level Structure

```txt
src/
  app/                    # store, typed hooks, router, app-level wiring
  components/
    ui/                   # primitive reusable UI components
    shared/               # reusable composed components
  contexts/               # auth, i18n, theme, and app-wide context providers
  features/
    tasks/                # task domain: types, slice, selectors, schemas, UI
    notes/                # note domain: types, slice, selectors, schemas, UI
    links/                # link domain: types, slice, selectors, schemas, UI
  hooks/                  # reusable hooks
  screens/                # route-level screen composition
  tests/                  # Vitest + RTL tests
  utils/                  # pure helpers and persistence utilities
```

### Structure Principles
- **Feature-first for business logic**  
  Tasks, notes, and links are organized by domain ownership.

- **Primitive vs shared UI separation**  
  `components/ui` contains low-level reusable building blocks.  
  `components/shared` contains reusable composed components.

- **Thin screens**  
  Screens focus on layout and composition, while logic lives in slices, selectors, hooks, and schemas.

- **Selectors for derived state**  
  Filtered lists, dashboard metrics, and other computed values are derived from selectors.

- **Schemas for validation**  
  Forms use RHF + Zod with validation contracts separated from component rendering.

---

## Key Technical Decisions

### 1. Feature-First Architecture
The codebase is organized by feature to keep related types, state, selectors, schemas, and UI close together.
This reduces scatter and makes the project easier to maintain and extend.

### 2. Redux Toolkit for Shared Client State
Redux Toolkit is used for shared client-side state such as:
- tasks
- notes
- links
- app-level state where appropriate

Typed hooks (`useAppDispatch`, `useAppSelector`) keep usage consistent across the app.

### 3. Derived State Through Selectors
The app avoids storing duplicate data such as:
- filtered items
- dashboard summary counts
- completed or pending metrics

These are computed through selectors so the store stays simpler and more reliable.

### 4. Schema-Driven Forms
Forms are built with React Hook Form + Zod so validation rules are:
- centralized
- reusable
- easier to maintain
- aligned between create and edit flows

### 5. Persistence Strategy
Important user data is persisted so refresh does not wipe the workspace.
At the same time, transient UI state such as modal visibility or temporary input typing is not persisted.

### 6. Global Theme Preference
Theme is treated as a global user preference and handled centrally, rather than scattering theme logic across many components.

### 7. Testing Focused on Behavior
Tests prioritize:
- reducer logic
- selector correctness
- form validation behavior

This provides better confidence than low-value snapshot testing.

---

## UI and UX State Strategy

The app includes product-level UX states such as:

- **empty states** with useful guidance
- **loading states** for route/auth boot flows
- **form validation messages** near the related fields
- **safe storage parsing** to avoid crashes from malformed local data
- **responsive layouts** for basic mobile usability

This helps the project feel closer to a real product rather than a minimal CRUD demo.

---

## Testing

The project includes automated tests for meaningful app behavior, including:
- reducer tests
- selector tests
- form validation interaction tests

Run tests with:

```bash
npm run test
```

Or run once without watch mode:

```bash
npm run test:run
```

---

## Limitations

This project is intentionally frontend-focused, so a few limitations still remain:

- No real backend or API integration yet
- Data is currently local-first
- Authentication flow is not production-grade
- Testing coverage is meaningful but not exhaustive
- Accessibility can still be improved further
- Demo assets such as screenshots or GIFs are not yet included in the repo

---

## Future Improvements

Possible next steps:
- connect to a real backend/API
- add proper authentication and authorization flows
- add richer dashboard analytics/widgets
- improve accessibility and keyboard support
- expand test coverage with more interaction and integration tests
- add deployment instructions
- add screenshots or a short demo GIF
- improve onboarding/help states for first-time users

---

## Handoff Notes

If you are reviewing this repository, a good place to start is:

1. **`src/features/`** — domain logic for tasks, notes, and links
2. **`src/app/`** — store, router, and application wiring
3. **`src/screens/`** — route-level UI composition
4. **`src/tests/`** — automated test coverage

---

## Contact

For questions or contributions, please open an issue or contact:

- 📧 Email: [zinmrx04@gmail.com](zinmrx04@gmail.com)
- 💻 GitHub: [dtlam284](https://github.com/dtlam284)
