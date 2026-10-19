# unico-export

The primary Open Design skill for creating and editing mobile pages for Unico DND. It converts a natural-language brief into compact Unico Design IR, then uses the bundled compiler to produce the complete import-ready page JSON.

## Use this package for

- New mobile pages designed directly from a brief.
- Focused edits to an existing canonical Unico page.
- Full redesigns when the user explicitly requests them.

Use `html-to-design-json` for source-faithful HTML reproduction; that workflow treats rendered HTML as the visual source of truth.

## Workflow at a glance

1. Read the current canonical page when present.
2. For a new page or redesign, use `references/design-playbook.md` to establish content completeness and map each style cue; select reusable component combinations from `references/component-recipes.md` and plan suitable images.
3. Write IR using the supported fields in `references/component-contract.md`.
4. Compile with `compiler/unico-ir-compiler.mjs`; fix errors in IR and review warnings.
5. Deliver the complete `unico-page.json` envelope and `unico-export-result.json` compatibility artifact.

The compiler checks schema and layout invariants, and rejects missing or local image sources. It cannot judge whether the design fulfills the brief; audit the compiled JSON for content scale, imagery, and visible evidence of every style cue, then review a rendered preview when available and report when visual rendering remains unverified.

## Package contents

| Path | Purpose |
| --- | --- |
| `SKILL.md` | Task routing and generation workflow. |
| `references/design-playbook.md` | Main design method for turning natural-language requests into implemented visual decisions. |
| `references/component-recipes.md` | Ready-to-adapt combinations for image showcases, premium editorial modules, information cards, FAQs, events, and page endings. |
| `references/visual-recipes.md` | Optional patterns extracted from repository examples. |
| `references/component-contract.md` | IR component schema, compiler constraints, and field-level invariants. |
| `references/verified-image-sources.md` | Network image licensing and verification requirements. |
| `references/small-visual-assets.md` | Search, format verification, provenance, and license workflow for small graphics. |
| `references/recipe-examples/` | Archived source JSON for reusable component combinations, including R21b–R29b. |
| `compiler/unico-ir-compiler.mjs` | Deterministic IR-to-Unico JSON compiler. |
| `unico-page.json` | Example canonical page envelope. |

Generated page strings and IR copy are English-only. Compiled pages require real remote provider image URLs and matching license evidence; local paths, placeholders, and guessed URLs fail validation. When response headers cannot be inspected, approved provider CDN URLs may still compile with an explicit availability warning.

`unico-export-no-uiux` is a separate package with its own compiler and copied references. Keep the design playbook and visual recipes aligned when changing shared generation guidance; do not assume the compilers are interchangeable.
