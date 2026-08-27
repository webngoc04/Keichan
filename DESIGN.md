# DESIGN.md — CommandCode Developer-First Design System

This document defines the UI/UX design language and styling principles for **new-api**, establishing a sleek, developer-centric aesthetic inspired by CommandCode (`https://commandcode.ai`).

---

## 1. Core Philosophy

- **Developer-First & High Information Density**: Clean, purposeful interfaces prioritizing clarity, low visual noise, and rapid comprehension.
- **Obsidian Dark Canvas & High Contrast**: Deep dark backgrounds (`oklch(0.12 0 0)` / `#050505` to `#09090b`) with crisp white typography and electric violet (`#8C4EDD` / `oklch(0.65 0.24 285)`) primary accents.
- **Structural Frame Grid Architecture**: Content organized inside framed containers (`command-frame`, `max-w-[1220px]`) with visible 1px borders, monospace technical tags, and corner crosshair accents (`command-corner`).
- **Precision Typography**: Humanist Sans paired with Monospace metadata tags, uppercase status chips, and technical labels (`[01 // ROUTING]`, `[99.9% UPTIME]`).

---

## 2. Color Palette & Tokens

### Dark Mode (Primary Default)
| Token | OKLCH Value | Role / Usage |
| :--- | :--- | :--- |
| `--background` | `oklch(0.12 0 0)` | Deep obsidian base canvas |
| `--card` | `oklch(0.15 0 0)` | Elevated card surfaces |
| `--border` | `oklch(1 0 0 / 12%)` | Subtle 1px structural grid lines |
| `--primary` | `oklch(0.65 0.24 285)` | CommandCode Electric Violet highlight |
| `--muted-foreground` | `oklch(0.65 0 0)` | Slate secondary text & metadata |
| `--foreground` | `oklch(0.985 0 0)` | Pure high-contrast white headlines |

### Accent Highlights
- **Success / Online**: `oklch(0.70 0.17 155)` (Emerald pulse indicator)
- **Warning / Degraded**: `oklch(0.78 0.18 75)` (Amber tag)
- **Violet Glow / Active**: `oklch(0.65 0.24 285)` (Primary accent glow & badge fills)

---

## 3. Structural & Component Conventions

### 1. Framed Canvas Containers
- Wrap major page heroes and sections inside `rounded-2xl md:rounded-3xl border border-border/80 bg-card/40 backdrop-blur-md command-corner`.
- Include a top ticker/status bar:
  ```tsx
  <div className='flex items-center justify-between border-b border-border/80 px-4 py-2.5 font-mono text-[11px] text-muted-foreground bg-muted/20'>
    <span>● SYSTEM STATUS: READY</span>
    <span>[PROXY LATENCY: <15MS]</span>
  </div>
  ```

### 2. Monospace Metadata & Index Tags
- Use monospace indicators above section headings:
  - `// 01 ARCHITECTURE`
  - `// 02 ROUTING & FAILOVER`
  - `// 03 PRICING TIERS`
- Numbered bento cards: `01 // TRIAL`, `02 // PAYG_PRODUCTION`, `03 // DEDICATED_SLA`.

### 3. Interactive Code & Terminal Blocks
- Real-world multi-protocol code switchers (`cURL`, `Python`, `TypeScript`, `Go`).
- 1-click copy snippet button with visual feedback (`Check` icon).
- Dark terminal frame with clean dot indicators.

### 4. Pill Buttons & Actions
- Primary CTA: `rounded-full px-6 h-10 font-semibold bg-primary text-primary-foreground shadow-md hover:opacity-90`.
- Secondary / Ghost: `rounded-full px-5 h-10 border border-border/80 font-mono text-xs hover:border-foreground/40`.

---

## 4. Internationalization (i18n) Rules

- Every newly introduced label, badge, button, or description MUST use `t('English source key')`.
- All keys must be synced across all 7 locale files (`en`, `zh`, `zh-TW`, `vi`, `fr`, `ja`, `ru`) via `bun run i18n:sync`.
