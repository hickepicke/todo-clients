package main

import (
	g "github.com/nv404/gova"

	"github.com/hickepicke/todo-clients/gui/app"
)

var version = "dev"

func main() {
	g.RunWithConfig(g.AppConfig{
		Title:  "Todos",
		Width:  480,
		Height: 700,
	}, app.Root)
}
