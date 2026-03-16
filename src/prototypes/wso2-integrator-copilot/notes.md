# WSO2 Integrator Copilot — UI Unification

A walkthrough of the proposed UI/UX changes for the Copilot panel in BI and MI.

---

## 1. Welcome Screen

The welcome screen copy is updated to lead with what the tool can do for the user, while the AI disclaimer is moved to a less prominent position. This helps set a more confident first impression.

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

![Current Input Area](img/slash-commands.png#width=270)
![Proposed Input Area](img/new-slash-commands.png#width=280)

Note: BI copilot simply hides the globe since it doesn't support web search.

The mode switcher is **disabled during execution** to prevent mode changes mid-generation.

[View input area](#action-empty)

---

## 3. Slash Commands

Typing `/` or clicking the slash button opens a command palette with icons, names, and descriptions. Supports full keyboard navigation (arrow keys + enter).

![Current Slash Command Menu](img/slash-commands.png#width=290)
![Proposed Slash Command Menu](img/new-slash-commands.png#width=290)

Selected commands appear as **styled pills** in the input area with contextual placeholder text.

[Try the slash menu](#action-slashMenu)

---

## 4. Mode Switcher

The mode formerly called "Edit" (with a pencil icon) can be renamed to **Build** with a hammer icon — "Build" conveys that the copilot is constructing an implementation, not just editing text. Both modes now have distinct placeholder text so users understand the difference at a glance.

[Switch to Plan mode](#action-planMode) · [Switch to Build mode](#action-buildMode)

---

## 5. Tool Call Icons

Each tool action now has a **distinct icon** to make it easier to scan at a glance:
- **Search** for library lookups
- **Package** for fetching dependencies
- **FilePen** for file updates
- **CircleCheck** for diagnostics

Completed tool calls are greyed out to visually distinguish them from active ones. Spacing between text elements is also increased for better readability.

![Current Tool Call Icons](img/task-icons.png#width=290)
![Proposed Tool Call Icons](img/proposed-task-icons.png#width=290)

[View tool calls](#action-generating)

---

## 6. Checkpoint Indicator

The checkpoint indicator is simplified to a compact inline element. A restore button reveals its label on hover — the icon alone hints at interactivity without adding visual clutter.

![Current Checkpoint Indicator](img/checkpoint.png#width=290)
![Proposed Checkpoint Indicator](img/new-checkpoint.png#width=290)

[View checkpoint](#action-generating)

---

## 7. Contextual Suggestions

Suggested prompts are styled as **card-style chips** for better visual affordance. In the future, these could be dynamic and based on the user's project context.

[View suggestions](#action-empty)

---

## 8. Header Cleanup

- "Remaining Usage: Unlimited" is hidden when the usage is unlimited, and only shown when there's a meaningful limit to display
- Clear button is **hidden on fresh conversations** since there's nothing to clear yet
