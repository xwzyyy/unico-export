# Unico Visual Component IR Contract

Read this file before writing `unico-design-ir.json`. Generated components are declared as section children. Free-positioned visual components use `x`, `y`, `w`, `h`, and optional `zIndex`. Top-level/business components must occupy a one-child IR section; the compiler removes that carrier and emits the component directly beside `free-box` entries.

## Contents

- Core types
- Component usage policy
- Deprecated types
- Extended visual types
  - video-player
  - countdown
  - tabs
  - accordion
  - map
  - rating
  - social-share
  - person-profile
  - inquiry-box
  - goods-list
  - coupon
  - navigation
  - brand-navbar
  - search
  - banner
  - store-information
  - discount-promotion
  - service-list
  - event-list
  - event-calendar
  - blog-list
- Constraints

## Core Types

The existing core types remain supported:

- `text`: `text`, typography, padding, color, and link fields; compiled output always uses `label: "Text"`, `Text Content`, and `Text Style`, and omits the `height` style field
- `img`: `src`, radius and link fields
- `button`: `text`, colors, radius, padding and link fields
- `rectangle`: background, border and link fields
- `rich-text`: `html`/`content`/`text`, `paddingInline`, `paddingBlock`, and typography fields; height is estimated automatically when `h` is omitted

## Component Usage Policy

| Tier | Components | Rule |
| --- | --- | --- |
| Frequent foundation | `text`, `img`, `button`, `rectangle`, compiler-generated `free-box` | Use these as the dominant page-building system |
| Moderate | `rich-text` | Use only for genuinely mixed formatting |
| Conditional single-use | `banner`, `blog-list`, `service-list`, `event-list`, `event-calendar`, `store-information`, `inquiry-box`, `goods-list`, `map` | Use only when context warrants the behavior; each type may appear at most once |
| Deprecated | `img-text`, `circle` | Never generate; compilation fails |
| Explicit-only | `video-player`, `countdown`, `tabs`, `accordion`, `rating`, `social-share`, `person-profile`, `coupon`, `navigation`, `brand-navbar`, `search`, `discount-promotion` | Use only when the user explicitly requests the capability and declare the canonical type in `explicitComponents` |

Do not add a component to `explicitComponents` merely to bypass validation. It is an audit record of a direct user request.

All free-positioned visual types may optionally provide `customCSS` as a declaration-only string. Use it only for CSS effects that the runtime accepts and that cannot be represented by structured fields; never put selectors, HTML, scripts, or external rules in this field. Image crop and transform data must be represented in the structured image fields below; do not emulate image scaling or rotation through `customCSS`.

### Text component output invariants

The `text` output does not use the generic component structure. The compiler must always emit `label: "Text"`, `field.structure.label: "Text Content"`, and `field.styles.label: "Text Style"`. When no link is supplied, `link.value.type` must be `external`. Style fields and their order are fixed as follows:

```text
width, paddingInline, paddingBlock, fontSize, fontFamily, color,
fontWeight, letterSpacing, lineHeight, fontStyle, textDecoration,
justify, zIndex, top, left
```

Defaults are `paddingInline: 20`, `paddingBlock: 10`, `letterSpacing: 0`, `fontStyle: "normal"`, and `textDecoration: "none"`. Do not emit `height`. The `fontWeight` label must be `Font Weight`, and the `justify` label must be `Layout`.

### Button component output invariants

Button `paddingInline` (Horizontal Padding) and `paddingBlock` (Vertical Padding) must both default to `0`. Use non-zero values only when the user explicitly requests them. Never use padding to correct button coordinates or dimensions.

### Rectangle card height

A `rectangle` containing text, buttons, or other foreground components should omit `h`. The compiler finds higher-`zIndex` content inside the rectangle, expands the card through the content bottom, and adds the default `16px` `contentPaddingBottom`. The next overlapping rectangle ends the current card's automatic content range.

Explicit `h` is never silently overridden. If a foreground component starts inside the card but ends below it, compilation fails. Use `autoFitContent: false` only for purely decorative rectangles.

### Common positioning and safety fields

```json
{
  "x": 20,
  "y": 40,
  "w": 346,
  "h": 80,
  "zIndex": 5,
  "allowOverflow": false,
  "allowOverlap": false,
  "allowTightSpacing": false
}
```

- Omit `h` for normal `text`. The compiler uses a conservative wrapped-height estimate for validation, but the generated text style intentionally contains no `height` control so the runtime can size it naturally.
- Omit `h` for `rich-text` by default. Estimated height is `ceil(lines * fontSize * effectiveLineHeight + 2 * paddingBlock + safetyAllowance) + 1px + 20px`. The final `20px` is a mandatory clipping safety buffer. Line count uses `w - 2 * paddingInline` and weighted glyph widths. Effective line height is at least `1.5`. Narrow columns add punctuation-wrap and clipping safety; the final `1px` covers browser rasterization error.
- Set `allowOverflow: true` only for an intentional image/rectangle bleed outside the section or 386px canvas.
- Set `allowOverlap: true` only for intentional text-on-text art direction. Image/rectangle backgrounds may overlap text without this flag.
- Set `allowTightSpacing: true` only when same-column text needs less than the default 8px gap without intersecting.

### Image fields

```json
{
  "type": "img",
  "src": "https://images.unsplash.com/photo-1767169768227-79688439fb37?auto=format&fit=crop&w=1200&q=80",
  "x": 20,
  "y": 80,
  "w": 346,
  "h": 240,
  "fit": "cover",
  "scale": 1.34,
  "rotate": 30,
  "cropArea": { "x": 30, "y": 0, "width": 100, "height": 100 },
  "translateX": 0,
  "translateY": 0,
  "sourceWidth": 1600,
  "sourceHeight": 1200,
  "radius": 12
}
```

- `fit` is required and accepts `cover`, `contain`, or `fill`; prefer `cover` for photos and `contain` for logos/icons.
- `scale` is an optional image zoom multiplier. For `cover`, when source dimensions are known, use at least `ceil(max(sourceRatio/frameRatio, frameRatio/sourceRatio) * 100) / 100`; for example, a 4:3 source in a 1:1 frame requires at least `1.34`. When dimensions are unknown, the compiler defaults to `1.20`. `contain` and `fill` default to `1.00` to avoid unexpectedly cropping or distorting complete assets.
- The compiled `upload.value` must contain `url`, `crop.mode`, `crop.fitMode`, `crop.cropArea`, `crop.transform.scale`, `crop.transform.rotate`, `crop.originalWidth`, and `crop.originalHeight`. The compiled image style must contain `scale`, `rotate`, `translateX`, `translateY`, `radius`, `customCSS`, `top`, and `left` controls in addition to width, height, and z-index.
- The image style `scale` control is a percentage slider and defaults to `100`; the crop transform `scale` carries the aspect-ratio zoom multiplier. `rotate` in `crop.transform` carries image rotation, while style `rotate` remains the independent editor slider.
- `cropArea` uses the editor's crop-area coordinates. Provide it when a strongly mismatched `cover` frame needs a deliberate focal point.
- `sourceWidth` and `sourceHeight` are optional validation hints. Provide both when the original dimensions are known.
- When a `cover` frame differs from the supplied source ratio by more than 1.5×, explicitly set `cropArea` to protect the focal point. `fill` is rejected when supplied dimensions prove that it would distort the source.
- `src` must be a verified HTTP(S) raster-image direct URL with a matching `assetManifest` entry that proves commercial-use permission. Local paths, empty sources, data/blob URLs, placeholders, generated sources, and known provider detail-page URLs are compilation errors.
- Forbid every SVG source, including `.svg`/`.svgz` paths, query parameters that request SVG, `data:image/svg+xml`, and inline `<svg>`. Never generate SVG imagery.
- Search online for every image, verify its source-page license permits commercial use, then verify `HTTP 200` and `Content-Type: image/*` before export. Add one matching entry to the IR `assetManifest` for every image source. See `verified-image-sources.md` for the required evidence fields and validation rules.

## Deprecated Types

`img-text` and `circle` remain recognizable only so the compiler can return a precise deprecation error. They are not valid generation targets, even when requested. Replace `img-text` with separate `img` and `text` components. Use a `rectangle` with its documented radius field when a rounded geometric surface is needed.

## Extended Visual Types

### video-player

```json
{
  "type": "video-player",
  "url": "https://example.com/video.mp4",
  "bgColor": "#000000"
}
```

### countdown

```json
{
  "type": "countdown",
  "title": "Registration closes in",
  "targetDate": "2026-08-01",
  "bgColor": "#111827",
  "color": "#ffffff"
}
```

### tabs

Use one to five tabs. Each tab may contain the same supported visual child types.

```json
{
  "type": "tabs",
  "activeColor": "#2563eb",
  "tabs": [
    {
      "title": "Overview",
      "height": 240,
      "bgColor": "#ffffff",
      "children": []
    }
  ]
}
```

### accordion

```json
{
  "type": "accordion",
  "items": [
    { "title": "What is included?", "content": "A concise answer." }
  ],
  "bgColor": "#ffffff",
  "borderColor": "#e5e7eb",
  "activeColor": "#2563eb"
}
```

### map

```json
{
  "type": "map",
  "address": "Venue address",
  "embedUrl": "https://www.google.com/maps/embed?...",
  "linkUrl": "https://maps.google.com/..."
}
```

Only use a real embeddable map URL. If none is available, prefer a text address and button instead.
`map` must be the only child of its IR section and compiles as a top-level page block.

### rating

```json
{
  "type": "rating",
  "rating": "4.8",
  "reviewCount": "128",
  "color": "#f59e0b"
}
```

Do not invent ratings or review totals. Use this component only when the user or current project provides those values.

### social-share

```json
{
  "type": "social-share",
  "title": "Share this page",
  "showFacebook": true,
  "facebookUrl": "",
  "showTwitter": true,
  "twitterUrl": "",
  "showLinkedin": true,
  "linkedinUrl": "",
  "showWhatsapp": true,
  "whatsappUrl": "",
  "showEmail": true,
  "emailUrl": "",
  "buttonStyle": "rounded"
}
```

### person-profile

```json
{
  "type": "person-profile",
  "avatar": "https://images.unsplash.com/photo-1752650143267-57c2491f5ba2?auto=format&fit=crop&w=1200&q=80",
  "name": "Person name",
  "title": "Role",
  "bio": "Short biography",
  "email": "",
  "phone": "",
  "linkedin": "",
  "twitter": "",
  "website": "",
  "avatarSize": 120
}
```

Do not invent contact details. Omit or leave unknown values empty.

### inquiry-box

```json
{
  "type": "inquiry-box",
  "title": "Contact us",
  "nameLabel": "Name",
  "contactLabel": "Phone or email",
  "inquiryTitleLabel": "Subject",
  "contentLabel": "Message",
  "pictureLabel": "Picture (optional)",
  "submitButtonText": "Submit",
  "successMessage": "Your inquiry has been submitted.",
  "primaryColor": "#2563eb",
  "buttonColor": "#2563eb",
  "buttonTextColor": "#ffffff"
}
```

`inquiry-box` must be the only child of its IR section and compiles as a top-level page block.
`inquiry-box` must not emit a width style control. Its runtime component naturally occupies the available container width.

## Top-level Business Components

Every top-level component must be the only non-navbar child of its IR section. The section is an ordering carrier only: it is removed during compilation and the component is emitted directly beside surrounding `free-box` objects. Do not arrange siblings around it. When a heading or explanation is needed, place that content in the preceding free-form section.

This applies to `goods-list`, `coupon`, `navigation`, `search`, `banner`, `store-information`, `discount-promotion`, `service-list`, `event-list`, `event-calendar`, `blog-list`, `map`, and `inquiry-box`. Input aliases are accepted as `product-list` → `goods-list`, `blog` → `blog-list`, `inquiry` → `inquiry-box`, and `storeinfo`/`store-info` → `store-information`.

Placement does not override selection policy. Conditional single-use types still require contextual justification and are limited to one instance. Explicit-only types still require a matching `explicitComponents` declaration.

Example compiled event block:

```json
{
  "label": "Event List",
  "type": "event-list",
  "component": {
    "name": "event-list",
    "props": {
      "data": {
        "events": [],
        "styleMode": 0
      }
    }
  },
  "id": "3f9bd730-0570-4669-9871-e3ee35a86929"
}
```

### goods-list and discount-promotion

Accepted presentation fields: `gap`, `num`, `mode`, `source`, `isShadow`, `attribute`, `isVoucher`, `allProducts`, `color`, `bgColor`, `marginTop`, and `marginBottom`.

- Keep runtime `list` empty; the compiler does this automatically.
- Default to automatic/all-products mode. Do not invent products.

### coupon

Accepted fields: `title`, `subtitle`, `logo`, `couponName`, `merchantName`, `themeColor`, `titleColor`, `subtitleColor`, `backgroundImage`, and the corresponding `*FontFamily`, `*FontSize`, and `*FontWeight` fields emitted by the compiler.

Only use merchant/coupon details supplied by the user or current project. Otherwise use neutral editable labels, not factual offers.

### navigation

Accepted fields: `shape`, `pageNum`, `rowNum`, `iconSize`, `color`, `bgColor`, `opacity`, `fontWeight`, `fontStyle`, `textDecoration`, and `items`. Each item accepts `text`/`label`, `useText`, `mode`, `link`, `icon`, `color`, and `backgroundColor`.

Provide at least one real navigation item; an empty navigation component is a validation error.

### brand-navbar

Accepted fields: `brandName`, `logo`, `showLogo`, `mode`, `itemGap`, `paddingX`, `height`, `bgColor`, `color`, `brandFontSize`, `navFontSize`, `fontWeight`, `layout`, `styleColor`, `typography`, `iconStyle`, and `items`.

Only one navbar may exist in an IR. A navbar-only carrier section is removed after the navbar is promoted to the top level.

### search

Accepted fields: `mode`, `placeholder`, `backgroundColor`, `color`, `bgColor`, `opacity`, `padding`, and `radius`.

### banner

Accepted fields: `mode`, `height`, `color`, `bgColor`, `opacity`, `indicatorDots`, `autoplay`, and `items`. Each item accepts `pic`/`src`/`url` and `link`.

Banner items are allowed only with searched and verified HTTP(S) raster-image direct URLs with matching commercial-use license evidence. Do not emit an empty decorative banner or any SVG/local/generated source.

### store-information

Accepted fields: `backgroundImage`, `logo`, `storeName`, `slogan`, `phone`, `email`, `address`, and `businessHours`. Do not invent contact or business details.

### service-list

Accepted fields: `storeName`, `logo`, and `themeColor`. Keep `services` empty; the component loads runtime data.

### event-list

Accepted field: `styleMode`. Keep `events` empty and place the component in its own section.

### event-calendar

Accepted fields: `viewMode`, `styleMode`, `themePreset`, `primaryColor`, `secondaryColor`, `accentColor`, `backgroundColor`, `surfaceColor`, `textColor`, and `mutedTextColor`. Keep `events` empty.

### blog-list

Accepted fields: `titleColor`, `titleFontSize`, `titleFontWeight`, `subtitleColor`, `subtitleFontSize`, `subtitleFontWeight`, and `bgColor`. Keep `blogContents` empty.

## Constraints

- Use stable unique component IDs.
- Keep `x + w <= 386` unless overflow is explicitly requested.
- Keep every non-overflow child bottom (`y + h`) within its section height.
- Same-column text and rich-text boxes must not overlap and should have at least 8px vertical separation.
- Images and rectangles that overlap readable or interactive content must use a lower `zIndex`; do not overlay a separate text component on a button.
- Button horizontal and vertical padding default to `0`.
- Text-bearing rectangles must omit `h` for automatic card sizing or provide enough explicit height to contain all higher-layer content plus bottom padding.
- Newly generated image-bearing components may use only searched, verified HTTP(S) raster-image direct URLs with matching `assetManifest` evidence; SVG and local/generated image sources are forbidden.
- Business components load their own runtime data. Leave `list`, `events`, `services`, and `blogContents` empty and configure only presentation, source mode, counts, and filters documented by the IR.
- `goods-list` and `discount-promotion` default to automatic/all-products data mode unless the user explicitly requests a selection mode.
- Top-level/business components are never nested in `component_list`; the compiler removes their dedicated IR carrier and preserves their order beside `free-box` entries.
- `brand-navbar` is a top-level component; the compiler removes it from section children and emits it before other page blocks.
- Existing canonical components must never be recreated through compact IR during an edit. Use `mode: "extend"` and include only new sections. The final validator still audits preserved components for complete required fields.
- Every top-level/business component occupies a dedicated one-child IR section and compiles directly to the top-level `designJson` array. Legacy canonical top-level components are preserved during `extend`.
- Do not generate empty `video-player` or image components merely as placeholders. If no usable media URL exists, omit the media component and retain explanatory text only when the user needs it.
- Do not invent URLs, ratings, contact details or dates presented as facts.
- Unknown component types are compilation errors and must be removed or replaced deliberately.

## Final Output Completeness

After IR compilation and canonical extension, the compiler validates every component against an independent output contract:

- root `id`, `label`, and canonical `type`;
- complete `free-box` structure, styles, config, and control wrappers;
- all required structure and style controls for every field component;
- complete link-value fields for text, image, button, and rectangle components;
- fixed component name and required business-property paths;
- every tab container and nested child recursively;
- unique IDs, business-component top-level placement, deprecated types, and conditional single-use limits.

Every control object must include `label`, `type`, and `value`. A missing field fails compilation with its exact path. The canonical page is not overwritten after any final-output validation failure.
