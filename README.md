# usage-rail

A compact usage widget for the Claude desktop app's Code tab. It shows three rings, one row each:

- **Context**: how full the context window is, in percent and tokens (`265k · of 1M`).
- **5 hours**: your 5-hour plan limit, time left until it resets and the reset time (`8 min · 00:00`).
- **Weekly**: your weekly plan limit, time left and the reset day and time (`6d 17h · Sat 28, 17:00`).

Next to **5 hours** and **Weekly**, a small `+x%` shows how much the current (or last) message has added to that limit, live while it runs.

Next to **Context** there is a **Compact** button. It only becomes pressable once compacting is worth it: from 200k tokens, or half the context window on smaller models. Before that the summary loses detail and saves little. Hover the Context ring for a short tip.

Ring colors: green (or blue for context) while fine, amber from 75% (context: 50%), red from 90%. The widget follows the light and dark themes.

## Install

At the prompt of a Claude Code terminal session:

```
/plugin install usage-rail --marketplace camilo-chile/usage-rail
```

From a shell:

```
claude plugin install usage-rail --marketplace camilo-chile/usage-rail
```

Answer `y` to add the marketplace, then pick a scope (user scope makes it load everywhere, the desktop app included).

In the desktop app, where `/plugin` does not run: click **+** next to the prompt box, then **Plugins**, **Add marketplace** with `camilo-chile/usage-rail`, then **Add plugin**.

The widget opens by itself in new Code tab sessions of the desktop app.

## Commands

- `/usage-rail` opens the widget again if you closed it (`/uso` too, in Spanish and Portuguese).

## Languages

English, Spanish, Portuguese, French, German and Italian. The language comes from Claude Code's `language` setting, then the system locale; English otherwise.

## Notes

- Plan limits are only shown on a Claude subscription (not with an API key).
- Where the widget is placed (its own pane or the session rail) is decided by the app.
- The Compact button shows only when the widget is drawn as a full pane; the small widget form may not take clicks.

## License

MIT
