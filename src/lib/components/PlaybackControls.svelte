<script lang="ts">
  import PauseIcon from "./PauseIcon.svelte";
  import PlayIcon from "./PlayIcon.svelte";

  let playing = false;
  let audio: HTMLAudioElement | undefined;
  let files: FileList;

  $: if (files) {
    const file = files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      audio?.setAttribute("src", url);
    }
  }

  function togglePlaying() {
    if (playing) {
      playing = false;
      audio?.pause();
    } else {
      playing = true;
      audio?.play();
    }
  }
</script>

<div class="flex flex-col border-red-500 border-2 items-center p-2 gap-4">
  <div class="flex flex-col items-center">
    <label for="audio">Upload an audio file:</label>
    <input
      type="file"
      id="audio"
      name="audio"
      accept="audio/*"
      bind:files
      class="block w-full text-secondary
        file:mr-4 file:py-2 file:px-4 file:bg-secondary file:rounded-full file:border-0
        file:font-semibold file:text-secondary-content hover:file:bg-secondary-focus"
    />
  </div>

  <div class="flex gap-2 items-center">
    <span class="text-xs text-gray-300">2:16</span>
    <input
      type="range"
      min="0"
      max="100"
      class="range range-xs range-primary min-w-[400px]"
    />
    <span class="text-xs text-gray-300">3:00</span>
  </div>

  <button class="btn btn-primary btn-circle" on:click={() => togglePlaying()}>
    {#if playing}
      <PauseIcon />
    {:else}
      <PlayIcon />
    {/if}
  </button>

  <audio bind:this={audio} preload="auto" />
</div>
