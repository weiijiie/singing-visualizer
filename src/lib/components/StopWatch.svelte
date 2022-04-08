<script lang="ts">
  import { onDestroy } from "svelte";

  export let interval = 1000;

  let count = 0;

  const id = setInterval(() => {
    count += 1;
  }, interval);

  onDestroy(() => clearInterval(id));

  function seconds(num: number) {
    return (num % 60).toString().padStart(2, "0");
  }

  function minutes(num: number) {
    return Math.floor(num / 60)
      .toString()
      .padStart(2, "0");
  }
</script>

<span>{minutes(count)}:{seconds(count)}</span>
