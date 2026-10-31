#!/usr/bin/env python3
"""生成 README 用的示意图（非真实截图，界面示意）。

用法：python scripts/make-readme-images.py
输出：docs/images/{flow,panel,dock,cli}.png
"""

from __future__ import annotations

import os
from PIL import Image, ImageDraw, ImageFont

S = 2  # 放大倍数，输出更清晰
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "docs", "images")

BG = "#141518"
PANEL = "#1c1e23"
PANEL_2 = "#23262c"
BORDER = "#33363d"
TEXT = "#e9ebef"
MUTED = "#9aa1ab"
DIM = "#6f7681"
ACCENT = "#4b8bf5"
GREEN = "#3fb27f"

MSYH = "C:/Windows/Fonts/msyh.ttc"
MSYH_BOLD = "C:/Windows/Fonts/msyhbd.ttc"
CONSOLA = "C:/Windows/Fonts/consola.ttf"


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    path = MSYH_BOLD if bold else MSYH
    return ImageFont.truetype(path, size * S)


def mono(size: int) -> ImageFont.FreeTypeFont:
    try:
        return ImageFont.truetype(CONSOLA, size * S)
    except OSError:
        return ImageFont.truetype(MSYH, size * S)


def canvas(w: int, h: int, color: str = BG) -> Image.Image:
    return Image.new("RGB", (w * S, h * S), color)


def rounded(draw: ImageDraw.ImageDraw, box, radius: int, fill=None, outline=None, width: int = 1):
    x0, y0, x1, y1 = [v * S for v in box]
    draw.rounded_rectangle((x0, y0, x1, y1), radius=radius * S, fill=fill, outline=outline, width=width * S)


def text(draw, xy, content, size=14, color=TEXT, bold=False, anchor="la", f=None):
    x, y = xy[0] * S, xy[1] * S
    draw.text((x, y), content, font=f or font(size, bold), fill=color, anchor=anchor)


def pill(draw, box, label, size=12, active=False):
    fill = PANEL_2 if active else None
    outline = ACCENT if active else BORDER
    rounded(draw, box, (box[3] - box[1]) // 2, fill=fill, outline=outline)
    text(
        draw,
        ((box[0] + box[2]) / 2, (box[1] + box[3]) / 2),
        label,
        size=size,
        color=(TEXT if active else MUTED),
        anchor="mm",
    )


def button(draw, box, label, primary=False, size=13):
    rounded(draw, box, (box[3] - box[1]) // 2, fill=(ACCENT if primary else PANEL_2), outline=(ACCENT if primary else BORDER))
    text(
        draw,
        ((box[0] + box[2]) / 2, (box[1] + box[3]) / 2),
        label,
        size=size,
        color=("#ffffff" if primary else TEXT),
        bold=primary,
        anchor="mm",
    )


# ─────────────────────────── 1. 三步流程 ───────────────────────────
def make_flow():
    W, H = 1000, 300
    img = canvas(W, H)
    d = ImageDraw.Draw(img)
    steps = [
        ("1", "挑一个模板", "16 个里选最像的，\n拿不准就选第一个"),
        ("2", "填几个数字", "尺寸、板厚、孔径，\n不知道的可以留空"),
        ("3", "复制去对话", "点一下就复制，\n粘给 AI 就能开工"),
    ]
    card_w, gap, left = 272, 52, 40
    for i, (num, title, desc) in enumerate(steps):
        x0 = left + i * (card_w + gap)
        rounded(d, (x0, 46, x0 + card_w, 236), 16, fill=PANEL, outline=BORDER)
        d.ellipse((x0 * S + 22 * S, 66 * S, x0 * S + 66 * S, 110 * S), fill=ACCENT)
        text(d, (x0 + 44, 88), num, size=18, color="#ffffff", bold=True, anchor="mm")
        text(d, (x0 + 24, 126), title, size=18, bold=True)
        text(d, (x0 + 24, 164), desc, size=13, color=MUTED)
        if i < 2:
            ax = x0 + card_w + 12
            d.line((ax * S, 141 * S, (ax + 26) * S, 141 * S), fill=DIM, width=2 * S)
            d.polygon(
                [((ax + 26) * S, 141 * S), ((ax + 18) * S, 135 * S), ((ax + 18) * S, 147 * S)],
                fill=DIM,
            )
    text(d, (W / 2, 268), "全程 4 次点击 · 不需要懂 CAD API", size=13, color=DIM, anchor="mm")
    img.save(os.path.join(OUT, "flow.png"))
    return img


# ─────────────────────────── 2. 侧边栏面板 ───────────────────────────
def make_panel():
    W, H = 1000, 620
    img = canvas(W, H)
    d = ImageDraw.Draw(img)
    rounded(d, (20, 18, W - 20, H - 18), 16, fill=PANEL, outline=BORDER)

    text(d, (44, 40), "SolidWorks 副驾", size=20, bold=True)
    text(d, (44, 72), "把「你要做什么」写成 AI 能照着做的说明书", size=12, color=MUTED)
    tabs = ["选模板", "一句话生成", "先想清楚", "避坑指南", "做完检查", "专家模式"]
    x = 44
    for i, label in enumerate(tabs):
        w = 26 + len(label) * 13
        pill(d, (x, 100, x + w, 128), label, active=(i == 0))
        x += w + 10
    d.line((44 * S, 146 * S, (W - 44) * S, 146 * S), fill=BORDER, width=1 * S)

    rounded(d, (44, 166, 424, 190), 8, fill=PANEL_2, outline=BORDER)
    text(d, (58, 178), "搜一下，比如：安装板、齿轮、沉孔", size=11, color=DIM, anchor="lm")
    cards = [
        ("安装板 / 支架", "120×80×10，四角 Ø7 通孔，出 STEP", "简单 · 零件"),
        ("阶梯轴 / 回转件", "Ø56/Ø65 两段轴，含键槽与轴端倒角", "中等 · 零件"),
        ("端盖 / 法兰盘", "Ø120 法兰，6 组 Ø9/Ø15 沉孔", "中等 · 孔和槽"),
        ("标准直齿齿轮", "m2、z24、20°，齿宽 10，轴孔 Ø10", "高级 · 齿轮"),
    ]
    y = 204
    for i, (name, desc, meta) in enumerate(cards):
        rounded(d, (44, y, 424, y + 84), 10, fill=(PANEL_2 if i == 0 else None), outline=(ACCENT if i == 0 else BORDER))
        text(d, (60, y + 16), name, size=13, bold=True)
        text(d, (60, y + 40), desc, size=11, color=MUTED)
        text(d, (60, y + 62), meta, size=11, color=DIM)
        y += 94

    rounded(d, (444, 166, W - 44, H - 40), 12, fill=PANEL_2, outline=BORDER)
    text(d, (466, 188), "安装板 / 支架", size=17, bold=True)
    text(d, (466, 218), "要填的数字", size=12, color=MUTED)
    fields = [
        ("外形尺寸 L×W×T (mm)", "120×80×10"),
        ("安装孔直径 (mm)", "7"),
        ("孔中心坐标 (mm)", "(-48,-28) (-48,28) (48,-28) (48,28)"),
    ]
    fy = 240
    for label, value in fields:
        text(d, (466, fy), label, size=11, color=MUTED)
        rounded(d, (466, fy + 16, W - 66, fy + 46), 8, fill="#1a1c20", outline=BORDER)
        text(d, (478, fy + 31), value, size=12, color=TEXT, anchor="lm")
        fy += 62
    button(d, (466, 436, 626, 468), "生成提示词", primary=True)
    button(d, (638, 436, 800, 468), "一键生成并复制", primary=False, size=12)
    button(d, (812, 436, 940, 468), "复制", primary=False, size=12)

    rounded(d, (466, 486, W - 66, H - 40), 8, fill="#1a1c20", outline=BORDER)
    text(d, (478, 494), "生成结果（可以直接改）", size=11, color=DIM)
    text(d, (478, 514), "【任务类型】零件", size=12)
    text(d, (478, 536), "【工作流】mounting_bracket", size=12)
    text(d, (478, 558), "【主尺寸】外形 120×80×10，板厚 10 …", size=12, color=MUTED)
    img.save(os.path.join(OUT, "panel.png"))
    return img


# ─────────────────────────── 3. 输入框小卡 ───────────────────────────
def make_dock():
    W, H = 1000, 140
    img = canvas(W, H)
    d = ImageDraw.Draw(img)
    rounded(d, (20, 30, W - 20, 110), 12, fill=PANEL, outline=BORDER)
    d.rectangle((44 * S, 60 * S, 56 * S, 72 * S), fill=ACCENT)
    text(d, (70, 66), "SolidWorks 副驾", size=14, bold=True, anchor="lm")
    text(d, (210, 67), "说人话就能用", size=11, color=MUTED, anchor="lm")
    x = 640
    for label in ["选模板", "一句话生成", "避坑指南"]:
        w = 24 + len(label) * 12
        pill(d, (x, 52, x + w, 82), label)
        x += w + 10
    button(d, (870, 50, 968, 84), "打开助手", primary=False, size=12)
    text(d, (W / 2, 122), "收起来只有一行，点一下展开", size=11, color=DIM, anchor="mm")
    img.save(os.path.join(OUT, "dock.png"))
    return img


# ─────────────────────────── 4. 终端速览 ───────────────────────────
def make_cli():
    W, H = 1000, 320
    img = canvas(W, H)
    d = ImageDraw.Draw(img)
    rounded(d, (20, 20, W - 20, H - 20), 14, fill="#101114", outline=BORDER)
    for i, color in enumerate(["#ff5f57", "#febc2e", "#28c840"]):
        d.ellipse(((40 + i * 22) * S, 38 * S, (52 + i * 22) * S, 50 * S), fill=color)
    text(d, (120, 44), "swas.mjs", size=11, color=DIM, anchor="lm")

    lines = [
        ("$ node bin/swas.mjs templates", TEXT, mono(12)),
        ("part-bracket    安装板 / 支架     字段: PART_NAME, SIZE, THICKNESS …", MUTED, font(12)),
        ("holes-threads   孔槽与螺纹        字段: THREAD, PITCH, PILOT_D …", MUTED, font(12)),
        ("", TEXT, font(12)),
        ("$ node bin/swas.mjs prompt --template part-bracket --set SIZE=120x80x10", TEXT, mono(11)),
        ("【任务类型】零件   【工作流】mounting_bracket", TEXT, font(12)),
        ("【主尺寸】外形 120x80x10，板厚 {{THICKNESS}} …", MUTED, font(12)),
        ("未填字段: THICKNESS, HOLE_D, HOLE_PITCH", "#f0a04b", font(12)),
        ("", TEXT, font(12)),
        ("$ node bin/swas.mjs install --target codex --dry-run", TEXT, mono(12)),
        ("[codex] skip-exists: 目标目录已存在（不覆盖）", GREEN, font(12)),
    ]
    y = 76
    for content, color, f in lines:
        if content:
            text(d, (44, y), content, size=12, color=color, f=f)
        y += 20
    img.save(os.path.join(OUT, "cli.png"))
    return img


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    for maker in (make_flow, make_panel, make_dock, make_cli):
        image = maker()
        print(f"{maker.__name__:10s} {image.size[0]}x{image.size[1]}")
