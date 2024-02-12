<script lang="js">
  import Header from './lib/Header.svelte';
  import Accordion from './lib/Accordion.svelte';
  import FrequencyList from './lib/FrequencyList.svelte';
</script>

<Header />
<main class="mb-[52px]">
  <FrequencyList />
  <Accordion />
</main>

<footer
  class="footer footer-center p-4 bg-base-300 text-base-content fixed bottom-0 h-[52px]"
>
  <aside>
    <p>copyright © {new Date().getFullYear()} - for personal use only</p>
  </aside>
</footer>

<style global lang="postcss">
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
</style>
