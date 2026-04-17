# todo-extension

Chrome extension for [todo.hicke.se](https://todo.hicke.se). Popup with today's todos, badge count, and quick-add — without opening a browser tab.

## Install

1. Clone or download this repo
2. Go to `chrome://extensions`
3. Enable **Developer mode** (top-right toggle)
4. Click **Load unpacked** and select the repo folder
5. Click the extension icon → **Settings** (⚙) → enter your API key

## Features

- **Popup** — grouped todo list (Today + Tomorrow expanded by default, rest collapsed)
- **Badge** — red counter showing incomplete tasks for today, refreshes every 5 minutes
- **Add** — quick-add with Today / Tomorrow / Someday date buttons and optional URL
- **Toggle done** — click the checkbox on any task or subtask
- **Delete** — click ✕ on any row
- **Edit** — click the task text to rename

![Popup screenshot](screenshot.png)

## Config

The API key is stored in `chrome.storage.sync` via the options page. Open it from the ⚙ button in the popup header, or via `chrome://extensions` → Details → Extension options.

The extension talks directly to `https://api.hicke.se/api/todos` using the same key as the web app and CLI.

## Related

- [todo.hicke.se](https://todo.hicke.se) — web app
- [hickepicke/todo-cli](https://github.com/hickepicke/todo-cli) — Go TUI / CLI
