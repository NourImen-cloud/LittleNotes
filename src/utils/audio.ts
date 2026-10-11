// Web Audio API ambient sound generator and chime for cozy café study sessions

let audioCtx: AudioContext | null = null;
let rainNode: AudioNode | null = null;
let rainGain: GainNode | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playGentleChime() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // Play warm dual bell chime (E5 and B5)
    [659.25, 987.77].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);
      
      gain.gain.setValueAtTime(0.2, now + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 1.8);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 2);
    });
  } catch (err) {
    console.error('Audio chime error:', err);
  }
}

export function startAmbientRain(volume = 0.15) {
  try {
    const ctx = getAudioContext();
    if (rainNode) stopAmbientRain();

    // Generate cozy pink noise rain
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
      b6 = white * 0.115926;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Filter to make it sound like gentle rain outside a café window
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, ctx.currentTime);

    rainGain = ctx.createGain();
    rainGain.gain.setValueAtTime(volume, ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(rainGain);
    rainGain.connect(ctx.destination);

    whiteNoise.start(0);
    rainNode = whiteNoise;
  } catch (err) {
    console.error('Ambient audio error:', err);
  }
}

export function stopAmbientRain() {
  try {
    if (rainNode) {
      (rainNode as AudioBufferSourceNode).stop();
      rainNode.disconnect();
      rainNode = null;
    }
  } catch (err) {
    console.error('Stop audio error:', err);
  }
}
