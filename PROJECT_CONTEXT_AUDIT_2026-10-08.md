# Porhaxali Project Context Audit

**Snapshot date:** 2026-10-08 (Asia/Kolkata)  
**Purpose:** Self-contained project handoff for ChatGPT or another developer  
**Scope:** Frontend repository plus the adjacent backend repository  
**Method:** Static code/configuration review, Git-state review, frontend build/lint/test execution, and backend test execution. No production database, deployed service, email provider, or object-storage account was accessed.

## 1. Executive summary

Porhaxali is a role-based education platform under active development. The code supports five user roles—`ADMIN`, `STUDENT`, `PARENT`, `INSTRUCTOR_APPLICANT`, and `INSTRUCTOR`—with the most complete end-to-end work concentrated in authentication, student profile completion, faculty onboarding, instructor application submission, admin review, document handling, and instructor activation.

The project is split across two repositories:

| Layer | Repository | Current branch | Current HEAD | Working tree |
|---|---|---|---|---|
| Frontend | `porhaxali-frontend` at `/Users/mukhtar/Documents/development/porhaxali-app` | `dev-mukhtar` tracking `origin/dev-mukhtar` | `a8704c9` (2026-10-07) | 2 pre-existing modified files; this report added as a new file |
| Backend | `porhaxali-backend` at `/Users/mukhtar/Documents/development/porhaxali` | `main` tracking `origin/main` | `c94c77d` (2026-09-30) | Clean before and after audit |

Current health at this snapshot:

- Frontend unit/component tests: **53/53 passing** across 9 files.
- Frontend production build: **passes**, with a bundle-size warning (main JS about 546.5 kB minified / 152.9 kB gzip).
- Frontend lint: **fails** with 43 errors and 2 warnings.
- Backend tests using Java 21: **330 run, 0 failures, 0 errors, 7 skipped**.
- Backend tests using the shell's default Java 17 fail before execution because the project targets Java 21. Java 21 is installed locally and works.
- The frontend's current uncommitted `BestTeachers.jsx` work contains a likely runtime defect (`console.log(hi)` where `hi` is undefined) and attempts to call an authenticated “my profile photo” API from the public landing page.
- Several student-facing and admin CRUD screens are still mock/static or only partially connected. The faculty application/review flow is much more mature.

## 2. Product intent and user model

Based on the UI, routes, domain model, and API surface, Porhaxali is intended to become an academic learning/management platform with:

- Public marketing, course/subject discovery, registration, login, and faculty recruitment.
- Student profiles, learning preferences, guardian information, course/batch participation, live sessions, and notes.
- Faculty applications with qualifications, requested subjects, documents, profile photo, status tracking, review feedback, and eventual instructor activation.
- Instructor profiles and batch ownership.
- Admin management for subjects, users, instructor applications, and operational approvals.
- Parent-facing functionality, although this is currently only a stub.

This product description is an inference from the codebase, not a separately verified product specification.

## 3. Repository and development conventions

### Frontend repository

- Remote: `https://github.com/mukhtarulhaque/porhaxali-frontend.git`
- Runtime/build: Vite 8, React 19, JavaScript/JSX (not TypeScript).
- Styling: Tailwind CSS 4 utility classes plus `App.css` and `index.css`.
- HTTP: Axios with a shared client and request/response interceptors.
- Routing: React Router 7.
- Icons/loaders: Lucide React, React Icons, React Spinners.
- Testing: Vitest, jsdom, Testing Library, jest-dom.
- The README is still mostly the stock Vite README, with added sections for faculty registration and the temporary development-access gate. It is not a full project runbook.

### Backend repository

- Remote: `https://github.com/mukhtarulhaque/porhaxali-backend.git`
- Runtime: Java 21.
- Framework: Spring Boot 4.0.6.
- Architecture: Controller → service interface → service implementation → repository.
- Persistence: Spring Data JPA/Hibernate and PostgreSQL.
- Security: Spring Security, stateless JWT access/refresh tokens, BCrypt, method-level authorization.
- Validation: Jakarta Bean Validation.
- API documentation: springdoc OpenAPI/Swagger.
- Email: Resend API through Spring's REST client.
- File storage: Cloudflare R2 using AWS SDK S3 APIs and presigned URLs; a local file-storage implementation also exists.
- Testing: JUnit 5/Spring Boot Test/Mockito, with PostgreSQL-dependent tests conditionally skipped when their environment is absent.

The backend `AGENTS.md` requires DTO-only APIs, constructor injection, service interfaces plus one implementation per entity/domain, global exception handling, and no repository use from controllers. The inspected controllers comply with the no-direct-repository rule. The package root is `com.codehues.porhaxali`, which differs from the generic package example in `AGENTS.md` but is internally consistent.

## 4. Frontend architecture

### Boot sequence

`src/main.jsx` mounts providers in this order:

1. React `StrictMode`.
2. `DevelopmentAccessProvider`.
3. `DevelopmentAccessGate`.
4. `BrowserRouter`.
5. `AuthProvider`.
6. Application routes.

This means the temporary development gate is checked before normal application authentication or routing is mounted. If the gate status call fails, the app fails closed and presents a retry screen.

### API client and session model

The shared Axios client:

- Uses `VITE_API_BASE_URL` when set.
- Falls back to `https://porhaxali-backend-production.up.railway.app/`.
- Always enables `withCredentials` for the development-access cookie.
- Reads auth from local storage key `porhaxaliAuth`.
- Adds `Authorization: Bearer <access token>` unless `skipAuth` is set.
- On a first 401, calls `/api/auth/refresh`, writes the returned access/refresh tokens, then retries the original request.
- Clears local auth if refresh fails.
- Emits a `porhaxaliAuthUpdated` browser event so `AuthProvider` stays synchronized with interceptor-driven token refresh.

The auth object may contain both `accessToken` and the legacy-compatible alias `jwtToken`, plus `refreshToken`, user identity, role, verification flags, and student-profile completion metadata.

Security tradeoff: both access and refresh tokens are stored in `localStorage`. This is convenient but makes token theft possible after an XSS compromise. A production hardening decision should explicitly choose between this design and an HttpOnly-cookie/session design.

### Route map

Public routes:

| Path | Component | State |
|---|---|---|
| `/` | `Landing` | Implemented marketing page; includes static content and current faculty-section work |
| `/login` | `Login` | API-integrated |
| `/register` | `Signup` | API-integrated standard registration |
| `/forgottenPassword` | `ForgottenPassword` | UI exists; no verified reset API flow found |
| `/faculty/setup-account` | `FacultyAccountSetup` | API-integrated token/password setup |
| `*` | `Missing` | Catch-all |

Authenticated shared/student routes:

| Path | Component | State |
|---|---|---|
| `/authUser` | `AuthHome` | Role-aware post-login landing/redirect behavior |
| `/courses` | `CoursesPage` | Primarily UI/static content |
| `/dashboard` | `StudentDashboard` | Profile API integrated; other dashboard content includes mock data |
| `/liveSessions` | `LiveSessions` | Mock/static data |
| `/notes` | `NotesPage` | Client-side UI; no backend notes domain found |
| `/profileSetting` | `ProfileSettings` | Student self-service profile GET/PUT integrated |
| `/student/profile` | redirect | Redirects to `/profileSetting` |

Admin-only routes:

| Path | Component | State |
|---|---|---|
| `/adminDashboard` | `Dashboard` | UI plus tested role/menu behavior |
| `/allCourses` | `AllCourses` | Subject GET/POST/PUT integrated; still labeled/structured as courses |
| `/allStudents` | `AllStudents` | Partial student fetch; contains substantial unused/commented CRUD state |
| `/admin/instructor-applications` | `InstructorApplications` | Integrated list, filters, counts |
| `/admin/instructor-applications/:applicationId/review` | `InstructorApplicationReview` | Integrated review/detail/actions/documents |

Instructor-only route:

| Path | Component | State |
|---|---|---|
| `/facultyDashboard` | `FacultyDashboard` | Placeholder-level page; currently only sidebar plus text |

Instructor-applicant routes:

| Path | Component | State |
|---|---|---|
| `/completeFacultyApplication` | `CompleteApplication` | Integrated multi-step application |
| `/completeFacultyApplication/documents` | `CompleteApplication`, step 3 | Integrated documents entry point |
| `/faculty/application/status` | `InstructorApplicationStatus` | Integrated status/timeline/action UI |
| `/faculty/application/view` | `CompleteApplication`, read-only | Integrated review of submitted data |

Route protection is client-side through `RequireAuth` and `RequireRole`. Backend role checks remain the actual security boundary.

### Frontend feature maturity

#### Substantially implemented/integrated

- Login, registration, OTP verification/resend, logout, refresh-token retry, current-user hydration.
- Temporary development access gate using backend status/OTP/logout endpoints.
- Faculty lead registration and setup-account page.
- Instructor applicant draft/create/update flow.
- Qualification CRUD and requested-subject selection.
- R2 presigned document and profile-photo uploads with confirm calls.
- Application submission and status display.
- Admin instructor-application list/count/detail/review actions.
- Admin document verification/rejection and instructor activation.
- Student self-service profile completion.
- Subject listing and admin create/update.

#### Partial, placeholder, mock, or missing backend support

- Faculty dashboard is placeholder-level.
- Parent navigation is empty and parent controller is a stub.
- Live sessions are mock data.
- Student dashboard includes mock profile/dashboard data beyond the profile fetch.
- Notes are UI-only; no note entity/service/controller exists in the backend.
- Course browsing is mostly static; the backend domain is currently subjects/batches rather than a full course/catalog model.
- `AllStudents` contains much unused and commented course CRUD code.
- Forgot-password UI has no corresponding backend reset endpoints in the audited API surface.
- Public faculty cards remain hardcoded and do not have a public instructor-directory endpoint.

### Frontend maintainability observations

- Approximately 10,153 lines of JS/JSX/CSS under `src`.
- 78 source files and 9 test files.
- `CompleteApplication.jsx` is about 1,009 lines and `InstructorApplicationReview.jsx` about 742 lines; these are major refactoring candidates.
- API URLs are centralized, and domain-specific API wrappers exist for instructor applications and admin instructor review. Other screens still call Axios directly, so the data-access pattern is inconsistent.
- The project has repeated legacy `import React` statements that React 19/Vite no longer needs; these account for many lint errors.
- Naming contains a persistent `commom` directory typo and mixed URL naming styles (`forgottenPassword`, `liveSessions`, `profileSetting`, etc.).
- No error boundary, analytics/observability layer, internationalization, or accessibility test suite was found.
- No end-to-end browser test framework was found.

## 5. Backend architecture and domains

The backend contains about 239 main Java files, including:

- 19 controllers.
- 19 service interfaces and 19 service implementations.
- 21 repositories.
- 23 files in the entity package (20 persistence entities plus the `Role`, `ProfileStatus`, and related types located there).
- 22 custom/global exception classes.
- 8 mappers.
- 36 test source files.

### API response contract

Most application APIs use:

```json
{
  "success": true,
  "message": "...",
  "data": {},
  "timestamp": "..."
}
```

The frontend generally unwraps `response.data.data`. Auth responses include both `accessToken` and a compatibility `token` field, plus refresh token, email, name, role, phone, and message.

### Core domains

#### Authentication and account lifecycle

- Standard registration, email OTP verification, OTP resend, login, refresh, `/me`, logout.
- BCrypt password hashing.
- JWT access token default lifetime: 15 minutes.
- JWT refresh token default lifetime: 7 days.
- JWTs carry a `type` claim (`ACCESS` or `REFRESH`) and email as subject.
- Active sessions and revoked-token persistence support logout and session invalidation.
- Force-logout requests support user request plus admin approve/reject.
- User soft deletion and reactivation are modeled with actor, time, and reason fields.
- Roles: `ADMIN`, `STUDENT`, `PARENT`, `INSTRUCTOR_APPLICANT`, `INSTRUCTOR`.
- User statuses: `ACTIVE`, `INACTIVE`, `SUSPENDED`, `DELETED`.

#### Development-access gate

- Optional via `DEVELOPMENT_ACCESS_ENABLED`, default false.
- One configured allowed email address.
- Email OTP with configurable expiration, resend cooldown, attempt limit, and session expiration.
- Successful verification is represented by a secure cookie (default `Secure`, `SameSite=None`).
- The gate filter runs before JWT authentication when enabled.
- The frontend also carries temporary `noindex, nofollow` metadata and a `robots.txt` that disallows all crawling.

#### Student profiles

- One-to-one with user.
- Required class, board, and medium.
- JSONB learning preferences and guardian information.
- Profile status and completion timestamp.
- Dedicated self-service `/me` GET/PUT API for students.
- Older/admin-style profile CRUD endpoints also remain under `/api/student`.

#### Subjects and instructors

- Subjects have name, optional unique code, description, and active/inactive status.
- Instructor profiles are created from an approved application.
- Profile stores display name, bio, qualification summary, experience, phone, approval metadata, and active/inactive/suspended status.
- Subject-to-instructor assignments have active/inactive status.

#### Instructor application workflow

- Application states: `DRAFT`, `SUBMITTED`, `UNDER_REVIEW`, `CHANGES_REQUESTED`, `APPROVED`, `REJECTED`, `WITHDRAWN`.
- Review history actions: submitted, review started, changes requested, resubmitted, approved, rejected, instructor activated.
- Application includes qualifications, requested subjects, documents, professional/profile fields, and review metadata.
- Document types include identity proof, educational certificate, experience certificate, profile photo, resume, and other.
- Document verification states: pending, verified, rejected.
- Private R2 uploads use short-lived presigned URLs and explicit confirmation endpoints.
- Admin can list/filter/count applications, start review, inspect documents, verify/reject individual documents, request changes, approve/reject, and activate an instructor.

#### Batches, enrollment, and waiting lists

- Batches link subjects and instructors and have approval plus operational status.
- Approval: pending, approved, rejected.
- Status: draft, open, full, closed, cancelled.
- Enrollments support active, transferred, cancelled, completed, and dropped states.
- Waiting-list entries support waiting, offered, enrolled, rejected, cancelled, and expired states.
- This backend domain is broad, but the current frontend does not yet expose most of it.

### Data model overview

Principal persistence entities:

- `Users`
- `PendingRegistration`
- `OtpToken`
- `ActiveSession`
- `RevokedToken`
- `ForceLogoutRequest`
- `DevelopmentAccessOtp`
- `DevelopmentAccessSession`
- `StudentProfile`
- `Subject`
- `InstructorApplication`
- `InstructorApplicationQualification`
- `InstructorApplicationSubject`
- `InstructorApplicationDocument`
- `InstructorApplicationReviewHistory`
- `InstructorDocumentUploadIntent`
- `InstructorProfile`
- `SubjectInstructorAssignment`
- `Batch`
- `BatchEnrollment`
- `BatchWaitingList`

Important relationships:

- User → one student profile or one instructor profile depending on lifecycle/role.
- Instructor application → applicant user, qualifications, requested subjects, documents, and review history.
- Approved application → one instructor profile.
- Instructor profile ↔ subjects through assignment records.
- Batch → one subject and one instructor.
- Student profile ↔ batches through enrollment and waiting-list records.

Most entities include `createdAt` and `updatedAt`, consistent with repository rules.

## 6. Backend endpoint inventory

This is grouped by controller; method-level role rules are summarized in parentheses.

### Auth and development access

- `POST /api/auth/register` — public.
- `POST /api/auth/login` — public.
- `POST /api/auth/refresh` — public, refresh-token validated by service.
- `GET /api/auth/me` — authenticated.
- `POST /api/auth/logout` — authenticated.
- `POST /api/auth/otp/verify` — public.
- `POST /api/auth/otp/resend` — public.
- `POST /api/auth/force-logout-requests` — public by filter configuration; request/service validation must remain strong.
- `POST /api/auth/faculty-registration` — public.
- `POST /api/auth/faculty/setup-account` — public setup-token flow.
- `POST /api/development-access/otp/request` — public gate endpoint.
- `POST /api/development-access/otp/verify` — public gate endpoint.
- `GET /api/development-access/status` — public gate endpoint.
- `POST /api/development-access/logout` — public gate endpoint.

### Admin users and application review

- `PUT /api/admin/users/{userId}/role`.
- `DELETE /api/admin/users/{userId}`.
- `PATCH /api/admin/users/{userId}/reactivate`.
- `GET /api/admin/users/force-logout-requests`.
- `POST /api/admin/users/{userId}/force-logout-requests/{requestId}/approve`.
- `POST /api/admin/users/{userId}/force-logout-requests/{requestId}/reject`.
- `GET /api/admin/dashboard`.
- `GET /api/admin/instructor-applications`.
- `GET /api/admin/instructor-applications/counts`.
- `GET /api/admin/instructor-applications/{applicationId}`.
- `POST /api/admin/instructor-applications/{applicationId}/start-review`.
- `POST /api/admin/instructor-applications/{applicationId}/approve`.
- `POST /api/admin/instructor-applications/{applicationId}/reject`.
- `POST /api/admin/instructor-applications/{applicationId}/request-changes`.
- `POST /api/admin/instructor-applications/{applicationId}/activate-instructor`.
- `GET /api/admin/instructor-applications/{applicationId}/documents/{documentId}/view-url`.
- `PATCH /api/admin/instructor-applications/{applicationId}/documents/{documentId}/verify`.
- `PATCH /api/admin/instructor-applications/{applicationId}/documents/{documentId}/reject`.

All `/api/admin/**` routes require `ADMIN`.

### Instructor applicant self-service

- `POST`, `PUT`, `GET /api/instructor-applications/me`.
- Qualification list/create/update/delete under `/me/qualifications`.
- Subject list/update under `/me/subjects`.
- `POST /me/submit` and `POST /me/withdraw`.
- Legacy multipart `POST /me/documents`.
- Presigned document upload URL, confirm, delete, view URL, and required-types endpoints.
- Presigned profile-photo upload URL, confirm, and view URL endpoints.

Most modification operations require `INSTRUCTOR_APPLICANT`; GET of the main application permits applicant or instructor. A few legacy withdraw/multipart methods are instructor-only, which should be reviewed for semantic consistency.

### Instructor profiles

- `GET /api/instructors/{instructorId}` — any authenticated request at filter level unless constrained in service.
- `GET /api/instructors` — admin.
- `GET /api/instructors/me` — instructor.
- `GET /api/instructors/me/profile-photo/view-url` — instructor.
- Activate/deactivate/suspend by ID — admin.
- Stub `GET /api/instructor/courses` — instructor/admin path family.

### Students

- `GET`, `PUT /api/student-profiles/me` — student.
- Create/get/list/update/delete older profile endpoints under `/api/student` — student/admin path family.
- Stub `GET /api/student/profile`.

### Subjects

- Create, update, activate, deactivate — admin via method security.
- List and get by ID — currently no method annotation, but only `/api/subjects/` with a trailing slash is explicitly public in `SecurityConfig`; path normalization behavior should be tested and clarified.

### Batches

- Create — instructor/admin.
- Approve, reject, open, close, cancel — admin.
- Get by ID, list/filter, list by subject — authenticated unless otherwise constrained.
- List by instructor — instructor/admin.

### Enrollment and waiting list

- Student/admin enrollment and waiting-list creation/cancellation.
- Admin transfer/promotion.
- Instructor/admin completion and batch-level views.
- Student/admin student-level views.

### Miscellaneous stubs

- `GET /api/parent/profile`.
- `GET /api/pages/welcome`.

## 7. Configuration and deployment context

### Frontend

- Public configuration: `VITE_API_BASE_URL`.
- Local expected API: `http://localhost:8080/`.
- Documented deployed API: `https://porhaxali-backend-production.up.railway.app/`.
- Trailing slash is expected because frontend endpoint constants are relative paths such as `api/auth/login`.
- `.env`, `.env.*`, build output, dependencies, IDE files, and OS metadata are ignored; `.env.example` is tracked.

### Backend

Important environment/configuration groups:

- Server port and application name.
- PostgreSQL URL, username, password, and driver.
- Hibernate DDL behavior (default currently `update`) and SQL logging.
- JWT secret plus access/refresh expirations.
- OTP length, expiry, and resend cooldown.
- Resend API URL/key/from address.
- R2 account, key, secret, endpoint, bucket, and URL expirations.
- Instructor required document types, allowed MIME types, max size, local root, and public base URL.
- Faculty setup frontend URL, token expiry, and resend cooldown.
- Development-access enablement, allowed email, OTP/session settings, and cookie policy.
- CORS allowed origins.
- Swagger/OpenAPI paths and enablement.

Secrets are environment-substituted in `application.properties`. A local backend `.env` exists but is ignored and was not included or copied into this report. No sensitive environment file was found tracked by Git.

Deployment/hardening observations:

- Default `spring.jpa.hibernate.ddl-auto=update` is convenient for development but risky for controlled production schema evolution. The repository has recommended SQL scripts but no Flyway/Liquibase migration framework.
- Swagger/OpenAPI is publicly permitted by the security configuration and enabled by default.
- The default CORS list includes the backend Railway origin as an allowed browser origin, which may be unnecessary; configured frontend origins should be environment-specific.
- Development access defaults to disabled. When enabled, the cookie defaults are appropriate for cross-site HTTPS (`Secure`, `SameSite=None`).
- The public site remains blocked from search engines in the frontend regardless of whether the backend gate is enabled; these files must be changed at launch.

## 8. Current Git work and recent development direction

Recent work in both repositories has focused on:

- Instructor application submission.
- Private R2 document uploads.
- Admin instructor review slices.
- Development access gating.
- Instructor activation and profile-photo retrieval.
- Faculty dashboard routing.

### Uncommitted frontend changes

1. `src/components/login/landingComponents/BestTeachers.jsx`
   - Removes approximately 108 lines of old commented-out versions.
   - Adds/retains a `useEffect` that calls `/api/instructors/me/profile-photo/view-url`.
   - The returned value is not saved or rendered.
   - It logs `hi`, an undefined identifier, causing a `ReferenceError` when a successful response reaches that callback.
   - State variables for the photo are unused.
   - The endpoint requires an authenticated `INSTRUCTOR`, but this component is on the public landing page. It therefore cannot serve as a public “best teachers” data source.

2. `src/components/pages/faculty/FacultyDashboard.jsx`
   - Changes placeholder text from “Hi all” to “This is faculty Dashboard”.
   - The page remains placeholder-level.

These edits belong to the current working tree and were not modified by this audit.

## 9. Verification results

Commands were run from the respective repository roots.

| Check | Result | Notes |
|---|---|---|
| `npm test` | Pass | 9 files, 53 tests |
| `npm run build` | Pass | 217 modules; main JS chunk exceeds 500 kB warning threshold |
| `npm run lint` | Fail | 43 errors, 2 warnings |
| `./mvnw test` with default Java 17 | Fail before tests | Java class version mismatch; project requires Java 21 |
| `./mvnw test` with Temurin Java 21 | Pass | 330 tests, 0 failures/errors, 7 skipped |

Backend test logs include expected exception/error logging from negative-path email tests; the Maven result is still a clean success.

The skipped backend tests include PostgreSQL alignment/integration coverage that requires an external test database/environment. Consequently, the passing suite does not prove the current SQL recommendations against a live PostgreSQL instance in this audit.

## 10. Detailed findings and risks

### Priority 0 — fix before merging/deploying the current frontend working tree

1. **Public landing faculty fetch is broken by design and implementation.**
   - `BestTeachers.jsx` calls an instructor self endpoint that requires an instructor JWT.
   - A successful call triggers `ReferenceError: hi is not defined`.
   - No fetched photo is rendered.
   - Recommended direction: remove the fetch until a public, privacy-reviewed instructor directory endpoint exists, or add a dedicated public featured-instructors API returning only approved public fields and short-lived/public-safe image URLs.

2. **Frontend lint is not green.**
   - The current 43 errors include unused imports/state, three derived validation states set synchronously in effects, and the undefined `hi` symbol.
   - Two dependency-array warnings exist in `AllStudents.jsx` and `Navbar.jsx`.

### Priority 1 — security and production readiness

1. **Refresh token stored in local storage.** Decide and document the production session threat model; prefer HttpOnly cookies if feasible.
2. **Schema management defaults to Hibernate `update`.** Introduce versioned migrations and set production to `validate`/`none` as appropriate.
3. **Swagger is public by default.** Gate or disable it in production unless intentionally public.
4. **Search indexing is globally disabled.** Remove `noindex` and the all-blocking robots policy at public launch.
5. **Authorization/path semantics need review.** Confirm `/api/subjects` versus `/api/subjects/`, the public force-logout request endpoint, authenticated instructor-by-ID visibility, and instructor-only legacy application methods.
6. **Public instructor data contract is absent.** Do not reuse `/me` endpoints for marketing pages.
7. **No verified rate limiting layer** was found beyond OTP resend/attempt business rules. Login, registration, OTP, and presigned-upload endpoints merit infrastructure/application rate limits.

### Priority 2 — functional completion

1. Implement instructor dashboard functionality.
2. Connect batch/enrollment/wait-list backend capabilities to frontend experiences.
3. Replace mock student dashboard, live-session, course, and note data or explicitly label prototypes.
4. Add forgot-password/reset-token backend and frontend integration.
5. Decide whether “course” and “subject” are distinct domain concepts; current UI/API naming conflates them.
6. Build parent functionality or remove/feature-flag dormant navigation and backend stubs.
7. Complete student/admin management workflows and remove commented legacy CRUD blocks.
8. Create a public approved-faculty directory if required by the landing page.

### Priority 3 — maintainability, quality, and developer experience

1. Split the 1,009-line faculty application and 742-line admin review components into feature hooks, form sections, and API/state modules.
2. Standardize API access behind domain modules rather than mixing wrappers and direct Axios calls.
3. Normalize route naming and correct the `commom` directory typo during a controlled refactor.
4. Add end-to-end tests for the critical registration → verification → login and faculty application → review → activation flows.
5. Add a live PostgreSQL integration-test profile in CI, including recommended schema scripts/migrations.
6. Add frontend route-level code splitting to address the 546.5 kB main chunk warning.
7. Replace the template README with setup, architecture, environment, database, test, and deployment instructions.
8. Configure the shell/IDE/CI to use Java 21 consistently; otherwise Maven failures are misleading.
9. Review test logging so expected negative paths do not emit large stack traces unless useful.
10. Add CI status checks for frontend test/build/lint and backend Java-21 tests.

## 11. Suggested next development sequence

1. Stabilize the current branch: fix `BestTeachers.jsx`, clear lint, preserve passing tests/build.
2. Establish a real public faculty-directory contract or keep landing faculty content static.
3. Finish the instructor dashboard around activated profile, assigned subjects, and batches.
4. Integrate batches/enrollment/wait-list into student and instructor UIs.
5. Production hardening: migrations, token strategy, Swagger/CORS profiles, rate limits, indexing launch switch.
6. Refactor large feature components and add critical-path end-to-end tests.
7. Expand into notes/live sessions/parent features only after the core academic workflow is stable.

## 12. ChatGPT continuation brief

The following can be pasted at the start of a new ChatGPT development session:

> You are working on Porhaxali, a two-repository education platform. The React 19/Vite 8 frontend is at `/Users/mukhtar/Documents/development/porhaxali-app` on branch `dev-mukhtar`; the Spring Boot 4/Java 21/PostgreSQL backend is at `/Users/mukhtar/Documents/development/porhaxali` on branch `main`. Read `PROJECT_CONTEXT_AUDIT_2026-10-08.md` first and obey the backend `AGENTS.md`. Preserve the frontend's existing uncommitted changes unless explicitly asked to change them. Use Java 21 for Maven. Current baseline: frontend tests 53/53 pass and production build passes, but lint has 43 errors/2 warnings; backend tests pass 330 with 7 skipped. The immediate defect is the public `BestTeachers.jsx` component calling an authenticated `/api/instructors/me/profile-photo/view-url` endpoint and referencing undefined `hi`. Core mature features are auth, student profile completion, faculty onboarding/application, R2 uploads, admin review, and activation. Faculty dashboard, parent features, live sessions, notes, and much student/course UI remain incomplete or mock-driven. Do not expose secrets from `.env` or `application.properties`.

## 13. Confidence and audit limits

High confidence:

- Repository/branch/working-tree state at the snapshot time.
- Static route, endpoint, entity, role, and configuration inventory.
- Local test/build/lint results.
- Presence of mock/static/placeholder code identified directly in source.

Medium confidence:

- Feature completeness judgments, because they are based on code paths rather than a product acceptance checklist.
- Deployment configuration beyond the documented Railway backend URL and configured origins.

Not verified:

- Production/staging service health.
- Real PostgreSQL schema/data correctness.
- Real Resend email delivery.
- Real Cloudflare R2 credentials/bucket behavior.
- Browser-level full-flow behavior against a live backend.
- CI/CD pipeline configuration, because no workflow files were found in the audited repository inventories.
