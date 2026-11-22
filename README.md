# usage-rail

**Your Claude usage in a side panel, never on top of your chat. And what every prompt costs you.**

usage-rail is a side-panel widget for the Claude desktop app (Code tab). Your context, your 5-hour limit and your weekly limit sit quietly beside the conversation, in their own pane, leaving the chat exactly as it was: no band above the prompt, no extra lines under it, no status bar to squint at. And next to each limit, a live **+x%** tells you how much the message you just sent has spent.

```
 ◯ 31%  Context              [Compact]
        309k · of 1M
 ◯  6%  5 hours +1%
        4h 51m · 01:40
 ◯ 21%  Weekly +<1%
        5d 20h · Sat 28, 17:00
```

## Why it exists

Claude plans have a 5-hour limit and a weekly limit. The app tells you how full they are, but not **what is filling them**. Was it that long refactor? The subagents? The 300k-token context you have been dragging along? You find out when you hit the wall.

Other usage plugins answer part of that by drawing bands and meters right where you read and type, pushing your conversation up with every line they add. usage-rail takes the opposite approach:

- **A clean chat, always.** Everything lives in a separate side pane, next to the conversation and never inside it. Your messages, the prompt box and the space around them stay untouched. Glance right when you want the numbers; ignore them when you don't. Three small rings, nothing else.
- **+x% per message, live.** Next to the 5-hour and weekly rings, a small figure counts up while Claude answers your current message: `+3%` on the 5-hour limit means that one prompt cost 3% of your window. You learn which prompts are cheap and which ones burn your plan, and you adjust *before* you are locked out.
- **Exact reset times, not just countdowns.** `4h 51m · 01:40` and `5d 20h · Sat 28, 17:00`: how long, and when on your clock.
- **Context you can act on.** The context ring shows how full the window is in percent and tokens. Big contexts make every following message more expensive, so a **Compact** button sits right next to it. The button **unlocks only when compacting is worth it**: from 200k tokens, or half the window on smaller models. Before that, a summary loses detail and saves little. Hover the ring for a one-line tip.
Most usage tools show where you stand, and they show it on top of your work. usage-rail keeps your chat clean and also shows **what each message costs**, which is what you need to make your plan last.

## Install

At the prompt of a Claude Code terminal session:

```
/plugin install usage-rail --marketplace camilo-chile/usage-rail
```

From a shell:

```
claude plugin install usage-rail --marketplace camilo-chile/usage-rail
```

Answer `y` to add the marketplace, then pick the **user** scope so it loads everywhere, the desktop app included.

In the desktop app, where `/plugin` does not run: click **+** next to the prompt box, then **Plugins**, **Add marketplace** with `camilo-chile/usage-rail`, then **Add plugin**.

The widget opens by itself in every new Code tab session. No setup, no API key, no configuration.

## Reading it

| Ring | Shows | Colors |
| --- | --- | --- |
| Context | % of the context window, tokens used of the window | blue, amber from 50%, red from 90% |
| 5 hours | % of your 5-hour limit, **+x% this message**, time left · reset time | green, amber from 75%, red from 90% |
| Weekly | % of your weekly limit, **+x% this message**, time left · reset day and time | green, amber from 75%, red from 90% |

- `+<1%` means the message has not yet moved the limit by a whole point: the app reports limits in whole points.
- The count restarts with each message you send; subagents running inside a message count toward it.

## Commands

- `/usage-rail` opens the widget again if you closed it (`/uso` too, in Spanish and Portuguese).

## Languages

English, Spanish, Portuguese, French, German and Italian, picked automatically from Claude Code's `language` setting or your system language; English otherwise.

## Requirements and notes

- The Claude desktop app with the Code tab, on a Claude subscription (Pro or Max). Plan limits are not reported with an API key.
- The app decides where the pane sits; drag its edge to make it narrower.
- The Compact button shows when the widget is drawn as a full pane. In the app's small widget form, clicks may not reach it.

## License

MIT
