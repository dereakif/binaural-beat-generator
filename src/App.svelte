<script>
  import Canvas from './components/Canvas.svelte';
  import Header from './components/Header.svelte';
  import Accordion from './components/Accordion.svelte';
  import List from './components/List.svelte';
  import FrequencyList from './components/FrequencyList.svelte';
</script>

<Header />
<main class="mb-[52px] container px-4 sm:px-8 md:px-16 mx-auto">
  <Canvas />
  <FrequencyList />
  <List />
  <Accordion />
</main>

<footer
  class="footer footer-center p-4 bg-base-300 text-base-content fixed bottom-0 h-[52px]"
>
  <aside>
    <p>
      copyright © {new Date().getFullYear()} - made with
      <svg
        class="inline-block h-4 w-4 fill-rose-500"
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 512 512"
        ><path
          d="M256,448a32,32,0,0,1-18-5.57c-78.59-53.35-112.62-89.93-131.39-112.8-40-48.75-59.15-98.8-58.61-153C48.63,114.52,98.46,64,159.08,64c44.08,0,74.61,24.83,92.39,45.51a6,6,0,0,0,9.06,0C278.31,88.81,308.84,64,352.92,64,413.54,64,463.37,114.52,464,176.64c.54,54.21-18.63,104.26-58.61,153-18.77,22.87-52.8,59.45-131.39,112.8A32,32,0,0,1,256,448Z"
        ></path></svg
      >
      by
      <a
        href="https://www.linkedin.com/in/akifdere/"
        target="_blank"
        rel="noopener noreferrer"
        class="text-info underline"
      >
        Akif Dere
      </a>
    </p>
  </aside>
</footer>

<style global lang="postcss">
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
</style>
