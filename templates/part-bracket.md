---
id: part-bracket
title: 安装板 / 支架
useFor: 板类结构件、连接块、支撑件、垫板
fields: PART_NAME, SIZE, THICKNESS, MATERIAL, HOLE_D, HOLE_PITCH, CORNER_R, EDGE_R, CHAMFER
---
【任务类型】零件
【工作流】mounting_bracket
【能力等级要求】只允许 verified；pilot 能力须显式说明并标注 review_required

【零件】{{PART_NAME}}
【材料与工艺】{{MATERIAL}}，去毛刺要求，工艺 CNC 三轴，表面处理按需
【主尺寸】外形 {{SIZE}}，板厚 {{THICKNESS}}，长度/宽度公差 ±0.05
【基准】底面 A + 左侧面 B + 后侧面 C

【特征清单（按创建顺序）】
1) 基础体：拉伸 {{SIZE}}，四角 {{CORNER_R}} 圆角
2) 外轮廓：所有竖直边 {{EDGE_R}} 圆角，顶面棱边 {{CHAMFER}} 倒角
3) 孔：φ{{HOLE_D}} 通孔 ×4，孔心距 {{HOLE_PITCH}}，相对基准中心对称，孔口 {{CHAMFER}} 倒角

【交付物】.sldprt、STEP AP214、iso/front/top/right 四视图 PNG、*_review_report.json

【验收】草图完全定义；回读特征树确认圆角/倒角/孔真实存在；四视图目视无缺件/悬空/重叠；review_report 的 evaluation.status 为 passed

【禁止】不得用 Face1/Edge1 或屏幕坐标硬编码；不得跳过"基础体 → 圆角倒角 → 孔槽 → 孔口倒角"顺序；不得用批量 Fix 代替设计参数
