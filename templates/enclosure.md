---
id: enclosure
title: 设备外壳 / 壳体
useFor: 电子外壳、控制器盒、打印件外壳、钣金箱体
fields: PART_NAME, ENVELOPE, WALL, MATERIAL, PROCESS, PORT_SIZE, PORT_COUNT, BOSS
---
【任务类型】零件
【工作流】enclosure
【能力等级要求】只允许 verified；pilot 能力须显式说明并标注 review_required

【零件】{{PART_NAME}}
【材料与工艺】{{MATERIAL}}，工艺 {{PROCESS}}，去毛刺要求
【包络尺寸】{{ENVELOPE}}
【壁厚】{{WALL}}（四周与底部一致），拔模角按工艺要求
【接口开孔】{{PORT_SIZE}} ×{{PORT_COUNT}}，定位尺寸必须给全（相对基准的三向距离）
【螺丝柱】{{BOSS}}，含柱高、内孔规格、加强筋

【特征清单（按创建顺序）】
1) 基础体：抽壳，壁厚 {{WALL}}
2) 外轮廓圆角，R 值与壁厚关系写明
3) 接口开孔与螺丝柱
4) 孔口倒角，去锐边

【交付物】.sldprt、STEP、STL、四视图 PNG、*_review_report.json

【验收】壁厚实测与要求一致；所有开口有定位尺寸；无零厚度/自交面；review_report 为 passed

【禁止】不得用"示意图"充当可制造模型；不得用长引线替代开孔定位尺寸；孔位不得凭几何猜定
