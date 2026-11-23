# Privacy policy: usage-rail

Last updated: 2026-11-22

usage-rail collects no personal data and sends nothing anywhere. It has no server, no analytics and no network access.

## The directory listing (this skill)

The listing is one Markdown skill. It explains what the usage-rail widget shows and gives you the steps to install it. It reads no files, runs no code and stores nothing.

## The widget (the usage-rail mod)

When you install the widget from its marketplace, it runs inside Claude Code on your own computer and only:

- **Reads**, through Claude Code's own interface: your context-window fill (tokens and percent) and your plan-limit figures (5-hour and weekly percent used, and their reset times), as Claude Code already shows them; Claude Code's `language` setting, the system locale and the `LANG` variable, to pick the widget's language.
- **Keeps**, in Claude Code's session state on your computer: those same figures and the percent at the start of the current message, to draw the rings and the +x%. Nothing else is stored, and the values go away with the session.
- **Does**, only when you press **Compact**: asks Claude Code to compact the conversation, the same action as `/compact`.

It does not read your messages, files, credentials or tokens, and it makes no network requests. Nothing leaves your computer because of usage-rail.

## Contact

Questions or concerns: open an issue at https://github.com/camilo-chile/usage-rail/issues
