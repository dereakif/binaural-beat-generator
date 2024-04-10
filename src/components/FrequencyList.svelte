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
  let dpi;

  const amplitudeMargin = 40;
  let amplitude;
  let maxAmplitude;
  let phase = 0;
  let animationFrameId;

  let audioContext;
  let gainNodeLeft;
  let gainNodeRight;
  let gainNodeMono;

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
  let showPulse = localStorage.getItem('showPulse') === 'true' || true;
  let showMarkers = localStorage.getItem('showMarkers') === 'true' || true;

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
    canvasContext.moveTo(0, canvas.height / (2 * dpi));
    canvasContext.lineTo(canvas.width, canvas.height / (2 * dpi));
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

  $: {
    localStorage.setItem('showPulse', `${showPulse}`);
    localStorage.setItem('showMarkers', `${showMarkers}`);
  }

  onMount(() => {
    canvasContext = canvas.getContext('2d');

    dpi = window.devicePixelRatio || 1;
    canvas.style.width = container.offsetWidth + 'px';
    canvas.style.height = container.offsetHeight + 'px';
    canvas.width = container.offsetWidth * dpi;
    canvas.height = container.offsetHeight * dpi;
    canvasContext.scale(dpi, dpi);
    maxAmplitude = (container.offsetHeight * dpi - amplitudeMargin) / (2 * dpi);
    amplitude = (maxAmplitude * dpi) / (2 * dpi);

    drawLine();
  });

  const draw = (time) => {
    // Clear the canvas
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);

    // Update the phase to animate the wave
    // time is provided /by requestAnimationFrame and is in milliseconds
    // Convert time from ms to seconds, and multiply by 2π for a full cycle
    phase = (time / 1000) * 2 * Math.PI * currentHz;

    // Draw the sine wave
    canvasContext.beginPath();
    for (let x = 0; x < canvas.width; x++) {
      let y =
        canvas.height / (2 * dpi) +
        amplitude *
          Math.sin((2 * Math.PI * currentHz * x) / canvas.width - phase);
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
    gainNodeMono = audioContext.createGain();

    if (!audioContext) {
      console.error('Web Audio API is not supported in this browser');
      return;
    }

    const supportsStereoPanner = 'StereoPannerNode' in window;

    output.left = audioContext.createOscillator();
    output.right = audioContext.createOscillator();

    output.left.type = 'sine';
    output.right.type = 'sine';

    output.left.frequency.value = baseFrequency;
    output.right.frequency.value = baseFrequency + hz; // Create the binaural effect

    if (supportsStereoPanner) {
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
    } else {
      // Mono output or fallback
      const merger = audioContext.createChannelMerger(2); // Merge two channels into one

      output.left.connect(gainNodeLeft).connect(merger, 0, 0); // Connect the left channel to the first input of the merger
      output.right.connect(gainNodeRight).connect(merger, 0, 0); // Connect the right channel to the same input of the merger

      merger.connect(gainNodeMono).connect(audioContext.destination); // Connect the merger to the mono gain node, then to the destination
    }

    gainNodeLeft.gain.value = volume;
    gainNodeRight.gain.value = volume;
    gainNodeMono.gain.value = volume;

    output.left.start();
    output.right.start();
    playAnimation();

    isPlaying = true;
  };

  const adjustStep = () => {
    if (showMarkers) {
      const closestStep = frequencySteps.reduce((prev, curr) =>
        Math.abs(curr - baseFrequency) < Math.abs(prev - baseFrequency)
          ? curr
          : prev
      );
      baseFrequency = closestStep;
    }
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

<div class={`mt-10 ${!showPulse ? 'hidden' : ''}`} bind:this={container}>
  <canvas bind:this={canvas} />
</div>

<div
  class="mt-10 flex flex-col lg:flex-row justify-center lg:justify-between items-center gap-6"
>
  <div class="card w-full max-w-96 h-fit bg-neutral text-neutral-content">
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
        class="range range-accent range-sm"
        min="32"
        max="512"
        bind:value={baseFrequency}
        on:input={adjustStep}
      />
      <div class="w-full flex text-xs px-2 {!showMarkers ? 'invisible' : ''}">
        <span>|</span>
        <span class="ml-[6%]">|</span>
        <span class="ml-[12%]">|</span>
        <span class="ml-[25.4%]">|</span>
        <span class="ml-[51.6%]">|</span>
      </div>
    </div>
  </div>
  <div class="card w-full max-w-96 h-36 bg-neutral text-neutral-content">
    <div class="card-body flex flex-row items-center justify-between">
      <button on:click={stopBeat} class="btn btn-circle hover:scale-105">
        <svg
          class="fill-secondary cursor-pointer hover:fill-secondary"
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
            bind:checked={showPulse}
            class="toggle toggle-xs toggle-secondary"
          />
        </label>
        <label class="cursor-pointer label gap-2">
          <span class="label-text">Show markers</span>
          <input
            type="checkbox"
            bind:checked={showMarkers}
            class="toggle toggle-xs toggle-secondary"
          />
        </label>
      </div>
    </div>
  </div>
  <div class="card w-full max-w-96 h-fit bg-neutral text-neutral-content">
    <div class="card-body">
      <h2 class="card-title flex justify-between">
        <div class="flex gap-1 items-end">
          Volume
          <div
            class="tooltip tooltip-info cursor-pointer"
            data-tip="You can adjust amplitude of the sound wave by changing the volume."
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
        class="range range-accent range-sm mb-6"
        bind:value={volume}
        min={0.0}
        max={1.0}
        step={0.01}
      />
    </div>
  </div>
</div>
<div
  class="my-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 grid-flow-row gap-4"
>
  {#each binauralFrequencies as { hz, state, description }}
    <button
      class="btn btn-primary btn-outline join-item"
      class:btn-active={currentHz === hz && isPlaying}
      on:click={() => playBeat(hz)}
    >
      <div class="flex flex-col px-4 gap-1">
        <span>
          {hz} Hz - {state}
        </span>
        <span>{description}</span>
      </div>
    </button>
  {/each}
</div>
