import { get, writable, Readable } from "svelte/store";

export type RenderLoopCallback = (time: number, frameTime: number) => void;

export class RenderControls {
  private loopFn: RenderLoopCallback;
  private animationID: number | undefined;

  private _prevTime: number | undefined = undefined;
  private _elapsedTime = writable(0);

  private _paused = false;

  constructor(loopFn: RenderLoopCallback) {
    this.loopFn = loopFn;
  }

  get paused(): boolean {
    return this._paused;
  }

  get elapsedTime(): Readable<number> {
    return this._elapsedTime;
  }

  get playing(): boolean {
    return this.animationID !== undefined;
  }

  start({ time = 0 }: { time?: number } = {}) {
    if (this.animationID) {
      return;
    }
    this._elapsedTime.set(time);
    this._prevTime = undefined;
    this.tick();
    this.animationID = requestAnimationFrame(this.loop.bind(this));
  }

  playAt({ time }: { time: number }) {
    this._elapsedTime.set(time);
    this._prevTime = undefined;
    this.tick();
    this.start({ time });
  }

  pause(toggle: boolean = false) {
    this._paused = toggle ? !this._paused : true;
  }

  resume() {
    this._paused = false;
  }

  stop() {
    if (!this.animationID) {
      return;
    }
    cancelAnimationFrame(this.animationID);
    this.animationID = undefined;
  }

  restart() {
    this.stop();
    this.start();
  }

  private tick() {
    this.loopFn(get(this.elapsedTime), 1);
  }

  private loop(time: number): void {
    if (!this._prevTime) {
      this._prevTime = time;
    }

    const timeDiff = time - this._prevTime;

    if (!this._paused) {
      this._elapsedTime.update((val) => (val += timeDiff));
      this.loopFn(get(this._elapsedTime), timeDiff);
    }

    this._prevTime = time;
    this.animationID = requestAnimationFrame(this.loop.bind(this));
  }
}
