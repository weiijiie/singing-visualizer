<script lang="ts">
  import { AudioProcessingURL } from "../Constants";
  import {
    AudioProcessingResponse,
    midiFromMelody,
    VisualizationInput,
  } from "../Models";

  export let onAudioProcessingRequested: (
    vizInput: Promise<VisualizationInput>
  ) => void;

  async function handleFileUploaded(e: Event) {
    const target = e.target as HTMLInputElement;
    const files = target.files;
    if (!files) {
      return;
    }

    const file = files[0];
    if (!file) {
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
              `Request failed with code ${
                res.status
              }, body: ${await res.json()}`
            );
            reject(new Error(`Server error`));
          }

          let json = (await res.json()) as AudioProcessingResponse;
          console.log({ json });

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

<form class="flex flex-col items-center justify-center gap-16 p-2">
  <div class="flex flex-col items-center justify-center gap-8">
    <label for="audio" class="text-md font-semibold mb-3">
      Upload a .wav or .mp3 file of your singing
    </label>
    <h1 class="text-4xl font-bold tracking-wide">
      and watch
      <span
        class="font-extrabold text-transparent bg-clip-text bg-gradient-to-tr from-primary to-accent"
      >
        your voice
      </span>
    </h1>
    <h1
      class="text-5xl font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-br from-primary to-secondary-focus"
    >
      come to life
    </h1>
  </div>
  <input
    type="file"
    id="audio"
    name="audio"
    accept=".wav,.mp3"
    on:change={handleFileUploaded}
    class="ml-36 -mr-6 block w-full text-secondary
      file:mr-4 file:py-2 file:px-4 file:bg-secondary file:rounded-full file:border-0
      file:font-semibold file:text-secondary-content hover:file:bg-secondary-focus"
  />
</form>
