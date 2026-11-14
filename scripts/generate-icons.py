#!/usr/bin/env python3
"""Generate the PNG app icons and the Open Graph card from scratch.

The repository commits the generated files, so a build never needs Python.
Regenerate with:

    pip install Pillow
    python3 scripts/generate-icons.py

The mark is the same double quotation glyph used by the in-app logo: a gold
glyph on a near-black tile, with a thin gradient keyline.
"""

from __future__ import annotations

import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"
ICONS = PUBLIC / "icons"

FONT_CANDIDATES = {
    "sans": [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/Library/Fonts/Arial.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
    ],
    "sans_bold": [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
    ],
    "serif": [
        "/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf",
    ],
    "serif_bold": [
        "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf",
    ],
}

INK = (8, 9, 11)
INK_SOFT = (18, 19, 23)
GOLD_LIGHT = (248, 226, 182)
GOLD = (231, 182, 107)
GOLD_DEEP = (169, 106, 22)


def font(kind: str, size: int) -> ImageFont.FreeTypeFont:
    for candidate in FONT_CANDIDATES[kind]:
        if Path(candidate).exists():
            return ImageFont.truetype(candidate, size)
    raise SystemExit(
        "No usable fonts found. Install DejaVu or Liberation fonts to regenerate artwork."
    )


def lerp(a: tuple[int, int, int], b: tuple[int, int, int], t: float) -> tuple[int, int, int]:
    t = max(0.0, min(1.0, t))
    return tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3))  # type: ignore[return-value]


def radial_background(size: int, centre: tuple[float, float], inner, outer) -> Image.Image:
    width, height = size, size
    image = Image.new("RGB", (width, height))
    pixels = image.load()
    cx, cy = centre
    max_distance = math.hypot(max(cx, width - cx), max(cy, height - cy)) or 1
    for y in range(height):
        dy = y - cy
        for x in range(width):
            distance = math.hypot(x - cx, dy) / max_distance
            pixels[x, y] = lerp(inner, outer, min(1.0, distance * 1.15))
    return image


def diagonal_gradient(size: tuple[int, int], stops: list[tuple[float, tuple[int, int, int]]]) -> Image.Image:
    width, height = size
    image = Image.new("RGB", size)
    pixels = image.load()
    for y in range(height):
        for x in range(width):
            t = (x / max(1, width - 1)) * 0.55 + (y / max(1, height - 1)) * 0.45
            for index in range(len(stops) - 1):
                start, start_colour = stops[index]
                end, end_colour = stops[index + 1]
                if start <= t <= end:
                    local = (t - start) / max(1e-6, end - start)
                    pixels[x, y] = lerp(start_colour, end_colour, local)
                    break
            else:
                pixels[x, y] = stops[-1][1]
    return image


# The mark used by src/components/ui/Logo.tsx, as cubic Bézier segments in a
# 24×24 coordinate space. The second quotation mark is the same path +9.9 on x.
_MARK_CURVES = [
    ((6.42, 7.05), (4.65, 9.68), (4.65, 12.75)),
    ((4.65, 15.89), (6.58, 17.85), (9.00, 17.85)),
    ((11.10, 17.85), (12.65, 16.35), (12.65, 14.30)),
    ((12.65, 12.38), (11.30, 11.02), (9.45, 11.02)),
    ((9.19, 11.02), (8.95, 11.05), (8.73, 11.11)),
    ((9.15, 9.56), (10.35, 8.33), (12.03, 7.48)),
]


def _mark_points() -> list[tuple[float, float]]:
    points = [(9.35, 5.6)]
    current = points[0]
    for control_one, control_two, end in _MARK_CURVES:
        for step in range(1, 21):
            t = step / 20
            a = (1 - t) ** 3
            b = 3 * (1 - t) ** 2 * t
            c = 3 * (1 - t) * t**2
            d = t**3
            points.append(
                (
                    a * current[0] + b * control_one[0] + c * control_two[0] + d * end[0],
                    a * current[1] + b * control_one[1] + c * control_two[1] + d * end[1],
                )
            )
        current = end
    return points


def glyph_mask(box: int, fill_ratio: float = 0.84) -> tuple[Image.Image, tuple[int, int]]:
    """Rasterise the two quotation marks, fitted and centred inside a square."""
    points = _mark_points()
    marks = [points, [(x + 9.9, y) for x, y in points]]
    xs = [x for mark in marks for x, _ in mark]
    ys = [y for mark in marks for _, y in mark]
    left, right, top, bottom = min(xs), max(xs), min(ys), max(ys)
    scale = (box * fill_ratio) / max(right - left, bottom - top)

    mask = Image.new("L", (box, box), 0)
    draw = ImageDraw.Draw(mask)
    offset_x = (box - (right - left) * scale) / 2 - left * scale
    offset_y = (box - (bottom - top) * scale) / 2 - top * scale
    for mark in marks:
        draw.polygon(
            [(x * scale + offset_x, y * scale + offset_y) for x, y in mark],
            fill=255,
        )
    return mask, (round((right - left) * scale), round((bottom - top) * scale))


def build_icon(size: int, *, maskable: bool = False, rounded: bool = True) -> Image.Image:
    scale = 4
    work = size * scale

    background = radial_background(
        work,
        (work * 0.28, work * 0.16),
        (34, 30, 23),
        INK,
    ).convert("RGBA")

    gold = diagonal_gradient(
        (work, work),
        [
            (0.0, GOLD_LIGHT),
            (0.5, GOLD),
            (1.0, GOLD_DEEP),
        ],
    ).convert("RGBA")

    glyph_box = int(work * (0.58 if maskable else 0.7))
    mask, _ = glyph_mask(glyph_box)
    glyph_layer = Image.new("RGBA", (work, work), (0, 0, 0, 0))
    glyph_x = (work - glyph_box) // 2
    glyph_y = int(work * 0.5) - glyph_box // 2
    glyph_layer.paste(gold.crop((glyph_x, glyph_y, glyph_x + glyph_box, glyph_y + glyph_box)), (glyph_x, glyph_y), mask)
    background = Image.alpha_composite(background, glyph_layer)

    overlay = Image.new("RGBA", (work, work), (0, 0, 0, 0))
    overlay_draw = ImageDraw.Draw(overlay)
    inset = max(2, round(work * 0.012))
    radius = round(work * (0.24 if rounded else 0.0))
    overlay_draw.rounded_rectangle(
        [inset, inset, work - inset, work - inset],
        radius=max(0, radius - inset),
        outline=(231, 182, 107, 110),
        width=max(2, round(work * 0.006)),
    )
    background = Image.alpha_composite(background, overlay)

    if rounded:
        corner_mask = Image.new("L", (work, work), 0)
        ImageDraw.Draw(corner_mask).rounded_rectangle(
            [0, 0, work - 1, work - 1],
            radius=round(work * 0.24),
            fill=255,
        )
        background.putalpha(corner_mask)

    return background.resize((size, size), Image.LANCZOS)


def fit_font(text: str, kind: str, maximum_width: int, start: int, minimum: int = 12) -> ImageFont.FreeTypeFont:
    size = start
    while size > minimum:
        candidate = font(kind, size)
        if candidate.getlength(text) <= maximum_width:
            return candidate
        size -= 2
    return font(kind, minimum)


def tracked_text(
    draw: ImageDraw.ImageDraw,
    position: tuple[int, int],
    text: str,
    typeface: ImageFont.FreeTypeFont,
    fill,
    tracking: int,
) -> int:
    x, y = position
    for character in text:
        draw.text((x, y), character, font=typeface, fill=fill)
        x += typeface.getlength(character) + tracking
    return x


def build_og_image() -> Image.Image:
    width, height = 1200, 630
    image = Image.new("RGB", (width, height), INK)
    pixels = image.load()
    glow_x, glow_y = 1010, 40
    max_distance = math.hypot(max(glow_x, width - glow_x), max(glow_y, height - glow_y))
    for y in range(height):
        for x in range(width):
            distance = math.hypot(x - glow_x, y - glow_y) / max_distance
            pixels[x, y] = lerp((36, 30, 20), INK, min(1.0, distance * 1.25))
    image = image.convert("RGBA")

    draw = ImageDraw.Draw(image)

    watermark_font = font("serif_bold", 460)
    draw.text((880, 40), "\u201d", font=watermark_font, fill=(231, 182, 107, 22))

    frame = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    ImageDraw.Draw(frame).rounded_rectangle(
        [28, 28, width - 29, height - 29],
        radius=28,
        outline=(255, 255, 255, 22),
        width=2,
    )
    image = Image.alpha_composite(image, frame)
    draw = ImageDraw.Draw(image)

    icon = build_icon(112, rounded=True)
    image.paste(icon, (88, 82), icon)

    sans_bold = font("sans_bold", 27)
    serif_bold = font("serif_bold", 22)
    tracked_text(draw, (228, 98), "LIN4CRE", sans_bold, (245, 240, 231, 255), 9)
    tracked_text(draw, (229, 139), "QUOTES", serif_bold, GOLD, 7)

    headline_font = fit_font("its sources attached.", "serif_bold", 1010, 64)
    draw.text((88, 248), "A quote library", font=headline_font, fill=(247, 243, 236, 255))
    draw.text((88, 322), "with its sources attached.", font=headline_font, fill=(247, 243, 236, 255))

    draw.rectangle([88, 424, 164, 428], fill=GOLD)

    body_font = font("sans", 25)
    draw.text(
        (88, 460),
        "Discover daily quotes, browse fifteen themes and 165 authors,",
        font=body_font,
        fill=(178, 173, 164, 255),
    )
    draw.text(
        (88, 494),
        "save favourites, build collections and share images you make yourself.",
        font=body_font,
        fill=(178, 173, 164, 255),
    )

    footer_sans = font("sans_bold", 17)
    tracked_text(draw, (88, 560), "LIN4CRE QUOTES", footer_sans, GOLD, 4)

    footer_right = font("sans", 17)
    label = "A PROGRESSIVE WEB APP"
    right_width = footer_right.getlength(label) + (len(label) - 1) * 2
    draw.text((width - 88 - right_width, 560), label, font=footer_right, fill=(120, 117, 111, 255))

    return image.convert("RGB")


def main() -> None:
    ICONS.mkdir(parents=True, exist_ok=True)

    build_icon(192, rounded=True).save(ICONS / "icon-192.png", optimize=True)
    build_icon(512, rounded=True).save(ICONS / "icon-512.png", optimize=True)
    build_icon(512, maskable=True, rounded=False).save(
        ICONS / "icon-maskable-512.png", optimize=True
    )
    build_icon(180, rounded=False).save(PUBLIC / "apple-touch-icon.png", optimize=True)
    build_icon(32, rounded=True).save(PUBLIC / "favicon-32.png", optimize=True)

    favicon = build_icon(64, rounded=True)
    favicon.save(PUBLIC / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])

    build_og_image().save(PUBLIC / "og-image.png", optimize=True, quality=92)

    print("Generated icons and og-image.png in public/")


if __name__ == "__main__":
    main()
