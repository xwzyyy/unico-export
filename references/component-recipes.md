# Component Recipe Library

Use this library when creating or redesigning a page. A recipe is a reusable component combination, not a whole-page template. Select **2–4 recipes** that match the brief, place them in the section storyboard, and adapt their copy, colors, and geometry. Keep the visual construction simple by default; use advanced treatments only when the brief asks for them. Every new page/full redesign must call R10 or another photo recipe at least once to create a real image module. If the user names a technique, call the matching recipe directly. Do not invent the combination again from scratch or use every recipe on every page.

These recipes distill the recurring construction language in `json-cases/mahjongsosyal/target.json` and `json-cases/HONOUR TILE SOCIETY/target.json`: rounded multi-text cards, outlined image frames, hard-offset shadows, patterned rectangle surfaces, capsule labels, overlapping type, and irregular image mosaics. Add underline and hollow-outline combinations when the brief asks for them. All examples use the IR shorthand from `component-contract.md`; replace IDs, theme colors, copy, and coordinates before compilation.

## R01 — Centered information card

**Build:** one rounded `rectangle` backplate + eyebrow `text` + heading `text` + body `text` + optional small badge. Keep every text component on top of the plate and inset from its edge.

```json
[
  { "type": "rectangle", "id": "card-main", "x": 22, "y": 24, "w": 342, "bgColor": "#FFF6D7", "borderColor": "#18151A", "borderWidth": 2, "radius": 16, "zIndex": 1 },
  { "type": "text", "id": "card-kicker", "text": "CHAPTER 01 · THE TABLE", "x": 40, "y": 42, "w": 300, "paddingInline": 0, "paddingBlock": 0, "fontSize": 10, "fontWeight": 700, "letterSpacing": 1.4, "color": "#6A1985", "zIndex": 2 },
  { "type": "text", "id": "card-title", "text": "A table for new stories", "x": 40, "y": 74, "w": 300, "paddingInline": 0, "paddingBlock": 0, "fontSize": 22, "fontWeight": 800, "lineHeight": 1.1, "color": "#18151A", "zIndex": 2 },
  { "type": "text", "id": "card-body", "text": "Add useful, confirmed details that explain what happens and who it is for.", "x": 40, "y": 115, "w": 300, "paddingInline": 0, "paddingBlock": 0, "fontSize": 14, "lineHeight": 1.4, "color": "#39333A", "zIndex": 2 }
]
```

Leave the card rectangle height omitted so the compiler can size it around the content. For a compact feature list, repeat the complete recipe with distinct content and a changed accent—not just another blank card.

## R02 — Photo with rounded print frame

**Build:** an offset color `rectangle` behind an `img`; optionally add a transparent outlined `rectangle` over the photo. The image and frame use matching radii. This turns a generic image into a deliberate editorial plate.

```json
[
  { "type": "rectangle", "id": "photo-plate", "x": 31, "y": 36, "w": 324, "h": 228, "bgColor": "#F41AD5", "radius": 20, "zIndex": 1, "autoFitContent": false },
  { "type": "rectangle", "id": "photo-frame", "x": 22, "y": 26, "w": 324, "h": 228, "bgColor": "#FFF6D7", "borderColor": "#18151A", "borderWidth": 2, "radius": 18, "zIndex": 2, "autoFitContent": false },
  { "type": "img", "id": "photo-main", "src": "https://example.com/verified-photo.jpg", "x": 26, "y": 30, "w": 316, "h": 220, "fit": "cover", "radius": 14, "zIndex": 3 }
]
```

Replace the example URL with an actual verified direct raster URL. Choose crop and focal point before choosing text placement. If the outline is visually too heavy, omit it; the offset plate still gives the image a frame.

## R03 — Hard offset shadow

**Build:** a backplate rectangle shifted a few pixels down/right + the foreground card rectangle + readable text. This geometric shadow is deterministic when CSS `box-shadow` support is uncertain.

```json
[
  { "type": "rectangle", "id": "card-shadow", "x": 27, "y": 31, "w": 338, "h": 132, "bgColor": "#F41AD5", "borderColor": "#18151A", "borderWidth": 2, "radius": 14, "zIndex": 1, "autoFitContent": false },
  { "type": "rectangle", "id": "card-face", "x": 21, "y": 25, "w": 338, "h": 132, "bgColor": "#FFF6D7", "borderColor": "#18151A", "borderWidth": 2, "radius": 14, "zIndex": 2, "autoFitContent": false },
  { "type": "text", "id": "card-face-title", "text": "THE NEXT TABLE", "x": 39, "y": 43, "w": 302, "paddingInline": 0, "paddingBlock": 0, "fontSize": 20, "fontWeight": 800, "color": "#18151A", "zIndex": 3 }
]
```

Use `autoFitContent: false` here because the faces have deliberate fixed geometry. For content-driven cards, prefer R01 and a preview-verified `box-shadow` declaration on the card rectangle, as seen in the target JSON.

## R04 — Underlined utility text

**Build:** a short text label using the structured text decoration field. Prefer it for a link-like label, emphasized word, or editorial annotation—not as body-copy styling.

```json
{
  "type": "text", "id": "underlined-label", "text": "VIEW THE FIELD NOTES", "x": 24, "y": 28, "w": 250, "paddingInline": 0, "paddingBlock": 0,
  "fontSize": 11, "fontWeight": 700, "letterSpacing": 1.2, "textDecoration": "underline", "color": "#18151A", "zIndex": 2
}
```

## R05 — Patterned section field

**Build:** one section-sized `rectangle` at the lowest layer + content components above it. A CSS pattern is compact and flexible; actual lines/dots made from small `rectangle` or `line` components are the fallback when the renderer does not show the CSS.

```json
[
  { "type": "rectangle", "id": "section-pattern", "x": 0, "y": 0, "w": 386, "h": 360, "bgColor": "#FFF6D7", "customCSS": "background-image: radial-gradient(rgba(7,59,40,.14) 1px, transparent 1px); background-size: 18px 18px;", "zIndex": 0, "autoFitContent": false },
  { "type": "text", "id": "pattern-section-title", "text": "PICK YOUR ENTRY POINT", "x": 20, "y": 34, "w": 346, "paddingInline": 0, "paddingBlock": 0, "fontSize": 24, "fontWeight": 800, "color": "#073B28", "zIndex": 2 }
]
```

Keep the pattern low contrast and away from dense reading areas. `customCSS` is passed through, not runtime-validated; confirm it in preview or use native geometry.

## R06 — Hollow frame with label

**Build:** transparent `rectangle` with a visible border + one or more text components placed inside or across an edge. Add `"transparent": "transparent"` to `designProfile.theme` so the compiler recognizes the clear fill. Use a square frame for technical/editorial panels or a large radius for a capsule.

```json
[
  { "type": "rectangle", "id": "outline-panel", "x": 24, "y": 48, "w": 338, "h": 112, "bgColor": "transparent", "borderColor": "#EBFF3C", "borderWidth": 2, "radius": 18, "zIndex": 1, "autoFitContent": false },
  { "type": "text", "id": "outline-panel-kicker", "text": "OPEN SEAT / 01", "x": 42, "y": 64, "w": 290, "paddingInline": 0, "paddingBlock": 0, "fontSize": 10, "fontWeight": 700, "letterSpacing": 1.4, "color": "#EBFF3C", "zIndex": 2 },
  { "type": "text", "id": "outline-panel-copy", "text": "Come curious. We will teach the rest.", "x": 42, "y": 96, "w": 290, "paddingInline": 0, "paddingBlock": 0, "fontSize": 17, "fontWeight": 700, "color": "#FFF6D7", "zIndex": 2 }
]
```

## R07 — Screen-print headline stack

**Build:** two or three short duplicate `text` components with small stepped offsets, different palette colors, and increasing z-index. Add `allowOverlap: true` only to the intentionally intersecting text layers. Keep a readable foreground copy.

```json
[
  { "type": "text", "id": "headline-ink-shadow", "text": "PLAY LOUD.", "x": 22, "y": 32, "w": 320, "paddingInline": 0, "paddingBlock": 0, "fontSize": 42, "fontWeight": 900, "lineHeight": 0.95, "color": "#F41AD5", "zIndex": 1, "allowOverlap": true },
  { "type": "text", "id": "headline-ink-mid", "text": "PLAY LOUD.", "x": 19, "y": 29, "w": 320, "paddingInline": 0, "paddingBlock": 0, "fontSize": 42, "fontWeight": 900, "lineHeight": 0.95, "color": "#EBFF3C", "zIndex": 2, "allowOverlap": true },
  { "type": "text", "id": "headline-face", "text": "PLAY LOUD.", "x": 16, "y": 26, "w": 320, "paddingInline": 0, "paddingBlock": 0, "fontSize": 42, "fontWeight": 900, "lineHeight": 0.95, "color": "#073B28", "zIndex": 3 }
]
```

This is for a few display words only. Do not duplicate paragraphs or apply the stack to every heading.

## R08 — Rotated signal tag

**Build:** compact bright rectangle + short text label. Rotate the plate with `line`/`img` structured controls when appropriate; for the text itself, use declaration-only `customCSS` only after preview confirms the renderer supports it.

```json
[
  { "type": "rectangle", "id": "signal-tag-plate", "x": 270, "y": 38, "w": 88, "h": 28, "bgColor": "#EBFF3C", "borderColor": "#18151A", "borderWidth": 2, "radius": 2, "zIndex": 3, "autoFitContent": false },
  { "type": "text", "id": "signal-tag-copy", "text": "LIVE TABLE", "x": 280, "y": 45, "w": 70, "paddingInline": 0, "paddingBlock": 0, "fontSize": 9, "fontWeight": 800, "letterSpacing": 1, "color": "#18151A", "zIndex": 4, "customCSS": "transform: rotate(-7deg); transform-origin: center;" }
]
```

If the rendered text does not rotate, leave the tag horizontal and rotate a nearby `line` or `img`; never treat an unpreviewed CSS value as implemented.

## R09 — Irregular photo mosaic (advanced, optional)

**Build:** two or three image frames of different proportions + offset solid-color plates + short captions. Use distinct, real image assets, deliberate `cover` crops, and a few aligned edges to keep the collage intentional.

```json
[
  { "type": "rectangle", "id": "mosaic-plate-a", "x": 24, "y": 28, "w": 210, "h": 156, "bgColor": "#1ED760", "zIndex": 1, "autoFitContent": false },
  { "type": "img", "id": "mosaic-photo-a", "src": "https://example.com/verified-wide-photo.jpg", "x": 18, "y": 20, "w": 210, "h": 156, "fit": "cover", "radius": 10, "zIndex": 2 },
  { "type": "rectangle", "id": "mosaic-plate-b", "x": 238, "y": 202, "w": 124, "h": 172, "bgColor": "#F41AD5", "zIndex": 1, "autoFitContent": false },
  { "type": "img", "id": "mosaic-photo-b", "src": "https://example.com/verified-portrait-photo.jpg", "x": 232, "y": 194, "w": 124, "h": 172, "fit": "cover", "radius": 10, "zIndex": 2 },
  { "type": "text", "id": "mosaic-caption", "text": "TABLE NOTES / 02", "x": 22, "y": 184, "w": 190, "paddingInline": 0, "paddingBlock": 0, "fontSize": 10, "fontWeight": 700, "letterSpacing": 1, "color": "#18151A", "zIndex": 3 }
]
```

Use only when a collage is explicitly requested or clearly central to the brief. Use only as many frames as distinct usable images are available. Never duplicate one temporary photo into several mosaic cells.

## R10 — Simple photo and caption

**Build:** one real `img`, one thin outlined `rectangle` behind it, and an optional short caption. Keep the frame close to the image bounds and use a single color; do not add extra shadow plates, tile drawings, stickers, or decorative clusters.

```json
[
  { "type": "rectangle", "id": "photo-frame-simple", "x": 20, "y": 24, "w": 346, "h": 214, "bgColor": "transparent", "borderColor": "#2D312B", "borderWidth": 1, "radius": 12, "zIndex": 1, "autoFitContent": false },
  { "type": "img", "id": "photo-simple", "src": "https://images.unsplash.com/photo-...?...", "x": 24, "y": 28, "w": 338, "h": 206, "fit": "cover", "radius": 9, "zIndex": 2 },
  { "type": "text", "id": "photo-caption-simple", "text": "A short contextual caption", "x": 24, "y": 248, "w": 338, "paddingInline": 0, "paddingBlock": 0, "fontSize": 11, "color": "#4A4D46", "zIndex": 2 }
]
```

Use the photo as the subject-specific visual. Source the image and record its license evidence using `verified-image-sources.md`; the sample URL is illustrative and must be replaced with a real provider CDN URL.

## Case-derived modular combinations

These are the repeatable section-level combinations seen across the two target cases. Call the IDs in the storyboard, then fill them with the current brief's real content. Unless a recipe says otherwise, keep its geometry flat and simple: one or two rectangles, clear text hierarchy, and no subject-matched miniature illustrations.

### R11 — Numbered editorial section header

**Build order:** small filled `rectangle` number tile → `text` Arabic index → `text` Chinese/Roman index (optional) → thin `line` or `rectangle` rule → large section-title `text` → small mono/utility subtitle `text`.

**Effect:** gives long pages a repeatable chapter system, like an editorial magazine. Reuse the same spacing and type roles; change only index, title, subtitle, and section surface. Keep alternate numeral systems synchronized.

### R12 — Full-width photo strap

**Build order:** full-width `img` with a deliberate crop → optional top/bottom `line` rules → small caption `rectangle` overlapping one edge → caption `text`.

**Effect:** introduces a place, event, or era in one image-led beat. Keep the overlay to one small label plate; do not add extra stickers or themed drawings. This is a simple image-first transition between text modules.

### R13 — Brand identity panel

**Build order:** flat section background → one centered or left-aligned `rectangle` panel → location/eyebrow `text` → brand wordmark/display `text` → short `line` accent → supporting statement `text` → two or three outlined `rectangle` tags with `text`.

**Effect:** makes the brand feel like a printed sign or editorial title card. Use one subtle grid only if requested by the art direction. The tags communicate verified traits; they are not miniature illustrations.

### R14 — Event information stack

**Build order:** section kicker/title/intro → optional announcement card (`rectangle` + badge/title/body) → featured event card (`rectangle` + status tag + event title + date + venue + price/availability when confirmed + RSVP `button`) → optional short “good to know” card with a few `text` bullets.

**Effect:** separates campaign context, the next actionable event, and participation notes while keeping them in one coherent section. Use two or three related surface colors, not a different visual system for every card. Only include event facts supplied by the user or source material.

### R15 — Three-row service list

**Build order:** section title/intro → repeat three times: wide `rectangle` card → one small flat color `rectangle` label block on the left → short label `text` inside it → service-title `text` and one-line explanation `text` on the right.

**Effect:** presents learning, recurring events, and hosting or other offers as a scannable set. Keep the left label abstract and typographic; do not draw a tile, icon, or object from many primitives. Vary label color within the same palette.

Choose R28 when every information card needs a pictorial icon; keep R15 as the text-led, abstract-label treatment.

### R16 — Numbered participation steps

**Build order:** section header → repeat three to five times: outlined horizontal `rectangle` card → solid narrow number `rectangle` → number `text` → step-title `text` → one concise explanation `text` → optional single photo module after the steps.

**Effect:** makes an unfamiliar process feel easy to follow. Maintain one shared row template and increase vertical spacing only when copy needs it. Do not decorate each step with a separate illustration.

### R17 — Framed instruction board

**Build order:** section header → one large solid `rectangle` board with a simple border → small board-title `text` → repeat numbered rows, each using an index `text` and a `rich-text` sentence with a short emphasized lead-in plus plain explanation.

**Effect:** turns rules or practical notes into a single cohesive noticeboard. Limit surface detail to one border and at most one low-contrast texture; the copy and numbering carry the hierarchy.

### R18 — Stats and member quotes

**Build order:** section header → three equal small `rectangle` statistic cards, each with one large number `text` and a compact label → one or two larger quote `rectangle` cards, each with quote `text` and attribution `text` → optional closing statement on a contrasting flat panel.

**Effect:** moves from community scale to individual experience. Use only confirmed numbers and real approved testimonials; omit a statistic or quote when it is not provided. Do not replace missing evidence with invented metrics.

### R19 — Partner profile and menu/list

**Build order:** section header → one photo module → one simple profile `rectangle` containing name, role, short bio and optional supplied social handle → separate list `rectangle` with a title strip and two to four text-only rows.

**Effect:** connects a partner/person with a concrete offering. Use photo plus typography; do not construct food, people, or props from shapes. Include menu items and contact details only when confirmed.

### R20 — Two-photo comparison

**Build order:** section header → two same-size `img` modules side by side, each with one simple `rectangle` frame and one short caption `text`.

**Effect:** contrasts two useful aspects such as venue and people, or atmosphere and detail. Use two distinct real images, align their frames, and keep captions consistent. If there is only one suitable image, use R10 instead of duplicating it.

### R21 — FAQ stack

**Build order:** section header → repeat four to six times: flat outlined `rectangle` card → question `text` → answer `text` → small index `text` aligned in one consistent column.

**Effect:** answers practical objections in a predictable scan pattern. Keep question weight/size above answer weight/size. Do not use card ornaments beyond the outline and index.

### R21b — Numbered Q&A list

This is a second R21 layout variant. Keep R21's outlined-card treatment available; select R21b when the brief calls for a continuous numbered list without separate row cards. The approved Unico export source is [`R21b-numbered-faq-list.source.json`](recipe-examples/R21b-numbered-faq-list.source.json).

**Build order:** section kicker → large list title → short introduction → repeat each entry as a numbered badge in the left column + question/title in the right column + answer directly below that title. The reference has six entries; add or remove entries to fit the confirmed content, retain sequential numbering, and keep each entry's three-part structure.

**Must preserve:** the numbered badge, question/title, and answer in every repeated entry; the number-left/content-right relationship; the order of title before answer.

**Prefer to preserve:** the single-column list, shared left and right alignment, relative column widths, consistent row rhythm, and the section's kicker/title/introduction hierarchy. Adjust vertical positions and container height only as needed for different copy lengths, item counts, or to prevent clipping and overlap.

**Free to adjust:** palette colors, all user-relevant copy, and typography properties such as font family, size, weight, style, letter spacing, and line height. Preserve readable contrast and a clear distinction between question/title and answer. Renumber entries after changing their count; the displayed numbers are sequential labels, not freeform copy.

**IR pattern:** repeat the following three-component row for each list item. Keep the text roles and relative placement; replace the sample copy, colors, and typography for the brief.

```json
[
  { "type": "text", "id": "faq-item-01-number", "text": "1", "x": 16, "y": 213, "w": 40, "fontSize": 16, "fontWeight": 400, "color": "#ffffff", "bgColor": "#14522b", "justify": "center", "zIndex": 2 },
  { "type": "text", "id": "faq-item-01-question", "text": "HOW MANY PLAYERS?", "x": 69, "y": 213, "w": 301, "fontSize": 14, "fontWeight": 700, "color": "#14522b", "zIndex": 2 },
  { "type": "text", "id": "faq-item-01-answer", "text": "Four players sit around the table.", "x": 69, "y": 237, "w": 301, "fontSize": 14, "fontWeight": 400, "color": "#444444", "lineHeight": 1.6, "zIndex": 2 }
]
```

### R21c — Numbered FAQ cards on a patterned background

This is a third R21 FAQ layout. Keep R21's simple outlined-card stack and R21b's continuous numbered list available; choose R21c when the brief needs a textured, editorial FAQ panel with separate cards. The approved Unico export source is [`R21c-patterned-faq-cards.source.json`](recipe-examples/R21c-patterned-faq-cards.source.json).

**Build order:** subtle section-wide grid/scan-line background → header plate with section index, title, and kicker → repeat a numbered card, with the question on its first row and the answer beneath it. Each card has its own low-contrast patterned fill. The source uses five cards.

**Must preserve:** a background behind the list; one distinct card per FAQ; a sequential number, question, and answer in every card; the number remains associated with its question and answer; question above answer. Keep the answer readable against the card fill.

**Prefer to preserve:** the textured section surface plus inset header/card surfaces, left-aligned number column, shared question/answer alignment, and evenly spaced card rhythm. The source uses 342px-wide, 126px-high cards at x=22, with top positions 204, 340, 476, 613, and 749. A header plate anchors the title above the cards. Adjust card height and spacing when copy or row count changes, and check for clipping and overlap.

**Free to adjust:** FAQ copy, heading and kicker, palette, texture colors, and typography. The number of cards may change to fit the confirmed FAQs; keep numbers sequential and preserve the number/question/answer structure for every row. Use a quiet background texture so it supports the hierarchy rather than competing with the text.

**IR pattern:** use a low-contrast section `customCSS` background, then a header plate and separate patterned `rectangle` for every row; place the number, question, and answer above its card in z-order. Use regular `text` fields for short questions and answers, or `rich-text` only when an item needs selective emphasis.

### R22 — Brand statement poster

**Build order:** one strong flat-color section → one or two short display statements; optionally duplicate each statement once with a small color/position offset → one supporting paragraph → at most one large simple geometric `rectangle` accent.

**Effect:** creates one deliberate expressive pause in a long page. This is an advanced treatment: use only when poster-like energy is requested, and do not apply the stacked type to body copy or every heading.

### R23 — Simple closing footer

**Build order:** contrasting flat `free-box` background → brand name `text` → short descriptive `text` → one primary and one optional secondary `button` → thin divider `line` → compact legal/credit/year `text`.

**Effect:** closes the story and leaves the visitor with a clear next action. Keep the button count low and use only confirmed links and dates.

### R23b — Photo-led closing module with two calls to action

This is a second R23 ending variant. Preserve R23 as the compact text-led footer. The approved Unico export source for R23b is [`R23b-closing-module.source.json`](recipe-examples/R23b-closing-module.source.json).

**Build order, top to bottom:** large rounded photo → optional wide decorative image strip → centered display headline → centered supporting copy → filled primary contact/action button → outlined secondary action button → compact copyright line. The sample uses a deep-green 386px-wide field and a 743px-tall module.

**Must preserve:** the approved layout's component order, positions, widths, heights, and visual spacing. Do not move or resize the remaining elements when removing the optional strip; keep the resulting space as part of the layout. Keep the main photo at the top, the headline and description centered, the two calls to action stacked, and the copyright line at the bottom.

**Prefer to preserve:** both buttons' full-width treatment, 16px radius, centered labels, and primary-filled / secondary-outlined distinction. The reference uses 56px and 52px button heights, respectively. Adapt their colors with the palette while retaining this style relationship and readable contrast. Replace button labels and links only with brief-relevant copy and confirmed destinations.

**Free to adjust:** the module palette may adapt to the page theme. Replace the main photo with a verified, topic-relevant image while preserving its frame. The lower wide decorative SVG image may be omitted; the current compiler rejects SVG, so use it only as a visual reference unless an independently verified raster version is available. Adapt headline, supporting copy, and copyright text to confirmed page content without changing their roles or layout boxes. If text cannot fit, shorten it or report the conflict; do not silently move the layout.

### R24 — Horizontally scrolling poster rail

Use this recipe for a swipeable showcase of posters, storefronts, products, or other image-led cards. The approved Unico export source is [`R24-poster-rail.source.json`](recipe-examples/R24-poster-rail.source.json).

**Build order:** one `free-box` section with `enableHorizontalScroll: true` → a repeated poster-card assembly, consisting of one image, its card/backplate when the visual needs it, and an optional compact label plate + text. Stagger or vary the cards only when the reference clearly does so; keep every caption associated with its own card. Use distinct verified image URLs and prevent neighboring card labels or images from becoming ambiguous.

**Must preserve:** horizontal scrolling and the image-card visual relationship. Horizontal scrolling is represented by the section-level `enableHorizontalScroll` IR boolean; children may extend past the 386px viewport to the right, while their vertical positions remain bounded by the section height.

**Prefer to preserve:** the reference card geometry, image-to-card alignment, relative image proportions, consistent card intervals, and label placement. Retain one clear image per card. The archived source contains an overlapping duplicate image and a local `file://` image path; do not treat either as a required pattern or reuse local sources. Build the repeated rail from the coherent card/image/label assembly instead.

**Free to adjust:** image choices, tag/label copy, palette colors, and the number of cards. Use only verified, brief-relevant images and concise labels. Each card must remain readable and visually attributable to its image; adapt the repeated geometry only when content or a different viewport requires it.

**IR pattern:** set `enableHorizontalScroll: true` on the section, then position each card's image and label within the shared rail coordinate system. Keep x positions nonnegative and use the rail's full content width even though the visible container remains 386px wide.

### R25 — Classic merchant activity photo grid

Use this recipe for a merchant's event and activity photos in a familiar, editorial gallery. The approved Unico export source is [`R25-classic-activity-photo-grid.source.json`](recipe-examples/R25-classic-activity-photo-grid.source.json), extracted from `ai-learning-cases/BOBA RUN CLUB.json` (`sbr-dance`).

**Build order:** full-width section background and grid texture → kicker and title → short side note → thin divider → two framed photos side by side → one wider framed photo below → short captions aligned to each photo. The source composition has three images total.

**Must preserve:** the classic two-small-above / one-wide-below arrangement, all component positions, and the exact width and height of every image and its backing frame. Keep each image paired with its own frame and preserve the source insets; do not resize, crop-frame, reposition, or stretch these boxes to fit replacement photos. Source geometry:

| Pair | Backing rectangle (x, y, w, h) | Image (x, y, w, h) |
| --- | --- | --- |
| Upper left | (21, 161.25, 173, 155) | (23, 164, 169, 151) |
| Upper right | (200, 163.25, 173, 153) | (202, 164.25, 170, 151) |
| Lower wide | (22, 322.25, 350, 233.52) | (24, 324.25, 346, 229.52) |

**Prefer to preserve:** the title/kicker/caption roles, restrained grid texture, and the clear hierarchy from heading to photo captions. Keep the visual gaps between the top pair and lower image. The source free-box height is `587.766`, while its full-width background rectangle is `713.766` high; preserve both source values and mark the background rectangle `allowOverflow: true` in IR so the compiler can retain this intentional extension without changing the container height.

**Free to adjust:** replace all three photo assets with verified, topic-relevant merchant activity photos; adapt the palette and text to the current brief. The archived URLs are example-page assets, not permission to reuse them: verify each replacement and record its individual source and license under `verified-image-sources.md`. If replacement photos do not fit the fixed image boxes, choose other photos or adjust the crop within the image; never alter the image or frame dimensions. Shorten captions when needed instead of moving the locked layout.

**IR pattern:** reproduce the source coordinates and dimensions for the image/frame pairs. Keep the small upper images paired left-to-right and the wide image in the lower row; do not reinterpret this as an equal-tile grid.

### R26 — Shop hero portrait with overlay details

Use this recipe when a merchant needs one prominent portrait-format storefront, product, or campaign image. The approved Unico export source is [`R26-shop-hero-portrait.source.json`](recipe-examples/R26-shop-hero-portrait.source.json).

**Build order:** section kicker and title with a short side note → one large portrait image with a close-fitting backing rectangle → a lower information card overlapping the image → merchant/title text, compact supporting metadata, and one action button. Keep the image as the module's dominant visual.

**Must preserve:** one primary portrait image and a clear visual association between it and its backing rectangle. Do not turn the module into a multi-image gallery or let the information card obscure the main subject.

**Prefer to preserve:** the sample's image/frame geometry and small inset, the information card overlapping the image's lower area, and the hierarchy from heading to name/metadata/action. Reference geometry: image `(x: 20, y: 138.5, w: 345, h: 437)`; backing rectangle `(17, 139, 352, 444.5)`; lower information card `(16, 297, 345, 276)`. The info card sits above the image, with its content above the card. Adapt the crop and focal point to the replacement image while retaining the portrait frame when possible.

**Free to adjust:** replace the image with a verified, topic-relevant portrait photo; update the heading, merchant name, supporting details, button label and confirmed destination; adapt the palette and typography to the page. The archived source URL is a reference asset and does not establish reuse rights. Verify each replacement image and its license under `verified-image-sources.md`. If different copy needs more room, shorten or simplify it before moving or resizing the visual structure.

**IR pattern:** use a single portrait `img` with `fit: "cover"` and a close-fitting `rectangle` behind it; place the information card at a higher `zIndex` over the lower image area, then layer its text and action above the card.

### R27 — Background-backed rules list

Use this recipe for house rules, participation guidance, or other short policy lists that benefit from a distinct visual panel. The approved Unico export source is [`R27-background-rules-list.source.json`](recipe-examples/R27-background-rules-list.source.json).

**Build order:** textured section background → light header plate with kicker, title, and short context line → one inset rules panel with its own subtle texture → repeat a sequential number in a narrow left column and a rich-text rule in the right column. Each rule uses a short emphasized lead phrase followed by a plain-language explanation. The source contains five rows.

**Must preserve:** a visible background treatment behind the list; the number-to-rule association in every row; sequential numbering; the emphasized rule lead-in followed by its explanation. Keep the rule panel visually distinct from the section background so the text remains readable.

**Prefer to preserve:** the layered background and inset-panel treatment, header hierarchy, left number column, shared text alignment, and even row rhythm. The source uses a 386px-wide section, a header plate at `(22, 43, 342, 133)`, and a rules panel at `(22, 204, 342, 462)`. Adjust row spacing or panel height only as needed for different copy or row counts; do not allow text to overlap.

**Free to adjust:** the rule text, title, kicker, palette, texture colors, typography, and number of rows to fit the confirmed content. Maintain one number and one lead-in-plus-explanation rule per row. Keep sufficient contrast over both background layers.

**IR pattern:** place the section-wide texture at the bottom layer, then the header plate and rules panel, followed by headings and repeated row numbers/rich-text components. Preserve the source's hierarchy through `zIndex`; use a restrained texture that does not compete with rule copy.

### R28 — Icon-led information cards

Use this recipe for a vertical set of service, benefit, or offer cards where each item has a small illustrative icon. Choose it when the icon set is part of the section's visual identity; use R15 for a lighter text-led list with abstract label blocks. The approved Unico export source is [`R28-icon-led-information-cards.source.json`](recipe-examples/R28-icon-led-information-cards.source.json).

**Build order:** section heading and short introduction → repeat a vertical card with one icon above or beside a rich-text lead phrase and explanation. The source uses five cards, each with one `59 × 45` SVG icon and a separate `rectangle` card background; replace those SVGs with verified raster icon files before export because the current compiler rejects SVG.

**Must preserve:** a consistent icon visual family across every card—matching illustration style, stroke/fill treatment, detail density, and visual weight. Keep one icon paired with each card's information and avoid mixing line icons, filled clip art, emoji, and unrelated illustration styles in the same set.

**Prefer to preserve:** the source's repeated icon-to-copy relationship, icon size and placement, vertical card rhythm, and rich-text hierarchy between the highlighted lead phrase and its supporting explanation. Card heights may respond to copy length while keeping their widths and gaps visually coherent.

**Free to adjust:** icon subjects, card count, card copy, palette, and typography. When replacing or generating icons, source them as one coordinated family and keep their scale, palette, and rendering style consistent. Verify each final icon URL and record its individual source and license using `small-visual-assets.md`; the archived SVG URLs are references, not evidence of reuse rights.

**IR pattern:** build each card from a background `rectangle`, one standalone raster icon `img`, and one or two `rich-text` components for title/description. Use the same icon frame dimensions and visual style throughout the group. Raster URLs must follow the image and asset-manifest rules in `component-contract.md` and `small-visual-assets.md`; the current compiler rejects SVG URLs.

### R29 — Premium editorial information showcase

Use this recipe for a high-end brand or studio introduction that combines a cinematic hero image, deliberate text hierarchy, information cards, and paired actions. The approved Unico export source is [`R29-premium-editorial-showcase.source.json`](recipe-examples/R29-premium-editorial-showcase.source.json).

**Build order:** dark section field → nearly full-width hero photo → separate top and bottom gradient `rectangle` overlays that simulate a transparent fade → brand/eyebrow label and display headline → supporting paragraph → three dark information cards, each built from a `rectangle` plus a short title and supporting line → primary and secondary buttons placed side by side.

**Must preserve:** the gradient effect is simulated by gradient-filled rectangles layered over the photo; do not describe it as an image with alpha transparency. Keep the display headline clearly stronger than the paragraph, and compose each information card as a background rectangle with readable text above it. Preserve the differentiated two-button treatment: one filled primary action and one quieter transparent/outlined secondary action.

**Prefer to preserve:** the premium dark field, full-bleed image with gradient fades at the image edges, branded eyebrow and title placement, and the rhythm from narrative copy to stacked information cards and actions. The source hero photo is `(x: -1, y: -3, w: 388, h: 312)`; top fade `(-21, -61, 419, 176)`; lower fade `(-28, 240, 417, 77)`. Its three information cards are approximately `330 × 70px`, with a restrained left-edge rule and consistent vertical spacing. If reusing this bleed beyond the 386px canvas in IR, set `allowOverflow: true` on the intentional edge elements.

**Free to adjust:** replace the hero photo with a verified image suited to the brand; rewrite the brand, headline, supporting copy, card content, and button labels/destinations; adapt colors and typography while maintaining contrast and the primary/secondary action relationship. The archived photo URL is a pattern reference, not proof of reuse rights. This hero is one image role and does not replace the full-page image requirements.

**IR pattern:** keep the photo behind both gradient overlays and place text above the overlays where it intersects the hero. Build every information card from one `rectangle` and its own text components; preserve inset and left-rule relationship. Use one filled button followed by one transparent or outlined button. Check intentional overlaps, bleed, clipping, and text contrast in the compiled preview.

### R29b — Editorial text and action cards

Use this variant when a premium introduction needs to foreground a longer editorial description and a set of actionable information rows. Keep R29 available for its larger display headline, three compact information cards, and paired section-level actions; choose R29b when the natural text–rectangle–button combination is the central feature. The approved Unico export source is [`R29b-text-rectangle-button-showcase.source.json`](recipe-examples/R29b-text-rectangle-button-showcase.source.json).

**Build order:** dark section field → nearly full-width portrait hero image → top and lower gradient `rectangle` overlays → a concise headline and editorial rich-text introduction → a vertical stack of dark information-card `rectangle`s → for each card, a number, title, supporting line, and transparent outlined button aligned as one unit.

**Must preserve:** the repeated card relationship: one background rectangle groups its number, title, supporting explanation, and action button. Keep the button visually subordinate to the card title while clearly actionable; preserve the consistent number/title/body hierarchy and make each action read as belonging to its own card. Retain the separate image and gradient-rectangle layering when using the editorial hero treatment.

**Prefer to preserve:** the full-width portrait image with fades at its top and lower edge, editorial text placed between the headline and card stack, dark inset card surfaces, one consistent card rhythm, and a transparent outlined button aligned to the right of each card. The source uses a 386px-wide section with a 433 × 682px hero image at `(-25, -15)`, a lower fade at `(-5, 284, 392, 383)`, and four approximately `390 × 107px` cards at y positions 673, 785, 896, and 1008. Treat these measurements as a composition reference; adapt the overall section height and card spacing to the actual copy without overlap.

**Free to adjust:** hero image, title and body copy, card labels and actions, palette, typography, and card count to fit the brief. If changing the card count, keep each remaining card complete with its number, title, supporting line, and associated action; do not add empty rows. The archived image URL is a layout reference, not evidence of reuse rights.

**IR pattern:** represent the hero as an `img` behind two gradient-filled `rectangle` overlays. For every information row, place its background `rectangle` first, then number, title, supporting text, and its own transparent outlined `button` above it. Keep card grouping and text-to-action alignment consistent across the stack; check all bounds, intentional overlaps, and text/button readability in the compiled preview.

## Recipe selection rule

Create the page's component plan as `section → recipe IDs → content/assets`. Use 2–4 recipes for a broad page, including at least one photo recipe for every new page or full redesign. Repeat a recipe when it makes sense (for example, R11 for chapter headers, any R21 FAQ variant, or either R23 variant for endings); a repeated instance does not count as a new recipe. Keep most choices simple and use at most one advanced expressive recipe unless the brief explicitly asks for a more elaborate art direction. Skip any recipe that conflicts with the brief. Every explicit technique requested by the user must map to a recipe ID and component IDs in the plan. Before delivery, verify those component IDs and fields in the compiled JSON; a recipe name in planning text is not evidence.
