<div class="absolute h-[480px] w-[640px]">
  <div class="blob -top-6 right-0 w-72 h-72 bg-accent rounded-full" />
  <div
    class="blob blob-second bottom-0 right-24 w-64 h-64 bg-secondary rounded-full"
  />
  <div class="blob blob-third top-2 left-4 w-96 h-96 bg-primary rounded-full" />
</div>

<style>
  .blob {
    position: absolute;
    opacity: 0.25;
    mix-blend-mode: overlay;
    filter: blur(25px);
    animation: blob 7s infinite;
  }

  .blob-second {
    animation-delay: 2s;
  }

  .blob-third {
    animation-delay: 3s;
  }
  @keyframes blob {
    0% {
      transform: translate(0px, 0px) scale(1);
    }

    33% {
      transform: translate(25px, -15px) scale(1.1);
    }

    66% {
      transform: translate(-15px, 15px) scale(0.9);
    }

    100% {
      transform: translate(0px, 0px) scale(1);
    }
  }
</style>
