package main

import (
	g "github.com/nv404/gova"

	"github.com/hickepicke/todo-clients/gui/app"
)

var (
	version = "dev"
	commit  = "unknown"
)

func main() {
	app.Version = version
	app.Commit = commit
	g.RunWithConfig(g.AppConfig{
		Title:  "Todos",
		Width:  300,
		Height: 700,
	}, app.Root)
}
