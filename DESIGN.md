---
name: HireMind
description: Candidate triage and decision support tool — noise filtered before it reaches the recruiter.
colors:
  decisive-navy: "#00288e"
  navy-active: "#1e40af"
  signal-blue: "#3755c3"
  background: "#fbf8ff"
  surface: "#ffffff"
  surface-container-low: "#f4f2fc"
  surface-container: "#eeedf7"
  surface-container-high: "#e8e7f1"
  surface-container-highest: "#e3e1eb"
  surface-dim: "#dad9e3"
  ink: "#1a1b22"
  ink-secondary: "#444653"
  muted: "#505f76"
  outline: "#757684"
  outline-subtle: "#c4c5d5"
  periwinkle: "#b8c4ff"
  error: "#ba1a1a"
  signal-strong: "#10b981"
  signal-medium: "#f59e0b"
typography:
  h1:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "32px"
    fontWeight: 700
    lineHeight: "40px"
    letterSpacing: "-0.02em"
  h2:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "24px"
    fontWeight: 600
    lineHeight: "32px"
    letterSpacing: "-0.01em"
  h3:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 600
    lineHeight: "28px"
    letterSpacing: "0"
  body-md:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: "24px"
    letterSpacing: "0"
  body-sm:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: "20px"
    letterSpacing: "0"
  label-caps:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: "16px"
    letterSpacing: "0.05em"
  data-num:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 700
    lineHeight: "20px"
    letterSpacing: "0"
rounded:
  sm: "2px"
  md: "4px"
  lg: "8px"
  full: "12px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "40px"
  container-margin: "32px"
components:
  button-primary:
    backgroundColor: "{colors.decisive-navy}"
    textColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "12px 24px"
  button-primary-hover:
    backgroundColor: "{colors.navy-active}"
    textColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "12px 24px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  chip-tag:
    backgroundColor: "{colors.surface-container}"
    textColor: "{colors.ink-secondary}"
    rounded: "{rounded.sm}"
    padding: "2px 8px"
  chip-signal-strong:
    backgroundColor: "#d1fae5"
    textColor: "#065f46"
    rounded: "{rounded.sm}"
    padding: "2px 8px"
  chip-signal-medium:
    backgroundColor: "#fef3c7"
    textColor: "#92400e"
    rounded: "{rounded.sm}"
    padding: "2px 8px"
  chip-signal-weak:
    backgroundColor: "#fee2e2"
    textColor: "#991b1b"
    rounded: "{rounded.sm}"
    padding: "2px 8px"
---

# Design System: HireMind

## 1. Overview

**Creative North Star: "The Signal Room"**

Noise is filtered before it reaches the recruiter. What appears on screen has already been vetted — the highest-signal candidates surfaced first, the most actionable data presented without scaffolding, the clearest path to a decision visible without effort. The visual system serves this promise: it recedes so that human signal can come through.

The design is restrained corporate at its best. Not cold, not clinical — but disciplined. Whitespace is structural, not decorative; it separates decision units rather than filling empty space. Color is a precise vocabulary of decision states, not an identity statement. Typography establishes command hierarchy without drama. The recruiter is never distracted by the interface; they are guided by it silently.

This system explicitly rejects two failure modes: the **heavy-enterprise** visual language of traditional ATS platforms (Workday's dense gray hierarchies, SAP's fortress sidebars, Greenhouse's overloaded navigation trees) and the **consumer-SaaS** aesthetic of hipster productivity tools (Notion's bubbly warmth, Linear's calculated coolness, rounded-everything, personality-forward empty states). HireMind lives in the narrow space between: structured and credible without feeling bureaucratic, clean and modern without feeling like a product demo.

**Key Characteristics:**
- Tonal surface layering provides depth without shadows
- Semantic color (Decisive Navy / emerald / amber / error-red) functions as decision vocabulary, never decoration
- Sharp 2–4px radius throughout signals a professional tool, not a social app
- Manrope commands structure; Inter handles everything data and operational
- Density is a feature — the system earns its whitespace by being useful when compact

## 2. Colors: The Signal Palette

A nearly achromatic surface with one dominant authority color and a tight semantic trio for candidate fit. The palette communicates decision, not identity.

### Primary
- **Decisive Navy** (`#00288e`): The primary action color and brand anchor. Used exclusively on primary buttons, active navigation state, key metric headings, and focus indicators. Its rarity on the surface is intentional — when it appears, it means "act here."
- **Navy Active** (`#1e40af`): The hover and pressed state for Decisive Navy elements. Not used as a standalone color; only appears in response to interaction.
- **Signal Blue** (`#3755c3`): Used for surface tints on active states (active nav item background at 50% opacity, focus halos). One step brighter than Decisive Navy; marks "currently selected" without shouting.
- **Periwinkle** (`#b8c4ff`): Text color on dark/inverse surfaces. Reserved for inverse-surface contexts only — e.g. dark tooltips or the sidebar avatar background.

### Secondary
- **Muted Counsel** (`#505f76`): The secondary text color. Used for supporting metadata, sub-labels, department names, date ranges. It reads distinctly secondary without the low-contrast risk of a lighter grey.
- **Boundary Grey** (`#757684`): Borders, dividers, and placeholder text. The structural color that marks edges without competing with content.
- **Subtle Edge** (`#c4c5d5`): Lighter borders, input outlines at rest, table dividers. The quietest structural element.

### Neutral (Surface Ramp)
The surface ramp provides layering without shadows. Seven steps from dim to white:
- **Surface Dim** (`#dad9e3`): Disabled inputs, lowest-contrast structural separators.
- **Surface Highest** (`#e3e1eb`): Dense table alternating rows, highest-contrast surface container.
- **Surface High** (`#e8e7f1`): Hover state backgrounds on dense lists.
- **Surface Container** (`#eeedf7`): Default chip and tag backgrounds; sidebar active link fill.
- **Surface Low** (`#f4f2fc`): Suggestion dropdown items hover; secondary panel backgrounds.
- **Background** (`#fbf8ff`): The app canvas. A near-white with 0.004 chroma toward the navy hue — imperceptible as a color choice, coherent as a system.
- **Surface White** (`#ffffff`): Card and panel surfaces. Sits above the background, delineated by a 1px border rather than a shadow.

### Semantic Signals
- **Signal Strong** (`#10b981` / emerald): A strong candidate fit. Used on score fills, chip backgrounds (`#d1fae5`), and progress completions.
- **Signal Medium** (`#f59e0b` / amber): A medium fit requiring review. Used on attention indicators and stalled-requisition flags.
- **Constraint Red** (`#ba1a1a`): A weak fit or constraint conflict. Used sparingly; never as a background on large areas.

### Named Rules
**The One Signal Rule.** Decisive Navy appears on ≤5% of any given screen. The semantic trio (emerald / amber / red) appears only in candidate-fit contexts. Neither set is available for decoration, emphasis, or brand expression outside these roles. If a design element needs to stand out and doesn't carry a signal, it achieves emphasis through weight, size, or whitespace — not color.

**The Achromatic Floor Rule.** The background and surface layer carry 0.004–0.008 chroma toward the navy hue. Any warmer tint (toward beige, cream, or sand) is prohibited. The surface is not "warm and inviting"; it is clear and neutral.

## 3. Typography: The Command Pair

**Display Font:** Manrope (Bold 700 / SemiBold 600, with `system-ui, sans-serif` fallback)
**Body Font:** Inter (Regular 400 / SemiBold 600 / Bold 700, with `system-ui, sans-serif` fallback)

**Character:** Manrope's geometric precision establishes structural authority — it marks headings as command, not suggestion. Inter's high x-height and exceptional legibility at small sizes handles data, labels, and body copy without ever drawing attention to itself. Together they create a voice that is confident in hierarchy and invisible in detail.

### Hierarchy
- **H1 / Display** (Manrope 700, 32px/40px, -0.02em): Page titles and primary metric values only. One per screen. Not used in cards, panels, or repeated items.
- **H2 / Headline** (Manrope 600, 24px/32px, -0.01em): Section headings that organize the page. Used for names on detail views.
- **H3 / Title** (Manrope 600, 20px/28px, 0em): Card titles, sub-section headings, item labels in list views.
- **Body MD** (Inter 400, 16px/24px): Prose descriptions, job summaries, notes. Cap at 65–75ch.
- **Body SM** (Inter 400, 14px/20px): Supporting metadata, secondary descriptions, form hint text.
- **Label Caps** (Inter 600, 12px/16px, +0.05em, all-caps): Column headers, section kickers, chip labels, navigation items, status badges. The unified secondary voice.
- **Data Num** (Inter 700, 14px/20px): Scores, percentages, counts, dates. Tabular figures when available.

### Named Rules
**The Command Pair Rule.** Manrope is used only in heading roles (h1–h3). All UI labels, buttons, chips, nav items, form controls, table cells, and data use Inter. No exceptions. Mixing display personality into operational UI creates noise that degrades decision speed.

**The Label-First Rule.** All metadata descriptors use `label-caps`. There is no alternative small-text style for secondary information. One unified label voice prevents the typographic noise of mixed secondary styles across screens.

## 4. Elevation: The Flat Signal System

HireMind uses tonal layering, not structural shadows, to establish depth. The principle: the eye reads layers through surface-color steps, not z-axis theater.

The one exception is the data card — `.tonal-card` uses a minimal ambient shadow (`0 2px 4px rgba(0, 0, 0, 0.04)`) whose sole function is containment: it tells the eye "this is a discrete data unit." It does not lift the card off the surface or create depth drama.

The TopBar uses `backdrop-blur-md` with a `bg-white/90` surface. This is the only glass treatment in the system — one surface, justified by its scroll-sticky position above scrolling content.

### Shadow Vocabulary
- **Card Ambient** (`0 2px 4px rgba(0, 0, 0, 0.04)`): Applied to all `.tonal-card` surfaces. Containment only, not elevation. Card border (`1px solid #e2e8f0`) does the primary delineation work.
- **Dropdown** (`0 4px 16px rgba(0, 0, 0, 0.08)`): Applied to popover surfaces (suggestion dropdowns, context menus). The one instance of functional elevation — these surfaces actually float above content.

### Named Rules
**The Flat-By-Default Rule.** Surfaces are flat at rest. The card ambient shadow is a system constant, not a design decision available per-component. No component outside cards and dropdowns uses box-shadow. Background-to-background shadows, hover-lift animations on cards, and decorative depth effects are prohibited.

**The One Glass Rule.** `backdrop-blur` is applied to the TopBar only. No card, panel, modal, or overlay uses glassmorphism. The blur conveys "fixed, above scroll" — applying it elsewhere dissolves the meaning.

## 5. Components

Precise and restrained. Components say exactly what they need to and nothing more. Familiar conventions carry the cognitive weight; no invented affordances, no decorative softening.

### Buttons
- **Shape:** 4px radius (`--radius-lg` in the token set) — gently squared. Neither sharp-edged technical nor rounded consumer.
- **Primary:** Decisive Navy background (`#00288e`), white text, 12px/24px padding, Inter 600 14px. Hover → Navy Active (`#1e40af`). Transition: `color 200ms ease`.
- **Secondary:** Transparent background, 1px `outline` border (`#757684`), `ink` text (`#1a1b22`). Hover → Surface Low background. Same radius and type treatment as Primary.
- **Ghost / Text:** No border, no background. Primary text color (`#00288e`), Inter 600 14px. Hover → underline. Reserved for low-hierarchy actions (export, cancel, view-all links).
- **Disabled:** All variants reduce opacity to 40%. No separate disabled color — opacity communicates unavailability without a color vocabulary change.

### Chips and Tags
- **Neutral Tag:** Surface Container background (`#eeedf7`), Ink Secondary text (`#444653`), 2px radius, Label Caps style. Used for candidate tags (HIGH_POTENTIAL, ON_HOLD, etc.) and filters.
- **Signal Strong:** Light emerald background (`#d1fae5`), dark emerald text (`#065f46`). Candidate fit: strong.
- **Signal Medium:** Light amber background (`#fef3c7`), dark amber text (`#92400e`). Candidate fit: medium / needs review.
- **Signal Weak:** Light red background (`#fee2e2`), dark red text (`#991b1b`). Candidate fit: weak / constraint conflict.

All chips: Label Caps type. Remove button appears on hover only (`opacity: 0 → 1`). No chip uses a side-stripe border.

### Cards / Containers (`.tonal-card`)
- **Corner Style:** 12px (`rounded-xl`) on content cards. 8px (`rounded-lg`) on inline or compact containers.
- **Background:** White (`#ffffff`).
- **Shadow:** Card Ambient — `0 2px 4px rgba(0, 0, 0, 0.04)`.
- **Border:** `1px solid #e2e8f0` at rest; shifts to Decisive Navy (`#00288e`) on hover. Transition: `border-color 200ms ease`.
- **Internal Padding:** `lg` (24px) for standard cards; `md` (16px) for compact cards.
- **Overflow:** `hidden` required when using absolute-positioned child elements (status ribbon, score overlays).

### Inputs / Fields
- **Style:** White background, 1px `outline-subtle` border (`#c4c5d5`) at rest, 4px radius.
- **Focus:** Border shifts to Decisive Navy (`#00288e`); 1px focus ring at 30% primary opacity (`ring-primary/30`). No glow, no shadow — the border shift does the work.
- **Placeholder:** Slate-400 / `#94a3b8`. Inter 400, normal weight.
- **Label:** Always persistent above the field in `label-caps`. Never floating, never inside the input.
- **Error:** Border shifts to Constraint Red (`#ba1a1a`). Error message below in Body SM, also Constraint Red.
- **Disabled:** 40% opacity. Background shifts to Surface Container Low.

### Navigation (Sidebar)
- **Surface:** `#f8fafc` (slate-50) sidebar, 1px right border `#e2e8f0`.
- **Default Item:** Inter 14px, Muted Counsel text (`#505f76`), icon + label, 10px/12px padding. No radius on items — full-bleed horizontal.
- **Active Item:** Decisive Navy text and icon (`#00288e`), Inter 600 weight, 2px right border in Decisive Navy, Surface Low fill at 50% opacity (`bg-blue-50/50`).
- **Hover Item:** Slate-100 fill, Decisive Navy text transition 200ms.
- **Logo:** Manrope Bold, Decisive Navy. `water_drop` Material Symbol in primary white icon on navy square.

### Progress Bar
- **Track:** Surface Container Highest (`#e3e1eb`), 6px height, full-radius (3px).
- **Fill:** Signal Strong (`#10b981`) for hiring progress; Decisive Navy (`#00288e`) for score fills.
- **No animation on fill.** Static, clear states only. No pulse, no shimmer. Calm, authoritative.

### Status Indicators
The system uses an absolute-positioned 4px strip (`width: 4px, position: absolute, left: 0, top: 0`) for fit signals on cards. This is the existing `.status-ribbon` pattern. Phase toward semantic chip alternatives (Signal Strong/Medium/Weak chips) when refactoring, as the absolute-div strip approach is the progenitor of the `border-left` anti-pattern. The chip carries the same signal without structural fragility.

## 6. Do's and Don'ts

### Do:
- **Do** use Decisive Navy (`#00288e`) only for primary actions, active navigation state, focus indicators, and metric headings. Its scarcity is load-bearing.
- **Do** use `label-caps` (Inter 600, 12px, 0.05em, uppercase) for all metadata — column headers, section labels, badge text, nav items. One label voice throughout.
- **Do** use the semantic trio (emerald / amber / error-red) strictly for candidate fit signals. A chip, a progress fill, a status badge — these are the only valid contexts.
- **Do** use `text-wrap: balance` on h1–h3 elements and `text-wrap: pretty` on Body MD prose blocks.
- **Do** achieve depth through the tonal surface ramp (background → surface-container-low → surface-container → surface-container-high → white card), not through shadows or elevation.
- **Do** use `@media (prefers-reduced-motion: reduce)` for every CSS transition and animation, defaulting to instant state change.
- **Do** keep all transitions at 150–250ms with `ease-in-out` or `ease-out` curves. No bounce, no elastic, no spring.

### Don't:
- **Don't** use `border-left` or `border-right` greater than 1px as a colored stripe on cards, list items, or callouts. This is an absolute ban. The `.status-ribbon` div is the existing workaround; the better replacement is a semantic chip or tinted-background row. The `border-l-4` class found in `JobCandidatesView.tsx` line 278 is a direct violation — remove it.
- **Don't** use Workday, SAP, or Greenhouse's dense sidebar hierarchies, corporate gray palettes, or fortress navigation trees. HireMind is structured but not bureaucratic.
- **Don't** use Notion's bubbly warmth, Linear's calculated coolness, or any consumer-SaaS rounded-everything aesthetic. Components are deliberate and professional, not playful.
- **Don't** apply `backdrop-blur` to any surface other than the TopBar. The blur's meaning is "fixed above scroll." One instance.
- **Don't** use Manrope (the display font) in buttons, chips, nav labels, form controls, table cells, or data. Those are always Inter.
- **Don't** invent a warm or cream surface tint. The background (`#fbf8ff`) tilts toward the navy hue, not toward warmth. Any token with chroma toward hue 40–100 (warm) is off-system.
- **Don't** use decorative motion. Transitions are 150–250ms and communicate state change only. No orchestrated page-load sequences; no stagger animations on navigation items; no hover-lift on cards.
- **Don't** use modals as a first response to destructive or confirmatory actions. The established pattern is inline two-step confirmation (see `DeleteJobButton.tsx`).
- **Don't** add `gradient text` (`background-clip: text`). Emphasis is always weight or size, never color gradient.
