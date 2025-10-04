# LaunchingSoon page

This folder contains a React component that replicates the provided "Coming Soon / Launching Soon" static page.

Files

- `LaunchingSoon.js` — React functional component. Uses assets from `public/assets` via `process.env.PUBLIC_URL` by default.
- `LaunchingSoon.css` — styles for the component.

Usage

1. Place the provided assets into `public/assets/` so Create React App will serve them. Files expected:

   - `Hong Kong Night GIF by Earth Hour.gif`
   - `logo-removebg-preview.png`

2. Import and use the component in your router or `App.js`. Example:

   ```js
   import LaunchingSoon from "./pages/LaunchingSoon/LaunchingSoon";

   // render <LaunchingSoon /> where appropriate in your JSX
   ```

Notes

- The component performs a client-side password check (not secure) and then redirects to `/` after a small transition. Adjust navigation if you use React Router (for example, replace `window.location.href` with your router's navigate/push).
- If you prefer assets from `src/assets`, update the `src` values to import them directly instead of using `process.env.PUBLIC_URL`.
