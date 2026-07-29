# Design Style Library

Use this library to compose a page-specific visual language. Select a family from the brief, audience, imagery, and conversion goal; do not copy a complete template. For every run, generate three directions from meaningfully different families or combinations, then record the selected family and axes in `designProfile`.

## Style families

| Family | Best fit | Layout and surfaces | Type and color | Image and CTA behavior | Unico limits |
| --- | --- | --- | --- | --- | --- |
| Swiss / International Typographic | SaaS, services, cultural programs | Grid-led asymmetric stack, ruled dividers, flat fields | Grotesk hierarchy, black/white with one signal color | Sparse documentary image; clear full-width action | Keep the grid expressible with text, rectangles, and free-boxes |
| Editorial Magazine | Communities, publishing, events, hospitality | Uneven columns, oversized headlines, paper panels | Expressive display plus quiet sans; warm paper and ink | Full-bleed opener followed by alternating crops; editorial CTA | Keep every column inside 386px and prevent text overlap |
| Neo-Brutalist | Youth brands, workshops, independent products | Hard-edge blocks, thick borders, deliberate offset layers | Heavy sans, high-contrast primaries, minimal rounding | Cropped subject imagery; compact high-contrast button | Use rectangles and z-index instead of unsupported effects |
| Soft Minimal | Wellness, professional services, premium tools | Generous whitespace, few grouped surfaces, subtle rules | Calm sans or serif, low-saturation neutrals | One calm hero image; quiet anchored CTA | Do not let whitespace become an empty page |
| Art Deco / Luxury | Beauty, hospitality, premium services | Symmetry, framed panels, stepped separators | Refined serif with small sans labels; deep jewel tones | Portrait or detail crops; single high-intent CTA | Use borders and color fields instead of ornamental SVG |
| Retro / Nostalgic | Clubs, food, local events, heritage brands | Poster-like blocks, offset labels, chunky section cuts | Display type, muted vintage palette, controlled contrast | Characterful documentary images; direct action labels | Avoid unreadable decorative type at mobile sizes |
| Y2K / Digital Pop | Youth communities, entertainment, launches | Modular tiles, sharp overlaps, compact utility strips | Geometric sans, electric accents over neutral base | Small image sequence; punchy CTA with clear contrast | Avoid glow, excessive pills, and effects not supported by IR |
| Neo-Futurist | Technology, mobility, innovation programs | Directional geometry, dense utility panels, angled rhythm | Monospace or technical sans; dark base with signal accents | Wide atmospheric image or sparse technical image; action at transition | Simulate depth with rectangles and spacing, not CSS effects |
| Botanical / Organic | Food, beauty, sustainability, lifestyle | Organic rhythm through varied rectangles and generous gaps | Humanist sans or soft serif; muted greens, clay, cream | Natural close-ups and landscape crops; warm CTA | Do not use generated botanical SVGs or vague eco claims |
| Coastal / Mediterranean | Travel, dining, outdoor activities | Horizontal bands, sunlit color cuts, relaxed grouping | Friendly sans, sea and terracotta palette | Landscape-led rhythm; action after destination proof | Maintain readable contrast and avoid repetitive cards |
| Dark Cinematic | Film, nightlife, premium coaching, portfolios | Dark full-bleed sections, strong crop changes, sparse copy | High-contrast display, restrained light text | One focal image per section; bright decisive CTA | Validate crop focal points and text contrast |
| Monochrome Utility | Operations, sports, tools, portfolios | Dense but orderly modules, numbered sections, ruled lines | Utility sans, grayscale with one accent | Sparse functional imagery; action behaves like a control | Keep density readable and avoid tiny text |
| Playful Geometric | Education, family activities, community products | Color blocks, modular shapes, varied section sizes | Rounded but not pill-heavy; bright controlled palette | Repeated small subject crops; friendly action | Use rectangles and real raster imagery, not icon invention |
| Cultural Craft / Heritage | Cultural groups, makers, local businesses | Layered bands, framed content, story-led sequence | Humanist display, earthy palette and one vivid accent | Detail and people imagery with attribution; narrative CTA | Avoid stereotypes and unverified cultural claims |
| Gallery / Portfolio | Creators, studios, photographers, coaches | Image-led sequence, deliberate whitespace, caption rhythm | Editorial display and compact captions | Ratio follows source material; inquiry CTA near resolution | Never force all images into one ratio |
| Data-Inspired Modular | Booking, schedules, memberships, analytics-led services | Modular information blocks, labels, compact dividers | Neutral sans, measured accent colors | Supporting image only where it clarifies context; action near data | Do not invent statistics or business records |

## Direction recipe

For each candidate direction, specify `styleFamily`, `layout`, `palette`, `typography`, `imageRhythm`, `surfaceTreatment`, `ctaTreatment`, and `sectionTransition`. Reject a direction if it depends on unsupported effects, unlicensed imagery, invented claims, or a repeated centered-card pattern. At least four of these axes must differ across the three candidates.

## Combination guidance

Combine families only when the brief supports the combination, such as Editorial Magazine plus Cultural Craft / Heritage or Swiss plus Data-Inspired Modular. Keep one dominant family and one supporting influence. Do not combine more than two families in a mobile page, and do not let the supporting influence override readability or conversion clarity.
