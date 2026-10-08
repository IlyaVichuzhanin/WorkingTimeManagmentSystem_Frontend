<script lang="ts">
  import './layout.css';
  import favicon from '#lib/assets/favicon.svg';
  import { Willow } from '@svar-ui/svelte-core';
  let { children } = $props();
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

<Willow fonts={false}>
  {@render children()}
</Willow>