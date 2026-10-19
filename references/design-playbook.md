# Design Playbook

Use for pages designed from a brief, not for faithful HTML conversion. The goal is a complete, art-directed page whose ideas can be found in its actual components and compiled JSON. Pair this playbook with `component-recipes.md`: compose from the fixed combinations there instead of translating every style cue into unrelated one-off components.

## 1. Read the brief and build the content model

Record the page goal, audience, primary action, requested content, confirmed facts/assets, and every explicit visual cue. Separate facts from design inference. Never invent event dates, prices, locations, testimonials, metrics, partners, guarantees, or contact details. Where facts are absent, write useful explanatory copy that stays within what is known.

For a normal brand, community, service, or event landing page, build a full page rather than stopping after a hero and a few cards. Aim for 6–9 sections when supported by the brief, covering distinct needs such as identity/offer, value or experience, services/programs, process or participation, imagery/story, practical details, FAQ/objections, and a clear next action. Typical complete pages should have about 50–60 meaningful text runs across headings, body, labels, captions, details, and actions. Decorative repeats do not count. Treat both numbers as a completeness floor for broad briefs, not permission to pad: omit unsupported sections, combine genuinely thin topics, and scale down for explicitly concise requests. Before IR, compare the outline with a minimal first-pass version and at least double its useful information when the source material supports it.

Content is not only paragraph copy. Include concrete, decision-useful details from the brief and source materials; vary short labels, headings, explanatory copy, steps, feature names, captions, and questions. Avoid duplicating the same claim to hit a count. Keep each section's content tied to a user question and the page's purpose.

## 2. Convert style words into visible proof

Write one sentence for the art direction: **“This page feels like ___ because ___; its visual signature is ___.”** Then make a cue map before composing:

| Brief cue | Choose a visible implementation | IR evidence to record |
| --- | --- | --- |
| Future / digital / cyber | Dark or saturated field, grid/scanline or technical panel texture, bright signal color, condensed utility labels, precise rules, status/index marks | Section `bgColor`; full-section `rectangle` with restrained `customCSS` pattern or repeated geometric rectangles/lines; `text` label roles; accent rectangles/lines; IDs and coordinates |
| Playful / editorial / poster | Oversized display type, split headline, controlled text-register layers, off-center blocks, ticker/caption plates | Multiple independently positioned `text` runs, intentional `allowOverlap`, `rectangle` backplates, varied section frames |
| Handmade / tactile / heritage | Paper-like surface, limited ink colors, serif/display contrast, stamps, chapter indices, imperfect but controlled alignment | Surface `rectangle`/section backgrounds, font roles, small geometric stamps and rules |
| Energetic / movement | Diagonal tag or image, slanted rule, alternating scale, directional crop, sharp color blocks | `line.rotate`, `img.rotate` or text `customCSS` transform (only if runtime preview supports it), staggered `x/y`, layered `rectangle` |
| Luxurious / calm | Spacious composition, restrained palette, one strong image, precise type scale, sparse rules | Measured spacing and typography, controlled image crop, few components with clear hierarchy |
| User names a technique (rotate, patterned background, geometric accents, etc.) | Implement that technique directly when the contract supports it; if unsupported, select the closest visible substitute and name the limitation | Identify the exact component IDs and fields; do not silently drop an explicit cue |

This map is a starting point, not a style taxonomy. Pick techniques because they express the brief. For every cue named by the user, add a row to a short internal implementation ledger: `cue → component ID(s) → field/effect → preview checked?`. Every explicit cue must have JSON evidence or a stated technical limitation and substitute. A matching palette alone does not satisfy a style direction.

## 2a. Keep the visual language simple by default

Use photographs for subject-specific storytelling and simple geometry for decoration. Favor flat rectangles, one outlined frame, short lines, underlines, clean color blocks, and occasional restrained rotation. Keep decoration secondary to the image, headline, and action. Do not hand-build literal thematic objects (such as individual Mahjong pieces or a miniature table scene) from many primitive shapes unless the user explicitly asks for an illustration. Treat patterned fields, layered headline stacks, and collages as optional expressive effects—not defaults. A broad brief still needs complete, varied content, but visual variety should come mainly from typography, spacing, image placement, and a few color/surface changes rather than more ornaments.

### A useful visual system

Decide how typography, color, layout, images, surfaces, and section transitions reinforce one another:

- **Typography:** assign display, body, and utility roles. Make their differences visible through family, weight, size, tracking, line height, case, and placement. Use split beats, rotated micro-labels, or offset duplicates selectively; do not turn all body copy into effects.
- **Color:** define background, surface, text, muted, and signal roles. Carry more than one accent when the requested style calls for it. Keep text contrast strong and match every explicit component color to `designProfile.theme`.
- **Composition:** vary alignment, scale, density, and image/text balance by section. Use asymmetric layouts, bleeds, rails, collages, or overlapping plates when the page story supports them. Do not arrange every section as the same rounded card.
- **Surface/motif:** choose one or two simple repeatable devices, such as a thin rule, flat rectangle plate, outline frame, underline, or compact index label. Reuse them with restraint; do not build bespoke miniature illustrations or scatter decorative objects to fill space.
- **Actions:** make the primary action easy to find and place it after enough context. Only add secondary actions when they serve a real task.

## 3. Find and plan images before layout

Inspect user-provided assets first. For every new page or full redesign, include at least one real photo/image module in the final JSON. Choose a useful role such as a hero/identity image, community moment, close-up/detail, or venue/atmosphere. Add more images only when they improve the story; one strong image is better than several repetitive ones. Never leave the required image module empty or quietly replace it with a colored card.

Search Unsplash, Pexels, then Pixabay directly using the steps in `verified-image-sources.md`. Open each selected asset page and record the creator and applicable license. Search result snippets are not license evidence. Use the provider CDN URL in the JSON; try a small GET/HEAD check when possible, but do not stop the page if network policy blocks response inspection. Mark that check accurately in `assetManifest`. For each image decide its job, aspect ratio, crop/focal point, frame, and relation to nearby text and backplates before placing it. Use `contain` for complete logos/artwork and intentional `cover` crops for photographs. Do not let every image become a same-size card.

Do not compile or deliver a final page while any `img.src` is empty or local. Do not fabricate a direct URL, author, license, status code, or MIME type. If the provider page confirms the asset/license and yields the provider CDN URL but response headers cannot be inspected, follow `verified-image-sources.md` and finish the export with an explicit warning. If a result has no usable CDN URL, search another result and then the next approved library; keep the one image module requirement. If every approved source is genuinely inaccessible, state the specific external blocker instead of fabricating an image URL. User-provided imagery can be used as supplied when its accessible/importable URL is available; do not claim a license status that was not provided or checked.

## 4. Storyboard the page

Before creating components, plan a sequence with different content purposes and visual rhythms. For each section record:

| Decision | Answer |
| --- | --- |
| Purpose | What does the visitor need to learn or do here? |
| Content | Which verified details and copy belong here? |
| Focal point | What one image, heading, or graphic leads? |
| Composition | Where do text, image, and decoration sit and overlap? |
| Transition | How does this section change from its neighbor? |
| Action | Is there a useful action here? |

The first screen must establish identity/offer and a clear next step. Keep the masthead purposeful and compact. Vary section backgrounds and composition to create pacing; avoid a long run of identical card stacks. Preserve mobile readability and leave enough space for the chosen type sizes and image crops.

## 5. Build the decisions in IR

Use supported types and fields from `component-contract.md`, calling the selected combinations in `component-recipes.md` directly. Use the case-derived IDs for common page modules: R11 for repeatable section headers, R14 for event details, R16 for participation steps, R17 for rules, R18 for stats/testimonials, R19 for partner/menu content, R20 for two photos, R21 for FAQs, and R23 for the footer. The JSON itself—not `designProfile` prose—must carry the visual direction.

- Use `rectangle` for large color panels, card/backplate fills, patterned surfaces, tags, frames, and geometric ornaments. A patterned panel can use a short declaration-only `customCSS` gradient/repeating gradient when the target renderer supports it. When uncertain, make the motif with real rectangles and lines; never assume a CSS value works without preview evidence. Set decorative backgrounds behind content, use `autoFitContent: false`, and use the section-wide styling pattern in the component contract.
- Use `line` for thin rules, dividers, brackets, and directional strokes. `line.rotate` is the structured rotation control. Use `img.rotate` for a deliberately tilted image layer, keeping the crop and neighboring text legible.
- `text` has no structured rotate field. For a short utility label or stamp, `customCSS` may carry `transform: rotate(...)` and `transform-origin` if the Unico renderer applies declarations to text. Treat it as unverified until the compiled page is previewed; if it fails, use a rotated line/image or a stepped, unrotated label as a visible substitute. Avoid rotating long copy, buttons, or essential reading text.
- For layered display type, create separate short `text` components with careful offsets, distinct theme colors, small z-index differences, and `allowOverlap: true` only for the intended text-on-text art effect. Never layer long paragraphs.
- Use geometry and pattern intentionally: choose a few purposeful shape types/sizes, place them as framing or directional signals, and keep them from colliding with copy or actions. Decoration should support the design, not fill empty areas indiscriminately.
- Use descriptive stable IDs. In `designProfile`, record the chosen direction honestly and concisely; do not write research claims or rejected directions that were not actually performed.

Recompute positions and section heights for the content. Do not copy case coordinates. Keep each color referenced by a component in the theme. Permit overflow only for a deliberate, reviewable bleed. Maintain the compiler's content, text spacing, image, and overlap rules.

## 6. Inspect the compiled result against the brief

Review the complete emitted JSON—not just the IR. Recount meaningful text runs and sections against the brief's scope; confirm no whole information category disappeared. Check the user-cue ledger and point to the actual component IDs/fields proving each cue. Confirm that the image layers exist, are distinct and purpose-built, and have license/URL status recorded. Verify that chosen visual devices survived compilation: patterned/varied backgrounds, type treatments, rotation where requested, and geometric framing.

Then check the first-screen hierarchy, action path, palette contrast, section rhythm, crop/focal points, z-order, text bounds, card bottoms, and accidental overlaps/clipping. Review warnings and correct IR rather than patching generated JSON. Inspect a rendered preview when available, especially any `customCSS`, rotated text, or image crop. If the renderer effect cannot be previewed, report it as unverified and include its fallback or pending status. A schema pass is not a design pass.

## Minimal direction record

The compiler requires legacy profile keys. Keep them factual and concise; this example records a visual decision but does not replace its component implementation.

```json
{
  "designProfile": {
    "source": "unico-export",
    "query": "Mahjong social club page",
    "direction": "Tropical print-shop energy with a social photo collage",
    "variationSeed": "sosyal-print-01",
    "axes": {
      "layout": "image-led poster followed by varied editorial sections",
      "palette": "deep green, lime, warm cream, and magenta signal",
      "typography": "heavy display sans with compact utility labels",
      "imageRhythm": "hero photograph followed by distinct supporting images"
    },
    "designResearch": {
      "tool": "unico-export-local-planning",
      "designSystemQuery": "Social Mahjong events for a playful community audience",
      "uxQuery": "Identify the club, explain participation, and keep the next action clear",
      "styleReferences": ["Tropical Kitsch Futurism"]
    },
    "theme": {
      "primary": "#073B28",
      "secondary": "#1ED760",
      "accent": "#EBFF3C",
      "background": "#073B28",
      "surface": "#FFF6D7",
      "text": "#18151A",
      "muted": "#587063",
      "onPrimary": "#FFF6D7",
      "onSurface": "#18151A",
      "border": "#F41AD5",
      "signal": "#F41AD5",
      "warmAccent": "#FF7A26"
    }
  }
}
```
