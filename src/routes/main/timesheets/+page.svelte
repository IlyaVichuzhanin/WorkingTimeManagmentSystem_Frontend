<script lang="ts">
  import {
    Breadcrumb,
    BreadcrumbItem,
    Heading,
    Badge,
    Datepicker,
    Table,
    TableHead,
    TableHeadCell,
    TableBody,
    TableBodyRow,
    TableBodyCell,
    Input
  } from 'flowbite-svelte';
  import { Button } from "@svar-ui/svelte-core";
  import { tasks } from '#lib/data/tasks.ts';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  // Системы ПО, время которых распределяем
  const SOFTWARE = ['PROSPER', 'GAP', 'MBAL', 'OPENSERVER', 'RESOLVE', 'PVTP', 'GUI', 'black oil'];

  interface Entry {
    hours: number;
    percent: number;
    comment: string;
    sw: Record<string, number>;
  }
  interface Sheet {
    entries: Entry[];
    registered: Record<string, number>;
  }

  const STORAGE_KEY = 'wtms.timesheets.v2';
  const WORKDAY_HOURS = 8;

  let date = $state<Date>(new Date());
  let sheets = $state<Record<string, Sheet>>({});
  let saved = $state(false);

  const keyOf = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  const dateKey = $derived(keyOf(date));
  const weekdayLabel = $derived(
    new Intl.DateTimeFormat('ru-RU', { weekday: 'long' }).format(date)
  );

  const activeTasks = $derived(tasks.filter((t) => !t.isActing));

  const zeroSw = (): Record<string, number> =>
    Object.fromEntries(SOFTWARE.map((s) => [s, 0]));

  const emptySheet = (): Sheet => ({
    entries: activeTasks.map(() => ({ hours: 0, percent: 0, comment: '', sw: zeroSw() })),
    registered: zeroSw()
  });

  onMount(() => {
    try {
      sheets = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
    } catch {
      sheets = {};
    }
  });

  $effect(() => {
    if (!sheets[dateKey]) sheets[dateKey] = emptySheet();
  });

  const sheet = $derived(sheets[dateKey]);
  const entries = $derived(sheet?.entries);
  const registered = $derived(sheet?.registered);

  const totalHours = $derived(
    entries ? entries.reduce((s, e) => s + (Number(e.hours) || 0), 0) : 0
  );

  const distributedBySw = $derived(
    SOFTWARE.map((name) =>
      entries ? entries.reduce((s, e) => s + (Number(e.sw?.[name]) || 0), 0) : 0
    )
  );

  const shiftDay = (delta: number) => {
    const d = new Date(date);
    d.setDate(d.getDate() + delta);
    date = d;
    saved = false;
  };

  const save = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sheets));
    saved = true;
  };
  const saveAndClose = () => {
    save();
    goto('/main');
  };
  const exit = () => goto('/main');
</script>

<Breadcrumb class="mb-5">
  <BreadcrumbItem home href="/main">Задачи</BreadcrumbItem>
  <BreadcrumbItem>Заполнение трудозатрат</BreadcrumbItem>
</Breadcrumb>

<Heading tag="h1" class="mb-4 text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
  Отчет о трудозатратах
</Heading>

<!-- Верхняя панель: дата слева, зарегистрированное время ПО справа -->
<div class="mb-4 flex flex-wrap items-start gap-4">
  <!-- Левая часть: дата отчета -->
  <div class="flex flex-wrap items-center gap-3">
    <span class="text-base font-semibold text-gray-900 dark:text-white">Дата отчета</span>
    <Button type="primary" css="btn-sm" onclick={() => shiftDay(-1)}>◀</Button>
    <div class="w-44">
      <Datepicker
        bind:value={date}
        locale="ru-RU"
        translationLocale="ru-RU"
        placeholder="Выберите дату"
      />
    </div>
    <Button type="primary" css="btn-sm" onclick={() => shiftDay(1)}>▶</Button>
    <Badge color="blue" class="px-3 py-1.5 capitalize">{weekdayLabel}</Badge>
    {#if saved}
      <Badge color="green">Сохранено</Badge>
    {/if}
  </div>

    <!-- Правая часть: зарегистрированное время ПО (половина ширины, 8 полей в одну строку) -->
    {#if sheet}
    <div class="ms-auto w-full min-w-0 lg:w-[47%]">
        <div class="rounded-lg border border-gray-200 bg-white p-2 dark:border-gray-700 dark:bg-gray-800">
        <h2 class="mb-1.5 text-xs font-semibold text-gray-900 dark:text-white">
            Зарегистрированное время использования ПО:
        </h2>
        <div class="grid grid-cols-8 gap-1">
            {#each SOFTWARE as name}
            <div class="min-w-0">
                <span
                class="mb-0.5 block truncate text-[9px] font-medium text-gray-600 dark:text-gray-300"
                title={name}
                >
                {name}
                </span>
                <Input
                type="number"
                min="0"
                max="24"
                step="0.5"
                bind:value={registered[name]}
                class="w-full px-1 py-0.5 text-xs [appearance:textfield] [&::-webkit-inner-spin-button]:hidden [&::-webkit-outer-spin-button]:hidden"
                />
            </div>
            {/each}
        </div>
        </div>
    </div>
    {/if}
</div>

{#if sheet}
  <!-- Таблица -->
  <div class="overflow-x-auto">
    <Table>
      <TableHead class="border-y border-gray-200 bg-gray-100 dark:border-gray-700">
        <TableHeadCell class="px-3 py-1.5 font-normal">Проект</TableHeadCell>
        <TableHeadCell class="px-3 py-1.5 font-normal">Задача</TableHeadCell>
        <TableHeadCell class="w-28 px-3 py-1.5 font-normal">Трудозатраты, ч</TableHeadCell>
        <TableHeadCell class="w-28 px-3 py-1.5 font-normal">% выполнения</TableHeadCell>
        <TableHeadCell class="px-3 py-1.5 font-normal">Комментарий</TableHeadCell>
        {#each SOFTWARE as name}
          <TableHeadCell class="w-24 px-3 py-1.5 text-center font-normal">{name}</TableHeadCell>
        {/each}
      </TableHead>
      <TableBody>
        {#each activeTasks as task, i}
          <TableBodyRow>
            <TableBodyCell class="px-3 py-1.5 text-sm text-gray-500 dark:text-gray-300">
              {task.project}
            </TableBodyCell>
            <TableBodyCell class="px-3 py-1.5 text-sm font-semibold text-gray-900 dark:text-white">
              {task.name}
            </TableBodyCell>
            <TableBodyCell class="px-3 py-1.5">
              <Input
                type="number"
                min="0"
                max="24"
                step="0.5"
                bind:value={entries[i].hours}
                class="w-20 py-1 text-sm"
              />
            </TableBodyCell>
            <TableBodyCell class="px-3 py-1.5">
              <Input
                type="number"
                min="0"
                max="100"
                step="5"
                bind:value={entries[i].percent}
                class="w-20 py-1 text-sm"
              />
            </TableBodyCell>
            <TableBodyCell class="px-3 py-1.5">
              <Input
                type="text"
                bind:value={entries[i].comment}
                placeholder="Комментарий"
                class="py-1 text-sm"
              />
            </TableBodyCell>
            {#each SOFTWARE as name}
              <TableBodyCell class="px-3 py-1.5">
                <Input
                  type="number"
                  min="0"
                  max="24"
                  step="0.5"
                  bind:value={entries[i].sw[name]}
                  class="w-16 py-1 text-sm"
                />
              </TableBodyCell>
            {/each}
          </TableBodyRow>
        {/each}
      </TableBody>
    </Table>
  </div>

  <!-- Проверки -->
  <div class="mt-4 space-y-3">
    <div class="flex flex-wrap items-center justify-end gap-3">
      <span class="text-base font-semibold text-gray-900 dark:text-white">
        Трудозатраты за день:
      </span>
      <Badge
        color={totalHours === WORKDAY_HOURS ? 'green' : totalHours > WORKDAY_HOURS ? 'red' : 'yellow'}
        class="px-4 py-2 text-base"
      >
        {totalHours} / {WORKDAY_HOURS} ч
      </Badge>
    </div>

    <div>
      <h2 class="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
        Итого распределенное время использования ПО (распределено / зарегистрировано):
      </h2>
      <div class="flex flex-wrap gap-2">
        {#each SOFTWARE as name, si}
          <Badge
            color={distributedBySw[si] === (registered[name] ?? 0) ? 'green' : 'red'}
            class="px-2 py-1 text-xs"
          >
            {name}: {distributedBySw[si]} / {registered[name] ?? 0}
          </Badge>
        {/each}
      </div>
    </div>
  </div>
{/if}

<div class="mt-6 flex justify-end gap-3">
  <Button type="primary"   onclick={save}>Сохранить</Button>
  <Button type="primary" onclick={saveAndClose}>Сохранить и закрыть</Button>
  <Button type="danger"    onclick={exit}>Выход</Button>
</div>