package app

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"time"

	g "github.com/nv404/gova"

	"github.com/hickepicke/todo-clients/gui/api"
	"github.com/hickepicke/todo-clients/gui/config"
)

func saveConfig(apiKey, apiBase string) error {
	home, err := os.UserHomeDir()
	if err != nil {
		return err
	}
	dir := filepath.Join(home, ".config", "todo")
	if err := os.MkdirAll(dir, 0755); err != nil {
		return err
	}
	content := fmt.Sprintf("api_key = %q\napi_base = %q\n", apiKey, apiBase)
	return os.WriteFile(filepath.Join(dir, "config.toml"), []byte(content), 0600)
}

func derefStr(s *string) string {
	if s == nil {
		return ""
	}
	return *s
}

func dateChip(label, date string, sel *g.StateValue[string]) g.View {
	active := sel.Get() == date
	var bg, fg any = g.Surface, g.Secondary
	if active {
		bg, fg = g.Accent, g.White
	}
	return g.HStack(
		g.Text(label).Font(g.Caption).Color(fg),
	).PaddingH(g.SpaceSM).PaddingV(g.SpaceXS).
		Background(bg).CornerRadius(999).Stroke(g.BorderColor, 1).
		OnTap(func() { sel.Set(date) })
}

var Root = g.Define(func(s *g.Scope) g.View {
	cfg, _ := config.Load()

	apiKey := g.State(s, cfg.APIKey)
	apiBase := g.State(s, cfg.APIBase)
	showSettings := g.State(s, cfg.APIKey == "")

	todos := g.State(s, []api.Todo{})
	loadErr := g.State(s, "")

	showAdd := g.State(s, false)
	editTodo := g.State(s, (*api.Todo)(nil))
	newText := g.State(s, "")
	newDate := g.State(s, isoToday())

	cl := &api.Client{BaseURL: apiBase.Get(), APIKey: apiKey.Get()}

	refresh := func() {
		go func() {
			items, err := cl.List()
			if err != nil {
				loadErr.Set(err.Error())
				return
			}
			loadErr.Set("")
			todos.Set(items)
		}()
	}

	g.UseEffect(s, func(ctx context.Context) func() {
		go func() {
			items, err := cl.List()
			if ctx.Err() != nil {
				return
			}
			if err != nil {
				loadErr.Set(err.Error())
				return
			}
			todos.Set(items)
		}()
		return nil
	})

	openAdd := func(date string) {
		editTodo.Set(nil)
		newText.Set("")
		newDate.Set(date)
		showAdd.Set(true)
	}

	openEdit := func(t api.Todo) {
		editTodo.Set(&t)
		newText.Set(t.Text)
		newDate.Set("")
		showAdd.Set(true)
	}

	saveAdd := func() {
		text := newText.Get()
		if text == "" {
			return
		}
		et := editTodo.Get()
		if et != nil {
			go func() { cl.Update(et.ID, map[string]any{"text": text}); refresh() }()
		} else {
			date := newDate.Get()
			var dueDate *string
			if date != "" {
				dueDate = &date
			}
			go func() { cl.Create(text, derefStr(dueDate), "", nil); refresh() }()
		}
		showAdd.Set(false)
		newText.Set("")
	}

	// ── Settings screen ───────────────────────────────────────────────────────
	if showSettings.Get() {
		keyInput := g.State(s, apiKey.Get())
		saveErr := g.State(s, "")

		return g.Scaffold(
			g.VStack(
				g.Text("Enter your API key to connect to api.hicke.se.").
					Font(g.Caption).Color(g.Secondary),
				g.TextField(keyInput).
					Placeholder("API key").
					MinHeight(36),
				g.Text(saveErr.Get()).Font(g.Caption).Color(g.Destructive),
				g.HStack(
					g.Button("Save", func() {
						k := keyInput.Get()
						if k == "" {
							saveErr.Set("API key cannot be empty")
							return
						}
						if err := saveConfig(k, config.DefaultBase); err != nil {
							saveErr.Set(err.Error())
							return
						}
						apiKey.Set(k)
						apiBase.Set(config.DefaultBase)
						showSettings.Set(false)
						refresh()
					}).Style(g.ButtonPrimary),
				).Align(g.Trailing),
			).Spacing(g.SpaceMD).Padding(g.SpaceLG),
		).Top(
			g.HStack(
				g.Text("Settings").Font(g.Title).Bold().Grow(),
			).Padding(g.SpaceMD),
		)
	}

	// ── Header ────────────────────────────────────────────────────────────────
	allTodos := todos.Get()
	doneCount := 0
	for _, t := range allTodos {
		if t.Done == 2 {
			doneCount++
		}
	}

	header := g.HStack(
		g.Text("✅ Todos").Font(g.Title).Bold().Grow(),
		g.Text(fmt.Sprintf("%d/%d done", doneCount, len(allTodos))).Font(g.Caption).Color(g.Secondary),
		g.HStack(g.Text("⚙").Font(g.Caption)).
			PaddingH(g.SpaceSM).PaddingV(g.SpaceXS).CornerRadius(4).
			OnTap(func() { showSettings.Set(true) }),
		g.HStack(g.Text("+").Bold()).
			PaddingH(g.SpaceSM).PaddingV(g.SpaceXS).
			Background(g.Accent).CornerRadius(4).
			OnTap(func() { openAdd(isoToday()) }),
	).Spacing(g.SpaceSM).Padding(g.SpaceMD)

	// ── Add / Edit form ───────────────────────────────────────────────────────
	var addForm g.View
	if showAdd.Get() {
		et := editTodo.Get()
		title := "Add Todo"
		if et != nil {
			title = "Edit Task"
		}
		tomorrow := isoDate(time.Now().AddDate(0, 0, 1))
		addForm = g.VStack(
			g.Text(title).Font(g.Title3).Bold(),
			g.TextField(newText).
				Placeholder("What needs to be done?").
				OnSubmit(func(string) { saveAdd() }).
				MinHeight(36),
			g.HStack(
				dateChip("Today", isoToday(), newDate),
				dateChip("Tomorrow", tomorrow, newDate),
				dateChip("Someday", "", newDate),
			).Spacing(g.SpaceSM),
			g.HStack(
				g.Button("Cancel", func() { showAdd.Set(false) }),
				g.Button("Save", saveAdd).Style(g.ButtonPrimary),
			).Spacing(g.SpaceSM).Align(g.Trailing),
		).Spacing(g.SpaceSM).
			Padding(g.SpaceMD).
			Background(g.Surface).
			CornerRadius(10).
			Stroke(g.BorderColor, 1)
	}

	// ── Section list ──────────────────────────────────────────────────────────
	sections := groupTodos(allTodos)
	var body []any

	if addForm != nil {
		body = append(body, addForm)
	}
	if loadErr.Get() != "" {
		body = append(body, g.Text(loadErr.Get()).Font(g.Caption).Color(g.Destructive).Padding(g.SpaceSM))
	}

	for _, sec := range sections {
		sec := sec
		secDate := sec.AddDate

		rows := []any{
			g.HStack(
				g.Text(sec.Label).Font(g.Caption).Bold().Color(g.Secondary).Grow(),
				g.HStack(g.Text("+").Font(g.Caption).Color(g.Secondary)).
					PaddingH(g.SpaceXS).
					OnTap(func() { openAdd(secDate) }),
			).PaddingH(g.SpaceSM).PaddingTop(g.SpaceMD).PaddingBottom(g.SpaceXS),
		}

		for _, t := range sec.Items {
			t := t
			rows = append(rows, TodoRow(t, childrenOf(allTodos, t.ID), cl, refresh, openEdit))
		}

		body = append(body, g.VStack(rows...).
			Background(g.Surface).CornerRadius(10).Stroke(g.BorderColor, 1).PaddingBottom(g.SpaceXS))
	}

	return g.Scaffold(
		g.ScrollView(
			g.VStack(body...).Spacing(g.SpaceSM).Padding(g.SpaceMD),
		),
	).Top(header)
})
