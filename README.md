# Udemy Svelte 5 and SvelteKit

My solutions for the Udemy course "Master Svelte 5 & SvelteKit – Build & Deploy Real-World Apps": one self-contained
SvelteKit 3 + Svelte 5 (runes) + TypeScript app per project, each with its own Vitest + Testing Library tests. External
services (Stripe, SendGrid, Sanity, Supabase, OpenAI) are mocked in the tests, so everything runs without accounts.

| #   | Section                 | Project                                                                                         | Covers                                                                                    |
| --- | ----------------------- | ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| 001 | SvelteKit data flow     | [Blog-App](001-SvelteKit-Data-Flow/Blog-App)                                                    | file-based routing, `load` functions, route params, `error()` for missing posts           |
| 002 | Project: Ebook Landing  | [Ebook-Landing](002-Project-Ebook-Landing/Ebook-Landing)                                        | runes, snippets, accessible tabs + FAQ, Stripe Checkout, signed Stripe webhook → SendGrid |
| 003 | Project: Dev Portfolio  | [Dev-Portfolio](003-Project-Dev-Portfolio/Dev-Portfolio) + [studio](003-Project-Dev-Portfolio/studio) | Sanity CMS content, server `load`s, portable text, contact form action with validation    |
| 004 | Project: Book Nest      | [Book-Nest](004-Project-Book-Nest/Book-Nest)                                                    | Supabase auth (SSR cookies), protected routes, books CRUD with RLS, OpenAI shelf scan     |

## Run a project

```bash
cd 004-Project-Book-Nest/Book-Nest
npm install
cp .env.example .env       # fill in your own keys
npm run dev                # http://localhost:5173
npm test
npm run check              # svelte-check
npm run build
```

`vite build` works without the keys; the server refuses to start until every variable in `src/env.ts` is set.

## Services

| Project       | Needs                                                                                                                       |
| ------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Ebook-Landing | a Stripe test account with one Price, `stripe listen --forward-to localhost:5173/api/stripe-webhook`, a SendGrid sender    |
| Dev-Portfolio | a Sanity project: `cd studio && npm install && npm run dev` to edit content; a SendGrid sender for the contact form        |
| Book-Nest     | a Supabase project with [the migration](004-Project-Book-Nest/Book-Nest/supabase/migrations) applied, an OpenAI API key   |

## License

[MIT](LICENSE)
