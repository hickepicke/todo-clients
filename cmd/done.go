package cmd

import (
	"fmt"
	"strconv"

	"github.com/hickepicke/todo-cli/api"
	"github.com/spf13/cobra"
)

var doneCmd = &cobra.Command{
	Use:   "done <id>",
	Short: "Toggle a todo's done state",
	Args:  cobra.ExactArgs(1),
	RunE: func(cmd *cobra.Command, args []string) error {
		id, err := parseID(args[0])
		if err != nil {
			return err
		}
		// Fetch current state to toggle
		all, err := client.List()
		if err != nil {
			return err
		}
		var current *api.Todo
		for i := range all {
			if all[i].ID == id {
				current = &all[i]
				break
			}
		}
		if current == nil {
			return fmt.Errorf("todo %d not found", id)
		}
		newDone := !current.Done
		todos, err := client.Update(id, map[string]any{"done": newDone, "cascade": true})
		if err != nil {
			return err
		}
		printTodos(todos)
		return nil
	},
}

var rmCmd = &cobra.Command{
	Use:   "rm <id>",
	Short: "Delete a todo",
	Args:  cobra.ExactArgs(1),
	RunE: func(cmd *cobra.Command, args []string) error {
		id, err := parseID(args[0])
		if err != nil {
			return err
		}
		if err := client.Delete(id); err != nil {
			return err
		}
		todos, err := client.List()
		if err != nil {
			return err
		}
		fmt.Printf("deleted [%d]\n", id)
		printTodos(todos)
		return nil
	},
}

func parseID(s string) (int, error) {
	id, err := strconv.Atoi(s)
	if err != nil || id <= 0 {
		return 0, fmt.Errorf("invalid id %q — must be a positive integer", s)
	}
	return id, nil
}
