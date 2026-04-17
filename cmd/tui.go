package cmd

import (
	"fmt"
	"sort"
	"strings"
	"time"

	"github.com/charmbracelet/bubbles/textinput"
	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"
	"github.com/hickepicke/todo-clients/api"
	"github.com/spf13/cobra"
)

// ── cobra command ─────────────────────────────────────────────────────────────

var tuiCmd = &cobra.Command{
	Use:   "tui",
	Short: "Interactive TUI (default)",
	RunE: func(cmd *cobra.Command, args []string) error {
		return runTUI()
	},
}

func runTUI() error {
	p := tea.NewProgram(newTUIModel(), tea.WithAltScreen())
	_, err := p.Run()
	return err
}

// ── messages ──────────────────────────────────────────────────────────────────

type todosLoadedMsg []api.Todo
type tuiErrMsg struct{ err error }

// ── model types ───────────────────────────────────────────────────────────────

type tuiMode int

const (
	tuiNormal tuiMode = iota
	tuiLoading
	tuiAdding
	tuiEditing
	tuiConfirmDelete
)

type tuiSec struct {
	key       string // stable key for open-state tracking
	label     string
	date      string // ISO date for adding into this section, "" = someday
	isToday   bool
	isOverdue bool
}

// rowRef: todoID == -1 → section header row
type tuiRowRef struct {
	secIdx int
	todoID int
}

type tuiModel struct {
	cl          *api.Client
	todos       []api.Todo
	sections    []tuiSec
	rows        []tuiRowRef
	openState   map[string]bool
	cursor      int
	mode        tuiMode
	input       textinput.Model
	addSecIdx   int
	editTodoID  int
	delTodoID   int
	delTodoText string
	err         error
	status      string
}

func newTUIModel() tuiModel {
	tomorrow := time.Now().AddDate(0, 0, 1).Format("2006-01-02")
	return tuiModel{
		cl: client,
		openState: map[string]bool{
			"overdue": true,
			"today":   true,
			tomorrow:  true,
		},
	}
}

// ── grouping ──────────────────────────────────────────────────────────────────

func groupTodos(todos []api.Todo) ([]tuiSec, map[string][]api.Todo) {
	today := time.Now().Format("2006-01-02")
	tomorrow := time.Now().AddDate(0, 0, 1).Format("2006-01-02")
	cutoff := time.Now().AddDate(0, 0, 6).Format("2006-01-02")

	buckets := map[string][]api.Todo{}
	var beyondSlice []api.Todo

	for _, t := range todos {
		if t.ParentID != nil {
			continue
		}
		dd := ""
		if t.DueDate != nil {
			dd = *t.DueDate
		}
		switch {
		case dd == "":
			buckets["someday"] = append(buckets["someday"], t)
		case dd < today:
			buckets["overdue"] = append(buckets["overdue"], t)
		case dd == today:
			buckets["today"] = append(buckets["today"], t)
		case dd == tomorrow:
			buckets[tomorrow] = append(buckets[tomorrow], t)
		case dd <= cutoff:
			buckets[dd] = append(buckets[dd], t)
		default:
			beyondSlice = append(beyondSlice, t)
		}
	}

	sort.Slice(beyondSlice, func(i, j int) bool {
		return *beyondSlice[i].DueDate < *beyondSlice[j].DueDate
	})
	if len(beyondSlice) > 5 {
		beyondSlice = beyondSlice[:5]
	}
	buckets["future"] = beyondSlice

	// Collect near dates (today+2 through cutoff)
	nearDates := []string{}
	for k := range buckets {
		if k > tomorrow && k <= cutoff {
			nearDates = append(nearDates, k)
		}
	}
	sort.Strings(nearDates)

	var sections []tuiSec

	if len(buckets["overdue"]) > 0 {
		sections = append(sections, tuiSec{key: "overdue", label: "OVERDUE", date: today, isOverdue: true})
	}
	sections = append(sections, tuiSec{key: "today", label: "TODAY — " + tuiFmtDate(today), date: today, isToday: true})
	sections = append(sections, tuiSec{key: tomorrow, label: "TOMORROW — " + tuiFmtDate(tomorrow), date: tomorrow})
	for _, d := range nearDates {
		sections = append(sections, tuiSec{key: d, label: tuiFmtDate(d), date: d})
	}
	if len(buckets["future"]) > 0 {
		sections = append(sections, tuiSec{key: "future", label: "FUTURE", date: ""})
	}
	sections = append(sections, tuiSec{key: "someday", label: "SOMEDAY", date: ""})

	return sections, buckets
}

func buildRows(sections []tuiSec, openState map[string]bool, todos []api.Todo, buckets map[string][]api.Todo) []tuiRowRef {
	// build child index
	children := map[int][]api.Todo{}
	for _, t := range todos {
		if t.ParentID != nil {
			children[*t.ParentID] = append(children[*t.ParentID], t)
		}
	}

	var rows []tuiRowRef
	for si, sec := range sections {
		rows = append(rows, tuiRowRef{secIdx: si, todoID: -1})
		if !openState[sec.key] {
			continue
		}
		for _, t := range buckets[sec.key] {
			rows = append(rows, tuiRowRef{secIdx: si, todoID: t.ID})
			for _, c := range children[t.ID] {
				rows = append(rows, tuiRowRef{secIdx: si, todoID: -c.ID - 1000000}) // encode child: negative offset
			}
		}
	}
	return rows
}

// ── bubble tea ────────────────────────────────────────────────────────────────

func (m tuiModel) Init() tea.Cmd {
	return m.loadCmd()
}

func (m tuiModel) loadCmd() tea.Cmd {
	return func() tea.Msg {
		todos, err := m.cl.List()
		if err != nil {
			return tuiErrMsg{err}
		}
		return todosLoadedMsg(todos)
	}
}

func (m tuiModel) withTodos(todos []api.Todo) tuiModel {
	m.todos = todos
	m.sections, _ = groupTodos(todos)
	_, buckets := groupTodos(todos)
	m.rows = buildRows(m.sections, m.openState, todos, buckets)
	if m.cursor >= len(m.rows) {
		m.cursor = len(m.rows) - 1
	}
	if m.cursor < 0 {
		m.cursor = 0
	}
	return m
}

// rowTodoID decodes a row's todoID into the real todo ID.
// Returns (0, false) for section header rows.
func rowTodoID(todoID int) (realID int, isSub bool) {
	if todoID == -1 {
		return 0, false // section header
	}
	if todoID < -1 {
		return -(todoID + 1000000), true // subtask
	}
	return todoID, false
}

func (m tuiModel) findTodo(id int) *api.Todo {
	for i := range m.todos {
		if m.todos[i].ID == id {
			return &m.todos[i]
		}
	}
	return nil
}

func (m tuiModel) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {

	case todosLoadedMsg:
		m.mode = tuiNormal
		m.err = nil
		m.status = ""
		return m.withTodos([]api.Todo(msg)), nil

	case tuiErrMsg:
		m.mode = tuiNormal
		m.err = msg.err
		return m, nil

	case tea.KeyMsg:
		switch m.mode {

		case tuiAdding:
			switch msg.String() {
			case "esc":
				m.mode = tuiNormal
			case "enter":
				text := strings.TrimSpace(m.input.Value())
				if text != "" {
					sec := m.sections[m.addSecIdx]
					date := sec.date
					m.mode = tuiLoading
					return m, func() tea.Msg {
						todos, err := m.cl.Create(text, date, "", nil)
						if err != nil {
							return tuiErrMsg{err}
						}
						return todosLoadedMsg(todos)
					}
				}
				m.mode = tuiNormal
			default:
				var cmd tea.Cmd
				m.input, cmd = m.input.Update(msg)
				return m, cmd
			}
			return m, nil

		case tuiEditing:
			switch msg.String() {
			case "esc":
				m.mode = tuiNormal
			case "enter":
				text := strings.TrimSpace(m.input.Value())
				if text != "" {
					id := m.editTodoID
					m.mode = tuiLoading
					return m, func() tea.Msg {
						todos, err := m.cl.Update(id, map[string]any{"text": text})
						if err != nil {
							return tuiErrMsg{err}
						}
						return todosLoadedMsg(todos)
					}
				}
				m.mode = tuiNormal
			default:
				var cmd tea.Cmd
				m.input, cmd = m.input.Update(msg)
				return m, cmd
			}
			return m, nil

		case tuiConfirmDelete:
			m.mode = tuiNormal
			if msg.String() == "y" || msg.String() == "Y" {
				id := m.delTodoID
				m.mode = tuiLoading
				return m, func() tea.Msg {
					if err := m.cl.Delete(id); err != nil {
						return tuiErrMsg{err}
					}
					todos, err := m.cl.List()
					if err != nil {
						return tuiErrMsg{err}
					}
					return todosLoadedMsg(todos)
				}
			}
			return m, nil

		default: // tuiNormal
			switch msg.String() {
			case "q", "ctrl+c":
				return m, tea.Quit

			case "j", "down":
				if m.cursor < len(m.rows)-1 {
					m.cursor++
				}

			case "k", "up":
				if m.cursor > 0 {
					m.cursor--
				}

			case "g":
				m.cursor = 0

			case "G":
				m.cursor = len(m.rows) - 1

			case "r":
				m.mode = tuiLoading
				return m, m.loadCmd()

			case "enter":
				row := m.rows[m.cursor]
				if row.todoID == -1 {
					sec := m.sections[row.secIdx]
					m.openState[sec.key] = !m.openState[sec.key]
					_, buckets := groupTodos(m.todos)
					m.rows = buildRows(m.sections, m.openState, m.todos, buckets)
					if m.cursor >= len(m.rows) {
						m.cursor = len(m.rows) - 1
					}
				}

			case " ":
				row := m.rows[m.cursor]
				realID, isSub := rowTodoID(row.todoID)
				if realID == 0 {
					break
				}
				t := m.findTodo(realID)
				if t == nil {
					break
				}
				newDone := !t.Done
				id := t.ID
				cascade := !isSub // cascade to subtasks only for top-level todos
				m.mode = tuiLoading
				return m, func() tea.Msg {
					todos, err := m.cl.Update(id, map[string]any{"done": newDone, "cascade": cascade})
					if err != nil {
						return tuiErrMsg{err}
					}
					return todosLoadedMsg(todos)
				}

			case "a":
				row := m.rows[m.cursor]
				secIdx := row.secIdx
				m.openState[m.sections[secIdx].key] = true
				_, buckets := groupTodos(m.todos)
				m.rows = buildRows(m.sections, m.openState, m.todos, buckets)
				m.addSecIdx = secIdx
				m.input = tuiNewInput("Task text…", "")
				m.mode = tuiAdding

			case "e":
				row := m.rows[m.cursor]
				realID, _ := rowTodoID(row.todoID)
				if realID == 0 {
					break
				}
				t := m.findTodo(realID)
				if t == nil {
					break
				}
				m.editTodoID = t.ID
				m.input = tuiNewInput("", t.Text)
				m.input.CursorEnd()
				m.mode = tuiEditing

			case "d":
				row := m.rows[m.cursor]
				realID, _ := rowTodoID(row.todoID)
				if realID == 0 {
					break
				}
				t := m.findTodo(realID)
				if t == nil {
					break
				}
				m.delTodoID = t.ID
				m.delTodoText = t.Text
				m.mode = tuiConfirmDelete
			}
		}
	}
	return m, nil
}

// ── view ──────────────────────────────────────────────────────────────────────

var (
	tuiRed      = lipgloss.Color("9")
	tuiDimRed   = lipgloss.Color("1")
	tuiBgSel    = lipgloss.Color("237")

	tuiStyleSel    = lipgloss.NewStyle().Background(tuiBgSel).Padding(0, 1)
	tuiStyleBase   = lipgloss.NewStyle().Padding(0, 1)
	tuiStyleToday  = lipgloss.NewStyle().Bold(true).Foreground(tuiRed)
	tuiStyleOverdue = lipgloss.NewStyle().Bold(true).Foreground(tuiDimRed)
	tuiStyleSec    = lipgloss.NewStyle().Bold(true).Foreground(lipgloss.Color("15"))
	tuiStyleDone   = lipgloss.NewStyle().Faint(true).Strikethrough(true).Foreground(lipgloss.Color("8"))
	tuiStyleLink   = lipgloss.NewStyle().Foreground(tuiRed).Faint(true)
	tuiStyleArrow  = lipgloss.NewStyle().Foreground(lipgloss.Color("8"))
	tuiStyleID     = lipgloss.NewStyle().Foreground(lipgloss.Color("8"))
	tuiStyleHelp   = lipgloss.NewStyle().Foreground(lipgloss.Color("8")).Faint(true)
	tuiStyleInput  = lipgloss.NewStyle().Border(lipgloss.RoundedBorder()).BorderForeground(tuiRed).Padding(0, 1)
	tuiStyleErr    = lipgloss.NewStyle().Foreground(lipgloss.Color("1")).Bold(true)
	tuiStyleBorder = lipgloss.NewStyle().Border(lipgloss.RoundedBorder()).BorderForeground(lipgloss.Color("238"))

	tuiChildStyle = lipgloss.NewStyle().Faint(true)
)

func (m tuiModel) View() string {
	// Build child map for display
	children := map[int][]api.Todo{}
	for _, t := range m.todos {
		if t.ParentID != nil {
			children[*t.ParentID] = append(children[*t.ParentID], t)
		}
	}

	var sb strings.Builder

	if m.mode == tuiLoading && len(m.todos) == 0 {
		sb.WriteString(tuiStyleBase.Render("  Loading…") + "\n")
	}

	for i, row := range m.rows {
		sel := i == m.cursor
		var line string

		if row.todoID == -1 {
			// Section header
			sec := m.sections[row.secIdx]
			open := m.openState[sec.key]
			arrow := tuiStyleArrow.Render("▶")
			if open {
				arrow = tuiStyleArrow.Render("▼")
			}
			var label string
			switch {
			case sec.isToday:
				label = tuiStyleToday.Render(sec.label)
			case sec.isOverdue:
				label = tuiStyleOverdue.Render(sec.label)
			default:
				label = tuiStyleSec.Render(sec.label)
			}
			line = fmt.Sprintf(" %s  %s", arrow, label)
		} else if row.todoID < -1 {
			// Subtask (encoded as negative)
			childID := -(row.todoID + 1000000)
			var child *api.Todo
			for idx := range m.todos {
				if m.todos[idx].ID == childID {
					child = &m.todos[idx]
					break
				}
			}
			if child == nil {
				continue
			}
			check := "☐"
			if child.Done {
				check = "☑"
			}
			text := child.Text
			if child.Done {
				text = tuiStyleDone.Render(text)
			} else {
				text = tuiChildStyle.Render(text)
			}
			id := tuiStyleID.Render(fmt.Sprintf("[%d]", child.ID))
			line = fmt.Sprintf("      %s %s %s", id, check, text)
		} else {
			// Top-level todo
			t := m.findTodo(row.todoID)
			if t == nil {
				continue
			}
			check := "☐"
			if t.Done {
				check = "☑"
			}
			id := tuiStyleID.Render(fmt.Sprintf("[%d]", t.ID))
			text := t.Text
			if t.SubtaskCount > 0 {
				text += fmt.Sprintf(" (%d/%d)", t.SubtasksDone, t.SubtaskCount)
			}
			var textPart string
			if t.Done {
				textPart = tuiStyleDone.Render(text)
			} else {
				textPart = text
			}
			suffix := ""
			if t.URL != nil && *t.URL != "" {
				suffix = "  " + tuiStyleLink.Render("→ Link")
			}
			line = fmt.Sprintf("    %s %s %s%s", id, check, textPart, suffix)
		}

		if sel {
			line = tuiStyleSel.Render(line)
		} else {
			line = tuiStyleBase.Render(line)
		}
		sb.WriteString(line + "\n")
	}

	body := tuiStyleBorder.Render(sb.String())

	// Footer
	var footer string
	switch m.mode {
	case tuiAdding:
		sec := m.sections[m.addSecIdx]
		footer = "\n" + tuiStyleInput.Render(
			tuiStyleToday.Render("+ Add to "+sec.label)+"\n"+m.input.View(),
		)
	case tuiEditing:
		footer = "\n" + tuiStyleInput.Render(
			tuiStyleToday.Render("Edit task")+"\n"+m.input.View(),
		)
	case tuiConfirmDelete:
		footer = "\n" + tuiStyleInput.Render(
			tuiStyleErr.Render("Delete \""+m.delTodoText+"\"?") + "  " +
				tuiStyleHelp.Render("y = confirm   any other key = cancel"),
		)
	case tuiLoading:
		footer = tuiStyleHelp.Render("\n  Syncing…")
	default:
		if m.err != nil {
			footer = "\n" + tuiStyleErr.Render("  Error: "+m.err.Error())
		} else {
			footer = tuiStyleHelp.Render("\n  j/k move   space done   enter expand   a add   e edit   d delete   r refresh   q quit")
		}
	}

	return "\n" + body + footer + "\n"
}

// ── helpers ───────────────────────────────────────────────────────────────────

func tuiNewInput(placeholder, value string) textinput.Model {
	ti := textinput.New()
	ti.Placeholder = placeholder
	ti.SetValue(value)
	ti.Focus()
	ti.Width = 44
	ti.PromptStyle = lipgloss.NewStyle().Foreground(tuiRed)
	ti.TextStyle = lipgloss.NewStyle().Foreground(lipgloss.Color("15"))
	return ti
}

func tuiFmtDate(iso string) string {
	t, err := time.Parse("2006-01-02", iso)
	if err != nil {
		return iso
	}
	return t.Format("Mon Jan 2")
}
