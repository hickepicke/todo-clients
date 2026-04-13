package main

import (
	"fmt"
	"os"
	"strings"

	"github.com/charmbracelet/bubbles/textinput"
	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"
)

// ── data ──────────────────────────────────────────────────────────────────────

type item struct {
	id      int
	text    string
	done    bool
	hasLink bool
	section int
}

type section struct {
	label     string
	isToday   bool
	isOverdue bool
	open      bool
}

var nextID = 20

func newID() int {
	nextID++
	return nextID
}

// ── model ─────────────────────────────────────────────────────────────────────

type mode int

const (
	modeNormal mode = iota
	modeAdd
	modeEdit
	modeConfirmDelete
)

type model struct {
	sections []section
	items    []item
	cursor   int
	rows     []rowRef
	mode     mode
	input    textinput.Model
	// which section to add into (modeAdd), which item to edit (modeEdit/modeConfirmDelete)
	targetSection int
	targetItem    int
}

type rowKind int

const (
	rowSection rowKind = iota
	rowItem
)

type rowRef struct {
	kind    rowKind
	secIdx  int
	itemIdx int // index into m.items
}

func buildRows(sections []section, items []item) []rowRef {
	buckets := make([][]int, len(sections))
	for i, it := range items {
		if it.section < len(buckets) {
			buckets[it.section] = append(buckets[it.section], i)
		}
	}
	var rows []rowRef
	for si, sec := range sections {
		rows = append(rows, rowRef{kind: rowSection, secIdx: si})
		if sec.open {
			for _, ii := range buckets[si] {
				rows = append(rows, rowRef{kind: rowItem, secIdx: si, itemIdx: ii})
			}
		}
	}
	return rows
}

func newInput(placeholder, value string) textinput.Model {
	ti := textinput.New()
	ti.Placeholder = placeholder
	ti.SetValue(value)
	ti.Focus()
	ti.Width = 42
	ti.PromptStyle = lipgloss.NewStyle().Foreground(lipgloss.Color("9"))
	ti.TextStyle = lipgloss.NewStyle().Foreground(lipgloss.Color("15"))
	return ti
}

func initialModel() model {
	sections := []section{
		{label: "OVERDUE", isOverdue: true, open: true},
		{label: "TODAY — Sun Apr 13", isToday: true, open: true},
		{label: "TOMORROW — Mon Apr 14", open: true},
		{label: "Tue Apr 15", open: false},
		{label: "Wed Apr 16", open: false},
		{label: "FUTURE", open: false},
		{label: "SOMEDAY", open: false},
	}
	items := []item{
		{id: 1, text: "Call dentist", section: 0},
		{id: 2, text: "Pay electricity bill", section: 0},
		{id: 3, text: "Buy milk", section: 1},
		{id: 4, text: "Review PR", hasLink: true, section: 1},
		{id: 5, text: "Push todo-cli to GitHub", done: true, section: 1},
		{id: 6, text: "Team standup", section: 2},
		{id: 7, text: "Weekly review", section: 2},
		{id: 8, text: "Doctor appointment", section: 3},
		{id: 9, text: "Book flights", section: 4},
		{id: 10, text: "Prep conference talk", section: 5},
		{id: 11, text: "Buy tickets for concert", section: 5},
		{id: 12, text: "Learn guitar", section: 6},
		{id: 13, text: "Read Dune", section: 6},
		{id: 14, text: "Set up home lab", section: 6},
	}
	m := model{sections: sections, items: items}
	m.rows = buildRows(m.sections, m.items)
	return m
}

// ── styles ────────────────────────────────────────────────────────────────────

var (
	styleSelected = lipgloss.NewStyle().Background(lipgloss.Color("237")).Padding(0, 1)
	styleBase     = lipgloss.NewStyle().Padding(0, 1)
	styleHeader   = lipgloss.NewStyle().Bold(true).Foreground(lipgloss.Color("9"))
	styleOverdue  = lipgloss.NewStyle().Bold(true).Foreground(lipgloss.Color("1"))
	styleSection  = lipgloss.NewStyle().Bold(true).Foreground(lipgloss.Color("15"))
	styleDone     = lipgloss.NewStyle().Faint(true).Strikethrough(true).Foreground(lipgloss.Color("8"))
	styleLink     = lipgloss.NewStyle().Foreground(lipgloss.Color("9")).Faint(true)
	styleArrow    = lipgloss.NewStyle().Foreground(lipgloss.Color("8"))
	styleID       = lipgloss.NewStyle().Foreground(lipgloss.Color("8"))
	styleHelp     = lipgloss.NewStyle().Foreground(lipgloss.Color("8")).Faint(true)
	styleInput    = lipgloss.NewStyle().Border(lipgloss.RoundedBorder()).BorderForeground(lipgloss.Color("9")).Padding(0, 1)
	styleDelete   = lipgloss.NewStyle().Bold(true).Foreground(lipgloss.Color("1"))
	styleBorder   = lipgloss.NewStyle().Border(lipgloss.RoundedBorder()).BorderForeground(lipgloss.Color("238"))
)

// ── update ────────────────────────────────────────────────────────────────────

func (m model) Init() tea.Cmd { return textinput.Blink }

func (m model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {
	case tea.KeyMsg:
		// Input modes capture keys first
		switch m.mode {
		case modeAdd:
			switch msg.String() {
			case "esc":
				m.mode = modeNormal
			case "enter":
				text := strings.TrimSpace(m.input.Value())
				if text != "" {
					m.items = append(m.items, item{
						id:      newID(),
						text:    text,
						section: m.targetSection,
					})
					m.rows = buildRows(m.sections, m.items)
					// move cursor to new item
					for i, r := range m.rows {
						if r.kind == rowItem && m.items[r.itemIdx].id == nextID {
							m.cursor = i
							break
						}
					}
				}
				m.mode = modeNormal
			default:
				var cmd tea.Cmd
				m.input, cmd = m.input.Update(msg)
				return m, cmd
			}
			return m, nil

		case modeEdit:
			switch msg.String() {
			case "esc":
				m.mode = modeNormal
			case "enter":
				text := strings.TrimSpace(m.input.Value())
				if text != "" {
					m.items[m.targetItem].text = text
					m.rows = buildRows(m.sections, m.items)
				}
				m.mode = modeNormal
			default:
				var cmd tea.Cmd
				m.input, cmd = m.input.Update(msg)
				return m, cmd
			}
			return m, nil

		case modeConfirmDelete:
			switch msg.String() {
			case "y", "Y":
				m.items = append(m.items[:m.targetItem], m.items[m.targetItem+1:]...)
				// fix section indices that shifted
				for i := range m.items {
					_ = i
				}
				m.rows = buildRows(m.sections, m.items)
				if m.cursor >= len(m.rows) {
					m.cursor = len(m.rows) - 1
				}
			}
			m.mode = modeNormal
			return m, nil
		}

		// Normal mode
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

		case " ":
			row := m.rows[m.cursor]
			if row.kind == rowItem {
				m.items[row.itemIdx].done = !m.items[row.itemIdx].done
			}

		case "enter":
			row := m.rows[m.cursor]
			if row.kind == rowSection {
				m.sections[row.secIdx].open = !m.sections[row.secIdx].open
				m.rows = buildRows(m.sections, m.items)
				if m.cursor >= len(m.rows) {
					m.cursor = len(m.rows) - 1
				}
			}

		case "a":
			row := m.rows[m.cursor]
			secIdx := row.secIdx
			// open section if closed
			m.sections[secIdx].open = true
			m.rows = buildRows(m.sections, m.items)
			m.targetSection = secIdx
			m.input = newInput("New task…", "")
			m.mode = modeAdd

		case "e":
			row := m.rows[m.cursor]
			if row.kind == rowItem {
				m.targetItem = row.itemIdx
				m.input = newInput("", m.items[row.itemIdx].text)
				m.input.CursorEnd()
				m.mode = modeEdit
			}

		case "d":
			row := m.rows[m.cursor]
			if row.kind == rowItem {
				m.targetItem = row.itemIdx
				m.mode = modeConfirmDelete
			}
		}
	}
	return m, nil
}

// ── view ──────────────────────────────────────────────────────────────────────

func (m model) View() string {
	var sb strings.Builder

	for i, row := range m.rows {
		sel := i == m.cursor
		var line string

		if row.kind == rowSection {
			sec := m.sections[row.secIdx]
			arrow := styleArrow.Render("▶")
			if sec.open {
				arrow = styleArrow.Render("▼")
			}
			var label string
			switch {
			case sec.isToday:
				label = styleHeader.Render(sec.label)
			case sec.isOverdue:
				label = styleOverdue.Render(sec.label)
			default:
				label = styleSection.Render(sec.label)
			}
			line = fmt.Sprintf(" %s  %s", arrow, label)
		} else {
			it := m.items[row.itemIdx]
			check := "☐"
			if it.done {
				check = "☑"
			}
			id := styleID.Render(fmt.Sprintf("[%d]", it.id))
			suffix := ""
			if it.hasLink {
				suffix = "  " + styleLink.Render("→ Link")
			}
			var textPart string
			if it.done {
				textPart = styleDone.Render(it.text)
			} else {
				textPart = it.text
			}
			line = fmt.Sprintf("    %s %s %s%s", id, check, textPart, suffix)
		}

		if sel {
			line = styleSelected.Render(line)
		} else {
			line = styleBase.Render(line)
		}
		sb.WriteString(line + "\n")
	}

	// Overlay / prompt at bottom
	var footer string
	switch m.mode {
	case modeAdd:
		sec := m.sections[m.targetSection]
		footer = "\n" + styleInput.Render(
			styleHeader.Render("+ Add to "+sec.label) + "\n" + m.input.View(),
		)
	case modeEdit:
		footer = "\n" + styleInput.Render(
			styleHeader.Render("Edit task") + "\n" + m.input.View(),
		)
	case modeConfirmDelete:
		it := m.items[m.targetItem]
		footer = "\n" + styleInput.Render(
			styleDelete.Render("Delete \""+it.text+"\"?") + "  " +
				styleHelp.Render("y confirm   any other key cancel"),
		)
	default:
		footer = styleHelp.Render("\n  j/k move   space done   enter expand   a add   e edit   d delete   g/G top/btm   q quit")
	}

	return "\n" + styleBorder.Render(sb.String()) + footer + "\n"
}

// ── main ──────────────────────────────────────────────────────────────────────

func main() {
	p := tea.NewProgram(initialModel(), tea.WithAltScreen())
	if _, err := p.Run(); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}
