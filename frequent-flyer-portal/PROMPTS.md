# PROMPTS.md: Prompt log for ENG-163087

Workflow: test-driven development with an AI assistant. Tests first (red),
then implementation (green), then design, hardening and documentation.

> BEFORE SUBMITTING: items marked [CONFIRM] must be checked against what you
> really sent. Fix any prompt text that differs from your history in Antigravity.

## Prompt 1: Project setup (Antigravity)
```
You are a senior frontend engineer. I am the Product Manager.

Project: "End-to-End Frequent Flyer Portal" (ticket ENG-163087). It replaces
paper and Excel sheets used by airline floor staff.

Set up a React JS (JavaScript, not TypeScript) project with Vite in the
current project folder. Install and configure:
- Vitest + @testing-library/react + @testing-library/jest-dom +
  @testing-library/user-event + jsdom
- vitest-axe for accessibility tests
- ESLint with eslint-plugin-react, react-hooks and jsx-a11y (zero warnings,
  no unused imports)
- DOMPurify for XSS sanitization

Add npm scripts: dev, build, preview, test, lint.
Do NOT write any feature code yet. Show me the folder structure and config
files only.
```
**Result:** Project scaffolded. `npm run lint`, `npm test` and `npm run build` passed.

## Prompt 2: Test suite first, red phase (Antigravity)
```
Do NOT write implementation code. Write ONLY the test suite with Vitest and
React Testing Library. The tests must fail for now.

Feature: Frequent Flyer Portal where staff can list, search, add, edit and
delete flyers. Each flyer has: name, email, membership number, tier
(Silver/Gold/Platinum) and points.

Acceptance criteria to cover:

HAPPY PATH
1. Portal shows a heading, a search box, an "Add Flyer" button and a flyer
   list.
2. Staff can add a flyer through a form and see it in the list.
3. Staff can edit and delete a flyer.
4. Search filters the list instantly.
5. Data keeps a consistent structure (same fields for every flyer).

UNHAPPY PATH
6. Empty list or no search match shows a "No data found" message, never a
   blank screen.
7. During any async operation a loading indicator is visible (simulate slow
   3G with a delayed mock service).
8. Submitting the form with missing or malformed data (empty name, invalid
   email, negative points) is blocked, and the offending fields are marked
   with aria-invalid and a red error style.
9. If the async service fails, an error message with a Retry button appears
   and the app does not crash.

NFRs
10. vitest-axe reports zero accessibility violations.
11. Every button and input has an accessible name (label or aria-label) and
    works with the keyboard (Tab, Enter, Escape).
12. When a primary action completes (add, edit, delete), console.log is
    called with "[Analytics] User interacted with End-to-End Frequent Flyer
    Portal".
13. A sanitize utility strips XSS payloads like
    <script>alert(1)</script> and <img src=x onerror=alert(1)> from text
    inputs before they are stored in state.

Put tests in src/__tests__/. Remove the default sample App.test.jsx if it
conflicts. Run the tests and confirm they fail because the implementation
does not exist yet.
```
**Result:** One test file, 21 tests, all failing as expected (TDD red phase).

## Prompt 3: Implementation, green phase (Antigravity)
```
Now write the implementation so that ALL 21 tests pass. Do not change,
delete or weaken the tests. Read the test file in src/__tests__/ first so
the file names, exports, labels and text match exactly what the tests expect.

Architecture:
- src/services/flyerService.js : async functions (getFlyers, addFlyer,
  updateFlyer, deleteFlyer) using localStorage with a setTimeout delay to
  simulate network latency. Seed some mock flyers on first load.
- src/utils/sanitize.js : sanitize text with DOMPurify.
- src/utils/validate.js : validation for name, email, membership number,
  tier, points.
- src/utils/analytics.js : logs "[Analytics] User interacted with
  End-to-End Frequent Flyer Portal" via console.log.
- src/components/ : FlyerList, FlyerForm, SearchBar, Loader, EmptyState,
  ErrorMessage.
- src/App.jsx

Rules:
- Show a visible loading indicator (with role="status") during every async
  call.
- Show "No data found" for empty states.
- Invalid fields: prevent submit, red border, aria-invalid="true", and an
  error message linked using aria-describedby.
- Sanitize every text input BEFORE storing it in state.
- Use semantic HTML (header, main, nav, label, button, table or ul). Every
  interactive element gets a label or aria-label and is keyboard navigable
  with a visible focus ring.
- No API keys or real PII hardcoded. Use fake data only.
- No unused imports, zero ESLint warnings.

When done, run npm test and npm run lint and show me the results.
```
**Result:** 21 / 21 tests passed. ESLint: 0 errors, 0 warnings.

## Prompt 4: Monochrome design system (Antigravity) [CONFIRM]
```
All 21 tests pass. Now apply the design system. Do not change any
functionality, and keep all 21 tests passing.

Apply a clean monochromatic corporate design using plain CSS.
- Define CSS variables in :root ONLY for grayscale shades (white, black and
  grays). No other hex colors anywhere. The only exception is one red for
  form validation errors, defined once as a variable, with sufficient
  contrast.
- Use a spacing scale of 16px and 32px steps for all padding and margins.
- Ensure WCAG AA color contrast, a responsive mobile-first layout, and a
  visible :focus-visible style on every interactive element.
- Make the portal look clean and professional: clear header, a card or
  table style for the flyer list, consistent buttons and inputs.

When done, run npm test and npm run lint, and show me a search proving there
are no hardcoded hex colors outside :root.
```
**Result:** Styling applied in `src/index.css`. Hex colors only inside `:root`.

## Prompt 5: Hardening, audit, build and documentation [CONFIRM which tool ran it]
This prompt was written for Antigravity. [CONFIRM] Because the Antigravity
usage limit was reached, the work was carried out on the project folder by
Claude (an AI assistant) instead. Claude could not run npm in its environment,
so `npm test`, `npm run lint` and `npm run build` were run by me locally.
```
All 21 tests pass and the monochrome design is already applied in
src/index.css. Do not change or weaken any test. Keep all 21 tests passing.
Do the remaining work below in order, and after EACH step run npm test and
npm run lint.

STEP 1: Fix two weaknesses (no new features)
a) In src/App.jsx, add, edit and delete save in the background and ignore
   errors with .catch(() => {}). On failure, show the existing
   ErrorMessage with a Retry button and roll back the optimistic change, so
   staff never believe unsaved data was saved on a slow or failing
   connection.
b) In src/components/FlyerForm.jsx, trap keyboard focus inside the dialog
   (Tab and Shift+Tab must cycle within it), keep Escape to close, and
   return focus to the button that opened it when the dialog closes.

STEP 2: Code freeze and audit
- Do not add any new features from here on.
- Run npm run lint and fix all warnings. No unused imports.
- Check src/index.css: hex colors only inside :root, spacing only in 16px
  and 32px steps, WCAG AA text contrast, :focus-visible on every
  interactive element. Show a grep proving there are no hex colors outside
  :root.
- Check the app has a lang attribute, a <title>, one <h1>, landmark
  elements (header, main), and labels or aria-labels on every input and
  button.
- Search the whole repo to confirm no API keys, secrets or real personal
  data are hardcoded.

STEP 3: Production build
- Run npm run build and confirm it succeeds with no errors.
- Run npm run preview and tell me the local URL so I can run Lighthouse on
  it.
- Aim for Lighthouse accessibility 100 and all other scores above 90. If
  you can identify likely accessibility or performance problems from the
  code, fix them.

STEP 4: Documentation
- Replace README.md with a project README: purpose (ticket ENG-163087),
  tech stack (React, Vite, Vitest, React Testing Library, vitest-axe,
  ESLint, DOMPurify, plain CSS), install and run commands (npm install,
  dev, test, lint, build, preview), feature list, project structure, and a
  note that data is mocked with localStorage and there is no real backend.
- Create PROMPTS.md in the repo root as a numbered log of the real prompts
  I sent in this project (setup, tests, implementation, design, and this
  final prompt), each with a short result note. Leave a clearly marked
  [CONFIRM] placeholder wherever you do not know the exact prompt text.
  Do not invent prompts.

FINAL REPORT
Show the results of npm test, npm run lint and npm run build, and list
every file you changed.
```
**Result:** [CONFIRM] Files changed: `src/App.jsx`, `src/components/FlyerForm.jsx`,
`src/components/SearchBar.jsx`, `README.md`, `PROMPTS.md`.
Local results: `npm test` ___ , `npm run lint` ___ , `npm run build` ___ .
Lighthouse accessibility: ___ .

## Iterations and fixes
[CONFIRM] If an error occurred and you sent a fix message such as "That
approach caused an error. Let's revert and try a different method.", paste it
here with what changed. Otherwise write "None needed".
