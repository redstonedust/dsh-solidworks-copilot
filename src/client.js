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

    const DATA = /* @swas-data */ null;

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
