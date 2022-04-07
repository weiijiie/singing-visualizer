<script lang="ts">
  import SingingVisualizer from "./lib/components/SingingVisualizer.svelte";
  import WavUpload from "./lib/components/WavUpload.svelte";
  import type { VisualizationInput } from "./lib/Models";
  import HelpIcon from "./lib/components/HelpIcon.svelte";
  import LoadingAnimation from "./lib/components/LoadingAnimation.svelte";
  import { Midi } from "./lib/Midi";
  import { Midi as MidiInfo } from "@tonejs/midi";
  import { fade } from "svelte/transition";

  let vizInputPromise: Promise<VisualizationInput> | undefined;
</script>

<main
  data-theme="dracula"
  class="relative h-screen w-screen flex flex-col items-center p-1 mx-auto overflow-hidden"
>
  {#if vizInputPromise !== undefined}
    {#await vizInputPromise}
      <LoadingAnimation />
    {:then vizInput}
      <SingingVisualizer
        {...vizInput}
        onBackClicked={() => {
          vizInputPromise = undefined;
        }}
      />
    {:catch error}
      <div class="h-full flex items-center">
        <p>error: {error}</p>
      </div>
    {/await}
    <div />
  {:else}
    <!-- <button
      class="z-20 btn"
      on:click={() => {
        vizInputPromise = new Promise((resolve, reject) => {
          setTimeout(() => {
            resolve({
              lyrics: [],
              midi: new Midi(new MidiInfo()),
              audioURL: "http://example.com",
            });
          }, 1000);
        });
      }}>Transition</button
    > -->
    <div
      in:fade={{ duration: 800 }}
      class="absolute inset-0 h-full w-full grid place-items-center z-10 bg-base-100"
    >
      <WavUpload
        onAudioProcessingRequested={(promise) => {
          vizInputPromise = promise;
        }}
      />

      <label
        for="help-modal"
        class="absolute bottom-6 right-6 btn btn-secondary btn-circle btn-sm modal-button"
      >
        <HelpIcon />
      </label>

      <input type="checkbox" id="help-modal" class="modal-toggle" />
      <div class="modal">
        <div class="modal-box relative">
          <label
            for="help-modal"
            class="btn btn-sm btn-circle absolute right-2 top-2">✕</label
          >
          <h3 class="text-lg font-bold">
            Welcome to the singing visualization project!
          </h3>
          <p class="py-4">
            This project uses machine learning to determine the melody and
            lyrics of singing voices. Try uploading a song to check it out!
          </p>
          <p>Created by Ang Ze Yu, Fu Yifang, and Huang Weijie.</p>
        </div>
      </div>
    </div>
  {/if}
</main>

<style>
  :root {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
      Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  }
</style>
