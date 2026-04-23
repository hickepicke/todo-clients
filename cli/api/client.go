package api

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

type Client struct {
	BaseURL string
	APIKey  string
}

func (c *Client) do(method, path string, body any) ([]Todo, error) {
	var r io.Reader
	if body != nil {
		b, err := json.Marshal(body)
		if err != nil {
			return nil, err
		}
		r = bytes.NewReader(b)
	}

	req, err := http.NewRequest(method, c.BaseURL+path, r)
	if err != nil {
		return nil, err
	}
	req.Header.Set("X-API-Key", c.APIKey)
	if body != nil {
		req.Header.Set("Content-Type", "application/json")
	}

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	raw, _ := io.ReadAll(resp.Body)
	if resp.StatusCode >= 400 {
		return nil, fmt.Errorf("API error %d: %s", resp.StatusCode, string(raw))
	}

	var todos []Todo
	if err := json.Unmarshal(raw, &todos); err != nil {
		return nil, fmt.Errorf("unexpected response: %s", string(raw))
	}
	return todos, nil
}

func (c *Client) List() ([]Todo, error) {
	return c.do("GET", "/api/todos", nil)
}

func (c *Client) Create(text, dueDate, url string, parentID *int) ([]Todo, error) {
	body := map[string]any{"text": text}
	if dueDate != "" {
		body["due_date"] = dueDate
	} else {
		body["due_date"] = nil
	}
	if url != "" {
		body["url"] = url
	}
	if parentID != nil {
		body["parent_id"] = *parentID
	}
	return c.do("POST", "/api/todos", body)
}

func (c *Client) Update(id int, fields map[string]any) ([]Todo, error) {
	return c.do("PATCH", fmt.Sprintf("/api/todos/%d", id), fields)
}

func (c *Client) Delete(id int) error {
	_, err := c.do("DELETE", fmt.Sprintf("/api/todos/%d", id), nil)
	return err
}
