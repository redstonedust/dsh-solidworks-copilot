// 由 scripts/import-content.mjs 从调研 JSON 生成；手改会被下一次合并覆盖。

/** 交付门禁（8 个）。 */
export const gates = [
  {
    "id": "part-delivery",
    "name": "零件交付门禁",
    "capability": "part_and_features",
    "items": [
      "SLDPRT 落盘并重开成功，ForceRebuild3(False) 无重建错误。",
      "特征树包含预期 Extrude/Revolve/Cut 特征，无缺失或被压缩的关键特征。",
      "collect_bounding_box 回读外形尺寸与任务给定值一致（容差 ≤0.05 mm）。",
      "草图约束状态与命名尺寸可改，改后关键尺寸回读一致。",
      "review_report.json 的 evaluation.status 为 pass 或已解释的 warn。"
    ],
    "evidence": [
      "sldprt",
      "step",
      "preview",
      "review_report",
      "geometry_measurements"
    ],
    "blocked_when": [
      "特征创建返回 None 或重建失败。",
      "外形/关键尺寸超容差且无书面说明。",
      "review 报告 evaluation.status=fail。",
      "只有文字总结，没有机器可读 cad_spec JSON 证据。"
    ],
    "workflows": [
      "mounting_bracket",
      "enclosure",
      "modify_existing_part",
      "parallel_gripper_assembly"
    ]
  },
  {
    "id": "holes-delivery",
    "name": "孔槽螺纹交付门禁",
    "capability": "holes_and_finishing",
    "items": [
      "每个孔槽给出孔型、规格、数量、基准边定位、中心距、深度或贯穿状态。",
      "collect_geometry_measurements 的 hole_groups/compound_holes/slot_arc_candidates 与设计一致。",
      "validate_hole_positions 返回 pass（位置 ≤0.1 mm、孔径 ≤0.05 mm）。",
      "盲孔、沉孔深度与沉头角度用特征参数回读或剖视图交叉复核。",
      "螺纹孔具备真实 Thread/CosmeticThread 特征，孔口倒角存在。"
    ],
    "evidence": [
      "sldprt",
      "geometry_evidence",
      "section_view_preview",
      "parameters_json",
      "review_report"
    ],
    "blocked_when": [
      "只有创建参数证据，没有 B-Rep 回读。",
      "槽端圆弧被计入圆孔数量。",
      "盲孔/沉头深度无法回读且无剖视证据。",
      "螺纹表达为 metadata-only 或孔口无倒角。"
    ],
    "workflows": [
      "mounting_bracket",
      "enclosure",
      "holes_slots_threads"
    ]
  },
  {
    "id": "assembly-delivery",
    "name": "装配交付门禁",
    "capability": "assembly_and_mates",
    "items": [
      "MateGroup 下存在真实 Mate 特征（MateConcentric/MateGearDim/MateDistance 等）。",
      "inspect_component_dofs 的自由度与任务要求一致。",
      "旋转件同心 Mate 的 lock_rotation=false，未被三基准面或 Fix 锁死。",
      "inspect_interference 返回 status=pass。",
      "SLDASM 关闭重开后仍可在 SolidWorks 中拖动。"
    ],
    "evidence": [
      "sldasm",
      "mate_evidence",
      "dof_report",
      "preview",
      "review_report"
    ],
    "blocked_when": [
      "只有预览动画或脚本驱动的位姿变化，没有真实 Mate。",
      "组件固定或过约束导致无法拖动。",
      "干涉结果为未知（status=blocked 或 count=None）。"
    ],
    "workflows": [
      "assembly_mates",
      "parallel_gripper_assembly"
    ]
  },
  {
    "id": "motion-delivery",
    "name": "运动算例门禁",
    "capability": "motion_study",
    "items": [
      "validate_motion_studies 返回 validation.status=pass。",
      "results_out_of_date 明确为 False，GetResults() 非空。",
      "算例时长、马达数量达到任务要求，算例类型与任务一致。",
      "swmotionstudy.tlb 已加载并记录。"
    ],
    "evidence": [
      "sldasm",
      "motion_summary",
      "review_report"
    ],
    "blocked_when": [
      "只看到时间轴、马达图标或 Calculate=True。",
      "结果过期或无法读取。",
      "Motion 加载项或许可证缺失却声称完成分析。"
    ],
    "workflows": []
  },
  {
    "id": "drawing-delivery",
    "name": "工程图交付门禁",
    "capability": "drawings_and_bom",
    "items": [
      "DrawingSpec v1 通过 schema 校验，standard=GB_T 配 projection=first_angle。",
      "回读真实视图数与真实 DisplayDimension 数，模板候选不计入。",
      "图框、标题栏、尺寸链、孔表与 BOM 完成人工目视复核。",
      "PDF 落盘，inspect_pdf_dimension_rendering 的尺寸文字框关联完整。",
      "无压孔、压中心线、跨视图长引线或侵入标题栏。"
    ],
    "evidence": [
      "slddrw",
      "pdf",
      "bmp_preview",
      "dimension_evidence",
      "review_report"
    ],
    "blocked_when": [
      "只有估算文字边界却宣称无碰撞。",
      "孔、槽、接口缺规格、数量或定位尺寸。",
      "视图重叠、标题栏侵入未返工。",
      "钣金工程图缺少可靠展开证据。"
    ],
    "workflows": [
      "engineering_drawing",
      "properties_bom"
    ]
  },
  {
    "id": "export-delivery",
    "name": "导出交付门禁",
    "capability": "export_delivery",
    "items": [
      "每个输出记录 success、字节数、produced_this_run 与 SHA-256。",
      "导出前激活源文档并回读 ActiveDoc.GetPathName() 与目标一致。",
      "同名冲突被阻止，未静默覆盖既有文件。",
      "STEP/STL/PDF 可用目标 CAD 原生打开复核。",
      "交付清单与哈希台账齐备，Pack and Go 依赖审计通过。"
    ],
    "evidence": [
      "step",
      "stl",
      "pdf",
      "delivery_manifest",
      "hash_ledger"
    ],
    "blocked_when": [
      "文件存在但大小为 0，或本轮未真实产生。",
      "装配体组件被误导出为目标零件。",
      "用改扩展名或空文件伪造格式支持。",
      "Pack and Go 落盘缺依赖却标记成功。"
    ],
    "workflows": [
      "mounting_bracket",
      "enclosure",
      "batch_export",
      "parallel_gripper_assembly",
      "autocad_cleanup_delivery"
    ]
  },
  {
    "id": "dfm-review",
    "name": "DFM / 设计规则门禁",
    "capability": "dfm_checks",
    "items": [
      "check-dfm status 不为 blocked，材料、壁厚、K 因子、割缝、成型空间等关键输入齐全。",
      "供应商 profile 与 --brep-evidence 已绑定，缺证据不放行。",
      "check-drc 报告保留 reviewRequired=true，fail 项逐条给出规则与阈值。",
      "规则通过后仍完成材料、公差、载荷、供应商能力的人工确认。"
    ],
    "evidence": [
      "dfm_report",
      "drc_report",
      "brep_evidence",
      "review_report"
    ],
    "blocked_when": [
      "缺少材料、壁厚、K 因子等关键输入。",
      "B-Rep 证据缺失或伪造。",
      "把 DFM/DRC 结论当作制造认证或安全认证。"
    ],
    "workflows": []
  },
  {
    "id": "capability-gate",
    "name": "能力等级门禁",
    "capability": "capabilities.yaml",
    "items": [
      "执行前运行 sw_capability_probe.py --output capability_report.json，区分 type_library_present、implementation_status、ready_for_unattended_use。",
      "所用能力在 capabilities.yaml 中级别为 verified/pilot/reference_only/not_implemented 之一并记录。",
      "reference_only 与 not_implemented 不得用于无人值守交付。",
      "pilot 能力必须带人工复核记录与 review_required 标记。"
    ],
    "evidence": [
      "capability_report",
      "review_report"
    ],
    "blocked_when": [
      "缺少能力探测报告。",
      "把 reference_only 或 not_implemented 能力声明为已完成。",
      "把类型库存在当作许可证可用或自动化已验证。"
    ],
    "workflows": []
  }
];
