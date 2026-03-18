# WSO2 Integrator Copilot — UI Unification

A walkthrough of the proposed UI/UX changes for the Copilot panel in BI and MI.

---

## 1. Welcome Screen

The welcome screen copy is updated to lead with what the tool can do for the user. The AI disclaimer ("AI-generated output may contain mistakes. Review before adding to your integration.") is moved to a small text line below the input area, and only appears after the user sends their first message.

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

![Current Input Area](img/input-area.png#width=270)
![Proposed Input Area](img/new-input-area.png#width=280)

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

Two options for the checkpoint indicator:

**Option A — Divider**: A centered "Restore Checkpoint" label on a thin divider line, visible only when hovering over the conversation turn. Treats the checkpoint as a boundary marker rather than a status message.

**Option B — Inline**: A compact inline element with a green checkmark. The restore button reveals its label on hover.

![Current Checkpoint Indicator](img/checkpoint.png#width=290)

![Proposed Checkpoint Indicator #1](img/new-checkpoint-2.png#width=290)
![Proposed Checkpoint Indicator #2](img/new-checkpoint.png#width=290)

[Option A: Divider](#action-checkpointDivider) · [Option B: Inline](#action-checkpointInline)

Note: Switch to a non-empty state (e.g. "View tool calls" below) to see the checkpoint in action, then hover over the chat area for Option A.

---

## 7. Contextual Suggestions

Suggested prompts are styled as **card-style chips** for better visual affordance. In the future, these could be dynamic and based on the user's project context.

![Current Suggestions](img/suggestions.png#width=290)
![Proposed Suggestions](img/new-suggestions.png#width=290)

[View suggestions](#action-empty)

---

## 8. Thinking State

When the copilot is reasoning through a complex request, a **"Thinking..."** indicator is shown with animated trailing dots. Once complete, it collapses to **"Thought for Xs"** — clicking expands to reveal the thinking process. This gives users transparency into the AI's reasoning without cluttering the chat by default.

Thinking can appear at two levels:
- **Top-level** — before the AI response begins, as a standalone block

[View thinking state](#action-thinking) · [View thought complete](#action-thoughtComplete)

![Thinking Top Level](img/thinking.png#width=290)

- **Inside a plan task** — as part of a task's tool call list. When expanded, the thinking content appears in-place at the same indent level as other tool calls (no extra nesting), styled in italic to distinguish it from actions.

[View thinking in plan task](#action-planBuilding)

![Thinking in a Plan Task](img/thinking-in-task.png#width=300)

---

## 9. Terminal & HTTP Execution

A unified approach for running commands and testing endpoints, replacing the separate "Running Program" / "Service Logs" cards in BI and the "Shell" card in MI.

**Bash Tool Card** — for running commands (`bal run`, `bal test`, etc.):
- Compact single-line view by default: icon + title + status text
- Title describes the *intent* (e.g., "Build and run the service"), not the command
- Terminal output is hidden behind an expand — low-code users see the result, pro-code users can drill into details
- Contextual icons: Play for running, Flask for tests
- Auto-expands on error so failures are immediately visible

![Bash Tool Card](img/bash-tool.png#width=300)

**HTTP Test Card** — for testing endpoints:
- Shows a list of endpoints with method badge (`GET`, `POST`), path, and status code
- Each row expands to reveal the response body
- No success icons — only shows error icon for failed requests (4xx/5xx)
- Status codes are gray for success, red for errors

![Testing Services](img/test-services.png#width=300)

[View terminal demo](#action-terminalDemo)

---

## 10. Header & Auth Provider

The header has two variations — one for BI and one for MI — while sharing the same auth provider chip on the left.

**BI header:** Auth chip + Clear (hidden on fresh conversations) + Settings

**MI header:** Auth chip + New Chat (with dropdown for session history) + Logout

[BI Header](#action-headerBI) · [MI Header](#action-headerMI)

The header left side adapts based on the user's authentication method:
- **WSO2 Cloud** — shows `Remaining Usage:` as plain text with `[Unlimited]` in a chip. When limits are enforced, the chip can show a counter like `[42 remaining]`.
- **Anthropic API / AWS Bedrock / Vertex AI** — shows a key icon with the provider name in a chip. No usage info since WSO2 doesn't manage the quota for BYOK users.

Auth providers: [WSO2 Cloud](#action-authWso2) · [Anthropic API](#action-authAnthropic) · [AWS Bedrock](#action-authBedrock) · [Vertex AI](#action-authVertex)
