# Test credentials

## Hormon Care patient (live backend)

The RN app talks directly to production at `https://hormoncare.mediiqr.com`,
so use the same credentials the user provided.

| Field | Value |
|-------|-------|
| Patient ID | `tanish` |
| Password   | `1234` |

- Login endpoint: `POST /api/auth/patient/login`
  - Body: `{ "username": "tanish", "password": "1234" }`
- Returns `Set-Cookie: session=<JWT>; HttpOnly` + `{ user: {...} }`
