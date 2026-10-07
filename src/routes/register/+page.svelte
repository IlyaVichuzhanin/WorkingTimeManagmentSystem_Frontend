<script lang="ts">
  import { Label, Input } from 'flowbite-svelte';
  import SignUp from '../../lib/components/SignUp.svelte';

  const onSubmit = (e: Event) => {
    const formData = new FormData(e.target as HTMLFormElement);
    const data: Record<string, string | File> = {};
    for (const [key, value] of formData.entries()) data[key] = value;
    console.log('Регистрация:', data);
    // TODO: отправка на бэкенд
  };
</script>

<SignUp
  title="Регистрация в системе учёта времени"
  btnTitle="Создать аккаунт"
  onsubmit={onSubmit}
>
  <div>
    <Label for="email" class="mb-2 dark:text-white">Ваш email</Label>
    <Input type="email" name="email" id="email" placeholder="name@company.com" required />
  </div>
  <div>
    <Label for="password" class="mb-2 dark:text-white">Пароль</Label>
    <Input type="password" name="password" id="password" placeholder="••••••••" required />
  </div>
  <div>
    <Label for="confirm" class="mb-2 dark:text-white">Повторите пароль</Label>
    <Input type="password" name="confirm" id="confirm" placeholder="••••••••" required />
  </div>
</SignUp>