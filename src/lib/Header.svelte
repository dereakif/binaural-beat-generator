<script>
  let theme = 'solarized';
  const themes = [
    { label: 'Solarized', value: 'solarized' },
    { label: 'Light', value: 'light' },
    { label: 'Dark', value: 'dark' },
    { label: 'Forest', value: 'forest' },
    { label: 'Dim', value: 'dim' }
  ];
  const changeTheme = (e) => {
    const newTheme = e.target.value;
    theme = newTheme;
    document.documentElement.setAttribute('data-theme', theme);
  };
</script>

<header>
  <div class="navbar bg-base-300 flex justify-between">
    <span class="text-xl"> Binaural Beat Generator </span>
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
