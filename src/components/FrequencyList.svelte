<script lang="js">
  import Theme from '../stores/ThemeStore';

  import { onMount } from 'svelte';
  let theme;

  Theme.subscribe((dataFromStore) => {
    theme = dataFromStore;
  });

  let container;
  let canvas;
  let canvasContext;

  // let amplitude = 250; // Height of the wave
  // let maxAmplitude = 500; // Height of the wave
  let amplitude;
  let maxAmplitude;
  let frequency = 32; // 1 Hz
  let phase = 0;
  let animationFrameId;

  let gainNodeBinaural;
  let audioContext;
  let gainNodeLeft;
  let gainNodeRight;

  const output = {
    left: null,
    right: null
  };
  let baseFrequency = 512;
  const frequencySteps = [512, 256, 128, 64, 32];
  let volume = 0.5;
  let currentHz = null;
  let isPlaying = false;
  let isMuted = false;

  let binauralFrequencies = [
    { hz: 1, state: 'Delta', description: 'Lethargic' },
    { hz: 2, state: 'Delta', description: 'Deep Sleep' },
    { hz: 3, state: 'Delta', description: 'Dreamless' },
    { hz: 4, state: 'Theta', description: 'Drowsy' },
    { hz: 6, state: 'Theta', description: 'Fantasy' },
    { hz: 8, state: 'Alpha', description: 'Relaxed' },
    { hz: 12, state: 'Alpha', description: 'Conscious' },
    { hz: 16, state: 'Beta', description: 'Focused' },
    { hz: 24, state: 'Beta', description: 'Active' },
    { hz: 32, state: 'Gamma', description: 'Alert' }
  ];

  const drawLine = () => {
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);

    canvasContext.beginPath();
    canvasContext.moveTo(0, canvas.height / 4);
    canvasContext.lineTo(canvas.width, canvas.height / 4);
    canvasContext.strokeStyle = theme.primary;
    canvasContext.lineWidth = 4;
    canvasContext.stroke();
  };

  $: isMuted = volume === 0;

  $: if (gainNodeLeft) {
    gainNodeLeft.gain.value = volume;
    gainNodeLeft.gain.value = isMuted ? 0 : volume;
  }

  $: if (gainNodeRight) {
    gainNodeRight.gain.value = volume;
    gainNodeRight.gain.value = isMuted ? 0 : volume;
  }

  $: amplitude = volume * maxAmplitude;

  $: frequency = currentHz;

  onMount(() => {
    amplitude = container.offsetHeight / 2;
    maxAmplitude = container.offsetHeight;

    canvasContext = canvas.getContext('2d');

    const dpi = window.devicePixelRatio || 1;
    canvas.style.width = container.offsetWidth + 'px';
    canvas.style.height = container.offsetHeight + 'px';
    canvas.width = container.offsetWidth * dpi;
    canvas.height = container.offsetHeight * dpi;
    canvasContext.scale(dpi, dpi);

    drawLine();
  });

  const draw = (time) => {
    // Clear the canvas
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);

    // Update the phase to animate the wave
    // time is provided /by requestAnimationFrame and is in milliseconds
    // Convert time from ms to seconds, and multiply by 2π for a full cycle
    phase = (time / 1000) * 2 * Math.PI * frequency;

    // Draw the sine wave
    canvasContext.beginPath();
    for (let x = 0; x < canvas.width; x++) {
      let y =
        canvas.height / 4 +
        amplitude *
          Math.sin((2 * Math.PI * frequency * x) / canvas.width - phase);
      canvasContext[x === 0 ? 'moveTo' : 'lineTo'](x, y);
    }
    canvasContext.strokeStyle = theme.primary;
    canvasContext.lineWidth = 4;
    canvasContext.stroke();

    // Request next frame
    animationFrameId = requestAnimationFrame(draw);
  };

  const stopAnimation = () => {
    cancelAnimationFrame(animationFrameId);
    drawLine();
  };

  const playAnimation = () => requestAnimationFrame(draw);

  const playBeat = (/** @type {number} */ hz) => {
    stopAnimation();

    currentHz = hz;
    audioContext?.close();
    // @ts-ignore
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    gainNodeLeft = audioContext.createGain();
    gainNodeRight = audioContext.createGain();
    gainNodeBinaural = audioContext.createGain();

    if (!audioContext) {
      console.error('Web Audio API is not supported in this browser');
      return;
    }

    output.left = audioContext.createOscillator();
    output.right = audioContext.createOscillator();

    output.left.type = 'sine';
    output.right.type = 'sine';

    output.left.frequency.value = baseFrequency;
    output.right.frequency.value = baseFrequency + hz; // Create the binaural effect

    // Create a stereo panner for left and right channels
    const pannerLeft = new StereoPannerNode(audioContext, { pan: -1 });
    const pannerRight = new StereoPannerNode(audioContext, { pan: 1 });

    // Connect the left oscillator to the left channel and to the GainNode
    output.left
      .connect(pannerLeft)
      .connect(gainNodeLeft)
      .connect(audioContext.destination);

    // Connect the right oscillator to the right channel and to the GainNode
    output.right
      .connect(pannerRight)
      .connect(gainNodeRight)
      .connect(audioContext.destination);

    gainNodeLeft.gain.value = volume;
    gainNodeRight.gain.value = volume;

    output.left.start();
    output.right.start();
    playAnimation();

    isPlaying = true;
  };

  const adjustStep = () => {
    const closestStep = frequencySteps.reduce((prev, curr) =>
      Math.abs(curr - baseFrequency) < Math.abs(prev - baseFrequency)
        ? curr
        : prev
    );
    baseFrequency = closestStep;
    if (output.left && output.right) {
      output.left.frequency.value = baseFrequency;
      output.right.frequency.value = baseFrequency + currentHz;
    }
  };

  const stopBeat = () => {
    if (!output.left || !output.right) return;
    output.left.stop();
    output.right.stop();
    isPlaying = false;
    stopAnimation();
  };
</script>

<div bind:this={container}>
  <canvas bind:this={canvas} />
</div>

<div class="flex flex-wrap justify-center md:justify-between mb-10">
  <div class="flex flex-col gap-6">
    <div class="card w-96 h-fit bg-neutral text-neutral-content">
      <div class="card-body">
        <h2 class="card-title flex justify-between">
          <div class="flex gap-1 items-end">
            Base Frequency
            <div
              class="tooltip tooltip-info cursor-pointer"
              data-tip="Foundational tone or frequency that is chosen for one ear, upon which the second tone (for the other ear) is based to create the desired binaural beat effect. "
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                class="stroke-current shrink-0 w-6 h-6"
                ><path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path></svg
              >
            </div>
          </div>
          <span class="font-mono text-base self-end text-secondary">
            {baseFrequency}Hz
          </span>
        </h2>
        <input
          type="range"
          class="range range-accent range-sm w-full"
          min="32"
          max="512"
          bind:value={baseFrequency}
          on:change={adjustStep}
        />
        <div class="w-full flex text-xs px-2">
          <span>|</span>
          <span class="ml-[6%]">|</span>
          <span class="ml-[12%]">|</span>
          <span class="ml-[25.4%]">|</span>
          <span class="ml-[51.6%]">|</span>
        </div>
      </div>
    </div>
    <div class="card w-96 h-fit bg-neutral text-neutral-content">
      <div class="card-body">
        <h2 class="card-title flex justify-between">
          Volume
          <label class="swap">
            <input type="checkbox" checked={!isMuted} />
            <svg
              class="swap-on fill-secondary"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              ><path
                d="M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.84 14,18.7V20.77C18,19.86 21,16.28 21,12C21,7.72 18,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16C15.5,15.29 16.5,13.76 16.5,12M3,9V15H7L12,20V4L7,9H3Z"
              /></svg
            >
            <svg
              class="swap-off fill-current"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              ><path
                d="M3,9H7L12,4V20L7,15H3V9M16.59,12L14,9.41L15.41,8L18,10.59L20.59,8L22,9.41L19.41,12L22,14.59L20.59,16L18,13.41L15.41,16L14,14.59L16.59,12Z"
              /></svg
            >
          </label>
        </h2>
        <input
          type="range"
          class="range range-accent w-80"
          bind:value={volume}
          min={0.0}
          max={1.0}
          step={0.01}
        />
      </div>
    </div>
  </div>
  <div class="join join-vertical mt-10 md:mt-0">
    {#each binauralFrequencies as { hz, state, description }}
      <button
        class="btn btn-primary btn-outline btn-sm join-item"
        class:btn-active={currentHz === hz && isPlaying}
        on:click={() => playBeat(hz)}
      >
        {hz} Hz - {state} - {description}
      </button>
    {/each}
    <button
      class="btn btn-error btn-outline btn-sm join-item"
      on:click={stopBeat}>Stop</button
    >
  </div>
</div>
