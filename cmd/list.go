package cmd

import (
	"fmt"
	"sort"
	"strings"
	"time"

	"github.com/charmbracelet/lipgloss"
	"github.com/hickepicke/todo-cli/api"
	"github.com/spf13/cobra"
)

var listCmd = &cobra.Command{
	Use:   "list",
	Short: "List todos grouped by date",
	RunE: func(cmd *cobra.Command, args []string) error {
		todos, err := client.List()
		if err != nil {
			return err
		}
		printTodos(todos)
		return nil
	},
}

// ── styles ────────────────────────────────────────────────────────────────────

var (
	styleHeader   = lipgloss.NewStyle().Bold(true).Foreground(lipgloss.Color("9"))  // bright red
	styleOverdue  = lipgloss.NewStyle().Foreground(lipgloss.Color("1"))             // red
	styleToday    = lipgloss.NewStyle().Bold(true).Foreground(lipgloss.Color("9"))
	styleSection  = lipgloss.NewStyle().Bold(true).Foreground(lipgloss.Color("7"))  // white/grey
	styleDone     = lipgloss.NewStyle().Faint(true).Strikethrough(true)
	styleID       = lipgloss.NewStyle().Faint(true)
	styleLink     = lipgloss.NewStyle().Foreground(lipgloss.Color("9")).Faint(true)
	styleDateTag  = lipgloss.NewStyle().Faint(true)
)


func printTodos(todos []api.Todo) {
	now := time.Now().Format("2006-01-02")
	tomorrow := time.Now().AddDate(0, 0, 1).Format("2006-01-02")

	// Index children
	childOf := map[int][]api.Todo{}
	for _, t := range todos {
		if t.ParentID != nil {
			childOf[*t.ParentID] = append(childOf[*t.ParentID], t)
		}
	}

	// Bucket top-level todos
	var overdue, todayList, tomorrowList []api.Todo
	near := map[string][]api.Todo{}
	var beyond, someday []api.Todo

	cutoff := time.Now().AddDate(0, 0, 6).Format("2006-01-02")

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
			someday = append(someday, t)
		case dd < now:
			overdue = append(overdue, t)
		case dd == now:
			todayList = append(todayList, t)
		case dd == tomorrow:
			tomorrowList = append(tomorrowList, t)
		case dd <= cutoff:
			near[dd] = append(near[dd], t)
		default:
			beyond = append(beyond, t)
		}
	}

	sort.Slice(beyond, func(i, j int) bool { return *beyond[i].DueDate < *beyond[j].DueDate })
	if len(beyond) > 5 {
		beyond = beyond[:5]
	}

	printed := false
	nl := func() {
		if printed {
			fmt.Println()
		}
		printed = true
	}

	// Overdue
	if len(overdue) > 0 {
		nl()
		fmt.Println(styleOverdue.Render("  OVERDUE"))
		for _, t := range overdue {
			printRow(t, childOf, styleOverdue, styleDone)
		}
	}

	// Today
	nl()
	label := styleToday.Render("  TODAY — " + fmtDate(now))
	fmt.Println(label)
	if len(todayList) == 0 {
		fmt.Println(lipgloss.NewStyle().Faint(true).Render("  (empty)"))
	}
	for _, t := range todayList {
		printRow(t, childOf, styleHeader, styleDone)
	}

	// Tomorrow
	nl()
	fmt.Println(styleSection.Render("  TOMORROW — " + fmtDate(tomorrow)))
	if len(tomorrowList) == 0 {
		fmt.Println(lipgloss.NewStyle().Faint(true).Render("  (empty)"))
	}
	for _, t := range tomorrowList {
		printRow(t, childOf, styleSection, styleDone)
	}

	// Near days (today+2 through today+5)
	dates := make([]string, 0, len(near))
	for d := range near {
		dates = append(dates, d)
	}
	sort.Strings(dates)
	for _, d := range dates {
		nl()
		fmt.Println(styleSection.Render("  " + fmtDate(d)))
		for _, t := range near[d] {
			printRow(t, childOf, styleSection, styleDone)
		}
	}

	// Future (beyond)
	if len(beyond) > 0 {
		nl()
		fmt.Println(styleSection.Render("  FUTURE"))
		for _, t := range beyond {
			printRow(t, childOf, styleSection, styleDone)
		}
	}

	// Someday
	if len(someday) > 0 {
		nl()
		fmt.Println(styleSection.Render("  SOMEDAY"))
		for _, t := range someday {
			printRow(t, childOf, styleSection, styleDone)
		}
	}
}

func printRow(t api.Todo, childOf map[int][]api.Todo, active, done lipgloss.Style) {
	prefix := "  "
	id := styleID.Render(fmt.Sprintf("[%d]", t.ID))
	check := "☐"
	if t.Done {
		check = "☑"
	}

	text := t.Text
	if t.SubtaskCount > 0 {
		text += fmt.Sprintf(" (%d/%d)", t.SubtasksDone, t.SubtaskCount)
	}

	var suffix []string
	if t.URL != nil && *t.URL != "" {
		suffix = append(suffix, osc8Link(*t.URL, styleLink.Render("→ Link")))
	}
	if t.DueDate != nil && *t.DueDate != "" {
		suffix = append(suffix, styleDateTag.Render("("+fmtShort(*t.DueDate)+")"))
	}

	line := prefix + id + " " + check + " "
	if t.Done {
		line += done.Render(text)
	} else {
		line += active.Render(text)
	}
	if len(suffix) > 0 {
		line += "  " + strings.Join(suffix, "  ")
	}
	fmt.Println(line)

	// Subtasks
	for _, c := range childOf[t.ID] {
		cid := styleID.Render(fmt.Sprintf("  [%d]", c.ID))
		ccheck := "☐"
		if c.Done {
			ccheck = "☑"
		}
		ctext := c.Text
		cline := "  " + cid + " " + ccheck + " "
		if c.Done {
			cline += done.Render(ctext)
		} else {
			cline += lipgloss.NewStyle().Faint(true).Render(ctext)
		}
		if c.URL != nil && *c.URL != "" {
			cline += "  " + osc8Link(*c.URL, styleLink.Render("→ Link"))
		}
		fmt.Println(cline)
	}
}

// osc8Link returns an OSC 8 hyperlink (clickable in iTerm2 / modern terminals).
func osc8Link(url, label string) string {
	return fmt.Sprintf("\033]8;;%s\033\\%s\033]8;;\033\\", url, label)
}

func fmtDate(iso string) string {
	t, err := time.Parse("2006-01-02", iso)
	if err != nil {
		return iso
	}
	return t.Format("Mon Jan 2")
}

func fmtShort(iso string) string {
	t, err := time.Parse("2006-01-02", iso)
	if err != nil {
		return iso
	}
	return t.Format("Jan 2")
}

