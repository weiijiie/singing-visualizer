<script lang="ts">
  import type { Midi } from "../Midi";
  import { onMount } from "svelte";
  import { RenderControls } from "../RenderControls";
  import { CanvasSpace } from "../CanvasSpace";
  import { animateMelody } from "../MelodyAnimation";
  import PauseIcon from "./PauseIcon.svelte";
  import PlayIcon from "./PlayIcon.svelte";
  import RestartIcon from "./RestartIcon.svelte";
  import {
    prettyPrintMilliseconds,
    prettyPrintSeconds,
  } from "../PrettyPrintDuration";
  import type { Lyrics } from "../Models";
  import { readable } from "svelte/store";
  import { fly } from "svelte/transition";

  export let midi: Midi;
  export let audioURL: string;
  export let lyrics: Lyrics;
  export let onBackClicked: () => void;

  export let intervalSeconds = 6;

  let audio: HTMLAudioElement | undefined;
  let audioDurationSeconds = 0;

  let canvas: HTMLElement | undefined;
  let canvasWidth: number | undefined;
  let renderControls: RenderControls | undefined;
  let space: CanvasSpace | undefined;
  let done = false;

  // binds to the state of the audio element
  let paused = true;

  // toggle the render whenever the paused state changes
  $: if (renderControls && paused !== renderControls.paused) {
    renderControls.pause(true);
  }

  $: ({ elapsedTime } = renderControls ?? { elapsedTime: readable(0) });

  let sliderDurationMs = 0;
  let adjustingSlider = false;

  function initializeRender() {
    if (!canvas) {
      console.log("canvas not initialized");
      return undefined;
    }

    space = new CanvasSpace(canvas).setup({ bgcolor: "transparent" });

    renderControls = new RenderControls((time, frameTime) => {
      if (time > audioDurationSeconds * 1000) {
        renderControls?.stop();
        audio?.pause();
        done = true;
        return;
      }

      if (!adjustingSlider) {
        sliderDurationMs = Math.min(time, audioDurationSeconds * 1000);
      }
      space?.playFrame(time, frameTime);
    });
  }

  function togglePaused() {
    if (!renderControls) {
      return;
    }

    if (done) {
      renderControls.restart();
      done = false;
      if (audio) {
        audio.currentTime = 0;
        audio.play();
      }

      return;
    }

    paused = !paused;
  }

  function handleSliderChange(e: Event) {
    let { valueAsNumber: newTimeMs } = e.target as HTMLInputElement;

    renderControls?.playAt({ time: newTimeMs });
    if (audio) {
      audio.currentTime = newTimeMs / 1000;
    }

    if (done) {
      paused = false;
      done = false;
    }

    adjustingSlider = false;
  }

  onMount(() => {
    initializeRender();
    if (space && audio) {
      animateMelody(midi, space, audio, intervalSeconds);
    }

    return () => {
      space?.removeAll();
      renderControls?.stop();
    };
  });
</script>

<div
  in:fly={{ y: 500, duration: 750 }}
  class="h-screen w-screen flex flex-col items-center p-1 pt-2 gap-1 overflow-hidden"
>
  <button
    class="btn btn-outline btn-accent btn-sm absolute top-4 left-3 z-10"
    on:click={() => {
      space?.stop();
      renderControls?.stop();
      onBackClicked();
    }}
  >
    <svg width="1em" height="1em" viewBox="0 0 24 24" class="mr-1">
      <path
        fill="currentColor"
        d="M16.62 2.99a1.25 1.25 0 0 0-1.77 0L6.54 11.3a.996.996 0 0 0 0 1.41l8.31 8.31c.49.49 1.28.49 1.77 0s.49-1.28 0-1.77L9.38 12l7.25-7.25c.48-.48.48-1.28-.01-1.76z"
      />
    </svg>
    Back
  </button>

  <div class="canvas-container h-full" bind:clientWidth={canvasWidth}>
    <canvas class="h-full" bind:this={canvas} />
  </div>

  <div class="lyrics relative mt-2" style:--canvas-width={`${canvasWidth}px`}>
    {#each lyrics as lyric}
      {@const time = $elapsedTime / 1000}
      {#if time > lyric.start && time < lyric.end}
        <p
          class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 py-4
                 text-center text-xl md:text-2xl text-neutral-content
                 font-extrabold italic tracking-wide line-clamp-3"
          in:fly={{ y: -30, duration: 1000 }}
          out:fly={{ y: 30, duration: 1000 }}
        >
          {`${lyric.text}`}
        </p>
      {/if}
    {/each}
  </div>

  <div class="audio-controls flex flex-col items-center p-3 gap-4 mt-1 z-10">
    <div class="flex gap-2 items-center">
      <span class="text-xs text-gray-300">
        {#if renderControls}
          {prettyPrintMilliseconds(sliderDurationMs)}
        {:else}
          0:00
        {/if}
      </span>
      <input
        type="range"
        min="0"
        max={audioDurationSeconds * 1000}
        value={sliderDurationMs}
        class="range range-xs range-primary hover:range-secondary min-w-[400px]"
        on:input={() => (adjustingSlider = true)}
        on:change={handleSliderChange}
      />
      <span class="text-xs text-gray-300">
        {prettyPrintSeconds(audioDurationSeconds)}
      </span>
    </div>

    <button
      class="btn btn-sm btn-primary btn-circle z-10"
      on:click={() => togglePaused()}
    >
      {#if done}
        <RestartIcon />
      {:else if paused}
        <PlayIcon />
      {:else}
        <PauseIcon />
      {/if}
    </button>

    <audio
      bind:this={audio}
      src={audioURL}
      on:canplay={() => {
        renderControls?.start();
        setTimeout(() => {
          audio?.play();
        }, 800);
      }}
      on:ended={() => {
        renderControls?.stop();
        done = true;
      }}
      bind:duration={audioDurationSeconds}
      bind:paused
      preload="auto"
    />
  </div>
</div>

<style>
  .canvas-container {
    border-radius: 0px;
    box-shadow: 15px 15px 30px rgba(28, 29, 38, 0.75), -15px -15px 30px #333645;
  }

  .lyrics {
    height: 160px;
    width: var(--canvas-width, 70%);
  }

  .lyrics > p {
    width: 95%;
    text-shadow: 7px 7px 7px rgba(28, 29, 38, 0.95);
  }

  .audio-controls {
    border-radius: 16px;
    background: linear-gradient(145deg, #2a2c39, #232530);
    box-shadow: 13px 13px 26px #1e2029, -13px -13px 26px #303241;
  }
</style>
