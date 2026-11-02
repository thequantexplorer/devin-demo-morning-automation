# acme-desks

A small API for booking desks in the Acme office. Node 20, Express, no database (bookings live in memory).

```sh
npm ci
npm start        # http://localhost:3000
npm test
```

| Endpoint | What it does |
| - | - |
| `GET /health` | Returns `{ "ok": true }` |
| `GET /api/desks` | All desks. Add `?date=YYYY-MM-DD` to see only free desks that day |
| `GET /api/bookings?date=YYYY-MM-DD` | Bookings for a day |
| `POST /api/bookings` | Book a desk: `{ "person": "ana", "deskId": "A1", "date": "YYYY-MM-DD" }` |
| `DELETE /api/bookings/:id` | Cancel a booking |

Rules: no dates in the past, no weekends, one booking per desk per day, one desk per person per day.

- `src/bookings.js`: booking rules
- `src/app.js`: HTTP routes
- `test/`: tests (`node --test`)
- `.github/workflows/checks.yml`: runs the tests, `npm outdated` and `npm audit` on every push and pull request

---

This repo is a starter for a Devin workshop lab. See [DEVIN_DEMO.md](DEVIN_DEMO.md) for the steps and the prompt.
