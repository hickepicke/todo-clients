package app

import (
	"fmt"
	"sort"
	"time"

	"github.com/hickepicke/todo-clients/gui/api"
)

type Section struct {
	Key     string
	Label   string
	Items   []api.Todo
	AddDate string // ISO date for new todos in this section; "" = someday
}

func isoDate(t time.Time) string { return t.Format("2006-01-02") }
func isoToday() string           { return isoDate(time.Now()) }

func dateLabel(iso string) string {
	t, err := time.Parse("2006-01-02", iso)
	if err != nil {
		return iso
	}
	return t.Format("Mon Jan 2")
}

func groupTodos(todos []api.Todo) []Section {
	now := time.Now()
	today := isoDate(now)
	tomorrow := isoDate(now.AddDate(0, 0, 1))
	cutoff := isoDate(now.AddDate(0, 0, 6))

	var overdue, todayItems, future, someday []api.Todo
	near := map[string][]api.Todo{}

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
		case dd < today:
			overdue = append(overdue, t)
		case dd == today:
			todayItems = append(todayItems, t)
		case dd == tomorrow || dd <= cutoff:
			near[dd] = append(near[dd], t)
		default:
			future = append(future, t)
		}
	}

	sort.Slice(future, func(i, j int) bool { return *future[i].DueDate < *future[j].DueDate })
	if len(future) > 5 {
		future = future[:5]
	}

	nearDates := make([]string, 0, len(near))
	for d := range near {
		nearDates = append(nearDates, d)
	}
	sort.Strings(nearDates)

	var sections []Section
	if len(overdue) > 0 {
		sections = append(sections, Section{Key: "overdue", Label: "Overdue", Items: overdue, AddDate: today})
	}
	sections = append(sections, Section{
		Key:     "today",
		Label:   fmt.Sprintf("Today — %s", dateLabel(today)),
		Items:   todayItems,
		AddDate: today,
	})
	for _, d := range nearDates {
		sections = append(sections, Section{Key: "day-" + d, Label: dateLabel(d), Items: near[d], AddDate: d})
	}
	if len(future) > 0 {
		sections = append(sections, Section{Key: "future", Label: "Future", Items: future, AddDate: ""})
	}
	sections = append(sections, Section{Key: "someday", Label: "Someday", Items: someday, AddDate: ""})
	return sections
}

func childrenOf(todos []api.Todo, parentID int) []api.Todo {
	var out []api.Todo
	for _, t := range todos {
		if t.ParentID != nil && *t.ParentID == parentID {
			out = append(out, t)
		}
	}
	return out
}
