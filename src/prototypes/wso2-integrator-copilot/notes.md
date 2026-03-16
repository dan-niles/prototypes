# WSO2 Integrator Copilot — UI Unification

A walkthrough of the proposed UI/UX changes for the Copilot panel in BI and MI.

---

## 1. Welcome Screen

The welcome screen now leads with **value** instead of a disclaimer. The original text warned users that AI can make mistakes — the new copy communicates what the tool helps you do. 

Note: We can reuse the original icons currently used in BI; this prototype uses `lucide-react` icons as placeholders.

![Current Welcome Screen](img/copilot-welcome-screen.png#width=270)
![Proposed Welcome Screen](img/new-copilot-welcome-screen.png#width=280)

[View welcome screen](#action-empty)

---

## 2. Input Area & Toolbar Layout

The input toolbar is reorganized into two logical groups:

**Left — Behavior settings** (how the AI responds):
- **Build / Plan** mode switcher — controls the response strategy
- **Web Search** toggle (globe icon) — enables web search capability (MI only)

**Right — Composition tools** (help you write & send):
- **/** slash commands — insert a command
- **Attach** — add files or context
- **Send / Stop** — submit or cancel

This grouping scales well: BI copilot simply hides the globe since it doesn't support web search.

The mode switcher is **disabled during execution** to prevent mode changes mid-generation.

[View input area](#action-empty)

---

## 3. Slash Commands

Typing `/` or clicking the slash button opens a command palette with icons, names, and descriptions. Supports full keyboard navigation (arrow keys + enter).

![Slash Command Menu](img/slash-commands.png#width=270)
![Proposed Slash Command Menu](img/new-slash-commands.png#width=280)

Selected commands appear as **styled pills** in the input area with contextual placeholder text.

[Try the slash menu](#action-slashMenu)

---

## 4. Mode Switcher

The mode formerly called "Edit" (with a pencil icon) has been renamed to **Build** with a hammer icon — "Build" better conveys that the AI is constructing an implementation, not just editing text. Both modes now have distinct placeholder text so users understand the difference at a glance.

[Switch to Plan mode](#action-planMode) · [Switch to Build mode](#action-buildMode)

---

## 5. Tool Call Icons

Each tool action now has a **distinct icon** instead of a generic wrench:
- **Search** for library lookups
- **Package** for fetching dependencies
- **FilePen** for file updates
- **CircleCheck** for diagnostics

When the tool call is complete, the line becomes greyed out to indicate completion. Also, the current UI text feels too condensed, so add more spacing between text elements.

![Current Tool Call Icons](img/task-icons.png#width=290)
![Proposed Tool Call Icons](img/proposed-task-icons.png#width=290)

[View tool calls](#action-generating)

---

## 6. Checkpoint Indicator

The old dashed-line divider was replaced with a clean inline indicator. A restore button reveals its label on hover — the icon alone hints at interactivity.

[View checkpoint](#action-generating)

---

## 7. Changes Review Card

After generation completes, a diff-style card shows what was changed with Keep/Discard actions. After accepting, the card collapses with an expand toggle.

[View review state](#action-review) · [View accepted state](#action-accepted)

---

## 8. Contextual Suggestions

Suggested prompts are now **card-style chips** instead of plain blue links — more discoverable and intentional. Maybe in the future, we can show suggestions based on the user's project.

[View suggestions](#action-empty)

---

## 9. Header Cleanup

- Removed "Remaining Usage: Unlimited" — not useful when unlimited
- Clear button is **hidden on fresh conversations** — nothing to clear
