package cmd

import (
	"fmt"
	"os"

	"github.com/hickepicke/todo-clients/cli/api"
	"github.com/hickepicke/todo-clients/cli/config"
	"github.com/spf13/cobra"
)

var client *api.Client

var rootCmd = &cobra.Command{
	Use:   "todo",
	Short: "CLI for todo.hicke.se",
	// No args → TUI
	RunE: func(cmd *cobra.Command, args []string) error {
		return runTUI()
	},
}

func Execute(version string) {
	rootCmd.Version = version
	if err := rootCmd.Execute(); err != nil {
		os.Exit(1)
	}
}

func init() {
	cobra.OnInitialize(initClient)

	rootCmd.AddCommand(tuiCmd)
	rootCmd.AddCommand(listCmd)
	rootCmd.AddCommand(addCmd)
	rootCmd.AddCommand(subCmd)
	rootCmd.AddCommand(doneCmd)
	rootCmd.AddCommand(rmCmd)
	rootCmd.AddCommand(editCmd)
}

func initClient() {
	cfg, err := config.Load()
	if err != nil {
		fmt.Fprintf(os.Stderr, "config error: %v\n", err)
		os.Exit(1)
	}
	if cfg.APIKey == "" {
		fmt.Fprintln(os.Stderr, "no API key found — set TODO_API_KEY or add api_key to ~/.config/todo/config.toml")
		os.Exit(1)
	}
	client = &api.Client{BaseURL: cfg.APIBase, APIKey: cfg.APIKey}
}
