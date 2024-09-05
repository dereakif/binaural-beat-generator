<script>
  import { onMount, onDestroy } from 'svelte';
  import { PlayerStore } from '../stores/PlayerStore';
  import Theme from '../stores/ThemeStore';

  let container;
  let canvas;
  let canvasContext;

  const amplitudeMargin = 20;
  let amplitude;
  let maxAmplitude;
  let animationFrameId;

  const initCanvas = () => {
    canvasContext = canvas.getContext('2d');

    const width = Math.min(container.offsetWidth, 600);
    const height = Math.min(container.offsetHeight, 300);

    canvas.width = width;
    canvas.height = height;
    maxAmplitude = (height - amplitudeMargin) / 2;

    drawLine();
  };

  const resizeCanvas = () => {
    const width = Math.min(container.offsetWidth, 600);
    const height = Math.min(container.offsetHeight, 300);

    canvas.width = width;
    canvas.height = height;

    drawLine();
  };

  onMount(() => {
    initCanvas();
    window.addEventListener('resize', resizeCanvas);
  });
  onDestroy(() => {
    window.removeEventListener('resize', resizeCanvas);
    stopAnimation();
  });

  const drawLine = () => {
    if (!canvasContext) return;
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);

    canvasContext.beginPath();
    canvasContext.moveTo(0, canvas.height / 2);
    canvasContext.lineTo(canvas.width, canvas.height / 2);
    canvasContext.strokeStyle = $Theme.primary;
    canvasContext.lineWidth = 4;
    canvasContext.stroke();
  };

  const draw = (time) => {
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);
    let phase = (time / 1000) * 2 * Math.PI * $PlayerStore.currentHz;

    canvasContext.beginPath();
    for (let x = 0; x < canvas.width; x++) {
      let y =
        canvas.height / 2 +
        amplitude *
          Math.sin(
            (2 * Math.PI * $PlayerStore.currentHz * x) / canvas.width - phase
          );
      canvasContext[x === 0 ? 'moveTo' : 'lineTo'](x, y);
    }
    canvasContext.strokeStyle = $Theme.primary;
    canvasContext.lineWidth = 4;
    canvasContext.stroke();

    animationFrameId = requestAnimationFrame(draw);
  };

  const stopAnimation = () => {
    cancelAnimationFrame(animationFrameId);
    drawLine();
  };

  const playAnimation = () => {
    stopAnimation();
    animationFrameId = requestAnimationFrame(draw);
  };

  $: amplitude = $PlayerStore.volume * maxAmplitude;

  $: if ($PlayerStore.isPlaying) {
    playAnimation();
  } else {
    stopAnimation();
  }

  $: if (!$PlayerStore.showPulse) {
    stopAnimation();
  }

  $: if ($Theme && !$PlayerStore.isPlaying) {
    drawLine();
  }
</script>

<div
  class={`h-[300px] mt-10 ${!$PlayerStore.showPulse ? 'hidden' : ''}`}
  bind:this={container}
>
  <canvas class="mx-auto" bind:this={canvas} />
</div>