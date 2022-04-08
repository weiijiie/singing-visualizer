import OpusMediaRecorder from "opus-media-recorder";
import OpusWorker from "opus-media-recorder/encoderWorker.umd.js?worker";
import OggOpusWasmURL from "opus-media-recorder/OggOpusEncoder.wasm?url";
import WebMOpusWasmURL from "opus-media-recorder/WebMOpusEncoder.wasm?url";
import { Readable, Writable, writable } from "svelte/store";

export function useAudioRecorder(stream: MediaStream): {
  recorder: Writable<MediaRecorder>;
  chunks: Readable<Blob[]>;
  start: () => void;
  stop: () => void;
  reset: () => void;
} {
  const mediaRecorder = new OpusMediaRecorder(
    stream,
    {
      mimeType: "audio/ogg",
    },
    {
      encoderWorkerFactory: () => new OpusWorker(),
      OggOpusEncoderWasmPath: OggOpusWasmURL,
      WebMOpusEncoderWasmPath: WebMOpusWasmURL,
    }
  );

  const chunks = writable([] as Blob[]);

  mediaRecorder.ondataavailable = (e) => {
    chunks.update((val) => {
      val.push(e.data);
      return val;
    });
  };

  const mediaRecorderStore = writable(mediaRecorder);

  return {
    recorder: mediaRecorderStore,
    chunks,
    start() {
      mediaRecorderStore.update((recorder) => {
        recorder.start();
        return recorder;
      });
    },
    stop() {
      mediaRecorderStore.update((recorder) => {
        recorder.stop();
        return recorder;
      });
    },
    reset() {
      chunks.set([]);
    },
  };
}
