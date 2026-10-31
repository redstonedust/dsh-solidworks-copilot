---
id: holes-threads
title: 孔槽与螺纹
useFor: 螺丝孔、螺纹孔、攻丝底孔、沉孔、腰形槽、孔阵列
fields: PART_NAME, MATERIAL, THREAD, PITCH, PILOT_D, DEPTH, QTY, POSITION, C_BORE
---
【任务类型】零件特征（在已有零件或新建基础体上）
【工作流】holes_slots_threads
【能力等级要求】只允许 verified

【零件】{{PART_NAME}}
【材料】{{MATERIAL}}
【螺纹规格】{{THREAD}} ×{{PITCH}}，类型 Metric Tap 真实螺纹（不用装饰螺纹冒充）
【底孔】φ{{PILOT_D}}，深度 {{DEPTH}}，通孔/盲孔写明
【数量】{{QTY}}
【定位】{{POSITION}}（相对基准的三向坐标或孔心距，必须给全）
【沉孔/沉头】{{C_BORE}}
【孔口】C1 倒角，去毛刺

【特征清单（按创建顺序）】
1) 校核参数与孔位（规格、数量、基准、中心距、深度）
2) 攻丝底孔
3) Metric Tap 真实螺纹；无法生成时降级 CosmeticThread 并留下证据螺旋线
4) 孔口倒角
5) 重建后读取特征证据（底孔直径、螺纹规格、孔心坐标）

【交付物】.sldprt、孔位证据 JSON、剖视图 PNG、*_review_report.json

【验收】孔心坐标与要求逐项对齐；螺纹规格回读一致；剖视图确认深度与是否贯穿；review_report 为 passed

【禁止】不得用外观螺纹代替真实螺纹；不得只给孔规格不给定位；孔数 ≥6 的同类孔必须出孔表
