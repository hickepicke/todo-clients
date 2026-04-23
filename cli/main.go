package main

import "github.com/hickepicke/todo-clients/cli/cmd"

var version = "dev"

func main() {
	cmd.Execute(version)
}
