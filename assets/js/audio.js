/* ─────────────────────────────────────────────
   audio.js — Web Audio API로 BGM을 직접 합성한다.
   음원 파일이 없어도 되고 용량도 0이라 링크만으로 동작한다.
   (브라우저 정책상 사용자가 화면을 한 번 터치한 뒤에 시작해야 소리가 난다)
   ───────────────────────────────────────────── */
(function (g) {
  'use strict';

  const mid = n => 440 * Math.pow(2, (n - 69) / 12);

  // n:음정(MIDI) t:시작박 d:길이박 v:세기
  const TUNES = {
    orgel: {
      bpm: 84, loop: 16, wave: 'triangle', decay: 1.5, gain: .22, sparkle: true,
      notes: [
        [76,0,1],[72,1,1],[74,2,1],[79,3,1],[77,4,1.5],[72,5.5,.5],[74,6,2],
        [72,8,1],[69,9,1],[71,10,1],[76,11,1],[74,12,1.5],[69,13.5,.5],[67,14,2],
        [60,0,4,.5],[64,4,4,.5],[57,8,4,.5],[62,12,4,.5]
      ]
    },
    fanfare: {
      bpm: 128, loop: 8, wave: 'square', decay: .5, gain: .13, sparkle: true,
      notes: [
        [72,0,.5],[76,.5,.5],[79,1,.5],[84,1.5,1],[79,2.5,.5],[84,3,1.5],
        [74,4.5,.5],[77,5,.5],[81,5.5,.5],[86,6,2],
        [48,0,1,.6],[55,1,1,.4],[48,2,1,.6],[55,3,1,.4],
        [50,4,1,.6],[57,5,1,.4],[50,6,2,.6]
      ]
    },
    wave: {
      bpm: 60, loop: 16, wave: 'sine', decay: 3.2, gain: .3, sparkle: false,
      notes: [
        [60,0,4,.7],[64,0,4,.5],[67,0,4,.4],
        [59,4,4,.7],[62,4,4,.5],[67,4,4,.4],
        [57,8,4,.7],[60,8,4,.5],[64,8,4,.4],
        [62,12,4,.7],[65,12,4,.5],[69,12,4,.4]
      ]
    },
    twinkle: {
      bpm: 96, loop: 8, wave: 'sine', decay: 1.1, gain: .2, sparkle: true,
      notes: [
        [84,0,.5],[88,.75,.5],[91,1.5,.5],[86,2.25,.5],[89,3,1],
        [84,4,.5],[91,4.75,.5],[96,5.5,.5],[89,6.25,.5],[86,7,1],
        [60,0,2,.35],[62,2,2,.35],[64,4,2,.35],[59,6,2,.35]
      ]
    }
  };

  let ctx = null, master = null, timer = null, current = null, started = 0;

  function build() {
    if (ctx) return;
    const AC = g.AudioContext || g.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();

    master = ctx.createGain();
    master.gain.value = 0;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 4800;

    // 아주 옅은 공간감 (딜레이 피드백)
    const delay = ctx.createDelay(1);
    delay.delayTime.value = .28;
    const fb = ctx.createGain(); fb.gain.value = .26;
    const wet = ctx.createGain(); wet.gain.value = .3;

    master.connect(filter);
    filter.connect(ctx.destination);
    filter.connect(delay); delay.connect(fb); fb.connect(delay);
    delay.connect(wet); wet.connect(ctx.destination);
  }

  function voice(tune, note, at) {
    const [n, , dur, vel = 1] = note;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = tune.wave;
    osc.frequency.value = mid(n);

    const spb = 60 / tune.bpm;
    const len = Math.min(dur * spb, tune.decay);
    const peak = 0.28 * vel;

    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(peak, at + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + len + 0.35);

    osc.connect(gain); gain.connect(master);
    osc.start(at);
    osc.stop(at + len + 0.45);
  }

  function schedule() {
    const tune = TUNES[current];
    if (!tune) return;
    const spb = 60 / tune.bpm, loopSec = tune.loop * spb;
    const ahead = ctx.currentTime + 1.5;
    while (started < ahead) {
      for (const note of tune.notes) voice(tune, note, started + note[1] * spb);
      started += loopSec;
    }
  }

  /** BGM 시작 — 반드시 사용자 제스처(탭) 안에서 호출할 것 */
  function play(id) {
    if (!id || id === 'none' || !TUNES[id]) return false;
    build();
    if (!ctx) return false;
    if (ctx.state === 'suspended') ctx.resume();

    current = id;
    started = ctx.currentTime + 0.08;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setValueAtTime(0.0001, ctx.currentTime);
    master.gain.exponentialRampToValueAtTime(TUNES[id].gain, ctx.currentTime + 1.6);

    schedule();
    clearInterval(timer);
    timer = setInterval(schedule, 500);
    return true;
  }

  function stop() {
    clearInterval(timer); timer = null;
    if (!ctx || !master) return;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setValueAtTime(master.gain.value || 0.0001, ctx.currentTime);
    master.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + .5);
    current = null;
  }

  const playing = () => !!current;

  /** 인터랙션 효과음 (짧은 반짝임) */
  function blip(kind) {
    build();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();
    const seq = kind === 'pop' ? [72, 79, 84] : kind === 'down' ? [72, 65] : [79, 84, 88];
    const t0 = ctx.currentTime;
    seq.forEach((n, i) => {
      const osc = ctx.createOscillator(), gn = ctx.createGain();
      osc.type = kind === 'pop' ? 'square' : 'sine';
      osc.frequency.value = mid(n);
      const at = t0 + i * 0.07;
      gn.gain.setValueAtTime(0.0001, at);
      gn.gain.exponentialRampToValueAtTime(.12, at + .01);
      gn.gain.exponentialRampToValueAtTime(0.0001, at + .28);
      osc.connect(gn); gn.connect(ctx.destination);
      osc.start(at); osc.stop(at + .3);
    });
  }

  g.BGM = { play, stop, playing, blip, has: id => !!TUNES[id] };
})(window);
