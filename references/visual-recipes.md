# Visual Recipes from Repository Cases

These are construction studies, not templates. Select the recipe that matches the brief, then rebuild its visual relationships and component techniques for the new content. Do not copy source facts, exact wording, coordinates, or an entire page.

## Heritage editorial: Honour Tile Society

**Use when:** a community, cultural group, or hospitality brief calls for warmth, memory, and a printed-editorial feel.

**Visual grammar:** warm paper fields; restrained brick, jade, and yellow accents; expressive serif display type; compact mono labels; hard-edge index markers and fine rules. A centered identity poster can lead into numbered chapters, but the chapters should change grammar—for example, an asymmetric story panel, a step list, a photo feature, and a compact FAQ. Carry the chapter index and short caption through selected sections, not every component.

**Transferable detail:** its title-and-rule chapter header uses a small square index, a thin horizontal line, a large heading, and a tracked kicker. The visual hook comes from this relationship and a varied chapter rhythm, not from repeating the same rounded card.

**Guardrails:** the source target contains extensive unverified membership claims, testimonials, partner/menu copy, chapter inconsistencies, and bilingual text. Do not copy its facts or text. The main skill's IR remains English-only. Its images and geometric motifs should be replaced with user-approved assets and relevant subject matter.

## Tropical Kitsch Futurism: Mahjong Sosyal

**Use when:** a social, entertainment, or youth-oriented brand asks for playful tropical kitsch, poster energy, or a retro-futurist pop treatment.

**Visual grammar:** combine tropical print-shop exuberance with a deliberate digital/retro-futurist signal. Deep green anchors lime, warm cream, magenta, and orange. Use an oversized display headline, fine technical labels, a hero photograph, a ticker or index rail, and a varied supporting photo composition. Give selected sections different surface treatments: flat dark fields, warm paper panels, high-voltage signal panels, and one restrained grid/scanline motif. Pair large poster type with small mono-style utility labels. Keep body copy calm so the expressive elements remain readable.

**Buildable moves:**

- Place a large photo in the hero or first supporting section, with a contrasting rectangle plate offset behind it; follow with two distinct image roles rather than repeating the same asset.
- Alternate section grammars: a vivid poster, a dark utility/event panel, a pale explanatory panel, an editorial image feature, then a high-contrast action panel. Let content determine which of these are useful.
- Use one short headline as a stepped print-register treatment: separate text layers, 2–6px offsets, theme colors, controlled z-order, and `allowOverlap` for intentional text overlap.
- Add a rotated short signal tag or index label using text `customCSS` only when the runtime preview confirms the transform. Use a rotated `line` or `img` as an additional directional cue; keep important reading text horizontal.
- Give one section a subtle grid, dot, stripe, or scanline surface using a supported rectangle background effect or a small set of actual rectangle/line components. A CSS pattern must be preview-verified. Avoid placing texture behind dense copy.
- Use geometric rectangles as frames, corner brackets, ticker rails, label plates, and off-axis color blocks; connect them to content or image edges instead of scattering arbitrary shapes.

The studied target JSON itself contains no rotated elements; rotation here is a supported extension of the art direction, not a claim about the reference. Its distinctive result came from a fuller sequence, strong palette roles, bold type, purposeful images, and section-to-section rhythm.

**Guardrails:** distinguish confirmed event details from visual invention. Do not duplicate the same temporary image across every collage cell. Verify sourced image rights and direct URLs. The bright palette is specific to this direction; do not combine it automatically with heritage-paper colors. Decorative effects must remain visible in compiled output, legible, and preview-checked.

## Digital future / cyber-social

**Use when:** the brief explicitly asks for future-facing, cyber, digital, or tech-forward energy, especially for a social/event page that should still feel warm and human.

**Visual grammar:** choose one deep base (ink, midnight blue, or forest), one near-black/alternate surface, one high-energy signal color, and one warm human counter-color. Combine a real subject photograph with thin grids, status labels, numbered indices, modular panels, and sharp geometric frames. Let typography carry both scale and function: a forceful display headline, readable body copy, and tiny but legible system labels. Avoid generic blue gradients as the only evidence of futurism.

**Buildable moves:** use a full-section rectangle for a dark field; add a low-contrast repeated grid/scanline treatment or construct a sparse grid from real `line`/`rectangle` components; place a bright narrow signal bar beside a utility label; tilt one short tag, image, or rule; let one image cross a color plate; alternate dense interface-like blocks with open image/copy space. These moves should be individually visible in component IDs and fields.

**Guardrails:** avoid texture under long text, excessive neon, unreadably small labels, fake interface controls that imply nonexistent functionality, and unsupported CSS effects. Use actual images so the page feels like a real community or event rather than a wireframe.

## Night poster and utility masthead: Boba Run Club

**Use when:** an event needs compact identity/context at the top and a strong poster-like first screen.

**Visual grammar:** place brand at one edge, useful location or utility at the other, then close the header with a rule. Let the hero image support large, staggered headline beats and one concise explanation. A poster rail or timeline can change the page rhythm after the hero.

**Transferable detail:** foreground title and low-contrast wordmark use distinct layers; poster frames can be different widths and intentionally clipped to signal a horizontal rail. Keep important content on-canvas and only allow declared image bleed.

## Offset type and image plate: North Brooklyn Chess

**Use when:** a brand can benefit from bold asymmetry, image-first storytelling, or a compact portfolio/gallery sequence.

**Visual grammar:** split a headline into lines with independent position or color; place the photograph against a larger, contrasting backplate; add a small caption plate at the image edge. Later sections can pair a tall photo with a narrow text field, then use a nonuniform gallery when enough distinct imagery exists.

**Transferable detail:** the headline and image plate establish the visual system before supporting copy. Vary image spans only when the source collection can support real crops; the original gallery size is not a quota.

## How to use a recipe

Select the recipe that best matches the stated direction and combine complementary moves where the brief calls for them. Preserve the new page's own content and visual identity; recompute geometry for the current screen. The compiler contract always takes precedence over a case artifact, and unsupported or unverified effects need a visible fallback.
