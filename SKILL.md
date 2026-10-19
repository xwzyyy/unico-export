---
name: unico-export
description: Design, edit, validate, and export polished mobile pages for Unico DND from natural-language briefs using Unico Design IR and the local compiler. Use for direct page creation or editing; use the measured HTML workflow for source-faithful reproduction.
---

# Unico Export

Turn the brief into a complete, distinctive mobile page whose content, imagery, and art direction are visible in the emitted JSON. The brief and supplied materials are factual sources; use design judgment for visual choices, never to invent business facts.

## Route the task

- **New page or full redesign:** read `references/design-playbook.md`, `references/component-recipes.md`, and `references/component-contract.md`. Read `references/visual-recipes.md` for a matching case direction, `references/verified-image-sources.md` for photographs, and `references/small-visual-assets.md` when a purposeful icon or small illustration fits the brief.
- **Extend an existing page:** inspect the canonical JSON, preserve unrelated components, and add only what the requested change needs. Keep the existing design language unless asked to change it.
- **Reproduce existing HTML:** use the active HTML conversion workflow. Its rendered appearance, copy, assets, and measured geometry are the source of truth; do not redesign it.

## Generate and review

1. Inspect available user assets and the current canonical page. Extract the audience, page goal, primary action, required information, explicit style cues, and confirmed facts.
2. For a direct design, create a content outline and visual-cue map before IR. Standard brand, community, service, and event pages should feel complete by default: usually 6–9 purpose-built sections and roughly 50–60 meaningful visible text runs. Treat this as a completeness baseline, not filler quota; scale down only for an explicitly short brief or genuinely narrow task. Do not count repeated decorative text as content. Expand the outline to at least twice the substance of a sparse first-pass page when the brief supports it.
3. For every new page or full redesign, proactively source and place at least one real photo/image module (`img` plus its content/frame) in the final JSON. Search the approved free commercial-use libraries in `references/verified-image-sources.md`; record the individual source page and its author/license, and use the library's image CDN URL. A failed or unavailable CDN HEAD check is not a reason to omit the image: record that limitation and continue with the sourced CDN URL. If extraction fails, search another result and then the next library. Never invent a URL, author, license, status code, or MIME type. Local paths and empty `src` values must never pass as exported sources. Add supporting images only when they materially improve the page.
4. Plan the page as `section → recipe IDs → content/assets`. Use 2–4 combinations from `references/component-recipes.md`; default to simple combinations such as an image with a rounded frame, a centered information card, a flat color plate, a thin divider, an underline, or one compact label. Use no more than one expressive/complex treatment unless the brief asks for more. Map every explicit style cue to a recipe and concrete component IDs; do not claim a style in `designProfile` unless the JSON visibly implements it. Add a small graphic only when it serves the brief, information hierarchy, or an explicit art direction; do not add filler. Avoid drawing elaborate subject-matched decorations (for example, constructing many tiny Mahjong tiles, a miniature room, or a custom mascot) when a photograph and simple geometric accents communicate the idea more clearly.
5. Write compact `unico-design-ir.json` using only `references/component-contract.md`. Use `mode: "extend"` for ordinary edits and `mode: "replace"` only for a requested full redesign. Preserve the English-only generated-string constraint.
6. Compile with `compiler/unico-ir-compiler.mjs`. Fix IR errors, inspect warnings, and audit the emitted JSON for content scale, images, style-cue evidence, type/color/layout rhythm, overlap, and clipping. Keep recovering in the same turn until the compiler passes: simplify or replace unsupported effects with the closest supported recipe, repair invalid fields/geometry, and recompile. Deliver only when `validation.passed` is true; a generated result with validation errors is a failed draft, not an export. Inspect a rendered preview when available; if preview access is unavailable, deliver the validated JSON and state that visual rendering was not checked.
7. Do not end with a plan, a blocked status, or a request for routine assets when a reasonable fallback can complete the page. For unavailable images, retry with another result/library while preserving the required single image module; do not replace it with an image-free treatment. For unknown business facts, use concise neutral editable copy or omit the claim; for unsupported visual effects, use a supported shape, layer, color, or typography treatment. Ask only when the missing information is essential to avoid fabricating a consequential fact or changing the requested page purpose.
8. Deliver the complete canonical `unico-page.json` envelope and compatibility `unico-export-result.json`. Report staged assets and any visual effects that could not be verified.

The canonical page is a complete envelope, not a patch:

```json
{
  "designJson": [],
  "message": "Short summary"
}
```

## References

- [`references/design-playbook.md`](references/design-playbook.md) — content baseline, visual-cue mapping, image planning, composition, and the post-compile completion audit.
- [`references/component-recipes.md`](references/component-recipes.md) — fixed combinations for image modules, editorial section headers, event cards, service rows, step lists, instruction boards, stats/quotes, partner menus, FAQs, statements, and footers.
- [`references/visual-recipes.md`](references/visual-recipes.md) — concrete construction moves extracted from repository cases; adapt the relationships to the brief.
- [`references/component-contract.md`](references/component-contract.md) — supported IR fields and compiler constraints.
- [`references/verified-image-sources.md`](references/verified-image-sources.md) — commercial-use evidence and URL verification for network images.
- [`references/small-visual-assets.md`](references/small-visual-assets.md) — source, verify, and record an optional small raster graphic.

For source-faithful HTML conversion, follow the separate `html-to-design-json` workflow.
