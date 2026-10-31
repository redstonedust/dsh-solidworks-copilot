---
id: engineering-drawing
title: GB/T 工程图
useFor: 零件图、装配图、BOM、孔表、出图交付
fields: DRAWING_NO, PART_NAME, SHEET, SCALE, VIEWS, TOLERANCE, MATERIAL, QTY
---
【任务类型】工程图
【工作流】engineering_drawing
【能力等级要求】drawings_and_bom 为 pilot，须人工复核并标注 review_required

【图号】{{DRAWING_NO}}　【零件】{{PART_NAME}}　【材料】{{MATERIAL}}　【数量】{{QTY}}
【图幅】{{SHEET}}，【比例】{{SCALE}}，标准 GB/T，单位 mm
【字体】仿宋；线型分层：粗实线/细实线/中心线/虚线/双点画线
【视图】{{VIEWS}}

【标注要求】
1) 尺寸链完整：外形、孔位、孔心距、槽宽与槽长，全部标注
2) 公差：{{TOLERANCE}}；未注公差按 GB/T 1804-m
3) 粗糙度：配合面与基准面单独标注
4) 孔槽 ≥6 个同类时必须出孔表，写清部位/规格/数量/定位
5) 中心线必须画；不得跨视图引长线替代尺寸链

【技术要求（写在标题栏上方）】
1) 未注圆角 R2
2) 未注公差按 GB/T 1804-m
3) 去毛刺、倒钝

【交付物】.slddrw、PDF、四视图 PNG、*_review_report.json

【验收】无压线/压字/压中心线；无跨视图长引线替代尺寸；标题栏完整（图号、材料、数量、重量、比例）；PDF 回读尺寸文字与模型实测一致

【禁止】不得输出"看得懂的示意图"充当可制造图纸；不得省略孔槽定位尺寸；不得侵入标题栏
