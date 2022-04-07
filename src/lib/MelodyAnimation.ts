import { HSLToHex } from "./Colors";
import { CanvasForm, Rectangle, Sound } from "pts";
import type { CanvasSpace } from "./CanvasSpace";
import type { Midi } from "./Midi";

function getOctaveAndPitchFromMidi(midiNumber: number): {
  octave: number;
  pitch: number;
} {
  return {
    octave: Math.floor(midiNumber / 12),
    pitch: midiNumber % 12,
  };
}

function hslFor({
  octave,
  pitch,
  active,
}: {
  octave: number;
  pitch: number;
  active: boolean;
}): { hue: number; saturation: number; lightness: number } {
  const hue = (240 + pitch * 30) % 360;
  const saturation = 92 - octave * 5;
  let lightness = (active ? 60 : 35) + octave * 3;
  return { hue, saturation, lightness };
}

function hexFor(args: {
  octave: number;
  pitch: number;
  active: boolean;
}): string {
  const { hue, saturation, lightness } = hslFor(args);
  return HSLToHex({ hue, saturation, lightness });
}

function pitchNumberFor({ midiNumber }: { midiNumber: number }): number {
  return midiNumber % 12;
}

export function animateMelody(
  midi: Midi,
  space: CanvasSpace,
  audio: HTMLAudioElement,
  intervalSeconds: number
) {
  // we add 1 to the low and high end of the range to make the visualization
  // look nicer
  const lowestNote = midi.lowestMidi - 1;
  const noteRange = midi.highestMidi - lowestNote + 2;

  const halfIntervalSeconds = intervalSeconds / 2;

  const form = space.getForm();

  animateNotesBackground(space, form, noteRange);

  // animate the actual notes
  space.add((time = 0, ftime) => {
    const currTimeSeconds = time / 1000;

    let notes = midi.notesInRange([
      currTimeSeconds - halfIntervalSeconds,
      currTimeSeconds + halfIntervalSeconds,
    ]);

    notes.forEach((note) => {
      const widthPerSecond = space.width / intervalSeconds;
      const width = widthPerSecond * note.duration;
      const height = space.height / noteRange;

      let x =
        space.center.x +
        (note.time - currTimeSeconds) * widthPerSecond +
        width / 2;

      let y = height * (noteRange - (note.midi - lowestNote + 0.5));

      let active =
        note.time <= currTimeSeconds &&
        note.time + note.duration >= currTimeSeconds;

      const color = hexFor({
        octave: note.octave,
        pitch: pitchNumberFor({ midiNumber: note.midi }),
        active,
      });

      let rect = Rectangle.fromCenter([x, y], width, height);
      form.fillOnly(color).rect(rect);
      // form.text(rect.p1, `${note.midi}`);
    });
  });

  animateFrequencies(space, form, audio, noteRange, lowestNote);

  space.bindMouse().bindTouch();
}

function animateNotesBackground(
  space: CanvasSpace,
  form: CanvasForm,
  noteRange: number
) {
  space.add((time, ftime) => {
    const height = space.height / noteRange;

    for (let i = 0; i < noteRange; i++) {
      let x = space.center.x;
      let y = height * (i + 0.5);

      let bar = Rectangle.fromCenter([x, y], space.width, height);

      if (i % 2 === 0) {
        form.fill("#292c42").rect(bar);
      } else {
        form.fill("#23283e").rect(bar);
      }
    }

    let centerLine = Rectangle.fromCenter(space.center, 1, space.height);
    form.fill("#eee").rect(centerLine);
  });
}

function animateFrequencies(
  space: CanvasSpace,
  form: CanvasForm,
  audio: HTMLAudioElement,
  noteRange: number,
  lowestNote: number
) {
  // since the frequency difference between notes with low pitch is small, we need to use a larger
  // bin size for the FFT if there are low notes (here we consider any note below 36 as low)
  const bins = lowestNote < 36 ? 16384 : 8192;
  const audioCtx = new (window.AudioContext ||
    (window as any).webkitAudioContext)();

  const source = audioCtx.createMediaElementSource(audio);
  const sound = Sound.from(source, audioCtx, "input").analyze(bins);

  sound.connect(audioCtx.destination);

  space.add((time, ftime) => {
    const maxX = space.width * 0.3;

    const gradient = space.ctx.createLinearGradient(0, 0, maxX * 2, 0);
    gradient.addColorStop(0, "rgba(39, 41, 53, 1)");
    gradient.addColorStop(0.33, "rgba(39, 41, 53, 1)");
    gradient.addColorStop(0.8, "rgba(30, 40, 30, 0)");

    const sideBar = Rectangle.fromTopLeft([0, 0], maxX * 2.5, space.height);
    form.fill(gradient).rect(sideBar);

    const height = space.height / noteRange;

    if (sound.playable) {
      // first split the FFT results into bins based on the midi numbers that each
      // frequency bin map to. multiple FFT bin can map to the same midi bin, so we
      // use reduce to aggregate the duplicates.
      let midiBins = sound
        .freqDomainTo([space.height, maxX])
        .reduce((accum, t, i) => {
          const hz = (i * sound.sampleRate) / (sound.binSize * 2); // bin size is fftSize/2
          let midi = Math.floor(12 * Math.log2(hz / 440) + 69);
          midi = Math.max(midi, 0);

          let prev = accum.at(-1);
          if (prev && prev.midiNumber == midi) {
            let maxAmplitude = Math.max(t.y, prev.maxAmplitude);
            let totalAmplitude = t.y + prev.totalAmplitude;
            accum[accum.length - 1] = {
              midiNumber: midi,
              maxAmplitude,
              totalAmplitude,
              count: prev.count + 1,
            };

            return accum;
          }

          accum.push({
            midiNumber: midi,
            maxAmplitude: t.y,
            totalAmplitude: t.y,
            count: 1,
          });
          return accum;
        }, [] as { midiNumber: number; maxAmplitude: number; totalAmplitude: number; count: number }[]);

      for (let i = 0; i < midiBins.length; i++) {
        const { midiNumber, maxAmplitude, totalAmplitude, count } = midiBins[i];
        const avgAmplitude = totalAmplitude / count;
        // we display the halfway point between the average amplitude and max amplitude
        // this gives more consistent looking audio wave while at the same time still
        // highlighting peaks in a few frequency bins.
        const amplitude = (avgAmplitude + maxAmplitude) / 2;

        if (midiNumber < lowestNote || midiNumber > lowestNote + noteRange) {
          continue;
        }

        const { octave, pitch } = getOctaveAndPitchFromMidi(midiNumber);
        const { hue } = hslFor({ octave, pitch, active: false });
        const color = HSLToHex({ hue, saturation: 45, lightness: 95 });

        const y = height * (noteRange - (midiNumber - lowestNote + 1));
        const rect = Rectangle.fromTopLeft(
          [0, y + height * 0.1],
          amplitude,
          height * 0.8
        );
        form.fillOnly(color).rect(rect);
        // form.text(rect.p2, ` midi: ${midiNumber}`);
      }
    }
  });

  return {
    toggleSound() {
      sound.toggle();
    },
  };
}
