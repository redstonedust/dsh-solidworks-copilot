---
id: assembly
title: 装配与运动配合
useFor: 零件装配、同心/重合配合、齿轮传动、可拖动运动体
fields: ASSEMBLY_NAME, PARTS, BENCHMARK, MATES, DOF, MOTION
---
【任务类型】装配
【工作流】assembly_mates
【能力等级要求】assembly_and_mates 为 verified；Motion Study 为 pilot，须人工复核

【装配】{{ASSEMBLY_NAME}}
【零件清单】{{PARTS}}
【装配基准】{{BENCHMARK}}
【配合关系】{{MATES}}
【允许自由度】{{DOF}}
【运动要求】{{MOTION}}

【执行要求】
1) 旋转件用同心配合且不锁旋转，不得用三基准面把轴/齿轮/上盖完全锁死
2) 齿轮传动用真实 Gear Mate，不得用脚本动画冒充机械配合
3) 创建后遍历特征树，确认 MateGroup 下存在 MateConcentric / MateGearDim 等真实 Mate 特征

【交付物】.sldasm、STEP、配合证据 JSON、BOM CSV、四视图 PNG、*_review_report.json

【验收】在 SolidWorks 中能拖动且自由度符合要求；Mate 特征真实存在；BOM 数量与实例数一致；review_report 为 passed

【禁止】不得把动画演示当作交互自由度；不得用固定配合掩盖缺失的约束；不得凭记忆猜 Mate API 参数
