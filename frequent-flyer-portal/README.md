# End-to-End Frequent Flyer Portal (ENG-163087)

A digital portal for airline floor staff to list, search, add, edit and delete
frequent flyer accounts, replacing paper and Excel sheets.

## Tech stack
React 19 (JavaScript) · Vite · Vitest + React Testing Library + vitest-axe ·
ESLint (react, react-hooks, jsx-a11y, unused-imports) · DOMPurify · plain CSS

There is no real backend. `src/services/flyerService.js` simulates an async API
with `localStorage` and a delay, so loading and error states behave like a
slow network. Data is stored per browser only.

## Getting started
```bash
npm install
npm run dev      # start the dev server
npm test         # run the test suite (Vitest)
npm run lint     # ESLint, zero warnings allowed
npm run build    # production build in dist/
npm run preview  # preview the production build
```

## Features
- Search, add, edit and delete flyers (name, email, membership number, tier, points)
- Empty state: "No data found" instead of a blank screen
- Loading indicator during async operations
- Form validation: invalid fields are blocked, marked `aria-invalid` and shown in red
- Text inputs sanitized with DOMPurify before they are stored in state
- Console analytics ping: `[Analytics] User interacted with End-to-End Frequent Flyer Portal`
- Add, edit and delete update the list immediately and save in the background. If saving fails, the change is rolled back and an error with a Retry button is shown
- Accessible: labelled controls, keyboard navigation, visible focus, dialog traps focus (Tab / Shift+Tab), closes with Escape and returns focus to the button that opened it
- Monochrome design system with a 16px / 32px spacing scale

## Project structure
```
src/
  App.jsx
  components/   FlyerList, FlyerForm, SearchBar, Loader, EmptyState, ErrorMessage
  services/     flyerService.js (mock async API on localStorage)
  utils/        sanitize.js, validate.js, analytics.js
  __tests__/    frequentFlyerPortal.test.jsx
```

## Process
Built with the Antigravity AI assistant using test-driven development. The
prompt sequence is documented in [PROMPTS.md](./PROMPTS.md).
