package config

import (
	"os"
	"path/filepath"

	"github.com/BurntSushi/toml"
)

type Config struct {
	APIKey  string `toml:"api_key"`
	APIBase string `toml:"api_base"`
}

const defaultBase = "https://api.hicke.se"

func Load() (*Config, error) {
	cfg := &Config{}

	// 1. File
	home, err := os.UserHomeDir()
	if err == nil {
		path := filepath.Join(home, ".config", "todo", "config.toml")
		if _, err := os.Stat(path); err == nil {
			if _, err := toml.DecodeFile(path, cfg); err != nil {
				return nil, err
			}
		}
	}

	// 2. Env overrides
	if v := os.Getenv("TODO_API_KEY"); v != "" {
		cfg.APIKey = v
	}
	if v := os.Getenv("TODO_API_BASE"); v != "" {
		cfg.APIBase = v
	}

	if cfg.APIBase == "" {
		cfg.APIBase = defaultBase
	}

	return cfg, nil
}
