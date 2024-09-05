<script>
  import tone_list from '../../tone_list.json';
  import { PlayerStore } from '../stores/PlayerStore';

  let currentTone = null;

  const isSameTone = (tone) => {
    return (
      currentTone !== null &&
      currentTone.frequency === tone.frequency &&
      currentTone.baseFrequency === tone.baseFrequency
    );
  };

  function playBeat(tone) {
    const frequency = parseFloat(tone.frequency.split(' ')[0]);
    const baseFrequency = parseFloat(tone.baseFrequency.split(' ')[0]);
    console.log(frequency, baseFrequency);

    if (isSameTone(tone)) {
      PlayerStore.stopBeat();
      currentTone = null;
    } else {
      PlayerStore.setBaseFrequency(baseFrequency);
      PlayerStore.playBeat(frequency);
      currentTone = tone;
    }
  }

  $: if(!PlayerStore.isPlaying) {
    currentTone = null;
  }
</script>

<div class="flex flex-wrap justify-center gap-6 my-6">
  {#each tone_list as tone}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div
      class="card w-96 bg-primary bg-gradient-to-b from-gray-800 to-gray-900 text-white cursor-pointer drop-shadow-sm hover:shadow-lg transition-shadow duration-300"
      on:click={() => playBeat(tone)}
    >
      <div class="card-body p-6">
        <div class="flex flex-col justify-between items-start mb-4">
          <span
            class="text-sm flex items-center gap-2 bg-gray-700 text-gray-300 rounded-full px-2 py-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="25" height="12.5">
              <path
                d="M 0 6.25 Q 6.25 0, 12.5 6.25 Q 18.75 12.5, 25 6.25"
                fill="transparent"
                stroke="currentColor"
                stroke-width="2"
              />
            </svg>
            {tone.frequency} - {tone.waveName}
          </span>
          <span
            class="text-xs bg-gray-700 text-gray-300 rounded-full px-2 py-1 mt-2"
            >{tone.baseFrequency} Base</span
          >
        </div>
        <div class="card-actions">
          <h5 class="text-xl font-bold mb-2">{tone.title}</h5>
          <p class="text-sm text-gray-400">{tone.subtitle}</p>
        </div>
        {#if currentTone === tone}
          <div
            class="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
          </div>
        {/if}
      </div>
    </div>
  {/each}
</div>
