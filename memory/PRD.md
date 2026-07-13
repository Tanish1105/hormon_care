# Hormon Care - Patient Mobile App - PRD

## Original problem statement
> a hormon care web mathi patisent app banavo je db sathe conected hoy and web url : https://hormoncare.mediiqr.com che and propar degine unice karo and react native cli ma banavo

Translation: Build a mobile patient app for the existing Hormon Care web
(https://hormoncare.mediiqr.com), connected to the same DB, unique proper design,
implemented in **React Native CLI**.

## User personas
- **Gynaecology patient (Gujarati speaking)** — receives a patient ID + password
  from their doctor, uses the app to view their care plan, weekly content,
  submit lifestyle assessment and weekly followup forms.

## Core requirements (static)
1. React Native CLI (bare workflow) — Android + iOS
2. Reuse the existing Next.js backend at `https://hormoncare.mediiqr.com`
   (no separate mobile backend). Same DB.
3. Feature parity with the web patient portal:
   - Patient login (Patient ID + password)
   - Dashboard with assigned care plan & weeks
   - Weekly content viewer (YouTube / text / image)
   - Lifestyle assessment (9 sections, ~35 fields)
   - Weekly followup form
4. Unique, proper design in Gujarati (rose/pink brand palette).

## Architecture
- **App shell**: `App.tsx` → `SafeAreaProvider` → `AuthProvider` → `RootNavigator`
- **Auth**: cookie-based session (extracted from `Set-Cookie` header,
  stored in `AsyncStorage`, re-sent as `Cookie` header on every request).
- **API client**: single `src/api/client.ts` with typed functions for all 9
  backend endpoints.
- **Navigation**: `@react-navigation/native-stack`; screens gated by auth state.
- **UI kit**: local `components/` (Button, TextField, RadioGroup, CheckboxGroup,
  Card) driven by tokens in `src/theme/index.ts`.

## Endpoints consumed
| Method | Endpoint |
|--------|-----------|
| POST | `/api/auth/patient/login` |
| POST | `/api/auth/logout` |
| GET  | `/api/patient/dashboard` |
| GET  | `/api/patient/gate-status` |
| GET  | `/api/patient/lifestyle-assessment` |
| POST | `/api/patient/lifestyle-assessment` |
| GET  | `/api/patient/followup?week=N` |
| GET  | `/api/patient/followup/status` |
| POST | `/api/patient/followup` |

## What's been implemented (2026-01)
- ✅ React Native CLI project scaffolded at `/app/HormonCarePatient`
- ✅ TypeScript strict codebase (`tsc --noEmit` clean)
- ✅ Login screen (Gujarati copy, session persistence)
- ✅ Dashboard (patient greeting, plan hero, weeks list, gate-based prompts)
- ✅ Week detail (YouTube WebView, images, text content)
- ✅ Lifestyle assessment form (9 sections, auto-BMI, radio/checkbox groups)
- ✅ Weekly followup form (day radios 0-7, plan feedback, notes)
- ✅ AsyncStorage session persistence, pull-to-refresh, logout confirm
- ✅ Live API verified end-to-end with credentials `tanish / 1234`
- ✅ README with build/run instructions for Android & iOS

## Prioritised backlog (P0 → P2)
- **P1**: Add auto-refresh of dashboard when returning from a form submit
- **P1**: Push notification for pending weekly followups
- **P2**: Offline mode (queue submits when no network)
- **P2**: Biometric quick-login (Face ID / fingerprint)
- **P2**: In-app doctor chat / support link
- **P2**: Multi-language toggle (Gujarati ↔ English) surfaced in UI

## Not implemented / follow-ups
- App icon & splash are default RN CLI ones. Should be replaced with the
  Hormon Care rose-pink logo (`/hormon-care-logo.png` from the web).
- No CI. Add a GitHub Action to run `yarn tsc` + build the release APK.
- Signed release keystore setup pending.
