export const BackendURL = import.meta.env.PROD
  ? "https://singing-visualizer.fly.dev"
  : // "https://singing-visualizer.fly.dev";
    "http://localhost:8080";

export const AudioProcessingURL = `${BackendURL}/audio-processing`;

export const MaxUploadSize = 16_000_000;
