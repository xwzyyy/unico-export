---
name: unico-export
description: Design, validate, and export production-ready mobile pages for Unico DND through compact Unico Design IR and deterministic import-ready JSON compilation. Use when Open Design must create, extend, or fully redesign a Unico page while preserving canonical content, preventing layout errors, and using Unico visual or business components correctly.
---

# Unico Export

Use this plugin when the user wants Open Design to produce a Unico DND page directly.

Before making design decisions, read `references/design-guidelines.md`, `references/design-optimization.md`, and `references/case-derived-layout-rules.md` from this skill directory. Follow the current prompt revision and the case-derived rules for component frequency, section composition, text spacing, image aspect ratios, controlled visual variation, and dedicated business sections. Always use the staged copies from the active run instead of relying on remembered guidance.

Before writing IR, read `references/component-contract.md` and use only the documented IR fields for the components selected by the design. If the page needs network images, also read `references/verified-image-sources.md`, search for theme-specific real images, and verify every final direct URL before export. Treat component selection as a policy, not a menu: build primarily with `text`, `img`, `button`, `rectangle`, and compiler-generated `free-box` containers.

Use English exclusively in every generated string, including page copy, labels, messages, component content, documentation, and examples. Never emit Chinese or other CJK text. The compiler rejects CJK strings in IR.

Do not create HTML first unless the user explicitly asks for an HTML prototype. The fast production path is:

1. Read `unico-page.json` when it exists. Treat its `designJson` array as the canonical current canvas.
2. Run the mandatory design-optimization stage in `references/design-optimization.md`. Invoke the available UI/UX design-intelligence skill, preferring UI/UX Pro Max and its `--design-system` workflow. Generate multiple internal directions, select one controlled variation, and record it in IR `designProfile`. If the search CLI is unavailable, use the loaded UI/UX Pro Max rules plus the local reference and record the fallback source explicitly.
3. Make the design decisions with AI: audience, hierarchy, copy, sections, color, spacing, visual rhythm, differentiation, and conversion goals.
4. Preserve all existing page content unrelated to the request. For edits, do not translate existing components into IR. Write IR only for new sections or intentionally replaced content.
5. Write `unico-design-ir.json` with `"mode": "extend"` for normal edits. Use `"mode": "replace"` only when the user explicitly requests a full redesign.
6. Before compiling, verify every section against this checklist:
   - Use `text`, `img`, `button`, and `rectangle` frequently. Sections compile to `free-box` containers. Use `rich-text` only when mixed formatting is necessary.
   - Use each of `banner`, `blog-list`, `service-list`, `event-list`, `event-calendar`, `store-information`, `inquiry-box`, `goods-list`, and `map` only when the page context warrants it and never more than once.
   - Never use deprecated `img-text` or `circle`.
   - Use every other registered component only when the user explicitly requests it, and list its canonical type in top-level `explicitComponents`.
   - Keep button `paddingInline` and `paddingBlock` at `0` unless the user explicitly supplies different values. The compiler defaults both controls to `0` to prevent position drift.
   - Prefer omitting `h` for normal text so the compiler can estimate wrapped height. When a fixed height is necessary, size it conservatively, calculate the next `y` from the actual bottom, and keep overlapping text columns at least 8px apart.
   - Omit `h` for `rich-text` unless the brief requires a deliberately fixed frame. The compiler estimates it from weighted content width, inner padding, font size, line height, and a narrow-column safety allowance; explicit heights must not be smaller than that estimate.
   - Omit `h` from text-bearing `rectangle` cards. The compiler expands each card through the bottom of its contained foreground content plus `16px`; an explicit card height that clips content is rejected.
   - Match image frames to source aspect ratios and always set `fit` (`cover` or `contain`) deliberately. When source dimensions are known, include `sourceWidth` and `sourceHeight`; large `cover` crops also require an `objectPosition` focal point.
   - Search the web for every required image and use only a verified HTTP(S) raster-image URL that currently returns `HTTP 200` with an `image/*` content type. Never create or use SVG, inline SVG, data/blob URLs, local assets, placeholders, or Unsplash/Pexels/Pixabay detail pages.
   - Keep image and rectangle backgrounds below text and actions with a lower `zIndex`. Use the button's own `text` instead of overlaying a separate text component.
   - Put each top-level/business component in an IR section with no other non-navbar child. The section is only an ordering carrier; the compiler removes it and emits the component directly beside `free-box` entries.
   - Use `allowOverflow` or `allowOverlap` only for an intentional, visually justified exception.
7. Run the local compiler shipped with this skill. In Open Design runs, the active skill is staged under `.od-skills/<unico-export...>/`; list `.od-skills` if you need the exact folder name.

```bash
node "$(find .od-skills -path '*/compiler/unico-ir-compiler.mjs' -print -quit)" unico-design-ir.json unico-export-result.json unico-page.json
```

8. Inspect `validation.errors`, `validation.warnings`, and `validation.metrics`. The final validator checks every emitted component against its type-specific required-field contract, including nested tab children and preserved canonical components. Fix every missing-field error; never patch the compiled JSON manually.
9. Write the complete updated page envelope back to `unico-page.json`:

```json
{
  "designJson": [],
  "message": "short summary"
}
```

10. Return `unico-export-result.json` as a compatibility artifact. `unico-page.json` is the canonical page file for downstream consumers.

This keeps AI responsible for design judgment while deterministic code expands the verbose Unico schema.

## Unico Design IR

The IR is a compact JSON object:

```json
{
  "message": "short summary",
  "canvasWidth": 386,
  "explicitComponents": [],
  "designProfile": {
    "source": "ui-ux-pro-max",
    "query": "community events warm editorial image-led mobile landing page",
    "direction": "Warm editorial community journal",
    "variationSeed": "community-journal-07",
    "axes": {
      "layout": "asymmetric editorial stack",
      "palette": "warm paper, ink, and coral",
      "typography": "expressive display with restrained sans body",
      "imageRhythm": "one full-bleed hero followed by alternating portrait and landscape crops"
    }
  },
  "sections": [
    {
      "id": "section-hero",
      "name": "Hero",
      "label": "Hero",
      "height": 680,
      "bgColor": "#21141f",
      "children": [
        {
          "type": "text",
          "id": "hero-title",
          "label": "Hero title",
          "text": "Main heading",
          "x": 20,
          "y": 80,
          "w": 346,
          "fontSize": 40,
          "lineHeight": 1.12,
          "fontWeight": 700,
          "color": "#fff4ef"
        },
        {
          "type": "button",
          "id": "hero-cta",
          "text": "Primary CTA",
          "x": 20,
          "y": 360,
          "w": 346,
          "h": 48,
          "bgColor": "#f08a8a",
          "color": "#1b1019",
          "radius": 10
        }
      ]
    }
  ]
}
```

## Component Usage Policy

Apply these tiers before selecting any component:

- Frequent foundation: use `text`, `img`, `button`, and `rectangle` heavily. Every multi-child IR section compiles to a `free-box`, which is the primary layout container.
- Moderate: use `rich-text` only for mixed inline formatting, formatted lists, or content that cannot be represented cleanly by separate text components.
- Conditional single-use: use `banner`, `blog-list`, `service-list`, `event-list`, `event-calendar`, `store-information`, `inquiry-box`, `goods-list`, and `map` only when the page context warrants the behavior. Each type may appear at most once in the complete page.
- Deprecated: never use `img-text` or `circle`. The compiler rejects both.
- Explicit-only: use `video-player`, `countdown`, `tabs`, `accordion`, `rating`, `social-share`, `person-profile`, `coupon`, `navigation`, `brand-navbar`, `search`, and `discount-promotion` only when the user explicitly requests that capability. Add each selected canonical type to top-level `explicitComponents`.
- Unsupported: do not use any other component type unless the registry and this contract are deliberately updated first.

Accepted aliases are normalized as follows: `product-list` => `goods-list`, `blog` => `blog-list`, `inquiry` => `inquiry-box`, and `storeinfo`/`store-info` => `store-information`.

`explicitComponents` is an audit declaration, not a general allowlist. Do not populate it speculatively. It must reflect capabilities named by the user.

Use `rectangle` for cards, backgrounds, dividers, and panels. For a card containing text or controls, omit `h` and let the compiler include the foreground content plus bottom padding; set `autoFitContent: false` only for a deliberate non-card decorative rectangle. Use `img` only after searching for a real, theme-specific HTTP(S) raster image and validating the final direct URL. Never generate SVG or use a local/generated image source. Do not use a specialized component merely because it exists.

Business components own their runtime data loading. Generate their legal default configuration, keep runtime collections such as `list`, `events`, `services`, and `blogContents` empty, and prefer automatic/all-data source modes. Do not invent business records. `brand-navbar` is promoted to the top level by the compiler.

When adding a top-level/business component, create one dedicated IR section containing only that component. This section preserves page order during authoring but is not emitted as a `free-box`; the compiled component is appended directly at the top level beside existing `free-box` entries.

Promote `goods-list`, `coupon`, `navigation`, `search`, `banner`, `store-information`, `discount-promotion`, `service-list`, `event-list`, `event-calendar`, `blog-list`, `map`, and `inquiry-box` to top-level output. Each must be the sole non-navbar child of its IR section. `brand-navbar` is also top-level and its carrier section is omitted.

In `extend` mode, the compiler preserves the current canonical `designJson` objects byte-for-structure and appends only newly compiled sections. This is the default editing workflow.

## Layout Rules

- Default mobile canvas width is `386`.
- Top-level sections should be stacked vertically and use explicit heights.
- Keep child `x + w <= 386` unless intentional overflow is part of the design.
- Use `x: 20, w: 346` for common full-width content.
- Prefer a few clear sections over many tiny sections.
- Keep copy concise; Unico JSON is used for production editing.
- Omit text `h` by default and let the compiler estimate wrapped height. Use an explicit height only when the composition requires it, and never set it below the estimated content height.
- For `rich-text`, default `paddingInline` and `paddingBlock` are `10`. The automatic height uses the inner width (`w - 2 × paddingInline`), weighted glyph widths, a minimum `1.5` line-height, vertical padding, and width-dependent safety space; it rounds upward and adds a final `1px` rasterization guard.
- Button `paddingInline` and `paddingBlock` default to `0`; do not add padding to compensate for positioning.
- Text-bearing rectangle cards default to automatic content fitting with `16px` bottom padding. Explicit card heights must contain every higher-layer component that starts inside the card.
- Keep same-column text boxes at least 8px apart and never overlap them by accident.
- Use `fit: "cover"` for photographic crops and `fit: "contain"` for logos or assets that must remain fully visible.

## Design Quality Rules

Apply the current rules in `references/design-guidelines.md`. Treat those rules as design direction and keep the IR/schema/compiler requirements in this file as hard technical constraints.

## Compiler Output

The compiler writes this envelope:

```json
{
  "type": "unico_design_result",
  "message": "short summary",
  "designJson": [],
  "validation": {
    "passed": true,
    "errors": [],
    "warnings": [],
    "metrics": {
      "textCount": 0,
      "imageCount": 0,
      "richTextCount": 0
    }
  }
}
```

The compiled `designJson` uses Unico-compatible field names such as:

- `bgColor`
- `radius`
- `justify`
- `component_list`
- wrapped `{ label, type, value }` controls

If the compiler output has validation errors, fix `unico-design-ir.json` and run the compiler again. Review warnings and composition metrics before delivery; they expose sparse imagery, excessive rich text, tight section endings, and risky crop decisions even when the JSON is structurally valid.

The compiler performs a final type-specific output audit after compilation and after canonical extension. It checks:

- every root `id`, `label`, and canonical `type`;
- the complete `free-box` structure, styles, config, and wrapped controls;
- required structure and style controls for every field-based component;
- complete text/image/button/shape link values;
- every fixed business component name and required property path;
- nested tab container contracts and all nested child components;
- duplicate IDs, deprecated types, business-component top-level placement, and conditional single-use limits.

The compiler does not write `unico-page.json` when this audit fails. Preserved canonical components are checked too, so an incomplete existing component must be repaired at its source rather than silently carried into a new export.
