# unico-export

`unico-export` is the Open Design plugin for generating and updating pages for the Unico DND canvas.

All skill sources and generated IR content are English-only. Compiler validation rejects CJK strings.

## Workflow

1. Read `unico-page.json` from the active project when it exists.
2. Treat its `designJson` array as the current canvas.
3. Run UI/UX Pro Max design-system guidance and the controlled-variation stage in `references/design-optimization.md`.
4. Apply the user's request while preserving unrelated sections and component properties. Existing components are not round-tripped through IR.
5. Compile the updated design with `compiler/unico-ir-compiler.mjs`.
6. Review the final type-specific component completeness audit.
7. Write the complete result back to `unico-page.json`.
8. Also write `unico-export-result.json` for older integrations.

For normal edits, set `mode: "extend"` in `unico-design-ir.json` and include only new sections. The compiler reads the existing canonical page, keeps all current component objects unchanged, appends the new compiled sections, and writes the complete result back. Use `mode: "replace"` only for an explicitly requested full redesign.

The canonical file is a complete envelope, not a patch:

```json
{
  "designJson": [
    "...complete Unico component array..."
  ],
  "message": "summary of the update"
}
```

If `unico-page.json` does not exist, create it from the newly generated page. The compiler always writes `unico-export-result.json` so validation errors are inspectable, but writes or updates `unico-page.json` only after validation passes. A malformed existing canonical page is never silently replaced.

Validation covers JSON/envelope structure, stable unique IDs, 386px bounds, section height, text sizing and overlap, background layering, intentional image fitting and crop focus, non-empty media, fixed-component isolation, component-selection policy, and supported component types. A final independent audit checks every emitted component's required root, structure, style, config, link, fixed-property, and nested-tab fields. The result also reports composition metrics and non-blocking quality warnings.

Text components follow the fixed Unico contract and omit the `height` style control. When rich-text height is omitted, the compiler estimates it conservatively from content, padding, font size, and available width. Network images must use verified CDN direct URLs; image-provider detail pages are rejected. See [`references/verified-image-sources.md`](references/verified-image-sources.md) for verified fallback assets and validation rules.

Button horizontal and vertical padding both default to `0`. Rectangle cards without explicit height automatically include their foreground content; insufficient explicit heights fail validation. Every new image must come from web search and use a verified HTTP(S) raster-image direct URL. SVG, local files, data/blob URLs, and generated image sources are forbidden.

Event List, Service List, Product List, Blog, Coupon, Inquiry, Map, Store Information, and other business components each occupy one ordering carrier in IR. Compilation removes the carrier and emits the component directly beside other `free-box` entries.

## Component policy

- Use `text`, `img`, `button`, `rectangle`, and compiler-generated `free-box` containers frequently.
- Use `rich-text` moderately and only for mixed formatting.
- Use each of `banner`, `blog-list`, `service-list`, `event-list`, `event-calendar`, `store-information`, `inquiry-box`, `goods-list`, and `map` at most once and only when context warrants it.
- Never use deprecated `img-text` or `circle`.
- Use all other registered components only after an explicit user request, recorded in IR `explicitComponents`.

## References

- [`SKILL.md`](SKILL.md) — execution workflow and compiler contract
- [`references/component-contract.md`](references/component-contract.md) — supported component fields
- [`references/design-guidelines.md`](references/design-guidelines.md) — current visual design guidance
- [`references/design-optimization.md`](references/design-optimization.md) — UI/UX Pro Max integration and controlled variation

## Compatibility

`unico-export-result.json` remains available for older DND clients, but `unico-page.json` is authoritative whenever both files exist.

## Component coverage

The compiler supports every component currently registered by the DND AI import validator, including navigation, banner, search, store information, product, promotion, coupon, service, event, calendar, and blog components. Business components keep runtime data collections empty so the component can fetch current store data through its built-in API behavior.
