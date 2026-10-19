# Free Commercial-Use Image Search

Use this workflow for newly designed pages that need sourced photography or raster artwork. Search these libraries directly instead of searching the open web first:

| Priority | Library | License evidence | Typical direct image host |
| --- | --- | --- | --- |
| 1 | [Unsplash](https://unsplash.com/) | [Unsplash License](https://unsplash.com/license) permits free commercial and non-commercial use without required attribution. Choose the free Unsplash library; do not use Unsplash+ assets unless the user provides a valid license. | `images.unsplash.com` |
| 2 | [Pexels](https://www.pexels.com/) | [Pexels License](https://www.pexels.com/license/) permits free use, including commercial projects, without required attribution. | `images.pexels.com` |
| 3 | [Pixabay](https://pixabay.com/) | [Pixabay Content License](https://pixabay.com/service/license-summary/) permits free use and adaptation, subject to prohibited-use and third-party-rights limits. | `cdn.pixabay.com`; official image downloads may use `pixabay.com/get/` |

The libraries provide free commercial-use terms, not a guarantee that every image is free of model, property, trademark, privacy, or publicity-rights issues. Prefer scenes without recognizable brands or identifiable people when those rights are not needed. Never use editorial-only, paid-tier, non-commercial, or unclear-license results. Pixabay has additional restrictions for recognizable marks and standalone redistribution; skip an asset when its context makes those restrictions uncertain.

## Search and select

1. Search the library itself with 2–4 specific terms describing subject, setting, mood, and composition (for example, `mahjong friends warm interior overhead` or `retro Hong Kong living room wood`). If using a general search or image-search tool, restrict the query to the current library's domain (`unsplash.com`, `pexels.com`, or `pixabay.com`); search the next listed library if results are weak. Do not stop after one site.
2. Choose images for planned page roles (hero, detail, atmosphere) and visual fit, not just the first search results. Prefer distinct images when available.
3. Open each individual asset page. Capture its author/creator, the provider's applicable license name, and the source-page URL. For Unsplash, confirm the result belongs to the free library rather than Unsplash+.
4. Extract the actual raster URL from the provider's download/original-image link or page metadata (such as `og:image` only when it resolves to the provider's image CDN). Use that CDN URL in `src`, never a search thumbnail, local download, or asset detail page.
5. Try a HEAD request or small GET when available. If a request reports a non-200 response or a non-raster media type, discard that URL and try another image/provider. If the environment blocks the request or hides response headers, do not fabricate a result and do not block the page: record `urlCheck: "unavailable"` (or `"not_checked"` when no request could be attempted) and continue with the actual CDN URL obtained from the official asset page.
6. Add exactly one `assetManifest` record for each image-bearing resource, including components such as banners and logos. Keep source/license evidence separate from URL availability evidence.

## Manifest fields

Every used image has one matching manifest record. `sourcePage`, `author`, `license`, `commercialUse`, `attributionRequired`, `verifiedAt`, and `urlCheck` document real evidence. `statusCode` and `contentType` are optional and must only be included when actually observed.

```json
{
  "directUrl": "https://images.unsplash.com/photo-...?...",
  "sourcePage": "https://unsplash.com/photos/...",
  "author": "Creator name shown on the asset page",
  "license": "Unsplash License",
  "commercialUse": true,
  "attributionRequired": false,
  "verifiedAt": "2026-10-14",
  "urlCheck": "unavailable"
}
```

| Field | Rule |
| --- | --- |
| `directUrl` | The exact HTTP(S) raster URL used in the page. Must not be a provider detail page, local path, placeholder, data/blob URL, or SVG. |
| `sourcePage` | Individual provider page with asset/creator details; keep separate from `directUrl`. |
| `author` | Creator name displayed on that page. Do not use a generic provider label when an author is shown. |
| `license` | `Unsplash License`, `Pexels License`, `Pixabay Content License`, or an explicitly commercial public/Creative Commons license confirmed on the asset page. |
| `commercialUse` | `true` only after checking the applicable terms and asset eligibility. |
| `attributionRequired` | Reflect the license; include `attribution` when true. The three provider licenses above do not generally require attribution, though credit is welcome. |
| `verifiedAt` | Date you inspected the asset page and license evidence. It does not imply that the CDN response was checked. |
| `urlCheck` | `verified`, `unavailable`, or `not_checked`. Use `verified` only if a request actually returned HTTP 200 and raster `Content-Type`. |
| `statusCode` | Optional observed HTTP status. If supplied, it must be 200. Never fill it with an assumed value. |
| `contentType` | Optional observed response type. If supplied, it must be a non-SVG `image/*` type. Never infer it from the URL suffix. |

## When search or URL extraction fails

The page still needs at least one image module. Retry with a more specific query, use image search restricted to the next approved library domain, open another individual source page, and extract its provider CDN URL. A blocked HEAD request alone is not a search failure; use `urlCheck: "unavailable"` when license evidence and the CDN URL are clear. Never substitute a local file, placeholder, guessed URL, or hand-drawn subject illustration for the required photograph. If every approved library is inaccessible and no real CDN URL can be obtained, report that specific external blocker rather than outputting a page that violates the image requirement.

The compiler verifies URL shape and license-evidence consistency. It cannot independently establish copyright or third-party rights, and a provider-hosted URL does not itself prove a license.
