// 由 scripts/import-content.mjs 从调研 JSON 生成；手改会被下一次合并覆盖。

/** 模板预设（16 个）。 */
export const templates = [
  {
    "id": "mounting-bracket",
    "name": "安装板 / 支架",
    "category": "part",
    "summary": "生成 120×80×10、四角 Ø7 通孔的铝制安装板，输出 SLDPRT/STEP/四视图预览与审查报告。",
    "difficulty": "basic",
    "workflow": "mounting_bracket",
    "capabilities": [
      "part_and_features",
      "holes_and_finishing",
      "export_delivery"
    ],
    "entry": "scripts/sw_part.py + scripts/sw_hole_features.py",
    "references": [
      "references/part-modeling.md",
      "references/complex-hole-features.md",
      "references/review.md"
    ],
    "params": [
      {
        "key": "size",
        "label": "外形尺寸 L×W×T (mm)",
        "example": "120×80×10",
        "required": true
      },
      {
        "key": "hole_diameter",
        "label": "安装孔直径 (mm)",
        "example": "7",
        "required": true
      },
      {
        "key": "hole_centers",
        "label": "孔中心坐标 (mm)",
        "example": "(-48,-28)(-48,28)(48,-28)(48,28)",
        "required": true
      },
      {
        "key": "material",
        "label": "材料",
        "example": "6061-T6",
        "required": false
      },
      {
        "key": "edge_fillet",
        "label": "四角圆角 R (mm)",
        "example": "6",
        "required": false
      }
    ],
    "steps": [
      "运行 python scripts/sw_preflight.py 自检；用 SolidWorksSession(version=2026).new_part() 新建零件，sketch_rectangle + extrude_boss(mm(10)) 拉伸出 120×80 板体。",
      "按 references/complex-hole-features.md 用 sw_hole_features.create_hole_pattern 在基准面局部坐标 (±48, ±28) 创建 4 个 Ø7 通孔，再用 sw_part.chamfer 给孔口 C0.5 倒角。",
      "sw_sketch_quality.fully_define_sketch 与 inspect_model_sketches 回读约束状态，sw_measure.collect_mass_properties 记录体积/质量。",
      "session.save 保存 .sldprt，sw_export.export_to_step 导出 STEP，sw_review.run_review 输出 isometric/front/top/right 与 *_review_report.json。"
    ],
    "checks": [
      "collect_geometry_measurements 回读 4 个 Ø7 圆柱面，validate_hole_positions（位置容差 0.1 mm、孔径容差 0.05 mm）返回 status=pass。",
      "collect_bounding_box 回读 120×80×10 mm（容差 0.01 mm），体积与 golden-workflows 验收值偏差 ≤0.05 mm³。",
      "SLDPRT 与 STEP 落盘且字节数 >0，review 报告 evaluation.status 为 pass 或 warn，expected_outputs_exist=true。"
    ],
    "risks": [
      "孔位证据必须来自 B-Rep 圆柱面与孔轴线，不能只用创建参数。",
      "圆角/倒角选边依赖几何筛选，失败时降级为直边并在交付摘要标注。",
      "材料仅写入自定义属性，未做强度与表面处理校核。"
    ],
    "keywords": [
      "零件",
      "建模",
      "model",
      "part",
      "安装板 / 支架",
      "mounting_bracket"
    ]
  },
  {
    "id": "stepped-shaft",
    "name": "阶梯轴 / 回转件",
    "category": "part",
    "summary": "按轴段参数表用半剖轮廓旋转生成 Ø56/Ø65 两段阶梯轴，可加键槽与轴端倒角。",
    "difficulty": "standard",
    "workflow": "sw_part.py::revolve_boss",
    "capabilities": [
      "part_and_features",
      "holes_and_finishing"
    ],
    "entry": "scripts/sw_part.py",
    "references": [
      "references/part-modeling.md"
    ],
    "params": [
      {
        "key": "segments",
        "label": "轴段表 start-end:Ø (mm)",
        "example": "0-43:Ø56；43-113:Ø65",
        "required": true
      },
      {
        "key": "keyway",
        "label": "键槽 宽×深×长 (mm)",
        "example": "14×5.5×40",
        "required": false
      },
      {
        "key": "end_chamfer",
        "label": "轴端倒角",
        "example": "2×45°",
        "required": false
      },
      {
        "key": "material",
        "label": "材料与热处理",
        "example": "45 钢调质 HB220",
        "required": false
      }
    ],
    "steps": [
      "在 Front Plane 用 CreateCenterLine 画旋转轴，按 segments 半径逐段生成闭合半剖轮廓（references/part-modeling.md 的阶梯轴最小模式）。",
      "调用 FeatureRevolve2(...True, 2*pi...) 生成回转主体，返回 None 立即停止，不逐段拉伸再合并。",
      "需要键槽时按“圆柱表面长圆槽”做法：InsertRefPlane 建切向偏置面 + sketch_slot + extrude_cut 盲切，避免在中心基准面把轴剖开。",
      "sw_part.chamfer 做轴端倒角，session.save 保存 .sldprt，run_review 导出四视图并检查轴肩与总长。"
    ],
    "checks": [
      "collect_bounding_box 回读总长 113 mm、最大外径 65 mm，容差 0.05 mm。",
      "ForceRebuild3(False) 后特征树含 Revolve 与预期的 Cut-Extrude/Chamfer，无错误特征。",
      "键槽宽度 14 mm 与深度 5.5 mm 由 B-Rep 平面/圆柱面测量证实，或用剖视图目视复核。"
    ],
    "risks": [
      "半剖轮廓必须闭合且不自交，缺中心线会导致旋转失败。",
      "CreateSketchSlot 的宽度参数表现需实测复核对齐，制造槽宽以测量为准。",
      "公差、形位公差与粗糙度只写属性，不扰动名义实体尺寸。"
    ],
    "keywords": [
      "零件",
      "建模",
      "model",
      "part",
      "阶梯轴 / 回转件",
      "sw_part.py::revolve_boss"
    ]
  },
  {
    "id": "flange-end-cap",
    "name": "端盖 / 法兰盘",
    "category": "hole",
    "summary": "Ø120×12 法兰盘带 Ø40×6 止口与分布圆 Ø100 上 6 组 Ø9/Ø15 沉孔螺栓孔。",
    "difficulty": "standard",
    "workflow": "holes_slots_threads",
    "capabilities": [
      "part_and_features",
      "holes_and_finishing",
      "export_delivery"
    ],
    "entry": "scripts/sw_part.py + scripts/sw_hole_features.py",
    "references": [
      "references/complex-hole-features.md",
      "references/review.md"
    ],
    "params": [
      {
        "key": "outer_diameter",
        "label": "外径 × 厚度 (mm)",
        "example": "Ø120×12",
        "required": true
      },
      {
        "key": "spigot",
        "label": "止口直径 × 深度 (mm)",
        "example": "Ø40×6",
        "required": true
      },
      {
        "key": "bolt_pattern",
        "label": "螺栓孔",
        "example": "分布圆 Ø100，6×Ø9，沉孔 Ø15 深 9",
        "required": true
      },
      {
        "key": "material",
        "label": "材料",
        "example": "HT250",
        "required": false
      }
    ],
    "steps": [
      "前视基准面 sketch_circle Ø120 后 extrude_boss(mm(12))；再 sketch_circle Ø40 extrude_cut 深 6 形成止口。",
      "按 60° 均布计算 6 个分布圆 Ø100 上的孔位，用 create_hole_pattern 逐个调用 create_counterbore_hole(hole Ø9, 沉孔 Ø15, 深 9)。",
      "collect_geometry_measurements 读取孔组与复合孔，validate_hole_positions 逐孔验收；run_review 出预览与报告，export_to_step 导出 STEP。"
    ],
    "checks": [
      "compound_holes 中出现 6 组 Ø9/Ø15 同轴孔段，孔数合计与设计一致。",
      "孔中心分布圆半径 50 mm ±0.1 mm，相邻孔夹角 60° ±0.2°。",
      "SLDPRT 与 STEP 落盘且字节数 >0，review expected_outputs_exist=true、previews_not_blank=true。"
    ],
    "risks": [
      "B-Rep 无法单独区分盲孔与通孔，沉孔深度必须回读创建参数或特征定义。",
      "止口配合公差未定义，需人工按装配要求给 H7/g6 或间隙值。",
      "密集孔阵列为逐孔特征，数量多时建模耗时显著增加。"
    ],
    "keywords": [
      "孔",
      "hole",
      "bore",
      "端盖 / 法兰盘",
      "holes_slots_threads"
    ]
  },
  {
    "id": "spur-gear-m2-z24",
    "name": "标准直齿齿轮",
    "category": "gear",
    "summary": "模数 2、24 齿、20° 压力角、齿宽 10、轴孔 Ø10 的标准外啮合直齿轮实体。",
    "difficulty": "advanced",
    "workflow": "sw_gear.py::create_external_spur_gear",
    "capabilities": [
      "external_spur_gear_geometry",
      "part_and_features",
      "export_delivery"
    ],
    "entry": "scripts/sw_gear.py",
    "references": [
      "references/gears.md"
    ],
    "params": [
      {
        "key": "module_mm",
        "label": "模数 m (mm)",
        "example": "2",
        "required": true
      },
      {
        "key": "teeth",
        "label": "齿数 z",
        "example": "24",
        "required": true
      },
      {
        "key": "pressure_angle_deg",
        "label": "压力角 (°)",
        "example": "20",
        "required": true
      },
      {
        "key": "face_width_mm",
        "label": "齿宽 (mm)",
        "example": "10",
        "required": true
      },
      {
        "key": "bore_diameter_mm",
        "label": "轴孔直径 (mm)",
        "example": "10",
        "required": true
      }
    ],
    "steps": [
      "按 references/gears.md 预校验：分度圆 d=m·z=48、齿顶圆 da=52、齿根圆 df=43、基圆 db=d·cos20°，确认属标准全齿高外啮合直齿。",
      "SpurGearSpec(module_mm=2.0, teeth=24, pressure_angle_deg=20.0, face_width_mm=10.0, bore_diameter_mm=10.0, involute_segments=14) 后调用 create_external_spur_gear(model, spec) 生成单实体齿廓。",
      "保存 SLDPRT、export_to_step 导出 STEP、run_review 出四视图；关闭文档后重开，用 collect_geometry_measurements 回读 B-Rep 尺寸。"
    ],
    "checks": [
      "B-Rep 包围盒 52×52×10 mm（容差 0.02 mm），内圆柱面 Ø10 mm，实体数 solid=1。",
      "evidence 记录解析尺寸、根切风险与 involute_segments，采样密度与耗时写入交付说明。",
      "重开后尺寸与 STEP 落盘一致，四视图 review 报告 pass。"
    ],
    "risks": [
      "齿根为径向过渡加齿根圆弧，不是滚刀生成的精确 trochoid。",
      "仅支持标准全齿高外啮合直齿；斜齿、锥齿、内齿、齿条、蜗轮蜗杆必须转专用路线。",
      "不含变位、侧隙、修形、公差等级、材料与强度校核，能力保持 pilot/review_required。"
    ],
    "keywords": [
      "齿轮",
      "gear",
      "标准直齿齿轮",
      "sw_gear.py::create_external_spur_gear"
    ]
  },
  {
    "id": "threaded-hole-m6",
    "name": "螺纹孔 / 攻丝底孔",
    "category": "hole",
    "summary": "M6×1 6H 右旋盲孔：Ø5 攻丝底孔 + Metric Tap 真实螺纹 + 孔口 C0.6 倒角，并给出螺纹表达证据。",
    "difficulty": "standard",
    "workflow": "holes_slots_threads",
    "capabilities": [
      "holes_and_finishing"
    ],
    "entry": "subskills/solidworks-threaded-holes/scripts/create_threaded_hole_template.py",
    "references": [
      "subskills/solidworks-threaded-holes/SKILL.md",
      "references/complex-hole-features.md"
    ],
    "params": [
      {
        "key": "thread",
        "label": "螺纹规格",
        "example": "M6（底孔 Ø5.0）",
        "required": true
      },
      {
        "key": "thread_depth",
        "label": "螺纹深度 (mm)",
        "example": "12",
        "required": true
      },
      {
        "key": "pilot_depth",
        "label": "底孔深度 (mm)",
        "example": "16",
        "required": true
      },
      {
        "key": "mouth_chamfer",
        "label": "孔口倒角 (mm)",
        "example": "0.6×45°",
        "required": false
      },
      {
        "key": "thread_class",
        "label": "公差等级 / 旋向",
        "example": "6H / 右旋",
        "required": false
      }
    ],
    "steps": [
      "进入 COM 前校验：底孔 Ø5.0 小于公称 Ø6，螺纹深 12 ≤ 底孔深 16 ≤ 板厚 16，孔位保留螺纹大径与倒角边界。",
      "运行 python subskills/solidworks-threaded-holes/scripts/create_threaded_hole_template.py --thread M6 --block-thickness 16 --thread-depth 12 --mouth-chamfer 0.6 --output-dir OUT，脚本按盲孔底孔 → Metric Tap Thread → CosmeticThread 降级 → 孔口倒角执行。",
      "重建后遍历特征树确认螺纹特征留在树中，读取 *_parameters.json 的 thread_attempts/thread_evidence/thread_status，再跑 run_review。"
    ],
    "checks": [
      "*_parameters.json 中 has_tap_drill_cut=true 且 has_mouth_chamfer=true，representation 为 real-thread/cosmetic-thread/可解释的 visible-helix，metadata-only 即阻断。",
      "特征树含真实螺纹或装饰螺纹特征，底孔圆柱面回读 Ø5.0 mm（容差 0.05 mm）。",
      "*.SLDPRT、*.step、*_parameters.json、*_review_report.json、*_isometric.bmp 均落盘，review 的 expected_outputs_exist 与 previews_not_blank 为 true。"
    ],
    "risks": [
      "Hole Wizard/Advanced Hole、外螺纹、英制/UN/NPT/BSP 与显式牙型仍为 pilot，需人工复核。",
      "表外 ISO 规格必须显式给 --tap-drill，不得猜底孔。",
      "贯穿孔必须用 swEndCondThroughAll，不能用“板厚 +1 mm”盲孔伪装。"
    ],
    "keywords": [
      "孔",
      "hole",
      "bore",
      "螺纹孔 / 攻丝底孔",
      "holes_slots_threads"
    ]
  },
  {
    "id": "counterbore-countersink-slot",
    "name": "沉孔 / 沉头孔与槽",
    "category": "hole",
    "summary": "同一块 100×60×10 板上生成 Ø6+Ø12 沉孔、Ø5+Ø10×90° 沉头孔与 10 mm 宽半圆端槽。",
    "difficulty": "standard",
    "workflow": "holes_slots_threads",
    "capabilities": [
      "holes_and_finishing",
      "geometry_and_delivery_review"
    ],
    "entry": "scripts/sw_hole_features.py",
    "references": [
      "references/complex-hole-features.md",
      "references/review.md"
    ],
    "params": [
      {
        "key": "plate",
        "label": "板件尺寸 (mm)",
        "example": "100×60×10",
        "required": true
      },
      {
        "key": "counterbore",
        "label": "沉孔 通孔/沉孔×深 (mm)",
        "example": "Ø6 / Ø12×4",
        "required": true
      },
      {
        "key": "countersink",
        "label": "沉头孔 通孔/锥口×角",
        "example": "Ø5 / Ø10×90°",
        "required": true
      },
      {
        "key": "slot",
        "label": "半圆端槽 宽×端弧圆心距 (mm)",
        "example": "宽 10，圆心距 20",
        "required": true
      }
    ],
    "steps": [
      "前视基准面 sketch_rectangle 拉伸出 100×60×10 板体，作为孔槽统一基准面。",
      "create_counterbore_hole((mm(20),mm(20)), 6, 12, 4)、create_countersink_hole((mm(50),mm(20)), 5, 10, 90)、create_semicircular_slot((mm(20),mm(45)),(mm(50),mm(45)), width=10, depth=0)。",
      "collect_geometry_measurements 区分 hole_groups、compound_holes、slot_arc_candidates；validate_hole_positions 逐孔验收，并导出剖视图确认盲孔/沉头方向。"
    ],
    "checks": [
      "compound_holes 含 Ø6/Ø12 同轴孔段；slot_arc_candidates 含 2 个槽端圆柱面且不计入圆孔数量。",
      "槽宽 10 mm、总长 30 mm（端弧圆心距 20 + 槽宽 10）由 B-Rep 测量，容差 0.1 mm。",
      "沉头 90° 包含角由倒角特征参数或剖视图复核，孔口无崩边。"
    ],
    "risks": [
      "B-Rep 不能单独可靠区分盲孔与通孔，必须与创建参数交叉验证。",
      "锥形沉头复用入口圆边倒角，方向错误需翻转并重看剖视。",
      "孔阵列为逐孔特征，规则密排后续应改用 linear_pattern/circular_pattern。"
    ],
    "keywords": [
      "孔",
      "hole",
      "bore",
      "沉孔 / 沉头孔与槽",
      "holes_slots_threads"
    ]
  },
  {
    "id": "cnc-fillet-bracket",
    "name": "CNC 多圆角倒角安装座",
    "category": "part",
    "summary": "60×40×12 铝安装座：立角 R6、顶面 C1、圆角槽减重口袋与孔口倒角，带 100/75/50% 降级策略。",
    "difficulty": "advanced",
    "workflow": "subskills/solidworks-fillet-chamfer-cnc::create_cnc_mount_template.py",
    "capabilities": [
      "part_and_features",
      "holes_and_finishing",
      "dfm_checks"
    ],
    "entry": "subskills/solidworks-fillet-chamfer-cnc/scripts/create_cnc_mount_template.py",
    "references": [
      "subskills/solidworks-fillet-chamfer-cnc/SKILL.md",
      "subskills/solidworks-fillet-chamfer-cnc/references/cnc-fillet-chamfer-lessons.md"
    ],
    "params": [
      {
        "key": "base",
        "label": "基体 L×W×T (mm)",
        "example": "60×40×12",
        "required": true
      },
      {
        "key": "base_corner_radius",
        "label": "立角圆角 R (mm)",
        "example": "6",
        "required": true
      },
      {
        "key": "top_chamfer",
        "label": "顶面外轮廓倒角 (mm)",
        "example": "1",
        "required": false
      },
      {
        "key": "pocket",
        "label": "减重口袋",
        "example": "rounded_slot 30×16 深 6",
        "required": false
      },
      {
        "key": "failure_policy",
        "label": "降级策略",
        "example": "strict（或 progressive 100/75/50%）",
        "required": false
      }
    ],
    "steps": [
      "先执行 create_cnc_mount_template.py --dry-run --set base_corner_radius=6 --set chamfer_angle_deg=30，确认 *_plan.json 的 validation.errors 为空、语义目标与 expected_edge_count 符合设计。",
      "去掉 --dry-run 执行原生建模，顺序固定为“基础体 → 立角圆角 → 外轮廓倒角 → 孔槽/口袋 → 孔口倒角”；大量参数走 --params-json。",
      "重建后从特征树逐个回读 Fillet/Chamfer 特征，保存 SLDPRT、导出 STEP，并跑 sw_review.run_review 查看等轴测与俯视。"
    ],
    "checks": [
      "*_parameters.json 的 treatment_evidence 记录请求值、实际值、每次尝试与所选边签名，feature_evidence.missing_names 为空。",
      "review 报告 evaluation.status 为 pass 或可解释的 warn，expected_outputs_exist 与 previews_not_blank 为 true。",
      "发生降级时在交付摘要写明实际圆角/倒角尺寸，不声称精确满足原请求值。"
    ],
    "risks": [
      "选边以几何签名和期望数量为证据，数量不符即停止，不用坐标容差或 Edge1 猜边。",
      "保持线圆角在本机 SW2026 SP1.1 的 ISetHoldLines 边界仍为 blocked/known_server_fault。",
      "换版本或换拓扑必须复跑 verify_advanced_fillets.py 才能声明支持。"
    ],
    "keywords": [
      "零件",
      "建模",
      "model",
      "part",
      "CNC 多圆角倒角安装座",
      "subskills/solidworks-fillet-chamfer-cnc::create_cnc_mount_template.py"
    ]
  },
  {
    "id": "enclosure",
    "name": "设备外壳",
    "category": "part",
    "summary": "120×80×40、壁厚 2.5 的抽壳外壳，含 USB/DC 接口开孔与 4 个 M3 PCB 螺柱。",
    "difficulty": "advanced",
    "workflow": "enclosure",
    "capabilities": [
      "part_and_features",
      "holes_and_finishing",
      "export_delivery"
    ],
    "entry": "scripts/sw_part.py + scripts/sw_export.py",
    "references": [
      "references/part-modeling.md",
      "references/export.md"
    ],
    "params": [
      {
        "key": "envelope",
        "label": "包络尺寸 L×W×H (mm)",
        "example": "120×80×40",
        "required": true
      },
      {
        "key": "wall",
        "label": "壁厚 / 底厚 (mm)",
        "example": "2.5",
        "required": true
      },
      {
        "key": "interfaces",
        "label": "接口开孔 (mm)",
        "example": "USB 12×6；DC Ø8",
        "required": true
      },
      {
        "key": "boss",
        "label": "PCB 螺柱",
        "example": "M3：外Ø6 内Ø2.5 高 6，4 个，孔距 64×40",
        "required": true
      },
      {
        "key": "gap",
        "label": "装配间隙 (mm)",
        "example": "0.3",
        "required": false
      }
    ],
    "steps": [
      "extrude_boss 拉伸 120×80×40 包络体，用 sw_part.shell(thickness=2.5, faces_to_remove=[顶面]) 抽壳成壳体。",
      "在侧壁切向基准面上 extrude_cut 出 USB 12×6 与 DC Ø8 接口孔；底面 extrude_boss 4 个 M3 螺柱并按 PCB 孔距定位。",
      "export_to_stl(quality=\"fine\") 与 export_to_step 导出，run_review 检查开口方向、壁厚与螺柱位置。"
    ],
    "checks": [
      "B-Rep 平面间距测得壁厚 2.5 mm（容差 0.05 mm），collect_bounding_box 回读 120×80×40 mm。",
      "接口孔 12×6 与 Ø8 由内环/圆柱面回读，位置与接口坐标一致。",
      "SLDPRT、STEP、STL 三件落盘且字节数 >0，STL 三角面数 >0，预览图非空白。"
    ],
    "risks": [
      "抽壳移出面选择错误会产生错误空腔，必须回读 shell 特征面数。",
      "装配间隙 0.3 mm 只是包络预留，未做公差链与热膨胀分析。",
      "3D 打印/注塑方向与拔模未验证，需补 check-dfm 复核。"
    ],
    "keywords": [
      "零件",
      "建模",
      "model",
      "part",
      "设备外壳",
      "enclosure"
    ]
  },
  {
    "id": "sheet-metal-u-bracket",
    "name": "钣金 U 型支架",
    "category": "sheetmetal",
    "summary": "2 mm 冷轧板开放 U 型轮廓基体法兰，回读板厚/内折弯半径/K 因子并导出含折弯线 DXF。",
    "difficulty": "advanced",
    "workflow": "sw_sheet_metal.py::create_base_flange",
    "capabilities": [
      "sheet_metal",
      "export_delivery",
      "dfm_checks"
    ],
    "entry": "scripts/sw_sheet_metal.py + scripts/sw_export.py",
    "references": [
      "references/advanced.md",
      "references/export.md"
    ],
    "params": [
      {
        "key": "thickness",
        "label": "板厚 (mm)",
        "example": "2.0",
        "required": true
      },
      {
        "key": "bend_radius",
        "label": "内折弯半径 (mm)",
        "example": "2.0",
        "required": true
      },
      {
        "key": "k_factor",
        "label": "K 因子",
        "example": "0.42",
        "required": true
      },
      {
        "key": "u_profile",
        "label": "U 型轮廓 底宽×两侧高 (mm)",
        "example": "80 × 40",
        "required": true
      },
      {
        "key": "depth",
        "label": "基体法兰拉伸深度 (mm)",
        "example": "60",
        "required": true
      }
    ],
    "steps": [
      "在基准面绘制开放 U 型轮廓折线（底 80、两侧各高 40），作为 BaseFlange 的开放轮廓。",
      "BaseFlangeSpec(thickness=2e-3, bend_radius=2e-3, depth=60e-3, k_factor=0.42, relief_ratio=0.5) 传给 create_base_flange(model, sketch_ref, spec)，再用 sheet_metal_evidence(model) 回读原生钣金特征。",
      "保存 SLDPRT，用 export_flat_pattern_dxf 导出含折弯线的展开 DXF，run_review 出预览并核对展开方向。"
    ],
    "checks": [
      "sheet_metal_evidence 回读 SheetMetal/BaseFlange/FlatPattern 特征及板厚 2.0、内 R 2.0、K=0.42。",
      "DXF 落盘且包含折弯线实体（非空、实体数 >0）。",
      "关闭重开后参数一致，展开长度与中性层理论计算偏差 ≤1 mm。"
    ],
    "risks": [
      "边线法兰、放样折弯、转钣金、折弯表与多版本矩阵尚未验证，需人工建模。",
      "缺材料、割缝、成型空间等输入时 check-dfm 返回 blocked。",
      "钣金工程图缺可靠展开证据时按 blocked/pilot 处理，不宣称无人值守完成。"
    ],
    "keywords": [
      "钣金",
      "sheet metal",
      "折弯",
      "钣金 U 型支架",
      "sw_sheet_metal.py::create_base_flange"
    ]
  },
  {
    "id": "assembly-mates",
    "name": "装配体配合（轴-座-齿轮副）",
    "category": "assembly",
    "summary": "底座固定，轴与齿轮用同心 Mate 保留旋转，齿轮副用 Gear Mate 建立 18:26 传动比并回读自由度。",
    "difficulty": "standard",
    "workflow": "assembly_mates",
    "capabilities": [
      "assembly_and_mates",
      "geometry_and_delivery_review"
    ],
    "entry": "scripts/sw_assembly.py",
    "references": [
      "references/assembly.md"
    ],
    "params": [
      {
        "key": "components",
        "label": "零件清单",
        "example": "base、shaft Ø8×140、gear z18、gear z26、cover",
        "required": true
      },
      {
        "key": "concentric",
        "label": "同心配合",
        "example": "轴/齿轮 lock_rotation=false",
        "required": true
      },
      {
        "key": "gear_ratio",
        "label": "齿轮副齿数比",
        "example": "18:26",
        "required": true
      },
      {
        "key": "fixed",
        "label": "固定件",
        "example": "base 固定，轴与齿轮浮动",
        "required": true
      }
    ],
    "steps": [
      "用 add_component 逐个加入零件（SW2024 中文版 AddComponent4 可能返回 None，封装会走 AddComponent5 并重试）。",
      "先 resolve_component 解析轻化组件，再用 get_component_feature + get_assembly_entity(GetCorresponding) 映射到装配体上下文，select_entities_for_mate(mark=1)。",
      "add_concentric_mate_by_cylinders(lock_rotation=False) 装轴与齿轮；add_gear_mate_by_cylinders(teeth_a=18, teeth_b=26) 建齿轮副；最后 inspect_component_dofs 核对剩余自由度。"
    ],
    "checks": [
      "collect_mate_feature_summary 中 MateGroup 下存在 MateConcentric 与 MateGearDim 真实特征。",
      "inspect_component_dofs 显示齿轮仅保留绕轴 1 个旋转自由度，未被 Fix 或三基准面锁死。",
      "保存 SLDASM 后重开可拖动，inspect_interference 返回 status=pass。"
    ],
    "risks": [
      "旋转件被三基准面或 lock_rotation=true 锁死会导致后续拖动与马达失效。",
      "inspect_interference 返回 blocked 或 count=None 是证据未知，不能解释为零干涉。",
      "Gear Mate 只建立转速比例，不防止齿轮实体穿透。"
    ],
    "keywords": [
      "装配",
      "assembly",
      "配合",
      "mate",
      "装配体配合（轴-座-齿轮副）",
      "assembly_mates"
    ]
  },
  {
    "id": "motion-study-rotary",
    "name": "运动算例（60 RPM 旋转马达）",
    "category": "motion",
    "summary": "在已有装配体上创建 4 s 运动算例与 60 RPM 匀速旋转马达，并审计结果是否过期。",
    "difficulty": "advanced",
    "workflow": "sw_motion.py::create_motion_study",
    "capabilities": [
      "motion_study",
      "assembly_and_mates"
    ],
    "entry": "scripts/sw_motion.py",
    "references": [
      "references/motion-study.md",
      "references/assembly.md"
    ],
    "params": [
      {
        "key": "duration",
        "label": "算例时长 (s)",
        "example": "4.0",
        "required": true
      },
      {
        "key": "rpm",
        "label": "马达转速 (RPM)",
        "example": "60",
        "required": true
      },
      {
        "key": "motor_count",
        "label": "马达数量",
        "example": "1",
        "required": true
      },
      {
        "key": "shaft_radius",
        "label": "静止轴圆柱半径范围 (mm)",
        "example": "4.5–5.5",
        "required": true
      },
      {
        "key": "rotor_radius",
        "label": "转子圆柱半径范围 (mm)",
        "example": "10.5–11.5",
        "required": true
      }
    ],
    "steps": [
      "先 ensure_motion_type_library() 加载 swmotionstudy.tlb，确认旋转件同心 Mate 未锁转、组件未 FixComponent。",
      "create_motion_study(asm, name=\"叶轮_60RPM_循环转动\", duration=4.0)，再 add_constant_speed_rotary_motor_by_cylinders(shaft_radius=(mm(4.5),mm(5.5)), rotor_radius=(mm(10.5),mm(11.5)), rpm=60.0)。",
      "calculate_and_play(study) 后调用 validate_motion_studies(asm, study_name=..., minimum_duration_seconds=4.0, minimum_motor_count=1, require_results=True)。"
    ],
    "checks": [
      "validate_motion_studies 返回 validation.status=\"pass\"，results_out_of_date 明确为 False。",
      "collect_motion_study_summary 显示算例类型、时长 ≥4 s、马达数 ≥1、GetResults() 非空。",
      "时间轴、马达图标、播放动画或 Calculate=True 单独出现不作为通过证据。"
    ],
    "risks": [
      "接触、摩擦、阻尼、重力、受力与完整 FEA 不在已验证范围。",
      "Motion Analysis 依赖加载项与许可证，缺失时只能降级 Animation/Basic Motion 并说明。",
      "把零件上下文面当载荷引用会让 CreateFeature 返回 None。"
    ],
    "keywords": [
      "运动",
      "motion",
      "马达",
      "motor",
      "运动算例（60 RPM 旋转马达）",
      "sw_motion.py::create_motion_study"
    ]
  },
  {
    "id": "gb-drawing-a3",
    "name": "GB/T 第一角零件图（A3）",
    "category": "drawing",
    "summary": "依 DrawingSpec v1 出 A3、GB_T、第一角三视图，导入模型尺寸并补孔表/标题栏，导出 PDF 后做文字边界复核。",
    "difficulty": "advanced",
    "workflow": "engineering_drawing",
    "capabilities": [
      "drawings_and_bom",
      "drawing_dimension_insertion",
      "export_delivery"
    ],
    "entry": "subskills/solidworks-engineering-drawing/scripts/drawing_workflow.py",
    "references": [
      "subskills/solidworks-engineering-drawing/SKILL.md",
      "references/drawing.md"
    ],
    "params": [
      {
        "key": "paper_size",
        "label": "图幅",
        "example": "A3（NewSheet4 PaperSize=6）",
        "required": true
      },
      {
        "key": "standard",
        "label": "标准与投影",
        "example": "GB_T + first_angle",
        "required": true
      },
      {
        "key": "views",
        "label": "视图组合",
        "example": "front/top/right + isometric",
        "required": true
      },
      {
        "key": "scale",
        "label": "比例",
        "example": "1:1",
        "required": true
      },
      {
        "key": "title_block",
        "label": "标题栏字段",
        "example": "图号 SW-001、材料 6061-T6、比例 1:1",
        "required": false
      }
    ],
    "steps": [
      "按 drawing_spec.schema.json 校验 DrawingSpec：standard=GB_T 必须配 projection=first_angle，第三角会被前置检查阻断。",
      "add_a3_sheet(require_gbt=True, projection=\"first_angle\") 建图框，create_standard_views_with_projection 出三视图，insert_dimensions 走 InsertModelAnnotations3(AnnotationType=32768) 导入真实模型尺寸。",
      "auto_arrange_drawing_dimensions 布排尺寸、add_note 写技术要求、insert_bom_table 插 BOM；export_sheet_to_pdf 导出 PDF，再用 drawing_review.review_drawing_artifacts 与 inspect_pdf_dimension_rendering 关联 COM 尺寸位置与 PDF 矢量文字框。"
    ],
    "checks": [
      "回读真实视图 ≥3 个、真实 DisplayDimension ≥6 个，模板候选与普通 Note 不计入。",
      "PDF 落盘，inspect_pdf_dimension_rendering 报告尺寸文字框关联完整且无 confirmed_collision。",
      "无压孔、压中心线、跨视图长引线或标题栏侵入；估算边界结论保留 estimated 证据标记。"
    ],
    "risks": [
      "IAnnotation 不提供原生文字包围盒，文字边界只能用锚点与字体估算，必须目视复核。",
      "轴测、剖视、局部视图、孔标注/孔表、标题栏业务字段需专项脚本，通用生成器会返回 DRAWING_SPEC_CAPABILITY_UNSUPPORTED。",
      "钣金工程图缺可靠展开证据时返回 blocked。"
    ],
    "keywords": [
      "工程图",
      "drawing",
      "出图",
      "GB/T 第一角零件图（A3）",
      "engineering_drawing"
    ]
  },
  {
    "id": "batch-export-delivery",
    "name": "批量导出与交付包",
    "category": "export",
    "summary": "多文档批量导出 STEP/STL/PDF 并逐文件记录大小与 SHA-256，同时生成 Pack and Go 依赖包与 BOM CSV。",
    "difficulty": "standard",
    "workflow": "batch_export",
    "capabilities": [
      "export_delivery",
      "pack_and_go",
      "custom_properties_and_bom"
    ],
    "entry": "scripts/sw_export.py + scripts/sw_delivery.py",
    "references": [
      "references/export.md"
    ],
    "params": [
      {
        "key": "formats",
        "label": "输出格式",
        "example": ".step,.stl,.pdf",
        "required": true
      },
      {
        "key": "overwrite",
        "label": "覆盖策略",
        "example": "false（同名冲突直接阻止）",
        "required": true
      },
      {
        "key": "stl_quality",
        "label": "STL 质量",
        "example": "fine（偏差 0.005 mm、角度 0.174 rad）",
        "required": false
      },
      {
        "key": "pack_target",
        "label": "Pack and Go 目标目录",
        "example": "必须为空目录",
        "required": false
      }
    ],
    "steps": [
      "batch_export_formats(sw, file_paths, output_dir, formats=(\".step\",\".stl\"), overwrite=False)：每格式前激活源文档并回读 ActiveDoc.GetPathName()，路径不一致立即停止。",
      "对装配体调用 pack_and_go(..., fallback_policy=\"stage_dependencies\")，落盘后按 GetDependencies2 审计依赖并生成 cadstudio-pack-manifest.json 与逐文件 SHA-256。",
      "export_assembly_bom_csv + build_bom_traceability 输出 BOM 与追溯字段，最后 run_review 以 expected_outputs 校验全部产物。"
    ],
    "checks": [
      "每个输出记录 success、字节数、produced_this_run 与 SHA-256；同名冲突被阻止而非后写覆盖。",
      "pack_and_go 的 document_count 与实际落盘文件数一致，missing_dependencies 为空或已标记 pilot 暂存包。",
      "BOM CSV 行数与 collect_assembly_bom 结果一致，属性与配置核对留痕。"
    ],
    "risks": [
      "专有格式仍需目标 CAD 原生打开复核，不能只凭脚本返回值。",
      "外部引用、Toolbox、配置、压缩组件与关联工程图必须人工抽查。",
      "严格模式漏依赖返回 SW_PACK_AND_GO_DEPENDENCY_ENUMERATION_INCOMPLETE 并阻断。"
    ],
    "keywords": [
      "导出",
      "export",
      "step",
      "stl",
      "批量导出与交付包",
      "batch_export"
    ]
  },
  {
    "id": "open-helical-spring",
    "name": "开放端等螺距弹簧",
    "category": "part",
    "summary": "线径 3、中径 24、中心线高度 48、6 圈的开放端圆线弹簧实体，回读旋向与实体极值。",
    "difficulty": "advanced",
    "workflow": "sw_spring.py::create_open_helical_spring",
    "capabilities": [
      "open_helical_spring",
      "part_and_features"
    ],
    "entry": "scripts/sw_spring.py",
    "references": [
      "references/spring.md"
    ],
    "params": [
      {
        "key": "wire_diameter",
        "label": "线径 (mm)",
        "example": "3.0",
        "required": true
      },
      {
        "key": "mean_diameter",
        "label": "中径 (mm)",
        "example": "24",
        "required": true
      },
      {
        "key": "helix_height",
        "label": "中心线轴向行程 (mm)",
        "example": "48",
        "required": true
      },
      {
        "key": "turns",
        "label": "圈数",
        "example": "6",
        "required": true
      },
      {
        "key": "clockwise",
        "label": "旋向（螺旋线方向参数）",
        "example": "false",
        "required": false
      }
    ],
    "steps": [
      "先校验试点约束：线径 0.1–50 mm、中径 ≤500 mm 且 ≥4×线径、中心线高度 ≤2000 mm、圈数 1–20、螺距 ≥1.25×线径且 ≤中径/2。",
      "OpenHelicalSpringSpec(wire_diameter_mm=3, mean_diameter_mm=24, helix_height_mm=48, turns=6, clockwise=False) 后调用 create_open_helical_spring(model, spec)，在新建空零件中生成基圆 + 原生螺旋线 + 圆形截面扫描。",
      "用 IBody2.GetExtremePoint 回读实体极值（比中心线高度多出线径延伸），保存 SLDPRT 并跑 run_review。"
    ],
    "checks": [
      "verify_helix_definition 回读旋向、圈数 6、螺距 8 mm（48/6，等于 2.67×线径）与输入一致。",
      "实体实测尺寸与 expected_body_bounds_mm 对账，体积与理论线材体积偏差在容差内。",
      "SLDPRT 与 STEP 落盘，重开后预览非空白。"
    ],
    "risks": [
      "输入高度是螺旋中心线轴向行程，不等于实体自由高度。",
      "端圈未并紧、未磨平；刚度、压并高度、疲劳与制造要求均不验证。",
      "接口只接受无实体零件，失败可能残留草图，仅限本次新建文档使用。"
    ],
    "keywords": [
      "零件",
      "建模",
      "model",
      "part",
      "开放端等螺距弹簧",
      "sw_spring.py::create_open_helical_spring"
    ]
  },
  {
    "id": "sprocket-cosmetic",
    "name": "链轮外观件",
    "category": "part",
    "summary": "节距 12.7、滚子 Ø7.92、17 齿、厚 6、轴孔 Ø10 的近似链轮实体，用于外观与几何演示。",
    "difficulty": "standard",
    "workflow": "sw_sprocket.py::create_approximate_sprocket",
    "capabilities": [
      "approximate_roller_sprocket",
      "part_and_features"
    ],
    "entry": "scripts/sw_sprocket.py",
    "references": [
      "references/sprocket.md"
    ],
    "params": [
      {
        "key": "chain_pitch",
        "label": "链节距 (mm)",
        "example": "12.7（1/2 英寸）",
        "required": true
      },
      {
        "key": "roller_diameter",
        "label": "滚子直径 (mm)",
        "example": "7.92",
        "required": true
      },
      {
        "key": "teeth",
        "label": "齿数",
        "example": "17",
        "required": true
      },
      {
        "key": "thickness",
        "label": "厚度 (mm)",
        "example": "6",
        "required": true
      },
      {
        "key": "bore",
        "label": "轴孔直径 (mm)",
        "example": "10",
        "required": true
      }
    ],
    "steps": [
      "在新建空零件上操作（接口要求无实体零件），先按 SprocketSpec 校验节距、滚子直径、齿数与轴孔边界。",
      "create_approximate_sprocket(model, spec) 生成折线齿廓草图并拉伸，读取 evidence 的 profile_min_diameter_mm 作为轴孔几何边界。",
      "保存到本次新建且未占用的路径，export_to_step 导出 STEP，run_review 目视核对齿形与轴孔。"
    ],
    "checks": [
      "实体为单实体，轴孔 Ø10 mm 由内圆柱面回读，包围盒与 evidence 名义齿顶圆一致。",
      "profile_min_diameter_mm 记录并核对：名义齿根圆（节圆减滚子直径）与实际折线最小直径不同。",
      "SLDPRT 与 STEP 落盘且重开成功，四视图预览非空白。"
    ],
    "risks": [
      "齿廓为折线近似，未验证链条啮合、强度或标准，不能作为生产级标准链轮。",
      "草图未完全参数化与约束，改参数应整体重新生成。",
      "轴孔受实际折线最小直径限制，不是啮合尺寸公差。"
    ],
    "keywords": [
      "零件",
      "建模",
      "model",
      "part",
      "链轮外观件",
      "sw_sprocket.py::create_approximate_sprocket"
    ]
  },
  {
    "id": "dfm-fea-review",
    "name": "DFM / FEA 复核",
    "category": "evaluation",
    "summary": "对中性 CAD 文档跑 check-dfm 与 check-drc，再按需 fea-preflight/run-fea，输出可追溯的制造与强度风险证据。",
    "difficulty": "advanced",
    "workflow": "cad_studio.py::check-dfm",
    "capabilities": [
      "dfm_checks",
      "design_rule_audit",
      "simulation_and_fea",
      "geometry_and_delivery_review"
    ],
    "entry": "scripts/cad_studio.py + scripts/dfm_review.py + scripts/fea_analysis.py",
    "references": [
      "references/design-rule-check.md",
      "references/complex-mechanical-routing.md",
      "capabilities.yaml"
    ],
    "params": [
      {
        "key": "process",
        "label": "工艺分支",
        "example": "machining（或 sheet_metal / laser_cutting / 3d_printing / injection_molding）",
        "required": true
      },
      {
        "key": "material",
        "label": "材料",
        "example": "6061-T6",
        "required": true
      },
      {
        "key": "wall",
        "label": "壁厚 / 最小壁 (mm)",
        "example": "2.5",
        "required": true
      },
      {
        "key": "k_factor",
        "label": "K 因子（钣金）",
        "example": "0.42",
        "required": false
      },
      {
        "key": "brep",
        "label": "B-Rep 证据文件",
        "example": "brep.json（绑定实测包围盒与孔径）",
        "required": false
      }
    ],
    "steps": [
      "运行 python scripts/cad_studio.py check-dfm --input model.cadstudio.json --output output/dfm_report.json --process machining --profile supplier.json --brep-evidence brep.json。",
      "运行 check-drc --input model.cadstudio.json --output output/drc.json（可加 --rule-pack drilling_panel），报告始终保留 reviewRequired=true。",
      "需要受力时按 fea-preflight → prepare-fea → run-fea（可选 run-fea-convergence）执行，结果统一标 review_required 并保留 .cel 接触迭代证据。"
    ],
    "checks": [
      "dfm 报告 status 不为 blocked，材料、壁厚、K 因子、割缝、成型空间等关键输入齐全。",
      "drc 报告 status 为 pass/warning/review_required，fail 项列出规则、阈值与证据来源。",
      "FEA 报告含最终步 COPEN/CPRESS/CSLIP 与网格收敛 8% 阈值结论，末两档对比留档。"
    ],
    "risks": [
      "DFM 是可制造性风险复核，不是制造认证；规则全通过仍须人工确认材料、公差、载荷与供应商能力。",
      "注塑分支为声明型 pilot 筛查，不自动识别倒扣、不做模流认证。",
      "FEA 未覆盖大型装配接触、屈曲、模态与热耦合，且不等于安全认证。"
    ],
    "keywords": [
      "复核",
      "review",
      "dfm",
      "fea",
      "DFM / FEA 复核",
      "cad_studio.py::check-dfm"
    ]
  }
];
