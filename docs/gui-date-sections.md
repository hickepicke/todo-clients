# GUI Date Sections — Design Plan

## Problem

The current Today / Tomorrow sections are fragile:

- If a user leaves the app open past midnight, the sections no longer reflect reality until a page refresh.
- "Tomorrow" items don't automatically become "Today" items.
- Overdue items (past due date, not completed) have no distinct treatment.

There is no background process. The API stores `due_date` as a plain date string (`YYYY-MM-DD`) and returns it as-is. All intelligence about what is "today" or "overdue" must live entirely in the browser client.

---

## Core Principle

> The browser is the clock. The DB is the source of truth for the date. Nothing else.

The API never categorises todos. It returns raw `due_date` values. The frontend derives every section by comparing `due_date` against the browser's current local date at render time.

---

## Section Definitions

Sections are computed client-side on every render (or on a regular tick — see below). Given a todo with `due_date = D` and the browser's local date = `today`:

| Condition | Section | Style |
|---|---|---|
| `D < today` and not done | **Overdue** | Red text / red accent |
| `D == today` | **Today** | Normal |
| `D == today + 1 day` | **Tomorrow** | Normal |
| `D > today + 1 day` | **Upcoming** | Normal, grouped by date |
| No `due_date` | **Someday** | Dimmed |

Completed todos are excluded from all sections (or shown in a separate collapsed "Done" section — existing behaviour unchanged).

---

## Overdue / Rolling Behaviour

"Rolling" is **purely visual** — the DB date is never mutated automatically.

- If `due_date` is in the past and the todo is not done, it appears at the top of the list in the **Overdue** section with a red indicator.
- The DB date is left untouched. The user can manually reschedule with `edit --date`.
- There is no auto-bump of the date. Changing the DB date without user intent would silently destroy audit history and make it impossible to tell how long something has been overdue.

This means a todo originally due three days ago will appear in Overdue (in red) every day until the user either completes it or reschedules it. That friction is intentional — it makes neglected items visible.

---

## Timezone Handling

`due_date` is a date only (`YYYY-MM-DD`), not a datetime. "Today" is therefore always relative to the user's local calendar day, not UTC.

**How to get the local date correctly in JS:**

```js
function localDateString() {
  const d = new Date();
  // Pad month and day to avoid locale-specific toLocaleDateString quirks
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`; // "2026-04-12"
}
```

Do **not** use `new Date().toISOString().slice(0, 10)` — that returns the UTC date, which is wrong for users east of UTC+0 late at night and west of UTC+0 early in the morning.

---

## Midnight Rollover

Because there is no background process, the frontend must handle the clock ticking past midnight itself.

**Approach: visibility-change + periodic tick**

```js
// Re-categorise todos when the tab becomes visible again (user returns after midnight)
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') recategorise();
});

// Also tick every minute so an open tab stays correct
setInterval(recategorise, 60_000);
```

`recategorise()` re-runs the section logic against the current `localDateString()` and re-renders. No network request needed — the data already in memory is re-sorted.

If the app fetches fresh data from the API periodically anyway, that fetch also acts as a natural recategorisation trigger.

---

## Section Order

Top to bottom:

1. **Overdue** (red) — only shown if there are overdue items
2. **Today**
3. **Tomorrow**
4. **Upcoming** — one sub-group per date, sorted ascending
5. **Someday** — no due date

---

## What Does Not Change

- The DB schema. `due_date` stays a plain date string.
- The API. No new endpoints or parameters needed.
- The CLI. It already labels sections using the same logic client-side (`cmd/list.go`).

---

## Out of Scope

- Server-side timezone awareness (not needed — dates are date-only).
- Auto-bumping overdue DB dates (intentionally avoided).
- Push notifications for overdue items.
