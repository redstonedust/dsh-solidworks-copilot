/**
 * SolidWorks 副驾 — Client 半（Web UI）。
 *
 * 注册到 conversation.composer.dock：composer 下方的常驻小卡片。
 * 收起时是一行入口，展开后是五个标签页：
 * 模板 / 提示词 / 思路 / 技巧 / 门禁。
 * 「填入输入框」通过 slot 标准 prop `inputActions.setDraft()` 写回草稿。
 *
 * 本文件由 scripts/build-client.mjs 生成：源文件是 src/client.js，
 * 其中 `/* @swas-data *\/` 占位符在构建时替换为 catalog.js 的烘焙数据。
 */

window.__ModuleLoader__.load({
  id: 'dsh-solidworks-copilot',
  factory(require) {
    const React = require('react');
    const el = React.createElement;
    const useState = React.useState;
    const useMemo = React.useMemo;
    const useCallback = React.useCallback;

    const DATA = {"meta":{"skillId":"solidworks-automation","repo":"https://github.com/wzyn20051216/solidworks-automation-skill","skillEnv":"SOLIDWORKS_AUTOMATION_SKILL_DIR","defaultSkillDir":"C:\\Users\\<you>\\.agents\\skills\\solidworks-automation","verifiedVersions":["SolidWorks 2024","SolidWorks 2026"],"preflight":"python SKILL_DIR/scripts/sw_preflight.py","doctor":"python SKILL_DIR/scripts/cad_studio.py doctor","capabilitySource":"SKILL_DIR/capabilities.yaml","router":"python SKILL_DIR/scripts/backend_router.py --list","apiLookup":"python SKILL_DIR/scripts/sw_api_lookup.py <接口> <方法>","version":"0.1.0"},"templates":[{"id":"mounting-bracket","name":"安装板 / 支架","category":"part","summary":"生成 120×80×10、四角 Ø7 通孔的铝制安装板，输出 SLDPRT/STEP/四视图预览与审查报告。","difficulty":"basic","workflow":"mounting_bracket","capabilities":["part_and_features","holes_and_finishing","export_delivery"],"entry":"scripts/sw_part.py + scripts/sw_hole_features.py","references":["references/part-modeling.md","references/complex-hole-features.md","references/review.md"],"params":[{"key":"size","label":"外形尺寸 L×W×T (mm)","example":"120×80×10","required":true},{"key":"hole_diameter","label":"安装孔直径 (mm)","example":"7","required":true},{"key":"hole_centers","label":"孔中心坐标 (mm)","example":"(-48,-28)(-48,28)(48,-28)(48,28)","required":true},{"key":"material","label":"材料","example":"6061-T6","required":false},{"key":"edge_fillet","label":"四角圆角 R (mm)","example":"6","required":false}],"steps":["运行 python scripts/sw_preflight.py 自检；用 SolidWorksSession(version=2026).new_part() 新建零件，sketch_rectangle + extrude_boss(mm(10)) 拉伸出 120×80 板体。","按 references/complex-hole-features.md 用 sw_hole_features.create_hole_pattern 在基准面局部坐标 (±48, ±28) 创建 4 个 Ø7 通孔，再用 sw_part.chamfer 给孔口 C0.5 倒角。","sw_sketch_quality.fully_define_sketch 与 inspect_model_sketches 回读约束状态，sw_measure.collect_mass_properties 记录体积/质量。","session.save 保存 .sldprt，sw_export.export_to_step 导出 STEP，sw_review.run_review 输出 isometric/front/top/right 与 *_review_report.json。"],"checks":["collect_geometry_measurements 回读 4 个 Ø7 圆柱面，validate_hole_positions（位置容差 0.1 mm、孔径容差 0.05 mm）返回 status=pass。","collect_bounding_box 回读 120×80×10 mm（容差 0.01 mm），体积与 golden-workflows 验收值偏差 ≤0.05 mm³。","SLDPRT 与 STEP 落盘且字节数 >0，review 报告 evaluation.status 为 pass 或 warn，expected_outputs_exist=true。"],"risks":["孔位证据必须来自 B-Rep 圆柱面与孔轴线，不能只用创建参数。","圆角/倒角选边依赖几何筛选，失败时降级为直边并在交付摘要标注。","材料仅写入自定义属性，未做强度与表面处理校核。"],"keywords":["零件","建模","model","part","安装板 / 支架","mounting_bracket"],"promptFull":"# 目标\n{{task}}\n\n## 任务类型\n模板：安装板 / 支架（part｜难度 basic）｜工作流：mounting_bracket｜能力：part_and_features, holes_and_finishing, export_delivery\n\n## 技能与环境\n- 技能根目录：SKILL_DIR（SOLIDWORKS_AUTOMATION_SKILL_DIR，默认 C:\\Users\\<you>\\.agents\\skills\\solidworks-automation）\n- 入口自检：python SKILL_DIR/scripts/sw_preflight.py\n- 能力真源：SKILL_DIR/capabilities.yaml\n- 后端路由：python SKILL_DIR/scripts/backend_router.py --list\n- 参考文档：references/part-modeling.md、references/complex-hole-features.md、references/review.md\n- 复用脚本：scripts/sw_part.py + scripts/sw_hole_features.py\n\n## 输入参数\n- 外形尺寸 L×W×T (mm)：{{param:size}}\n- 安装孔直径 (mm)：{{param:hole_diameter}}\n- 孔中心坐标 (mm)：{{param:hole_centers}}\n- 材料：{{param:material}}（可选）\n- 四角圆角 R (mm)：{{param:edge_fillet}}（可选）\n\n## 执行步骤\n1. 运行 python scripts/sw_preflight.py 自检；用 SolidWorksSession(version=2026).new_part() 新建零件，sketch_rectangle + extrude_boss(mm(10)) 拉伸出 120×80 板体。\n2. 按 references/complex-hole-features.md 用 sw_hole_features.create_hole_pattern 在基准面局部坐标 (±48, ±28) 创建 4 个 Ø7 通孔，再用 sw_part.chamfer 给孔口 C0.5 倒角。\n3. sw_sketch_quality.fully_define_sketch 与 inspect_model_sketches 回读约束状态，sw_measure.collect_mass_properties 记录体积/质量。\n4. session.save 保存 .sldprt，sw_export.export_to_step 导出 STEP，sw_review.run_review 输出 isometric/front/top/right 与 *_review_report.json。\n\n## 验收证据（逐条给出实际结果，不要只说成功）\n- collect_geometry_measurements 回读 4 个 Ø7 圆柱面，validate_hole_positions（位置容差 0.1 mm、孔径容差 0.05 mm）返回 status=pass。\n- collect_bounding_box 回读 120×80×10 mm（容差 0.01 mm），体积与 golden-workflows 验收值偏差 ≤0.05 mm³。\n- SLDPRT 与 STEP 落盘且字节数 >0，review 报告 evaluation.status 为 pass 或 warn，expected_outputs_exist=true。\n\n## 风险与人工复核\n- 孔位证据必须来自 B-Rep 圆柱面与孔轴线，不能只用创建参数。\n- 圆角/倒角选边依赖几何筛选，失败时降级为直边并在交付摘要标注。\n- 材料仅写入自定义属性，未做强度与表面处理校核。\n\n## 交付物\n- 原生文件（.sldprt/.sldasm/.slddrw）+ 交换格式（.step/.stl/.pdf/.dxf）\n- 四视图预览图 + *_review_report.json（evaluation.status / issues / checks）\n- 每个产物给绝对路径与 SHA-256\n\n## 硬性约束\n- 先跑 python SKILL_DIR/scripts/sw_preflight.py 自检；SolidWorks 版本与界面语言先确认。\n- 能力等级以 SKILL_DIR/capabilities.yaml 为准；reference_only / not_implemented 不得作为无人值守交付。\n- API 一律使用米制；单位换算用 mm()/deg()，禁止把毫米直接传给 COM。\n- 未封装的接口先 python SKILL_DIR/scripts/sw_api_lookup.py <接口> <方法> 查证，禁止凭记忆猜长参数 COM 方法。\n- 草图用尺寸与关系驱动，禁止批量 Fix 冒充完全定义。\n- 每步检查 COM 返回值 None/False，失败要保留错误码并说明回退路径。\n- 生成或修改后必须导等轴测/前/俯/右四视图预览并目视复核。\n- 未验证能力、缺失依赖、假设参数必须显式标注 review_required。\n\n## 禁止\n- 不要用「保存成功」代替验收。\n- 不要改扩展名或写空文件伪造格式支持。\n- 不要把演示动画说成机械配合。\n- 不要在缺证据时宣称任务完成。","promptBrief":"# 目标\n{{task}}\n\n## 任务类型\n模板：安装板 / 支架（part｜难度 basic）｜工作流：mounting_bracket｜能力：part_and_features, holes_and_finishing, export_delivery\n\n## 技能与环境\n- 技能根目录：SKILL_DIR（SOLIDWORKS_AUTOMATION_SKILL_DIR，默认 C:\\Users\\<you>\\.agents\\skills\\solidworks-automation）\n- 入口自检：python SKILL_DIR/scripts/sw_preflight.py\n- 能力真源：SKILL_DIR/capabilities.yaml\n- 后端路由：python SKILL_DIR/scripts/backend_router.py --list\n- 参考文档：references/part-modeling.md、references/complex-hole-features.md、references/review.md\n- 复用脚本：scripts/sw_part.py + scripts/sw_hole_features.py\n\n## 输入参数\n- 外形尺寸 L×W×T (mm)：{{param:size}}\n- 安装孔直径 (mm)：{{param:hole_diameter}}\n- 孔中心坐标 (mm)：{{param:hole_centers}}\n- 材料：{{param:material}}（可选）\n- 四角圆角 R (mm)：{{param:edge_fillet}}（可选）\n\n## 执行步骤\n1. 运行 python scripts/sw_preflight.py 自检；用 SolidWorksSession(version=2026).new_part() 新建零件，sketch_rectangle + extrude_boss(mm(10)) 拉伸出 120×80 板体。\n2. 按 references/complex-hole-features.md 用 sw_hole_features.create_hole_pattern 在基准面局部坐标 (±48, ±28) 创建 4 个 Ø7 通孔，再用 sw_part.chamfer 给孔口 C0.5 倒角。\n3. sw_sketch_quality.fully_define_sketch 与 inspect_model_sketches 回读约束状态，sw_measure.collect_mass_properties 记录体积/质量。\n4. session.save 保存 .sldprt，sw_export.export_to_step 导出 STEP，sw_review.run_review 输出 isometric/front/top/right 与 *_review_report.json。\n\n## 验收证据（逐条给出实际结果，不要只说成功）\n- collect_geometry_measurements 回读 4 个 Ø7 圆柱面，validate_hole_positions（位置容差 0.1 mm、孔径容差 0.05 mm）返回 status=pass。\n- collect_bounding_box 回读 120×80×10 mm（容差 0.01 mm），体积与 golden-workflows 验收值偏差 ≤0.05 mm³。\n- SLDPRT 与 STEP 落盘且字节数 >0，review 报告 evaluation.status 为 pass 或 warn，expected_outputs_exist=true。\n\n## 硬性约束\n- 先跑 python SKILL_DIR/scripts/sw_preflight.py 自检；SolidWorks 版本与界面语言先确认。\n- 能力等级以 SKILL_DIR/capabilities.yaml 为准；reference_only / not_implemented 不得作为无人值守交付。\n- API 一律使用米制；单位换算用 mm()/deg()，禁止把毫米直接传给 COM。\n- 未封装的接口先 python SKILL_DIR/scripts/sw_api_lookup.py <接口> <方法> 查证，禁止凭记忆猜长参数 COM 方法。\n- 草图用尺寸与关系驱动，禁止批量 Fix 冒充完全定义。\n- 每步检查 COM 返回值 None/False，失败要保留错误码并说明回退路径。\n- 生成或修改后必须导等轴测/前/俯/右四视图预览并目视复核。\n- 未验证能力、缺失依赖、假设参数必须显式标注 review_required。\n\n## 禁止\n- 不要用「保存成功」代替验收。\n- 不要改扩展名或写空文件伪造格式支持。\n- 不要把演示动画说成机械配合。\n- 不要在缺证据时宣称任务完成。\n\n## 需要标注的复核点\n- 孔位证据必须来自 B-Rep 圆柱面与孔轴线，不能只用创建参数。\n- 圆角/倒角选边依赖几何筛选，失败时降级为直边并在交付摘要标注。\n- 材料仅写入自定义属性，未做强度与表面处理校核。"},{"id":"stepped-shaft","name":"阶梯轴 / 回转件","category":"part","summary":"按轴段参数表用半剖轮廓旋转生成 Ø56/Ø65 两段阶梯轴，可加键槽与轴端倒角。","difficulty":"standard","workflow":"sw_part.py::revolve_boss","capabilities":["part_and_features","holes_and_finishing"],"entry":"scripts/sw_part.py","references":["references/part-modeling.md"],"params":[{"key":"segments","label":"轴段表 start-end:Ø (mm)","example":"0-43:Ø56；43-113:Ø65","required":true},{"key":"keyway","label":"键槽 宽×深×长 (mm)","example":"14×5.5×40","required":false},{"key":"end_chamfer","label":"轴端倒角","example":"2×45°","required":false},{"key":"material","label":"材料与热处理","example":"45 钢调质 HB220","required":false}],"steps":["在 Front Plane 用 CreateCenterLine 画旋转轴，按 segments 半径逐段生成闭合半剖轮廓（references/part-modeling.md 的阶梯轴最小模式）。","调用 FeatureRevolve2(...True, 2*pi...) 生成回转主体，返回 None 立即停止，不逐段拉伸再合并。","需要键槽时按“圆柱表面长圆槽”做法：InsertRefPlane 建切向偏置面 + sketch_slot + extrude_cut 盲切，避免在中心基准面把轴剖开。","sw_part.chamfer 做轴端倒角，session.save 保存 .sldprt，run_review 导出四视图并检查轴肩与总长。"],"checks":["collect_bounding_box 回读总长 113 mm、最大外径 65 mm，容差 0.05 mm。","ForceRebuild3(False) 后特征树含 Revolve 与预期的 Cut-Extrude/Chamfer，无错误特征。","键槽宽度 14 mm 与深度 5.5 mm 由 B-Rep 平面/圆柱面测量证实，或用剖视图目视复核。"],"risks":["半剖轮廓必须闭合且不自交，缺中心线会导致旋转失败。","CreateSketchSlot 的宽度参数表现需实测复核对齐，制造槽宽以测量为准。","公差、形位公差与粗糙度只写属性，不扰动名义实体尺寸。"],"keywords":["零件","建模","model","part","阶梯轴 / 回转件","sw_part.py::revolve_boss"],"promptFull":"# 目标\n{{task}}\n\n## 任务类型\n模板：阶梯轴 / 回转件（part｜难度 standard）｜工作流：sw_part.py::revolve_boss｜能力：part_and_features, holes_and_finishing\n\n## 技能与环境\n- 技能根目录：SKILL_DIR（SOLIDWORKS_AUTOMATION_SKILL_DIR，默认 C:\\Users\\<you>\\.agents\\skills\\solidworks-automation）\n- 入口自检：python SKILL_DIR/scripts/sw_preflight.py\n- 能力真源：SKILL_DIR/capabilities.yaml\n- 后端路由：python SKILL_DIR/scripts/backend_router.py --list\n- 参考文档：references/part-modeling.md\n- 复用脚本：scripts/sw_part.py\n\n## 输入参数\n- 轴段表 start-end:Ø (mm)：{{param:segments}}\n- 键槽 宽×深×长 (mm)：{{param:keyway}}（可选）\n- 轴端倒角：{{param:end_chamfer}}（可选）\n- 材料与热处理：{{param:material}}（可选）\n\n## 执行步骤\n1. 在 Front Plane 用 CreateCenterLine 画旋转轴，按 segments 半径逐段生成闭合半剖轮廓（references/part-modeling.md 的阶梯轴最小模式）。\n2. 调用 FeatureRevolve2(...True, 2*pi...) 生成回转主体，返回 None 立即停止，不逐段拉伸再合并。\n3. 需要键槽时按“圆柱表面长圆槽”做法：InsertRefPlane 建切向偏置面 + sketch_slot + extrude_cut 盲切，避免在中心基准面把轴剖开。\n4. sw_part.chamfer 做轴端倒角，session.save 保存 .sldprt，run_review 导出四视图并检查轴肩与总长。\n\n## 验收证据（逐条给出实际结果，不要只说成功）\n- collect_bounding_box 回读总长 113 mm、最大外径 65 mm，容差 0.05 mm。\n- ForceRebuild3(False) 后特征树含 Revolve 与预期的 Cut-Extrude/Chamfer，无错误特征。\n- 键槽宽度 14 mm 与深度 5.5 mm 由 B-Rep 平面/圆柱面测量证实，或用剖视图目视复核。\n\n## 风险与人工复核\n- 半剖轮廓必须闭合且不自交，缺中心线会导致旋转失败。\n- CreateSketchSlot 的宽度参数表现需实测复核对齐，制造槽宽以测量为准。\n- 公差、形位公差与粗糙度只写属性，不扰动名义实体尺寸。\n\n## 交付物\n- 原生文件（.sldprt/.sldasm/.slddrw）+ 交换格式（.step/.stl/.pdf/.dxf）\n- 四视图预览图 + *_review_report.json（evaluation.status / issues / checks）\n- 每个产物给绝对路径与 SHA-256\n\n## 硬性约束\n- 先跑 python SKILL_DIR/scripts/sw_preflight.py 自检；SolidWorks 版本与界面语言先确认。\n- 能力等级以 SKILL_DIR/capabilities.yaml 为准；reference_only / not_implemented 不得作为无人值守交付。\n- API 一律使用米制；单位换算用 mm()/deg()，禁止把毫米直接传给 COM。\n- 未封装的接口先 python SKILL_DIR/scripts/sw_api_lookup.py <接口> <方法> 查证，禁止凭记忆猜长参数 COM 方法。\n- 草图用尺寸与关系驱动，禁止批量 Fix 冒充完全定义。\n- 每步检查 COM 返回值 None/False，失败要保留错误码并说明回退路径。\n- 生成或修改后必须导等轴测/前/俯/右四视图预览并目视复核。\n- 未验证能力、缺失依赖、假设参数必须显式标注 review_required。\n\n## 禁止\n- 不要用「保存成功」代替验收。\n- 不要改扩展名或写空文件伪造格式支持。\n- 不要把演示动画说成机械配合。\n- 不要在缺证据时宣称任务完成。","promptBrief":"# 目标\n{{task}}\n\n## 任务类型\n模板：阶梯轴 / 回转件（part｜难度 standard）｜工作流：sw_part.py::revolve_boss｜能力：part_and_features, holes_and_finishing\n\n## 技能与环境\n- 技能根目录：SKILL_DIR（SOLIDWORKS_AUTOMATION_SKILL_DIR，默认 C:\\Users\\<you>\\.agents\\skills\\solidworks-automation）\n- 入口自检：python SKILL_DIR/scripts/sw_preflight.py\n- 能力真源：SKILL_DIR/capabilities.yaml\n- 后端路由：python SKILL_DIR/scripts/backend_router.py --list\n- 参考文档：references/part-modeling.md\n- 复用脚本：scripts/sw_part.py\n\n## 输入参数\n- 轴段表 start-end:Ø (mm)：{{param:segments}}\n- 键槽 宽×深×长 (mm)：{{param:keyway}}（可选）\n- 轴端倒角：{{param:end_chamfer}}（可选）\n- 材料与热处理：{{param:material}}（可选）\n\n## 执行步骤\n1. 在 Front Plane 用 CreateCenterLine 画旋转轴，按 segments 半径逐段生成闭合半剖轮廓（references/part-modeling.md 的阶梯轴最小模式）。\n2. 调用 FeatureRevolve2(...True, 2*pi...) 生成回转主体，返回 None 立即停止，不逐段拉伸再合并。\n3. 需要键槽时按“圆柱表面长圆槽”做法：InsertRefPlane 建切向偏置面 + sketch_slot + extrude_cut 盲切，避免在中心基准面把轴剖开。\n4. sw_part.chamfer 做轴端倒角，session.save 保存 .sldprt，run_review 导出四视图并检查轴肩与总长。\n\n## 验收证据（逐条给出实际结果，不要只说成功）\n- collect_bounding_box 回读总长 113 mm、最大外径 65 mm，容差 0.05 mm。\n- ForceRebuild3(False) 后特征树含 Revolve 与预期的 Cut-Extrude/Chamfer，无错误特征。\n- 键槽宽度 14 mm 与深度 5.5 mm 由 B-Rep 平面/圆柱面测量证实，或用剖视图目视复核。\n\n## 硬性约束\n- 先跑 python SKILL_DIR/scripts/sw_preflight.py 自检；SolidWorks 版本与界面语言先确认。\n- 能力等级以 SKILL_DIR/capabilities.yaml 为准；reference_only / not_implemented 不得作为无人值守交付。\n- API 一律使用米制；单位换算用 mm()/deg()，禁止把毫米直接传给 COM。\n- 未封装的接口先 python SKILL_DIR/scripts/sw_api_lookup.py <接口> <方法> 查证，禁止凭记忆猜长参数 COM 方法。\n- 草图用尺寸与关系驱动，禁止批量 Fix 冒充完全定义。\n- 每步检查 COM 返回值 None/False，失败要保留错误码并说明回退路径。\n- 生成或修改后必须导等轴测/前/俯/右四视图预览并目视复核。\n- 未验证能力、缺失依赖、假设参数必须显式标注 review_required。\n\n## 禁止\n- 不要用「保存成功」代替验收。\n- 不要改扩展名或写空文件伪造格式支持。\n- 不要把演示动画说成机械配合。\n- 不要在缺证据时宣称任务完成。\n\n## 需要标注的复核点\n- 半剖轮廓必须闭合且不自交，缺中心线会导致旋转失败。\n- CreateSketchSlot 的宽度参数表现需实测复核对齐，制造槽宽以测量为准。\n- 公差、形位公差与粗糙度只写属性，不扰动名义实体尺寸。"},{"id":"flange-end-cap","name":"端盖 / 法兰盘","category":"hole","summary":"Ø120×12 法兰盘带 Ø40×6 止口与分布圆 Ø100 上 6 组 Ø9/Ø15 沉孔螺栓孔。","difficulty":"standard","workflow":"holes_slots_threads","capabilities":["part_and_features","holes_and_finishing","export_delivery"],"entry":"scripts/sw_part.py + scripts/sw_hole_features.py","references":["references/complex-hole-features.md","references/review.md"],"params":[{"key":"outer_diameter","label":"外径 × 厚度 (mm)","example":"Ø120×12","required":true},{"key":"spigot","label":"止口直径 × 深度 (mm)","example":"Ø40×6","required":true},{"key":"bolt_pattern","label":"螺栓孔","example":"分布圆 Ø100，6×Ø9，沉孔 Ø15 深 9","required":true},{"key":"material","label":"材料","example":"HT250","required":false}],"steps":["前视基准面 sketch_circle Ø120 后 extrude_boss(mm(12))；再 sketch_circle Ø40 extrude_cut 深 6 形成止口。","按 60° 均布计算 6 个分布圆 Ø100 上的孔位，用 create_hole_pattern 逐个调用 create_counterbore_hole(hole Ø9, 沉孔 Ø15, 深 9)。","collect_geometry_measurements 读取孔组与复合孔，validate_hole_positions 逐孔验收；run_review 出预览与报告，export_to_step 导出 STEP。"],"checks":["compound_holes 中出现 6 组 Ø9/Ø15 同轴孔段，孔数合计与设计一致。","孔中心分布圆半径 50 mm ±0.1 mm，相邻孔夹角 60° ±0.2°。","SLDPRT 与 STEP 落盘且字节数 >0，review expected_outputs_exist=true、previews_not_blank=true。"],"risks":["B-Rep 无法单独区分盲孔与通孔，沉孔深度必须回读创建参数或特征定义。","止口配合公差未定义，需人工按装配要求给 H7/g6 或间隙值。","密集孔阵列为逐孔特征，数量多时建模耗时显著增加。"],"keywords":["孔","hole","bore","端盖 / 法兰盘","holes_slots_threads"],"promptFull":"# 目标\n{{task}}\n\n## 任务类型\n模板：端盖 / 法兰盘（hole｜难度 standard）｜工作流：holes_slots_threads｜能力：part_and_features, holes_and_finishing, export_delivery\n\n## 技能与环境\n- 技能根目录：SKILL_DIR（SOLIDWORKS_AUTOMATION_SKILL_DIR，默认 C:\\Users\\<you>\\.agents\\skills\\solidworks-automation）\n- 入口自检：python SKILL_DIR/scripts/sw_preflight.py\n- 能力真源：SKILL_DIR/capabilities.yaml\n- 后端路由：python SKILL_DIR/scripts/backend_router.py --list\n- 参考文档：references/complex-hole-features.md、references/review.md\n- 复用脚本：scripts/sw_part.py + scripts/sw_hole_features.py\n\n## 输入参数\n- 外径 × 厚度 (mm)：{{param:outer_diameter}}\n- 止口直径 × 深度 (mm)：{{param:spigot}}\n- 螺栓孔：{{param:bolt_pattern}}\n- 材料：{{param:material}}（可选）\n\n## 执行步骤\n1. 前视基准面 sketch_circle Ø120 后 extrude_boss(mm(12))；再 sketch_circle Ø40 extrude_cut 深 6 形成止口。\n2. 按 60° 均布计算 6 个分布圆 Ø100 上的孔位，用 create_hole_pattern 逐个调用 create_counterbore_hole(hole Ø9, 沉孔 Ø15, 深 9)。\n3. collect_geometry_measurements 读取孔组与复合孔，validate_hole_positions 逐孔验收；run_review 出预览与报告，export_to_step 导出 STEP。\n\n## 验收证据（逐条给出实际结果，不要只说成功）\n- compound_holes 中出现 6 组 Ø9/Ø15 同轴孔段，孔数合计与设计一致。\n- 孔中心分布圆半径 50 mm ±0.1 mm，相邻孔夹角 60° ±0.2°。\n- SLDPRT 与 STEP 落盘且字节数 >0，review expected_outputs_exist=true、previews_not_blank=true。\n\n## 风险与人工复核\n- B-Rep 无法单独区分盲孔与通孔，沉孔深度必须回读创建参数或特征定义。\n- 止口配合公差未定义，需人工按装配要求给 H7/g6 或间隙值。\n- 密集孔阵列为逐孔特征，数量多时建模耗时显著增加。\n\n## 交付物\n- 原生文件（.sldprt/.sldasm/.slddrw）+ 交换格式（.step/.stl/.pdf/.dxf）\n- 四视图预览图 + *_review_report.json（evaluation.status / issues / checks）\n- 每个产物给绝对路径与 SHA-256\n\n## 硬性约束\n- 先跑 python SKILL_DIR/scripts/sw_preflight.py 自检；SolidWorks 版本与界面语言先确认。\n- 能力等级以 SKILL_DIR/capabilities.yaml 为准；reference_only / not_implemented 不得作为无人值守交付。\n- API 一律使用米制；单位换算用 mm()/deg()，禁止把毫米直接传给 COM。\n- 未封装的接口先 python SKILL_DIR/scripts/sw_api_lookup.py <接口> <方法> 查证，禁止凭记忆猜长参数 COM 方法。\n- 草图用尺寸与关系驱动，禁止批量 Fix 冒充完全定义。\n- 每步检查 COM 返回值 None/False，失败要保留错误码并说明回退路径。\n- 生成或修改后必须导等轴测/前/俯/右四视图预览并目视复核。\n- 未验证能力、缺失依赖、假设参数必须显式标注 review_required。\n\n## 禁止\n- 不要用「保存成功」代替验收。\n- 不要改扩展名或写空文件伪造格式支持。\n- 不要把演示动画说成机械配合。\n- 不要在缺证据时宣称任务完成。","promptBrief":"# 目标\n{{task}}\n\n## 任务类型\n模板：端盖 / 法兰盘（hole｜难度 standard）｜工作流：holes_slots_threads｜能力：part_and_features, holes_and_finishing, export_delivery\n\n## 技能与环境\n- 技能根目录：SKILL_DIR（SOLIDWORKS_AUTOMATION_SKILL_DIR，默认 C:\\Users\\<you>\\.agents\\skills\\solidworks-automation）\n- 入口自检：python SKILL_DIR/scripts/sw_preflight.py\n- 能力真源：SKILL_DIR/capabilities.yaml\n- 后端路由：python SKILL_DIR/scripts/backend_router.py --list\n- 参考文档：references/complex-hole-features.md、references/review.md\n- 复用脚本：scripts/sw_part.py + scripts/sw_hole_features.py\n\n## 输入参数\n- 外径 × 厚度 (mm)：{{param:outer_diameter}}\n- 止口直径 × 深度 (mm)：{{param:spigot}}\n- 螺栓孔：{{param:bolt_pattern}}\n- 材料：{{param:material}}（可选）\n\n## 执行步骤\n1. 前视基准面 sketch_circle Ø120 后 extrude_boss(mm(12))；再 sketch_circle Ø40 extrude_cut 深 6 形成止口。\n2. 按 60° 均布计算 6 个分布圆 Ø100 上的孔位，用 create_hole_pattern 逐个调用 create_counterbore_hole(hole Ø9, 沉孔 Ø15, 深 9)。\n3. collect_geometry_measurements 读取孔组与复合孔，validate_hole_positions 逐孔验收；run_review 出预览与报告，export_to_step 导出 STEP。\n\n## 验收证据（逐条给出实际结果，不要只说成功）\n- compound_holes 中出现 6 组 Ø9/Ø15 同轴孔段，孔数合计与设计一致。\n- 孔中心分布圆半径 50 mm ±0.1 mm，相邻孔夹角 60° ±0.2°。\n- SLDPRT 与 STEP 落盘且字节数 >0，review expected_outputs_exist=true、previews_not_blank=true。\n\n## 硬性约束\n- 先跑 python SKILL_DIR/scripts/sw_preflight.py 自检；SolidWorks 版本与界面语言先确认。\n- 能力等级以 SKILL_DIR/capabilities.yaml 为准；reference_only / not_implemented 不得作为无人值守交付。\n- API 一律使用米制；单位换算用 mm()/deg()，禁止把毫米直接传给 COM。\n- 未封装的接口先 python SKILL_DIR/scripts/sw_api_lookup.py <接口> <方法> 查证，禁止凭记忆猜长参数 COM 方法。\n- 草图用尺寸与关系驱动，禁止批量 Fix 冒充完全定义。\n- 每步检查 COM 返回值 None/False，失败要保留错误码并说明回退路径。\n- 生成或修改后必须导等轴测/前/俯/右四视图预览并目视复核。\n- 未验证能力、缺失依赖、假设参数必须显式标注 review_required。\n\n## 禁止\n- 不要用「保存成功」代替验收。\n- 不要改扩展名或写空文件伪造格式支持。\n- 不要把演示动画说成机械配合。\n- 不要在缺证据时宣称任务完成。\n\n## 需要标注的复核点\n- B-Rep 无法单独区分盲孔与通孔，沉孔深度必须回读创建参数或特征定义。\n- 止口配合公差未定义，需人工按装配要求给 H7/g6 或间隙值。\n- 密集孔阵列为逐孔特征，数量多时建模耗时显著增加。"},{"id":"spur-gear-m2-z24","name":"标准直齿齿轮","category":"gear","summary":"模数 2、24 齿、20° 压力角、齿宽 10、轴孔 Ø10 的标准外啮合直齿轮实体。","difficulty":"advanced","workflow":"sw_gear.py::create_external_spur_gear","capabilities":["external_spur_gear_geometry","part_and_features","export_delivery"],"entry":"scripts/sw_gear.py","references":["references/gears.md"],"params":[{"key":"module_mm","label":"模数 m (mm)","example":"2","required":true},{"key":"teeth","label":"齿数 z","example":"24","required":true},{"key":"pressure_angle_deg","label":"压力角 (°)","example":"20","required":true},{"key":"face_width_mm","label":"齿宽 (mm)","example":"10","required":true},{"key":"bore_diameter_mm","label":"轴孔直径 (mm)","example":"10","required":true}],"steps":["按 references/gears.md 预校验：分度圆 d=m·z=48、齿顶圆 da=52、齿根圆 df=43、基圆 db=d·cos20°，确认属标准全齿高外啮合直齿。","SpurGearSpec(module_mm=2.0, teeth=24, pressure_angle_deg=20.0, face_width_mm=10.0, bore_diameter_mm=10.0, involute_segments=14) 后调用 create_external_spur_gear(model, spec) 生成单实体齿廓。","保存 SLDPRT、export_to_step 导出 STEP、run_review 出四视图；关闭文档后重开，用 collect_geometry_measurements 回读 B-Rep 尺寸。"],"checks":["B-Rep 包围盒 52×52×10 mm（容差 0.02 mm），内圆柱面 Ø10 mm，实体数 solid=1。","evidence 记录解析尺寸、根切风险与 involute_segments，采样密度与耗时写入交付说明。","重开后尺寸与 STEP 落盘一致，四视图 review 报告 pass。"],"risks":["齿根为径向过渡加齿根圆弧，不是滚刀生成的精确 trochoid。","仅支持标准全齿高外啮合直齿；斜齿、锥齿、内齿、齿条、蜗轮蜗杆必须转专用路线。","不含变位、侧隙、修形、公差等级、材料与强度校核，能力保持 pilot/review_required。"],"keywords":["齿轮","gear","标准直齿齿轮","sw_gear.py::create_external_spur_gear"],"promptFull":"# 目标\n{{task}}\n\n## 任务类型\n模板：标准直齿齿轮（gear｜难度 advanced）｜工作流：sw_gear.py::create_external_spur_gear｜能力：external_spur_gear_geometry, part_and_features, export_delivery\n\n## 技能与环境\n- 技能根目录：SKILL_DIR（SOLIDWORKS_AUTOMATION_SKILL_DIR，默认 C:\\Users\\<you>\\.agents\\skills\\solidworks-automation）\n- 入口自检：python SKILL_DIR/scripts/sw_preflight.py\n- 能力真源：SKILL_DIR/capabilities.yaml\n- 后端路由：python SKILL_DIR/scripts/backend_router.py --list\n- 参考文档：references/gears.md\n- 复用脚本：scripts/sw_gear.py\n\n## 输入参数\n- 模数 m (mm)：{{param:module_mm}}\n- 齿数 z：{{param:teeth}}\n- 压力角 (°)：{{param:pressure_angle_deg}}\n- 齿宽 (mm)：{{param:face_width_mm}}\n- 轴孔直径 (mm)：{{param:bore_diameter_mm}}\n\n## 执行步骤\n1. 按 references/gears.md 预校验：分度圆 d=m·z=48、齿顶圆 da=52、齿根圆 df=43、基圆 db=d·cos20°，确认属标准全齿高外啮合直齿。\n2. SpurGearSpec(module_mm=2.0, teeth=24, pressure_angle_deg=20.0, face_width_mm=10.0, bore_diameter_mm=10.0, involute_segments=14) 后调用 create_external_spur_gear(model, spec) 生成单实体齿廓。\n3. 保存 SLDPRT、export_to_step 导出 STEP、run_review 出四视图；关闭文档后重开，用 collect_geometry_measurements 回读 B-Rep 尺寸。\n\n## 验收证据（逐条给出实际结果，不要只说成功）\n- B-Rep 包围盒 52×52×10 mm（容差 0.02 mm），内圆柱面 Ø10 mm，实体数 solid=1。\n- evidence 记录解析尺寸、根切风险与 involute_segments，采样密度与耗时写入交付说明。\n- 重开后尺寸与 STEP 落盘一致，四视图 review 报告 pass。\n\n## 风险与人工复核\n- 齿根为径向过渡加齿根圆弧，不是滚刀生成的精确 trochoid。\n- 仅支持标准全齿高外啮合直齿；斜齿、锥齿、内齿、齿条、蜗轮蜗杆必须转专用路线。\n- 不含变位、侧隙、修形、公差等级、材料与强度校核，能力保持 pilot/review_required。\n\n## 交付物\n- 原生文件（.sldprt/.sldasm/.slddrw）+ 交换格式（.step/.stl/.pdf/.dxf）\n- 四视图预览图 + *_review_report.json（evaluation.status / issues / checks）\n- 每个产物给绝对路径与 SHA-256\n\n## 硬性约束\n- 先跑 python SKILL_DIR/scripts/sw_preflight.py 自检；SolidWorks 版本与界面语言先确认。\n- 能力等级以 SKILL_DIR/capabilities.yaml 为准；reference_only / not_implemented 不得作为无人值守交付。\n- API 一律使用米制；单位换算用 mm()/deg()，禁止把毫米直接传给 COM。\n- 未封装的接口先 python SKILL_DIR/scripts/sw_api_lookup.py <接口> <方法> 查证，禁止凭记忆猜长参数 COM 方法。\n- 草图用尺寸与关系驱动，禁止批量 Fix 冒充完全定义。\n- 每步检查 COM 返回值 None/False，失败要保留错误码并说明回退路径。\n- 生成或修改后必须导等轴测/前/俯/右四视图预览并目视复核。\n- 未验证能力、缺失依赖、假设参数必须显式标注 review_required。\n\n## 禁止\n- 不要用「保存成功」代替验收。\n- 不要改扩展名或写空文件伪造格式支持。\n- 不要把演示动画说成机械配合。\n- 不要在缺证据时宣称任务完成。","promptBrief":"# 目标\n{{task}}\n\n## 任务类型\n模板：标准直齿齿轮（gear｜难度 advanced）｜工作流：sw_gear.py::create_external_spur_gear｜能力：external_spur_gear_geometry, part_and_features, export_delivery\n\n## 技能与环境\n- 技能根目录：SKILL_DIR（SOLIDWORKS_AUTOMATION_SKILL_DIR，默认 C:\\Users\\<you>\\.agents\\skills\\solidworks-automation）\n- 入口自检：python SKILL_DIR/scripts/sw_preflight.py\n- 能力真源：SKILL_DIR/capabilities.yaml\n- 后端路由：python SKILL_DIR/scripts/backend_router.py --list\n- 参考文档：references/gears.md\n- 复用脚本：scripts/sw_gear.py\n\n## 输入参数\n- 模数 m (mm)：{{param:module_mm}}\n- 齿数 z：{{param:teeth}}\n- 压力角 (°)：{{param:pressure_angle_deg}}\n- 齿宽 (mm)：{{param:face_width_mm}}\n- 轴孔直径 (mm)：{{param:bore_diameter_mm}}\n\n## 执行步骤\n1. 按 references/gears.md 预校验：分度圆 d=m·z=48、齿顶圆 da=52、齿根圆 df=43、基圆 db=d·cos20°，确认属标准全齿高外啮合直齿。\n2. SpurGearSpec(module_mm=2.0, teeth=24, pressure_angle_deg=20.0, face_width_mm=10.0, bore_diameter_mm=10.0, involute_segments=14) 后调用 create_external_spur_gear(model, spec) 生成单实体齿廓。\n3. 保存 SLDPRT、export_to_step 导出 STEP、run_review 出四视图；关闭文档后重开，用 collect_geometry_measurements 回读 B-Rep 尺寸。\n\n## 验收证据（逐条给出实际结果，不要只说成功）\n- B-Rep 包围盒 52×52×10 mm（容差 0.02 mm），内圆柱面 Ø10 mm，实体数 solid=1。\n- evidence 记录解析尺寸、根切风险与 involute_segments，采样密度与耗时写入交付说明。\n- 重开后尺寸与 STEP 落盘一致，四视图 review 报告 pass。\n\n## 硬性约束\n- 先跑 python SKILL_DIR/scripts/sw_preflight.py 自检；SolidWorks 版本与界面语言先确认。\n- 能力等级以 SKILL_DIR/capabilities.yaml 为准；reference_only / not_implemented 不得作为无人值守交付。\n- API 一律使用米制；单位换算用 mm()/deg()，禁止把毫米直接传给 COM。\n- 未封装的接口先 python SKILL_DIR/scripts/sw_api_lookup.py <接口> <方法> 查证，禁止凭记忆猜长参数 COM 方法。\n- 草图用尺寸与关系驱动，禁止批量 Fix 冒充完全定义。\n- 每步检查 COM 返回值 None/False，失败要保留错误码并说明回退路径。\n- 生成或修改后必须导等轴测/前/俯/右四视图预览并目视复核。\n- 未验证能力、缺失依赖、假设参数必须显式标注 review_required。\n\n## 禁止\n- 不要用「保存成功」代替验收。\n- 不要改扩展名或写空文件伪造格式支持。\n- 不要把演示动画说成机械配合。\n- 不要在缺证据时宣称任务完成。\n\n## 需要标注的复核点\n- 齿根为径向过渡加齿根圆弧，不是滚刀生成的精确 trochoid。\n- 仅支持标准全齿高外啮合直齿；斜齿、锥齿、内齿、齿条、蜗轮蜗杆必须转专用路线。\n- 不含变位、侧隙、修形、公差等级、材料与强度校核，能力保持 pilot/review_required。"},{"id":"threaded-hole-m6","name":"螺纹孔 / 攻丝底孔","category":"hole","summary":"M6×1 6H 右旋盲孔：Ø5 攻丝底孔 + Metric Tap 真实螺纹 + 孔口 C0.6 倒角，并给出螺纹表达证据。","difficulty":"standard","workflow":"holes_slots_threads","capabilities":["holes_and_finishing"],"entry":"subskills/solidworks-threaded-holes/scripts/create_threaded_hole_template.py","references":["subskills/solidworks-threaded-holes/SKILL.md","references/complex-hole-features.md"],"params":[{"key":"thread","label":"螺纹规格","example":"M6（底孔 Ø5.0）","required":true},{"key":"thread_depth","label":"螺纹深度 (mm)","example":"12","required":true},{"key":"pilot_depth","label":"底孔深度 (mm)","example":"16","required":true},{"key":"mouth_chamfer","label":"孔口倒角 (mm)","example":"0.6×45°","required":false},{"key":"thread_class","label":"公差等级 / 旋向","example":"6H / 右旋","required":false}],"steps":["进入 COM 前校验：底孔 Ø5.0 小于公称 Ø6，螺纹深 12 ≤ 底孔深 16 ≤ 板厚 16，孔位保留螺纹大径与倒角边界。","运行 python subskills/solidworks-threaded-holes/scripts/create_threaded_hole_template.py --thread M6 --block-thickness 16 --thread-depth 12 --mouth-chamfer 0.6 --output-dir OUT，脚本按盲孔底孔 → Metric Tap Thread → CosmeticThread 降级 → 孔口倒角执行。","重建后遍历特征树确认螺纹特征留在树中，读取 *_parameters.json 的 thread_attempts/thread_evidence/thread_status，再跑 run_review。"],"checks":["*_parameters.json 中 has_tap_drill_cut=true 且 has_mouth_chamfer=true，representation 为 real-thread/cosmetic-thread/可解释的 visible-helix，metadata-only 即阻断。","特征树含真实螺纹或装饰螺纹特征，底孔圆柱面回读 Ø5.0 mm（容差 0.05 mm）。","*.SLDPRT、*.step、*_parameters.json、*_review_report.json、*_isometric.bmp 均落盘，review 的 expected_outputs_exist 与 previews_not_blank 为 true。"],"risks":["Hole Wizard/Advanced Hole、外螺纹、英制/UN/NPT/BSP 与显式牙型仍为 pilot，需人工复核。","表外 ISO 规格必须显式给 --tap-drill，不得猜底孔。","贯穿孔必须用 swEndCondThroughAll，不能用“板厚 +1 mm”盲孔伪装。"],"keywords":["孔","hole","bore","螺纹孔 / 攻丝底孔","holes_slots_threads"],"promptFull":"# 目标\n{{task}}\n\n## 任务类型\n模板：螺纹孔 / 攻丝底孔（hole｜难度 standard）｜工作流：holes_slots_threads｜能力：holes_and_finishing\n\n## 技能与环境\n- 技能根目录：SKILL_DIR（SOLIDWORKS_AUTOMATION_SKILL_DIR，默认 C:\\Users\\<you>\\.agents\\skills\\solidworks-automation）\n- 入口自检：python SKILL_DIR/scripts/sw_preflight.py\n- 能力真源：SKILL_DIR/capabilities.yaml\n- 后端路由：python SKILL_DIR/scripts/backend_router.py --list\n- 参考文档：subskills/solidworks-threaded-holes/SKILL.md、references/complex-hole-features.md\n- 复用脚本：subskills/solidworks-threaded-holes/scripts/create_threaded_hole_template.py\n\n## 输入参数\n- 螺纹规格：{{param:thread}}\n- 螺纹深度 (mm)：{{param:thread_depth}}\n- 底孔深度 (mm)：{{param:pilot_depth}}\n- 孔口倒角 (mm)：{{param:mouth_chamfer}}（可选）\n- 公差等级 / 旋向：{{param:thread_class}}（可选）\n\n## 执行步骤\n1. 进入 COM 前校验：底孔 Ø5.0 小于公称 Ø6，螺纹深 12 ≤ 底孔深 16 ≤ 板厚 16，孔位保留螺纹大径与倒角边界。\n2. 运行 python subskills/solidworks-threaded-holes/scripts/create_threaded_hole_template.py --thread M6 --block-thickness 16 --thread-depth 12 --mouth-chamfer 0.6 --output-dir OUT，脚本按盲孔底孔 → Metric Tap Thread → CosmeticThread 降级 → 孔口倒角执行。\n3. 重建后遍历特征树确认螺纹特征留在树中，读取 *_parameters.json 的 thread_attempts/thread_evidence/thread_status，再跑 run_review。\n\n## 验收证据（逐条给出实际结果，不要只说成功）\n- *_parameters.json 中 has_tap_drill_cut=true 且 has_mouth_chamfer=true，representation 为 real-thread/cosmetic-thread/可解释的 visible-helix，metadata-only 即阻断。\n- 特征树含真实螺纹或装饰螺纹特征，底孔圆柱面回读 Ø5.0 mm（容差 0.05 mm）。\n- *.SLDPRT、*.step、*_parameters.json、*_review_report.json、*_isometric.bmp 均落盘，review 的 expected_outputs_exist 与 previews_not_blank 为 true。\n\n## 风险与人工复核\n- Hole Wizard/Advanced Hole、外螺纹、英制/UN/NPT/BSP 与显式牙型仍为 pilot，需人工复核。\n- 表外 ISO 规格必须显式给 --tap-drill，不得猜底孔。\n- 贯穿孔必须用 swEndCondThroughAll，不能用“板厚 +1 mm”盲孔伪装。\n\n## 交付物\n- 原生文件（.sldprt/.sldasm/.slddrw）+ 交换格式（.step/.stl/.pdf/.dxf）\n- 四视图预览图 + *_review_report.json（evaluation.status / issues / checks）\n- 每个产物给绝对路径与 SHA-256\n\n## 硬性约束\n- 先跑 python SKILL_DIR/scripts/sw_preflight.py 自检；SolidWorks 版本与界面语言先确认。\n- 能力等级以 SKILL_DIR/capabilities.yaml 为准；reference_only / not_implemented 不得作为无人值守交付。\n- API 一律使用米制；单位换算用 mm()/deg()，禁止把毫米直接传给 COM。\n- 未封装的接口先 python SKILL_DIR/scripts/sw_api_lookup.py <接口> <方法> 查证，禁止凭记忆猜长参数 COM 方法。\n- 草图用尺寸与关系驱动，禁止批量 Fix 冒充完全定义。\n- 每步检查 COM 返回值 None/False，失败要保留错误码并说明回退路径。\n- 生成或修改后必须导等轴测/前/俯/右四视图预览并目视复核。\n- 未验证能力、缺失依赖、假设参数必须显式标注 review_required。\n\n## 禁止\n- 不要用「保存成功」代替验收。\n- 不要改扩展名或写空文件伪造格式支持。\n- 不要把演示动画说成机械配合。\n- 不要在缺证据时宣称任务完成。","promptBrief":"# 目标\n{{task}}\n\n## 任务类型\n模板：螺纹孔 / 攻丝底孔（hole｜难度 standard）｜工作流：holes_slots_threads｜能力：holes_and_finishing\n\n## 技能与环境\n- 技能根目录：SKILL_DIR（SOLIDWORKS_AUTOMATION_SKILL_DIR，默认 C:\\Users\\<you>\\.agents\\skills\\solidworks-automation）\n- 入口自检：python SKILL_DIR/scripts/sw_preflight.py\n- 能力真源：SKILL_DIR/capabilities.yaml\n- 后端路由：python SKILL_DIR/scripts/backend_router.py --list\n- 参考文档：subskills/solidworks-threaded-holes/SKILL.md、references/complex-hole-features.md\n- 复用脚本：subskills/solidworks-threaded-holes/scripts/create_threaded_hole_template.py\n\n## 输入参数\n- 螺纹规格：{{param:thread}}\n- 螺纹深度 (mm)：{{param:thread_depth}}\n- 底孔深度 (mm)：{{param:pilot_depth}}\n- 孔口倒角 (mm)：{{param:mouth_chamfer}}（可选）\n- 公差等级 / 旋向：{{param:thread_class}}（可选）\n\n## 执行步骤\n1. 进入 COM 前校验：底孔 Ø5.0 小于公称 Ø6，螺纹深 12 ≤ 底孔深 16 ≤ 板厚 16，孔位保留螺纹大径与倒角边界。\n2. 运行 python subskills/solidworks-threaded-holes/scripts/create_threaded_hole_template.py --thread M6 --block-thickness 16 --thread-depth 12 --mouth-chamfer 0.6 --output-dir OUT，脚本按盲孔底孔 → Metric Tap Thread → CosmeticThread 降级 → 孔口倒角执行。\n3. 重建后遍历特征树确认螺纹特征留在树中，读取 *_parameters.json 的 thread_attempts/thread_evidence/thread_status，再跑 run_review。\n\n## 验收证据（逐条给出实际结果，不要只说成功）\n- *_parameters.json 中 has_tap_drill_cut=true 且 has_mouth_chamfer=true，representation 为 real-thread/cosmetic-thread/可解释的 visible-helix，metadata-only 即阻断。\n- 特征树含真实螺纹或装饰螺纹特征，底孔圆柱面回读 Ø5.0 mm（容差 0.05 mm）。\n- *.SLDPRT、*.step、*_parameters.json、*_review_report.json、*_isometric.bmp 均落盘，review 的 expected_outputs_exist 与 previews_not_blank 为 true。\n\n## 硬性约束\n- 先跑 python SKILL_DIR/scripts/sw_preflight.py 自检；SolidWorks 版本与界面语言先确认。\n- 能力等级以 SKILL_DIR/capabilities.yaml 为准；reference_only / not_implemented 不得作为无人值守交付。\n- API 一律使用米制；单位换算用 mm()/deg()，禁止把毫米直接传给 COM。\n- 未封装的接口先 python SKILL_DIR/scripts/sw_api_lookup.py <接口> <方法> 查证，禁止凭记忆猜长参数 COM 方法。\n- 草图用尺寸与关系驱动，禁止批量 Fix 冒充完全定义。\n- 每步检查 COM 返回值 None/False，失败要保留错误码并说明回退路径。\n- 生成或修改后必须导等轴测/前/俯/右四视图预览并目视复核。\n- 未验证能力、缺失依赖、假设参数必须显式标注 review_required。\n\n## 禁止\n- 不要用「保存成功」代替验收。\n- 不要改扩展名或写空文件伪造格式支持。\n- 不要把演示动画说成机械配合。\n- 不要在缺证据时宣称任务完成。\n\n## 需要标注的复核点\n- Hole Wizard/Advanced Hole、外螺纹、英制/UN/NPT/BSP 与显式牙型仍为 pilot，需人工复核。\n- 表外 ISO 规格必须显式给 --tap-drill，不得猜底孔。\n- 贯穿孔必须用 swEndCondThroughAll，不能用“板厚 +1 mm”盲孔伪装。"},{"id":"counterbore-countersink-slot","name":"沉孔 / 沉头孔与槽","category":"hole","summary":"同一块 100×60×10 板上生成 Ø6+Ø12 沉孔、Ø5+Ø10×90° 沉头孔与 10 mm 宽半圆端槽。","difficulty":"standard","workflow":"holes_slots_threads","capabilities":["holes_and_finishing","geometry_and_delivery_review"],"entry":"scripts/sw_hole_features.py","references":["references/complex-hole-features.md","references/review.md"],"params":[{"key":"plate","label":"板件尺寸 (mm)","example":"100×60×10","required":true},{"key":"counterbore","label":"沉孔 通孔/沉孔×深 (mm)","example":"Ø6 / Ø12×4","required":true},{"key":"countersink","label":"沉头孔 通孔/锥口×角","example":"Ø5 / Ø10×90°","required":true},{"key":"slot","label":"半圆端槽 宽×端弧圆心距 (mm)","example":"宽 10，圆心距 20","required":true}],"steps":["前视基准面 sketch_rectangle 拉伸出 100×60×10 板体，作为孔槽统一基准面。","create_counterbore_hole((mm(20),mm(20)), 6, 12, 4)、create_countersink_hole((mm(50),mm(20)), 5, 10, 90)、create_semicircular_slot((mm(20),mm(45)),(mm(50),mm(45)), width=10, depth=0)。","collect_geometry_measurements 区分 hole_groups、compound_holes、slot_arc_candidates；validate_hole_positions 逐孔验收，并导出剖视图确认盲孔/沉头方向。"],"checks":["compound_holes 含 Ø6/Ø12 同轴孔段；slot_arc_candidates 含 2 个槽端圆柱面且不计入圆孔数量。","槽宽 10 mm、总长 30 mm（端弧圆心距 20 + 槽宽 10）由 B-Rep 测量，容差 0.1 mm。","沉头 90° 包含角由倒角特征参数或剖视图复核，孔口无崩边。"],"risks":["B-Rep 不能单独可靠区分盲孔与通孔，必须与创建参数交叉验证。","锥形沉头复用入口圆边倒角，方向错误需翻转并重看剖视。","孔阵列为逐孔特征，规则密排后续应改用 linear_pattern/circular_pattern。"],"keywords":["孔","hole","bore","沉孔 / 沉头孔与槽","holes_slots_threads"],"promptFull":"# 目标\n{{task}}\n\n## 任务类型\n模板：沉孔 / 沉头孔与槽（hole｜难度 standard）｜工作流：holes_slots_threads｜能力：holes_and_finishing, geometry_and_delivery_review\n\n## 技能与环境\n- 技能根目录：SKILL_DIR（SOLIDWORKS_AUTOMATION_SKILL_DIR，默认 C:\\Users\\<you>\\.agents\\skills\\solidworks-automation）\n- 入口自检：python SKILL_DIR/scripts/sw_preflight.py\n- 能力真源：SKILL_DIR/capabilities.yaml\n- 后端路由：python SKILL_DIR/scripts/backend_router.py --list\n- 参考文档：references/complex-hole-features.md、references/review.md\n- 复用脚本：scripts/sw_hole_features.py\n\n## 输入参数\n- 板件尺寸 (mm)：{{param:plate}}\n- 沉孔 通孔/沉孔×深 (mm)：{{param:counterbore}}\n- 沉头孔 通孔/锥口×角：{{param:countersink}}\n- 半圆端槽 宽×端弧圆心距 (mm)：{{param:slot}}\n\n## 执行步骤\n1. 前视基准面 sketch_rectangle 拉伸出 100×60×10 板体，作为孔槽统一基准面。\n2. create_counterbore_hole((mm(20),mm(20)), 6, 12, 4)、create_countersink_hole((mm(50),mm(20)), 5, 10, 90)、create_semicircular_slot((mm(20),mm(45)),(mm(50),mm(45)), width=10, depth=0)。\n3. collect_geometry_measurements 区分 hole_groups、compound_holes、slot_arc_candidates；validate_hole_positions 逐孔验收，并导出剖视图确认盲孔/沉头方向。\n\n## 验收证据（逐条给出实际结果，不要只说成功）\n- compound_holes 含 Ø6/Ø12 同轴孔段；slot_arc_candidates 含 2 个槽端圆柱面且不计入圆孔数量。\n- 槽宽 10 mm、总长 30 mm（端弧圆心距 20 + 槽宽 10）由 B-Rep 测量，容差 0.1 mm。\n- 沉头 90° 包含角由倒角特征参数或剖视图复核，孔口无崩边。\n\n## 风险与人工复核\n- B-Rep 不能单独可靠区分盲孔与通孔，必须与创建参数交叉验证。\n- 锥形沉头复用入口圆边倒角，方向错误需翻转并重看剖视。\n- 孔阵列为逐孔特征，规则密排后续应改用 linear_pattern/circular_pattern。\n\n## 交付物\n- 原生文件（.sldprt/.sldasm/.slddrw）+ 交换格式（.step/.stl/.pdf/.dxf）\n- 四视图预览图 + *_review_report.json（evaluation.status / issues / checks）\n- 每个产物给绝对路径与 SHA-256\n\n## 硬性约束\n- 先跑 python SKILL_DIR/scripts/sw_preflight.py 自检；SolidWorks 版本与界面语言先确认。\n- 能力等级以 SKILL_DIR/capabilities.yaml 为准；reference_only / not_implemented 不得作为无人值守交付。\n- API 一律使用米制；单位换算用 mm()/deg()，禁止把毫米直接传给 COM。\n- 未封装的接口先 python SKILL_DIR/scripts/sw_api_lookup.py <接口> <方法> 查证，禁止凭记忆猜长参数 COM 方法。\n- 草图用尺寸与关系驱动，禁止批量 Fix 冒充完全定义。\n- 每步检查 COM 返回值 None/False，失败要保留错误码并说明回退路径。\n- 生成或修改后必须导等轴测/前/俯/右四视图预览并目视复核。\n- 未验证能力、缺失依赖、假设参数必须显式标注 review_required。\n\n## 禁止\n- 不要用「保存成功」代替验收。\n- 不要改扩展名或写空文件伪造格式支持。\n- 不要把演示动画说成机械配合。\n- 不要在缺证据时宣称任务完成。","promptBrief":"# 目标\n{{task}}\n\n## 任务类型\n模板：沉孔 / 沉头孔与槽（hole｜难度 standard）｜工作流：holes_slots_threads｜能力：holes_and_finishing, geometry_and_delivery_review\n\n## 技能与环境\n- 技能根目录：SKILL_DIR（SOLIDWORKS_AUTOMATION_SKILL_DIR，默认 C:\\Users\\<you>\\.agents\\skills\\solidworks-automation）\n- 入口自检：python SKILL_DIR/scripts/sw_preflight.py\n- 能力真源：SKILL_DIR/capabilities.yaml\n- 后端路由：python SKILL_DIR/scripts/backend_router.py --list\n- 参考文档：references/complex-hole-features.md、references/review.md\n- 复用脚本：scripts/sw_hole_features.py\n\n## 输入参数\n- 板件尺寸 (mm)：{{param:plate}}\n- 沉孔 通孔/沉孔×深 (mm)：{{param:counterbore}}\n- 沉头孔 通孔/锥口×角：{{param:countersink}}\n- 半圆端槽 宽×端弧圆心距 (mm)：{{param:slot}}\n\n## 执行步骤\n1. 前视基准面 sketch_rectangle 拉伸出 100×60×10 板体，作为孔槽统一基准面。\n2. create_counterbore_hole((mm(20),mm(20)), 6, 12, 4)、create_countersink_hole((mm(50),mm(20)), 5, 10, 90)、create_semicircular_slot((mm(20),mm(45)),(mm(50),mm(45)), width=10, depth=0)。\n3. collect_geometry_measurements 区分 hole_groups、compound_holes、slot_arc_candidates；validate_hole_positions 逐孔验收，并导出剖视图确认盲孔/沉头方向。\n\n## 验收证据（逐条给出实际结果，不要只说成功）\n- compound_holes 含 Ø6/Ø12 同轴孔段；slot_arc_candidates 含 2 个槽端圆柱面且不计入圆孔数量。\n- 槽宽 10 mm、总长 30 mm（端弧圆心距 20 + 槽宽 10）由 B-Rep 测量，容差 0.1 mm。\n- 沉头 90° 包含角由倒角特征参数或剖视图复核，孔口无崩边。\n\n## 硬性约束\n- 先跑 python SKILL_DIR/scripts/sw_preflight.py 自检；SolidWorks 版本与界面语言先确认。\n- 能力等级以 SKILL_DIR/capabilities.yaml 为准；reference_only / not_implemented 不得作为无人值守交付。\n- API 一律使用米制；单位换算用 mm()/deg()，禁止把毫米直接传给 COM。\n- 未封装的接口先 python SKILL_DIR/scripts/sw_api_lookup.py <接口> <方法> 查证，禁止凭记忆猜长参数 COM 方法。\n- 草图用尺寸与关系驱动，禁止批量 Fix 冒充完全定义。\n- 每步检查 COM 返回值 None/False，失败要保留错误码并说明回退路径。\n- 生成或修改后必须导等轴测/前/俯/右四视图预览并目视复核。\n- 未验证能力、缺失依赖、假设参数必须显式标注 review_required。\n\n## 禁止\n- 不要用「保存成功」代替验收。\n- 不要改扩展名或写空文件伪造格式支持。\n- 不要把演示动画说成机械配合。\n- 不要在缺证据时宣称任务完成。\n\n## 需要标注的复核点\n- B-Rep 不能单独可靠区分盲孔与通孔，必须与创建参数交叉验证。\n- 锥形沉头复用入口圆边倒角，方向错误需翻转并重看剖视。\n- 孔阵列为逐孔特征，规则密排后续应改用 linear_pattern/circular_pattern。"},{"id":"cnc-fillet-bracket","name":"CNC 多圆角倒角安装座","category":"part","summary":"60×40×12 铝安装座：立角 R6、顶面 C1、圆角槽减重口袋与孔口倒角，带 100/75/50% 降级策略。","difficulty":"advanced","workflow":"subskills/solidworks-fillet-chamfer-cnc::create_cnc_mount_template.py","capabilities":["part_and_features","holes_and_finishing","dfm_checks"],"entry":"subskills/solidworks-fillet-chamfer-cnc/scripts/create_cnc_mount_template.py","references":["subskills/solidworks-fillet-chamfer-cnc/SKILL.md","subskills/solidworks-fillet-chamfer-cnc/references/cnc-fillet-chamfer-lessons.md"],"params":[{"key":"base","label":"基体 L×W×T (mm)","example":"60×40×12","required":true},{"key":"base_corner_radius","label":"立角圆角 R (mm)","example":"6","required":true},{"key":"top_chamfer","label":"顶面外轮廓倒角 (mm)","example":"1","required":false},{"key":"pocket","label":"减重口袋","example":"rounded_slot 30×16 深 6","required":false},{"key":"failure_policy","label":"降级策略","example":"strict（或 progressive 100/75/50%）","required":false}],"steps":["先执行 create_cnc_mount_template.py --dry-run --set base_corner_radius=6 --set chamfer_angle_deg=30，确认 *_plan.json 的 validation.errors 为空、语义目标与 expected_edge_count 符合设计。","去掉 --dry-run 执行原生建模，顺序固定为“基础体 → 立角圆角 → 外轮廓倒角 → 孔槽/口袋 → 孔口倒角”；大量参数走 --params-json。","重建后从特征树逐个回读 Fillet/Chamfer 特征，保存 SLDPRT、导出 STEP，并跑 sw_review.run_review 查看等轴测与俯视。"],"checks":["*_parameters.json 的 treatment_evidence 记录请求值、实际值、每次尝试与所选边签名，feature_evidence.missing_names 为空。","review 报告 evaluation.status 为 pass 或可解释的 warn，expected_outputs_exist 与 previews_not_blank 为 true。","发生降级时在交付摘要写明实际圆角/倒角尺寸，不声称精确满足原请求值。"],"risks":["选边以几何签名和期望数量为证据，数量不符即停止，不用坐标容差或 Edge1 猜边。","保持线圆角在本机 SW2026 SP1.1 的 ISetHoldLines 边界仍为 blocked/known_server_fault。","换版本或换拓扑必须复跑 verify_advanced_fillets.py 才能声明支持。"],"keywords":["零件","建模","model","part","CNC 多圆角倒角安装座","subskills/solidworks-fillet-chamfer-cnc::create_cnc_mount_template.py"],"promptFull":"# 目标\n{{task}}\n\n## 任务类型\n模板：CNC 多圆角倒角安装座（part｜难度 advanced）｜工作流：subskills/solidworks-fillet-chamfer-cnc::create_cnc_mount_template.py｜能力：part_and_features, holes_and_finishing, dfm_checks\n\n## 技能与环境\n- 技能根目录：SKILL_DIR（SOLIDWORKS_AUTOMATION_SKILL_DIR，默认 C:\\Users\\<you>\\.agents\\skills\\solidworks-automation）\n- 入口自检：python SKILL_DIR/scripts/sw_preflight.py\n- 能力真源：SKILL_DIR/capabilities.yaml\n- 后端路由：python SKILL_DIR/scripts/backend_router.py --list\n- 参考文档：subskills/solidworks-fillet-chamfer-cnc/SKILL.md、subskills/solidworks-fillet-chamfer-cnc/references/cnc-fillet-chamfer-lessons.md\n- 复用脚本：subskills/solidworks-fillet-chamfer-cnc/scripts/create_cnc_mount_template.py\n\n## 输入参数\n- 基体 L×W×T (mm)：{{param:base}}\n- 立角圆角 R (mm)：{{param:base_corner_radius}}\n- 顶面外轮廓倒角 (mm)：{{param:top_chamfer}}（可选）\n- 减重口袋：{{param:pocket}}（可选）\n- 降级策略：{{param:failure_policy}}（可选）\n\n## 执行步骤\n1. 先执行 create_cnc_mount_template.py --dry-run --set base_corner_radius=6 --set chamfer_angle_deg=30，确认 *_plan.json 的 validation.errors 为空、语义目标与 expected_edge_count 符合设计。\n2. 去掉 --dry-run 执行原生建模，顺序固定为“基础体 → 立角圆角 → 外轮廓倒角 → 孔槽/口袋 → 孔口倒角”；大量参数走 --params-json。\n3. 重建后从特征树逐个回读 Fillet/Chamfer 特征，保存 SLDPRT、导出 STEP，并跑 sw_review.run_review 查看等轴测与俯视。\n\n## 验收证据（逐条给出实际结果，不要只说成功）\n- *_parameters.json 的 treatment_evidence 记录请求值、实际值、每次尝试与所选边签名，feature_evidence.missing_names 为空。\n- review 报告 evaluation.status 为 pass 或可解释的 warn，expected_outputs_exist 与 previews_not_blank 为 true。\n- 发生降级时在交付摘要写明实际圆角/倒角尺寸，不声称精确满足原请求值。\n\n## 风险与人工复核\n- 选边以几何签名和期望数量为证据，数量不符即停止，不用坐标容差或 Edge1 猜边。\n- 保持线圆角在本机 SW2026 SP1.1 的 ISetHoldLines 边界仍为 blocked/known_server_fault。\n- 换版本或换拓扑必须复跑 verify_advanced_fillets.py 才能声明支持。\n\n## 交付物\n- 原生文件（.sldprt/.sldasm/.slddrw）+ 交换格式（.step/.stl/.pdf/.dxf）\n- 四视图预览图 + *_review_report.json（evaluation.status / issues / checks）\n- 每个产物给绝对路径与 SHA-256\n\n## 硬性约束\n- 先跑 python SKILL_DIR/scripts/sw_preflight.py 自检；SolidWorks 版本与界面语言先确认。\n- 能力等级以 SKILL_DIR/capabilities.yaml 为准；reference_only / not_implemented 不得作为无人值守交付。\n- API 一律使用米制；单位换算用 mm()/deg()，禁止把毫米直接传给 COM。\n- 未封装的接口先 python SKILL_DIR/scripts/sw_api_lookup.py <接口> <方法> 查证，禁止凭记忆猜长参数 COM 方法。\n- 草图用尺寸与关系驱动，禁止批量 Fix 冒充完全定义。\n- 每步检查 COM 返回值 None/False，失败要保留错误码并说明回退路径。\n- 生成或修改后必须导等轴测/前/俯/右四视图预览并目视复核。\n- 未验证能力、缺失依赖、假设参数必须显式标注 review_required。\n\n## 禁止\n- 不要用「保存成功」代替验收。\n- 不要改扩展名或写空文件伪造格式支持。\n- 不要把演示动画说成机械配合。\n- 不要在缺证据时宣称任务完成。","promptBrief":"# 目标\n{{task}}\n\n## 任务类型\n模板：CNC 多圆角倒角安装座（part｜难度 advanced）｜工作流：subskills/solidworks-fillet-chamfer-cnc::create_cnc_mount_template.py｜能力：part_and_features, holes_and_finishing, dfm_checks\n\n## 技能与环境\n- 技能根目录：SKILL_DIR（SOLIDWORKS_AUTOMATION_SKILL_DIR，默认 C:\\Users\\<you>\\.agents\\skills\\solidworks-automation）\n- 入口自检：python SKILL_DIR/scripts/sw_preflight.py\n- 能力真源：SKILL_DIR/capabilities.yaml\n- 后端路由：python SKILL_DIR/scripts/backend_router.py --list\n- 参考文档：subskills/solidworks-fillet-chamfer-cnc/SKILL.md、subskills/solidworks-fillet-chamfer-cnc/references/cnc-fillet-chamfer-lessons.md\n- 复用脚本：subskills/solidworks-fillet-chamfer-cnc/scripts/create_cnc_mount_template.py\n\n## 输入参数\n- 基体 L×W×T (mm)：{{param:base}}\n- 立角圆角 R (mm)：{{param:base_corner_radius}}\n- 顶面外轮廓倒角 (mm)：{{param:top_chamfer}}（可选）\n- 减重口袋：{{param:pocket}}（可选）\n- 降级策略：{{param:failure_policy}}（可选）\n\n## 执行步骤\n1. 先执行 create_cnc_mount_template.py --dry-run --set base_corner_radius=6 --set chamfer_angle_deg=30，确认 *_plan.json 的 validation.errors 为空、语义目标与 expected_edge_count 符合设计。\n2. 去掉 --dry-run 执行原生建模，顺序固定为“基础体 → 立角圆角 → 外轮廓倒角 → 孔槽/口袋 → 孔口倒角”；大量参数走 --params-json。\n3. 重建后从特征树逐个回读 Fillet/Chamfer 特征，保存 SLDPRT、导出 STEP，并跑 sw_review.run_review 查看等轴测与俯视。\n\n## 验收证据（逐条给出实际结果，不要只说成功）\n- *_parameters.json 的 treatment_evidence 记录请求值、实际值、每次尝试与所选边签名，feature_evidence.missing_names 为空。\n- review 报告 evaluation.status 为 pass 或可解释的 warn，expected_outputs_exist 与 previews_not_blank 为 true。\n- 发生降级时在交付摘要写明实际圆角/倒角尺寸，不声称精确满足原请求值。\n\n## 硬性约束\n- 先跑 python SKILL_DIR/scripts/sw_preflight.py 自检；SolidWorks 版本与界面语言先确认。\n- 能力等级以 SKILL_DIR/capabilities.yaml 为准；reference_only / not_implemented 不得作为无人值守交付。\n- API 一律使用米制；单位换算用 mm()/deg()，禁止把毫米直接传给 COM。\n- 未封装的接口先 python SKILL_DIR/scripts/sw_api_lookup.py <接口> <方法> 查证，禁止凭记忆猜长参数 COM 方法。\n- 草图用尺寸与关系驱动，禁止批量 Fix 冒充完全定义。\n- 每步检查 COM 返回值 None/False，失败要保留错误码并说明回退路径。\n- 生成或修改后必须导等轴测/前/俯/右四视图预览并目视复核。\n- 未验证能力、缺失依赖、假设参数必须显式标注 review_required。\n\n## 禁止\n- 不要用「保存成功」代替验收。\n- 不要改扩展名或写空文件伪造格式支持。\n- 不要把演示动画说成机械配合。\n- 不要在缺证据时宣称任务完成。\n\n## 需要标注的复核点\n- 选边以几何签名和期望数量为证据，数量不符即停止，不用坐标容差或 Edge1 猜边。\n- 保持线圆角在本机 SW2026 SP1.1 的 ISetHoldLines 边界仍为 blocked/known_server_fault。\n- 换版本或换拓扑必须复跑 verify_advanced_fillets.py 才能声明支持。"},{"id":"enclosure","name":"设备外壳","category":"part","summary":"120×80×40、壁厚 2.5 的抽壳外壳，含 USB/DC 接口开孔与 4 个 M3 PCB 螺柱。","difficulty":"advanced","workflow":"enclosure","capabilities":["part_and_features","holes_and_finishing","export_delivery"],"entry":"scripts/sw_part.py + scripts/sw_export.py","references":["references/part-modeling.md","references/export.md"],"params":[{"key":"envelope","label":"包络尺寸 L×W×H (mm)","example":"120×80×40","required":true},{"key":"wall","label":"壁厚 / 底厚 (mm)","example":"2.5","required":true},{"key":"interfaces","label":"接口开孔 (mm)","example":"USB 12×6；DC Ø8","required":true},{"key":"boss","label":"PCB 螺柱","example":"M3：外Ø6 内Ø2.5 高 6，4 个，孔距 64×40","required":true},{"key":"gap","label":"装配间隙 (mm)","example":"0.3","required":false}],"steps":["extrude_boss 拉伸 120×80×40 包络体，用 sw_part.shell(thickness=2.5, faces_to_remove=[顶面]) 抽壳成壳体。","在侧壁切向基准面上 extrude_cut 出 USB 12×6 与 DC Ø8 接口孔；底面 extrude_boss 4 个 M3 螺柱并按 PCB 孔距定位。","export_to_stl(quality=\"fine\") 与 export_to_step 导出，run_review 检查开口方向、壁厚与螺柱位置。"],"checks":["B-Rep 平面间距测得壁厚 2.5 mm（容差 0.05 mm），collect_bounding_box 回读 120×80×40 mm。","接口孔 12×6 与 Ø8 由内环/圆柱面回读，位置与接口坐标一致。","SLDPRT、STEP、STL 三件落盘且字节数 >0，STL 三角面数 >0，预览图非空白。"],"risks":["抽壳移出面选择错误会产生错误空腔，必须回读 shell 特征面数。","装配间隙 0.3 mm 只是包络预留，未做公差链与热膨胀分析。","3D 打印/注塑方向与拔模未验证，需补 check-dfm 复核。"],"keywords":["零件","建模","model","part","设备外壳","enclosure"],"promptFull":"# 目标\n{{task}}\n\n## 任务类型\n模板：设备外壳（part｜难度 advanced）｜工作流：enclosure｜能力：part_and_features, holes_and_finishing, export_delivery\n\n## 技能与环境\n- 技能根目录：SKILL_DIR（SOLIDWORKS_AUTOMATION_SKILL_DIR，默认 C:\\Users\\<you>\\.agents\\skills\\solidworks-automation）\n- 入口自检：python SKILL_DIR/scripts/sw_preflight.py\n- 能力真源：SKILL_DIR/capabilities.yaml\n- 后端路由：python SKILL_DIR/scripts/backend_router.py --list\n- 参考文档：references/part-modeling.md、references/export.md\n- 复用脚本：scripts/sw_part.py + scripts/sw_export.py\n\n## 输入参数\n- 包络尺寸 L×W×H (mm)：{{param:envelope}}\n- 壁厚 / 底厚 (mm)：{{param:wall}}\n- 接口开孔 (mm)：{{param:interfaces}}\n- PCB 螺柱：{{param:boss}}\n- 装配间隙 (mm)：{{param:gap}}（可选）\n\n## 执行步骤\n1. extrude_boss 拉伸 120×80×40 包络体，用 sw_part.shell(thickness=2.5, faces_to_remove=[顶面]) 抽壳成壳体。\n2. 在侧壁切向基准面上 extrude_cut 出 USB 12×6 与 DC Ø8 接口孔；底面 extrude_boss 4 个 M3 螺柱并按 PCB 孔距定位。\n3. export_to_stl(quality=\"fine\") 与 export_to_step 导出，run_review 检查开口方向、壁厚与螺柱位置。\n\n## 验收证据（逐条给出实际结果，不要只说成功）\n- B-Rep 平面间距测得壁厚 2.5 mm（容差 0.05 mm），collect_bounding_box 回读 120×80×40 mm。\n- 接口孔 12×6 与 Ø8 由内环/圆柱面回读，位置与接口坐标一致。\n- SLDPRT、STEP、STL 三件落盘且字节数 >0，STL 三角面数 >0，预览图非空白。\n\n## 风险与人工复核\n- 抽壳移出面选择错误会产生错误空腔，必须回读 shell 特征面数。\n- 装配间隙 0.3 mm 只是包络预留，未做公差链与热膨胀分析。\n- 3D 打印/注塑方向与拔模未验证，需补 check-dfm 复核。\n\n## 交付物\n- 原生文件（.sldprt/.sldasm/.slddrw）+ 交换格式（.step/.stl/.pdf/.dxf）\n- 四视图预览图 + *_review_report.json（evaluation.status / issues / checks）\n- 每个产物给绝对路径与 SHA-256\n\n## 硬性约束\n- 先跑 python SKILL_DIR/scripts/sw_preflight.py 自检；SolidWorks 版本与界面语言先确认。\n- 能力等级以 SKILL_DIR/capabilities.yaml 为准；reference_only / not_implemented 不得作为无人值守交付。\n- API 一律使用米制；单位换算用 mm()/deg()，禁止把毫米直接传给 COM。\n- 未封装的接口先 python SKILL_DIR/scripts/sw_api_lookup.py <接口> <方法> 查证，禁止凭记忆猜长参数 COM 方法。\n- 草图用尺寸与关系驱动，禁止批量 Fix 冒充完全定义。\n- 每步检查 COM 返回值 None/False，失败要保留错误码并说明回退路径。\n- 生成或修改后必须导等轴测/前/俯/右四视图预览并目视复核。\n- 未验证能力、缺失依赖、假设参数必须显式标注 review_required。\n\n## 禁止\n- 不要用「保存成功」代替验收。\n- 不要改扩展名或写空文件伪造格式支持。\n- 不要把演示动画说成机械配合。\n- 不要在缺证据时宣称任务完成。","promptBrief":"# 目标\n{{task}}\n\n## 任务类型\n模板：设备外壳（part｜难度 advanced）｜工作流：enclosure｜能力：part_and_features, holes_and_finishing, export_delivery\n\n## 技能与环境\n- 技能根目录：SKILL_DIR（SOLIDWORKS_AUTOMATION_SKILL_DIR，默认 C:\\Users\\<you>\\.agents\\skills\\solidworks-automation）\n- 入口自检：python SKILL_DIR/scripts/sw_preflight.py\n- 能力真源：SKILL_DIR/capabilities.yaml\n- 后端路由：python SKILL_DIR/scripts/backend_router.py --list\n- 参考文档：references/part-modeling.md、references/export.md\n- 复用脚本：scripts/sw_part.py + scripts/sw_export.py\n\n## 输入参数\n- 包络尺寸 L×W×H (mm)：{{param:envelope}}\n- 壁厚 / 底厚 (mm)：{{param:wall}}\n- 接口开孔 (mm)：{{param:interfaces}}\n- PCB 螺柱：{{param:boss}}\n- 装配间隙 (mm)：{{param:gap}}（可选）\n\n## 执行步骤\n1. extrude_boss 拉伸 120×80×40 包络体，用 sw_part.shell(thickness=2.5, faces_to_remove=[顶面]) 抽壳成壳体。\n2. 在侧壁切向基准面上 extrude_cut 出 USB 12×6 与 DC Ø8 接口孔；底面 extrude_boss 4 个 M3 螺柱并按 PCB 孔距定位。\n3. export_to_stl(quality=\"fine\") 与 export_to_step 导出，run_review 检查开口方向、壁厚与螺柱位置。\n\n## 验收证据（逐条给出实际结果，不要只说成功）\n- B-Rep 平面间距测得壁厚 2.5 mm（容差 0.05 mm），collect_bounding_box 回读 120×80×40 mm。\n- 接口孔 12×6 与 Ø8 由内环/圆柱面回读，位置与接口坐标一致。\n- SLDPRT、STEP、STL 三件落盘且字节数 >0，STL 三角面数 >0，预览图非空白。\n\n## 硬性约束\n- 先跑 python SKILL_DIR/scripts/sw_preflight.py 自检；SolidWorks 版本与界面语言先确认。\n- 能力等级以 SKILL_DIR/capabilities.yaml 为准；reference_only / not_implemented 不得作为无人值守交付。\n- API 一律使用米制；单位换算用 mm()/deg()，禁止把毫米直接传给 COM。\n- 未封装的接口先 python SKILL_DIR/scripts/sw_api_lookup.py <接口> <方法> 查证，禁止凭记忆猜长参数 COM 方法。\n- 草图用尺寸与关系驱动，禁止批量 Fix 冒充完全定义。\n- 每步检查 COM 返回值 None/False，失败要保留错误码并说明回退路径。\n- 生成或修改后必须导等轴测/前/俯/右四视图预览并目视复核。\n- 未验证能力、缺失依赖、假设参数必须显式标注 review_required。\n\n## 禁止\n- 不要用「保存成功」代替验收。\n- 不要改扩展名或写空文件伪造格式支持。\n- 不要把演示动画说成机械配合。\n- 不要在缺证据时宣称任务完成。\n\n## 需要标注的复核点\n- 抽壳移出面选择错误会产生错误空腔，必须回读 shell 特征面数。\n- 装配间隙 0.3 mm 只是包络预留，未做公差链与热膨胀分析。\n- 3D 打印/注塑方向与拔模未验证，需补 check-dfm 复核。"},{"id":"sheet-metal-u-bracket","name":"钣金 U 型支架","category":"sheetmetal","summary":"2 mm 冷轧板开放 U 型轮廓基体法兰，回读板厚/内折弯半径/K 因子并导出含折弯线 DXF。","difficulty":"advanced","workflow":"sw_sheet_metal.py::create_base_flange","capabilities":["sheet_metal","export_delivery","dfm_checks"],"entry":"scripts/sw_sheet_metal.py + scripts/sw_export.py","references":["references/advanced.md","references/export.md"],"params":[{"key":"thickness","label":"板厚 (mm)","example":"2.0","required":true},{"key":"bend_radius","label":"内折弯半径 (mm)","example":"2.0","required":true},{"key":"k_factor","label":"K 因子","example":"0.42","required":true},{"key":"u_profile","label":"U 型轮廓 底宽×两侧高 (mm)","example":"80 × 40","required":true},{"key":"depth","label":"基体法兰拉伸深度 (mm)","example":"60","required":true}],"steps":["在基准面绘制开放 U 型轮廓折线（底 80、两侧各高 40），作为 BaseFlange 的开放轮廓。","BaseFlangeSpec(thickness=2e-3, bend_radius=2e-3, depth=60e-3, k_factor=0.42, relief_ratio=0.5) 传给 create_base_flange(model, sketch_ref, spec)，再用 sheet_metal_evidence(model) 回读原生钣金特征。","保存 SLDPRT，用 export_flat_pattern_dxf 导出含折弯线的展开 DXF，run_review 出预览并核对展开方向。"],"checks":["sheet_metal_evidence 回读 SheetMetal/BaseFlange/FlatPattern 特征及板厚 2.0、内 R 2.0、K=0.42。","DXF 落盘且包含折弯线实体（非空、实体数 >0）。","关闭重开后参数一致，展开长度与中性层理论计算偏差 ≤1 mm。"],"risks":["边线法兰、放样折弯、转钣金、折弯表与多版本矩阵尚未验证，需人工建模。","缺材料、割缝、成型空间等输入时 check-dfm 返回 blocked。","钣金工程图缺可靠展开证据时按 blocked/pilot 处理，不宣称无人值守完成。"],"keywords":["钣金","sheet metal","折弯","钣金 U 型支架","sw_sheet_metal.py::create_base_flange"],"promptFull":"# 目标\n{{task}}\n\n## 任务类型\n模板：钣金 U 型支架（sheetmetal｜难度 advanced）｜工作流：sw_sheet_metal.py::create_base_flange｜能力：sheet_metal, export_delivery, dfm_checks\n\n## 技能与环境\n- 技能根目录：SKILL_DIR（SOLIDWORKS_AUTOMATION_SKILL_DIR，默认 C:\\Users\\<you>\\.agents\\skills\\solidworks-automation）\n- 入口自检：python SKILL_DIR/scripts/sw_preflight.py\n- 能力真源：SKILL_DIR/capabilities.yaml\n- 后端路由：python SKILL_DIR/scripts/backend_router.py --list\n- 参考文档：references/advanced.md、references/export.md\n- 复用脚本：scripts/sw_sheet_metal.py + scripts/sw_export.py\n\n## 输入参数\n- 板厚 (mm)：{{param:thickness}}\n- 内折弯半径 (mm)：{{param:bend_radius}}\n- K 因子：{{param:k_factor}}\n- U 型轮廓 底宽×两侧高 (mm)：{{param:u_profile}}\n- 基体法兰拉伸深度 (mm)：{{param:depth}}\n\n## 执行步骤\n1. 在基准面绘制开放 U 型轮廓折线（底 80、两侧各高 40），作为 BaseFlange 的开放轮廓。\n2. BaseFlangeSpec(thickness=2e-3, bend_radius=2e-3, depth=60e-3, k_factor=0.42, relief_ratio=0.5) 传给 create_base_flange(model, sketch_ref, spec)，再用 sheet_metal_evidence(model) 回读原生钣金特征。\n3. 保存 SLDPRT，用 export_flat_pattern_dxf 导出含折弯线的展开 DXF，run_review 出预览并核对展开方向。\n\n## 验收证据（逐条给出实际结果，不要只说成功）\n- sheet_metal_evidence 回读 SheetMetal/BaseFlange/FlatPattern 特征及板厚 2.0、内 R 2.0、K=0.42。\n- DXF 落盘且包含折弯线实体（非空、实体数 >0）。\n- 关闭重开后参数一致，展开长度与中性层理论计算偏差 ≤1 mm。\n\n## 风险与人工复核\n- 边线法兰、放样折弯、转钣金、折弯表与多版本矩阵尚未验证，需人工建模。\n- 缺材料、割缝、成型空间等输入时 check-dfm 返回 blocked。\n- 钣金工程图缺可靠展开证据时按 blocked/pilot 处理，不宣称无人值守完成。\n\n## 交付物\n- 原生文件（.sldprt/.sldasm/.slddrw）+ 交换格式（.step/.stl/.pdf/.dxf）\n- 四视图预览图 + *_review_report.json（evaluation.status / issues / checks）\n- 每个产物给绝对路径与 SHA-256\n\n## 硬性约束\n- 先跑 python SKILL_DIR/scripts/sw_preflight.py 自检；SolidWorks 版本与界面语言先确认。\n- 能力等级以 SKILL_DIR/capabilities.yaml 为准；reference_only / not_implemented 不得作为无人值守交付。\n- API 一律使用米制；单位换算用 mm()/deg()，禁止把毫米直接传给 COM。\n- 未封装的接口先 python SKILL_DIR/scripts/sw_api_lookup.py <接口> <方法> 查证，禁止凭记忆猜长参数 COM 方法。\n- 草图用尺寸与关系驱动，禁止批量 Fix 冒充完全定义。\n- 每步检查 COM 返回值 None/False，失败要保留错误码并说明回退路径。\n- 生成或修改后必须导等轴测/前/俯/右四视图预览并目视复核。\n- 未验证能力、缺失依赖、假设参数必须显式标注 review_required。\n\n## 禁止\n- 不要用「保存成功」代替验收。\n- 不要改扩展名或写空文件伪造格式支持。\n- 不要把演示动画说成机械配合。\n- 不要在缺证据时宣称任务完成。","promptBrief":"# 目标\n{{task}}\n\n## 任务类型\n模板：钣金 U 型支架（sheetmetal｜难度 advanced）｜工作流：sw_sheet_metal.py::create_base_flange｜能力：sheet_metal, export_delivery, dfm_checks\n\n## 技能与环境\n- 技能根目录：SKILL_DIR（SOLIDWORKS_AUTOMATION_SKILL_DIR，默认 C:\\Users\\<you>\\.agents\\skills\\solidworks-automation）\n- 入口自检：python SKILL_DIR/scripts/sw_preflight.py\n- 能力真源：SKILL_DIR/capabilities.yaml\n- 后端路由：python SKILL_DIR/scripts/backend_router.py --list\n- 参考文档：references/advanced.md、references/export.md\n- 复用脚本：scripts/sw_sheet_metal.py + scripts/sw_export.py\n\n## 输入参数\n- 板厚 (mm)：{{param:thickness}}\n- 内折弯半径 (mm)：{{param:bend_radius}}\n- K 因子：{{param:k_factor}}\n- U 型轮廓 底宽×两侧高 (mm)：{{param:u_profile}}\n- 基体法兰拉伸深度 (mm)：{{param:depth}}\n\n## 执行步骤\n1. 在基准面绘制开放 U 型轮廓折线（底 80、两侧各高 40），作为 BaseFlange 的开放轮廓。\n2. BaseFlangeSpec(thickness=2e-3, bend_radius=2e-3, depth=60e-3, k_factor=0.42, relief_ratio=0.5) 传给 create_base_flange(model, sketch_ref, spec)，再用 sheet_metal_evidence(model) 回读原生钣金特征。\n3. 保存 SLDPRT，用 export_flat_pattern_dxf 导出含折弯线的展开 DXF，run_review 出预览并核对展开方向。\n\n## 验收证据（逐条给出实际结果，不要只说成功）\n- sheet_metal_evidence 回读 SheetMetal/BaseFlange/FlatPattern 特征及板厚 2.0、内 R 2.0、K=0.42。\n- DXF 落盘且包含折弯线实体（非空、实体数 >0）。\n- 关闭重开后参数一致，展开长度与中性层理论计算偏差 ≤1 mm。\n\n## 硬性约束\n- 先跑 python SKILL_DIR/scripts/sw_preflight.py 自检；SolidWorks 版本与界面语言先确认。\n- 能力等级以 SKILL_DIR/capabilities.yaml 为准；reference_only / not_implemented 不得作为无人值守交付。\n- API 一律使用米制；单位换算用 mm()/deg()，禁止把毫米直接传给 COM。\n- 未封装的接口先 python SKILL_DIR/scripts/sw_api_lookup.py <接口> <方法> 查证，禁止凭记忆猜长参数 COM 方法。\n- 草图用尺寸与关系驱动，禁止批量 Fix 冒充完全定义。\n- 每步检查 COM 返回值 None/False，失败要保留错误码并说明回退路径。\n- 生成或修改后必须导等轴测/前/俯/右四视图预览并目视复核。\n- 未验证能力、缺失依赖、假设参数必须显式标注 review_required。\n\n## 禁止\n- 不要用「保存成功」代替验收。\n- 不要改扩展名或写空文件伪造格式支持。\n- 不要把演示动画说成机械配合。\n- 不要在缺证据时宣称任务完成。\n\n## 需要标注的复核点\n- 边线法兰、放样折弯、转钣金、折弯表与多版本矩阵尚未验证，需人工建模。\n- 缺材料、割缝、成型空间等输入时 check-dfm 返回 blocked。\n- 钣金工程图缺可靠展开证据时按 blocked/pilot 处理，不宣称无人值守完成。"},{"id":"assembly-mates","name":"装配体配合（轴-座-齿轮副）","category":"assembly","summary":"底座固定，轴与齿轮用同心 Mate 保留旋转，齿轮副用 Gear Mate 建立 18:26 传动比并回读自由度。","difficulty":"standard","workflow":"assembly_mates","capabilities":["assembly_and_mates","geometry_and_delivery_review"],"entry":"scripts/sw_assembly.py","references":["references/assembly.md"],"params":[{"key":"components","label":"零件清单","example":"base、shaft Ø8×140、gear z18、gear z26、cover","required":true},{"key":"concentric","label":"同心配合","example":"轴/齿轮 lock_rotation=false","required":true},{"key":"gear_ratio","label":"齿轮副齿数比","example":"18:26","required":true},{"key":"fixed","label":"固定件","example":"base 固定，轴与齿轮浮动","required":true}],"steps":["用 add_component 逐个加入零件（SW2024 中文版 AddComponent4 可能返回 None，封装会走 AddComponent5 并重试）。","先 resolve_component 解析轻化组件，再用 get_component_feature + get_assembly_entity(GetCorresponding) 映射到装配体上下文，select_entities_for_mate(mark=1)。","add_concentric_mate_by_cylinders(lock_rotation=False) 装轴与齿轮；add_gear_mate_by_cylinders(teeth_a=18, teeth_b=26) 建齿轮副；最后 inspect_component_dofs 核对剩余自由度。"],"checks":["collect_mate_feature_summary 中 MateGroup 下存在 MateConcentric 与 MateGearDim 真实特征。","inspect_component_dofs 显示齿轮仅保留绕轴 1 个旋转自由度，未被 Fix 或三基准面锁死。","保存 SLDASM 后重开可拖动，inspect_interference 返回 status=pass。"],"risks":["旋转件被三基准面或 lock_rotation=true 锁死会导致后续拖动与马达失效。","inspect_interference 返回 blocked 或 count=None 是证据未知，不能解释为零干涉。","Gear Mate 只建立转速比例，不防止齿轮实体穿透。"],"keywords":["装配","assembly","配合","mate","装配体配合（轴-座-齿轮副）","assembly_mates"],"promptFull":"# 目标\n{{task}}\n\n## 任务类型\n模板：装配体配合（轴-座-齿轮副）（assembly｜难度 standard）｜工作流：assembly_mates｜能力：assembly_and_mates, geometry_and_delivery_review\n\n## 技能与环境\n- 技能根目录：SKILL_DIR（SOLIDWORKS_AUTOMATION_SKILL_DIR，默认 C:\\Users\\<you>\\.agents\\skills\\solidworks-automation）\n- 入口自检：python SKILL_DIR/scripts/sw_preflight.py\n- 能力真源：SKILL_DIR/capabilities.yaml\n- 后端路由：python SKILL_DIR/scripts/backend_router.py --list\n- 参考文档：references/assembly.md\n- 复用脚本：scripts/sw_assembly.py\n\n## 输入参数\n- 零件清单：{{param:components}}\n- 同心配合：{{param:concentric}}\n- 齿轮副齿数比：{{param:gear_ratio}}\n- 固定件：{{param:fixed}}\n\n## 执行步骤\n1. 用 add_component 逐个加入零件（SW2024 中文版 AddComponent4 可能返回 None，封装会走 AddComponent5 并重试）。\n2. 先 resolve_component 解析轻化组件，再用 get_component_feature + get_assembly_entity(GetCorresponding) 映射到装配体上下文，select_entities_for_mate(mark=1)。\n3. add_concentric_mate_by_cylinders(lock_rotation=False) 装轴与齿轮；add_gear_mate_by_cylinders(teeth_a=18, teeth_b=26) 建齿轮副；最后 inspect_component_dofs 核对剩余自由度。\n\n## 验收证据（逐条给出实际结果，不要只说成功）\n- collect_mate_feature_summary 中 MateGroup 下存在 MateConcentric 与 MateGearDim 真实特征。\n- inspect_component_dofs 显示齿轮仅保留绕轴 1 个旋转自由度，未被 Fix 或三基准面锁死。\n- 保存 SLDASM 后重开可拖动，inspect_interference 返回 status=pass。\n\n## 风险与人工复核\n- 旋转件被三基准面或 lock_rotation=true 锁死会导致后续拖动与马达失效。\n- inspect_interference 返回 blocked 或 count=None 是证据未知，不能解释为零干涉。\n- Gear Mate 只建立转速比例，不防止齿轮实体穿透。\n\n## 交付物\n- 原生文件（.sldprt/.sldasm/.slddrw）+ 交换格式（.step/.stl/.pdf/.dxf）\n- 四视图预览图 + *_review_report.json（evaluation.status / issues / checks）\n- 每个产物给绝对路径与 SHA-256\n\n## 硬性约束\n- 先跑 python SKILL_DIR/scripts/sw_preflight.py 自检；SolidWorks 版本与界面语言先确认。\n- 能力等级以 SKILL_DIR/capabilities.yaml 为准；reference_only / not_implemented 不得作为无人值守交付。\n- API 一律使用米制；单位换算用 mm()/deg()，禁止把毫米直接传给 COM。\n- 未封装的接口先 python SKILL_DIR/scripts/sw_api_lookup.py <接口> <方法> 查证，禁止凭记忆猜长参数 COM 方法。\n- 草图用尺寸与关系驱动，禁止批量 Fix 冒充完全定义。\n- 每步检查 COM 返回值 None/False，失败要保留错误码并说明回退路径。\n- 生成或修改后必须导等轴测/前/俯/右四视图预览并目视复核。\n- 未验证能力、缺失依赖、假设参数必须显式标注 review_required。\n\n## 禁止\n- 不要用「保存成功」代替验收。\n- 不要改扩展名或写空文件伪造格式支持。\n- 不要把演示动画说成机械配合。\n- 不要在缺证据时宣称任务完成。","promptBrief":"# 目标\n{{task}}\n\n## 任务类型\n模板：装配体配合（轴-座-齿轮副）（assembly｜难度 standard）｜工作流：assembly_mates｜能力：assembly_and_mates, geometry_and_delivery_review\n\n## 技能与环境\n- 技能根目录：SKILL_DIR（SOLIDWORKS_AUTOMATION_SKILL_DIR，默认 C:\\Users\\<you>\\.agents\\skills\\solidworks-automation）\n- 入口自检：python SKILL_DIR/scripts/sw_preflight.py\n- 能力真源：SKILL_DIR/capabilities.yaml\n- 后端路由：python SKILL_DIR/scripts/backend_router.py --list\n- 参考文档：references/assembly.md\n- 复用脚本：scripts/sw_assembly.py\n\n## 输入参数\n- 零件清单：{{param:components}}\n- 同心配合：{{param:concentric}}\n- 齿轮副齿数比：{{param:gear_ratio}}\n- 固定件：{{param:fixed}}\n\n## 执行步骤\n1. 用 add_component 逐个加入零件（SW2024 中文版 AddComponent4 可能返回 None，封装会走 AddComponent5 并重试）。\n2. 先 resolve_component 解析轻化组件，再用 get_component_feature + get_assembly_entity(GetCorresponding) 映射到装配体上下文，select_entities_for_mate(mark=1)。\n3. add_concentric_mate_by_cylinders(lock_rotation=False) 装轴与齿轮；add_gear_mate_by_cylinders(teeth_a=18, teeth_b=26) 建齿轮副；最后 inspect_component_dofs 核对剩余自由度。\n\n## 验收证据（逐条给出实际结果，不要只说成功）\n- collect_mate_feature_summary 中 MateGroup 下存在 MateConcentric 与 MateGearDim 真实特征。\n- inspect_component_dofs 显示齿轮仅保留绕轴 1 个旋转自由度，未被 Fix 或三基准面锁死。\n- 保存 SLDASM 后重开可拖动，inspect_interference 返回 status=pass。\n\n## 硬性约束\n- 先跑 python SKILL_DIR/scripts/sw_preflight.py 自检；SolidWorks 版本与界面语言先确认。\n- 能力等级以 SKILL_DIR/capabilities.yaml 为准；reference_only / not_implemented 不得作为无人值守交付。\n- API 一律使用米制；单位换算用 mm()/deg()，禁止把毫米直接传给 COM。\n- 未封装的接口先 python SKILL_DIR/scripts/sw_api_lookup.py <接口> <方法> 查证，禁止凭记忆猜长参数 COM 方法。\n- 草图用尺寸与关系驱动，禁止批量 Fix 冒充完全定义。\n- 每步检查 COM 返回值 None/False，失败要保留错误码并说明回退路径。\n- 生成或修改后必须导等轴测/前/俯/右四视图预览并目视复核。\n- 未验证能力、缺失依赖、假设参数必须显式标注 review_required。\n\n## 禁止\n- 不要用「保存成功」代替验收。\n- 不要改扩展名或写空文件伪造格式支持。\n- 不要把演示动画说成机械配合。\n- 不要在缺证据时宣称任务完成。\n\n## 需要标注的复核点\n- 旋转件被三基准面或 lock_rotation=true 锁死会导致后续拖动与马达失效。\n- inspect_interference 返回 blocked 或 count=None 是证据未知，不能解释为零干涉。\n- Gear Mate 只建立转速比例，不防止齿轮实体穿透。"},{"id":"motion-study-rotary","name":"运动算例（60 RPM 旋转马达）","category":"motion","summary":"在已有装配体上创建 4 s 运动算例与 60 RPM 匀速旋转马达，并审计结果是否过期。","difficulty":"advanced","workflow":"sw_motion.py::create_motion_study","capabilities":["motion_study","assembly_and_mates"],"entry":"scripts/sw_motion.py","references":["references/motion-study.md","references/assembly.md"],"params":[{"key":"duration","label":"算例时长 (s)","example":"4.0","required":true},{"key":"rpm","label":"马达转速 (RPM)","example":"60","required":true},{"key":"motor_count","label":"马达数量","example":"1","required":true},{"key":"shaft_radius","label":"静止轴圆柱半径范围 (mm)","example":"4.5–5.5","required":true},{"key":"rotor_radius","label":"转子圆柱半径范围 (mm)","example":"10.5–11.5","required":true}],"steps":["先 ensure_motion_type_library() 加载 swmotionstudy.tlb，确认旋转件同心 Mate 未锁转、组件未 FixComponent。","create_motion_study(asm, name=\"叶轮_60RPM_循环转动\", duration=4.0)，再 add_constant_speed_rotary_motor_by_cylinders(shaft_radius=(mm(4.5),mm(5.5)), rotor_radius=(mm(10.5),mm(11.5)), rpm=60.0)。","calculate_and_play(study) 后调用 validate_motion_studies(asm, study_name=..., minimum_duration_seconds=4.0, minimum_motor_count=1, require_results=True)。"],"checks":["validate_motion_studies 返回 validation.status=\"pass\"，results_out_of_date 明确为 False。","collect_motion_study_summary 显示算例类型、时长 ≥4 s、马达数 ≥1、GetResults() 非空。","时间轴、马达图标、播放动画或 Calculate=True 单独出现不作为通过证据。"],"risks":["接触、摩擦、阻尼、重力、受力与完整 FEA 不在已验证范围。","Motion Analysis 依赖加载项与许可证，缺失时只能降级 Animation/Basic Motion 并说明。","把零件上下文面当载荷引用会让 CreateFeature 返回 None。"],"keywords":["运动","motion","马达","motor","运动算例（60 RPM 旋转马达）","sw_motion.py::create_motion_study"],"promptFull":"# 目标\n{{task}}\n\n## 任务类型\n模板：运动算例（60 RPM 旋转马达）（motion｜难度 advanced）｜工作流：sw_motion.py::create_motion_study｜能力：motion_study, assembly_and_mates\n\n## 技能与环境\n- 技能根目录：SKILL_DIR（SOLIDWORKS_AUTOMATION_SKILL_DIR，默认 C:\\Users\\<you>\\.agents\\skills\\solidworks-automation）\n- 入口自检：python SKILL_DIR/scripts/sw_preflight.py\n- 能力真源：SKILL_DIR/capabilities.yaml\n- 后端路由：python SKILL_DIR/scripts/backend_router.py --list\n- 参考文档：references/motion-study.md、references/assembly.md\n- 复用脚本：scripts/sw_motion.py\n\n## 输入参数\n- 算例时长 (s)：{{param:duration}}\n- 马达转速 (RPM)：{{param:rpm}}\n- 马达数量：{{param:motor_count}}\n- 静止轴圆柱半径范围 (mm)：{{param:shaft_radius}}\n- 转子圆柱半径范围 (mm)：{{param:rotor_radius}}\n\n## 执行步骤\n1. 先 ensure_motion_type_library() 加载 swmotionstudy.tlb，确认旋转件同心 Mate 未锁转、组件未 FixComponent。\n2. create_motion_study(asm, name=\"叶轮_60RPM_循环转动\", duration=4.0)，再 add_constant_speed_rotary_motor_by_cylinders(shaft_radius=(mm(4.5),mm(5.5)), rotor_radius=(mm(10.5),mm(11.5)), rpm=60.0)。\n3. calculate_and_play(study) 后调用 validate_motion_studies(asm, study_name=..., minimum_duration_seconds=4.0, minimum_motor_count=1, require_results=True)。\n\n## 验收证据（逐条给出实际结果，不要只说成功）\n- validate_motion_studies 返回 validation.status=\"pass\"，results_out_of_date 明确为 False。\n- collect_motion_study_summary 显示算例类型、时长 ≥4 s、马达数 ≥1、GetResults() 非空。\n- 时间轴、马达图标、播放动画或 Calculate=True 单独出现不作为通过证据。\n\n## 风险与人工复核\n- 接触、摩擦、阻尼、重力、受力与完整 FEA 不在已验证范围。\n- Motion Analysis 依赖加载项与许可证，缺失时只能降级 Animation/Basic Motion 并说明。\n- 把零件上下文面当载荷引用会让 CreateFeature 返回 None。\n\n## 交付物\n- 原生文件（.sldprt/.sldasm/.slddrw）+ 交换格式（.step/.stl/.pdf/.dxf）\n- 四视图预览图 + *_review_report.json（evaluation.status / issues / checks）\n- 每个产物给绝对路径与 SHA-256\n\n## 硬性约束\n- 先跑 python SKILL_DIR/scripts/sw_preflight.py 自检；SolidWorks 版本与界面语言先确认。\n- 能力等级以 SKILL_DIR/capabilities.yaml 为准；reference_only / not_implemented 不得作为无人值守交付。\n- API 一律使用米制；单位换算用 mm()/deg()，禁止把毫米直接传给 COM。\n- 未封装的接口先 python SKILL_DIR/scripts/sw_api_lookup.py <接口> <方法> 查证，禁止凭记忆猜长参数 COM 方法。\n- 草图用尺寸与关系驱动，禁止批量 Fix 冒充完全定义。\n- 每步检查 COM 返回值 None/False，失败要保留错误码并说明回退路径。\n- 生成或修改后必须导等轴测/前/俯/右四视图预览并目视复核。\n- 未验证能力、缺失依赖、假设参数必须显式标注 review_required。\n\n## 禁止\n- 不要用「保存成功」代替验收。\n- 不要改扩展名或写空文件伪造格式支持。\n- 不要把演示动画说成机械配合。\n- 不要在缺证据时宣称任务完成。","promptBrief":"# 目标\n{{task}}\n\n## 任务类型\n模板：运动算例（60 RPM 旋转马达）（motion｜难度 advanced）｜工作流：sw_motion.py::create_motion_study｜能力：motion_study, assembly_and_mates\n\n## 技能与环境\n- 技能根目录：SKILL_DIR（SOLIDWORKS_AUTOMATION_SKILL_DIR，默认 C:\\Users\\<you>\\.agents\\skills\\solidworks-automation）\n- 入口自检：python SKILL_DIR/scripts/sw_preflight.py\n- 能力真源：SKILL_DIR/capabilities.yaml\n- 后端路由：python SKILL_DIR/scripts/backend_router.py --list\n- 参考文档：references/motion-study.md、references/assembly.md\n- 复用脚本：scripts/sw_motion.py\n\n## 输入参数\n- 算例时长 (s)：{{param:duration}}\n- 马达转速 (RPM)：{{param:rpm}}\n- 马达数量：{{param:motor_count}}\n- 静止轴圆柱半径范围 (mm)：{{param:shaft_radius}}\n- 转子圆柱半径范围 (mm)：{{param:rotor_radius}}\n\n## 执行步骤\n1. 先 ensure_motion_type_library() 加载 swmotionstudy.tlb，确认旋转件同心 Mate 未锁转、组件未 FixComponent。\n2. create_motion_study(asm, name=\"叶轮_60RPM_循环转动\", duration=4.0)，再 add_constant_speed_rotary_motor_by_cylinders(shaft_radius=(mm(4.5),mm(5.5)), rotor_radius=(mm(10.5),mm(11.5)), rpm=60.0)。\n3. calculate_and_play(study) 后调用 validate_motion_studies(asm, study_name=..., minimum_duration_seconds=4.0, minimum_motor_count=1, require_results=True)。\n\n## 验收证据（逐条给出实际结果，不要只说成功）\n- validate_motion_studies 返回 validation.status=\"pass\"，results_out_of_date 明确为 False。\n- collect_motion_study_summary 显示算例类型、时长 ≥4 s、马达数 ≥1、GetResults() 非空。\n- 时间轴、马达图标、播放动画或 Calculate=True 单独出现不作为通过证据。\n\n## 硬性约束\n- 先跑 python SKILL_DIR/scripts/sw_preflight.py 自检；SolidWorks 版本与界面语言先确认。\n- 能力等级以 SKILL_DIR/capabilities.yaml 为准；reference_only / not_implemented 不得作为无人值守交付。\n- API 一律使用米制；单位换算用 mm()/deg()，禁止把毫米直接传给 COM。\n- 未封装的接口先 python SKILL_DIR/scripts/sw_api_lookup.py <接口> <方法> 查证，禁止凭记忆猜长参数 COM 方法。\n- 草图用尺寸与关系驱动，禁止批量 Fix 冒充完全定义。\n- 每步检查 COM 返回值 None/False，失败要保留错误码并说明回退路径。\n- 生成或修改后必须导等轴测/前/俯/右四视图预览并目视复核。\n- 未验证能力、缺失依赖、假设参数必须显式标注 review_required。\n\n## 禁止\n- 不要用「保存成功」代替验收。\n- 不要改扩展名或写空文件伪造格式支持。\n- 不要把演示动画说成机械配合。\n- 不要在缺证据时宣称任务完成。\n\n## 需要标注的复核点\n- 接触、摩擦、阻尼、重力、受力与完整 FEA 不在已验证范围。\n- Motion Analysis 依赖加载项与许可证，缺失时只能降级 Animation/Basic Motion 并说明。\n- 把零件上下文面当载荷引用会让 CreateFeature 返回 None。"},{"id":"gb-drawing-a3","name":"GB/T 第一角零件图（A3）","category":"drawing","summary":"依 DrawingSpec v1 出 A3、GB_T、第一角三视图，导入模型尺寸并补孔表/标题栏，导出 PDF 后做文字边界复核。","difficulty":"advanced","workflow":"engineering_drawing","capabilities":["drawings_and_bom","drawing_dimension_insertion","export_delivery"],"entry":"subskills/solidworks-engineering-drawing/scripts/drawing_workflow.py","references":["subskills/solidworks-engineering-drawing/SKILL.md","references/drawing.md"],"params":[{"key":"paper_size","label":"图幅","example":"A3（NewSheet4 PaperSize=6）","required":true},{"key":"standard","label":"标准与投影","example":"GB_T + first_angle","required":true},{"key":"views","label":"视图组合","example":"front/top/right + isometric","required":true},{"key":"scale","label":"比例","example":"1:1","required":true},{"key":"title_block","label":"标题栏字段","example":"图号 SW-001、材料 6061-T6、比例 1:1","required":false}],"steps":["按 drawing_spec.schema.json 校验 DrawingSpec：standard=GB_T 必须配 projection=first_angle，第三角会被前置检查阻断。","add_a3_sheet(require_gbt=True, projection=\"first_angle\") 建图框，create_standard_views_with_projection 出三视图，insert_dimensions 走 InsertModelAnnotations3(AnnotationType=32768) 导入真实模型尺寸。","auto_arrange_drawing_dimensions 布排尺寸、add_note 写技术要求、insert_bom_table 插 BOM；export_sheet_to_pdf 导出 PDF，再用 drawing_review.review_drawing_artifacts 与 inspect_pdf_dimension_rendering 关联 COM 尺寸位置与 PDF 矢量文字框。"],"checks":["回读真实视图 ≥3 个、真实 DisplayDimension ≥6 个，模板候选与普通 Note 不计入。","PDF 落盘，inspect_pdf_dimension_rendering 报告尺寸文字框关联完整且无 confirmed_collision。","无压孔、压中心线、跨视图长引线或标题栏侵入；估算边界结论保留 estimated 证据标记。"],"risks":["IAnnotation 不提供原生文字包围盒，文字边界只能用锚点与字体估算，必须目视复核。","轴测、剖视、局部视图、孔标注/孔表、标题栏业务字段需专项脚本，通用生成器会返回 DRAWING_SPEC_CAPABILITY_UNSUPPORTED。","钣金工程图缺可靠展开证据时返回 blocked。"],"keywords":["工程图","drawing","出图","GB/T 第一角零件图（A3）","engineering_drawing"],"promptFull":"# 目标\n{{task}}\n\n## 任务类型\n模板：GB/T 第一角零件图（A3）（drawing｜难度 advanced）｜工作流：engineering_drawing｜能力：drawings_and_bom, drawing_dimension_insertion, export_delivery\n\n## 技能与环境\n- 技能根目录：SKILL_DIR（SOLIDWORKS_AUTOMATION_SKILL_DIR，默认 C:\\Users\\<you>\\.agents\\skills\\solidworks-automation）\n- 入口自检：python SKILL_DIR/scripts/sw_preflight.py\n- 能力真源：SKILL_DIR/capabilities.yaml\n- 后端路由：python SKILL_DIR/scripts/backend_router.py --list\n- 参考文档：subskills/solidworks-engineering-drawing/SKILL.md、references/drawing.md\n- 复用脚本：subskills/solidworks-engineering-drawing/scripts/drawing_workflow.py\n\n## 输入参数\n- 图幅：{{param:paper_size}}\n- 标准与投影：{{param:standard}}\n- 视图组合：{{param:views}}\n- 比例：{{param:scale}}\n- 标题栏字段：{{param:title_block}}（可选）\n\n## 执行步骤\n1. 按 drawing_spec.schema.json 校验 DrawingSpec：standard=GB_T 必须配 projection=first_angle，第三角会被前置检查阻断。\n2. add_a3_sheet(require_gbt=True, projection=\"first_angle\") 建图框，create_standard_views_with_projection 出三视图，insert_dimensions 走 InsertModelAnnotations3(AnnotationType=32768) 导入真实模型尺寸。\n3. auto_arrange_drawing_dimensions 布排尺寸、add_note 写技术要求、insert_bom_table 插 BOM；export_sheet_to_pdf 导出 PDF，再用 drawing_review.review_drawing_artifacts 与 inspect_pdf_dimension_rendering 关联 COM 尺寸位置与 PDF 矢量文字框。\n\n## 验收证据（逐条给出实际结果，不要只说成功）\n- 回读真实视图 ≥3 个、真实 DisplayDimension ≥6 个，模板候选与普通 Note 不计入。\n- PDF 落盘，inspect_pdf_dimension_rendering 报告尺寸文字框关联完整且无 confirmed_collision。\n- 无压孔、压中心线、跨视图长引线或标题栏侵入；估算边界结论保留 estimated 证据标记。\n\n## 风险与人工复核\n- IAnnotation 不提供原生文字包围盒，文字边界只能用锚点与字体估算，必须目视复核。\n- 轴测、剖视、局部视图、孔标注/孔表、标题栏业务字段需专项脚本，通用生成器会返回 DRAWING_SPEC_CAPABILITY_UNSUPPORTED。\n- 钣金工程图缺可靠展开证据时返回 blocked。\n\n## 交付物\n- 原生文件（.sldprt/.sldasm/.slddrw）+ 交换格式（.step/.stl/.pdf/.dxf）\n- 四视图预览图 + *_review_report.json（evaluation.status / issues / checks）\n- 每个产物给绝对路径与 SHA-256\n\n## 硬性约束\n- 先跑 python SKILL_DIR/scripts/sw_preflight.py 自检；SolidWorks 版本与界面语言先确认。\n- 能力等级以 SKILL_DIR/capabilities.yaml 为准；reference_only / not_implemented 不得作为无人值守交付。\n- API 一律使用米制；单位换算用 mm()/deg()，禁止把毫米直接传给 COM。\n- 未封装的接口先 python SKILL_DIR/scripts/sw_api_lookup.py <接口> <方法> 查证，禁止凭记忆猜长参数 COM 方法。\n- 草图用尺寸与关系驱动，禁止批量 Fix 冒充完全定义。\n- 每步检查 COM 返回值 None/False，失败要保留错误码并说明回退路径。\n- 生成或修改后必须导等轴测/前/俯/右四视图预览并目视复核。\n- 未验证能力、缺失依赖、假设参数必须显式标注 review_required。\n\n## 禁止\n- 不要用「保存成功」代替验收。\n- 不要改扩展名或写空文件伪造格式支持。\n- 不要把演示动画说成机械配合。\n- 不要在缺证据时宣称任务完成。","promptBrief":"# 目标\n{{task}}\n\n## 任务类型\n模板：GB/T 第一角零件图（A3）（drawing｜难度 advanced）｜工作流：engineering_drawing｜能力：drawings_and_bom, drawing_dimension_insertion, export_delivery\n\n## 技能与环境\n- 技能根目录：SKILL_DIR（SOLIDWORKS_AUTOMATION_SKILL_DIR，默认 C:\\Users\\<you>\\.agents\\skills\\solidworks-automation）\n- 入口自检：python SKILL_DIR/scripts/sw_preflight.py\n- 能力真源：SKILL_DIR/capabilities.yaml\n- 后端路由：python SKILL_DIR/scripts/backend_router.py --list\n- 参考文档：subskills/solidworks-engineering-drawing/SKILL.md、references/drawing.md\n- 复用脚本：subskills/solidworks-engineering-drawing/scripts/drawing_workflow.py\n\n## 输入参数\n- 图幅：{{param:paper_size}}\n- 标准与投影：{{param:standard}}\n- 视图组合：{{param:views}}\n- 比例：{{param:scale}}\n- 标题栏字段：{{param:title_block}}（可选）\n\n## 执行步骤\n1. 按 drawing_spec.schema.json 校验 DrawingSpec：standard=GB_T 必须配 projection=first_angle，第三角会被前置检查阻断。\n2. add_a3_sheet(require_gbt=True, projection=\"first_angle\") 建图框，create_standard_views_with_projection 出三视图，insert_dimensions 走 InsertModelAnnotations3(AnnotationType=32768) 导入真实模型尺寸。\n3. auto_arrange_drawing_dimensions 布排尺寸、add_note 写技术要求、insert_bom_table 插 BOM；export_sheet_to_pdf 导出 PDF，再用 drawing_review.review_drawing_artifacts 与 inspect_pdf_dimension_rendering 关联 COM 尺寸位置与 PDF 矢量文字框。\n\n## 验收证据（逐条给出实际结果，不要只说成功）\n- 回读真实视图 ≥3 个、真实 DisplayDimension ≥6 个，模板候选与普通 Note 不计入。\n- PDF 落盘，inspect_pdf_dimension_rendering 报告尺寸文字框关联完整且无 confirmed_collision。\n- 无压孔、压中心线、跨视图长引线或标题栏侵入；估算边界结论保留 estimated 证据标记。\n\n## 硬性约束\n- 先跑 python SKILL_DIR/scripts/sw_preflight.py 自检；SolidWorks 版本与界面语言先确认。\n- 能力等级以 SKILL_DIR/capabilities.yaml 为准；reference_only / not_implemented 不得作为无人值守交付。\n- API 一律使用米制；单位换算用 mm()/deg()，禁止把毫米直接传给 COM。\n- 未封装的接口先 python SKILL_DIR/scripts/sw_api_lookup.py <接口> <方法> 查证，禁止凭记忆猜长参数 COM 方法。\n- 草图用尺寸与关系驱动，禁止批量 Fix 冒充完全定义。\n- 每步检查 COM 返回值 None/False，失败要保留错误码并说明回退路径。\n- 生成或修改后必须导等轴测/前/俯/右四视图预览并目视复核。\n- 未验证能力、缺失依赖、假设参数必须显式标注 review_required。\n\n## 禁止\n- 不要用「保存成功」代替验收。\n- 不要改扩展名或写空文件伪造格式支持。\n- 不要把演示动画说成机械配合。\n- 不要在缺证据时宣称任务完成。\n\n## 需要标注的复核点\n- IAnnotation 不提供原生文字包围盒，文字边界只能用锚点与字体估算，必须目视复核。\n- 轴测、剖视、局部视图、孔标注/孔表、标题栏业务字段需专项脚本，通用生成器会返回 DRAWING_SPEC_CAPABILITY_UNSUPPORTED。\n- 钣金工程图缺可靠展开证据时返回 blocked。"},{"id":"batch-export-delivery","name":"批量导出与交付包","category":"export","summary":"多文档批量导出 STEP/STL/PDF 并逐文件记录大小与 SHA-256，同时生成 Pack and Go 依赖包与 BOM CSV。","difficulty":"standard","workflow":"batch_export","capabilities":["export_delivery","pack_and_go","custom_properties_and_bom"],"entry":"scripts/sw_export.py + scripts/sw_delivery.py","references":["references/export.md"],"params":[{"key":"formats","label":"输出格式","example":".step,.stl,.pdf","required":true},{"key":"overwrite","label":"覆盖策略","example":"false（同名冲突直接阻止）","required":true},{"key":"stl_quality","label":"STL 质量","example":"fine（偏差 0.005 mm、角度 0.174 rad）","required":false},{"key":"pack_target","label":"Pack and Go 目标目录","example":"必须为空目录","required":false}],"steps":["batch_export_formats(sw, file_paths, output_dir, formats=(\".step\",\".stl\"), overwrite=False)：每格式前激活源文档并回读 ActiveDoc.GetPathName()，路径不一致立即停止。","对装配体调用 pack_and_go(..., fallback_policy=\"stage_dependencies\")，落盘后按 GetDependencies2 审计依赖并生成 cadstudio-pack-manifest.json 与逐文件 SHA-256。","export_assembly_bom_csv + build_bom_traceability 输出 BOM 与追溯字段，最后 run_review 以 expected_outputs 校验全部产物。"],"checks":["每个输出记录 success、字节数、produced_this_run 与 SHA-256；同名冲突被阻止而非后写覆盖。","pack_and_go 的 document_count 与实际落盘文件数一致，missing_dependencies 为空或已标记 pilot 暂存包。","BOM CSV 行数与 collect_assembly_bom 结果一致，属性与配置核对留痕。"],"risks":["专有格式仍需目标 CAD 原生打开复核，不能只凭脚本返回值。","外部引用、Toolbox、配置、压缩组件与关联工程图必须人工抽查。","严格模式漏依赖返回 SW_PACK_AND_GO_DEPENDENCY_ENUMERATION_INCOMPLETE 并阻断。"],"keywords":["导出","export","step","stl","批量导出与交付包","batch_export"],"promptFull":"# 目标\n{{task}}\n\n## 任务类型\n模板：批量导出与交付包（export｜难度 standard）｜工作流：batch_export｜能力：export_delivery, pack_and_go, custom_properties_and_bom\n\n## 技能与环境\n- 技能根目录：SKILL_DIR（SOLIDWORKS_AUTOMATION_SKILL_DIR，默认 C:\\Users\\<you>\\.agents\\skills\\solidworks-automation）\n- 入口自检：python SKILL_DIR/scripts/sw_preflight.py\n- 能力真源：SKILL_DIR/capabilities.yaml\n- 后端路由：python SKILL_DIR/scripts/backend_router.py --list\n- 参考文档：references/export.md\n- 复用脚本：scripts/sw_export.py + scripts/sw_delivery.py\n\n## 输入参数\n- 输出格式：{{param:formats}}\n- 覆盖策略：{{param:overwrite}}\n- STL 质量：{{param:stl_quality}}（可选）\n- Pack and Go 目标目录：{{param:pack_target}}（可选）\n\n## 执行步骤\n1. batch_export_formats(sw, file_paths, output_dir, formats=(\".step\",\".stl\"), overwrite=False)：每格式前激活源文档并回读 ActiveDoc.GetPathName()，路径不一致立即停止。\n2. 对装配体调用 pack_and_go(..., fallback_policy=\"stage_dependencies\")，落盘后按 GetDependencies2 审计依赖并生成 cadstudio-pack-manifest.json 与逐文件 SHA-256。\n3. export_assembly_bom_csv + build_bom_traceability 输出 BOM 与追溯字段，最后 run_review 以 expected_outputs 校验全部产物。\n\n## 验收证据（逐条给出实际结果，不要只说成功）\n- 每个输出记录 success、字节数、produced_this_run 与 SHA-256；同名冲突被阻止而非后写覆盖。\n- pack_and_go 的 document_count 与实际落盘文件数一致，missing_dependencies 为空或已标记 pilot 暂存包。\n- BOM CSV 行数与 collect_assembly_bom 结果一致，属性与配置核对留痕。\n\n## 风险与人工复核\n- 专有格式仍需目标 CAD 原生打开复核，不能只凭脚本返回值。\n- 外部引用、Toolbox、配置、压缩组件与关联工程图必须人工抽查。\n- 严格模式漏依赖返回 SW_PACK_AND_GO_DEPENDENCY_ENUMERATION_INCOMPLETE 并阻断。\n\n## 交付物\n- 原生文件（.sldprt/.sldasm/.slddrw）+ 交换格式（.step/.stl/.pdf/.dxf）\n- 四视图预览图 + *_review_report.json（evaluation.status / issues / checks）\n- 每个产物给绝对路径与 SHA-256\n\n## 硬性约束\n- 先跑 python SKILL_DIR/scripts/sw_preflight.py 自检；SolidWorks 版本与界面语言先确认。\n- 能力等级以 SKILL_DIR/capabilities.yaml 为准；reference_only / not_implemented 不得作为无人值守交付。\n- API 一律使用米制；单位换算用 mm()/deg()，禁止把毫米直接传给 COM。\n- 未封装的接口先 python SKILL_DIR/scripts/sw_api_lookup.py <接口> <方法> 查证，禁止凭记忆猜长参数 COM 方法。\n- 草图用尺寸与关系驱动，禁止批量 Fix 冒充完全定义。\n- 每步检查 COM 返回值 None/False，失败要保留错误码并说明回退路径。\n- 生成或修改后必须导等轴测/前/俯/右四视图预览并目视复核。\n- 未验证能力、缺失依赖、假设参数必须显式标注 review_required。\n\n## 禁止\n- 不要用「保存成功」代替验收。\n- 不要改扩展名或写空文件伪造格式支持。\n- 不要把演示动画说成机械配合。\n- 不要在缺证据时宣称任务完成。","promptBrief":"# 目标\n{{task}}\n\n## 任务类型\n模板：批量导出与交付包（export｜难度 standard）｜工作流：batch_export｜能力：export_delivery, pack_and_go, custom_properties_and_bom\n\n## 技能与环境\n- 技能根目录：SKILL_DIR（SOLIDWORKS_AUTOMATION_SKILL_DIR，默认 C:\\Users\\<you>\\.agents\\skills\\solidworks-automation）\n- 入口自检：python SKILL_DIR/scripts/sw_preflight.py\n- 能力真源：SKILL_DIR/capabilities.yaml\n- 后端路由：python SKILL_DIR/scripts/backend_router.py --list\n- 参考文档：references/export.md\n- 复用脚本：scripts/sw_export.py + scripts/sw_delivery.py\n\n## 输入参数\n- 输出格式：{{param:formats}}\n- 覆盖策略：{{param:overwrite}}\n- STL 质量：{{param:stl_quality}}（可选）\n- Pack and Go 目标目录：{{param:pack_target}}（可选）\n\n## 执行步骤\n1. batch_export_formats(sw, file_paths, output_dir, formats=(\".step\",\".stl\"), overwrite=False)：每格式前激活源文档并回读 ActiveDoc.GetPathName()，路径不一致立即停止。\n2. 对装配体调用 pack_and_go(..., fallback_policy=\"stage_dependencies\")，落盘后按 GetDependencies2 审计依赖并生成 cadstudio-pack-manifest.json 与逐文件 SHA-256。\n3. export_assembly_bom_csv + build_bom_traceability 输出 BOM 与追溯字段，最后 run_review 以 expected_outputs 校验全部产物。\n\n## 验收证据（逐条给出实际结果，不要只说成功）\n- 每个输出记录 success、字节数、produced_this_run 与 SHA-256；同名冲突被阻止而非后写覆盖。\n- pack_and_go 的 document_count 与实际落盘文件数一致，missing_dependencies 为空或已标记 pilot 暂存包。\n- BOM CSV 行数与 collect_assembly_bom 结果一致，属性与配置核对留痕。\n\n## 硬性约束\n- 先跑 python SKILL_DIR/scripts/sw_preflight.py 自检；SolidWorks 版本与界面语言先确认。\n- 能力等级以 SKILL_DIR/capabilities.yaml 为准；reference_only / not_implemented 不得作为无人值守交付。\n- API 一律使用米制；单位换算用 mm()/deg()，禁止把毫米直接传给 COM。\n- 未封装的接口先 python SKILL_DIR/scripts/sw_api_lookup.py <接口> <方法> 查证，禁止凭记忆猜长参数 COM 方法。\n- 草图用尺寸与关系驱动，禁止批量 Fix 冒充完全定义。\n- 每步检查 COM 返回值 None/False，失败要保留错误码并说明回退路径。\n- 生成或修改后必须导等轴测/前/俯/右四视图预览并目视复核。\n- 未验证能力、缺失依赖、假设参数必须显式标注 review_required。\n\n## 禁止\n- 不要用「保存成功」代替验收。\n- 不要改扩展名或写空文件伪造格式支持。\n- 不要把演示动画说成机械配合。\n- 不要在缺证据时宣称任务完成。\n\n## 需要标注的复核点\n- 专有格式仍需目标 CAD 原生打开复核，不能只凭脚本返回值。\n- 外部引用、Toolbox、配置、压缩组件与关联工程图必须人工抽查。\n- 严格模式漏依赖返回 SW_PACK_AND_GO_DEPENDENCY_ENUMERATION_INCOMPLETE 并阻断。"},{"id":"open-helical-spring","name":"开放端等螺距弹簧","category":"part","summary":"线径 3、中径 24、中心线高度 48、6 圈的开放端圆线弹簧实体，回读旋向与实体极值。","difficulty":"advanced","workflow":"sw_spring.py::create_open_helical_spring","capabilities":["open_helical_spring","part_and_features"],"entry":"scripts/sw_spring.py","references":["references/spring.md"],"params":[{"key":"wire_diameter","label":"线径 (mm)","example":"3.0","required":true},{"key":"mean_diameter","label":"中径 (mm)","example":"24","required":true},{"key":"helix_height","label":"中心线轴向行程 (mm)","example":"48","required":true},{"key":"turns","label":"圈数","example":"6","required":true},{"key":"clockwise","label":"旋向（螺旋线方向参数）","example":"false","required":false}],"steps":["先校验试点约束：线径 0.1–50 mm、中径 ≤500 mm 且 ≥4×线径、中心线高度 ≤2000 mm、圈数 1–20、螺距 ≥1.25×线径且 ≤中径/2。","OpenHelicalSpringSpec(wire_diameter_mm=3, mean_diameter_mm=24, helix_height_mm=48, turns=6, clockwise=False) 后调用 create_open_helical_spring(model, spec)，在新建空零件中生成基圆 + 原生螺旋线 + 圆形截面扫描。","用 IBody2.GetExtremePoint 回读实体极值（比中心线高度多出线径延伸），保存 SLDPRT 并跑 run_review。"],"checks":["verify_helix_definition 回读旋向、圈数 6、螺距 8 mm（48/6，等于 2.67×线径）与输入一致。","实体实测尺寸与 expected_body_bounds_mm 对账，体积与理论线材体积偏差在容差内。","SLDPRT 与 STEP 落盘，重开后预览非空白。"],"risks":["输入高度是螺旋中心线轴向行程，不等于实体自由高度。","端圈未并紧、未磨平；刚度、压并高度、疲劳与制造要求均不验证。","接口只接受无实体零件，失败可能残留草图，仅限本次新建文档使用。"],"keywords":["零件","建模","model","part","开放端等螺距弹簧","sw_spring.py::create_open_helical_spring"],"promptFull":"# 目标\n{{task}}\n\n## 任务类型\n模板：开放端等螺距弹簧（part｜难度 advanced）｜工作流：sw_spring.py::create_open_helical_spring｜能力：open_helical_spring, part_and_features\n\n## 技能与环境\n- 技能根目录：SKILL_DIR（SOLIDWORKS_AUTOMATION_SKILL_DIR，默认 C:\\Users\\<you>\\.agents\\skills\\solidworks-automation）\n- 入口自检：python SKILL_DIR/scripts/sw_preflight.py\n- 能力真源：SKILL_DIR/capabilities.yaml\n- 后端路由：python SKILL_DIR/scripts/backend_router.py --list\n- 参考文档：references/spring.md\n- 复用脚本：scripts/sw_spring.py\n\n## 输入参数\n- 线径 (mm)：{{param:wire_diameter}}\n- 中径 (mm)：{{param:mean_diameter}}\n- 中心线轴向行程 (mm)：{{param:helix_height}}\n- 圈数：{{param:turns}}\n- 旋向（螺旋线方向参数）：{{param:clockwise}}（可选）\n\n## 执行步骤\n1. 先校验试点约束：线径 0.1–50 mm、中径 ≤500 mm 且 ≥4×线径、中心线高度 ≤2000 mm、圈数 1–20、螺距 ≥1.25×线径且 ≤中径/2。\n2. OpenHelicalSpringSpec(wire_diameter_mm=3, mean_diameter_mm=24, helix_height_mm=48, turns=6, clockwise=False) 后调用 create_open_helical_spring(model, spec)，在新建空零件中生成基圆 + 原生螺旋线 + 圆形截面扫描。\n3. 用 IBody2.GetExtremePoint 回读实体极值（比中心线高度多出线径延伸），保存 SLDPRT 并跑 run_review。\n\n## 验收证据（逐条给出实际结果，不要只说成功）\n- verify_helix_definition 回读旋向、圈数 6、螺距 8 mm（48/6，等于 2.67×线径）与输入一致。\n- 实体实测尺寸与 expected_body_bounds_mm 对账，体积与理论线材体积偏差在容差内。\n- SLDPRT 与 STEP 落盘，重开后预览非空白。\n\n## 风险与人工复核\n- 输入高度是螺旋中心线轴向行程，不等于实体自由高度。\n- 端圈未并紧、未磨平；刚度、压并高度、疲劳与制造要求均不验证。\n- 接口只接受无实体零件，失败可能残留草图，仅限本次新建文档使用。\n\n## 交付物\n- 原生文件（.sldprt/.sldasm/.slddrw）+ 交换格式（.step/.stl/.pdf/.dxf）\n- 四视图预览图 + *_review_report.json（evaluation.status / issues / checks）\n- 每个产物给绝对路径与 SHA-256\n\n## 硬性约束\n- 先跑 python SKILL_DIR/scripts/sw_preflight.py 自检；SolidWorks 版本与界面语言先确认。\n- 能力等级以 SKILL_DIR/capabilities.yaml 为准；reference_only / not_implemented 不得作为无人值守交付。\n- API 一律使用米制；单位换算用 mm()/deg()，禁止把毫米直接传给 COM。\n- 未封装的接口先 python SKILL_DIR/scripts/sw_api_lookup.py <接口> <方法> 查证，禁止凭记忆猜长参数 COM 方法。\n- 草图用尺寸与关系驱动，禁止批量 Fix 冒充完全定义。\n- 每步检查 COM 返回值 None/False，失败要保留错误码并说明回退路径。\n- 生成或修改后必须导等轴测/前/俯/右四视图预览并目视复核。\n- 未验证能力、缺失依赖、假设参数必须显式标注 review_required。\n\n## 禁止\n- 不要用「保存成功」代替验收。\n- 不要改扩展名或写空文件伪造格式支持。\n- 不要把演示动画说成机械配合。\n- 不要在缺证据时宣称任务完成。","promptBrief":"# 目标\n{{task}}\n\n## 任务类型\n模板：开放端等螺距弹簧（part｜难度 advanced）｜工作流：sw_spring.py::create_open_helical_spring｜能力：open_helical_spring, part_and_features\n\n## 技能与环境\n- 技能根目录：SKILL_DIR（SOLIDWORKS_AUTOMATION_SKILL_DIR，默认 C:\\Users\\<you>\\.agents\\skills\\solidworks-automation）\n- 入口自检：python SKILL_DIR/scripts/sw_preflight.py\n- 能力真源：SKILL_DIR/capabilities.yaml\n- 后端路由：python SKILL_DIR/scripts/backend_router.py --list\n- 参考文档：references/spring.md\n- 复用脚本：scripts/sw_spring.py\n\n## 输入参数\n- 线径 (mm)：{{param:wire_diameter}}\n- 中径 (mm)：{{param:mean_diameter}}\n- 中心线轴向行程 (mm)：{{param:helix_height}}\n- 圈数：{{param:turns}}\n- 旋向（螺旋线方向参数）：{{param:clockwise}}（可选）\n\n## 执行步骤\n1. 先校验试点约束：线径 0.1–50 mm、中径 ≤500 mm 且 ≥4×线径、中心线高度 ≤2000 mm、圈数 1–20、螺距 ≥1.25×线径且 ≤中径/2。\n2. OpenHelicalSpringSpec(wire_diameter_mm=3, mean_diameter_mm=24, helix_height_mm=48, turns=6, clockwise=False) 后调用 create_open_helical_spring(model, spec)，在新建空零件中生成基圆 + 原生螺旋线 + 圆形截面扫描。\n3. 用 IBody2.GetExtremePoint 回读实体极值（比中心线高度多出线径延伸），保存 SLDPRT 并跑 run_review。\n\n## 验收证据（逐条给出实际结果，不要只说成功）\n- verify_helix_definition 回读旋向、圈数 6、螺距 8 mm（48/6，等于 2.67×线径）与输入一致。\n- 实体实测尺寸与 expected_body_bounds_mm 对账，体积与理论线材体积偏差在容差内。\n- SLDPRT 与 STEP 落盘，重开后预览非空白。\n\n## 硬性约束\n- 先跑 python SKILL_DIR/scripts/sw_preflight.py 自检；SolidWorks 版本与界面语言先确认。\n- 能力等级以 SKILL_DIR/capabilities.yaml 为准；reference_only / not_implemented 不得作为无人值守交付。\n- API 一律使用米制；单位换算用 mm()/deg()，禁止把毫米直接传给 COM。\n- 未封装的接口先 python SKILL_DIR/scripts/sw_api_lookup.py <接口> <方法> 查证，禁止凭记忆猜长参数 COM 方法。\n- 草图用尺寸与关系驱动，禁止批量 Fix 冒充完全定义。\n- 每步检查 COM 返回值 None/False，失败要保留错误码并说明回退路径。\n- 生成或修改后必须导等轴测/前/俯/右四视图预览并目视复核。\n- 未验证能力、缺失依赖、假设参数必须显式标注 review_required。\n\n## 禁止\n- 不要用「保存成功」代替验收。\n- 不要改扩展名或写空文件伪造格式支持。\n- 不要把演示动画说成机械配合。\n- 不要在缺证据时宣称任务完成。\n\n## 需要标注的复核点\n- 输入高度是螺旋中心线轴向行程，不等于实体自由高度。\n- 端圈未并紧、未磨平；刚度、压并高度、疲劳与制造要求均不验证。\n- 接口只接受无实体零件，失败可能残留草图，仅限本次新建文档使用。"},{"id":"sprocket-cosmetic","name":"链轮外观件","category":"part","summary":"节距 12.7、滚子 Ø7.92、17 齿、厚 6、轴孔 Ø10 的近似链轮实体，用于外观与几何演示。","difficulty":"standard","workflow":"sw_sprocket.py::create_approximate_sprocket","capabilities":["approximate_roller_sprocket","part_and_features"],"entry":"scripts/sw_sprocket.py","references":["references/sprocket.md"],"params":[{"key":"chain_pitch","label":"链节距 (mm)","example":"12.7（1/2 英寸）","required":true},{"key":"roller_diameter","label":"滚子直径 (mm)","example":"7.92","required":true},{"key":"teeth","label":"齿数","example":"17","required":true},{"key":"thickness","label":"厚度 (mm)","example":"6","required":true},{"key":"bore","label":"轴孔直径 (mm)","example":"10","required":true}],"steps":["在新建空零件上操作（接口要求无实体零件），先按 SprocketSpec 校验节距、滚子直径、齿数与轴孔边界。","create_approximate_sprocket(model, spec) 生成折线齿廓草图并拉伸，读取 evidence 的 profile_min_diameter_mm 作为轴孔几何边界。","保存到本次新建且未占用的路径，export_to_step 导出 STEP，run_review 目视核对齿形与轴孔。"],"checks":["实体为单实体，轴孔 Ø10 mm 由内圆柱面回读，包围盒与 evidence 名义齿顶圆一致。","profile_min_diameter_mm 记录并核对：名义齿根圆（节圆减滚子直径）与实际折线最小直径不同。","SLDPRT 与 STEP 落盘且重开成功，四视图预览非空白。"],"risks":["齿廓为折线近似，未验证链条啮合、强度或标准，不能作为生产级标准链轮。","草图未完全参数化与约束，改参数应整体重新生成。","轴孔受实际折线最小直径限制，不是啮合尺寸公差。"],"keywords":["零件","建模","model","part","链轮外观件","sw_sprocket.py::create_approximate_sprocket"],"promptFull":"# 目标\n{{task}}\n\n## 任务类型\n模板：链轮外观件（part｜难度 standard）｜工作流：sw_sprocket.py::create_approximate_sprocket｜能力：approximate_roller_sprocket, part_and_features\n\n## 技能与环境\n- 技能根目录：SKILL_DIR（SOLIDWORKS_AUTOMATION_SKILL_DIR，默认 C:\\Users\\<you>\\.agents\\skills\\solidworks-automation）\n- 入口自检：python SKILL_DIR/scripts/sw_preflight.py\n- 能力真源：SKILL_DIR/capabilities.yaml\n- 后端路由：python SKILL_DIR/scripts/backend_router.py --list\n- 参考文档：references/sprocket.md\n- 复用脚本：scripts/sw_sprocket.py\n\n## 输入参数\n- 链节距 (mm)：{{param:chain_pitch}}\n- 滚子直径 (mm)：{{param:roller_diameter}}\n- 齿数：{{param:teeth}}\n- 厚度 (mm)：{{param:thickness}}\n- 轴孔直径 (mm)：{{param:bore}}\n\n## 执行步骤\n1. 在新建空零件上操作（接口要求无实体零件），先按 SprocketSpec 校验节距、滚子直径、齿数与轴孔边界。\n2. create_approximate_sprocket(model, spec) 生成折线齿廓草图并拉伸，读取 evidence 的 profile_min_diameter_mm 作为轴孔几何边界。\n3. 保存到本次新建且未占用的路径，export_to_step 导出 STEP，run_review 目视核对齿形与轴孔。\n\n## 验收证据（逐条给出实际结果，不要只说成功）\n- 实体为单实体，轴孔 Ø10 mm 由内圆柱面回读，包围盒与 evidence 名义齿顶圆一致。\n- profile_min_diameter_mm 记录并核对：名义齿根圆（节圆减滚子直径）与实际折线最小直径不同。\n- SLDPRT 与 STEP 落盘且重开成功，四视图预览非空白。\n\n## 风险与人工复核\n- 齿廓为折线近似，未验证链条啮合、强度或标准，不能作为生产级标准链轮。\n- 草图未完全参数化与约束，改参数应整体重新生成。\n- 轴孔受实际折线最小直径限制，不是啮合尺寸公差。\n\n## 交付物\n- 原生文件（.sldprt/.sldasm/.slddrw）+ 交换格式（.step/.stl/.pdf/.dxf）\n- 四视图预览图 + *_review_report.json（evaluation.status / issues / checks）\n- 每个产物给绝对路径与 SHA-256\n\n## 硬性约束\n- 先跑 python SKILL_DIR/scripts/sw_preflight.py 自检；SolidWorks 版本与界面语言先确认。\n- 能力等级以 SKILL_DIR/capabilities.yaml 为准；reference_only / not_implemented 不得作为无人值守交付。\n- API 一律使用米制；单位换算用 mm()/deg()，禁止把毫米直接传给 COM。\n- 未封装的接口先 python SKILL_DIR/scripts/sw_api_lookup.py <接口> <方法> 查证，禁止凭记忆猜长参数 COM 方法。\n- 草图用尺寸与关系驱动，禁止批量 Fix 冒充完全定义。\n- 每步检查 COM 返回值 None/False，失败要保留错误码并说明回退路径。\n- 生成或修改后必须导等轴测/前/俯/右四视图预览并目视复核。\n- 未验证能力、缺失依赖、假设参数必须显式标注 review_required。\n\n## 禁止\n- 不要用「保存成功」代替验收。\n- 不要改扩展名或写空文件伪造格式支持。\n- 不要把演示动画说成机械配合。\n- 不要在缺证据时宣称任务完成。","promptBrief":"# 目标\n{{task}}\n\n## 任务类型\n模板：链轮外观件（part｜难度 standard）｜工作流：sw_sprocket.py::create_approximate_sprocket｜能力：approximate_roller_sprocket, part_and_features\n\n## 技能与环境\n- 技能根目录：SKILL_DIR（SOLIDWORKS_AUTOMATION_SKILL_DIR，默认 C:\\Users\\<you>\\.agents\\skills\\solidworks-automation）\n- 入口自检：python SKILL_DIR/scripts/sw_preflight.py\n- 能力真源：SKILL_DIR/capabilities.yaml\n- 后端路由：python SKILL_DIR/scripts/backend_router.py --list\n- 参考文档：references/sprocket.md\n- 复用脚本：scripts/sw_sprocket.py\n\n## 输入参数\n- 链节距 (mm)：{{param:chain_pitch}}\n- 滚子直径 (mm)：{{param:roller_diameter}}\n- 齿数：{{param:teeth}}\n- 厚度 (mm)：{{param:thickness}}\n- 轴孔直径 (mm)：{{param:bore}}\n\n## 执行步骤\n1. 在新建空零件上操作（接口要求无实体零件），先按 SprocketSpec 校验节距、滚子直径、齿数与轴孔边界。\n2. create_approximate_sprocket(model, spec) 生成折线齿廓草图并拉伸，读取 evidence 的 profile_min_diameter_mm 作为轴孔几何边界。\n3. 保存到本次新建且未占用的路径，export_to_step 导出 STEP，run_review 目视核对齿形与轴孔。\n\n## 验收证据（逐条给出实际结果，不要只说成功）\n- 实体为单实体，轴孔 Ø10 mm 由内圆柱面回读，包围盒与 evidence 名义齿顶圆一致。\n- profile_min_diameter_mm 记录并核对：名义齿根圆（节圆减滚子直径）与实际折线最小直径不同。\n- SLDPRT 与 STEP 落盘且重开成功，四视图预览非空白。\n\n## 硬性约束\n- 先跑 python SKILL_DIR/scripts/sw_preflight.py 自检；SolidWorks 版本与界面语言先确认。\n- 能力等级以 SKILL_DIR/capabilities.yaml 为准；reference_only / not_implemented 不得作为无人值守交付。\n- API 一律使用米制；单位换算用 mm()/deg()，禁止把毫米直接传给 COM。\n- 未封装的接口先 python SKILL_DIR/scripts/sw_api_lookup.py <接口> <方法> 查证，禁止凭记忆猜长参数 COM 方法。\n- 草图用尺寸与关系驱动，禁止批量 Fix 冒充完全定义。\n- 每步检查 COM 返回值 None/False，失败要保留错误码并说明回退路径。\n- 生成或修改后必须导等轴测/前/俯/右四视图预览并目视复核。\n- 未验证能力、缺失依赖、假设参数必须显式标注 review_required。\n\n## 禁止\n- 不要用「保存成功」代替验收。\n- 不要改扩展名或写空文件伪造格式支持。\n- 不要把演示动画说成机械配合。\n- 不要在缺证据时宣称任务完成。\n\n## 需要标注的复核点\n- 齿廓为折线近似，未验证链条啮合、强度或标准，不能作为生产级标准链轮。\n- 草图未完全参数化与约束，改参数应整体重新生成。\n- 轴孔受实际折线最小直径限制，不是啮合尺寸公差。"},{"id":"dfm-fea-review","name":"DFM / FEA 复核","category":"evaluation","summary":"对中性 CAD 文档跑 check-dfm 与 check-drc，再按需 fea-preflight/run-fea，输出可追溯的制造与强度风险证据。","difficulty":"advanced","workflow":"cad_studio.py::check-dfm","capabilities":["dfm_checks","design_rule_audit","simulation_and_fea","geometry_and_delivery_review"],"entry":"scripts/cad_studio.py + scripts/dfm_review.py + scripts/fea_analysis.py","references":["references/design-rule-check.md","references/complex-mechanical-routing.md","capabilities.yaml"],"params":[{"key":"process","label":"工艺分支","example":"machining（或 sheet_metal / laser_cutting / 3d_printing / injection_molding）","required":true},{"key":"material","label":"材料","example":"6061-T6","required":true},{"key":"wall","label":"壁厚 / 最小壁 (mm)","example":"2.5","required":true},{"key":"k_factor","label":"K 因子（钣金）","example":"0.42","required":false},{"key":"brep","label":"B-Rep 证据文件","example":"brep.json（绑定实测包围盒与孔径）","required":false}],"steps":["运行 python scripts/cad_studio.py check-dfm --input model.cadstudio.json --output output/dfm_report.json --process machining --profile supplier.json --brep-evidence brep.json。","运行 check-drc --input model.cadstudio.json --output output/drc.json（可加 --rule-pack drilling_panel），报告始终保留 reviewRequired=true。","需要受力时按 fea-preflight → prepare-fea → run-fea（可选 run-fea-convergence）执行，结果统一标 review_required 并保留 .cel 接触迭代证据。"],"checks":["dfm 报告 status 不为 blocked，材料、壁厚、K 因子、割缝、成型空间等关键输入齐全。","drc 报告 status 为 pass/warning/review_required，fail 项列出规则、阈值与证据来源。","FEA 报告含最终步 COPEN/CPRESS/CSLIP 与网格收敛 8% 阈值结论，末两档对比留档。"],"risks":["DFM 是可制造性风险复核，不是制造认证；规则全通过仍须人工确认材料、公差、载荷与供应商能力。","注塑分支为声明型 pilot 筛查，不自动识别倒扣、不做模流认证。","FEA 未覆盖大型装配接触、屈曲、模态与热耦合，且不等于安全认证。"],"keywords":["复核","review","dfm","fea","DFM / FEA 复核","cad_studio.py::check-dfm"],"promptFull":"# 目标\n{{task}}\n\n## 任务类型\n模板：DFM / FEA 复核（evaluation｜难度 advanced）｜工作流：cad_studio.py::check-dfm｜能力：dfm_checks, design_rule_audit, simulation_and_fea, geometry_and_delivery_review\n\n## 技能与环境\n- 技能根目录：SKILL_DIR（SOLIDWORKS_AUTOMATION_SKILL_DIR，默认 C:\\Users\\<you>\\.agents\\skills\\solidworks-automation）\n- 入口自检：python SKILL_DIR/scripts/sw_preflight.py\n- 能力真源：SKILL_DIR/capabilities.yaml\n- 后端路由：python SKILL_DIR/scripts/backend_router.py --list\n- 参考文档：references/design-rule-check.md、references/complex-mechanical-routing.md、capabilities.yaml\n- 复用脚本：scripts/cad_studio.py + scripts/dfm_review.py + scripts/fea_analysis.py\n\n## 输入参数\n- 工艺分支：{{param:process}}\n- 材料：{{param:material}}\n- 壁厚 / 最小壁 (mm)：{{param:wall}}\n- K 因子（钣金）：{{param:k_factor}}（可选）\n- B-Rep 证据文件：{{param:brep}}（可选）\n\n## 执行步骤\n1. 运行 python scripts/cad_studio.py check-dfm --input model.cadstudio.json --output output/dfm_report.json --process machining --profile supplier.json --brep-evidence brep.json。\n2. 运行 check-drc --input model.cadstudio.json --output output/drc.json（可加 --rule-pack drilling_panel），报告始终保留 reviewRequired=true。\n3. 需要受力时按 fea-preflight → prepare-fea → run-fea（可选 run-fea-convergence）执行，结果统一标 review_required 并保留 .cel 接触迭代证据。\n\n## 验收证据（逐条给出实际结果，不要只说成功）\n- dfm 报告 status 不为 blocked，材料、壁厚、K 因子、割缝、成型空间等关键输入齐全。\n- drc 报告 status 为 pass/warning/review_required，fail 项列出规则、阈值与证据来源。\n- FEA 报告含最终步 COPEN/CPRESS/CSLIP 与网格收敛 8% 阈值结论，末两档对比留档。\n\n## 风险与人工复核\n- DFM 是可制造性风险复核，不是制造认证；规则全通过仍须人工确认材料、公差、载荷与供应商能力。\n- 注塑分支为声明型 pilot 筛查，不自动识别倒扣、不做模流认证。\n- FEA 未覆盖大型装配接触、屈曲、模态与热耦合，且不等于安全认证。\n\n## 交付物\n- 原生文件（.sldprt/.sldasm/.slddrw）+ 交换格式（.step/.stl/.pdf/.dxf）\n- 四视图预览图 + *_review_report.json（evaluation.status / issues / checks）\n- 每个产物给绝对路径与 SHA-256\n\n## 硬性约束\n- 先跑 python SKILL_DIR/scripts/sw_preflight.py 自检；SolidWorks 版本与界面语言先确认。\n- 能力等级以 SKILL_DIR/capabilities.yaml 为准；reference_only / not_implemented 不得作为无人值守交付。\n- API 一律使用米制；单位换算用 mm()/deg()，禁止把毫米直接传给 COM。\n- 未封装的接口先 python SKILL_DIR/scripts/sw_api_lookup.py <接口> <方法> 查证，禁止凭记忆猜长参数 COM 方法。\n- 草图用尺寸与关系驱动，禁止批量 Fix 冒充完全定义。\n- 每步检查 COM 返回值 None/False，失败要保留错误码并说明回退路径。\n- 生成或修改后必须导等轴测/前/俯/右四视图预览并目视复核。\n- 未验证能力、缺失依赖、假设参数必须显式标注 review_required。\n\n## 禁止\n- 不要用「保存成功」代替验收。\n- 不要改扩展名或写空文件伪造格式支持。\n- 不要把演示动画说成机械配合。\n- 不要在缺证据时宣称任务完成。","promptBrief":"# 目标\n{{task}}\n\n## 任务类型\n模板：DFM / FEA 复核（evaluation｜难度 advanced）｜工作流：cad_studio.py::check-dfm｜能力：dfm_checks, design_rule_audit, simulation_and_fea, geometry_and_delivery_review\n\n## 技能与环境\n- 技能根目录：SKILL_DIR（SOLIDWORKS_AUTOMATION_SKILL_DIR，默认 C:\\Users\\<you>\\.agents\\skills\\solidworks-automation）\n- 入口自检：python SKILL_DIR/scripts/sw_preflight.py\n- 能力真源：SKILL_DIR/capabilities.yaml\n- 后端路由：python SKILL_DIR/scripts/backend_router.py --list\n- 参考文档：references/design-rule-check.md、references/complex-mechanical-routing.md、capabilities.yaml\n- 复用脚本：scripts/cad_studio.py + scripts/dfm_review.py + scripts/fea_analysis.py\n\n## 输入参数\n- 工艺分支：{{param:process}}\n- 材料：{{param:material}}\n- 壁厚 / 最小壁 (mm)：{{param:wall}}\n- K 因子（钣金）：{{param:k_factor}}（可选）\n- B-Rep 证据文件：{{param:brep}}（可选）\n\n## 执行步骤\n1. 运行 python scripts/cad_studio.py check-dfm --input model.cadstudio.json --output output/dfm_report.json --process machining --profile supplier.json --brep-evidence brep.json。\n2. 运行 check-drc --input model.cadstudio.json --output output/drc.json（可加 --rule-pack drilling_panel），报告始终保留 reviewRequired=true。\n3. 需要受力时按 fea-preflight → prepare-fea → run-fea（可选 run-fea-convergence）执行，结果统一标 review_required 并保留 .cel 接触迭代证据。\n\n## 验收证据（逐条给出实际结果，不要只说成功）\n- dfm 报告 status 不为 blocked，材料、壁厚、K 因子、割缝、成型空间等关键输入齐全。\n- drc 报告 status 为 pass/warning/review_required，fail 项列出规则、阈值与证据来源。\n- FEA 报告含最终步 COPEN/CPRESS/CSLIP 与网格收敛 8% 阈值结论，末两档对比留档。\n\n## 硬性约束\n- 先跑 python SKILL_DIR/scripts/sw_preflight.py 自检；SolidWorks 版本与界面语言先确认。\n- 能力等级以 SKILL_DIR/capabilities.yaml 为准；reference_only / not_implemented 不得作为无人值守交付。\n- API 一律使用米制；单位换算用 mm()/deg()，禁止把毫米直接传给 COM。\n- 未封装的接口先 python SKILL_DIR/scripts/sw_api_lookup.py <接口> <方法> 查证，禁止凭记忆猜长参数 COM 方法。\n- 草图用尺寸与关系驱动，禁止批量 Fix 冒充完全定义。\n- 每步检查 COM 返回值 None/False，失败要保留错误码并说明回退路径。\n- 生成或修改后必须导等轴测/前/俯/右四视图预览并目视复核。\n- 未验证能力、缺失依赖、假设参数必须显式标注 review_required。\n\n## 禁止\n- 不要用「保存成功」代替验收。\n- 不要改扩展名或写空文件伪造格式支持。\n- 不要把演示动画说成机械配合。\n- 不要在缺证据时宣称任务完成。\n\n## 需要标注的复核点\n- DFM 是可制造性风险复核，不是制造认证；规则全通过仍须人工确认材料、公差、载荷与供应商能力。\n- 注塑分支为声明型 pilot 筛查，不自动识别倒扣、不做模流认证。\n- FEA 未覆盖大型装配接触、屈曲、模态与热耦合，且不等于安全认证。"}],"fallbackTemplate":{"id":"generic-task","name":"通用零件任务","category":"part","summary":"按技能路由执行的通用 SolidWorks 任务","difficulty":"standard","workflow":"mounting_bracket","capabilities":["part_and_features"],"entry":"按技能 SKILL.md 路由，从 scripts/sw_part.py 起步","references":["references/part-modeling.md","references/review.md","references/troubleshooting.md"],"params":[{"key":"goal","label":"要做的东西","example":"120×80×10 安装板","required":true},{"key":"material","label":"材料","example":"6061-T6","required":false},{"key":"output","label":"交付格式","example":"sldprt + step + 四视图预览","required":false},{"key":"constraints","label":"关键约束","example":"四角 M6 沉孔，孔心距 96×56","required":false}],"steps":["运行 python SKILL_DIR/scripts/sw_preflight.py 自检环境与 SolidWorks 连接。","按需求确定交付级别（演示 / 结构验证 / 可制造），把已知参数与假设参数分表列出。","用 SolidWorksSession() 新建或打开文档，先建主轮廓草图并完全定义。","按基体 → 切除 → 孔槽 → 圆角倒角的顺序建特征，每步检查返回值。","保存原生文件并导出交换格式，记录路径与 SHA-256。","导出四视图预览，读 *_review_report.json 并目视复核。"],"checks":["草图完全定义，关键驱动尺寸可改且孔位保持正确。","特征树含目标特征，重建成功（ForceRebuild3 返回 True）。","原生文件与交换格式均已落盘，附绝对路径与 SHA-256。","四视图预览非空白，主体存在、比例合理、无缺失部件。"],"risks":["未验证能力与假设参数必须标注 review_required。","材料、公差、制造工艺结论需工程师复核。"],"promptFull":"# 目标\n{{task}}\n\n## 任务类型\n模板：通用零件任务（part｜难度 standard）｜工作流：mounting_bracket｜能力：part_and_features\n\n## 技能与环境\n- 技能根目录：SKILL_DIR（SOLIDWORKS_AUTOMATION_SKILL_DIR，默认 C:\\Users\\<you>\\.agents\\skills\\solidworks-automation）\n- 入口自检：python SKILL_DIR/scripts/sw_preflight.py\n- 能力真源：SKILL_DIR/capabilities.yaml\n- 后端路由：python SKILL_DIR/scripts/backend_router.py --list\n- 参考文档：references/part-modeling.md、references/review.md、references/troubleshooting.md\n- 复用脚本：按技能 SKILL.md 路由，从 scripts/sw_part.py 起步\n\n## 输入参数\n- 要做的东西：{{param:goal}}\n- 材料：{{param:material}}（可选）\n- 交付格式：{{param:output}}（可选）\n- 关键约束：{{param:constraints}}（可选）\n\n## 执行步骤\n1. 运行 python SKILL_DIR/scripts/sw_preflight.py 自检环境与 SolidWorks 连接。\n2. 按需求确定交付级别（演示 / 结构验证 / 可制造），把已知参数与假设参数分表列出。\n3. 用 SolidWorksSession() 新建或打开文档，先建主轮廓草图并完全定义。\n4. 按基体 → 切除 → 孔槽 → 圆角倒角的顺序建特征，每步检查返回值。\n5. 保存原生文件并导出交换格式，记录路径与 SHA-256。\n6. 导出四视图预览，读 *_review_report.json 并目视复核。\n\n## 验收证据（逐条给出实际结果，不要只说成功）\n- 草图完全定义，关键驱动尺寸可改且孔位保持正确。\n- 特征树含目标特征，重建成功（ForceRebuild3 返回 True）。\n- 原生文件与交换格式均已落盘，附绝对路径与 SHA-256。\n- 四视图预览非空白，主体存在、比例合理、无缺失部件。\n\n## 风险与人工复核\n- 未验证能力与假设参数必须标注 review_required。\n- 材料、公差、制造工艺结论需工程师复核。\n\n## 交付物\n- 原生文件（.sldprt/.sldasm/.slddrw）+ 交换格式（.step/.stl/.pdf/.dxf）\n- 四视图预览图 + *_review_report.json（evaluation.status / issues / checks）\n- 每个产物给绝对路径与 SHA-256\n\n## 硬性约束\n- 先跑 python SKILL_DIR/scripts/sw_preflight.py 自检；SolidWorks 版本与界面语言先确认。\n- 能力等级以 SKILL_DIR/capabilities.yaml 为准；reference_only / not_implemented 不得作为无人值守交付。\n- API 一律使用米制；单位换算用 mm()/deg()，禁止把毫米直接传给 COM。\n- 未封装的接口先 python SKILL_DIR/scripts/sw_api_lookup.py <接口> <方法> 查证，禁止凭记忆猜长参数 COM 方法。\n- 草图用尺寸与关系驱动，禁止批量 Fix 冒充完全定义。\n- 每步检查 COM 返回值 None/False，失败要保留错误码并说明回退路径。\n- 生成或修改后必须导等轴测/前/俯/右四视图预览并目视复核。\n- 未验证能力、缺失依赖、假设参数必须显式标注 review_required。\n\n## 禁止\n- 不要用「保存成功」代替验收。\n- 不要改扩展名或写空文件伪造格式支持。\n- 不要把演示动画说成机械配合。\n- 不要在缺证据时宣称任务完成。","promptBrief":"# 目标\n{{task}}\n\n## 任务类型\n模板：通用零件任务（part｜难度 standard）｜工作流：mounting_bracket｜能力：part_and_features\n\n## 技能与环境\n- 技能根目录：SKILL_DIR（SOLIDWORKS_AUTOMATION_SKILL_DIR，默认 C:\\Users\\<you>\\.agents\\skills\\solidworks-automation）\n- 入口自检：python SKILL_DIR/scripts/sw_preflight.py\n- 能力真源：SKILL_DIR/capabilities.yaml\n- 后端路由：python SKILL_DIR/scripts/backend_router.py --list\n- 参考文档：references/part-modeling.md、references/review.md、references/troubleshooting.md\n- 复用脚本：按技能 SKILL.md 路由，从 scripts/sw_part.py 起步\n\n## 输入参数\n- 要做的东西：{{param:goal}}\n- 材料：{{param:material}}（可选）\n- 交付格式：{{param:output}}（可选）\n- 关键约束：{{param:constraints}}（可选）\n\n## 执行步骤\n1. 运行 python SKILL_DIR/scripts/sw_preflight.py 自检环境与 SolidWorks 连接。\n2. 按需求确定交付级别（演示 / 结构验证 / 可制造），把已知参数与假设参数分表列出。\n3. 用 SolidWorksSession() 新建或打开文档，先建主轮廓草图并完全定义。\n4. 按基体 → 切除 → 孔槽 → 圆角倒角的顺序建特征，每步检查返回值。\n5. 保存原生文件并导出交换格式，记录路径与 SHA-256。\n6. 导出四视图预览，读 *_review_report.json 并目视复核。\n\n## 验收证据（逐条给出实际结果，不要只说成功）\n- 草图完全定义，关键驱动尺寸可改且孔位保持正确。\n- 特征树含目标特征，重建成功（ForceRebuild3 返回 True）。\n- 原生文件与交换格式均已落盘，附绝对路径与 SHA-256。\n- 四视图预览非空白，主体存在、比例合理、无缺失部件。\n\n## 硬性约束\n- 先跑 python SKILL_DIR/scripts/sw_preflight.py 自检；SolidWorks 版本与界面语言先确认。\n- 能力等级以 SKILL_DIR/capabilities.yaml 为准；reference_only / not_implemented 不得作为无人值守交付。\n- API 一律使用米制；单位换算用 mm()/deg()，禁止把毫米直接传给 COM。\n- 未封装的接口先 python SKILL_DIR/scripts/sw_api_lookup.py <接口> <方法> 查证，禁止凭记忆猜长参数 COM 方法。\n- 草图用尺寸与关系驱动，禁止批量 Fix 冒充完全定义。\n- 每步检查 COM 返回值 None/False，失败要保留错误码并说明回退路径。\n- 生成或修改后必须导等轴测/前/俯/右四视图预览并目视复核。\n- 未验证能力、缺失依赖、假设参数必须显式标注 review_required。\n\n## 禁止\n- 不要用「保存成功」代替验收。\n- 不要改扩展名或写空文件伪造格式支持。\n- 不要把演示动画说成机械配合。\n- 不要在缺证据时宣称任务完成。\n\n## 需要标注的复核点\n- 未验证能力与假设参数必须标注 review_required。\n- 材料、公差、制造工艺结论需工程师复核。"},"tips":[{"id":"units-api-meters","category":"units","title":"所有长度单位是米","body":"草图坐标、拉伸深度、孔径、圆角半径、阵列间距都以米传入；把 10 当成 10mm 会得到 1000 倍的草图，切除落在实体之外被静默拒绝。实测把 100x60x6mm 的板撑到 13300mm 包围盒就是这个原因。涉及毫米的输入一律先过 sw_connect.mm() 再进 COM。","code":"from sw_connect import mm\nfrom sw_hole_features import create_blind_hole\nfrom sw_part import extrude_cut\n\nfeature = extrude_cut(model, sketch_name, mm(8))   # 8mm -> 0.008\nblind = create_blind_hole(model, (mm(20), mm(20)), mm(6.6), mm(10))","source":"references/troubleshooting.md"},{"id":"units-getpartbox-modes","category":"units","title":"GetPartBox 两种单位模式","body":"GetPartBox(True) 返回米（系统单位），GetPartBox(False) 返回毫米（文档单位，受单位制影响）；用错模式会得到 1000 倍或 0.001 倍的尺寸。sw_measure.collect_bounding_box() 统一按 True 读取再换算为毫米。","code":"from sw_measure import collect_bounding_box\n\nbox = collect_bounding_box(model)\nprint(box[\"size_mm\"])    # [长, 宽, 高]，毫米","source":"references/troubleshooting.md"},{"id":"api-selectbyid2-signature","category":"api","title":"SelectByID2 必须九个参数","body":"SelectByID2(Name, Type, X, Y, Z, Append, Mark, CalloutOut, SelectOption) 共九个参数，坐标是实体上的魔法值；Callout 必须是 Dispatch 变体，传 Python None 会报 TypeError（无法转换为 COM VARIANT）。用 create_empty_dispatch_variant() 生成空 Dispatch。","code":"from sw_connect import create_empty_dispatch_variant\n\nok = model.Extension.SelectByID2(\n    \"Front Plane\", \"PLANE\", 0, 0, 0,          # Name, Type, X, Y, Z\n    False, 0,                                  # Append, Mark\n    create_empty_dispatch_variant(), 0,        # CalloutOut, SelectOption\n)","source":"references/troubleshooting.md"},{"id":"selection-entity-type-strings","category":"selection","title":"选择类型字符串对照","body":"SelectByID2 第二个参数的类型字符串决定选择语义：PLANE 基准面、FACE 面、EDGE 边线、VERTEX 顶点、SKETCH 草图、BODYFEATURE 实体特征、COMPONENT 组件、AXIS 轴线、SKETCHSEGMENT 草图线段、SKETCHPOINT 草图点、EXTSKETCHSEGMENT 外部草图线段、REFERENCECURVES 参考曲线。类型写错时函数返回 False 且不报错。","code":"ENTITY_TYPES = [\n    \"PLANE\", \"FACE\", \"EDGE\", \"VERTEX\", \"SKETCH\", \"BODYFEATURE\",\n    \"COMPONENT\", \"AXIS\", \"SKETCHSEGMENT\", \"SKETCHPOINT\",\n    \"EXTSKETCHSEGMENT\", \"REFERENCECURVES\",\n]","source":"references/part-modeling.md"},{"id":"selection-sketch-object-first","category":"selection","title":"草图选择优先对象级 Select2","body":"优先用 sw_part.sketch() 上下文或 end_sketch() 返回的真实草图引用，选择顺序为「活动草图引用 → 创建时缓存引用 → FeatureByName → SelectByID2(\\\"SKETCH\\\")」。SW2024 中文版下 SelectByID2(\\\"草图1\\\"/\\\"Sketch1\\\", \\\"SKETCH\\\", ...) 都会返回 False，随后 FeatureExtrusion3 返回 None；旧封装还把「选择集数量 > 0」当成功，残留选择集被清空后全部失败。","code":"from sw_part import end_sketch, extrude_boss, sketch_circle, start_sketch\n\nstart_sketch(model, \"Front Plane\")\nsketch_circle(model, 0, 0, 0.025)\nsketch_ref = end_sketch(model)              # 真实草图对象引用\nfeature = extrude_boss(model, sketch_ref, 0.05)\nif feature is None:\n    raise RuntimeError(\"拉伸失败：检查草图闭合、方向和对象选择\")","source":"references/troubleshooting.md"},{"id":"selection-edge-geometry-first","category":"selection","title":"按几何条件选边而非坐标","body":"SelectByID2(\\\"Edge1\\\", \\\"EDGE\\\", x, y, z, ...) 依赖坐标魔法值，改板厚、加孔后静默返回 False，而 FeatureFillet 仍会对当前选择集执行。改用 sw_edge_select.select_edges() 按 B-Rep 条件过滤（axis/min_length_mm/circular/diameter_mm/convex_only/concave_only），选不到时返回 status=error 且不继续创建特征。先用 dry_run 或 rejected_sample 确认选中的正是目标边。","code":"from sw_connect import mm\nfrom sw_edge_select import select_edges\nfrom sw_part import fillet\n\npreview = select_edges(model, {\"axis\": \"z\", \"convex_only\": True})\nif preview[\"status\"] != \"ok\":\n    raise RuntimeError(preview[\"errors\"])\nprint(preview[\"selected_count\"], preview[\"rejected_sample\"])\nfillet(model, mm(4))","source":"references/edge-selection.md"},{"id":"api-edge-select4-callout","category":"api","title":"选边优先用 Select2","body":"Select4(Append, Callout) 的 Callout 必须是 Dispatch 变体，传 Python None 得到类型不匹配 0x80020005（-2147352571）。封装优先走 Select2(Append, Mark)，失败才退到 Select4。","code":"from sw_connect import create_empty_dispatch_variant\n\nedge.Select2(True, 0)                                  # 首选\nedge.Select4(True, create_empty_dispatch_variant())    # 回退，不能传 None","source":"references/edge-selection.md"},{"id":"api-plane-names-bilingual","category":"api","title":"中英文基准面名兼容","body":"英文版 Front/Top/Right Plane 对应中文版 前视/上视/右视基准面，法线分别为 Z/Y/X 轴。先试英文名，返回 False 再试中文名；基准面选择失败基本就是名称不匹配。","code":"from sw_connect import create_empty_dispatch_variant\n\nvariant = create_empty_dispatch_variant()\nok = model.Extension.SelectByID2(\"Front Plane\", \"PLANE\", 0, 0, 0, False, 0, variant, 0)\nif not ok:\n    ok = model.Extension.SelectByID2(\"前视基准面\", \"PLANE\", 0, 0, 0, False, 0, variant, 0)\nassert ok, \"基准面名称未匹配\"","source":"references/part-modeling.md"},{"id":"sketch-context-reference-cache","category":"sketch","title":"用 with sketch 进入退出草图","body":"推荐 with sketch(model, \\\"Front Plane\\\") as sketch_name 自动进出草图，sw_part.py 会在创建时缓存真实草图对象引用，避开按名称选择草图失败。手动流程是 start_sketch / sketch_circle / end_sketch，再把 end_sketch 的返回值直接传给 extrude_boss 或 extrude_cut。","code":"from sw_connect import mm\nfrom sw_part import extrude_boss, sketch, sketch_circle\nfrom sw_sketch_quality import fully_define_sketch\n\nwith sketch(model, \"Front Plane\") as sketch_name:\n    sketch_circle(model, 0, 0, mm(25))\n    fully_define_sketch(model)\nfeature = extrude_boss(model, sketch_name, mm(50))","source":"references/part-modeling.md"},{"id":"sketch-fully-defined-evidence","category":"sketch","title":"完全定义靠回读而非返回值","body":"圆/矩形这类基础草图在编辑态调用 sw_sketch_quality.fully_define_sketch(model)：它以原点为基准补尺寸和关系，内部调用 FullyDefineSketch(True, True, 1023, True, 1, variant, 1, variant, 1, 1)，再回读 GetConstrainedStatus、RelationManager.GetRelations、尺寸名数量与 fix_count。验收门槛是 constrained_status==3 且存在驱动尺寸且 fix_count==0，否则抛异常。FullyDefineSketch 返回码未定义，不能当验收结论。","code":"from sw_connect import get_com_member, mm\nfrom sw_sketch_quality import fully_define_sketch, inspect_sketch\n\nwith sketch(model, \"Front Plane\") as sketch_name:\n    sketch_circle(model, 0, 0, mm(25))\n    record = fully_define_sketch(model)\nprint(record[\"constrained_status\"], record[\"dimension_count\"], record[\"fix_count\"])\nactive = get_com_member(model.SketchManager, \"ActiveSketch\")\nprint(inspect_sketch(active)[\"dimension_names\"])","source":"scripts/sw_sketch_quality.py"},{"id":"sketch-no-batch-fix","category":"sketch","title":"禁止批量 Fix 伪造完全定义","body":"sgFIXED 只用于明确固定参考的场景，不得批量加到所有实体上冒充参数化草图。正确做法是用 sgHORIZONTAL / sgVERTICAL / sgCOINCIDENT / sgEQUAL 等关系加驱动尺寸，inspect_sketch 会把 fix_count 计入验收。","code":"# 允许：明确固定参考几何\nmodel.SketchAddConstraints(\"sgFIXED\")\n# 禁止：批量 Fix 全部实体冒充完全定义\n# 应改用几何关系 + 驱动尺寸：\nmodel.SketchAddConstraints(\"sgHORIZONTAL\")\nmodel.SketchAddConstraints(\"sgCOINCIDENT\")","source":"references/part-modeling.md"},{"id":"review-inspect-model-sketches","category":"review","title":"回读已保存模型全部草图","body":"复杂草图应人工定义设计参数，再用 sw_sketch_quality.inspect_model_sketches(model) 验收：它遍历 ProfileFeature 与 3DProfileFeature，逐个回读约束状态、尺寸名、fix_count，并检查特征是否被下游特征消费（dangling）。没有尺寸、悬空或证据不足都要复核。","code":"from sw_sketch_quality import inspect_model_sketches\n\nfor record in inspect_model_sketches(model):\n    print(record[\"name\"], record[\"status\"], record.get(\"consumed_by\"), record.get(\"dangling\"))","source":"scripts/sw_sketch_quality.py"},{"id":"feature-extrusion3-parameter-order","category":"feature","title":"长参数拉伸按文档顺序","body":"FeatureExtrusion3 按 Sd, Flip, Dir, T1, T2, D1, D2, Dchk1, Dchk2, Ddir1, Ddir2, Dang1, Dang2, OffsetReverse1, OffsetReverse2, TranslateSurface, Merge, UseFeatScope, UseAutoSelect, T0, StartOffset 顺序传参。T1/T2 取 0=swEndCondBlind 给定深度、1=swEndCondThroughAll 完全贯穿、5=swEndCondUpToSurface、6=swEndCondMidPlane 两侧对称、7=swEndCondUpToBody。D1 深度是米、Dang1 拔模角是弧度。","code":"from sw_connect import mm\nfrom sw_part import extrude_boss\n\n# Sd, Flip, Dir, T1, T2, D1, D2, Dchk1, Dchk2, Ddir1, Ddir2, Dang1, Dang2,\n# OffsetReverse1, OffsetReverse2, TranslateSurface, Merge, UseFeatScope,\n# UseAutoSelect, T0, StartOffset\nfeature = extrude_boss(model, sketch_name, mm(8), direction=True, merge=True)\nif feature is None:\n    raise RuntimeError(\"凸台拉伸失败\")","source":"references/part-modeling.md"},{"id":"feature-cut4-through-all","category":"feature","title":"切除完全贯穿与翻转回退","body":"FeatureCut4 参数多，终止条件、翻转方向、FlipSide、NormalCut 与选择集任一处不匹配都会静默返回 None，不要凭记忆手拼。sw_part.extrude_cut 约定 depth=0 表示完全贯穿（内部把终止条件置为 1，深度填占位值），失败时先翻转 flip 再判定。","code":"from sw_part import extrude_cut\n\nfeature = extrude_cut(model, sketch_name, 0)          # depth=0 -> 完全贯穿\nif feature is None:\n    feature = extrude_cut(model, sketch_name, 0, direction=True, flip=True)\nif feature is None:\n    raise RuntimeError(\"切除失败：检查草图、方向或终止条件\")","source":"references/troubleshooting.md"},{"id":"feature-return-none-check","category":"error","title":"特征返回值判空而不是判真","body":"SolidWorks 大多数特征 API 失败时返回 None。不要写 if feature: 就继续保存，也不要把空返回值当成功；每次创建特征后检查，失败就中止或显式降级，不要继续保存交付文件。","code":"from sw_connect import mm\nfrom sw_part import extrude_boss\n\nfeature = extrude_boss(model, sketch_ref, mm(8))\nif feature is None:\n    raise RuntimeError(\"拉伸失败：检查草图是否闭合、方向是否正确、深度是否非零\")","source":"references/troubleshooting.md"},{"id":"api-featuremanager-naming","category":"api","title":"特征名多语言且不可作验收","body":"特征名随界面语言变化（凸台-拉伸1、切除-拉伸1），只能作日志不能作验收依据；选草图走「活动草图引用 → 缓存引用 → FeatureByName → SelectByID2(\\\"SKETCH\\\")」。线性阵列委托 sw_pattern，用 20 参数 FeatureLinearPattern4 并挑与方向平行的真实直边；圆周阵列必须传明确轴名称或实体，InsertAxis2 不是 FeatureManager 成员。","code":"from sw_assembly import iter_feature_tree\nfrom sw_connect import get_com_member\n\nfor feature, depth in iter_feature_tree(model):\n    print(depth, get_com_member(feature, \"Name\"), get_com_member(feature, \"GetTypeName2\"))","source":"references/part-modeling.md"},{"id":"error-fillet-four-params","category":"error","title":"FeatureFillet 只接受四参数","body":"IFeatureManager::FeatureFillet(Options, Radius, R1, R2) 只有 4 个参数，Options 常用 195；在末尾补三个 None 传 7 个参数会在 SW2024 和 2026 上抛「非选择性的参数」0x8002000F。函数签名说明里的 Rarray1/2/3 不是这个调用点的参数。","code":"from sw_connect import mm\nfrom sw_edge_select import select_edges\nfrom sw_part import fillet\n\nselection = select_edges(model, {\"axis\": \"z\", \"convex_only\": True})\nif selection[\"status\"] != \"ok\":\n    raise RuntimeError(f\"未选中边线: {selection['errors']}\")\nfeature = fillet(model, mm(4))    # 内部调用 FeatureFillet(195, radius, 0, 0)","source":"references/edge-selection.md"},{"id":"error-fillet-empty-selection","category":"error","title":"空选择集圆角会切错轮廓","body":"选择集为空时 SolidWorks 会对「当前轮廓」执行圆角，产生难以排查的错误特征，而且不报错。sw_part.fillet() 已在选择集数量 <=0 时抛 ValueError 并提示改用 select_edges()，自己的选边代码要照抄这个校验。","code":"from sw_connect import mm\nfrom sw_part import fillet\n\ntry:\n    fillet(model, mm(4))          # 未选边 -> ValueError\nexcept ValueError as error:\n    print(\"先选边:\", error)","source":"references/edge-selection.md"},{"id":"feature-insertfeaturechamfer-args","category":"feature","title":"倒角八参数与弧度角度","body":"InsertFeatureChamfer(Options, ChamferType, Width, Angle, OtherDist, VertexDist1, VertexDist2, VertexDist3)：Options=4 表示角度距离，ChamferType=1 表示等距离，Width 是米、Angle 是弧度。sw_part.chamfer(distance, angle_deg) 负责把度转弧度并补齐后三个顶点距离为 0。","code":"from sw_connect import mm\nfrom sw_part import chamfer\n\n# InsertFeatureChamfer(4, 1, Width, Angle, OtherDist, VertexDist1, VertexDist2, VertexDist3)\nfeature = chamfer(model, mm(1), angle_deg=45)","source":"references/part-modeling.md"},{"id":"feature-fillet-chamfer-order","category":"feature","title":"圆角倒角按阶段拆分执行","body":"稳定顺序是「基础体 → 外轮廓圆角/倒角 → 孔槽切除 → 孔口倒角 → 审查」。同一模型上连续做多组圆角/倒角时，后一组可能选到前一组产生的相切边，每组前都要用 solidworks_list_edges 或 select_edges 复核当前拓扑。圆角失败应降级为保留直边模型并在报告里标注「外观圆角未应用」，不要让整条建模流程失败。","code":"from sw_connect import mm\nfrom sw_edge_select import select_edges\nfrom sw_part import chamfer, extrude_boss, fillet\n\nboss = extrude_boss(model, sketch_ref, mm(20))          # 1) 基础体\nselect_edges(model, {\"axis\": \"z\", \"convex_only\": True})\nfillet(model, mm(6))                                     # 2) 外轮廓圆角\nfor center in hole_centers:\n    create_blind_hole(model, center, mm(6.6), mm(10))    # 3) 孔槽切除\nselect_edges(model, {\"circular\": True, \"diameter_mm\": 6.6, \"diameter_tolerance_mm\": 0.05})\nchamfer(model, mm(0.5))                                  # 4) 孔口倒角","source":"references/edge-selection.md"},{"id":"feature-tangent-plane-slot","category":"feature","title":"圆柱表面槽用切向偏置面","body":"键槽、长圆槽、局部沉槽在圆柱外表面时不要从中心基准面盲切，Front Plane 常穿过轴线，直接切会出现沿轴向的大平面剖口。做法是 InsertRefPlane(8, mm(半径), 0, 0, 0, 0) 建平行于 Front Plane 的切向参考面，在其上 sketch_slot 画槽，用盲切深度表达槽深，成功后隐藏临时参考面。","code":"from sw_connect import create_empty_dispatch_variant, mm\nfrom sw_part import extrude_cut, sketch_slot\n\nplane = model.FeatureManager.InsertRefPlane(8, mm(radius_mm), 0, 0, 0, 0)\nplane.Name = \"Plane_Keyway_Tangent\"\nmodel.Extension.SelectByID2(plane.Name, \"PLANE\", 0, 0, 0, False, 0,\n                            create_empty_dispatch_variant(), 0)\nmodel.SketchManager.InsertSketch(True)\nsketch_name = model.SketchManager.ActiveSketch.Name\nsketch_slot(model, mm(x1), 0, mm(x2), 0, mm(slot_width_mm / 2))\nmodel.SketchManager.InsertSketch(True)\nfeature = extrude_cut(model, sketch_name, mm(depth_mm), direction=True, flip=True)","source":"references/part-modeling.md"},{"id":"hole-params-in-meters","category":"hole","title":"孔特征参数全部用米","body":"sw_hole_features 的 center/start/end 是目标草图平面的局部二维坐标，diameter、depth、counterbore_diameter 等全部期望米，建议统一由 sw_connect.mm() 转换；毫米字段只写进报告，不回传 COM。盲孔用 create_blind_hole(model, (x, y), diameter, depth, name=...)，两级复合孔用 create_counterbore_hole 的 hole_diameter/counterbore_diameter/counterbore_depth 命名参数。","code":"from sw_connect import mm\nfrom sw_hole_features import create_blind_hole, create_counterbore_hole\n\nblind = create_blind_hole(model, (mm(20), mm(20)), mm(8), mm(10), name=\"H1_盲孔\")\ncounterbore = create_counterbore_hole(\n    model, (mm(50), mm(20)),\n    hole_diameter=mm(6), counterbore_diameter=mm(12),\n    counterbore_depth=mm(4), name=\"H2_沉孔\")","source":"references/complex-hole-features.md"},{"id":"hole-evidence-dict-keys","category":"hole","title":"孔证据取 feature_names 键","body":"HoleFeatureEvidence.to_dict() 的键是 feature_names（元组），没有 status 也没有 feature_name；写成 result.get(\\\"status\\\") 会把成功的孔判成失败。创建函数返回的是参数证据，不是几何验收结论。","code":"from sw_connect import mm\nfrom sw_hole_features import create_through_hole\n\nresult = create_through_hole(model, center=(mm(10), mm(10)), diameter=mm(6.6))\nnames = result.to_dict()[\"feature_names\"]\nif not names:\n    raise RuntimeError(\"SolidWorks 未创建特征\")","source":"references/troubleshooting.md"},{"id":"hole-countersink-entry-edge","category":"hole","title":"锥形沉头按入口圆边倒角","body":"锥形沉头孔 = 通孔 + 通孔入口圆边的角度/距离倒角，入口边按圆心、半径和基准面位置筛选，不依赖临时边线名称；included_angle_deg 是包含角。倒角后必须看剖视图确认入口方向和角度是否正确。","code":"from sw_connect import mm\nfrom sw_hole_features import create_countersink_hole\n\ncountersink = create_countersink_hole(\n    model, (mm(80), mm(20)),\n    hole_diameter=mm(5), countersink_diameter=mm(10),\n    included_angle_deg=90, name=\"H3_沉头\")","source":"references/complex-hole-features.md"},{"id":"review-hole-geometry-evidence","category":"review","title":"孔位验收要做几何交叉复核","body":"创建函数只给参数证据，交付前必须继续跑 sw_review.collect_geometry_measurements() 读 B-Rep 圆柱面、sw_review.validate_hole_positions() 验证孔径与孔轴线位置，并对盲孔深度、沉孔深度、沉头角度回读特征参数或看剖视图。半圆槽端部圆柱面要落在 slot_arc_candidates 里，不能计入圆孔数量；复合孔应在 compound_holes 中出现同轴多直径孔段。B-Rep 单独无法区分盲孔和通孔，必须与创建参数交叉验证。","source":"references/complex-hole-features.md"},{"id":"api-byref-variant","category":"api","title":"输出参数用 VARIANT 包装","body":"错误码、警告码、ErrorStatus 这类 by-ref 输出参数必须用 VARIANT(pythoncom.VT_BYREF | pythoncom.VT_I4, 0) 包装，直接传整数或 None 会抛 TypeError 或拿不到回写值。SaveAs 之后打印 errors.value / warnings.value 才能定位失败原因。","code":"from win32com.client import VARIANT\nimport pythoncom\n\nerrors = VARIANT(pythoncom.VT_BYREF | pythoncom.VT_I4, 0)\nwarnings = VARIANT(pythoncom.VT_BYREF | pythoncom.VT_I4, 0)\nsuccess = model.Extension.SaveAs(path, 0, 1, None, errors, warnings)\nprint(f\"错误码: {errors.value}, 警告码: {warnings.value}\")","source":"references/troubleshooting.md"},{"id":"api-safearray-material","category":"api","title":"材质颜色数组要 SAFEARRAY","body":"把普通 Python list 直接传给 MaterialPropertyValues 会导致 COM 数组编组错位，装配体几乎只剩一种绿色；必须用 material_variant() 生成 VT_ARRAY | VT_R8。SetMaterialPropertyValues2 返回 void，不能用 bool() 判成功，要用 verify_appearance() 回读 RGB，截图前再 ClearSelection2(True) 清掉选择高亮。","code":"from sw_appearance import set_component_appearance, verify_appearance\n\nset_component_appearance(component, \"signal_red\")\nassert verify_appearance(component, \"signal_red\")[\"ok\"]\nmodel.ClearSelection2(True)\nmodel.GraphicsRedraw2()","source":"references/troubleshooting.md"},{"id":"api-pywin32-comtypes-packandgo","category":"api","title":"两套 COM 客户端分工","body":"本机 SW2024/2026 + pywin32 会把 GetPackAndGo 的 [out, retval] IPackAndGo** 编组错位，零参数动态调用和显式 VT_BYREF|VT_DISPATCH 都可能拿不到返回指针。sw_delivery.pack_and_go() 先试 pywin32 官方零参数调用，抛签名错误时改用 comtypes 早绑定调用 IModelDocExtension.GetPackAndGo / SavePackAndGo；不要用 AddExternalDocuments 补装配体零件。","code":"from sw_delivery import pack_and_go\n\nreport = pack_and_go(assembly, r\"E:\\delivery\\pack_and_go\", flatten=True)\nassert report[\"success\"], report","source":"references/troubleshooting.md"},{"id":"error-hresult-connection","category":"error","title":"连接类 HRESULT 与 ProgID","body":"-2147221005「无效的类字符串」= SolidWorks 未安装或 COM 未注册，可指定版本 ProgID（2024 用 SldWorks.Application.32，2026 用 .34）重试；-2147221021「操作不可用」= SolidWorks 未运行，改用 Dispatch 启动新实例。Python 位数必须与 SolidWorks 一致（通常 64 位），修订号 = (年份 - 2000) + 8。","code":"import win32com.client\n\nsw = win32com.client.Dispatch(\"SldWorks.Application.32\")   # 2024\n# 2026 -> SldWorks.Application.34；修订号 = (年份 - 2000) + 8\nprint(sw.RevisionNumber())","source":"references/troubleshooting.md"},{"id":"error-rebuild-recovery","category":"error","title":"重建失败与批量崩溃恢复","body":"执行标记失败、重建失败、未知检查结果或人工复核未完成时不得宣称任务完成。大批量生成后 AddComponent4、保存和特征操作随机失败，先保存关键输出，再 sw.CloseAllDocuments(False) 清会话并分批重开，仍不稳定则记录失败组件和失败 API 后重启 SLDWORKS.exe。截图与验收前统一 ForceRebuild3(False) 加 ViewZoomtofit2。","code":"model.ClearSelection2(True)\nmodel.ForceRebuild3(False)\nmodel.ViewZoomtofit2()","source":"references/troubleshooting.md"},{"id":"assembly-add-component5-fallback","category":"assembly","title":"AddComponent 空返回回退","body":"SW2024 中文版 + pywin32 下 AddComponent4() 可能无异常却返回 None；封装先走 AddComponent5() 的 8 参数签名，失败再回退 AddComponent4()。两者都为空时静默打开零件、重新激活装配体后重试；前提是零件文件真实存在、装配体是活动文档且零件已存盘。","code":"from sw_assembly import add_component\ncomponent = add_component(asm_model, r\"E:\\parts\\base.SLDPRT\", x=0, y=0, z=0)\n# 底层稳定调用\ncomponent = asm_model.AddComponent5(CompPath, 0, \"\", False, ConfigName, X, Y, Z)","source":"references/assembly.md"},{"id":"assembly-resolve-component-first","category":"assembly","title":"先解析组件再读面或建配合","body":"轻化/压缩组件会让 IComponent2.GetModelDoc2() 返回 None，不要当成“零件没有特征”。做 Mate、读特征或拾面之前先 resolve_component()；SetSuppression2() 可能清空选择集，所以顺序是先解析再选实体。","code":"from sw_assembly import find_component_by_name, resolve_component\ncomponent_a = find_component_by_name(asm, \"shaft\")\ncomponent_b = find_component_by_name(asm, \"bearing\")\nresolve_component(component_a)\nresolve_component(component_b)\npart = component_a.GetModelDoc2()","source":"references/assembly.md"},{"id":"assembly-step-split-bbox-center","category":"assembly","title":"拆分 STEP 按包围盒中心插入","body":"把复杂 STEP 拆件再装配时不要假设分件以局部原点表示，部分导出器保留实体绝对坐标，此时 AddComponent5(x=0,y=0,z=0) 会让所有分件按包围盒中心叠到装配原点。manifest 至少保存 label、step、color_hex、bbox.center_m 与 bbox.size_mm，按 bbox.center_m 插入。","code":"center = item[\"bbox\"][\"center_m\"]\ncomponent = add_component(\n    assembly, item[\"native_path\"],\n    x=center[0], y=center[1], z=center[2], sw=session.sw,\n)","source":"references/export.md"},{"id":"mate-get-corresponding-select","category":"mate","title":"装配上下文实体选择","body":"零件上下文与装配体上下文不能混用，能拿到对象引用时优先 GetCorresponding() + Select2()，少依赖坐标点击。第一个实体 Select2(False, 1)、第二个用 Select2(True, 1) 追加，建 Mate 前确认 SelectionManager.GetSelectedObjectCount2(-1) == 2；选择标记普通 Mate/Gear 用 1、Width 用 16、Cam-Follower 用 8。","code":"feature_a = get_component_feature(component_a, [\"前视基准面\", \"Front Plane\"])\nentity_a = get_assembly_entity(component_a, feature_a)\nentity_b = get_assembly_entity(component_b, feature_b)\nselect_entities_for_mate(asm, entity_a, entity_b, mark=1)\nassert asm.SelectionManager.GetSelectedObjectCount2(-1) == 2","source":"references/assembly.md"},{"id":"mate-concentric-keep-rotation","category":"mate","title":"同心配合不锁旋转","body":"旋转件只用一个同心 Mate 且 lock_rotation=False，再用一个平面重合或距离 Mate 限制轴向窜动；不要用三基准面把轴、齿轮、上盖完全锁死。固定件才允许用三基准面重合或距离 Mate 锁死。","code":"add_concentric_mate_by_cylinders(\n    asm, shaft_comp, bearing_comp,\n    radius_a=(0.004, 0.006), radius_b=(0.004, 0.006),\n    name=\"shaft_bearing_concentric\", lock_rotation=False,\n)","source":"references/assembly.md"},{"id":"mate-gear-real-ratio","category":"mate","title":"Gear Mate 按齿数建真实传动","body":"齿轮联动用真实 Gear Mate（swMateGEAR=10），按齿数传 gear_num/gear_den，实体选齿轮轴线、孔圆柱面或轴。Gear Mate 只强制两个组件绕所选轴按比例相对转动，不负责防穿透，也不等同接触仿真。","code":"add_gear_mate_by_cylinders(\n    asm, small_gear_comp, large_gear_comp,\n    teeth_a=18, teeth_b=26,\n    radius_a=(0.004, 0.008), radius_b=(0.004, 0.008),\n    name=\"small_large_gear_ratio_18_26\",\n)\nprint(collect_mate_feature_summary(asm))","source":"references/assembly.md"},{"id":"mate-addmate5-variant-signature","category":"mate","title":"AddMate5 参数与错误码","body":"AddMate5 是 15 参数签名（SW2015+），by-ref 错误码必须用 VARIANT(pythoncom.VT_BYREF | pythoncom.VT_I4, 0) 包装。距离单位米、角度单位弧度，无上下限时 distance_upper/lower 等于 distance，angle_upper/lower 同同名规则。","code":"errors = VARIANT(pythoncom.VT_BYREF | pythoncom.VT_I4, 0)\nmate = asm_model.AddMate5(\n    mate_type, align, flip, distance, distance, distance,\n    gear_num, gear_den, angle, angle, angle,\n    for_positioning_only, lock_rotation, width_mate_option, errors,\n)","source":"references/assembly.md"},{"id":"mate-feature-tree-verify","category":"mate","title":"遍历 MateGroup 验证真实配合","body":"创建后用 collect_mate_feature_summary() 或遍历 MateGroup 子特征，确认 MateConcentric、MateGearDim 等真实 Mate 特征已写入特征树。脚本生成的 GIF 或预览视频只能证明可被驱动到多个位置，不等同于软件里可拖动。","code":"summary = collect_mate_feature_summary(asm)\nfor item in summary.get(\"features\", []):\n    print(item)","source":"references/assembly.md"},{"id":"motion-create-study-entry","category":"motion","title":"建真实运动算例","body":"Motion 前先把装配约束收紧：静止件固定、旋转件同心未锁转且浮动，再用 create_motion_study(asm, name=..., duration=4.0) 建算例。目标是在时间轴里生成可计算、可播放的动画，不能用脚本假动画替代机械自由度。","code":"from sw_motion import create_motion_study, calculate_and_play\nstudy = create_motion_study(asm, name=\"叶轮_60RPM_循环转动\", duration=4.0)\nok = calculate_and_play(study)","source":"references/motion-study.md"},{"id":"motion-rotary-motor-fm78","category":"motion","title":"旋转马达 FM 78 与 RPM 单位","body":"旋转马达用 study.CreateDefinition(78)（swFmAEMRotationalMotor）后 CreateFeature()。ConstantSpeedMotor(60.0) 的参数单位是 RPM，不要换算成 rad/s；DirectionReference 选静止轴的装配体上下文圆柱面最稳定，CreateFeature() 返回 None 时先查方向与载荷引用是否为装配体上下文实体。","code":"SW_FM_AEM_ROTATIONAL_MOTOR = 78\nmotor_data = study.CreateDefinition(SW_FM_AEM_ROTATIONAL_MOTOR)\nmotor_data.DirectionReference = shaft_axis_face\nmotor_data.ConstantSpeedMotor(60.0)   # RPM\nmotor_data.RelativeComponent = stand_comp\nmotor_data.Location = rotor_face\nmotor_data.LoadReferences = (rotor_face,)\nmotor_feature = study.CreateFeature(motor_data)","source":"references/motion-study.md"},{"id":"motion-results-not-outdated","category":"motion","title":"运动算例结果不过期才验收","body":"计算后必须跑 validate_motion_studies()：算例真实存在可读、swmotionstudy.tlb 已加载、时长与马达数达标、GetResults() 返回结果对象、results_out_of_date 明确为 False。只看到时间轴、马达图标、播放动画或 Calculate=True 都不算验收，失败时必须阻止交付。","code":"ok = calculate_and_play(study)\naudit = validate_motion_studies(\n    asm, study_name=\"叶轮_60RPM_循环转动\",\n    minimum_duration_seconds=4.0, minimum_motor_count=1, require_results=True,\n)\nassert audit[\"validation\"][\"status\"] == \"pass\"","source":"references/motion-study.md"},{"id":"motion-dynamic-com-member","category":"motion","title":"运动算例动态 COM 成员兼容","body":"IMotionStudyManager 在 swmotionstudy.tlb 而不在主 Interop 库；未生成 pywin32 包装时 GetMotionStudyManager、CreateMotionStudy、Activate/Calculate/Play 可能表现为属性，直接调用 CreateMotionStudy() 会报“找不到成员”。统一用 motion_member() 与 ensure_motion_type_library() 取成员；SetDuration/CreateDefinition/CreateFeature 通常仍是方法。","code":"from sw_motion import ensure_motion_type_library, motion_member\nensure_motion_type_library()\nmotion_mgr = motion_member(asm.Extension, \"GetMotionStudyManager\")\nstudy = motion_member(motion_mgr, \"CreateMotionStudy\")\nmotion_member(study, \"SetDuration\", 4.0)\ncalculated = motion_member(study, \"Calculate\")","source":"references/motion-study.md"},{"id":"motion-motor-dof-prerequisites","category":"motion","title":"马达失效先查自由度","body":"马达只能驱动仍有旋转自由度的组件。常见失败：叶轮被 FixComponent() 固定、同心 Mate 建时 lock_rotation=True、又被多个基准面重合锁死、或选了零件上下文面而不是 GetCorresponding() 后的装配体面。推荐静止件固定、旋转件仅同心 + 一个轴向定位 Mate 且保持浮动。","code":"add_concentric_mate_by_cylinders(\n    asm, shaft_comp, rotor_comp,\n    radius_a=(mm(4.5), mm(5.5)),\n    radius_b=(mm(10.5), mm(11.5)),\n    lock_rotation=False,\n)","source":"references/motion-study.md"},{"id":"motion-drag-dof-verification","category":"motion","title":"自由度以软件内可拖动为准","body":"最终验收要在 SolidWorks 打开 .SLDASM，用“移动零部件 / Move Component”拖动轴、齿轮或上盖；Gear Mate 正确时拖一个齿轮另一个按比例联动。拖不动依次查：零件是否固定、同心 Mate 是否勾了 Lock Rotation、是否被额外平面 Mate 锁死、Mate 是否报错或过定义。","code":"# 拖不动时按此顺序排查（SolidWorks GUI：Move Component）\n# 1. 组件是否 FixComponent() 固定\n# 2. 同心 Mate 是否 lock_rotation=True\n# 3. 是否被额外基准面重合/距离 Mate 锁死\n# 4. Mate 是否报错或过定义","source":"references/assembly.md"},{"id":"drawing-third-angle-views","category":"drawing","title":"标准三视图与视图方向比例","body":"标准三视图用 Create3rdAngleViews2()/CreateFirstAngleViews2()；单个视图用 CreateDrawViewFromModelView3(ModelName, ViewName, X, Y, Z)，ViewName 取 *Front/*Back/*Top/*Bottom/*Left/*Right/*Isometric 等，放置位置单位米。比例用 view.ScaleRatio 元组，如 (1.0, 2.0) 即 1:2。","code":"drawing.Create3rdAngleViews2(partPath)        # 第三角投影法\ndrawing.CreateFirstAngleViews2(partPath)      # 第一角投影法\nview = drawing.CreateDrawViewFromModelView3(ModelName, \"*Isometric\", X, Y, Z)\nview.ScaleRatio = (1.0, 2.0)                  # 1:2","source":"references/drawing.md"},{"id":"drawing-model-annotations","category":"drawing","title":"尺寸链起点：模型尺寸导入","body":"自动标注用 InsertModelAnnotations3(InsertType, AnnotationType, DuplicateDims, AutoArrange, UseDoc, UseView)，InsertType=0 表示整个模型，AnnotationType=32768 才是标记为工程图的模型尺寸（32 是几何公差）。SW2024/2026 动态 pywin32 代理把它暴露在工程图 IModelDoc2 上而非 IModelDocExtension，先试文档对象再兼容旧 Extension；它只导入已存在的 DisplayDimension，没有草图尺寸时先调 sw_part.auto_dimension_sketch()。","code":"ok = drawing.InsertModelAnnotations3(\n    0,       # InsertType: 0=整个模型\n    32768,   # 标记为工程图的模型尺寸（32 是几何公差）\n    False,   # DuplicateDims\n    False,   # AutoArrange\n    False,   # UseDoc\n    True,    # UseView\n)","source":"references/drawing.md"},{"id":"drawing-dimension-chain","category":"drawing","title":"手动尺寸链用 AddDimension2","body":"手动尺寸链先按名称选择两个视图实体（第二个用 True 追加到选择集），再 AddDimension2(x, y, 0) 指定标注放置位置。返回 False 或复核不到尺寸实体时，不得把尺寸证据标为已验证。","code":"drawing.Extension.SelectByID2(\"Edge1@View1\", \"EDGE\", 0, 0, 0, False, 0, None, 0)\ndrawing.Extension.SelectByID2(\"Edge2@View1\", \"EDGE\", 0, 0, 0, True, 0, None, 0)\ndrawing.AddDimension2(x, y, 0)","source":"references/drawing.md"},{"id":"drawing-sheet-template-gb-title","category":"drawing","title":"GB 图框标题栏走图纸格式","body":"新图纸用 NewSheet4(Name, PaperSize, TemplateIn, Scale1, Scale2, FirstAngle, Template, W, H, PropertySheet, 分区边距, Zone_Col, Zone_Row)，PaperSize 5=A4、6=A3、7=A2、8=A1、9=A0，TemplateIn=12 表示自定义。图框与标题栏通过图纸格式落地，再用 sheet.SetTemplateName(格式路径) 挂 .slddrt。","code":"drawing.NewSheet4(\"GB-A3\", 6, 12, 1.0, 1.0, True,\n                  templatePath, W, H, \"\",\n                  0, 0, 0, 0, 0, 0)\nsheet = drawing.GetCurrentSheet()\nsheet.SetTemplateName(formatPath)   # .slddrt 图纸格式（图框/标题栏）","source":"references/drawing.md"},{"id":"drawing-bom-table","category":"drawing","title":"BOM 表插入与类型选择","body":"BOM 用 InsertBomTable4(TemplateName, X, Y, BomType, Configuration, TableAnchor, Hidden)，需给 .sldbomtbt 模板路径、插入位置、配置名、锚点与是否包含隐藏组件；BomType 1=顶层、2=仅零件、3=缩进。表格必须与标题栏、图框一起目视复核。","code":"bom = drawing.InsertBomTable4(\n    TemplateName, X, Y,\n    1,              # BomType: 1=顶层, 2=仅零件, 3=缩进\n    Configuration, TableAnchor, False,\n)","source":"references/drawing.md"},{"id":"drawing-pdf-sheets-export","category":"drawing","title":"工程图 PDF 按图纸导出","body":"PDF 导出先 sw.GetExportFileData(1) 拿 IExportPdfData，用 pdf_data.SetSheets(0, sheet_names) 指定图纸（0=指定图纸），再 model.Extension.SaveAs(路径, 0, 1, pdf_data, errors, warnings)；errors 与 warnings 都要 VARIANT byref。","code":"sw = model.GetSldWorksObject()\npdf_data = sw.GetExportFileData(1)               # swExportPDFData\npdf_data.SetSheets(0, drawing.GetSheetNames())   # 0=指定图纸\nerrors = VARIANT(pythoncom.VT_BYREF | pythoncom.VT_I4, 0)\nwarnings = VARIANT(pythoncom.VT_BYREF | pythoncom.VT_I4, 0)\nmodel.Extension.SaveAs(\"output.pdf\", 0, 1, pdf_data, errors, warnings)","source":"references/drawing.md"},{"id":"drawing-layout-evidence-gate","category":"drawing","title":"尺寸文字边界只能估算并目视复核","body":"IAnnotation 没有尺寸文字原生 bounding-box API，不要调用或宣称存在 GetBox()；sw_drawing.estimate_dimension_text_box() 以 GetPosition() 为中心，按 CharHeight/WidthFactor/CharSpacingFactor 与 IDisplayDimension.GetText() 估边界，报告必须写 box_source=estimated。即使无碰撞也返回 review_required / DRAWING_LAYOUT_ESTIMATED_EVIDENCE_REQUIRES_VISUAL_REVIEW，相交只标 DRAWING_LAYOUT_ESTIMATED_COLLISION_RISK 且 confirmed_collision=false；证据强度 PDF 矢量文字 span > COM 估算 > OCR，孔槽定位链、图框、标题栏与 BOM 仍需人工目视复核。","code":"# 更强证据：先导出 PDF，再读真实矢量文字 span\nfrom sw_review import inspect_pdf_text_layout\nlayout = inspect_pdf_text_layout(r\"output.pdf\")\nprint(layout[\"status\"], layout.get(\"findings\"))\n# 报告字段固定：box_source=estimated, box_confidence=low|medium|unavailable","source":"references/drawing.md"},{"id":"export-saveas-error-codes","category":"export","title":"SaveAs 错误码与警告码回读","body":"SaveAs 必须回读 errors 与 warnings：错误码 5=swFileSaveFormatNotAvailable、6=swFileSaveAsDoNotOverwrite、9=swFileSaveAsInvalidFileExtension，1=只读、2=文件名为空、3=含 @。警告 1=RebuildError、2=NeedsRebuild、4=ViewsNeedUpdate，出现重建或视图警告要先修模型再交付。STEP/IGES/STL/Parasolid/DXF/DWG 不需要 ExportData，工程图 PDF 需要 IExportPdfData。","code":"errors = VARIANT(pythoncom.VT_BYREF | pythoncom.VT_I4, 0)\nwarnings = VARIANT(pythoncom.VT_BYREF | pythoncom.VT_I4, 0)\nmodel.Extension.SaveAs(output_path, 0, 1, None, errors, warnings)","source":"references/export.md"},{"id":"export-batch-sha256-audit","category":"export","title":"批量导出逐文件审计与活动文档核对","body":"批量导出用 sw_export.batch_export_formats()，对每个输出记录 API 返回值、文件是否存在与字节数、文件签名是否本轮变化、原文档是否已被用户打开；默认不覆盖已有文件、不关闭用户文档，同名源文件撞目标名时直接阻止。每种格式导出前先激活源文档并回读 ActiveDoc.GetPathName()，因为 SW2024 的 STL 等导出器可能使用活动文档，路径不一致必须停止。","code":"model = open_document(sw, input_path, silent=True)\nif model:\n    model.Extension.SaveAs(output_path, 0, 1, None, errors, warnings)\n    assert sw.ActiveDoc.GetPathName() == output_path\n    sw.CloseDoc(model.GetTitle())","source":"references/export.md"},{"id":"delivery-pack-and-go-audit","category":"delivery","title":"Pack and Go 依赖审计","body":"Pack and Go 用 GetPackAndGo() / SetSaveToName() / SavePackAndGo()；pywin32 零参数路径会报“非选择性的参数”，封装回退 comtypes 早绑定。当前文档必须已存盘、目标目录非空默认拒绝（需 overwrite=True），GetDocumentNames() 的保存前枚举不作为成功条件，应在保存后按本轮落盘文件与 GetDependencies2 审计；状态码非零、本轮无真实文件或暂存源缺失时不得标记成功。严格模式漏依赖返回 status=blocked 与 SW_PACK_AND_GO_DEPENDENCY_ENUMERATION_INCOMPLETE，默认暂存模式返回 status=pilot 与 SW_PACK_AND_GO_NATIVE_ENUMERATION_INCOMPLETE。","code":"pkg = model.Extension.GetPackAndGo()      # pywin32 零参数可能报错\npkg.SetSaveToName(dest_dir, zip_name)\nmodel.Extension.SavePackAndGo()\n# 审计：GetDependencies2 + produced_this_run + 每文件大小与 SHA-256\n# 返回 missing_dependencies 非空即不能宣称完整交付","source":"references/export.md"},{"id":"appearance-safearray-material","category":"appearance","title":"材质数组用 SAFEARRAY","body":"九位材质数组必须以 SAFEARRAY(double) 传给 COM，直接把 Python list 赋给 MaterialPropertyValues 可能被错误编组，RGB 落入第 2/5/8 位，模型几乎只显示绿色。统一用 sw_appearance.material_variant()（VT_ARRAY | VT_R8）与 set_document_appearance()/set_feature_appearance()/set_component_appearance()。","code":"from sw_appearance import material_variant, set_document_appearance\nset_document_appearance(model, \"iron_red\")        # 文档级基础色\nset_feature_appearance(feature, \"armor_gold\")     # 特征级覆盖\n# 配置选项：swThisConfiguration=1, swAllConfiguration=2, swSpecifyConfiguration=3","source":"references/appearance.md"},{"id":"appearance-rgb-readback","category":"appearance","title":"外观成败以 RGB 回读为准","body":"返回 void 的 setter 只要没抛 COM 异常即表示调用完成，不能写成 bool(method(...)) 判断成败；正确做法是每次写入后回读前三位 RGB，不匹配立即停止。apply_component_palette() 批量上色并生成逐组件审计，verify_appearance() 比对预期与回读值。","code":"assert verify_appearance(model, \"iron_red\")[\"ok\"]\nreports = apply_component_palette([\n    (body_component, \"aqua_blue\"),\n    (glass_component, \"glass_tint\"),\n    (rear_light_component, \"signal_red\"),\n    (rim_component, \"silver\"),\n])\nassert all(item[\"ok\"] for item in reports)","source":"references/appearance.md"},{"id":"appearance-clear-selection2","category":"appearance","title":"截图前 ClearSelection2","body":"保存与截图前调用 ClearSelection2(True)，否则绿色选择高亮会覆盖真实外观、干扰视觉判断；预览前再次清除选择并重绘。sw_review.save_preview() 已内置该清理，但仍需检查一张彩色等轴测图和一张能看到灯组或轮毂的正投影视图。","code":"assembly.ClearSelection2(True)\n# 保存前清理一次；预览截图前再清理并重绘\n# sw_review.save_preview() 已内置该清理","source":"references/appearance.md"},{"id":"mesh-loadfile4-dispatch","category":"mesh","title":"网格导入 LoadFile4 路线","body":"OBJ/STL 不要用 OpenDoc6() 当普通零件打开（部分 SW2024 环境返回 errors=2097152）；LoadFile4 第三个参数不能传 None，否则触发“类型不匹配”，稳定写法是 LoadFile4(path, \"r\", create_empty_dispatch_variant(), errors)。STEP/IGES 仍走 open_document() 的 GetImportFileData() + LoadFile4 路线，高面数外观模型默认导入为 graphics。","code":"errors = VARIANT(pythoncom.VT_BYREF | pythoncom.VT_I4, 0)\nmodel = sw.LoadFile4(obj_path, \"r\", create_empty_dispatch_variant(), errors)\n# 命令行：python scripts\\sw_import_mesh_reference.py src.obj out.SLDPRT --units m --model-type graphics","source":"references/mesh-reference-import.md"},{"id":"review-four-view-visual","category":"review","title":"四视图导出与目视复核","body":"交付前 ForceRebuild3(False) + ViewZoomtofit2()，再用 run_review() 导出 isometric/front/top/right 四视图与 *_review_report.json，读 evaluation.status/score/issues 以及 checks.previews_created、previews_not_blank、expected_outputs_exist、feature_summary_available。自动评分 pass 只说明不是空白、文件存在，网格参考模型必须肉眼核对比例与车顶线、灯组、轮毂等关键特征；CLI 返回码 0=pass/warn、1=--fail-on-warn 下 warn、2=fail。","code":"model.ForceRebuild3(False)\nmodel.ViewZoomtofit2()\nreport, report_path = run_review(\n    model, r\"C:\\temp\\solidworks_review\", basename=\"model\",\n    views=(\"isometric\", \"front\", \"top\", \"right\"),\n    expected_outputs=[r\"C:\\temp\\model.sldprt\", r\"C:\\temp\\model.step\"],\n)\nprint(report[\"evaluation\"], report[\"checks\"])","source":"references/review.md"},{"id":"review-interference-detection","category":"review","title":"干涉检查与运动边界限位","body":"Gear Mate 不防止齿轮实体穿透，只建立旋转比例关系；需要几何安全时用 InterferenceDetectionManager 或 GUI 干涉检查。GetInterferences() 执行计算，必须在读取数量、干涉体积和组件之后才调用 Done() 释放管理器；status=blocked 或 count=None 是证据未知，不能解释为零干涉。行程用 Limit Angle / Limit Distance 限制，关键位置可用 Mate Controller 保存。","code":"import sys; sys.path.insert(0, r\"SKILL_DIR/scripts\")\nfrom sw_measure import inspect_interference\nresult = inspect_interference(asm)\nprint(result[\"status\"], result[\"interference_count\"], result[\"items\"])\n# status=blocked 或 count=None：证据未知，不能解释为零干涉","source":"references/assembly.md"}],"gates":[{"id":"part-delivery","name":"零件交付门禁","capability":"part_and_features","items":["SLDPRT 落盘并重开成功，ForceRebuild3(False) 无重建错误。","特征树包含预期 Extrude/Revolve/Cut 特征，无缺失或被压缩的关键特征。","collect_bounding_box 回读外形尺寸与任务给定值一致（容差 ≤0.05 mm）。","草图约束状态与命名尺寸可改，改后关键尺寸回读一致。","review_report.json 的 evaluation.status 为 pass 或已解释的 warn。"],"evidence":["sldprt","step","preview","review_report","geometry_measurements"],"blocked_when":["特征创建返回 None 或重建失败。","外形/关键尺寸超容差且无书面说明。","review 报告 evaluation.status=fail。","只有文字总结，没有机器可读 cad_spec JSON 证据。"],"workflows":["mounting_bracket","enclosure","modify_existing_part","parallel_gripper_assembly"]},{"id":"holes-delivery","name":"孔槽螺纹交付门禁","capability":"holes_and_finishing","items":["每个孔槽给出孔型、规格、数量、基准边定位、中心距、深度或贯穿状态。","collect_geometry_measurements 的 hole_groups/compound_holes/slot_arc_candidates 与设计一致。","validate_hole_positions 返回 pass（位置 ≤0.1 mm、孔径 ≤0.05 mm）。","盲孔、沉孔深度与沉头角度用特征参数回读或剖视图交叉复核。","螺纹孔具备真实 Thread/CosmeticThread 特征，孔口倒角存在。"],"evidence":["sldprt","geometry_evidence","section_view_preview","parameters_json","review_report"],"blocked_when":["只有创建参数证据，没有 B-Rep 回读。","槽端圆弧被计入圆孔数量。","盲孔/沉头深度无法回读且无剖视证据。","螺纹表达为 metadata-only 或孔口无倒角。"],"workflows":["mounting_bracket","enclosure","holes_slots_threads"]},{"id":"assembly-delivery","name":"装配交付门禁","capability":"assembly_and_mates","items":["MateGroup 下存在真实 Mate 特征（MateConcentric/MateGearDim/MateDistance 等）。","inspect_component_dofs 的自由度与任务要求一致。","旋转件同心 Mate 的 lock_rotation=false，未被三基准面或 Fix 锁死。","inspect_interference 返回 status=pass。","SLDASM 关闭重开后仍可在 SolidWorks 中拖动。"],"evidence":["sldasm","mate_evidence","dof_report","preview","review_report"],"blocked_when":["只有预览动画或脚本驱动的位姿变化，没有真实 Mate。","组件固定或过约束导致无法拖动。","干涉结果为未知（status=blocked 或 count=None）。"],"workflows":["assembly_mates","parallel_gripper_assembly"]},{"id":"motion-delivery","name":"运动算例门禁","capability":"motion_study","items":["validate_motion_studies 返回 validation.status=pass。","results_out_of_date 明确为 False，GetResults() 非空。","算例时长、马达数量达到任务要求，算例类型与任务一致。","swmotionstudy.tlb 已加载并记录。"],"evidence":["sldasm","motion_summary","review_report"],"blocked_when":["只看到时间轴、马达图标或 Calculate=True。","结果过期或无法读取。","Motion 加载项或许可证缺失却声称完成分析。"],"workflows":[]},{"id":"drawing-delivery","name":"工程图交付门禁","capability":"drawings_and_bom","items":["DrawingSpec v1 通过 schema 校验，standard=GB_T 配 projection=first_angle。","回读真实视图数与真实 DisplayDimension 数，模板候选不计入。","图框、标题栏、尺寸链、孔表与 BOM 完成人工目视复核。","PDF 落盘，inspect_pdf_dimension_rendering 的尺寸文字框关联完整。","无压孔、压中心线、跨视图长引线或侵入标题栏。"],"evidence":["slddrw","pdf","bmp_preview","dimension_evidence","review_report"],"blocked_when":["只有估算文字边界却宣称无碰撞。","孔、槽、接口缺规格、数量或定位尺寸。","视图重叠、标题栏侵入未返工。","钣金工程图缺少可靠展开证据。"],"workflows":["engineering_drawing","properties_bom"]},{"id":"export-delivery","name":"导出交付门禁","capability":"export_delivery","items":["每个输出记录 success、字节数、produced_this_run 与 SHA-256。","导出前激活源文档并回读 ActiveDoc.GetPathName() 与目标一致。","同名冲突被阻止，未静默覆盖既有文件。","STEP/STL/PDF 可用目标 CAD 原生打开复核。","交付清单与哈希台账齐备，Pack and Go 依赖审计通过。"],"evidence":["step","stl","pdf","delivery_manifest","hash_ledger"],"blocked_when":["文件存在但大小为 0，或本轮未真实产生。","装配体组件被误导出为目标零件。","用改扩展名或空文件伪造格式支持。","Pack and Go 落盘缺依赖却标记成功。"],"workflows":["mounting_bracket","enclosure","batch_export","parallel_gripper_assembly","autocad_cleanup_delivery"]},{"id":"dfm-review","name":"DFM / 设计规则门禁","capability":"dfm_checks","items":["check-dfm status 不为 blocked，材料、壁厚、K 因子、割缝、成型空间等关键输入齐全。","供应商 profile 与 --brep-evidence 已绑定，缺证据不放行。","check-drc 报告保留 reviewRequired=true，fail 项逐条给出规则与阈值。","规则通过后仍完成材料、公差、载荷、供应商能力的人工确认。"],"evidence":["dfm_report","drc_report","brep_evidence","review_report"],"blocked_when":["缺少材料、壁厚、K 因子等关键输入。","B-Rep 证据缺失或伪造。","把 DFM/DRC 结论当作制造认证或安全认证。"],"workflows":[]},{"id":"capability-gate","name":"能力等级门禁","capability":"capabilities.yaml","items":["执行前运行 sw_capability_probe.py --output capability_report.json，区分 type_library_present、implementation_status、ready_for_unattended_use。","所用能力在 capabilities.yaml 中级别为 verified/pilot/reference_only/not_implemented 之一并记录。","reference_only 与 not_implemented 不得用于无人值守交付。","pilot 能力必须带人工复核记录与 review_required 标记。"],"evidence":["capability_report","review_report"],"blocked_when":["缺少能力探测报告。","把 reference_only 或 not_implemented 能力声明为已完成。","把类型库存在当作许可证可用或自动化已验证。"],"workflows":[]}],"workflows":[{"id":"mounting_bracket","name":"安装板与支架","capabilities":["part_and_features","holes_and_finishing","export_delivery"],"inputs":["外形尺寸","板厚","孔规格","孔定位","材料"],"artifacts":["sldprt","step","preview","review_report"]},{"id":"enclosure","name":"设备外壳","capabilities":["part_and_features","holes_and_finishing","export_delivery"],"inputs":["包络尺寸","壁厚","接口开孔","装配间隙","制造工艺"],"artifacts":["sldprt","step","stl","preview","review_report"]},{"id":"holes_slots_threads","name":"孔槽螺纹","capabilities":["holes_and_finishing"],"inputs":["孔槽规格","数量","基准","中心距","深度"],"artifacts":["sldprt","geometry_evidence","review_report"]},{"id":"modify_existing_part","name":"修改已有零件","capabilities":["part_and_features","geometry_and_delivery_review"],"inputs":["源文件","修改范围","保留特征","输出版本"],"artifacts":["sldprt","before_after_preview","review_report"]},{"id":"assembly_mates","name":"装配与配合","capabilities":["assembly_and_mates","geometry_and_delivery_review"],"inputs":["零件清单","装配基准","配合关系","允许自由度"],"artifacts":["sldasm","mate_evidence","preview","review_report"]},{"id":"parallel_gripper_assembly","name":"双指平行夹爪结构装配","capabilities":["part_and_features","assembly_and_mates","geometry_and_delivery_review","export_delivery"],"inputs":["组件规格","配合关系","目标自由度","空间位置","BOM"],"artifacts":["sldprt","sldasm","step","bom","mate_evidence","preview","review_report"]},{"id":"batch_export","name":"批量导出","capabilities":["export_delivery"],"inputs":["输入清单","输出格式","版本命名","覆盖策略"],"artifacts":["delivery_manifest","hash_ledger","review_report"]},{"id":"configuration_family","name":"配置族","capabilities":["configurations_and_design_tables"],"inputs":["参数表","配置命名","尺寸约束","输出规则"],"artifacts":["configuration_matrix","rebuild_evidence","review_report"]},{"id":"properties_bom","name":"属性与 BOM","capabilities":["drawings_and_bom"],"inputs":["属性模板","零件编号","材料","数量规则"],"artifacts":["bom","property_report","review_report"]},{"id":"engineering_drawing","name":"工程图","capabilities":["drawings_and_bom"],"inputs":["图幅","比例","视图","尺寸链","公差","技术要求"],"artifacts":["slddrw","pdf","preview","review_report"]},{"id":"autocad_cleanup_delivery","name":"AutoCAD 图纸整理与交付","capabilities":["autocad_basic_drafting","autocad_headless_preview","export_delivery"],"inputs":["源图","图层规则","文字字体","标注样式","输出格式"],"artifacts":["dwg","dxf","pdf","preview","review_report"]}],"routing":[{"match":["零件","建模","拉伸","旋转","草图","方块","圆柱","支架"],"entry":"scripts/sw_part.py","ref":"references/part-modeling.md"},{"match":["孔","沉孔","沉头","螺纹","攻丝","底孔","槽"],"entry":"scripts/sw_hole_features.py","ref":"references/complex-hole-features.md"},{"match":["圆角","倒角","CNC","机加工","安装座"],"entry":"subskills/solidworks-fillet-chamfer-cnc/scripts/create_cnc_mount_template.py","ref":"subskills/solidworks-fillet-chamfer-cnc/SKILL.md"},{"match":["齿轮","齿数","模数"],"entry":"scripts/sw_gear.py","ref":"references/gears.md"},{"match":["弹簧","螺旋"],"entry":"scripts/sw_spring.py","ref":"references/spring.md"},{"match":["链轮","链条"],"entry":"scripts/sw_sprocket.py","ref":"references/sprocket.md"},{"match":["装配","配合","同心","自由度","夹爪"],"entry":"scripts/sw_assembly.py","ref":"references/assembly.md"},{"match":["运动","马达","Motion","动画"],"entry":"scripts/sw_motion.py","ref":"references/motion-study.md"},{"match":["工程图","出图","标注","BOM","标题栏","孔表"],"entry":"scripts/sw_drawing.py","ref":"references/drawing.md"},{"match":["导出","STEP","STL","PDF","DXF","Pack and Go","批量"],"entry":"scripts/sw_export.py","ref":"references/export.md"},{"match":["外观","颜色","材质","渲染"],"entry":"scripts/sw_appearance.py","ref":"references/appearance.md"},{"match":["网格","OBJ","GLB","STL 导入","复刻"],"entry":"scripts/sw_import_mesh_reference.py","ref":"references/mesh-reference-import.md"},{"match":["DFM","可制造","公差","工艺复核"],"entry":"scripts/dfm_review.py","ref":"references/design-rule-check.md"},{"match":["FEA","仿真","应力","CalculiX"],"entry":"scripts/fea_analysis.py","ref":"references/complex-mechanical-routing.md"},{"match":["审查","复核","预览","验收"],"entry":"scripts/sw_review.py","ref":"references/review.md"},{"match":["报错","失败","排障","ERROR","HRESULT"],"entry":"scripts/sw_preflight.py","ref":"references/troubleshooting.md"},{"match":["AutoCAD","DWG","DXF 绘图","二维"],"entry":"subskills/autocad-automation/scripts/acad_draw.py","ref":"subskills/autocad-automation/SKILL.md"},{"match":["自然语言","参数化计划","需求不清","VibeCAD"],"entry":"subskills/solidworks-vibecad/scripts/plan_from_brief.py","ref":"subskills/solidworks-vibecad/SKILL.md"}],"designPhases":[{"id":"brief","name":"1. 需求澄清","question":"这件东西到底要满足什么？","hints":["分清「视觉演示」「结构验证」「可制造交付」三种交付级别，级别决定验收标准。","记录外形尺寸、板厚/壁厚、材料、关键配合面、安装接口、工况载荷。","缺少的输入先列成假设表，标 review_required，不要悄悄拍数。"],"prompt":"先复述需求并输出输入清单：已知参数、缺失参数、假设值（标注 review_required）、交付级别。"},{"id":"units","name":"2. 单位与坐标系","question":"数值从哪来、往哪去？","hints":["SolidWorks API 全部使用米：mm(50) = 0.05 m，deg(90) 转角度，禁止把毫米直接塞进 API。","基准面名称中英版不同（Front Plane / 前视基准面），用封装函数而不是硬编码字符串。","原点、主基准、装配基准先定，再谈特征，避免后期整体平移返工。"],"prompt":"明确单位换算方式、基准面/原点选择、模型坐标系与装配基准，列出会在代码里出现的坐标数值。"},{"id":"sketch","name":"3. 参数化草图","question":"尺寸是设计的还是凑的？","hints":["草图必须完全定义：用尺寸和几何关系驱动，不用 Fix 批量锁死。","基础圆/矩形可用 fully_define_sketch()，复杂轮廓显式写尺寸链。","草图名称要可追溯，后续特征引用它，不要靠屏幕坐标选边。"],"prompt":"画出草图层的设计尺寸与几何关系，说明哪些是驱动尺寸、哪些是派生尺寸，并给出完全定义策略。"},{"id":"features","name":"4. 特征顺序","question":"先长什么、后切什么？","hints":["稳定顺序：基体拉伸/旋转 → 主轮廓切除 → 孔槽 → 圆角倒角 → 抽壳/阵列 → 细节。","圆角放在孔槽之后，避免圆角面被后续切除破坏导致重建失败。","能做参数化的地方就做参数化：孔位用阵列而不是逐个画。"],"prompt":"输出特征树顺序（含特征类型、草图、关键参数），标注哪些特征可被后续修改驱动。"},{"id":"assembly","name":"5. 装配与自由度","question":"它是怎么动的？","hints":["组件先定位再配合；AddComponent4 返回 None 时走 AddComponent5 / 重新激活装配体回退。","旋转件用同心 Mate 且 lock_rotation=False，不要三基准面全锁死。","齿轮传动用真实 Gear Mate，不要用脚本假动画冒充机械配合。"],"prompt":"给出组件清单、每个组件的配合关系与剩余自由度，说明如何验证可拖动。"},{"id":"motion","name":"6. 运动与验证","question":"怎么证明它真的会动？","hints":["Motion Study 需要加载 swmotionstudy.tlb，创建后校验类型、时长、马达数量、结果存在性。","results_out_of_date=False 才算算例有效，只看时间轴或动画不算通过。","需要演示动画时说明动画≠交互自由度，最终以 SolidWorks 里能拖动为准。"],"prompt":"说明运动验证方式：马达类型与参数、算例校验项、期望的可动范围与判据。"},{"id":"drawing","name":"7. 出图与标注","question":"图纸能不能直接拿去加工？","hints":["示意图 ≠ 工程图：孔、槽、接口必须给规格、数量和定位尺寸。","国内习惯：规范图幅/图框/标题栏、仿宋中文、分层线型、中心线虚线、真实标注实体。","密集孔槽用孔表/槽表，但表格不能替代定位尺寸；长引线只做局部说明。"],"prompt":"列出视图选择、尺寸链、孔表/技术要求、图幅比例与标题栏字段。"},{"id":"delivery","name":"8. 交付与证据","question":"留下的证据够别人复现吗？","hints":["交付物：原生文件 + STEP/PDF/DXF + 四视图预览 + *_review_report.json。","每个产物给绝对路径与 SHA-256，导出失败要写返回值与错误码，不要只说失败。","预览图必须目视复核：主体存在、比例合理、无缺失部件、无重叠悬空。"],"prompt":"定义交付清单与证据格式（路径、哈希、预览视图、审查报告字段）。"},{"id":"risk","name":"9. 风险与人工复核","question":"哪些结论现在还不能说？","hints":["能力等级以 capabilities.yaml 为准：reference_only / not_implemented 不得当交付。","未封装接口先 sw_api_lookup.py 查证签名与版本差异，禁止凭记忆猜 COM 参数。","涉及材料、公差、热处理、疲劳、量产工艺的结论一律标人工复核。"],"prompt":"列出本任务的风险清单：未验证能力、依赖缺失、假设参数、需要工程师复核的结论。"}],"capabilityLevels":[{"id":"verified","label":"已验证","rule":"可作为无人值守交付，但仍需交付证据回读。"},{"id":"pilot","label":"试运行","rule":"可执行，必须在结果里标注 pilot 并附人工复核项。"},{"id":"reference_only","label":"仅参考","rule":"不得作为交付依据，只能用于设计参考或参数估算。"},{"id":"not_implemented","label":"未实现","rule":"不得宣称支持，必须改为人工执行或降级方案。"}],"agentModes":[{"id":"swas-cad","name":"SolidWorks · 建模执行","description":"可写建模模式：先方案后动手，米制与完全定义草图，孔槽圆角按稳定顺序，四视图与哈希证据齐全才算完成。","tools":["shell","fs","fs-search","jobs","todo","ask-user","web"],"persona":"prompts/cad.md"},{"id":"swas-review","name":"SolidWorks · 交付复核","description":"只读复核模式：查产物清单、SHA-256、审查报告、四视图与门禁，逐条给通过/不通过/缺证据与修复动作。","tools":["shell","fs","fs-search","jobs","ask-user"],"persona":"prompts/review.md"}]};

    const NS = 'solidworks-copilot';

    const zh = {
      'header.title': 'SolidWorks 副驾',
      'header.hint': '提示词 · 模板 · 思路 · 技巧 · 门禁',
      'header.expand': '展开',
      'header.collapse': '收起',
      'tab.templates': '模板',
      'tab.prompt': '提示词',
      'tab.plan': '思路',
      'tab.tips': '技巧',
      'tab.gate': '门禁',
      'common.search': '搜索',
      'common.all': '全部',
      'common.generate': '生成',
      'common.oneClick': '一键生成并复制',
      'common.insert': '填入输入框',
      'common.copy': '复制',
      'common.copied': '已复制',
      'common.preview': '预览',
      'common.empty': '没有匹配项',
      'common.emptyPrompt': '先在上方生成一份提示词',
      'common.params': '参数',
      'common.steps': '步骤',
      'common.checks': '验收',
      'common.risks': '风险',
      'common.entry': '脚本',
      'common.detail': '详细度',
      'common.full': '完整',
      'common.brief': '精简',
      'common.back': '返回列表',
      'common.count': '条',
      'templates.hint': '点一个模板看参数与验收，直接生成提示词。',
      'templates.use': '用这个模板生成提示词',
      'prompt.task': '需求描述',
      'prompt.taskPlaceholder': '例：做一块 120×80×10 的 6061-T6 安装板，四角 M6 沉孔，出 STEP 和四视图预览',
      'prompt.template': '模板',
      'prompt.auto': '自动匹配',
      'prompt.needTask': '先写一句需求描述',
      'plan.task': '需求',
      'plan.constraints': '额外约束',
      'plan.constraintsPlaceholder': '例：CNC 加工、必须出 GB 工程图、允许 ±0.05 公差',
      'plan.generate': '生成设计思路提示词',
      'plan.hint': '九段式：先想清楚再画，比返工快。',
      'tips.queryPlaceholder': '搜「圆角 顺序」「VARIANT」「结果不过期」',
      'tips.askAi': '让 AI 按这条检查我的模型',
      'gate.workflow': '工作流',
      'gate.generate': '生成验收提示词',
      'gate.hint': '汇报完成之前先过一遍，缺证据就是没完成。',
      'flash.inserted': '已写入输入框，回车发送',
      'flash.noInput': '当前会话没有可用的输入框',
      'flash.copied': '已复制到剪贴板',
      'flash.copyFailed': '复制失败，请手动选择文本',
      'flash.needTask': '先写一句需求描述',
      'tab.modes': 'Agent 模式',
      'modes.hint': '两个预置模式：建模执行（可写）与交付复核（只读）。在会话的 Agent 模式选择器里切换。',
      'modes.copy': '复制启动提示词',
      'modes.persona': '角色文档',
      'modes.switchHint': '切换方式：新会话在输入框上方的 Agent 模式选择器里选；已开会话用会话菜单里的模式切换。',
      'unit.templates': '个模板',
      'unit.tips': '条技巧',
      'unit.gates': '组门禁',
      'unit.modes': '个模式',
      'unit.tools': '个工具',
    };

    const en = {
      'header.title': 'SolidWorks Copilot',
      'header.hint': 'Prompts · Templates · Plan · Tips · Gates',
      'header.expand': 'Expand',
      'header.collapse': 'Collapse',
      'tab.templates': 'Templates',
      'tab.prompt': 'Prompt',
      'tab.plan': 'Plan',
      'tab.tips': 'Tips',
      'tab.gate': 'Gates',
      'common.search': 'Search',
      'common.all': 'All',
      'common.generate': 'Generate',
      'common.oneClick': 'Generate & copy',
      'common.insert': 'Fill composer',
      'common.copy': 'Copy',
      'common.copied': 'Copied',
      'common.preview': 'Preview',
      'common.empty': 'No match',
      'common.emptyPrompt': 'Generate a prompt above first',
      'common.params': 'Parameters',
      'common.steps': 'Steps',
      'common.checks': 'Acceptance',
      'common.risks': 'Risks',
      'common.entry': 'Script',
      'common.detail': 'Detail',
      'common.full': 'Full',
      'common.brief': 'Brief',
      'common.back': 'Back',
      'common.count': 'items',
      'templates.hint': 'Pick a template to see parameters and acceptance, then generate a prompt.',
      'templates.use': 'Generate prompt from this template',
      'prompt.task': 'Requirement',
      'prompt.taskPlaceholder': 'e.g. a 120×80×10 6061-T6 mounting plate with four M6 counterbores, STEP + 4-view preview',
      'prompt.template': 'Template',
      'prompt.auto': 'Auto match',
      'prompt.needTask': 'Describe the requirement first',
      'plan.task': 'Requirement',
      'plan.constraints': 'Extra constraints',
      'plan.constraintsPlaceholder': 'e.g. CNC machining, GB drawing required, ±0.05 tolerance',
      'plan.generate': 'Generate design-plan prompt',
      'plan.hint': 'Nine phases: think before modelling.',
      'tips.queryPlaceholder': 'Search "fillet order", "VARIANT", "results out of date"',
      'tips.askAi': 'Ask the agent to check my model with this',
      'gate.workflow': 'Workflow',
      'gate.generate': 'Generate acceptance prompt',
      'gate.hint': 'Pass the gate before claiming done.',
      'flash.inserted': 'Written to the composer; press Enter to send',
      'flash.noInput': 'No composer input available in this session',
      'flash.copied': 'Copied to clipboard',
      'flash.copyFailed': 'Copy failed; select the text manually',
      'flash.needTask': 'Describe the requirement first',
      'tab.modes': 'Agent modes',
      'modes.hint': 'Two presets: modelling (writable) and delivery review (read-only). Switch them in the session agent-mode picker.',
      'modes.copy': 'Copy kickoff prompt',
      'modes.persona': 'Persona',
      'modes.switchHint': 'Switch in the agent-mode picker above the composer for a new session, or via the session menu for an existing one.',
      'unit.templates': 'templates',
      'unit.tips': 'tips',
      'unit.gates': 'gates',
      'unit.modes': 'modes',
      'unit.tools': 'tools',
    };

    // ── 零基础文案覆盖：同一批 key，换成说人话的说法 ─────────────────
    Object.assign(zh, {
      'header.hint': '说人话就能用',
      'header.expand': '打开助手',
      'header.collapse': '收起',
      'page.tagline': '把「你要做什么」写成 AI 能照着做的说明书：选模板 → 填数字 → 复制到对话框。',
      'guide.title': '新手三步',
      'guide.step1': '① 在「选模板」里挑一个最像的；拿不准就点第一个「安装板」。',
      'guide.step2': '② 把尺寸、孔大小填进去；不知道的留空，AI 会回来问你要。',
      'guide.step3': '③ 点「生成提示词」→ 复制 → 回到对话框粘贴发送，剩下的交给 AI。',
      'tab.templates': '选模板',
      'tab.prompt': '一句话生成',
      'tab.plan': '先想清楚',
      'tab.tips': '避坑指南',
      'tab.gate': '做完检查',
      'tab.modes': '专家模式',
      'common.search': '搜一下，比如：安装板、齿轮、沉孔',
      'common.all': '全部',
      'common.generate': '生成提示词',
      'common.insert': '放进对话框',
      'common.copy': '复制',
      'common.copied': '已复制，去对话框粘贴吧',
      'common.preview': '生成结果（可以直接改）',
      'common.back': '返回上一步',
      'common.empty': '没找到，换个词试试',
      'common.detail': '详细程度',
      'common.full': '完整版',
      'common.brief': '精简版',
      'common.params': '要填的数字',
      'common.steps': 'AI 会怎么做（照做就行）',
      'common.checks': '做完怎么验',
      'common.risks': '要人工确认的',
      'common.entry': '用到的脚本（高级）',
      'templates.hint': '点一个最像的模板；不知道选哪个就选第一个。',
      'prompt.task': '你要做什么？',
      'prompt.taskPlaceholder': '例：做一个 120×80×10 的铝板，四角四个 M6 沉孔，要能直接拿去加工',
      'prompt.template': '用哪个模板',
      'prompt.auto': '让 AI 自己挑',
      'plan.task': '你的需求',
      'plan.constraints': '有没有额外要求（材料、工艺、公差）',
      'plan.constraintsPlaceholder': '例：铝 6061，CNC 加工，要出中文工程图',
      'plan.generate': '生成「先想清楚」的提示词',
      'plan.hint': '先让 AI 把方案说清楚，再让它动手，返工最少。',
      'tips.queryPlaceholder': '搜：单位、圆角、孔、装配、报错',
      'tips.askAi': '让 AI 按这条检查我的模型',
      'gate.workflow': '这次是什么活',
      'gate.generate': '生成检查清单',
      'gate.hint': 'AI 说「做完了」之前，先让它按这张单子逐条报结果。',
      'modes.hint': '给熟手：两个预置工作模式，在会话的 Agent 模式选择器里切换。',
      'modes.copy': '复制开场提示词',
      'modes.switchHint': '切换位置：新会话在输入框上方的 Agent 模式里选；已开会话在会话菜单里换。',
      'flash.inserted': '已放进对话框，按回车发送',
      'flash.noInput': '这个位置没有输入框，请用「复制」回到对话页粘贴',
      'flash.needTask': '先用一句话说说你要做什么',
      'unit.templates': '种模板',
      'unit.tips': '条经验',
      'unit.gates': '张检查表',
      'unit.modes': '个专家模式',
      'unit.tools': '个 AI 工具',
    });
    Object.assign(en, {
      'header.hint': 'Plain words, real parts',
      'header.expand': 'Open helper',
      'page.tagline': 'Turn "what I need" into instructions AI can follow: pick a template, fill the numbers, paste into the chat.',
      'guide.title': 'Three steps',
      'guide.step1': '① Pick the closest template; if unsure, take the first one.',
      'guide.step2': '② Fill in sizes and holes; leave unknown fields blank and the AI will ask.',
      'guide.step3': '③ Generate the prompt, copy it, paste into the chat and send.',
      'tab.templates': 'Templates',
      'tab.prompt': 'Quick prompt',
      'tab.plan': 'Think first',
      'tab.tips': 'Pitfalls',
      'tab.gate': 'Checklist',
      'tab.modes': 'Pro modes',
    });

    // 技能部署页文案（中英各一份，key 与 DeployTab 对应）
    Object.assign(zh, {
      'tab.deploy': '技能部署',
      'deploy.hint': '把上游技能装到本机的 Agent 客户端。先点「预演」看计划，确认无误再点「确认部署」；目录已存在会被跳过，不会覆盖。',
      'deploy.target': '装到',
      'deploy.refresh': '刷新状态',
      'deploy.preview': '预演（不落盘）',
      'deploy.run': '确认部署',
      'deploy.running': '执行中…',
      'deploy.done': '部署完成，状态已刷新',
      'deploy.previewDone': '预演完成：没有改动任何文件',
      'deploy.error': '面板连不上本地部署路由',
      'deploy.failed': '部署失败，展开下面的日志看原因',
      'deploy.phase.start': '准备中',
      'deploy.phase.resolve': '解析目标',
      'deploy.phase.probe': '检查现有目录',
      'deploy.phase.fetch': '从上游拉取',
      'deploy.phase.checkout': '检出提交',
      'deploy.phase.verify': '校验文件',
      'deploy.phase.write': '写入目标目录',
      'deploy.phase.done': '完成',
      'deploy.phase.failed': '失败',
    });
    Object.assign(en, {
      'tab.deploy': 'Deploy',
      'deploy.hint': 'Install the upstream skill into a local agent client. Preview first, then confirm; existing directories are skipped, never overwritten.',
      'deploy.target': 'Target',
      'deploy.refresh': 'Refresh',
      'deploy.preview': 'Preview (no writes)',
      'deploy.run': 'Deploy',
      'deploy.running': 'Working…',
      'deploy.done': 'Deployed; status refreshed',
      'deploy.previewDone': 'Preview finished; nothing was written',
      'deploy.error': 'The panel cannot reach the local deploy route',
      'deploy.failed': 'Deployment failed — see the log below',
      'deploy.phase.start': 'Starting',
      'deploy.phase.resolve': 'Resolving target',
      'deploy.phase.probe': 'Checking existing install',
      'deploy.phase.fetch': 'Fetching upstream',
      'deploy.phase.checkout': 'Checking out commit',
      'deploy.phase.verify': 'Verifying files',
      'deploy.phase.write': 'Writing target directory',
      'deploy.phase.done': 'Done',
      'deploy.phase.failed': 'Failed',
    });

    /** 分类与难度的中文说法（数据本身是中文，界面不暴露英文枚举）。 */
    const CAT_LABEL = {
      part: '零件',
      hole: '孔和槽',
      gear: '齿轮',
      sheetmetal: '钣金',
      assembly: '装配',
      motion: '动画',
      drawing: '出图',
      export: '导出',
      evaluation: '检查',
    };
    const DIFF_LABEL = { basic: '简单', standard: '中等', advanced: '高级' };
    const TIP_CAT_LABEL = {
      units: '单位', api: '接口', selection: '选择', sketch: '草图', feature: '特征', hole: '孔',
      error: '报错', review: '复核', assembly: '装配', mate: '配合', motion: '动画',
      drawing: '出图', export: '导出', delivery: '交付', appearance: '外观', mesh: '网格',
    };
    const tipCatLabel = (id) => TIP_CAT_LABEL[id] || id;
    const catLabel = (id) => CAT_LABEL[id] || id;
    const diffLabel = (id) => DIFF_LABEL[id] || id;

    /**
     * 取翻译函数：优先用 shell 注入的 t，但它只认识自己的命名空间，
     * 认不出来时会原样返回 key；这时回退到本插件的 zh 字典，绝不把 key 露给用户。
     */
    function makeT(props) {
      const provided = typeof props.t === 'function' ? props.t : null;
      return (key) => {
        if (provided) {
          try {
            const value = provided(key);
            if (typeof value === 'string' && value !== '' && value !== key) return value;
          } catch {
            /* 回退到内置字典 */
          }
        }
        const value = zh[key];
        return typeof value === 'string' ? value : key;
      };
    }

    /** 主题令牌样式：容器与控件一律走 --dsw-alias-*，只有代码块用中性色。 */
    const styles = {
      root: {
        margin: '6px auto 0',
        width: '100%',
        maxWidth: 900,
        fontFamily: 'inherit',
        fontSize: 12,
        color: 'var(--dsw-alias-label-primary)',
      },
      bar: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 10px',
        borderRadius: 10,
        border: '1px solid var(--dsw-alias-border-l1)',
        background: 'var(--dsw-alias-bg-layer-1)',
      },
      panel: {
        borderRadius: 12,
        border: '1px solid var(--dsw-alias-border-l1)',
        background: 'var(--dsw-alias-bg-layer-1)',
        overflow: 'hidden',
      },
      panelHead: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 10px',
        borderBottom: '1px solid var(--dsw-alias-border-l1)',
        flexWrap: 'wrap',
      },
      brand: { display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, whiteSpace: 'nowrap' },
      dot: {
        width: 8,
        height: 8,
        borderRadius: 2,
        background: 'var(--dsw-alias-brand-primary)',
        transform: 'rotate(45deg)',
      },
      tabRow: { display: 'flex', gap: 4, flexWrap: 'wrap', marginLeft: 'auto' },
      tab: {
        border: '1px solid transparent',
        background: 'transparent',
        color: 'var(--dsw-alias-label-secondary)',
        borderRadius: 999,
        padding: '3px 9px',
        fontSize: 12,
        cursor: 'pointer',
      },
      tabActive: {
        border: '1px solid var(--dsw-alias-label-primary)',
        background: 'var(--dsw-alias-bg-layer-2)',
        color: 'var(--dsw-alias-label-primary)',
        fontWeight: 600,
      },
      iconBtn: {
        border: '1px solid var(--dsw-alias-border-l1)',
        background: 'transparent',
        color: 'var(--dsw-alias-label-secondary)',
        borderRadius: 8,
        padding: '2px 8px',
        fontSize: 12,
        cursor: 'pointer',
      },
      body: { padding: 10, maxHeight: 380, overflow: 'auto' },
      row: { display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' },
      chip: {
        border: '1px solid var(--dsw-alias-border-l1)',
        background: 'transparent',
        color: 'var(--dsw-alias-label-secondary)',
        borderRadius: 999,
        padding: '2px 9px',
        fontSize: 11,
        cursor: 'pointer',
      },
      chipActive: {
        border: '1px solid var(--dsw-alias-label-primary)',
        background: 'var(--dsw-alias-bg-layer-2)',
        color: 'var(--dsw-alias-label-primary)',
        fontWeight: 600,
      },
      input: {
        width: '100%',
        boxSizing: 'border-box',
        border: '1px solid var(--dsw-alias-border-l1)',
        borderRadius: 8,
        background: 'var(--dsw-alias-bg-base)',
        color: 'var(--dsw-alias-label-primary)',
        padding: '6px 8px',
        fontSize: 12,
        fontFamily: 'inherit',
        outline: 'none',
      },
      textarea: {
        width: '100%',
        boxSizing: 'border-box',
        minHeight: 54,
        resize: 'vertical',
        border: '1px solid var(--dsw-alias-border-l1)',
        borderRadius: 8,
        background: 'var(--dsw-alias-bg-base)',
        color: 'var(--dsw-alias-label-primary)',
        padding: '6px 8px',
        fontSize: 12,
        lineHeight: 1.5,
        fontFamily: 'inherit',
        outline: 'none',
      },
      list: { display: 'flex', flexDirection: 'column', gap: 6 },
      card: {
        border: '1px solid var(--dsw-alias-border-l1)',
        borderRadius: 10,
        padding: '7px 9px',
        background: 'var(--dsw-alias-bg-layer-2)',
        cursor: 'pointer',
        textAlign: 'left',
        color: 'inherit',
        font: 'inherit',
        width: '100%',
      },
      cardTitle: { fontWeight: 600, fontSize: 12, marginBottom: 2 },
      meta: { color: 'var(--dsw-alias-label-secondary)', fontSize: 11, lineHeight: 1.5 },
      pre: {
        margin: '6px 0 0',
        padding: 8,
        borderRadius: 8,
        background: 'var(--dsw-alias-bg-base)',
        border: '1px solid var(--dsw-alias-border-l1)',
        color: 'var(--dsw-alias-label-primary)',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
        fontSize: 11,
        lineHeight: 1.5,
        maxHeight: 210,
        overflow: 'auto',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      },
      primaryBtn: {
        // 不依赖「填充色令牌」：用文字色做 16% 淡化填充，任何主题下文字都与正文同色，必然可读
        border: '1px solid var(--dsw-alias-label-primary)',
        background: 'color-mix(in srgb, var(--dsw-alias-label-primary) 18%, transparent)',
        color: 'var(--dsw-alias-label-primary)',
        borderRadius: 8,
        padding: '5px 12px',
        fontSize: 12,
        fontWeight: 700,
        cursor: 'pointer',
      },
      ghostBtn: {
        border: '1px solid var(--dsw-alias-border-l2)',
        background: 'var(--dsw-alias-bg-layer-2)',
        color: 'var(--dsw-alias-label-primary)',
        borderRadius: 8,
        padding: '5px 12px',
        fontSize: 12,
        cursor: 'pointer',
      },
      label: { color: 'var(--dsw-alias-label-secondary)', fontSize: 11, marginBottom: 3, display: 'block' },
      field: { marginBottom: 8 },
      empty: { color: 'var(--dsw-alias-label-secondary)', fontSize: 12, padding: '8px 2px' },
      flash: { color: 'var(--dsw-alias-state-success-primary)', fontSize: 11, marginLeft: 4 },
      progressWrap: { margin: '10px 0 6px' },
      progressTrack: {
        height: 8,
        borderRadius: 999,
        background: 'var(--dsw-alias-bg-layer-2)',
        border: '1px solid var(--dsw-alias-border-l1)',
        overflow: 'hidden',
      },
      progressFill: {
        height: '100%',
        borderRadius: 999,
        background: 'var(--dsw-alias-label-primary)',
        transition: 'width 260ms ease',
      },
      progressMeta: { display: 'flex', alignItems: 'center', marginTop: 5, fontSize: 11, color: 'var(--dsw-alias-label-secondary)' },
      sectionTitle: { fontWeight: 600, fontSize: 12, margin: '10px 0 4px' },
      bullet: { margin: '2px 0', paddingLeft: 14, position: 'relative', lineHeight: 1.55 },
      page: {
        height: '100%',
        overflow: 'auto',
        padding: '20px 24px 32px',
        boxSizing: 'border-box',
        color: 'var(--dsw-alias-label-primary)',
        fontSize: 13,
      },
      pageHead: { display: 'flex', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap', marginBottom: 14 },
      pageTitle: { fontSize: 19, fontWeight: 700, lineHeight: 1.3 },
      pageSub: { color: 'var(--dsw-alias-label-secondary)', fontSize: 12, marginTop: 4, lineHeight: 1.5 },
      pageTabs: {
        display: 'flex',
        gap: 4,
        flexWrap: 'wrap',
        borderBottom: '1px solid var(--dsw-alias-border-l1)',
        paddingBottom: 8,
        marginBottom: 14,
      },
      pageBody: { maxWidth: 1120 },
      guide: {
        border: '1px solid var(--dsw-alias-border-l1)',
        background: 'var(--dsw-alias-bg-layer-1)',
        borderRadius: 12,
        padding: '12px 14px',
        marginBottom: 14,
      },
      guideTitle: { fontWeight: 600, fontSize: 13, marginBottom: 6 },
      guideStep: { color: 'var(--dsw-alias-label-secondary)', fontSize: 12, lineHeight: 1.9 },
      modeCard: {
        border: '1px solid var(--dsw-alias-border-l1)',
        background: 'var(--dsw-alias-bg-layer-1)',
        borderRadius: 12,
        padding: '14px 16px',
        marginBottom: 10,
      },
      modeTitle: { display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, fontSize: 14 },
      tag: {
        border: '1px solid var(--dsw-alias-border-l1)',
        color: 'var(--dsw-alias-label-secondary)',
        borderRadius: 999,
        padding: '1px 8px',
        fontSize: 11,
      },
    };

    const TOKEN = /\{\{(task|param:[A-Za-z0-9_-]+)\}\}/g;

    /** 与 Host 的 generate.fill() 语义一致（同一份骨架，同一套占位符）。 */
    function fillPrompt(skeleton, template, task, values) {
      const params = new Map(((template && template.params) || []).map((p) => [p.key, p]));
      return String(skeleton || '').replace(TOKEN, (_match, token) => {
        if (token === 'task') {
          const text = String(task || '').trim();
          return text !== '' ? text : '【需求描述：一句话说明要做的零件/装配/图纸与用途】';
        }
        const key = token.slice('param:'.length);
        const raw = values ? values[key] : undefined;
        const label = params.get(key) ? params.get(key).label : key;
        if (raw !== undefined && raw !== null && String(raw).trim() !== '') return String(raw).trim();
        const example = params.get(key) ? params.get(key).example : undefined;
        return example ? `【${label}｜例：${example}】` : `【${label}】`;
      });
    }

    function buildPlanPrompt(task, constraints) {
      const lines = [];
      lines.push('# 请先给出整体设计思路，再动手建模');
      lines.push('');
      lines.push('## 需求');
      lines.push(String(task || '').trim() || '【需求：说明要做的东西、用途、关键尺寸】');
      if (String(constraints || '').trim() !== '') lines.push(`额外约束：${String(constraints).trim()}`);
      lines.push('');
      lines.push('## 输出要求（九段式，逐段给结论、决策与检查项）');
      ((DATA && DATA.designPhases) || []).forEach((phase, index) => {
        lines.push(`${index + 1}. ${phase.name}｜${phase.question}`);
        lines.push(`   - ${phase.prompt}`);
      });
      lines.push('');
      lines.push('## 约束');
      lines.push('- 参数缺失就列为假设并标 review_required，不要自己拍数。');
      lines.push('- 能力等级以 SKILL_DIR/capabilities.yaml 为准，未验证能力不得承诺交付。');
      lines.push('- 输出最后给一份「先做什么、后做什么」的特征顺序与验收清单。');
      return lines.join('\n');
    }

    function buildGatePrompt(gates, workflowLabel) {
      const lines = [];
      lines.push('# 交付前门禁检查');
      if (workflowLabel) lines.push(`范围：${workflowLabel}`);
      lines.push('');
      for (const gate of gates) {
        lines.push(`## ${gate.name}（${gate.capability}）`);
        for (const item of gate.items || []) lines.push(`- [ ] ${item}`);
        if (gate.evidence && gate.evidence.length > 0) lines.push(`- 证据文件：${gate.evidence.join('、')}`);
        if (gate.blocked_when && gate.blocked_when.length > 0) lines.push(`- 命中即 blocked：${gate.blocked_when.join('；')}`);
        lines.push('');
      }
      lines.push('逐条回答 [通过/不通过/缺证据]；不通过项给出修复动作与重跑步骤。');
      return lines.join('\n');
    }

    function truncate(text, max) {
      const value = String(text || '');
      return value.length > max ? `${value.slice(0, max - 1)}…` : value;
    }

    function Btn(props) {
      const style = props.kind === 'primary' ? styles.primaryBtn : styles.ghostBtn;
      return el(
        'button',
        { type: 'button', onClick: props.onClick, style: style, disabled: props.disabled, title: props.title },
        props.label,
      );
    }

    function Chip(props) {
      return el(
        'button',
        {
          type: 'button',
          onClick: props.onClick,
          style: Object.assign({}, styles.chip, props.active ? styles.chipActive : null),
        },
        props.label,
      );
    }

    function Bullets(props) {
      const items = props.items || [];
      if (items.length === 0) return null;
      return el(
        'div',
        null,
        el('div', { style: styles.meta }, props.title),
        items.map((item, index) =>
          el(
            'div',
            { key: index, style: styles.bullet },
            el('span', { style: { position: 'absolute', left: 2 } }, '·'),
            item,
          ),
        ),
      );
    }

    function Preview(props) {
      return el(
        'div',
        null,
        el('div', { style: styles.row }, el('span', { style: styles.meta }, props.title || 'Preview'), props.extra || null),
        el('pre', { style: styles.pre }, props.text || ''),
      );
    }

    function useCopy(t, onDone) {
      return useCallback(
        (text) => {
          const finish = (ok) => {
            onDone(ok ? t('flash.copied') : t('flash.copyFailed'));
          };
          try {
            if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
              navigator.clipboard.writeText(text).then(() => finish(true)).catch(() => finish(false));
              return;
            }
          } catch {
            /* fall through */
          }
          try {
            const area = document.createElement('textarea');
            area.value = text;
            area.style.position = 'fixed';
            area.style.opacity = '0';
            document.body.appendChild(area);
            area.select();
            const ok = document.execCommand && document.execCommand('copy');
            document.body.removeChild(area);
            finish(Boolean(ok));
          } catch {
            finish(false);
          }
        },
        [t, onDone],
      );
    }

    function TemplateDetail(props) {
      const { template, t, values, setValue, onGenerate, onOneClick, onInsert, canInsert, onBack } = props;
      const params = template.params || [];
      return el(
        'div',
        null,
        el(
          'div',
          { style: styles.row },
          el('span', { style: styles.cardTitle }, template.name),
          el('span', { style: styles.meta }, `${diffLabel(template.difficulty)} · ${catLabel(template.category)}`),
          el('span', { style: { marginLeft: 'auto' } }, el(Btn, { label: t('common.back'), onClick: onBack })),
        ),
        el('div', { style: Object.assign({}, styles.meta, { marginTop: 4 }) }, template.summary),
        el('div', { style: styles.sectionTitle }, t('common.params')),
        params.map((param) =>
          el(
            'div',
            { key: param.key, style: styles.field },
            el('label', { style: styles.label }, `${param.label}${param.required === false ? '（可选）' : ''}`),
            el('input', {
              style: styles.input,
              value: values[param.key] || '',
              placeholder: param.example ? `例：${param.example}` : param.key,
              onChange: (event) => setValue(param.key, event.target.value),
            }),
          ),
        ),
        el(Bullets, { title: t('common.steps'), items: template.steps }),
        el(Bullets, { title: t('common.checks'), items: template.checks }),
        el(Bullets, { title: t('common.risks'), items: template.risks }),
        el(
          'div',
          { style: Object.assign({}, styles.meta, { marginTop: 6 }) },
          `${t('common.entry')}：${template.entry || '—'}`,
        ),
        el(
          'div',
          { style: Object.assign({}, styles.row, { marginTop: 8 }) },
          el(Btn, { kind: 'primary', label: t('common.oneClick'), onClick: onOneClick }),
          el(Btn, { label: t('common.generate'), onClick: onGenerate }),
          canInsert ? el(Btn, { label: t('common.insert'), onClick: onInsert }) : null,
        ),
      );
    }

    function TemplatesTab(props) {
      const { t } = props;
      const templates = (DATA && DATA.templates) || [];
      const [query, setQuery] = useState('');
      const [category, setCategory] = useState('all');
      const [activeId, setActiveId] = useState(null);
      const [values, setValues] = useState({});
      const [task, setTask] = useState('');
      const [detail, setDetail] = useState('full');

      const categories = useMemo(() => {
        const seen = [];
        for (const template of templates) if (seen.indexOf(template.category) < 0) seen.push(template.category);
        return ['all'].concat(seen);
      }, [templates]);

      const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return templates.filter((template) => {
          if (category !== 'all' && template.category !== category) return false;
          if (q === '') return true;
          return `${template.name} ${template.summary} ${template.id} ${(template.keywords || []).join(' ')}`
            .toLowerCase()
            .includes(q);
        });
      }, [templates, query, category]);

      const active = templates.find((template) => template.id === activeId);

      const generate = useCallback(
        (template) => {
          const skeleton = detail === 'brief' ? template.promptBrief : template.promptFull;
          return fillPrompt(skeleton || template.promptFull, template, task, values);
        },
        [detail, task, values],
      );

      if (active) {
        return el(
          'div',
          null,
          el(
            'div',
            { style: styles.field },
            el('label', { style: styles.label }, t('prompt.task') + '（可不填，模板已经带了标准写法）'),
            el('textarea', {
              style: styles.textarea,
              value: task,
              placeholder: t('prompt.taskPlaceholder'),
              onChange: (event) => setTask(event.target.value),
            }),
          ),
          el(
            'div',
            { style: styles.field },
            el('label', { style: styles.label }, t('common.detail')),
            el(
              'div',
              { style: styles.row },
              el(Chip, { label: t('common.full'), active: detail === 'full', onClick: () => setDetail('full') }),
              el(Chip, { label: t('common.brief'), active: detail === 'brief', onClick: () => setDetail('brief') }),
            ),
          ),
          el(TemplateDetail, {
            template: active,
            t: t,
            values: values,
            setValue: (key, value) => setValues(Object.assign({}, values, { [key]: value })),
            onGenerate: () => {
              const text = generate(active);
              setPreview(text);
            },
            onOneClick: () => {
              const text = generate(active);
              setPreview(text);
              props.copy(text);
            },
            onInsert: () => props.onInsert(generate(active)),
            canInsert: props.mode === 'dock',
            onBack: () => {
              setActiveId(null);
              props.setPreview('');
            },
          }),
          el(Preview, { text: props.preview, title: t('common.preview') }),
        );
      }

      return el(
        'div',
        null,
        el('div', { style: styles.meta }, t('templates.hint')),
        el(
          'div',
          { style: Object.assign({}, styles.row, { margin: '6px 0' }) },
          el('input', {
            style: Object.assign({}, styles.input, { flex: '1 1 140px', width: 'auto' }),
            value: query,
            placeholder: t('common.search'),
            onChange: (event) => setQuery(event.target.value),
          }),
        ),
        el(
          'div',
          { style: Object.assign({}, styles.row, { marginBottom: 8 }) },
          categories.map((item) =>
            el(Chip, {
              key: item,
              label: item === 'all' ? t('common.all') : catLabel(item),
              active: category === item,
              onClick: () => setCategory(item),
            }),
          ),
        ),
        filtered.length === 0
          ? el('div', { style: styles.empty }, t('common.empty'))
          : el(
              'div',
              { style: styles.list },
              filtered.map((template) =>
                el(
                  'button',
                  {
                    key: template.id,
                    type: 'button',
                    style: styles.card,
                    onClick: () => {
                      setActiveId(template.id);
                      props.setPreview('');
                    },
                  },
                  el('div', { style: styles.cardTitle }, template.name),
                  el('div', { style: styles.meta }, template.summary),
                  el('div', { style: styles.meta }, `${diffLabel(template.difficulty)} · ${catLabel(template.category)}`),
                ),
              ),
            ),
      );
    }

    function PromptTab(props) {
      const { t } = props;
      const templates = (DATA && DATA.templates) || [];
      const [task, setTask] = useState('');
      const [templateId, setTemplateId] = useState('');
      const [detail, setDetail] = useState('full');
      const [text, setText] = useState('');

      const generate = useCallback(() => {
        const chosen =
          templates.find((template) => template.id === templateId) ||
          matchTemplateLocal(templates, task) ||
          (DATA && DATA.fallbackTemplate) ||
          templates[0];
        if (!chosen) return '';
        const skeleton = detail === 'brief' ? chosen.promptBrief : chosen.promptFull;
        return fillPrompt(skeleton || chosen.promptFull, chosen, task, {});
      }, [task, templateId, detail, templates]);

      return el(
        'div',
        null,
        el(
          'div',
          { style: styles.field },
          el('label', { style: styles.label }, t('prompt.task')),
          el('textarea', {
            style: styles.textarea,
            value: task,
            placeholder: t('prompt.taskPlaceholder'),
            onChange: (event) => setTask(event.target.value),
          }),
        ),
        el(
          'div',
          { style: styles.field },
          el('label', { style: styles.label }, t('prompt.template')),
          el(
            'select',
            {
              style: styles.input,
              value: templateId,
              onChange: (event) => setTemplateId(event.target.value),
            },
            el('option', { value: '' }, t('prompt.auto')),
            templates.map((template) => el('option', { key: template.id, value: template.id }, template.name)),
          ),
        ),
        el(
          'div',
          { style: Object.assign({}, styles.row, { marginBottom: 8 }) },
          el('span', { style: styles.meta }, t('common.detail')),
          el(Chip, { label: t('common.full'), active: detail === 'full', onClick: () => setDetail('full') }),
          el(Chip, { label: t('common.brief'), active: detail === 'brief', onClick: () => setDetail('brief') }),
        ),
        el(
          'div',
          { style: styles.row },
          el(Btn, {
            kind: 'primary',
            label: t('common.generate'),
            onClick: () => {
              if (task.trim() === '' && templateId === '') {
                props.flash(t('flash.needTask'));
                return;
              }
              setText(generate());
            },
          }),
          el(Btn, { label: t('common.insert'), onClick: () => props.onInsert(text) }),
          el(Btn, {
            label: t('common.copy'),
            onClick: () => {
              if (text) props.copy(text);
            },
          }),
        ),
        el(Preview, { text: text, title: t('common.preview') }),
      );
    }

    function PlanTab(props) {
      const { t } = props;
      const [task, setTask] = useState('');
      const [constraints, setConstraints] = useState('');
      const [text, setText] = useState('');
      const phases = (DATA && DATA.designPhases) || [];
      return el(
        'div',
        null,
        el('div', { style: styles.meta }, t('plan.hint')),
        el(
          'div',
          { style: Object.assign({}, styles.field, { marginTop: 6 }) },
          el('label', { style: styles.label }, t('plan.task')),
          el('textarea', {
            style: styles.textarea,
            value: task,
            placeholder: t('prompt.taskPlaceholder'),
            onChange: (event) => setTask(event.target.value),
          }),
        ),
        el(
          'div',
          { style: styles.field },
          el('label', { style: styles.label }, t('plan.constraints')),
          el('input', {
            style: styles.input,
            value: constraints,
            placeholder: t('plan.constraintsPlaceholder'),
            onChange: (event) => setConstraints(event.target.value),
          }),
        ),
        el(
          'div',
          { style: styles.row },
          el(Btn, {
            kind: 'primary',
            label: t('plan.generate'),
            onClick: () => {
              if (task.trim() === '') {
                props.flash(t('flash.needTask'));
                return;
              }
              setText(buildPlanPrompt(task, constraints));
            },
          }),
          el(Btn, { label: t('common.insert'), onClick: () => props.onInsert(text) }),
        ),
        el(
          'div',
          { style: styles.list },
          phases.map((phase) =>
            el(
              'div',
              { key: phase.id, style: styles.card },
              el('div', { style: styles.cardTitle }, `${phase.name}｜${phase.question}`),
              (phase.hints || []).map((hint, index) =>
                el('div', { key: index, style: styles.meta }, `· ${hint}`),
              ),
            ),
          ),
        ),
        el(Preview, { text: text, title: t('common.preview') }),
      );
    }

    function TipsTab(props) {
      const { t } = props;
      const tips = (DATA && DATA.tips) || [];
      const [query, setQuery] = useState('');
      const [category, setCategory] = useState('all');
      const [openId, setOpenId] = useState(null);
      const categories = useMemo(() => {
        const seen = [];
        for (const tip of tips) if (seen.indexOf(tip.category) < 0) seen.push(tip.category);
        return ['all'].concat(seen);
      }, [tips]);
      const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return tips.filter((tip) => {
          if (category !== 'all' && tip.category !== category) return false;
          if (q === '') return true;
          return `${tip.title} ${tip.body} ${tip.code || ''} ${tip.category}`.toLowerCase().includes(q);
        });
      }, [tips, query, category]);
      return el(
        'div',
        null,
        el(
          'div',
          { style: Object.assign({}, styles.row, { marginBottom: 6 }) },
          el('input', {
            style: Object.assign({}, styles.input, { flex: '1 1 160px', width: 'auto' }),
            value: query,
            placeholder: t('tips.queryPlaceholder'),
            onChange: (event) => setQuery(event.target.value),
          }),
        ),
        el(
          'div',
          { style: Object.assign({}, styles.row, { marginBottom: 8 }) },
          categories.map((item) =>
            el(Chip, {
              key: item,
              label: item === 'all' ? t('common.all') : tipCatLabel(item),
              active: category === item,
              onClick: () => setCategory(item),
            }),
          ),
        ),
        filtered.length === 0
          ? el('div', { style: styles.empty }, t('common.empty'))
          : el(
              'div',
              { style: styles.list },
              filtered.map((tip) =>
                el(
                  'div',
                  {
                    key: tip.id,
                    style: styles.card,
                    onClick: () => setOpenId(openId === tip.id ? null : tip.id),
                  },
                  el('div', { style: styles.cardTitle }, `${tip.title}　`, el('span', { style: styles.meta }, `［${tipCatLabel(tip.category)}］`)),
                  el('div', { style: styles.meta }, openId === tip.id ? tip.body : truncate(tip.body, 64)),
                  openId === tip.id && tip.code ? el('pre', { style: styles.pre }, tip.code) : null,
                  openId === tip.id
                    ? el(
                        'div',
                        { style: Object.assign({}, styles.row, { marginTop: 6 }) },
                        el(Btn, {
                          label: t('tips.askAi'),
                          onClick: (event) => {
                            if (event && event.stopPropagation) event.stopPropagation();
                            props.onInsert(
                              `请检查我的模型是否踩了这条坑：${tip.title}\n${tip.body}\n${
                                tip.code ? `参考写法：\n\`\`\`python\n${tip.code}\n\`\`\`\n` : ''
                              }按技能 SKILL_DIR 的脚本复核并给出修复步骤。`,
                            );
                          },
                        }),
                        el('span', { style: styles.meta }, tip.source),
                      )
                    : null,
                ),
              ),
            ),
      );
    }

    function GateTab(props) {
      const { t } = props;
      const gates = (DATA && DATA.gates) || [];
      const workflows = (DATA && DATA.workflows) || [];
      const [workflow, setWorkflow] = useState('');
      const [text, setText] = useState('');
      const selected = useMemo(() => {
        if (workflow === '') return gates;
        return gates.filter(
          (gate) => (gate.workflows || []).indexOf(workflow) >= 0 || (gate.capability || '') === workflow,
        );
      }, [gates, workflow]);
      const label = workflow === '' ? '' : (workflows.find((item) => item.id === workflow) || {}).name || workflow;
      return el(
        'div',
        null,
        el('div', { style: styles.meta }, t('gate.hint')),
        el(
          'div',
          { style: Object.assign({}, styles.field, { marginTop: 6 }) },
          el('label', { style: styles.label }, t('gate.workflow')),
          el(
            'select',
            {
              style: styles.input,
              value: workflow,
              onChange: (event) => setWorkflow(event.target.value),
            },
            el('option', { value: '' }, t('common.all')),
            workflows.map((item) => el('option', { key: item.id, value: item.id }, `${item.name}（${item.id}）`)),
          ),
        ),
        el(
          'div',
          { style: styles.row },
          el(Btn, {
            kind: 'primary',
            label: t('gate.generate'),
            onClick: () => setText(buildGatePrompt(selected, label)),
          }),
          el(Btn, { label: t('common.insert'), onClick: () => props.onInsert(text) }),
        ),
        el(
          'div',
          { style: styles.list },
          selected.map((gate) =>
            el(
              'div',
              { key: gate.id, style: styles.card },
              el('div', { style: styles.cardTitle }, `${gate.name}（${gate.capability}）`),
              (gate.items || []).map((item, index) => el('div', { key: index, style: styles.meta }, `- ${item}`)),
              gate.evidence && gate.evidence.length > 0
                ? el('div', { style: styles.meta }, `证据：${gate.evidence.join('、')}`)
                : null,
            ),
          ),
        ),
        el(Preview, { text: text, title: t('common.preview') }),
      );
    }

    /** 侧边栏图标：与 main 面板同一个 id；点击与高亮由 shell 负责。 */
    function SwPanelIcon(props) {
      const size = typeof props.size === 'number' ? props.size : 16;
      return el(
        'svg',
        {
          viewBox: '0 0 16 16',
          width: size,
          height: size,
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.3,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          'data-dsh-panel-entry': NS,
          'aria-hidden': true,
        },
        el('path', { d: 'M8 1.8 13.6 4.9 8 8 2.4 4.9Z' }),
        el('path', { d: 'M2.4 4.9 8 8v6.2L2.4 11.1Z' }),
        el('path', { d: 'M13.6 4.9 8 8v6.2l5.6-3.1Z' }),
        el('circle', { cx: 8, cy: 10.6, r: 1.4 }),
      );
    }

    /** Agent 模式说明卡片的启动提示词。 */
    function modePrompt(mode) {
      return [
        `# 请按「${mode.name}」模式执行`,
        mode.description,
        `预设 id：${mode.id}（在会话的 Agent 模式选择器里选择）`,
        '',
        '执行要求：',
        '- 先给方案与结论，再动手；缺失参数标 review_required，不要自己拍数。',
        '- 每个结论都附可回读证据（路径、字节数、SHA-256、几何测量、审查报告字段）。',
        '- 汇报前用 swas_gate 过门禁；不通过项给修复动作与重跑步骤。',
      ].join('\n');
    }

    function AgentModesTab(props) {
      const { t } = props;
      const modes = (DATA && DATA.agentModes) || [];
      return el(
        'div',
        null,
        el('div', { style: styles.meta }, t('modes.hint')),
        modes.map((mode) =>
          el(
            'div',
            { key: mode.id, style: Object.assign({}, styles.modeCard, { marginTop: 10 }) },
            el('div', { style: styles.modeTitle }, mode.name, el('span', { style: styles.tag }, mode.id)),
            el('div', { style: Object.assign({}, styles.meta, { margin: '6px 0 8px' }) }, mode.description),
            el(
              'div',
              { style: styles.row },
              (mode.tools || []).map((tool) => el('span', { key: tool, style: styles.tag }, tool)),
            ),
            el(
              'div',
              { style: Object.assign({}, styles.row, { marginTop: 10 }) },
              el(Btn, { kind: 'primary', label: t('modes.copy'), onClick: () => props.copy(modePrompt(mode)) }),
            ),
            el(
              'div',
              { style: Object.assign({}, styles.meta, { marginTop: 8 }) },
              `${t('modes.persona')}：${mode.persona || '—'}`,
            ),
          ),
        ),
        el('div', { style: Object.assign({}, styles.meta, { marginTop: 12 }) }, t('modes.switchHint')),
      );
    }

    const DEPLOY_TARGETS = ['codex', 'claude', 'cursor', 'agents', 'openclaw'];
    const DEPLOY_STATE_LABEL = {
      'installed-by-plugin': '本插件装过',
      unmanaged: '别的方式装的（不会覆盖）',
      'not-installed': '目录不存在（不会创建）',
    };

    /**
     * 技能部署页：真正执行部署，而不是只显示命令。
     * 数据来自宿主的两条本地路由 /swas/status 与 /swas/deploy；
     * 路由不可用（未重启或宿主没有 webServer）时退回可复制的 CLI 命令。
     */
    function DeployTab(props) {
      const { t } = props;
      const [clients, setClients] = useState(null);
      const [target, setTarget] = useState('codex');
      const [job, setJob] = useState(null);
      const [error, setError] = useState('');
      const [busy, setBusy] = useState(false);
      const [done, setDone] = useState('');
      const pollRef = React.useRef(null);

      const phaseLabel = useCallback((phase) => t(`deploy.phase.${phase || 'start'}`), [t]);

      const request = useCallback(async (path, options) => {
        const response = await fetch(path, Object.assign(
          { credentials: 'same-origin', headers: { 'x-swas-client': 'ui', 'content-type': 'application/json' } },
          options,
        ));
        return response.json();
      }, []);

      const loadStatus = useCallback(async () => {
        setBusy(true);
        setError('');
        try {
          const data = await request('/swas/status');
          if (!data.ok) throw new Error(data.error || 'status failed');
          setClients(data.clients || []);
        } catch (cause) {
          setError(String(cause && cause.message ? cause.message : cause));
        } finally {
          setBusy(false);
        }
      }, [request]);

      React.useEffect(() => {
        let alive = true;
        request('/swas/status')
          .then((data) => {
            if (!alive) return;
            if (data.ok) setClients(data.clients || []);
            else setError(data.error || 'status failed');
          })
          .catch((cause) => {
            if (alive) setError(String(cause && cause.message ? cause.message : cause));
          });
        return () => {
          alive = false;
          if (pollRef.current) clearInterval(pollRef.current);
        };
      }, [request]);

      const track = useCallback(
        (jobId, dryRun) => {
          if (pollRef.current) clearInterval(pollRef.current);
          pollRef.current = setInterval(async () => {
            try {
              const data = await request(`/swas/job?id=${encodeURIComponent(jobId)}`);
              if (!data.ok || !data.job) throw new Error(data.error || 'job failed');
              setJob(data.job);
              if (data.job.done) {
                clearInterval(pollRef.current);
                pollRef.current = null;
                setBusy(false);
                setDone(data.job.ok ? (dryRun ? t('deploy.previewDone') : t('deploy.done')) : '');
                if (!data.job.ok) setError(t('deploy.failed'));
                if (!dryRun && data.job.ok) loadStatus();
              }
            } catch (cause) {
              clearInterval(pollRef.current);
              pollRef.current = null;
              setBusy(false);
              setError(String(cause && cause.message ? cause.message : cause));
            }
          }, 400);
        },
        [request, t, loadStatus],
      );

      const deploy = useCallback(
        async (dryRun) => {
          if (!dryRun && typeof window !== 'undefined' && typeof window.confirm === 'function') {
            const ok = window.confirm(`确认把技能真正部署到 ${target}？目录已存在会被跳过，不会覆盖。`);
            if (!ok) return;
          }
          setBusy(true);
          setError('');
          setDone('');
          setJob({ phase: 'start', percent: 0, lines: [], done: false });
          try {
            const data = await request('/swas/deploy', { method: 'POST', body: JSON.stringify({ target, dryRun }) });
            if (!data.ok || !data.jobId) throw new Error(data.error || 'deploy failed');
            track(data.jobId, dryRun);
          } catch (cause) {
            setBusy(false);
            setError(String(cause && cause.message ? cause.message : cause));
          }
        },
        [request, target, t, track],
      );

      const percent = job ? Math.max(0, Math.min(100, Number(job.percent) || 0)) : 0;

      return el(
        'div',
        null,
        el('div', { style: styles.meta }, t('deploy.hint')),
        el(
          'div',
          { style: Object.assign({}, styles.row, { margin: '10px 0' }) },
          el('span', { style: styles.meta }, t('deploy.target')),
          el(
            'select',
            { style: Object.assign({}, styles.input, { width: 'auto' }), value: target, onChange: (event) => setTarget(event.target.value) },
            DEPLOY_TARGETS.map((item) => el('option', { key: item, value: item }, item)),
          ),
          el(Btn, { label: t('deploy.refresh'), onClick: loadStatus, disabled: busy }),
          el(Btn, { label: t('deploy.preview'), onClick: () => deploy(true), disabled: busy }),
          el(Btn, { kind: 'primary', label: busy ? t('deploy.running') : t('deploy.run'), onClick: () => deploy(false), disabled: busy }),
        ),
        job
          ? el(
              'div',
              { style: styles.progressWrap },
              el(
                'div',
                { style: styles.progressTrack },
                el('div', { style: Object.assign({}, styles.progressFill, { width: `${percent}%` }) }),
              ),
              el(
                'div',
                { style: styles.progressMeta },
                el('span', null, phaseLabel(job.phase)),
                el('span', { style: { marginLeft: 'auto' } }, `${percent}%`),
              ),
            )
          : null,
        done !== '' ? el('div', { style: Object.assign({}, styles.meta, styles.flash) }, done) : null,
        error !== ''
          ? el(
              'div',
              { style: Object.assign({}, styles.card, { marginTop: 8 }) },
              el('div', { style: styles.cardTitle }, t('deploy.error')),
              el('div', { style: styles.meta }, error),
              el('pre', { style: styles.pre }, `node bin/swas.mjs agents\nnode bin/swas.mjs install --target ${target} --dry-run\nnode bin/swas.mjs install --target ${target}`),
            )
          : null,
        clients
          ? el(
              'div',
              { style: { marginTop: 10 } },
              clients.map((client) =>
                el(
                  'div',
                  { key: client.target, style: Object.assign({}, styles.card, { marginBottom: 6 }) },
                  el(
                    'div',
                    { style: styles.row },
                    el('span', { style: styles.cardTitle }, client.target),
                    el('span', { style: styles.tag }, DEPLOY_STATE_LABEL[client.state] || client.state),
                    el('span', { style: Object.assign({}, styles.meta, { marginLeft: 'auto' }) }, client.commit ? client.commit.slice(0, 10) : '—'),
                  ),
                  el('div', { style: styles.meta }, client.dest || ''),
                ),
              ),
            )
          : null,
        job && job.lines && job.lines.length > 0 ? el('pre', { style: styles.pre }, job.lines.join('\n')) : null,
      );
    }

    const PAGE_TABS = [
      { id: 'templates', labelKey: 'tab.templates' },
      { id: 'prompt', labelKey: 'tab.prompt' },
      { id: 'plan', labelKey: 'tab.plan' },
      { id: 'tips', labelKey: 'tab.tips' },
      { id: 'gate', labelKey: 'tab.gate' },
      { id: 'deploy', labelKey: 'tab.deploy' },
      { id: 'modes', labelKey: 'tab.modes' },
    ];

    /** 侧边栏主面板：标题 + 标签页 + 内容，宽度按中心栏自适应。 */
    function CopilotPage(props) {
      const t = makeT(props);
      const [tab, setTab] = useState(typeof props.defaultTab === 'string' ? props.defaultTab : 'templates');
      const [preview, setPreview] = useState('');
      const [flashMessage, setFlashMessage] = useState('');
      const flashTimer = React.useRef(null);
      const flash = useCallback((message) => {
        setFlashMessage(message || '');
        if (flashTimer.current) clearTimeout(flashTimer.current);
        flashTimer.current = setTimeout(() => setFlashMessage(''), 2600);
      }, []);
      React.useEffect(
        () => () => {
          if (flashTimer.current) clearTimeout(flashTimer.current);
        },
        [],
      );
      const copy = useCopy(t, flash);
      const insert = useCallback((text) => copy(String(text || '')), [copy]);
      const shared = { t: t, onInsert: insert, flash: flash, copy: copy };
      const templates = (DATA && DATA.templates) || [];
      const tips = (DATA && DATA.tips) || [];
      const gates = (DATA && DATA.gates) || [];
      const modes = (DATA && DATA.agentModes) || [];

      return el(
        'div',
        { style: styles.page },
        el(
          'div',
          { style: styles.pageHead },
          el(
            'div',
            null,
            el('div', { style: styles.pageTitle }, t('header.title')),
            el('div', { style: styles.pageSub }, t('page.tagline')),
          ),
          el(
            'div',
            { style: Object.assign({}, styles.row, { marginLeft: 'auto' }) },
            flashMessage !== '' ? el('span', { style: Object.assign({}, styles.meta, styles.flash) }, flashMessage) : null,
          ),
        ),
        el(
          'div',
          { style: styles.guide },
          el('div', { style: styles.guideTitle }, t('guide.title')),
          el('div', { style: styles.guideStep }, t('guide.step1')),
          el('div', { style: styles.guideStep }, t('guide.step2')),
          el('div', { style: styles.guideStep }, t('guide.step3')),
          el(
            'div',
            { style: Object.assign({}, styles.meta, { marginTop: 6 }) },
            `${templates.length} ${t('unit.templates')} · ${tips.length} ${t('unit.tips')} · ${gates.length} ${t('unit.gates')} · ${modes.length} ${t('unit.modes')}`,
          ),
        ),
        el(
          'div',
          { style: styles.pageTabs },
          PAGE_TABS.map((item) =>
            el(
              'button',
              {
                key: item.id,
                type: 'button',
                style: Object.assign({}, styles.tab, tab === item.id ? styles.tabActive : null),
                onClick: () => setTab(item.id),
              },
              t(item.labelKey),
            ),
          ),
        ),
        el(
          'div',
          { style: styles.pageBody },
          tab === 'templates'
            ? el(TemplatesTab, Object.assign({ preview: preview, setPreview: setPreview, mode: 'page' }, shared))
            : null,
          tab === 'prompt' ? el(PromptTab, shared) : null,
          tab === 'plan' ? el(PlanTab, shared) : null,
          tab === 'tips' ? el(TipsTab, shared) : null,
          tab === 'gate' ? el(GateTab, shared) : null,
          tab === 'deploy' ? el(DeployTab, shared) : null,
          tab === 'modes' ? el(AgentModesTab, shared) : null,
        ),
      );
    }

    const TABS = [
      { id: 'templates', labelKey: 'tab.templates' },
      { id: 'prompt', labelKey: 'tab.prompt' },
      { id: 'plan', labelKey: 'tab.plan' },
      { id: 'tips', labelKey: 'tab.tips' },
      { id: 'gate', labelKey: 'tab.gate' },
    ];

    function CopilotPanel(props) {
      const t = makeT(props);
      const inputActions = props.inputActions;
      // defaultOpen / defaultTab 只是给预览与冒烟测试用的初始值，正常挂载时不传。
      const [open, setOpen] = useState(props.defaultOpen === true);
      const [tab, setTab] = useState(typeof props.defaultTab === 'string' ? props.defaultTab : 'templates');
      const [preview, setPreview] = useState('');
      const [flashMessage, setFlashMessage] = useState('');
      const flashTimer = React.useRef(null);

      const flash = useCallback((message) => {
        setFlashMessage(message || '');
        if (flashTimer.current) clearTimeout(flashTimer.current);
        flashTimer.current = setTimeout(() => setFlashMessage(''), 2600);
      }, []);

      React.useEffect(
        () => () => {
          if (flashTimer.current) clearTimeout(flashTimer.current);
        },
        [],
      );

      const insert = useCallback(
        (text) => {
          const value = String(text || '').trim();
          if (value === '') return;
          if (inputActions && typeof inputActions.setDraft === 'function') {
            inputActions.setDraft(value);
            flash(t('flash.inserted'));
            setOpen(false);
          } else {
            flash(t('flash.noInput'));
          }
        },
        [inputActions, flash, t],
      );

      const copy = useCopy(t, flash);
      const shared = { t: t, onInsert: insert, flash: flash, copy: copy };

      if (!open) {
        return el(
          'div',
          { style: styles.root },
          el(
            'div',
            { style: styles.bar },
            el('span', { style: styles.brand }, el('span', { style: styles.dot }), t('header.title')),
            el('span', { style: styles.meta }, t('header.hint')),
            el(
              'span',
              { style: Object.assign({}, styles.row, { marginLeft: 'auto' }) },
              el(Chip, {
                label: t('tab.templates'),
                onClick: () => {
                  setTab('templates');
                  setOpen(true);
                },
              }),
              el(Chip, {
                label: t('tab.prompt'),
                onClick: () => {
                  setTab('prompt');
                  setOpen(true);
                },
              }),
              el(Chip, {
                label: t('tab.tips'),
                onClick: () => {
                  setTab('tips');
                  setOpen(true);
                },
              }),
              el(Btn, { label: t('header.expand'), onClick: () => setOpen(true) }),
            ),
          ),
        );
      }

      return el(
        'div',
        { style: styles.root },
        el(
          'div',
          { style: styles.panel },
          el(
            'div',
            { style: styles.panelHead },
            el('span', { style: styles.brand }, el('span', { style: styles.dot }), t('header.title')),
            el(
              'div',
              { style: styles.tabRow },
              TABS.map((item) =>
                el(
                  'button',
                  {
                    key: item.id,
                    type: 'button',
                    style: Object.assign({}, styles.tab, tab === item.id ? styles.tabActive : null),
                    onClick: () => setTab(item.id),
                  },
                  t(item.labelKey),
                ),
              ),
              el(Btn, { label: t('header.collapse'), onClick: () => setOpen(false) }),
            ),
          ),
          el(
            'div',
            { style: styles.body },
            flashMessage !== '' ? el('div', { style: Object.assign({}, styles.meta, styles.flash) }, flashMessage) : null,
            tab === 'templates'
              ? el(TemplatesTab, Object.assign({ preview: preview, setPreview: setPreview, mode: 'dock' }, shared))
              : null,
            tab === 'prompt' ? el(PromptTab, shared) : null,
            tab === 'plan' ? el(PlanTab, shared) : null,
            tab === 'tips' ? el(TipsTab, shared) : null,
            tab === 'gate' ? el(GateTab, shared) : null,
          ),
        ),
      );
    }

    /** 与 Host 的 matchTemplate 同构的轻量版本：只用于 PromptTab 的自动匹配。 */
    function matchTemplateLocal(templates, text) {
      const haystack = String(text || '').toLowerCase();
      if (haystack.trim() === '') return undefined;
      let best;
      let bestScore = 0;
      for (const template of templates) {
        const words = `${template.name} ${template.summary} ${template.category} ${(template.keywords || []).join(' ')}`.toLowerCase();
        let score = 0;
        for (const chunk of haystack.split(/[\s,，。;；、/]+/)) {
          if (chunk.length < 2) continue;
          if (words.includes(chunk)) score += 3;
          else if (template.name.includes(chunk)) score += 2;
        }
        if (score > bestScore) {
          bestScore = score;
          best = template;
        }
      }
      return best;
    }

    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        ctx.effect(
          () =>
            ctx.locale.register(NS, {
              zh: zh,
              en: en,
            }),
          'solidworks-copilot: dictionaries',
        );
        ctx.slots.inject('conversation.composer.dock', () =>
          ctx.slots.register(
            {
              name: 'conversation.composer.dock',
              id: NS,
              order: 4,
              locale: NS,
              label: () => 'SolidWorks 副驾',
            },
            CopilotPanel,
          ),
        );
        let translate = (key) => key;
        try {
          translate = ctx.locale.bind(NS) || translate;
        } catch {
          /* 语言包尚未就绪时退回键名 */
        }
        ctx.slots.inject('sidebar.panellist', () =>
          ctx.slots.register(
            {
              name: 'sidebar.panellist',
              id: NS,
              order: 30,
              label: () => translate('header.title'),
            },
            SwPanelIcon,
          ),
        );
        ctx.slots.inject('main', () =>
          ctx.slots.register(
            {
              name: 'main',
              key: NS,
            },
            CopilotPage,
          ),
        );
      },
    };
  },
});
