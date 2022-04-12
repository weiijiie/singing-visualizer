<script lang="ts">
  import { canRecord } from "../CanRecord";

  import { AudioProcessingURL, MaxUploadSize } from "../Constants";
  import { humanReadableFileSize } from "../HumanReadableFileSize";
  import {
    AudioProcessingResponse,
    midiFromMelody,
    VisualizationInput,
  } from "../Models";
  import AudioRecorder from "./AudioRecorder.svelte";

  export let onAudioProcessingRequested: (
    vizInput: Promise<VisualizationInput>
  ) => void;

  let uploadWidth: number;

  function handleFileUploaded(e: Event) {
    const target = e.target as HTMLInputElement;
    const files = target.files;
    if (!files) {
      return;
    }

    const file = files[0];
    if (!file) {
      return;
    }

    requestAudioProcessing(file);
  }

  function requestAudioProcessing(file: File) {
    if (file.size > MaxUploadSize) {
      const msg = `File too large, please upload a file smaller than ${humanReadableFileSize(
        MaxUploadSize
      )}`;

      onAudioProcessingRequested(Promise.reject(msg));
      return;
    }

    let formData = new FormData();
    formData.append("file", file);

    let promise: Promise<VisualizationInput> = new Promise(
      async (resolve, reject) => {
        try {
          let res = await fetch(AudioProcessingURL, {
            method: "post",
            body: formData,
          });

          if (res.status !== 200) {
            console.log(
              `Request failed with code ${res.status}, body: ${JSON.stringify(
                await res.json()
              )}`
            );
            reject(new Error(`Server error`));
          }

          let json = (await res.json()) as AudioProcessingResponse;

          resolve({
            midi: midiFromMelody(json.melody),
            lyrics: json.lyrics,
            audioURL: URL.createObjectURL(file),
          });
        } catch (error) {
          reject(error);
        }
      }
    );

    onAudioProcessingRequested(promise);
  }
</script>

<section class="w-full flex flex-col items-center justify-center gap-8">
  <h1
    class="py-1 text-4xl font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-tr from-primary to-accent"
  >
    Watch your voice
  </h1>
  <h1
    class="text-5xl font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-br from-primary to-secondary-focus"
  >
    come to life
  </h1>
  <form
    class="w-full flex flex-col md:flex-row items-center justify-center gap-7 mt-10 p-2"
  >
    <div
      class="flex flex-col items-center gap-7"
      bind:clientWidth={uploadWidth}
    >
      <label for="audio" class="text-md text-gray-200 font-semibold mb-3">
        Upload file
      </label>
      <input
        type="file"
        id="audio"
        name="audio"
        accept=".wav,.mp3,.ogg"
        on:change={handleFileUploaded}
        class="block text-secondary
               file:mx-4 file:py-2 file:px-4 file:bg-secondary file:rounded-full file:border-0
               file:font-semibold file:text-secondary-content hover:file:bg-secondary-focus"
      />
    </div>

    {#if canRecord()}
      {#await navigator.mediaDevices.getUserMedia({ audio: true }) then stream}
        <p class="text-xl font-bold text-secondary my-8">OR</p>
        <div
          class="flex items-center justify-center recorder"
          style:--recorder-width={`${uploadWidth}px`}
        >
          <div class="flex flex-col items-center gap-7">
            <AudioRecorder
              audiosStream={stream}
              onUploadRecording={(file) => {
                requestAudioProcessing(file);
              }}
            />
          </div>
        </div>
      {/await}
    {/if}
  </form>
</section>

<style>
  .recorder {
    width: var(--recorder-width);
  }
</style>
