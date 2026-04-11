package api

// Todo mirrors the JSON shape returned by api.hicke.se/api/todos.
type Todo struct {
	ID           int     `json:"id"`
	Text         string  `json:"text"`
	Done         bool    `json:"done"`
	Position     int     `json:"position"`
	ParentID     *int    `json:"parent_id"`
	IndentLevel  int     `json:"indent_level"`
	DueDate      *string `json:"due_date"`
	URL          *string `json:"url"`
	CreatedAt    string  `json:"created_at"`
	SubtaskCount int     `json:"subtask_count"`
	SubtasksDone int     `json:"subtasks_done"`
}
