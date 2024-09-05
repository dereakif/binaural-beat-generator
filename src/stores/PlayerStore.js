import { writable } from 'svelte/store';

function createPlayerStore() {
  const { subscribe, set, update } = writable({
    isPlaying: false,
    currentHz: 1,
    volume: 0.5,
    isMuted: false,
    baseFrequency: 512,
    showPulse: true,
    audioContext: null,
    gainNodeLeft: null,
    gainNodeRight: null,
    gainNodeMono: null,
    output: { left: null, right: null }
  });

  const stopBeat = () => {
    update((s) => {
      s.output?.left?.stop();
      s.output?.right?.stop();
      return { ...s, isPlaying: false, output: { left: null, right: null } };
    });
  };

  return {
    subscribe,
    set,
    setVolume: (volume) =>
      update((s) => {
        if (s.gainNodeLeft && s.gainNodeLeft.gain) {
          s.gainNodeLeft.gain.value = volume;
        }

        if (s.gainNodeRight && s.gainNodeRight.gain) {
          s.gainNodeRight.gain.value = volume;
        }

        return {
          ...s,
          isMuted: volume === 0
        };
      }),
    setBaseFrequency: (freq) =>
      update((s) => {
        if (s.output.left && s.output.right) {
          s.output.left.frequency.value = freq;
          s.output.right.frequency.value = freq + s.currentHz;
        }
        return s;
      }),
    initAudioContext: (audioContext) => {
      update((s) => {
        if (s.audioContext) {
          s.audioContext.close();
        }
        return { ...s, audioContext };
      });
    },
    playBeat: (hz) => {
      stopBeat();
      update((s) => {
        const audioContext = new window.AudioContext();
        const gainNodeLeft = audioContext.createGain();
        const gainNodeRight = audioContext.createGain();
        const gainNodeMono = audioContext.createGain();

        const outputLeft = audioContext.createOscillator();
        const outputRight = audioContext.createOscillator();

        outputLeft.type = 'sine';
        outputRight.type = 'sine';

        console.log('hz', hz, s.currentHz);
        outputLeft.frequency.value = s.baseFrequency;
        outputRight.frequency.value = s.baseFrequency + (hz || s.currentHz);

        if ('StereoPannerNode' in window) {
          const pannerLeft = new StereoPannerNode(audioContext, { pan: -1 });
          const pannerRight = new StereoPannerNode(audioContext, { pan: 1 });

          outputLeft
            .connect(pannerLeft)
            .connect(gainNodeLeft)
            .connect(audioContext.destination);
          outputRight
            .connect(pannerRight)
            .connect(gainNodeRight)
            .connect(audioContext.destination);

          gainNodeLeft.gain.value = s.volume;
          gainNodeRight.gain.value = s.volume;
        } else {
          const merger = audioContext.createChannelMerger(2);
          outputLeft.connect(gainNodeLeft).connect(merger, 0, 0);
          outputRight.connect(gainNodeRight).connect(merger, 0, 0);
          merger.connect(gainNodeMono).connect(audioContext.destination);
          gainNodeMono.gain.value = s.volume;
        }
        outputLeft.start();
        outputRight.start();

        return {
          ...s,
          isPlaying: true,
          currentHz: hz,
          audioContext,
          gainNodeLeft,
          gainNodeRight,
          gainNodeMono,
          output: { left: outputLeft, right: outputRight }
        };
      });
    },
    stopBeat
  };
}

export const PlayerStore = createPlayerStore();
