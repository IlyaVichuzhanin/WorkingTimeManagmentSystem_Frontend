<script lang="ts">
  import { Label, Input } from "flowbite-svelte";
  import SignIn from '../lib/components/SignIn.svelte';
  import { goto } from '$app/navigation';

  let title = "Sign in to platform";
  let site = {
    name: "Система учета трудозатрат",
    img: "/favicon.svg",
    link: "/",
    imgAlt: "FlowBite Logo"
  };
  let rememberMe = true;
  let lostPassword = true;
  let createAccount = true;
  let lostPasswordLink = "forgot-password";
  let loginTitle = "Login to your account";
  let registerLink = "/";
  let createAccountTitle = "Create account";

  const onSubmit = (e: Event) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data: Record<string, string | File> = {};
    for (const field of formData.entries()) {
      const [key, value] = field;
      data[key] = value;
    }
    console.log(data);
    goto('/main');
  };

  const path: string = "/authentication/sign-in";
  const description: string = "Sign in example - Flowbite Svelte Admin Dashboard";
  const metaTitle: string = "Flowbite Svelte Admin Dashboard - Sign in";
  const subtitle: string = "Sign in";
</script>

<SignIn {title} {site} {rememberMe} {lostPassword} {createAccount} {lostPasswordLink} {loginTitle} {registerLink} {createAccountTitle} onsubmit={onSubmit}>
  <div>
    <Label for="email" class="mb-2 dark:text-white">Your email</Label>
    <Input type="email" name="email" id="email" placeholder="name@company.com" required class="border outline-none dark:border-gray-600 dark:bg-gray-700" />
  </div>
  <div>
    <Label for="password" class="mb-2 dark:text-white">Your password</Label>
    <Input type="password" name="password" id="password" placeholder="••••••••" required class="border outline-none dark:border-gray-600 dark:bg-gray-700" />
  </div>
</SignIn>