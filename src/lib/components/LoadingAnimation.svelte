<script>
  import { fade } from "svelte/transition";
</script>

<div
  in:fade={{ duration: 800 }}
  class="h-full flex flex-col justify-center items-center"
>
  <lottie-player
    src="https://assets10.lottiefiles.com/private_files/lf30_VBnEpi.json"
    background="transparent"
    speed="1"
    style="width: 400px; height: 400px;"
    loop
    autoplay
  />
  <p class="w-[320px] text-lg loading">Computing the results on our servers</p>
</div>

<style>
  .loading:after {
    overflow: hidden;
    display: inline-block;
    vertical-align: bottom;
    -webkit-animation: ellipsis steps(4, end) 1500ms infinite;
    animation: ellipsis steps(4, end) 1500ms infinite;
    content: "\2026"; /* ascii code for the ellipsis character */
    width: 0px;
  }

  @keyframes ellipsis {
    to {
      width: 1em;
    }
  }

  @-webkit-keyframes ellipsis {
    to {
      width: 1em;
    }
  }
</style>
