import type { Midi as MidiInfo } from "@tonejs/midi";
import IntervalTree, { NumericTuple } from "@flatten-js/interval-tree";
import type { Note } from "@tonejs/midi/dist/Note";

export class Midi {
  private intervalTree = new IntervalTree<Note>();

  private _lowestOctave: number;
  private _highestOctave: number;

  private _lowestMidi: number;
  private _highestMidi: number;

  constructor(public info: MidiInfo) {
    info.header.update();

    this._lowestOctave = 9;
    this._highestOctave = 0;

    this._lowestMidi = 127;
    this._highestMidi = 0;

    info.tracks.forEach((track) => {
      track.notes.forEach((note) => {
        const interval: NumericTuple = [note.time, note.time + note.duration];
        this.intervalTree.insert(interval, note);

        this._lowestOctave = Math.min(this._lowestOctave, note.octave);
        this._highestOctave = Math.max(this._highestOctave, note.octave);

        this._lowestMidi = Math.min(this._lowestMidi, note.midi);
        this._highestMidi = Math.max(this._highestMidi, note.midi);
      });
    });
  }

  get lowestOctave() {
    return this._lowestOctave;
  }

  get highestOctave() {
    return this._highestOctave;
  }

  get lowestMidi() {
    return this._lowestMidi;
  }

  get highestMidi() {
    return this._highestMidi;
  }

  get duration() {
    return this.info.duration;
  }

  get ticksPerQuarter() {
    return this.info.header.ppq;
  }

  get tempos() {
    return this.info.header.tempos;
  }

  notesInRange(range: NumericTuple): Note[] {
    return this.intervalTree.search(
      range,
      (value, interval) => value
    ) as Note[];
  }
}
