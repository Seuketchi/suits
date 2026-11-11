# Suits

A team of specialist skills, each with its own job and voice, that call other skills as tools.

## Language

**Character**:
A skill with a job and a voice that calls tools to do it. Donna, jessica, harvey, mike, rachel, louis and the associates are characters.
_Avoid_: agent, persona, bot

**Tool**:
A skill a character calls. It is its own file, shared by every character that needs it.
_Avoid_: plugin, helper

**Associates**:
The builders, named as a group because several run at once. Louis supervises them.
_Avoid_: implementer (the role they fill), developers

**Station**:
A role a run assigns to a worker, such as planner, researcher, reviewer or implementer. A character is a station's starting skill.
_Avoid_: job, position

**Owner**:
The one character accountable for a request, written down by donna when the request arrives. There is never more than one.
_Avoid_: assignee, stakeholder

**Working alone**:
A mode every character has for a session that cannot, or is told not to, start another session. It starts no other session and does the work of any tool itself, in one pass. A hand-off becomes a message to whoever sent the brief, in the character's own hand-over format. A pull request is read with `gh pr diff` and a commit with `git show`, never by checking a branch out.
_Avoid_: solo mode, helper mode (that is the name the session uses when it asks for this mode)

**Read-only version**:
A definition in `agents/` that another session can start for louis, mike or rachel. Its tool list has no way to edit a file or start another session. `Bash` stays, and the file cannot limit it to reading.
_Avoid_: sub-agent, read-only agent

**Hand-off packet**:
What one character passes to the next: the goal, the limits and budget, the done test, what is known and not, the questions to answer, the next owner, and the deadline. A small ask gets one line instead.
_Avoid_: ticket, brief

**Trigger**:
The fact about a task that makes a character call a tool. Without a matching trigger the tool is not called.
_Avoid_: condition, rule

**Action log**:
The one record of who was asked what, who owns it, its state, its budget and the next owner. Donna is its only writer, or the run's board, when there is one.

**Decision log**:
The one record of what was decided, by whom, why, and when. Entries are added and never rewritten. Donna is its only writer.

**Ruling**:
A verdict on a review comment in two parts: whether it is true (verified, outdated, disputed) and how serious it is (BLOCKER, SHOULD FIX, SUGGESTION).
_Avoid_: grade, label

**Rules file**:
The one file a project keeps at `.claude/suits-rules.json` to list its own `never` and `warn` rules. The hooks read it from the session's start folder up to the git root and hold no rule of their own. With no file they pass every call.
_Avoid_: config, policy

**Helper mode**:
The state of a session whose `SUITS_HELPER` variable is set to anything but empty or `0`. The mod then refuses to start any session and adds one line to the system prompt pointing the character at its Working alone section, and the status line reads `<character> · helper`. Whatever starts a helper sets the variable; this plugin only reads it.
_Avoid_: solo mode, worker mode

**Connected server**:
A server the session has connected, which suits neither ships nor names. A character names the kind it uses and works without it.
_Avoid_: MCP, integration
