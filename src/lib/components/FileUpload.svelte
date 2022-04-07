<script lang="ts">
  let files: FileList | undefined;

  export let onFileUploaded: (file: File) => void;
  export let id: string;
  export let accept: string;
  export let labelText: string;

  function handleFileUploaded(e: Event) {
    const target = e.target as HTMLInputElement;
    const files = target.files;
    if (!files) {
      return;
    }

    const file = files[0];
    if (file) {
      onFileUploaded(file);
    }
  }
</script>

<div class="flex flex-col items-center gap-3 p-2">
  <label for={id}>{labelText}</label>
  <input
    type="file"
    {id}
    name={id}
    {accept}
    bind:files
    on:change={handleFileUploaded}
    class="block w-full text-secondary
        file:mr-4 file:py-2 file:px-4 file:bg-secondary file:rounded-full file:border-0
        file:font-semibold file:text-secondary-content hover:file:bg-secondary-focus"
  />

  {#if files}
    {#each Array.from(files) as file}
      <p class="text-xs text-gray-500">{file.name} ({file.size} bytes)</p>
    {/each}
  {/if}
</div>
