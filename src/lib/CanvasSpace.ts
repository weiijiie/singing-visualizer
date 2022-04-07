import { CanvasSpace as Space } from "pts";

export class CanvasSpace extends Space {
  playFrame(time: number, frameTime: number): void {
    this._time.diff = frameTime;
    super.playItems(time);
  }
}
