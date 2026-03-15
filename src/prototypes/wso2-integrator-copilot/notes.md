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

## 2. Slash Commands

Typing `/` or clicking the slash button opens a command palette with icons, names, and descriptions. Supports full keyboard navigation (arrow keys + enter).

Selected commands appear as **styled pills** in the input area with contextual placeholder text.

[Try the slash menu](#action-slashMenu)

---

## 3. Mode Switcher

Build and Plan modes now have distinct placeholder text so users understand the difference at a glance. The Build icon was changed from a pencil to a hammer for better semantic fit.

[Switch to Plan mode](#action-planMode) · [Switch to Build mode](#action-buildMode)

---

## 4. Tool Call Icons

Each tool action now has a **distinct icon** instead of a generic wrench:
- **Search** for library lookups
- **Package** for fetching dependencies
- **FilePen** for file updates
- **CircleCheck** for diagnostics

[View tool calls](#action-generating)

---

## 5. Checkpoint Indicator

The old dashed-line divider was replaced with a clean inline indicator. A restore button reveals its label on hover — the icon alone hints at interactivity.

[View checkpoint](#action-generating)

---

## 6. Changes Review Card

After generation completes, a diff-style card shows what was changed with Keep/Discard actions. After accepting, the card collapses with an expand toggle.

[View review state](#action-review) · [View accepted state](#action-accepted)

---

## 7. Contextual Suggestions

Suggested prompts are now **card-style chips** instead of plain blue links — more discoverable and intentional. Maybe in the future, we can show suggestions based on the user's project.

[View suggestions](#action-empty)

---

## 8. Header Cleanup

- Removed "Remaining Usage: Unlimited" — not useful when unlimited
- Clear button is **hidden on fresh conversations** — nothing to clear
