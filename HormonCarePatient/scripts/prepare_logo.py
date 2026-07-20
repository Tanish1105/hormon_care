from PIL import Image
from pathlib import Path

src = Path(
    r"E:\hormon_care\public\ChatGPT Image Jul 20, 2026, 02_47_16 PM.png"
)
im = Image.open(src).convert("RGBA")

# Flatten on pure white
bg = Image.new("RGBA", im.size, (255, 255, 255, 255))
out = Image.alpha_composite(bg, im).convert("RGBA")

# Slightly shrink content padding for cleaner app mark if needed — keep full logo
public = Path(r"E:\hormon_care\public")
assets = Path(r"E:\hormon_care\HormonCarePatient\src\assets")
assets.mkdir(parents=True, exist_ok=True)

out.save(public / "hormon-care-logo.png", "PNG", optimize=True)
out.save(assets / "hormon-care-logo.png", "PNG", optimize=True)

mipmap_sizes = {
    "mipmap-mdpi": 48,
    "mipmap-hdpi": 72,
    "mipmap-xhdpi": 96,
    "mipmap-xxhdpi": 144,
    "mipmap-xxxhdpi": 192,
}
res = Path(r"E:\hormon_care\HormonCarePatient\android\app\src\main\res")
for folder, size in mipmap_sizes.items():
    canvas = Image.new("RGBA", (size, size), (255, 255, 255, 255))
    pad = int(size * 0.06)
    logo = out.copy()
    logo.thumbnail((size - pad * 2, size - pad * 2), Image.Resampling.LANCZOS)
    x = (size - logo.width) // 2
    y = (size - logo.height) // 2
    canvas.paste(logo, (x, y), logo)
    dest = res / folder
    dest.mkdir(parents=True, exist_ok=True)
    rgb = canvas.convert("RGB")
    rgb.save(dest / "ic_launcher.png", "PNG")
    rgb.save(dest / "ic_launcher_round.png", "PNG")

print("updated", out.size, "corner", out.getpixel((5, 5)))
