"""Upscale the placeholder images to the size they're displayed at on a 2x/3x phone screen.

Sources are the original crops in ../grabngo/assets/images (never modified). Lanczos resampling
plus a light unsharp mask looks far sharper than letting the browser stretch a small image.
Replace these files with full-resolution exports from Figma when available.
"""
import glob, os
from PIL import Image, ImageEnhance, ImageFilter

SRC = os.path.expanduser("~/grabngo/assets/images")
DST = os.path.join(os.path.dirname(__file__), "..", "public", "images")

# Longest display edge in device pixels (CSS px x 2) for each image group.
TARGET = {
    "places/": 800,    # thumbnails double as restaurant headers and dessert slices
    "products/": 560,  # drink/food cut-outs (wheel, turntable, heroes)
    "addons/": 200,
    "ingredients/": 200,
    "orbs/": 260,
    "misc/": 540,
    "slide-": 1400,
    "orb-": 260,
    "logo": 700,
}

def target_for(rel):
    for prefix, t in TARGET.items():
        if rel.startswith(prefix):
            return t
    return 600

for src in sorted(glob.glob(f"{SRC}/**/*.*", recursive=True)):
    rel = os.path.relpath(src, SRC)
    im = Image.open(src)
    if rel.startswith("places/") and max(im.size) < 200:
        # Thumbnails were cropped from rounded cards; trim the white corners off.
        m = round(im.width * 0.07)
        im = im.crop((m, m, im.width - m, im.height - m))
    longest = max(im.size)
    scale = min(max(target_for(rel) / longest, 1), 4)
    size = (round(im.width * scale), round(im.height * scale))
    has_alpha = im.mode in ("RGBA", "LA") or "transparency" in im.info
    im = im.convert("RGBA" if has_alpha else "RGB")
    if has_alpha:
        rgb, alpha = im.convert("RGB"), im.getchannel("A")
        rgb = rgb.resize(size, Image.LANCZOS)
        alpha = alpha.resize(size, Image.LANCZOS)
    else:
        rgb = im.resize(size, Image.LANCZOS)
    if scale > 1:
        # Restore edge crispness lost in upscaling, scaled to how far we stretched.
        rgb = rgb.filter(ImageFilter.UnsharpMask(radius=1.2 * scale / 2, percent=int(60 + 25 * scale), threshold=2))
        rgb = ImageEnhance.Contrast(rgb).enhance(1.03)
    out = os.path.join(DST, rel)
    os.makedirs(os.path.dirname(out), exist_ok=True)
    if has_alpha:
        rgb.putalpha(alpha)
        rgb.save(out, optimize=True)
    elif rel.endswith((".jpg", ".jpeg")):
        rgb.save(out, quality=88, optimize=True, progressive=True)
    else:
        rgb.save(out, optimize=True)
    print(f"{rel:45s} {longest:>4} -> {max(size):>4}px")
