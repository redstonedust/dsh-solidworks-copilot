// 由 scripts/import-content.mjs 从调研 JSON 生成；手改会被下一次合并覆盖。

/** SolidWorks 自动化技巧条目（60 条）。 */
export const tips = [
  {
    "id": "units-api-meters",
    "category": "units",
    "title": "所有长度单位是米",
    "body": "草图坐标、拉伸深度、孔径、圆角半径、阵列间距都以米传入；把 10 当成 10mm 会得到 1000 倍的草图，切除落在实体之外被静默拒绝。实测把 100x60x6mm 的板撑到 13300mm 包围盒就是这个原因。涉及毫米的输入一律先过 sw_connect.mm() 再进 COM。",
    "code": "from sw_connect import mm\nfrom sw_hole_features import create_blind_hole\nfrom sw_part import extrude_cut\n\nfeature = extrude_cut(model, sketch_name, mm(8))   # 8mm -> 0.008\nblind = create_blind_hole(model, (mm(20), mm(20)), mm(6.6), mm(10))",
    "source": "references/troubleshooting.md"
  },
  {
    "id": "units-getpartbox-modes",
    "category": "units",
    "title": "GetPartBox 两种单位模式",
    "body": "GetPartBox(True) 返回米（系统单位），GetPartBox(False) 返回毫米（文档单位，受单位制影响）；用错模式会得到 1000 倍或 0.001 倍的尺寸。sw_measure.collect_bounding_box() 统一按 True 读取再换算为毫米。",
    "code": "from sw_measure import collect_bounding_box\n\nbox = collect_bounding_box(model)\nprint(box[\"size_mm\"])    # [长, 宽, 高]，毫米",
    "source": "references/troubleshooting.md"
  },
  {
    "id": "api-selectbyid2-signature",
    "category": "api",
    "title": "SelectByID2 必须九个参数",
    "body": "SelectByID2(Name, Type, X, Y, Z, Append, Mark, CalloutOut, SelectOption) 共九个参数，坐标是实体上的魔法值；Callout 必须是 Dispatch 变体，传 Python None 会报 TypeError（无法转换为 COM VARIANT）。用 create_empty_dispatch_variant() 生成空 Dispatch。",
    "code": "from sw_connect import create_empty_dispatch_variant\n\nok = model.Extension.SelectByID2(\n    \"Front Plane\", \"PLANE\", 0, 0, 0,          # Name, Type, X, Y, Z\n    False, 0,                                  # Append, Mark\n    create_empty_dispatch_variant(), 0,        # CalloutOut, SelectOption\n)",
    "source": "references/troubleshooting.md"
  },
  {
    "id": "selection-entity-type-strings",
    "category": "selection",
    "title": "选择类型字符串对照",
    "body": "SelectByID2 第二个参数的类型字符串决定选择语义：PLANE 基准面、FACE 面、EDGE 边线、VERTEX 顶点、SKETCH 草图、BODYFEATURE 实体特征、COMPONENT 组件、AXIS 轴线、SKETCHSEGMENT 草图线段、SKETCHPOINT 草图点、EXTSKETCHSEGMENT 外部草图线段、REFERENCECURVES 参考曲线。类型写错时函数返回 False 且不报错。",
    "code": "ENTITY_TYPES = [\n    \"PLANE\", \"FACE\", \"EDGE\", \"VERTEX\", \"SKETCH\", \"BODYFEATURE\",\n    \"COMPONENT\", \"AXIS\", \"SKETCHSEGMENT\", \"SKETCHPOINT\",\n    \"EXTSKETCHSEGMENT\", \"REFERENCECURVES\",\n]",
    "source": "references/part-modeling.md"
  },
  {
    "id": "selection-sketch-object-first",
    "category": "selection",
    "title": "草图选择优先对象级 Select2",
    "body": "优先用 sw_part.sketch() 上下文或 end_sketch() 返回的真实草图引用，选择顺序为「活动草图引用 → 创建时缓存引用 → FeatureByName → SelectByID2(\\\"SKETCH\\\")」。SW2024 中文版下 SelectByID2(\\\"草图1\\\"/\\\"Sketch1\\\", \\\"SKETCH\\\", ...) 都会返回 False，随后 FeatureExtrusion3 返回 None；旧封装还把「选择集数量 > 0」当成功，残留选择集被清空后全部失败。",
    "code": "from sw_part import end_sketch, extrude_boss, sketch_circle, start_sketch\n\nstart_sketch(model, \"Front Plane\")\nsketch_circle(model, 0, 0, 0.025)\nsketch_ref = end_sketch(model)              # 真实草图对象引用\nfeature = extrude_boss(model, sketch_ref, 0.05)\nif feature is None:\n    raise RuntimeError(\"拉伸失败：检查草图闭合、方向和对象选择\")",
    "source": "references/troubleshooting.md"
  },
  {
    "id": "selection-edge-geometry-first",
    "category": "selection",
    "title": "按几何条件选边而非坐标",
    "body": "SelectByID2(\\\"Edge1\\\", \\\"EDGE\\\", x, y, z, ...) 依赖坐标魔法值，改板厚、加孔后静默返回 False，而 FeatureFillet 仍会对当前选择集执行。改用 sw_edge_select.select_edges() 按 B-Rep 条件过滤（axis/min_length_mm/circular/diameter_mm/convex_only/concave_only），选不到时返回 status=error 且不继续创建特征。先用 dry_run 或 rejected_sample 确认选中的正是目标边。",
    "code": "from sw_connect import mm\nfrom sw_edge_select import select_edges\nfrom sw_part import fillet\n\npreview = select_edges(model, {\"axis\": \"z\", \"convex_only\": True})\nif preview[\"status\"] != \"ok\":\n    raise RuntimeError(preview[\"errors\"])\nprint(preview[\"selected_count\"], preview[\"rejected_sample\"])\nfillet(model, mm(4))",
    "source": "references/edge-selection.md"
  },
  {
    "id": "api-edge-select4-callout",
    "category": "api",
    "title": "选边优先用 Select2",
    "body": "Select4(Append, Callout) 的 Callout 必须是 Dispatch 变体，传 Python None 得到类型不匹配 0x80020005（-2147352571）。封装优先走 Select2(Append, Mark)，失败才退到 Select4。",
    "code": "from sw_connect import create_empty_dispatch_variant\n\nedge.Select2(True, 0)                                  # 首选\nedge.Select4(True, create_empty_dispatch_variant())    # 回退，不能传 None",
    "source": "references/edge-selection.md"
  },
  {
    "id": "api-plane-names-bilingual",
    "category": "api",
    "title": "中英文基准面名兼容",
    "body": "英文版 Front/Top/Right Plane 对应中文版 前视/上视/右视基准面，法线分别为 Z/Y/X 轴。先试英文名，返回 False 再试中文名；基准面选择失败基本就是名称不匹配。",
    "code": "from sw_connect import create_empty_dispatch_variant\n\nvariant = create_empty_dispatch_variant()\nok = model.Extension.SelectByID2(\"Front Plane\", \"PLANE\", 0, 0, 0, False, 0, variant, 0)\nif not ok:\n    ok = model.Extension.SelectByID2(\"前视基准面\", \"PLANE\", 0, 0, 0, False, 0, variant, 0)\nassert ok, \"基准面名称未匹配\"",
    "source": "references/part-modeling.md"
  },
  {
    "id": "sketch-context-reference-cache",
    "category": "sketch",
    "title": "用 with sketch 进入退出草图",
    "body": "推荐 with sketch(model, \\\"Front Plane\\\") as sketch_name 自动进出草图，sw_part.py 会在创建时缓存真实草图对象引用，避开按名称选择草图失败。手动流程是 start_sketch / sketch_circle / end_sketch，再把 end_sketch 的返回值直接传给 extrude_boss 或 extrude_cut。",
    "code": "from sw_connect import mm\nfrom sw_part import extrude_boss, sketch, sketch_circle\nfrom sw_sketch_quality import fully_define_sketch\n\nwith sketch(model, \"Front Plane\") as sketch_name:\n    sketch_circle(model, 0, 0, mm(25))\n    fully_define_sketch(model)\nfeature = extrude_boss(model, sketch_name, mm(50))",
    "source": "references/part-modeling.md"
  },
  {
    "id": "sketch-fully-defined-evidence",
    "category": "sketch",
    "title": "完全定义靠回读而非返回值",
    "body": "圆/矩形这类基础草图在编辑态调用 sw_sketch_quality.fully_define_sketch(model)：它以原点为基准补尺寸和关系，内部调用 FullyDefineSketch(True, True, 1023, True, 1, variant, 1, variant, 1, 1)，再回读 GetConstrainedStatus、RelationManager.GetRelations、尺寸名数量与 fix_count。验收门槛是 constrained_status==3 且存在驱动尺寸且 fix_count==0，否则抛异常。FullyDefineSketch 返回码未定义，不能当验收结论。",
    "code": "from sw_connect import get_com_member, mm\nfrom sw_sketch_quality import fully_define_sketch, inspect_sketch\n\nwith sketch(model, \"Front Plane\") as sketch_name:\n    sketch_circle(model, 0, 0, mm(25))\n    record = fully_define_sketch(model)\nprint(record[\"constrained_status\"], record[\"dimension_count\"], record[\"fix_count\"])\nactive = get_com_member(model.SketchManager, \"ActiveSketch\")\nprint(inspect_sketch(active)[\"dimension_names\"])",
    "source": "scripts/sw_sketch_quality.py"
  },
  {
    "id": "sketch-no-batch-fix",
    "category": "sketch",
    "title": "禁止批量 Fix 伪造完全定义",
    "body": "sgFIXED 只用于明确固定参考的场景，不得批量加到所有实体上冒充参数化草图。正确做法是用 sgHORIZONTAL / sgVERTICAL / sgCOINCIDENT / sgEQUAL 等关系加驱动尺寸，inspect_sketch 会把 fix_count 计入验收。",
    "code": "# 允许：明确固定参考几何\nmodel.SketchAddConstraints(\"sgFIXED\")\n# 禁止：批量 Fix 全部实体冒充完全定义\n# 应改用几何关系 + 驱动尺寸：\nmodel.SketchAddConstraints(\"sgHORIZONTAL\")\nmodel.SketchAddConstraints(\"sgCOINCIDENT\")",
    "source": "references/part-modeling.md"
  },
  {
    "id": "review-inspect-model-sketches",
    "category": "review",
    "title": "回读已保存模型全部草图",
    "body": "复杂草图应人工定义设计参数，再用 sw_sketch_quality.inspect_model_sketches(model) 验收：它遍历 ProfileFeature 与 3DProfileFeature，逐个回读约束状态、尺寸名、fix_count，并检查特征是否被下游特征消费（dangling）。没有尺寸、悬空或证据不足都要复核。",
    "code": "from sw_sketch_quality import inspect_model_sketches\n\nfor record in inspect_model_sketches(model):\n    print(record[\"name\"], record[\"status\"], record.get(\"consumed_by\"), record.get(\"dangling\"))",
    "source": "scripts/sw_sketch_quality.py"
  },
  {
    "id": "feature-extrusion3-parameter-order",
    "category": "feature",
    "title": "长参数拉伸按文档顺序",
    "body": "FeatureExtrusion3 按 Sd, Flip, Dir, T1, T2, D1, D2, Dchk1, Dchk2, Ddir1, Ddir2, Dang1, Dang2, OffsetReverse1, OffsetReverse2, TranslateSurface, Merge, UseFeatScope, UseAutoSelect, T0, StartOffset 顺序传参。T1/T2 取 0=swEndCondBlind 给定深度、1=swEndCondThroughAll 完全贯穿、5=swEndCondUpToSurface、6=swEndCondMidPlane 两侧对称、7=swEndCondUpToBody。D1 深度是米、Dang1 拔模角是弧度。",
    "code": "from sw_connect import mm\nfrom sw_part import extrude_boss\n\n# Sd, Flip, Dir, T1, T2, D1, D2, Dchk1, Dchk2, Ddir1, Ddir2, Dang1, Dang2,\n# OffsetReverse1, OffsetReverse2, TranslateSurface, Merge, UseFeatScope,\n# UseAutoSelect, T0, StartOffset\nfeature = extrude_boss(model, sketch_name, mm(8), direction=True, merge=True)\nif feature is None:\n    raise RuntimeError(\"凸台拉伸失败\")",
    "source": "references/part-modeling.md"
  },
  {
    "id": "feature-cut4-through-all",
    "category": "feature",
    "title": "切除完全贯穿与翻转回退",
    "body": "FeatureCut4 参数多，终止条件、翻转方向、FlipSide、NormalCut 与选择集任一处不匹配都会静默返回 None，不要凭记忆手拼。sw_part.extrude_cut 约定 depth=0 表示完全贯穿（内部把终止条件置为 1，深度填占位值），失败时先翻转 flip 再判定。",
    "code": "from sw_part import extrude_cut\n\nfeature = extrude_cut(model, sketch_name, 0)          # depth=0 -> 完全贯穿\nif feature is None:\n    feature = extrude_cut(model, sketch_name, 0, direction=True, flip=True)\nif feature is None:\n    raise RuntimeError(\"切除失败：检查草图、方向或终止条件\")",
    "source": "references/troubleshooting.md"
  },
  {
    "id": "feature-return-none-check",
    "category": "error",
    "title": "特征返回值判空而不是判真",
    "body": "SolidWorks 大多数特征 API 失败时返回 None。不要写 if feature: 就继续保存，也不要把空返回值当成功；每次创建特征后检查，失败就中止或显式降级，不要继续保存交付文件。",
    "code": "from sw_connect import mm\nfrom sw_part import extrude_boss\n\nfeature = extrude_boss(model, sketch_ref, mm(8))\nif feature is None:\n    raise RuntimeError(\"拉伸失败：检查草图是否闭合、方向是否正确、深度是否非零\")",
    "source": "references/troubleshooting.md"
  },
  {
    "id": "api-featuremanager-naming",
    "category": "api",
    "title": "特征名多语言且不可作验收",
    "body": "特征名随界面语言变化（凸台-拉伸1、切除-拉伸1），只能作日志不能作验收依据；选草图走「活动草图引用 → 缓存引用 → FeatureByName → SelectByID2(\\\"SKETCH\\\")」。线性阵列委托 sw_pattern，用 20 参数 FeatureLinearPattern4 并挑与方向平行的真实直边；圆周阵列必须传明确轴名称或实体，InsertAxis2 不是 FeatureManager 成员。",
    "code": "from sw_assembly import iter_feature_tree\nfrom sw_connect import get_com_member\n\nfor feature, depth in iter_feature_tree(model):\n    print(depth, get_com_member(feature, \"Name\"), get_com_member(feature, \"GetTypeName2\"))",
    "source": "references/part-modeling.md"
  },
  {
    "id": "error-fillet-four-params",
    "category": "error",
    "title": "FeatureFillet 只接受四参数",
    "body": "IFeatureManager::FeatureFillet(Options, Radius, R1, R2) 只有 4 个参数，Options 常用 195；在末尾补三个 None 传 7 个参数会在 SW2024 和 2026 上抛「非选择性的参数」0x8002000F。函数签名说明里的 Rarray1/2/3 不是这个调用点的参数。",
    "code": "from sw_connect import mm\nfrom sw_edge_select import select_edges\nfrom sw_part import fillet\n\nselection = select_edges(model, {\"axis\": \"z\", \"convex_only\": True})\nif selection[\"status\"] != \"ok\":\n    raise RuntimeError(f\"未选中边线: {selection['errors']}\")\nfeature = fillet(model, mm(4))    # 内部调用 FeatureFillet(195, radius, 0, 0)",
    "source": "references/edge-selection.md"
  },
  {
    "id": "error-fillet-empty-selection",
    "category": "error",
    "title": "空选择集圆角会切错轮廓",
    "body": "选择集为空时 SolidWorks 会对「当前轮廓」执行圆角，产生难以排查的错误特征，而且不报错。sw_part.fillet() 已在选择集数量 <=0 时抛 ValueError 并提示改用 select_edges()，自己的选边代码要照抄这个校验。",
    "code": "from sw_connect import mm\nfrom sw_part import fillet\n\ntry:\n    fillet(model, mm(4))          # 未选边 -> ValueError\nexcept ValueError as error:\n    print(\"先选边:\", error)",
    "source": "references/edge-selection.md"
  },
  {
    "id": "feature-insertfeaturechamfer-args",
    "category": "feature",
    "title": "倒角八参数与弧度角度",
    "body": "InsertFeatureChamfer(Options, ChamferType, Width, Angle, OtherDist, VertexDist1, VertexDist2, VertexDist3)：Options=4 表示角度距离，ChamferType=1 表示等距离，Width 是米、Angle 是弧度。sw_part.chamfer(distance, angle_deg) 负责把度转弧度并补齐后三个顶点距离为 0。",
    "code": "from sw_connect import mm\nfrom sw_part import chamfer\n\n# InsertFeatureChamfer(4, 1, Width, Angle, OtherDist, VertexDist1, VertexDist2, VertexDist3)\nfeature = chamfer(model, mm(1), angle_deg=45)",
    "source": "references/part-modeling.md"
  },
  {
    "id": "feature-fillet-chamfer-order",
    "category": "feature",
    "title": "圆角倒角按阶段拆分执行",
    "body": "稳定顺序是「基础体 → 外轮廓圆角/倒角 → 孔槽切除 → 孔口倒角 → 审查」。同一模型上连续做多组圆角/倒角时，后一组可能选到前一组产生的相切边，每组前都要用 solidworks_list_edges 或 select_edges 复核当前拓扑。圆角失败应降级为保留直边模型并在报告里标注「外观圆角未应用」，不要让整条建模流程失败。",
    "code": "from sw_connect import mm\nfrom sw_edge_select import select_edges\nfrom sw_part import chamfer, extrude_boss, fillet\n\nboss = extrude_boss(model, sketch_ref, mm(20))          # 1) 基础体\nselect_edges(model, {\"axis\": \"z\", \"convex_only\": True})\nfillet(model, mm(6))                                     # 2) 外轮廓圆角\nfor center in hole_centers:\n    create_blind_hole(model, center, mm(6.6), mm(10))    # 3) 孔槽切除\nselect_edges(model, {\"circular\": True, \"diameter_mm\": 6.6, \"diameter_tolerance_mm\": 0.05})\nchamfer(model, mm(0.5))                                  # 4) 孔口倒角",
    "source": "references/edge-selection.md"
  },
  {
    "id": "feature-tangent-plane-slot",
    "category": "feature",
    "title": "圆柱表面槽用切向偏置面",
    "body": "键槽、长圆槽、局部沉槽在圆柱外表面时不要从中心基准面盲切，Front Plane 常穿过轴线，直接切会出现沿轴向的大平面剖口。做法是 InsertRefPlane(8, mm(半径), 0, 0, 0, 0) 建平行于 Front Plane 的切向参考面，在其上 sketch_slot 画槽，用盲切深度表达槽深，成功后隐藏临时参考面。",
    "code": "from sw_connect import create_empty_dispatch_variant, mm\nfrom sw_part import extrude_cut, sketch_slot\n\nplane = model.FeatureManager.InsertRefPlane(8, mm(radius_mm), 0, 0, 0, 0)\nplane.Name = \"Plane_Keyway_Tangent\"\nmodel.Extension.SelectByID2(plane.Name, \"PLANE\", 0, 0, 0, False, 0,\n                            create_empty_dispatch_variant(), 0)\nmodel.SketchManager.InsertSketch(True)\nsketch_name = model.SketchManager.ActiveSketch.Name\nsketch_slot(model, mm(x1), 0, mm(x2), 0, mm(slot_width_mm / 2))\nmodel.SketchManager.InsertSketch(True)\nfeature = extrude_cut(model, sketch_name, mm(depth_mm), direction=True, flip=True)",
    "source": "references/part-modeling.md"
  },
  {
    "id": "hole-params-in-meters",
    "category": "hole",
    "title": "孔特征参数全部用米",
    "body": "sw_hole_features 的 center/start/end 是目标草图平面的局部二维坐标，diameter、depth、counterbore_diameter 等全部期望米，建议统一由 sw_connect.mm() 转换；毫米字段只写进报告，不回传 COM。盲孔用 create_blind_hole(model, (x, y), diameter, depth, name=...)，两级复合孔用 create_counterbore_hole 的 hole_diameter/counterbore_diameter/counterbore_depth 命名参数。",
    "code": "from sw_connect import mm\nfrom sw_hole_features import create_blind_hole, create_counterbore_hole\n\nblind = create_blind_hole(model, (mm(20), mm(20)), mm(8), mm(10), name=\"H1_盲孔\")\ncounterbore = create_counterbore_hole(\n    model, (mm(50), mm(20)),\n    hole_diameter=mm(6), counterbore_diameter=mm(12),\n    counterbore_depth=mm(4), name=\"H2_沉孔\")",
    "source": "references/complex-hole-features.md"
  },
  {
    "id": "hole-evidence-dict-keys",
    "category": "hole",
    "title": "孔证据取 feature_names 键",
    "body": "HoleFeatureEvidence.to_dict() 的键是 feature_names（元组），没有 status 也没有 feature_name；写成 result.get(\\\"status\\\") 会把成功的孔判成失败。创建函数返回的是参数证据，不是几何验收结论。",
    "code": "from sw_connect import mm\nfrom sw_hole_features import create_through_hole\n\nresult = create_through_hole(model, center=(mm(10), mm(10)), diameter=mm(6.6))\nnames = result.to_dict()[\"feature_names\"]\nif not names:\n    raise RuntimeError(\"SolidWorks 未创建特征\")",
    "source": "references/troubleshooting.md"
  },
  {
    "id": "hole-countersink-entry-edge",
    "category": "hole",
    "title": "锥形沉头按入口圆边倒角",
    "body": "锥形沉头孔 = 通孔 + 通孔入口圆边的角度/距离倒角，入口边按圆心、半径和基准面位置筛选，不依赖临时边线名称；included_angle_deg 是包含角。倒角后必须看剖视图确认入口方向和角度是否正确。",
    "code": "from sw_connect import mm\nfrom sw_hole_features import create_countersink_hole\n\ncountersink = create_countersink_hole(\n    model, (mm(80), mm(20)),\n    hole_diameter=mm(5), countersink_diameter=mm(10),\n    included_angle_deg=90, name=\"H3_沉头\")",
    "source": "references/complex-hole-features.md"
  },
  {
    "id": "review-hole-geometry-evidence",
    "category": "review",
    "title": "孔位验收要做几何交叉复核",
    "body": "创建函数只给参数证据，交付前必须继续跑 sw_review.collect_geometry_measurements() 读 B-Rep 圆柱面、sw_review.validate_hole_positions() 验证孔径与孔轴线位置，并对盲孔深度、沉孔深度、沉头角度回读特征参数或看剖视图。半圆槽端部圆柱面要落在 slot_arc_candidates 里，不能计入圆孔数量；复合孔应在 compound_holes 中出现同轴多直径孔段。B-Rep 单独无法区分盲孔和通孔，必须与创建参数交叉验证。",
    "source": "references/complex-hole-features.md"
  },
  {
    "id": "api-byref-variant",
    "category": "api",
    "title": "输出参数用 VARIANT 包装",
    "body": "错误码、警告码、ErrorStatus 这类 by-ref 输出参数必须用 VARIANT(pythoncom.VT_BYREF | pythoncom.VT_I4, 0) 包装，直接传整数或 None 会抛 TypeError 或拿不到回写值。SaveAs 之后打印 errors.value / warnings.value 才能定位失败原因。",
    "code": "from win32com.client import VARIANT\nimport pythoncom\n\nerrors = VARIANT(pythoncom.VT_BYREF | pythoncom.VT_I4, 0)\nwarnings = VARIANT(pythoncom.VT_BYREF | pythoncom.VT_I4, 0)\nsuccess = model.Extension.SaveAs(path, 0, 1, None, errors, warnings)\nprint(f\"错误码: {errors.value}, 警告码: {warnings.value}\")",
    "source": "references/troubleshooting.md"
  },
  {
    "id": "api-safearray-material",
    "category": "api",
    "title": "材质颜色数组要 SAFEARRAY",
    "body": "把普通 Python list 直接传给 MaterialPropertyValues 会导致 COM 数组编组错位，装配体几乎只剩一种绿色；必须用 material_variant() 生成 VT_ARRAY | VT_R8。SetMaterialPropertyValues2 返回 void，不能用 bool() 判成功，要用 verify_appearance() 回读 RGB，截图前再 ClearSelection2(True) 清掉选择高亮。",
    "code": "from sw_appearance import set_component_appearance, verify_appearance\n\nset_component_appearance(component, \"signal_red\")\nassert verify_appearance(component, \"signal_red\")[\"ok\"]\nmodel.ClearSelection2(True)\nmodel.GraphicsRedraw2()",
    "source": "references/troubleshooting.md"
  },
  {
    "id": "api-pywin32-comtypes-packandgo",
    "category": "api",
    "title": "两套 COM 客户端分工",
    "body": "本机 SW2024/2026 + pywin32 会把 GetPackAndGo 的 [out, retval] IPackAndGo** 编组错位，零参数动态调用和显式 VT_BYREF|VT_DISPATCH 都可能拿不到返回指针。sw_delivery.pack_and_go() 先试 pywin32 官方零参数调用，抛签名错误时改用 comtypes 早绑定调用 IModelDocExtension.GetPackAndGo / SavePackAndGo；不要用 AddExternalDocuments 补装配体零件。",
    "code": "from sw_delivery import pack_and_go\n\nreport = pack_and_go(assembly, r\"E:\\delivery\\pack_and_go\", flatten=True)\nassert report[\"success\"], report",
    "source": "references/troubleshooting.md"
  },
  {
    "id": "error-hresult-connection",
    "category": "error",
    "title": "连接类 HRESULT 与 ProgID",
    "body": "-2147221005「无效的类字符串」= SolidWorks 未安装或 COM 未注册，可指定版本 ProgID（2024 用 SldWorks.Application.32，2026 用 .34）重试；-2147221021「操作不可用」= SolidWorks 未运行，改用 Dispatch 启动新实例。Python 位数必须与 SolidWorks 一致（通常 64 位），修订号 = (年份 - 2000) + 8。",
    "code": "import win32com.client\n\nsw = win32com.client.Dispatch(\"SldWorks.Application.32\")   # 2024\n# 2026 -> SldWorks.Application.34；修订号 = (年份 - 2000) + 8\nprint(sw.RevisionNumber())",
    "source": "references/troubleshooting.md"
  },
  {
    "id": "error-rebuild-recovery",
    "category": "error",
    "title": "重建失败与批量崩溃恢复",
    "body": "执行标记失败、重建失败、未知检查结果或人工复核未完成时不得宣称任务完成。大批量生成后 AddComponent4、保存和特征操作随机失败，先保存关键输出，再 sw.CloseAllDocuments(False) 清会话并分批重开，仍不稳定则记录失败组件和失败 API 后重启 SLDWORKS.exe。截图与验收前统一 ForceRebuild3(False) 加 ViewZoomtofit2。",
    "code": "model.ClearSelection2(True)\nmodel.ForceRebuild3(False)\nmodel.ViewZoomtofit2()",
    "source": "references/troubleshooting.md"
  },
  {
    "id": "assembly-add-component5-fallback",
    "category": "assembly",
    "title": "AddComponent 空返回回退",
    "body": "SW2024 中文版 + pywin32 下 AddComponent4() 可能无异常却返回 None；封装先走 AddComponent5() 的 8 参数签名，失败再回退 AddComponent4()。两者都为空时静默打开零件、重新激活装配体后重试；前提是零件文件真实存在、装配体是活动文档且零件已存盘。",
    "code": "from sw_assembly import add_component\ncomponent = add_component(asm_model, r\"E:\\parts\\base.SLDPRT\", x=0, y=0, z=0)\n# 底层稳定调用\ncomponent = asm_model.AddComponent5(CompPath, 0, \"\", False, ConfigName, X, Y, Z)",
    "source": "references/assembly.md"
  },
  {
    "id": "assembly-resolve-component-first",
    "category": "assembly",
    "title": "先解析组件再读面或建配合",
    "body": "轻化/压缩组件会让 IComponent2.GetModelDoc2() 返回 None，不要当成“零件没有特征”。做 Mate、读特征或拾面之前先 resolve_component()；SetSuppression2() 可能清空选择集，所以顺序是先解析再选实体。",
    "code": "from sw_assembly import find_component_by_name, resolve_component\ncomponent_a = find_component_by_name(asm, \"shaft\")\ncomponent_b = find_component_by_name(asm, \"bearing\")\nresolve_component(component_a)\nresolve_component(component_b)\npart = component_a.GetModelDoc2()",
    "source": "references/assembly.md"
  },
  {
    "id": "assembly-step-split-bbox-center",
    "category": "assembly",
    "title": "拆分 STEP 按包围盒中心插入",
    "body": "把复杂 STEP 拆件再装配时不要假设分件以局部原点表示，部分导出器保留实体绝对坐标，此时 AddComponent5(x=0,y=0,z=0) 会让所有分件按包围盒中心叠到装配原点。manifest 至少保存 label、step、color_hex、bbox.center_m 与 bbox.size_mm，按 bbox.center_m 插入。",
    "code": "center = item[\"bbox\"][\"center_m\"]\ncomponent = add_component(\n    assembly, item[\"native_path\"],\n    x=center[0], y=center[1], z=center[2], sw=session.sw,\n)",
    "source": "references/export.md"
  },
  {
    "id": "mate-get-corresponding-select",
    "category": "mate",
    "title": "装配上下文实体选择",
    "body": "零件上下文与装配体上下文不能混用，能拿到对象引用时优先 GetCorresponding() + Select2()，少依赖坐标点击。第一个实体 Select2(False, 1)、第二个用 Select2(True, 1) 追加，建 Mate 前确认 SelectionManager.GetSelectedObjectCount2(-1) == 2；选择标记普通 Mate/Gear 用 1、Width 用 16、Cam-Follower 用 8。",
    "code": "feature_a = get_component_feature(component_a, [\"前视基准面\", \"Front Plane\"])\nentity_a = get_assembly_entity(component_a, feature_a)\nentity_b = get_assembly_entity(component_b, feature_b)\nselect_entities_for_mate(asm, entity_a, entity_b, mark=1)\nassert asm.SelectionManager.GetSelectedObjectCount2(-1) == 2",
    "source": "references/assembly.md"
  },
  {
    "id": "mate-concentric-keep-rotation",
    "category": "mate",
    "title": "同心配合不锁旋转",
    "body": "旋转件只用一个同心 Mate 且 lock_rotation=False，再用一个平面重合或距离 Mate 限制轴向窜动；不要用三基准面把轴、齿轮、上盖完全锁死。固定件才允许用三基准面重合或距离 Mate 锁死。",
    "code": "add_concentric_mate_by_cylinders(\n    asm, shaft_comp, bearing_comp,\n    radius_a=(0.004, 0.006), radius_b=(0.004, 0.006),\n    name=\"shaft_bearing_concentric\", lock_rotation=False,\n)",
    "source": "references/assembly.md"
  },
  {
    "id": "mate-gear-real-ratio",
    "category": "mate",
    "title": "Gear Mate 按齿数建真实传动",
    "body": "齿轮联动用真实 Gear Mate（swMateGEAR=10），按齿数传 gear_num/gear_den，实体选齿轮轴线、孔圆柱面或轴。Gear Mate 只强制两个组件绕所选轴按比例相对转动，不负责防穿透，也不等同接触仿真。",
    "code": "add_gear_mate_by_cylinders(\n    asm, small_gear_comp, large_gear_comp,\n    teeth_a=18, teeth_b=26,\n    radius_a=(0.004, 0.008), radius_b=(0.004, 0.008),\n    name=\"small_large_gear_ratio_18_26\",\n)\nprint(collect_mate_feature_summary(asm))",
    "source": "references/assembly.md"
  },
  {
    "id": "mate-addmate5-variant-signature",
    "category": "mate",
    "title": "AddMate5 参数与错误码",
    "body": "AddMate5 是 15 参数签名（SW2015+），by-ref 错误码必须用 VARIANT(pythoncom.VT_BYREF | pythoncom.VT_I4, 0) 包装。距离单位米、角度单位弧度，无上下限时 distance_upper/lower 等于 distance，angle_upper/lower 同同名规则。",
    "code": "errors = VARIANT(pythoncom.VT_BYREF | pythoncom.VT_I4, 0)\nmate = asm_model.AddMate5(\n    mate_type, align, flip, distance, distance, distance,\n    gear_num, gear_den, angle, angle, angle,\n    for_positioning_only, lock_rotation, width_mate_option, errors,\n)",
    "source": "references/assembly.md"
  },
  {
    "id": "mate-feature-tree-verify",
    "category": "mate",
    "title": "遍历 MateGroup 验证真实配合",
    "body": "创建后用 collect_mate_feature_summary() 或遍历 MateGroup 子特征，确认 MateConcentric、MateGearDim 等真实 Mate 特征已写入特征树。脚本生成的 GIF 或预览视频只能证明可被驱动到多个位置，不等同于软件里可拖动。",
    "code": "summary = collect_mate_feature_summary(asm)\nfor item in summary.get(\"features\", []):\n    print(item)",
    "source": "references/assembly.md"
  },
  {
    "id": "motion-create-study-entry",
    "category": "motion",
    "title": "建真实运动算例",
    "body": "Motion 前先把装配约束收紧：静止件固定、旋转件同心未锁转且浮动，再用 create_motion_study(asm, name=..., duration=4.0) 建算例。目标是在时间轴里生成可计算、可播放的动画，不能用脚本假动画替代机械自由度。",
    "code": "from sw_motion import create_motion_study, calculate_and_play\nstudy = create_motion_study(asm, name=\"叶轮_60RPM_循环转动\", duration=4.0)\nok = calculate_and_play(study)",
    "source": "references/motion-study.md"
  },
  {
    "id": "motion-rotary-motor-fm78",
    "category": "motion",
    "title": "旋转马达 FM 78 与 RPM 单位",
    "body": "旋转马达用 study.CreateDefinition(78)（swFmAEMRotationalMotor）后 CreateFeature()。ConstantSpeedMotor(60.0) 的参数单位是 RPM，不要换算成 rad/s；DirectionReference 选静止轴的装配体上下文圆柱面最稳定，CreateFeature() 返回 None 时先查方向与载荷引用是否为装配体上下文实体。",
    "code": "SW_FM_AEM_ROTATIONAL_MOTOR = 78\nmotor_data = study.CreateDefinition(SW_FM_AEM_ROTATIONAL_MOTOR)\nmotor_data.DirectionReference = shaft_axis_face\nmotor_data.ConstantSpeedMotor(60.0)   # RPM\nmotor_data.RelativeComponent = stand_comp\nmotor_data.Location = rotor_face\nmotor_data.LoadReferences = (rotor_face,)\nmotor_feature = study.CreateFeature(motor_data)",
    "source": "references/motion-study.md"
  },
  {
    "id": "motion-results-not-outdated",
    "category": "motion",
    "title": "运动算例结果不过期才验收",
    "body": "计算后必须跑 validate_motion_studies()：算例真实存在可读、swmotionstudy.tlb 已加载、时长与马达数达标、GetResults() 返回结果对象、results_out_of_date 明确为 False。只看到时间轴、马达图标、播放动画或 Calculate=True 都不算验收，失败时必须阻止交付。",
    "code": "ok = calculate_and_play(study)\naudit = validate_motion_studies(\n    asm, study_name=\"叶轮_60RPM_循环转动\",\n    minimum_duration_seconds=4.0, minimum_motor_count=1, require_results=True,\n)\nassert audit[\"validation\"][\"status\"] == \"pass\"",
    "source": "references/motion-study.md"
  },
  {
    "id": "motion-dynamic-com-member",
    "category": "motion",
    "title": "运动算例动态 COM 成员兼容",
    "body": "IMotionStudyManager 在 swmotionstudy.tlb 而不在主 Interop 库；未生成 pywin32 包装时 GetMotionStudyManager、CreateMotionStudy、Activate/Calculate/Play 可能表现为属性，直接调用 CreateMotionStudy() 会报“找不到成员”。统一用 motion_member() 与 ensure_motion_type_library() 取成员；SetDuration/CreateDefinition/CreateFeature 通常仍是方法。",
    "code": "from sw_motion import ensure_motion_type_library, motion_member\nensure_motion_type_library()\nmotion_mgr = motion_member(asm.Extension, \"GetMotionStudyManager\")\nstudy = motion_member(motion_mgr, \"CreateMotionStudy\")\nmotion_member(study, \"SetDuration\", 4.0)\ncalculated = motion_member(study, \"Calculate\")",
    "source": "references/motion-study.md"
  },
  {
    "id": "motion-motor-dof-prerequisites",
    "category": "motion",
    "title": "马达失效先查自由度",
    "body": "马达只能驱动仍有旋转自由度的组件。常见失败：叶轮被 FixComponent() 固定、同心 Mate 建时 lock_rotation=True、又被多个基准面重合锁死、或选了零件上下文面而不是 GetCorresponding() 后的装配体面。推荐静止件固定、旋转件仅同心 + 一个轴向定位 Mate 且保持浮动。",
    "code": "add_concentric_mate_by_cylinders(\n    asm, shaft_comp, rotor_comp,\n    radius_a=(mm(4.5), mm(5.5)),\n    radius_b=(mm(10.5), mm(11.5)),\n    lock_rotation=False,\n)",
    "source": "references/motion-study.md"
  },
  {
    "id": "motion-drag-dof-verification",
    "category": "motion",
    "title": "自由度以软件内可拖动为准",
    "body": "最终验收要在 SolidWorks 打开 .SLDASM，用“移动零部件 / Move Component”拖动轴、齿轮或上盖；Gear Mate 正确时拖一个齿轮另一个按比例联动。拖不动依次查：零件是否固定、同心 Mate 是否勾了 Lock Rotation、是否被额外平面 Mate 锁死、Mate 是否报错或过定义。",
    "code": "# 拖不动时按此顺序排查（SolidWorks GUI：Move Component）\n# 1. 组件是否 FixComponent() 固定\n# 2. 同心 Mate 是否 lock_rotation=True\n# 3. 是否被额外基准面重合/距离 Mate 锁死\n# 4. Mate 是否报错或过定义",
    "source": "references/assembly.md"
  },
  {
    "id": "drawing-third-angle-views",
    "category": "drawing",
    "title": "标准三视图与视图方向比例",
    "body": "标准三视图用 Create3rdAngleViews2()/CreateFirstAngleViews2()；单个视图用 CreateDrawViewFromModelView3(ModelName, ViewName, X, Y, Z)，ViewName 取 *Front/*Back/*Top/*Bottom/*Left/*Right/*Isometric 等，放置位置单位米。比例用 view.ScaleRatio 元组，如 (1.0, 2.0) 即 1:2。",
    "code": "drawing.Create3rdAngleViews2(partPath)        # 第三角投影法\ndrawing.CreateFirstAngleViews2(partPath)      # 第一角投影法\nview = drawing.CreateDrawViewFromModelView3(ModelName, \"*Isometric\", X, Y, Z)\nview.ScaleRatio = (1.0, 2.0)                  # 1:2",
    "source": "references/drawing.md"
  },
  {
    "id": "drawing-model-annotations",
    "category": "drawing",
    "title": "尺寸链起点：模型尺寸导入",
    "body": "自动标注用 InsertModelAnnotations3(InsertType, AnnotationType, DuplicateDims, AutoArrange, UseDoc, UseView)，InsertType=0 表示整个模型，AnnotationType=32768 才是标记为工程图的模型尺寸（32 是几何公差）。SW2024/2026 动态 pywin32 代理把它暴露在工程图 IModelDoc2 上而非 IModelDocExtension，先试文档对象再兼容旧 Extension；它只导入已存在的 DisplayDimension，没有草图尺寸时先调 sw_part.auto_dimension_sketch()。",
    "code": "ok = drawing.InsertModelAnnotations3(\n    0,       # InsertType: 0=整个模型\n    32768,   # 标记为工程图的模型尺寸（32 是几何公差）\n    False,   # DuplicateDims\n    False,   # AutoArrange\n    False,   # UseDoc\n    True,    # UseView\n)",
    "source": "references/drawing.md"
  },
  {
    "id": "drawing-dimension-chain",
    "category": "drawing",
    "title": "手动尺寸链用 AddDimension2",
    "body": "手动尺寸链先按名称选择两个视图实体（第二个用 True 追加到选择集），再 AddDimension2(x, y, 0) 指定标注放置位置。返回 False 或复核不到尺寸实体时，不得把尺寸证据标为已验证。",
    "code": "drawing.Extension.SelectByID2(\"Edge1@View1\", \"EDGE\", 0, 0, 0, False, 0, None, 0)\ndrawing.Extension.SelectByID2(\"Edge2@View1\", \"EDGE\", 0, 0, 0, True, 0, None, 0)\ndrawing.AddDimension2(x, y, 0)",
    "source": "references/drawing.md"
  },
  {
    "id": "drawing-sheet-template-gb-title",
    "category": "drawing",
    "title": "GB 图框标题栏走图纸格式",
    "body": "新图纸用 NewSheet4(Name, PaperSize, TemplateIn, Scale1, Scale2, FirstAngle, Template, W, H, PropertySheet, 分区边距, Zone_Col, Zone_Row)，PaperSize 5=A4、6=A3、7=A2、8=A1、9=A0，TemplateIn=12 表示自定义。图框与标题栏通过图纸格式落地，再用 sheet.SetTemplateName(格式路径) 挂 .slddrt。",
    "code": "drawing.NewSheet4(\"GB-A3\", 6, 12, 1.0, 1.0, True,\n                  templatePath, W, H, \"\",\n                  0, 0, 0, 0, 0, 0)\nsheet = drawing.GetCurrentSheet()\nsheet.SetTemplateName(formatPath)   # .slddrt 图纸格式（图框/标题栏）",
    "source": "references/drawing.md"
  },
  {
    "id": "drawing-bom-table",
    "category": "drawing",
    "title": "BOM 表插入与类型选择",
    "body": "BOM 用 InsertBomTable4(TemplateName, X, Y, BomType, Configuration, TableAnchor, Hidden)，需给 .sldbomtbt 模板路径、插入位置、配置名、锚点与是否包含隐藏组件；BomType 1=顶层、2=仅零件、3=缩进。表格必须与标题栏、图框一起目视复核。",
    "code": "bom = drawing.InsertBomTable4(\n    TemplateName, X, Y,\n    1,              # BomType: 1=顶层, 2=仅零件, 3=缩进\n    Configuration, TableAnchor, False,\n)",
    "source": "references/drawing.md"
  },
  {
    "id": "drawing-pdf-sheets-export",
    "category": "drawing",
    "title": "工程图 PDF 按图纸导出",
    "body": "PDF 导出先 sw.GetExportFileData(1) 拿 IExportPdfData，用 pdf_data.SetSheets(0, sheet_names) 指定图纸（0=指定图纸），再 model.Extension.SaveAs(路径, 0, 1, pdf_data, errors, warnings)；errors 与 warnings 都要 VARIANT byref。",
    "code": "sw = model.GetSldWorksObject()\npdf_data = sw.GetExportFileData(1)               # swExportPDFData\npdf_data.SetSheets(0, drawing.GetSheetNames())   # 0=指定图纸\nerrors = VARIANT(pythoncom.VT_BYREF | pythoncom.VT_I4, 0)\nwarnings = VARIANT(pythoncom.VT_BYREF | pythoncom.VT_I4, 0)\nmodel.Extension.SaveAs(\"output.pdf\", 0, 1, pdf_data, errors, warnings)",
    "source": "references/drawing.md"
  },
  {
    "id": "drawing-layout-evidence-gate",
    "category": "drawing",
    "title": "尺寸文字边界只能估算并目视复核",
    "body": "IAnnotation 没有尺寸文字原生 bounding-box API，不要调用或宣称存在 GetBox()；sw_drawing.estimate_dimension_text_box() 以 GetPosition() 为中心，按 CharHeight/WidthFactor/CharSpacingFactor 与 IDisplayDimension.GetText() 估边界，报告必须写 box_source=estimated。即使无碰撞也返回 review_required / DRAWING_LAYOUT_ESTIMATED_EVIDENCE_REQUIRES_VISUAL_REVIEW，相交只标 DRAWING_LAYOUT_ESTIMATED_COLLISION_RISK 且 confirmed_collision=false；证据强度 PDF 矢量文字 span > COM 估算 > OCR，孔槽定位链、图框、标题栏与 BOM 仍需人工目视复核。",
    "code": "# 更强证据：先导出 PDF，再读真实矢量文字 span\nfrom sw_review import inspect_pdf_text_layout\nlayout = inspect_pdf_text_layout(r\"output.pdf\")\nprint(layout[\"status\"], layout.get(\"findings\"))\n# 报告字段固定：box_source=estimated, box_confidence=low|medium|unavailable",
    "source": "references/drawing.md"
  },
  {
    "id": "export-saveas-error-codes",
    "category": "export",
    "title": "SaveAs 错误码与警告码回读",
    "body": "SaveAs 必须回读 errors 与 warnings：错误码 5=swFileSaveFormatNotAvailable、6=swFileSaveAsDoNotOverwrite、9=swFileSaveAsInvalidFileExtension，1=只读、2=文件名为空、3=含 @。警告 1=RebuildError、2=NeedsRebuild、4=ViewsNeedUpdate，出现重建或视图警告要先修模型再交付。STEP/IGES/STL/Parasolid/DXF/DWG 不需要 ExportData，工程图 PDF 需要 IExportPdfData。",
    "code": "errors = VARIANT(pythoncom.VT_BYREF | pythoncom.VT_I4, 0)\nwarnings = VARIANT(pythoncom.VT_BYREF | pythoncom.VT_I4, 0)\nmodel.Extension.SaveAs(output_path, 0, 1, None, errors, warnings)",
    "source": "references/export.md"
  },
  {
    "id": "export-batch-sha256-audit",
    "category": "export",
    "title": "批量导出逐文件审计与活动文档核对",
    "body": "批量导出用 sw_export.batch_export_formats()，对每个输出记录 API 返回值、文件是否存在与字节数、文件签名是否本轮变化、原文档是否已被用户打开；默认不覆盖已有文件、不关闭用户文档，同名源文件撞目标名时直接阻止。每种格式导出前先激活源文档并回读 ActiveDoc.GetPathName()，因为 SW2024 的 STL 等导出器可能使用活动文档，路径不一致必须停止。",
    "code": "model = open_document(sw, input_path, silent=True)\nif model:\n    model.Extension.SaveAs(output_path, 0, 1, None, errors, warnings)\n    assert sw.ActiveDoc.GetPathName() == output_path\n    sw.CloseDoc(model.GetTitle())",
    "source": "references/export.md"
  },
  {
    "id": "delivery-pack-and-go-audit",
    "category": "delivery",
    "title": "Pack and Go 依赖审计",
    "body": "Pack and Go 用 GetPackAndGo() / SetSaveToName() / SavePackAndGo()；pywin32 零参数路径会报“非选择性的参数”，封装回退 comtypes 早绑定。当前文档必须已存盘、目标目录非空默认拒绝（需 overwrite=True），GetDocumentNames() 的保存前枚举不作为成功条件，应在保存后按本轮落盘文件与 GetDependencies2 审计；状态码非零、本轮无真实文件或暂存源缺失时不得标记成功。严格模式漏依赖返回 status=blocked 与 SW_PACK_AND_GO_DEPENDENCY_ENUMERATION_INCOMPLETE，默认暂存模式返回 status=pilot 与 SW_PACK_AND_GO_NATIVE_ENUMERATION_INCOMPLETE。",
    "code": "pkg = model.Extension.GetPackAndGo()      # pywin32 零参数可能报错\npkg.SetSaveToName(dest_dir, zip_name)\nmodel.Extension.SavePackAndGo()\n# 审计：GetDependencies2 + produced_this_run + 每文件大小与 SHA-256\n# 返回 missing_dependencies 非空即不能宣称完整交付",
    "source": "references/export.md"
  },
  {
    "id": "appearance-safearray-material",
    "category": "appearance",
    "title": "材质数组用 SAFEARRAY",
    "body": "九位材质数组必须以 SAFEARRAY(double) 传给 COM，直接把 Python list 赋给 MaterialPropertyValues 可能被错误编组，RGB 落入第 2/5/8 位，模型几乎只显示绿色。统一用 sw_appearance.material_variant()（VT_ARRAY | VT_R8）与 set_document_appearance()/set_feature_appearance()/set_component_appearance()。",
    "code": "from sw_appearance import material_variant, set_document_appearance\nset_document_appearance(model, \"iron_red\")        # 文档级基础色\nset_feature_appearance(feature, \"armor_gold\")     # 特征级覆盖\n# 配置选项：swThisConfiguration=1, swAllConfiguration=2, swSpecifyConfiguration=3",
    "source": "references/appearance.md"
  },
  {
    "id": "appearance-rgb-readback",
    "category": "appearance",
    "title": "外观成败以 RGB 回读为准",
    "body": "返回 void 的 setter 只要没抛 COM 异常即表示调用完成，不能写成 bool(method(...)) 判断成败；正确做法是每次写入后回读前三位 RGB，不匹配立即停止。apply_component_palette() 批量上色并生成逐组件审计，verify_appearance() 比对预期与回读值。",
    "code": "assert verify_appearance(model, \"iron_red\")[\"ok\"]\nreports = apply_component_palette([\n    (body_component, \"aqua_blue\"),\n    (glass_component, \"glass_tint\"),\n    (rear_light_component, \"signal_red\"),\n    (rim_component, \"silver\"),\n])\nassert all(item[\"ok\"] for item in reports)",
    "source": "references/appearance.md"
  },
  {
    "id": "appearance-clear-selection2",
    "category": "appearance",
    "title": "截图前 ClearSelection2",
    "body": "保存与截图前调用 ClearSelection2(True)，否则绿色选择高亮会覆盖真实外观、干扰视觉判断；预览前再次清除选择并重绘。sw_review.save_preview() 已内置该清理，但仍需检查一张彩色等轴测图和一张能看到灯组或轮毂的正投影视图。",
    "code": "assembly.ClearSelection2(True)\n# 保存前清理一次；预览截图前再清理并重绘\n# sw_review.save_preview() 已内置该清理",
    "source": "references/appearance.md"
  },
  {
    "id": "mesh-loadfile4-dispatch",
    "category": "mesh",
    "title": "网格导入 LoadFile4 路线",
    "body": "OBJ/STL 不要用 OpenDoc6() 当普通零件打开（部分 SW2024 环境返回 errors=2097152）；LoadFile4 第三个参数不能传 None，否则触发“类型不匹配”，稳定写法是 LoadFile4(path, \"r\", create_empty_dispatch_variant(), errors)。STEP/IGES 仍走 open_document() 的 GetImportFileData() + LoadFile4 路线，高面数外观模型默认导入为 graphics。",
    "code": "errors = VARIANT(pythoncom.VT_BYREF | pythoncom.VT_I4, 0)\nmodel = sw.LoadFile4(obj_path, \"r\", create_empty_dispatch_variant(), errors)\n# 命令行：python scripts\\sw_import_mesh_reference.py src.obj out.SLDPRT --units m --model-type graphics",
    "source": "references/mesh-reference-import.md"
  },
  {
    "id": "review-four-view-visual",
    "category": "review",
    "title": "四视图导出与目视复核",
    "body": "交付前 ForceRebuild3(False) + ViewZoomtofit2()，再用 run_review() 导出 isometric/front/top/right 四视图与 *_review_report.json，读 evaluation.status/score/issues 以及 checks.previews_created、previews_not_blank、expected_outputs_exist、feature_summary_available。自动评分 pass 只说明不是空白、文件存在，网格参考模型必须肉眼核对比例与车顶线、灯组、轮毂等关键特征；CLI 返回码 0=pass/warn、1=--fail-on-warn 下 warn、2=fail。",
    "code": "model.ForceRebuild3(False)\nmodel.ViewZoomtofit2()\nreport, report_path = run_review(\n    model, r\"C:\\temp\\solidworks_review\", basename=\"model\",\n    views=(\"isometric\", \"front\", \"top\", \"right\"),\n    expected_outputs=[r\"C:\\temp\\model.sldprt\", r\"C:\\temp\\model.step\"],\n)\nprint(report[\"evaluation\"], report[\"checks\"])",
    "source": "references/review.md"
  },
  {
    "id": "review-interference-detection",
    "category": "review",
    "title": "干涉检查与运动边界限位",
    "body": "Gear Mate 不防止齿轮实体穿透，只建立旋转比例关系；需要几何安全时用 InterferenceDetectionManager 或 GUI 干涉检查。GetInterferences() 执行计算，必须在读取数量、干涉体积和组件之后才调用 Done() 释放管理器；status=blocked 或 count=None 是证据未知，不能解释为零干涉。行程用 Limit Angle / Limit Distance 限制，关键位置可用 Mate Controller 保存。",
    "code": "import sys; sys.path.insert(0, r\"SKILL_DIR/scripts\")\nfrom sw_measure import inspect_interference\nresult = inspect_interference(asm)\nprint(result[\"status\"], result[\"interference_count\"], result[\"items\"])\n# status=blocked 或 count=None：证据未知，不能解释为零干涉",
    "source": "references/assembly.md"
  }
];
