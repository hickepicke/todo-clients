package cmd

import (
	"github.com/spf13/cobra"
)

var (
	editText string
	editDate string
	editURL  string
)

var editCmd = &cobra.Command{
	Use:   "edit <id>",
	Short: "Edit a todo's text, date, or URL",
	Args:  cobra.ExactArgs(1),
	RunE: func(cmd *cobra.Command, args []string) error {
		id, err := parseID(args[0])
		if err != nil {
			return err
		}

		fields := map[string]any{}
		if cmd.Flags().Changed("text") {
			fields["text"] = editText
		}
		if cmd.Flags().Changed("date") {
			due := resolveDueDate(editDate)
			if due == "" {
				fields["due_date"] = nil
			} else {
				fields["due_date"] = due
			}
		}
		if cmd.Flags().Changed("url") {
			if editURL == "" {
				fields["url"] = nil
			} else {
				fields["url"] = editURL
			}
		}

		if len(fields) == 0 {
			return nil
		}

		todos, err := client.Update(id, fields)
		if err != nil {
			return err
		}
		printTodos(todos)
		return nil
	},
}

func init() {
	editCmd.Flags().StringVarP(&editText, "text", "t", "", "New text")
	editCmd.Flags().StringVarP(&editDate, "date", "d", "", "New due date: today, tomorrow, someday, YYYY-MM-DD")
	editCmd.Flags().StringVarP(&editURL, "url", "u", "", "New URL (empty string to clear)")
}
