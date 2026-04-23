package cmd

import (
	"fmt"
	"time"

	"github.com/spf13/cobra"
)

var (
	addDate string
	addURL  string
)

var addCmd = &cobra.Command{
	Use:   "add <text>",
	Short: "Add a new todo",
	Args:  cobra.MinimumNArgs(1),
	RunE: func(cmd *cobra.Command, args []string) error {
		text := args[0]
		due := resolveDueDate(addDate)
		todos, err := client.Create(text, due, addURL, nil)
		if err != nil {
			return err
		}
		printTodos(todos)
		return nil
	},
}

var subCmd = &cobra.Command{
	Use:   "sub <parent-id> <text>",
	Short: "Add a subtask",
	Args:  cobra.ExactArgs(2),
	RunE: func(cmd *cobra.Command, args []string) error {
		parentID, err := parseID(args[0])
		if err != nil {
			return err
		}
		todos, err := client.Create(args[1], "", "", &parentID)
		if err != nil {
			return err
		}
		printTodos(todos)
		return nil
	},
}

func init() {
	addCmd.Flags().StringVarP(&addDate, "date", "d", "today", "Due date: today, tomorrow, someday, or YYYY-MM-DD")
	addCmd.Flags().StringVarP(&addURL, "url", "u", "", "Optional URL")
}

// resolveDueDate converts shortcuts to ISO date strings.
func resolveDueDate(s string) string {
	switch s {
	case "", "someday":
		return ""
	case "today":
		return time.Now().Format("2006-01-02")
	case "tomorrow":
		return time.Now().AddDate(0, 0, 1).Format("2006-01-02")
	default:
		// Validate it looks like a date; pass through
		if _, err := time.Parse("2006-01-02", s); err != nil {
			fmt.Printf("warning: unrecognised date %q — treating as someday\n", s)
			return ""
		}
		return s
	}
}
