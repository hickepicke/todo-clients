package cmd

import (
	"fmt"
	"strconv"

	"github.com/spf13/cobra"
)

var doneCmd = &cobra.Command{
	Use:   "done <id>",
	Short: "Mark a todo as complete",
	Args:  cobra.ExactArgs(1),
	RunE: func(cmd *cobra.Command, args []string) error {
		id, err := parseID(args[0])
		if err != nil {
			return err
		}
		todos, err := client.Update(id, map[string]any{"done": true, "cascade": true})
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
