<script lang="ts">
  import { Sidebar, SidebarGroup, SidebarItem, SidebarBrand, SidebarButton } from 'flowbite-svelte';
  import {
    GridOutline,
    HourglassOutline,
    FolderOutline,
    FileChartBarOutline,
    UserSettingsOutline
  } from 'flowbite-svelte-icons';
  import { page } from '$app/state';

  let activeUrl = $state(page.url.pathname);
  let isOpen = $state(true);
  const toggle = () => (isOpen = !isOpen);

  $effect(() => {
    activeUrl = page.url.pathname;
  });

  const site = { name: 'Учёт времени', href: '/main', img: '/favicon.svg' };
  const iconClass =
    'h-5 w-5 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white';
</script>

<div class="flex h-screen flex-col bg-gray-50 dark:bg-gray-900">
  <!-- Верхняя панель -->
  <div class="flex shrink-0 items-center gap-3 border-b border-gray-200 px-4 py-2 dark:border-gray-700">
    <SidebarButton onclick={toggle} />
  </div>

  <!-- Сайдбар + контент -->
  <div class="flex min-h-0 flex-1">
    <Sidebar
      {activeUrl}
      backdrop={false}
      {isOpen}
      closeSidebar={() => (isOpen = false)}
      params={{ x: -50, duration: 50 }}
      position="static"
      class="z-40 h-full"
      classes={{ nonactive: 'p-2', active: 'p-2' }}
    >
      <SidebarBrand {site} classes={{ img: 'h-6 w-6' }} />
      <SidebarGroup>
        <SidebarItem label="Задачи" href="/main">
          {#snippet icon()}<GridOutline class={iconClass} />{/snippet}
        </SidebarItem>
        <SidebarItem label="Заполнение трудозатрат" href="/main/timesheets">
          {#snippet icon()}<HourglassOutline class={iconClass} />{/snippet}
        </SidebarItem>
        <!-- <SidebarItem label="Задачи и проекты" href="/main/tasks">
          {#snippet icon()}<FolderOutline class={iconClass} />{/snippet}
        </SidebarItem> -->
        <SidebarItem label="Отчёты" href="/main/reports">
          {#snippet icon()}<FileChartBarOutline class={iconClass} />{/snippet}
        </SidebarItem>
      </SidebarGroup>
      <SidebarGroup border>
        <SidebarItem label="Настройки профиля" href="/main/settings">
          {#snippet icon()}<UserSettingsOutline class={iconClass} />{/snippet}
        </SidebarItem>
      </SidebarGroup>
    </Sidebar>

    <!-- Пустая область под контент раздела -->
    <main class="flex min-h-0 flex-1 flex-col overflow-y-auto p-4">
      <slot />
    </main>
  </div>
</div>