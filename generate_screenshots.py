#!/usr/bin/env python3
"""
Generate promotional screenshots for the Stamp Card app (スタンプカードアプリ).
Produces 4 PNG images (520×1120px) faithfully matching the app's visual style.

Usage: python3 generate_screenshots.py
Output: screenshot_01_home.png .. screenshot_04_reward.png
"""

import math
import random
import os
from PIL import Image, ImageDraw, ImageFont

# ── Dimensions ──
W, H = 520, 1120

# ── Colors (from constants/colors.ts) ──
PRIMARY      = "#5BC8F5"
PRIMARY_DARK = "#4AB8E5"
SECONDARY    = "#FF9DD2"
ACCENT       = "#FFE66D"
ACCENT_DARK  = "#FFD93D"
BG_TOP       = "#87CEEB"
BG_BOTTOM    = "#C8E6F5"
SURFACE      = "#FFFFFF"
TEXT_DARK    = "#2D3436"
TEXT_LIGHT   = "#636E72"
STAMP_EMPTY  = "#B8E4F9"
STAMP_FILLED = "#FFD700"
SUCCESS      = "#4CAF50"
PINK_BG      = "#FFE0EE"
PINK_TEXT    = "#E91E8C"
RED          = "#FF3B30"
ORANGE       = "#FFA559"
MODAL_OVERLAY = (0, 0, 0, 96)  # #00000060
RAINBOW      = ["#FF6B6B", "#FFA559", "#FFE66D", "#7BC67E", "#5BC8F5", "#7B68EE", "#BA68C8"]
CONFETTI     = ["#FF9DD2", "#5BC8F5", "#FFE66D", "#FFA559", "#7BC67E", "#BA68C8"]

# ── Font ──
FONT_PATH = "/System/Library/Fonts/Hiragino Sans GB.ttc"

def font(size):
    return ImageFont.truetype(FONT_PATH, size)

def hex_to_rgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))

def hex_to_rgba(h, a=255):
    return hex_to_rgb(h) + (a,)

# ── Drawing helpers ──

def gradient_rect(img, box, color_top, color_bottom):
    """Fill a rectangle with a vertical gradient."""
    x0, y0, x1, y1 = box
    for y in range(y0, y1):
        t = (y - y0) / max(1, y1 - y0 - 1)
        r = int(color_top[0] + (color_bottom[0] - color_top[0]) * t)
        g = int(color_top[1] + (color_bottom[1] - color_top[1]) * t)
        b = int(color_top[2] + (color_bottom[2] - color_top[2]) * t)
        ImageDraw.Draw(img).line([(x0, y), (x1, y)], fill=(r, g, b))

def draw_rounded_rect(draw, box, radius, fill=None, outline=None, width=1):
    """Draw a rounded rectangle."""
    x0, y0, x1, y1 = box
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)

def draw_pill(draw, box, fill=None, outline=None, width=1):
    """Draw a pill-shaped rectangle (radius = half height)."""
    x0, y0, x1, y1 = box
    r = (y1 - y0) // 2
    draw.rounded_rectangle(box, radius=r, fill=fill, outline=outline, width=width)

def draw_circle(draw, cx, cy, r, fill=None, outline=None):
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=fill, outline=outline)

def draw_cloud(draw, x, y, scale=1.0):
    """Draw a simple cloud shape."""
    s = scale
    color = (255, 255, 255, 200)  # #FFFFFFCC
    draw.ellipse([x, y + int(10*s), x + int(60*s), y + int(50*s)], fill=color)
    draw.ellipse([x + int(20*s), y, x + int(100*s), y + int(50*s)], fill=color)
    draw.ellipse([x + int(50*s), y + int(10*s), x + int(110*s), y + int(50*s)], fill=color)

def draw_rainbow(draw, cx, cy):
    """Draw a rainbow arch centered at (cx, cy) which is the bottom-center."""
    base_radius = 120
    thickness = 8
    for i, color in enumerate(RAINBOW):
        r = base_radius - i * thickness
        if r <= 0:
            break
        bbox = [cx - r, cy - r, cx + r, cy + r]
        draw.arc(bbox, start=180, end=360, fill=hex_to_rgb(color), width=thickness)
    # Cloud emoji placeholders at base
    cloud_r = 12
    draw_circle(draw, cx - base_radius + 5, cy + 2, cloud_r, fill=(255, 255, 255, 220))
    draw_circle(draw, cx + base_radius - 5, cy + 2, cloud_r, fill=(255, 255, 255, 220))

def draw_star_character(draw, cx, cy, size=40):
    """Draw a star character with face (simplified ⭐ with eyes/mouth)."""
    # Star body - gold circle as base
    r = size // 2
    draw_circle(draw, cx, cy, r, fill=hex_to_rgb(STAMP_FILLED))
    # Draw simple star points
    points = []
    for i in range(5):
        angle = math.radians(-90 + i * 72)
        ox = cx + int(r * 1.1 * math.cos(angle))
        oy = cy + int(r * 1.1 * math.sin(angle))
        points.append((ox, oy))
        angle2 = math.radians(-90 + i * 72 + 36)
        ix = cx + int(r * 0.5 * math.cos(angle2))
        iy = cy + int(r * 0.5 * math.sin(angle2))
        points.append((ix, iy))
    draw.polygon(points, fill=hex_to_rgb(STAMP_FILLED))
    # Eyes
    eye_y = cy - size * 0.05
    eye_gap = size * 0.12
    eye_r = max(2, size * 0.06)
    draw_circle(draw, int(cx - eye_gap), int(eye_y), int(eye_r), fill=(51, 51, 51))
    draw_circle(draw, int(cx + eye_gap), int(eye_y), int(eye_r), fill=(51, 51, 51))
    # Cheeks
    cheek_y = cy + size * 0.08
    cheek_gap = size * 0.22
    cheek_r = max(2, size * 0.07)
    draw_circle(draw, int(cx - cheek_gap), int(cheek_y), int(cheek_r), fill=hex_to_rgba("#FF9999", 128))
    draw_circle(draw, int(cx + cheek_gap), int(cheek_y), int(cheek_r), fill=hex_to_rgba("#FF9999", 128))
    # Mouth
    mouth_y = int(cy + size * 0.12)
    mouth_w = max(2, int(size * 0.1))
    draw.arc([cx - mouth_w, mouth_y - mouth_w // 2, cx + mouth_w, mouth_y + mouth_w],
             start=0, end=180, fill=(51, 51, 51), width=max(1, size // 20))

def draw_stamp_slot(draw, cx, cy, cell_size, filled=False):
    """Draw a single stamp slot (empty with dashed border, or filled with star)."""
    r = cell_size // 2
    if filled:
        # Filled: gold circle with star
        draw_circle(draw, cx, cy, r, fill=hex_to_rgb("#F0F9FF"))
        draw_circle(draw, cx, cy, r, outline=hex_to_rgb(STAMP_EMPTY), fill=None)
        # Draw star emoji-like shape
        star_r = int(cell_size * 0.35)
        points = []
        for i in range(5):
            angle = math.radians(-90 + i * 72)
            ox = cx + int(star_r * math.cos(angle))
            oy = cy + int(star_r * math.sin(angle))
            points.append((ox, oy))
            angle2 = math.radians(-90 + i * 72 + 36)
            ix = cx + int(star_r * 0.45 * math.cos(angle2))
            iy = cy + int(star_r * 0.45 * math.sin(angle2))
            points.append((ix, iy))
        draw.polygon(points, fill=hex_to_rgb(STAMP_FILLED))
        # Shine
        draw_circle(draw, cx - star_r // 3, cy - star_r // 3, max(1, star_r // 6), fill=(255, 255, 255, 180))
    else:
        # Empty: dashed circle
        draw_circle(draw, cx, cy, r, fill=hex_to_rgb("#F0F9FF"))
        # Dashed border
        for angle_deg in range(0, 360, 15):
            a1 = math.radians(angle_deg)
            a2 = math.radians(angle_deg + 8)
            x1 = cx + r * math.cos(a1)
            y1 = cy + r * math.sin(a1)
            x2 = cx + r * math.cos(a2)
            y2 = cy + r * math.sin(a2)
            draw.line([(x1, y1), (x2, y2)], fill=hex_to_rgb(STAMP_EMPTY), width=2)

def draw_button(img, draw, box, text, gradient_colors, text_size=22):
    """Draw a rounded gradient button with text."""
    x0, y0, x1, y1 = box
    radius = (y1 - y0) // 2
    # Gradient fill
    gradient_rect(img, box, hex_to_rgb(gradient_colors[0]), hex_to_rgb(gradient_colors[1]))
    # Round the corners by masking
    mask = Image.new("L", img.size, 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.rounded_rectangle(box, radius=radius, fill=255)
    # Apply mask
    bg = img.copy()
    flat = Image.new("RGBA", img.size, (0, 0, 0, 0))
    flat.paste(img, mask=mask)
    # Glow overlay
    glow = Image.new("RGBA", img.size, (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    glow_draw.rounded_rectangle(box, radius=radius, fill=(255, 255, 255, 48))
    flat = Image.alpha_composite(flat, glow)
    # Composite back
    bg.paste(flat, mask=mask)
    img.paste(bg)
    # Text
    f = font(text_size)
    draw = ImageDraw.Draw(img)
    bbox = f.getbbox(text)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    tx = (x0 + x1 - tw) // 2
    ty = (y0 + y1 - th) // 2 - bbox[1]
    # Shadow
    draw.text((tx + 1, ty + 1), text, fill=(0, 0, 0, 48), font=f)
    draw.text((tx, ty), text, fill=(255, 255, 255), font=f)

def draw_header(draw, star_count, show_settings=True):
    """Draw the header bar with star count and settings."""
    y = 60
    # Star count (left)
    f_icon = font(20)
    f_count = font(18)
    draw.text((30, y), "⭐", font=f_icon, fill=(0, 0, 0))
    draw.text((55, y + 2), str(star_count), font=f_count, fill=hex_to_rgb(TEXT_DARK))
    # Settings (right)
    if show_settings:
        f_settings = font(14)
        draw.text((W - 120, y), "⚙️", font=f_icon, fill=(0, 0, 0))
        draw.text((W - 95, y + 4), "せってい", font=f_settings, fill=hex_to_rgb(TEXT_LIGHT))

def make_base_bg():
    """Create base image with sky gradient background."""
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gradient_rect(img, (0, 0, W, H), hex_to_rgb(BG_TOP), hex_to_rgb(BG_BOTTOM))
    draw = ImageDraw.Draw(img)
    # Clouds
    draw_cloud(draw, W - 130, 50, scale=0.9)
    draw_cloud(draw, -20, H - 200, scale=0.7)
    return img

def draw_main_card(img, draw, stamps, total_goal=12):
    """Draw the main stamp card with stamps grid."""
    card_w = int(W * 0.85)
    card_x = (W - card_w) // 2
    card_y = 140
    card_h = 520  # Approximate
    card_r = card_w // 2

    # Card shadow
    shadow = Image.new("RGBA", img.size, (0, 0, 0, 0))
    s_draw = ImageDraw.Draw(shadow)
    s_draw.rounded_rectangle([card_x + 3, card_y + 6, card_x + card_w - 3, card_y + card_h],
                              radius=card_r, fill=(0, 0, 0, 25))
    img_temp = Image.alpha_composite(img, shadow)
    img.paste(img_temp)
    draw = ImageDraw.Draw(img)

    # Card body
    draw.rounded_rectangle([card_x, card_y, card_x + card_w, card_y + card_h],
                           radius=card_r, fill=hex_to_rgb(SURFACE))

    # Rainbow arch
    rainbow_cx = W // 2
    rainbow_cy = card_y + 60
    draw_rainbow(draw, rainbow_cx, rainbow_cy)

    # Task banner
    banner_text = "すたんぷをあつめよう"
    f_banner = font(14)
    bb = f_banner.getbbox(banner_text)
    bw = bb[2] - bb[0] + 40
    bh = bb[3] - bb[1] + 12
    banner_x = (W - bw) // 2
    banner_y = card_y + 90
    draw.rounded_rectangle([banner_x, banner_y, banner_x + bw, banner_y + bh],
                           radius=15, fill=hex_to_rgb(PINK_BG))
    draw.text((banner_x + 20, banner_y + 4), banner_text, font=f_banner, fill=hex_to_rgb(PINK_TEXT))

    # Task name
    f_task = font(20)
    task_text = "おてつだいをする"
    tb = f_task.getbbox(task_text)
    tw = tb[2] - tb[0]
    draw.text(((W - tw) // 2, banner_y + bh + 6), task_text, font=f_task, fill=hex_to_rgb(TEXT_DARK))

    # Stamp grid
    grid_cols = 4  # for goal=12
    if total_goal <= 5:
        grid_cols = 3
    elif total_goal <= 8:
        grid_cols = 4
    else:
        grid_cols = 4

    cell_size = min(60, max(44, (card_w - 60 - (grid_cols - 1) * 10) // grid_cols))
    gap = 10
    grid_w = grid_cols * cell_size + (grid_cols - 1) * gap
    grid_x = (W - grid_w) // 2
    grid_y = banner_y + bh + 50

    for i in range(total_goal):
        col = i % grid_cols
        row = i // grid_cols
        # Center last row if it has fewer items
        row_count = min(grid_cols, total_goal - row * grid_cols)
        row_w = row_count * cell_size + (row_count - 1) * gap
        row_x = (W - row_w) // 2
        cx = row_x + col * (cell_size + gap) + cell_size // 2
        cy = grid_y + row * (cell_size + gap) + cell_size // 2
        if col < row_count:
            draw_stamp_slot(draw, cx, cy, cell_size, filled=stamps[i] if i < len(stamps) else False)

    # Star character on card (left side)
    draw_star_character(draw, card_x + 35, card_y + 250, size=35)

    return card_y + card_h

def draw_remaining_banner(draw, remaining, y):
    """Draw the 'ごほうびまであとN個' banner."""
    f_text = font(16)
    f_num = font(20)
    text_before = "ごほうびまであと"
    text_after = "こ！"
    num_text = str(remaining)

    bb1 = f_text.getbbox(text_before)
    bb2 = f_num.getbbox(num_text)
    bb3 = f_text.getbbox(text_after)
    total_w = (bb1[2] - bb1[0]) + (bb2[2] - bb2[0]) + (bb3[2] - bb3[0]) + 48
    bh = 40

    bx = (W - total_w) // 2
    draw.rounded_rectangle([bx, y, bx + total_w, y + bh], radius=20,
                           fill=hex_to_rgba(SURFACE, 238))
    cur_x = bx + 24
    draw.text((cur_x, y + 8), text_before, font=f_text, fill=hex_to_rgb(TEXT_DARK))
    cur_x += bb1[2] - bb1[0]
    draw.text((cur_x, y + 5), num_text, font=f_num, fill=hex_to_rgb(RED))
    cur_x += bb2[2] - bb2[0]
    draw.text((cur_x, y + 8), text_after, font=f_text, fill=hex_to_rgb(TEXT_DARK))

def draw_puppy(draw, cx, cy, scale=1.0):
    """Draw the reward screen puppy character."""
    s = scale
    # Body
    bw, bh = int(70*s), int(50*s)
    draw.rounded_rectangle([cx - bw//2, cy + int(30*s), cx + bw//2, cy + int(30*s) + bh],
                           radius=int(20*s), fill=hex_to_rgb("#D4A574"))
    # Legs
    leg_w, leg_h = int(18*s), int(20*s)
    for dx in [-int(20*s), int(20*s)]:
        draw.rounded_rectangle([cx + dx - leg_w//2, cy + int(70*s),
                                cx + dx + leg_w//2, cy + int(70*s) + leg_h],
                               radius=int(8*s), fill=hex_to_rgb("#D4A574"))
    # Head
    hw, hh = int(100*s), int(90*s)
    draw.rounded_rectangle([cx - hw//2, cy - int(45*s), cx + hw//2, cy + int(45*s)],
                           radius=int(50*s), fill=hex_to_rgb("#D4A574"))
    # Ears
    ear_w, ear_h = int(30*s), int(40*s)
    for dx in [-int(35*s), int(35*s)]:
        ex = cx + dx
        draw.ellipse([ex - ear_w//2, cy - int(55*s), ex + ear_w//2, cy - int(55*s) + ear_h],
                     fill=hex_to_rgb("#C4956A"))
    # Eyes
    eye_r = int(11*s)
    for dx in [-int(20*s), int(20*s)]:
        draw_circle(draw, cx + dx, cy - int(5*s), eye_r, fill=(51, 51, 51))
        # Shine
        draw_circle(draw, cx + dx - int(3*s), cy - int(9*s), max(1, int(4*s)), fill=(255, 255, 255))
    # Nose
    nw, nh = int(14*s), int(10*s)
    draw.ellipse([cx - nw//2, cy + int(10*s), cx + nw//2, cy + int(10*s) + nh], fill=(51, 51, 51))
    # Tongue
    tw, th = int(16*s), int(12*s)
    draw.ellipse([cx - tw//2, cy + int(20*s), cx + tw//2, cy + int(20*s) + th],
                 fill=hex_to_rgb("#FF8FAB"))

def draw_confetti(draw, count=40):
    """Draw confetti pieces across the screen."""
    random.seed(42)  # Deterministic for reproducibility
    for _ in range(count):
        x = random.randint(0, W)
        y = random.randint(0, H - 200)
        w = random.randint(8, 14)
        h = random.randint(4, 7)
        color = hex_to_rgb(random.choice(CONFETTI))
        angle = random.randint(0, 180)
        # Simple rectangle confetti
        draw.rounded_rectangle([x, y, x + w, y + h], radius=2, fill=color)

def draw_sun_rays(img, cx, cy):
    """Draw radiating sun rays."""
    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    num_rays = 12
    ray_len = W * 1.5
    for i in range(num_rays):
        angle = math.radians(i * (360 / num_rays))
        angle2 = math.radians(i * (360 / num_rays) + 8)
        x1 = cx + ray_len * math.cos(angle)
        y1 = cy + ray_len * math.sin(angle)
        x2 = cx + ray_len * math.cos(angle2)
        y2 = cy + ray_len * math.sin(angle2)
        od.polygon([(cx, cy), (x1, y1), (x2, y2)], fill=(255, 255, 255, 38))
    return Image.alpha_composite(img, overlay)


# ══════════════════════════════════════════════════════════
# Screenshot 1: Home screen (empty)
# ══════════════════════════════════════════════════════════

def generate_screenshot_01():
    img = make_base_bg()
    draw = ImageDraw.Draw(img)

    draw_header(draw, star_count=0)

    stamps = [False] * 12
    card_bottom = draw_main_card(img, draw, stamps, total_goal=12)
    draw = ImageDraw.Draw(img)

    # Button
    btn_y = card_bottom + 20
    btn_w = 280
    btn_h = 56
    draw_button(img, draw, ((W - btn_w) // 2, btn_y, (W + btn_w) // 2, btn_y + btn_h),
                "スタンプをゲット！", [PRIMARY, PRIMARY_DARK])
    draw = ImageDraw.Draw(img)

    # Remaining banner
    draw_remaining_banner(draw, 12, btn_y + btn_h + 16)

    # Star character bottom-left
    draw_star_character(draw, 45, H - 100, size=30)

    return img


# ══════════════════════════════════════════════════════════
# Screenshot 2: Progress (7/12 stamps collected)
# ══════════════════════════════════════════════════════════

def generate_screenshot_02():
    img = make_base_bg()
    draw = ImageDraw.Draw(img)

    draw_header(draw, star_count=7)

    stamps = [True] * 7 + [False] * 5
    card_bottom = draw_main_card(img, draw, stamps, total_goal=12)
    draw = ImageDraw.Draw(img)

    # Button
    btn_y = card_bottom + 20
    btn_w = 280
    btn_h = 56
    draw_button(img, draw, ((W - btn_w) // 2, btn_y, (W + btn_w) // 2, btn_y + btn_h),
                "スタンプをゲット！", [PRIMARY, PRIMARY_DARK])
    draw = ImageDraw.Draw(img)

    # Remaining banner
    draw_remaining_banner(draw, 5, btn_y + btn_h + 16)

    # Star character bottom-left
    draw_star_character(draw, 45, H - 100, size=30)

    # Particle burst on last stamp (decorative)
    colors = ["#FFD700", "#FF6B6B", "#5BC8F5", "#7BC67E", "#FF9DD2"]
    random.seed(7)
    for i, c in enumerate(colors):
        angle = (i / 5) * math.pi * 2
        dist = 25
        px = 315 + int(math.cos(angle) * dist)
        py = 420 + int(math.sin(angle) * dist)
        draw_circle(draw, px, py, 5, fill=hex_to_rgb(c))

    return img


# ══════════════════════════════════════════════════════════
# Screenshot 3: Settings modal
# ══════════════════════════════════════════════════════════

def generate_screenshot_03():
    img = make_base_bg()
    draw = ImageDraw.Draw(img)

    draw_header(draw, star_count=7)

    stamps = [True] * 7 + [False] * 5
    card_bottom = draw_main_card(img, draw, stamps, total_goal=12)
    draw = ImageDraw.Draw(img)

    # Button (behind modal)
    btn_y = card_bottom + 20
    btn_w = 280
    btn_h = 56
    draw_button(img, draw, ((W - btn_w) // 2, btn_y, (W + btn_w) // 2, btn_y + btn_h),
                "スタンプをゲット！", [PRIMARY, PRIMARY_DARK])
    draw = ImageDraw.Draw(img)

    # Dark overlay
    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    od.rectangle([0, 0, W, H], fill=(0, 0, 0, 96))
    img = Image.alpha_composite(img, overlay)
    draw = ImageDraw.Draw(img)

    # Modal bottom sheet
    modal_y = H - 480
    modal_h = 480
    draw.rounded_rectangle([0, modal_y, W, H], radius=24, fill=hex_to_rgb(SURFACE))

    # Handle bar
    handle_w = 40
    draw.rounded_rectangle([(W - handle_w) // 2, modal_y + 12,
                            (W + handle_w) // 2, modal_y + 16],
                           radius=2, fill=hex_to_rgb("#CCCCCC"))

    # Title
    f_title = font(22)
    title = "⚙️ せってい"
    tb = f_title.getbbox(title)
    tw = tb[2] - tb[0]
    draw.text(((W - tw) // 2, modal_y + 30), title, font=f_title, fill=hex_to_rgb(TEXT_DARK))

    # Section: スタンプのかず
    f_section = font(16)
    draw.text((30, modal_y + 75), "スタンプのかず", font=f_section, fill=hex_to_rgb(TEXT_LIGHT))

    # Goal buttons grid
    goals = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
    btn_size = 52
    btn_h_g = 44
    gap = 10
    cols = 5
    grid_w = cols * btn_size + (cols - 1) * gap
    grid_x = (W - grid_w) // 2
    grid_y_start = modal_y + 110

    f_goal = font(18)
    for idx, g in enumerate(goals):
        col = idx % cols
        row = idx // cols
        bx = grid_x + col * (btn_size + gap)
        by = grid_y_start + row * (btn_h_g + gap)
        is_active = (g == 12)
        bg_color = hex_to_rgb(ORANGE) if is_active else hex_to_rgb("#F0F0F0")
        txt_color = (255, 255, 255) if is_active else hex_to_rgb("#555555")
        draw.rounded_rectangle([bx, by, bx + btn_size, by + btn_h_g], radius=12, fill=bg_color)
        gb = f_goal.getbbox(str(g))
        gw = gb[2] - gb[0]
        gh = gb[3] - gb[1]
        draw.text((bx + (btn_size - gw) // 2, by + (btn_h_g - gh) // 2 - gb[1]),
                  str(g), font=f_goal, fill=txt_color)

    # Undo button
    undo_y = grid_y_start + 2 * (btn_h_g + gap) + 20
    undo_h = 50
    draw.rounded_rectangle([24, undo_y, W - 24, undo_y + undo_h], radius=14,
                           fill=hex_to_rgb("#FFF0F0"))
    f_undo = font(16)
    undo_text = "↩️ スタンプを1こもどす"
    ub = f_undo.getbbox(undo_text)
    uw = ub[2] - ub[0]
    draw.text(((W - uw) // 2, undo_y + 14), undo_text, font=f_undo, fill=hex_to_rgb(RED))

    # Close button
    close_y = undo_y + undo_h + 16
    close_h = 50
    draw.rounded_rectangle([24, close_y, W - 24, close_y + close_h], radius=14,
                           fill=hex_to_rgb(PRIMARY))
    f_close = font(16)
    close_text = "とじる"
    cb = f_close.getbbox(close_text)
    cw = cb[2] - cb[0]
    draw.text(((W - cw) // 2, close_y + 14), close_text, font=f_close, fill=(255, 255, 255))

    return img


# ══════════════════════════════════════════════════════════
# Screenshot 4: Reward screen
# ══════════════════════════════════════════════════════════

def generate_screenshot_04():
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    # Gradient: sky blue → light yellow
    gradient_rect(img, (0, 0, W, H), hex_to_rgb(BG_TOP), hex_to_rgb("#FFE8A3"))

    # Sun rays
    img = draw_sun_rays(img, W // 2, H // 3)
    draw = ImageDraw.Draw(img)

    # Confetti
    draw_confetti(draw, count=40)

    # Title: ごほうび！
    f_title = font(64)
    title = "ごほうび！"
    tb = f_title.getbbox(title)
    tw = tb[2] - tb[0]
    tx = (W - tw) // 2
    ty = 180
    # Text shadow
    draw.text((tx + 2, ty + 2), title, font=f_title, fill=(255, 255, 255, 180))
    # Pink text
    draw.text((tx, ty), title, font=f_title, fill=hex_to_rgb(SECONDARY))

    # Sub-message
    f_sub = font(20)
    sub_text = "よくがんばったね！"
    sb = f_sub.getbbox(sub_text)
    sw = sb[2] - sb[0]
    draw.text(((W - sw) // 2, ty + 90), sub_text, font=f_sub, fill=hex_to_rgb(TEXT_DARK))

    # Puppy character
    draw_puppy(draw, W // 2, H // 2 + 20, scale=1.6)

    # Achievement text
    f_achieve = font(18)
    achieve_text = "スタンプ 12こ たっせい！"
    ab = f_achieve.getbbox(achieve_text)
    aw = ab[2] - ab[0]
    achieve_y = H // 2 + 180
    # Badge background
    badge_w = aw + 40
    badge_h = 40
    draw.rounded_rectangle([(W - badge_w) // 2, achieve_y, (W + badge_w) // 2, achieve_y + badge_h],
                           radius=20, fill=hex_to_rgba(STAMP_FILLED, 230))
    draw.text(((W - aw) // 2, achieve_y + 8), achieve_text, font=f_achieve, fill=(255, 255, 255))

    # "もどる" button
    btn_y = achieve_y + 80
    btn_w = 240
    btn_h = 56
    draw_button(img, draw, ((W - btn_w) // 2, btn_y, (W + btn_w) // 2, btn_y + btn_h),
                "🏠 もどる", [PRIMARY, ORANGE])
    draw = ImageDraw.Draw(img)

    # Sparkle decorations
    sparkle_positions = [(80, 300), (W - 80, 350), (100, 550), (W - 100, 500),
                         (60, 750), (W - 60, 700)]
    for sx, sy in sparkle_positions:
        draw_circle(draw, sx, sy, 4, fill=hex_to_rgb(STAMP_FILLED))
        draw_circle(draw, sx, sy, 2, fill=(255, 255, 255))

    return img


# ══════════════════════════════════════════════════════════
# Main
# ══════════════════════════════════════════════════════════

if __name__ == "__main__":
    out_dir = os.path.dirname(os.path.abspath(__file__))

    generators = [
        ("screenshot_01_home.png", generate_screenshot_01),
        ("screenshot_02_progress.png", generate_screenshot_02),
        ("screenshot_03_settings.png", generate_screenshot_03),
        ("screenshot_04_reward.png", generate_screenshot_04),
    ]

    for filename, gen_func in generators:
        print(f"Generating {filename}...")
        img = gen_func()
        # Convert to RGB for PNG (remove alpha for smaller files)
        img_rgb = Image.new("RGB", img.size, (255, 255, 255))
        img_rgb.paste(img, mask=img.split()[3] if img.mode == "RGBA" else None)
        path = os.path.join(out_dir, filename)
        img_rgb.save(path, "PNG", optimize=True)
        print(f"  ✓ Saved: {path}")

    print("\nAll screenshots generated successfully!")
