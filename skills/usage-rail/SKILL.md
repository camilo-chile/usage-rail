---
name: usage-rail
description: Use when the user wants to see their Claude plan usage (5-hour limit, weekly limit, context window) in the desktop app without cluttering the chat, asks what each prompt costs them, or asks how to install or use the usage-rail widget. Explains what usage-rail shows and gives the user the steps to install it from its author's marketplace.
---

# usage-rail

usage-rail is a side-panel widget for the Claude desktop app (Code tab). It keeps the chat clean: it draws nothing above or below the prompt box. In its own pane it shows three small rings:

- **Context**: how full the context window is, in percent and tokens (for example `309k · of 1M`), with a **Compact** button next to it that becomes pressable only once compacting is worth it (from 200k tokens, or half the window on smaller models).
- **5 hours**: the 5-hour plan limit, a live **+x%** for what the current message has added, and the time left and reset time (for example `4h 51m · 01:40`).
- **Weekly**: the weekly plan limit, its live **+x%**, and the time left and reset day and time (for example `5d 20h · Sat 28, 17:00`).

The widget itself is a mod (a hooks module), which this directory lists only from Verified organizations. This listing is the guide; the widget installs from the author's own marketplace on GitHub: https://github.com/camilo-chile/usage-rail

## When the user wants to install it

Give the user these steps and let them run them. Do not run installation commands yourself unless the user asks you to.

**In the Claude desktop app:** click **+** next to the prompt box, then **Plugins**, **Add marketplace**, enter `camilo-chile/usage-rail`, then **Add plugin** and pick **usage-rail**.

**At the prompt of a Claude Code terminal session:**

```
/plugin install usage-rail --marketplace camilo-chile/usage-rail
```

**From a shell:**

```
claude plugin install usage-rail --marketplace camilo-chile/usage-rail
```

Tell the user to answer `y` to add the marketplace and to pick the **user** scope, so the widget loads in every session, the desktop app included. The widget opens by itself in new Code tab sessions; `/usage-rail` opens it again if it was closed.

## When the user asks how to read it

- Ring colors: green (blue for context) while fine, amber from 75% (context: from 50%), red from 90%.
- `+<1%` means the current message has not yet moved that limit by a whole point; the app reports plan limits in whole points.
- The +x% count restarts with each message; subagents running inside a message count toward it.
- Plan limits appear only on a Claude subscription, not with an API key.

Source code, license (MIT) and issues: https://github.com/camilo-chile/usage-rail
