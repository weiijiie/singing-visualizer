import App from "./App.svelte";
import tailwind from "./tailwind.css";

const app = new App({
  target: document.getElementById("app") as any,
});

export default app;
