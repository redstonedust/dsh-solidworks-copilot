/**
 * SolidWorks 副驾知识库（Host 与 Client 共用的唯一数据源）。
 *
 * - templates: 常用建模/装配/出图/交付模板预设（参数、步骤、验收、风险）
 * - tips: SolidWorks API 与工程实践技巧条目
 * - gates: 交付门禁（按能力/工作流给出必查项与证据）
 * - workflows: 与 golden-workflows.yaml 对齐的标准工作流
 * - designPhases: 整体设计思路的九段式提示骨架
 *
 * 修改本文件后必须执行 `node scripts/build-client.mjs` 重新生成 client.js。
 *
 * @module solidworks-copilot/catalog
 */

import { templates } from './content/templates.js';
import { tips } from './content/tips.js';
import { gates } from './content/gates.js';

export { templates, tips, gates };

/** 技能身份信息，提示词与工具输出都会引用。 */
export const meta = {
  skillId: 'solidworks-automation',
  repo: 'https://github.com/wzyn20051216/solidworks-automation-skill',
  skillEnv: 'SOLIDWORKS_AUTOMATION_SKILL_DIR',
  defaultSkillDir: 'C:\\Users\\<you>\\.agents\\skills\\solidworks-automation',
  verifiedVersions: ['SolidWorks 2024', 'SolidWorks 2026'],
  preflight: 'python SKILL_DIR/scripts/sw_preflight.py',
  doctor: 'python SKILL_DIR/scripts/cad_studio.py doctor',
  capabilitySource: 'SKILL_DIR/capabilities.yaml',
  router: 'python SKILL_DIR/scripts/backend_router.py --list',
  apiLookup: 'python SKILL_DIR/scripts/sw_api_lookup.py <接口> <方法>',
  version: '0.5.0',
};

/** 能力等级语义（来自 capabilities.yaml），用于提示词里的门禁措辞。 */
export const capabilityLevels = [
  { id: 'verified', label: '已验证', rule: '可作为无人值守交付，但仍需交付证据回读。' },
  { id: 'pilot', label: '试运行', rule: '可执行，必须在结果里标注 pilot 并附人工复核项。' },
  { id: 'reference_only', label: '仅参考', rule: '不得作为交付依据，只能用于设计参考或参数估算。' },
  { id: 'not_implemented', label: '未实现', rule: '不得宣称支持，必须改为人工执行或降级方案。' },
];

/** 标准工作流（与 golden-workflows.yaml 对齐）。 */
export const workflows = [
  {
    id: 'mounting_bracket',
    name: '安装板与支架',
    capabilities: ['part_and_features', 'holes_and_finishing', 'export_delivery'],
    inputs: ['外形尺寸', '板厚', '孔规格', '孔定位', '材料'],
    artifacts: ['sldprt', 'step', 'preview', 'review_report'],
  },
  {
    id: 'enclosure',
    name: '设备外壳',
    capabilities: ['part_and_features', 'holes_and_finishing', 'export_delivery'],
    inputs: ['包络尺寸', '壁厚', '接口开孔', '装配间隙', '制造工艺'],
    artifacts: ['sldprt', 'step', 'stl', 'preview', 'review_report'],
  },
  {
    id: 'holes_slots_threads',
    name: '孔槽螺纹',
    capabilities: ['holes_and_finishing'],
    inputs: ['孔槽规格', '数量', '基准', '中心距', '深度'],
    artifacts: ['sldprt', 'geometry_evidence', 'review_report'],
  },
  {
    id: 'modify_existing_part',
    name: '修改已有零件',
    capabilities: ['part_and_features', 'geometry_and_delivery_review'],
    inputs: ['源文件', '修改范围', '保留特征', '输出版本'],
    artifacts: ['sldprt', 'before_after_preview', 'review_report'],
  },
  {
    id: 'assembly_mates',
    name: '装配与配合',
    capabilities: ['assembly_and_mates', 'geometry_and_delivery_review'],
    inputs: ['零件清单', '装配基准', '配合关系', '允许自由度'],
    artifacts: ['sldasm', 'mate_evidence', 'preview', 'review_report'],
  },
  {
    id: 'parallel_gripper_assembly',
    name: '双指平行夹爪结构装配',
    capabilities: ['part_and_features', 'assembly_and_mates', 'geometry_and_delivery_review', 'export_delivery'],
    inputs: ['组件规格', '配合关系', '目标自由度', '空间位置', 'BOM'],
    artifacts: ['sldprt', 'sldasm', 'step', 'bom', 'mate_evidence', 'preview', 'review_report'],
  },
  {
    id: 'batch_export',
    name: '批量导出',
    capabilities: ['export_delivery'],
    inputs: ['输入清单', '输出格式', '版本命名', '覆盖策略'],
    artifacts: ['delivery_manifest', 'hash_ledger', 'review_report'],
  },
  {
    id: 'configuration_family',
    name: '配置族',
    capabilities: ['configurations_and_design_tables'],
    inputs: ['参数表', '配置命名', '尺寸约束', '输出规则'],
    artifacts: ['configuration_matrix', 'rebuild_evidence', 'review_report'],
  },
  {
    id: 'properties_bom',
    name: '属性与 BOM',
    capabilities: ['drawings_and_bom'],
    inputs: ['属性模板', '零件编号', '材料', '数量规则'],
    artifacts: ['bom', 'property_report', 'review_report'],
  },
  {
    id: 'engineering_drawing',
    name: '工程图',
    capabilities: ['drawings_and_bom'],
    inputs: ['图幅', '比例', '视图', '尺寸链', '公差', '技术要求'],
    artifacts: ['slddrw', 'pdf', 'preview', 'review_report'],
  },
  {
    id: 'autocad_cleanup_delivery',
    name: 'AutoCAD 图纸整理与交付',
    capabilities: ['autocad_basic_drafting', 'autocad_headless_preview', 'export_delivery'],
    inputs: ['源图', '图层规则', '文字字体', '标注样式', '输出格式'],
    artifacts: ['dwg', 'dxf', 'pdf', 'preview', 'review_report'],
  },
];

/** 任务路由表：说人话 → 走哪个脚本/参考文档。 */
export const routing = [
  { match: ['零件', '建模', '拉伸', '旋转', '草图', '方块', '圆柱', '支架'], entry: 'scripts/sw_part.py', ref: 'references/part-modeling.md' },
  { match: ['孔', '沉孔', '沉头', '螺纹', '攻丝', '底孔', '槽'], entry: 'scripts/sw_hole_features.py', ref: 'references/complex-hole-features.md' },
  { match: ['圆角', '倒角', 'CNC', '机加工', '安装座'], entry: 'subskills/solidworks-fillet-chamfer-cnc/scripts/create_cnc_mount_template.py', ref: 'subskills/solidworks-fillet-chamfer-cnc/SKILL.md' },
  { match: ['齿轮', '齿数', '模数'], entry: 'scripts/sw_gear.py', ref: 'references/gears.md' },
  { match: ['弹簧', '螺旋'], entry: 'scripts/sw_spring.py', ref: 'references/spring.md' },
  { match: ['链轮', '链条'], entry: 'scripts/sw_sprocket.py', ref: 'references/sprocket.md' },
  { match: ['装配', '配合', '同心', '自由度', '夹爪'], entry: 'scripts/sw_assembly.py', ref: 'references/assembly.md' },
  { match: ['运动', '马达', 'Motion', '动画'], entry: 'scripts/sw_motion.py', ref: 'references/motion-study.md' },
  { match: ['工程图', '出图', '标注', 'BOM', '标题栏', '孔表'], entry: 'scripts/sw_drawing.py', ref: 'references/drawing.md' },
  { match: ['导出', 'STEP', 'STL', 'PDF', 'DXF', 'Pack and Go', '批量'], entry: 'scripts/sw_export.py', ref: 'references/export.md' },
  { match: ['外观', '颜色', '材质', '渲染'], entry: 'scripts/sw_appearance.py', ref: 'references/appearance.md' },
  { match: ['网格', 'OBJ', 'GLB', 'STL 导入', '复刻'], entry: 'scripts/sw_import_mesh_reference.py', ref: 'references/mesh-reference-import.md' },
  { match: ['DFM', '可制造', '公差', '工艺复核'], entry: 'scripts/dfm_review.py', ref: 'references/design-rule-check.md' },
  { match: ['FEA', '仿真', '应力', 'CalculiX'], entry: 'scripts/fea_analysis.py', ref: 'references/complex-mechanical-routing.md' },
  { match: ['审查', '复核', '预览', '验收'], entry: 'scripts/sw_review.py', ref: 'references/review.md' },
  { match: ['报错', '失败', '排障', 'ERROR', 'HRESULT'], entry: 'scripts/sw_preflight.py', ref: 'references/troubleshooting.md' },
  { match: ['AutoCAD', 'DWG', 'DXF 绘图', '二维'], entry: 'subskills/autocad-automation/scripts/acad_draw.py', ref: 'subskills/autocad-automation/SKILL.md' },
  { match: ['自然语言', '参数化计划', '需求不清', 'VibeCAD'], entry: 'subskills/solidworks-vibecad/scripts/plan_from_brief.py', ref: 'subskills/solidworks-vibecad/SKILL.md' },
];

/** 整体设计思路：九段式骨架，客户端「思路」页与 swas_plan 共用。 */
export const designPhases = [
  {
    id: 'brief',
    name: '1. 需求澄清',
    question: '这件东西到底要满足什么？',
    hints: [
      '分清「视觉演示」「结构验证」「可制造交付」三种交付级别，级别决定验收标准。',
      '记录外形尺寸、板厚/壁厚、材料、关键配合面、安装接口、工况载荷。',
      '缺少的输入先列成假设表，标 review_required，不要悄悄拍数。',
    ],
    prompt: '先复述需求并输出输入清单：已知参数、缺失参数、假设值（标注 review_required）、交付级别。',
  },
  {
    id: 'units',
    name: '2. 单位与坐标系',
    question: '数值从哪来、往哪去？',
    hints: [
      'SolidWorks API 全部使用米：mm(50) = 0.05 m，deg(90) 转角度，禁止把毫米直接塞进 API。',
      '基准面名称中英版不同（Front Plane / 前视基准面），用封装函数而不是硬编码字符串。',
      '原点、主基准、装配基准先定，再谈特征，避免后期整体平移返工。',
    ],
    prompt: '明确单位换算方式、基准面/原点选择、模型坐标系与装配基准，列出会在代码里出现的坐标数值。',
  },
  {
    id: 'sketch',
    name: '3. 参数化草图',
    question: '尺寸是设计的还是凑的？',
    hints: [
      '草图必须完全定义：用尺寸和几何关系驱动，不用 Fix 批量锁死。',
      '基础圆/矩形可用 fully_define_sketch()，复杂轮廓显式写尺寸链。',
      '草图名称要可追溯，后续特征引用它，不要靠屏幕坐标选边。',
    ],
    prompt: '画出草图层的设计尺寸与几何关系，说明哪些是驱动尺寸、哪些是派生尺寸，并给出完全定义策略。',
  },
  {
    id: 'features',
    name: '4. 特征顺序',
    question: '先长什么、后切什么？',
    hints: [
      '稳定顺序：基体拉伸/旋转 → 主轮廓切除 → 孔槽 → 圆角倒角 → 抽壳/阵列 → 细节。',
      '圆角放在孔槽之后，避免圆角面被后续切除破坏导致重建失败。',
      '能做参数化的地方就做参数化：孔位用阵列而不是逐个画。',
    ],
    prompt: '输出特征树顺序（含特征类型、草图、关键参数），标注哪些特征可被后续修改驱动。',
  },
  {
    id: 'assembly',
    name: '5. 装配与自由度',
    question: '它是怎么动的？',
    hints: [
      '组件先定位再配合；AddComponent4 返回 None 时走 AddComponent5 / 重新激活装配体回退。',
      '旋转件用同心 Mate 且 lock_rotation=False，不要三基准面全锁死。',
      '齿轮传动用真实 Gear Mate，不要用脚本假动画冒充机械配合。',
    ],
    prompt: '给出组件清单、每个组件的配合关系与剩余自由度，说明如何验证可拖动。',
  },
  {
    id: 'motion',
    name: '6. 运动与验证',
    question: '怎么证明它真的会动？',
    hints: [
      'Motion Study 需要加载 swmotionstudy.tlb，创建后校验类型、时长、马达数量、结果存在性。',
      'results_out_of_date=False 才算算例有效，只看时间轴或动画不算通过。',
      '需要演示动画时说明动画≠交互自由度，最终以 SolidWorks 里能拖动为准。',
    ],
    prompt: '说明运动验证方式：马达类型与参数、算例校验项、期望的可动范围与判据。',
  },
  {
    id: 'drawing',
    name: '7. 出图与标注',
    question: '图纸能不能直接拿去加工？',
    hints: [
      '示意图 ≠ 工程图：孔、槽、接口必须给规格、数量和定位尺寸。',
      '国内习惯：规范图幅/图框/标题栏、仿宋中文、分层线型、中心线虚线、真实标注实体。',
      '密集孔槽用孔表/槽表，但表格不能替代定位尺寸；长引线只做局部说明。',
    ],
    prompt: '列出视图选择、尺寸链、孔表/技术要求、图幅比例与标题栏字段。',
  },
  {
    id: 'delivery',
    name: '8. 交付与证据',
    question: '留下的证据够别人复现吗？',
    hints: [
      '交付物：原生文件 + STEP/PDF/DXF + 四视图预览 + *_review_report.json。',
      '每个产物给绝对路径与 SHA-256，导出失败要写返回值与错误码，不要只说失败。',
      '预览图必须目视复核：主体存在、比例合理、无缺失部件、无重叠悬空。',
    ],
    prompt: '定义交付清单与证据格式（路径、哈希、预览视图、审查报告字段）。',
  },
  {
    id: 'risk',
    name: '9. 风险与人工复核',
    question: '哪些结论现在还不能说？',
    hints: [
      '能力等级以 capabilities.yaml 为准：reference_only / not_implemented 不得当交付。',
      '未封装接口先 sw_api_lookup.py 查证签名与版本差异，禁止凭记忆猜 COM 参数。',
      '涉及材料、公差、热处理、疲劳、量产工艺的结论一律标人工复核。',
    ],
    prompt: '列出本任务的风险清单：未验证能力、依赖缺失、假设参数、需要工程师复核的结论。',
  },
];

/** Agent 模式（与本 bundle 的 presets/*.patch.yml 对应）。 */
export const agentModes = [
  {
    id: 'swas-cad',
    name: 'SolidWorks · 建模执行',
    description: '可写建模模式：先方案后动手，米制与完全定义草图，孔槽圆角按稳定顺序，四视图与哈希证据齐全才算完成。',
    tools: ['shell', 'fs', 'fs-search', 'jobs', 'todo', 'ask-user', 'web'],
    persona: 'prompts/cad.md',
  },
  {
    id: 'swas-review',
    name: 'SolidWorks · 交付复核',
    description: '只读复核模式：查产物清单、SHA-256、审查报告、四视图与门禁，逐条给通过/不通过/缺证据与修复动作。',
    tools: ['shell', 'fs', 'fs-search', 'jobs', 'ask-user'],
    persona: 'prompts/review.md',
  },
];

/** 没有匹配模板时的兜底模板：仍然生成一份合规的通用提示词。 */
export const fallbackTemplate = {
  id: 'generic-task',
  name: '通用零件任务',
  category: 'part',
  summary: '按技能路由执行的通用 SolidWorks 任务',
  difficulty: 'standard',
  workflow: 'mounting_bracket',
  capabilities: ['part_and_features'],
  entry: '按技能 SKILL.md 路由，从 scripts/sw_part.py 起步',
  references: ['references/part-modeling.md', 'references/review.md', 'references/troubleshooting.md'],
  params: [
    { key: 'goal', label: '要做的东西', example: '120×80×10 安装板', required: true },
    { key: 'material', label: '材料', example: '6061-T6', required: false },
    { key: 'output', label: '交付格式', example: 'sldprt + step + 四视图预览', required: false },
    { key: 'constraints', label: '关键约束', example: '四角 M6 沉孔，孔心距 96×56', required: false },
  ],
  steps: [
    '运行 python SKILL_DIR/scripts/sw_preflight.py 自检环境与 SolidWorks 连接。',
    '按需求确定交付级别（演示 / 结构验证 / 可制造），把已知参数与假设参数分表列出。',
    '用 SolidWorksSession() 新建或打开文档，先建主轮廓草图并完全定义。',
    '按基体 → 切除 → 孔槽 → 圆角倒角的顺序建特征，每步检查返回值。',
    '保存原生文件并导出交换格式，记录路径与 SHA-256。',
    '导出四视图预览，读 *_review_report.json 并目视复核。',
  ],
  checks: [
    '草图完全定义，关键驱动尺寸可改且孔位保持正确。',
    '特征树含目标特征，重建成功（ForceRebuild3 返回 True）。',
    '原生文件与交换格式均已落盘，附绝对路径与 SHA-256。',
    '四视图预览非空白，主体存在、比例合理、无缺失部件。',
  ],
  risks: ['未验证能力与假设参数必须标注 review_required。', '材料、公差、制造工艺结论需工程师复核。'],
};

/** 提示词通用约束段（Host 生成器使用）。 */
export const promptRules = {
  role: '你是 solidworks-automation 技能的执行者，用脚本和真机回读完成 CAD 任务，不靠想象描述结果。',
  hardRules: [
    '先跑 python SKILL_DIR/scripts/sw_preflight.py 自检；SolidWorks 版本与界面语言先确认。',
    '能力等级以 SKILL_DIR/capabilities.yaml 为准；reference_only / not_implemented 不得作为无人值守交付。',
    'API 一律使用米制；单位换算用 mm()/deg()，禁止把毫米直接传给 COM。',
    '未封装的接口先 python SKILL_DIR/scripts/sw_api_lookup.py <接口> <方法> 查证，禁止凭记忆猜长参数 COM 方法。',
    '草图用尺寸与关系驱动，禁止批量 Fix 冒充完全定义。',
    '每步检查 COM 返回值 None/False，失败要保留错误码并说明回退路径。',
    '生成或修改后必须导等轴测/前/俯/右四视图预览并目视复核。',
    '未验证能力、缺失依赖、假设参数必须显式标注 review_required。',
  ],
  delivery: [
    '原生文件（.sldprt/.sldasm/.slddrw）+ 交换格式（.step/.stl/.pdf/.dxf）',
    '四视图预览图 + *_review_report.json（evaluation.status / issues / checks）',
    '每个产物给绝对路径与 SHA-256',
  ],
  forbid: [
    '不要用「保存成功」代替验收。',
    '不要改扩展名或写空文件伪造格式支持。',
    '不要把演示动画说成机械配合。',
    '不要在缺证据时宣称任务完成。',
  ],
};
