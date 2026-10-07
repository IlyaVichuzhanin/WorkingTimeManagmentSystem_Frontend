<script lang="ts">
  import { Checkbox, A, Button, Card } from 'flowbite-svelte';
  import { twMerge } from 'tailwind-merge';

  interface Site { name: string; img: string; link: string; imgAlt: string; }
  
  interface SignInProps {
    children: any;
    title?: string;
    site?: Site;
    rememberMe?: boolean;
    lostPassword?: boolean;
    createAccount?: boolean;
    lostPasswordLink?: string;
    loginTitle?: string;
    registerLink?: string;
    createAccountTitle?: string;
    mainClass?: string;
    mainDivClass?: string;
    siteLinkClass?: string;
    siteImgClass?: string;
    cardH1Class?: string;
    [key: string]: any;
  }

  let {
    children,
    title = 'Вход в систему',
    site,
    rememberMe = true,
    lostPassword = true,
    createAccount = true,
    lostPasswordLink = '/forgot-password',
    loginTitle = 'Войти в аккаунт',
    registerLink = '/register',
    createAccountTitle = 'Создать аккаунт',
    mainClass = 'bg-gray-50 dark:bg-gray-900 w-full',
    mainDivClass,
    siteLinkClass,
    siteImgClass,
    cardH1Class,
    ...restProps
  }: SignInProps = $props();

  const siteDefault: Site = {
    name: 'Учёт времени',
    img: '/favicon.svg',
    link: '/',
    imgAlt: 'Логотип'
  };
  const siteOptions = $derived(site ?? siteDefault);

  const mainDivCls = twMerge('flex flex-col items-center justify-center px-6 pt-8 mx-auto md:h-screen pt:mt-0 dark:bg-gray-900', mainDivClass);
  const siteLinkCls = twMerge('flex items-center justify-center mb-8 text-2xl font-semibold lg:mb-10 dark:text-white', siteLinkClass);
  const siteImgCls = twMerge('mr-4 h-11', siteImgClass);
  const cardH1Cls = twMerge('mb-3 text-2xl font-bold text-gray-900 dark:text-white', cardH1Class);

  const preventDefault = <E extends Event>(fn: (event: E) => void) =>
    function (this: any, event: E) {
      event.preventDefault();
      fn.call(this, event);
    };
</script>

<main class={mainClass}>
  <div class={mainDivCls}>
    <a href={siteOptions.link} class={siteLinkCls}>
      <img src={siteOptions.img} class={siteImgCls} alt={siteOptions.imgAlt} />
      <span>{siteOptions.name}</span>
    </a>
    <Card class="w-full p-4 sm:p-6" size="md">
      <h1 class={cardH1Cls}>{title}</h1>
      <form class="mt-8 space-y-6" onsubmit={preventDefault(() => {})} {...restProps}>
        {@render children()}
        {#if rememberMe || lostPassword}
          <div class="flex items-start">
            {#if rememberMe}
              <Checkbox class="accent-primary-600" name="remember">Запомнить меня</Checkbox>
            {/if}
            {#if lostPassword}
              <A href={lostPasswordLink} class="ml-auto text-sm">Забыли пароль?</A>
            {/if}
          </div>
        {/if}
        <Button type="submit" size="lg">{loginTitle}</Button>
        {#if createAccount}
          <div class="text-sm font-medium text-gray-500 dark:text-gray-300">
            Нет аккаунта? <A href={registerLink}>{createAccountTitle}</A>
          </div>
        {/if}
      </form>
    </Card>
  </div>
</main>