package app

import (
	"fmt"
	"regexp"
	"strings"

	g "github.com/nv404/gova"

	"github.com/hickepicke/todo-clients/gui/api"
)

var tagRe = regexp.MustCompile(`\B#([\p{L}\p{N}_]+)`)
var tagStripRe = regexp.MustCompile(`\s*\B#[\p{L}\p{N}_]+`)

func parseTags(text string) []string {
	matches := tagRe.FindAllStringSubmatch(text, -1)
	tags := make([]string, 0, len(matches))
	for _, m := range matches {
		tags = append(tags, m[1])
	}
	return tags
}

func stripTags(text string) string {
	return strings.TrimSpace(tagStripRe.ReplaceAllString(text, ""))
}

func checkSymbol(done int) string {
	switch done {
	case 1:
		return "◑"
	case 2:
		return "☑"
	default:
		return "☐"
	}
}

func tagPill(tag string) g.View {
	return g.Text("#" + tag).Font(g.Caption).
		Color(g.Hex("#1a1a1a")).
		Background(g.Hex("#fcb001")).
		PaddingH(g.SpaceXS).
		CornerRadius(999)
}

func TodoRow(t api.Todo, children []api.Todo, cl *api.Client, refresh func(), onEdit func(api.Todo)) g.View {
	displayText := stripTags(t.Text)
	if t.SubtaskCount > 0 {
		displayText += fmt.Sprintf(" (%d/%d)", t.SubtasksDone, t.SubtaskCount)
	}

	textView := g.Text(displayText)
	if t.Done == 2 {
		textView = textView.Color(g.Secondary).Strikethrough(true)
	}

	tags := parseTags(t.Text)
	var tagRow []any
	tagRow = append(tagRow, textView.Grow().OnTap(func() { onEdit(t) }))
	for _, tag := range tags {
		tagRow = append(tagRow, tagPill(tag))
	}

	checkBtn := g.HStack(
		g.Text(checkSymbol(t.Done)).Font(g.Mono),
	).PaddingH(g.SpaceSM).PaddingV(g.SpaceXS).CornerRadius(4).
		OnTap(func() {
			next := (t.Done + 1) % 3
			go func() {
				cl.Update(t.ID, map[string]any{"done": next, "cascade": t.SubtaskCount > 0 && next == 2})
				refresh()
			}()
		})

	delBtn := g.HStack(
		g.Text("×").Font(g.Caption).Color(g.Secondary),
	).PaddingH(g.SpaceXS).OnTap(func() {
		go func() { cl.Delete(t.ID); refresh() }()
	})

	row := g.HStack(append([]any{checkBtn}, append(tagRow, delBtn)...)...).
		Spacing(g.SpaceSM).
		PaddingV(g.SpaceXS).
		PaddingH(g.SpaceSM)

	if len(children) == 0 {
		return row
	}

	childRows := []any{row}
	for _, c := range children {
		c := c
		cCheck := g.HStack(
			g.Text(checkSymbol(c.Done)).Font(g.Mono),
		).PaddingH(g.SpaceSM).PaddingV(g.SpaceXS).CornerRadius(4).
			OnTap(func() {
				next := (c.Done + 1) % 3
				go func() { cl.Update(c.ID, map[string]any{"done": next}); refresh() }()
			})

		cText := g.Text(stripTags(c.Text)).Grow()
		if c.Done == 2 {
			cText = cText.Color(g.Secondary).Strikethrough(true)
		}

		cTags := parseTags(c.Text)
		cRow := []any{cCheck, cText.OnTap(func() { onEdit(c) })}
		for _, tag := range cTags {
			cRow = append(cRow, tagPill(tag))
		}
		cRow = append(cRow, g.HStack(g.Text("×").Font(g.Caption).Color(g.Secondary)).
			PaddingH(g.SpaceXS).OnTap(func() {
			go func() { cl.Delete(c.ID); refresh() }()
		}))

		childRows = append(childRows, g.HStack(cRow...).
			Spacing(g.SpaceSM).
			PaddingV(g.SpaceXS).
			PaddingH(g.SpaceLG))
	}

	return g.VStack(childRows...)
}
