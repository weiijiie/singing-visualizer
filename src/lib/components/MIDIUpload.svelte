<script lang="ts">
  import { Midi } from "@tonejs/midi";
  import FileUpload from "./FileUpload.svelte";

  export let onMidiLoaded: (midi: Midi) => void;

  async function loadMidi(file: File) {
    const url = URL.createObjectURL(file);
    const midi = await Midi.fromUrl(url);
    onMidiLoaded(midi);
  }
</script>

<FileUpload
  id="midi"
  accept=".mid,audio/mid"
  labelText="Upload a midi file"
  onFileUploaded={(file) => loadMidi(file)}
/>
