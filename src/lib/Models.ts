import { Midi as MidiInfo } from "@tonejs/midi";
import { Midi } from "./Midi";

export type VisualizationInput = {
  midi: Midi;
  lyrics: Lyrics;
  audioURL: string;
};

export type AudioProcessingResponse = {
  melody: Melody;
  lyrics: Lyrics;
};

export type Melody = number[][];

export type Lyrics = LyricItem[];

export type LyricItem = {
  start: number;
  end: number;
  text: string;
};

export function midiFromMelody(melody: Melody): Midi {
  const midiInfo = new MidiInfo();
  const track = midiInfo.addTrack();

  midiInfo.header.tempos.push({
    ticks: 0,
    bpm: 120,
  });

  midiInfo.header.update();

  for (let note of melody) {
    if (note.length < 3) {
      continue;
    }

    const midiNumber = note[2];
    if ((midiNumber ?? 0) === 0) {
      continue;
    }

    track.addNote({
      midi: midiNumber,
      time: note[0],
      duration: note[1] - note[0],
    });
  }

  return new Midi(midiInfo);
}
