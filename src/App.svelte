<script lang="ts">
  import SingingVisualizer from "./lib/components/SingingVisualizer.svelte";
  import AudioUpload from "./lib/components/AudioUpload.svelte";
  import type { VisualizationInput } from "./lib/Models";
  import HelpIcon from "./lib/components/HelpIcon.svelte";
  import LoadingAnimation from "./lib/components/LoadingAnimation.svelte";
  import { Midi } from "./lib/Midi";
  import { Midi as MidiInfo } from "@tonejs/midi";
  import { fade } from "svelte/transition";
  import BlobbyStuff from "./lib/components/BlobbyStuff.svelte";

  let vizInputPromise: Promise<VisualizationInput> | undefined;
</script>

<main
  data-theme="dracula"
  class="relative h-screen w-screen flex flex-col items-center p-0.5 pb-0 mx-auto overflow-hidden"
>
  {#if vizInputPromise !== undefined}
    {#await vizInputPromise}
      <div class="grid h-full place-items-center">
        <LoadingAnimation />
        <BlobbyStuff />
      </div>
    {:then vizInput}
      <SingingVisualizer
        {...vizInput}
        onBackClicked={() => {
          vizInputPromise = undefined;
        }}
      />
    {:catch error}
      <div class="alert alert-error shadow-lg max-w-2xl mt-2">
        <div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="stroke-current flex-shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            ><path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            /></svg
          >
          <span>An unexpected error occured! {error}</span>
        </div>
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
          }, 15000);
        });
      }}>Transition</button
    > -->
    <div
      in:fade={{ duration: 800 }}
      class="absolute inset-0 h-full w-full grid place-items-center z-10 bg-base-100"
    >
      <div class="w-full z-10">
        <AudioUpload
          onAudioProcessingRequested={(promise) => {
            vizInputPromise = promise;
          }}
        />
      </div>

      <BlobbyStuff />

      <label
        for="help-modal"
        aria-label="More info"
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
