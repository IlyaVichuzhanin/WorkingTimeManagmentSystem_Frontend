<script lang="ts">
  import {
    SvGrid,
    tableFeatures,
    rowSortingFeature,
    renderSnippet,
    type GridColumns,
  } from '@svgrid/grid'

  type Status = 'planned' | 'in-progress' | 'blocked' | 'done'

  type Task = {
    id: string
    parentId: string | null
    depth: number
    name: string
    project: string
    owner: string
    effort: number  // Плановые трудозатраты (часы)
    actual: number  // Фактические трудозатраты (часы)
    percent: number // Процент выполнения
    due: string     // Срок
    status: Status
    childIds: string[]
  }

  function makeTasks(): Task[] {
    type Seed = Omit<Task, 'percent' | 'childIds' | 'effort' | 'actual'> & { 
      percent?: number 
      effort?: number
      actual?: number
    }
    
    const seeds: Seed[] = [
      // --- Backend система ---
      { id: '1',     parentId: null, depth: 0, name: 'Backend система',       project: 'Backend',  owner: 'Иван',       due: '2026-10-25', status: 'in-progress' },
      { id: '1.1',   parentId: '1',  depth: 1, name: 'Разработка API',        project: 'Backend',  owner: 'Иван',       due: '2026-10-15', status: 'in-progress' },
      { id: '1.1.1', parentId: '1.1', depth: 2, name: 'API авторизации',      project: 'Backend',  owner: 'Иван',       due: '2026-10-15', status: 'in-progress', percent: 75, effort: 24, actual: 18 },
      { id: '1.1.2', parentId: '1.1', depth: 2, name: 'API пользователей',    project: 'Backend',  owner: 'Пётр',       due: '2026-10-12', status: 'in-progress', percent: 60, effort: 16, actual: 10 },
      { id: '1.2',   parentId: '1',  depth: 1, name: 'Интеграции',            project: 'Backend',  owner: 'Иван',       due: '2026-10-25', status: 'in-progress' },
      { id: '1.2.1', parentId: '1.2', depth: 2, name: 'Платёжная система',    project: 'Backend',  owner: 'Иван',       due: '2026-10-25', status: 'in-progress', percent: 30, effort: 32, actual: 12 },
      { id: '1.2.2', parentId: '1.2', depth: 2, name: 'Swagger документация', project: 'Backend',  owner: 'Пётр',       due: '2026-10-20', status: 'in-progress', percent: 20, effort: 10, actual: 2 },
      { id: '1.3',   parentId: '1',  depth: 1, name: 'Инфраструктура',        project: 'Backend',  owner: 'DevOps',     due: '2026-10-16', status: 'planned' },
      { id: '1.3.1', parentId: '1.3', depth: 2, name: 'Настройка CI/CD',      project: 'Backend',  owner: 'DevOps',     due: '2026-10-10', status: 'done',        percent: 100, effort: 8, actual: 8 },
      { id: '1.3.2', parentId: '1.3', depth: 2, name: 'Оптимизация БД',       project: 'Backend',  owner: 'DevOps',     due: '2026-10-16', status: 'in-progress', percent: 60, effort: 14, actual: 9 },
      
      // --- Frontend и UX/UI ---
      { id: '2',     parentId: null, depth: 0, name: 'Frontend и UX/UI',      project: 'Frontend', owner: 'Анна',       due: '2026-10-18', status: 'in-progress' },
      { id: '2.1',   parentId: '2',  depth: 1, name: 'Вёрстка',               project: 'Frontend', owner: 'Анна',       due: '2026-10-12', status: 'in-progress' },
      { id: '2.1.1', parentId: '2.1', depth: 2, name: 'Главная страница',     project: 'Frontend', owner: 'Анна',       due: '2026-10-12', status: 'in-progress', percent: 60, effort: 16, actual: 10 },
      { id: '2.1.2', parentId: '2.1', depth: 2, name: 'Дизайн приложения',    project: 'Frontend', owner: 'UX',         due: '2026-10-08', status: 'done',        percent: 100, effort: 40, actual: 38 },
      { id: '2.2',   parentId: '2',  depth: 1, name: 'Рефакторинг',           project: 'Frontend', owner: 'Анна',       due: '2026-10-18', status: 'planned' },
      { id: '2.2.1', parentId: '2.2', depth: 2, name: 'Модуль отчётов',       project: 'Frontend', owner: 'Анна',       due: '2026-10-18', status: 'in-progress', percent: 30, effort: 12, actual: 4 },
      { id: '2.3',   parentId: '2',  depth: 1, name: 'Тестирование',          project: 'Frontend', owner: 'QA',         due: '2026-10-20', status: 'in-progress' },
      { id: '2.3.1', parentId: '2.3', depth: 2, name: 'Unit-тесты',           project: 'Frontend', owner: 'QA',         due: '2026-10-20', status: 'in-progress', percent: 25, effort: 20, actual: 5 },
    ]

    const tasks: Task[] = seeds.map((s) => ({
      ...s,
      percent: s.percent ?? 0,
      effort: s.effort ?? 0,
      actual: s.actual ?? 0,
      childIds: [],
    }))

    const byId = new Map(tasks.map((t) => [t.id, t]))
    for (const t of tasks) if (t.parentId) byId.get(t.parentId)!.childIds.push(t.id)
    return tasks
  }

  let allTasks = $state<Task[]>(recompute(makeTasks()))
  let expanded = $state<Record<string, boolean>>({ '1': true, '2': true })

  // Пересчет часов и процентов для родителей
  function recompute(tasks: Task[]): Task[] {
    const byId = new Map(tasks.map((t) => [t.id, { ...t }]))
    const rootsLast = [...byId.values()].sort((a, b) => b.depth - a.depth)
    for (const t of rootsLast) {
      if (t.childIds.length === 0) continue
      let totalEffort = 0
      let totalActual = 0
      let pctEffort = 0
      for (const cid of t.childIds) {
        const child = byId.get(cid)!
        totalEffort += child.effort
        totalActual += child.actual
        pctEffort += (child.percent / 100) * child.effort
      }
      t.effort = totalEffort
      t.actual = totalActual
      t.percent = totalEffort > 0 ? Math.round((pctEffort / totalEffort) * 100) : 0
    }
    return tasks.map((t) => byId.get(t.id)!)
  }

  // Показываем только развернутые ветки
  const visibleTasks = $derived.by(() => {
    const out: Task[] = []
    const byId = new Map(allTasks.map((n) => [n.id, n]))
    function walk(id: string) {
      const node = byId.get(id)
      if (!node) return
      out.push(node)
      if (expanded[id]) for (const cid of node.childIds) walk(cid)
    }
    for (const root of allTasks.filter((t) => t.parentId === null)) walk(root.id)
    return out
  })

  function toggle(id: string) {
    expanded = { ...expanded, [id]: !expanded[id] }
  }
  function expandAll() {
    const next: Record<string, boolean> = {}
    for (const t of allTasks) if (t.childIds.length) next[t.id] = true
    expanded = next
  }
  function collapseAll() {
    const next: Record<string, boolean> = {}
    for (const t of allTasks) if (t.parentId === null) next[t.id] = true
    expanded = next
  }

  const STATUS_COLOR: Record<Status, string> = {
    planned:       '#64748b',
    'in-progress': '#3b82f6',
    blocked:       '#ef4444',
    done:          '#10b981',
  }
  const STATUS_LABEL: Record<Status, string> = {
    planned:       'Запланировано',
    'in-progress': 'В работе',
    blocked:       'Блокер',
    done:          'Завершено',
  }

  function onCellChange(e: { rowIndex: number, columnId: string, newValue: unknown, row: Task }) {
    const next = allTasks.slice()
    const idx = next.findIndex((t) => t.id === e.row.id)
    if (idx < 0) return
    
    let value = Number(e.newValue)
    if (!Number.isFinite(value)) value = 0
    value = Math.max(0, value)

    if (e.columnId === 'percent') {
      value = Math.min(100, Math.round(value))
      next[idx] = { ...next[idx]!, percent: value }
    } else if (e.columnId === 'actual') {
      next[idx] = { ...next[idx]!, actual: value }
    }
    allTasks = recompute(next)
  }

  // KPI метрики
  const kpis = $derived.by(() => {
    const leaves = allTasks.filter((t) => t.childIds.length === 0)
    const totalEffort = leaves.reduce((s, t) => s + t.effort, 0)
    const totalActual = leaves.reduce((s, t) => s + t.actual, 0)
    
    // Общий процент (взвешенный по трудозатратам)
    const doneEffort = leaves.reduce((s, t) => s + t.effort * (t.percent / 100), 0)
    const overallPct = totalEffort > 0 ? Math.round((doneEffort / totalEffort) * 100) : 0

    const counts: Record<Status, number> = { planned: 0, 'in-progress': 0, blocked: 0, done: 0 }
    for (const t of leaves) counts[t.status] += 1
    return { overallPct, totalEffort, totalActual, counts }
  })

  // Управление с клавиатуры
  let activeCol = $state<string>('')
  let activeRowIndex = $state<number>(0)
  $effect(() => {
    function onKey(e: KeyboardEvent) {
      if (activeCol !== 'name') return
      const node = visibleTasks[activeRowIndex]
      if (!node || node.childIds.length === 0) return
      const isOpen = !!expanded[node.id]
      const consume = () => {
        e.preventDefault()
        e.stopImmediatePropagation()
        e.stopPropagation()
      }
      if (e.key === 'ArrowRight' && !isOpen) {
        consume(); toggle(node.id)
      } else if (e.key === 'ArrowLeft' && isOpen) {
        consume(); toggle(node.id)
      } else if (e.key === 'Enter' || e.key === ' ') {
        consume(); toggle(node.id)
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  })

  const features = tableFeatures({ rowSortingFeature })

  const columns: GridColumns<Task> = [
    {
      id: 'name',
      header: 'Задача',
      fieldFn: (row) => row.name,
      cell: (ctx) => renderSnippet(NameCell, { node: ctx.row.original }),
      width: 380,
    },
    {
      field: 'owner',
      header: 'Исполнитель',
      width: 140,
      cell: (ctx) => renderSnippet(OwnerCell, { name: ctx.row.original.owner }),
    },
    {
      field: 'effort',
      header: 'План (ч)',
      width: 100,
      cell: (ctx) => renderSnippet(EffortCell, { hours: ctx.row.original.effort }),
    },
    {
      field: 'actual',
      header: 'Факт (ч)',
      editorType: 'number',
      width: 120,
      cell: (ctx) => renderSnippet(ActualCell, { task: ctx.row.original }),
    },
    {
      field: 'percent',
      header: 'Прогресс',
      editorType: 'number',
      width: 220,
      cell: (ctx) => renderSnippet(PercentCell, { task: ctx.row.original }),
    },
    {
      field: 'due',
      header: 'Срок',
      width: 120,
      format: { type: 'date', pattern: 'y-m-d' },
    },
    {
      field: 'status',
      header: 'Статус',
      cell: (ctx) => renderSnippet(StatusCell, { status: ctx.row.original.status }),
      width: 140,
    },
  ]

  function initials(name: string): string {
    return name.split(' ').filter(Boolean).map((p) => p[0] ?? '').join('').slice(0, 2).toUpperCase()
  }
</script>

{#snippet NameCell(props: { node: Task })}
  {@const canExpand = props.node.childIds.length > 0}
  {@const isOpen = !!expanded[props.node.id]}
  {@const isProject = props.node.depth === 0}
  <span class={`t29-name ${isProject ? 't29-name-project' : ''}`} style={`padding-left: ${4 + props.node.depth * 22}px`}>
    {#each Array(props.node.depth) as _, i (i)}
      <span class="t29-guide" style={`left: ${4 + i * 22 + 11}px`}></span>
    {/each}
    {#if props.node.depth > 0}
      <span class="t29-elbow" style={`left: ${4 + (props.node.depth - 1) * 22 + 11}px`}></span>
    {/if}
    {#if canExpand}
      <button type="button" class={`t29-chev ${isOpen ? 't29-chev-open' : ''}`}
        onclick={(e) => { if (e.button !== 0) return; toggle(props.node.id) }}
        oncontextmenu={(e) => e.preventDefault()}
        aria-label={isOpen ? 'Свернуть' : 'Развернуть'}
        aria-expanded={isOpen}>
        <svg viewBox="0 0 16 16" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <polyline points="5 3 11 8 5 13" />
        </svg>
      </button>
    {:else}
      <span class="t29-dot" aria-hidden="true"></span>
    {/if}
    <span class="t29-name-text">
      <span class="t29-name-title">{props.node.name}</span>
      {#if !isProject}
        <span class="t29-name-sub tabular-nums">{props.node.id}</span>
      {/if}
    </span>
  </span>
{/snippet}

{#snippet OwnerCell(props: { name: string })}
  <span class="t29-owner">
    <span class="t29-owner-avatar">{initials(props.name)}</span>
    <span>{props.name}</span>
  </span>
{/snippet}

{#snippet EffortCell(props: { hours: number })}
  <span class="t29-effort">
    <span class="t29-effort-num tabular-nums">{props.hours}</span>
    <span class="t29-effort-unit">ч</span>
  </span>
{/snippet}

{#snippet ActualCell(props: { task: Task })}
  {@const isLeaf = props.task.childIds.length === 0}
  <span class={`t29-actual ${isLeaf ? '' : 't29-actual-derived'}`}>
    <span class="t29-actual-num tabular-nums">{props.task.actual}</span>
    <span class="t29-actual-unit">ч</span>
    {#if !isLeaf}<span class="t29-tag">сумма</span>{/if}
  </span>
{/snippet}

{#snippet PercentCell(props: { task: Task })}
  {@const isLeaf = props.task.childIds.length === 0}
  {@const pct = props.task.percent}
  <span class={`t29-pct ${pct >= 100 ? 't29-pct-done' : pct >= 50 ? 't29-pct-mid' : 't29-pct-early'}`}>
    <span class="t29-pct-bar">
      <span class="t29-pct-fill" style={`width: ${pct}%`}></span>
    </span>
    <span class={`t29-pct-text ${isLeaf ? '' : 't29-pct-text-derived'}`}>
      <span class="tabular-nums">{pct}%</span>
      {#if !isLeaf}<span class="t29-pct-tag">rollup</span>{/if}
    </span>
  </span>
{/snippet}

{#snippet StatusCell(props: { status: Status })}
  {@const color = STATUS_COLOR[props.status]}
  <span class="t29-status" style={`background:${color}1a; color:${color}; border: 1px solid ${color}40`}>
    <span class="t29-status-dot" style={`background: ${color}`}></span>
    {STATUS_LABEL[props.status]}
  </span>
{/snippet}

<section class="t29-shell flex min-h-0 flex-1 flex-col gap-3">
  <header class="t29-header">
    <h1 class="text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">Иерархия задач</h1>
  </header>

  <div class="t29-kpi-strip">
    <div class="t29-kpi t29-kpi-hero">
      <div class="t29-kpi-label">Общий прогресс</div>
      <div class="t29-kpi-hero-row">
        <div class="t29-kpi-value tabular-nums">{kpis.overallPct}<span class="t29-kpi-pct">%</span></div>
        <div class="t29-kpi-bar">
          <div class="t29-kpi-bar-fill" style={`width: ${kpis.overallPct}%`}></div>
        </div>
      </div>
      <div class="t29-kpi-foot">{kpis.totalActual}ч факт из {kpis.totalEffort}ч план</div>
    </div>
    {#each (['done', 'in-progress', 'blocked', 'planned'] as Status[]) as s (s)}
      {@const color = STATUS_COLOR[s]}
      <div class="t29-kpi" style={`--c: ${color}`}>
        <div class="t29-kpi-bar-side"></div>
        <div class="t29-kpi-label">{STATUS_LABEL[s]}</div>
        <div class="t29-kpi-value tabular-nums">{kpis.counts[s]}</div>
        <div class="t29-kpi-foot">подзадач</div>
      </div>
    {/each}
    <div class="t29-kpi t29-kpi-actions">
      <button type="button" class="t29-btn" onclick={expandAll}>Развернуть всё</button>
      <button type="button" class="t29-btn t29-btn-ghost" onclick={collapseAll}>Свернуть</button>
    </div>
  </div>

  <div class="flex-1 min-h-0 t29-grid-wrap">
    <SvGrid responsive={true}
      columnResize
      data={visibleTasks}
      columns={columns}
      features={features}
      filterMode="none"
      enableInlineEditing={true}
      enableCellSelection={true}
      rowHeight={48}
      containerHeight="100%"
      fitColumns={true}
      onCellValueChange={onCellChange}
      onActiveCellChange={(args) => { activeCol = args.columnId; activeRowIndex = args.rowIndex }}
    />
  </div>

  <footer class="t29-foot">
    {visibleTasks.length} показано из {allTasks.length} всего · <strong>управление:</strong> Стрелка вправо разворачивает, влево сворачивает, Enter/Space переключает · редактируйте факт или % у конечных задач, и показатели родителей пересчитаются
  </footer>
</section>

<style>
  .t29-shell { min-height: 0; }
  .t29-header { flex-shrink: 0; }

  /* KPI strip */
  .t29-kpi-strip {
    display: grid;
    grid-template-columns: 1.6fr repeat(4, minmax(0, 1fr)) 200px;
    gap: 10px;
    flex-shrink: 0;
  }
  .t29-kpi {
    position: relative;
    border: 1px solid var(--sg-border, #e2e8f0);
    background: var(--sg-bg, #ffffff);
    border-radius: 10px;
    padding: 12px 14px;
    overflow: hidden;
  }
  .t29-kpi-bar-side {
    position: absolute; left: 0; top: 0; bottom: 0;
    width: 3px; background: var(--c);
  }
  .t29-kpi-label {
    font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em;
    color: var(--sg-muted, #64748b); margin-bottom: 4px;
  }
  .t29-kpi-value { font-size: 22px; font-weight: 700; line-height: 1.1; color: var(--c, var(--sg-fg)); }
  .t29-kpi-foot { font-size: 11px; color: var(--sg-muted, #64748b); margin-top: 4px; }

  .t29-kpi-hero { background: color-mix(in oklab, var(--sg-accent, #6366f1) 6%, transparent); }
  :global([data-theme='dark']) .t29-kpi-hero { background: color-mix(in oklab, var(--sg-accent, #6366f1) 16%, transparent); }
  .t29-kpi-hero-row { display: flex; align-items: center; gap: 12px; }
  .t29-kpi-hero .t29-kpi-value { color: var(--sg-accent, #2563eb); font-size: 30px; }
  .t29-kpi-pct { font-size: 16px; opacity: 0.7; margin-left: 1px; }
  .t29-kpi-bar {
    flex: 1 1 0; height: 8px; border-radius: 999px;
    background: var(--sg-border, rgba(148, 163, 184, 0.25)); overflow: hidden;
  }
  .t29-kpi-bar-fill {
    height: 100%; border-radius: 999px;
    background: var(--sg-accent, #2563eb); transition: width 200ms ease;
  }

  .t29-kpi-actions { display: flex; flex-direction: column; justify-content: center; gap: 6px; }
  .t29-btn {
    border: 1px solid var(--sg-border, #cbd5e1); background: var(--sg-bg, #ffffff);
    color: var(--sg-fg, #1e293b); border-radius: 6px; padding: 6px 10px;
    font-size: 12px; cursor: pointer;
  }
  .t29-btn:hover { background: var(--sg-header-bg, #f1f5f9); }
  .t29-btn-ghost { background: transparent; border-color: transparent; color: var(--sg-muted, #64748b); }

  .t29-grid-wrap {
    border: 1px solid var(--sg-border, #e2e8f0);
    border-radius: 10px;
    background: var(--sg-bg, #ffffff);
    overflow: hidden;
    /* height: 500px;  ← удалить */
  }
  .t29-foot { font-size: 11.5px; color: var(--sg-muted, #64748b); }

  /* Name cell */
  :global(.t29-name) {
    display: inline-flex; align-items: center; gap: 10px;
    position: relative; width: 100%; height: 100%;
  }
  :global(.t29-name-project .t29-name-title) { font-weight: 700; font-size: 14px; }
  :global(.t29-guide) {
    position: absolute; top: 0; bottom: 0; width: 0;
    border-left: 1px dashed var(--sg-border, rgba(148, 163, 184, 0.35)); pointer-events: none;
  }
  :global(.t29-elbow) {
    position: absolute; top: 50%; width: 14px;
    border-top: 1px dashed var(--sg-border, rgba(148, 163, 184, 0.45)); pointer-events: none;
  }
  :global(.t29-chev) {
    border: 0; background: transparent; color: var(--sg-muted, #64748b);
    width: 18px; height: 18px; border-radius: 4px; cursor: pointer;
    display: inline-flex; align-items: center; justify-content: center;
    transition: transform 160ms ease, background 120ms ease, color 120ms ease; flex-shrink: 0;
  }
  :global(.t29-chev:hover) { background: var(--sg-header-bg, #f1f5f9); color: var(--sg-fg, #1e293b); }
  :global(.t29-chev-open) { transform: rotate(90deg); }
  :global(.t29-dot) {
    width: 18px; height: 18px; flex-shrink: 0;
    display: inline-flex; align-items: center; justify-content: center;
  }
  :global(.t29-dot::before) {
    content: ''; width: 4px; height: 4px; border-radius: 50%;
    background: var(--sg-muted, rgba(148, 163, 184, 0.6));
  }
  :global(.t29-name-text) { display: inline-flex; flex-direction: column; line-height: 1.2; min-width: 0; }
  :global(.t29-name-title) { font-weight: 600; }
  :global(.t29-name-sub) {
    font-size: 10.5px; color: var(--sg-muted, #64748b);
    text-transform: uppercase; letter-spacing: 0.04em;
  }

  /* Owner cell */
  :global(.t29-owner) { display: inline-flex; align-items: center; gap: 8px; }
  :global(.t29-owner-avatar) {
    width: 24px; height: 24px; border-radius: 50%;
    background: var(--sg-accent, #6366f1); color: var(--sg-on-accent, #fff);
    font-weight: 700; font-size: 10px;
    display: inline-flex; align-items: center; justify-content: center; letter-spacing: 0.02em;
  }

  /* Percent cell */
  :global(.t29-pct) { display: inline-grid; grid-template-columns: 1fr auto; gap: 10px; align-items: center; width: 100%; }
  :global(.t29-pct-bar) {
    height: 8px; border-radius: 999px;
    background: var(--sg-border, rgba(148, 163, 184, 0.22)); overflow: hidden;
  }
  :global(.t29-pct-fill) { display: block; height: 100%; border-radius: 999px; transition: width 220ms ease; }
  :global(.t29-pct-done .t29-pct-fill)  { background: linear-gradient(90deg, #16a34a, #22c55e); }
  :global(.t29-pct-mid .t29-pct-fill)   { background: linear-gradient(90deg, #d97706, #f59e0b); }
  :global(.t29-pct-early .t29-pct-fill) { background: linear-gradient(90deg, #2563eb, #06b6d4); }
  :global(.t29-pct-text) {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 12px; font-weight: 600; min-width: 70px; justify-content: flex-end;
  }
  :global(.t29-pct-text-derived) { color: var(--sg-muted, #64748b); font-style: italic; }
  :global(.t29-pct-tag) {
    background: var(--sg-bg-subtle, rgba(148, 163, 184, 0.18)); color: var(--sg-muted, #64748b);
    font-size: 9.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em;
    padding: 1px 5px; border-radius: 4px; font-style: normal;
  }

  /* Effort / Actual */
  :global(.t29-effort), :global(.t29-actual) { display: inline-flex; align-items: baseline; gap: 3px; }
  :global(.t29-effort-num), :global(.t29-actual-num) { font-size: 16px; font-weight: 700; }
  :global(.t29-effort-unit), :global(.t29-actual-unit) {
    font-size: 10.5px; color: var(--sg-muted, #64748b);
    text-transform: uppercase; letter-spacing: 0.04em;
  }
  :global(.t29-actual-derived) { color: var(--sg-muted, #64748b); font-style: italic; }
  :global(.t29-tag) {
    background: var(--sg-bg-subtle, rgba(148, 163, 184, 0.18)); color: var(--sg-muted, #64748b);
    font-size: 9.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em;
    padding: 1px 5px; border-radius: 4px; font-style: normal;
    margin-left: 4px; align-self: center;
  }

  /* Status pill */
  :global(.t29-status) {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 2px 9px; border-radius: 999px;
    font-size: 11px; font-weight: 700; letter-spacing: 0.04em; text-transform: capitalize;
  }
  :global(.t29-status-dot) { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
</style>