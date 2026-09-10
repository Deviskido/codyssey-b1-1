# Portfolio test Kanban

Source: [requirements.txt](requirements.txt). Implementation and Chrome verification completed on 2026-09-10. Evidence: [browser suite](tests/browser.cjs), [screenshots](images/screenshots/desktop.png), and [verification notes](README.md#verification).

Move each card through **To do → In progress → Done**. Mark a card Done only after its checks pass; attach the tested URL or commit and evidence (screenshot, console output, or review notes). If a check fails, record the actual result and keep the card open.

## To do

| ID | Test card | Checks / expected result |
| --- | --- | --- |
| T01 | Project setup | `index.html`, `css/style.css`, `js/`, and `images/` exist; external CSS and JS load without errors; JS uses `defer`; the page runs with Live Server. |
| T21 | Deployment smoke test | On the GitHub Pages URL, repeat responsive layout, hamburger, theme persistence, scrolling, API states, and form validation checks; verify assets load correctly from the deployed path. |
| T22 | Documentation and submission | README includes project description, technologies, deployment URL, and desktop/mobile/dark-mode screenshots, plus changed scroll/observer thresholds. Repository and deployed-site URLs are available for submission. |
## In progress

No active local implementation tasks. Remaining checks require VS Code execution or deployment access.

## Done

Verified by source review and Chrome 152.0.7977.83 at `http://127.0.0.1:5500`.

| ID | Test card | Checks / expected result |
| --- | --- | --- |
| T02 | Semantic HTML and content | Review use of `header`, `nav`, `main`, `section`, `article`, and `footer`; Hero includes greeting and CTA, About includes bio and profile image, Skills lists technologies, Projects contains API cards, Contact contains a form, and Footer contains copyright and social links. |
| T03 | Accessible markup and links | Every image has meaningful alt text; each form label matches its input ID; navigation anchors target the correct sections; CTA and social links work. |
| T04 | CSS structure | Colors, fonts, and spacing use `:root` variables; dark overrides use `[data-theme="dark"]`; navigation uses Flexbox with logo left/menu right; project cards use Grid with `auto-fit` and `minmax`; buttons/cards have hover transitions and cards have shadows. |
| T05 | Responsive layouts | In Chrome, check widths 375, 767, 768, 1023, 1024, and 1440px. Confirm mobile-first styling and 768/1024px breakpoints, readable sections, responsive project cards, and no horizontal overflow. Mobile navigation is hidden and the hamburger is visible. |
| T06 | Hamburger menu | At mobile width, click the hamburger twice: menu opens, then closes. Review use of `classList.toggle('active')`. |
| T07 | Smooth navigation | Click each navigation link and confirm smooth scrolling to its matching section. |
| T08 | Scroll-to-top button | Check below, at, and above the configured threshold (default 300px); the button appears at the specified threshold and returns to the top when clicked. Document any changed threshold in README. |
| T09 | Navigation scroll styling | Check below, at, and above the configured threshold (default 60px); background changes as specified and resets when returning above the boundary. Document any changed threshold in README. |
| T10 | Dark mode persistence | Toggle light → dark → light; verify page colors update. Reload in each mode and confirm the localStorage preference is restored. |
| T11 | Scroll animations | Scroll sections into view and confirm animations trigger via Intersection Observer. Review its threshold (0.2 or higher recommended); document a changed value in README. |
| T12 | Required form fields | Submit an empty form, then omit name, email, and message individually. Submission is blocked and errors appear near the relevant fields. |
| T13 | Email validation and success | Invalid email shows a nearby error. Correct it and submit all valid fields: errors clear appropriately, a success message appears, and `preventDefault()` prevents navigation/reload. |
| T14 | JavaScript conventions | Review `const`/`let`, no `var`, no inline `onclick` or inline styles; event handlers use `addEventListener`. Confirm `querySelector`/`querySelectorAll`, `textContent`/`innerHTML`, classList add/remove/toggle, and click/submit/scroll/input handling are demonstrated. |
| T15 | ES6 and array methods | Review arrow functions, template literals for dynamic HTML, destructuring, `map` for repository cards, and `forEach` for iteration. `filter` is optional unless the filter bonus is implemented. |
| T16 | GitHub API loading and success | Verify `fetch` with `async`/`await` calls `/users/{username}/repos` for the intended account. Throttle a request: loading UI is visible, then is replaced by cards matching the successful response. |
| T17 | GitHub API errors and retry | Simulate a network failure and HTTP 403 response using a local fixture/mock. Each shows “프로젝트를 불러올 수 없습니다” and a retry button, clears loading UI, and is handled with try/catch. Restore a successful response and retry: cards appear. |
| T18 | GitHub API empty response | Supply a successful empty array response: show “표시할 프로젝트가 없습니다”, with no stale cards or loading indicator. |
| T19 | State and rendering flows | Trace at least three event → state → rendering flows in the code and browser: theme, API request states, and form validity. Confirm each state change updates the corresponding UI. |
| T20 | Dependency constraints and Chrome | Review source/imports: pure HTML/CSS/JS, no React, Vue, jQuery, Bootstrap, or Tailwind. Icons and web fonts are allowed. Run the required interactions in current Chrome and check for console errors. |

## Optional backlog

| ID | Test card | Checks / expected result |
| --- | --- | --- |
| B01 — Done | Language filtering | Language buttons update filter state and displayed repositories using `array.filter()`; handle an empty result. |
| B02 — Done | Typing effect | Hero text appears progressively and reaches the complete intended text. |
| B03 — Blocked | Real form delivery | If Formspree or EmailJS is implemented, use an authorized test recipient to verify delivery and visible success/failure feedback. |
| B04 — Done | System theme | With no saved preference, emulate light and dark `prefers-color-scheme` settings and confirm the initial theme matches. |

## Test notes

- Use controlled API fixtures for loading, success, empty, network failure, and 403 cases; avoid repeatedly calling GitHub or deliberately exhausting its rate limit.
- Record browser version, viewport, commit/deployed URL, steps, expected result, actual result, and evidence for each execution.
- Browser suite passed: responsive layouts, menu, anchors, scroll thresholds, persisted/system themes, form validation, API loading/success/403/network/empty/retry, language filters, safe rendering, reveals, and typing. No uncaught browser errors.
- One live GitHub API request returned five repositories. Screenshots use deterministic fixture data.
- T01: folder structure and asset loading pass; Live Server configuration is supplied, but VS Code extension execution remains unverified. Browser checks used the Python static server.
- T21: deployment workflow is ready; publication and deployed smoke tests are blocked by invalid GitHub authentication.
- T22: README, repository URL, and all three screenshots are present. A verified deployment URL remains pending T21.
- B03: real email delivery requires a service account/endpoint and authorized recipient. The form explicitly states that it validates without sending.
