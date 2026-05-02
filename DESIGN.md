# Design Brief: Focus Guard

## Direction
Focus Guard — a lean productivity app with deep focus, minimal friction, motivational rewards through games and streaks.

## Tone
Minimalist with a heartbeat: deep, calm, meditative energy matched with purposeful interactions that celebrate focus completion.

## Differentiation
Combines productivity clarity (Linear-like precision) with wellness warmth (meditation app calm) — a productivity app that feels human, not machine-like.

## Color Palette

| Token              | OKLCH          | Role                               |
| ------------------ | -------------- | ---------------------------------- |
| background         | 0.145 0.014 260 | Deep dark charcoal, focus-ready |
| foreground         | 0.95 0.01 260  | Bright neutral for readability  |
| card               | 0.18 0.014 260 | Elevated surface for content    |
| primary            | 0.75 0.15 190  | Cyan accent, active focus state |
| accent             | 0.72 0.17 70   | Warm amber, motivational reward |
| destructive        | 0.55 0.2 25    | Red for break/stop actions      |
| muted              | 0.22 0.02 260  | Secondary surface, lower contrast |

## Typography

- Display: Space Grotesk — geometric modern, energetic headings
- Body: Figtree — warm, human-scaled, readable paragraphs
- Mono: JetBrains Mono — optional timer/stats displays
- Scale: hero `text-5xl md:text-7xl font-bold tracking-tight`, h2 `text-3xl font-bold`, label `text-sm font-semibold uppercase`, body `text-base`

## Elevation & Depth

Card-based layout with subtle shadows; cards stack at 8px elevated depth via `shadow-elevated`; no gloss or glow effects.

## Structural Zones

| Zone          | Background         | Border                      | Notes                              |
| ------------- | ------------------ | --------------------------- | ---------------------------------- |
| Header        | card 0.18 0.014 260 | border-b, muted line 0.28 0.02 260 | App title, navigation              |
| Content       | background 0.145 0.014 260 | —                          | Alternating card sections          |
| Mini-game    | card, elevated      | none or subtle border       | Game viewport with overlay UI      |
| Dashboard     | background         | —                           | Grid of stat/streak cards          |
| Focus Timer   | card, elevated      | subtle border               | Centered countdown display         |

## Spacing & Rhythm

Section gaps 24px; content grouping 16px; micro-spacing 8px/4px. Breathing room around interactive elements. Compact stats, spacious game areas.

## Component Patterns

- Buttons: rounded-md, primary cyan or accent amber, hover 5% brightness shift, active scale 98%
- Cards: rounded-md 8px, bg-card, `shadow-subtle` on light interaction, `shadow-elevated` on focus
- Badges: rounded-full, compact 6px v/h padding, muted background with foreground text

## Motion

- Entrance: cards fade + scale 0.95→1 over 300ms; timer countdown smooth tick
- Hover: button opacity 80%→100%, shadow subtle→elevated
- Decorative: breathing rhythm animation (pulse 2s) for Breathing game; subtle score pulse on tap game completion

## Constraints

- Dark mode only; no light mode option
- Minimal animation; no bouncy easing functions
- Max 3 accent colors (cyan, amber, red); no rainbow
- Typography max 2 fonts; no serif in body

## Signature Detail

Warm amber flash on streak/task completion — a micro-reward that feels earned, not cheap, delivered via a 500ms amber pulse + toast notification. Motivates without demanding.
