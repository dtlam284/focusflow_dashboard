# FocusFlow Dashboard

A React + TypeScript frontend project bootstrapped with Vite.

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- Redux Toolkit + React Redux
- React Router
- React Hook Form + Zod
- Vitest + Testing Library
- ESLint + Prettier

## Prerequisites

- Node.js 18+
- npm 9+

## Install dependencies

```bash
npm install
```

## Run development server

```bash
npm run dev
```

Expected result:
- Vite dev server starts successfully
- Local app is available at `http://localhost:5173`

## Build for production

```bash
npm run build
```

Expected result:
- production build completes successfully

## Run type check

```bash
npm run typecheck
```

Expected result:
- no TypeScript errors

## Run lint

```bash
npm run lint
```

Expected result:
- ESLint completes without errors

## Run tests

```bash
npm run test:run
```

Expected result:
- test suite runs successfully

## Format code

```bash
npm run format
npm run format:check
```

## Project structure

```txt
src/
  components/
  hooks/
  services/
  store/
  models/
  utils/
  styles/
  contexts/
  config/
  constants/
```

## Notes

- Alias import is configured with `@` pointing to `src`
- Tailwind CSS is configured through Vite plugin setup
- Vitest uses `jsdom` environment
- ESLint and Prettier are both configured