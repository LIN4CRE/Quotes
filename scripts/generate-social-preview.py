#!/usr/bin/env python3
"""Generate the 1280x640 GitHub social preview and Open Graph card.

This file is the editable source for the artwork: colours, copy, geometry and
typography live here, so the image can be regenerated rather than edited as a
flat bitmap. Run `python3 scripts/generate-social-preview.py` after changing it.
"""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

INK = (8, 9, 11)
SURFACE = (15, 17, 21)
GOLD = (231, 182, 107)
LIGHT = (248, 226, 182)
DEEP = (169, 106, 22)
PAPER = (246, 240, 230)
MUTED = (166, 158, 146)

ROOT = Path(__file__).resolve().parent.parent
WIDTH, HEIGHT = 1280, 640


def font(kind: str, size: int) -> ImageFont.FreeTypeFont:
    candidates = {
        "sans": [
            "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
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
    }[kind]
    for candidate in candidates:
        if Path(candidate).exists():
            return ImageFont.truetype(candidate, size)
    raise SystemExit("No usable fonts found. Install DejaVu or Liberation fonts.")


def tracked(draw: ImageDraw.ImageDraw, xy, text, typeface, fill, tracking):
    """Draw letterspaced text and return the total advance."""
    x, y = xy
    for character in text:
        draw.text((x, y), character, font=typeface, fill=fill)
        x += draw.textlength(character, font=typeface) + tracking
    return x - xy[0] - tracking


def main() -> None:
    image = Image.new("RGB", (WIDTH, HEIGHT), INK)
    draw = ImageDraw.Draw(image)

    # Warm light from the upper right, drawn softly and then blurred.
    glow = Image.new("RGB", (WIDTH, HEIGHT), INK)
    glow_draw = ImageDraw.Draw(glow)
    glow_draw.ellipse((760, -340, 1460, 360), fill=(92, 58, 22))
    glow = glow.filter(ImageFilter.GaussianBlur(150))
    image = Image.blend(image, glow, 0.55)
    draw = ImageDraw.Draw(image)

    # A quiet vertical rule anchors the editorial layout.
    draw.rectangle((84, 76, 87, HEIGHT - 76), fill=(*DEEP, 255))

    # Oversized quotation mark, kept low-contrast so the type leads.
    mark_font = font("serif_bold", 420)
    draw.text((900, 80), "\u201d", font=mark_font, fill=(231, 182, 107, 26))

    # Wordmark.
    brand = font("sans_bold", 30)
    tracked(draw, (132, 86), "LIN4CRE", brand, PAPER, 8)
    small = font("sans_bold", 15)
    tracked(draw, (134, 128), "Q U O T E S", small, GOLD, 2)

    # Headline.
    headline = font("serif_bold", 88)
    draw.text((130, 208), "Words worth", font=headline, fill=PAPER)
    draw.text((130, 306), "keeping.", font=headline, fill=LIGHT)

    # Rule and standfirst.
    draw.rectangle((132, 424, 332, 427), fill=GOLD)
    sub = font("serif", 30)
    draw.text(
        (130, 452),
        "302 curated quotations \u00b7 167 authors \u00b7 15 themes",
        font=sub,
        fill=MUTED,
    )

    footer = font("sans", 22)
    draw.text((132, HEIGHT - 84), "Source-checked  \u00b7  Local-first  \u00b7  No tracking", font=footer, fill=MUTED)
    url = "lin4cre-quotes.vercel.app"
    width = draw.textlength(url, font=font("sans_bold", 22))
    draw.text((WIDTH - 84 - width, HEIGHT - 86), url, font=font("sans_bold", 22), fill=GOLD)

    # Fine inner border.
    draw.rectangle((48, 40, WIDTH - 48, HEIGHT - 40), outline=(62, 50, 34), width=2)

    docs = ROOT / "docs" / "branding"
    docs.mkdir(parents=True, exist_ok=True)
    image.save(ROOT / "public" / "og-image.png", optimize=True)
    image.save(docs / "social-preview.png", optimize=True)
    print("Wrote public/og-image.png and docs/branding/social-preview.png (1280x640).")


if __name__ == "__main__":
    main()
