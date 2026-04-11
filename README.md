# todo-cli

Terminal companion for [todo.hicke.se](https://todo.hicke.se). Same API, same data — manage todos without opening a browser.

## Install

```bash
go install github.com/hickepicke/todo-cli@latest
```

Or build locally:

```bash
git clone https://github.com/hickepicke/todo-cli
cd todo-cli
go build -o todo .
```

## Config

Create `~/.config/todo/config.toml`:

```toml
api_key  = "your-api-key"
api_base = "https://api.hicke.se"   # optional, this is the default
```

Or use environment variables:

```bash
export TODO_API_KEY=your-api-key
export TODO_API_BASE=https://api.hicke.se
```

## Usage

```bash
todo                          # list all todos (grouped by date)
todo list

todo add "Buy milk"           # add to today (default)
todo add "Plan trip" --date tomorrow
todo add "Learn Go" --date someday
todo add "Call dentist" --date 2026-04-15
todo add "Review PR" --url https://github.com/org/repo/pull/42

todo sub 5 "Chapter 1"        # add subtask under todo #5

todo done 3                   # mark #3 complete
todo rm 7                     # delete #7

todo edit 2 --text "Buy oat milk"
todo edit 2 --date tomorrow
todo edit 2 --url https://example.com
todo edit 2 --url ""          # clear URL
```

## Output

```
  TODAY — Sat Apr 11
  [1] ☐ Buy milk
  [5] ☐ Review PR  → Link

  TOMORROW — Sun Apr 12
  [2] ☐ Team standup

  SOMEDAY
  [7] ☐ Learn guitar
```

URLs render as clickable `→ Link` in terminals that support OSC 8 hyperlinks (iTerm2, Kitty, WezTerm).
