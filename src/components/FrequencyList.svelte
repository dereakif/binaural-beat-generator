<script>
  import { PlayerStore } from '../stores/PlayerStore';


  const togglePlayStop = () => {
    if ($PlayerStore.isPlaying) {
      PlayerStore.stopBeat();
    } else {
      PlayerStore.playBeat($PlayerStore.currentHz);
    }
  };

  $: if ($PlayerStore.volume) {
    PlayerStore.setVolume($PlayerStore.volume);
  }

  $: if ($PlayerStore.baseFrequency) {
    PlayerStore.setBaseFrequency($PlayerStore.baseFrequency);
  }
</script>


<div
  class="mt-10 grid grid-cols-2 gap-6 justify-items-center"
>
  <div class="card w-full max-w-96 h-fit bg-neutral text-neutral-content">
    <div class="card-body">
      <h2 class="card-title flex justify-between">
        <div class="flex gap-1 items-end">Base Frequency</div>
        <span class="font-mono text-base self-end text-secondary">
          {$PlayerStore.baseFrequency}Hz
        </span>
      </h2>
      <input
        type="range"
        class="range range-accent range-sm"
        min="20"
        max="1000"
        bind:value={$PlayerStore.baseFrequency}
      />
    </div>
  </div>

  <div class="card w-full max-w-96 h-fit bg-neutral text-neutral-content">
    <div class="card-body">
      <h2 class="card-title flex justify-between">
        <div class="flex gap-1 items-end">Binaural Frequency</div>
        <span class="font-mono text-base self-end text-secondary">
          {$PlayerStore.currentHz}Hz
        </span>
      </h2>
      <input
        type="range"
        class="range range-accent range-sm"
        min="0.5"
        max="100"
        step="0.5"
        bind:value={$PlayerStore.currentHz}
      />
    </div>
  </div>

  <div class="card w-full max-w-96 bg-neutral text-neutral-content">
    <div class="card-body my-1 flex flex-row items-center justify-between">
      <button
        on:click={togglePlayStop}
        class="btn btn-circle hover:scale-105"
      >
        <svg
          class="fill-secondary cursor-pointer"
          height="48"
          width="48"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512"
          xml:space="preserve"
        >
          <path
            d="M256,0C114.615,0,0,114.615,0,256s114.615,256,256,256s256-114.615,256-256S397.385,0,256,0z M336,320
  	c0,8.837-7.163,16-16,16H192c-8.837,0-16-7.163-16-16V192c0-8.837,7.163-16,16-16h128c8.837,0,16,7.163,16,16V320z"
          />
        </svg>
      </button>
      <div class="form-control flex flex-col">
        <label class="cursor-pointer label gap-2">
          <span class="label-text">Show pulse</span>
          <input
            type="checkbox"
            bind:checked={$PlayerStore.showPulse}
            class="checkbox checkbox-sm checkbox-secondary"
          />
        </label>
      </div>
    </div>
  </div>

  <div class="card w-full max-w-96 h-fit bg-neutral text-neutral-content">
    <div class="card-body">
      <h2 class="card-title flex justify-between">
        <div class="flex gap-1 items-end">Volume</div>
        <span class="font-mono text-base self-end text-secondary">
          {Math.round($PlayerStore.volume * 100)}%
        </span>
      </h2>
      <input
        type="range"
        class="range range-accent range-sm"
        bind:value={$PlayerStore.volume}
        min={0.0}
        max={1.0}
        step={0.01}
      />
    </div>
  </div>
</div>
