# todo-clients

Go CLI/TUI and Chrome extension for [todo.hicke.se](https://todo.hicke.se). Same API, same data — manage todos without opening a browser.

CLI built with Go + [Bubble Tea](https://github.com/charmbracelet/bubbletea). Extension uses Manifest v3.

## Quick install

```bash
curl -fsSL https://api.hicke.se/install.sh | sh
```

Installs Go (if missing), the `todo` CLI binary, and clones this repo to `~/.todo-clients/` for the Chrome extension.

Then load the Chrome extension:
1. Open `chrome://extensions`
2. Enable **Developer mode**
3. **Load unpacked** → select `~/.todo-clients/extension/`
4. Click ⚙ in the popup → enter your API key

## Manual install

**CLI only** (requires Go):

```bash
go install github.com/hickepicke/todo-clients@latest
```

**Chrome extension only:**

```bash
git clone https://github.com/hickepicke/todo-clients ~/.todo-clients
```

Then load `~/.todo-clients/extension/` as an unpacked extension in Chrome.

## Config

Create `~/.config/todo/config.toml`:

```toml
api_key  = "your-api-key"
api_base = "https://api.hicke.se"   # optional default
```

Or use an environment variable:

```bash
export TODO_API_KEY=your-api-key
```

## TUI

Running `todo` with no arguments opens the interactive TUI:

```
╭──────────────────────────────────────────────╮
│  ▼  TODAY — Mon Apr 14                        │
│     [3] ☐ Buy milk                            │
│     [5] ☐ Review PR  → Link                  │
│  ▼  TOMORROW — Tue Apr 15                     │
│     [6] ☐ Team standup                        │
│  ▶  Wed Apr 16                                │
│  ▶  FUTURE                                    │
│  ▶  SOMEDAY                                   │
╰──────────────────────────────────────────────╯
  j/k move   space done   enter expand   a add   e edit   d delete   r refresh   q quit
```

| Key | Action |
|---|---|
| `j` / `k` | Navigate |
| `space` | Toggle done (works on subtasks too) |
| `enter` | Expand / collapse section |
| `a` | Add task to current section |
| `e` | Edit task text |
| `d` | Delete task (press `y` to confirm) |
| `r` | Refresh from API |
| `q` | Quit |

## CLI commands

```bash
todo list                               # print grouped todos

todo add "Buy milk"                     # add to today (default)
todo add "Plan trip" --date tomorrow
todo add "Learn Go" --date someday
todo add "Call dentist" --date 2026-04-20
todo add "Review PR" --url https://github.com/org/repo/pull/42

todo sub <parent-id> "subtask text"     # add subtask

todo done <id>                          # toggle done / undone
todo rm <id>                            # delete

todo edit <id> --text "new text"
todo edit <id> --date tomorrow
todo edit <id> --url https://example.com
todo edit <id> --url ""                 # clear URL
```

## Output

```
  OVERDUE
  [2] ☐ Call dentist  (Apr 12)

  TODAY — Mon Apr 14
  [3] ☐ Buy milk
  [5] ☐ Review PR  → Link

  TOMORROW — Tue Apr 15
  [6] ☐ Team standup

  SOMEDAY
  [9] ☐ Learn guitar
  [7] ☐ Sixfours (1/2)
    [8] ☑ Order parts
```

URLs render as clickable `→ Link` in terminals that support OSC 8 hyperlinks (iTerm2, Kitty, WezTerm).

## Related

- [todo.hicke.se](https://todo.hicke.se) — web app
- [hickepicke/hicke-docs](https://github.com/hickepicke/hicke-docs) — API source + docs site
