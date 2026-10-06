<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { login } from "#lib/api.ts";
//   import { authToken, currentUser } from "$lib/stores";
//   import { loadSession, saveSession } from "$lib/session";

  let username = "";
  let password = "";
  let error = "";
  let loading = false;


  async function doLogin() { await run(() => login(username, password)); }
  // async function doRegister() { await run(() => register(username, password)); }

  async function run(fn: () => Promise<any>) {
    error = "";
    loading = true;
    try {
      const data = await fn();

      goto("/chat");
    } catch (e: any) {
      error = e.message;
    } finally {
      loading = false;
    }
  }
</script>

<main class="wrap">
  <form class="card" on:submit|preventDefault={doLogin}>
    <div class="logo">
      <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="white" stroke-width="2">
        <path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5c-1.5 0-3-.4-4.2-1L3 20l1-5.3a8.5 8.5 0 1 1 17-3.2z"/>
      </svg>
    </div>
    <h1>Система учет трудозатрат</h1>

    <input bind:value={username} placeholder="Логин" autocomplete="username" />
    <input bind:value={password} type="password" placeholder="Пароль" autocomplete="current-password" />

    {#if error}<div class="error">{error}</div>{/if}

    <button class="primary" type="submit" disabled={loading}>
      {loading ? "Подключение…" : "Войти"}
    </button>
    <!-- <button class="ghost" type="button" on:click={doRegister} disabled={loading}>
      Создать аккаунт
    </button> -->
  </form>
</main>

<style>
  .wrap {
    height: 100vh;
    display: grid;
    place-items: center;
    background:
      radial-gradient(900px 480px at 12% -10%, rgba(0, 168, 150, 0.14), transparent 60%),
      radial-gradient(760px 460px at 108% 112%, rgba(245, 130, 32, 0.12), transparent 60%),
      var(--bg);
  }
  .card {
    width: 360px;
    display: flex; flex-direction: column; gap: 10px;
    padding: 32px 28px;
    background: var(--bg-elev);
    border: 1px solid var(--border);
    border-radius: 20px;
    box-shadow: var(--shadow);
  }
  .logo {
    position: relative;
    width: 52px; height: 52px;
    display: grid; place-items: center;
    border-radius: 16px;
    background: var(--accent);
    box-shadow: 0 6px 18px var(--accent-glow);
    margin-bottom: 4px;
  }
  /* оранжевая точка, как в логотипе TiK */
  .logo::after {
    content: "";
    position: absolute; top: 8px; right: 8px;
    width: 8px; height: 8px; border-radius: 50%;
    background: var(--orange);
  }
  h1 { margin: 0; font-size: 22px; color: var(--text); }
  .sub { margin: 0 0 8px; color: var(--text-dim); font-size: 12.5px; }
  .error {
    color: var(--danger);
    background: rgba(214, 69, 80, 0.08);
    border: 1px solid rgba(214, 69, 80, 0.3);
    padding: 8px 10px; border-radius: 10px;
    font-size: 12.5px;
  }
  .primary {
    margin-top: 6px; padding: 11px;
    color: #ffffff; background: var(--accent);
    font-weight: 600;
  }
  .primary:hover { filter: brightness(1.08); }
  .ghost {
    padding: 10px;
    background: transparent;
    color: var(--accent-deep);
    border: 1px solid var(--border);
  }
  .ghost:hover { background: var(--accent-soft); }
</style>