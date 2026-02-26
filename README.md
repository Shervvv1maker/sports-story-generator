# 🏆 Sports Story Generator

A short-form video generator for viral sports stories — built in the style of the "game background + narration + captions" TikTok format.

## Features

- **1–2 minute stories** covering 30 years of professional sports history
- **Sports covered:** NFL Football · NBA Basketball · MLB Baseball · Soccer · Golf · Formula 1
- **AI Voice narration** (Web Speech API, announcer-style voice)
- **Word-by-word captions** synced with narration, TikTok-style yellow highlight
- **Subway Surfers-style endless runner** background game you can play while listening
  - Jump obstacles (Space / Tap)
  - Slide under low bars (↓ / swipe down)
  - Collect sports balls for bonus points
- **Live ESPN stories** fetched from ESPN's API when available
- **25+ verified historical stories** as offline fallback
- **Sport filter bar** — pick NFL, NBA, MLB, Soccer, Golf, or F1
- **Auto-advance** — next story plays automatically at the end

## How to Open

1. Double-click `index.html`
   — or drag it into Chrome / Edge / Firefox

> **Best in Chrome** — richest TTS voice selection and boundary event support.

## Controls

| Key | Action |
|-----|--------|
| `Enter` | Generate new story |
| `Space` | Play / Pause |
| `N` or `→` | Skip to next story |
| `R` | Replay current story |
| `M` | Mute / Unmute |
| `Space` / Tap canvas | Jump (game) |
| `↓` | Slide under obstacles (game) |

## File Structure

```
sports-video-generator/
├── index.html          Main app shell
├── css/
│   └── styles.css      TikTok-style video UI
└── js/
    ├── stories.js      25+ stories + ESPN live API
    ├── game.js         Endless runner background game
    ├── tts.js          AI voice + caption sync engine
    └── app.js          Main controller
```

## Story Sources

All historical stories are based on verified, documented sports events from the past 30 years sourced from:
- Official league records (NFL, NBA, MLB, FIFA, PGA Tour, FIA)
- ESPN Archives
- Associated Press historical coverage

Live stories are fetched directly from the ESPN unofficial public API.
