# Design Optimization and Controlled Variation

Run this stage before writing Unico IR for every new page or full redesign. For a small `extend` edit, apply it only to the new section while preserving the current page system.

## 1. Invoke Design Intelligence

Must use the installed UI/UX Pro Max skill. Read its current instructions and start with its required design-system search using a multi-dimensional query:

```text
<product type> <industry> <audience> <tone> <content density> mobile landing page
```

Use the actual bundled `search.py` path from the installed skill:

```bash
python "<resolved-ui-ux-pro-max>/scripts/search.py" "<query>" --design-system -p "<project name>"
python "<resolved-ui-ux-pro-max>/scripts/search.py" "visual hierarchy accessibility spacing differentiation" --domain ux -n 6
```

Do not assume that an example path in another skill exists. Resolve the installed package first. If the CLI or its data files are unavailable, do not claim that a search ran. Use the loaded UI/UX Pro Max guidance only as an explicitly recorded degraded mode; never replace the professional design review with an unrecorded generic design guess.

Project constraints override generic recommendations:

- Never generate, embed, or reference SVG imagery.
- Use only searched and verified HTTP(S) raster images whose source page explicitly permits commercial use; record each one in `assetManifest`.
- Use registered component icon fields only when a component owns them. Do not manufacture icon assets.
- Preserve the 386px mobile canvas, Unico component schema, and compiler validation rules.

## 2. Extract a Page-Specific Brief

Record these inputs before choosing a style:

- product and industry;
- primary audience and use context;
- one primary user action;
- content hierarchy and required business data;
- three to five tone words;
- real brand colors, assets, and constraints when supplied;
- page content density;
- existing canonical-page traits that must remain coherent.

Record the professional design review in `designProfile.designResearch`:

- `tool`: `ui-ux-pro-max`;
- `designSystemQuery`: the exact product/industry/audience query used for the design-system search;
- `uxQuery`: the exact UX/accessibility query used for the review;
- `styleReferences`: the selected style families or design-system references.

Do not substitute a generic SaaS style for missing information. Derive the visual language from the subject matter, audience, imagery, and conversion goal.

Create one page-level semantic color theme before composing sections. At minimum define `primary`, `secondary`, `accent`, `background`, `surface`, `text`, `muted`, `onPrimary`, `onSurface`, and `border`. Every explicit color in sections and components must be one of these tokens. If a new color is genuinely required, add it to the theme first and apply it consistently across the page.

## 3. Generate Three Internal Directions

Read `design-style-library.md` and use it as a palette of compositional strategies, not as a set of copyable templates. Each direction must specify `styleFamily`, `layout`, `palette`, `typography`, `imageRhythm`, `surfaceTreatment`, `ctaTreatment`, and `sectionTransition`.

Create three concise directions that differ on at least four axes:

| Axis | Example choices |
| --- | --- |
| Layout | asymmetric editorial, centered poster, split narrative, modular catalog, gallery-led |
| Palette | warm paper, coastal cool, dark cinematic, botanical muted, high-contrast monochrome |
| Typography | expressive display plus quiet sans, compact grotesk, refined serif, utilitarian sans |
| Image rhythm | full-bleed then portraits, alternating landscape and square, sparse hero only, gallery sequence |
| Rectangle treatment | flat color fields, thin ruled panels, mixed-radius cards, hard-edge blocks |
| CTA treatment | full-width anchor, compact paired actions, outlined secondary, final-section conversion block |
| Section transition | color cut, image bleed, divider rhythm, overlap, generous whitespace |

Reject directions that differ only by color. At least four design axes must differ across the three directions. Prefer distinct style families when the brief permits it, while preserving brand constraints, accessibility, content clarity, and the 386px canvas.

Reject any direction that:

- repeats one identical card treatment through the page;
- defaults to purple gradients, glass effects, floating cards, or pill shapes without a brief-based reason;
- uses decoration that cannot be represented safely by Unico components;
- depends on invented claims, statistics, testimonials, or business records;
- requires an unverified image or any SVG.

## 4. Select a Controlled Variation

Choose the strongest direction for the audience and content, then assign a `variationSeed`. The seed is a short stable phrase plus two digits, for example `coastal-ledger-17`. It is not used for uncontrolled randomness; it commits the run to a distinct combination of layout, palette, typography, and image rhythm.

For repeated generations from similar briefs:

- vary at least three design axes from the previous known result;
- preserve brand constraints and usability;
- avoid repeating the same hero composition and card system;
- rotate image ratios according to real source material;
- keep one dominant focal point per section;
- use one primary CTA per screen or major conversion stage.
- reuse the same semantic theme tokens across all sections; do not assign unrelated colors to individual sections or business components;
- when a previous page or `designProfile` is available, change at least three axes and avoid repeating the same hero, card treatment, and CTA placement;
- record `styleFamily` and `axes.surfaceTreatment` in `designProfile`; optionally retain the three candidates in `designProfile.directions` for auditability.

## 5. Record the Design Profile

Add this metadata to `unico-design-ir.json`:

```json
{
  "designProfile": {
    "source": "ui-ux-pro-max",
    "query": "community events young professionals warm editorial image-led mobile landing page",
    "direction": "Warm editorial community journal",
    "variationSeed": "community-journal-07",
    "styleFamily": "Editorial Magazine",
    "designResearch": {
      "tool": "ui-ux-pro-max",
      "designSystemQuery": "community events young professionals warm editorial image-led mobile landing page",
      "uxQuery": "visual hierarchy accessibility spacing consistency mobile ux",
      "styleReferences": ["Editorial Magazine", "Swiss / International Typographic"]
    },
    "theme": {
      "primary": "#c95f3d",
      "secondary": "#375a64",
      "accent": "#e6a23c",
      "background": "#f5efe6",
      "surface": "#fffaf2",
      "text": "#21141f",
      "muted": "#6f625d",
      "onPrimary": "#fffaf2",
      "onSurface": "#21141f",
      "border": "#d8c8b8"
    },
    "axes": {
      "layout": "asymmetric editorial stack",
      "palette": "warm paper, ink, and coral",
      "typography": "expressive display with restrained sans body",
      "imageRhythm": "one full-bleed hero followed by alternating portrait and landscape crops",
      "surfaceTreatment": "paper fields with thin ruled dividers"
    }
  }
}
```

Use `"source": "ui-ux-pro-max-fallback"` only when the skill guidance was loaded but its search tool could not run. The compiler validates a supplied profile and warns when a complete page has no profile.

## 6. Optimize the Chosen Direction

Before compilation:

- confirm immediate first-screen meaning and a visible primary action;
- check text contrast, readable hierarchy, and intentional spacing;
- keep touch actions at least 44px high where the component permits;
- keep body copy concise and normally 14-18px; reserve 12px for compact labels only;
- use 4px or 8px spacing rhythm without making every gap identical;
- reserve image dimensions and choose deliberate crop focal points;
- set an explicit `scale` for every generated image; use the source/frame aspect-ratio calculation for known dimensions and `1.20` for unknown dimensions;
- vary section composition while keeping the page coherent;
- prefer text, images, buttons, rectangles, and free boxes over specialized components;
- ensure the final section resolves the narrative or conversion path.

## 7. Final Differentiation Review

The page is ready for IR only when all answers are yes:

- Does the visual direction clearly relate to this specific product and audience?
- Do at least three variation axes distinguish it from a default centered-card landing page?
- Does each section have one focal point and a different but coherent composition?
- Are images real, relevant, direct, raster, license-verified for commercial use, and recorded in `assetManifest`?
- Is the component mix compliant with the usage policy?
- Can every visual choice be represented by valid Unico fields?
- Does the `designProfile` accurately describe the implemented direction?
