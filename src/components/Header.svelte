<script>
  import { onMount } from 'svelte';
  import daisyuiColors from 'daisyui/src/theming/themes';
  import Theme from '../stores/ThemeStore';

  const themes = [
    { label: 'Solarized', value: 'solarized' },
    { label: 'Light', value: 'light' },
    { label: 'Dark', value: 'dark' },
    { label: 'Dim', value: 'dim' }
  ];

  const setTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    Theme.set({
      name: theme,
      primary: daisyuiColors[theme]?.primary || '#2aa198',
      secondary: daisyuiColors[theme]?.secondary || '#2aa198'
    });
  };

  onMount(() => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    setTheme(currentTheme);
  });

  const changeTheme = (e) => {
    const newTheme = e.target.value;
    setTheme(newTheme);
  };
</script>

<header class="bg-base-300">
  <div class="navbar flex justify-between container px-16 mx-auto">
    <div>
      <img src="/favicon.ico" alt="pulsify" class="w-8 h-8 inline-block mr-3" />
      <span class="text-2xl">pulsify</span>
    </div>
    <div class="dropdown">
      <div tabindex="0" role="button" class="btn m-1">
        Theme
        <svg
          width="12px"
          height="12px"
          class="h-2 w-2 fill-current opacity-60 inline-block"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 2048 2048"
          ><path d="M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z"
          ></path></svg
        >
      </div>
      <ul class="dropdown-content z-[1] shadow-2xl bg-base-300 rounded-box">
        {#each themes as { label, value }}
          <li>
            <input
              type="radio"
              name="theme-dropdown"
              class="theme-controller btn btn-sm btn-block btn-ghost justify-start"
              aria-label={label}
              {value}
              on:change={changeTheme}
            />
          </li>
        {/each}
      </ul>
    </div>
  </div>
</header>
