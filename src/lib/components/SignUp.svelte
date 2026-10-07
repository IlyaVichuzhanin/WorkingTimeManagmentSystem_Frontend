<script lang="ts">
  import { A, Checkbox, Button, Card } from 'flowbite-svelte';
  import { twMerge } from 'tailwind-merge';

  interface Site { name: string; img: string; link: string; imgAlt: string; }
  interface SignUpProps {
    children: any;
    title?: string;
    site?: Site;
    haveAccount?: boolean;
    acceptTerms?: boolean;
    btnTitle?: string;
    termsLink?: string;
    loginLink?: string;
    mainClass?: string;
    mainDivClass?: string;
    siteLinkClass?: string;
    siteImgClass?: string;
    cardH1Class?: string;
    haveAccoutDivClass?: string;
    [key: string]: any;
  }

  let {
    children,
    title = 'Создать аккаунт',
    site,
    haveAccount = true,
    acceptTerms = true,
    btnTitle = 'Зарегистрироваться',
    termsLink = '/',
    loginLink = '/login',
    mainClass = 'bg-gray-50 dark:bg-gray-900 w-full',
    mainDivClass,
    siteLinkClass,
    siteImgClass,
    cardH1Class,
    haveAccoutDivClass,
    ...restProps
  }: SignUpProps = $props();

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
  const haveAccountDivCls = twMerge('text-sm font-medium text-gray-500 dark:text-gray-300', haveAccoutDivClass);

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
        {#if acceptTerms}
          <Checkbox class="pt-1" name="accept">
            <span>Я принимаю <A href={termsLink}>условия использования</A></span>
          </Checkbox>
        {/if}
        <Button type="submit" size="lg">{btnTitle}</Button>
        {#if haveAccount}
          <div class={haveAccountDivCls}>
            Уже есть аккаунт? <A href={loginLink}>Войти</A>
          </div>
        {/if}
      </form>
    </Card>
  </div>
</main>