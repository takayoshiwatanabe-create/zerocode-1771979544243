#!/usr/bin/env python3
"""Generate a 1024x1024 kawaii app icon for CHORES! app."""

from PIL import Image, ImageDraw, ImageFont
import math
import shutil
import os

W, H = 1024, 1024
img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)

# --- Load fonts ---
try:
    font_bold_large = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Rounded Bold.ttf", 72)
    font_bold_ribbon = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Rounded Bold.ttf", 58)
    font_check = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 36)
except:
    font_bold_large = ImageFont.load_default()
    font_bold_ribbon = ImageFont.load_default()
    font_check = ImageFont.load_default()

# =========================================================
# 1. Background: Sky blue gradient with rounded corners
# =========================================================
corner_radius = 180
for y in range(H):
    t = y / H
    r = int(135 + (176 - 135) * t)
    g = int(206 + (224 - 206) * t)
    b = int(235 + (255 - 235) * t)
    draw.line([(0, y), (W, y)], fill=(r, g, b, 255))

# Apply rounded corner mask
mask = Image.new("L", (W, H), 0)
mask_draw = ImageDraw.Draw(mask)
mask_draw.rounded_rectangle([(0, 0), (W - 1, H - 1)], radius=corner_radius, fill=255)
img.putalpha(mask)
draw = ImageDraw.Draw(img)

# =========================================================
# 2. Rainbow arch in upper area
# =========================================================
rainbow_colors = [
    (255, 0, 0),      # red
    (255, 127, 0),    # orange
    (255, 255, 0),    # yellow
    (0, 200, 0),      # green
    (0, 100, 255),    # blue
    (75, 0, 130),     # indigo
    (148, 0, 211),    # violet
]

rainbow_cx, rainbow_cy = W // 2, 280
arc_thickness = 25
outer_r_start = 320

for i, color in enumerate(rainbow_colors):
    outer_r = outer_r_start - i * arc_thickness
    inner_r = outer_r - arc_thickness
    bbox_outer = [
        rainbow_cx - outer_r, rainbow_cy - outer_r,
        rainbow_cx + outer_r, rainbow_cy + outer_r,
    ]
    # Draw thick arc (semicircle, top half)
    draw.arc(bbox_outer, start=180, end=360, fill=color, width=arc_thickness)

# =========================================================
# 3. "CHORES!" text above rainbow
# =========================================================
text_chores = "CHORES!"
bbox_t = draw.textbbox((0, 0), text_chores, font=font_bold_large)
tw = bbox_t[2] - bbox_t[0]
th = bbox_t[3] - bbox_t[1]
tx = (W - tw) // 2
ty = 28

# Dark shadow
draw.text((tx + 3, ty + 3), text_chores, fill=(60, 60, 80, 200), font=font_bold_large)
# White text
draw.text((tx, ty), text_chores, fill=(255, 255, 255, 255), font=font_bold_large)

# =========================================================
# 4. Yellow star character with cute face
# =========================================================

def draw_star(draw, cx, cy, outer_r, inner_r, n_points, fill_color, outline_color=None):
    """Draw an n-point star polygon."""
    points = []
    for i in range(n_points * 2):
        angle = math.radians(-90 + i * 180 / n_points)
        r = outer_r if i % 2 == 0 else inner_r
        x = cx + r * math.cos(angle)
        y = cy + r * math.sin(angle)
        points.append((x, y))
    draw.polygon(points, fill=fill_color, outline=outline_color)
    return points

star_cx, star_cy = W // 2, 480
star_outer = 155
star_inner = 70

# Star body with slight outline
draw_star(draw, star_cx, star_cy, star_outer + 4, star_inner + 2, 5,
          fill_color=(218, 165, 32), outline_color=(218, 165, 32))
draw_star(draw, star_cx, star_cy, star_outer, star_inner, 5,
          fill_color=(255, 215, 0), outline_color=(255, 215, 0))

# --- Cute face on star ---
# Eyes: two small black dots
eye_y = star_cy - 15
eye_left_x = star_cx - 35
eye_right_x = star_cx + 35
eye_r = 12
draw.ellipse([eye_left_x - eye_r, eye_y - eye_r, eye_left_x + eye_r, eye_y + eye_r], fill=(30, 30, 30))
draw.ellipse([eye_right_x - eye_r, eye_y - eye_r, eye_right_x + eye_r, eye_y + eye_r], fill=(30, 30, 30))

# Eye highlights (small white dots for kawaii sparkle)
hl_r = 5
draw.ellipse([eye_left_x - eye_r + 4, eye_y - eye_r + 2,
              eye_left_x - eye_r + 4 + hl_r * 2, eye_y - eye_r + 2 + hl_r * 2], fill=(255, 255, 255))
draw.ellipse([eye_right_x - eye_r + 4, eye_y - eye_r + 2,
              eye_right_x - eye_r + 4 + hl_r * 2, eye_y - eye_r + 2 + hl_r * 2], fill=(255, 255, 255))

# Cheeks: two pink circles
cheek_y = star_cy + 15
cheek_r = 22
cheek_left_x = star_cx - 60
cheek_right_x = star_cx + 60
draw.ellipse([cheek_left_x - cheek_r, cheek_y - cheek_r,
              cheek_left_x + cheek_r, cheek_y + cheek_r], fill=(255, 153, 153, 160))
draw.ellipse([cheek_right_x - cheek_r, cheek_y - cheek_r,
              cheek_right_x + cheek_r, cheek_y + cheek_r], fill=(255, 153, 153, 160))

# Smile: small arc
smile_cx, smile_cy = star_cx, star_cy + 20
smile_w, smile_h = 40, 25
draw.arc([smile_cx - smile_w, smile_cy - smile_h,
          smile_cx + smile_w, smile_cy + smile_h],
         start=10, end=170, fill=(80, 50, 30), width=4)

# --- Stubby legs at bottom of star ---
leg_y_top = star_cy + star_inner + 40
leg_w = 18
leg_h = 35
leg_left_x = star_cx - 30
leg_right_x = star_cx + 30
# Left leg
draw.rounded_rectangle([leg_left_x - leg_w, leg_y_top,
                         leg_left_x + leg_w, leg_y_top + leg_h],
                        radius=10, fill=(255, 215, 0), outline=(218, 165, 32), width=2)
# Right leg
draw.rounded_rectangle([leg_right_x - leg_w, leg_y_top,
                         leg_right_x + leg_w, leg_y_top + leg_h],
                        radius=10, fill=(255, 215, 0), outline=(218, 165, 32), width=2)

# Shoes
shoe_r = 12
draw.ellipse([leg_left_x - leg_w - 2, leg_y_top + leg_h - shoe_r,
              leg_left_x + leg_w + 2, leg_y_top + leg_h + shoe_r], fill=(180, 100, 50))
draw.ellipse([leg_right_x - leg_w - 2, leg_y_top + leg_h - shoe_r,
              leg_right_x + leg_w + 2, leg_y_top + leg_h + shoe_r], fill=(180, 100, 50))

# --- Stamp pad on the left side of the star ---
pad_x = star_cx - 160
pad_y = star_cy - 30
pad_w, pad_h = 55, 70
# Purple rectangle stamp pad
draw.rounded_rectangle([pad_x, pad_y, pad_x + pad_w, pad_y + pad_h],
                        radius=8, fill=(128, 0, 128), outline=(90, 0, 90), width=2)
# Handle on top
draw.rounded_rectangle([pad_x + 15, pad_y - 20, pad_x + pad_w - 15, pad_y + 5],
                        radius=5, fill=(160, 0, 160), outline=(90, 0, 90), width=2)

# Pink heart on top of stamp pad
heart_cx = pad_x + pad_w // 2
heart_cy = pad_y - 30
hr = 14
# Heart shape: two circles + triangle
draw.ellipse([heart_cx - hr - 2, heart_cy - hr, heart_cx + 2, heart_cy + hr // 2], fill=(255, 105, 140))
draw.ellipse([heart_cx - 2, heart_cy - hr, heart_cx + hr + 2, heart_cy + hr // 2], fill=(255, 105, 140))
draw.polygon([
    (heart_cx - hr - 4, heart_cy),
    (heart_cx + hr + 4, heart_cy),
    (heart_cx, heart_cy + hr + 8),
], fill=(255, 105, 140))

# =========================================================
# 5. 5x2 grid of white circles in lower area
# =========================================================
grid_top = 660
grid_left = 142
circle_d = 60
circle_r = circle_d // 2
spacing_x = (W - 2 * grid_left - circle_d) / 4  # 4 gaps for 5 columns
spacing_y = 80

for row in range(2):
    for col in range(5):
        cx = int(grid_left + circle_r + col * spacing_x)
        cy = int(grid_top + circle_r + row * spacing_y)
        # Circle with light gray border
        draw.ellipse([cx - circle_r - 2, cy - circle_r - 2,
                      cx + circle_r + 2, cy + circle_r + 2],
                     fill=(200, 200, 200, 255))
        draw.ellipse([cx - circle_r, cy - circle_r,
                      cx + circle_r, cy + circle_r],
                     fill=(255, 255, 255, 255))

        # Green checkmark in first circle
        if row == 0 and col == 0:
            check_color = (34, 180, 34)
            p1 = (cx - 16, cy - 2)
            p2 = (cx - 4, cy + 14)
            p3 = (cx + 18, cy - 14)
            draw.line([p1, p2], fill=check_color, width=6)
            draw.line([p2, p3], fill=check_color, width=6)

# =========================================================
# 6. Gold ribbon banner at bottom with "REWARD!"
# =========================================================
ribbon_y = 880
ribbon_h = 72
ribbon_margin = 80
fold_w = 45

# Ribbon tail left (folded end)
draw.polygon([
    (ribbon_margin - fold_w, ribbon_y + ribbon_h // 2),
    (ribbon_margin + 10, ribbon_y - 5),
    (ribbon_margin + 10, ribbon_y + ribbon_h + 5),
], fill=(184, 134, 11))

# Ribbon tail right (folded end)
draw.polygon([
    (W - ribbon_margin + fold_w, ribbon_y + ribbon_h // 2),
    (W - ribbon_margin - 10, ribbon_y - 5),
    (W - ribbon_margin - 10, ribbon_y + ribbon_h + 5),
], fill=(184, 134, 11))

# Main ribbon body - gradient gold
for y_off in range(ribbon_h):
    t = y_off / ribbon_h
    r = int(255 * (1 - t * 0.15))
    g = int(215 * (1 - t * 0.15))
    b = int(0 + t * 40)
    draw.line([(ribbon_margin, ribbon_y + y_off),
               (W - ribbon_margin, ribbon_y + y_off)],
              fill=(r, g, b, 255))

# Ribbon edge highlights
draw.line([(ribbon_margin, ribbon_y), (W - ribbon_margin, ribbon_y)],
          fill=(255, 235, 100), width=2)
draw.line([(ribbon_margin, ribbon_y + ribbon_h), (W - ribbon_margin, ribbon_y + ribbon_h)],
          fill=(180, 130, 0), width=2)

# "REWARD!" text on ribbon
text_reward = "REWARD!"
bbox_r = draw.textbbox((0, 0), text_reward, font=font_bold_ribbon)
rw = bbox_r[2] - bbox_r[0]
rh = bbox_r[3] - bbox_r[1]
rx = (W - rw) // 2
ry = ribbon_y + (ribbon_h - rh) // 2 - 4

# Shadow
draw.text((rx + 2, ry + 2), text_reward, fill=(120, 80, 0, 180), font=font_bold_ribbon)
# White text
draw.text((rx, ry), text_reward, fill=(255, 255, 255, 255), font=font_bold_ribbon)

# =========================================================
# Save
# =========================================================
out_dir = "/Users/twatanabe/Desktop/zerocode-runner/projects/730c8277-8a5a-4110-ac51-0ea0c6bc91c7/assets"
out_path = os.path.join(out_dir, "app_icon.png")
img.save(out_path, "PNG")
print(f"Saved app_icon.png: {img.size}")

# Copy to icon.png and adaptive-icon.png
shutil.copy2(out_path, os.path.join(out_dir, "icon.png"))
shutil.copy2(out_path, os.path.join(out_dir, "adaptive-icon.png"))
print("Copied to icon.png and adaptive-icon.png")
print("Done!")
