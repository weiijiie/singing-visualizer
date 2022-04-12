<script lang="ts">
  import RecordIcon from "./RecordIcon.svelte";
  import StopIcon from "./StopIcon.svelte";
  import UploadIcon from "./UploadIcon.svelte";
  import DeleteIcon from "./DeleteIcon.svelte";
  import StopWatch from "./StopWatch.svelte";
  import { useAudioRecorder } from "../UseAudioRecorder";

  export let audiosStream: MediaStream;
  export let onUploadRecording: (file: File) => void;

  const { recorder, chunks, start, stop, reset } =
    useAudioRecorder(audiosStream);

  function recordingToFile() {
    return new File($chunks, "recording.ogg");
  }
</script>

<div class="flex flex-col items-center gap-7">
  {#if $recorder.state === "recording"}
    <p class="text-md text-gray-100 font-semibold mb-3">
      <StopWatch />
    </p>
    <button
      class="btn btn-secondary btn-circle grid place-items-center"
      aria-label="Stop recording"
      on:click|preventDefault={() => stop()}
    >
      <StopIcon />
    </button>
  {:else if $chunks.length !== 0}
    <label
      for="upload-recording"
      class="text-md text-gray-100 font-semibold mb-3"
    >
      Upload recording!
    </label>
    <div class="flex gap-6">
      <button
        class="btn btn-secondary btn-circle grid place-items-center"
        aria-label="Upload recording"
        on:click|preventDefault={() => {
          onUploadRecording(recordingToFile());
        }}
      >
        <UploadIcon />
      </button>
      <button
        class="btn btn-error btn-circle grid place-items-center"
        aria-label="Discard recording"
        on:click|preventDefault={() => reset()}
      >
        <DeleteIcon />
      </button>
    </div>
  {:else}
    <p class="text-md text-gray-100 font-semibold mb-3">Record your voice</p>
    <button
      class="btn btn-secondary btn-circle grid place-items-center pt-1"
      aria-label="Record"
      on:click|preventDefault={() => start()}
    >
      <RecordIcon />
    </button>
  {/if}
</div>
