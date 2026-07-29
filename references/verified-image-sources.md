# Verified Commercial-Use Image Sources

Use only images whose individual source page provides current, explicit evidence that commercial use is permitted. A working image URL is not evidence of copyright permission. The compiler validates the evidence recorded in the IR `assetManifest`; the agent must still inspect the source page and verify the final direct URL before writing IR.

## Required asset manifest fields

Every image resource must have one matching entry keyed by `directUrl`:

| Field | Requirement |
| --- | --- |
| `directUrl` | Final HTTP(S) raster-image URL used in `src` or an image-bearing component |
| `sourcePage` | Separate HTTP(S) page containing the author and license evidence |
| `author` | Named author or an explicit public-domain attribution statement |
| `license` | `Public Domain`, `CC0`, `CC BY`, `CC BY-SA`, or a named provider license that explicitly permits commercial use |
| `commercialUse` | Must be `true` |
| `attributionRequired` | Boolean reflecting the license |
| `attribution` | Required when `attributionRequired` is `true` |
| `verifiedAt` | Date when the source page and direct URL were checked |
| `contentType` | Current response media type, such as `image/jpeg` or `image/png` |
| `statusCode` | Must be `200` |

## License policy

Prefer Public Domain and CC0. CC BY and CC BY-SA are acceptable only when attribution is preserved. Provider-wide terms such as the current Unsplash, Pexels, or Pixabay license may be used only when the individual image is eligible under those terms and the source page does not contain an editorial-only or other restriction.

Reject CC BY-NC, any non-commercial or personal-use license, Editorial Only material, unknown licenses, inaccessible license pages, and assets with unresolved model, trademark, location, or publicity-rights concerns. Do not infer permission from a search snippet, a CDN hostname, or the absence of a copyright notice. When evidence is incomplete, omit the image and continue with a text-only or rectangle-based composition.

## URL verification

1. Search for a subject-matched image on an approved source.
2. Open the individual source page and confirm author, license, commercial-use permission, and any attribution requirement.
3. Use only the provider's direct HTTP(S) raster-image URL in the IR. Never put a detail page in `src`.
4. Send a HEAD request or a small-image GET request to the final URL and verify HTTP 200 and `Content-Type: image/*`.
5. Reject SVG, local paths, data/blob URLs, placeholder domains, generated sources, redirects that do not resolve to an image, and URLs that request SVG through a query parameter.
6. Record the evidence in `assetManifest` before compilation. Recheck stale entries before reuse; `verifiedAt` is evidence of a check, not a permanent availability guarantee.

The compiler cannot prove the external legal status of an image. It rejects missing or internally contradictory evidence, while source-page review remains a required agent action. This reduces risk but is not legal advice or a guarantee that an image has no third-party rights issue.
