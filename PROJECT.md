# Mockup Viewer

A self-hosted viewer for work mockups, deployed to GitHub Pages at `dan-niles.github.io/mockups`. Built with React, TypeScript, Tailwind CSS v4, and Vite.

Each mockup lives at its own URL and is fully self-contained — you can drop in AI-generated code from Figma AI, v0, or any other source with minimal changes.

---

## URLs

| URL | Description |
|-----|-------------|
| `/mockups` | Landing page — lists all mockups |
| `/mockups/:slug` | Redirects to the latest version of that mockup |
| `/mockups/:slug/:version` | Renders a specific version of a mockup |

The `BrowserRouter` in `App.tsx` is configured with `basename="/mockups"`, so all routes within the app are relative to that base path.

GitHub Pages doesn't natively support client-side routing, so a `public/404.html` catches unknown paths and redirects them back through `index.html` via a query string trick. A corresponding script in `index.html` decodes that and restores the correct URL before React boots.

---

## Project Structure

```
src/
  mockups/
    _registry.ts              ← central registry of all mockups
    <mockup-slug>/
      index.tsx               ← mockup entry point
      components/             ← mockup-scoped components (self-contained)
        ui/                   ← shadcn/ui wrapper components if needed
  pages/
    MockupIndex.tsx           ← landing page (auto-built from registry)
  App.tsx                     ← router + floating nav control
  index.css                   ← Tailwind import + dark mode variant
  main.tsx                    ← React root
public/
  404.html                    ← GitHub Pages SPA redirect handler
index.html                    ← SPA redirect decoder script
```

Each mockup folder is **completely self-contained** — its own components, assets, mock data, and UI primitives. Nothing is shared between mockups. This makes it safe to copy-paste code directly from AI tools without worrying about naming conflicts.

---

## Registry

`src/mockups/_registry.ts` is the single file you edit when adding or updating a mockup.

### Types

```ts
interface MockupVersion {
  version: string       // e.g. 'v1', 'v2'
  label?: string        // optional display label, e.g. 'Redesign' — falls back to version.toUpperCase()
  component: React.LazyExoticComponent<ComponentType>
}

interface MockupEntry {
  slug: string          // URL segment, e.g. 'bi-data-tree' → /mockups/bi-data-tree
  name: string          // display name on the index page
  description: string   // subtitle shown on the card
  versions: MockupVersion[]
}
```

### Example

```ts
{
  slug: 'bi-data-tree',
  name: 'Data Tree',
  description: 'A data tree for the expression editor in WSO2 Integrator: BI',
  versions: [
    { version: 'v1', component: lazy(() => import('./bi-data-tree/index')) },
  ],
}
```

All components are **lazy-loaded** — Vite code-splits each version into its own chunk, so the landing page loads fast regardless of how many mockups exist.

---

## Adding a New Mockup

**1. Create the folder and entry point:**

```
src/mockups/your-mockup-name/
  index.tsx
  components/       ← optional, add as needed
```

`index.tsx` should be a default export of a React component. No special wrapper or interface needed.

**2. Register it in `_registry.ts`:**

```ts
{
  slug: 'your-mockup-name',
  name: 'Your Mockup Name',
  description: 'What it shows',
  versions: [
    { version: 'v1', component: lazy(() => import('./your-mockup-name/index')) },
  ],
}
```

That's it. The landing page card and routing are automatic.

---

## Version System

Versions are an ordered array inside each registry entry. The **last item in the array is always treated as the latest**.

```ts
versions: [
  { version: 'v1', component: lazy(() => import('./dashboard/v1/index')) },
  { version: 'v2', component: lazy(() => import('./dashboard/v2/index')) },
  { version: 'v3', label: 'Final', component: lazy(() => import('./dashboard/v3/index')) },
]
```

**Routing behaviour:**
- `/mockups/dashboard` → redirects to `/mockups/dashboard/v3` (latest)
- `/mockups/dashboard/v1` → renders v1 directly
- Invalid version in URL → redirects to latest

**Recommended folder structure for versioned mockups:**

```
src/mockups/dashboard/
  v1/
    index.tsx
    components/
  v2/
    index.tsx
    components/
```

Single-version mockups can keep their files flat (`index.tsx` directly in the slug folder).

**Index page** shows a "N versions" badge on cards that have more than one version.

**Version switcher** appears as a floating pill in the bottom-left corner of the viewport when viewing a mockup. At rest it's nearly invisible (a faint `←` arrow). On hover it expands to show "← All Mockups" and version tabs for switching between versions. This avoids the switcher distracting from the mockup content.

---

## Using AI-Generated Mockups (Figma AI, v0, etc.)

### Radix UI / shadcn components

Figma AI and v0 output shadcn/ui components which depend on:

- **Radix UI primitives** (`@radix-ui/react-*`) — installed globally in `package.json`, covers all common primitives
- **`clsx`**, **`tailwind-merge`**, **`class-variance-authority`** — installed globally, used by shadcn's `cn()` utility

Shadcn wrapper components (`button.tsx`, `avatar.tsx`, `dialog.tsx`, etc.) are **copy-pasted per mockup** into `components/ui/`. Each mockup that needs them gets its own copy, keeping things self-contained.

Each `components/ui/` folder needs a `utils.ts` with the `cn` helper:

```ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### `"use client"` directive

Files from Next.js-based tools (v0, shadcn CLI) include `"use client"` at the top. Vite ignores this harmlessly — you don't need to remove it.

### CSS variables / theming

shadcn components use CSS variables like `--background`, `--foreground`, `--muted`, etc. If a pasted mockup looks unstyled, you may need to add a shadcn theme block to that mockup's CSS or inline it into `index.css`. See the [shadcn theming docs](https://ui.shadcn.com/docs/theming) for the full variable list.

---

## Dark Mode

The landing page (`MockupIndex.tsx`) supports dark mode:

- **Default**: respects the OS `prefers-color-scheme` setting
- **Toggle**: sun/moon button in the top-right corner of the landing page
- **Persistence**: preference is saved to `localStorage`

Dark mode is implemented via a `dark` class on `<html>`, enabled through a Tailwind v4 `@custom-variant` in `index.css`:

```css
@import "tailwindcss";
@custom-variant dark (&:where(.dark, .dark *));
```

Individual mockups can opt into the dark mode class by using `dark:` Tailwind prefixes — the class is on `<html>` so it cascades everywhere. However, since most AI-generated mockups won't include dark mode, there's no expectation that mockup content respects it.

---

## Tech Stack

| Package | Role |
|---------|------|
| React 19 | UI framework |
| TypeScript | Type safety |
| Vite 7 | Build tool + dev server |
| Tailwind CSS v4 (`@tailwindcss/vite`) | Styling — no config file, Vite-native |
| `react-router-dom` v7 | Client-side routing |
| `lucide-react` | Icons |
| `@radix-ui/react-*` | Headless UI primitives (for pasted shadcn components) |
| `clsx` + `tailwind-merge` | `cn()` utility used by shadcn components |
| `class-variance-authority` | `cva()` used by shadcn components |

---

## Deployment

Hosted on GitHub Pages via `.github/workflows/deploy.yml`. Triggers on every push to `main`.

The workflow:
1. Checks out the repo
2. Installs dependencies with `npm ci` (requires `package-lock.json` to be committed)
3. Runs `npm run build` → outputs to `dist/`
4. Uploads `dist/` as a Pages artifact and deploys

Vite is configured with `base: '/mockups'` in `vite.config.ts` to match the GitHub Pages subpath.
