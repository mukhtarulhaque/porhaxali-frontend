# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Faculty signup (Part 1)

The landing-page “Become a Faculty” form collects only full name, email, and phone.
It posts to `api/auth/faculty-registration` through the existing Axios client with
`skipAuth: true`, then shows email-link instructions. It handles loading, validation,
server errors, resending the link, and editing details. It does not submit an OTP,
password, role, subject, or professional details.

Set `VITE_API_BASE_URL=http://localhost:8080/` for local backend development, or use
a staging API URL. If unset, the existing production API URL remains the default.
Vite reads this variable when starting the dev server or building the app.

The backend's Part 1 schema/configuration must be deployed before signup can work.
The email destination `/faculty/setup-account` is not yet implemented in this
frontend; creating that password-setup page remains a separate follow-up.

Verification: production build and ESLint on changed JavaScript files pass.
Browser checks cover desktop/mobile layout, required fields, email/phone validation,
success and resend-error states using a local mock API (no real emails sent).
