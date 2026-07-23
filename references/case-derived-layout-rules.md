# Layout Rules Derived from Five Production Cases

This reference captures reusable patterns without copying editor residue from the source cases. Read it before generating a page. If it conflicts with the component contract, follow the component contract and compiler validation.

## Sample Overview

The five cases contain 37 free-form sections. Median section height is 517px, the interquartile range is approximately 317-844px, and median child count is 9. The table covers 352 children inside free-form sections. The cases also contain two top-level navbars and two legacy top-level ordinary components. Preserve complete legacy objects during extension, but do not reproduce that placement in new IR.

| Component | Count | Reusable conclusion |
| --- | ---: | --- |
| Text | 212 | The primary information layer for headings, body copy, labels, and supporting descriptions |
| Rectangle | 59 | Used for card surfaces, color blocks, overlays, and dividers rather than one repeated card style |
| Image | 52 | The secondary visual core; use real imagery and choose frames from source aspect ratios |
| Button | 17 | Reserved for explicit actions; may be full-width, paired, outlined, or compact |
| Rich text | 11 | Low frequency; use only for lists, inline emphasis, or genuinely mixed formatting |
| Video | 1 | Use only when video is central to the business and a valid URL exists |

Text, image, rectangle, and button components represent more than 96% of free-form children. Start with these primitives before considering specialized components.

Apply the current component policy in `component-contract.md`: use these four primitives frequently, use rich text moderately, limit each conditional business component to one instance, reject `img-text` and `circle`, and require an `explicitComponents` audit declaration for all explicit-only types.

## Cross-case Pattern Comparison

| Case | Free-form sections | Main composition | Patterns to learn | Case-specific details not to generalize |
| --- | ---: | --- | --- | --- |
| MKE Mahjong community | 6 | 67 text, 18 rectangles, 11 images, 5 buttons | Dual hero CTAs, event cards, numbered FAQ, two-column people cards, partner grid, final CTA | High density should not become the default for every homepage |
| OC Filipino Mahjong community | 8 | 41 text, 14 rectangles, 11 images, 8 buttons | Cultural hero texture, compact tag strip, brand story, event preview, three-step flow, social CTA | Ignore off-canvas rectangle residue |
| Bay Area makeup and photography studio | 7 | 22 text, 15 rectangles, 14 images, 11 rich-text, 1 button | Image-led layout, portrait work, two-column gallery, text overlays, minimal CTA use | Rich text reflects legacy content organization, not a recommended default |
| Universal service booking | 5 plus 2 legacy top-level components | 17 text, 7 images, 1 button | Process explanation, FAQ image rows, compact conversion section, replaceable structure | Preserve complete legacy objects, but do not recreate their placement in new IR |
| Snowboard coach | 11 | 65 text, 12 rectangles, 9 images, 2 buttons, 1 video | Full-screen portrait hero, information-card grid, statistics strip, skills, gallery, video, quote, timeline, contact section | Remove editor residue and placeholder content such as emoji, `Button`, and `Text Content` |

Section count and density depend on the business. Community pages emphasize events, FAQ, and people. Portfolios emphasize image ratios and galleries. Booking pages emphasize process and replaceable structure. Personal-service pages may use a longer narrative sequence. Never copy one case mechanically into another domain.

## Page and Section Structure

- Use 5-8 sections for a conventional homepage. Portfolio, timeline, or video-led pages may use 8-11.
- Hero sections usually range from 416px to 715px. Keep background imagery or color blocks on lower layers and place the brand, positioning statement, and CTA above them.
- Give each section one visual focus. A common sequence is hero, brand or service explanation, primary content, process or proof, CTA, and footer.
- Place headings 16-40px from the section top. Typical horizontal safe margins are 16-24px, with common content widths of 338-354px.
- Give each top-level business component its own one-child IR carrier section. The compiler removes the carrier and emits the business component directly beside `free-box` entries. Put headings or explanations in the preceding free-form section.
- Make every section tall enough for all non-overflow children and retain 24-48px below the final content.

## Text and Spacing

- Prefer multiple single-purpose `text` components instead of placing an entire page in `rich-text`.
- Omit `h` for ordinary text and let the compiler estimate height from content, font size, line height, and width. Supply explicit height only for a deliberate fixed frame, and never default every text component to `h: 40`.
- Keep at least 8px between same-column text boxes. Recommended visual gaps are 8-12px from eyebrow to heading, 12-20px from heading to body, 16-24px between body paragraphs, and 24-40px from body to CTA.
- Calculate the previous text bottom as `y + h` before positioning the next text. Do not infer spacing from two `y` values alone.
- Never intersect text boxes. Set `allowOverlap: true` only for deliberate editorial overlap. Use `allowTightSpacing: true` for exceptional compact layouts that do not intersect.
- Body copy normally uses 14-18px. Display headings normally use 32-64px. Larger type requires realistic line-height allowance.

## Image Ratios and Fitting

The sample frames include 16 portraits, 23 near-square images, 4 standard landscapes, and 9 ultra-wide images. Never force all imagery into one ratio.

| Source or purpose | Recommended frame | Recommended fit |
| --- | --- | --- |
| Portrait, coach, or full-body work | Width-to-height ratio around 0.55-0.85; frame height around 1.2-1.8 times width | `cover` with `objectPosition` protecting the face or action |
| Avatar, people card, or icon-like raster | 1:1 or around 0.85:1 | `cover` for photos; `contain` for raster logos or icons |
| Scene, event, or landscape work | 1.3:1 to 2:1 | `cover` for content imagery; `contain` when the full source must remain visible |
| Raster logo, decorative strip, or ultra-wide banner | Wider than 2:1 | Prefer `contain`; use `fill` only for purpose-built textures or color strips |
| Full-screen hero | Match the hero ratio and allow slight bleed | `cover` with an explicit focal point |

- Set `fit` explicitly for every image. When source dimensions are known, provide `sourceWidth` and `sourceHeight` so validation can compare source and frame ratios.
- Use `cover` for photos and fixed visual frames. Use `contain` for raster logos and assets that must remain complete. Use `fill` only for deliberate decorative assets because it can distort imagery.
- Images and rectangles may bleed slightly as hero backgrounds only with `allowOverflow: true`. Body text, buttons, and rich text must remain inside the 386px canvas by default.

## Rectangle and Button Variations

The cases use 18 thin dividers, 26 card or information surfaces, and 9 large backgrounds or overlays. Keep rectangles below content with a lower `zIndex`.

- Divider: 1-3px high for list and timeline rhythm.
- Card surface: encloses one complete information group; use square, lightly rounded, or substantially rounded corners according to the concept instead of repeating pills everywhere.
- Background or overlay: improves text contrast over imagery and may overlap images and text intentionally.
- Graphic emphasis: small color blocks, number backplates, or vertical timeline rails do not need to become cards.

Buttons commonly use heights of 40-56px. A primary CTA may span 338-346px. Two actions may sit side by side. Secondary actions may use outlines. Short labels may use compact buttons. A button already owns its text; never overlay a separate text component as its label. Horizontal and vertical button padding default to `0`.

## Case Artifacts to Reject

Production JSON contains a small amount of editor history and manual-layout residue. Never treat the following as design rules:

- Far-off-canvas coordinates such as `x: 1326`.
- Ordinary text widths beyond the canvas, such as `w: 700` or `w: 806`.
- Placeholder copy such as `Button` or `Text Content`.
- Emoji used instead of a production icon or real raster image.
- Undeclared negative coordinates or oversized elements used to fake bleed.
- Excessive rich text for ordinary paragraphs.

Every new IR file must pass compiler checks for bounds, unique IDs, media, text overlap, section height, card containment, and top-level business-component isolation.
