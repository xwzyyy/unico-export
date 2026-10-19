# Small Visual Asset Search

Use this workflow for small, subject-specific graphics such as icons, Mahjong tiles, stickers, stamps, badges, and compact illustrations. For each new page or full redesign, target at least one distinct, verified graphic with a clear purpose: it should clarify the brief, support the information hierarchy, or complete an explicitly requested art direction. Do not add decoration just to meet the target. If no graphic has a meaningful role, or suitable candidates fail license or direct-URL verification, record the exception and continue without one. This target does not apply to focused edits or source-faithful HTML conversion.

This reference is for direct Unico design and edits where a small graphic is useful. Do not apply it to source-faithful HTML conversion: that workflow preserves the rendered source and its assets.

## Keep the image roles distinct

- A small graphic does not replace the page's real, topic-relevant photo/image module and does not count toward the three distinct image resources required for a new or fully redesigned page. The compiler counts URLs mechanically and cannot distinguish an icon from a photo; apply both image rules during the design audit.
- Count distinct verified source assets, not placements: reusing the same URL multiple times still counts as one graphic. Continue to follow `verified-image-sources.md` for photographic assets and the page's image minimums.
- Prefer a purposeful graphic near the content it explains. Do not scatter repeated icons, stickers, tiles, or stamps as filler.

## Search and identify the real file

Search with the subject plus the intended role and visual style, such as `mahjong red dragon tile flat icon` or `community event entry stamp illustration`. Search results are candidate discovery only. For every candidate, distinguish three different URLs:

1. **Asset detail page:** the individual item page that identifies the creator and applicable license. Record it as `sourcePage`; never place it in `img.src`.
2. **Preview or thumbnail:** a search-result thumbnail or preview image. Do not use it as the final asset unless the provider explicitly identifies that exact URL as the official, usable image file.
3. **Direct image file/CDN URL:** the provider's official raster URL that returns the actual image bytes. Only this URL can go in `img.src` under the current compiler contract.

| Candidate site | What to inspect | Format caution |
| --- | --- | --- |
| [SVG Repo](https://www.svgrepo.com/) | Open the individual asset page and identify its author and item-specific license. | Use only if the provider offers a confirmed raster CDN file; a standalone SVG is search/reference material because the current compiler rejects SVG. |
| [Icons8](https://icons8.com/) | Open the individual icon page and check that item's current license tier, commercial permission, creator, and attribution conditions. | Use an official raster CDN file when available. A page URL or preview thumbnail is not the file URL. |
| [Flaticon](https://www.flaticon.com/) | Open the individual item page and check whether the exact asset is free or paid, its applicable license, commercial permission, creator, and attribution requirement. | Use an official raster download/CDN file; do not assume a free-tier or premium license from the host name. |
| [unDraw](https://undraw.co/) | Open the individual illustration page and inspect the current asset license and creator/provenance information. | SVG illustrations are search/reference material unless the provider supplies a confirmed raster CDN file accepted by the current compiler. |

The example URLs below illustrate URL roles only. They are not pre-verified for availability, MIME type, commercial permission, or attribution, and must be checked again when selected:

- SVG Repo detail page: `https://www.svgrepo.com/svg/396964/mahjong-red-dragon`; SVG download: `https://www.svgrepo.com/download/396964/mahjong-red-dragon.svg` (a candidate direct file only; not pre-verified).
- Icons8 detail page: `https://icons8.com/icon/lgG9VhwuQsIA/mahjong-red-dragon`; raster CDN example: `https://img.icons8.com/emoji/1200/mahjong-red-dragon.jpg`.
- Flaticon detail page: `https://www.flaticon.com/free-icon/mahjong_2241254`; raster CDN example: `https://cdn-icons-png.flaticon.com/512/2241/2241254.png`.
- unDraw detail page: `https://undraw.co/illustration/add-document_oqbr`; SVG example: `https://cdn.undraw.co/illustrations/add-document_oqbr.svg` (a candidate direct file only; not pre-verified).

Do not derive, edit, or guess a CDN path from a detail-page URL. Follow the site's own download or file link and confirm that it points to the same individual item. Do not use scraped previews, proxy URLs, local downloads, or a copy re-hosted elsewhere.

## Verify format and availability

The current Unico compiler accepts verified raster image URLs only. It rejects standalone SVG, `.svgz`, inline SVG, SVG MIME types, and data URLs. Raster formats must match the observed response rather than being inferred from a `.png` or `.jpg` suffix.

For the final direct URL:

1. Try `HEAD`; if it is unsupported, try a small `GET` and inspect the actual response and final URL after redirects.
2. Confirm the request returns HTTP 200 and an actual raster `Content-Type: image/*` other than SVG. Confirm the image loads without authentication or an expiring/private URL.
3. Record `urlCheck: "verified"` only after observing those facts. Record observed `statusCode` and `contentType` values exactly; never infer either from a filename or URL. `urlCheck` is a human audit field; the compiler currently validates `statusCode` and `contentType`, not the `urlCheck` label.
4. If access is blocked, times out, or headers cannot be read, record the candidate's state as `unavailable` or `not_checked` in the search notes. Do not put that candidate in final IR or claim it is verified: the compiler requires an observed HTTP 200 and a real image MIME type. Continue with another item or site; since the graphic is optional, omit it if no suitable verified candidate remains.

Availability can differ across AI workspaces. A link that loaded in one environment is not a guarantee that another environment or the Unico runtime can load it. If a site shows a bot challenge or security page, do not treat that HTML page as an image response; try the official direct URL with a small GET or search another provider.

## Record asset-specific rights

Use the individual item page to record provenance and license facts for each selected graphic. Never infer a license from the provider name, file host, search snippet, or another item's page. The final IR `assetManifest` entry must match the existing compiler contract:

```json
{
  "directUrl": "https://provider.example/path/to/actual-raster.png",
  "sourcePage": "https://provider.example/item/individual-asset",
  "author": "Creator named on the item page",
  "license": "Exact applicable license name for this item",
  "commercialUse": true,
  "attributionRequired": true,
  "attribution": "Exact required credit",
  "verifiedAt": "2026-10-16",
  "urlCheck": "verified",
  "contentType": "image/png",
  "statusCode": 200
}
```

This is a shape example, not evidence for any real asset. Set `attributionRequired` and `attribution` from the selected item's terms; use `commercialUse: true` only when the exact license permits commercial use. If attribution is not required, set the boolean to `false` and omit `attribution`. Keep `sourcePage` separate from `directUrl`. For `urlCheck`, status code, MIME type, author, license, and dates, record only what was actually checked.

## Current compiler limits

The compiler rejects known Unsplash, Pexels, and Pixabay detail-page routes, but it does not maintain an approved-host allowlist for Icons8, Flaticon, SVG Repo, or unDraw. A URL passing that host/path check does not establish that it is a direct image file, is reachable, or is licensed for use; verify all three yourself.

The compiler requires `statusCode: 200` and a non-SVG raster image MIME type. Its license check recognizes Public Domain, CC0, CC BY/CC BY-SA, Unsplash License, Pexels License, and Pixabay Content License. It does not currently recognize every provider's own license name. If the exact Icons8, Flaticon, SVG Repo, or unDraw license is commercially valid but rejected by this list, do not relabel it as a different license or weaken validation. Keep the asset out of final IR, use a candidate whose exact license is supported, or raise a separate compiler/schema change for review.

See `verified-image-sources.md` for the existing photo search workflow and shared `assetManifest` rules.
