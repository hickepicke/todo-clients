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

const (
	colorAccent      = "#0c3c77" // navy — web app primary
	colorGreenFg     = "#166534" // green — in-progress / done
	colorGreenBg     = "#f0fdf4"
	colorCheckBorder = "#1c69c7" // blue border — unchecked
	colorCheckBg     = "#f0f4ff"
	colorRed         = "#dc2626"
)

var (
	Version = "dev"
	Commit  = "unknown"
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

func checkBox(done int, onTap func()) g.View {
	var fg, bg, border any
	var symbol string
	switch done {
	case 1: // in-progress — green ◑
		symbol = "◑"
		fg = g.Hex(colorGreenFg)
		bg = g.Hex(colorGreenBg)
		border = g.Hex(colorGreenFg)
	case 2: // done — green ✓
		symbol = "✓"
		fg = g.Hex(colorGreenFg)
		bg = g.Hex(colorGreenBg)
		border = g.Hex(colorGreenFg)
	default: // unchecked — invisible ✓ keeps box same size
		symbol = "✓"
		fg = g.Hex(colorCheckBg)
		bg = g.Hex(colorCheckBg)
		border = g.Hex(colorCheckBorder)
	}
	return g.HStack(
		g.Text(symbol).Font(g.Caption).Color(fg),
	).Background(bg).
		Stroke(border, 2).
		CornerRadius(4).
		PaddingH(g.SpaceSM).
		PaddingV(2).
		OnTap(onTap)
}

var Root = g.Define(func(s *g.Scope) g.View {
	cfg, _ := config.Load()

	apiKey       := g.State(s, cfg.APIKey)
	apiBase      := g.State(s, cfg.APIBase)
	showSettings := g.State(s, cfg.APIKey == "")
	todos        := g.State(s, []api.Todo{})
	loadErr      := g.State(s, "")
	showAdd      := g.State(s, false)
	newText      := g.State(s, "")

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

	saveNew := func() {
		text := newText.Get()
		if text == "" {
			return
		}
		go func() { cl.Create(text, "", "", nil); refresh() }()
		showAdd.Set(false)
		newText.Set("")
	}

	g.UseEffect(s, func(ctx context.Context) func() {
		refresh()
		ticker := time.NewTicker(10 * time.Second)
		go func() {
			for {
				select {
				case <-ctx.Done():
					return
				case <-ticker.C:
					refresh()
				}
			}
		}()
		return ticker.Stop
	})

	// ── Settings screen ───────────────────────────────────────────────────────
	if showSettings.Get() {
		keyInput := g.State(s, apiKey.Get())
		saveErr  := g.State(s, "")

		return g.Scaffold(
			g.VStack(
				g.Text("Enter your API key.").Font(g.Caption).Color(g.Secondary),
				g.TextField(keyInput).Placeholder("API key").MinHeight(40),
				g.Text(saveErr.Get()).Font(g.Caption).Color(g.Hex(colorRed)),
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
					}).Style(g.ButtonPrimary),
				).Align(g.Trailing),
			).Spacing(g.SpaceMD).Padding(g.SpaceLG),
		).Top(
			g.HStack(
				g.Text("Settings").Font(g.Title).Bold().Color(g.White).Grow(),
			).Background(g.Hex(colorAccent)).Padding(g.SpaceMD),
		)
	}

	// ── Header ────────────────────────────────────────────────────────────────
	doneCount := 0
	for _, t := range todos.Get() {
		if t.Done == 2 {
			doneCount++
		}
	}
	total := len(todos.Get())

	header := g.HStack(
		g.Text("Todos").Font(g.Title).Bold().Color(g.White).Grow(),
		g.Text(fmt.Sprintf("%d/%d", doneCount, total)).Font(g.Caption).Color(g.Hex("#ffffff99")),
		g.HStack(g.Text("⚙").Font(g.Caption).Color(g.White)).
			Stroke(g.Hex("#ffffff55"), 1).
			PaddingH(g.SpaceSM).PaddingV(g.SpaceXS).CornerRadius(6).
			OnTap(func() { showSettings.Set(true) }),
		g.HStack(g.Text("+").Bold().Color(g.White)).
			Stroke(g.Hex("#ffffff88"), 1).
			PaddingH(g.SpaceSM).PaddingV(g.SpaceXS).CornerRadius(6).
			OnTap(func() { showAdd.Set(!showAdd.Get()) }),
	).Spacing(g.SpaceSM).Background(g.Hex(colorAccent)).Padding(g.SpaceMD)

	// ── Body ──────────────────────────────────────────────────────────────────
	var rows []any

	if loadErr.Get() != "" {
		rows = append(rows, g.Text(loadErr.Get()).Font(g.Caption).Color(g.Hex(colorRed)).Padding(g.SpaceSM))
	}

	if showAdd.Get() {
		rows = append(rows,
			g.VStack(
				g.TextField(newText).
					Placeholder("What needs to be done?").
					MinHeight(40).
					OnSubmit(func(string) { saveNew() }),
				g.HStack(
					g.Button("Cancel", func() { showAdd.Set(false); newText.Set("") }),
					g.Button("Add", saveNew).Style(g.ButtonPrimary),
				).Spacing(g.SpaceSM).Align(g.Trailing),
			).Spacing(g.SpaceSM).
				Padding(g.SpaceMD).
				Background(g.Surface).
				CornerRadius(10).
				Stroke(g.Hex(colorAccent), 1),
		)
	}

	for _, t := range todos.Get() {
		t := t
		indent := g.SpaceXS
		if t.ParentID != nil {
			indent = g.SpaceLG
		}

		textView := g.Text(t.Text).Grow()
		if t.Done == 2 {
			textView = textView.Color(g.Secondary).Strikethrough(true)
		}

		rows = append(rows,
			g.HStack(
				checkBox(t.Done, func() {
					next := (t.Done + 1) % 3
					go func() {
						cl.Update(t.ID, map[string]any{
							"done":    next,
							"cascade": t.SubtaskCount > 0 && next == 2,
						})
						refresh()
					}()
				}),
				textView,
			).Spacing(g.SpaceSM).
				PaddingH(indent).
				PaddingV(g.SpaceXS),
		)
	}

	footer := g.HStack(
		g.Text(fmt.Sprintf("%s · %s", Version, Commit)).Font(g.Caption).Color(g.Hex("#bbbbbb")),
	).Align(g.Center).PaddingV(g.SpaceSM)

	return g.Scaffold(
		g.ScrollView(
			g.VStack(append(rows, footer)...).Padding(g.SpaceSM),
		),
	).Top(header)
})
